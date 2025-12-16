+++
title = 'Elasticsearch Pagination Technique'
date = '2024-02-06T21:16:24+09:00'
description = "Three pagination techniques provided by Elasticsearch and their characteristics"
summary = "Comparing Elasticsearch pagination methods including From/Size, Search After, and Scroll, with stable paging implementation using PIT (Point In Time)"
categories = ["Backend"]
tags = ["Elasticsearch", "Pagination", "Search After", "PIT", "Performance"]
series = ["ElasticSearch"]
series_order = 7

draft = false
+++

## ElasticSearch Pagination: 3 Options

### 1. From/Size Pagination

Uses `from` + `size` = offset method to load data into memory on-demand. Supports up to 10,000 results.

The [`index.max_result_window`](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/index-modules.html#index-max-result-window) option can be used to load more than 10,000 results, but this is not recommended.

**Features**
- Simple implementation
- Limited to 10,000 results maximum
- Performance degradation with deep pagination

---

### 2. Search After

Overcomes the pagination limitation of 10,000 results. Similar to typical cursor-based approaches.

Uses the `sort` condition field of search results as a key value to retrieve subsequent results.

**Drawbacks**

Using `search-after` alone may result in inconsistent responses if indexing is updated during pagination.

**Using with PIT (Point In Time)**

To address this, use PIT (Point In Time)

```bash
POST /my-index-000001/_pit?keep_alive=1m
```

The above request creates a snapshot of the index at the current point in time, which can then be used with the `id` value as follows:

```json
{
  "query": {},
  "size": 100,
  "sort": {
    "my_sort": "desc"
  },
  "search_after": {},
  "pit": {
    "id": "{{pit_value}}"
  }
}
```

Even if there are changes to the index, results are returned based on the snapshot.

`keep_alive` represents the validity period of the PIT. It's recommended to manage PIT based on the latest point in time.

**Features**
- Can paginate more than 10,000 results
- Cursor-based approach
- Guarantees consistent results when used with PIT
- Efficient for deep pagination

---

### 3. Scroll

> **Note**: According to ES official documentation, Search After method is recommended instead of Scroll method

**Features**
- For bulk data extraction
- Not suitable for real-time search
- Search After + PIT combination is now recommended

---

## References

- [Elasticsearch Pagination Techniques: SearchAfter, Scroll, Pagination & PIT](https://opster.com/guides/elasticsearch/how-tos/elasticsearch-pagination-techniques/)
- [Elasticsearch Search After Performance Check](https://danawalab.github.io/elastic/2023/02/13/Search-After.html)
- [Paginate search results | Elasticsearch Guide [7.17]](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/paginate-search-results.html#search-after)
- [Point in time API | Elasticsearch Guide [7.17]](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/point-in-time-api.html)
- [Scroll API | Elasticsearch Guide [7.17]](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/scroll-api.html)
