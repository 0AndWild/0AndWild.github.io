+++
title = 'Complete Guide to Comment Systems for Static Blogs'
date = '2025-10-17T11:00:00+09:00'
description = "Comprehensive comparison of all comment systems available for Hugo/GitHub Pages - from anonymous to GitHub login"
summary = "Pros, cons, and implementation methods for all comment systems: Giscus, Utterances, Remark42, Disqus, and more"
categories = ["Blog", "Tutorial"]
tags = ["Hugo", "Comments", "GitHub Pages", "Giscus", "Static Site"]
series = ["Hugo"]
series_order = 4

draft = false
+++

## Overview

This guide provides a comprehensive comparison of all methods to add comment functionality to blogs built with static site generators (Hugo). We present solutions for various requirements including **anonymous comments**, **GitHub login**, and **social logins**.

---

## Comment System Classification

### By Authentication Method

| Authentication | Systems |
|----------------|---------|
| **GitHub Only** | Giscus, Utterances |
| **Anonymous Supported** | Remark42, Commento, Comentario, HashOver |
| **Anonymous + Social Login** | Remark42, Commento, Disqus |
| **Social Login Only** | Disqus, Hyvor Talk |

### By Hosting Method

| Hosting | Systems |
|---------|---------|
| **SaaS (No Management)** | Giscus, Utterances, Disqus, Hyvor Talk |
| **Self-Hosted** | Remark42, Commento, Comentario, HashOver |
| **Hybrid** | Cusdis (Free Vercel deployment) |

---

## 1. Giscus (Highly Recommended - For GitHub Users)

### Concept
Comment system using GitHub Discussions as backend

### How It Works
```
1. User visits blog
   ↓
2. Giscus widget loads
   ↓
3. Login with GitHub OAuth
   ↓
4. Write comment
   ↓
5. Auto-saved to GitHub Discussions
   ↓
6. Displayed on blog in real-time
```

### Advantages
- ✅ **Completely free** (leverages GitHub features)
- ✅ **No server required** (GitHub handles backend)
- ✅ **Data ownership** (stored in your repository)
- ✅ **Markdown support** (code blocks, images, etc.)
- ✅ **Reactions support** (👍, ❤️, etc.)
- ✅ **Notifications** (comment alerts via GitHub notifications)
- ✅ **Dark mode** (syncs with blog theme)
- ✅ **Spam prevention** (requires GitHub account)
- ✅ **Easy management** (manage in GitHub Discussions)
- ✅ **Searchable** (search comments via GitHub search)

### Disadvantages
- ❌ **No anonymous comments** (GitHub account required)
- ❌ **Best for tech blogs** (general users may not have GitHub accounts)
- ❌ **GitHub dependency** (comments unavailable during GitHub outages)

### Implementation Difficulty
⭐⭐ (2/5)

### Setup Method

#### Step 1: Enable GitHub Discussions
```bash
1. GitHub Repository → Settings
2. Features section → Check Discussions
```

