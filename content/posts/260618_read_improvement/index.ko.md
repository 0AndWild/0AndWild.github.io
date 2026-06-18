+++
title = '정렬 옵션에 따른 조회 성능 저하 어떻게 해결 할 수 있을까?'
date = '2026-06-18T17:19:15+09:00'
description = "좋아요 정렬 옵션에 따른 상품 목록 조회 성능 저하를 개선해본다."
summary = ""
categories = ["DB", "Read performance"]
tags = []
series = []
series_order = 1

draft = false
+++

## 목표

상품목록 조회 성능의 개선을 위해 실행계획을 분석하며 쿼리 방식, 인덱스, 구조 변화 를 차례대로 진행해본다.             
10만개의 상품과 495만개의 좋아요 더미 데이터를 기반으로 조회 성능 비교를 진행해본다.

## 문제 정의

우선 가장 성능에 문제가 될 부분은 상품 목록 조회 시 좋아요 기반 정렬 옵션이 존재 할 때이다.
현재 상품(Product) 과 좋아요(Likes) 테이블 이 존재하고 유저는 상품 당 한 번의 좋아요 를 누를 수 있으면 좋아요가 생성 될 때마다 1 개의 row 가 추가되고 다시 좋아요 취소를 누르면 해당 row 는 hard delete 된다.

유저 수 가 적고 상품 데이터가 적으면 사실 잘못된 쿼리 방식을 사용 하거나 데이터를 풀 스캔 하더라도 성능 이슈가 발생하지 않는다.
하지만 만약 상품이 수백 수천만 건 존재하고 유저가 수십 수백만 정도의 규모라면 Likes 테이블의 데이터는 순식간에 수백 수천만 건 +a 으로 늘어날 것이다.
이떄 상품 조회 시 마다 좋아요 기반 정렬을 위해 좋아요 테이블의 집계 쿼리를 날리게 된다면 DB가 터지고 말 것이다.

이런 상황을 가정하여 쿼리 개선, 인덱스 추가, 캐시 추가 를 순차적으로 진행해보면서 성능이 어느정도 개선이 되는지 직접 확인 해보고자 한다.
현재 Likes 테이블은 member_id, product_id 를 가지고 있으며 이 두 column 은 Unique key 로 설정이 되어 중복을 방지하고 있다.

---

## 집계 쿼리를 직접 실행해보고 결과를 확인해보자.

여기서 EXPLAIN 과 EXPLAIN ANALYZE 의 차이는 다음과 같다.

- `EXPLAIN` -> 쿼리를 실행하지 않고 실행 과정을 예측 
- `EXPLAIN ANALYZE` -> 쿼리를 실행하고 실행 과정을 분석

```sql

EXPLAIN ANALYZE  
SELECT p.id, p.name, p.price, p.image_url, count(p.id) as like_cnt  
FROM product p  
LEFT JOIN likes ls on p.id = ls.product_id  
where p.is_deleted = FALSE  
GROUP BY p.id, p.name, p.price, p.image_url  
ORDER BY like_cnt DESC;

```

```text

-> Sort: like_cnt DESC  (actual time=11413..11416 rows=100000 loops=1)  
    -> Table scan on <temporary>  (actual time=11377..11389 rows=100000 loops=1)  
        -> Aggregate using temporary table  (actual time=11377..11377 rows=100000 loops=1)  
            -> Left hash join (ls.product_id = p.id)  (cost=21.8e+9 rows=217e+9) (actual time=603..997 rows=4.95e+6 loops=1)  
                -> Filter: (p.is_deleted = false)  (cost=9258 rows=44167) (actual time=0.0618..20.9 rows=100000 loops=1)  
                    -> Table scan on p  (cost=9258 rows=88334) (actual time=0.0587..17.8 rows=100000 loops=1)  
                -> Hash  
                    -> Covering index scan on ls using uk_likes_member_id_product_id  (cost=244 rows=4.92e+6) (actual time=0.457..347 rows=4.95e+6 loops=1)

```

{{< figure src="img1.png" class="mx-auto" width="300" >}}

먼저 첫번째 쿼리 실행 시간은 대략 11초 정도 걸렸다. 요청당 11초+a 면 이미 서버는 저세상이다.

`왜 잘못된 쿼리인가 ?`

