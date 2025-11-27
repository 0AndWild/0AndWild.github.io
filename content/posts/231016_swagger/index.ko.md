+++
title = 'OpenAPI Generator 정복하기'
date = '2023-10-16T16:56:35+09:00'
description = "Swagger와 OpenAPI Generator의 차이점과 활용법을 알아보고, API 문서 자동화를 위한 도구들을 비교 분석합니다."
summary = "OpenAPI Generator를 활용한 API 문서 자동화와 코드 생성 방법"
categories = ["Backend"]
tags = ["Swagger", "OpenAPI", "API", "Documentation", "Code Generation"]
series = []
series_order = 1

draft = false
+++

## Swagger란?

**Swagger**는 OAS(OpenAPI Specification)를 위한 프레임워크로, API들이 가지고 있는 스펙을 명세하고 관리할 수 있는 프로젝트입니다. Swagger를 통해 REST API 서비스를 설계, 빌드, 문서화할 수 있습니다.

### Swagger Tools

Swagger는 다음과 같은 주요 도구들을 제공합니다

- **Swagger UI**: Swagger API 명세서를 HTML 형식으로 시각화하여 확인할 수 있도록 해주는 도구
- **Swagger Codegen**: Swagger에 정의된 스펙에 따라 클라이언트 및 서버 코드를 자동으로 생성해주는 CLI 툴
- **Swagger Editor**: Swagger 표준에 따른 API 설계서 및 명세서를 작성하기 위한 에디터

### Springfox vs Springdoc

**Springfox Swagger**는 Spring 또는 Spring Boot를 사용하는 프로젝트에서 Swagger를 이용해 API 문서를 쉽게 작성할 수 있도록 도와주는 라이브러리입니다.

Springfox가 업데이트를 중단하는 시점에 **Springdoc**이 등장했으며, 활발한 업데이트가 이루어지면서 급부상하게 되었습니다. Springdoc 역시 Swagger 문서 작성을 지원하는 라이브러리로, 현재는 Springfox보다 더 권장되는 선택입니다.

---

## Swagger Codegen vs OpenAPI Generator

**Swagger**는 SmartBear사의 트레이드마크이며, **Swagger Codegen**은 그 안에 포함되어 있는 프로젝트입니다.

**OpenAPI Generator**는 Swagger Codegen 프로젝트를 포크(fork)하여 시작된 커뮤니티 주도 오픈소스 프로젝트입니다. 현재 40명 이상의 상위 프로젝트 기여자와 Swagger Codegen의 창립 멤버들이 함께 참여하고 있습니다.

### OpenAPI Generator License

OpenAPI Generator는 **Apache License 2.0**을 따르고 있습니다.

#### Apache License 2.0이란?

Apache License 2.0에 따라 다음과 같은 권리가 부여됩니다

- 누구나 해당 소프트웨어에서 파생된 프로그램을 제작할 수 있음
- 저작권을 양도, 전송할 수 있음
- 부분 또는 전체를 개인적 또는 상업적 목적으로 이용 가능
- 재배포 시 원본 또는 수정한 소스코드를 반드시 포함시키지 않아도 됨
- **단, Apache License 버전 및 표기는 반드시 포함해야 함** (Apache License로 개발된 소프트웨어임을 명확히 표시)

### OpenAPI Generator의 탄생 배경

OpenAPI Generator의 공식 Q&A를 보면 프로젝트의 탄생 배경을 확인할 수 있습니다

1. **버전 철학의 차이**
   Swagger Codegen의 창립 멤버들은 Swagger Codegen 3.0.0이 2.x의 철학과 너무 많이 다르다고 느꼈습니다. 두 개의 개별 브랜치(2.x, 3.x)를 유지 관리하는 오버헤드가 Python 커뮤니티에서 겪었던 것과 유사한 문제를 야기할 수 있다고 우려했습니다.

2. **빠른 배포 주기**
   창립 멤버들은 사용자가 원하는 안정적인 배포 버전을 사용하기 위해 몇 달을 기다리지 않도록 더 빠른 배포 주기를 원했습니다.
   - 주간 패치 배포 (Weekly patch releases)
   - 월간 마이너 배포 (Monthly minor releases)

3. **커뮤니티 주도 개발**
   커뮤니티가 주도하는 오픈소스 프로젝트 형식으로 진행하면 혁신과 신뢰성, 그리고 커뮤니티가 소유하는 로드맵을 확보할 수 있습니다.

위와 같은 이유들로 OpenAPI Generator 프로젝트가 탄생했습니다. OpenAPI Generator는 MySQL과 MariaDB의 관계와 유사한 느낌입니다.

### Swagger Codegen에서 마이그레이션

공식 문서에 따르면, 기존에 Swagger Codegen 2.x 버전을 사용하고 있을 경우 OpenAPI Generator로 편리하게 마이그레이션할 수 있습니다. OpenAPI Generator는 Swagger Codegen 2.4.0-SNAPSHOT 버전을 기반으로 하고 있기 때문입니다.

자세한 마이그레이션 방법은 공식 가이드를 참조하세요

- [Migrating from Swagger Codegen | OpenAPI Generator](https://openapi-generator.tech/docs/swagger-codegen-migration)

---

## 참고 자료

- [OpenAPI Generator 공식 사이트](https://openapi-generator.tech/)
- [Migrating from Swagger Codegen](https://openapi-generator.tech/docs/swagger-codegen-migration)