+++
title = 'Hugo & GithubPages 블로그 댓글 시스템 구현 가이드'
date = '2025-10-17T11:00:00+09:00'
description = "Hugo/GitHub Pages에서 사용 가능한 모든 댓글 시스템 비교 분석 - 익명부터 GitHub 로그인까지"
summary = "Giscus, Utterances, Remark42, Disqus 등 모든 댓글 시스템의 장단점과 구현 방법"
categories = ["Blog", "Tutorial"]
tags = ["Hugo", "Comments", "GitHub Pages", "Giscus", "Static Site"]
series = ["Hugo"]
series_order = 4

draft = false
+++

## 개요

정적 사이트 생성기(Hugo)로 만든 블로그에 댓글 기능을 추가하는 모든 방법을 비교 분석합니다. **익명 댓글**, **GitHub 로그인**, **소셜 로그인** 등 다양한 요구사항에 맞는 솔루션을 제시합니다.

---

## 댓글 시스템 분류

### 인증 방식에 따른 분류

| 인증 방식 | 시스템 |
|----------|--------|
| **GitHub 전용** | Giscus, Utterances |
| **익명 가능** | Remark42, Commento, Comentario, HashOver |
| **익명 + 소셜 로그인** | Remark42, Commento, Disqus |
| **소셜 로그인만** | Disqus, Hyvor Talk |

### 호스팅 방식에 따른 분류

| 호스팅 | 시스템 |
|--------|--------|
| **SaaS (관리 불필요)** | Giscus, Utterances, Disqus, Hyvor Talk |
| **셀프 호스팅** | Remark42, Commento, Comentario, HashOver |
| **하이브리드** | Cusdis (Vercel 무료 배포) |

---

## 1. Giscus (최고 추천 - GitHub 사용자용)

### 개념
GitHub Discussions를 백엔드로 사용하는 댓글 시스템

### 동작 방식
```
1. 사용자가 블로그 방문
   ↓
2. Giscus 위젯 로드
   ↓
3. GitHub OAuth로 로그인
   ↓
4. 댓글 작성
   ↓
5. GitHub Discussions에 자동 저장
   ↓
6. 블로그에 실시간 표시
```

### 장점
- ✅ **완전 무료** (GitHub 기능 활용)
- ✅ **서버 불필요** (GitHub이 백엔드)
- ✅ **데이터 소유** (본인 저장소에 저장)
- ✅ **Markdown 지원** (코드 블록, 이미지 등)
- ✅ **반응(Reactions) 지원** (👍, ❤️ 등)
- ✅ **알림** (GitHub 알림으로 댓글 알림)
- ✅ **다크 모드** (블로그 테마와 동기화)
- ✅ **스팸 방지** (GitHub 계정 필요)
- ✅ **관리 간편** (GitHub Discussions에서 관리)
- ✅ **검색 가능** (GitHub 검색으로 댓글 검색)

### 단점
- ❌ **익명 댓글 불가** (GitHub 계정 필수)
- ❌ **기술 블로그에 적합** (일반 사용자는 GitHub 계정 없을 수 있음)
- ❌ **GitHub 의존성** (GitHub 장애 시 댓글 불가)

### 구현 난이도
⭐⭐ (2/5)

### 설정 방법

#### 1단계: GitHub Discussions 활성화
```bash
1. GitHub 저장소 → Settings
2. Features 섹션 → Discussions 체크
```