쿼리 실행결과 분석을 살펴보면 잘못된 점이 명확하다.
495만건의 likes 테이블을 집계를 하지 않고 10만건의 product 테이블에 먼저 join 을 걸어 product + likes 가 합쳐진 495 만 건의 데이터가 생성되고
이를 기반으로 집계를 하는 부분에서 10초 가량이 소모되었다. 

`그럼 쿼리를 어떻게 개선할 수 있을까?`

### JOIN 하기 전 집계를 수행한다.

먼저 product 테이블에 join 을 하기전에 likes 집계를 먼저 하면 현재 상품은 10만건 이기 때문에 10만 이하로 join 할 데이터를 줄일 수 있다.
또한 group by 대상을 product_id 하나로만 두면 되기 때문에 집계의 성능도 올라간다.

```sql

EXPLAIN ANALYZE
SELECT p.id, p.name, p.price, p.image_url, ls.like_cnt
FROM product p
LEFT JOIN (SELECT product_id, count(product_id) as like_cnt FROM likes GROUP BY product_id) ls on ls.product_id = p.id
WHERE p.is_deleted = FALSE
ORDER BY ls.like_cnt DESC;

```

```text

-> Sort: ls.like_cnt DESC  (actual time=1060..1064 rows=100000 loops=1)
    -> Stream results  (cost=625857 rows=0) (actual time=940..1028 rows=100000 loops=1)
        -> Nested loop left join  (cost=625857 rows=0) (actual time=940..1016 rows=100000 loops=1)
            -> Filter: (p.is_deleted = false)  (cost=10532 rows=44167) (actual time=0.0611..24.6 rows=100000 loops=1)
                -> Table scan on p  (cost=10532 rows=88334) (actual time=0.0574..20.9 rows=100000 loops=1)
            -> Index lookup on ls using <auto_key0> (product_id=p.id)  (cost=0.25..13.9 rows=55.7) (actual time=0.00969..0.00982 rows=0.99 loops=100000)
                -> Materialize  (cost=0..0 rows=0) (actual time=939..939 rows=99000 loops=1)
                    -> Table scan on <temporary>  (actual time=903..909 rows=99000 loops=1)
                        -> Aggregate using temporary table  (actual time=903..903 rows=99000 loops=1)
                            -> Covering index scan on likes using uk_likes_member_id_product_id  (cost=521764 rows=4.92e+6) (actual time=0.275..332 rows=4.95e+6 loops=1)

```

실행 결과를 확인해보면 의도한 대로 **likes를 먼저 집계** → **product와 join** → **정렬** 이 진행되었다.

우선 최종 반환 시간은 첫번째 저세상 쿼리와 비교 하였을 때 

**11.416/s** -> **1.064/s** 로 실행시간 약 **91%** 감소. 

---

### 좋아요 테이블에 Index 를 추가해 보자

하지만 1초 짜리 쿼리도 빠른것은 아니기에 조금 더 살펴 보자.
지금 쿼리에서 가장 실행시간을 많이 잡아먹는 부분은 group by 집계를 통해 99000 row 를 반환 한는 부분이다.

현재 likes 테이블의 인덱스는 Unique key 로 잡혀 있는 member_id, product_id 이기 때문에 GROUP BY product_id 를 할 경우 집계에 유리한 방식으로 인덱스를 탈 수 없다.
그 이유는 현재 UK 의 인덱스 정렬 순서가 member_id, product_id 로 아래와 같이 정렬이 되어 있기 때문이다. 즉 같은 product_id 인 row 들이 연속되지 않는다.
따라서 위 실행결과에서 보여지듯이 임시 테이블이나 해시 집계 같은 방식으로 다시 모으는 것을 볼 수 있다. (-> Covering index scan on likes using uk_likes_member_id_product_id ... -> Aggregate using temporary table)

```text
(member_id, product_id)
(1, 10)
(1, 20)
(1, 30)
(2, 10)
(2, 20)
(3, 10)
```

그럼 UK 의 순서를 뒤집어 product_id, membe_id 로 재생성 하여 인덱스를 잘 탈 수 있게 하는 방법도 있지만 현재 내가 좋아요를 누른 상품 목록 조회에서 member_id 를 기준으로 인덱스를 태우는 곳이 있기 때문에
product_id 인덱스를 새로 만들었다.

```sql
create index likes_product_id_index
    on likes (product_id);
```

`다시 동일한 쿼리를 실행시켜보자`

