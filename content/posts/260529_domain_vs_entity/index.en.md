+++
title = 'Separating Domain Models from JPA Entities'
date = '2026-05-29T12:43:19+09:00'
description = "What I gained from separating domain models from database entities, and the trade-offs that came with it."
summary = "Why I separated domain models from JPA entities in a Kotlin Spring JPA project, and how I implemented the design."
categories = ["architecture", "ddd", "jpa"]
tags = ["domain-model", "jpa-entity", "kotlin", "spring", "repository", "mapper"]
series = []
series_order = 1

draft = false
+++

## TL;DR

I separated domain models from database entities to keep business rules in the domain and isolate JPA mappings and persistence concerns in the infrastructure layer.

Core models such as `User`, `Product`, and `Order` can now express domain rules without JPA annotations. Repository implementations use Mappers to convert between those models and database entities.

The separation also raised questions: where DTO-like objects should live, what Mappers should own, how to reload entities for updates, and where read query projections belong.

---

## Overview

- Goals:
  - Separate the domain rules and persistence mappings previously handled by a single JPA entity.
  - Let domain models express business rules and database entities handle table mappings and persistence.
  - Let the Application Layer coordinate domain objects while the Infrastructure Layer stores and retrieves data through JPA.
- Main design priorities:
  - Remove direct JPA dependencies from the Domain Layer.
  - Keep Repository interfaces in the Domain Layer and implementations in the Infrastructure Layer.
  - Use Mappers to convert between database entities and domain models.
  - Express domain rules through methods and constructor validation rather than entity annotations.

## Why separate them?

The original Member implementation had a service layer that called repositories directly and also handled business logic. That is quick to build for small features, but several problems emerge as the domain grows.

First, the JPA entity takes on too many responsibilities. It already uses annotations such as `Column`, `Entity`, `Table`, and `OneToMany` to describe table mappings. Adding business rules means the same object must understand both the database structure and the domain.

Second, testing becomes harder. When domain logic is built around JPA entities, even simple rule checks can make us think about the persistence context and JPA behavior. A plain Kotlin domain object lets us test rules through its constructor and methods without a repository.

Third, names and responsibilities become mixed. This project called the user domain `User`, but used a database table named `member`. Calling the JPA class `UserEntity` made imports and concepts feel inconsistent. I kept `User` in the domain and used database-oriented names such as `MemberEntity`, `MemberMapper`, and `MemberRepositoryImpl` in infrastructure.

## Technical decisions

| Design area | Choice | Rationale |
|-------------|--------|-----------|
| Domain models and database entities | Separate them | Separate domain rules from JPA mapping responsibilities |
| Repository placement | Interface in Domain, implementation in Infrastructure | Avoid coupling the application to a concrete JPA implementation |
| Conversion | Separate Mapper | Keep both conversion directions together instead of adding methods such as `toDomain` to entities |
| Entity names | `MemberEntity`, `ProductEntity`, `OrderEntity` | Make their role as table-mapped persistence models explicit |
| Domain names | `User`, `Product`, `Order` | Express the business concepts directly |
| Query optimization | Projections for some list queries | Converting every result to a domain object can hurt sorting and pagination performance |

## How I applied it

## 1. Separating User from MemberEntity

The domain model has no JPA annotations. `User` expresses the business rules for a member.

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

The database entity lives in infrastructure and maps to the `member` table.

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

Although `User` and `MemberEntity` hold the same data, they have different responsibilities. `User` represents the business concept of a member. `MemberEntity` is the persistence model used to store that information in the `member` table.

## 2. Moving conversion into a Mapper

Separate models need conversion code. I introduced a dedicated Mapper instead of putting `toDomain` inside the entity.

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

The goal was to reduce how much the entity needed to know about the domain.

Some dependencies remain. For example, `MemberEntity.update(user: User)` still accepts a domain object. During an update, I load a JPA managed entity and copy the domain values onto it.

A stricter separation could make `update` accept primitive values or a command instead. But that can add duplication as the number of fields grows. I chose a practical separation rather than complete isolation.

