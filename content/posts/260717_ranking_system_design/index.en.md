+++
title = 'Designing a Product Ranking System'
date = '2026-07-17T16:20:00+09:00'
description = "Comparing real-time Redis rankings with an RDB Metric SOT design for an event-driven daily product ranking system."
summary = "Starting with real-time Redis rankings and developing an RDB Metric SOT + Redis Top N design to support recovery and rankings across longer periods."
categories = ["architecture", "system-design"]
tags = ["ranking", "redis", "kafka", "mysql", "event-driven", "system-design"]
series = []
series_order = 1

draft = false
+++

## TL;DR

I designed a daily product ranking system based on user behavior events.

My first approach published product views, likes, and successful payments to Kafka. `commerce-streamer` consumed the events and updated ranking scores in a Redis Sorted Set in real time. Redis was a good fit as a serving store because it supports fast Top N queries and rank lookups for individual products.

As I worked through the design, though, I began to question whether Redis should be the ranking system's only Source of Truth. Expired or lost data is difficult to recover, and changing weights requires historical metrics if we want to recalculate past scores. Supporting hourly, weekly, and monthly rankings makes retaining those source metrics even more important.

This post starts with the Redis design, then explores an alternative that stores source metrics in an RDB and uses Redis to serve only the Top N results needed for queries.

---

## My first reading of the requirements

Initially, ranking sounded like a simple matter of calculating a score for each product and sorting the results.

On closer inspection, the more important question was how to interpret different user actions.

A product detail view signals interest, but less strongly than a purchase. A like is stronger than a view, but doesn't necessarily lead to revenue. A successful payment is the strongest signal, yet using the sales amount directly could let expensive products dominate the ranking.

I used the following signals:

| Event | Meaning | Ranking effect |
|-------|---------|----------------|
| Product detail view | Mild interest | Increase view score |
| Like | Explicit interest | Increase like score |
| Unlike | Withdrawn interest | Decrease like score |
| Successful payment | Purchase conversion | Increase sales score |

Views, likes, and sales use different units, so I kept their metrics separate and applied weights when calculating the final score.

```text
score = carry
      + viewCount * viewWeight
      + likeCount * likeWeight
      + ln(1 + salesAmount) * salesWeight
```

The sales contribution is based on `price * quantity`, with a logarithm applied. Using the raw amount could give expensive or already popular products an excessive, persistent advantage once they reach the top.

---

## First design: real-time Redis rankings

My first design used Redis as the real-time ranking store.

{{< figure src="current-ranking-architecture.png" alt="Initial design for daily product rankings using Redis" class="mx-auto" width="1100" >}}

The flow is roughly:

1. A user views a product, likes it, or pays for an order.
2. `commerce-api` records a domain event.
3. The event is stored in a transaction outbox.
4. An outbox relay publishes it to a Kafka topic.
5. `commerce-streamer` consumes the event.
6. It updates the metrics and final score in the daily Redis ranking keys according to the event type.
7. The ranking API reads ranks and scores from Redis, adds product information from MySQL, and returns the response.

The outbox addresses the gap between the API transaction and Kafka publication. If an order or like change commits but its event fails to publish, ranking data can drift from the actual state. Recording the outbox row in the same transaction as the domain change lets a relay publish it separately.

## Why use date-specific Redis keys?

These are daily rankings, so the keys include a date.

```text
ranking:metric:view:{yyyyMMdd}
ranking:metric:like:{yyyyMMdd}
ranking:metric:sales:{yyyyMMdd}
ranking:metric:raw-sales-amount:{yyyyMMdd}
ranking:metric:carry:{yyyyMMdd}
ranking:all:{yyyyMMdd}
ranking:processed:{yyyyMMdd}
```

I separated the metric keys because weights can change.

If we store only the final score, changing `viewWeight` or `likeWeight` leaves us without enough information to reinterpret the old value. Separate view, like, and sales metrics let us recalculate `ranking:all:{date}` using the current weights.

`ranking:processed:{date}` tracks duplicate events. Kafka consumers may process messages at least once, which means the same event can arrive again. If an `eventId` has already been processed, it must not increase the score a second time.

## What worked well about Redis

A Redis Sorted Set felt like a natural match for ranking: it stores members with scores and supports fast retrieval in score order.

