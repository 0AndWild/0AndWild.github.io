+++
title = 'What is BigQuery?'
date = '2023-12-18T21:37:29+09:00'
description = "Features and architecture of Google BigQuery"
summary = "Key features of BigQuery as a column-based database and its Colossus-based distributed processing architecture"
categories = ["Backend", "Database"]
tags = ["BigQuery", "Google Cloud", "OLAP", "Column Database", "Distributed System"]
series = ["BigQuery"]
series_order = 1

draft = false
+++

## BigQuery Features

### Column-based Database

Unlike typical RDBs that store data in row units, when accessing data in a specific column, it scans only the column file you're looking for without scanning the entire row.

Advantageous for analytical database (OLAP) operations that read only specific columns to count or calculate statistics.

**Advantages**
- Fast queries with column-level scanning
- Optimized for analytical queries
- Storage efficiency

---

### Data Processing Architecture

![BigQuery Architecture](img1.png)

**Colossus (Distributed Storage)**
- Google's cluster-level file system succeeding Google File System (GFS)
- Provides storage at the bottom layer
- Communicates with compute nodes through Jupiter, a TB-level network

**Compute Layers (Leaf, Mixer1, Mixer0)**
- Process data read from Colossus without disks
- Each layer passes data up to the layer above
- High-speed computation through distributed parallel processing

---

### No Key, No Index

No concept of keys and indexes. Full scan only

**Features**
- No need for index management
- Performance achieved through column-based scanning
- Optimized for large-scale data analysis

---

### No Update, Delete

Only additions are allowed for performance, and once data is entered, it cannot be modified or deleted.

If data is entered incorrectly, the table must be deleted and recreated.

**Constraints**
- Only INSERT supported
- UPDATE/DELETE not supported
- Requires recreation when modifying data

---

### Eventual Consistency

Data is replicated to 3 data centers, so it may not be immediately available for querying after writing.

![Eventual Consistency](img2.png)

**Features**
- High availability through triple replication
- Eventual consistency guarantee
- Reads may not be immediately available after writes

---

## References

- [BigQuery Performance/Cost Tips](https://burning-dba.tistory.com/137)
- [How to Use BigQuery UNNEST, ARRAY, STRUCT](https://zzsza.github.io/gcp/2020/04/12/bigquery-unnest-array-struct/#bigquery-unnest)
- [Introduction to Google Big Data Platform BigQuery Architecture](https://bcho.tistory.com/1117)
