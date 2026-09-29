+++
title = 'Why I Chose Pessimistic Locking for Order Consistency'
date = '2026-06-12T05:50:00+09:00'
description = "The decisions behind using pessimistic locking to keep orders, inventory, and coupons consistent."
summary = "Why I put inventory deduction and coupon use in the same order transaction and chose pessimistic locking."
categories = ["architecture", "spring", "jpa"]
tags = ["transaction", "pessimistic-lock", "optimistic-lock", "coupon", "inventory", "domain-model", "jpa"]
series = []
series_order = 1

draft = false
+++

## TL;DR

There were two failures I wanted the order flow to prevent: two successful orders using the same coupon, and more successful orders than available stock.

For this flow, I chose to acquire locks up front and serialize conflicting work with pessimistic locking, rather than detect conflicts through optimistic locking.

---

## Overview

- Goals:
  - Save the order, deduct inventory, and consume the coupon in one transaction.
  - Allow an issued coupon to be used only once, even under concurrent requests.
  - Allow concurrent orders for a product to succeed only up to the available stock quantity.
  - Avoid partial changes to orders, inventory, or coupons when a request fails.

---

## The problem

A transaction guarantees atomicity within a request. It doesn't automatically solve every problem caused by multiple requests reading and modifying the same data concurrently.

Two orders using the same coupon can both read `AVAILABLE`. If ten users order a product with five units left, more than five orders could succeed.

I wanted to prevent these outcomes when the order was created rather than detect and correct them afterward.

---

## Order processing flow

Order creation follows this flow:

{{< mermaid-box width="600px" >}}
flowchart TD
    A["Order request"] --> B["Authenticate user"]
    B --> C["Sort requested product IDs"]
    C --> D["Read coupon issue row with pessimistic lock"]
    C --> E["Read inventory rows with pessimistic locks"]
    D --> F["Load products / brands"]
    E --> F
    F --> G["Validate domain rules"]
    G --> H{"Validation passed?"}
    H -- "No" --> R["Roll back transaction"]
    H -- "Yes" --> I["Deduct inventory"]
    I --> J["Mark coupon USED"]
    J --> K["Save order"]
    K --> L["Commit transaction"]
{{< /mermaid-box >}}

The key is to lock the coupon and inventory first, then complete validation and updates within the same transaction. If validation fails, no order is saved and no coupon or inventory changes are committed.

---

## Technical decisions

| Design area | Choice | Rationale |
|-------------|--------|-----------|
| Order transaction boundary | `OrderFacade.placeOrder` | Keep authentication, inventory, coupon use, and order persistence within one atomic use case |
| Coupon concurrency control | Pessimistic lock on the `CouponIssue` row | Serialize validation and the transition to `USED` so an issued coupon can be used only once |
| Inventory concurrency control | Pessimistic lock on the `Inventory` row | Prevent overselling and make deduction results predictable |
| Orders with multiple products | Sort by `productId` before acquiring locks | Reduce deadlock risk by using a consistent lock acquisition order |
| Like count | Pessimistic lock on the `ProductStat` row | Prevent a Lost Update to `likeCount` during concurrent like and unlike requests |
| Coupon terms | Snapshot stored in `CouponIssue` | Preserve the discount terms promised at issuance when the coupon is used later |

---

## Why pessimistic locking?

Conflicts involving coupons and inventory have a high cost. Duplicate coupon use directly affects money, and overselling produces successful orders for stock that no longer exists.

Optimistic locking detects a conflict after concurrent work has taken place. That can be the right choice, but here it would also require decisions about retries, failures, and the response presented to the user.

Pessimistic locking serializes work on the same `CouponIssue` or `Inventory` row from the start. Requests may wait, but only one request at a time validates and changes the locked data, making the outcome easier to reason about.

For this implementation, preserving states that must never be violated took priority over throughput.

---

## Detailed design

### 1. Lock CouponIssue for coupon use

The one-time resource is the issued coupon, not the coupon template.

When an order request contains `couponId`, I load the `CouponIssue` row with `PESSIMISTIC_WRITE`. The domain then validates ownership, usage status, expiration, and the minimum order amount before changing the status to `USED`.