#### Step 2: Configure Giscus
1. Visit [giscus.app](https://giscus.app)
2. Enter repository: `username/repository`
3. Select settings:
   - **Page ↔️ Discussion mapping**: `pathname` (recommended)
   - **Discussion category**: `Announcements` or `General`
   - **Features**: Reactions, comments above
   - **Theme**: Match your blog theme

#### Step 3: Add to Blowfish
```html
<!-- layouts/partials/comments.html -->
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="YOUR_REPO_ID"
        data-category="Announcements"
        data-category-id="YOUR_CATEGORY_ID"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
```

#### Step 4: Configure params.toml
```toml
[article]
  showComments = true
```

### Theme Synchronization (Dark Mode)
```javascript
<script>
  // Change Giscus theme when blog theme changes
  const giscusTheme = document.querySelector('iframe.giscus-frame');
  if (giscusTheme) {
    const theme = document.documentElement.getAttribute('data-theme');
    giscusTheme.contentWindow.postMessage({
      giscus: {
        setConfig: {
          theme: theme === 'dark' ? 'dark' : 'light'
        }
      }
    }, 'https://giscus.app');
  }
</script>
```

### Cost
**Completely free**

### Recommended For
- ✅ Developer blogs
- ✅ Technical documentation
- ✅ Open source project blogs

---

## 2. Utterances

### Concept
Comment system using GitHub Issues as backend (predecessor of Giscus)

### How It Works
```
1. GitHub OAuth login
   ↓
2. Write comment
   ↓
3. Save to GitHub Issues (each post = 1 Issue)
   ↓
4. Display on blog
```

### Advantages
- ✅ Completely free
- ✅ Lightweight (TypeScript)
- ✅ Simple setup
- ✅ Markdown support

### Disadvantages
- ❌ **Uses Issues** (less suitable than Discussions)
- ❌ Fewer features than Giscus
- ❌ No anonymous comments

### Giscus vs Utterances

| Feature | Giscus | Utterances |
|---------|--------|------------|
| Backend | Discussions | Issues |
| Reactions | ✅ | ❌ |
| Nested Replies | ✅ (nested) | ⚠️ (flat) |
| Suitability | Comment-specific | Issue tracking |

**Conclusion**: Giscus is a superior alternative to Utterances

### Implementation Difficulty
⭐⭐ (2/5)

### Setup Method
```html
<!-- layouts/partials/comments.html -->
<script src="https://utteranc.es/client.js"
        repo="username/repository"
        issue-term="pathname"
        theme="github-light"
        crossorigin="anonymous"
        async>
</script>
```

### Recommended For
- Unless there's a specific reason, **use Giscus instead**

---

## 3. Remark42 (Highly Recommended - Anonymous + Social Login)

### Concept
Open-source self-hosted comment system supporting anonymous and various social logins

### How It Works
```
1. Deploy Remark42 server (Docker)
   ↓
2. Insert Remark42 script on blog
   ↓
3. User chooses:
   - Write anonymous comment
   - Login with GitHub/Google/Twitter and write
   ↓
4. Save to Remark42 DB
   ↓
5. Display on blog
```

### Advantages
- ✅ **Anonymous comments supported** (can be toggled on/off)
- ✅ **Various social logins** (GitHub, Google, Facebook, Twitter, Email)
- ✅ **Completely free** (open source)
- ✅ **No ads**
- ✅ **Data ownership** (your server)
- ✅ **Markdown support**
- ✅ **Comment edit/delete**
- ✅ **Admin mode** (approve/block/delete comments)
- ✅ **Notifications** (Email/Telegram)
- ✅ **Import/Export** (migrate from other systems)
- ✅ **Voting** (upvote/downvote)
- ✅ **Spam filter**

### Disadvantages
- ❌ **Self-hosting required** (Docker server)
- ❌ **Maintenance responsibility**
- ❌ **Hosting costs** ($5/month~, free tier possible)

### Implementation Difficulty
⭐⭐⭐⭐ (4/5)

### Hosting Options

#### Option 1: Railway (Recommended)
```bash
1. Sign up for Railway.app
2. "New Project" → "Deploy from GitHub"
3. Select Remark42 Docker image
4. Configure environment variables:
   - REMARK_URL=https://your-remark42.railway.app
   - SECRET=your-random-secret
   - AUTH_ANON=true  # Allow anonymous comments
   - AUTH_GITHUB_CID=your_client_id
   - AUTH_GITHUB_CSEC=your_client_secret
```

**Railway Free Tier**:
- $5 credit per month
- Sufficient for small blogs

#### Option 2: Fly.io
```bash
# fly.toml
app = "my-remark42"

[build]
  image = "umputun/remark42:latest"

[env]
  REMARK_URL = "https://my-remark42.fly.dev"
  AUTH_ANON = "true"
  AUTH_GITHUB_CID = "xxx"
  AUTH_GITHUB_CSEC = "xxx"
```

```bash
fly launch
fly deploy
```

**Fly.io Free Tier**:
- 3 apps
- Sufficient for small blogs

#### Option 3: Docker Compose (VPS)
```yaml
# docker-compose.yml
version: '3.8'

services:
  remark42:
    image: umputun/remark42:latest
    restart: always
    environment:
      - REMARK_URL=https://remark.your-blog.com
      - SECRET=your-secret-key-change-this
      - AUTH_ANON=true                    # Allow anonymous
      - AUTH_GITHUB_CID=xxx               # GitHub login
      - AUTH_GITHUB_CSEC=xxx
      - AUTH_GOOGLE_CID=xxx               # Google login
      - AUTH_GOOGLE_CSEC=xxx
      - ADMIN_SHARED_ID=github_username   # Admin
    volumes:
      - ./data:/srv/var
    ports:
      - "8080:8080"
```

```bash
docker-compose up -d
```

### Blog Embed Code
```html
<!-- layouts/partials/comments.html -->
<div id="remark42"></div>
<script>
  var remark_config = {
    host: 'https://your-remark42.railway.app',
    site_id: '0andwild-blog',
    components: ['embed'],
    theme: 'light',
    locale: 'en',
    max_shown_comments: 10,
    simple_view: false,
    no_footer: false
  };

  (function(c) {
    for(var i = 0; i < c.length; i++){
      var d = document, s = d.createElement('script');
      s.src = remark_config.host + '/web/' +c[i] +'.js';
      s.defer = true;
      (d.head || d.body).appendChild(s);
    }
  })(remark_config.components || ['embed']);
</script>
```

### Anonymous + GitHub Simultaneous Configuration
```bash
# Environment variables
AUTH_ANON=true              # Allow anonymous
AUTH_GITHUB_CID=xxx         # GitHub OAuth App ID
AUTH_GITHUB_CSEC=xxx        # GitHub OAuth App Secret
ANON_VOTE=false             # Disable voting for anonymous (spam prevention)
```

Users can choose:
- "Comment anonymously"
- "Login with GitHub"

### Admin Features
```bash
# Designate admin
ADMIN_SHARED_ID=github_yourusername

# Or by email
ADMIN_SHARED_EMAIL=you@example.com
```

Admin capabilities:
- Delete comments
- Block users
- Pin comments
- Read-only mode

### Cost
- **Railway**: Free or $5/month
- **Fly.io**: Free tier available
- **VPS (DigitalOcean, etc.)**: $5/month~

### Recommended For
- ✅ **Want both anonymous and social login**
- ✅ Users comfortable with Docker
- ✅ Want complete data control

---

## 4. Commento / Comentario

### Concept
Privacy-focused lightweight comment system

### Commento vs Comentario

| Item | Commento | Comentario |
|------|----------|------------|
| Status | Development stopped | Actively developed (Commento fork) |
| License | MIT | MIT |
| Language | Go | Go |
| Recommend | ❌ | ✅ |

**Conclusion**: Comentario recommended

### Comentario Advantages
- ✅ Anonymous comments supported
- ✅ Social logins (GitHub, Google, GitLab, SSO)
- ✅ Lightweight (Go-based)
- ✅ Privacy-focused
- ✅ Markdown support
- ✅ Voting feature

### Disadvantages
- ❌ Self-hosting required
- ❌ Fewer features than Remark42

### Implementation Difficulty
⭐⭐⭐⭐ (4/5)

### Docker Deployment
```yaml
version: '3.8'

services:
  comentario:
    image: registry.gitlab.com/comentario/comentario
    ports:
      - "8080:8080"
    environment:
      - COMENTARIO_ORIGIN=https://comments.your-blog.com
      - COMENTARIO_BIND=0.0.0.0:8080
      - COMENTARIO_POSTGRES=postgres://user:pass@db/comentario
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=comentario
      - POSTGRES_USER=comentario
      - POSTGRES_PASSWORD=change-this
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Blog Embed
```html
<script defer src="https://comments.your-blog.com/js/commento.js"></script>
<div id="commento"></div>
```

### Recommended For
- Alternative to Remark42
- Want simpler system

---

## 5. Disqus (Traditional SaaS)

### Concept
Oldest and most widely used cloud comment system

### How It Works
```
1. Create Disqus account and register site
   ↓
2. Insert Disqus script on blog
   ↓
3. User chooses:
   - Guest (anonymous - requires email)
   - Disqus account
   - Facebook/Twitter/Google login
   ↓
4. Save to Disqus server
   ↓
5. Display on blog
```

### Advantages
- ✅ **Extremely simple setup** (5 minutes)
- ✅ **No server required** (SaaS)
- ✅ **Guest mode** (comment with just email)
- ✅ **Social logins** (Facebook, Twitter, Google)
- ✅ **Powerful admin tools**
- ✅ **Spam filter** (Akismet integration)
- ✅ **Mobile apps** (iOS/Android)
- ✅ **Analytics/Statistics**

### Disadvantages
- ❌ **Shows ads** (free plan)
- ❌ **Heavy** (script size)
- ❌ **Privacy concerns** (data tracking)
- ❌ **No data ownership** (Disqus servers)
- ❌ **No GitHub login**
- ❌ **Ad removal cost** ($11.99/month~)

### Implementation Difficulty
⭐ (1/5) - Easiest

### Setup Method

#### Step 1: Register Disqus Site
```bash
1. Sign up at disqus.com
2. Select "I want to install Disqus on my site"
3. Enter Website Name (e.g., andwild-blog)
4. Select Category
5. Select Plan (Basic - Free)
```

#### Step 2: Configure Blowfish
```toml
# config/_default/config.toml
[services.disqus]
  shortname = "andwild-blog"  # Name created in Step 1
```

```toml
# config/_default/params.toml
[article]
  showComments = true
```

Hugo has built-in Disqus support, so comments display automatically!

#### Step 3: Allow Guest Comments
```bash
Disqus Dashboard → Settings → Community
→ Guest Commenting: Allow guests to comment (check)
```

### Ad Removal Methods

#### Method 1: Paid Plan ($11.99/month~)
- Plus Plan: No ads
- Pro Plan: No ads + advanced features

#### Method 2: Hide with CSS (Not recommended - may violate terms)
```css
/* Not recommended: May violate Disqus terms */
#disqus_thread iframe[src*="ads"] {
  display: none !important;
}
```

### Cost
- **Free**: With ads
- **Plus**: $11.99/month (no ads)
- **Pro**: $89/month (advanced features)

### Recommended For
- ✅ Want to add comments quickly
- ✅ Non-technical bloggers
- ✅ Don't mind ads
- ❌ Not recommended for privacy-conscious users

---

## 6. Cusdis (Free Vercel Deployment)

### Concept
Lightweight open-source comment system, deployable to Vercel for free

### How It Works
```
1. Deploy Cusdis to Vercel (1-Click)
   ↓
