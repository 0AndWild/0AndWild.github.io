+++
title = 'Hugo & GithubPages 블로그로 넘어온 이유'
date = '2025-10-15T17:21:09+09:00'
description = "Tstory에서 Hugo & GitHub Pages로 기술 블로그를 마이그레이션한 이유와 선택 기준"
summary = "마크다운 호환성, Open API 지원 종료, 그리고 더 나은 개발자 경험을 위해 Hugo로 블로그를 옮긴 이야기"
categories = ["Blog"]
tags = ["Hugo", "GitHub Pages", "Blog", "Migration"]
series = ["Hugo"]
series_order = 1

draft = false
+++

## 왜 Hugo & GitHub Pages로 넘어왔는가?

기존 [**Tstory**](https://0andwild.tistory.com/)로 운영하였던 기술 블로그를 **Hugo & GitHub Pages**로 마이그레이션을 하기로 결심하게 되었다.

### 1. 흩어진 콘텐츠 관리의 어려움

여러가지 노트 툴을 사용하다보니 회사를 다니면서 또는 공부를 하면서 정리하는 글들이 중구난방하게 흩어지게 되었고 이걸 또 다시 블로그로 옮겨야 하는 번거로움이 생겨 블로그 관리를 소홀히 하게 되었다.

### 2. 마크다운 호환성 문제

기존 노트 툴에서 사용하는 마크다운 문법이 Tstory에서 글을 올릴때 완벽히 호환되지 않아 수정을 해야하는 일들이 자주 발생했었고 이 또한 번거로움이 생기는 일이였다.

특히 다음과 같은 문제들이 있었다:
- 코드 블록의 syntax highlighting 지원 부족
- 테이블 렌더링 오류
- 이미지 경로 처리 문제
- 수식 표현의 제한

### 3. Tstory Open API 지원 종료

마지막으로는 최근에 다시 그동안 공부한 자료들을 다시 정리해서 Tstory에 올릴겸 블로그 스킨도 다시 이쁘게 꾸미고 **Tstory 공식 Open API**를 활용하여 기존 노트 툴들과 연동하는 작업을 진행해보려 하였지만 Open API의 공식 지원이 종료 되어있었고 더이상 Tstory를 사용할 이유가 없어졌다.

### 블로그 플랫폼 선택 기준

여러 블로그를 참고하여 어떤 방식이 좋을지 고민을 많이 하였고 아래와 같이 기준점을 가지고 **Hugo & GitHub Pages**로 확정을 하게 되었다.

- **블로그를 구축하는게 쉬운가?**
- **코드로 관리가 가능한가?**
- **내가 원하는 기능을 추가하는 자유도가 높은가?**
- **GitHub Pages를 사용해서 빌드하고 배포할때 속도가 빠른가?**
- **Obsidian과 같은 노트 툴들과 연동하기 편한가?**

---

## Hugo란?

[**Hugo**](https://gohugo.io/)는 **Go 언어**로 작성된 빠르고 유연한 **정적 사이트 생성기**(Static Site Generator)이다.

**주요 특징:**
- **빠른 빌드 속도**: 수천 개의 페이지도 몇 초 안에 빌드된다
- **단순한 구조**: Markdown으로 콘텐츠를 작성하면 Hugo가 HTML로 변환해준다
- **제로 의존성**: 단일 바이너리로 실행되며 별도의 런타임이나 데이터베이스가 필요없다
- **풍부한 테마 생태계**: 다양한 용도의 테마를 쉽게 적용할 수 있다

## GitHub Pages와 함께 사용되는 정적 사이트 생성기 비교

| 특징 | Hugo | Jekyll | Gatsby | Next.js (SSG) | VuePress |
|------|------|--------|--------|---------------|----------|
| **언어** | Go | Ruby | React (JavaScript) | React (JavaScript) | Vue.js |
| **빌드 속도** | ⚡ 매우 빠름 (< 1ms/page) | 🐢 느림 | 🚶 보통 | 🚶 보통 | 🚶 보통 |
| **설치 복잡도** | ✅ 단일 바이너리 | ⚠️ Ruby 환경 필요 | ⚠️ Node.js + 많은 의존성 | ⚠️ Node.js + 의존성 | ⚠️ Node.js + 의존성 |
| **GitHub Pages 기본 지원** | ❌ (Actions 필요) | ✅ 네이티브 지원 | ❌ (Actions 필요) | ❌ (Actions 필요) | ❌ (Actions 필요) |
| **학습 곡선** | 낮음 | 낮음 | 높음 | 중간-높음 | 중간 |
| **테마/플러그인** | 풍부 | 매우 풍부 | 풍부 (React 생태계) | 풍부 (React 생태계) | 보통 |
| **적합한 용도** | 블로그, 문서, 포트폴리오 | 블로그, GitHub 기본 | 복잡한 웹앱, 블로그 | 복잡한 웹앱, 하이브리드 | 기술 문서 |
| **빌드 시간 (1000 페이지)** | ~1초 | ~2분 | ~30초 | ~30초 | ~20초 |

**Hugo를 선택한 이유:**
- **압도적인 빌드 속도**: 콘텐츠가 많아져도 빌드 시간이 거의 증가하지 않는다
- **간단한 설정**: 복잡한 JavaScript 프레임워크 없이 Markdown에 집중할 수 있다
- **제로 의존성**: 단일 실행 파일로 환경 설정 문제가 없다
- **풍부한 테마**: Blowfish 같은 고품질 테마를 쉽게 적용할 수 있다

---

## GitHub Pages 배포

Hugo로 작성한 블로그는 **GitHub Actions**를 통해 자동으로 빌드되고 배포된다.

### 배포 워크플로우

1. `main` 브랜치에 변경사항을 push한다
2. GitHub Actions가 자동으로 트리거된다
3. Hugo가 정적 사이트를 빌드한다
4. 빌드된 파일이 GitHub Pages로 자동 배포된다

### 장점

- **자동화된 배포**: 코드를 push하면 자동으로 배포가 진행된다
- **버전 관리**: Git을 통해 모든 변경사항을 추적할 수 있다
- **무료 호스팅**: GitHub Pages는 무료로 제공된다
- **커스텀 도메인**: 원하는 도메인을 연결할 수 있다
- **HTTPS 지원**: 기본적으로 HTTPS가 제공된다

---

## Obsidian 연동

Hugo는 마크다운 기반이기 때문에 **Obsidian**과 같은 노트 툴과 완벽하게 호환된다.

### 연동 방법

1. Hugo 블로그의 `content/posts` 디렉토리를 Obsidian vault로 설정한다
2. Obsidian에서 글을 작성하고 편집한다
3. 작성이 완료되면 Git을 통해 commit & push한다
4. GitHub Actions가 자동으로 빌드하고 배포한다

### 이점

- **일관된 작성 환경**: 모든 노트와 블로그 글을 같은 툴에서 관리한다
- **완벽한 마크다운 호환**: 추가 변환 작업이 필요없다
- **로컬 우선**: 인터넷 없이도 글을 작성할 수 있다
- **강력한 링크 기능**: Obsidian의 백링크와 그래프 뷰를 활용할 수 있다

---

## 기본적인 Hugo Terminal 명령어

### 개발 서버 실행

```bash
hugo server
```

로컬 개발 서버를 시작한다. 기본적으로 `http://localhost:1313`에서 사이트를 확인할 수 있다.

**주요 옵션:**

- `-D` 또는 `--buildDrafts`: 초안(draft) 콘텐츠도 함께 빌드한다
- `--bind 0.0.0.0`: 모든 네트워크 인터페이스에서 접근 가능하도록 설정한다
- `--port 8080`: 기본 포트(1313) 대신 다른 포트를 사용한다
- 파일 변경 시 자동으로 브라우저가 새로고침된다 (Live Reload)

**예시:**

```bash
hugo server -D
hugo server --bind 0.0.0.0 --port 8080
```

### 프로덕션 빌드

```bash
hugo --cleanDestinationDir
```

프로덕션용 정적 사이트를 빌드한다. `public/` 디렉토리에 결과물이 생성된다.

**주요 기능:**

- `--cleanDestinationDir`: 빌드 전에 대상 디렉토리(`public/`)를 완전히 정리한다
- 이전 빌드의 불필요한 파일을 제거하여 깨끗한 상태로 빌드를 수행한다
- 파일명이 변경되거나 삭제된 경우에도 이전 버전의 파일이 남아있지 않도록 보장한다

**예시:**

```bash
hugo --cleanDestinationDir
hugo --cleanDestinationDir --minify  # 파일 최소화 옵션 추가
```

---

## 테마 정보

### Hugo Blowfish Theme

이 블로그는 [**Blowfish**](https://blowfish.page/) 테마를 사용하고 있다.

**특징:**
- 현대적이고 반응형 디자인을 제공한다
- 다크 모드를 지원한다
- 빠른 로딩 속도와 SEO 최적화가 되어있다
- 다국어를 지원한다
- 풍부한 커스터마이징 옵션을 제공한다

**설정 파일:**
- `config/_default/hugo.toml` - 기본 Hugo 설정
- `config/_default/params.toml` - Blowfish 테마 파라미터
- `config/_default/languages.en.toml` - 언어별 설정
- `config/_default/menus.en.toml` - 메뉴 구성

---

## 마치며

Tstory에서 Hugo & GitHub Pages로의 마이그레이션은 개발자 친화적인 환경을 위한 선택이었다. 이제는 코드 버전 관리와 동일한 방식으로 블로그를 관리할 수 있게 되었고, Obsidian과의 완벽한 연동으로 노트 작성부터 블로그 포스팅까지 하나의 워크플로우로 통합할 수 있게 되었다.

무엇보다 Hugo의 빠른 빌드 속도와 GitHub Actions의 자동화된 배포는 글 작성에만 집중할 수 있게 해주었고, 더 이상 플랫폼의 제약에 얽매이지 않고 자유롭게 커스터마이징할 수 있게 되었다.

앞으로는 Tstory에 있던 기존 글들을 천천히 마이그레이션하면서 새로운 콘텐츠도 꾸준히 추가해 나갈 예정이다.

---

### 참고 자료

- **Hugo Official Site:** https://gohugo.io/
- **Blowfish Theme:** https://blowfish.page/
- **Blowfish Creator:** [@nunocoracao](https://github.com/nunocoracao)
- **Creator Blog:** https://n9o.xyz/
- **Official Docs:** https://blowfish.page/docs/