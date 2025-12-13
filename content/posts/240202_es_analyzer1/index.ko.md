+++
title = 'Elasticsearch Character Filter'
date = '2024-02-02T21:00:06+09:00'
description = "Elasticsearch의 Character Filter 종류와 동작 방식."
summary = "Elasticsearch Analyzer를 구성하는 Character Filter의 다양한 종류와 설정 방법"
categories = ["ElasticSearch"]
tags = ["Elasticsearch", "Analyzer", "Character Filter", "텍스트 분석"]
series = ["ElasticSearch"]
series_order = 2

draft = false
+++

![](sequence.png "CharFilter → Tokenizer → TokenFilter 순으로 진행")


# Character Filters

Character Filter는 토크나이저 단계 이전에 입력된 문자열을 전처리하는 과정이다.

문자열들에 더하거나, 제거하거나, 문자열을 바꾸는 작업을 한다.

Elasticsearch에서는 다음과 같이 기본적인 Character Filter들을 제공하고 커스텀 필터도 적용 가능하다.

---

## HTML Strip Character Filter

HTML 형태로 입력받은 값을 decoding된 값으로 변환시켜준다.

### 변환 예시

```json
GET /_analyze
{
  "tokenizer": "keyword",
  "char_filter": ["html_strip"],
  "text": "<p>I&apos;m so <b>happy</b>!</p>"
}
// Result -> [ \nI'm so happy!\n ]
```

### 적용 방법

```json
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "char_filter": ["html_strip"]
        }
      }
    }
  }
}
```

---

## Mapping Character Filter

Mapping Character Filter는 입력받은 문자열이 key 값으로 지정된 문자와 동일하면 해당 key의 value 값으로 변환을 시켜준다.

Matching 방식은 탐욕법으로 가장 많이 매칭된 패턴으로 변환되며 변환값(value)은 빈 문자열도 가능하다.

### 변환 예시

```json
GET /_analyze
{
  "tokenizer": "keyword",
  "char_filter": [
    {
      "type": "mapping",
      "mappings": [
        "٠ => 0",
        "١ => 1",
        "٢ => 2",
        "٣ => 3",
        "٤ => 4",
        "٥ => 5",
        "٦ => 6",
        "٧ => 7",
        "٨ => 8",
        "٩ => 9"
      ]
    }
  ],
  "text": "My license plate is ٢٥٠١٥"
}
// Result -> [ My license plate is 25015 ]
```

---

## Pattern Replace Character Filter

pattern_replace 필터는 정규식에 매칭되는 문자열들을 지정된 문자열로 변환시켜준다.

> ⚠️ **주의사항**: 정규식은 Java 정규식을 따르며, 안 좋은 정규식은 성능 저하 또는 StackOverflow 에러를 발생시키고, 실행 중인 노드를 갑자기 종료시킬 수 있다.

### 파라미터

- `pattern`: Java 정규표현식
- `replacement`: 치환할 문자열
- `flags`: Java의 정규 표현식 플래그로 `|`로 분리되어야 함 (예: "CASE_INSENSITIVE|COMMENTS")

### 변환 예시

```json
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "char_filter": ["my_char_filter"]
        }
      },
      "char_filter": {
        "my_char_filter": {
          "type": "pattern_replace",
          "pattern": "(\\d+)-(?=\\d)",
          "replacement": "$1_"
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "My credit card is 123-456-789"
}
// Result -> [ My, credit, card, is, 123_456_789 ]
```

---

## 참고 문서

- [Character filters reference | Elasticsearch Guide [8.8]](https://www.elastic.co/guide/en/elasticsearch/reference/8.8/analysis-charfilters.html)