2. Connect PostgreSQL (Vercel free)
   ↓
3. Add site in dashboard
   ↓
4. Insert script on blog
   ↓
5. Users comment with email + name
```

### Advantages
- ✅ **Completely free** (Vercel free tier)
- ✅ **Anonymous comments** (just email + name)
- ✅ **Lightweight** (50KB)
- ✅ **Simple setup** (Vercel 1-Click deploy)
- ✅ **Privacy-focused**
- ✅ **Open source**

### Disadvantages
- ❌ No Markdown support
- ❌ No social login
- ❌ Simple features

### Implementation Difficulty
⭐⭐⭐ (3/5)

### Setup Method

#### Step 1: Deploy to Vercel
```bash
1. Visit https://cusdis.com/
2. Click "Deploy with Vercel"
3. Connect GitHub
4. Add PostgreSQL (Vercel Storage)
5. Deployment complete
```

#### Step 2: Add Site
```bash
1. Access deployed Cusdis dashboard
2. Click "Add Website"
3. Enter Domain: 0andwild.github.io
4. Copy App ID
```

#### Step 3: Blog Embed
```html
<!-- layouts/partials/comments.html -->
<div id="cusdis_thread"
  data-host="https://your-cusdis.vercel.app"
  data-app-id="YOUR_APP_ID"
  data-page-id="{{ .File.UniqueID }}"
  data-page-url="{{ .Permalink }}"
  data-page-title="{{ .Title }}">
