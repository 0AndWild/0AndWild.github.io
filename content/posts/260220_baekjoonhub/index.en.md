+++
title = 'Customizing the BaekjoonHub Chrome Extension'
date = '2026-02-20T22:35:24+09:00'
description = "Why I customized the BaekjoonHub extension for my workflow and what I changed."
summary = "Implemented Base Directory support, tier path granularity, directory name normalization, Java Main/package automation, and bulk upload."
categories = ["Baekjoon", "Chrome Extension"]
tags = ["BaekjoonHub", "Chrome Extension", "GitHub", "Java", "Automation", "Customization"]
series = []
series_order = 1

draft = false
+++

# Why I Ended Up Customizing BaekjoonHub

As I started using Baekjoon more seriously, I discovered the `BaekjoonHub` extension.  
It was convenient because it could automatically upload solutions to GitHub, but there were still several pain points for my actual workflow.

So I first checked issues in the official repository.  
I found that people with similar concerns already existed, and there were PRs proposing related features. However, at that time, it did not look like those features would be merged soon, so I decided to customize what I needed instead of waiting.

Original repository: https://github.com/BaekjoonHub/BaekjoonHub  
Custom repository: https://github.com/0AndWild/baekjoonhub_custom

---

## Pain Points I Had

1. Upload paths were based on the repository root, which made it hard to fit my project structure  
2. Tier paths were not granular enough, making problem organization less clean  
3. Problem directory names were awkward to use as package/path names  
4. I sometimes had to manually align Java file names with the runtime entry point (`Main.java`)  
5. It was difficult to organize and upload already solved problems in one shot

---

## What I Changed in My Custom Version

1. Added `Base Directory` support  
2. Split tier paths into granular levels like `Bronze/V`  
3. Normalized problem directory names  
4. Fixed Java file name to `Main.java` and auto-inserted `package`  
5. Added bulk upload for all accepted Baekjoon problems

---

## Wrap-up

This customization was focused less on adding many new features,  
and more on reducing repetitive friction in the actual solve-and-organize workflow.

Since similar requests already existed in the official repository, I think this customization direction could be useful for others with the same pain points.
