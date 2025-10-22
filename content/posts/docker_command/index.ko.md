+++
title = '도커(Docker) 설치 & 명령어 사용방법 총정리'
date = '2022-10-25T17:59:31+09:00'
description = "Ubuntu 환경에서 Docker를 설치하고 주요 명령어 사용법을 정리한 가이드입니다. Docker 이미지 관리, 컨테이너 실행, 권한 설정 등 실무에 필요한 내용을 다룹니다."
summary = "Docker 설치부터 이미지 관리, 컨테이너 실행까지 필수 명령어와 옵션을 상세히 정리한 실전 가이드"
categories = ["Docker"]
tags = ["Docker", "Container", "DevOps", "Ubuntu", "Installation", "CLI"]
series = ["Deep Dive into Docker"]
series_order = 2

draft = false
+++

{{< figure src="featured.png" alt="docker" class="mx-auto" >}}

지난 글에 이어 도커의 명령어와 사용방법을 정리해볼까 합니다 =)

## Docker 설치하기

우선 도커를 사용하려면 설치를 해주어야 겠죠?

필자의 경우 AWS EC2 인스턴스로 Ubuntu 환경에서 Docker를 설치하였습니다.

Ubuntu 및 다른 환경에서 설치가 필요하신 경우 아래 공식 문서를 참고해주세요!

[Install Docker Engine on Ubuntu - docs.docker.com](https://docs.docker.com/engine/install/ubuntu/)

### Docker 구버전 제거 및 신버전 설치

만약 Docker 구버전을 삭제 후 신버전을 설치하려 한다면 아래 명령어를 통해 구버전을 삭제해주도록 합니다.

<strong>Ubuntu 기준</strong>

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

<strong>저장소 업데이트</strong>

```bash
sudo apt-get update
```

<strong>apt가 https를 통해 repository를 사용할 수 있도록 패키지 설치</strong>

```bash
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

<strong>Docker 저장소 키를 apt에 등록</strong>

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

<strong>Docker 저장소 등록</strong>

```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

<strong>지금까지 작업 내용 반영을 위해 apt update</strong>

```bash
sudo apt-get update
```

<strong>Docker 설치</strong>

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

위의 명령어를 통해 Docker 설치 작업을 끝냈다면 확인을 해봐야 겠죠?!

{{< figure src="figure1.png" alt="docker version 명령어 실행 화면" class="mx-auto" >}}

```bash
sudo docker version
```

또는

```bash
sudo docker run hello-world
```

{{< figure src="figure2.png" alt="docker run hello-world 실행 화면" class="mx-auto" >}}
{{< figure src="figure3.png" alt="hello-world 컨테이너 실행 결과" class="mx-auto" >}}

위와 같이 run 명령어를 사용하면 hello-world 이미지를 local에서 찾고 만약 없으면 docker hub에서 이미지를 다운받고 실행시켜 컨테이너로 띄워질 것입니다 =)

### Docker 권한 설정

만약 도커 명령어 실행시 다음과 같은 문구가 나온다면 걱정하지 마세요 ㅎㅎ

이 메세지는 Docker를 root 외의 사용자가 사용할 수 있는 권한이 없어 그런 것 입니다 =)

{{< figure src="figure4.png" alt="권한 에러 메시지" class="mx-auto" >}}

**우선 docker의 권한을 확인합니다.**

```bash
cat /etc/group | grep docker
```

{{< figure src="figure5.png" alt="docker 그룹 확인" class="mx-auto" >}}

필자의 경우 이미 사용자 권한을 추가하여 뒤에 ubuntu 라는 사용자 이름으로 권한이 추가되어 있습니다.

만약 추가가 되어 있지 않다면 `docker:x:999:` 와 같은 문구를 확인할 수 있을 겁니다!

**Docker 그룹에 사용할 사용자 아이디를 추가해줍니다**

```bash
sudo usermod -aG docker [사용자이름]
```

{{< figure src="figure6.png" alt="사용자 추가 명령어 실행" class="mx-auto" >}}

사용자이름은 예시로 필자는 위의 사진과 같이 ubuntu라는 사용자 이름으로 사용중이기에 ubuntu를 넣어 주었습니다.

Linux의 경우 기본유저이름이 ec2-user로 잡혀 있을 겁니다 =)

**시스템 재시작을 해줍니다.**

```bash
sudo reboot
```

**이제 docker 명령어 앞에 sudo 를 빼고 다시 버전확인을 해보도록 하겠습니다.**

