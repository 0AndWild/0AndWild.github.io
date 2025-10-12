# 0AndWild Tech Blog

## Terminal 명령어

### 개발 서버 실행

```bash
hugo server
```

로컬 개발 서버를 시작합니다. 기본적으로 `http://localhost:1313`에서 사이트를 확인할 수 있습니다.

**주요 옵션:**

- `-D` 또는 `--buildDrafts`: 초안(draft) 콘텐츠도 함께 빌드합니다
- `--bind 0.0.0.0`: 모든 네트워크 인터페이스에서 접근 가능하도록 설정합니다
- `--port 8080`: 기본 포트(1313) 대신 다른 포트를 사용합니다
- 파일 변경 시 자동으로 브라우저가 새로고침됩니다 (Live Reload)

**예시:**


```bash
hugo server -D
hugo server --bind 0.0.0.0 --port 8080
```

### 프로덕션 빌드

```bash
hugo --cleanDestinationDir
```

프로덕션용 정적 사이트를 빌드합니다. `public/` 디렉토리에 결과물이 생성됩니다.

**주요 기능:**

- `--cleanDestinationDir`: 빌드 전에 대상 디렉토리(`public/`)를 완전히 정리합니다
- 이전 빌드의 불필요한 파일을 제거하여 깨끗한 상태로 빌드를 수행합니다
- 파일명이 변경되거나 삭제된 경우에도 이전 버전의 파일이 남아있지 않도록 보장합니다

**예시:**


```bash
hugo --cleanDestinationDir
hugo --cleanDestinationDir --minify  # 파일 최소화 옵션 추가
```

---

## 테마 정보

### Hugo Blowfish Theme

이 블로그는 [Blowfish](https://blowfish.page/) 테마를 사용합니다.

**특징:**
- 현대적이고 반응형 디자인
- 다크 모드 지원
- 빠른 로딩 속도와 SEO 최적화
- 다국어 지원
- 풍부한 커스터마이징 옵션


**설정 파일:**
- [config/_default/hugo.toml](config/_default/hugo.toml) - 기본 Hugo 설정
- [config/_default/params.toml](config/_default/params.toml) - Blowfish 테마 파라미터
- [config/_default/languages.en.toml](config/_default/languages.en.toml) - 언어별 설정
- [config/_default/menus.en.toml](config/_default/menus.en.toml) - 메뉴 구성

<br/>

---
<br/>

**Blowfish Creator:** [@nunocoracao](https://github.com/nunocoracao)
<br/>
**Creator Blog:** https://n9o.xyz/
<br/>
**Official Docs:** https://blowfish.page/docs/
<br/>
**License:** [MIT License](https://en.wikipedia.org/wiki/MIT_License)