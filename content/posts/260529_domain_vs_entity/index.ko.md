+++
title = 'domain_vs_entity'
date = '2026-05-29T12:43:19+09:00'
description = "도메인 모델과 DB Entity를 분리하면서 얻은 점과 고민한 점"
summary = "Kotlin Spring JPA 프로젝트에서 도메인 모델과 DB Entity를 분리한 이유와 실제 적용 방식"
categories = ["architecture", "ddd", "jpa"]
tags = ["domain-model", "jpa-entity", "kotlin", "spring", "repository", "mapper"]
series = []
series_order = 1

draft = false
+++

## tldr

도메인 모델과 DB Entity를 분리하면서 비즈니스 규칙은 도메인에 두고 JPA 매핑과 영속성 관심사는 infrastructure에 격리했다.

그 결과 User Product Order 같은 핵심 모델은 JPA annotation 없이 도메인 규칙을 표현할 수 있었고 Repository 구현체에서 Mapper를 통해 DB Entity와 변환하도록 정리했다.

다만 DTO 성 객체의 위치 mapper 책임 update 시 재조회 방식 read query projection 위치 같은 고민도 함께 생겼다.

---

## 본문

## 개요 Overview

- 목표:
  - JPA Entity가 도메인 규칙과 영속성 매핑을 동시에 책임하던 구조를 분리한다.
  - 도메인 모델은 비즈니스 규칙을 표현하고 DB Entity는 테이블 매핑과 영속성 처리를 담당하게 한다.
  - Application Layer는 도메인 객체를 조합하고 Infrastructure Layer는 JPA를 통해 데이터를 저장하고 조회하게 한다.

- 중점 사항:
  - Domain Layer가 JPA에 직접 의존하지 않게 만들기
  - Repository Interface는 Domain Layer에 두고 구현체는 Infrastructure Layer에 두기
  - DB Entity와 Domain Model 사이 변환은 Mapper로 분리하기
  - 도메인 규칙은 Entity annotation이 아니라 도메인 객체 메서드와 생성자 검증에 두기

## 왜 분리했나

처음에는 Member 쪽 구현에서 service layer가 repository를 직접 호출하고 비즈니스 로직도 같이 수행하는 구조였다.

이 방식은 작은 기능에서는 빠르게 구현할 수 있지만 도메인이 커질수록 몇 가지 문제가 생긴다.

첫 번째는 JPA Entity가 너무 많은 책임을 갖게 된다는 점이다.

JPA Entity는 테이블 매핑을 위해 Column Entity Table OneToMany 같은 annotation을 가진다. 여기에 비즈니스 규칙까지 넣으면 객체가 DB 구조와 도메인 규칙을 동시에 알아야 한다.

두 번째는 테스트가 어려워진다는 점이다.

JPA Entity 중심으로 도메인 로직을 작성하면 단순한 규칙 검증도 영속성 컨텍스트나 JPA 동작을 의식하게 된다. 도메인 객체가 순수 Kotlin 객체라면 repository 없이도 생성자와 메서드만으로 규칙을 테스트할 수 있다.

세 번째는 이름과 책임이 섞인다는 점이다.

예를 들어 프로젝트에서는 사용자 도메인을 User로 표현하고 DB 테이블은 member를 사용했다. 이때 JPA Entity 이름까지 UserEntity로 두면 실제 테이블은 member인데 클래스는 User라서 import와 개념이 어색해졌다. 그래서 infrastructure에서는 MemberEntity MemberMapper MemberRepositoryImpl처럼 DB 관점 이름을 쓰고 domain에서는 User를 유지하는 방향으로 정리했다.

## 핵심 기술 및 결정 Technical Decisions

| 기술/설계 항목 | 선택한 대안 | 선택 이유 Rationale |
|---------------|------------|----------------------|
| 도메인 모델과 DB Entity | 분리 | 도메인 규칙과 JPA 매핑 책임을 분리하기 위해 |
| Repository 위치 | Interface는 Domain 구현체는 Infrastructure | Application이 구체 JPA 구현에 의존하지 않게 하기 위해 |
| 변환 책임 | Mapper 분리 | Entity 안에 toDomain 같은 변환 책임을 넣지 않고 양방향 변환을 한 곳에 모으기 위해 |
| Entity 네이밍 | MemberEntity ProductEntity OrderEntity | DB 테이블과 영속성 모델임을 명확히 하기 위해 |
| Domain 네이밍 | User Product Order | 비즈니스 개념을 그대로 표현하기 위해 |
| 조회 최적화 | 일부 목록 조회는 projection 사용 | 모든 조회를 도메인 객체로 변환하면 정렬 페이징 성능이 나빠질 수 있기 때문에 |

