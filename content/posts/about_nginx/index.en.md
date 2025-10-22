+++
title = 'What is Nginx? Evolution and Architecture of Web Servers'
date = '2022-10-25T19:17:04+09:00'
description = "Explore Nginx from its origins to its differences with Apache, internal architecture, and key features including reverse proxy, load balancing, and more."
summary = "A comprehensive guide covering high-performance web server Nginx concepts, Apache comparison, Event-Driven architecture, and practical features used in production"
categories = ["Web Server", "Infrastructure"]
tags = ["Nginx", "Apache", "Web Server", "Reverse Proxy", "Load Balancing", "SSL", "Performance"]
series = ["Nginx"]
series_order = 1

draft = false
+++

{{< figure src="featured.png" alt="Nginx logo" class="mx-auto" >}}

## What is Nginx?

**Nginx** (engine-x) is a **lightweight, high-performance web server software**. It functions not only as a web server but also as a reverse proxy, load balancer, and HTTP cache.

Nginx was designed to handle high concurrent connections and is currently used by numerous large-scale websites worldwide.

### Why Was Nginx Needed?

In the past, **Apache web server** was the industry standard. However, in the early 2000s, as internet users grew exponentially, a bottleneck called the **C10k problem** emerged.

## The C10k Problem

The **C10k problem** stands for "Connection 10,000," meaning **handling 10,000 concurrent client connections on a single server**.

{{< alert "circle-info" >}}
**Important Concept Distinction**

- **Concurrent Processing**: Maintaining and managing many connections simultaneously
- **Throughput**: Number of requests that can be processed per second

Concurrent connection handling focuses on **efficient resource management and scheduling** rather than raw speed.
{{< /alert >}}

{{< figure src="figure1.png" alt="Apache's thread-based architecture - one thread per connection" class="mx-auto" >}}

### Apache's Architectural Limitations

Traditional Apache had the following structural issues:

#### 1. Process-Based Processing
- **Creates a new process or thread** for each incoming request
- Number of processes increases proportionally with users
- Results in **memory exhaustion**

#### 2. High Resource Consumption
- Apache's powerful extensibility allows various module additions
- However, each process **loads all modules into memory**
- Memory usage per process increases

#### 3. Context-Switching Overhead
- CPU cores alternate between multiple processes
- **Context-switching costs** occur during process transitions
- CPU overhead increases with more requests

Due to these issues, Apache was **unsuitable for large-scale concurrent connection environments**.

## The Birth of Nginx

{{< figure src="figure2.png" alt="Igor Sysoev - Nginx Developer" class="mx-auto" >}}

In 2002, Russian developer **Igor Sysoev** began developing Nginx to solve this problem, releasing the first version in 2004.

### Nginx's Core Goals

1. **High concurrent connection handling**
2. **Low memory footprint**
3. **High performance and stability**

### Nginx's Primary Roles

- **HTTP Server**: Quickly serves static files (HTML, CSS, JS, images)
- **Reverse Proxy Server**: Relays requests to backend application servers
- **Load Balancer**: Distributes traffic across multiple servers
- **Mail Proxy Server**: Mail server proxy functionality

---

## Nginx Internal Architecture

{{< figure src="figure3.png" alt="Event-Driven Nginx Architecture" class="mx-auto" >}}

Nginx consists of **1 Master Process** and **multiple Worker Processes**.

### Master Process Responsibilities

The Master Process handles:

- Reading and validating configuration files
- Creating and managing Worker Processes
- Restarting Worker Processes on configuration changes

```bash
# Check Master Process
ps aux | grep nginx
```

### Worker Process Responsibilities

Worker Processes handle actual client requests:

#### 1. Connection Management
- Receives **listen socket** from Master Process
- Forms connections with clients
- Maintains connections for **Keep-Alive** duration
- One Worker handles **thousands of connections** simultaneously

#### 2. Non-blocking I/O
- Processes other tasks when no requests on connection
- Responds immediately when requests arrive
- Efficient processing via **asynchronous Event-Driven** approach

#### 3. Thread Pool
- Delegates time-consuming tasks (file I/O, DB queries) to **Thread Pool**
- Worker Process continues handling other requests
- Minimizes impact of blocking operations