#### 2단계: Giscus 설정
1. [giscus.app](https://giscus.app/ko) 방문
2. 저장소 입력: `username/repository`
3. 설정 선택:
   - **페이지 ↔️ Discussion 연결**: `pathname` (권장)
   - **Discussion 카테고리**: `Announcements` 또는 `General`
   - **기능**: 반응, 댓글 위로
   - **테마**: 블로그에 맞게 선택

#### 3단계: Blowfish에 추가
```html
<!-- layouts/partials/comments.html -->
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="YOUR_REPO_ID"
        data-category="Announcements"
        data-category-id="YOUR_CATEGORY_ID"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        crossorigin="anonymous"
        async>
</script>
```

#### 4단계: params.toml 설정
```toml
[article]
  showComments = true
```

### 테마 동기화 (다크모드)
```javascript
<script>
  // 블로그 테마 변경 시 Giscus 테마도 변경
  const giscusTheme = document.querySelector('iframe.giscus-frame');
  if (giscusTheme) {
    const theme = document.documentElement.getAttribute('data-theme');
    giscusTheme.contentWindow.postMessage({
      giscus: {
        setConfig: {
          theme: theme === 'dark' ? 'dark' : 'light'
        }
      }
    }, 'https://giscus.app');
  }
</script>
```

### 비용
**완전 무료**

### 추천 대상
- ✅ 개발자 블로그
- ✅ 기술 문서
- ✅ 오픈소스 프로젝트 블로그

---

## 2. Utterances

### 개념
GitHub Issues를 백엔드로 사용하는 댓글 시스템 (Giscus의 전신)

### 동작 방식
```
1. GitHub OAuth 로그인
   ↓
2. 댓글 작성
   ↓
3. GitHub Issues에 저장 (각 포스트 = 1개 Issue)
   ↓
4. 블로그에 표시
```

### 장점
- ✅ 완전 무료
- ✅ 가벼움 (TypeScript)
- ✅ 간단한 설정
- ✅ Markdown 지원

### 단점
- ❌ **Issues 사용** (Discussions보다 덜 적합)
- ❌ Giscus보다 기능 적음
- ❌ 익명 불가

### Giscus vs Utterances

| 기능 | Giscus | Utterances |
|------|--------|------------|
| 백엔드 | Discussions | Issues |
| 반응 | ✅ | ❌ |
| 댓글에 댓글 | ✅ (nested) | ⚠️ (flat) |
| 적합성 | 댓글 전용 | 이슈 트래킹용 |

**결론**: Giscus가 Utterances의 상위 호환

### 구현 난이도
⭐⭐ (2/5)

### 설정 방법
```html
<!-- layouts/partials/comments.html -->
<script src="https://utteranc.es/client.js"
        repo="username/repository"
        issue-term="pathname"
        theme="github-light"
        crossorigin="anonymous"
        async>
</script>
```

### 추천 대상
- 특별한 이유가 없다면 **Giscus 사용 권장**

---

## 3. Remark42 (최고 추천 - 익명 + 소셜 로그인)

### 개념
오픈소스 셀프 호스팅 댓글 시스템으로, 익명 및 다양한 소셜 로그인 지원

### 동작 방식
```
1. Remark42 서버 배포 (Docker)
   ↓
2. 블로그에 Remark42 스크립트 삽입
   ↓
3. 사용자 선택:
   - 익명 댓글 작성
   - GitHub/Google/Twitter 로그인 후 작성
   ↓
4. Remark42 DB에 저장
   ↓
5. 블로그에 표시
```

### 장점
- ✅ **익명 댓글 가능** (설정으로 켜고 끌 수 있음)
- ✅ **다양한 소셜 로그인** (GitHub, Google, Facebook, Twitter, Email)
- ✅ **완전 무료** (오픈소스)
- ✅ **광고 없음**
- ✅ **데이터 소유** (본인 서버)
- ✅ **Markdown 지원**
- ✅ **댓글 수정/삭제**
- ✅ **관리자 모드** (댓글 승인/차단/삭제)
- ✅ **알림** (이메일/Telegram)
- ✅ **Import/Export** (다른 시스템에서 마이그레이션)
- ✅ **투표** (찬성/반대)
- ✅ **스팸 필터**

### 단점
- ❌ **셀프 호스팅 필요** (Docker 서버)
- ❌ **유지보수 책임**
- ❌ **호스팅 비용** (월 $5~, 무료 티어 가능)

### 구현 난이도
⭐⭐⭐⭐ (4/5)

### 호스팅 옵션

#### 옵션 1: Railway (추천)
```bash
1. Railway.app 회원가입
2. "New Project" → "Deploy from GitHub"
3. Remark42 Docker 이미지 선택
4. 환경변수 설정:
   - REMARK_URL=https://your-remark42.railway.app
   - SECRET=your-random-secret
   - AUTH_ANON=true  # 익명 댓글 허용
   - AUTH_GITHUB_CID=your_client_id
   - AUTH_GITHUB_CSEC=your_client_secret
```

**Railway 무료 티어**:
- 월 $5 크레딧
- 소규모 블로그 충분

#### 옵션 2: Fly.io
```bash
# fly.toml
app = "my-remark42"

[build]
  image = "umputun/remark42:latest"

[env]
  REMARK_URL = "https://my-remark42.fly.dev"
  AUTH_ANON = "true"
  AUTH_GITHUB_CID = "xxx"
  AUTH_GITHUB_CSEC = "xxx"
```

```bash
fly launch
fly deploy
```

**Fly.io 무료 티어**:
- 3개 앱
- 소규모 블로그 충분

#### 옵션 3: Docker Compose (VPS)
```yaml
# docker-compose.yml
version: '3.8'

services:
  remark42:
    image: umputun/remark42:latest
    restart: always
    environment:
      - REMARK_URL=https://remark.your-blog.com
      - SECRET=your-secret-key-change-this
      - AUTH_ANON=true                    # 익명 허용
      - AUTH_GITHUB_CID=xxx               # GitHub 로그인
      - AUTH_GITHUB_CSEC=xxx
      - AUTH_GOOGLE_CID=xxx               # Google 로그인
      - AUTH_GOOGLE_CSEC=xxx
      - ADMIN_SHARED_ID=github_username   # 관리자
    volumes:
      - ./data:/srv/var
    ports:
      - "8080:8080"
```

```bash
docker-compose up -d
```

### 블로그 삽입 코드
```html
<!-- layouts/partials/comments.html -->
<div id="remark42"></div>
<script>
  var remark_config = {
    host: 'https://your-remark42.railway.app',
    site_id: '0andwild-blog',
    components: ['embed'],
    theme: 'light',
    locale: 'ko',
    max_shown_comments: 10,
    simple_view: false,
    no_footer: false
  };

  (function(c) {
    for(var i = 0; i < c.length; i++){
      var d = document, s = d.createElement('script');
      s.src = remark_config.host + '/web/' +c[i] +'.js';
      s.defer = true;
      (d.head || d.body).appendChild(s);
    }
  })(remark_config.components || ['embed']);
</script>
```

### 익명 + GitHub 동시 사용 설정
```bash
# 환경변수
AUTH_ANON=true              # 익명 허용
AUTH_GITHUB_CID=xxx         # GitHub OAuth App ID
AUTH_GITHUB_CSEC=xxx        # GitHub OAuth App Secret
ANON_VOTE=false             # 익명 사용자 투표 불가 (스팸 방지)
```

사용자는 선택 가능:
- "익명으로 댓글 달기"
- "GitHub으로 로그인"

### 관리자 기능
```bash
# 관리자 지정
ADMIN_SHARED_ID=github_yourusername

# 또는 이메일
ADMIN_SHARED_EMAIL=you@example.com
```

관리자 가능 작업:
- 댓글 삭제
- 사용자 차단
- 댓글 고정
- 읽기 전용 모드

### 비용
- **Railway**: 무료 또는 월 $5
- **Fly.io**: 무료 티어 가능
- **VPS (DigitalOcean 등)**: 월 $5~

### 추천 대상
- ✅ **익명 + 소셜 로그인 모두 원하는 경우**
- ✅ 기술적으로 Docker 다룰 수 있는 사용자
- ✅ 데이터 완전 통제 원하는 경우

---

## 4. Commento / Comentario

### 개념
프라이버시 중심의 경량 댓글 시스템

### Commento vs Comentario

| 항목 | Commento | Comentario |
|------|----------|------------|
| 상태 | 개발 중단 | 활발히 개발 중 (Commento 포크) |
| 라이선스 | MIT | MIT |
| 언어 | Go | Go |
| 추천 | ❌ | ✅ |

**결론**: Comentario 사용 권장

### Comentario 장점
- ✅ 익명 댓글 가능
- ✅ 소셜 로그인 (GitHub, Google, GitLab, SSO)
- ✅ 가벼움 (Go 기반)
- ✅ 프라이버시 중심
- ✅ Markdown 지원
- ✅ 투표 기능

### 단점
- ❌ 셀프 호스팅 필요
- ❌ Remark42보다 기능 적음

### 구현 난이도
⭐⭐⭐⭐ (4/5)

### Docker 배포
```yaml
version: '3.8'

services:
  comentario:
    image: registry.gitlab.com/comentario/comentario
    ports:
      - "8080:8080"
    environment:
      - COMENTARIO_ORIGIN=https://comments.your-blog.com
      - COMENTARIO_BIND=0.0.0.0:8080
      - COMENTARIO_POSTGRES=postgres://user:pass@db/comentario
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=comentario
      - POSTGRES_USER=comentario
      - POSTGRES_PASSWORD=change-this
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 블로그 삽입
```html
<script defer src="https://comments.your-blog.com/js/commento.js"></script>
<div id="commento"></div>
```

### 추천 대상
- Remark42 대안
- 더 간단한 시스템 원하는 경우

---

## 5. Disqus (전통적 SaaS)

### 개념
가장 오래되고 널리 사용되는 클라우드 댓글 시스템

### 동작 방식
```
1. Disqus 계정 생성 및 사이트 등록
   ↓
2. 블로그에 Disqus 스크립트 삽입
   ↓
3. 사용자 선택:
   - Guest (익명 - 이메일 필요)
   - Disqus 계정
   - Facebook/Twitter/Google 로그인
   ↓
4. Disqus 서버에 저장
   ↓
5. 블로그에 표시
```

### 장점
- ✅ **설정 초간단** (5분)
- ✅ **서버 불필요** (SaaS)
- ✅ **Guest 모드** (이메일만으로 댓글)
- ✅ **소셜 로그인** (Facebook, Twitter, Google)
- ✅ **강력한 관리자 도구**
- ✅ **스팸 필터** (Akismet 통합)
- ✅ **모바일 앱** (iOS/Android)
- ✅ **분석/통계**

### 단점
- ❌ **광고 표시** (무료 플랜)
- ❌ **무거움** (스크립트 크기)
- ❌ **프라이버시 우려** (데이터 추적)
- ❌ **데이터 소유권 없음** (Disqus 서버)
- ❌ **GitHub 로그인 없음**
- ❌ **광고 제거 비용** (월 $11.99~)

### 구현 난이도
⭐ (1/5) - 가장 쉬움

### 설정 방법

#### 1단계: Disqus 사이트 등록
```bash
1. disqus.com 가입
2. "I want to install Disqus on my site" 선택
3. Website Name 입력 (예: andwild-blog)
4. Category 선택
5. Plan 선택 (Basic - Free)
```

#### 2단계: Blowfish 설정
```toml
# config/_default/config.toml
[services.disqus]
  shortname = "andwild-blog"  # 1단계에서 생성한 이름
```

```toml
# config/_default/params.toml
[article]
  showComments = true
```

Hugo는 Disqus를 기본 지원하므로 자동으로 댓글 표시됨!

#### 3단계: Guest 댓글 허용
```bash
Disqus Dashboard → Settings → Community
→ Guest Commenting: Allow guests to comment (체크)
```

### 광고 제거 방법

#### 방법 1: 유료 플랜 ($11.99/월~)
- Plus Plan: 광고 없음
- Pro Plan: 광고 없음 + 고급 기능

#### 방법 2: CSS로 숨기기 (비추천 - 약관 위반 가능)
```css
/* 비추천: Disqus 약관 위반 가능 */
#disqus_thread iframe[src*="ads"] {
  display: none !important;
}
```

### 비용
- **무료**: 광고 있음
- **Plus**: $11.99/월 (광고 없음)
- **Pro**: $89/월 (고급 기능)

### 추천 대상
- ✅ 빠르게 댓글 추가하고 싶은 경우
- ✅ 비기술적 블로거
- ✅ 광고 신경 안 쓰는 경우
- ❌ 프라이버시 중시하는 경우는 비추천

---

## 6. Cusdis (Vercel 무료 배포)

### 개념
경량 오픈소스 댓글 시스템, Vercel에 무료 배포 가능

### 동작 방식
```
1. Cusdis를 Vercel에 배포 (1-Click)
   ↓
