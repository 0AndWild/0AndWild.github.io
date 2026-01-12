+++
title = 'Bidirectional Communication Before WebSocket'
date = '2026-01-12T21:18:15+09:00'
description = ""
summary = "Let's explore HTTP long polling and HTTP streaming by reading RFC 6202 about bidirectional communication before WebSocket"
categories = ["Websocket", "HTTP long polling", "Http streaming", "RFC6202"]
tags = []
series = ["Websocket"]
series_order = 1

draft = false
+++

## Introduction

While working on a mock investment project, I needed to serve real-time stock price fluctuation data and ended up using WebSocket technology.
I've known about WebSocket, a bidirectional real-time communication technology, for some time, but never dug deep into it. I took this opportunity to dive in thoroughly.

While reading RFC 6455, the WebSocket technical document, I found a section that referenced RFC 6202 (Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP) to explain past processing methods and their problems.
Today, I'll read RFC 6202 to learn how bidirectional communication was handled before WebSocket emerged, and explore the thoughts and best practices of that time.

---

## [RFC 6202]("https://datatracker.ietf.org/doc/html/rfc6202") (Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP)



This document, written in April 2011, discusses HTTP long polling and HTTP streaming as well-known issues and best practices for bidirectional HTTP communication at that time. It also acknowledges that both HTTP long polling and HTTP streaming are extensions of HTTP, and that the HTTP protocol was not designed for bidirectional communication.
The authors note that this document neither recommends using these two methods nor discourages their use, but rather focuses on discussing good use cases and issues.

Fundamentally, HTTP (Hypertext Transfer Protocol: RFC 2616) is a request/response protocol.
HTTP defines three entities: clients, proxies, and servers.
A client creates a connection to send an HTTP request to a server, and the server accepts the connection to process the HTTP request by returning a response. Proxies are objects that can intervene in forwarding requests and responses between clients and servers.

By default, the standard HTTP model doesn't allow servers to send asynchronous events to clients because servers cannot initiate connections to clients first and cannot send unsolicited HTTP responses.

So to receive asynchronous events as quickly as possible, clients must periodically poll the server. This continuous polling forces request/response cycles even when there's no data, consuming network resources and reducing application response efficiency as data queues up until the server receives the next polling request.

---

## HTTP long polling & HTTP streaming


## 1. HTTP long polling

Traditional short polling is a technique where clients periodically send requests to the server to update data, but they receive empty responses even when there are no new events, or must wait until the next poll. This technique's request cycle is determined by the delay time set by the client, and when this cycle is short (high polling frequency), it can cause unbearable burden on both server and network.

In contrast, long polling attempts to minimize message delivery delays and network resource usage by responding to requests only when specific events, states, or network timeouts occur.

### HTTP long polling life cycle

1. Client creates an initial request and waits for a response
2. Server withholds response until updates are available or a specific state or timeout occurs
3. When updates become available, server sends a response to the client
4. Immediately after receiving the response, client either creates a new long poll request right away or after an acceptable delay

### HTTP long polling issues

1. Header overhead: Since every request/response is an HTTP message, HTTP headers always accompany it even if the data is small.
For small data, headers can constitute a significant portion of data transmission. If the network MTU (Maximum Transmission Unit) can accommodate all information including headers in a single IP packet, the network burden isn't significant. However, when small messages are frequently exchanged, the problem of transmission volume being large relative to actual data occurs.
For example, it's like sending a single sheet of paper (20g) in a delivery box (300g).

2. Maximal latency: Even if the server wants to immediately send a new message right after sending a long poll response, it must wait until the client's next request arrives. Average latency is close to 1 network transit, but in the worst case can extend up to 3 network transits (response-request-response), and considering TCP packet loss retransmission, even more can occur.

3. Connection Establishment: Both short polling and long polling are criticized for frequently opening and closing TCP/IP connections. However, both polling mechanisms work well with persistent HTTP connections that can be reused.

