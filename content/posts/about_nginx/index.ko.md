+++
title = 'Nginx란 무엇일까? 웹 서버의 진화와 구조'
date = '2022-10-25T19:17:04+09:00'
description = "Nginx의 탄생 배경부터 Apache와의 차이점, 내부 구조, 그리고 리버스 프록시, 로드밸런싱 등 주요 기능까지 상세히 알아봅니다."
summary = "고성능 웹 서버 Nginx의 개념, Apache와의 비교, Event-Driven 구조, 그리고 실무에서 활용되는 주요 기능들을 정리한 가이드"
categories = ["Web Server", "Infrastructure"]
tags = ["Nginx", "Apache", "Web Server", "Reverse Proxy", "Load Balancing", "SSL", "Performance"]
series = ["Nginx"]
series_order = 1

draft = false
+++

{{< figure src="featured.png" alt="Nginx 로고" class="mx-auto" >}}

## Nginx란?

**Nginx**(엔진엑스)는 **경량 고성능 웹 서버 소프트웨어**입니다. 웹 서버로 동작할 뿐만 아니라 리버스 프록시, 로드 밸런서, HTTP 캐시로도 사용됩니다.

Nginx는 높은 동시 접속 처리를 위해 설계되었으며, 현재 전 세계 수많은 대규모 웹사이트에서 사용되고 있습니다.

### 왜 Nginx가 필요했을까?

과거에는 **Apache 웹서버**가 업계 표준이었습니다. 하지만 2000년대 초반, 인터넷 사용자가 폭발적으로 증가하면서 **C10k 문제**라는 병목 현상이 발생했습니다.

## C10k 문제

**C10k 문제**는 "Connection 10,000"의 약자로, **하나의 서버에서 동시에 10,000개의 클라이언트 연결을 처리하는 것**을 의미합니다.

{{< alert "circle-info" >}}
**중요한 개념 구분**

- **동시 처리 (Concurrent)**: 많은 연결을 동시에 유지하고 관리
- **처리 속도 (Throughput)**: 초당 처리할 수 있는 요청의 개수

동시 접속 처리는 빠른 속도보다는 **효율적인 자원 관리와 스케줄링**이 핵심입니다.
{{< /alert >}}

{{< figure src="figure1.png" alt="Apache의 스레드 기반 구조 - 하나의 커넥션 당 하나의 스레드를 점유" class="mx-auto" >}}

### Apache의 구조적 한계

기존 Apache는 다음과 같은 구조적 문제를 가지고 있었습니다:

#### 1. 프로세스 기반 처리
- 요청이 들어올 때마다 **새로운 프로세스 또는 스레드를 생성**
- 사용자가 많아질수록 프로세스 수가 비례 증가
- 결과적으로 **메모리 부족** 발생

#### 2. 높은 리소스 소비
- Apache의 강력한 확장성 덕분에 다양한 모듈 추가 가능
- 하지만 각 프로세스가 **모든 모듈을 메모리에 로드**
- 프로세스당 메모리 사용량 증가

#### 3. Context-Switching 오버헤드
- CPU 코어가 여러 프로세스를 번갈아 실행
- 프로세스 전환 시 **Context-Switching 비용** 발생
- 요청이 많을수록 CPU 오버헤드 증가

이러한 문제로 인해 Apache는 **대규모 동시 접속 환경에 부적합**했습니다.

## Nginx의 탄생

{{< figure src="figure2.png" alt="Igor Sysoev - Nginx 개발자" class="mx-auto" >}}

2002년, 러시아의 개발자 **이고르 시쇼브(Igor Sysoev)**가 이 문제를 해결하기 위해 Nginx 개발을 시작했고, 2004년 첫 릴리즈를 공개했습니다.

### Nginx의 핵심 목표

1. **높은 동시 접속 처리**
2. **낮은 메모리 사용량**
3. **높은 성능과 안정성**

### Nginx의 주요 역할

- **HTTP Server**: 정적 파일(HTML, CSS, JS, 이미지)을 빠르게 제공
- **Reverse Proxy Server**: 백엔드 애플리케이션 서버 앞단에서 요청 중계
- **Load Balancer**: 여러 서버로 트래픽 분산
- **Mail Proxy Server**: 메일 서버 프록시 기능