```text
ZINCRBY ranking:metric:view:20260717 1 productId
ZREVRANGE ranking:all:20260717 0 19 WITHSCORES
ZREVRANK ranking:all:20260717 productId
```

Redis commands cover both Top N queries and rank lookups for a specific product.

The API doesn't need to run expensive aggregations. It reads ranks and scores from Redis, then retrieves display information such as product and brand names from MySQL.

Another benefit is freshness. Scores change as soon as events are consumed, so user actions are reflected quickly. A batch-only design introduces at least the scheduling delay; here, Kafka consumer lag accounts for most of the delay.

## End-of-day carry-over

Starting every product at zero each day would feel abrupt. Products that were popular yesterday shouldn't necessarily disappear at midnight.

I planned a carry-over at 23:50 each day, using that day's Top 100 products to seed the next day's scores.

```text
Read the Top 100 from ranking:all:{D}
Multiply each final score by 0.1
Apply to ranking:metric:carry:{D+1}
Also apply to ranking:all:{D+1}
```

The Top 100 limit controls Redis memory usage. Carrying every product forward would become expensive as product counts and daily keys accumulate.

Keys also have a TTL. Together, expiry and the carry-over limit keep Redis from becoming an indefinite historical store.

---

## Limitations of the first design

The Redis design is simple and fast for daily real-time rankings. Looking at it from an operational perspective reveals several limitations.

## 1. Can Redis be the Source of Truth?

This was my biggest concern.

Redis works well for serving ranking data, but this design needs more support for preserving the source information. TTL expiry removes data. After an outage or operational mistake, we need enough evidence to reconstruct rankings, and a Redis-centered design alone doesn't provide that.

Retaining Kafka topics and replaying events is an option. But replaying all events just to recalculate one historical period can be costly. If the event schema or consumer logic has changed, reproducing the original result may also be difficult.

## 2. Changing weights and recalculating scores

The first design's separate metric ZSETs allow recalculation while the daily data remains in Redis.

After the TTL expires, that option disappears. A request a month later to recalculate last week's rankings with today's weights cannot rely on the remaining Redis data alone.

Runtime weight changes make the distinction between metrics and scores important. A score is the result of a policy; the metrics describe what happened.

## 3. Rankings across different periods

Date-based keys look sufficient for daily rankings. Hourly, weekly, monthly, and yearly rankings make the key strategy more complicated.

```text
ranking:all:daily:20260717
ranking:all:hourly:2026071713
ranking:all:weekly:2026W29
ranking:all:monthly:202607
```

We could update every period's keys when consuming each event. But then a single event modifies multiple keys, and weight changes require recalculating more sets of scores.

At that point, retaining source metrics elsewhere and publishing each period's Top N to Redis becomes a more natural design.

## 4. Should every product live in Redis?

The memory question also becomes more important as the catalog grows.

Storing 100,000 products is something we can test readily. At one million or ten million products, multiplied across daily keys, Redis memory cost becomes harder to ignore.

Most ranking API requests need only the Top N. Keeping those results in Redis and the complete metrics elsewhere gives each store a clearer role.

---

## Revised design: RDB Metric SOT + Redis Top N

To address those limits, I explored storing source metrics in an RDB and serving only query-ready Top N results from Redis.

{{< figure src="rdb-metric-sot-architecture.png" alt="RDB Metric SOT and Redis Top N ranking architecture" class="mx-auto" width="1100" >}}

Redis changes roles in this design. In the first version, it was effectively the Source of Truth for real-time rankings. Here, it is a read model for fast queries.

Source metrics live in an RDB such as MySQL.

```text
ranking_daily_metric
- metric_date
- product_id
- view_count
- like_count
- sales_amount
```

Weights are deliberately left out of those records. Views, likes, and sales amounts describe recorded activity; weights are policy, and policy can change. Storing metrics before weights are applied makes recalculation easier.

## Event consumption

The event pipeline stays largely the same. User actions reach Kafka, and `RankingMetricConsumer` consumes them. Instead of incrementing Redis scores directly, it upserts metric rows in the RDB.

```text
PRODUCT_VIEWED     -> view_count + 1
PRODUCT_LIKED      -> like_count + 1
PRODUCT_UNLIKED    -> like_count - 1
PAYMENT_SUCCEEDED  -> sales_amount + price * quantity
```

Rankings can now be rebuilt from RDB metrics even if Redis is empty.

Weekly rankings can be computed by summing daily metrics over the required period, and monthly rankings work the same way. Neither requires replaying every original event.