</div>
<script async defer src="https://your-cusdis.vercel.app/js/cusdis.es.js"></script>
```

### Cost
**Completely free** (Vercel free tier)

### Recommended For
- ✅ Need only simple anonymous comments
- ✅ Want completely free solution
- ✅ Have Vercel experience

---

## 7. HashOver

### Concept
PHP-based fully anonymous comment system

### Advantages
- ✅ Fully anonymous (no information needed)
- ✅ PHP + flat file (no DB required)
- ✅ Open source

### Disadvantages
- ❌ Requires PHP (unsuitable for static sites)
- ❌ No GitHub login
- ❌ Old project

### Implementation Difficulty
⭐⭐⭐⭐ (4/5)

### Recommended For
- ❌ **Not recommended for static blogs**
- Consider only if you have a PHP server

---

## 8. Hyvor Talk (Premium SaaS)

### Concept
Ad-free premium comment system

### Advantages
- ✅ No ads
- ✅ Anonymous comments supported
- ✅ Social logins
- ✅ Powerful spam filter

### Disadvantages
- ❌ **Paid** ($5/month~)
- ❌ No GitHub login

### Cost
- **Starter**: $5/month (1 site)
- **Pro**: $15/month (3 sites)

### Recommended For
- Paid alternative to Disqus
- Want ad-free SaaS

---

## Comparison Tables

### By Authentication Method
| System | Anonymous | GitHub | Google | Other Social | Difficulty | Cost |
|--------|-----------|--------|--------|--------------|------------|------|
| **Giscus** | ❌ | ✅ | ❌ | ❌ | ⭐⭐ | Free |
| Utterances | ❌ | ✅ | ❌ | ❌ | ⭐⭐ | Free |
| **Remark42** | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ | $5/mo |
| Comentario | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ | $5/mo |
| **Disqus** | ⚠️ | ❌ | ✅ | ✅ | ⭐ | Free (ads) |
| Cusdis | ✅ | ❌ | ❌ | ❌ | ⭐⭐⭐ | Free |
| Hyvor Talk | ✅ | ❌ | ✅ | ✅ | ⭐ | $5/mo |

### By Features
| System | Markdown | Reactions | Voting | Notifications | Admin | Spam Filter |
|--------|----------|-----------|--------|---------------|-------|-------------|
| Giscus | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ |
| Remark42 | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Disqus | ⚠️ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Cusdis | ❌ | ❌ | ❌ | ⚠️ | ✅ | ⚠️ |

### By Hosting
| System | Hosting | Data Location | Dependency |
|--------|---------|---------------|------------|
| Giscus | GitHub | GitHub Discussions | GitHub |
| Remark42 | Self | Your server | Docker |
| Disqus | Disqus | Disqus servers | Disqus |
| Cusdis | Vercel | Vercel DB | Vercel |

---

## Selection Guide

### Scenario-Based Recommendations

#### 1. "Developer blog, targeting GitHub users"
→ **Giscus** ⭐⭐⭐⭐⭐
- Free, simple, Markdown support
- GitHub integration makes notifications convenient

#### 2. "General blog, anonymous comments essential"
→ **Cusdis** (simple) or **Remark42** (advanced)
- Cusdis: 5-minute setup, completely free
- Remark42: More features, includes social login

#### 3. "Both anonymous + GitHub login"
→ **Remark42** ⭐⭐⭐⭐⭐
- Only option supporting both
- Powerful admin features

#### 4. "No technical skills, quick setup"
→ **Disqus**
- 5-minute setup
- Accept ads

#### 5. "Completely free + don't want server management"
→ **Giscus** (GitHub) or **Cusdis** (anonymous)

#### 6. "Privacy is top priority"
→ **Remark42** or **Comentario** (self-hosted)
- Complete data control

---

## Practical Implementation: Blowfish + Giscus

### Complete Setup Process

#### 1. Enable GitHub Discussions
```bash
GitHub Repository → Settings → Features → Check Discussions
```

#### 2. Install Giscus App
```bash
Visit https://github.com/apps/giscus → Install
→ Select repository
```

#### 3. Generate Giscus Configuration
At [giscus.app](https://giscus.app):
```
Repository: 0AndWild/0AndWild.github.io
Mapping: pathname
Category: Announcements
Theme: preferred_color_scheme
Language: en
```

Copy generated code

#### 4. Create File
```bash
# Create directory (if not exists)
mkdir -p layouts/partials

