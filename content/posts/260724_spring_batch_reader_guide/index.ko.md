+++
title = 'Spring Batch Reader는 어떻게 고르면 좋을까'
date = '2026-07-24T04:43:44+09:00'
description = "Spring Batch에서 어떤 Reader를 써야 할까에 대한 고민"
summary = "대용량 데이터를 처리할 때 Spring Batch Reader를 Cursor로 쓸지 Paging으로 쓸지 고민하며 정리한 선택 기준"
categories = ["spring", "batch"]
tags = ["spring-batch", "item-reader", "jdbc", "cursor", "paging", "kotlin"]
series = []
series_order = 1

draft = false
+++

## tldr

Spring Batch Reader를 고를 때 처음에는 데이터가 많으면 무조건 Paging Reader를 써야 한다고 생각하기 쉽다.

하지만 실제로는 데이터 크기보다 **어떤 쿼리를 반복 실행하게 되는지**가 더 중요했다. 단순히 테이블을 안정적인 key 순서로 읽는 작업이라면 Paging Reader가 잘 맞는다. 반대로 한 번의 비싼 집계 쿼리 결과를 순차적으로 소비해야 한다면 Cursor Reader가 더 자연스러울 수 있다.

최근 랭킹 배치를 만들면서 이 차이를 체감했다. `product_metric_daily`에서 30일치 데이터를 읽고 `GROUP BY product_id`로 집계한 뒤 주간, 월간 랭킹 MV를 만드는 작업이었다. 이 경우 Paging Reader를 쓰면 page마다 같은 기간 범위를 다시 scan하고 group by할 가능성이 있었다. 그래서 집계 쿼리는 한 번 열고 결과를 cursor로 읽는 `JdbcCursorItemReader`를 선택했다.

물론 Cursor Reader가 항상 더 좋은 것은 아니다. 커넥션을 오래 잡고 있고, DB driver의 fetch 동작과 timeout 설정도 신경 써야 한다. 결국 Reader 선택은 "대용량인가?"가 아니라 "이 작업의 병목이 어디에 있는가?"를 보고 결정해야 한다.

---

## 왜 Reader 선택이 어려웠나

Spring Batch를 처음 쓰면 Step 구조는 꽤 단순해 보인다.

```text
Reader -> Processor -> Writer
```

Reader가 데이터를 읽고, Processor가 가공하고, Writer가 저장한다.

문제는 Reader가 생각보다 많은 것을 결정한다는 점이다. Reader를 어떻게 고르느냐에 따라 DB 쿼리 방식, 메모리 사용량, 재시작 가능성, 커넥션 점유 시간, 처리 속도가 달라진다.

처음에는 이렇게 생각했다.

데이터가 많으면 Paging Reader를 쓰면 되는 것 아닌가?

페이지 단위로 끊어서 읽으면 메모리에 한 번에 많이 올리지 않을 수 있고, 뭔가 안정적으로 보인다. 실제로 많은 상황에서 맞는 판단이다. 하지만 모든 배치 쿼리가 단순한 `SELECT * FROM table ORDER BY id` 형태는 아니다.

최근에 구현한 랭킹 배치는 이런 쿼리를 사용했다.

```sql
SELECT
    product_id,
    SUM(view_count) AS view_count,
    SUM(like_count) AS like_count,
    SUM(sales_amount) AS sales_amount
FROM product_metric_daily
WHERE metric_date >= ?
  AND metric_date < ?
GROUP BY product_id
ORDER BY product_id;
```

30일치 daily metric을 읽어 상품별로 합산한 뒤, 그 결과를 score로 계산해서 월간 랭킹 MV에 저장하는 흐름이다.

여기서 중요한 점은 Reader가 단순히 row를 읽는 것이 아니라, DB가 먼저 기간 범위를 scan하고 `GROUP BY` 결과를 만들어야 한다는 것이다. 이때 Paging Reader로 page를 나누면, 페이지마다 이 집계 쿼리를 다시 수행하게 될 수 있다.

