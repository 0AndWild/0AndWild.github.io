+++
title = 'Handling Order Surges: Designing a Redis Waiting Queue'
date = '2026-07-10T16:59:39+09:00'
description = "Decisions and limitations from designing and implementing a waiting queue in front of an order API with Redis Sorted Sets and entry tokens."
summary = ""
categories = ["architecture", "redis", "system-design"]
tags = ["redis", "waiting-queue", "sorted-set", "kotlin", "spring", "scheduler", "ttl", "local-event"]
series = []
series_order = 1

draft = false
+++

## TL;DR

Instead of sending every request straight to the order API, I first placed users in a Redis Sorted Set.

A scheduler removes up to 50 users from the queue every second and issues entry tokens valid for five minutes. Users poll their position until they receive a token, and the order API accepts only requests with a valid `X-Entry-Token`.

After an order commits successfully, a local event listener receives `OrderEvent.Created` and deletes the token. If the order fails, the token remains so the user can try again.

This is an initial design for controlling admission rate, rather than a complete production waiting queue. Atomic queue entry, recovery during token issuance, global throughput across instances, and polling load still need more work.

---

## Overview

- Goals:
  - Keep a sudden burst of order requests from reaching the order database all at once.
  - Let users check their queue position and estimated wait time.
  - Issue entry tokens to a limited number of users who can then call the order API.
  - Remove entry tokens only after a successful order transaction.
  - Keep the waiting queue and order domains independent of Redis implementation details.
- Settings used in this implementation:
  - Scheduler fixed delay: 1 second
  - Scheduler batch size: 50 users
  - Entry token TTL: 300 seconds
  - Rank: zero-based, using the Redis `ZRANK` result directly

---

## Why put a queue in front of the order API?

A modest rise in order traffic may be handled by scaling out application servers or tuning the database connection pool.

A sharp burst at the start of an event is different. Even with more application instances, requests converge on the same database to lock inventory and coupon rows and save orders. Accepting more requests at the application tier can make database connection demand and lock waits grow even faster.

The queue's purpose is to admit requests at a rate the downstream system can handle, while other users wait outside that processing path.

I chose not to store order request payloads in the server-side queue. The queue contains only `memberId`; once admitted, the user sends the original order request again.

This avoids managing the state and retry policy of queued order payloads on the server. The client instead needs to poll its position and call the order API after reaching `READY`.

---

## Overall architecture

{{< figure src="waiting-queue-architecture.png" link="waiting-queue-architecture.png" alt="Overall architecture of the Redis waiting queue system" class="mx-auto" width="1400" >}}

The flow has three parts:

1. Register users in a Redis ZSET and expose their current status.
2. Let the scheduler remove users from the front and issue entry tokens.
3. Validate tokens at the order API and delete them through a local event after the order commits.

The layers have distinct responsibilities:

| Layer | Responsibility |
|-------|----------------|
| Interface | Waiting queue and order APIs, plus the order completion event listener |
| Application | User authentication, queue status assembly, token issuance, and order admission validation |
| Domain / Port | The `WaitingQueuePosition` state model and Repository interfaces that abstract Redis |
| Infrastructure | Repository port implementations using Spring Data Redis |
| Redis | A ZSET for waiting order and a String entry token for each admitted user |

---

## 1. Representing queue order with a Redis Sorted Set

The queue needs to answer three main questions:

- Is the user in the queue?
- What is their current position?
- How many users are waiting in total?

A Redis Sorted Set can represent all three.

```text
key    : queue:waiting
member : memberId
score  : enteredAt
```

Because `memberId` is unique within the ZSET, adding the same user repeatedly doesn't create duplicate members. Using `enteredAt` as the score places earlier users ahead of later ones. `ZRANK` returns their position, and `ZPOPMIN` removes users from the front.

I use the `ZRANK` value directly, so the first user's rank is 0. Keeping both the internal model and API response zero-based avoids `+1` and `-1` conversions at every boundary.

### Preserve the position on repeated entry

A waiting user may refresh the page or call the entry API again. Overwriting the score with the current time would send them to the back.

