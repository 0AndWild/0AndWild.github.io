+++
title = 'Giscus로 Hugo 블로그에 댓글 기능 추가하기'
date = '2025-10-17T12:00:00+09:00'
description = "GitHub Discussions 기반 댓글 시스템 Giscus를 Blowfish 테마에 통합하는 완벽 가이드"
summary = "무료로 Markdown 지원하는 댓글 시스템을 10분 만에 추가하는 방법"
categories = ["Blog", "Tutorial"]
tags = ["Hugo", "Giscus", "GitHub", "Blowfish", "Comments"]
series = ["Blog"]
series_order = 3

draft = false
+++

## Giscus란?

**Giscus**는 GitHub Discussions를 백엔드로 사용하는 오픈소스 댓글 시스템입니다.

### 주요 특징
- ✅ **완전 무료** (GitHub 기능 활용)
- ✅ **서버 불필요** (GitHub이 모든 것을 처리)
- ✅ **Markdown 완벽 지원** (코드 블록, 이미지, 표 등)
- ✅ **반응(Reactions)** (👍, ❤️, 😄 등)
- ✅ **GitHub 알림** (댓글 달리면 알림 받음)
- ✅ **다크모드** (블로그 테마와 자동 동기화)
- ✅ **데이터 소유** (본인 저장소에 저장)

### Utterances와의 차이점

| 기능 | Giscus | Utterances |
|------|--------|------------|
| 백엔드 | GitHub Discussions | GitHub Issues |
| 반응 | ✅ | ❌ |
| 대댓글 | ✅ (중첩) | ⚠️ (flat) |
| 댓글 정렬 | ✅ | ⚠️ |
| 적합성 | 댓글 전용 | 이슈 트래킹 |

**결론**: Giscus가 Utterances의 상위 호환입니다.

---

## 사전 준비

### 필요한 것
1. GitHub 계정
2. Public GitHub 저장소 (블로그 저장소)
3. Hugo + Blowfish 테마

### 제약사항
- ⚠️ **Public 저장소만 가능** (Private 저장소는 Discussions 기능 제한)
- ⚠️ **GitHub 계정 필요** (익명 댓글 불가)

---

## 1단계: GitHub Discussions 활성화

### 1.1 저장소 설정 페이지 이동

1. GitHub에서 블로그 저장소 접속
   ```
   예: https://github.com/0AndWild/0AndWild.github.io
   ```

2. **Settings** 탭 클릭

### 1.2 Discussions 활성화

1. 페이지를 아래로 스크롤하여 **Features** 섹션 찾기

2. **Discussions** 체크박스를 ✅ 체크

3. 자동으로 저장됨

### 1.3 확인

저장소 상단에 **Discussions** 탭이 생성되었는지 확인

```
Code | Issues | Pull requests | Discussions | ← 새로 생김!
```

---

## 2단계: Giscus App 설치

### 2.1 Giscus GitHub App 설치