## 프로젝트에서는 어떻게 적용했나

## 1. User 도메인과 MemberEntity 분리

도메인 모델은 JPA annotation을 갖지 않는다. User는 회원의 비즈니스 규칙을 표현한다.

```kotlin
class User(
    val id: Long = 0L,
    loginId: String,
    password: String,
    name: String,
    birthDate: LocalDate,
    email: String,
) {
    var loginId: String = loginId
        private set

    var password: String = password
        private set

    var name: String = name
        private set

    var birthDate: LocalDate = birthDate
        private set

    var email: String = email
        private set

    init {
        if (!loginId.matches(LOGIN_ID_REGEX)) {
            throw CoreException(ErrorType.BAD_REQUEST, "LoginId must contain only letters and numbers.")
        }
        if (!name.matches(NAME_REGEX)) {
            throw CoreException(ErrorType.BAD_REQUEST, "Name cannot contain special characters or numbers.")
        }
        if (!email.matches(EMAIL_REGEX)) {
            throw CoreException(ErrorType.BAD_REQUEST, "Email cannot contain special characters or numbers.")
        }
        if (birthDate.isAfter(LocalDate.now())) {
            throw CoreException(ErrorType.BAD_REQUEST, "Birthdate must be before now.")
        }
    }

    fun updatePassword(encodedPassword: String) {
        this.password = encodedPassword
    }
}
```

반면 DB Entity는 infrastructure에 둔다. 이 객체는 member 테이블 매핑을 담당한다.

```kotlin
@Entity
@Table(name = "member")
class MemberEntity(
    @Column(nullable = false, unique = true)
    var loginId: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var birthDate: LocalDate,

    @Column(nullable = false)
    var email: String,
) : BaseEntity() {
    fun update(user: User) {
        loginId = user.loginId
        password = user.password
        name = user.name
        birthDate = user.birthDate
        email = user.email
    }
}
```

여기서 중요한 점은 User와 MemberEntity가 같은 데이터를 들고 있어도 같은 책임을 가진 객체가 아니라는 것이다.

User는 회원이라는 비즈니스 개념이다.

MemberEntity는 member 테이블에 저장하기 위한 persistence model이다.

## 2. Mapper로 변환 책임 분리

Domain Model과 DB Entity를 분리하면 변환이 필요하다.

이 프로젝트에서는 Entity 내부에 toDomain을 넣기보다 Mapper를 별도로 두었다.

```kotlin
object MemberMapper {
    fun toDomain(member: MemberEntity): User {
        return User(
            id = member.id,
            loginId = member.loginId,
            password = member.password,
            name = member.name,
            birthDate = member.birthDate,
            email = member.email,
        )
    }

    fun toEntity(user: User): MemberEntity {
        return MemberEntity(
            loginId = user.loginId,
            password = user.password,
            name = user.name,
            birthDate = user.birthDate,
            email = user.email,
        )
    }
}
```

Mapper를 분리한 이유는 Entity가 도메인을 알게 되는 방향을 줄이기 위해서였다.

물론 현재 코드에서도 MemberEntity.update(user: User)처럼 Entity가 Domain을 인자로 받는 부분은 남아 있다. 업데이트 시 JPA managed entity를 먼저 조회한 뒤 domain 값으로 필드를 반영해야 했기 때문이다.

더 엄격하게 분리하려면 update 메서드도 domain을 받지 않고 primitive 값이나 command 형태를 받게 만들 수 있다. 하지만 그러면 필드가 많아질수록 중복이 커질 수 있다.

현재 구조는 완전한 순수 분리라기보다는 실용적인 분리를 선택하였다.

## 3. Product 도메인과 ProductEntity 분리

Product 도메인 모델은 상품 규칙을 가진다.

예를 들어 상품명은 비어 있으면 안 되고 가격은 음수가 될 수 없다. 삭제는 Product의 상태 변화로 표현한다.