```bash
docker version
```

{{< figure src="figure7.png" alt="권한 설정 후 docker version 실행" class="mx-auto" >}}
{{< figure src="figure8.png" alt="Client와 Server 정보 확인" class="mx-auto" >}}

다음과 같이 Client와 Server 정보가 나오면 정상적으로 권한 부여가 이루어진겁니다. =)

만약 `Got permission denied ...` 메세지가 다시 나온다면 권한 설정이 잘 이루어지지 않을 것이니 확인을 다시 해보신 후 추가적인 에러메세지를 함께 검색해보시길 바랍니다!

**에러메세지를 댓글에 공유 해주시면 저도 함께 찾아보도록 하겠습니다 ㅎㅎ**

### Windows & Mac OS Docker Desktop

**+ 추가적으로 Windows 와 Mac OS의 경우 docker desktop을 지원하여 간편한 설치를 통해 GUI를 사용할 수 있습니다!**

**개인 사용자나 250인 이하 또는 $1000만 달러 미만 매출의 회사에서만 무료로 사용할 수 있다니 참고 바랍니다!**

{{< figure src="figure9.png" alt="Docker Desktop" class="mx-auto" >}}

**설치방법은 아래 공식문서 링크를 참고하세요 =)**

[Install Docker Desktop on Windows - docs.docker.com](https://docs.docker.com/desktop/install/windows-install/)

[Install Docker Desktop on Mac - docs.docker.com](https://docs.docker.com/desktop/install/mac-install/)

---

## Docker 명령어

### Docker Image 검색

Docker 공식 registry인 Docker hub에서 이미지를 검색합니다.

{{< figure src="figure10.png" alt="docker search 실행 화면" class="mx-auto" >}}

```bash
sudo docker search [검색 할 Image이름]
```

### 이미지 다운받기

{{< figure src="figure11.png" alt="docker pull 명령어" class="mx-auto" >}}
{{< figure src="figure12.png" alt="이미지 다운로드 진행 화면" class="mx-auto" >}}

```bash
sudo docker pull [이미지이름]:[태그]
```

일반적으로 이미지 생성시 태그명을 따로 지정하지 않으면 default 값으로 latest가 붙습니다 =)

### 이미지를 docker hub 계정에 push 하기

필자의 경우 좀전에 받은 hello-world 이미지를 필자의 docker-hub 계정에 push 해보도록 하겠습니다.

{{< figure src="figure13.png" alt="Docker Hub repository 생성" class="mx-auto" >}}
{{< figure src="figure14.png" alt="repository 생성 완료" class="mx-auto" >}}

먼저 push를 하기에 앞서 docker-hub에 hello-world 라는 repository를 만들어두도록 하겠습니다.

```bash
sudo docker push [docker-hub ID]/[이미지 이름]:[태그]
```

{{< figure src="figure15.png" alt="push 실패 에러 메시지" class="mx-auto" >}}

음... 다음과 같은 메세지와 함께 이미지 push가 실패하였네요. =(

이러한 이유는 docker hub의 repository 이름과 로컬의 도커 이미지 repository 이름을 똑같게 해줘야 한다고 합니다.

**해결방법**

{{< figure src="figure16.png" alt="docker image tag 명령어 실행" class="mx-auto" >}}

```bash
sudo docker image tag [이미지 repo 이름]:[태그] [변경할 이미지 repo이름 지정]:[태그]
```

이 방식은 해당 이미지의 이름을 바꾸는 것이 아닌 이미지를 복사하여 새로운 이름의 이미지를 생성해줍니다. =)

필자의 경우 tag 부분은 변경할 repo 도 default인 latest를 사용할거기 때문에 따로 지정을 해주지 않았습니다.

다시 push를 해보도록 하겠습니다 ㅎㅎ.

{{< figure src="figure17.png" alt="push 재시도" class="mx-auto" >}}
{{< figure src="figure18.png" alt="push 성공" class="mx-auto" >}}

이제 정상적으로 이미지가 push 된 것을 확인할 수 있습니다! =)

### 다운받은 이미지 확인

{{< figure src="figure19.png" alt="docker images 명령어 실행 화면" class="mx-auto" >}}

```bash
sudo docker images
```

### Docker image를 실행하여 container로 띄우기

{{< figure src="figure20.png" alt="docker run 명령어 구조" class="mx-auto" >}}

```bash
docker run -d -i -t --name [생성할 컨테이너 name 설정] -p [host port:container port] [image name or ID]
```