## Score calculation

A separate batch or scheduler calculates scores. For example, it can read recent metrics every five minutes and apply the current weights.

```text
score = carry
      + view_count * currentViewWeight
      + like_count * currentLikeWeight
      + ln(1 + sales_amount) * currentSalesWeight
```

It then loads only the Top N products into a Redis ZSET.

```text
ranking:top:daily:20260717
```

Redis contains the results the API needs rather than the entire catalog. It serves as the fast serving layer, while the source data remains elsewhere.

## What this design improves

The biggest improvement is recoverability. If Redis data is lost, the Top N can be rebuilt from RDB metrics. If incorrect weights are deployed, the same metrics can be used to calculate corrected scores.

The second improvement is support for different ranking periods. With daily metrics, weekly, monthly, and yearly rankings become period aggregation problems. At larger scale, an RDB alone may not be enough; an OLAP store or separate aggregate tables could be needed. Retaining the source metrics leaves those options open.

Third, Redis memory usage becomes easier to control. Only the Top N needed for queries lives there. Full product metrics remain in the RDB.

## What it costs

This design isn't automatically better in every respect.

Rankings become less immediate. A five-minute calculation schedule can introduce roughly five minutes of update delay.

The system also becomes more involved. It needs metric tables, upsert logic, score calculation batches, batch failure recovery, and Redis loading logic. There is more to manage than a direct `ZINCRBY` on a ZSET.

RDB write load matters, too. Every user action can lead to a metric upsert. At higher traffic volumes, buffering, batch inserts, time-bucket aggregation, Kafka Streams, or an OLAP store may become worth considering.

---

## Comparing the designs

| Perspective | Real-time Redis rankings | RDB Metric SOT + Redis Top N |
|-------------|--------------------------|-----------------------------|
| Priority | Immediate updates | Recovery and recalculation |
| Redis role | Real-time ranking store | Query read model |
| Source metrics | Stored in Redis keys | Persisted in the RDB |
| Weight changes | Recalculate only periods still in Redis | Recalculate from retained RDB metrics |
| Multiple periods | More keys add complexity | Extend through metric aggregation |
| Memory usage | Grows when all products are loaded | Controlled by loading only Top N |
| Implementation complexity | Relatively simple | Requires batch and recovery policies |
| Update delay | Low | Depends on the batch interval |

The first design is a good starting point for fast daily rankings. User actions are reflected almost immediately, and the API read path is simple.

As recovery, recalculation, and rankings across longer periods become operational requirements, the RDB Metric SOT design becomes more compelling.

## How should we choose?

This exercise made me realize that the first question shouldn't be which database to use. More useful questions are:

```text
How quickly must this ranking reflect new activity?
Can we tolerate losing the ranking data?
Do historical rankings need to be recalculated?
Could the weight policy change frequently?
Do all products need to remain in the ranking dataset?
Will rankings stay daily, or expand to weekly and monthly periods?
```

If the answers prioritize freshness, a Redis-centered design is simple and fast. If recovery, auditing, recalculation, and broader time periods matter, the system needs to retain source metrics.

## Evolving the design

The real-time Redis design initially seemed sufficient. Daily rankings needed to respond quickly to user behavior, and Sorted Sets supported both Top N queries and individual product ranks well.

I placed several limits on that design:

- Use date-specific keys.
- Give keys a TTL.
- Carry over only the Top 100 products.
- Keep metric ZSETs separate so weights can be recalculated for retained daily data.
- Track processed events to avoid duplicate updates.

These choices make it a starting point that favors freshness and simplicity. Once historical recovery or weekly and monthly rankings enter the requirements, evolving toward RDB Metric SOT + Redis Top N makes more sense.

## Closing thoughts

Designing rankings kept bringing me back to questions beyond sorting: which actions count as strong signals, how long to retain them, whether scores must be recalculated when policy changes, and whether an empty ranking after Redis failure is acceptable.

I began by focusing on how quickly Redis Sorted Sets could provide rankings. As the design grew, deciding what to preserve as source data became more important than deciding what to put in Redis.

The first design is a starting point for real-time daily rankings. RDB Metric SOT + Redis Top N is a possible next step as operational requirements grow.

I don't think a good design has to implement every future requirement from the start. But I do want to be able to explain the limits of today's choice and how it could evolve when those limits matter.
