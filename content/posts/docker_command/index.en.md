+++
title = 'Docker Installation & Command Usage Complete Guide'
date = '2022-10-25T17:59:31+09:00'
description = "A comprehensive guide on installing Docker in Ubuntu environment and using essential commands. Covers Docker image management, container execution, permission settings, and more for practical use."
summary = "A practical guide detailing essential commands and options from Docker installation to image management and container execution"
categories = ["Docker"]
tags = ["Docker", "Container", "DevOps", "Ubuntu", "Installation", "CLI"]
series = ["Deep Dive into Docker"]
series_order = 2

draft = false
+++

{{< figure src="featured.png" alt="docker" class="mx-auto" >}}

Following up on the previous post, I'd like to organize Docker commands and usage methods =)

## Installing Docker

First, we need to install Docker to use it, right?

In my case, I installed Docker in an Ubuntu environment using an AWS EC2 instance.

If you need installation instructions for Ubuntu or other environments, please refer to the official documentation below!

[Install Docker Engine on Ubuntu - docs.docker.com](https://docs.docker.com/engine/install/ubuntu/)

### Removing Old Docker Versions and Installing New Version

If you want to remove the old version of Docker and install the new version, use the following commands to remove the old version.

<strong>For Ubuntu</strong>

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

<strong>Update repository</strong>

```bash
sudo apt-get update
```

<strong>Install packages to allow apt to use repository over https</strong>

```bash
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
```

<strong>Add Docker's official GPG key to apt</strong>

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

<strong>Add Docker repository</strong>

```bash
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
```

<strong>Update apt to reflect the changes</strong>

```bash
sudo apt-get update
```

<strong>Install Docker</strong>

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

After completing the Docker installation with the above commands, we need to verify it!

{{< figure src="figure1.png" alt="docker version command execution screen" class="mx-auto" >}}

```bash
sudo docker version
```

or

```bash
sudo docker run hello-world
```

{{< figure src="figure2.png" alt="docker run hello-world execution screen" class="mx-auto" >}}
{{< figure src="figure3.png" alt="hello-world container execution result" class="mx-auto" >}}

When you use the run command as above, it will search for the hello-world image locally, and if it doesn't exist, it will download the image from Docker Hub and run it as a container =)

### Docker Permission Settings

If you see the following message when executing Docker commands, don't worry haha

This message appears because users other than root don't have permission to use Docker =)

{{< figure src="figure4.png" alt="permission error message" class="mx-auto" >}}

**First, check Docker permissions.**

```bash
cat /etc/group | grep docker
```

{{< figure src="figure5.png" alt="check docker group" class="mx-auto" >}}

In my case, I've already added user permissions, so you can see the username "ubuntu" added at the end.

If it's not added, you'll see something like `docker:x:999:`!

**Add your user ID to the Docker group**

```bash
sudo usermod -aG docker [username]
```

{{< figure src="figure6.png" alt="add user command execution" class="mx-auto" >}}

For the username, as shown in the example above, I used "ubuntu" as my username.

For Linux, the default username is typically set to ec2-user =)

**Reboot the system.**

```bash
sudo reboot
```

**Now let's check the version again without sudo before the docker command.**

```bash
docker version
```

{{< figure src="figure7.png" alt="docker version execution after permission setup" class="mx-auto" >}}
{{< figure src="figure8.png" alt="verify Client and Server information" class="mx-auto" >}}

If you see both Client and Server information as shown above, the permissions have been successfully granted. =)

If you still see the `Got permission denied ...` message, the permission settings were not properly configured, so please check again and search for any additional error messages!

**If you share error messages in the comments, I'll help you troubleshoot them too haha**

### Windows & Mac OS Docker Desktop

**+ Additionally, Windows and Mac OS support Docker Desktop, which provides an easy installation with a GUI!**

**Please note that it's only free for individual users, companies with fewer than 250 employees, or companies with less than $10 million in revenue!**

{{< figure src="figure9.png" alt="Docker Desktop" class="mx-auto" >}}

**For installation instructions, please refer to the official documentation links below =)**

