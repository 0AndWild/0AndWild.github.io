+++
title = 'Websocket 이란? (RFC 6455)'
date = '2026-01-21T15:38:26+09:00'
description = ""
summary = "웹소켓이 무엇인지와 웹소켓 프로토콜은 어떻게 동작을 하는지 RFC 6455 문서를 살펴보며 알아가보자"
categories = ["Websocket", "RFC6455"]
tags = []
series = ["Websocket"]
series_order = 2

draft = false
+++

## 서론
이전 포스트인 웹소켓 이전의 양방향 통신에 이어서 Websocket 프로토콜 문서인 RFC 6455 를 읽어보며 Websocket 에 대해 상세하게 다뤄보고자 함.

*내용 중 자세한 설명을 위한 예시들은 AI를 이용하여 생성하였음.*

---

## [RFC 6455]("https://datatracker.ietf.org/doc/html/rfc6455") (The Websocket Protocol)

Websocket 프로토콜의 목적은 서버와의 양방향 통신이 필요한 브라우저 기반 애플리케이션에 다중 Http 연결 (ex: XmlHttpRequest, long polling)에 의존하지 않는 매커니즘을 제공하는 것이라고 함. Websocket 은 TCP 위의 기본 메시지 프레이밍에 이어지는 초기 핸드쉐이크로 구성되어짐.

과거 클라이언트와 서버간 양방향 통신이 필요했던 어플리케이션의 경우 HTTP 를 남용하여 서버 업데이트를 폴링하면서 그 위에 단에서의 알림을 별개의 HTTP 호출로 전송해야 했음 (RFC 6202).

이 문제를 해결하는 방법은 양방향 트래픽에 단일 TCP 연결을 사용하는 방법임. Websocket 은 이 방식을 지원함. 
websocket API 문서: https://websockets.spec.whatwg.org//


Websocket 은 프록시, 필터링, 인증 과 같은 기존 인프라 구조의 이점을 이용하기 위해 HTTP 를 전송계층으로 사용한는 양방향 통신기술을 대체하기위해 고안되었음.
기존 기술은 효율성과 신뢰성 사이의 절충안으로 구현되었음 그 이유는 HTTP 가 애초에 양방향 통신을 위해 구현된게 아니기 때문이라고 함.

Websocket 프로토콜은 HTTP 인프라 환경에서 기존의 양방향 HTTP 기술들의 목표를 해결하기위한 시도를 함.
따라서 HTTP 80, 443 port 를 통해 작동하도록 설계되었으며, 현재 환경에서 복잡성을 수반하더라도 HTTP 프록시 및 중개자를 지원함.

`그렇다고 이 설계가 웹소켓을 HTTP 로 제한하지 않음. 향후 구현에서는 전체 프로토콜울 재구축하지 않고도 전용 포트를 사용하되 전체 프로토콜을 재구축하지 않고도 가능하다고 함`

문서에서 이부분을 강조하는데 이는 대화형 메시징의 트래픽 패턴이 표준 HTTP 트래픽과 유사하지 않아 일부 구성 요소에 비정상적인 부하를 유발할 수 있기 때문에 중요하다고 함.

---

## Protocol Overview

Websocket 프로토콜은 handshake, data transfer 이렇게 두 파트로 나뉨.

```
// Client 의 handshake 요청
GET /chat HTTP/1.1
        Host: server.example.com
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
        Origin: http://example.com
        Sec-WebSocket-Protocol: chat, superchat
        Sec-WebSocket-Version: 13

// Server 의 handshake 응답
HTTP/1.1 101 Switching Protocols
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
        Sec-WebSocket-Protocol: chat
```

