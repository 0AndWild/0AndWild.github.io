+++
title = 'Private IP/Public IP? Private Network/Public Network? VPN?'
date = '2022-10-05T17:34:36+09:00'
description = "Let's easily understand private networks, NAT, and VPN operation principles that solved the IPv4 address exhaustion problem"
summary = "Learn the differences between private and public IPs, the role of NAT (Network Address Translation), and how VPNs work. From the concept of private networks that solved IPv4 address exhaustion to NAT functions in routers and practical VPN use cases, we'll explore the core concepts of networking."
categories = ["Network"]
tags = ["IP", "NAT", "VPN", "Network", "Private Network", "Public Network", "DHCP", "IPv4"]
series = ["Deep Dive into Network"]
series_order = 1

draft = false
+++

{{< lead >}}
Private networks and public networks - I've heard these terms somewhere, but I wanted to organize these concepts since I didn't fully understand them.
{{< /lead >}}

{{< figure src="featured.jpg" alt="public ip vs private ip" caption="The relationship between private and public IPs" >}}

{{< alert "circle-info" >}}
You might be confused when you first see the diagram above, but after reading the entire article, you'll be able to understand it with an "Aha!" moment.
{{< /alert >}}



## 📅 2011, IPv4 Address Exhaustion Declared

The Internet Assigned Numbers Authority (`IANA`), which manages internet addresses, declared that there would be no more IPv4 allocations. While IPv4 can use approximately **4.3 billion** limited addresses, the rapid increase in internet demand exhausted the IPv4 addresses allocated to each continent.

{{< alert "lightbulb" >}}
<strong>IANA (Internet Assigned Numbers Authority)</strong> is an organization that manages IP addresses, top-level domains, etc. It is currently managed by ICANN.
{{< /alert >}}

### But How Are We Still Using IPv4?

So here we are in 2022, 11 years after IPv4 ran out, and we're still using IPv4 just fine. How is this possible?

IPv6 was developed long ago and is gradually being commercialized. Nevertheless, IPv4 usage is still much more prevalent, so how has it been maintained well until now, 11 years later?

{{< alert "check" >}}
This is thanks to <strong>Private Networks</strong>.
{{< /alert >}}



## 🔌 What is a Private Network?

A private network refers to a network that uses a specific range of IPv4 addresses within limited spaces such as homes and businesses, rather than on the public internet. **Private IP ranges** that belong to private networks can only be used within the <strong>private network (internal network)</strong>, so they cannot be used on the <strong>public network (external network, internet)</strong>.

{{< figure src="figure2_en.png" alt="private ip" caption="Private IP ranges" class="max-w-4xl" >}}

## {{< icon "globe" >}} What is a Public IP?

A public IP is necessary for different PCs to communicate with each other over the internet and is used for purposes such as:

- Building website servers
- PC internet connection
- Communication via the internet

{{< alert "star" >}}
Each country has an organization that manages public IPs. In Korea, the <strong>Korea Internet & Security Agency (KISA)</strong> manages them.
{{< /alert >}}

{{< figure src="figure3.jpeg" alt="public ip" caption="Public IP address system" >}}



---

### 💡 Concept Summary

{{< alert "circle-info" >}}
Private networks can only be used **within limited spaces** such as homes or businesses.
{{< /alert >}}

So how do we communicate with other PCs that don't use the same private network as us?

We need a `public IP`!

In other words, **special measures** are needed to communicate with the public internet from a private network. Private IPs are regulated to be used only within private networks, so private IPs cannot be used on the public internet.

## 🔄 NAT (Network Address Translation)

To address this, <strong>Network Address Translation (NAT)</strong> was devised as a method to convert IP addresses.

{{< alert "lightbulb" >}}
**What is NAT?**

It refers to a technology that sends and receives network traffic through a router while rewriting TCP/UDP port numbers and source and destination IP addresses of IP packets. Since changes occur in packets, IP and <strong>TCP/UDP checksums</strong> must also be recalculated and rewritten.

The reason for using NAT is usually to allow **multiple hosts belonging to a private network to access the internet using a single public IP address**.
{{< /alert >}}

In other words, it means converting to the IP used in the public/private network when communicating from a private network to a public network and vice versa. According to the above explanation, converting TCP/UDP port numbers of IP packets is actually because NAT includes not only IP addresses but also port conversion!

It's called `PAT` or `NAPT` <strong>(Port Address Translation)</strong>.





## 📡 Router Functions

