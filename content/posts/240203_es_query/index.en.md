+++
title = 'Elasticsearch Query Processing Sequence'
date = '2024-02-03T21:45:06+09:00'
description = "Processing sequence and operation of Query, Filter, and PostFilter in Elasticsearch."
summary = "Execution order of Query, Filter, PostFilter in Elasticsearch and their impact on Aggregation"
categories = ["ElasticSearch"]
tags = ["Elasticsearch", "Query", "Filter", "PostFilter", "Aggregation"]
series = ["ElasticSearch"]
series_order = 5

draft = false
+++

# Elasticsearch Query Processing Sequence

## Summary

**Filtered Query** affects both the final search and aggregation results, but **PostFiltered Query** only affects the final search results and does not affect aggregation.

---

## Query Processing Sequence

```
SearchRequest → (Filtered) → Query → (PostFilter) → Result → RescoreQuery
                                   ↓
                              Aggregation → AggregationResult
```

![](sequence1.jpg)

### Filter Query Example

```json
{
  "query": {
    "filtered": {
      "filter": {
        "term": {
          "location": "denver"
        }
      }
    }
  }
}
```

Filter Query affects both search results and Aggregation.

---

![](sequence2.jpg)

### PostFilter Query Example

```json
{
  "post_filter": {
    "term": {
      "location": "denver"
    }
  }
}
```

PostFilter Query only affects search results and does not affect Aggregation results.

---

## Rescore Query Parameters

- **window_size**: The number of top results to rescore per shard
- **score_mode**: The method of combining main query score and rescore query scores