필자의 경우 이미 springboot project를 docker image로 빌드 해둔 것이 있어 해당 image를 실행시켜 컨테이너로 띄워보도록 하겠습니다. =)

일반적으로는 `-i` `-t` 옵션을 함께 사용하여 `-it` 이렇게 옵션을 주기도 합니다 =)

**host port**는 컨테이너가 띄워진 후 사용자가 접근할 외부 port이고 **container port**는 다음과 같이 docker file을 이용하여 docker image를 빌드할때 지정해준 port라 생각하시면 될 것 같습니다. =)

필자의 경우 이미지를 생성할 때 .yml 파일에 존재하는 local, dev, prod 환경 중 dev환경으로 지정해주었고 해당 dev 환경의 server port는 8081로 지정해주었기 때문에 containerport를 8081로 지정해주었습니다!

{{< figure src="figure21.png" alt="Dockerfile 설정" class="mx-auto" >}}
{{< figure src="figure22.png" alt="yml 파일 설정" class="mx-auto" >}}

image name or ID 는 실행시킬 이미지의 이름 또는 해당 이미지의 아이디 값을 넣어주면 됩니다. =)

{{< figure src="figure23.png" alt="컨테이너 실행" class="mx-auto" >}}

**Docker의 다양한 옵션에 대한 내용은 아래에 정리를 해두었으니 참고 바랍니다 !**

이제 이미지를 실행 시켰으니 컨테이너가 잘 띄워 졌는지 확인을 해봐야 겠죠?

### 실행중인 컨테이너 확인

{{< figure src="figure24.png" alt="docker ps 명령어" class="mx-auto" >}}

```bash
sudo docker ps
```

{{< figure src="figure25.png" alt="브라우저 접속 화면" class="mx-auto" >}}

컨테이너가 실행된 후 `http://[public ip]:8080` 으로 접속을 하니 서버가 잘 띄워진 것을 확인 할 수 있습니다! =)

{{< figure src="figure26.png" alt="API 응답 확인" class="mx-auto" >}}

또한 현재 띄워진 서버의 운영 환경이 dockerfile에서 지정해준 dev1 환경이라는 것을 만들어둔 api를 통해 확인할 수 있었습니다. =)

### 포트 매핑 실험

그럼 여기서 추가적으로 실험을 하나더 해보도록 하겠습니다. 필자는 아까 말했듯이 docker file에서 dev1으로 운영환경을 지정해주었고 해당 dockerfile을 통해 빌드된 이미지는 내부적으로 server port가 8081 인 이미지 입니다.

그럼 이 이미지를 실행시킬 때 `-p 8080:8080` 으로 container port를 8081이 아닌 8080으로 주게되면 어떻게 될까요??

{{< figure src="figure27.png" alt="잘못된 포트 매핑 실행" class="mx-auto" >}}
{{< figure src="figure28.png" alt="컨테이너는 실행됨" class="mx-auto" >}}

우선 컨테이너는 정상적으로 띄워졌군요!

그럼 해당 서버의 ip와 외부접근 port인 8080으로 접근을 시도해보도록 하겠습니다!

{{< figure src="figure29.png" alt="서버 접속 실패" class="mx-auto" >}}

이번에는 컨테이너는 정상적으로 띄워 졌지만 서버는 제대로 작동을 하지 않는 것 같군요 =)

이렇게 dockerfile에서 설정한 운영환경 지정이 제대로 동작하는 것을 확인 할 수 있습니다!

---

## 기본적인 Docker 명령어

```bash
$ sudo docker pull [다운받을 이미지 이름]:[태그]
```

```bash
$ sudo docker push [docker-hub ID]/[이미지 이름]:[태그]
```

```bash
$ docker images
# pull 또는 run을 통해 다운받아 local에 존재하는 image들을 확인할 수 있음
```

```bash
$ docker run -d -i -t --name [생성할 컨테이너 name 설정] -p [host port:container port] [image name or ID]
# Docker image를 실행하여 컨테이너로 띄움. 만약 docker hub에 존재하는 공식이미지의 경우
# pull을 미리 하지 않고도 local에 없으면 자동으로 다운받아 실행시켜줌.
```

```bash
$ sudo docker ps
# 이미지를 실행시켜 컨테이너로 띄워지고 실행중인 컨테이너 항목들을 보여줌
```

```bash
$ sudo docker ps -a
# 실행중인 컨테이너 외에 종료된 컨테이너 항목들을 모두 보여줌
```

