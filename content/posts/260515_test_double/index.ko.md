+++
title = 'Test Double 그게 뭔데?'
date = '2026-05-15T12:28:45+09:00'
description = "Test Double이 무엇인지, 언제 쓰면 좋은지, 언제 조심해야 하는지 정리."
summary = "Test Double이 무엇인지에 대한 정리"
categories = ["Testing"]
tags = ["Test Double", "Unit Test", "Kotlin", "Stub", "Mock"]
series = ["Testing"]
series_order = 1

draft = false
+++

테스트 코드에 대한 공부를 하면서 `Test Double`이라는 개념을 마주쳤다. 처음 봤을 때는 이름부터 좀 낯설었다. 테스트는 알겠는데, 더블은 또 뭔가 싶었다.

영화에서 위험한 장면을 배우 대신 수행하는 스턴트 더블을 떠올리면 조금 감이 온다. 테스트 더블도 비슷하다. 테스트에서 진짜 객체를 그대로 쓰기 어렵거나, 쓰고 싶지 않을 때 대신 세우는 대역이다.

Test Double이 무엇인지, 어떤 상황에서 쓰는지, 반대로 언제는 사용하는 것을 조심해야 하는지 정리해보려 한다.

---

## 그래서 Test Double이 뭔데?

[Wikipedia의 Test double 문서](https://en.wikipedia.org/wiki/Test_double)에서는 Test Double을 대략 이렇게 설명한다.

> 테스트 대상이 실제 프로덕션 코드에 직접 의존하지 않도록 의존성을 만족시켜주는 테스트용 소프트웨어.


**"의존하지 않도록 의존성을 만족시켜주는"**  즉, 테스트 대상 코드가 어떤 외부 객체를 필요로 할 때 그 외부 객체를 진짜로 붙이지 않고 테스트용 객체로 갈아끼우는 것이다.

예를 들어 주문 서비스가 결제 API를 호출한다고 해보자.

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

`OrderService`를 테스트하고 싶은데, 테스트를 실행할 때마다 실제 결제 API를 호출하면 꽤 곤란하다. 테스트 한 번 돌렸을 뿐인데 카드가 긁히면 그건 테스트가 아니라 사고다.

그래서 테스트에서는 진짜 `PaymentGateway` 대신 테스트용 `PaymentGateway`를 넣을 수 있다.

```kotlin
class StubPaymentGateway : PaymentGateway {
    override fun pay(orderId: String, amount: Int): PaymentResult {
        return PaymentResult("test-transaction", true)
    }
}
```

이렇게 하면 `OrderService`는 자신이 진짜 결제 API를 사용하는지, 테스트용 결제 API를 사용하는지 모른다. 그냥 `PaymentGateway`라는 인터페이스를 통해 요청할 뿐이다.

여기서 `StubPaymentGateway`가 Test Double이다.

---

## 왜 굳이 가짜를 세울까?

처음에는 이런 생각이 들 수 있다.

그냥 진짜 객체로 테스트하면 되는 거 아닌가?

가능하면 진짜 객체로 테스트하는 것이 좋을 때도 많다. 실제 동작과 가장 가깝기 때문이다. 하지만 모든 의존성을 진짜로 붙이는 테스트는 종종 느리고, 불안정하고, 다루기 어려워진다.

테스트 더블은 보통 이런 상황에서 사용한다.

1. 외부 API 호출이 필요한 경우
2. 데이터베이스나 파일 시스템처럼 느린 자원에 의존하는 경우
3. 현재 시간, 랜덤 값처럼 결과가 매번 달라지는 경우
4. 실패 상황을 의도적으로 재현해야 하는 경우
5. 테스트 대상만 독립적으로 확인하고 싶은 경우

예를 들어 결제 실패 상황을 테스트하고 싶다고 해보자. 실제 결제 서버가 마침 실패해주기를 기다릴 수는 없다. 그런 일은 필요할 때는 안 일어나고, 배포 직후에 일어나는 편이다.

테스트에서는 실패하는 대역을 직접 만들면 된다.

```kotlin
class FailingPaymentGateway : PaymentGateway {
    override fun pay(orderId: String, amount: Int): PaymentResult {
        return PaymentResult("failed-transaction", false)
    }
}
```

이제 결제 실패 상황을 언제든지 재현할 수 있다. 테스트 더블의 가장 큰 장점은 여기에 있다. 테스트 환경을 내가 통제할 수 있게 만들어준다.

---

## Test Double의 종류

Test Double이라는 큰 분류 안에는 여러 종류가 있다. 이름이 조금 헷갈리지만, 각각의 목적을 기준으로 보면 이해하기 쉽다.

대표적으로는 다음 다섯 가지가 자주 언급된다.

1. Dummy
2. Stub
3. Fake
4. Spy
5. Mock


---

## Dummy: 필요해서 넣지만 사용하지는 않는 값

Dummy는 테스트를 실행하기 위해 인자로 넘기긴 하지만, 실제 테스트 흐름에서는 사용되지 않는 객체이다.

예를 들어 회원 가입 서비스가 알림 발송기를 생성자에서 요구한다고 해보자. 그런데 지금 테스트하고 싶은 것은 회원 이름 검증이고, 알림 발송은 관심사가 아니라고 하자.

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

이때 `NotificationSender`는 생성자에 필요하지만, `validateName()` 테스트에서는 사용되지 않는다. 그럼 아무 일도 하지 않는 Dummy를 넣을 수 있다.

```kotlin
class DummyNotificationSender : NotificationSender {
    override fun send(message: String) {
        // 사용하지 않는다
    }
}
```

Dummy는 말 그대로 자리 채우기용이다. 테스트 대상이 요구하니까 넣어주지만, 그 객체의 동작은 테스트의 관심사가 아니다.

---

## Stub: 정해진 답을 돌려주는 대역

Stub은 테스트에서 필요한 값을 미리 정해두고 그대로 반환하는 대역이다.

사용자 등급에 따라 할인을 계산하는 서비스가 있다고 해보자.

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

여기서 테스트하고 싶은 것은 할인율 계산이지, 데이터베이스 조회가 아니다. 그래서 특정 사용자 등급을 반환하는 Stub을 만들 수 있다.

```kotlin
class VipUserRepositoryStub : UserRepository {
    override fun findGrade(userId: Long): String {
        return "VIP"
    }
}
```

테스트는 이렇게 작성할 수 있다.

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

class DiscountServiceTest {
    @Test
    fun `VIP 사용자는 20퍼센트 할인을 받는다`() {
        val service = DiscountService(VipUserRepositoryStub())

        val result = service.discountRate(1L)

        assertEquals(20, result)
    }
}
```

Stub은 질문을 받으면 미리 준비한 답을 내놓는 대역이다. 면접 예상 질문만 외운 지원자처럼, 예상한 질문에는 아주 침착하다.

---

## Fake: 단순하지만 실제처럼 동작하는 구현체

Fake는 실제 구현처럼 동작하지만, 프로덕션에서 쓰기에는 부족한 단순한 구현체이다.

가장 흔한 예시는 인메모리 저장소이다. 실제 서비스에서는 데이터베이스를 쓰지만, 테스트에서는 메모리 컬렉션으로 비슷하게 동작하게 만들 수 있다.

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

이 Fake는 실제 데이터베이스처럼 저장하고 조회할 수 있다. 하지만 트랜잭션, 동시성, 쿼리 최적화 같은 것은 없다. 테스트에 필요한 만큼만 실제처럼 행동한다.

```kotlin
import kotlin.test.Test
import kotlin.test.assertEquals

class FakeUserStoreTest {
    @Test
    fun `저장한 사용자를 다시 조회한다`() {
        val store = FakeUserStore()
        val user = User(1L, "wild")

        store.save(user)

        assertEquals(user, store.findById(1L))
    }
}
```

Fake는 꽤 유용하지만 조심할 점도 있다. Fake가 실제 구현과 너무 달라지면 테스트는 통과하는데 실제 서비스는 실패할 수 있다.
---

## Spy: 무슨 일이 있었는지 기록하는 대역

Spy는 호출 여부나 호출 횟수 같은 정보를 기록하는 대역이다.

예를 들어 주문이 완료되면 알림을 보내야 한다고 해보자.

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

이때 알림이 실제로 발송되었는지보다, 알림 발송 요청이 일어났는지를 확인하고 싶을 수 있다. 그러면 Mockito의 `spy`를 사용할 수 있다.

```kotlin
import org.mockito.Mockito
import kotlin.test.Test

class OrderCompleteServiceTest {
    @Test
    fun `주문 완료 시 알림을 보낸다`() {
        val notifier = Mockito.spy(object : OrderNotifier {
            override fun notify(orderId: String) {
                // 실제 발송은 하지 않는다
            }
        })
        val service = OrderCompleteService(notifier)

        service.complete("order-1")

        Mockito.verify(notifier).notify("order-1")
    }
}
```

Spy는 테스트가 끝난 뒤 "방금 무슨 일이 있었는지"를 확인할 수 있게 해준다.

---

## Mock: 기대한 상호작용이 있었는지 검증하는 대역

Mock은 보통 어떤 메서드가 어떤 인자로 호출되었는지를 검증하는 데 사용한다. Kotlin에서는 Mockito 같은 라이브러리를 사용할 수 있다.


```kotlin
import org.mockito.Mockito
import kotlin.test.Test
import kotlin.test.assertTrue

class OrderServiceMockTest {
    @Test
    fun `결제 요청을 결제 게이트웨이에 전달한다`() {
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

Mock은 강력하다. 하지만 강력한 도구일수록 손이 가는 대로 쓰면 테스트가 구현 세부사항에 딱 붙어버린다.

예를 들어 내부 메서드를 몇 번 호출했는지, 어떤 순서로 호출했는지까지 과하게 검증하면 리팩터링이 어려워진다. 기능은 그대로인데 내부 구현을 조금 바꿨다는 이유로 테스트가 우르르 깨질 수 있다.

테스트는 제품의 동작을 지켜줘야지, 코드의 현재 모양을 박제하는 데 집중하면 곤란하다.

---

## 언제 사용하면 좋을까?

Test Double은 테스트를 빠르고 안정적으로 만들고 싶을 때 유용하다. 특히 테스트 대상의 핵심 로직과 외부 의존성을 분리하고 싶을 때 효과가 크다.

나는 다음 상황에서는 Test Double을 사용하는 것이 꽤 합리적이라고 생각한다.

### 외부 시스템에 의존할 때

외부 시스템을 호출하는 코드는 테스트에서 직접 호출하지 않는 편이 좋다. 느리고, 비용이 들 수 있고, 네트워크 상태에 따라 실패할 수 있다.

이런 경우에는 Stub이나 Mock을 사용해서 성공, 실패, 타임아웃 같은 상황을 명확하게 재현하는 편이 좋다.

### 테스트가 너무 느려질 때

모든 테스트가 외부 API를 전부 붙이고 실행된다면 테스트 피드백이 느려진다. 테스트가 느리면 개발자는 테스트를 덜 실행하게 된다. 결국 테스트가 있어도 잘 안 보게 되는 문서처럼 변한다.

단위 테스트에서는 Test Double로 빠르게 검증하고, 실제 연동은 별도의 통합 테스트에서 확인하는 식으로 나눌 수 있다.

### 실패 상황을 재현해야 할 때

실패 상황은 실제 환경에서 기다리기 어렵지만, 테스트에서는 반드시 확인해야 한다. 외부 API가 실패했을 때 재시도하는지, 예외를 적절히 변환하는지, 사용자에게 어떤 결과를 돌려주는지 같은 것들이다.

이때 Test Double을 사용하면 원하는 실패를 정확한 타이밍에 만들 수 있다.

```kotlin
class TimeoutPaymentGateway : PaymentGateway {
    override fun pay(orderId: String, amount: Int): PaymentResult {
        throw RuntimeException("timeout")
    }
}
```

실패를 기다리지 않고 실패를 준비할 수 있다는 점이 중요하다.

---

## 언제 지양해야 할까?

Test Double이 편하다고 해서 모든 의존성을 대역으로 바꾸는 것이 항상 좋은 것은 아니다. 테스트 더블이 많아질수록 테스트는 실제 동작과 멀어질 수 있다.

### 값 객체나 단순한 도메인 객체까지 대역으로 만들 때

단순한 객체는 그냥 진짜 객체를 쓰는 편이 낫다.

```kotlin
data class Money(
    val amount: Int
)
```

이런 객체까지 Mock으로 만들 필요는 거의 없다. 그냥 `Money(10_000)`을 만들면 된다. 진짜 객체를 만드는 비용이 낮고 동작도 단순하다면 대역을 세울 이유가 약하다.

### 테스트가 구현 방식에 너무 의존할 때

Mock을 사용하면 **어떤 메서드가 호출되었는지** 를 쉽게 검증할 수 있다. 하지만 사용자의 관점에서 중요한 것은 보통 내부 메서드 호출 여부가 아니라 결과이다.

예를 들어 할인 계산 테스트에서 `findGrade()`가 정확히 한 번 호출되었는지보다 VIP 사용자의 할인율이 20퍼센트인지가 더 중요할 수 있다.

상호작용 자체가 요구사항이면 검증해야 한다. 예를 들어 "주문 완료 시 알림을 반드시 발송한다"는 요구사항이라면 알림 발송 호출을 검증할 수 있다. 하지만 단지 현재 구현이 그렇게 되어 있다는 이유로 내부 호출을 검증하면 테스트가 쉽게 깨진다.

### Fake가 실제 구현과 다르게 행동할 때

인메모리 Fake는 편하지만 실제 데이터베이스와 완전히 같지는 않다. 예를 들어 실제 데이터베이스에는 유니크 제약 조건이 있는데 Fake에는 없다면, 테스트에서는 통과하고 운영에서는 실패할 수 있다.

Fake를 사용할 때는 **이 Fake가 실제 구현의 어떤 부분을 흉내 내고 어떤 부분은 흉내 내지 않는지** 를 알고 있어야 한다.

### 통합 테스트가 필요한 곳을 단위 테스트로만 덮을 때

Test Double은 의존성을 끊어내는 도구이다. 하지만 끊어낸 경계가 실제로 잘 연결되는지는 별도로 확인해야 한다.

예를 들어 Repository를 전부 Fake로만 테스트하면 서비스 로직은 빠르게 검증할 수 있다. 하지만 실제 SQL이 맞는지 매핑이 맞는지 트랜잭션이 의도대로 동작하는지는 알 수 없다.

그래서 Test Double을 사용한 단위 테스트와 실제 의존성을 사용하는 통합 테스트는 서로 대체 관계라기보다 역할이 다르다.

---

## 내가 이해한 기준

Test Double을 언제 써야 하는지 한 문장으로 정리하면 이렇다.

> 테스트 대상이 아닌 것 때문에 테스트가 느려지거나, 불안정해지거나, 원하는 상황을 만들기 어려울 때 사용한다.

반대로 지양해야 하는 경우는 이렇게 볼 수 있다.

> 진짜 객체를 써도 충분히 빠르고 명확한데, 습관적으로 모든 것을 대역으로 바꾸는 경우.

결국 핵심은 테스트의 관심사를 분명히 하는 것이다. 지금 검증하고 싶은 것이 할인 계산 로직인지, 데이터베이스 조회인지, 외부 API 연동인지에 따라 진짜 객체를 쓸지 Test Double을 쓸지가 달라진다.