2. PostgreSQL 연결 (Vercel 무료)
   ↓
3. 대시보드에서 사이트 추가
   ↓
4. 블로그에 스크립트 삽입
   ↓
5. 사용자가 이메일 + 이름으로 댓글
```

### 장점
- ✅ **완전 무료** (Vercel 무료 티어)
- ✅ **익명 댓글** (이메일 + 이름만)
- ✅ **가벼움** (50KB)
- ✅ **설정 간단** (Vercel 1-Click 배포)
- ✅ **프라이버시 중심**
- ✅ **오픈소스**

### 단점
- ❌ Markdown 미지원
- ❌ 소셜 로그인 없음
- ❌ 기능 단순

### 구현 난이도
⭐⭐⭐ (3/5)

### 설정 방법

#### 1단계: Vercel 배포
```bash
1. https://cusdis.com/ 방문
2. "Deploy with Vercel" 클릭
3. GitHub 연결
4. PostgreSQL 추가 (Vercel Storage)
5. 배포 완료
```

#### 2단계: 사이트 추가
```bash
1. 배포된 Cusdis 대시보드 접속
2. "Add Website" 클릭
3. Domain 입력: 0andwild.github.io
4. App ID 복사
```

#### 3단계: 블로그 삽입
```html
<!-- layouts/partials/comments.html -->
<div id="cusdis_thread"
  data-host="https://your-cusdis.vercel.app"
  data-app-id="YOUR_APP_ID"
  data-page-id="{{ .File.UniqueID }}"
  data-page-url="{{ .Permalink }}"
  data-page-title="{{ .Title }}">