{{< mermaid-box width="400px" >}}
flowchart LR
    A["CouponIssueEntity<br/>SELECT FOR UPDATE"] --> B["Convert to CouponIssue domain model"]
    B --> C["Domain.use()<br/>Validate + mark USED"]
    C --> D["Reload entity"]
    D --> E["entity.update(domain)"]
    E --> F["Flush at commit"]

    subgraph TX["Same database transaction"]
        A
        B
        C
        D
        E
        F
    end
{{< /mermaid-box >}}

Pessimistic locking still works when the domain model and JPA entity are separate. The lock is associated with the database row and transaction, not the domain object.

Changing the domain object doesn't trigger dirty checking, however. Its values must be copied back to the entity before persistence.

### 2. Sort productId before locking inventory

An order can contain multiple products, so it may need locks on several `Inventory` rows.

Different lock acquisition orders increase the risk of deadlock. If request A locks product 1 and then product 2 while request B locks product 2 and then product 1, each can end up waiting for the other's lock.

I therefore remove duplicate product IDs and sort them before loading the rows. This doesn't eliminate every possible deadlock, but it provides a basic safeguard.

{{< mermaid-box width="680px" >}}
flowchart TD
    A["Order product IDs<br/>3, 1, 2, 1"] --> B["Remove duplicates<br/>3, 1, 2"]
    B --> C["Sort<br/>1, 2, 3"]
    C --> D["Lock Inventory rows<br/>in order: 1 -> 2 -> 3"]
    D --> E["Validate inventory"]
    E --> F["Deduct inventory"]
{{< /mermaid-box >}}

### 3. Snapshot coupon terms at issuance

If `CouponIssue` only references `Coupon` and doesn't hold its own discount terms, those terms can change between issuance and use.

A user might receive a 10% coupon, only to get 5% off after someone edits the template.

I store `type`, `discountValue`, `minOrderAmount`, and `expiredAt` as a snapshot in `CouponIssue`. The extra columns are a cost I accepted to preserve what was promised to the user.

{{< mermaid-box width="820px" >}}
flowchart LR
    A["Coupon template<br/>10% discount"] --> B["Issue CouponIssue"]
    B --> C["Snapshot<br/>type / discountValue / minOrderAmount / expiredAt"]
    A --> D["Template later edited or deleted"]
    C --> E["Calculate order discount<br/>from the CouponIssue snapshot"]
{{< /mermaid-box >}}

---

## Alternatives considered

| Option | Pros | Cons |
|--------|------|------|
| A. Optimistic locking | No lock waiting when conflicts are rare | Requires a retry/failure policy after conflicts and complicates order responses |
| B. Pessimistic locking | Serializes validation and updates, making duplicate use and excessive deductions easier to reason about | Busy rows cause longer waits; deadlocks need consideration |
| C. Queue-based serial processing | Straightforward sequential processing for hot keys | Requires redesigning order states and responses around an asynchronous flow |
| **Selected: B** | Clearest consistency checks and failure rules for the current requirements | Requires care with lock duration and query order |

**Why I chose B:**

A successful order appears to the user as an immediate, confirmed outcome. If stock is insufficient or a coupon has already been used, I would rather reject the request up front than show success and cancel it later.

That led me to lock the contested resources before validation. Optimistic locking has clear benefits, but conflict handling would become a central source of complexity in this flow. Pessimistic locking trades some performance for simpler success and failure rules.

## Open questions and trade-offs

Experimenting with optimistic locking also made the cost of separating domain models from JPA entities more apparent.

`@Version` and dirty checking fit most naturally when working directly with entities. Exposing entities to the application layer makes JPA features convenient to use, but weakens the layer boundaries. Keeping entities inside infrastructure makes the Mapper and Repository implementations more complicated.

I don't take this to mean that pessimistic locking is always the right answer. Preventing duplicate coupon use and excessive inventory deductions was the priority for this order flow, and pessimistic locking addressed that priority directly.

Deadlocks remain a concern. Sorting by `productId` reduces the risk by aligning lock acquisition order, but it isn't a complete solution. Still, a consistent order is a basic precaution whenever a flow locks multiple rows.
