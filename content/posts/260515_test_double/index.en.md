+++
title = 'What Exactly Is a Test Double?'
date = '2026-05-15T12:28:45+09:00'
description = "What Test Doubles are, when they help, and when to use them with care."
summary = "An introduction to Test Doubles and the roles of Dummy, Stub, Fake, Spy, and Mock."
categories = ["Testing"]
tags = ["Test Double", "Unit Test", "Kotlin", "Stub", "Mock"]
series = ["Testing"]
series_order = 1

draft = false
+++

While studying testing, I came across the term `Test Double`. I knew what a test was, but what was the “double” doing there?

Think of a stunt double: someone who stands in for an actor, usually without showing their face. A Test Double plays a similar role. It stands in for a real object when using that object in a test would be difficult or undesirable.

In this post, I'll go through what Test Doubles do, when they are useful, and when we should be careful with them.

---

## What is a Test Double?

The [Wikipedia article on Test Doubles](https://en.wikipedia.org/wiki/Test_double) describes the idea roughly as follows:

> Software used in testing to satisfy a dependency without making the code under test depend directly on the real production implementation.

**Satisfying a dependency without using the real implementation** means replacing an external object with a test-specific one while keeping the interface the code needs.

Suppose an order service calls a payment API.

```kotlin
class OrderService(
    private val paymentGateway: PaymentGateway
) {
    fun pay(orderId: String, amount: Int): PaymentResult {
        return paymentGateway.pay(orderId, amount)
    }
}

interface PaymentGateway {
    fun pay(orderId: String, amount: Int): PaymentResult
}

data class PaymentResult(
    val transactionId: String,
    val success: Boolean
)
```

We want to test `OrderService`, but calling a real payment API on every test run would be a problem. If running a test charges someone's card, that's an incident.

{{< figure src="img1.png" alt="Yes, that payment really went through." class="mx-auto" width="500" >}}

So we provide a test implementation of `PaymentGateway` in place of the real one.

```kotlin
class StubPaymentGateway : PaymentGateway {
    override fun pay(orderId: String, amount: Int): PaymentResult {
        return PaymentResult("test-transaction", true)
    }
}
```

`OrderService` has no idea whether it is talking to the real payment API or a test implementation. It simply makes requests through the `PaymentGateway` interface.

Here, `StubPaymentGateway` is the Test Double.

---

## Why use a stand-in?

My first reaction was: couldn't we just test with the real object?

Often, that's a good choice. Real objects give us behavior closest to production. But tests that connect every real dependency can become slow, unreliable, and difficult to control.

Test Doubles are commonly useful when:

1. The code calls an external API.
2. It depends on slow resources such as a database or file system.
3. Its results depend on changing values such as the current time or random numbers.
4. We need to reproduce a failure deliberately.
5. We want to test one component in isolation.

For example, suppose we want to test a failed payment. We can't wait for the real payment server to fail at just the right moment. That tends to happen right after a deployment, anyway.

{{< figure src="img2.png" alt="Failures always seem to happen in production." class="mx-auto" width="500" >}}

In a test, we can create a stand-in that always fails.

```kotlin
class FailingPaymentGateway : PaymentGateway {
    override fun pay(orderId: String, amount: Int): PaymentResult {
        return PaymentResult("failed-transaction", false)
    }
}
```

Now we can reproduce a payment failure whenever we need to. This is the main benefit of Test Doubles: they put us in control of the test environment.

---

## Types of Test Doubles

Test Double is an umbrella term. The names can be confusing at first, but their purposes make them easier to distinguish.

The five commonly discussed types are:

1. Dummy
2. Stub
3. Fake
4. Spy
5. Mock

---

## Dummy: required, but never used

A Dummy is passed into the code so the test can run, but it is never used in the execution path being tested.

Suppose a user registration service requires a notification sender in its constructor. Our test only cares about validating user names, so sending notifications is outside its scope.

```kotlin
interface NotificationSender {
    fun send(message: String)
}

class UserService(
    private val notificationSender: NotificationSender
) {
    fun validateName(name: String): Boolean {
        return name.isNotBlank()
    }
}
```

The constructor requires `NotificationSender`, but `validateName()` never uses it. We can supply a Dummy that does nothing.

```kotlin
class DummyNotificationSender : NotificationSender {
    override fun send(message: String) {
        // Not used in this test.
    }
}
```

A Dummy simply fills a required slot. Its behavior is irrelevant to the test.

---

## Stub: a stand-in with a prepared answer

{{< figure src="img3.jpg" alt="Ready for every interview question." class="mx-auto" width="500" >}}

A Stub returns values we have prepared for the test. Think of an interview candidate who has memorized the expected questions and immediately delivers a rehearsed answer.

Suppose a service calculates a discount based on a user's membership grade.

```kotlin
interface UserRepository {
    fun findGrade(userId: Long): String
}

class DiscountService(
    private val userRepository: UserRepository
) {
    fun discountRate(userId: Long): Int {
        val grade = userRepository.findGrade(userId)

        return when (grade) {
            "VIP" -> 20
            "BASIC" -> 5
            else -> 0
        }
    }
}
```

We want to test the discount calculation, not the database query. A Stub can return a specific grade.

```kotlin
class VipUserRepositoryStub : UserRepository {
    override fun findGrade(userId: Long): String {
        return "VIP"
    }
}
```

The test then looks like this:

```kotlin

class DiscountServiceTest {
    @Test
    fun `VIP users receive a 20 percent discount`() {
        val service = DiscountService(VipUserRepositoryStub())

        val result = service.discountRate(1L)

        assertEquals(20, result)
    }
}
```

---

## Fake: a simplified working implementation

A Fake behaves like a real implementation but takes shortcuts that make it unsuitable for production.

An in-memory store is a common example. The real service uses a database, while the test uses an in-memory collection to support similar operations.

```kotlin
data class User(
    val id: Long,
    val name: String
)

interface UserStore {
    fun save(user: User)
    fun findById(id: Long): User?
}

class FakeUserStore : UserStore {
    private val users = mutableMapOf<Long, User>()

    override fun save(user: User) {
        users[user.id] = user
    }

    override fun findById(id: Long): User? {
        return users[id]
    }
}
```

This Fake can save and retrieve users, just as a database can. It doesn't provide transactions, concurrency handling, or query optimization. It implements only as much behavior as the test needs.

```kotlin

class FakeUserStoreTest {
    @Test
    fun `retrieves a previously saved user`() {
        val store = FakeUserStore()
        val user = User(1L, "wild")

        store.save(user)

        assertEquals(user, store.findById(1L))
    }
}
```

Fakes are useful, but there is a catch: if the Fake behaves too differently from the real implementation, tests can pass while production fails.

---

## Spy: a stand-in that records what happened

{{< figure src="img4.png" alt="" class="mx-auto" width="500" >}}

A Spy records information such as whether a method was called and how many times it was called.

Suppose completing an order should send a notification.

```kotlin
interface OrderNotifier {
    fun notify(orderId: String)
}

class OrderCompleteService(
    private val notifier: OrderNotifier
) {
    fun complete(orderId: String) {
        notifier.notify(orderId)
    }
}
```

We may want to check that the notification was requested without actually delivering it. Mockito's `spy` can help with that.

```kotlin

class OrderCompleteServiceTest {
    @Test
    fun `sends a notification when an order is completed`() {
        val notifier = Mockito.spy(object : OrderNotifier {
            override fun notify(orderId: String) {
                // Do not send a real notification.
            }
        })
        val service = OrderCompleteService(notifier)

        service.complete("order-1")

        Mockito.verify(notifier).notify("order-1")
    }
}
```

A Spy lets us look back after execution and check what happened.

---

## Mock: verifying expected interactions

A Mock is commonly used to verify which methods were called and which arguments they received. Libraries such as Mockito provide this functionality.

```kotlin

class OrderServiceMockTest {
    @Test
    fun `forwards the payment request to the payment gateway`() {
        val gateway = Mockito.mock(PaymentGateway::class.java)
        val service = OrderService(gateway)

        Mockito.`when`(
            gateway.pay("order-1", 10_000)
        ).thenReturn(PaymentResult("tx-1", true))

        val result = service.pay("order-1", 10_000)

        assertTrue(result.success)
        Mockito.verify(gateway).pay("order-1", 10_000)
    }
}
```

Mocks are powerful, but using them indiscriminately can tie tests too closely to implementation details.

Overly strict checks on internal call counts or call order make refactoring difficult. A small internal change can break a whole set of tests even though the feature still behaves exactly the same way.

Tests should protect the product's behavior. They shouldn't freeze the code in its current shape.

---

## When are Test Doubles useful?

Test Doubles help make tests fast and reliable, especially when we want to separate the core logic under test from external dependencies.

These are the situations where I think they make the most sense.

### When the code depends on external systems

Calling an external system directly from a test can be slow, cost money, and fail because of network conditions.

Stubs and Mocks let us reproduce success, failure, and timeout scenarios predictably.

### When tests take too long

If every test connects to every external API, feedback becomes slow. Developers run slow tests less often. Eventually, the tests become like documentation that exists but rarely gets read.

We can use Test Doubles for fast unit tests and verify the real connections separately with integration tests.

### When we need to reproduce failures

Failures are hard to arrange in a real environment, but they still need testing. Does the code retry a failed API call? Does it translate exceptions appropriately? What response reaches the user?

A Test Double lets us trigger exactly the failure we need at exactly the right point.

```kotlin
class TimeoutPaymentGateway : PaymentGateway {
    override fun pay(orderId: String, amount: Int): PaymentResult {
        throw RuntimeException("timeout")
    }
}
```

We can prepare for a failure instead of waiting for one.

---

## When should we be cautious?

Convenience doesn't mean every dependency needs a Test Double. The more real behavior we replace, the further our tests can drift from production.

### Replacing Value Objects or simple domain objects

For simple objects, using the real thing is usually easier.

```kotlin
data class Money(
    val amount: Int
)
```

There is rarely a reason to Mock an object like this. Just create `Money(10_000)`. If an object is cheap to construct and simple to use, a stand-in adds little value.

### Tying tests too closely to the implementation

Mocks make it easy to verify **which methods were called**. From a user's perspective, though, the result usually matters more.

In a discount test, verifying that a VIP user receives a 20% discount may be more valuable than verifying that `findGrade()` was called exactly once.

When an interaction is itself a requirement, we should verify it. If **completing an order must trigger a notification**, checking that call makes sense. Checking internal calls simply because the current implementation happens to make them produces brittle tests.

### Letting a Fake diverge from the real implementation

An in-memory Fake is convenient, but it isn't a real database. If the database enforces a unique constraint and the Fake doesn't, tests may pass while production fails.

We need to understand **which parts of the real implementation the Fake reproduces and which parts it leaves out**.

### Using only unit tests where integration tests are needed

Test Doubles remove dependencies from a test. We still need to check that the boundaries we removed actually work when connected.

Replacing every Repository with a Fake can give us fast feedback on service logic. It cannot tell us whether our SQL is correct, our mappings work, or our transactions behave as intended.

Unit tests with Test Doubles and integration tests with real dependencies serve different purposes. One doesn't replace the other.

---

## The rule of thumb I use

My current guideline is:

> Use a Test Double when something outside the scope of the test makes it slow, unreliable, or difficult to set up.

And the habit to avoid is:

> Replacing everything automatically, even when real objects would make the test fast and clear enough.

The key is to be explicit about what we want to test. Discount logic, database queries, and external API integration call for different choices about which objects should be real and which should be Test Doubles.
