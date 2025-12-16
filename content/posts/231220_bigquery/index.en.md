+++
title = 'BigQuery Clustering Optimization'
date = '2023-12-20T21:50:16+09:00'
description = "Query performance optimization through clustering in BigQuery"
summary = "BigQuery clustering concepts and efficient data access strategies through combination with partitioning"
categories = ["Backend", "Database"]
tags = ["BigQuery", "Clustering", "Partitioning", "Query Optimization", "Performance"]
series = ["BigQuery"]
series_order = 2

draft = false
+++

## Clustering

![Clustering Concept](img1.png)

```sql
SELECT *
FROM user_signups
WHERE
  country = 'Lebanon'
  AND registration_date = '2023-12-01'
```

Through clustering, BigQuery can perform less work in accessing data, thereby increasing query speed. However, before clustering, it's good to consider the amount of data in the table and whether the cost of processing clustering might be worse.

For example, if a BigQuery column-based table has only 10 rows of data, you should recognize that the cost of clustering will be higher than the cost of doing a full scan.

Quoting a former Google engineer, if the data group for clustering is less than 100MB, doing a full scan might be better than clustering.

> **Reference**: [Google BigQuery clustered table not reducing query size](https://stackoverflow.com/questions/52669725/google-bigquery-clustered-table-not-reducing-query-size-when-running-query-with/52674573#52674573)

**Important Note**

Additionally, if you don't filter on the clustered base column during query time, it provides no help to query performance whatsoever.

---

## Example of Creating Clustered Tables

```sql
CREATE TABLE `myproject.mydataset.clustered_table` (
  registration_date DATE,
  country STRING,
  tier STRING,
  username STRING
) CLUSTER BY country;
```

![Clustered Table Structure](img2.png)

**Clustering Features**
- Can cluster up to 4 columns maximum
- Unlike partitioning, not limited to INT64 and DATE types only
- Can also use types like STRING and GEOGRAPHY

---

## Combine Clustering with Partitioning

![Clustering + Partitioning](img3.png)

Using partitioning and clustering together enables more efficient data access.

**Combination Strategy**
- Partitioning: Date-based data division
- Clustering: Additional sorting within partitions
- Query performance and cost optimization

---

## References

- [Add One Line of SQL to Optimise Your BigQuery Tables](https://medium.com/towards-data-science/add-one-line-of-sql-to-optimise-your-bigquery-tables-304761b048f0)
- [Use the Partitions, Luke! A Simple and Proven Way to Optimise Your SQL Queries](https://towardsdatascience.com/use-the-partitions-luke-a-simple-and-proven-way-to-optimise-your-sql-queries-43e24ea4c5d0)