[Install Docker Desktop on Windows - docs.docker.com](https://docs.docker.com/desktop/install/windows-install/)

[Install Docker Desktop on Mac - docs.docker.com](https://docs.docker.com/desktop/install/mac-install/)

---

## Docker Commands

### Docker Image Search

Search for images in Docker Hub, Docker's official registry.

{{< figure src="figure10.png" alt="docker search execution screen" class="mx-auto" >}}

```bash
sudo docker search [Image name to search]
```

### Download Image

{{< figure src="figure11.png" alt="docker pull command" class="mx-auto" >}}
{{< figure src="figure12.png" alt="image download progress screen" class="mx-auto" >}}

```bash
sudo docker pull [image name]:[tag]
```

Generally, if you don't specify a tag name when creating an image, the default value "latest" is attached =)

### Push Image to Docker Hub Account

In my case, I'll push the hello-world image I just downloaded to my docker-hub account.

{{< figure src="figure13.png" alt="Docker Hub repository creation" class="mx-auto" >}}
{{< figure src="figure14.png" alt="repository creation complete" class="mx-auto" >}}

Before pushing, let's create a repository called hello-world on docker-hub.

```bash
sudo docker push [docker-hub ID]/[image name]:[tag]
```

{{< figure src="figure15.png" alt="push failed error message" class="mx-auto" >}}

Hmm... the image push failed with the following message. =(

The reason is that the repository name on Docker Hub and the local Docker image repository name must match.

**Solution**

{{< figure src="figure16.png" alt="docker image tag command execution" class="mx-auto" >}}

```bash
sudo docker image tag [image repo name]:[tag] [new image repo name]:[tag]
```

This method doesn't rename the image but copies it and creates a new image with a new name. =)

In my case, I didn't specify the tag part separately because the changed repo will also use the default "latest".

Let's try pushing again haha.

{{< figure src="figure17.png" alt="push retry" class="mx-auto" >}}
{{< figure src="figure18.png" alt="push success" class="mx-auto" >}}

Now you can see that the image has been pushed successfully! =)

### Check Downloaded Images

{{< figure src="figure19.png" alt="docker images command execution screen" class="mx-auto" >}}

```bash
sudo docker images
```

### Run Docker Image as Container

{{< figure src="figure20.png" alt="docker run command structure" class="mx-auto" >}}

```bash
docker run -d -i -t --name [container name] -p [host port:container port] [image name or ID]
```

In my case, I already have a Spring Boot project built as a Docker image, so I'll run that image as a container. =)

Generally, the `-i` and `-t` options are used together as `-it` =)

**host port** is the external port that users will access after the container is launched, and **container port** is the port specified when building the Docker image using a Dockerfile. =)

In my case, when creating the image, I specified the dev environment among the local, dev, and prod environments in the .yml file, and the server port for that dev environment was set to 8081, so I specified the containerport as 8081!

{{< figure src="figure21.png" alt="Dockerfile configuration" class="mx-auto" >}}
{{< figure src="figure22.png" alt="yml file configuration" class="mx-auto" >}}

For image name or ID, you can enter the name of the image to run or its ID value. =)

{{< figure src="figure23.png" alt="container execution" class="mx-auto" >}}

**Various Docker options are organized below, so please refer to them!**

Now that we've run the image, we need to check if the container is running properly, right?

### Check Running Containers

{{< figure src="figure24.png" alt="docker ps command" class="mx-auto" >}}

```bash
sudo docker ps
```

{{< figure src="figure25.png" alt="browser access screen" class="mx-auto" >}}

After the container is running, when I access `http://[public ip]:8080`, I can confirm that the server is running well! =)

{{< figure src="figure26.png" alt="API response confirmation" class="mx-auto" >}}

I was also able to confirm through the API I created that the operating environment of the currently running server is the dev1 environment specified in the dockerfile. =)

### Port Mapping Experiment

Let me do one more experiment here. As I mentioned earlier, I specified dev1 as the operating environment in the Docker file, and the image built through that dockerfile internally has a server port of 8081.

