# Portfolio Web App

A modular, single-page portfolio web app for Chinmay Kulkarni, designed with a platform-engineering/HUD-inspired visual language.

The site is static (HTML/CSS/JS), but architected like a small frontend app:

- HTML is composed from partials at runtime.
- CSS is split by responsibility and imported through a single entry file.
- JS is split into focused ES modules.
- Release versioning is used for cache-safe deployments.

## Highlights

- HUD-style UI with animated background, scanline effects, and system-like panel chrome.
- Section-router UX (single active section at a time) instead of long-page scroll navigation.
- Mobile-first responsive behavior and touch-friendly controls.
- Interactive location map (Leaflet) with:
  - Expand/collapse mode
  - Device geolocation with accuracy feedback
  - Manual pin placement mode
  - Distance-to-Pune calculation
  - Reset map action
- Homelab animated flow visualization.
- Performance-conscious static deployment (Nginx + optional CDN cache).

## Tech Stack

- HTML5
- CSS3 (modular files + keyframe animations)
- Vanilla JavaScript (ES modules)
- Leaflet `1.9.4` (map rendering)
- Carto dark tile layer
- Google Fonts:
  - Chakra Petch
  - IBM Plex Mono

## Project Structure

```text
.
├── ChinmayResume.pdf
├── DEPLOYMENT.md
├── README.md
├── index.html
├── styles.css
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── sections.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── main.js
│   └── modules/
│       ├── htmlLoader.js
│       ├── init.js
│       ├── reveal.js
│       ├── sectionRouter.js
│       ├── tilt.js
│       ├── typewriter.js
│       ├── navigation.js      # legacy helper, not part of current bootstrap
│       └── progress.js        # legacy helper, not part of current bootstrap
└── partials/
    ├── topbar.html
    ├── home.html
    ├── profile.html
    ├── outcomes.html
    ├── work.html
    ├── homelab.html
    ├── about.html
    ├── stack.html
    ├── journey.html
    ├── location.html
    ├── connect.html
    └── footer.html
```

## Architecture

### 1. HTML Composition Layer

`index.html` is an app shell. Content is loaded from partials using `data-include` placeholders:

- Top bar, each section, and footer live in separate files under `partials/`.
- `js/modules/htmlLoader.js` fetches each partial and replaces the placeholder node.
- Partial fetch URLs are versioned using the build version metadata.

Why this matters:

- Easier content editing by section.
- Cleaner diffs and modular ownership.

### 2. Styling System

`styles.css` imports seven CSS modules:

- `tokens.css`: design tokens (colors, radius, shadows)
- `base.css`: global resets and base document styles
- `layout.css`: page layout primitives (topbar/main/footer)
- `components.css`: reusable component visuals
- `sections.css`: section-specific styles (including map + homelab)
- `animations.css`: all keyframes and animation primitives
- `responsive.css`: breakpoint and reduced-motion behavior

### 3. JS Runtime

Bootstrap flow:

1. `js/main.js` calls `loadHtmlPartials()`
2. Then calls `initSiteInteractions()`

Main runtime module (`init.js`) wires:

- Section routing + breadcrumb + menu state
- Reveal/intersection animations
- Hero typewriter command animation
- Tilt card interaction
- Location clock and map subsystem

## Key JS Modules

### `js/modules/htmlLoader.js`

- Finds all `[data-include]` placeholders.
- Appends `?v=<build-version>` to include URLs.
- Fetches with `{ cache: 'no-store' }`.
- Removes failed placeholders to avoid broken UI fragments.

### `js/modules/sectionRouter.js`

- Manages section activation by id/hash.
- Keeps exactly one section visible (`section-active`).
- Updates breadcrumb title and shell command text.
- Controls hamburger drawer open/close.
- Runs CLI-like enter/exit transitions for section switches.

### `js/modules/reveal.js`

- Uses `IntersectionObserver` to reveal elements.
- Triggers scanline pass (`scan-active`) on reveal.
- Animates metric counters once when cards enter viewport.

### `js/modules/typewriter.js`

- Rotates platform/devops command samples with type/erase loop.

### `js/modules/tilt.js`

- Mouse-move tilt effect for cards marked with `.tilt`.

### `js/modules/init.js` (Location map subsystem)

- Initializes Leaflet map centered at Pune.
- Adds branded base location marker.
- Supports map expand/collapse state.
- Geolocation flow:
  - multi-attempt high-accuracy reads
  - shows accuracy in meters
  - warns on coarse fixes
- Manual pin mode for user-corrected location.
- Computes distance from user location to Pune.
- Draws connector line between user pin and base location.
- Reset action clears user overlays and restores default view.

## Runtime Dependencies (CDN)

- Leaflet CSS/JS from jsDelivr
- Google Fonts from `fonts.googleapis.com` / `fonts.gstatic.com`

If CDN access is restricted, map/fonts should be vendored locally.

## Local Development

Because the app loads partials via `fetch`, do not open using `file://`.
Use a local HTTP server.

Example options:

```bash
# Option 1: Python
python3 -m http.server 5500

# Option 2: Node (if installed)
npx serve . -l 5500
```

Then open:

- `http://127.0.0.1:5500`

## Build Version and Cache Strategy

`index.html` includes:

- `<meta name="build-version" content="..." />`
- `styles.css?v=...`
- `js/main.js?v=...`

`htmlLoader.js` also appends this version to partial URLs.

Release rule:

- Bump build version on every frontend deploy.

This prevents mixed old/new asset states in browser/CDN caches.

## Deployment

Manual deployment runbook is in `DEPLOYMENT.md`.

Typical update flow:

```bash
cd /var/www/portfolio
git pull origin main
sudo find /var/www/portfolio -type d -exec chmod 755 {} \;
sudo find /var/www/portfolio -type f -exec chmod 644 {} \;
sudo nginx -t && sudo systemctl reload nginx
```

## Troubleshooting

### 1. Site updates but section UI looks broken

Likely cache mismatch.

- Bump build version in `index.html`
- Purge CDN cache (Cloudflare)
- Hard refresh browser (`Ctrl+Shift+R`)

### 2. Location distance looks wrong

- Device geolocation can be coarse on desktop/Wi-Fi.
- Use `Set Location Manually` in the Location section for precise pin placement.

### 3. Map/partials fail locally

- Ensure app is served over HTTP, not file protocol.

### 4. Geolocation denied

- Browser permission denied or insecure context.
- Use HTTPS and allow location permission.

## Accessibility and UX Notes

- Reduced motion mode is respected via `prefers-reduced-motion` media query.
- Touch target sizes are tuned for mobile interaction.
- Menu and routing are keyboard-usable.
- Dynamic labels (`aria-live`) are used for status messaging.

## Future Improvements

- Remove or archive unused legacy modules (`navigation.js`, `progress.js`).
- Add lightweight automated deploy script (`release.sh`) for version bump + deploy checks.
- Add CI checks for accidental stale build-version mismatches.
- Add optional smoke test for partial loading and section routing.
