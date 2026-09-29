+++
title = 'Improving Product Query Performance When Sorting by Likes'
date = '2026-06-18T17:19:15+09:00'
description = "Improving product list query performance when sorting by like count."
summary = ""
categories = ["DB", "Read performance"]
tags = []
series = []
series_order = 1

draft = false
+++

## Goal

I wanted to improve product list query performance by reading execution plans and changing the query, indexes, and data structure step by step. The comparison uses 100,000 products and approximately 4.95 million generated like records.

## Defining the problem

Sorting products by likes looked like the most likely performance bottleneck.

The current schema has `Product` and `Likes` tables. A user can like each product once. Each like inserts a row, and unliking a product hard-deletes that row.

With a small number of users and products, even a poor query or a full scan might go unnoticed. With millions of products and hundreds of thousands or millions of users, however, the `Likes` table can quickly grow to millions or tens of millions of rows. Aggregating that table every time someone sorts products by popularity could overwhelm the database.

I wanted to measure the effect of query improvements, indexes, and cached aggregates in that kind of scenario. The `Likes` table currently has a unique key on `member_id` and `product_id` to prevent duplicate likes.

---

## Run the aggregate query and inspect the result

First, a quick distinction:

- `EXPLAIN` shows the estimated execution plan without running the query.
- `EXPLAIN ANALYZE` runs the query and reports its actual execution behavior.

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

The first query took about 11 seconds. At more than 11 seconds per request, the server would already be in serious trouble.

**What is wrong with this query?**

The execution plan makes it clear. It joins the 4.95 million `likes` rows to the 100,000 `product` rows before aggregating them. That produces a combined intermediate result of about 4.95 million rows. Aggregating that result takes roughly 10 seconds.

How can we improve it?

### Aggregate before the JOIN

If we aggregate `likes` first, the number of rows to join falls to at most 100,000, the number of products. Grouping by only `product_id` also simplifies the aggregation.

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

The execution plan now follows the intended sequence: **aggregate likes → join product → sort**.

Execution time fell from **11.416 seconds to 1.064 seconds**, a reduction of about **91%** compared with the first query.

---

### Add an index to the likes table

A one-second query still isn't fast, so I looked closer. The most expensive operation was now the `GROUP BY` aggregation returning 99,000 rows.

The existing unique index is ordered by `member_id, product_id`. That ordering doesn't suit `GROUP BY product_id`, because rows for the same product aren't contiguous.

The plan shows MySQL regrouping the rows with temporary-table aggregation: `Covering index scan on likes using uk_likes_member_id_product_id` followed by `Aggregate using temporary table`.

```text
(member_id, product_id)
(1, 10)
(1, 20)
(1, 30)
(2, 10)
(2, 20)
(3, 10)
```

Reversing the unique index to `product_id, member_id` would help this query. However, the query for products liked by a particular user relies on `member_id` being first. I kept that index and added a separate index on `product_id`.

```sql
create index likes_product_id_index
    on likes (product_id);
```

Then I ran the same query again.

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

The query now took **559 ms**, down from **1.064 seconds**: a reduction of about **47.5%**.

The execution plan changed as follows:

- Before `likes_product_id_index`: `Aggregate using temporary table` over a `Covering index scan on likes using uk_likes_member_id_product_id`.
- After `likes_product_id_index`: `Group aggregate: count(likes.product_id)` over a `Covering index scan on likes using likes_product_id_index`.

Previously, rows for each `product_id` were scattered, so MySQL had to collect them in a temporary table. The new index places equal product IDs together. MySQL can complete each group as it reads through the index in order.

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

## Can we improve it further?

The query is now in reasonably good shape for aggregation at read time. To go further, we can store precomputed counts in an `MV (Materialized View)` table and read those values instead of aggregating on every request.

When designing popularity sorting, I had already created a `product_stat` table for this purpose. Here, the MV is a table that stores the precomputed aggregate. I'll use it for the next comparison.

This introduces a trade-off: depending on how the table is maintained, the counts may be less current or less accurate than a direct aggregation. Read performance has to be weighed against those consistency requirements.

### Benefits and costs of an MV

Benefits:

- Reads use precomputed data, avoiding repeated aggregation.
- Read performance no longer scales directly with the size of the `likes` table.
- Database load is more predictable under heavy traffic.

Costs:

- Consistency must be maintained: inserts and deletes in `likes` must also update the count in `product_stat`.
- Counts can drift in operation, so a periodic reconciliation batch or validation query should compare them with the original `likes` data.

### Querying product_stat

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

