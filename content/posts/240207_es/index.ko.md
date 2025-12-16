+++
title = 'Elasticsearch Highlighting 기법'
date = '2024-02-07T21:24:29+09:00'
description = "Elasticsearch에서 제공하는 하이라이터 종류와 오프셋 전략"
summary = "Unified, Plain, FVH 등 Elasticsearch의 3가지 하이라이터 방식과 Postings List, Term Vectors를 활용한 효율적인 오프셋 전략"
categories = ["Backend"]
tags = ["Elasticsearch", "Highlighting", "Search", "Performance"]
series = ["ElasticSearch"]
series_order = 8

draft = false
+++

## 1) Kind of Highlighter

ES에서는 검색 결과에 대한 강조 표시를 지원하고 있으며 3가지 방식을 지원을 함.

아래 타입은 Highlight 할 필드마다 각각 따로 적용할 수 있음

### Unified (Default : 기본 하이라이터)

통합 형광펜은 Lucene 통합 형광펜을 사용함. 이 하이라이터는 텍스트를 문장으로 나누고 BM25 알고리즘을 사용해 마치 말뭉치에 있는 문서처럼 개별 문장에 점수를 매김. 또한 정확한 구문 및 다중 용어(퍼지, 접두사, 정규식) 하이라이트를 지원함.

**특징**
- BM25 알고리즘 기반 문장 점수 매기기
- 정확한 구문 하이라이트 지원
- 다중 용어 쿼리 지원 (퍼지, 접두사, 정규식)

---

### Plain

일반 형광펜은 단일 필드에서 간단한 쿼리 일치 항목을 강조 표시하는 데 가장 적합.

쿼리 로직을 정확하게 반영하기 위해 작은 **인메모리 인덱스를 생성**하고 Lucene의 쿼리 실행 플래너를 통해 **원래 쿼리 기준을 다시 실행**하여 현재 문서에 대한 낮은 수준의 일치 정보에 액세스함함.

이 작업은 **강조 표시해야 하는 모든 필드와 모든 문서에 대해 반복**됨. 복잡한 쿼리가 있는 많은 문서에서 많은 필드를 강조 표시하려면 게시글 또는 term_vector 필드에 통합 형광펜을 사용하는 것이 좋음.

**특징**
- 단일 필드의 간단한 쿼리에 적합
- 인메모리 인덱스 생성
- 모든 필드와 문서에 대해 반복 실행

---

### FVH (Fast Vector Highlighter)

fvh 형광펜은 Lucene 고속 벡터 형광펜을 사용함. 이 형광펜은 매핑에서 `term_vector`가 `with_positions_offsets`로 설정된 필드에 사용할 수 있음.

**특징**
- `boundary_scanner`로 사용자 지정 가능
- `term_vector`를 `with_positions_offsets`로 설정해야 하므로 인덱스 크기가 커짐
- 여러 필드에서 일치하는 항목을 하나의 결과로 결합 가능 (`matched_fields` 참조)
- 구문 일치를 용어 일치보다 부스팅하는 부스팅 쿼리를 강조 표시할 때 구문 일치가 용어 일치보다 정렬되는 것과 같이 서로 다른 위치의 일치에 서로 다른 가중치를 할당 가능

> **주의**: fvh 형광펜은 스팬 쿼리를 지원하지 않음. 스팬 쿼리에 대한 지원이 필요한 경우 통합형 하이라이터와 같은 다른 하이라이터를 사용.

---

## 2) Offsets Strategy

검색 중인 용어에서 의미 있는 검색 스니펫을 만들려면 하이라이터가 원본 텍스트에서 각 단어의 시작 및 끝 문자 오프셋을 알아야 함. 이러한 오프셋은 다음에서 얻을 수 있음.

### Postings List (글 목록)

**매핑에서 `index_options`가 `offsets`로 설정**되어 있으면 통합 하이라이터는 이 정보를 사용하여 텍스트를 다시 분석하지 않고 문서를 강조 표시함.

**원래 쿼리를 글에 대해 직접 다시 실행하고 색인에서 일치하는 오프셋을 추출하여 컬렉션을 강조 표시된 문서로 제한**.

**강조 표시할 텍스트를 다시 분석할 필요가 없으므로 큰 필드가 있는 경우에 유용**. 또한 **`term_vectors`를 사용할 때보다 디스크 공간도 덜 필요**.

**장점**
- 텍스트 재분석 불필요
- 큰 필드에 유용
- `term_vectors`보다 디스크 공간 절약

---

### Term Vectors (용어 벡터)

**매핑에서 `term_vector`를 `with_positions_offsets`로 설정**하여 용어 벡터 정보를 제공하면 **unified 하이라이터가 자동으로 용어 벡터를 사용**하여 필드를 강조 표시함.

각 문서의 용어 사전에 액세스할 수 있기 때문에 **특히 대용량 필드(1MB 초과)나 접두사 또는 와일드카드**와 같은 다중 용어 쿼리를 강조 표시할 때 빠름.

**fvh 하이라이터는 항상 용어 벡터를 사용**함.

**장점**
- 대용량 필드(1MB 초과)에 빠른 성능
- 다중 용어 쿼리에 효율적 (접두사, 와일드카드)
- 문서의 용어 사전 직접 액세스

---

### Plain Highlighting (일반 하이라이팅)

이 모드는 **다른 대안이 없을 때 통합에서 사용**함.

작은 인메모리 인덱스를 생성하고 Lucene의 쿼리 실행 플래너를 통해 원래 쿼리 기준을 다시 실행하여 현재 문서에 대한 낮은 수준의 일치 정보에 액세스함함.

**이 작업은 강조 표시가 필요한 모든 필드와 모든 문서에 대해 반복**.

**plain highlighter은 항상 plain highlighting을 사용**.

**특징**
- 다른 옵션이 없을 때 사용
- 인메모리 인덱스 생성
- 모든 필드/문서에 대해 반복 실행

---

## 참고 자료

[Highlighting | Elasticsearch Guide [8.13]](https://elastic.co/guide/en/elasticsearch/reference/current/highlighting.html#boundary-scanners)