1. [https://github.com/apps/giscus](https://github.com/apps/giscus) 접속

2. **Install** 버튼 클릭

3. 권한 선택:
   - **All repositories** (모든 저장소)
   - **Only select repositories** (특정 저장소만 - 권장)

4. 블로그 저장소 선택:
   ```
   0AndWild/0AndWild.github.io
   ```

5. **Install** 클릭

### 2.2 권한 확인

Giscus가 요청하는 권한:
- ✅ **Read access to discussions** (토론 읽기)
- ✅ **Write access to discussions** (토론 쓰기)
- ✅ **Read access to metadata** (메타데이터 읽기)

---

## 3단계: Giscus 설정 생성

### 3.1 Giscus 웹사이트 접속

[https://giscus.app/ko](https://giscus.app/ko) 방문

### 3.2 저장소 연결

**저장소** 섹션에 입력:
```
0AndWild/0AndWild.github.io
```

아래에 성공 메시지가 표시되어야 함:
```
✅ 성공! 이 저장소는 모든 조건을 만족합니다.
```

만약 오류가 뜨면:
- Discussions 활성화 확인
- Giscus App 설치 확인
- 저장소가 Public인지 확인

### 3.3 페이지 ↔️ Discussion 연결 방식

**Discussion 카테고리** 섹션에서 선택:

#### 권장: `pathname` (경로명)
```
매핑: pathname 선택
```

각 블로그 포스트의 경로가 Discussion 제목이 됩니다.

**예시**:
- 포스트: `/posts/giscus-guide/`
- Discussion 제목: `posts/giscus-guide`

#### 대안들:
- `URL`: 전체 URL 사용 (도메인 변경 시 문제)
- `title`: 포스트 제목 사용 (제목 변경 시 문제)
- `og:title`: OpenGraph 제목
- `specific term`: 직접 지정

**추천**: `pathname` 사용

### 3.4 Discussion 카테고리 선택

**Discussion 카테고리** 드롭다운에서 선택:

#### 권장: `Announcements`
```
카테고리: Announcements 선택
```

**특징**:
- 관리자만 새 Discussion 생성 가능
- 댓글은 누구나 가능
- 블로그 포스트용으로 최적

#### 대안: `General`
- 누구나 Discussion 생성 가능
- 더 개방적

**추천**: `Announcements` (블로그에 적합)

### 3.5 기능 선택

#### 반응 활성화
```
✅ 반응 활성화
```
사용자가 👍, ❤️, 😄 등으로 반응 가능

#### 메타데이터 보내기
```
□ 메타데이터 보내기 (체크 해제 권장)
```
불필요한 기능, 꺼두는 것이 좋음

#### 댓글 입력란 위치
```
⚪ 댓글 위에
⚪ 댓글 아래 (권장)
```

**권장**: 댓글 아래
- 기존 댓글을 먼저 읽고 작성하도록 유도

#### 느긋한 로딩
```
✅ 느긋한 로딩
```
페이지 로딩 속도 향상 (권장)

### 3.6 테마 선택

#### 권장: `preferred_color_scheme`
```
테마: preferred_color_scheme
```

**동작**:
- 사용자의 시스템 설정에 따라 자동 전환
- 다크모드 ↔️ 라이트모드 자동

#### 대안:
- `light`: 항상 밝은 테마
- `dark`: 항상 어두운 테마
- `transparent_dark`: 투명 다크
- 기타 GitHub 테마들

**추천**: `preferred_color_scheme` (자동 전환)

### 3.7 언어 설정
```
언어: ko (한국어)
```

---

## 4단계: 생성된 코드 복사

### 4.1 스크립트 복사

페이지 하단에 **Enable giscus** 섹션에서 생성된 코드 복사:

```html
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_kgDOxxxxxxxx"
        data-category="Announcements"
        data-category-id="DIC_kwDOxxxxxxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

### 4.2 중요한 값들

- `data-repo-id`: 저장소 고유 ID (자동 생성)
- `data-category-id`: 카테고리 고유 ID (자동 생성)

이 값들은 본인의 저장소마다 다르므로, 반드시 Giscus 웹사이트에서 생성된 코드를 사용해야 합니다.

---

## 5단계: Blowfish 테마에 통합

### 5.1 디렉토리 생성

터미널에서 블로그 루트 디렉토리로 이동 후:

```bash
mkdir -p layouts/partials
```

### 5.2 comments.html 파일 생성

```bash
touch layouts/partials/comments.html
```

또는 IDE/에디터에서 직접 생성:
```
layouts/
  └── partials/
      └── comments.html  ← 새로 생성
```

### 5.3 Giscus 코드 삽입

`layouts/partials/comments.html` 파일에 다음 내용 추가:

```html
<!-- Giscus 댓글 시스템 -->
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_kgDOxxxxxxxx"
        data-category="Announcements"
        data-category-id="DIC_kwDOxxxxxxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

⚠️ **주의**: 위의 `data-repo-id`와 `data-category-id` 값을 **본인의 값으로 교체**해야 합니다!

### 5.4 params.toml 설정

`config/_default/params.toml` 파일을 열고 `[article]` 섹션에 추가:

```toml
[article]
  showComments = true  # 이 줄 추가 또는 확인
  # ... 기타 설정들
```

이미 `showComments` 항목이 있다면 `true`로 설정되어 있는지 확인하세요.

---

## 6단계: 로컬 테스트

### 6.1 Hugo 서버 실행

```bash
hugo server -D
```

### 6.2 브라우저에서 확인

```
http://localhost:1313
```

포스트 페이지 하단에 Giscus 댓글 위젯이 표시되어야 합니다.

### 6.3 테스트 댓글 작성

1. **GitHub으로 로그인** 버튼 클릭
2. GitHub OAuth 인증
3. 테스트 댓글 작성
4. 댓글이 표시되는지 확인

### 6.4 GitHub Discussions 확인

1. GitHub 저장소 → **Discussions** 탭
2. Announcements 카테고리에 새 Discussion 생성되었는지 확인
3. Discussion 제목이 포스트 경로인지 확인

---

## 7단계: 배포

### 7.1 Git에 커밋

```bash
git add layouts/partials/comments.html
git add config/_default/params.toml
git commit -m "Add Giscus comments system"
```

### 7.2 GitHub에 푸시

```bash
git push origin main
```

### 7.3 GitHub Actions 확인

GitHub Actions가 자동으로 빌드 및 배포를 진행합니다.

배포 상태 확인:
```
GitHub 저장소 → Actions 탭
```

### 7.4 배포된 사이트 확인

```
https://0andwild.github.io
```

포스트 페이지에 댓글 위젯이 정상적으로 표시되는지 확인하세요.

---

## 고급 설정

### 다크모드 및 언어 동적 설정 (권장)

Blowfish 테마의 다크모드 토글과 언어 전환에 따라 Giscus가 자동으로 변경되도록 설정하는 완전한 방법입니다.

#### 완전한 동적 설정

`layouts/partials/comments.html` 전체 코드:

```html
<!-- Giscus Comments with Dynamic Theme and Language -->
{{ $lang := .Site.Language.Lang }}
{{ $translationKey := .File.TranslationBaseName }}
<script>
  (function() {
    // Get current theme (dark/light)
    function getGiscusTheme() {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? 'dark_tritanopia' : 'light_tritanopia';
    }

    // Get language from Hugo template
    const currentLang = '{{ $lang }}';

    // Use file directory path for unified comments across languages
    // Example: "posts/subscription_alert" for both index.ko.md and index.en.md
    const discussionId = '{{ .File.Dir | replaceRE "^content/" "" | replaceRE "/$" "" }}';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGiscus);
    } else {
      initGiscus();
    }

    function initGiscus() {
      // Create and insert Giscus script with dynamic settings
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.setAttribute('data-repo', '0AndWild/0AndWild.github.io');
      script.setAttribute('data-repo-id', 'R_kgDOQAqZFA');
      script.setAttribute('data-category', 'General');
      script.setAttribute('data-category-id', 'DIC_kwDOQAqZFM4CwwRg');
      script.setAttribute('data-mapping', 'specific');
      script.setAttribute('data-term', discussionId);
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'bottom');
      script.setAttribute('data-theme', getGiscusTheme());
      script.setAttribute('data-lang', currentLang);
      script.setAttribute('data-loading', 'lazy');
      script.setAttribute('crossorigin', 'anonymous');
      script.async = true;

      // Find giscus container or create one
      const container = document.querySelector('.giscus-container') || document.currentScript?.parentElement;
      if (container) {
        container.appendChild(script);
      }
    }

    // Monitor theme changes and update Giscus
    function updateGiscusTheme() {
      const iframe = document.querySelector('iframe.giscus-frame');
      if (!iframe) return;

      const theme = getGiscusTheme();

      try {
        iframe.contentWindow.postMessage(
          {
            giscus: {
              setConfig: {
                theme: theme
              }
            }
          },
          'https://giscus.app'
        );
      } catch (error) {
        console.log('Giscus theme update delayed, will retry...');
      }
    }

    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Delay update to ensure iframe is ready
          setTimeout(updateGiscusTheme, 100);
        }
      });
    });

    // Start observing after a short delay
    setTimeout(() => {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }, 500);

    // Update theme when Giscus iframe loads
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data.giscus) {
        // Giscus is ready, update theme
        setTimeout(updateGiscusTheme, 200);
      }
    });
  })();
</script>

<style>
  /* Ensure Giscus iframe has proper height and displays all content */
  .giscus-container {
    min-height: 300px;
  }

  .giscus-container iframe.giscus-frame {
    width: 100%;
    border: none;
    min-height: 300px;
  }

  /* Make sure comment actions are visible */
  .giscus {
    overflow: visible !important;
  }
</style>

<div class="giscus-container"></div>
```

#### 동작 방식 설명

##### 1. **언어 동적 설정**
```go
{{ $lang := .Site.Language.Lang }}
const currentLang = '{{ $lang }}';
```
- Hugo 템플릿에서 현재 페이지 언어 가져오기
- 한국어 페이지: `ko`, 영어 페이지: `en`
- Giscus에 해당 언어로 설정

**결과**:
- 한국어 페이지 → Giscus UI가 한국어로 표시
- 영어 페이지 → Giscus UI가 영어로 표시
- 언어 전환 시 페이지 리로드되면서 자동으로 변경

##### 2. **다크모드 동적 설정**
```javascript
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark_tritanopia' : 'light_tritanopia';
}
```
- Blowfish 테마는 다크모드 시 `<html class="dark">` 추가
- 이를 감지하여 테마 결정
- `dark_tritanopia` / `light_tritanopia` 테마 사용 (색맹 친화적)

**결과**:
- 페이지 로드 시: 현재 테마 상태로 Giscus 로드
- 다크모드 토글 클릭 시: 실시간으로 Giscus 테마 변경

##### 3. **언어별 댓글 통합**
```go
const discussionId = '{{ .File.Dir | replaceRE "^content/" "" | replaceRE "/$" "" }}';
```
- 파일 디렉토리 경로를 Discussion ID로 사용
- `content/posts/subscription_alert/index.ko.md` → `posts/subscription_alert`
- `content/posts/subscription_alert/index.en.md` → `posts/subscription_alert`
- **같은 ID이므로 한국어/영어 버전이 같은 댓글 공유**

**결과**:
- 한국어 포스트에서 작성한 댓글
- 영어 포스트에서도 동일하게 표시
- 포스트별로는 별도 Discussion 생성

##### 4. **실시간 테마 변경 감지**
```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      setTimeout(updateGiscusTheme, 100);
    }
  });
});
```
- `MutationObserver`로 HTML 클래스 변경 감지
- 다크모드 토글 클릭 시 즉시 감지
- `postMessage`로 Giscus iframe에 테마 변경 명령 전송

#### 테스트 방법

```bash
# 1. 로컬 서버 실행
hugo server -D

# 2. 브라우저에서 확인
http://localhost:1313/posts/subscription_alert/
```

**테스트 항목**:
1. ✅ 페이지 로드 시 현재 테마(라이트/다크)로 Giscus 표시
2. ✅ 다크모드 토글 클릭 시 Giscus 테마 즉시 변경
3. ✅ 언어 전환 (ko → en) 시 Giscus 언어 변경
4. ✅ 한국어/영어 페이지에서 같은 댓글 표시

#### 테마 옵션 변경

다른 테마를 사용하려면 `getGiscusTheme()` 함수 수정:

```javascript
// 기본 테마
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark' : 'light';
}

// 고대비 테마
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark_high_contrast' : 'light_high_contrast';
}

// GitHub 스타일 테마
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark_dimmed' : 'light';
}
```

**사용 가능한 테마**:
- `light` / `dark`
- `light_high_contrast` / `dark_high_contrast`
- `light_tritanopia` / `dark_tritanopia` (색맹 친화적)
- `dark_dimmed`
- `transparent_dark`
- `preferred_color_scheme` (시스템 설정 따름)

#### 정적 테마 설정 (간단한 방법)

동적 변경이 필요 없다면 정적으로 설정 가능:

```html
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_kgDOxxxxxxxx"
        data-category="General"
        data-category-id="DIC_kwDOxxxxxxxx"
        data-mapping="pathname"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        crossorigin="anonymous"
        async>
</script>
```

**장점**: 간단함
**단점**: 실시간 테마 변경 불가, 언어별 댓글 분리됨

### 포스트별 댓글 숨기기

특정 포스트에서만 댓글을 숨기려면, 해당 포스트의 front matter에:

```yaml
---
title: "댓글 없는 포스트"
showComments: false  # 이 포스트만 댓글 숨김
---
```

### 카테고리별 댓글 분리

다른 카테고리의 포스트에 다른 Discussion 카테고리를 사용하려면:

```html
<!-- 조건부 카테고리 설정 -->
<script>
  const category = {{ if in .Params.categories "Tutorial" }}
    "DIC_kwDOxxxxTutorial"
  {{ else }}
    "DIC_kwDOxxxxGeneral"
  {{ end }};
</script>

<script src="https://giscus.app/client.js"
        ...
        data-category-id="{{ category }}"
        ...>
</script>
```

---

## 문제 해결

### 댓글 위젯이 표시되지 않음

#### 원인 1: Discussions 미활성화
```bash
해결: GitHub 저장소 → Settings → Discussions 체크
```

#### 원인 2: Giscus App 미설치
```bash
해결: https://github.com/apps/giscus 에서 Install
```

#### 원인 3: 저장소 ID 오류
```bash
해결: giscus.app에서 코드 재생성
```

#### 원인 4: showComments 설정 누락
```toml
# config/_default/params.toml
[article]
  showComments = true  # 확인
```

### 로그인 버튼만 보이고 댓글 못 씀

#### 원인: GitHub OAuth 승인 필요
```bash
1. "GitHub으로 로그인" 클릭
2. OAuth 권한 승인
3. 저장소로 리다이렉트
4. 댓글 작성 가능
```

### 댓글이 저장되지 않음

#### 원인: 저장소 권한 문제
```bash
확인 사항:
1. 저장소가 Public인지
2. Giscus App 권한에 저장소 포함되어 있는지
3. Discussion 카테고리가 존재하는지
```

### 다크모드가 동기화 안 됨

#### 해결: JavaScript 동기화 코드 추가
위의 "고급 설정 > 다크모드 자동 전환" 참고

---

## Giscus 관리

### 댓글 관리

#### GitHub Discussions에서 관리
```bash
1. GitHub 저장소 → Discussions 탭
2. 해당 Discussion 클릭
3. 관리 작업:
   - 댓글 수정 (본인 댓글만)
   - 댓글 삭제 (관리자)
   - 사용자 차단 (관리자)
   - Discussion 잠금 (관리자)
```

### 스팸 댓글 처리

```bash
1. GitHub Discussions에서 스팸 댓글 찾기
2. 댓글 옆 ... 메뉴 → "Delete"
3. 사용자 차단: 프로필 → Block user
```

### 알림 설정

#### GitHub 알림으로 댓글 알림 받기
```bash
1. GitHub → Settings → Notifications
2. Watching에 저장소 추가
3. 이메일로 알림 받기 설정
```

#### 특정 Discussion만 알림 받기
```bash
1. Discussions 탭 → 해당 Discussion
2. 오른쪽 "Subscribe" 버튼
3. "Notify me" 선택
```

---

## 통계 및 분석

### 댓글 통계 보기

GitHub Discussions에서:
```bash
1. Discussions 탭
2. 카테고리별 Discussion 수 확인
3. 각 Discussion의 댓글 수 확인
```

### GitHub Insights 활용

```bash
GitHub 저장소 → Insights → Community
→ Discussions 활동 확인
```

---

## 비용 및 제한사항

### 비용
**완전 무료**
- GitHub 계정만 있으면 사용 가능
- 저장소 크기 제한 내에서 무제한 댓글

### 제한사항

#### GitHub API Rate Limit
- 시간당 60회 (미인증)
- 시간당 5,000회 (인증)
- Giscus는 캐싱으로 최적화되어 있어 문제 없음

#### 저장소 크기
- GitHub Free: 저장소당 1GB
- 텍스트 댓글만으로는 제한 도달 불가능

#### Discussions 제한
- 없음 (무제한)

---

## 대안 비교

### Giscus vs Utterances

| 항목 | Giscus | Utterances |
|------|--------|------------|
| 백엔드 | Discussions | Issues |
| 반응 | ✅ | ❌ |
| 대댓글 | 중첩 지원 | Flat |
| 추천 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**결론**: Giscus 사용 권장

### Giscus vs Disqus

| 항목 | Giscus | Disqus |
|------|--------|--------|
| 비용 | 무료 | 무료 (광고) |
| 광고 | ❌ | ✅ |
| 익명 댓글 | ❌ | ✅ (Guest) |
| Markdown | ✅ | ⚠️ |
| 데이터 소유 | ✅ | ❌ |
| 추천 | 개발자 블로그 | 일반 블로그 |

---

## 마이그레이션 가이드

### Utterances → Giscus

```bash
1. GitHub Issues를 Discussions로 변환
   - 수동 작업 필요 (자동화 없음)
   - 또는 Issues 그대로 두고 Giscus 새로 시작

2. comments.html 파일 교체
   - Utterances 코드 삭제
   - Giscus 코드 추가

3. 배포
```

### Disqus → Giscus

```bash
1. Disqus 데이터 Export (XML)
2. GitHub Discussions로 수동 이전
   - 자동화 도구 없음
   - 스크립트 직접 작성 필요
   - 또는 새로 시작 권장
```

---

## 추가 리소스

### 공식 문서
- [Giscus 공식 사이트](https://giscus.app/ko)
- [Giscus GitHub](https://github.com/giscus/giscus)

### 커뮤니티
- [Giscus Discussions](https://github.com/giscus/giscus/discussions)
- [Blowfish 문서](https://blowfish.page/docs/)

---

## 체크리스트

설치 완료 확인:

- [ ] GitHub Discussions 활성화
- [ ] Giscus App 설치
- [ ] `layouts/partials/comments.html` 생성
- [ ] Giscus 코드 삽입 (본인의 ID로)
- [ ] `params.toml`에 `showComments = true`
- [ ] 로컬 테스트 완료
- [ ] GitHub에 푸시
- [ ] 배포된 사이트에서 확인
- [ ] 테스트 댓글 작성
- [ ] GitHub Discussions에 생성 확인

---

## 결론

Giscus는 Hugo/GitHub Pages 블로그에 가장 적합한 댓글 시스템입니다:

### 장점 정리
✅ 완전 무료
✅ 설정 간단 (10분)
✅ 서버 불필요
✅ Markdown 완벽 지원
✅ GitHub 통합
✅ 데이터 소유

### 단점
❌ GitHub 계정 필수 (익명 불가)
❌ 기술 블로그에 적합 (일반 사용자는 허들 있음)

### 추천 대상
- ✅ 개발자 블로그
- ✅ 기술 문서
- ✅ 오픈소스 프로젝트