So what happens if I run this image with `-p 8080:8080`, setting the container port to 8080 instead of 8081??

{{< figure src="figure27.png" alt="incorrect port mapping execution" class="mx-auto" >}}
{{< figure src="figure28.png" alt="container is running" class="mx-auto" >}}

First, the container launched successfully!

Now let's try accessing the server's IP and external access port 8080!

{{< figure src="figure29.png" alt="server access failed" class="mx-auto" >}}

This time, the container launched successfully, but the server doesn't seem to be working properly =)

This confirms that the operating environment settings specified in the dockerfile are working correctly!

---

## Basic Docker Commands

```bash
$ sudo docker pull [image name to download]:[tag]
```

```bash
$ sudo docker push [docker-hub ID]/[image name]:[tag]
```

```bash
$ docker images
# View images that exist locally, downloaded via pull or run
```

```bash
$ docker run -d -i -t --name [container name] -p [host port:container port] [image name or ID]
# Run Docker image as a container. For official images on Docker Hub,
# it will automatically download and run them if they don't exist locally.
```

```bash
$ sudo docker ps
# Show running containers that are launched from images
```

```bash
$ sudo docker ps -a
# Show all containers including stopped ones, in addition to running containers
```

```bash
$ sudo docker stop [container name or container ID]
# Stop currently running container
```

```bash
$ sudo docker start [container name or container ID]
# Start a stopped container
```

```bash
$ sudo docker restart [container name or container ID]
# Restart a running container
```

```bash
$ sudo docker rm [container name or container ID]
# Delete a container
# To delete a container, you must first stop the container =)
# +tip: When entering container ID, you only need to type 2-3 characters
```

```bash
$ sudo docker rmi [image name or image ID]
# Delete an image
# Similarly, when using ID to delete, you only need to enter 2-3 characters =)
```

```bash
$ sudo docker logs [container name or container ID]
# View logs of the running container
```

```bash
$ sudo docker exec -it [container ID] /bin/bash
# Access container internally
# To exit: $ exit
```

---

## Docker Command Options

Let's take a look at Docker command options!

**-i** : `--interactive` : Activates standard input and keeps standard input open even when not attached to the container. Use this option to enter Bash commands.

**-t** : `--tty` : Use <strong>TTY(pseudo-TTY)</strong>. This option must be set to use Bash; without it, you can enter commands but the shell won't be displayed.

**-d** : `--detach` : Detached mode, also called daemon mode. The container runs in the background.

**-p** : `--publish` : Connect host and container ports. <strong>(Port forwarding)</strong> ex) `-p 80:80`

**--privileged** : Use all Linux kernel capabilities (Capability) of the host inside the container. This allows access to the host's main resources.

**--rm** : Automatically remove container when process terminates

**--restart** : Set restart policy when container terminates.

**-v** : `--volume` : Data volume setting that connects host and container directories, so changes made on the host are applied identically inside the container. Concept of synchronization.

**-u** : `--user` : Set the Linux user account name or UID under which the container will run. ex) `--user ubuntu`

**-e** : `--env` : Set environment variables to use inside the container. Generally used to pass configuration values or passwords.

**--link** : Connect containers. `[container name:alias]` ex) `--link "mysql:mysql"`

**-h** : `--hostname` : Set the hostname of the container.

**-w** : `--workdir` : Set the directory where the process inside the container will run.

**-a** : `--attach` : Connect standard input (stdin), standard output (stdout), and standard error (stderr) to the container.

**-c** : `--cpu-shares` : CPU resource allocation setting. Default is 1024, and each value is applied relatively.

**-m** : `--memory` : Set memory limit. ex) `--memory="100m"`

**--gpus** : Configure the container to use the host's NVIDIA GPU. To use this method, the host must have: NVIDIA GPU-equipped Linux server + NVIDIA driver installed + Docker version 19.03.5 or higher

- `--gpus all` : Use all GPUs
- `--gpus "device=0.1"` : Use specified GPU

**--security-opt** : Configure SELinux and AppArmor options. ex) `--security-opt="label:level:TopSecret"`