---

## Nginx의 내부 구조

{{< figure src="figure3.png" alt="Event-Driven 방식의 Nginx 구조" class="mx-auto" >}}

Nginx는 **1개의 Master Process**와 **여러 개의 Worker Process**로 구성됩니다.

### Master Process의 역할

Master Process는 다음 작업을 담당합니다:

- 설정 파일 읽기 및 유효성 검증
- Worker Process 생성 및 관리
- 설정 변경 시 Worker Process 재시작

```bash
# Master Process 확인
ps aux | grep nginx
```

### Worker Process의 역할

Worker Process가 실제 클라이언트 요청을 처리합니다:

#### 1. 커넥션 관리
- Master Process로부터 **listen socket** 할당받음
- 클라이언트와 커넥션 형성
- **Keep-Alive** 시간 동안 커넥션 유지
- 하나의 Worker가 **수천 개의 커넥션** 동시 처리

#### 2. Non-blocking I/O
- 커넥션에 요청이 없으면 다른 작업 처리
- 요청이 들어오면 즉시 응답
- **비동기 Event-Driven 방식**으로 효율적 처리

#### 3. Thread Pool
- 시간이 오래 걸리는 작업(파일 I/O, DB 쿼리)은 **Thread Pool**에 위임
- Worker Process는 다른 요청 계속 처리
- Blocking 작업의 영향 최소화

#### 4. CPU 코어 최적화
- Worker Process는 **CPU 코어 개수만큼 생성** 권장
- 각 Worker를 특정 CPU 코어에 고정 (CPU Affinity)
- **Context-Switching 최소화**로 성능 향상

```nginx
# nginx.conf 설정 예시
worker_processes auto;  # CPU 코어 수만큼 자동 생성
worker_cpu_affinity auto;  # CPU 친화성 자동 설정
```

### Event-Driven 아키텍처

Nginx는 **멀티프로세스 + 싱글스레드 + Event-Driven** 방식으로 동작합니다:

1. 여러 커넥션을 **Event Handler**가 관리
2. **비동기 Non-blocking** 방식으로 처리
3. 먼저 준비된 이벤트부터 순차 처리
4. 대기 중인 프로세스 없이 **자원 효율성 극대화**

이는 Apache처럼 요청을 기다리며 방치되는 프로세스가 없어 **메모리와 CPU를 효율적으로 사용**합니다.

---

## Nginx의 장단점

### 장점

#### 1. 높은 동시 접속 처리 능력
- Apache 대비 **동시 커넥션 수 10배 이상** 증가
- 동일 커넥션에서 **처리 속도 2배** 향상

#### 2. 낮은 리소스 사용
- 적은 수의 프로세스로 동작
- 메모리 사용량 최소화
- 경량 구조로 빠른 응답 속도

#### 3. 무중단 설정 리로드
```bash
nginx -s reload  # 서비스 중단 없이 설정 적용
```
- Master Process가 새 설정 읽기
- 기존 Worker는 현재 요청 완료 후 종료
- 새 Worker가 새 설정으로 요청 처리
- **서비스 중단 없이 설정 변경 가능**

#### 4. 우수한 정적 파일 처리
- 이미지, CSS, JS 등 정적 콘텐츠를 빠르게 제공
- Apache보다 정적 파일 처리 성능 우수

### 단점

#### 1. 동적 모듈 개발의 어려움
- 모듈 추가 시 Worker Process 재시작 필요
- Apache처럼 손쉬운 모듈 개발 어려움
- 대신 Lua 스크립팅으로 어느 정도 보완 가능

#### 2. Windows 환경 제한
- Linux/Unix 환경에 최적화
- Windows에서는 성능과 안정성 저하
- 프로덕션 환경에서는 Linux 사용 권장

#### 3. .htaccess 미지원
- Apache의 `.htaccess` 파일 사용 불가
- 모든 설정을 중앙 설정 파일에서 관리
- 호스팅 환경에서 유연성 떨어질 수 있음