</div>
<script async defer src="https://your-cusdis.vercel.app/js/cusdis.es.js"></script>
```

### 비용
**완전 무료** (Vercel 무료 티어)

### 추천 대상
- ✅ 간단한 익명 댓글만 필요한 경우
- ✅ 완전 무료 원하는 경우
- ✅ Vercel 사용 경험 있는 경우

---

## 7. HashOver

### 개념
PHP 기반의 완전 익명 댓글 시스템

### 장점
- ✅ 완전 익명 (아무 정보도 필요 없음)
- ✅ PHP + flat file (DB 불필요)
- ✅ 오픈소스

### 단점
- ❌ PHP 필요 (정적 사이트에 부적합)
- ❌ GitHub 로그인 없음
- ❌ 오래된 프로젝트

### 구현 난이도
⭐⭐⭐⭐ (4/5)

### 추천 대상
- ❌ **정적 블로그에는 비추천**
- PHP 서버 있을 때만 고려

---

## 8. Hyvor Talk (프리미엄 SaaS)

### 개념
광고 없는 프리미엄 댓글 시스템

### 장점
- ✅ 광고 없음
- ✅ 익명 댓글 가능
- ✅ 소셜 로그인
- ✅ 강력한 스팸 필터

### 단점
- ❌ **유료** (월 $5~)
- ❌ GitHub 로그인 없음

### 비용
- **Starter**: $5/월 (1 사이트)
- **Pro**: $15/월 (3 사이트)

### 추천 대상
- Disqus 유료 대안
- 광고 없는 SaaS 원하는 경우

---

## 비교표

### 인증 방식별
| 시스템 | 익명 | GitHub | Google | 기타 소셜 | 난이도 | 비용 |
|--------|------|--------|--------|----------|--------|------|
| **Giscus** | ❌ | ✅ | ❌ | ❌ | ⭐⭐ | 무료 |
| Utterances | ❌ | ✅ | ❌ | ❌ | ⭐⭐ | 무료 |
| **Remark42** | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ | $5/월 |
| Comentario | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ | $5/월 |
| **Disqus** | ⚠️ | ❌ | ✅ | ✅ | ⭐ | 무료 (광고) |
| Cusdis | ✅ | ❌ | ❌ | ❌ | ⭐⭐⭐ | 무료 |
| Hyvor Talk | ✅ | ❌ | ✅ | ✅ | ⭐ | $5/월 |

### 기능별
| 시스템 | Markdown | 반응 | 투표 | 알림 | 관리자 | 스팸필터 |
|--------|----------|------|------|------|--------|----------|
| Giscus | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ |
| Remark42 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Disqus | ⚠️ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cusdis | ❌ | ❌ | ❌ | ⚠️ | ✅ | ⚠️ |

### 호스팅별
| 시스템 | 호스팅 | 데이터 위치 | 의존성 |
|--------|--------|------------|--------|
| Giscus | GitHub | GitHub Discussions | GitHub |
| Remark42 | 셀프 | 본인 서버 | Docker |
| Disqus | Disqus | Disqus 서버 | Disqus |
| Cusdis | Vercel | Vercel DB | Vercel |

---

## 선택 가이드

### 시나리오별 추천

#### 1. "개발자 블로그, GitHub 사용자 대상"
→ **Giscus** ⭐⭐⭐⭐⭐
- 무료, 간단, Markdown 지원
- GitHub 통합으로 알림도 편함

#### 2. "일반 블로그, 익명 댓글 필수"
→ **Cusdis** (간단) 또는 **Remark42** (고급)
- Cusdis: 5분 설정, 완전 무료
- Remark42: 더 많은 기능, 소셜 로그인 포함

#### 3. "익명 + GitHub 로그인 둘 다"
→ **Remark42** ⭐⭐⭐⭐⭐
- 유일하게 둘 다 지원
- 관리자 기능 강력

#### 4. "기술 없음, 빠르게 설정"
→ **Disqus**
- 5분 설정
- 광고는 감수

#### 5. "완전 무료 + 서버 관리 싫음"
→ **Giscus** (GitHub) 또는 **Cusdis** (익명)

#### 6. "프라이버시 최우선"
→ **Remark42** 또는 **Comentario** (셀프 호스팅)
- 데이터 완전 통제

---

## 실전 구현: Blowfish + Giscus

### 전체 설정 과정

#### 1. GitHub Discussions 활성화
```bash
GitHub 저장소 → Settings → Features → Discussions 체크
```

#### 2. Giscus App 설치
```bash
https://github.com/apps/giscus 방문 → Install
→ 저장소 선택
```

#### 3. Giscus 설정 생성
[giscus.app/ko](https://giscus.app/ko)에서:
```
저장소: 0AndWild/0AndWild.github.io
매핑: pathname
카테고리: Announcements
테마: preferred_color_scheme
언어: ko
```

생성된 코드 복사

#### 4. 파일 생성
```bash
# 디렉토리 생성 (없으면)
mkdir -p layouts/partials