# Create file
touch layouts/partials/comments.html
```

#### 5. Insert Code
```html
<!-- layouts/partials/comments.html -->
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_xxxxxxxxxxxxx"
        data-category="Announcements"
        data-category-id="DIC_xxxxxxxxxxxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
```

#### 6. Modify params.toml
```toml
[article]
  showComments = true
```

#### 7. Local Testing
```bash
hugo server -D
# Check at http://localhost:1313
```

#### 8. Deploy
```bash
git add .
git commit -m "Add Giscus comments"
git push
```

---

## Practical Implementation: Blowfish + Remark42 (Railway)

### Complete Setup Process

#### 1. Create GitHub OAuth App
```bash
GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

Application name: AndWild Blog Comments
Homepage URL: https://0andwild.github.io
Authorization callback URL: https://your-remark42.railway.app/auth/github/callback

After creation:
Copy Client ID
Generate and copy Client Secret
```

#### 2. Deploy to Railway
```bash
1. Sign up for railway.app
2. "New Project" → "Deploy Docker Image"
3. Image: umputun/remark42:latest
4. Add environment variables:
```

```bash
REMARK_URL=https://your-project.railway.app
SECRET=randomly-generated-secret-key-change-this
SITE=0andwild-blog
AUTH_ANON=true
AUTH_GITHUB_CID=your_github_client_id
AUTH_GITHUB_CSEC=your_github_client_secret
ADMIN_SHARED_ID=github_yourusername
```

#### 3. Verify Deployment
```bash
Railway automatically generates URL:
https://your-project.railway.app

