+++
title = 'You Can Do DDD, Too!'
date = '2026-05-22T17:00:00+09:00'
description = "Core concepts in DDD (Domain-Driven Design) and practical ways to identify domain boundaries."
summary = ""
categories = ["Architecture"]
tags = ["DDD", "Domain-Driven Design", "Architecture", "Bounded Context"]
series = ["Architecture"]
series_order = 1

draft = false
+++

I suspect plenty of developers are like me: we've heard of DDD, but haven't really put it into practice.

At its core, the idea is fairly straightforward:

`Understand the business, then design around that understanding.`

`Everyone involved in solving the problem develops a shared understanding of the domain and uses it to guide the design, rather than starting with technology.`

DDD is more concerned with “What problem are we actually solving?” than “Which framework should we use?”

---

## Why did DDD emerge?

Software gets more complicated over time.

At first, things are simple: receive a request in a controller, process it in a service, and save the result to a database.

As features accumulate, though, things start to look like this:

- The order service decides which coupon policies apply.
- The payment service checks membership grades.
- Shipping logic directly changes order status.
- `User`, `Member`, and `Customer` appear throughout the code with similar meanings.
- Someone asks, “Why is this condition here?” and everyone suddenly looks away.

The problem is bigger than long source files. Business knowledge has become scattered across the system.

Eric Evans introduced DDD in his 2003 book, `Domain-Driven Design: Tackling Complexity in the Heart of Software`, as an approach to managing this complexity. Its focus is the **domain**.

A domain is the business problem area the software addresses. In commerce, examples include orders, payments, inventory, delivery, and settlement.

DDD aims to develop a deep understanding of those areas and reflect that understanding in the names, structure, and responsibilities of the code.

---

## Three parts of DDD

{{< figure src="img1.jpg" class="mx-auto" width="500" >}}

The terminology can feel overwhelming when you first study DDD. I find it easier to organize it into three broad parts.

### 1. Domain exploration

This is where we get to know the domain.

Domain experts and developers examine business workflows together: what happens, which policies apply, and where problems occur.

Methods such as `EventStorming` can help. For example, we can lay out events such as “Order Created,” “Payment Approved,” “Inventory Deducted,” and “Delivery Started” to see the workflow as a whole.

### 2. Strategic Design

Strategic Design defines the larger boundaries.

Instead of building one enormous model for the entire system, we divide it into areas where meanings remain consistent. `Bounded Context` is a key concept here.

For a commerce system, one possible division is:

- Order: order creation, order status, and cancellation
- Payment: payment approval, cancellation, and payment gateway integration
- Inventory: stock reservation, deduction, and restoration
- Delivery: shipment requests, tracking numbers, and delivery status

These boundaries shouldn't simply follow folders or tables. Language, rules, responsibilities, and reasons for change are more useful criteria.

### 3. Tactical Design

Tactical Design is about expressing the inside of a Bounded Context in code.

This is where patterns such as `Entity`, `Value Object`, `Aggregate`, `Repository`, `Domain Service`, `Domain Event`, and `Factory` come in.

Using those patterns doesn't automatically make a design DDD, though.

If all business logic still lives in a single `OrderService` and the domain objects are empty shells with getters and setters, naming a package `domain` doesn't accomplish much.

---

## Still unsure what a Bounded Context is?

If I had to pick the most important concept in DDD, it would be `Bounded Context`.

A Bounded Context defines the boundary within which a particular model and its terminology have consistent meanings.

Take the word “product.”

The inventory team cares about incoming stock and quantities available to ship. The settlement team cares about selling prices, supply costs, and commission rates.

They're talking about the same product from different perspectives.

What happens if we put everything into one `Product` model?

{{< figure src="img2.jpg" class="mx-auto" width="500" >}}

At first, it feels convenient to have everything in one place. Eventually, it becomes a huge object nobody wants to touch.

The lesson is: `when the same word has different meanings, consider separate boundaries.`

---

## How do we identify domain boundaries?

Finding useful criteria for splitting domains was one of the harder parts of learning DDD. These four questions helped me.

### Does the same word mean different things?

If teams use words such as “member,” “product,” “order,” or “settlement” differently, that's a potential boundary.

A member might be an authenticated identity in an authentication context, buyer information in an order context, and a campaign recipient in a marketing context.

A shared word doesn't necessarily call for a shared model.

### Who owns this rule?