These days, most homes have routers installed and in use (e.g., iptime, olleh, etc.).

These routers have various functions.

### 1. DHCP Server Function

First, there's a `DHCP` (Dynamic Host Configuration Protocol) server function that assigns IPs to various devices connected through a single router.

{{< alert "lightbulb" >}}
<strong>Dynamic Host Configuration Protocol (DHCP)</strong>

DHCP is an IP standard that simplifies host IP configuration management. It provides a method to **dynamically assign** IP addresses and other related configuration details to DHCP-enabled clients on the network using a DHCP server.
{{< /alert >}}

Through this, smart devices and PCs inside the house connected to the router are each assigned a private IP.

{{< alert "question-circle" >}}
**Why are they assigned private IPs?**

If you go back to the very first explanation, you'll understand...?!
{{< /alert >}}

Since the number of IP allocations is limited, we can't assign a public IP to every home, or rather, every device, so we **assign private IPs to build a private network**! By building a private network this way, communication is possible internally, but we still can't communicate with the external internet.

### 2. NAT Function

That's why routers have a **NAT function**.

- Function to convert private IPs to public IPs
- Build their own mapping table and manage pre-conversion and post-conversion values with a NAT table

{{< alert "star" >}}
Of course, the router doesn't have its own public IP! The router **uses the public IP range** provided by <strong>internet service providers (KT, SKT, LG, etc.)</strong>!
{{< /alert >}}



---

## {{< icon "shield" >}} What is a VPN (Virtual Private Network)?

Going further, let's learn about VPNs, which we may have used but don't know exactly what role they play!

{{< lead >}}
VPN stands for **Virtual Private Network**, which, as the name suggests, is a private network but a virtual one.
{{< /lead >}}

{{< alert "fire" >}}
The VPN I knew was something that changes IPs or fakes IPs for illegal purposes... 🤔

I thought it was something like that, but it's **half right and half wrong**!
{{< /alert >}}

### The True Meaning of VPN

VPN refers to being able to use an external computer <strong>as if it were connected to an internal network (private network)</strong>.

The reason why the IP changes when using VPN can also be understood if you think carefully about private/public networks mentioned above.

{{< alert "check" >}}
The IP changes because you've <strong>connected to the internal network (private network)</strong> through VPN!
{{< /alert >}}



### 💼 VPN Use Cases

#### 1. Remote Work/Telecommuting
Through this, companies with private networks set up VPN servers, and through external public IP addresses and configured IDs/passwords, you can **access the company's private network from anywhere**.

#### 2. Remote Computer Access
Similarly, for personal computers, through VPN setup, if you know the external public IP address, you can **access your computer in Seoul from Jeju Island** through VPN from anywhere.

#### 3. Bypassing Geographical Restrictions
When a website in a certain country blocks access from our country's IP, we cannot access that site. To access this site, we need to approach with an IP address from a country other than ours. At this time, through VPN, we can bypass the blocked firewall <strong>as if we're accessing from an internal network in another country</strong>.

#### 4. Firewall Bypass Mechanism

{{< alert "exclamation-triangle" >}}
**Hypothetical Scenario**

If a company blocks access to SNS during work hours as an internal policy, we connect through VPN set up at home or an overseas VPN. Then we can access SNS.

{{< /alert >}}


**Why does this work?**

The moment you connect to VPN, a **virtual tunnel** is formed, and packets sent for communication between tunnels are broken down into smaller pieces and undergo **encryption** and **encapsulation**. At this time, although it passes through the company's firewall, because it's an encrypted/encapsulated packet, the firewall cannot detect that you're trying to access SNS through VPN, so it lets the packet pass through.

{{< figure src="figure4.png" alt="vpn" caption="VPN tunneling structure" >}}


---

## 📋 VPN Summary

### 👍 Advantages

{{< alert "check" >}}
- {{< icon "lock" >}} **Data security**
- 🔒 **Online privacy protection**
- 📍 **IP address change**
- 🛡️ **Personal protection**
- 🚀 **Bandwidth throttling prevention**
{{< /alert >}}

### 👎 Disadvantages

While VPN has many advantages as mentioned above, it also has disadvantages.

{{< alert "exclamation-triangle" >}}
- 🐢 Devices connected to VPN must communicate with the VPN server using encryption, so **network speed is very slow**
- ⚠️ Some VPNs with low reliability exist
- 💰 You must **pay** to use VPNs with high security
- 🚫 **Not available** in some countries
{{< /alert >}}