```kotlin
class Product(
    val id: Long = 0L,
    val brandId: Long,
    name: String,
    price: Long,
    description: String,
    imageUrl: String,
    isDeleted: Boolean = false,
) {
    var name: String = name
        private set

    var price: Long = price
        private set

    var description: String = description
        private set

    var imageUrl: String = imageUrl
        private set

    var isDeleted: Boolean = isDeleted
        private set

    init {
        validate(
            brandId = brandId,
            name = name,
            price = price,
            description = description,
            imageUrl = imageUrl,
        )
    }

    fun update(
        name: String,
        price: Long,
        description: String,
        imageUrl: String,
    ) {
        validate(
            brandId = brandId,
            name = name,
            price = price,
            description = description,
            imageUrl = imageUrl,
        )

        this.name = name
        this.price = price
        this.description = description
        this.imageUrl = imageUrl
    }

    fun delete() {
        isDeleted = true
    }
}
```

ProductEntity는 product 테이블 매핑을 담당한다.

여기에는 JPA annotation과 DB 제약 조건이 들어간다.

```kotlin
@Entity
@SQLRestriction("is_deleted = false")
@Table(
    name = "product",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_product_brand_id_name",
            columnNames = ["brand_id", "name"],
        ),
    ],
)
class ProductEntity(
    @Column(name = "brand_id", nullable = false)
    var brandId: Long,

    @Column(nullable = false)
    var name: String,

    @Column(nullable = false)
    var price: Long,

    @Column(nullable = false)
    var description: String,

    @Column(nullable = false)
    var imageUrl: String,

    @Column(nullable = false)
    var isDeleted: Boolean = false,
) : BaseEntity() {
    fun update(domain: Product) {
        brandId = domain.brandId
        name = domain.name
        price = domain.price
        description = domain.description
        imageUrl = domain.imageUrl
        isDeleted = domain.isDeleted
    }
}
```

여기서 Product와 ProductEntity를 분리한 덕분에 soft delete 조회 정책은 infrastructure 쪽에서 처리하고 delete라는 도메인 행위는 Product가 표현할 수 있었다.

다만 이 선택에도 주의할 점이 있었다.

SQLRestriction은 일반 조회에서 삭제 데이터를 자동으로 제외해준다. 덕분에 application layer에서 매번 isDeleted를 검사하지 않아도 된다. 하지만 관리자 감사나 복구처럼 삭제된 데이터까지 조회해야 하는 기능이 생기면 별도 조회 경로가 필요하다.

## 4. Repository Interface와 구현체 분리

Domain Layer에는 repository interface만 둔다.

```kotlin
interface ProductRepository {
    fun findById(productId: Long): Product?

    fun findAllByIds(productIds: Collection<Long>): List<Product>

    fun save(product: Product): Product

    fun update(product: Product): Product
}
```

Infrastructure Layer에는 JPA repository를 사용하는 구현체를 둔다.

```kotlin
@Component
class ProductRepositoryImpl(
    private val productJpaRepository: ProductJpaRepository,
) : ProductRepository {
    override fun findById(productId: Long): Product? {
        return productJpaRepository.findByIdOrNull(productId)
            ?.let(ProductMapper::toDomain)
    }

    override fun save(product: Product): Product {
        return productJpaRepository.save(ProductMapper.toEntity(product))
            .let(ProductMapper::toDomain)
    }

    override fun update(product: Product): Product {
        val entity = productJpaRepository.findByIdOrNull(product.id)
            ?.also { it.update(product) }
            ?: throw CoreException(ErrorType.NOT_FOUND, "Product not found.")

        return productJpaRepository.save(entity)
            .let(ProductMapper::toDomain)
    }
}
```

이 구조에서 Application Service는 ProductRepository interface만 의존한다.

그래서 테스트에서는 fake repository를 사용해 도메인 흐름을 검증할 수 있고 실제 운영에서는 JPA 구현체가 주입된다.

## 트러블슈팅 Troubleshooting

### 문제 현상

도메인 모델과 DB Entity를 분리하면서 오히려 코드가 더 복잡해지는 순간들이 있었다.

특히 다음 부분에서 고민이 많았다.

- User 도메인인데 DB 테이블은 member인 경우 이름을 어떻게 가져갈지
- Entity와 Domain이 같은 필드를 가지면서 중복처럼 보이는 문제
- Mapper를 어디에 둘지
- update 시 JPA Entity를 다시 조회해야 하는지
- 목록 조회에서도 항상 Domain Model로 변환해야 하는지
- ProductSummary 같은 DTO 성 객체를 domain에 둬도 되는지

### 원인 분석

첫 번째 원인은 Entity라는 단어가 두 가지 의미로 쓰이기 때문이다.

DDD에서 Entity는 식별자를 가진 도메인 객체다. 반면 JPA Entity는 DB row와 매핑되는 persistence 객체다.