4. Allocated Resources: Operating systems allocate resources to TCP/IP connections and pending HTTP requests. HTTP long polling requires both TCP/IP connections and HTTP requests to remain open for each client. Therefore, when determining the scale of an HTTP long polling application, it's important to consider resources related to both.


5. Graceful Degradation: When servers or clients are overloaded, messages can queue up and multiple messages can be bundled in one response. Latency increases but per-message overhead decreases, naturally distributing the load.

6. Timeouts: Long poll requests can have timeout issues because they must maintain a hanging state until the server has data to send.

7. Caching: If intermediate proxies or CDNs cache responses, the problem of receiving old data instead of fresh data can occur. While clients or hosts have no way to inform HTTP intermediaries that long polling is in use, caching that could interfere with bidirectional flow can be controlled with standard headers or cookies. As a best practice, caching should always be intentionally suppressed in long polling requests or responses. Set the "Cache-Control" header to "no-cache".


---


## 2. HTTP Streaming

The mechanism of HTTP streaming is to never terminate the request or disconnect the connection even after the server sends data to the client.
This mechanism significantly reduces network latency because clients and servers don't need to continuously initiate and disconnect connections.

### HTTP Streaming life cycle

1. Client creates an initial request and waits for a response
2. Server withholds response until updates are available or a specific state or timeout occurs
3. When updates become available, server sends a response to the client
4. After sending data, server continues step 3 without terminating the request or disconnecting

### HTTP Streaming issues


1. Network Intermediaries: The HTTP protocol allows intermediaries (proxies, transparent proxies, gateways, etc.) to intervene in the process of transmitting responses from server to client. HTTP Streaming doesn't work with these intermediaries.

2. Maximal Latency: Theoretically 1 network transit, but in practice, connections must be periodically disconnected and reconnected to prevent unlimited growth in memory usage related to Javascript/DOM elements. Ultimately, like long polling, maximum latency is 3 network transits.

3. Client Buffering: According to HTTP specifications, there's no obligation to process partial responses immediately. While most browsers execute response JS, some only execute after buffer overflow occurs. Sending blank characters to fill the buffer can be used as a method.

4. Framing Techniques: When using HTTP Streaming, multiple application messages can be transmitted in a single HTTP response. However, because intermediate objects like proxies can re-chunk chunk units, messages cannot be distinguished by chunk units. Therefore, separators must be separately defined at the application level. Long polling doesn't have this problem because there's one message per response.



---

 ## Other server-push mechanisms

 Besides the two mechanisms above, this section introduces Bayeux (4.1), BOSH (4.2), Server-Sent Events (4.3), etc.
 It covers recommendations when using the SSE mechanism, as follows:

 The specification recommends disabling HTTP chunking. The reason is the same as the HTTP streaming issues explained above.

 - Intermediate proxies can re-chunk chunks
 - Some proxies can buffer entire responses


---


## Best Practices


### Summary

| Item | Key Content | Recommendation |
|------|-----------|----------|
| Connection Limit | 6-8 per browser limit | Use one for long poll, detect duplicates with cookies |
| Pipelining | Regular requests can get blocked behind long poll | Check support before use, prepare fallback |
| Proxies | Starvation occurs when connections are shared | Use async proxies, avoid connection sharing |
| Timeouts | Too high gets 408/504, too low wastes traffic | 30 seconds recommended |
| Caching | Real-time data shouldn't be cached | `Cache-Control: no-cache` mandatory |
| Security | Vulnerable to Injection, DoS | Input validation, connection limit |

---


## 1. Limits to the Maximum Number of Connections

### Background

The HTTP specification (RFC 2616) originally recommended that **a single client maintain a maximum of 2 connections** to a server. There are two reasons:

1. Prevent server overload
2. Prevent unexpected side effects in congested networks

Recent browsers have increased this limit to 6-8, but limits still exist. The problem is that users quickly exhaust these connections when opening multiple tabs or frames.

### Why is this a problem?

Long polling occupies connections for a long time. If 3 tabs each open 2 long polls:

```
Tab 1: 2 long poll connections
Tab 2: 2 long poll connections
Tab 3: 2 long poll connections
─────────────────────
Total 6 connections → Browser limit reached
```

In this state, to send regular HTTP requests (images, API calls, etc.), you must **wait until existing connections end**. This is called **connection starvation**.

### Recommendations

**Client side:**
- Ideally, **limit long poll requests to one** and have multiple tabs/frames share it
- However, sharing resources between tabs is difficult due to browser security models (Same-Origin Policy, etc.)

**Server side:**
- **Must use cookies to detect duplicate long poll requests from the same browser**
- When duplicate requests are detected, don't make both wait—immediately respond to one to release it

```
[Wrong handling]
Request 1: Waiting...
Request 2: Waiting...  ← Both waiting causes connection starvation

[Correct handling]
Request 1: Waiting...
Request 2: Arrives → Immediately send empty response to Request 1 → Only Request 2 waits
```

---

## 2. Pipelined Connections

### What is pipelining?

A feature supported in HTTP/1.1 that allows **sending multiple requests consecutively** without waiting for responses.

```
[Without pipelining]
Request 1 → Response 1 → Request 2 → Response 2 → Request 3 → Response 3

[With pipelining]
Request 1 → Request 2 → Request 3 → Response 1 → Response 2 → Response 3
```

### Advantages in Long Polling

Useful when the server needs to send multiple messages in a short time. With pipelining, the server doesn't need to wait for the client's new request after responding. Requests are already queued.

### Problem: Regular requests get blocked

There's a critical problem with pipelining. **If a regular request gets queued behind a long poll, it must wait until the long poll ends**.

```
[Pipeline queue]
1. Long poll request (waiting 30 seconds...)
2. Image request ← Wait until long poll ends
3. API request ← Wait until long poll ends
```

This can delay page loading by 30 seconds.

### Precautions

- HTTP POST pipelining is **not recommended** in RFC 2616
- Protocols like BOSH or Bayeux pipeline POSTs while guaranteeing order with request IDs
- To use pipelining, must **verify that clients, intermediate equipment, and servers all support it**
- If not supported, must **fallback** to non-pipelined method

---

## 3. Proxies

### Compatibility with general proxies

**Long Polling:** Works well with most proxies. Because it ultimately sends a complete HTTP response (when events occur or timeout).

**HTTP Streaming:** Has problems. It relies on two assumptions:
1. Proxy will forward each chunk immediately → **Not guaranteed**
2. Browser will immediately execute arrived JS chunks → **Not guaranteed**

### Reverse proxy problems

Reverse proxies appear as the actual server from the client's perspective, but play the role of forwarding requests to the real server behind them.

```
Client → [Reverse Proxy] → Actual Server
              (Nginx, Apache, etc.)
```

Both long polling and streaming work, but there are **performance issues**. Most proxies aren't designed to maintain many connections for long periods.

### Connection Sharing Problem

This is the most serious problem. Proxies like Apache mod_jk are designed to have **multiple clients share a small number of connections**.

```
[Apache mod_jk connection pool: 8 connections]

Client A's long poll → Connection 1 occupied (30 seconds...)
Client B's long poll → Connection 2 occupied (30 seconds...)
Client C's long poll → Connection 3 occupied (30 seconds...)
...
Client H's long poll → Connection 8 occupied (30 seconds...)

Client I's regular request → No connection! Waiting...
Client J's regular request → No connection! Waiting...
```

When all 8 connections are occupied by long polls, all other requests (whether long poll or regular) get blocked. This is called **connection starvation**.

### Root cause: Synchronous vs Asynchronous

| Model | Operation | Long Poll Impact |
|------|-----------|----------------|
| **Synchronous** | One thread/connection per request | Severe resource exhaustion |
| **Asynchronous** | Event-based, minimal resources per connection | Minimal impact |

Synchronous examples: Apache mod_jk, Java Servlet 2.5
Asynchronous examples: Nginx, Node.js, Java Servlet 3.0+

