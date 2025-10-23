# 0AndWild 기술 블로그

[![Hugo](https://img.shields.io/badge/Hugo-FF4088?style=for-the-badge&logo=hugo&logoColor=white)](https://gohugo.io/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> Hugo와 GitHub Pages로 구동되는 개인 기술 블로그입니다. Blowfish 테마를 사용합니다.

## 📖 소개

소프트웨어 개발, 인프라, 그리고 다양한 기술 탐험의 여정을 기록하는 기술 블로그입니다. 더 나은 마크다운 지원, 버전 관리, 그리고 노트 작성 툴과의 원활한 연동을 위해 Tstory에서 마이그레이션했습니다.

**블로그 URL:** [0andwild.github.io](https://0andwild.github.io)

**이전 블로그:** [0andwild.tistory.com](https://0andwild.tistory.com/)


## 🛠️ 기술 스택

- **정적 사이트 생성기:** [Hugo](https://gohugo.io/)
- **테마:** [Blowfish](https://blowfish.page/)
- **호스팅:** [GitHub Pages](https://pages.github.com/)
- **CI/CD:** GitHub Actions
- **노트 작성:** Obsidian (연동)


## 📁 프로젝트 구조

```
0AndWild.github.io/
├── .github/
│   └── workflows/          # GitHub Actions 워크플로우
├── assets/                 # 테마 에셋 (CSS, JS, 이미지)
├── config/
│   └── _default/          # Hugo 설정 파일
│       ├── hugo.toml      # 메인 Hugo 설정
│       ├── params.toml    # 테마 파라미터
│       ├── languages.*.toml # 언어별 설정
│       └── menus.*.toml   # 메뉴 구성
├── content/
│   └── posts/             # 블로그 포스트
├── static/                # 정적 파일 (이미지 등)
├── themes/
│   └── blowfish/          # Blowfish 테마
└── README.md
```