```text
-> Sort: ls.like_cnt DESC  (actual time=555..559 rows=100000 loops=1)
    -> Stream results  (cost=439e+6 rows=4.39e+9) (actual time=456..530 rows=100000 loops=1)
        -> Nested loop left join  (cost=439e+6 rows=4.39e+9) (actual time=456..518 rows=100000 loops=1)
            -> Filter: (p.is_deleted = false)  (cost=9259 rows=44167) (actual time=0.0941..20.5 rows=100000 loops=1)
                -> Table scan on p  (cost=9259 rows=88334) (actual time=0.0923..16.9 rows=100000 loops=1)
            -> Index lookup on ls using <auto_key0> (product_id=p.id)  (cost=1.02e+6..1.02e+6 rows=55.7) (actual time=0.00483..0.0049 rows=0.99 loops=100000)
                -> Materialize  (cost=1.02e+6..1.02e+6 rows=99338) (actual time=456..456 rows=99000 loops=1)
                    -> Group aggregate: count(likes.product_id)  (cost=1.01e+6 rows=99338) (actual time=0.349..427 rows=99000 loops=1)
                        -> Covering index scan on likes using likes_product_id_index  (cost=521749 rows=4.92e+6) (actual time=0.338..319 rows=4.95e+6 loops=1)
```

최종 쿼리 실행 속도는 559ms 로 인덱스를 추가한 후

**1.064/s** -> **559/ms** 로 실행 시간 약 **47.5%** 감소.

바뀐 부분은 이렇다

- (likes_product_id_index 인덱스 생성 전)
Aggregate using temporary table
  -> Covering index scan on likes using uk_likes_member_id_product_id

- (likes_product_id_index 인덱스 생성 후)
Group aggregate: count(likes.product_id)
  -> Covering index scan on likes using likes_product_id_index

이전에는 product_id 가 흩어져 있어서 MySQL이 읽은 row 임시 테이블에 모아가며 집계를 해야 했지만 새로 만든 인덱스는 같은 product_id 가 연속되어 있다.
따라서 이전처럼 임시 테이블에 계속 쌓고 찾는 방식이 아니라, 정렬된 순서대로 지나가며 그룹을 완성 할 수 있게 된 것이다.

```text
product_id
10
10
10
20
20
30
```

---

## 여기서 더 개선 할 수 있는 방법이 없을까?

현재 쿼리는 실시간 집계 방식으로는 꽤 좋아진 상태이다. 여기서 더 조회 성능을 높이기 위해서는 조회시 마다 집계를 하지않고 `MV(=Materialized View)` 테이블을 두고 조회시 이미 계산된 좋아요의 수 만 가져오는 것이다.
기존 좋아요 정렬 기능 설계 당시 조회 성능을 고려해 product_stat 이라는 MV 테이블을 만들어 두었고 이를 이용해 테스트 해보겠다.

다만 이렇게 MV 를 사용할 경우 생각해봐야 할 것은 집계 방식에 비해서는 정확도와 실시간성이 떨어질 수 있기에 조회 성능과의 트레이드 오프를 고려해야 한다.

### MV 사용 장단점

장점
- 이미 계산된 데이터를 읽기만 하면 되기 때문에 매번 집계가 필요없음
- 조회 성능이 likes 전체 크기에 직접 비례하지 않음
- 트래픽이 많을 때 DB 부하가 안정적임

단점
- 정합성 문제 (likes 에 insert/delete 가 발생했을 때 product_stat.like_cnt 도 함께 갱신되어야 함)
- 운영 중 정합성이 깨질 수 있으므로 주기적으로 원본 likes 기준으로 재계산하는 배치나 검증 쿼리를 두는 것이 필요

### product_stat 테이블을 이용한 조회 테스트

```sql
EXPLAIN ANALYZE
SELECT
    p.id,
    p.name,
    p.image_url,
    ps.like_count
FROM product_stat ps
JOIN product p ON p.id = ps.product_id
WHERE p.is_deleted = FALSE
ORDER BY ps.like_count DESC, ps.product_id DESC
```

```text
-> Sort: ps.like_count DESC, ps.product_id DESC  (actual time=159..162 rows=100000 loops=1)
    -> Stream results  (cost=24717 rows=44167) (actual time=0.0745..127 rows=100000 loops=1)
        -> Nested loop inner join  (cost=24717 rows=44167) (actual time=0.0716..111 rows=100000 loops=1)
            -> Filter: (p.is_deleted = false)  (cost=9258 rows=44167) (actual time=0.0496..21.6 rows=100000 loops=1)
                -> Table scan on p  (cost=9258 rows=88334) (actual time=0.0478..17.1 rows=100000 loops=1)
            -> Single-row index lookup on ps using UK6mdv3ubr8r663491df2j2du63 (product_id=p.id)  (cost=0.25 rows=1) (actual time=775e-6..793e-6 rows=1 loops=100000)
```

