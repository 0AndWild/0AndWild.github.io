+++
title = 'Why I Switched to Hugo & GitHub Pages'
date = '2025-10-15T17:21:09+09:00'
description = "The reasons and selection criteria for migrating my tech blog from Tstory to Hugo & GitHub Pages"
summary = "Moving to Hugo for better markdown compatibility, Open API support ended, and improved developer experience"
categories = ["Blog"]
tags = ["Hugo", "GitHub Pages", "Blog", "Migration"]
series = []
series_order = 1

draft = false
+++

## Why I Moved to Hugo & GitHub Pages

I decided to migrate my tech blog from [**Tstory**](https://0andwild.tistory.com/) to **Hugo & GitHub Pages**.

### 1. Scattered Content Management

As I used various note-taking tools, the content I wrote at work or while studying became scattered everywhere. Having to transfer these notes to the blog repeatedly became burdensome, which led me to neglect blog management.

### 2. Markdown Compatibility Issues

The markdown syntax used in my note-taking tools wasn't fully compatible with Tstory, requiring frequent modifications when publishing posts. This was also a source of frustration.

Specific issues included:
- Insufficient syntax highlighting support for code blocks
- Table rendering errors
- Image path handling problems
- Limited mathematical expression support

### 3. Tstory Open API Support Ended

Recently, I wanted to reorganize my study materials and post them on Tstory while redesigning the blog skin. I also planned to integrate existing note-taking tools using the **Tstory Official Open API**. However, I discovered that Open API support had been discontinued, and there was no longer a reason to continue using Tstory.

### Blog Platform Selection Criteria

After researching various blogs and considering what approach would work best, I settled on **Hugo & GitHub Pages** based on the following criteria:

- **Is it easy to set up the blog?**
- **Can it be managed with code?**
- **Is there high flexibility to add features I want?**
- **Is the build and deployment speed fast when using GitHub Pages?**
- **Is it easy to integrate with note-taking tools like Obsidian?**

---

## What is Hugo?

[**Hugo**](https://gohugo.io/) is a fast and flexible **Static Site Generator** written in the **Go language**.

**Key Features:**
- **Fast build speed**: Thousands of pages can be built in seconds
- **Simple structure**: Write content in Markdown and Hugo converts it to HTML
- **Zero dependencies**: Runs as a single binary without requiring separate runtime or database
- **Rich theme ecosystem**: Easy to apply themes for various purposes

## Comparing Static Site Generators Used with GitHub Pages

| Feature | Hugo | Jekyll | Gatsby | Next.js (SSG) | VuePress |
|------|------|--------|--------|---------------|----------|
| **Language** | Go | Ruby | React (JavaScript) | React (JavaScript) | Vue.js |
| **Build Speed** | ⚡ Very Fast (< 1ms/page) | 🐢 Slow | 🚶 Moderate | 🚶 Moderate | 🚶 Moderate |
| **Installation Complexity** | ✅ Single Binary | ⚠️ Ruby environment required | ⚠️ Node.js + many dependencies | ⚠️ Node.js + dependencies | ⚠️ Node.js + dependencies |
| **GitHub Pages Native Support** | ❌ (Actions required) | ✅ Native support | ❌ (Actions required) | ❌ (Actions required) | ❌ (Actions required) |
| **Learning Curve** | Low | Low | High | Medium-High | Medium |
| **Themes/Plugins** | Rich | Very Rich | Rich (React ecosystem) | Rich (React ecosystem) | Moderate |
| **Best For** | Blog, Docs, Portfolio | Blog, GitHub default | Complex web apps, Blog | Complex web apps, Hybrid | Technical docs |
| **Build Time (1000 pages)** | ~1s | ~2min | ~30s | ~30s | ~20s |

**Why I Chose Hugo:**
- **Overwhelming build speed**: Build time barely increases even with more content
- **Simple setup**: Focus on Markdown without complex JavaScript frameworks
- **Zero dependencies**: No environment setup issues with a single executable
- **Rich themes**: Easy to apply high-quality themes like Blowfish

---

## GitHub Pages Deployment

Blogs written with Hugo are automatically built and deployed through **GitHub Actions**.

### Deployment Workflow

1. Push changes to the `main` branch
2. GitHub Actions automatically triggers
3. Hugo builds the static site
4. Built files are automatically deployed to GitHub Pages

### Benefits

- **Automated deployment**: Automatically deploys when you push code
- **Version control**: Track all changes through Git
- **Free hosting**: GitHub Pages is provided for free
- **Custom domain**: Can connect your desired domain
- **HTTPS support**: HTTPS is provided by default

---

## Obsidian Integration

Hugo is markdown-based, making it perfectly compatible with note-taking tools like **Obsidian**.

### Integration Method

1. Set Hugo blog's `content/posts` directory as Obsidian vault
2. Write and edit posts in Obsidian
3. When finished writing, commit & push through Git
4. GitHub Actions automatically builds and deploys

### Benefits

- **Consistent writing environment**: Manage all notes and blog posts in the same tool
- **Perfect markdown compatibility**: No additional conversion work needed
- **Local-first**: Can write posts without internet connection
- **Powerful linking features**: Utilize Obsidian's backlinks and graph view

---

## Terminal Commands

### Running Development Server

```bash
hugo server
```

Starts a local development server. By default, you can view the site at `http://localhost:1313`.

**Key Options:**

- `-D` or `--buildDrafts`: Builds draft content as well
- `--bind 0.0.0.0`: Makes server accessible from all network interfaces
- `--port 8080`: Uses a different port instead of the default (1313)
- Browser automatically refreshes when files change (Live Reload)

**Examples:**

```bash
hugo server -D
hugo server --bind 0.0.0.0 --port 8080
```

### Production Build

```bash
hugo --cleanDestinationDir
```

Builds the static site for production. Output is generated in the `public/` directory.

**Key Features:**

- `--cleanDestinationDir`: Completely cleans the destination directory (`public/`) before building
- Removes unnecessary files from previous builds for a clean build
- Ensures no old versions of files remain even when filenames are changed or deleted

**Examples:**

```bash
hugo --cleanDestinationDir
hugo --cleanDestinationDir --minify  # Add file minification option
```

---

## Theme Information

### Hugo Blowfish Theme

This blog uses the [**Blowfish**](https://blowfish.page/) theme.

**Features:**
- Provides modern and responsive design
- Supports dark mode
- Fast loading speed and SEO optimized
- Multilingual support
- Rich customization options

**Configuration Files:**
- `config/_default/hugo.toml` - Basic Hugo configuration
- `config/_default/params.toml` - Blowfish theme parameters
- `config/_default/languages.en.toml` - Language-specific settings
- `config/_default/menus.en.toml` - Menu configuration

---

## Conclusion

The migration from Tstory to Hugo & GitHub Pages was a choice for a developer-friendly environment. Now I can manage my blog the same way I manage code versions, and with perfect Obsidian integration, I've unified the workflow from note-taking to blog posting.

Above all, Hugo's fast build speed and GitHub Actions' automated deployment allow me to focus solely on writing, and I can freely customize without being bound by platform constraints.

Going forward, I plan to gradually migrate existing posts from Tstory while steadily adding new content.

---

### References

- **Hugo Official Site:** https://gohugo.io/
- **Blowfish Theme:** https://blowfish.page/
- **Blowfish Creator:** [@nunocoracao](https://github.com/nunocoracao)
- **Creator Blog:** https://n9o.xyz/
- **Official Docs:** https://blowfish.page/docs/
- **License:** [MIT License](https://en.wikipedia.org/wiki/MIT_License)