그래서 이 작업에서는 "몇 건씩 읽을 것인가"보다 "비싼 집계 쿼리를 몇 번 실행할 것인가"가 더 중요한 기준이었다.

## Spring Batch Reader를 보는 기준

Spring Batch에는 여러 Reader가 있다. DB를 읽는 경우만 봐도 `JdbcCursorItemReader`, `JdbcPagingItemReader`, `JpaPagingItemReader`, `RepositoryItemReader` 같은 선택지가 있다.

공식 문서에서도 `JdbcCursorItemReader`는 cursor 기반으로 JDBC `ResultSet`을 순차적으로 읽고, `JdbcPagingItemReader`는 `PagingQueryProvider`를 통해 page 단위 query를 만들어 데이터를 읽는 방식으로 설명한다.

- [Spring Batch Reference - Database Readers](https://docs.spring.io/spring-batch/reference/readers-and-writers/database.html)

여기서 중요한 것은 이름보다 동작 방식이다.

나는 Reader를 고를 때 아래 질문을 먼저 보는 편이 좋다고 느꼈다.

1. source query가 단순 조회인가, 집계 쿼리인가?
2. 안정적인 정렬 key가 있는가?
3. 같은 쿼리를 여러 번 실행해도 비용이 괜찮은가?
4. 배치 실행 중 DB connection을 오래 잡아도 되는가?
5. 실패 후 재시작 지점 관리가 얼마나 중요한가?
6. JPA 영속성 컨텍스트가 필요한가, JDBC row mapping이면 충분한가?

이 질문에 따라 Reader 선택이 달라진다.

---

## Cursor Reader

Cursor Reader는 쿼리를 열고 결과를 cursor로 하나씩 읽는 방식이다.

JDBC 기준으로는 `JdbcCursorItemReader`를 사용할 수 있다.

```kotlin
@Bean
@StepScope
fun rankingAggregateReader(
    dataSource: DataSource,
    @Value("#{jobParameters['baseDate']}") baseDate: String,
): JdbcCursorItemReader<ProductMetricAggregate> {
    return JdbcCursorItemReaderBuilder<ProductMetricAggregate>()
        .name("rankingAggregateReader")
        .dataSource(dataSource)
        .sql(
            """
            SELECT
                product_id,
                SUM(view_count) AS view_count,
                SUM(like_count) AS like_count,
                SUM(sales_amount) AS sales_amount
            FROM product_metric_daily
            WHERE metric_date >= ?
              AND metric_date < ?
            GROUP BY product_id
            ORDER BY product_id
            """.trimIndent(),
        )
        .preparedStatementSetter { ps ->
            ps.setDate(1, Date.valueOf(sourceStart(baseDate)))
            ps.setDate(2, Date.valueOf(sourceEnd(baseDate)))
        }
        .rowMapper { rs, _ ->
            ProductMetricAggregate(
                productId = rs.getLong("product_id"),
                viewCount = rs.getLong("view_count"),
                likeCount = rs.getLong("like_count"),
                salesAmount = rs.getLong("sales_amount"),
            )
        }
        .fetchSize(1000)
        .build()
}
```

이 방식의 장점은 쿼리를 한 번 실행한다는 점이다.

특히 위처럼 `GROUP BY`가 포함된 집계 쿼리에서는 이 차이가 중요하다. DB가 기간 범위를 읽고 상품별 집계 결과를 만든 뒤, 애플리케이션은 그 결과를 순차적으로 소비한다.

여기서 `fetchSize`는 한 번에 가져올 row 수에 대한 힌트다. chunk size와 같은 개념은 아니다.

```text
fetchSize: JDBC driver가 DB에서 가져오는 묶음 크기
chunkSize: Spring Batch가 transaction 단위로 처리하고 commit하는 item 수
```

둘은 목적이 다르다. `fetchSize`는 DB 통신과 ResultSet 소비 방식에 가깝고, `chunkSize`는 batch transaction 경계에 가깝다.

Cursor Reader는 이런 상황에 잘 맞는다.

- 한 번의 쿼리 결과를 순차적으로 처리하고 싶다.
- source query가 비싼 집계 쿼리다.
- page마다 같은 집계를 반복하고 싶지 않다.
- 처리 결과를 JVM에 모두 올리지 않고 stream처럼 소비하고 싶다.
- row mapper 수준의 단순 mapping이면 충분하다.

대신 비용도 있다.

Cursor가 열려 있는 동안 DB connection을 유지한다. 배치가 오래 걸리면 connection을 오래 점유한다는 뜻이다. DB나 네트워크 timeout, connection pool 설정, JDBC driver의 fetch 동작도 확인해야 한다.

또한 실패 후 재시작을 생각하면 단순하지 않을 수 있다. Spring Batch가 상태를 저장하더라도, cursor 기반으로 읽던 쿼리의 중간 지점부터 정확히 이어가는 구조는 query와 ordering이 안정적이어야 한다. 긴 작업이라면 "재시작했을 때 어디서부터 다시 읽을 것인가"를 별도로 검토해야 한다.

## Paging Reader

Paging Reader는 데이터를 page 단위로 나누어 읽는다.

JDBC 기준으로는 `JdbcPagingItemReader`를 사용할 수 있다.

```kotlin
@Bean
@StepScope
fun orderPagingReader(
    dataSource: DataSource,
): JdbcPagingItemReader<OrderRow> {
    val sortKeys = mapOf("order_id" to Order.ASCENDING)

    return JdbcPagingItemReaderBuilder<OrderRow>()
        .name("orderPagingReader")
        .dataSource(dataSource)
        .selectClause("SELECT order_id, user_id, total_amount, status")
        .fromClause("FROM orders")
        .whereClause("WHERE status = :status")
        .parameterValues(mapOf("status" to "READY"))
        .sortKeys(sortKeys)
        .pageSize(1000)
        .rowMapper { rs, _ ->
            OrderRow(
                orderId = rs.getLong("order_id"),
                userId = rs.getLong("user_id"),
                totalAmount = rs.getLong("total_amount"),
                status = rs.getString("status"),
            )
        }
        .build()
}
```

Paging Reader는 page query를 반복해서 실행한다. 그래서 stable sort key가 중요하다. `order_id`처럼 유일하고 증가하는 key가 있으면 page 단위로 읽기 좋다.

이 방식은 이런 상황에 잘 맞는다.

- source table을 안정적인 key 순서로 읽을 수 있다.
- query가 비교적 단순하다.
- page query를 여러 번 실행해도 비용이 감당 가능하다.
- DB connection을 한 번에 오래 잡고 싶지 않다.
- 실패 후 재시작과 page 단위 처리가 중요하다.

반대로 조심해야 할 상황도 있다.

가장 조심해야 하는 것은 page마다 비싼 쿼리를 반복하는 경우다.

예를 들어 아래처럼 집계 쿼리를 page로 나누어 읽는다고 생각해보자.

```sql
SELECT
    product_id,
    SUM(view_count) AS view_count,
    SUM(like_count) AS like_count,
    SUM(sales_amount) AS sales_amount
FROM product_metric_daily
WHERE metric_date >= :startDate
  AND metric_date < :endDate
GROUP BY product_id
ORDER BY product_id
LIMIT 1000 OFFSET 0;
```

다음 page는 offset만 바뀐다.

```sql
...
ORDER BY product_id
LIMIT 1000 OFFSET 1000;
```

겉으로는 1000개씩 끊어 읽는 것처럼 보인다. 하지만 DB 입장에서는 매 page마다 기간 범위를 다시 읽고, group by 결과를 만들고, offset만큼 건너뛰어야 할 수 있다.

물론 DB optimizer가 어떤 실행 계획을 고르는지에 따라 실제 비용은 달라진다. 하지만 "Paging Reader니까 안전하다"라고 단정할 수는 없다. query shape이 더 중요하다.

## Repository Reader와 JPA Reader

`RepositoryItemReader`나 `JpaPagingItemReader`도 자주 보인다.

이 Reader들은 domain repository나 JPA query를 자연스럽게 재사용할 수 있다는 장점이 있다. 이미 Spring Data repository가 있고, 단순한 조건으로 entity를 읽어 처리하는 작업이라면 빠르게 구현할 수 있다.

하지만 배치에서는 JPA가 항상 편한 선택은 아니었다.

JPA entity를 읽으면 영속성 컨텍스트를 의식해야 한다. 많은 row를 처리할 때 clear 주기나 dirty checking 비용도 신경 써야 한다. 배치가 단순히 데이터를 읽고 다른 테이블에 쓰는 작업이라면, 굳이 entity lifecycle을 끌고 들어오지 않는 편이 더 명확할 때가 많다.

특히 집계 결과처럼 애초에 entity가 아닌 데이터를 읽는다면 JDBC row mapping이 더 잘 맞는다.

```text
product_metric_daily row들
        ↓ group by
ProductMetricAggregate
        ↓ score 계산
ProductRankingScore
        ↓ batch upsert
mv_product_rank_weekly / mv_product_rank_monthly
```

이 흐름에서는 JPA entity를 읽는 것보다 DTO 성 row를 읽는 편이 자연스럽다. 그래서 ranking batch에서는 JDBC 기반 Reader와 Writer를 사용했다.

---

## 내가 랭킹 배치에서 Cursor Reader를 고른 이유

이번 랭킹 배치의 요구사항은 이랬다.

1. `product_metric_daily`에 일별 metric을 저장한다.
2. 주간 랭킹은 직전 주 7일치를 합산한다.
3. 월간 랭킹은 직전 달 전체를 합산한다.
4. 상품별 집계 결과에 현재 가중치를 적용해 score를 계산한다.
5. 결과를 MV 테이블에 upsert한다.
6. Job이 성공하면 publication generation을 발행한다.

처음에는 Paging Reader도 고려할 수 있었다.

대용량 데이터를 처리하니까 page로 끊어 읽는 방식이 더 안전해 보였기 때문이다. 하지만 쿼리 모양을 보면 생각이 달라졌다.

이 작업의 핵심 비용은 `product_metric_daily`에서 기간 범위를 읽고 `GROUP BY product_id`를 수행하는 부분이다. 상품이 100만 개이고 30일치 데이터가 있다면 daily metric은 3000만 row가 된다.

여기서 page마다 같은 집계 쿼리를 반복하는 구조는 피하고 싶었다.

그래서 선택한 구조는 이렇다.

```text
JdbcCursorItemReader
  - 기간 range 집계 쿼리 1회 실행
  - ProductMetricAggregate를 fetchSize 단위로 순차 소비

ItemProcessor
  - view, like, sales metric에 weight 적용
  - sales는 ln(1 + salesAmount)로 완화

JdbcBatchItemWriter
  - mv_product_rank_weekly 또는 mv_product_rank_monthly에 upsert
```

현재 구조는 완전한 정답이라기보다는 이번 쿼리 형태에 맞춘 선택이다.

만약 source가 단순한 `orders` 테이블이고 `order_id` 기준으로 읽어 처리하는 작업이었다면 Paging Reader를 선택했을 가능성이 높다. 반대로 지금처럼 "큰 기간 범위를 한 번 집계한 결과"를 소비하는 작업에서는 Cursor Reader가 더 낫다고 판단했다.

## 선택 기준을 표로 정리해보면

Reader 선택은 아래처럼 정리할 수 있다.

| 상황 | 더 먼저 검토할 Reader | 이유 |
| --- | --- | --- |
| 단순 table row를 id 순서로 처리 | `JdbcPagingItemReader` | stable sort key가 있고 page query 비용이 낮다 |
| 비싼 집계 쿼리 결과를 순차 처리 | `JdbcCursorItemReader` | 집계 쿼리 반복 실행을 피할 수 있다 |
| Spring Data repository를 그대로 재사용 | `RepositoryItemReader` | 구현은 빠르지만 query와 paging 비용을 확인해야 한다 |
| JPA entity lifecycle이 필요한 처리 | `JpaPagingItemReader` | entity 기반 처리가 필요할 때 적합하다 |
| entity가 아닌 projection/aggregate 처리 | JDBC Reader | row mapping이 단순하고 영속성 컨텍스트 비용을 피할 수 있다 |

여기서 중요한 점은 "대용량이면 A" 같은 규칙으로 외우지 않는 것이다.

대용량이어도 단순 key scan이면 Paging이 좋을 수 있다. 반대로 row 수가 아주 크지 않아도 query가 비싼 집계라면 Cursor가 더 단순할 수 있다.

## Cursor Reader를 쓸 때 확인할 것

Cursor Reader를 선택했다면 최소한 아래는 확인해야 한다.

## 1. fetchSize가 실제로 동작하는가

`fetchSize`는 JDBC driver에 주는 hint다. 모든 driver가 같은 방식으로 처리하지 않는다.

MySQL을 사용한다면 Connector/J 설정에 따라 fetch 동작이 달라질 수 있다. 서버 사이드 cursor를 사용할 것인지, streaming result를 사용할 것인지에 따라 필요한 옵션이 다를 수 있다.

그래서 단순히 `.fetchSize(1000)`을 넣었다고 끝내기보다, 실제 실행 시 메모리가 한 번에 튀지 않는지 확인해야 한다.

## 2. connection을 오래 잡아도 되는가

Cursor Reader는 ResultSet을 열어두고 읽는다. 그동안 connection도 유지된다.

배치 전용 datasource나 pool을 분리하지 않으면 API 트래픽과 connection을 두고 경쟁할 수 있다. 긴 배치라면 query timeout, socket timeout, pool size, DB idle timeout도 같이 봐야 한다.

## 3. 정렬이 안정적인가

cursor로 읽더라도 결과 순서는 안정적이어야 한다.

이번 랭킹 배치에서는 `GROUP BY product_id ORDER BY product_id`를 사용했다. 같은 source range라면 product_id 순서로 동일하게 읽힌다.

물론 최종 랭킹 순위는 score 기준이다. 하지만 Reader 단계에서는 집계 결과를 순차 처리하면 되고, MV 조회 단계에서 `ranking_score DESC, product_id ASC`로 Top 100을 읽는다.

## 4. 실패 후 재실행이 안전한가

Cursor Reader를 쓰더라도 Job이 실패할 수 있다.

이번 배치에서는 같은 `baseDate`로 재실행하면 기존 MV row를 삭제하고 다시 upsert하도록 했다. 즉 "중간 지점부터 이어서 처리"보다 "해당 baseDate 결과를 다시 만드는 것"을 선택했다.

이 방식은 데이터가 커질수록 비용이 있지만, 결과 정합성을 설명하기 쉽다. 나중에 처리 시간이 너무 길어지면 partitioning이나 keyset 기반 분할 처리를 검토해야 한다.

---

## Paging Reader를 쓸 때 확인할 것

Paging Reader를 선택한다면 다른 질문이 필요하다.

## 1. sort key가 유일하고 안정적인가

Paging Reader는 page를 나눠 읽기 때문에 정렬 기준이 중요하다.

정렬 기준이 중복되거나 처리 중 데이터가 계속 바뀌면 page 사이에서 누락이나 중복이 생길 수 있다. 가능하면 `id`처럼 유일하고 변하지 않는 key를 sort key로 둔다.

## 2. page query가 반복되어도 싼가

Paging Reader는 page마다 query를 실행한다.

단순 조건 조회라면 괜찮다. 하지만 join, group by, order by 비용이 큰 query라면 page 반복 비용을 반드시 봐야 한다.

이때는 `EXPLAIN`으로 첫 page만 보지 말고, 뒤 page 조건도 확인하는 편이 좋다.

## 3. offset paging인가 keyset paging인가

많은 paging 구현은 offset을 사용한다.

offset은 뒤로 갈수록 앞의 row를 건너뛰는 비용이 커질 수 있다. 대용량 테이블에서는 `id > lastSeenId` 같은 keyset paging이 더 안정적일 때가 많다.

Spring Batch 기본 Reader만으로 해결하려 하기보다, 필요한 경우 직접 Reader를 만들거나 partitioner와 범위 조건을 조합하는 편이 더 명확할 수 있다.

## 4. pageSize와 chunkSize를 혼동하지 않았는가

Paging Reader의 `pageSize`와 Step의 `chunkSize`도 같은 개념이 아니다.

```text
pageSize: Reader가 한 번의 page query로 가져오는 item 수
chunkSize: 몇 개 item마다 transaction commit할 것인지
```

둘을 반드시 같게 둘 필요는 없다. 다만 너무 다르게 잡으면 예상과 다른 메모리 사용이나 query 횟수가 나올 수 있으니 의도를 가지고 정해야 한다.

## 내 기준으로 정리해보기

지금은 Spring Batch Reader를 고를 때 아래 순서로 생각하려 한다.

먼저 source query를 본다.

단순 row scan인지, join이 많은지, group by가 있는지, 정렬 비용이 큰지 본다. 이 단계에서 이미 Cursor가 나을지 Paging이 나을지 방향이 많이 갈린다.

그 다음 재시작 전략을 본다.

중간부터 이어서 처리해야 하는지, 아니면 같은 기준일의 결과를 지우고 다시 만들어도 되는지 판단한다. 재실행 비용보다 정합성이 더 중요하면 clean rebuild가 더 단순할 수 있다.

마지막으로 운영 비용을 본다.

Cursor는 connection 점유 시간이 비용이고, Paging은 반복 query가 비용이다. 둘 중 어떤 비용이 현재 시스템에서 더 감당 가능한지 봐야 한다.

이번 랭킹 배치에서는 반복 query 비용이 더 크다고 판단했다. 그래서 Cursor Reader를 선택했다.

하지만 이 기준이 모든 배치에 그대로 적용되지는 않는다. 정산 데이터처럼 id 기준으로 안정적으로 끊어 읽는 작업이라면 Paging Reader가 더 나은 선택일 수 있다. 중요한 것은 Reader 이름이 아니라, Reader가 DB에 어떤 일을 시키는지 이해하는 것이다.

## 마무리

Spring Batch Reader 선택은 생각보다 설계 결정에 가깝다.

처음에는 "대용량이면 Paging"이라는 단순한 기준으로 접근했지만, 실제로는 query shape이 더 중요했다. 특히 `GROUP BY`나 `ORDER BY`가 포함된 비싼 쿼리에서는 page 단위로 끊는 것이 오히려 같은 일을 반복시키는 구조가 될 수 있다.

Cursor Reader는 집계 결과를 한 번 열고 순차적으로 처리하기 좋다. 대신 connection을 오래 잡고 driver 설정을 신경 써야 한다.

Paging Reader는 안정적인 key 기반 단순 조회에 좋다. 대신 page query가 반복되고 offset 비용이 생길 수 있다.

현재 구조는 완전한 정답이라기보다는, `product_metric_daily`를 기간별로 집계해 랭킹 MV를 만드는 요구사항에 맞춘 선택이다. 나중에 데이터가 더 커지고 처리 시간이 길어지면 partitioning, keyset paging, pre-aggregation 같은 다른 선택지를 다시 검토해야 한다.

결국 Reader를 고를 때 중요한 질문은 하나인 것 같다.

이 Reader를 쓰면 DB는 어떤 일을 몇 번 하게 되는가?
