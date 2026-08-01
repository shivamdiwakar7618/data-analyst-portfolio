# Shivam Diwakar — Data Analyst Portfolio

A premium, dark-themed, dashboard-inspired portfolio website for a Data Analyst / Power BI Developer, built entirely with **HTML5, CSS3, and Vanilla JavaScript (ES6+)** — no frameworks, no build step, no dependencies.

---

## Overview

This project presents a data analyst's skills, projects, certifications and contact details in a single, fully responsive page designed to look and feel like the dashboards the analyst actually builds: glassmorphism cards, a blue-to-cyan gradient accent system, animated KPI counters, and live-style charts (line, donut, horizontal bar, column) rendered in pure SVG/CSS and animated with Vanilla JS.

---

## Features

- **Sticky navigation** with active-section highlighting and a mobile hamburger menu
- **Hero section** with animated canvas particle background, a typewriter effect cycling through roles, and floating "live widget" glass cards
- **About section** with professional summary, education, and quick-info cards
- **Skills section** with animated progress bars for 10 core tools
- **Dashboard section** styled like Power BI: animated KPI counters plus line, donut, horizontal bar, and column charts that draw in on scroll
- **Projects section** with 5 full case-study cards (image, description, tools used, key insight, GitHub + Live Demo links)
- **Certificates section** with hover-reveal detail overlays
- **Contact section** with a fully validated form (inline errors, success/error status messaging) plus direct contact details
- **Dark/Light theme toggle**, preference saved to `localStorage`
- **Scroll reveal animations** via `IntersectionObserver`
- **Scroll progress bar**, **back-to-top button**, **loading screen**
- Debounced/throttled scroll & resize handlers for performance
- Accessible: semantic HTML, ARIA attributes, visible focus states, `prefers-reduced-motion` support
- SEO-friendly meta tags (title, description, keywords, Open Graph)

---

## Folder Structure

```
portfolio/
├── index.html          # Page markup — all sections
├── style.css            # Design tokens, components, animations, responsive rules
├── script.js            # All interactivity (vanilla JS, no dependencies)
├── images/              # Profile photo, project screenshots, certificate scans
│   ├── profile-placeholder.jpg
│   ├── project-ecommerce.jpg
│   ├── project-hr.jpg
│   ├── project-healthcare.jpg
│   ├── project-ipl.jpg
│   ├── project-blinkit.jpg
│   ├── cert-powerbi.jpg
│   ├── cert-sql.jpg
│   ├── cert-python.jpg
│   ├── cert-excel.jpg
│   └── favicon.png
└── assets/
    └── resume.pdf        # Downloadable resume linked from the hero section
```

> **Note:** the `images/` and `assets/` files referenced in `index.html` are placeholders. Add your own photo, project screenshots, certificate scans, favicon, and resume PDF with the exact filenames above (or update the paths in `index.html` to match your files).

---

## How to Run Locally

No build tools, package manager, or installation required.

**Option 1 — Open directly**
Double-click `index.html`, or open it from your browser with `File > Open`.

**Option 2 — Local server (recommended)**
Some browsers restrict certain features (like `fetch` or module loading) when opened directly from the filesystem. A simple local server avoids that:

```bash
# Python 3
cd portfolio
python3 -m http.server 8000
# then visit http://localhost:8000

# Node.js (no install needed, via npx)
cd portfolio
npx serve .

# VS Code
# Install the "Live Server" extension, right-click index.html → "Open with Live Server"
```

---

## How to Deploy on GitHub Pages

1. Create a new GitHub repository (e.g. `portfolio`).
2. Push this project's files to the repository root:
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Initial commit: data analyst portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/portfolio.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, select **Deploy from a branch**.
5. Choose the **main** branch and the **/ (root)** folder, then click **Save**.
6. Wait a minute for GitHub to build the site — it will publish at:
   ```
   https://<your-username>.github.io/portfolio/
   ```
7. To use a custom domain, add a `CNAME` file to the repo root with your domain name and configure your DNS provider to point to GitHub Pages (see GitHub's [custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)).

The contact form currently **simulates** a submission (no backend is wired up). Before going live, connect it to a real endpoint such as [Formspree](https://formspree.io), [EmailJS](https://www.emailjs.com), or your own API, by replacing the simulated `setTimeout` call in the `initContactForm()` function inside `script.js` with an actual `fetch()` request.

---

## Browser Compatibility

Tested against and built using only standard, widely-supported web platform features:

| Browser              | Support |
|----------------------|---------|
| Chrome / Edge (latest 2 versions) | ✅ Full support |
| Firefox (latest 2 versions)       | ✅ Full support |
| Safari (latest 2 versions, macOS & iOS) | ✅ Full support |
| Samsung Internet                  | ✅ Full support |
| Internet Explorer 11              | ❌ Not supported (uses CSS custom properties, `backdrop-filter`, ES6+ syntax, `IntersectionObserver`) |

**Progressive enhancement notes:**
- If `IntersectionObserver` is unavailable, scroll-reveal, counters, skill bars, and chart animations gracefully fall back to showing final states immediately instead of failing silently.
- If `localStorage` is blocked (e.g. private browsing with storage disabled), the theme toggle still works for the current session — it just won't persist across reloads.
- `prefers-reduced-motion: reduce` disables the typing effect, particle canvas, and all CSS transitions/animations for users who have that OS-level preference set.

---

## Credits

Design and build: Senior Frontend Developer & UI/UX Designer brief — dark professional theme, blue gradient accents, glassmorphism, dashboard-inspired UI.