이렇게 조회용 MV 테이블을 두고 가볍게 join 을 하여 조회를 하였을 경우 조회 성능의 이점은 크게 높일 수 있는 것을 확인할 수 있다.
기존 조회 시점 집계 방식은 매 요청마다 `likes` 약 495만 건을 읽고 `product_id` 기준으로 집계한 뒤 `product`와 조인했다. 반면 `product_stat` 방식은 이미 집계된 `like_count` 값을 조회하므로, 실행 계획에서 `likes` 테이블 접근 자체가 사라진다.

조회 시점 마다 집계 방식: **559/ms** -> MV 테이블 방식 조회: **162/ms** 로 실행 시간은 약 **71%** 감소

다만 현재 실행 계획에서는 `product_stat`을 먼저 읽는 것이 아니라, MySQL 옵티마이저가 `product`를 먼저 전체 스캔한 뒤 `product_stat`을 `product_id` 유니크 키로 10만 번 lookup 하는 방식을 선택했다.
현재 데이터 규모에서는 이 방식도 약 162ms로 충분히 빠르지만, 상품 수가 수백만 건 이상으로 증가하면 product 전체 스캔과 10만 회 이상의 반복 lookup이 병목이 될 수 있다.
따라서 전체를 반환하는 것이 아닌 페이지네이션을 이용하여 필요한 개수만큼만 조회를 하는 방식을 사용한다면 좀 더 성능을 개선 할 수 있다.

```sql
EXPLAIN ANALYZE
SELECT
    p.id,
    p.name,
    p.image_url,
    ps.like_count
FROM product_stat ps
JOIN product p ON p.id = ps.product_id
WHERE p.is_deleted = FALSE
ORDER BY ps.like_count DESC, ps.product_id DESC
LIMIT 20 OFFSET 0;
```
```text
-> Limit: 20 row(s)  (cost=43892 rows=20) (actual time=39.3..39.7 rows=20 loops=1)
    -> Nested loop inner join  (cost=43892 rows=48653) (actual time=39.3..39.7 rows=20 loops=1)
        -> Sort: ps.like_count DESC, ps.product_id DESC  (cost=9835 rows=97306) (actual time=39.2..39.2 rows=20 loops=1)
            -> Table scan on ps  (cost=9835 rows=97306) (actual time=1.01..17.2 rows=100000 loops=1)
        -> Filter: (p.is_deleted = false)  (cost=0.25 rows=0.5) (actual time=0.0252..0.0252 rows=1 loops=20)
            -> Single-row index lookup on p using PRIMARY (id=ps.product_id)  (cost=0.25 rows=1) (actual time=0.0245..0.0245 rows=1 loops=20)
```

LIMIT 을 추가한 후 index looup 과 join 역시 20으로 줄어든 것을 확인 할 수 있다. 

**162/ms** -> **39.7/ms** 페이지네이션 추가 후 실행시간 약 **75.5%** 감소

### like_cnt 인덱스 추가

현재 상태에서는 이정도 조회 속도도 충분하다고 생각하지만 빠르게 쌓여 나갈 데이터 수 와 피크타임의 조회 트래픽 부하를 고려하여 like_cnt index 를 만들어두어 미리 정렬을 해두는 방법이 좋다고 생각한다.

```sql
CREATE INDEX idx_product_stat_like_count_product_id
ON product_stat (like_count DESC, product_id DESC);
```

이렇게 하였을 때 기대하는 흐름은 다음과 같다.

```text
product_stat을 like_count DESC 인덱스 순서로 읽음
→ product를 PK로 lookup
→ is_deleted = false 확인
→ 정상 상품 20개가 모이면 중단
```

이렇게 되면 전체 10만 건을 정렬하지 않고 상위 row부터 읽다가 LIMIT 20에서 멈출 수 있다.             
인덱스 추가 후 동일한 쿼리를 실행해 보았다.

