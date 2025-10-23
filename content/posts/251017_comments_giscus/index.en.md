+++
title = 'Adding Comments to Hugo Blog with Giscus'
date = '2025-10-17T12:00:00+09:00'
description = "Complete guide to integrating Giscus, a GitHub Discussions-based comment system, with Blowfish theme"
summary = "How to add a free, Markdown-supporting comment system in 10 minutes"
categories = ["Blog", "Tutorial"]
tags = ["Hugo", "Giscus", "GitHub", "Blowfish", "Comments"]
series = ["Hugo"]
series_order = 3

draft = false
+++

## What is Giscus?

**Giscus** is an open-source comment system that uses GitHub Discussions as its backend.

### Key Features
- ✅ **Completely Free** (leverages GitHub features)
- ✅ **No Server Required** (GitHub handles everything)
- ✅ **Full Markdown Support** (code blocks, images, tables, etc.)
- ✅ **Reactions** (👍, ❤️, 😄, etc.)
- ✅ **GitHub Notifications** (get notified when comments are posted)
- ✅ **Dark Mode** (auto-syncs with blog theme)
- ✅ **Data Ownership** (stored in your repository)

### Differences from Utterances

| Feature | Giscus | Utterances |
|---------|--------|------------|
| Backend | GitHub Discussions | GitHub Issues |
| Reactions | ✅ | ❌ |
| Nested Replies | ✅ (nested) | ⚠️ (flat) |
| Comment Sorting | ✅ | ⚠️ |
| Best For | Comments | Issue tracking |

**Conclusion**: Giscus is the superior choice over Utterances.

---

## Prerequisites

### Requirements
1. GitHub account
2. Public GitHub repository (your blog repository)
3. Hugo + Blowfish theme

### Limitations
- ⚠️ **Public repositories only** (Private repositories have limited Discussions functionality)
- ⚠️ **GitHub account required** (no anonymous comments)

---

## Step 1: Enable GitHub Discussions

### 1.1 Navigate to Repository Settings

1. Go to your blog repository on GitHub
   ```
   Example: https://github.com/0AndWild/0AndWild.github.io
   ```

2. Click the **Settings** tab

### 1.2 Enable Discussions

1. Scroll down to find the **Features** section

2. Check the **Discussions** checkbox ✅

3. It will save automatically

### 1.3 Verify

Confirm that the **Discussions** tab appears at the top of your repository

```
Code | Issues | Pull requests | Discussions | ← Newly created!
```

---

## Step 2: Install Giscus App

### 2.1 Install Giscus GitHub App

