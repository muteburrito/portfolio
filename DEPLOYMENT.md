# Deployment Runbook (Manual)

This project currently uses manual deployment to `/var/www/portfolio`.
Use this document until we add automated deployment.

## Prerequisites

- Server user: `chinmay`
- Web root: `/var/www/portfolio`
- Nginx serves files from this directory
- Repository remote is configured for `origin`

## One-Time Permissions Fix (if needed)

```bash
sudo chown -R chinmay:chinmay /var/www/portfolio
```

## Standard Update Flow

```bash
cd /var/www/portfolio
git pull origin main
sudo find /var/www/portfolio -type d -exec chmod 755 {} \;
sudo find /var/www/portfolio -type f -exec chmod 644 {} \;
sudo nginx -t && sudo systemctl reload nginx
```

## Release Step For Cache Safety

When you deploy any frontend change, bump the build version in `index.html`:

- `meta[name="build-version"]`
- `styles.css?v=...`
- `js/main.js?v=...`

Example: change `2026-04-03-1` to `2026-04-03-2`.

This forces browsers to fetch the latest assets and partials.

## Why This Matters

The site is modular (HTML partials + JS modules + CSS modules). If a browser reuses old cached files while loading new HTML, sections can render incorrectly. Versioned URLs avoid mixed old/new bundles.

## Optional Nginx Cache Policy (Recommended)

Use short/no-cache for HTML and long-cache for versioned static assets.

```nginx
# HTML should revalidate often
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# Versioned assets can be cached aggressively
location ~* \.(css|js)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location ~* \.(png|jpg|jpeg|gif|svg|webp|ico)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

After any Nginx config changes:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Quick Validation Checklist

Run these after deployment:

```bash
git -C /var/www/portfolio rev-parse --short HEAD
curl -I https://your-domain.example | head -n 20
curl -I https://your-domain.example/styles.css?v=2026-04-03-1 | head -n 20
```

Then test in browser:

- Open site in normal window.
- Hard refresh once (`Ctrl+Shift+R`).
- Verify `Location` section loads map, cards, and clock.
- Check on mobile once.