#### 4. CPU Core Optimization
- Worker Processes are typically created **equal to CPU core count**
- Each Worker pinned to specific CPU core (CPU Affinity)
- **Minimizes Context-Switching** for performance improvement

```nginx
# nginx.conf configuration example
worker_processes auto;  # Auto-create based on CPU core count
worker_cpu_affinity auto;  # Auto-set CPU affinity
```

### Event-Driven Architecture

Nginx operates with **Multi-process + Single-thread + Event-Driven** approach:

1. **Event Handler** manages multiple connections
2. Processes via **asynchronous Non-blocking** method
3. Executes ready events sequentially
4. **Maximizes resource efficiency** without idle processes

This allows **efficient memory and CPU usage** without processes waiting idle for requests like Apache.

---

## Nginx Advantages and Disadvantages

### Advantages

#### 1. High Concurrent Connection Capability
- **10x more concurrent connections** compared to Apache
- **2x faster** processing speed for same connection count

#### 2. Low Resource Usage
- Operates with fewer processes
- Minimized memory usage
- Fast response times with lightweight structure

#### 3. Zero-Downtime Configuration Reload
```bash
nginx -s reload  # Apply configuration without service interruption
```
- Master Process reads new configuration
- Existing Workers finish current requests then terminate
- New Workers handle requests with new configuration
- **Configuration changes without service interruption**

#### 4. Superior Static File Handling
- Quickly serves static content like images, CSS, JS
- Better static file performance than Apache

### Disadvantages

#### 1. Difficult Dynamic Module Development
- Worker Process restart needed when adding modules
- Harder module development compared to Apache
- Partially compensated by Lua scripting

#### 2. Windows Environment Limitations
- Optimized for Linux/Unix environments
- Performance and stability degraded on Windows
- Linux recommended for production environments

#### 3. No .htaccess Support
- Cannot use Apache's `.htaccess` files
- All configuration managed in central config file
- May lack flexibility in hosting environments

---

## Key Nginx Features

{{< figure src="figure4.png" alt="Nginx Key Features Diagram" class="mx-auto" >}}

### 1. Reverse Proxy

A reverse proxy acts as an **intermediary** between clients and backend servers.

{{< figure src="figure5.png" alt="Reverse Proxy Architecture" class="mx-auto" >}}

#### Key Benefits

- **Enhanced Security**: Hides actual server IP
- **Caching**: Caches frequently requested responses
- **Compression**: Saves bandwidth by compressing response data
- **SSL Processing**: Handles HTTPS encryption/decryption

```nginx
# Reverse proxy configuration example
location / {
    proxy_pass http://backend_server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

#### Practical Usage Patterns

- **Nginx + Apache**: Nginx handles static files, Apache handles dynamic processing
- **Nginx + Node.js/Python/Java**: Nginx protects frontend and backend applications
- **Nginx + Nginx**: Hierarchical configuration of multiple Nginx servers

### 2. Load Balancing

**Distributes traffic** across multiple backend servers to balance load evenly.

{{< figure src="figure6.png" alt="Load Balancing Architecture" class="mx-auto" >}}

#### Load Balancing Algorithms

##### Round Robin (Default)
- Distributes requests sequentially to each server
- Simplest and most fair approach

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}
```

##### Least Connections
- Sends to server with fewest current connections
- Suitable for requests with varying processing times

```nginx
upstream backend {
    least_conn;
    server backend1.example.com;
    server backend2.example.com;
}
```

##### IP Hash
- Determines server based on client IP hash
- Useful for **Session Persistence**

```nginx
upstream backend {
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
}
```

##### Weight
- Assigns weight based on server performance
- Sends more requests to high-performance servers

```nginx
upstream backend {
    server backend1.example.com weight=3;
    server backend2.example.com weight=2;
    server backend3.example.com weight=1;
}
```

#### Health Check

```nginx
upstream backend {
    server backend1.example.com max_fails=3 fail_timeout=30s;
    server backend2.example.com max_fails=3 fail_timeout=30s;
}
```

- `max_fails`: Number of allowed failures
- `fail_timeout`: Time to consider server down
- **Improves availability** by automatically excluding failed servers