```bash
$ sudo docker stop [컨테이너이름 or 컨테이너 ID]
# 현재 실행중인 컨테이너를 중지시킴
```

```bash
$ sudo docker start [컨테이너 이름 or 컨테이너 아이디]
# 종료된 컨테이너를 실행시킴
```

```bash
$ sudo docker restart [컨테이너이름 or 컨테이너 ID]
# 실행중인 컨테이너를 재시작함
```

```bash
$ sudo docker rm [컨테이너 이름 or 컨테이너 ID]
# 컨테이너를 삭제시킴
# 컨테이너를 삭제시키기 위해선 먼저 컨테이너를 stop 해주어야 합니다 =)
# +tip 컨테이너 ID를 입력할 경우 모두 적지 않고 2~3글자만 적어도 됩니다.
```

```bash
$ sudo docker rmi [이미지이름 or 이미지 ID]
# 이미지를 삭제합니다.
# 이또한 마찬가지로 ID를 이용해 삭제할경우 2~3글자만 입력하여도 됩니다 =)
```

```bash
$ sudo docker logs [컨테이너이름 or 컨테이너 ID]
# 실행한 컨테이너의 로그를 확인할 수 있습니다
```

```bash
$ sudo docker exec -it [컨테이너ID] /bin/bash
# 컨테이너 내부 접근
# 종료시에는 $ exit
```

---

## Docker 명령어 옵션


**-i** : `--interactive` : 표준입력을 활성화하며, 컨테이너와 연결(attach)되어 있지 않더라도 표준입력을 유지함. 이 옵션을 통해 Bash 명령어를 입력함.

**-t** : `--tty` : <strong>TTY(pseudo-TTY)</strong>를 사용함. Bash를 사용하려면 이 옵션을 설정해야하고 설정하지 않으면 명령어를 입력할 순 있지만 셸이 표시되지 않음.

**-d** : `--detach` : Detached 모드로 데몬 모드라고 부릅니다. 컨테이너가 백그라운드로 실행됩니다.

**-p** : `--publish` : 호스트와 컨테이너 포트를 연결합니다. <strong>(포트포워딩)</strong> ex) `-p 80:80`

**--privileged** : 컨테이너 안에서 호스트의 리눅스 커널 기능(Capability)을 모두 사용합니다. 이를통해 호스트의 주요 자원에 접근할 수 있음

**--rm** : 프로세스 종료시 컨테이너 자동 제거

**--restart** : 컨테이너 종료 시, 재시작 정책을 설정합니다.

**-v** : `--volume` : 데이터 볼륨설정으로 호스트와 컨테이너의 디렉토리를 연결하여, 파일 설정등을 호스트에서 변경하면 컨테이너 내부도 동일하게 변경사항이 적용됩니다. 싱크의 개념.

**-u** : `--user` : 컨테이너가 실행될 리눅스 사용자 계정 이름 또는 UID를 설정합니다. 
- ex) `--user ubuntu`

**-e** : `--env` : 컨테이너 내부에서 사용할 환경변수를 설정합니다. 일반적으로 설정값이나 비밀번호를 전달할 때 사용합니다.

**--link** : 컨테이너끼리 연결합니다. `[컨테이너명:별칭]` 
- ex) `--link "mysql:mysql"`

**-h** : `--hostname` : 컨테이너의 호스트 이름을 설정합니다.

**-w** : `--workdir` : 컨테이너 안의 프로세스가 실행될 디렉토리를 설정합니다.

**-a** : `--attach` : 컨테이너에 표준입력(stdin), 표준출력(stdout), 표준에러(stderr)를 연결합니다.

**-c** : `--cpu-shares` : CPU 자원 분배 설정입니다. 기본값은 1024이고 각 값은 상대적으로 적용됩니다.

**-m** : `--memory` : 메모리 한계를 설정합니다. 
- ex) `--memory="100m"`

**--gpus** : 컨테이너에서 호스트의 NVIDIA GPU 를 사용할 수 있도록 설정합니다. 이 방식을 사용하기 위해선 호스트는 NVIDIA GPU가 장착된 Linux 서버 + NVIDIA driver 설치 완료 + docker 19.03.5 버전 이상이여야 합니다

- `--gpus all` : GPU 모두 사용하기
- `--gpus "device=0.1"` : GPU 지정하여 사용

**--security-opt** : SELinux, AppArmor 옵션을 설정합니다. 

- `--security-opt="label:level:TopSecret"`