1. Visit [https://github.com/apps/giscus](https://github.com/apps/giscus)

2. Click the **Install** button

3. Choose permission scope:
   - **All repositories** (all repositories)
   - **Only select repositories** (specific repositories - recommended)

4. Select your blog repository:
   ```
   0AndWild/0AndWild.github.io
   ```

5. Click **Install**

### 2.2 Verify Permissions

Giscus requests the following permissions:
- ✅ **Read access to discussions** (read discussions)
- ✅ **Write access to discussions** (write discussions)
- ✅ **Read access to metadata** (read metadata)

---

## Step 3: Generate Giscus Configuration

### 3.1 Visit Giscus Website

Go to [https://giscus.app](https://giscus.app)

### 3.2 Connect Repository

Enter in the **Repository** section:
```
0AndWild/0AndWild.github.io
```

You should see a success message below:
```
✅ Success! This repository meets all criteria.
```

If you see an error:
- Verify Discussions is enabled
- Verify Giscus App is installed
- Verify the repository is Public

### 3.3 Page ↔️ Discussion Mapping

Choose in the **Discussion Mapping** section:

#### Recommended: `pathname` (path name)
```
Mapping: Select pathname
```

Each blog post's path becomes the Discussion title.

**Example**:
- Post: `/posts/giscus-guide/`
- Discussion title: `posts/giscus-guide`

#### Alternatives:
- `URL`: Uses full URL (problematic if domain changes)
- `title`: Uses post title (problematic if title changes)
- `og:title`: OpenGraph title
- `specific term`: Manually specified

**Recommendation**: Use `pathname`

### 3.4 Select Discussion Category

Choose from the **Discussion Category** dropdown:

#### Recommended: `Announcements`
```
Category: Select Announcements
```

**Characteristics**:
- Only admins can create new Discussions
- Anyone can comment
- Ideal for blog posts

#### Alternative: `General`
- Anyone can create Discussions
- More open

**Recommendation**: `Announcements` (best for blogs)

### 3.5 Feature Selection

#### Enable Reactions
```
✅ Enable reactions
```
Users can react with 👍, ❤️, 😄, etc.

#### Emit Metadata
```
□ Emit metadata (recommended to leave unchecked)
```
Unnecessary feature, better to keep it off

#### Comment Input Position
```
⚪ Above comments
⚪ Below comments (recommended)
```

**Recommendation**: Below comments
- Encourages users to read existing comments first

#### Lazy Loading
```
✅ Lazy loading
```
Improves page load speed (recommended)

### 3.6 Theme Selection

#### Recommended: `preferred_color_scheme`
```
Theme: preferred_color_scheme
```

**Behavior**:
- Automatically switches based on user's system settings
- Dark mode ↔️ Light mode automatic

#### Alternatives:
- `light`: Always light theme
- `dark`: Always dark theme
- `transparent_dark`: Transparent dark
- Other GitHub themes

**Recommendation**: `preferred_color_scheme` (auto-switching)

### 3.7 Language Setting
```
Language: en (English)
```

---

## Step 4: Copy Generated Code

### 4.1 Copy Script

Copy the generated code from the **Enable giscus** section at the bottom of the page:

```html
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_kgDOxxxxxxxx"
        data-category="Announcements"
        data-category-id="DIC_kwDOxxxxxxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

### 4.2 Important Values

- `data-repo-id`: Repository unique ID (auto-generated)
- `data-category-id`: Category unique ID (auto-generated)

These values are unique to your repository, so you must use the code generated from the Giscus website.

---

## Step 5: Integrate with Blowfish Theme

### 5.1 Create Directory

From the terminal, navigate to your blog's root directory:

```bash
mkdir -p layouts/partials
```

### 5.2 Create comments.html File

```bash
touch layouts/partials/comments.html
```

Or create directly in your IDE/editor:
```
layouts/
  └── partials/
      └── comments.html  ← Create new
```

### 5.3 Insert Giscus Code

Add the following content to `layouts/partials/comments.html`:

```html
<!-- Giscus Comment System -->
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_kgDOxxxxxxxx"
        data-category="Announcements"
        data-category-id="DIC_kwDOxxxxxxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

⚠️ **Important**: Replace the `data-repo-id` and `data-category-id` values with **your own values**!

### 5.4 Configure params.toml

Open `config/_default/params.toml` and add to the `[article]` section:

```toml
[article]
  showComments = true  # Add or verify this line
  # ... other settings
```

If the `showComments` entry already exists, make sure it's set to `true`.

---

## Step 6: Local Testing

### 6.1 Run Hugo Server

```bash
hugo server -D
```

### 6.2 Verify in Browser

```
http://localhost:1313
```

The Giscus comment widget should appear at the bottom of post pages.

### 6.3 Write Test Comment

1. Click **Sign in with GitHub** button
2. Authorize GitHub OAuth
3. Write a test comment
4. Verify the comment displays

### 6.4 Check GitHub Discussions

1. GitHub repository → **Discussions** tab
2. Verify a new Discussion was created in the Announcements category
3. Verify the Discussion title matches the post path

---

## Step 7: Deploy

### 7.1 Commit to Git

```bash
git add layouts/partials/comments.html
git add config/_default/params.toml
git commit -m "Add Giscus comments system"
```

### 7.2 Push to GitHub

```bash
git push origin main
```

### 7.3 Check GitHub Actions

GitHub Actions will automatically build and deploy.

Check deployment status:
```
GitHub repository → Actions tab
```

### 7.4 Verify Deployed Site

```
https://0andwild.github.io
```

Verify the comment widget displays correctly on post pages.

---

## Advanced Configuration

### Dynamic Dark Mode and Language Setting (Recommended)

A complete solution to make Giscus automatically adapt to Blowfish theme's dark mode toggle and language switching.

#### Complete Dynamic Configuration

Full code for `layouts/partials/comments.html`:

```html
<!-- Giscus Comments with Dynamic Theme and Language -->
{{ $lang := .Site.Language.Lang }}
{{ $translationKey := .File.TranslationBaseName }}
<script>
  (function() {
    // Get current theme (dark/light)
    function getGiscusTheme() {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? 'dark_tritanopia' : 'light_tritanopia';
    }

    // Get language from Hugo template
    const currentLang = '{{ $lang }}';

    // Use file directory path for unified comments across languages
    // Example: "posts/subscription_alert" for both index.ko.md and index.en.md
    const discussionId = '{{ .File.Dir | replaceRE "^content/" "" | replaceRE "/$" "" }}';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGiscus);
    } else {
      initGiscus();
    }

    function initGiscus() {
      // Create and insert Giscus script with dynamic settings
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.setAttribute('data-repo', '0AndWild/0AndWild.github.io');
      script.setAttribute('data-repo-id', 'R_kgDOQAqZFA');
      script.setAttribute('data-category', 'General');
      script.setAttribute('data-category-id', 'DIC_kwDOQAqZFM4CwwRg');
      script.setAttribute('data-mapping', 'specific');
      script.setAttribute('data-term', discussionId);
      script.setAttribute('data-strict', '0');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'bottom');
      script.setAttribute('data-theme', getGiscusTheme());
      script.setAttribute('data-lang', currentLang);
      script.setAttribute('data-loading', 'lazy');
      script.setAttribute('crossorigin', 'anonymous');
      script.async = true;

      // Find giscus container or create one
      const container = document.querySelector('.giscus-container') || document.currentScript?.parentElement;
      if (container) {
        container.appendChild(script);
      }
    }

    // Monitor theme changes and update Giscus
    function updateGiscusTheme() {
      const iframe = document.querySelector('iframe.giscus-frame');
      if (!iframe) return;

      const theme = getGiscusTheme();

      try {
        iframe.contentWindow.postMessage(
          {
            giscus: {
              setConfig: {
                theme: theme
              }
            }
          },
          'https://giscus.app'
        );
      } catch (error) {
        console.log('Giscus theme update delayed, will retry...');
      }
    }

    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Delay update to ensure iframe is ready
          setTimeout(updateGiscusTheme, 100);
        }
      });
    });

    // Start observing after a short delay
    setTimeout(() => {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }, 500);

    // Update theme when Giscus iframe loads
    window.addEventListener('message', (event) => {
      if (event.origin !== 'https://giscus.app') return;
      if (event.data.giscus) {
        // Giscus is ready, update theme
        setTimeout(updateGiscusTheme, 200);
      }
    });
  })();
</script>

<style>
  /* Ensure Giscus iframe has proper height and displays all content */
  .giscus-container {
    min-height: 300px;
  }

  .giscus-container iframe.giscus-frame {
    width: 100%;
    border: none;
    min-height: 300px;
  }

  /* Make sure comment actions are visible */
  .giscus {
    overflow: visible !important;
  }
</style>

<div class="giscus-container"></div>
```

#### How It Works

##### 1. **Dynamic Language Setting**
```go
{{ $lang := .Site.Language.Lang }}
const currentLang = '{{ $lang }}';
```
- Gets current page language from Hugo template
- Korean page: `ko`, English page: `en`
- Sets Giscus to the corresponding language

**Result**:
- Korean page → Giscus UI displays in Korean
- English page → Giscus UI displays in English
- Language switch triggers page reload with automatic update

##### 2. **Dynamic Dark Mode Setting**
```javascript
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark_tritanopia' : 'light_tritanopia';
}
```
- Blowfish theme adds `<html class="dark">` in dark mode
- Detects this to determine theme
- Uses `dark_tritanopia` / `light_tritanopia` themes (colorblind-friendly)

**Result**:
- Page load: Loads Giscus with current theme state
- Dark mode toggle click: Real-time Giscus theme change

##### 3. **Unified Comments Across Languages**
```go
const discussionId = '{{ .File.Dir | replaceRE "^content/" "" | replaceRE "/$" "" }}';
```
- Uses file directory path as Discussion ID
- `content/posts/subscription_alert/index.ko.md` → `posts/subscription_alert`
- `content/posts/subscription_alert/index.en.md` → `posts/subscription_alert`
- **Same ID means Korean/English versions share the same comments**

**Result**:
- Comments written on Korean post
- Also display on English post
- Separate Discussions created per post

##### 4. **Real-time Theme Change Detection**
```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      setTimeout(updateGiscusTheme, 100);
    }
  });
});
```
- `MutationObserver` detects HTML class changes
- Immediately detects dark mode toggle clicks
- Sends theme change command to Giscus iframe via `postMessage`

#### Testing Method

```bash
# 1. Run local server
hugo server -D

# 2. Verify in browser
http://localhost:1313/posts/subscription_alert/
```

**Test Items**:
1. ✅ Page load displays Giscus with current theme (light/dark)
2. ✅ Dark mode toggle click immediately changes Giscus theme
3. ✅ Language switch (ko → en) changes Giscus language
4. ✅ Korean/English pages display same comments

#### Changing Theme Options

To use different themes, modify the `getGiscusTheme()` function:

```javascript
// Basic theme
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark' : 'light';
}

// High contrast theme
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark_high_contrast' : 'light_high_contrast';
}

// GitHub style theme
function getGiscusTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark_dimmed' : 'light';
}
```

**Available themes**:
- `light` / `dark`
- `light_high_contrast` / `dark_high_contrast`
- `light_tritanopia` / `dark_tritanopia` (colorblind-friendly)
- `dark_dimmed`
- `transparent_dark`
- `preferred_color_scheme` (follows system settings)

#### Static Theme Configuration (Simple Method)

If dynamic changes aren't needed, you can configure statically:

```html
<script src="https://giscus.app/client.js"
        data-repo="0AndWild/0AndWild.github.io"
        data-repo-id="R_kgDOxxxxxxxx"
        data-category="General"
        data-category-id="DIC_kwDOxxxxxxxx"
        data-mapping="pathname"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
</script>
```

**Pros**: Simple
**Cons**: No real-time theme changes, comments separated by language

### Hide Comments on Specific Posts

To hide comments on specific posts only, add to that post's front matter:

```yaml
---
title: "Post Without Comments"
showComments: false  # Hide comments on this post only
---
```

### Separate Comments by Category

To use different Discussion categories for posts in different categories:

```html
<!-- Conditional category configuration -->
<script>
  const category = {{ if in .Params.categories "Tutorial" }}
    "DIC_kwDOxxxxTutorial"
  {{ else }}
    "DIC_kwDOxxxxGeneral"
  {{ end }};
</script>

<script src="https://giscus.app/client.js"
        ...
        data-category-id="{{ category }}"
        ...>
</script>
```

---

## Troubleshooting

### Comment Widget Not Displaying

#### Cause 1: Discussions Not Enabled
```bash
Solution: GitHub repository → Settings → Check Discussions
```

#### Cause 2: Giscus App Not Installed
```bash
Solution: Install at https://github.com/apps/giscus
```

#### Cause 3: Repository ID Error
```bash
Solution: Regenerate code at giscus.app
```

#### Cause 4: showComments Setting Missing
```toml
# config/_default/params.toml
[article]
  showComments = true  # Verify
```

### Only Login Button Shows, Can't Comment

#### Cause: GitHub OAuth Authorization Needed
```bash
1. Click "Sign in with GitHub"
2. Authorize OAuth permissions
3. Redirect to repository
4. Can write comments
```

### Comments Not Saving

#### Cause: Repository Permission Issue
```bash
Check:
1. Is the repository Public?
2. Is the repository included in Giscus App permissions?
3. Does the Discussion category exist?
```

### Dark Mode Not Syncing

#### Solution: Add JavaScript Sync Code
Refer to "Advanced Configuration > Automatic Dark Mode Switching" above

---

## Managing Giscus

### Comment Management

#### Manage via GitHub Discussions
```bash
1. GitHub repository → Discussions tab
2. Click the relevant Discussion
3. Management actions:
   - Edit comment (own comments only)
   - Delete comment (admin)
   - Block user (admin)
   - Lock Discussion (admin)
```

### Handling Spam Comments

```bash
1. Find spam comment in GitHub Discussions
2. ... menu next to comment → "Delete"
3. Block user: Profile → Block user
```

### Notification Settings

#### Receive Comment Notifications via GitHub
```bash
1. GitHub → Settings → Notifications
2. Add repository to Watching
3. Configure email notifications
```

#### Receive Notifications for Specific Discussions Only
```bash
1. Discussions tab → Relevant Discussion
2. "Subscribe" button on right
3. Select "Notify me"
```

---

## Statistics and Analytics

### View Comment Statistics

In GitHub Discussions:
```bash
1. Discussions tab
2. Check number of Discussions by category
3. Check comment count for each Discussion
```

### Utilize GitHub Insights

```bash
GitHub repository → Insights → Community
→ Check Discussions activity
```

---

## Cost and Limitations

### Cost
**Completely Free**
- Only need a GitHub account
- Unlimited comments within repository size limits

### Limitations

#### GitHub API Rate Limit
- 60 requests/hour (unauthenticated)
- 5,000 requests/hour (authenticated)
- Giscus is optimized with caching, so no issues

#### Repository Size
- GitHub Free: 1GB per repository
- Text comments alone won't reach the limit

#### Discussions Limit
- None (unlimited)

---

## Alternative Comparisons

### Giscus vs Utterances

| Item | Giscus | Utterances |
|------|--------|------------|
| Backend | Discussions | Issues |
| Reactions | ✅ | ❌ |
| Nested Replies | Nested support | Flat |
| Recommendation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Conclusion**: Giscus is recommended

### Giscus vs Disqus

| Item | Giscus | Disqus |
|------|--------|--------|
| Cost | Free | Free (with ads) |
| Ads | ❌ | ✅ |
| Anonymous Comments | ❌ | ✅ (Guest) |
| Markdown | ✅ | ⚠️ |
| Data Ownership | ✅ | ❌ |
| Recommendation | Developer blogs | General blogs |

---

## Migration Guide

### Utterances → Giscus

```bash
1. Convert GitHub Issues to Discussions
   - Manual work required (no automation)
   - Or leave Issues as-is and start fresh with Giscus

2. Replace comments.html file
   - Delete Utterances code
   - Add Giscus code

3. Deploy
```

### Disqus → Giscus

```bash
1. Export Disqus data (XML)
2. Manual migration to GitHub Discussions
   - No automation tools available
   - Need to write custom script
   - Or starting fresh recommended
```

---

## Additional Resources

### Official Documentation
- [Giscus Official Site](https://giscus.app)
- [Giscus GitHub](https://github.com/giscus/giscus)

### Community
- [Giscus Discussions](https://github.com/giscus/giscus/discussions)
- [Blowfish Documentation](https://blowfish.page/docs/)

---

## Checklist

Installation completion checklist:

- [ ] GitHub Discussions enabled
- [ ] Giscus App installed
- [ ] Created `layouts/partials/comments.html`
- [ ] Inserted Giscus code (with your own IDs)
- [ ] Set `showComments = true` in `params.toml`
- [ ] Local testing complete
- [ ] Pushed to GitHub
- [ ] Verified on deployed site
- [ ] Wrote test comment
- [ ] Verified creation in GitHub Discussions

---

## Conclusion

Giscus is the most suitable comment system for Hugo/GitHub Pages blogs:

### Summary of Advantages
✅ Completely free
✅ Simple setup (10 minutes)
✅ No server required
✅ Full Markdown support
✅ GitHub integration
✅ Data ownership

### Disadvantages
❌ GitHub account required (no anonymous comments)
❌ Best for technical blogs (barrier for general users)

### Recommended For
- ✅ Developer blogs
- ✅ Technical documentation
- ✅ Open source projects
