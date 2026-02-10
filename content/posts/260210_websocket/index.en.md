+++
title = 'What is WebSocket? (RFC 6455)'
date = '2026-01-21T15:38:26+09:00'
description = ""
summary = "Let’s walk through RFC 6455 to understand what WebSocket is and how the WebSocket protocol works."
categories = ["Websocket", "RFC6455"]
tags = []
series = ["Websocket"]
series_order = 2

draft = false
+++

## Introduction
Following the previous post about bidirectional communication before WebSocket, I’m going to read the WebSocket protocol spec, RFC 6455, and cover WebSocket in more detail.
*Examples used for detailed explanation were generated with the help of AI.*

---

## [RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455) (The WebSocket Protocol)

The goal of the WebSocket protocol is to provide a mechanism for browser-based applications that need bidirectional communication with a server, without relying on multiple HTTP connections (e.g., `XMLHttpRequest`, long polling). WebSocket is composed of an initial handshake followed by basic message framing over TCP.

In the past, applications that needed bidirectional communication between a client and a server often “abused” HTTP: they polled for server updates and then sent notifications via separate HTTP calls on top of that (RFC 6202).

One way to solve this is to use a single TCP connection for bidirectional traffic. WebSocket supports this approach.
WebSocket API spec: https://websockets.spec.whatwg.org/

WebSocket was designed to replace bidirectional communication techniques that used HTTP as a transport layer in order to benefit from existing infrastructure such as proxies, filtering, and authentication.
Existing techniques were implemented as compromises between efficiency and reliability, because HTTP was not originally built for bidirectional communication.

The WebSocket protocol attempts to address the goals of existing bidirectional HTTP techniques within HTTP infrastructure environments.
So it is designed to work over ports 80 and 443, and to support HTTP proxies and intermediaries—even if that adds complexity in today’s environment.

`That said, this design does not limit WebSocket to HTTP. The spec notes that future implementations could use a simpler handshake over a dedicated port without reinventing the entire protocol.`

The document emphasizes this because the traffic patterns of interactive messaging often do not resemble standard HTTP traffic, which can cause abnormal load on some infrastructure components.

---

## Protocol Overview

The WebSocket protocol consists of two parts: the handshake and data transfer.

```
// Client handshake request
GET /chat HTTP/1.1
        Host: server.example.com
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
        Origin: http://example.com
        Sec-WebSocket-Protocol: chat, superchat
        Sec-WebSocket-Version: 13

// Server handshake response
HTTP/1.1 101 Switching Protocols
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
        Sec-WebSocket-Protocol: chat
```