# 파일 생성
touch layouts/partials/comments.html
```

#### 5. 코드 삽입
```html
<!-- layouts/partials/comments.html -->
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_xxxxxxxxxxxxx"
        data-category="Announcements"
        data-category-id="DIC_xxxxxxxxxxxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        crossorigin="anonymous"
        async>
</script>
```

#### 6. params.toml 수정
```toml
[article]
  showComments = true
```

#### 7. 로컬 테스트
```bash
hugo server -D
# http://localhost:1313 에서 확인
```

#### 8. 배포
```bash
git add .
git commit -m "Add Giscus comments"
git push
```

---

## 실전 구현: Blowfish + Remark42 (Railway)

### 전체 설정 과정

#### 1. GitHub OAuth App 생성
```bash
GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

Application name: AndWild Blog Comments
Homepage URL: https://0andwild.github.io
Authorization callback URL: https://your-remark42.railway.app/auth/github/callback

생성 후:
Client ID 복사
Client Secret 생성 및 복사
```

#### 2. Railway 배포
```bash
1. railway.app 가입
2. "New Project" → "Deploy Docker Image"
3. Image: umputun/remark42:latest
4. 환경변수 추가:
```

```bash
REMARK_URL=https://your-project.railway.app
SECRET=randomly-generated-secret-key-change-this
SITE=0andwild-blog
AUTH_ANON=true
AUTH_GITHUB_CID=your_github_client_id
AUTH_GITHUB_CSEC=your_github_client_secret
ADMIN_SHARED_ID=github_yourusername
```

#### 3. 배포 확인
```bash
Railway가 자동으로 URL 생성:
https://your-project.railway.app