## 3. Separating Product from ProductEntity

`Product` owns product rules. A product name cannot be empty, its price cannot be negative, and deletion is expressed as a change to its state.

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

`ProductEntity` maps to the `product` table and contains the JPA annotations and database constraints.

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

This separation lets infrastructure handle the soft delete query policy while `Product` expresses the domain action of deleting a product.

There is a trade-off, though. `SQLRestriction` automatically excludes deleted data from ordinary queries, so the application layer doesn't need to check `isDeleted` every time. Features such as administrative auditing or restoration need a separate query path that can include deleted records.

## 4. Separating the Repository interface from its implementation

The Domain Layer contains only the Repository interface.

```kotlin
interface ProductRepository {
    fun findById(productId: Long): Product?

    fun findAllByIds(productIds: Collection<Long>): List<Product>

    fun save(product: Product): Product

    fun update(product: Product): Product
}
```

The Infrastructure Layer contains the implementation that uses the JPA repository.

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

The Application Service depends only on `ProductRepository`. Tests can supply a fake repository to check domain behavior, while production uses the JPA implementation.

## Troubleshooting

### Where the complexity appeared

There were moments when separating the models actually made the code more complicated. I spent time thinking about:

- Naming a `User` domain backed by a `member` table.
- The apparent duplication of fields between domain objects and entities.
- Where Mappers should live.
- Whether an update should reload the JPA entity.
- Whether list queries should always return domain models.
- Whether DTO-like objects such as `ProductSummary` belong in the domain.

### Why these questions arose

One source of confusion is that “Entity” has two meanings. In DDD, an Entity is a domain object with an identity. A JPA entity is a persistence object mapped to a database row. Because both are called entities, it is easy to assume they must be the same object.

For this project, I saw different reasons for them to change:

- A domain model changes when business rules change.
- A database entity changes when the table structure or JPA mapping changes.

Another source of complexity is the difference between queries and commands. For flows such as creating an order or updating a product, converting to a domain model makes sense because domain rules matter. For read queries where sorting, pagination, and projections matter most, that conversion can be unnecessary overhead.

The product list needed data from `Product`, `Brand`, and `ProductStat`, along with `likes_desc` sorting. Fetching each domain separately and merging the results in memory could break pagination accuracy. I used a QueryDSL projection for that query.

### What I changed

#### 1. Make responsibilities visible in names

I kept business names such as `User`, `Product`, and `Order` in the domain. Infrastructure uses `MemberEntity`, `ProductEntity`, and `OrderEntity` to make the persistence role explicit.

For `User`, the table name `member` informed the infrastructure name `Member`. This made the imports easier to understand:

- `domain.user.User`
- `infrastructure.member.MemberEntity`
- `infrastructure.member.MemberMapper`
- `infrastructure.member.MemberRepositoryImpl`

#### 2. Keep Mappers in Infrastructure

A Mapper needs to know about the database entity, so it belongs in infrastructure. Making the Domain Layer aware of JPA entities would weaken the separation.

The structure currently looks like this:

```text
domain/user/User
domain/user/UserRepository

infrastructure/member/MemberEntity
infrastructure/member/MemberMapper
infrastructure/member/MemberRepositoryImpl
```

#### 3. Load a managed entity before applying updates

Creating a new JPA entity from a modified domain object and calling `save` can lead to an insert instead of an update, or make ID handling awkward.

For updates, I load the existing entity and apply the domain values to it.

```kotlin
override fun update(product: Product): Product {
    val entity = productJpaRepository.findByIdOrNull(product.id)
        ?.also { it.update(product) }
        ?: throw CoreException(ErrorType.NOT_FOUND, "Product not found.")

    return productJpaRepository.save(entity)
        .let(ProductMapper::toDomain)
}
```

Initially, I wondered why `update` called `findById` when I had already loaded the `Product`.

With separate models, however, the `Product` held by the application layer is not a managed entity. To use JPA dirty checking, infrastructure needs to obtain the managed entity and apply the changes there.

This introduces another lookup, but preserves both the JPA persistence context behavior and the separation of the domain model.

