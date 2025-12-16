+++
title = 'Elasticsearch Pagination Technique'
date = '2024-02-06T21:16:24+09:00'
description = "Elasticsearch에서 제공하는 3가지 페이지네이션 기법과 각각의 특징 및 사용 방법"
summary = "From/Size, Search After, Scroll 등 Elasticsearch의 페이지네이션 방식을 비교하고 PIT(Point In Time)를 활용한 안정적인 페이징 구현 방법"
categories = ["Backend"]
tags = ["Elasticsearch", "Pagination", "Search After", "PIT", "Performance"]
series = ["ElasticSearch"]
series_order = 7

draft = false
+++

## ElasticSearch Pagination 3가지 옵션

### 1. From/Size Pagination

`from` + `size` = offset 방식으로 그때그때 메모리에 적재하여 검색을 함. 최대 10,000건까지 지원

[`index.max_result_window`](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/index-modules.html#index-max-result-window) 옵션을 사용하여 10,000건 이상을 로드할 수 있지만 추천하지 않음

**특징**
- 간단한 구현
- 최대 10,000건 제한
- Deep pagination 시 성능 저하

---

### 2. Search After

Pagination이 최대 10,000건까지 페이징 처리할 수 있는 한계를 극복할 수 있음. 일반적인 커서 방식과 유사함.

검색 결과의 `sort` 조건 필드를 키 값으로 사용하며 그 다음부터 조회를 함.

**단점**

`search-after`만 사용할 경우 중간에 인덱싱이 업데이트되거나 하면 응답 결과가 불규칙해질 수 있음.

**PIT(Point In Time)와 함께 사용**

이를 보완하기 위해 PIT(Point In Time)를 사용함

```bash
POST /my-index-000001/_pit?keep_alive=1m
```

위 요청을 통해 해당 인덱스의 현재 시점의 스냅샷을 찍어두고 다음과 같이 `id` 값으로 사용함

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

중간에 인덱스에 변경사항이 있어도 스냅샷을 기준으로 응답 결과가 반환됨.

`keep_alive`는 해당 PIT의 유효기간과 같음. 최신 시점을 기준으로 PIT를 관리하는 것이 권장됨.

**특징**
- 10,000건 이상 페이징 가능
- 커서 기반 방식
- PIT와 함께 사용 시 일관된 결과 보장
- Deep pagination에 효율적

---

### 3. Scroll

> **Note**: ES 공식 문서에 따라 Scroll 방식 대신 Search After 방식을 권장함

**특징**
- 대량 데이터 추출용
- 실시간 검색에는 부적합
- 현재는 Search After + PIT 조합을 권장

---

## 참고 자료

- [Elasticsearch Pagination Techniques: SearchAfter, Scroll, Pagination & PIT](https://opster.com/guides/elasticsearch/how-tos/elasticsearch-pagination-techniques/)
- [Elasticsearch Search After 성능 체크](https://danawalab.github.io/elastic/2023/02/13/Search-After.html)
- [Paginate search results | Elasticsearch Guide [7.17]](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/paginate-search-results.html#search-after)
- [Point in time API | Elasticsearch Guide [7.17]](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/point-in-time-api.html)
- [Scroll API | Elasticsearch Guide [7.17]](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/scroll-api.html)