---

## Nginx의 주요 기능

{{< figure src="figure4.png" alt="Nginx 주요 기능 다이어그램" class="mx-auto" >}}

### 1. 리버스 프록시 (Reverse Proxy)

리버스 프록시는 클라이언트와 백엔드 서버 사이에서 **중계자** 역할을 합니다.

{{< figure src="figure5.png" alt="리버스 프록시 구조" class="mx-auto" >}}

#### 주요 이점

- **보안 강화**: 실제 서버 IP 숨김
- **캐싱**: 자주 요청되는 응답 캐싱
- **압축**: 응답 데이터 압축으로 대역폭 절약
- **SSL 처리**: HTTPS 암호화/복호화 담당

```nginx
# 리버스 프록시 설정 예시
location / {
    proxy_pass http://backend_server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

#### 실무 활용 패턴

- **Nginx + Apache**: Nginx가 정적 파일 처리, Apache가 동적 처리
- **Nginx + Node.js/Python/Java**: Nginx가 프론트엔드, 백엔드 애플리케이션 보호
- **Nginx + Nginx**: 여러 Nginx 서버를 계층적으로 구성

### 2. 로드 밸런싱 (Load Balancing)

여러 백엔드 서버로 **트래픽을 분산**하여 부하를 균등하게 배분합니다.

{{< figure src="figure6.png" alt="로드 밸런싱 구조" class="mx-auto" >}}

#### 로드 밸런싱 알고리즘

##### Round Robin (기본값)
- 순차적으로 요청을 각 서버에 분배
- 가장 간단하고 공평한 방식

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}
```

##### Least Connections
- 현재 연결 수가 가장 적은 서버로 전송
- 처리 시간이 다른 요청에 적합

```nginx
upstream backend {
    least_conn;
    server backend1.example.com;
    server backend2.example.com;
}
```

##### IP Hash
- 클라이언트 IP 해시값으로 서버 결정
- **세션 유지**(Session Persistence)에 유용

```nginx
upstream backend {
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
}
```

##### Weight (가중치)
- 서버 성능에 따라 가중치 부여
- 고성능 서버에 더 많은 요청 전달

```nginx
upstream backend {
    server backend1.example.com weight=3;
    server backend2.example.com weight=2;
    server backend3.example.com weight=1;
}
```

#### Health Check (헬스 체크)

```nginx
upstream backend {
    server backend1.example.com max_fails=3 fail_timeout=30s;
    server backend2.example.com max_fails=3 fail_timeout=30s;
}
```

- `max_fails`: 실패 허용 횟수
- `fail_timeout`: 서버를 다운으로 간주할 시간
- 장애 서버 자동 제외로 **가용성 향상**

### 3. SSL/TLS 터미네이션

Nginx가 **클라이언트와 HTTPS 통신**, **백엔드와 HTTP 통신**을 담당합니다.

{{< figure src="figure7.png" alt="SSL 터미네이션 구조" class="mx-auto" >}}

#### 주요 이점

- 백엔드 서버의 **SSL 처리 부담 제거**
- 중앙화된 인증서 관리
- 백엔드는 **비즈니스 로직에 집중**
- Nginx와 백엔드는 같은 내부 네트워크에서 HTTP 통신 (보안상 안전)

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://backend;
    }
}
```

#### HTTP/2 지원

Nginx는 HTTP/2를 지원하여:
- **멀티플렉싱**: 하나의 커넥션으로 여러 요청 동시 처리
- **헤더 압축**: 대역폭 절약
- **Server Push**: 클라이언트 요청 전 리소스 전송

### 4. 캐싱 (Caching)

서버 응답을 **메모리나 디스크에 저장**하여 반복 요청 시 빠르게 응답합니다.

```nginx
# 캐시 경로 설정
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;

