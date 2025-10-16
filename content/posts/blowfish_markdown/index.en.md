+++
title = 'Hugo Markdown Guide'
date = '2025-10-16T18:36:52+09:00'
description = "Blowfish Markdown Syntax Guide"
summary = "Blowfish Markdown Syntax Guide"
categories = ["Blowfish"]
tags = ["Blowfish", "Hugo", "Markdown"]
series = ["Blowfish"]
series_order = 1

draft = false
+++

<!-- Content Writing Guide -->

## Heading (H2)

### Subheading (H3)

Regular text. **Bold**, *Italic*, ~~Strikethrough~~

---

## Images

### Method 1: Local Image
Place image file in the post folder:
```markdown
![Image description](image.jpg)
```

### Method 2: External Image URL
```markdown
![Image description](https://example.com/image.jpg)
```

### Method 3: HTML Tag (with size control)
```html
<img src="image.jpg" alt="Image description" width="500" />
```

### Carousel Images (Slideshow)
### 16:9
{{< carousel images="img/*" >}}

---
21:9
{{< carousel images="img/*" aspectRatio="21-9" interval="1000" >}}
---

## Code Blocks

### Inline Code
Use `inline code` format

### Code Blocks
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

```python
def hello():
    print("Hello, World!")
```

```bash
docker run -d -p 8080:80 nginx
```

---

## Links

### Basic Link
[Link text](https://example.com)

### Reference Style Link
[Link text][ref]

[ref]: https://example.com "Link description"

### Article Reference
{{< article link="/docs/welcome/" showSummary=true compactSummary=true >}}

---

## Lists

### Unordered List
- Item 1
- Item 2
  - Sub-item 2-1
  - Sub-item 2-2
- Item 3

### Ordered List
1. First
2. Second
3. Third

### Checklist
- [ ] Todo 1
- [x] Completed
- [ ] Todo 2

---

## Blockquote

> This is a blockquote.
> Multiple lines are supported.

---

## Table

| Item | Description | Note |
|------|-------------|------|
| A | Description A | Note A |
| B | Description B | Note B |

---

## Embedded Links (Shortcodes)

### YouTube Video
{{</* youtube VIDEO_ID */>}}

### Twitter/X
{{</* twitter user="username" id="tweet_id" */>}}

### GitHub Gist
{{</* gist username gist_id */>}}

---

## Alert Boxes (Blowfish Alert)

{{</* alert "circle-info" */>}}
Information alert.
{{</* /alert */>}}

{{</* alert "lightbulb" */>}}
Tips and ideas.
{{</* /alert */>}}

{{</* alert "triangle-exclamation" */>}}
Warning message.
{{</* /alert */>}}

---

## Collapsible (Details)

<details>
<summary>Click to expand</summary>

Hidden content appears here.

</details>

---

## Comments

<!-- This part is not displayed on screen -->

---

## Horizontal Rule

Use to create dividing lines:

---

## Footnotes

You can add footnotes[^1] to text.

[^1]: This is the footnote content.

---

### Chart

{{< chart >}}
type: 'bar',
data: {
  labels: ['Tomato', 'Blueberry', 'Banana', 'Lime', 'Orange'],
  datasets: [{
    label: '# of votes',
    data: [12, 19, 3, 5, 3],
  }]
}
{{< /chart >}}

---
### Mermaid Diagram

{{< mermaid >}}
graph LR;
A[Lemons]-->B[Lemonade];
B-->C[Profit]
{{< /mermaid >}}

---

### Swatches (color showcase)
{{< swatches "#64748b" "#3b82f6" "#06b6d4" >}}

---

### TypeIt

(Ex1)

{{< typeit >}}
Lorem ipsum dolor sit amet
{{< /typeit >}}

(Ex2)

{{< typeit
  tag=h1
  lifeLike=true
>}}
Lorem ipsum dolor sit amet,
consectetur adipiscing elit.
{{< /typeit >}}

(Ex3)

{{< typeit
  tag=h3
  speed=50
  breakLines=false
  loop=true
>}}
"Frankly, my dear, I don't give a damn." Gone with the Wind (1939)
"I'm gonna make him an offer he can't refuse." The Godfather (1972)
"Toto, I've a feeling we're not in Kansas anymore." The Wizard of Oz (1939)
{{< /typeit >}}


---

### Youtube Lite

{{< youtubeLite id="SgXhGb-7QbU" label="Blowfish-tools demo" >}}

---

**Writing Tips:**
- Change `draft: true` to `false` in front matter to publish
- Writing `description` and `summary` helps with SEO
- It's recommended to place images in the post folder