브라우저에서 접속하여 Remark42 UI 확인
```

#### 4. Blowfish 설정
```bash
mkdir -p layouts/partials
touch layouts/partials/comments.html
```

```html
<!-- layouts/partials/comments.html -->
<div id="remark42"></div>
<script>
  var remark_config = {
    host: 'https://your-project.railway.app',
    site_id: '0andwild-blog',
    components: ['embed'],
    theme: 'light',
    locale: 'ko'
  };

  (function(c) {
    for(var i = 0; i < c.length; i++){
      var d = document, s = d.createElement('script');
      s.src = remark_config.host + '/web/' +c[i] +'.js';
      s.defer = true;
      (d.head || d.body).appendChild(s);
    }
  })(remark_config.components || ['embed']);
</script>
```

#### 5. params.toml
```toml
[article]
  showComments = true
```

#### 6. 테스트 및 배포
```bash
hugo server -D
# 확인 후
git add .
git commit -m "Add Remark42 comments"
git push
```

---

## 마이그레이션 가이드

### Disqus → Giscus
```bash
1. Disqus에서 데이터 Export (XML)
2. GitHub Discussions로 수동 이전
   (자동화 스크립트 없음, 수동 작업 필요)
```

### Disqus → Remark42
```bash
1. Disqus XML Export
2. Remark42 Admin → Import → Disqus 선택
3. XML 파일 업로드
```

---

## 결론

### 최종 추천

| 상황 | 추천 시스템 | 이유 |
|------|------------|------|
| **개발자 블로그** | **Giscus** | 무료, GitHub 통합, Markdown |
| **일반 블로그 (익명 필요)** | **Cusdis** | 무료, 간단, 익명 |
| **익명 + 소셜 둘 다** | **Remark42** | 유연함, 모든 기능 |
| **빠른 설정** | **Disqus** | 5분 완료 (광고 감수) |
| **완전 통제** | **Remark42** | 셀프 호스팅, 커스터마이징 |

### 개인 추천 (0AndWild 블로그)
**Giscus** 사용 권장
- GitHub Pages 블로그에 완벽히 어울림
- 기술 블로그는 GitHub 사용자가 주 독자
- 무료, 간단, 유지보수 없음

**대안**: Remark42 (익명 댓글 원할 때)

---

## 빠른시작

1. **Giscus로 시작** (10분)
2. 사용자 피드백 수집
3. 익명 댓글 요청 많으면 **Remark42로 전환** 고려

댓글 시스템은 나중에도 바꿀 수 있으니, 일단 Giscus로 시작하는 것을 강력히 권장합니다!
