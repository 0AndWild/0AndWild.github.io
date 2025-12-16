+++
title = 'Elasticsearch Autocomplete Search Methods'
date = '2024-02-04T20:59:35+09:00'
description = "Various methods to implement autocomplete search in Elasticsearch and their characteristics"
summary = "Comparing Elasticsearch autocomplete implementation methods like Edge N-Gram, Search-as-you-type, and Completion Suggester with guidelines for optimal choices"
categories = ["Backend"]
tags = ["Elasticsearch", "Search", "Autocomplete", "N-gram", "Suggester"]
series = ["ElasticSearch"]
series_order = 6

draft = false
+++

## Elasticsearch Autocomplete Methods

### Edge N-Gram Tokenizer

**Configuration**
- `min_gram`: 1
- `max_gram`: 10
- `token_chars`: letter

**Appropriate Use Cases**
- When the order of terms is not important
- When the starting point and position of tokens are not important

---

### Edge N-Gram Token Filter

**Configuration**
- `min_gram`: 1
- `max_gram`: 10

**Appropriate Use Cases**
- When the order of terms is not important
- When the starting point and position of tokens are not important

---

### Index_prefixes Parameter

**Configuration**
- `min_chars`: 1
- `max_chars`: 10

**Appropriate Use Cases**

Same as N-gram

However, one difference is that the latter puts generated tokens into an additional field

---

### Search-as-you-type Data Type

**Configuration**
- `max_shingle_size`: 3

**Generated Tokens (Supported Sub-fields)**

Example: "real panda blog"

- `._2gram` additional field: real panda, panda blog (shingle token filter applied)
- `._3gram` additional field: real panda blog (shingle token filter applied)
- `._index_prefix` additional field: r, re, rea, real, "real ", real p, real pa, real pan, real pand, real panda, "real panda ", real panda b, real panda bl, real panda blo, real panda blog, p, pa, pan, pand, panda, "panda ", panda b, panda bl, panda blo, panda blog, "panda blog ", b, bl, blo, blog, "blog " (**Applied to ._3gram field with n-gram max of 3**)

**The most efficient query method recommended by ES is a multi-match query of bool_prefix type targeting the root field and its shingle sub-fields.**

This query can match query terms in any order, but gives a higher score when the terms appear in order in the shingle sub-field of the document.

If you want to search for exact order matching of query terms and document terms, or use other properties of phrase queries, you can use the match_phrase_prefix query on the root field. This is also the case when the last term (not a prefix) must match exactly. However, this may be less efficient than using the match_bool_prefix query.

> `shingle token filter defaults to 2`

**Appropriate Use Cases**
- When the order of terms is important
- When the starting point and position of tokens are important

> If no analyzer is configured during indexing, the standard analyzer is applied by default.

---

## Suggester API

### In-memory (Completion Suggester, Context Suggester)

Completion suggester provides auto-complete and search-as-you-type functionality. (Does not support typo correction)

Completion suggester is optimized for speed and responds immediately to user typing.

However, building and storing in in-memory manner incurs significant resource costs.

---

### Term Suggester

**Used to provide search results based on suggested words when there are no results for the text entered by the user**

Suggests words for misspellings

Words are suggested using edit distance. Edit distance is a metric that measures how similar one string is to another string.

Edit distance is typically measured through operations of adding, deleting, and substituting each word.

For example, to change the string "tamming test" to "taming text", you need 1 operation to delete m and 1 operation to change s to x. Therefore, the edit distance is 2.

If there is no term matching the indexed data, term suggest will recommend similar words.

In the results, text represents the suggested character, and score indicates how close the suggested text is to the original.

**Algorithms**
- Elasticsearch uses Levenshtein edit distance measurement or Jaro-Winkler edit distance measurement as edit distance calculation algorithms.

**Korean Processing**
- For Korean, data is not recommended even when using term suggest. This is fundamentally because the Korean Unicode system is complex.
- Korean typo handling is possible through ICU analyzer. ICU analyzer is specifically developed for internationalization and has built-in functions to decompose and combine Korean graphemes. However, for sophisticated features such as typo correction, Korean-English conversion, and autocomplete, it is recommended to develop separate plugins. (e.g., JavaCafe plugin)

---

### Phrase Suggester (Phrase Suggestion)


#### Completion Suggester

Autocomplete suggestion, predicts and shows search terms using autocomplete before the user completes input

#### Context Suggester

Contextual suggestion

---

## References

[Search-as-you-type, N-grams & Suggesters in Elasticsearch](https://realpandablog.wordpress.com/2019/09/11/search-as-you-type-n-grams-suggesters-in-elasticsearch/)