```text
-> Limit: 20 row(s)  (cost=24329 rows=10) (actual time=0.632..0.953 rows=20 loops=1)
    -> Nested loop inner join  (cost=24329 rows=10) (actual time=0.629..0.949 rows=20 loops=1)
        -> Covering index scan on ps using idx_product_stat_like_cnt_product_id  (cost=0.0218 rows=20) (actual time=0.448..0.452 rows=20 loops=1)
        -> Filter: (p.is_deleted = false)  (cost=0.25 rows=0.5) (actual time=0.0238..0.0238 rows=1 loops=20)
            -> Single-row index lookup on p using PRIMARY (id=ps.product_id)  (cost=0.25 rows=1) (actual time=0.0227..0.0227 rows=1 loops=20)
```

이제 product_stat를 전체 스캔하지 않는다. idx_product_stat_like_cnt_product_id 인덱스가 이미 아래 순서로 정렬되어 있기 때문이다.
따라서 MySQL 은 정렬 작업 없이 맨 앞에서 20개만 읽으면 된다.

like_cnt 인덱스 적용 전: **39.7/ms** -> 적용 후: **0.953ms** 실행시간 약 **97.6%** 감소

이 정도 성능이라면 현재 상태 + 어느정도 규모가 더 커져도 조회 성능이 문제가 될 것 같지는 않다. 

이렇게 실행계획을 살펴보며 쿼리 방식의 변화와 인덱스 설정 그리고 조회 테이블의 구조적 변화를 사용한 트레이드오프로 조회 성능을 올려가는 것을 눈으로 직접 확인해볼 수 있었다.

### 조회 성능 개선 결과 정리

테스트 데이터는 상품 10만 건, 좋아요 약 495만 건을 기준으로 진행했다.

| 단계 | 조회 방식 | 주요 실행 계획 | 실행 시간 | 직전 단계 대비 | 최초 대비 |
|---|---|---|---:|---:|---:|
| 1 | `product`와 `likes`를 먼저 조인 후 집계 | `Left hash join` 후 `Aggregate using temporary table` | 11,416ms | - | - |
| 2 | `likes`를 먼저 `product_id` 기준 집계 후 `product` 조인 | `Materialize` + `Aggregate using temporary table` | 1,064ms | 약 90.7% 감소, 약 10.7배 개선 | 약 90.7% 감소 |
| 3 | `likes(product_id)` 인덱스 추가 | `Group aggregate` + `likes_product_id_index` | 559ms | 약 47.5% 감소, 약 1.9배 개선 | 약 95.1% 감소 |
| 4 | `product_stat` MV 테이블 사용 | `product_stat` 단건 lookup, `likes` 접근 제거 | 162ms | 약 71.0% 감소, 약 3.45배 개선 | 약 98.6% 감소 |
| 5 | MV 테이블 조회에 `LIMIT 20 OFFSET 0` 추가 | `product_stat` 10만 건 정렬 후 상위 20개 조인 | 39.7ms | 약 75.5% 감소, 약 4.1배 개선 | 약 99.65% 감소 |
| 6 | `product_stat(like_count DESC, product_id DESC)` 인덱스 추가 | 정렬 없이 인덱스에서 상위 20개만 읽음 | 0.953ms | 약 97.6% 감소, 약 41.7배 개선 | 약 99.99% 감소 |

최종적으로 최초 쿼리의 11,416ms에서 0.953ms까지 감소했다. 실행 시간 기준으로는 약 99.99% 감소했으며 속도 기준으로는 약 11,979배 개선되었다.

### 마무리

개선 과정에서 가장 큰 변화는 세 가지였다.

첫째, 조인 후 집계하던 방식을 집계 후 조인 방식으로 바꾸면서 불필요하게 큰 중간 결과를 제거했다.  
둘째, `likes(product_id)` 인덱스를 추가해 `GROUP BY product_id`가 임시 테이블 집계가 아닌 `Group aggregate`로 처리되도록 개선했다.  
셋째, `product_stat` MV 테이블과 `like_count` 정렬 인덱스를 사용해 조회 시점의 대량 집계와 정렬 비용을 제거했다.

특히 최종 단계에서는 `product_stat` 전체를 정렬하지 않고, `idx_product_stat_like_count_product_id` 인덱스에서 이미 정렬된 순서대로 20개만 읽은 뒤 `product`를 PK로 조인한다. 따라서 인기순 페이지 조회에서는 원본 `likes` 테이블 크기와 거의 무관하게 안정적인 조회 성능을 기대할 수 있었다.