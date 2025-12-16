+++
title = 'Elasticsearch 자동완성 검색 처리 방법'
date = '2024-02-04T20:59:35+09:00'
description = "Elasticsearch에서 자동완성 검색을 구현하는 다양한 방법과 각 방법의 특징"
summary = "Edge N-Gram, Search-as-you-type, Completion Suggester 등 Elasticsearch의 자동완성 구현 방법을 비교하고 상황별 최적의 선택 가이드"
categories = ["Backend"]
tags = ["Elasticsearch", "검색", "자동완성", "N-gram", "Suggester"]
series = ["ElasticSearch"]
series_order = 6

draft = false
+++

## Elastic search 자동완성 처리 방법

### Edge N-Gram Tokenizer

**Configuration**
- `min_gram`: 1
- `max_gram`: 10
- `token_chars`: letter

**적절한 사용처**
- 용어의 순서가 중요하지 않은 곳
- 토큰의 시작점 및 위치가 중요하지 않은 곳

---

### Edge N-Gram Token Filter

**Configuration**
- `min_gram`: 1
- `max_gram`: 10

**적절한 사용처**
- 용어의 순서가 중요하지 않은 곳
- 토큰의 시작점 및 위치가 중요하지 않은 곳

---

### Index_prefixes Parameter

**Configuration**
- `min_chars`: 1
- `max_chars`: 10

**적절한 사용처**

N-gram과 동일함

다만 한가지 차이점은 후자의 경우 생성된 토큰을 넣는 추가적인 필드를 넣는다는 것

---

### Search-as-you-type Data Type

**Configuration**
- `max_shingle_size`: 3

**Generated Tokens (지원하는 서브 필드)**

예시: "real panda blog"

- `._2gram` additional field: real panda, panda blog (shingle token filter 적용됨)
- `._3gram` additional field: real panda blog (shingle token filter 적용됨)
- `._index_prefix` additional field: r, re, rea, real, "real ", real p, real pa, real pan, real pand, real panda, "real panda ", real panda b, real panda bl, real panda blo, real panda blog, p, pa, pan, pand, panda, "panda ", panda b, panda bl, panda blo, panda blog, "panda blog ", b, bl, blo, blog, "blog " (**._3gram 필드에 적용이 되고 n gram max 는 3으로 적용된다**)

**ES에서 말하는 가장 효율적인 쿼리 방법은 루트 필드와 해당 shingle 하위 필드를 대상으로 하는 bool_prefix 타입의 다중 일치 쿼리이다.**

이 쿼리는 어떤 순서로든 쿼리 용어와 일치할 수 있지만, 문서에서 shingle 서브 필드에 순서대로 용어가 포함된 경우 더 높은 점수를 부여한다.

쿼리 용어와 문서의 용어가 정확하게 순서대로 일치하게 검색을 하거나 구문 쿼리의 다른 속성을 사용하려면 루트 필드에 match_phrase_prefix 쿼리를 사용할 수 있다. 접두사가 아닌 마지막 용어가 정확하게 일치해야 하는 경우도 그렇다. 하지만 match_bool_prefix 쿼리를 사용하는 것 보다 효율성이 떨어질 수 있다.

> `shingle token filter 는 default 로 2가 적용됨`

**적절한 사용처**
- 용어의 순서가 중요한 곳
- 토큰의 시작점과 위치가 중요한 곳

> 인덱싱을 할때 설정된 analyzer 가 없으면 default 로 standard analyzer 가 적용된다.

---

## Suggester API

### In-memory (Completion Suggester, Context Suggester)

completion suggester는 auto-complete과 search-as-your-type 기능을 제공함. (오타 수정은 지원 x)

completion suggester는 속도에 최적화 되어 있어 유저가 타이핑 하는 것에 즉각적으로 반응해줌.

하지만 빌드와 인메모리 방식에 저장을 하는데 있어 많은 리소스 비용이 부담됨.

---

### Term Suggester

**사용자가 입력한 텍스트에 대한 결과가 없을경우 추천 단어를 기준으로 검색결과를 제공할때 사용**

잘못된 철자에 대해 추천 단어 제안

편집거리를 사용해 단어를 제안한다. 편집거리 척도란 어떤 문자열이 다른 문자열과 얼마나 비슷한가를 편집거리를 사용해 알아볼 수 있다.

편집거리를 측정하는 방식은 대부분 각 단어를 추가, 삭제, 치환을 통해 이루어진다.

예를들어 tamming test 문자열을 taming text로 바꾸는데 m을 삭제하는 연산 1회와 s를 x로 바꾸는 연산 1회가 필요하다. 그러므로 편집거리는 2가 된다.

만약 색인된 데이터와 일치하는 텀이 존재하지 않을 경우 term suggest 결과로 비슷한 단어를 추천해준다.

결과에서 text는 제안한 문자를 나타내고, score는 제안하고자 하는 텍스트가 원본과 얼마나 가까운지를 나타낸다.

**알고리즘**
- 엘라스틱 서치에서는 편집거리 계산 알고리즘으로 Levenshtein 편집거리 측정 또는 Jaro-Winkler 편집거리 측정을 사용한다.

**한글 처리**
- 한글의 경우 term suggest를 이용해도 데이터가 추천되지 않는다. 기본적으로 한글 유니코드 체계가 복잡하기 때문이다.
- ICU 분석기를 통해 한글 오타를 처리하는 것이 가능. ICU 분석기는 국제화 처리를 위해 특별히 개발된 분석기로 내부에 한글 자소를 분해하는 기능과 합치는 기능을 가지고 있음. 하지만 정교한 오타교정, 한영 변환, 자동완성 등의 전문적인 기능은 별도의 플러그인을 개발해서 사용하는 것이 좋다. (Ex. 자바카페 플러그인)

---

### Phrase Suggester (추천 문장 제안)


#### Completion Suggester

자동완성 제안, 사용자가 입력을 완료하기 전에 자동완성을 사용해 검색어를 예측해서 보여줌

#### Context Suggester

추천 문맥 제안