Access in browser to verify Remark42 UI
```

#### 4. Configure Blowfish
```bash
mkdir -p layouts/partials
touch layouts/partials/comments.html
```

```html
<!-- layouts/partials/comments.html -->
<div id="remark42"></div>
<script>
  var remark_config = {
    host: 'https://your-project.railway.app',
    site_id: '0andwild-blog',
    components: ['embed'],
    theme: 'light',
    locale: 'en'
  };

  (function(c) {
    for(var i = 0; i < c.length; i++){
      var d = document, s = d.createElement('script');
      s.src = remark_config.host + '/web/' +c[i] +'.js';
      s.defer = true;
      (d.head || d.body).appendChild(s);
    }
  })(remark_config.components || ['embed']);
</script>
```

#### 5. params.toml
```toml
[article]
  showComments = true
```

#### 6. Test and Deploy
```bash
hugo server -D
# After verification
git add .
git commit -m "Add Remark42 comments"
git push
```

---

## Migration Guide

### Disqus → Giscus
```bash
1. Export data from Disqus (XML)
2. Manual migration to GitHub Discussions
   (No automation script, manual work required)
```

### Disqus → Remark42
```bash
1. Disqus XML Export
2. Remark42 Admin → Import → Select Disqus
3. Upload XML file
```

---

## Conclusion

### Final Recommendations

| Situation | Recommended System | Reason |
|-----------|-------------------|---------|
| **Developer blog** | **Giscus** | Free, GitHub integration, Markdown |
| **General blog (anonymous needed)** | **Cusdis** | Free, simple, anonymous |
| **Both anonymous + social** | **Remark42** | Flexible, all features |
| **Quick setup** | **Disqus** | 5-minute completion (accept ads) |
| **Complete control** | **Remark42** | Self-hosted, customizable |

### Personal Recommendation (0AndWild Blog)
**Giscus** recommended
- Perfect fit for GitHub Pages blog
- Tech blog's main audience is GitHub users
- Free, simple, no maintenance

**Alternative**: Remark42 (when anonymous comments desired)

---

## Quick Start

1. **Start with Giscus** (10 minutes)
2. Collect user feedback
3. Consider **switching to Remark42** if many requests for anonymous comments

Comment systems can be changed later, so strongly recommend starting with Giscus!