#### 4. Don't force every query through a domain model

I decided that separating the models didn't mean every query had to return a domain object.

Sorting and pagination were central to the product list. Once like counts were moved into `ProductStat`, `likes_desc` also needed to sort using that data. `ProductQueryRepository` therefore returns `ProductSummary` through a QueryDSL projection.

The placement of `ProductSummary` is still an open question. It currently lives under a domain DTO package, but an application read model or infrastructure projection may be a better home.

## What I would question about the earlier design

Three issues stood out during this work.

First, services were doing too much. When repository calls, business validation, and coordination across domains all live together, the service grows with every feature. This time, I separated the Facade, Application Service, and Domain Service responsibilities.

Second, entity names mixed domain and database concepts awkwardly. A class named `UserEntity` mapped to a table named `member`. Now the domain uses `User` and infrastructure uses `MemberEntity`.

Third, separation itself could become the goal. Separate models mean more files and conversion code; they don't automatically improve every feature. A small CRUD project may be simpler if its JPA entities also serve as domain models.

In this project, product, like, order, and inventory rules were likely to grow, so the separation felt worthwhile.

## Retrospective

- Keep:
  - Express business rules in domain models.
  - Keep Repository interfaces in the domain and implementations in infrastructure; this helped testability and dependency direction.
  - Use clear persistence model names such as `MemberEntity` to make imports and responsibilities easier to follow.
- Problem:
  - Mapper code is repetitive.
  - Reloading a managed entity during updates made the flow initially unintuitive.
  - DTO-like objects such as `ProductSummary` and `ProductCatalog` still live under the domain, leaving the boundary between domain models and read models unclear.
  - Methods such as `Entity.update(domain)` mean the separation isn't completely clean.
- Try:
  - Consider moving query-only models into application read models or infrastructure projections.
  - Check for unnecessary update lookups, and revisit command-based update queries or the dirty checking strategy if performance becomes a problem.
  - Add Mapper tests if entity-to-domain conversion rules become more complex.
  - Start with domains that have business rules rather than separating every simple CRUD model by default.

---

## Deep dive

## The underlying idea

Creating two copies of an object isn't the point. The point is separating reasons for change.

A domain model expresses business rules. For example, `Inventory.quantity` must not be negative. A database check constraint can enforce that too, but the domain should enforce it as well. That allows order creation tests to verify insufficient inventory without a database.

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

A database entity expresses the storage structure. For example, `OrderEntity` describes the relationship between the `orders` and `order_item` tables.

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

The `Order` domain model expresses the business result of an order.

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

The objects look similar, but their responsibilities differ. `OrderEntity` knows about JPA cascade, batch fetching, and table mappings. `Order` knows that an order must contain items and that `totalAmount` must equal the sum of the item amounts.

## How this worked in my project

Creating an order required `Product`, `Brand`, `Inventory`, and `Order` to cooperate.

`OrderFacade` in the Application Layer retrieves the required data and establishes the transaction boundary. The Domain Service, `OrderPlacementService`, checks that products, brands, and inventory exist, deducts stock, and creates order snapshots.

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

`OrderPlacementService` knows nothing about JPA or `ProductEntity`, `InventoryEntity`, and `OrderEntity`. It accepts domain objects and applies the rules.

That was the biggest benefit I gained from the separation.

## When might separation be unnecessary?

Separating domain models from database entities isn't always the best choice. Using JPA entities as domain models may be reasonable when:

- The project mostly consists of simple CRUD.
- There are few business rules.
- The table structure closely matches the API requirements.
- Database dependencies aren't a significant problem in tests.
- The team is unfamiliar with separate models and productivity matters more.

Separation is worth considering when:

- Domain rules are growing.
- Multiple Aggregates or domains cooperate.
- Database structures and business models may change independently.
- JPA annotations or associations intrude on domain code.
- Unit tests need to verify rules without a database.
- Read queries and command models have different requirements.

Here, products, brands, likes, inventory, and orders worked together, with core rules such as deducting inventory during order creation. That made separation a better fit.

---
