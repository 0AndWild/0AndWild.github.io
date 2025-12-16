+++
title = 'Elasticsearch Highlighting Techniques'
date = '2024-02-07T21:24:29+09:00'
description = "Types of highlighters and offset strategies provided by Elasticsearch"
summary = "Three Elasticsearch highlighter methods including Unified, Plain, and FVH, along with efficient offset strategies using Postings List and Term Vectors"
categories = ["Backend"]
tags = ["Elasticsearch", "Highlighting", "Search", "Performance"]
series = ["ElasticSearch"]
series_order = 8

draft = false
+++

## 1) Kind of Highlighter

ES supports highlighting for search results and provides 3 methods.

Each type below can be applied separately to each field to be highlighted

### Unified (Default Highlighter)

The unified highlighter uses the Lucene unified highlighter. This highlighter breaks text into sentences and scores individual sentences as if they were documents in a corpus using the BM25 algorithm. It also supports accurate phrase and multi-term (fuzzy, prefix, regex) highlighting.

**Features**
- BM25 algorithm-based sentence scoring
- Accurate phrase highlighting support
- Multi-term query support (fuzzy, prefix, regex)

---

### Plain

The plain highlighter is best suited for highlighting simple query matches in a single field.

To accurately reflect the query logic, it **creates a small in-memory index** and **re-executes the original query criteria** through Lucene's query execution planner to access low-level match information for the current document.

This operation is **repeated for every field and every document that needs to be highlighted**. For highlighting many fields in many documents with complex queries, it's recommended to use the unified highlighter with postings or term_vector fields.

**Features**
- Suitable for simple queries on single fields
- Creates in-memory index
- Repeatedly executes for all fields and documents

---

### FVH (Fast Vector Highlighter)

The fvh highlighter uses the Lucene fast vector highlighter. This highlighter can be used on fields where `term_vector` is set to `with_positions_offsets` in the mapping.

**Features**
- Customizable with `boundary_scanner`
- Requires `term_vector` to be set to `with_positions_offsets`, which increases index size
- Can combine matches from multiple fields into one result (see `matched_fields`)
- Can assign different weights to matches at different positions, such as phrase matches being ranked higher than term matches when highlighting boosting queries that boost phrase matches over term matches

> **Note**: The fvh highlighter does not support span queries. If you need support for span queries, use another highlighter such as the unified highlighter.

---

## 2) Offsets Strategy

To create meaningful search snippets from the terms being searched, the highlighter needs to know the start and end character offsets of each word in the original text. These offsets can be obtained from:

### Postings List

If **`index_options` is set to `offsets`** in the mapping, the unified highlighter uses this information to highlight documents without re-analyzing the text.

**The original query is re-executed directly against the postings and matching offsets are extracted from the index to limit the collection to highlighted documents**.

**This is useful when you have large fields because there's no need to re-analyze the text to be highlighted**. It also **requires less disk space than using `term_vectors`**.

**Advantages**
- No need to re-analyze text
- Useful for large fields
- Saves disk space compared to `term_vectors`

---

### Term Vectors

If **`term_vector` is set to `with_positions_offsets`** in the mapping to provide term vector information, the **unified highlighter automatically uses term vectors** to highlight fields.

Because you have access to each document's term dictionary, it's fast **especially when highlighting multi-term queries like prefixes or wildcards on large fields (over 1MB)**.

**The fvh highlighter always uses term vectors**.

**Advantages**
- Fast performance on large fields (over 1MB)
- Efficient for multi-term queries (prefixes, wildcards)
- Direct access to document's term dictionary

---

### Plain Highlighting

This mode is **used by unified when there are no other alternatives**.

It creates a small in-memory index and re-executes the original query criteria through Lucene's query execution planner to access low-level match information for the current document.

**This operation is repeated for every field and every document that needs highlighting**.

**The plain highlighter always uses plain highlighting**.

**Features**
- Used when there are no other options
- Creates in-memory index
- Repeatedly executes for all fields/documents

---

## References

[Highlighting | Elasticsearch Guide [8.13]](https://elastic.co/guide/en/elasticsearch/reference/current/highlighting.html#boundary-scanners)