### 3. SSL/TLS Termination

Nginx handles **HTTPS communication with clients** and **HTTP communication with backend**.

{{< figure src="figure7.png" alt="SSL Termination Architecture" class="mx-auto" >}}

#### Key Benefits

- **Removes SSL processing burden** from backend servers
- Centralized certificate management
- Backend **focuses on business logic**
- Nginx and backend communicate via HTTP on same internal network (security safe)

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

#### HTTP/2 Support

Nginx supports HTTP/2:
- **Multiplexing**: Multiple requests simultaneously over one connection
- **Header Compression**: Saves bandwidth
- **Server Push**: Sends resources before client requests

### 4. Caching

**Stores server responses** in memory or disk for fast responses on repeated requests.

```nginx
# Cache path configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;

server {
    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 60m;  # Cache 200 responses for 60 minutes
        proxy_cache_valid 404 10m;  # Cache 404 responses for 10 minutes
        proxy_pass http://backend;
    }
}
```

#### Caching Strategies

- **Proxy Caching**: Cache backend responses
- **FastCGI Caching**: Cache dynamic content like PHP-FPM
- **Static File Caching**: Set browser cache headers

```nginx
# Static file cache header configuration
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 5. Compression (Gzip)

Compress response data to **save network bandwidth**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml+rss
           application/json application/javascript;
```

- Compress text-based content by 60-80%
- Improves user experience by reducing transfer time

### 6. Rate Limiting

Defend against DDoS attacks and protect servers

```nginx
# Define zone
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=mylimit burst=20 nodelay;
        proxy_pass http://backend;
    }
}
```

- Limit requests per second per IP
- **burst**: Allow sudden traffic spikes
- Essential for API server protection

---

## Nginx vs Apache: Which Should You Choose?

### Choose Nginx When

- High concurrent connection handling is needed
- Static file service is primary purpose
- Reverse proxy/load balancer is needed
- Resource efficiency is important
- Modern protocol support needed (HTTP/2, HTTP/3)

### Choose Apache When

- `.htaccess` file-based configuration is needed
- Various third-party modules are needed
- Must use in Windows environment
- Legacy application compatibility is important
- Frequent dynamic module development

### Optimal Combination: Nginx + Apache

Many companies use **Nginx as frontend** and **Apache as backend**:

```
[Client] → [Nginx] → [Apache] → [Application]
           Static    Dynamic
           SSL       PHP/Python
           Caching   Modules
```

---

## Production Tips

### 1. Worker Connections Configuration

```nginx
events {
    worker_connections 1024;  # Connections per Worker
    use epoll;  # Optimal event model for Linux
}
```

### 2. Keepalive Optimization

```nginx
http {
    keepalive_timeout 65;
    keepalive_requests 100;
}
```

### 3. Buffer Size Tuning

```nginx
http {
    client_body_buffer_size 16K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 4 8k;
}
```

### 4. Log Optimization

```nginx
http {
    access_log /var/log/nginx/access.log combined buffer=32k;
    error_log /var/log/nginx/error.log warn;
}
```

### 5. Security Hardening

```nginx
# Hide version information
server_tokens off;

# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## Conclusion

Nginx has established itself as a **core component of modern web infrastructure**. With high performance and efficiency through Event-Driven architecture, it's used by large-scale services like Netflix, Airbnb, and GitHub.

While Apache's stability and extensibility remain valuable, in modern web environments where large-scale traffic handling and resource efficiency are crucial, **Nginx is the more suitable choice**.

{{< alert "lightbulb" >}}
**Recommended Learning Path**

1. Install Nginx in local environment and practice basic configuration
2. Set up reverse proxy
3. Configure and test load balancing
4. Apply SSL certificates (Let's Encrypt)
5. Performance monitoring and optimization
{{< /alert >}}

### References

- [Nginx Official Documentation](https://nginx.org/en/docs/)
- [Nginx Configuration Generator](https://www.digitalocean.com/community/tools/nginx)
- [Nginx Performance Tuning Guide](https://www.nginx.com/blog/tuning-nginx/)

**Important Note**: Nginx shows limited performance and compatibility on Windows environments, so it's strongly recommended to use **Linux/Unix systems** in production!
