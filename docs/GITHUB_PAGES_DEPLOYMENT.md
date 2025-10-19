# GitHub Pages Deployment Guide

**Miyabi Landing Page Deployment to GitHub Pages**

**Last Updated**: 2025-10-20
**Status**: Ready for deployment

---

## 📋 Overview

This guide explains how to deploy the Miyabi landing page (`docs/landing.html`) to GitHub Pages for public access.

**Landing Page**: `docs/landing.html` (689 lines, responsive design)
**Target URL**: `https://shunsukehayashi.github.io/Miyabi/` (or custom domain)

---

## 🚀 Quick Deployment (Current Private Repository)

### Option 1: Deploy from `docs/` directory (Recommended)

**Advantages**:
- No file reorganization needed
- Keeps landing page in `docs/` folder
- Clean separation from source code

**Steps**:

1. **Copy landing.html to index.html** (GitHub Pages looks for index.html):
   ```bash
   cp docs/landing.html docs/index.html
   git add docs/index.html
   git commit -m "docs(pages): add index.html for GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages** (via GitHub web interface):
   - Go to: https://github.com/ShunsukeHayashi/Miyabi/settings/pages
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/docs`
   - Click **Save**

3. **Wait for deployment** (usually 1-2 minutes):
   - GitHub Actions will automatically build and deploy
   - Check deployment status: https://github.com/ShunsukeHayashi/Miyabi/deployments

4. **Verify deployment**:
   - Visit: https://shunsukehayashi.github.io/Miyabi/
   - Check all links, images, and responsive design

### Option 2: Deploy from root directory

**Advantages**:
- Simpler URL structure
- No `/docs` in URL

**Steps**:

1. **Copy landing.html to root**:
   ```bash
   cp docs/landing.html index.html
   git add index.html
   git commit -m "docs(pages): add index.html for GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`

---

## 🌐 Public Repository Deployment (Future)

When creating the public `miyabi-release` repository (see [RELEASE_STRATEGY.md](RELEASE_STRATEGY.md)):

### Repository Structure

```
miyabi-release/
├── index.html              # Landing page (copy of docs/landing.html)
├── README.md               # Public README
├── LICENSE                 # Apache 2.0 + proprietary notice
├── NOTICE                  # Attribution
├── docs/
│   ├── GETTING_STARTED.md
│   ├── CLI_USAGE_EXAMPLES.md
│   ├── TROUBLESHOOTING.md
│   ├── EULA.md
│   ├── PRIVACY.md
│   └── TERMS_OF_SERVICE.md
├── releases/               # Binary downloads
│   ├── v0.1.1/
│   │   ├── miyabi-macos-arm64
│   │   ├── miyabi-macos-x64
│   │   ├── miyabi-linux-x64
│   │   └── checksums.txt
│   └── latest/
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

### Deployment Steps

1. **Create `miyabi-release` repository**:
   ```bash
   # On GitHub
   # New repository: miyabi-release
   # Description: Miyabi CLI - Binary Distribution
   # Public repository
   # Initialize with README
   ```

2. **Copy landing page**:
   ```bash
   git clone https://github.com/ShunsukeHayashi/miyabi-release.git
   cd miyabi-release
   cp ../Miyabi/docs/landing.html index.html
   git add index.html
   git commit -m "docs: add landing page"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`

4. **Configure custom domain** (optional):
   - Domain: `miyabi.dev` or `cli.miyabi.dev`
   - Add CNAME record in DNS settings
   - Add `CNAME` file to repository root

---

## 🎨 Customization

### Update Landing Page Content

**File**: `docs/landing.html` (in private repository)

**Key sections to update**:

1. **Hero Section** (line 130-150):
   ```html
   <h1>Miyabi</h1>
   <p class="hero-tagline">10-15分でPRが完成。<br>レビューして、マージするだけ。</p>
   ```

2. **Installation Command** (line 155-160):
   ```html
   <div class="install-command">
       <code>$ cargo install miyabi-cli</code>
       <button class="copy-button" onclick="copyInstallCommand()">📋 Copy</button>
   </div>
   ```

3. **Stats Section** (line 175-215):
   ```html
   <div class="stat-number">8.4MB</div>
   <div class="stat-label">Single Binary</div>
   ```

4. **Features Section** (line 230-350):
   - 6 feature cards with icons and descriptions

5. **Links Section** (line 680-750):
   ```html
   <a href="https://github.com/ShunsukeHayashi/Miyabi" class="btn btn-primary">
       View on GitHub
   </a>
   ```

**After updates**:
```bash
# Copy to index.html and deploy
cp docs/landing.html docs/index.html
git add docs/landing.html docs/index.html
git commit -m "docs(landing): update landing page content"
git push origin main
```

---

## 🔍 Verification Checklist

After deployment, verify the following:

### Visual Checks
- [ ] Hero section displays correctly
- [ ] Stats section shows accurate numbers
- [ ] All 6 feature cards render properly
- [ ] Installation command is correct
- [ ] CTA buttons work
- [ ] Footer links are functional

### Responsive Design
- [ ] Desktop view (1920px)
- [ ] Laptop view (1366px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)

### Functionality
- [ ] Copy button works for install command
- [ ] Smooth scroll to sections
- [ ] GitHub link opens correctly
- [ ] Discord link opens correctly
- [ ] All external links work

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Animations are smooth
- [ ] No console errors
- [ ] No broken images

### SEO
- [ ] `<title>` tag is descriptive
- [ ] `<meta>` description is present
- [ ] Open Graph tags for social sharing
- [ ] Favicon is present

---

## 📊 Analytics (Optional)

### Google Analytics Setup

Add to `<head>` section of `landing.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Replace `G-XXXXXXXXXX`** with your Google Analytics tracking ID.