Client 는 Request-Line 형식을 따르고 Server 는 Status-Line 형식을 따름. ([RFC 2616](https://datatracker.ietf.org/doc/html/rfc2616#page-35))


Client 와 Server 양쪽 모두 handshake 를 보내고 성공이 되었다면 data transfer 가 시작됨.
이것이 각자 독립적으로 어떠한 요청 없이 자신의 의지로 데이터를 전송할 수 있는 양방향 통신 채널임.


이제 Client 와 Server 는 websocket spec 에서 message 라고 지칭하는 단위로 데이터를 주고받음.

`Websocket message 는 특정 네트워크 계층의 프레임과 일치하지 않을 수 있음.` 그 이유는 중간 장치에 의해서 *분할된 메세지가 병합되거나 그 반대의 경우가 발생*할 수 있기 때문이라고 함.

동일한 message에 속하는 각 프레임은 동일한 유형의 데이터를 포함함. 크게 `textual data`, `binary data`, `control frames`(어플리케이션 데이터 전달이 아님 ex 프로토콜 수준의 신호용으로 연결 종료 신호) 가 있음. 

Websocket 프로토콜은 여섯 가지 프레임 유형을 정의하고 향후 사용을 위한 열 가지를 예약을 해둔다고 함.

| Opcode | 타입 | 이름 | 설명 |
|--------|------|------|------|
| 0x0 | 데이터 | Continuation | 이전 프레임의 연속 데이터 |
| 0x1 | 데이터 | Text | UTF-8 텍스트 데이터 |
| 0x2 | 데이터 | Binary | 바이너리 데이터 |
| 0x3~0x7 | 데이터 | Reserved | 향후 데이터 프레임 확장용 (5개) |
| 0x8 | 제어 | Close | 연결 종료 요청 |
| 0x9 | 제어 | Ping | 연결 상태 확인 (heartbeat) |
| 0xA | 제어 | Pong | Ping에 대한 응답 |
| 0xB~0xF | 제어 | Reserved | 향후 제어 프레임 확장용 (5개) |

### 분할된 메세지가 병합되거나 반대의 경우가 발생할 수 있다? 

라는 부분이 이해가 잘 안갈 수 있는데 예시를 들어보겠음.

우선 왜 분할(fragmentaion)이 발생하는지? 그 이유는 아래와 같음

1. MTU(Maximum Transmission Unit) 제한(네트워크 패킷 크기 제한 : 보통 1500 bytes)
일반적으로 1500 bytes 보다 큰 패킷은 경로상의 중간장치에서 더 작은 조각으로 나뉘어져 전송(단편화)됨. 예시로 지하터널의 높이 제한을 생각하면 됨.

2. 서버에서 특정 크기로 쪼개서 보내도록 설정되어 있을 수 있음

3. 1번과 같은 맥락인데 프록시, 로드밸러서, API 게이트웨이 같은 중간장치가 큰 프레임을 쪼갬

4. 메모리 효율: 대용량 데이터를 한번에 버퍼링하지 않기 위해 쪼갬


다시 본론으로 돌아가서 병합되는 예시와 반대의 경우를 살펴보겠음

```
1. Coalesced(병합)

(원본: 쪼개서 발송)
[Frame 1: FIN=0, opcode=text, "Hello "]
[Frame 2: FIN=0, opcode=continuation, "World"]  
[Frame 3: FIN=1, opcode=continuation, "!"]

(중간자가 위의 세 프레임을 받아서 하나의 프레임으로 합쳐서 전달함)
[Frame: FIN=1, opcode=text, "Hello World!"]

2. Split(분할)

(원본)
[Frame: FIN=1, "Hello World!"]

(중간자가 원본 프레임을 쪼갬)
[Frame 1: FIN=0, "Hello "]
[Frame 2: FIN=1, "World!"]

```

다음 예시로 Websocket 으로 실시간 주식 데이터를 수신하는 Spring boot 서버 (client 역할)와 금융 서버(server 역할) 가 있다고 가정하고 코드를 살펴보겠음.

```
금융 서버에서 아래와 같이 하나의 message 를 쪼개서 보냈다고 가정을 하겠음. (중간에 병합되지 않는다고 가정)

[WebSocket Frame 1]
FIN: 0 (아직 끝 아님)
Opcode: 0x1 (text)
Payload: {"stockCode":"005930","price":71500,"vol

[WebSocket Frame 2]  
FIN: 0 (아직 끝 아님)
Opcode: 0x0 (continuation)
Payload: ume":50000,"time":"09:00:01","seller":"

[WebSocket Frame 3]
FIN: 1 (이게 마지막)
Opcode: 0x0 (continuation)
Payload: foreign","buyer":"institution",...}

```

```java
@Component
public class WebSocketHandler extends TextWebSocketHandler {
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // 여기서 message.getPayload()는 이미 완전한 message임
        // {"stockCode":"005930","price":71500,"volume":50000,...} 전체가 옴
        String payload = message.getPayload();
    }
}

```

payload 가 완전한 message 인 이유는 Spring 이 내부적으로 Frame 1 과 2 가 FIN 이 0 이기 때문에 버퍼에 저장하고 이어붙이다가 Frame 3 에서 FIN 이 1 을 확인하고 버퍼 내용을 합쳐서 handleTextMessage() 를 호출하기 때문임.

이런 부분을 공부해 보면서 느낀점은 평소 개발시에 프레임워크에서 이미 잘 구현된 기능들을 사용하다보니 이렇게 네트워크 레벨에서 일어나는 일들을 잘 모르고 지나치게 되는 것 같다는 생각이 들었음.

다시 Websocket protocol 의 큰 틀을 정리해보면 
- Handshake 와 Data transfer 이렇게 두 파트로 나뉨.
- Handshake 가 성공하면 이제 양방향 통신을 할 수 있는 상태가 되고 data transfer 가 이루어짐. 이때 websocket spec 에서 사용하는 data 단위인 `message` 를 주고 받음.
- `Message` 는 특정 네트워크 프레임과 일치하지 않을 수 있음. 중간장치에 의해 message 가 분할되거나 병합될 수 있기 때문
- Websocket 에 정의된 프레임은 data frame 3개, controle frame 3개 그리고 각각 예약 프레임 5개 씩 총 16개로 구성 됨

다음으로는 Opening Handshake 가 어떻게 일어나는지 살펴보겠음.

---

## Opening Handshake


|Header|용도|
|:------|:---:|
|Upgrade|프로토콜 업그레이드 요청|
|Connection|연결 업그레이드 요청|
|Sec-Websocket-Key|보안 키(Base64 인코딩된 16 bytes 랜덤 값)|
|Sec-Websocket-Version|프로토콜 버전(현재 13)|
|Sec-Websocekt-Protocol|서브프로토콜(선택)|
|Origin|브라우저에서 보내는 출처 정보|


초기 handshake 는 HTTP 기반 서버와 중개자와 호환되도록 설계되어 서버와 통신하는 HTTP 클라이언트와 웹소켓 클라이언트 모두 단일 포트를 사용할 수 있음.
따라서 웹소켓 클라이언트의 handshake 는 HTTP 업그레이드 요청으로 이루어짐.

Handshake 의 header 필드는 클라이언트 측에서 임의의 순서로 전송할 수 있으므로 서로 다른 header 필드가 수신되는 순서는 중요하지 않음.
클라이언트는 handshake 의 |Host| header 필드에 호스트명을 포함시켜 클라이언트와 서버 모두 사용중인 호스트에 대해 합의했는지 확인 할 수 있음.

추가 header 필드는 Websocket 프로토콜에서 옵션을 선택하는데 사용됨.
일반적으로 사용하는 옵션으로 서브프로토콜 선택기 (Sec-Websocket-Protocol), 클라이언트가 지원하는 확장 목록(Sec-Websocket-Extension), Origin 필드 등이 있음. |Sec-Websocket-Protocol| 요청 header 필드는 클라이언트가 허용하는 서브프로토콜(웹소켓 프로토콜 위에 계층화된 어플리케이션 레벨 프로토콜)을 표시하는 데 사용할 수 있음. 서버는 허용가능한 프로토콜 중 하나 또는 아무것도 선택지 않을 수 있고 선택한 프로토콜을 나타내기 위해 handshake 에서 그 값을 echo 함. 

```
// Client 의 handshake 요청

GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat 
Sec-WebSocket-Version: 13


// Server 의 handshake 응답

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat <- server 가 선택한 프로토콜을 echo 함

```
서버는 클라이언트의 handshake 를 수신하면 두 가지 정보를 응답에 포함해야 하는 데 첫번째는 Sec-Websocket-Accept 임.

### Sec-Websocket-Accept 계산 방법

|Sec-Websocket-Accept| 필드는 서버가 websocket 연결을 수락할 의사가 있는지 여부를 나타냄.

1. Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ== 를 가져옴
2. dGhlIHNhbXBsZSBub25jZQ== + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
3. SHA-1 해시 계산 : 0xb3 0x7a 0x4f 0x2c 0xc0 0x62 0x4f 0x16 0x90 0xf6
   0x46 0x06 0xcf 0x38 0x59 0x45 0xb2 0xbe 0xc4 0xea
4. Base64 인코딩 : "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=" 
5. Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo= 를 응답에 포함

이렇게 Sec-Websocket-Key 를 만들고 상태값 101 을 같이 응답에 포함하여 handshake 를 수락했음을 client 에게 알려줌.

```
// 서버측에서 client 의 handshake 연결을 수락하고 정상적으로 연결이되면 상태코드로 101 을 가지게 됨. 101 이외의 상태 코드는 웹소켓 handshake가 완료되지 않은것임.
HTTP/1.1 101 Switching Protocols
```

클라이언트는 이 응답을 기반으로 Sec-Websocket-Accept 값이 예상된 값이 아니거나, 헤더 필드가 누락되었거나, HTTP 상태 코드가 101 이 아닌 경우를 확인하고 웹소켓 프레임은 전송되지 않음.

다시 정리를 해보자면
- Handshake 는 HTTP 기반 프로토콜 upgrade 요청으로 시작됨
- header 의 순서는 상관없음
- 서버의 연결 응답에는 Sec-Websocket-Key 를 이용해 Sec-Websocket-Accept 의 값을 계산하고 이와 함께 101 상태값을 내려주어야 함

다음으로는 Websocket 종료는 어떻게 일어나는지 살펴보겠음.

---

## Closing HandShake

Websocket 은 연결 종료시에도 handshake 방식으로 진행을 함.

1. 한쪽에서 종료를 나타내는 control frame(제어 프레임) 을 전송
2. 반대쪽에서 종료 control frame 으로 응답
3. 양쪽 모두 close frame 을 보내고 받으면 TCP 연결 종료

이렇게 자체 handshake 를 통해 종료를 하는 이유는 TCP closing handshake(FIN/ACK) 을 보완하기 위한 것으로 중간에 가로채는 프록시나 기타 중개자가 존재 할 경우 TCP closing handshake 가 항상 종단 간 신뢰할 수 있는 것은 아니라는 것에 근거한다고 함.

종단간 신뢰할 수 없다는 부분을 좀 더 살펴보면 TCP closing handshake(4-way handshake) 를 사용하면 데이터 손실이 발생할 수 있기 때문임.

```
// TCP-Closing handshake

Client                    Server
   |                         |
   |-------- FIN ----------->|  "나 보낼 거 다 보냄"
   |<------- ACK ------------|  "알겠어"
   |<------- FIN ------------|  "나도 다 보냄"
   |-------- ACK ----------->|  "알겠어"
   |                         |
```

이 문서에서 말하는 핵심 문제는 중개자(프록시, 로드밸런서)가 있으면 TCP 종료가 end-to-end 로 전달되지 않을 수 있다는 것임.

만약 TCP closing handshake 로 종료를 한다고 했을 때 예시를 살펴보겠음.

플래그를 모를 수 있기 때문에 표를 첨부함.

| 플래그 | 목적 | 언제 사용 |
|-------|-----|---------|
| SYN | 연결 시작 | 3-way handshake 시작 |
| ACK | 수신 확인 | 거의 모든 패킷에 포함 |
| FIN | 정상 종료 | 보낼 데이터 없을 때 |
| RST | 강제 종료 | 에러 상황, 비정상 종료 |

```java
// 상황 재현: 증권 서버가 데이터를 보내고 있는 중에 Client가 소켓을 닫음

// 증권 Server 측
session.sendMessage(new TextMessage(stockData1));  // 전송됨
session.sendMessage(new TextMessage(stockData2));  // 전송됨, 아직 Client가 안 읽음

// Client 측 - 갑자기 소켓 닫음
socket.close();  // stockData2가 receive queue에 있는 상태에서 닫힘
```

이때 OS 레벨에서 일어나는 일:

```
[Client 의 receive queue]
+------------------+
| stockData2 (미처리) |  ← 아직 애플리케이션이 안 읽음
+------------------+

socket.close() 호출됨
         ↓
OS: "어? 읽지 않은 데이터가 있는데 닫으라고?"
         ↓
OS가 RST 패킷 전송 (정상적인 FIN 대신)
         ↓
증권 Server: RST 수신
         ↓
증권 Server의 recv() 호출 실패 (Connection reset by peer)
```

### RST vs FIN 차이
```
FIN: "나 할 말 다 했어, 깔끔하게 끝내자"
RST: "비상! 연결 강제 종료! 뭔가 잘못됐어!"
```

RST를 받은 증권 Server는:
- 보내려던 나머지 데이터도 버림
- 에러 로그 남김
- 연결 상태 추적이 어려워짐

이걸 보면 이런 생각이 들 수 도 있음. 아니 그럼 HTTP request, response 에서도 똑같이 이 문제가 생길 수 있는거 아닌가?

맞음. 동일한 문제가 발생할 수 있음.
하지만 크게 상관이 없음.
- 이미 요청/응답 이 완료됨
- 연결이 일회성임
- 다음 요청은 새 연결로 하면 됨
  
```
HTTP 예시

Client                    Proxy                    Server
   │                        │                        │
   │── GET /stock ─────────>│── GET /stock ─────────>│
   │                        │                        │
   │<── 200 OK + data ──────│<── 200 OK + data ──────│
   │                        │                        │
   │── FIN ────────────────>│                        │
   │                        │   (전달할 수도, 안 할 수도)
   │                        │                        │
   
```

HTTP 는 stateless 하고 요청/응답이 끝나면 연결의 역할이 끝나기 때문에 비정상 종료되어도 큰 문제가 없음.

```
Websocket 예시

Client                    Proxy                    Server
   │                        │                        │
   │══ WebSocket 연결 (지속) ══════════════════════════│
   │                        │                        │
   │<── stockData1 ─────────│<── stockData1 ─────────│
   │<── stockData2 ─────────│<── stockData2 ─────────│
   │<── stockData3 ─────────│<── stockData3 ─────────│
   │         ...            │         ...            │
   │                        │                        │
   │── FIN ────────────────>│                        │
   │                        │   (전달 안 됨)           │
   │                        │                        │
   │                        │<── stockData4 ─────────│  ← Server는 계속 보냄!
   │                        │<── stockData5 ─────────│
   │                        │<── stockData6 ─────────│
   │                        │                        │
   │                        │   Proxy 버퍼에 쌓임       │
   │                        │   또는 어디선가 손실       │

```

하지만 Websocket 은 stateful 하고 연결이 계속 유지되면서 데이터가 흐르기 때문에 문제가 됨.

이러한 문제 때문에 Websocket 은 자체 handshake 를 통해 종료를 하는거임. 
Close frame 은 애플리케이션 레이어 메세지라 proxy 가 반드시 전달을 해야함. TCP FIN 처럼 proxy 가 임의로 처리가 불가능함.

```
Client                    Proxy                    Server
   │                        │                        │
   │── Close Frame ────────>│── Close Frame ────────>│  ← 애플리케이션 레벨
   │                        │                        │
   │                        │   Server: "아 종료구나" │
   │                        │           구독 해제     │
   │                        │           데이터 전송 중단│
   │                        │                        │
   │<── Close Frame ────────│<── Close Frame ────────│
   │                        │                        │
   │── FIN ────────────────>│── FIN ────────────────>│  ← 이제 TCP 종료

```

---

## WebSocket 설계 철학: 최소한의 프레이밍

### 핵심 원칙

RFC 6455에서 WebSocket의 설계 원칙을 이렇게 명시하고 있음:

> "The WebSocket Protocol is designed on the principle that there should be minimal framing"

WebSocket이 제공하는 프레이밍은 딱 두 가지 목적만을 위한 것임:

1. **스트림 → 메시지 단위 변환**: TCP는 연속적인 바이트 스트림인데, 애플리케이션은 "메시지" 단위로 생각함
2. **텍스트 vs 바이너리 구분**: UTF-8 텍스트인지 임의의 바이너리 데이터인지 구분

그 외의 모든 메타데이터(메시지 타입, 라우팅, 인증 등)는 **애플리케이션 레이어에서 알아서 처리하라**는 철학임.

---

### TCP의 문제: 메시지 경계가 없음

TCP는 바이트 스트림 프로토콜임. 데이터가 파이프를 타고 흐르듯 연속적으로 전달될 뿐, "여기서 메시지 끝"이라는 구분이 없음.

```
보내는 쪽:
  send("Hello")
  send("World")

TCP 파이프 안:
  [H][e][l][l][o][W][o][r][l][d]  ← 전부 붙어있음

받는 쪽이 실제로 받을 수 있는 것:
  recv() → "Hel"
  recv() → "loWor"
  recv() → "ld"
```

받는 쪽은 "Hello"가 어디서 끝나고 "World"가 어디서 시작하는지 알 수 없음.

---

### WebSocket의 해결: 프레임으로 경계 복원

WebSocket은 각 메시지를 프레임으로 감싸서 경계를 만들어줌:

```
보내는 쪽:
  ws.send("Hello")
  ws.send("World")

WebSocket 프레이밍 후:
  [FIN=1, len=5, "Hello"][FIN=1, len=5, "World"]
   ├─── 프레임 1 ───────┤├─── 프레임 2 ────────┤

받는 쪽:
  onMessage("Hello")  ← 정확히 원본 메시지 단위로 받음
  onMessage("World")
```

---

### "최소한"의 의미

WebSocket 프레임 헤더에 들어있는 정보는 이게 전부임:

| 필드 | 용도 |
|------|------|
| FIN | 메시지의 마지막 프레임인지 |
| Opcode | 텍스트(0x1) vs 바이너리(0x2) vs 컨트롤(0x8, 0x9, 0xA) |
| Length | 페이로드 길이 |
| Mask | 마스킹 여부 (보안용) |

HTTP 헤더와 비교해보면 차이가 확연함:

```
HTTP 헤더 (수백 바이트):
  Content-Type: application/json
  Content-Length: 42
  Authorization: Bearer xxx
  X-Request-ID: abc123
  Cache-Control: no-cache
  ... 등등

WebSocket 프레임 헤더 (2~14 바이트):
  [FIN + opcode][MASK + length]
  끝.
```

---

### WebSocket이 해주지 않는 것들

"최소한의 프레이밍" 철학은 곧 **나머지는 알아서 하라**는 뜻임:

```json
클라이언트가 보내는 실제 메시지:
{
  "type": "SUBSCRIBE",
  "channel": "stock.005930",
  "userId": "gun0",
  "token": "abc123"
}
```

WebSocket이 아는 것:
- "이건 텍스트 프레임이고, 길이는 120바이트다"

WebSocket이 모르는 것:
- `type`이 뭔지
- `channel`로 어디에 라우팅해야 하는지
- `userId`와 `token`으로 인증을 어떻게 처리할지

이런 것들은 전부 애플리케이션 레이어가 직접 구현해야 함.

---

### 그래서 STOMP 같은 서브프로토콜을 사용하는 것

**WebSocket만 사용하면:**

```java
@OnMessage
public void onMessage(String message) {
    // message = 그냥 문자열
    // 이게 뭔지, 누구한테 보낼지 직접 파싱해야 함
    
    JSONObject json = new JSONObject(message);
    String type = json.getString("type");
    
    if (type.equals("SUBSCRIBE")) {
        // 구독 로직 직접 구현
    } else if (type.equals("UNSUBSCRIBE")) {
        // 구독 해제 로직 직접 구현
    } else if (type.equals("SEND")) {
        // 메시지 전송 로직 직접 구현
    }
}
```

**STOMP를 얹으면:**

```java
@MessageMapping("/stock/{stockCode}")
public void handleStock(@DestinationVariable String stockCode, 
                        StockRequest request) {
    // 메시지 타입, 라우팅이 이미 처리되어 있음
}
```

---

### TCP 위에 WebSocket이 추가하는 것들

RFC 6455에서 WebSocket의 역할을 명확히 정의하고 있음:

#### 1. 웹 Origin 기반 보안 모델

```
Origin: http://example.com
```

브라우저 환경에서 "이 스크립트가 어디서 왔는지"를 서버에 알려줌. 서버가 cross-origin 요청을 거부할 수 있는 근거를 제공함.

#### 2. 주소 지정 및 프로토콜 네이밍

```http
GET /chat HTTP/1.1
Host: server.example.com
Sec-WebSocket-Protocol: stomp, mqtt
```

하나의 IP + 하나의 포트에서 여러 서비스를 제공할 수 있음:
- Path로 엔드포인트 구분 (`/chat`, `/notifications`)
- Host 헤더로 가상 호스팅
- `Sec-WebSocket-Protocol`로 서브프로토콜 협상

#### 3. 프레이밍 메커니즘

RFC에서 흥미로운 표현을 쓰고 있음:

> "layers a framing mechanism on top of TCP to get back to the IP packet mechanism that TCP is built on, but without length limits"

| 레이어 | 특성 |
|--------|------|
| IP | 패킷 기반, 경계 명확, 크기 제한 있음 (~1500 bytes) |
| TCP | 스트림 기반, 경계 없음, 크기 제한 없음 |
| WebSocket | 프레임 기반, 경계 명확, 크기 제한 없음 |

TCP가 IP 패킷들을 이어붙여서 "연속적인 스트림"으로 만들어버렸는데, WebSocket이 다시 "메시지 단위"를 복원해주는 것임.

#### 4. 프록시 친화적 Closing Handshake

TCP FIN/ACK만으로는 중간에 프록시가 있을 때 데이터 손실이 발생할 수 있음:

```
[Client] ----data----> [Proxy] ----data----> [Server]
[Client] <---FIN------ [Proxy]               [Server]  ← 프록시가 임의로 끊을 수 있음
```

WebSocket Close 프레임은 애플리케이션 레이어에서 종료를 협상하기 때문에 더 안전함:

```
[Client] ---Close Frame---> [Proxy] ---Close Frame---> [Server]
[Client] <--Close Frame---- [Proxy] <--Close Frame---- [Server]
[Client] -------TCP FIN-------> ... -------TCP FIN-------> [Server]
```

---

### "Raw TCP에 최대한 가깝게"

RFC의 핵심 문장:

> "Basically it is intended to be as close to just exposing raw TCP to script as possible given the constraints of the Web."

브라우저에서 JavaScript로 raw TCP 소켓을 직접 열 수는 없음 (보안상 이유). WebSocket은 그 제약 내에서 **최대한 TCP에 가까운 경험**을 제공하려는 것임.

**WebSocket이 추가하지 않는 것들:**

| 기능 | 이유 |
|------|------|
| 메시지 ID | 애플리케이션이 알아서 |
| 요청-응답 매핑 | 양방향 스트림일 뿐 |
| 재전송/순서 보장 | TCP가 이미 제공 |
| 메시지 압축 | 기본은 raw (확장으로 가능) |
| 인증 | HTTP 핸드셰이크에서 처리 |
| 라우팅 | 서브프로토콜이 처리 |

---

### HTTP 인프라와의 공존

> "It's also designed in such a way that its servers can share a port with HTTP servers"

이건 실용적으로 매우 중요한 설계 결정임:

```
Port 80/443
    │
    ├── GET /api/users HTTP/1.1     → 일반 HTTP 처리
    ├── GET /index.html HTTP/1.1    → 일반 HTTP 처리
    └── GET /ws HTTP/1.1            → WebSocket 업그레이드
        Upgrade: websocket
```

**장점:**
- 기존 로드밸런서, 프록시, 방화벽 통과 가능
- 추가 포트 오픈 불필요
- SSL 인증서 공유 가능

핸드셰이크가 HTTP Upgrade 형태인 이유도 이것 때문임. RFC에서 이렇게 언급하고 있음:

> "the design does not limit WebSocket to HTTP, and future implementations could use a simpler handshake over a dedicated port without reinventing the entire protocol"

HTTP 호환은 현재 웹 인프라를 위해 선택한 것이지, 프로토콜의 본질은 아니라는 뜻임.

---

### 확장성

> "The protocol is intended to be extensible; future versions will likely introduce additional concepts such as multiplexing."

확장을 위해 예약해둔 것들:

| 예약 항목 | 용도 |
|-----------|------|
| RSV1, RSV2, RSV3 비트 | 프레임별 확장 플래그 |
| Opcode 0x3-0x7 | 추가 데이터 프레임 타입 |
| Opcode 0xB-0xF | 추가 컨트롤 프레임 타입 |
| `Sec-WebSocket-Extensions` 헤더 | 확장 협상 |

**실제 확장 예시 - permessage-deflate:**

```
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
```

메시지 압축 확장인데, RSV1 비트를 사용해서 "이 프레임은 압축됨"을 표시함.

---

### 비유로 정리

**TCP = 고속도로**
- 차(바이트)들이 줄줄이 달림
- 어디서 한 무리가 끝나고 다음 무리가 시작하는지 구분선 없음

**WebSocket = 컨테이너 트럭**
- 화물(메시지)을 컨테이너(프레임)에 담아서 운송
- "컨테이너 안에 뭐가 들었는지"는 컨테이너 자체는 모름
- 그냥 "컨테이너 크기가 얼마다" 정도만 표시

**STOMP = 물류 시스템**
- 컨테이너 안에 송장을 붙여서 "이건 A에게, 저건 B에게"
- 화물 종류별로 분류
- 배송 추적

WebSocket은 컨테이너 트럭처럼 **안전하게 덩어리째 전달**만 해주고, 그 안의 내용물 관리는 STOMP 같은 상위 프로토콜이 담당하는 구조임.

---

### 정리

WebSocket의 설계 철학은 *"최소한만 하고, 나머지는 위임한다"* 로 요약할 수 있음:

| WebSocket이 하는 것 | WebSocket이 안 하는 것 |
|---------------------|------------------------|
| 메시지 경계 구분 | 메시지 타입/라우팅 |
| 텍스트/바이너리 구분 | 인증/권한 |
| 연결 유지 | 재연결 로직 |
| Ping/Pong heartbeat | 비즈니스 로직 |
| Origin 기반 보안 | 애플리케이션 레벨 보안 |

이런 철학 덕분에 WebSocket은 가볍고 범용적임. 그 위에 STOMP, Socket.IO, 또는 직접 만든 프로토콜을 얹어서 각자의 요구사항에 맞게 확장할 수 있음.

---

이렇게 RFC 6455 문서를 살펴보면서 Websocket 에 대해 알아 보았음. 다음 포스트 에서는 SpringBoot 에서 Websocket 이 어떻게 어떻게 구현되어져 있는지 살펴보는 시간을 가져볼까함.