둘 다 Entity라고 부르기 때문에 처음에는 도메인 모델과 JPA Entity가 같은 것이어야 한다고 생각하기 쉽다.

하지만 이번 프로젝트에서는 두 객체의 변화 이유가 다르다고 판단했다.

- Domain Model은 비즈니스 규칙이 바뀔 때 변경된다.
- DB Entity는 테이블 구조나 JPA 매핑이 바뀔 때 변경된다.

두 번째 원인은 조회와 명령의 성격이 다르다는 점이다.

주문 생성이나 상품 수정처럼 도메인 규칙이 중요한 흐름은 Domain Model로 변환해서 처리하는 것이 자연스럽다.

반면 상품 목록 조회처럼 정렬 페이징 projection이 중요한 read query는 매번 Domain Model로 변환하는 것이 오히려 비효율적일 수 있다.

실제로 상품 목록 조회에서는 Product Brand ProductStat을 조합해야 했고 likes_desc 정렬까지 필요했다. 이걸 도메인별로 각각 조회한 뒤 메모리에서 병합하면 페이징 정확성이 깨질 수 있었다. 그래서 QueryDSL projection을 사용했다.

### 해결 방안

#### 1. 이름으로 책임을 드러내기

도메인은 User Product Order처럼 비즈니스 이름을 유지했다.

Infrastructure의 JPA Entity는 MemberEntity ProductEntity OrderEntity처럼 영속성 모델임을 드러냈다.

특히 User의 경우 DB 테이블명이 member였기 때문에 infrastructure에서는 Member라는 이름을 사용했다.

이렇게 하니 import가 조금 더 명확해졌다.

- domain.user.User
- infrastructure.member.MemberEntity
- infrastructure.member.MemberMapper
- infrastructure.member.MemberRepositoryImpl

#### 2. Mapper를 Infrastructure에 두기

Mapper는 DB Entity를 알고 있어야 한다.

따라서 domain이 아니라 infrastructure에 두었다.

Domain Layer가 JPA Entity를 알면 분리의 의미가 약해지기 때문이다.

현재 구조는 다음과 같다.

```text
domain/user/User
domain/user/UserRepository

infrastructure/member/MemberEntity
infrastructure/member/MemberMapper
infrastructure/member/MemberRepositoryImpl
```

#### 3. update는 managed entity를 조회해서 반영하기

도메인 모델을 수정한 뒤 저장할 때 JPA Entity를 새로 만들어 save하면 기존 row 업데이트가 아니라 insert처럼 동작하거나 id 관리가 어색해질 수 있다.

그래서 update에서는 기존 Entity를 조회하고 domain 값을 반영했다.

```kotlin
override fun update(product: Product): Product {
    val entity = productJpaRepository.findByIdOrNull(product.id)
        ?.also { it.update(product) }
        ?: throw CoreException(ErrorType.NOT_FOUND, "Product not found.")

    return productJpaRepository.save(entity)
        .let(ProductMapper::toDomain)
}
```

처음에는 “이미 Product를 조회했는데 왜 update에서 다시 findById를 하지?”라는 의문이 있었다.

하지만 domain model과 JPA entity를 분리하면 application layer가 들고 있는 Product는 managed entity가 아니다. JPA dirty checking을 사용하려면 infrastructure에서 managed entity를 다시 조회하고 값을 반영해야 한다.

이 방식은 조회가 한 번 더 발생하는 단점이 있지만 JPA 영속성 컨텍스트와 도메인 모델 분리 원칙을 유지할 수 있다.

#### 4. 모든 조회를 Domain Model로 강제하지 않기

분리 구조를 적용한다고 해서 모든 조회가 반드시 Domain Model을 거쳐야 하는 것은 아니라고 판단했다.

상품 목록 조회는 정렬 페이징 조건이 중요했다. 특히 좋아요 수를 ProductStat으로 분리하면서 likes_desc 정렬은 ProductStat 기준으로 처리해야 했다.

그래서 ProductQueryRepository에서 QueryDSL projection으로 ProductSummary를 반환했다.

이 부분은 아직 고민이 남아 있다. ProductSummary가 domain 하위 dto에 있는 것이 맞는지 application read model 또는 infrastructure projection으로 옮기는 것이 더 나은지는 추후 개선 대상이다.

## 무엇이 잘못되었던 것 같나

이번 작업을 하면서 이전 구조에서 아쉬웠던 점은 크게 세 가지였다.