The current implementation checks for an existing score and adds only users who aren't already registered.

```kotlin
override fun enterIfAbsent(memberId: Long, score: Double) {
    val member = memberId.toString()
    if (redisTemplate.opsForZSet().score(WAITING_QUEUE_KEY, member) == null) {
        redisTemplate.opsForZSet().add(WAITING_QUEUE_KEY, member, score)
    }
}
```

This preserves the score and rank across sequential repeated calls.

There is an important limitation: `ZSCORE` and `ZADD` are separate commands. Two simultaneous first-entry requests for the same user can both see no score and then write different scores. Strict idempotency requires a single atomic Redis operation such as `ZADD NX` or `addIfAbsent`.

---

## 2. One response model for waiting status

After entering, clients poll the same position API. It returns one of three states:

- `WAITING`: the user is in the ZSET and has no entry token yet.
- `READY`: the user has an entry token and can call the order API.
- `NOT_ENTERED`: the user is neither in the queue nor holding a valid entry token.

Status checks look for the entry token first. The scheduler removes users from the ZSET before issuing tokens, so a `READY` user is no longer in the ZSET. Checking rank first could incorrectly classify an admitted user as `NOT_ENTERED`.

{{< mermaid-box width="720px" >}}
stateDiagram-v2
    [*] --> NOT_ENTERED
    NOT_ENTERED --> WAITING: enter() / register in queue
    WAITING --> WAITING: position polling
    WAITING --> READY: scheduler / issue token
    READY --> READY: order rollback / retain token
    READY --> NOT_ENTERED: order commit / delete token
    READY --> NOT_ENTERED: TTL expires
{{< /mermaid-box >}}

`WaitingQueuePosition` uses the retrieved rank and total waiting count to calculate these response values:

- `status`
- `rank`
- `currentTotalWaitingCount`
- `estimatedWaitSeconds`
- `pollingIntervalSeconds`
- `entryToken`

The estimated wait is the current rank divided by an assumed throughput of 50 users per second. The polling interval is one second with fewer than 100 users ahead, three seconds with fewer than 1,000, and five seconds otherwise.

Users near admission receive faster updates, while users further back make fewer Redis queries. Since the throughput assumption is fixed, this is only a rough estimate; it doesn't reflect actual order processing speed.

---

## 3. Controlling admission rate with a scheduler

Sending all queued users to the order API at once would defeat the purpose of the queue.

`WaitingQueueScheduler` calls `issueNextEntries()` every second. The service uses `ZPOPMIN` to remove up to 50 users with the lowest scores and issues a token to each.

```kotlin
fun issueNextEntries(batchSize: Long): List<String> {
    return waitingQueueRepository.popNext(batchSize)
        .mapNotNull { memberId ->
            val token = generateToken()
            entryTokenRepository.issue(memberId, token, properties.entryTokenTtl)
            entryTokenRepository.find(memberId)
        }
}
```

Each token is a URL-safe Base64 encoding of 32 bytes generated by `SecureRandom`.

```text
key   : queue:entry-token:{memberId}
value : generated token
TTL   : 300 seconds
```

The application doesn't return the generated token directly. It stores it in Redis and reads it back, so a token that wasn't stored isn't treated as a valid admission credential.

The TTL serves two purposes. It prevents a token from granting indefinite access to the order API, and it eventually cleans up tokens even if deletion after order completion fails.

A very short TTL could expire while a user is preparing an order. A very long TTL leaves users eligible to enter long after they have stopped trying. The current 300-second value is the assignment's default policy; a production value should be based on measured user behavior and target throughput.

---

## 4. Requiring an entry token at the order API

Order requests include an `X-Entry-Token` header.

After authentication, `OrderFacade.placeOrder()` compares the request token with the one stored in Redis. A missing, mismatched, or expired token results in `401 Unauthorized` before order processing begins.

I put this validation in the application layer because eligibility to place an order is a precondition of the use case, beyond simply validating an HTTP header's format.

