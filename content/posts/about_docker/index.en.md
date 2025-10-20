+++
title = 'What is Docker? Docker Container and Types of Virtualization'
date = '2022-10-24T00:00:00+09:00'
description = "Learn about Docker concepts, container virtualization technology, and the characteristics of various virtualization methods"
summary = "Docker is an open-source platform that packages applications into containers, enabling them to run reliably across different environments. We'll compare the differences and pros/cons of host virtualization, hypervisor virtualization, and container virtualization, and explore the efficiency and usage of Docker containers."
categories = ["Docker"]
tags = ["Docker", "Container", "Virtualization", "DevOps"]
series = ["Deep Dive into Docker"]
series_order = 1

draft = false
+++

{{< figure src="figure1.png" alt="docker" class="mx-auto" >}}

{{< lead >}}
Docker is an **open-source containerization platform** that enables applications to run quickly and reliably across different computing environments by packaging code and dependencies.
{{< /lead >}}

## 🐳 What is Docker?

Docker's core concepts are broadly divided into two: **Container** and **Image**

### Docker Image

{{< alert "lightbulb" >}}
A **Docker Image** is a **lightweight, standalone software package** that includes code, runtime, system tools, system libraries, and configurations necessary for running an application.
{{< /alert >}}

### Real-World Example

If you were to install Jenkins on Linux using the traditional method:

```bash
$ sudo apt-get install jenkins
```

Running this command requires downloading multiple dependency packages together.

However, using Docker:

```bash
$ docker pull jenkins/jenkins:lts
```

You can download a pre-configured image containing all necessary components at once.

---

## 📦 Docker Registry & Docker Hub

{{< alert "circle-info" >}}
**Docker Registry** serves as a repository for sharing Docker images. Think of it as "GitHub for Docker."
{{< /alert >}}

**Docker Hub** is the official Docker registry, providing official images from vendors.

### Workflow

1. Users download images from the registry
2. Run images as containers
3. Configure multiple isolated environments on a single computer

---

## 🔄 Container Virtualization

{{< figure src="figure2.png" alt="Containerized" class="mx-auto" >}}

{{< alert "star" >}}
Container technology is "a server virtualization method that enables running multiple isolated instances within a single system," where each container appears as an individual server to users.
{{< /alert >}}

**Important Note:**
Containers are not exclusive to Docker. Various container technologies exist, including OpenVZ, Libvirt, and LXC.

---

## 🖥️ Types of Virtualization

### 1. Host Virtualization

{{< figure src="figure3.png" alt="Hosted Vitualization Architecture" class="mx-auto" >}}

**Structure:**
Guest OS runs on top of Host OS through virtualization software.
- Examples: VM Workstation, VMware Player, VirtualBox, etc.

{{< alert "none" >}}
**Advantages:**
- Simple installation and configuration
- Minimal host requirements through hardware emulation

**Disadvantages:**
- Resource-intensive due to running OS on top of OS
- Significant performance overhead
{{< /alert >}}

---

### 2. Hypervisor Virtualization

{{< figure src="figure4.png" alt="HypervisorVirtualization" class="mx-auto" >}}

**Structure:**
Software is installed and runs directly on hardware without a Host OS.

**Two Approaches to Hypervisor Virtualization:**

#### 1) Full Virtualization
- Guest OS accesses hardware through the hypervisor, not directly
- More stable but has performance overhead

#### 2) Paravirtualization
- Guest OS directly accesses hardware through the hypervisor
- Faster but requires OS modifications

{{< alert "none" >}}
**Advantages:**
- More efficient without Host OS
- Better resource utilization

**Disadvantages:**
- Slow startup time
- Still consumes significant resources as each VM runs an independent OS
{{< /alert >}}

---

### 3. Container Virtualization ⭐

{{< figure src="figure5.png" alt="ContainerVirtualization" class="mx-auto" >}}

**Structure:**
Applications share the host OS kernel while maintaining isolated environments.

{{< alert "none" >}}
**Advantages:**
- **Lightweight**: Typically tens of MB (VMs are tens of GB)
- **Fast startup**: No need to boot a separate OS
- **Low resource usage**: Efficient utilization of system resources
- **High density**: Run more containers on the same hardware

**Disadvantages:**
- Requires the same OS environment as the host system
- Cross-platform deployment can be challenging (e.g., Linux containers require Linux host)
{{< /alert >}}

---

## 📊 Virtualization Comparison

| Category | Host Virtualization | Hypervisor Virtualization | Container Virtualization |
|----------|-------------------|--------------------------|------------------------|
| **Size** | Tens of GB | Tens of GB | Tens of MB |
| **Startup Speed** | Slow | Slow | Very Fast |
| **Resource Usage** | High | Medium | Low |
| **Isolation Level** | High | High | Medium |
| **Portability** | Low | Medium | High |
| **Setup Difficulty** | Easy | Hard | Medium |

---

## 💡 Summary

{{< alert "star" >}}
**Core Value of Docker Container Virtualization:**

1. **Efficiency**: Provides the same functionality with far fewer resources than traditional virtualization
2. **Speed**: Start and stop applications in seconds
3. **Consistency**: Runs identically across development, testing, and production environments
4. **Scalability**: Easy to add or remove containers as needed
{{< /alert >}}

Docker is a core tool for modern application development and deployment, serving as the foundation for DevOps and microservices architecture.