첫 번째는 service가 너무 많은 일을 하고 있었다는 점이다.

Repository를 호출하고 비즈니스 규칙을 검증하고 여러 도메인을 조합하는 흐름이 한 곳에 있으면 기능이 늘어날수록 service가 커진다. 그래서 이번에는 Facade Application Service Domain Service를 나누었다.

두 번째는 Entity 이름이 도메인과 DB 사이에서 어색하게 섞였다는 점이다.

처음에는 UserEntity인데 Table name은 member인 식으로 개념이 어긋나는 부분이 있었다. 지금은 domain은 User infrastructure는 MemberEntity로 정리했다.

세 번째는 분리 자체가 목적이 될 위험이 있었다는 점이다.

도메인과 DB Entity를 분리하면 파일 수와 변환 코드가 늘어난다. 모든 기능에서 무조건 이득이 생기는 것은 아니다. 단순 CRUD만 있는 작은 프로젝트라면 JPA Entity를 도메인 모델로 함께 사용하는 편이 더 단순할 수 있다.

이번 프로젝트에서는 상품 좋아요 주문 재고처럼 규칙이 늘어날 가능성이 있었기 때문에 분리하는 편이 더 적절하다고 판단했다.

## 회고 Retrospective

- Keep:
  - Domain Model에서 비즈니스 규칙을 표현한 점은 유지하고 싶다.
  - Repository Interface를 domain에 두고 구현체를 infrastructure에 둔 구조는 테스트 가능성과 의존성 방향 면에서 좋았다.
  - MemberEntity처럼 persistence model 이름을 명확히 한 점도 import와 책임 이해에 도움이 되었다.

- Problem:
  - Mapper 코드가 반복된다.
  - update 시 managed entity를 다시 조회해야 해서 흐름이 처음에는 직관적이지 않았다.
  - ProductSummary ProductCatalog 같은 DTO 성 객체가 domain 하위에 있어 순수 도메인과 read model 경계가 아직 애매하다.
  - Entity.update(domain)처럼 infrastructure entity가 domain model을 인자로 받는 부분은 완전히 깔끔한 분리는 아니다.

- Try:
  - 조회 전용 모델은 domain dto가 아니라 application read model 또는 infrastructure projection으로 이동하는 방향을 검토한다.
  - update 흐름에서 불필요한 재조회가 많은지 확인하고 성능 이슈가 있으면 command 기반 update query나 dirty checking 전략을 다시 고민한다.
  - Entity와 Domain 변환 규칙이 많아지면 mapper 테스트를 추가한다.
  - 단순 CRUD 도메인까지 무조건 분리하지 말고 비즈니스 규칙이 있는 도메인부터 분리한다.

---

## deep-dive

## 개념 원리

도메인 모델과 DB Entity를 분리한다는 것은 객체를 두 벌 만드는 것이 목적이 아니다.

핵심은 변경 이유를 나누는 것이다.

도메인 모델은 비즈니스 규칙을 표현한다.

예를 들어 Inventory는 quantity가 음수가 되면 안 된다. 이 규칙은 DB check constraint로도 막을 수 있지만 도메인 레벨에서도 막아야 한다. 그래야 주문 생성 로직을 테스트할 때 DB 없이도 재고 부족을 검증할 수 있다.

```kotlin
class Inventory(
    val id: Long = 0L,
    val productId: Long,
    quantity: Long,
) {
    var quantity: Long = quantity
        private set

    init {
        if (quantity < 0L) {
            throw CoreException(ErrorType.BAD_REQUEST, "Inventory quantity must not be negative.")
        }
    }

    fun deduct(quantity: Long) {
        if (quantity <= 0L) {
            throw CoreException(ErrorType.BAD_REQUEST, "Deduct quantity must be positive.")
        }
        if (this.quantity < quantity) {
            throw CoreException(ErrorType.CONFLICT, "Inventory quantity is insufficient.")
        }

        this.quantity -= quantity
    }
}
```

DB Entity는 저장 구조를 표현한다.

예를 들어 OrderEntity는 orders 테이블과 order_item 테이블의 관계를 표현한다.