Reading the precomputed table with a simple join provides a substantial improvement. Previously, each request read roughly 4.95 million `likes` rows, grouped them by `product_id`, and joined the result to `product`. With `product_stat`, the query reads the existing `like_count`, and access to `likes` disappears from the execution plan entirely.

Execution time fell from **559 ms to 162 ms**, a reduction of about **71%**.

In this plan, the MySQL optimizer chose to scan `product` first and perform 100,000 lookups into `product_stat` using its unique key on `product_id`. At the current scale, 162 ms is already reasonably fast. With millions of products, though, the full scan and repeated lookups could become a bottleneck.

Pagination lets us request only the rows we need instead of returning everything.

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

After adding `LIMIT`, index lookups and joins fell to 20 as well.

Execution time dropped from **162 ms to 39.7 ms**, a reduction of about **75.5%**.

### Add a like_count index

This is already fast enough for the current dataset. Still, given how quickly data can grow and how much read traffic peak hours can bring, an index that supports the like-count ordering seemed worthwhile.

```sql
CREATE INDEX idx_product_stat_like_count_product_id
ON product_stat (like_count DESC, product_id DESC);
```

The intended execution flow is:

```text
Read product_stat in like_count DESC index order
→ Look up product by PK
→ Check is_deleted = false
→ Stop after finding 20 eligible products
```

Instead of sorting all 100,000 rows, MySQL can start with the highest-ranked rows and stop at `LIMIT 20`.

I added the index and ran the same query again.

```text
-> Limit: 20 row(s)  (cost=24329 rows=10) (actual time=0.632..0.953 rows=20 loops=1)
    -> Nested loop inner join  (cost=24329 rows=10) (actual time=0.629..0.949 rows=20 loops=1)
        -> Covering index scan on ps using idx_product_stat_like_cnt_product_id  (cost=0.0218 rows=20) (actual time=0.448..0.452 rows=20 loops=1)
        -> Filter: (p.is_deleted = false)  (cost=0.25 rows=0.5) (actual time=0.0238..0.0238 rows=1 loops=20)
            -> Single-row index lookup on p using PRIMARY (id=ps.product_id)  (cost=0.25 rows=1) (actual time=0.0227..0.0227 rows=1 loops=20)
```

The query no longer scans all of `product_stat`. The index already provides the required order, so MySQL can read the first 20 rows without an additional sort.

Execution time fell from **39.7 ms to 0.953 ms**, a reduction of about **97.6%**.

For the current scale, and some growth beyond it, this looks unlikely to be the immediate read bottleneck. Working through the execution plans let me see how query structure, indexing, and a different read model each affected performance and introduced their own trade-offs.

### Results

The test dataset contained 100,000 products and approximately 4.95 million likes.

| Step | Query strategy | Key execution plan operations | Time | Change from previous step | Reduction from initial query |
|------|----------------|-------------------------------|-----:|--------------------------:|-----------------------------:|
| 1 | Join `product` and `likes`, then aggregate | `Left hash join` followed by `Aggregate using temporary table` | 11,416 ms | — | — |
| 2 | Aggregate `likes` by `product_id`, then join `product` | `Materialize` + `Aggregate using temporary table` | 1,064 ms | About 90.7% less time; 10.7× faster | About 90.7% |
| 3 | Add `likes(product_id)` index | `Group aggregate` + `likes_product_id_index` | 559 ms | About 47.5% less time; 1.9× faster | About 95.1% |
| 4 | Use `product_stat` MV table | Single-row `product_stat` lookups; no access to `likes` | 162 ms | About 71.0% less time; 3.45× faster | About 98.6% |
| 5 | Add `LIMIT 20 OFFSET 0` to the MV query | Sort 100,000 `product_stat` rows, then join the top 20 | 39.7 ms | About 75.5% less time; 4.1× faster | About 99.65% |
| 6 | Add `product_stat(like_count DESC, product_id DESC)` index | Read only the top 20 index entries without sorting | 0.953 ms | About 97.6% less time; 41.7× faster | About 99.99% |

The final query took 0.953 ms instead of 11,416 ms. That is approximately a **99.99% reduction in execution time**, or a **11,979× speedup** in this comparison.

### Closing thoughts

Three changes made the biggest difference.

First, aggregating before joining removed an unnecessarily large intermediate result. Second, adding `likes(product_id)` allowed `GROUP BY product_id` to use `Group aggregate` instead of temporary-table aggregation. Third, the `product_stat` MV table and like-count index removed the large aggregation and sorting costs from the read path.

In the final step, MySQL reads just 20 entries in the order already provided by `idx_product_stat_like_count_product_id`, then joins `product` by its primary key. For the popularity-sorted page query, this makes read performance largely independent of the size of the original `likes` table.
