+++
title = 'Hugo markdown 설명서'
date = '2025-10-16T18:36:52+09:00'
description = "Blowfish 마크다운 문법 설명서"
summary = "Blowfish 마크다운 문법 설명서"
categories = ["Blowfish"]
tags = ["Blowfish", "Hugo", "Markdown"]
series = ["Blowfish"]
series_order = 1

draft = false
+++

<!-- 본문 작성 가이드 -->

## 제목 (H2)

### 소제목 (H3)

일반 텍스트입니다. **굵게**, *기울임*, ~~취소선~~

---

## 이미지 삽입

### 방법 1: 로컬 이미지
포스트 폴더 내에 이미지 파일을 넣고 사용:
```markdown
![이미지 설명](image.jpg)
```

### 방법 2: 외부 이미지 URL
```markdown
![이미지 설명](https://example.com/image.jpg)
```

### 방법 3: HTML 태그 (크기 조정 가능)
```html
<img src="image.jpg" alt="이미지 설명" width="500" />
```

### 캐러셀 이미지 (슬라이드 효과)
### 16:9
{{< carousel images="img/*" >}}

---
21:9
{{< carousel images="img/*" aspectRatio="21-9" interval="1000" >}}
---

## 코드 삽입

### 인라인 코드
`inline code` 형식으로 작성

### 코드 블록
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

## 링크

### 기본 링크
[링크 텍스트](https://example.com)

### 참조 스타일 링크
[링크 텍스트][ref]

[ref]: https://example.com "링크 설명"

### article 참조
{{< article link="/docs/welcome/" showSummary=true compactSummary=true >}}

---

## 리스트

### 순서 없는 리스트
- 항목 1
- 항목 2
  - 하위 항목 2-1
  - 하위 항목 2-2
- 항목 3

### 순서 있는 리스트
1. 첫 번째
2. 두 번째
3. 세 번째

### 체크리스트
- [ ] 할 일 1
- [x] 완료된 일
- [ ] 할 일 2

---

## 인용문

> 인용문 내용입니다.
> 여러 줄도 가능합니다.

---

## 표 (Table)

| 항목 | 설명 | 비고 |
|------|------|------|
| A | 설명 A | 비고 A |
| B | 설명 B | 비고 B |

---

## 링크 임베드 (Shortcodes)

### YouTube 영상
{{</* youtube VIDEO_ID */>}}

### Twitter/X
{{</* twitter user="username" id="tweet_id" */>}}

### GitHub Gist
{{</* gist username gist_id */>}}

---

## 알림 박스 (Blowfish Alert)

{{</* alert "circle-info" */>}}
정보 알림입니다.
{{</* /alert */>}}

{{</* alert "lightbulb" */>}}
팁이나 아이디어입니다.
{{</* /alert */>}}

{{</* alert "triangle-exclamation" */>}}
경고 메시지입니다.
{{</* /alert */>}}

---

## 접기/펼치기 (Details)

<details>
<summary>클릭하여 펼치기</summary>

숨겨진 내용이 여기에 표시됩니다.

</details>

---

## 주석

<!-- 이 부분은 화면에 표시되지 않습니다 -->

---

## 수평선

위아래로 구분선을 만들 때 사용:

---

## 각주

텍스트에 각주[^1]를 추가할 수 있습니다.

[^1]: 각주 내용입니다.

---

### 그래프 차트

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
### Mermaid 차트

{{< mermaid >}}
graph LR;
A[Lemons]-->B[Lemonade];
B-->C[Profit]
{{< /mermaid >}}

---

### Swatched (color showcase)
{{< swatches "#64748b" "#3b82f6" "#06b6d4" >}}

---

### TypeLt

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

**작성 팁:**
- Front matter의 `draft: true`를 `false`로 변경하면 배포됩니다
- `description`과 `summary`를 작성하면 SEO에 도움이 됩니다
- 이미지는 포스트 폴더에 함께 넣는 것을 권장합니다