This is a fail-closed design: when Redis doesn't respond, orders are blocked. I chose to stop accepting orders instead of letting traffic bypass the queue and overwhelm downstream systems. That protects the server, but makes a Redis outage an order outage as well.

---

## 5. Deleting tokens outside the order transaction

I initially considered deleting the token directly inside the order creation method.

That would mix an external Redis operation into the database transaction flow. Deleting the token before commit is also problematic: if the order rolls back, the user loses admission even though the order failed.

The order flow already publishes `OrderEvent.Created` on success, so I moved token deletion into a listener that receives this local event at `AFTER_COMMIT`.

```kotlin
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
fun handle(event: OrderEvent.Created) {
    waitingQueueService.deleteEntryToken(event.memberId)
}
```

This gives us two useful properties:

- A rolled-back order leaves the token available for another attempt.
- A token cleanup failure cannot roll back an already committed order.

A local event is not a durable message, however. If the process exits just after commit, or Redis deletion fails, the listener has no automatic recovery. The TTL provides eventual cleanup for now. Immediate cleanup would require a retryable event record or a separate cleanup job.

`AFTER_COMMIT` also does not automatically mean asynchronous execution or exception isolation. The current listener runs in the same call flow as the order request. If a Redis deletion exception propagates, the HTTP response can fail even though the order has committed. Production handling needs an explicit policy for logging and alerting on those exceptions, alongside retryable cleanup work.

---

## Technical decisions

| Design area | Choice | Reason |
|-------------|--------|--------|
| Waiting order | Redis Sorted Set | Unique members, score ordering, rank, and total count in one structure |
| ZSET member | `memberId` | One waiting entry per user |
| ZSET score | Entry timestamp in milliseconds | Give earlier arrivals priority |
| Admission control | Fixed-delay scheduler + batch size | Limit the rate at which users reach downstream processing |
| Admission credential | Per-user Redis String token + TTL | Separate waiting from readiness and expire old credentials automatically |
| Status updates | Client polling | Expose positions through a simple HTTP API without a separate push channel |
| Order validation | Start of `OrderFacade` | Check admission before expensive order processing |
| Token cleanup | `AFTER_COMMIT` listener for `OrderEvent.Created` | Clean up only successful orders and separate deletion from order rollback |

---

## Trade-offs

### Admission rate is controlled, but concurrent orders are not strictly bounded

Issuing 50 tokens per second doesn't guarantee that no more than 50 orders run at once.

Tokens remain valid for 300 seconds. Users admitted across several seconds can wait and then submit orders at the same moment. This design controls the token issuance rate, not actual in-flight order concurrency.

A strict downstream concurrency limit would need active slots, token claims, a semaphore, or another control. Another option is to admit users based on actual order completion rate.

### Polling is simple, but creates read traffic

HTTP polling is easy to implement on both sides and doesn't require long-lived connections. But more waiting users mean more repeated `GET token`, `ZRANK`, and `ZCARD` calls. Varying the polling interval by rank reduces that load.

At larger scale, I would consider client-side jitter to spread requests out, longer polling intervals, Redis read replicas rather than CDN caching for these reads, or SSE-based push.

### Separate cleanup does not guarantee immediate cleanup

An `AFTER_COMMIT` listener reduces the responsibilities inside the order transaction. Its failures happen after the order succeeds, though, so the order cannot be rolled back. A local event also leaves no retry record.

The TTL eventually resolves the leftover-token state, but the token can remain valid until it expires.

### A Redis outage stops orders

Fail-closed behavior protects the database from requests bypassing the queue, while making Redis a required dependency of the entire order flow. Production design needs replication, Sentinel or Cluster, persistence, and failover policies as well.

---

## Remaining limitations and work beyond the assignment

### 1. Concurrent entry by the same user must be atomic

`ZSCORE` followed by `ZADD` is a check-then-act sequence. I verified concurrent entry by eight distinct users and sequential repeated entry by the same user. That does not establish atomicity for simultaneous first-entry requests from one user.

This should use the single `ZADD NX` command.

### 2. Users can be lost between ZPOPMIN and token storage