server {
    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 60m;  # 200 응답은 60분 캐싱
        proxy_cache_valid 404 10m;  # 404 응답은 10분 캐싱
        proxy_pass http://backend;
    }
}
```

#### 캐싱 전략

- **프록시 캐싱**: 백엔드 응답 캐싱
- **FastCGI 캐싱**: PHP-FPM 등 동적 콘텐츠 캐싱
- **정적 파일 캐싱**: 브라우저 캐시 헤더 설정

```nginx
# 정적 파일 캐시 헤더 설정
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 5. 압축 (Gzip)

응답 데이터를 압축하여 **네트워크 대역폭 절약**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml+rss
           application/json application/javascript;
```

- 텍스트 기반 콘텐츠 60-80% 압축
- 전송 시간 단축으로 사용자 경험 개선

### 6. Rate Limiting (속도 제한)

DDoS 공격 방어 및 서버 보호

```nginx
# Zone 정의
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=mylimit burst=20 nodelay;
        proxy_pass http://backend;
    }
}
```

- IP당 초당 요청 수 제한
- **burst**: 순간적인 트래픽 증가 허용
- API 서버 보호에 필수적

---

## Nginx vs Apache: 어떤 것을 선택할까?

### Nginx를 선택해야 하는 경우

- 높은 동시 접속 처리가 필요한 경우
- 정적 파일 서비스가 주요 목적인 경우
- 리버스 프록시/로드 밸런서가 필요한 경우
- 리소스 효율성이 중요한 경우
- 최신 프로토콜(HTTP/2, HTTP/3) 지원 필요

### Apache를 선택해야 하는 경우

- `.htaccess` 파일 기반 설정이 필요한 경우
- 다양한 써드파티 모듈이 필요한 경우
- Windows 환경에서 사용해야 하는 경우
- 레거시 애플리케이션 호환성이 중요한 경우
- 동적 모듈 개발이 빈번한 경우

### 최적의 조합: Nginx + Apache

많은 기업이 **Nginx를 프론트엔드**, **Apache를 백엔드**로 사용합니다:

```
[클라이언트] → [Nginx] → [Apache] → [애플리케이션]
              정적 파일    동적 처리
              SSL 처리     PHP/Python
              캐싱         모듈 활용
```

---

## 실무 팁

### 1. Worker Connections 설정

```nginx
events {
    worker_connections 1024;  # Worker당 처리 가능한 커넥션 수
    use epoll;  # Linux에서 최적의 이벤트 모델
}
```

### 2. Keepalive 최적화

```nginx
http {
    keepalive_timeout 65;
    keepalive_requests 100;
}
```

### 3. 버퍼 크기 조정

```nginx
http {
    client_body_buffer_size 16K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 4 8k;
}
```

### 4. 로그 최적화

```nginx
http {
    access_log /var/log/nginx/access.log combined buffer=32k;
    error_log /var/log/nginx/error.log warn;
}
```

### 5. 보안 강화

```nginx
# 버전 정보 숨기기
server_tokens off;

# 보안 헤더 추가
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## 마무리

Nginx는 **현대 웹 인프라의 핵심 구성 요소**로 자리잡았습니다. Event-Driven 아키텍처를 통한 높은 성능과 효율성으로 Netflix, Airbnb, GitHub 등 대규모 서비스에서 사용되고 있습니다.

Apache의 안정성과 확장성도 여전히 가치가 있지만, 대규모 트래픽 처리와 리소스 효율성이 중요한 현대 웹 환경에서는 **Nginx가 더 적합한 선택**입니다.

{{< alert "lightbulb" >}}
**추천 학습 경로**

1. 로컬 환경에서 Nginx 설치 및 기본 설정 실습
2. 리버스 프록시 구성해보기
3. 로드 밸런싱 설정 및 테스트
4. SSL 인증서 적용 (Let's Encrypt)
5. 성능 모니터링 및 최적화
{{< /alert >}}

### 참고 자료

- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Nginx 설정 생성기](https://www.digitalocean.com/community/tools/nginx)
- [Nginx Performance Tuning Guide](https://www.nginx.com/blog/tuning-nginx/)

**다만 주의할 점**: Nginx는 Windows 환경에서 제한적인 성능과 호환성을 보이므로, 프로덕션 환경에서는 반드시 **Linux/Unix 시스템**을 사용하는 것을 권장합니다!
