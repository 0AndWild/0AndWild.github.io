+++
title = '260521_DDD'
date = '2026-05-21T08:48:38+09:00'
description = ""
summary = ""
categories = []
tags = []
series = []
series_order = 1

draft = false
+++


## 4가지 포맷

| 포맷 | 언제 고르나 | 강점 |
|------|------------|------|
| 📐 Design Doc | 새 시스템·모듈을 설계했고, 구조와 의사결정을 설명하고 싶을 때 | 설계 깊이, 시니어 시그널 |
| 🪞 Retrospective | 과제 회고와 트러블슈팅을 정리하고 싶을 때 (진입장벽 낮음) | 회고 흐름, 부담 적음 |
| ⚔️ Challenge Story | 가장 어려웠던 도전 하나에 집중해 서사로 풀고 싶을 때 | 임팩트, 압축적 |
| 📊 Benchmark Report | 후보 기술 A vs B를 본인이 직접 측정해 선택한 경우 | 수치 증명, 가장 강력 |

언제 고르나 — 새 시스템·모듈을 설계했고, 구조와 의사결정을 면접관/시니어 리뷰어에게 설명하고 싶을 때.

---

## TL;DR
5초 안에 핵심을 전하는 1~2줄.

"예) Redis Sorted Set + 분산 락으로 동시성 안전한 실시간 랭킹을 구현했고, p99 80ms → 25ms로 개선."

---

## 본문

**작성 팁**
- 수치로 증명하라 — "잘 됐다"가 아니라 "p99 200ms → 25ms".
- 왜 그 선택을 했는가를 함께 적으라 — 기술 나열은 약하다.
- 솔직한 한계도 적으라 — "이건 못 풀었다"가 시니어 시그널이다.

## Introduction & Goals

- **Context / Background**:
- **Goals**:

## Detailed Design

### System Architecture

### Data Models

### API Design

### Constraints

## Alternatives Considered

| 옵션 | Pros | Cons |
|------|------|------|
| A    |      |      |
| B    |      |      |
| **선택: C** |      |      |

**선택 근거:**

---

##  cross-cutting

"비기능적 요구사항. 해당되는 항목만 적으면 됩니다. 비워둬도 OK."

- Scalability: 트래픽 증가 시 어떻게 대응할 것인가?
- Latency: 응답 속도에 미치는 영향은?
- Security & Privacy: PII, 권한 제어, 암호화
- Observability: 로깅·메트릭·알람 계획

---

## "Reference"

"참고한 공식 문서, 인용한 글, 영상, 본인 코드 블록 링크 등을 자유롭게 정리하세요."

- Redis 공식 문서: ...
- 참고 블로그: ...
- 본인 코드: https://github.com/.../blob/...