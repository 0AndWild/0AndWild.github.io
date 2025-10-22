+++
title = '도커(Docker)란? & Docker Container 그리고 가상화 방식의 종류'
date = '2022-10-24T00:00:00+09:00'
description = "Docker의 개념과 컨테이너 가상화 기술, 그리고 다양한 가상화 방식의 특징을 알아봅니다"
summary = "Docker는 애플리케이션을 컨테이너로 패키징하여 다양한 환경에서 안정적으로 실행할 수 있게 해주는 오픈소스 플랫폼입니다. 호스트 가상화, 하이퍼바이저 가상화, 컨테이너 가상화의 차이점과 각각의 장단점을 비교하고, Docker 컨테이너의 효율성과 활용 방법을 정리합니다."
categories = ["Docker"]
tags = ["Docker", "Container", "Virtualization", "DevOps", "가상화"]
series = ["Deep Dive into Docker"]
series_order = 1

draft = false
+++

{{< figure src="figure1.png" alt="docker" class="mx-auto" >}}

{{< lead >}}
Docker는 **오픈소스 컨테이너화 플랫폼**으로, 코드와 의존성을 패키징하여 다양한 컴퓨팅 환경에서 애플리케이션을 빠르고 안정적으로 실행할 수 있게 해줍니다.
{{< /lead >}}

## 🐳 Docker란?

Docker의 핵심 개념은 크게 두 가지입니다: <strong>컨테이너(Container)<strong/> 와  <strong>이미지(Image)<strong/>

### Docker Image (도커 이미지)

{{< alert "lightbulb" >}}
**Docker Image**는 애플리케이션 실행에 필요한 코드, 런타임, 시스템 도구, 시스템 라이브러리, 설정 등을 포함하는 **경량의 독립적인 소프트웨어 패키지**입니다.
{{< /alert >}}

### 실제 사용 예시

기존 방식으로 Linux에 Jenkins를 설치한다면:

```bash
$ sudo apt-get install jenkins
```

위 명령어를 실행하면 여러 의존성 패키지들을 함께 다운로드해야 합니다.

반면 Docker를 사용하면:

```bash
$ docker pull jenkins/jenkins:lts
```

필요한 모든 구성 요소가 포함된 사전 구성된 이미지를 한 번에 다운로드할 수 있습니다.

---

## 📦 Docker Registry & Docker Hub

{{< alert "circle-info" >}}
**Docker Registry**는 Docker 이미지를 공유하는 저장소 역할을 합니다. "Docker용 GitHub"라고 생각하면 쉽습니다.
{{< /alert >}}

**Docker Hub**는 공식 Docker 레지스트리로, 벤더가 제공하는 공식 이미지들을 제공합니다.

### 동작 흐름

1. 사용자가 레지스트리에서 이미지를 다운로드
2. 이미지를 컨테이너로 실행
3. 하나의 컴퓨터에서 여러 개의 격리된 환경 구성 가능

---

## 🔄 Container Virtualization (컨테이너 가상화)

{{< figure src="figure2.png" alt="Containerized" class="mx-auto" >}}

{{< alert "star" >}}
컨테이너 기술은 "하나의 시스템 내에서 여러 개의 격리된 인스턴스를 실행할 수 있게 하는 서버 가상화 방식"으로, 각 컨테이너는 사용자에게 개별 서버처럼 보입니다.
{{< /alert >}}

**중요한 점:**
컨테이너는 Docker만의 전유물이 아닙니다. OpenVZ, Libvirt, LXC 등 다양한 컨테이너 기술이 존재합니다.

---

## 🖥️ 가상화 방식의 종류

### 1. Host Virtualization (호스트 가상화)

{{< figure src="figure3.png" alt="Hosted Vitualization Architecture" class="mx-auto" >}}

**구조:**
Guest OS가 Host OS 위에서 가상화 소프트웨어를 통해 실행됩니다.
- 예시: VM Workstation, VMware Player, VirtualBox 등

{{< alert "none" >}}
**장점:**
- 설치 및 구성이 간단함
- 하드웨어 에뮬레이션으로 최소한의 호스트 요구사항

**단점:**
- OS 위에 OS를 실행하므로 리소스 집약적
- 성능 오버헤드가 큼
{{< /alert >}}

---

### 2. Hypervisor Virtualization (하이퍼바이저 가상화)

{{< figure src="figure4.png" alt="HypervisorVirtualization" class="mx-auto" >}}

**구조:**
Host OS 없이 하드웨어에 직접 소프트웨어를 설치하여 실행합니다.

**하이퍼바이저 가상화의 두 가지 접근 방식:**

#### 1) Full Virtualization (전가상화)
- Guest OS가 하드웨어에 직접 접근하지 않고 하이퍼바이저를 통해 접근
- 더 안정적이지만 성능 오버헤드 존재

#### 2) Paravirtualization (반가상화)
- Guest OS가 하이퍼바이저를 통해 하드웨어에 직접 접근
- 더 빠르지만 OS 수정 필요

{{< alert "none" >}}
**장점:**
- Host OS가 없어 더 효율적
- 리소스를 더 효과적으로 활용

**단점:**
- 시작 시간이 느림
- 각 VM이 독립적인 OS를 실행하므로 여전히 리소스 소모가 큼
{{< /alert >}}

---

### 3. Container Virtualization (컨테이너 가상화) ⭐

{{< figure src="figure5.png" alt="ContainerVirtualization" class="mx-auto" >}}

**구조:**
애플리케이션들이 호스트 OS 커널을 공유하면서도 격리된 환경을 유지합니다.

{{< alert "none" >}}
**장점:**
- **경량**: 일반적으로 수십 MB (VM은 수십 GB)
- **빠른 시작 속도**: 별도의 OS 부팅이 필요 없음
- **적은 리소스 사용**: 시스템 리소스를 효율적으로 활용
- **높은 밀도**: 같은 하드웨어에서 더 많은 컨테이너 실행 가능

**단점:**
- 호스트 시스템과 동일한 OS 환경이 필요함
- 크로스 플랫폼 배포가 어려울 수 있음 (예: Linux 컨테이너는 Linux 호스트 필요)
{{< /alert >}}

---

## 📊 가상화 방식 비교

| 구분 | 호스트 가상화 | 하이퍼바이저 가상화 | 컨테이너 가상화 |
|------|--------------|-------------------|----------------|
| **용량** | 수십 GB | 수십 GB | 수십 MB |
| **시작 속도** | 느림 | 느림 | 매우 빠름 |
| **리소스 사용** | 높음 | 중간 | 낮음 |
| **격리 수준** | 높음 | 높음 | 중간 |
| **이식성** | 낮음 | 중간 | 높음 |
| **설정 난이도** | 쉬움 | 어려움 | 중간 |

---

## 💡 정리

{{< alert "star" >}}
**Docker 컨테이너 가상화의 핵심 가치:**

1. **효율성**: 기존 가상화 방식보다 훨씬 적은 리소스로 동일한 기능 제공
2. **속도**: 애플리케이션을 몇 초 안에 시작하고 중지 가능
3. **일관성**: 개발, 테스트, 프로덕션 환경에서 동일하게 실행
4. **확장성**: 필요에 따라 컨테이너를 쉽게 추가하거나 제거
{{< /alert >}}

Docker는 현대적인 애플리케이션 개발과 배포의 핵심 도구로, DevOps와 마이크로서비스 아키텍처의 기반이 되고 있습니다.