Payment approval rules belong to the payment domain. Stock deduction rules belong to inventory. Coupon eligibility belongs to the coupon domain.

When one domain starts applying another domain's rules directly, validation can be skipped, history can be lost, and unintended side effects can appear.

This matters in practical DDD implementations, too. A change to a limit balance, for example, should go through the domain responsible for that limit. That keeps validation, history, and policy enforcement in one place.

### Must these changes happen in one transaction?

An `Aggregate` is more than a container for objects that look related. It is closer to **the smallest unit whose consistency must be maintained immediately**.

An order total may need to match the sum of its items immediately. Sending a notification or updating statistics after the order completes may be allowed to happen later.

Putting everything in one transaction makes the model too large. Routing everything through events can make the flow hard to follow.

The useful distinction is: `what must be consistent immediately, and what can become consistent later?`

### Do these things change together or independently?

Things that frequently change together are likely to belong within the same boundary. Things that change for different reasons are candidates for separation.

Promotion policies change with marketing campaigns. Delivery integration changes with carrier APIs or logistics policies. Settlement changes with accounting, contracts, and commission policies.

When unrelated reasons for change share one model, they keep getting in each other's way.

---

## A practical view of the tactical patterns

- `Entity`: an object whose identity matters, such as an order or a member.
- `Value Object`: an object whose value matters, such as money, an address, or a period of time.
- `Aggregate`: a unit of change within which consistency must be maintained.
- `Repository`: an interface for storing and retrieving objects.
- `Domain Service`: domain rules that don't fit naturally in a single object.
- `Domain Event`: a meaningful occurrence in the domain.
- `Factory`: an object responsible for complex object creation.

The pattern names matter less than whether the business rules are visible in the code.

For example, we could pass a price around as a `Long`. But if an amount cannot be negative, needs a currency, or follows calculation rules, a `Price` Value Object may express that more clearly.

{{< figure src="img3.png" class="mx-auto" width="500" >}}

Computers aren't the only things that read code. Future me reads it, too. And future me is already annoyed. Let's give that person a break.

---

## Is DDD the same as microservices?

No. A Bounded Context is a design boundary; it doesn't have to be a deployment boundary.

Adopting DDD doesn't mean splitting everything into separate services from day one. A modular monolith can often be a good starting point.

We can first enforce boundaries through packages, modules, and dependency rules within one application. If independent deployment becomes necessary later, we can split out a service then.

{{< figure src="img4.jpg" class="mx-auto" width="500" >}}

DDD doesn't require the full collection of Kafka, Event Sourcing, CQRS, and MSA. Sometimes that's just an excuse to collect more tools.

---

## A quick look at the Anti-Corruption Layer

{{< figure src="img5.png" class="mx-auto" width="800" >}}

External and legacy systems inevitably have models that differ from ours.

If we bring those models directly into our domain, our internal model gradually takes on their assumptions. For example, if a payment provider's status values spread throughout our payment domain, changing providers can affect code across the system.

An `Anti-Corruption Layer` provides a translation layer between them. It protects the internal domain by translating the external system's language into our own.

A simple analogy is using a USB-C hub to connect HDMI to a MacBook Air: MacBook ↔ USB-C hub ↔ HDMI.

``` kotlin
// ACL example

class LegacyOrderTranslator {

    fun translate(legacyStatus: String): OrderStatus =
        when (legacyStatus) {
            "A" -> OrderStatus.PAID
            "B" -> OrderStatus.SHIPPED
            else -> throw IllegalArgumentException("Unknown status: $legacyStatus")
        }
}

```

---

## What I've taken away

DDD has clear benefits when used well.

1. Business rules become easier to find in code. We can see where policies live and better predict the impact of a change.
2. Team conversations become closer to the code. When product planners and domain experts use terms that also appear in the implementation, there is less room for misunderstanding requirements.
3. We don't have to understand a complex system all at once. Bounded Contexts let us reason about each area separately instead of memorizing the entire system.

Still, I don't think DDD belongs everywhere. Applying it heavily to simple CRUD or features with very few policies can introduce unnecessary complexity.

It seems most useful when the domain itself is complex: many rules, many exceptions, frequent changes, and multiple teams using the same words differently.

The idea I keep coming back to is:

`Bring the business and the code closer together.`

---

{{< figure src="featured.png" class="mx-auto" width="500" >}}

See? You can do DDD, too.