The scheduler removes a user from the ZSET before saving the token. If the process exits or the Redis write fails between those operations, the user has neither a queue entry nor a token and becomes `NOT_ENTERED`.

Reading the token back after storage cannot recover a user who has already been popped.

A production design could atomically move users into a processing ZSET, then acknowledge them after token issuance succeeds. A recovery job could return users without an acknowledgment to the waiting ZSET after a timeout.

### 3. Batch size is not a global limit across application instances

If every instance runs the scheduler, each can pop 50 users per second. `ZPOPMIN` prevents duplicate removal of the same user, but four instances can issue up to 200 tokens per second in total.

Using batch size as a global throughput limit requires scheduler leader election, a distributed lock, a dedicated worker, or a Redis-based global rate limiter.

### 4. The token grants temporary admission, not exactly one order

Token deletion happens after order commit. Two concurrent requests from the same user with the same token can both pass validation.

If one token must authorize only one order, validation and claiming it must be atomic. A simple `GETDEL` at order start also removes the token when the order later rolls back. A more complete design needs states such as `READY → CLAIMED → CONSUMED`, plus a release policy on rollback. Order-level idempotency keys deserve separate consideration, too.

### 5. Estimated wait time doesn't reflect real throughput

The current formula is `rank / 50`. It matches the scheduler setting but ignores database latency, order success rate, users who receive tokens without ordering, and outages.

A moving average of recent token issuance and order completion rates, together with batch-size adjustments based on operational metrics, would provide a more realistic estimate.

### 6. Arrivals within the same millisecond are not strictly FIFO

Scores use application timestamps in milliseconds. Multiple users can arrive in the same millisecond, and clock differences across application servers can change score order relative to actual arrival order.

For equal scores, Redis ZSET orders members lexicographically, which can also differ from arrival order. Strict FIFO would require a design using Redis `TIME` with a sequence, or a separate incrementing value in the score.

---

## What I verified

Using Testcontainers Redis and API E2E tests, I checked:

- First entry returns rank 0 and the total waiting count.
- Sequential repeated entry preserves the user's rank.
- Concurrent entry by distinct users assigns unique ranks.
- Responses represent `WAITING`, `READY`, and `NOT_ENTERED`.
- Tokens are unavailable after their TTL expires.
- One scheduler run issues no more than the batch size, even with more users waiting.
- Orders without an entry token are rejected.
- A successful order commit deletes the entry token.

These tests verify functional contracts. They don't establish maximum capacity or the right batch size. To choose production settings, I would use a tool such as k6 to generate entry bursts and position polling together, while observing application latency, Redis command throughput, CPU, memory, and connection counts.

---

## Alternatives considered

| Option | Benefits | Costs |
|--------|----------|-------|
| Delete the token inside the order transaction | The full flow is visible in the order code | Redis cleanup becomes part of the transaction's responsibilities, and rollback handling becomes more complicated |
| **Selected: delete through an `AFTER_COMMIT` local event** | Clean up successful orders and separate post-processing from the transaction | Listener failures aren't automatically recovered; tokens can remain until TTL expiry |

The central decision was that token deletion should not determine whether an order succeeds.

Once an order has committed, preserving that success and cleaning up the token separately makes more sense than presenting a failure because cleanup failed.

The local event alone doesn't provide that reliability, though. It separates responsibilities, while failure recovery still relies on the TTL. A cleaner structure and a more reliable production system are separate outcomes.

---

## Closing thoughts

At first, I thought adding users to a Redis ZSET and returning their rank would complete the queue implementation.

Most of the difficult questions turned out to concern when a user becomes eligible to order, when that eligibility ends, and which state they should return to after a failure.

In this design, the ZSET represents waiting and the TTL token represents readiness. The order API checks the token, and an event after order commit triggers cleanup. This made the boundary between queue responsibilities and the order transaction clearer.

It also exposed gaps: atomic registration, recovery after pop, global throughput across instances, one-time token use, and wait estimates based on actual throughput. The assignment didn't force all of these issues into view, but production use would require addressing them.

A waiting queue is an admission control system. It needs to move users at a pace the system can handle and preserve their state transitions even when something fails.