**Conclusion:** When using long polling/streaming, **must avoid connection sharing**. HTTP's basic assumption is "each request completes as quickly as possible," but long poll breaks this assumption.

---

## 4. HTTP Responses

This is simple. Just follow standard HTTP.

- When server successfully receives a request, respond with **200 OK**
- Response timing: event occurrence, state change, or timeout
- Response body includes actual event/state/timeout information

Nothing special, just comply with HTTP specifications.

---

## 5. Timeouts

### Dilemma

Setting long poll timeout values is tricky:

**If set too high:**
- May receive **408 Request Timeout** from server
- May receive **504 Gateway Timeout** from proxy
- Slow detection of disconnected network connections

**If set too low:**
- Unnecessary requests/responses increase
- Network traffic waste
- Server load increase

### Experimental results and recommended values

```
Browser default timeout: 300 seconds (5 minutes)
Values that succeeded in experiments: up to 120 seconds
Safe recommended value: 30 seconds
```

Most network infrastructure (proxies, load balancers, etc.) don't have timeouts as long as browsers. Intermediate equipment can disconnect first.

### Recommendations for network equipment vendors

To be long polling compatible, timeouts must be set **significantly longer than 30 seconds**. "Significantly" here means several times the average network round-trip time or more.

---

## 6. Impact on Intermediary Entities

### Transparency problem

Long poll requests are **indistinguishable from regular HTTP requests** from the perspective of intermediate equipment (proxies, gateways, etc.). There's no way to tell them "this is a long poll, so handle it specially."

This can cause intermediate equipment to do unnecessary work:
- Attempt caching (shouldn't cache real-time data)
- Apply timeouts (long poll is supposed to take long)
- Attempt connection reuse (long poll has long occupation time)

### Cache prevention

The most important thing is **cache prevention**. If real-time data is cached, clients receive past data.

**Header that must be set:**

```http
Cache-Control: no-cache
```

This header must be included in both requests and responses. It's a standard HTTP header, so most intermediate equipment understands and respects it.

---

## 7. Security Considerations

RFC 6202 is a document that describes existing usage patterns of HTTP, not proposing new features. Therefore, it doesn't create new security vulnerabilities. However, there are security issues that exist in already deployed solutions.

### 1. Injection attacks (Cross-Domain Long Polling)

**Problem situation:**

When using the JSONP method in cross-domain long polling, the browser executes JavaScript returned by the server.

```javascript
// Server response (JSONP)
callback({"price": 52300});
```

If the server is vulnerable to injection attacks, attackers can insert malicious code:

```javascript
// Response manipulated by attacker
callback({"price": 52300}); stealCookies();
```

The browser executes this as is.

**Countermeasures:**
- Thorough server-side input validation
- Use CORS and avoid JSONP
- Set Content-Type headers accurately

### 2. DoS (Denial of Service) attacks

**Problem situation:**

Long polling and HTTP streaming must **maintain many connections for long periods**. If attackers open a large number of long poll connections:

```
Attacker → Opens 1,000 connections (each waiting 30 seconds)
         ↓
Server resource exhaustion → Normal users cannot receive service
```

Regular HTTP requests end quickly, so resource occupation time per connection is short. But long poll is intentionally maintained for long periods, making it vulnerable to DoS.

**Countermeasures:**
- Limit connections per IP
- Allow long poll only for authenticated users
- Apply rate limiting
- Use asynchronous servers (minimize resources per connection)


---

## Conclusion

By reading RFC 6202, I learned how server push events were created in the past. It was good to learn in more detail about the knowledge and problems of polling, streaming, and SSE mechanisms that I already knew.

The organized thought from reading this document is that it's a concept of extending the HTTP protocol rather than a new protocol, and because HTTP by design is not a protocol for bidirectional asynchronous communication, it felt like they abused it to achieve the purpose of server event push.

In the next post, I'll organize the RFC 6455 WebSocket document and try to connect the problems from RFC 6202 with the development process.