The client follows the Request-Line format and the server follows the Status-Line format. ([RFC 2616](https://datatracker.ietf.org/doc/html/rfc2616#page-35))

Once both sides send the handshake and it succeeds, data transfer begins.
This is a bidirectional communication channel where each side can send data independently, without waiting for the other side to “request” it.

Now the client and server exchange data in units called “messages” in the WebSocket spec.

`A WebSocket message may not map 1:1 to frames at a particular network layer.` The reason is that intermediate devices can *coalesce fragmented messages* or do the opposite (*split them further*).

Each frame that belongs to the same message contains the same type of data. Broadly, there are `textual data`, `binary data`, and `control frames` (not application data; e.g., protocol-level signaling such as closing the connection).

The WebSocket protocol defines six frame types and reserves ten for future use.

| Opcode | Type | Name | Description |
|--------|------|------|-------------|
| 0x0 | Data | Continuation | Continuation of the previous frame’s payload |
| 0x1 | Data | Text | UTF-8 text data |
| 0x2 | Data | Binary | Binary data |
| 0x3~0x7 | Data | Reserved | Reserved for future data frame extensions (5) |
| 0x8 | Control | Close | Request to close the connection |
| 0x9 | Control | Ping | Heartbeat / liveness check |
| 0xA | Control | Pong | Response to Ping |
| 0xB~0xF | Control | Reserved | Reserved for future control frame extensions (5) |

### “A fragmented message can be coalesced, or the opposite can happen”

That line can be confusing, so here’s an example.

First, why does fragmentation happen? Common reasons include:

1. MTU (Maximum Transmission Unit) limits (network packet size limit, typically ~1500 bytes)
Packets larger than the MTU may be split into smaller pieces on the path (fragmented). Think of it like a height limit in a tunnel.

2. The server may be configured to send in chunks of a specific size.

3. Similar to (1): intermediaries such as proxies, load balancers, or API gateways may split large frames.

4. Memory efficiency: splitting avoids buffering a huge payload all at once.

Back to the main point—let’s look at both coalescing and splitting.

```
1. Coalesced

(original: sent in fragments)
[Frame 1: FIN=0, opcode=text, "Hello "]
[Frame 2: FIN=0, opcode=continuation, "World"]
[Frame 3: FIN=1, opcode=continuation, "!"]

(an intermediary receives the three frames and forwards them as one)
[Frame: FIN=1, opcode=text, "Hello World!"]

2. Split

(original)
[Frame: FIN=1, "Hello World!"]

(an intermediary splits the original frame)
[Frame 1: FIN=0, "Hello "]
[Frame 2: FIN=1, "World!"]
```

As another example, assume we have a Spring Boot service (acting as a client) receiving real-time stock data via WebSocket from a financial server (acting as the server). Let’s walk through it.

```
Assume the financial server sends a single message split across multiple frames (and they are not coalesced in the middle):

[WebSocket Frame 1]
FIN: 0 (not done yet)
Opcode: 0x1 (text)
Payload: {"stockCode":"005930","price":71500,"vol

[WebSocket Frame 2]
FIN: 0 (not done yet)
Opcode: 0x0 (continuation)
Payload: ume":50000,"time":"09:00:01","seller":"

[WebSocket Frame 3]
FIN: 1 (this is the last)
Opcode: 0x0 (continuation)
Payload: foreign","buyer":"institution",...}
```

```java
@Component
public class WebSocketHandler extends TextWebSocketHandler {
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // message.getPayload() is already a complete message here
        // You receive the full payload: {"stockCode":"005930","price":71500,"volume":50000,...}
        String payload = message.getPayload();
    }
}
```

The reason `payload` is a complete message is that Spring buffers Frame 1 and 2 (because `FIN=0`), concatenates them, and when it sees Frame 3 with `FIN=1`, it combines the buffered data and then invokes `handleTextMessage()`.

One thing I felt while studying this is that, because frameworks implement so many things so well for us, it’s easy to ship features without really understanding what’s happening at the network level.

To summarize the “big picture” of the WebSocket protocol so far:
- It consists of two parts: Handshake and Data Transfer.
- After the handshake succeeds, the connection becomes bidirectional and data transfer happens. Data is exchanged as a unit called a `message`.
- A `message` may not match a specific network-layer frame, because intermediaries can split or coalesce it.
- WebSocket defines 16 opcodes total: 3 data frames + 3 control frames + 5 reserved data + 5 reserved control.

Next, let’s look at how the Opening Handshake works.


---

## Opening Handshake

| Header | Purpose |
|:------|:---:|
| Upgrade | Request protocol upgrade |
| Connection | Request connection upgrade |
| Sec-WebSocket-Key | Security key (Base64-encoded random 16 bytes) |
| Sec-WebSocket-Version | Protocol version (currently 13) |
| Sec-WebSocket-Protocol | Subprotocol (optional) |
| Origin | Origin info sent by the browser |

The initial handshake is designed to be compatible with HTTP-based servers and intermediaries, so that both HTTP clients and WebSocket clients can use a single port to talk to the same server.
Therefore, the WebSocket client’s handshake is an HTTP Upgrade request.

Header fields in the handshake can be sent in any order, so the order in which different header fields are received is not important.
The client includes the host name in the `Host` header field so that both the client and server can confirm they agree on the host being used.

Additional header fields are used to select options in the WebSocket protocol.
Common options include a subprotocol selector (`Sec-WebSocket-Protocol`), the list of extensions the client supports (`Sec-WebSocket-Extensions`), and the `Origin` field. The `Sec-WebSocket-Protocol` request header indicates subprotocols (application-level protocols layered on top of WebSocket) that the client is willing to use. The server may select one of the acceptable protocols—or none—and it echoes the selected value in the handshake response.

```
// Client handshake request

GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13


// Server handshake response

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat <- the server echoes the protocol it selected
```

When the server receives the client’s handshake, it must include two key pieces of information in the response. The first is `Sec-WebSocket-Accept`.

### How to compute `Sec-WebSocket-Accept`

The `Sec-WebSocket-Accept` field indicates whether the server is willing to accept the WebSocket connection.

1. Take `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==`
2. Concatenate: `dGhlIHNhbXBsZSBub25jZQ==` + `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`
3. Compute SHA-1 hash: `0xb3 0x7a 0x4f 0x2c 0xc0 0x62 0x4f 0x16 0x90 0xf6 0x46 0x06 0xcf 0x38 0x59 0x45 0xb2 0xbe 0xc4 0xea`
4. Base64 encode: `"s3pPLMBiTxaQ9kYGzzhZRbK+xOo="`
5. Include `Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=` in the response

By returning `Sec-WebSocket-Accept` and status code `101`, the server tells the client it accepted the handshake.

```
// If the server accepts the client's handshake and the connection is established normally, the status code is 101.
// Any status code other than 101 means the WebSocket handshake did not complete.
HTTP/1.1 101 Switching Protocols
```

Based on this response, the client checks that `Sec-WebSocket-Accept` matches the expected value, required header fields are present, and the HTTP status code is `101`. If any of these checks fail, no WebSocket frames are sent.

To recap:
- The handshake begins as an HTTP protocol upgrade request.
- Header order does not matter.
- The server response must include `Sec-WebSocket-Accept` computed from `Sec-WebSocket-Key`, along with HTTP status `101`.

Next, let’s look at how a WebSocket connection is closed.

---

## Closing Handshake

WebSocket also uses a handshake-style process when closing the connection.

1. One side sends a control frame indicating close.
2. The other side responds with a close control frame.
3. After both sides have sent and received a close frame, the TCP connection is closed.

The reason WebSocket uses its own closing handshake is to complement the TCP closing handshake (FIN/ACK). If there are intercepting proxies or other intermediaries, TCP closing handshake signals are not always reliably end-to-end, according to the spec.

What does “not reliably end-to-end” mean here? Using the TCP closing handshake (4-way handshake) can lead to data loss.

```
// TCP Closing handshake

Client                    Server
   |                         |
   |-------- FIN ----------->|  "I'm done sending"
   |<------- ACK ------------|  "OK"
   |<------- FIN ------------|  "I'm done too"
   |-------- ACK ----------->|  "OK"
   |                         |
```

The core issue described is that with intermediaries (proxies, load balancers), TCP close may not propagate end-to-end as expected.

Let’s look at an example if you rely only on the TCP closing handshake.

Here’s a quick reference for flags:

| Flag | Purpose | When used |
|------|---------|----------|
| SYN | Start connection | Start 3-way handshake |
| ACK | Acknowledge receipt | Included in most packets |
| FIN | Graceful close | When no more data to send |
| RST | Abort / reset | Error cases, abnormal close |

```java
// Reproducing a scenario: the client closes the socket while the stock server is still sending data.

// Stock Server side
session.sendMessage(new TextMessage(stockData1));  // delivered
session.sendMessage(new TextMessage(stockData2));  // delivered, but the client hasn't read it yet

// Client side - suddenly closes the socket
socket.close();  // stockData2 is still in the receive queue when closing
```

What happens at the OS level:

```
[Client receive queue]
+----------------------+
| stockData2 (unread)  |  ← the app hasn't consumed it yet
+----------------------+

socket.close() is called
         ↓
OS: "You want to close with unread data still pending?"
         ↓
OS sends an RST packet (instead of a graceful FIN)
         ↓
Stock Server receives RST
         ↓
Stock Server's recv() fails (Connection reset by peer)
```

### RST vs FIN

```
FIN: "I'm done. Let's close cleanly."
RST: "Emergency! Reset the connection—something went wrong!"
```

When the stock server receives an RST:
- It discards any remaining data it was about to send.
- It logs errors.
- Connection state becomes harder to reason about.

At this point you might wonder: doesn’t the same issue apply to HTTP request/response too?

Yes, the same issue can happen.
But it usually doesn’t matter much:
- The request/response is already complete.
- The connection is short-lived.
- The next request can use a new connection.

```
HTTP example

Client                    Proxy                    Server
   │                        │                        │
   │── GET /stock ─────────>│── GET /stock ─────────>│
   │                        │                        │
   │<── 200 OK + data ──────│<── 200 OK + data ──────│
   │                        │                        │
   │── FIN ────────────────>│                        │
   │                        │   (may or may not forward)
   │                        │                        │
```

HTTP is stateless, and once a request/response ends, the connection’s job is done—so an abnormal close is typically not a big deal.

```
WebSocket example

Client                    Proxy                    Server
   │                        │                        │
   │══ WebSocket connection (persistent) ════════════│
   │                        │                        │
   │<── stockData1 ─────────│<── stockData1 ─────────│
   │<── stockData2 ─────────│<── stockData2 ─────────│
   │<── stockData3 ─────────│<── stockData3 ─────────│
   │         ...            │         ...            │
   │                        │                        │
   │── FIN ────────────────>│                        │
   │                        │   (not forwarded)       │
   │                        │                        │
   │                        │<── stockData4 ─────────│  ← server keeps sending!
   │                        │<── stockData5 ─────────│
   │                        │<── stockData6 ─────────│
   │                        │                        │
   │                        │   buffered in proxy     │
   │                        │   or lost somewhere     │
```

But WebSocket is stateful and the connection stays open while data flows continuously, so this becomes a real problem.

That’s why WebSocket closes via its own handshake.
The close frame is an application-layer message that intermediaries must forward. Unlike TCP FIN, a proxy cannot arbitrarily handle it.

```
Client                    Proxy                    Server
   │                        │                        │
   │── Close Frame ────────>│── Close Frame ────────>│  ← application level
   │                        │                        │
   │                        │   Server: "closing"     │
   │                        │           unsubscribe   │
   │                        │           stop sending  │
   │                        │                        │
   │<── Close Frame ────────│<── Close Frame ────────│
   │                        │                        │
   │── FIN ────────────────>│── FIN ────────────────>│  ← then TCP closes
```

---

## WebSocket design philosophy: minimal framing

### Core principle

RFC 6455 states WebSocket’s design principle like this:

> "The WebSocket Protocol is designed on the principle that there should be minimal framing"

The framing WebSocket provides is for exactly two purposes:

1. **Stream → message conversion**: TCP is a continuous byte stream, but applications think in “messages”
2. **Text vs binary distinction**: whether a payload is UTF-8 text or arbitrary binary

All other metadata (message type, routing, authentication, etc.) is **intentionally left to the application layer**.

---

### The TCP problem: no message boundaries

TCP is a byte-stream protocol. Data flows continuously like water through a pipe; there’s no notion of “this is the end of a message.”

```
Sender:
  send("Hello")
  send("World")

Inside the TCP pipe:
  [H][e][l][l][o][W][o][r][l][d]  ← all contiguous

What the receiver may actually get:
  recv() → "Hel"
  recv() → "loWor"
  recv() → "ld"
```

The receiver can’t tell where “Hello” ends and “World” begins.

---

### WebSocket’s solution: restore boundaries with frames

WebSocket wraps each message in frames to define boundaries:

```
Sender:
  ws.send("Hello")
  ws.send("World")

After WebSocket framing:
  [FIN=1, len=5, "Hello"][FIN=1, len=5, "World"]
   ├─── Frame 1 ───────┤├─── Frame 2 ────────┤

Receiver:
  onMessage("Hello")  ← receives exactly the original message units
  onMessage("World")
```

---

### What “minimal” means

This is all the information that appears in the WebSocket frame header:

| Field | Purpose |
|------|------|
| FIN | Whether this is the last frame of the message |
| Opcode | Text (0x1) vs Binary (0x2) vs Control (0x8, 0x9, 0xA) |
| Length | Payload length |
| Mask | Whether masking is used (security) |

Compared to HTTP headers, the difference is obvious:

```
HTTP headers (hundreds of bytes):
  Content-Type: application/json
  Content-Length: 42
  Authorization: Bearer xxx
  X-Request-ID: abc123
  Cache-Control: no-cache
  ... and so on

WebSocket frame header (2~14 bytes):
  [FIN + opcode][MASK + length]
  That's it.
```

---

### What WebSocket does *not* do

The “minimal framing” philosophy also means: **everything else is your job**.

```json
Example of an actual client message:
{
  "type": "SUBSCRIBE",
  "channel": "stock.005930",
  "userId": "gun0",
  "token": "abc123"
}
```

What WebSocket knows:
- "This is a text frame and its length is 120 bytes."

What WebSocket doesn’t know:
- What `type` means
- How to route by `channel`
- How to authenticate/authorize using `userId` and `token`

All of that must be implemented by the application layer.

---

### Why you use subprotocols like STOMP

**With plain WebSocket only:**

```java
@OnMessage
public void onMessage(String message) {
    // message is just a string
    // you must parse it and implement routing / semantics yourself
    
    JSONObject json = new JSONObject(message);
    String type = json.getString("type");
    
    if (type.equals("SUBSCRIBE")) {
        // implement subscribe logic
    } else if (type.equals("UNSUBSCRIBE")) {
        // implement unsubscribe logic
    } else if (type.equals("SEND")) {
        // implement message sending logic
    }
}
```

**If you layer STOMP on top:**

```java
@MessageMapping("/stock/{stockCode}")
public void handleStock(@DestinationVariable String stockCode,
                        StockRequest request) {
    // message type and routing are already handled
}
```

---

### What WebSocket adds on top of TCP

RFC 6455 clearly defines WebSocket’s role:

#### 1. Web Origin-based security model

```
Origin: http://example.com
```

In browser environments, this tells the server “where the script came from,” giving the server a basis to reject cross-origin requests.

#### 2. Addressing and protocol naming

```http
GET /chat HTTP/1.1
Host: server.example.com
Sec-WebSocket-Protocol: stomp, mqtt
```

You can provide multiple services on a single IP + port:
- Distinguish endpoints via path (`/chat`, `/notifications`)
- Virtual hosting via the `Host` header
- Negotiate subprotocols via `Sec-WebSocket-Protocol`

#### 3. Framing mechanism

The RFC uses an interesting phrasing:

> "layers a framing mechanism on top of TCP to get back to the IP packet mechanism that TCP is built on, but without length limits"

| Layer | Property |
|--------|------|
| IP | Packet-based, clear boundaries, size limits (~1500 bytes) |
| TCP | Stream-based, no boundaries, no size limits |
| WebSocket | Frame-based, clear boundaries, no size limits |

TCP stitches IP packets together into a continuous stream, and WebSocket restores application-level message boundaries.

#### 4. Proxy-friendly Closing Handshake

TCP FIN/ACK alone can cause data loss when a proxy is involved:

```
[Client] ----data----> [Proxy] ----data----> [Server]
[Client] <---FIN------ [Proxy]               [Server]  ← proxy may cut off independently
```

WebSocket Close frames negotiate closure at the application layer, which is safer:

```
[Client] ---Close Frame---> [Proxy] ---Close Frame---> [Server]
[Client] <--Close Frame---- [Proxy] <--Close Frame---- [Server]
[Client] -------TCP FIN-------> ... -------TCP FIN-------> [Server]
```

---

### “As close to raw TCP as possible”

A key sentence from the RFC:

> "Basically it is intended to be as close to just exposing raw TCP to script as possible given the constraints of the Web."

Browsers cannot allow JavaScript to open raw TCP sockets directly (for security reasons). WebSocket aims to provide an experience **as close to TCP as possible** within those constraints.

**What WebSocket does not add:**

| Feature | Why |
|------|------|
| Message IDs | Up to the application |
| Request-response mapping | It’s a bidirectional stream |
| Retransmission / ordering | TCP already provides this |
| Compression | Raw by default (possible via extensions) |
| Authentication | Typically handled in the HTTP handshake |
| Routing | Typically handled by a subprotocol |

---

### Coexisting with HTTP infrastructure

> "It's also designed in such a way that its servers can share a port with HTTP servers"

This is a very practical design decision:

```
Port 80/443
    │
    ├── GET /api/users HTTP/1.1     → handled as normal HTTP
    ├── GET /index.html HTTP/1.1    → handled as normal HTTP
    └── GET /ws HTTP/1.1            → WebSocket upgrade
        Upgrade: websocket
```

**Benefits:**
- Can pass through existing load balancers, proxies, and firewalls
- No need to open extra ports
- Can share TLS certificates

This is why the handshake takes the form of an HTTP Upgrade request. The RFC also mentions:

> "the design does not limit WebSocket to HTTP, and future implementations could use a simpler handshake over a dedicated port without reinventing the entire protocol"

In other words, HTTP compatibility is a choice for today’s web infrastructure, not the essence of the protocol.

---

### Extensibility

> "The protocol is intended to be extensible; future versions will likely introduce additional concepts such as multiplexing."

Reserved for extensions:

| Reserved item | Purpose |
|-----------|------|
| RSV1, RSV2, RSV3 bits | Per-frame extension flags |
| Opcode 0x3-0x7 | Additional data frame types |
| Opcode 0xB-0xF | Additional control frame types |
| `Sec-WebSocket-Extensions` header | Extension negotiation |

**A real-world extension example — permessage-deflate:**

```
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
```

This is a message compression extension; it uses the RSV1 bit to mark “this frame is compressed.”

---

### Analogy

**TCP = a highway**
- Cars (bytes) keep flowing
- No clear boundary lines showing where one “group” ends and the next begins

**WebSocket = container trucks**
- Goods (messages) are packed into containers (frames)
- The truck doesn’t know what’s inside; it just carries the container safely
- It only needs minimal info like container size

**STOMP = a logistics system**
- Adds manifests: “this goes to A, that goes to B”
- Categorizes goods by type
- Adds tracking and routing

WebSocket is like the container truck: it delivers payloads safely as chunks, while higher-level protocols such as STOMP manage what’s inside.

---

### Summary

WebSocket’s design philosophy can be summarized as: *“do the minimum, delegate the rest.”*

| What WebSocket does | What WebSocket doesn’t do |
|---------------------|---------------------------|
| Define message boundaries | Message types / routing |
| Distinguish text vs binary | Auth / authorization |
| Keep the connection alive | Reconnect logic |
| Ping/Pong heartbeat | Business logic |
| Origin-based security basis | Application-level security |

Because of this philosophy, WebSocket is lightweight and general-purpose. You can layer STOMP, Socket.IO, or your own custom protocol on top depending on your needs.

---

That’s what I learned from reading RFC 6455 and digging into how WebSocket works. In the next post, I’m thinking of exploring how WebSocket is implemented in Spring Boot.

