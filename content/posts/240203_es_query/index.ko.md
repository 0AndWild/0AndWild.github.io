+++
title = 'Elasticsearch Query 처리 순서'
date = '2024-02-03T21:45:06+09:00'
description = "Elasticsearch의 Query, Filter, PostFilter의 처리 순서와 동작 방식."
summary = "Elasticsearch에서 Query, Filter, PostFilter의 실행 순서와 Aggregation에 미치는 영향"
categories = ["ElasticSearch"]
tags = ["Elasticsearch", "Query", "Filter", "PostFilter", "Aggregation"]
series = ["ElasticSearch"]
series_order = 5

draft = false
+++

# Elasticsearch Query 처리 순서

## Summary

**Filtered Query**는 최종 search와 aggregation 둘 다의 결과에 영향을 미치지만, **PostFiltered Query**는 최종 search 결과에만 영향을 미치고 aggregation에는 영향을 미치지 않는다.

---

## Query 처리 순서

```
SearchRequest → (Filtered) → Query → (PostFilter) → Result → RescoreQuery
                                   ↓
                              Aggregation → AggregationResult
```

![](sequence1.jpg)

### Filter Query 예시

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

Filter Query는 검색 결과와 Aggregation 모두에 영향을 미친다.

---

![](sequence2.jpg)

### PostFilter Query 예시

```json
{
  "post_filter": {
    "term": {
      "location": "denver"
    }
  }
}
```

PostFilter Query는 검색 결과에만 영향을 미치고, Aggregation 결과에는 영향을 미치지 않는다.

---

## Rescore Query 파라미터

- **window_size**: 각 shard에서 재점수화할 상위 결과의 수
- **score_mode**: main query score와 rescore query의 점수를 결합하는 방식
