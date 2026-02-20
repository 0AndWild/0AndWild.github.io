+++
title = 'Baekjoonhub 크롬 익스텐션 커스텀'
date = '2026-02-20T22:35:24+09:00'
description = "BaekjoonHub 익스텐션을 작업 흐름에 맞게 커스텀한 이유와 변경 사항 정리."
summary = "Base Directory 추가, 티어 경로 세분화, 디렉토리명 정규화, Java Main/package 자동화, 벌크 업로드 기능을 구현했음."
categories = ["Baekjoon", "Chrome Extension"]
tags = ["BaekjoonHub", "Chrome Extension", "GitHub", "Java", "자동화", "커스텀"]
series = []
series_order = 1

draft = false
+++

# BaekjoonHub를 직접 커스텀하게 된 이유

최근에 백준을 본격적으로 사용하게 되면서 `BaekjoonHub` 익스텐션을 알게 됐음.  
처음 써보니 “풀이를 자동으로 GitHub에 올려준다”는 점은 정말 편했지만, 실제로 내 작업 방식에 맞추기엔 몇 가지 불편한 부분이 있었음.

그래서 먼저 공식 저장소 이슈를 찾아봤음.  
확인해보니 나와 비슷한 고민을 가진 분들이 이미 있었고, 관련 기능을 추가하려는 PR도 올라와 있었음. 다만 당시 기준으로는 해당 기능을 바로 반영할 계획이 없다는 흐름이 보여서, 기다리기보다 내가 필요한 부분을 직접 커스텀해서 쓰기로 결정함.

원본 저장소: https://github.com/BaekjoonHub/BaekjoonHub  
커스텀 저장소: https://github.com/0AndWild/baekjoonhub_custom

---

## 내가 겪은 불편함

1. 업로드 경로가 레포 루트 기준이라 프로젝트 구조에 맞추기 어려움  
2. 티어 경로가 세분화되지 않아 문제 정리가 아쉬움  
3. 문제 디렉토리명이 패키지/경로로 쓰기 불편한 형태  
4. Java 파일명과 실행 엔트리(`Main.java`)를 수동으로 맞춰야 하는 경우 발생  
5. 기존에 풀어둔 문제를 한 번에 정리해서 올리기 어려움

---

## 그래서 커스텀에서 바꾼 부분

1. `Base Directory` 지정 기능 추가  
2. 티어 경로를 `Bronze/V`처럼 세분화  
3. 문제 디렉토리명 정규화  
4. Java 파일명 `Main.java` 고정 + `package` 자동 삽입  
5. 백준 맞은 문제 전체 업로드(벌크 업로드) 기능 추가

---

## 정리

이번 커스텀은 “기능을 새로 많이 만들자”보다는,  
실제로 문제를 풀고 정리하는 과정에서 반복되는 불편함을 줄이는 데 초점을 맞춤.

공식 저장소에서도 이미 비슷한 요구가 있었던 만큼, 같은 고민을 가진 분들에게는 이 커스텀 방향이 참고가 될 수 있다고 생각함.