```kotlin
@Entity
@Table(name = "orders")
class OrderEntity(
    @Column(name = "order_number", nullable = false)
    var orderNumber: String,

    @Column(name = "member_id", nullable = false)
    var memberId: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: OrderStatus,

    @Column(name = "total_amount", nullable = false)
    var totalAmount: Long,

    @Column(name = "ordered_at", nullable = false)
    var orderedAt: ZonedDateTime,
) : BaseEntity() {
    @OneToMany(mappedBy = "order", cascade = [CascadeType.ALL], orphanRemoval = true)
    @BatchSize(size = 50)
    val items: MutableList<OrderItemEntity> = mutableListOf()

    fun addItem(item: OrderItemEntity) {
        items.add(item)
        item.order = this
    }
}
```

Order 도메인은 주문이라는 비즈니스 결과를 표현한다.

```kotlin
class Order(
    val id: Long = 0L,
    val orderNumber: String,
    val memberId: Long,
    val status: OrderStatus,
    val items: List<OrderItem>,
    val totalAmount: Long,
    val orderedAt: ZonedDateTime,
) {
    init {
        if (items.isEmpty()) {
            throw CoreException(ErrorType.BAD_REQUEST, "Order items must not be empty.")
        }
        if (totalAmount != items.sumOf { it.totalAmount }) {
            throw CoreException(ErrorType.BAD_REQUEST, "Order total amount is invalid.")
        }
    }
}
```

두 객체가 비슷해 보여도 책임은 다르다.

OrderEntity는 JPA cascade batch fetch table mapping을 안다.

Order는 주문 항목이 비어 있으면 안 되고 totalAmount가 item 합계와 같아야 한다는 도메인 규칙을 안다.

## 본인 과제에 어떻게 작용했나

주문 생성에서는 Product Brand Inventory Order가 협력해야 했다.

Application Layer의 OrderFacade는 필요한 데이터를 조회하고 트랜잭션 경계를 잡는다.

Domain Service인 OrderPlacementService는 상품 존재 브랜드 존재 재고 존재 재고 차감 주문 스냅샷 생성을 처리한다.

```kotlin
class OrderPlacementService {
    fun place(
        memberId: Long,
        items: List<OrderPlacementItem>,
        products: List<Product>,
        brands: List<Brand>,
        inventories: List<Inventory>,
    ): OrderPlacementResult {
        val productById = products.associateBy { it.id }
        val brandById = brands.associateBy { it.id }
        val inventoryByProductId = inventories.associateBy { it.productId }

        val orderItems = items.map { item ->
            val product = productById[item.productId]
                ?: throw CoreException(ErrorType.NOT_FOUND, "Product not found.")
            val brand = brandById[product.brandId]
                ?: throw CoreException(ErrorType.NOT_FOUND, "Brand not found.")
            val inventory = inventoryByProductId[product.id]
                ?: throw CoreException(ErrorType.NOT_FOUND, "Inventory not found.")

            inventory.deduct(item.quantity)
            OrderItem.snapshot(
                productId = product.id,
                productName = product.name,
                brandName = brand.name,
                unitPrice = product.price,
                quantity = item.quantity,
            )
        }

        return OrderPlacementResult(
            order = Order.createCompleted(memberId = memberId, items = orderItems),
            inventories = inventories,
        )
    }
}
```

이 코드에서 OrderPlacementService는 JPA를 모른다.

ProductEntity InventoryEntity OrderEntity도 모른다.

오직 도메인 객체만 받아서 규칙을 수행한다.

이게 도메인 모델과 DB Entity를 분리했을 때 얻은 가장 큰 장점이었다.

## 언제 분리하지 않아도 될까

도메인 모델과 DB Entity 분리는 항상 정답은 아니다.

다음 조건이라면 JPA Entity를 도메인 모델로 같이 써도 괜찮을 수 있다.

- 단순 CRUD 위주다.
- 비즈니스 규칙이 거의 없다.
- 테이블 구조와 API 요구사항이 거의 같다.
- 테스트에서 DB 의존성이 큰 문제가 되지 않는다.
- 팀이 분리 구조에 익숙하지 않고 생산성이 더 중요하다.

반대로 다음 조건이라면 분리를 고려할 만하다.

- 도메인 규칙이 늘어나고 있다.
- 여러 aggregate나 domain이 협력한다.
- DB 구조와 비즈니스 모델이 다르게 변할 가능성이 있다.
- JPA annotation이나 연관관계가 도메인 코드를 오염시킨다.
- 단위 테스트에서 DB 없이 규칙을 검증하고 싶다.
- read query와 command model의 요구사항이 다르다.

상품 브랜드 좋아요 재고 주문이 서로 협력하고 주문 생성 시 재고 차감 같은 핵심 규칙이 있었기 때문에 분리하는 쪽이 더 적절했다.

---