### GitHub Pages Default Analytics

GitHub Pages automatically provides basic traffic analytics:
- Repository → Insights → Traffic
- View unique visitors and page views

---

## 🔧 Troubleshooting

### Issue: 404 Page Not Found

**Cause**: GitHub Pages can't find `index.html`

**Solution**:
1. Verify `index.html` or `docs/index.html` exists
2. Check GitHub Pages settings (correct branch and folder)
3. Wait 1-2 minutes for deployment to complete
4. Clear browser cache and retry

### Issue: CSS Not Loading

**Cause**: Relative paths are incorrect

**Solution**:
1. Check CSS is inlined in `<style>` tag (current implementation)
2. If using external CSS, verify path: `/style.css` or `./style.css`
3. Check browser console for 404 errors

### Issue: Links Don't Work

**Cause**: Incorrect absolute URLs

**Solution**:
1. For same-domain links, use relative paths: `./docs/GETTING_STARTED.md`
2. For external links, use full URLs: `https://github.com/ShunsukeHayashi/Miyabi`
3. Test all links after deployment

### Issue: Page Not Updating

**Cause**: Browser cache or GitHub Pages cache

**Solution**:
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Open in incognito/private mode
3. Wait 5-10 minutes for GitHub Pages cache to clear
4. Check deployment status: Repository → Actions

---

## 🌐 Custom Domain Setup (Optional)

### Step 1: Purchase Domain

Recommended registrars:
- Namecheap: https://www.namecheap.com/
- Google Domains: https://domains.google/
- Cloudflare Registrar: https://www.cloudflare.com/products/registrar/

Example domains:
- `miyabi.dev`
- `cli.miyabi.dev`
- `getmiyabi.com`

### Step 2: Configure DNS

Add CNAME record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` or `cli` | `shunsukehayashi.github.io` | 3600 |

Add A records (for apex domain):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `185.199.108.153` | 3600 |
| A | `@` | `185.199.109.153` | 3600 |
| A | `@` | `185.199.110.153` | 3600 |
| A | `@` | `185.199.111.153` | 3600 |

### Step 3: Add CNAME File

Create `CNAME` file in repository root:

```bash
echo "miyabi.dev" > CNAME
git add CNAME
git commit -m "docs(pages): add custom domain"
git push origin main
```

### Step 4: Configure GitHub Pages

- Repository → Settings → Pages
- Custom domain: `miyabi.dev`
- Enforce HTTPS: ✓ (check after DNS propagation)

### Step 5: Verify

Wait 24-48 hours for DNS propagation, then verify:
- Visit: https://miyabi.dev
- Check HTTPS certificate is valid
- Test all links and functionality

---

## 📅 Deployment History

| Date | Version | Changes | Status |
|------|---------|---------|--------|
| 2025-10-20 | v1.0.0 | Initial landing page creation | ⏳ Pending |
| TBD | v1.1.0 | Custom domain setup | ⏳ Planned |
| TBD | v1.2.0 | Analytics integration | ⏳ Planned |

---

## 📞 Support

**Issues with deployment?**

- GitHub Pages Status: https://www.githubstatus.com/
- GitHub Pages Docs: https://docs.github.com/en/pages
- Discord Community: https://discord.gg/Urx8547abS
- Email Support: support@miyabi.dev

---

## ✅ Post-Deployment Tasks

After successful deployment:

1. **Update README.md** with landing page URL:
   ```markdown
   🌐 **Landing Page**: https://shunsukehayashi.github.io/Miyabi/
   ```

2. **Share on social media**:
   - X (Twitter): @The_AGI_WAY
   - Discord: Miyabi Community
   - GitHub README

3. **Monitor traffic**:
   - Check GitHub Pages analytics
   - Monitor Google Analytics (if enabled)

4. **Gather feedback**:
   - Ask community for feedback on Discord
   - Create GitHub Discussion for landing page feedback

5. **Iterate and improve**:
   - Update content based on feedback
   - Add new features/sections as needed
   - Keep stats and links up to date

---

**© 2025 Shunsuke Hayashi. All rights reserved.**

**Version**: 1.0.0
**Last Updated**: 2025-10-20
