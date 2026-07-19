# bryllim.com Aesthetic — Definitive Rebuild Spec

Single source of truth for restyling the public frontend of this Vite + React 19 + TS portfolio. Backend (D1/R2/admin, `/api/*`, `src/admin/**`) is frozen — do not touch it. The data model in `src/types.ts` is authoritative; the design adapts to it, not the reverse.

Content model reminder (from `src/types.ts`, unchanged): `Profile{name,tagline,bio,email,location,avatar_url,available_for_hire,socials[],stats[]}`, `Category{slug,name,sort_order}`, `ProjectListItem{...,category_slug,category_name}`, `ProjectDetail extends ProjectListItem {body_markdown, images[]}`, `ResumeEntry{period,role,org,location,sort_order}` (flat, NOT nested), `HomeData{profile,categories,projects,resume}`. Categories are the owner's three: **NetSuite**, **Website Creation**, **Workflow Automation**.

---

## 1) Design tokens

Monochrome only. No hue anywhere. Emphasis = inversion (`--accent` bg + `--accent-contrast` text). All colors are CSS custom properties so the same rules flip by theme.

### 1.1 Fonts — four families, all self-hosted (no runtime CDN)

Already installed: `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`. Add two.

```bash
npm i @fontsource-variable/source-serif-4
```

Geist Pixel has no fontsource package. Download once into the repo:

```bash
mkdir -p public/fonts
curl -L -o public/fonts/GeistPixel-Square.woff2 \
  https://cdn.jsdelivr.net/gh/vercel/geist-pixel-font@main/fonts/webfonts/GeistPixel-Square.woff2
```

`src/main.tsx` — add imports (keep existing order, CSS last):

```ts
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/source-serif-4";
import "./index.css";
```

Role mapping (this is the signature "monospace headings" read — display is actually the pixel bitmap face, NOT the mono face):

| Role | Family | Used for |
|---|---|---|
| **Display / pixel** | Geist Pixel → JetBrains Mono fallback | brand wordmark, hero H1 name, numbered section labels, big stat values, card titles |
| **Mono / chrome** | JetBrains Mono Variable | nav labels, eyebrows, dates, meta, tags, kbd chips, social links, all uppercase labels |
| **Sans / body** | Inter Variable | bios, excerpts, paragraph copy, résumé role/org text |
| **Serif / prose** | Source Serif 4 Variable | project-detail article body, pull quotes |

`@font-face` for the pixel font (top of `src/index.css`):

```css
@font-face {
  font-family: "Geist Pixel";
  src: url("/fonts/GeistPixel-Square.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
```

### 1.2 Full token block — replace the top of `src/index.css`

```css
:root {
  /* families */
  --font-pixel: "Geist Pixel", "JetBrains Mono Variable", ui-monospace, monospace;
  --font-mono:  "JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace;
  --font-sans:  "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-serif: "Source Serif 4 Variable", Georgia, "Times New Roman", serif;

  /* grayscale ramp (light) */
  --g50:  #fafafa;
  --g100: #f5f5f5;
  --g200: #e9e9e9;
  --g300: #d4d4d4;
  --g400: #a3a3a3;
  --g500: #737373;
  --g600: #525252;
  --g700: #404040;
  --g800: #262626;
  --g900: #171717;
  --g950: #0a0a0a;

  /* semantic (light) */
  --bg:              #ffffff;
  --surface:         #fafafa;   /* g50 — raised chips */
  --surface-2:       #f5f5f5;   /* g100 — active/inset */
  --text:            #0a0a0a;   /* ink */
  --muted:           #737373;   /* g500 — body-muted, nav */
  --faint:           #a3a3a3;   /* g400 — eyebrows, labels, dividers text */
  --line:            #e9e9e9;   /* g200 — hairlines */
  --line-strong:     #d4d4d4;   /* g300 */
  --accent:          #0a0a0a;   /* inversion bg */
  --accent-contrast: #ffffff;   /* inversion text */
  --dot:             rgba(10, 10, 10, 0.9);   /* halftone dot color */
  --sel-bg:          #0a0a0a;
  --sel-fg:          #fafafa;

  /* metrics */
  --sidebar-w: 224px;
  --content-max: 640px;         /* the ~624px reading measure */
  --hairline: 1px;
  --pad-x: 32px;                /* sidebar + section side padding */

  /* radii */
  --r-sm: 0.25rem;   /* 4px */
  --r-md: 0.375rem;  /* 6px */
  --r-lg: 0.5rem;    /* 8px */
  --r-xl: 0.75rem;   /* 12px  card cover, app icons */
  --r-2xl: 1rem;     /* 16px  detail hero */
  --r-full: 9999px;

  color-scheme: light;
}

/* dark: invert the ramp, keep the same semantic names */
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark;
  --g50:#18181b; --g100:#1f1f23; --g200:#2a2a30; --g300:#3a3a42; --g400:#6d6d72;
  --g500:#a6a6ad; --g600:#c4c4c9; --g700:#d4d4d8; --g800:#e4e4e7; --g900:#f0f0f2; --g950:#fafafa;
  --bg:#0c0c0f; --surface:#18181b; --surface-2:#1f1f23; --text:#f4f4f5;
  --muted:#a6a6ad; --faint:#6d6d72; --line:#2a2a30; --line-strong:#3a3a42;
  --accent:#f4f4f5; --accent-contrast:#0a0a0a; --dot:rgba(244,244,245,0.42);
  --sel-bg:#fafafa; --sel-fg:#0a0a0a;
}}

/* explicit dark toggle mirrors the media block */
:root[data-theme="dark"] { color-scheme: dark;
  --g50:#18181b; --g100:#1f1f23; --g200:#2a2a30; --g300:#3a3a42; --g400:#6d6d72;
  --g500:#a6a6ad; --g600:#c4c4c9; --g700:#d4d4d8; --g800:#e4e4e7; --g900:#f0f0f2; --g950:#fafafa;
  --bg:#0c0c0f; --surface:#18181b; --surface-2:#1f1f23; --text:#f4f4f5;
  --muted:#a6a6ad; --faint:#6d6d72; --line:#2a2a30; --line-strong:#3a3a42;
  --accent:#f4f4f5; --accent-contrast:#0a0a0a; --dot:rgba(244,244,245,0.42);
  --sel-bg:#fafafa; --sel-fg:#0a0a0a;
}
:root[data-theme="light"] { color-scheme: light; } /* falls through to :root defaults */

::selection { background: var(--sel-bg); color: var(--sel-fg); }

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

Note: the existing theme toggle keeps `data-theme="dark"|"light"` and removes the attribute for "system" — leave that JS as-is; it drives the blocks above.

### 1.3 Type scale (exact)

| Token / use | Family | Size | Weight | Case / tracking | Color |
|---|---|---|---|---|---|
| Brand wordmark (sidebar) | pixel | 15px | 400 | none | `--text` |
| Hero H1 name | pixel | `clamp(1.875rem, 4vw, 2.6rem)` (30→41.6px) | 400 | tracking `-0.045em`, `line-height:1` | `--text` |
| Numbered section label `01 — projects` | pixel | 14px (0.875rem) | 400 | lowercase name | `--faint` |
| Stat value `200K+` | pixel | 26px | 400 | `line-height:1` | `--text` |
| Card title (h3) | pixel | 16px (1rem) | 400 | `line-height:1.15` | `--text` |
| Eyebrow / micro-label | mono | 11px | 500 | UPPERCASE, tracking `0.08em` | `--faint` |
| Nav link | mono | 11px | 400 | UPPERCASE, tracking `0.06em` | `--muted` → `--text` hover |
| kbd / badge chip | mono | 10px | 500 | UPPERCASE, tracking `0.05em` | `--muted` on `--surface` |
| Meta line (detail) `JUN 6, 2026 · 2 MIN READ` | mono | 11px | 500 | UPPERCASE, tracking `0.08em` | `--faint` |
| Body copy | sans | 15px | 400 | tracking `-0.01em`, lh 1.6 | `--text` |
| Muted body / excerpt | sans | 14px | 400 | lh 1.5 | `--muted` |
| Post/list heading (h3) | sans | 15px | 500 | — | `--text` |
| Detail H1 title | sans | `clamp(1.75rem,3.2vw,2.25rem)` | 600 | tracking `-0.02em`, lh 1.1 | `--text` |
| Detail dek/subtitle | sans | 18px | 400 | lh 1.5 | `--muted` |
| Detail H2 (prose) | sans | 1.25rem | 600 | tracking `-0.01em` | `--text` |
| Prose body | serif | 18px | 400 | lh 1.7 | `--text` |
| Pull quote | serif | 20px | 400 | italic | `--text` |

### 1.4 Spacing & rhythm

Base unit 4px. Section vertical gap **80px** desktop / 56px mobile. Hero top padding **110px** desktop / 48px mobile. List row pitch **~72–88px**. Sidebar row pitch **30px**; group divider gap **24px**. Header-to-underrule gap **14px**; underrule-to-first-item **0** (rule is the item's top border). Card grid gap **1px** (shared hairlines) or **20px** if gap-separated (see §6).

### 1.5 Hairlines & radius

One weight only: `var(--hairline) solid var(--line)`. Emphasis border uses `--text`/`--line-strong`. Never a heavier stroke. Radii from the `--r-*` tokens above; app-icon tiles `--r-xl`, detail hero `--r-2xl`, pills `--r-full`, chips `--r-sm`.

---

## 2) Global layout

Two zones on a `--bg` canvas.

```css
.shell {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  min-height: 100vh;
}
.sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow-y: auto;
  padding: 36px var(--pad-x);
  border-right: var(--hairline) solid var(--line);
  background: var(--bg);
}
.content { min-width: 0; }               /* prevents grid blowout */
.content-inner,
.container {
  max-width: var(--content-max);         /* 640px reading measure */
  margin: 0 auto;                        /* centered in space right of rail */
  padding: 110px 24px 120px;
}
```

Reference has NO top navbar — the sidebar is the only chrome. The reading column is centered in the space to the right of the rail (symmetric gutters), achieved by `margin:0 auto` inside `.content`.

### 2.1 Mobile collapse (`max-width: 860px`)

Sidebar becomes a fixed top bar with a hamburger that opens a full-height drawer:

```css
@media (max-width: 860px) {
  .shell { grid-template-columns: 1fr; }
  .sidebar {
    position: fixed; inset: 0 auto 0 0;
    width: 78vw; max-width: 300px;
    transform: translateX(-100%);
    transition: transform .28s cubic-bezier(.16,1,.3,1);
    z-index: 50;
  }
  .sidebar[data-open="true"] { transform: none; }
  .topbar { /* new: shown only < 860px */
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; justify-content: space-between;
    height: 52px; padding: 0 16px;
    border-bottom: var(--hairline) solid var(--line);
    background: rgb(from var(--bg) r g b / 0.92);
    backdrop-filter: blur(12px);
  }
  .content-inner, .container { padding: 40px 20px 80px; }
  .scrim { position: fixed; inset: 0; background: rgb(0 0 0 / .4); z-index: 45; }
}
@media (min-width: 861px) { .topbar { display: none; } }
```

Drawer open state and scrim are React state in `Layout`. Hero, stat row, and card grid all reflow (see their sections).

---

## 3) Sidebar component (`src/components/Sidebar.tsx`, extracted from `Layout`)

Top-to-bottom: brand → nav group 1 (icon links) → hairline → nav group 2 → hairline → plain group. Adapt bryllim's groups to this site's real routes.

```
Bryl-style wordmark  →  owner name (Profile.name), pixel font 15px
── group 1 (icon links) ──
  [grid]     projects        → /#projects
  [briefcase] experience     → /#experience
── hairline (192px wide, x=32→224) ──
── group 2 ──
  [mail]     hire me         → /hire-me
── hairline ──
── plain group (no icons) ──
  netsuite              → /#projects?cat=netsuite
  website creation      → /#projects?cat=website-creation
  workflow automation   → /#projects?cat=workflow-automation
── foot ──
  theme: {system|light|dark}  (existing toggle, mono 11px)
```

Specs:
- **Brand**: `font-family:var(--font-pixel); font-size:15px; color:var(--text); text-decoration:none;` links to `/`.
- **Nav link**: flex row, `gap:14px; height:30px; align-items:center; font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--muted);` hover `color:var(--text)`.
- **Icon**: 16×16, `stroke:currentColor; stroke-width:1.5; fill:none;` inheriting a muted tone (`opacity:.7`). Reuse the existing inline SVGs in `Layout.tsx` (IconGrid, IconBag/briefcase, IconMail). Add a `IconZap`/`IconGlobe`/`IconLayers` set if you want per-category icons, else plain group has none.
- **Divider**: `<hr>` → `height:1px; border:0; background:var(--line); margin:24px 0; width:100%;` (padding already insets it to the ~192px band).
- **Active state**: current route → `color:var(--text); font-weight:500;` with a leading `→ ` marker (prepend via `::before{content:"→ ";}` on `.nav-link.active`, or a real span). Match against `useLocation()` / hash / `?cat=`.
- **Foot**: pinned bottom via `.sidebar{display:flex;flex-direction:column} .sidebar-foot{margin-top:auto}`.

---

## 4) Hero (`src/components/Hero.tsx`)

Two-column inside the 640px container: halftone portrait left (~287px), text right. Below it, the 4-up stat row.

```
┌─────────────┬──────────────────────────┐
│  halftone   │  {name}          (H1 pixel)
│  B&W photo  │                          
│  287×298    │  {bio}      (sans 15px, --text)
│             │                          
│             │  github ↗  linkedin ↗  email
└─────────────┴──────────────────────────┘
[ 200K+ ↗ ][ 6+ yrs ][ 10× ][ PH100 ]   ← stat row, hairline grid
```

```css
.hero { display: grid; grid-template-columns: 287px 1fr; gap: 42px; align-items: start; }
.hero__name { font-family: var(--font-pixel); font-size: clamp(1.875rem,4vw,2.6rem);
  line-height: 1; letter-spacing: -0.045em; margin: 0 0 32px; }
.hero__bio { font-size: 15px; line-height: 1.6; color: var(--text); }
.hero__bio p + p { margin-top: 1em; }
.hero__socials { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 32px;
  font-family: var(--font-mono); font-size: 13px; color: var(--muted); }
.hero__socials a { color: inherit; text-decoration: none; }
.hero__socials a:hover { color: var(--text); }
```

**Socials** render from `Profile.socials[]`. Append `↗` (U+2197) to every external link; the `email` entry (label === "email" or URL starts `mailto:`) gets NO arrow. Example: `github ↗   linkedin ↗   instagram ↗   email`.

### 4.1 Halftone B&W portrait — the CSS technique

Two layers. Base: desaturate + high-contrast the source photo so it reads as B&W. Overlay: a pure-CSS dot screen multiplied on top, denser toward the bottom via a mask.

```css
.avatar-wrap { position: relative; width: 287px; max-width: 100%; user-select: none; }
.avatar-wrap img {
  display: block; width: 100%; height: auto;
  filter: grayscale(1) contrast(1.15) brightness(1.02);
}
/* the newspaper dot screen */
.avatar-wrap::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(circle, var(--dot) 1px, transparent 1.6px);
  background-size: 9px 9px;
  mix-blend-mode: multiply;                 /* light theme */
  /* fade the dots in from the bottom */
  -webkit-mask-image: linear-gradient(to top, #000 0%, #000 35%, transparent 90%);
          mask-image: linear-gradient(to top, #000 0%, #000 35%, transparent 90%);
}
:root[data-theme="dark"] .avatar-wrap::after,
@media (prefers-color-scheme: dark) { .avatar-wrap::after { mix-blend-mode: screen; } }
```

Reusable dot-texture utilities (also used for the decorative band under the stats, §sections):

```css
.halftone       { background-image: radial-gradient(circle, var(--dot) 1px, transparent 1.6px);   background-size: 9px 9px; }
.halftone-dense { background-image: radial-gradient(circle, var(--dot) 1px, transparent 1.6px);   background-size: 6px 6px; }
.halftone-wide  { background-image: radial-gradient(circle, var(--dot) 1px, transparent 1.6px);   background-size: 13px 13px; }
.mask-up   { -webkit-mask-image: linear-gradient(to top,   #000, transparent); mask-image: linear-gradient(to top,   #000, transparent); }
.mask-down { -webkit-mask-image: linear-gradient(to bottom,#000, transparent); mask-image: linear-gradient(to bottom,#000, transparent); }
```

If `Profile.avatar_url` is absent, render a `287×298` `.halftone` block on `--surface` as a graceful placeholder (no gradient-initials — stay monochrome).

### 4.2 Stat row (renders from `Profile.stats[]`)

4 equal cells, top hairline caps the row, 1px vertical hairlines between cells.

```css
.stats { display: grid; grid-template-columns: repeat(4, 1fr); border-top: var(--hairline) solid var(--line); margin-top: 56px; }
.stat  { padding: 20px 16px 20px 0; border-left: var(--hairline) solid var(--line); }
.stat:first-child { border-left: 0; }
.stat__value { font-family: var(--font-pixel); font-size: 26px; line-height: 1; }
.stat__value .arrow { font-size: 0.6em; vertical-align: super; color: var(--faint); margin-left: 2px; }
.stat__label { margin-top: 14px; font-family: var(--font-mono); font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.08em; color: var(--faint); }
```

If a `Stat.href` exists, wrap value in an `<a>` and append `↗`. Mobile: `grid-template-columns:repeat(2,1fr)` (2×2), keep hairlines as grid lines.

Below the stat row, an optional decorative breather: a full-content-width `.halftone-wide.mask-down` band, ~56px tall, `opacity:.5`, `margin:24px 0 0`.

---

## 5) Numbered section header (`src/components/SectionHeader.tsx`)

`space-between` row: left = `NN — name` (pixel, `--faint`), right = uppercase mono "see-all" link + `→`. A full-width hairline sits immediately below, forming the top border of the first item.

```tsx
<div className="sec-head">
  <span className="sec-head__idx">{String(index).padStart(2,"0")} — {name}</span>
  {action && <a className="sec-head__link" href={action.href}>{action.label} →</a>}
</div>
```

```css
.sec-head { display: flex; justify-content: space-between; align-items: baseline;
  padding-bottom: 14px; border-bottom: var(--hairline) solid var(--line); }
.sec-head__idx  { font-family: var(--font-pixel); font-size: 14px; color: var(--faint); }
.sec-head__link { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--faint); text-decoration: none; }
.sec-head__link:hover { color: var(--text); }
```

Arrow semantics: `→` (U+2192) = internal see-all; `↗` (U+2197) = external/outbound. Ordinals: projects `01`, experience `02` (assign in `Home`).

---

## 6) Projects section

Passive taxonomy via `category_name` on each card, PLUS lightweight filter pills (source omits them but the existing `Home.tsx` already has filter state — keep it). Two tiers optional: use full-width hero cards for `status === "featured"` (or `sort_order` low), compact grid for the rest.

### 6.1 Filter pills (restyle existing `.pill`)

```css
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 28px; }
.pill { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
  padding: 5px 12px; border: var(--hairline) solid var(--line); border-radius: var(--r-full);
  background: transparent; color: var(--muted); cursor: pointer; }
.pill:hover { color: var(--text); border-color: var(--line-strong); }
.pill.active { background: var(--accent); color: var(--accent-contrast); border-color: var(--accent); }
```

`All` + one pill per used category. Also honor `?cat=` from the sidebar plain-group links (sync pill state to the query param).

### 6.2 Compact grid tile (restyle `ProjectCard`) — entire card is a link

```css
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-top: 24px; }
.card { display: block; text-decoration: none; color: inherit;
  border: var(--hairline) solid var(--line); border-radius: var(--r-xl); overflow: hidden;
  transition: border-color .18s, transform .18s; }
.card:hover { border-color: var(--line-strong); transform: translateY(-2px); }
.card .thumb, .card .placeholder { aspect-ratio: 16/10; width: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05); }
.card .placeholder { display:grid; place-items:center; background: var(--surface); color: var(--faint); font-family: var(--font-pixel); font-size: 22px; }
.card .body { padding: 14px 16px 16px; }
.card .cat { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--faint); }
.card h3   { font-family: var(--font-pixel); font-size: 16px; line-height: 1.15; margin: 8px 0 6px; }
.card p    { font-size: 14px; line-height: 1.5; color: var(--muted); margin: 0; }
```

**Card anatomy**: grayscale cover (or monochrome initials placeholder — drop the current colored `gradientFor`), category eyebrow, pixel title, one-line muted tagline. Optional outcome badge chips repurposed from bryllim's award pills — B2B flavored per category: NetSuite → `SUITEAPP CERTIFIED` / `FASTER CLOSE`; Website → `LIGHTHOUSE 100`; Workflow → `X HRS/YR SAVED`. Chip style = the kbd chip (`.chip`): `font-family:var(--font-mono); font-size:10px; padding:2px 6px; border:1px solid var(--line); border-radius:var(--r-sm); color:var(--muted);`.

### 6.3 Featured hero card (optional tier)

Full-width row: left square app-icon/cover (`96×96`, `--r-xl`, grayscale), right stack = category eyebrow + pixel title (18px) + one-line desc + CTA row. CTAs replace App/Play badges: `Live Site ↗`, `Case Study ↗`, or a muted `Internal / NDA` tag when no public link. CTA = inverted pill (`.btn.primary`: `background:var(--accent); color:var(--accent-contrast); font-family:var(--font-mono); font-size:11px; text-transform:uppercase; padding:8px 14px; border-radius:var(--r-full)`).

---

## 7) Experience / résumé timeline (`src/components/Timeline.tsx`)

Data is FLAT `ResumeEntry[]` (`period, role, org, location, sort_order`) — do NOT invent the nested company/roles shape; render a single vertical rail with one node per entry. Header uses the numbered section pattern (`02 — experience`) plus a one-line quantified summary from `Profile.tagline`.

```css
.timeline { position: relative; margin-top: 8px; padding-left: 28px; }
.timeline::before { content: ""; position: absolute; left: 5px; top: 6px; bottom: 6px; width: 1px; background: var(--line); }
.tl-row { position: relative; padding: 20px 0; border-bottom: var(--hairline) solid var(--line); }
.tl-row::before { content: ""; position: absolute; left: -27px; top: 24px; width: 11px; height: 11px;
  border-radius: var(--r-full); background: var(--bg); border: var(--hairline) solid var(--line-strong); }
.tl-row .period { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--faint); }
.tl-row .role   { font-size: 15px; font-weight: 500; color: var(--text); margin-top: 6px; }
.tl-row .org    { font-family: var(--font-mono); font-size: 12px; color: var(--muted); margin-top: 3px; }
```

Row order = `sort_order`. `org · location` joined by ` · ` (existing logic in `Home.tsx` lines 101–103). If you later want employer monogram chips, derive 2-letter initials from `org` and render a `44px` rounded-square node — but only if the data grows; the flat model needs just the dot node above.

---

## 8) Project DETAIL page (`src/pages/ProjectDetail.tsx`)

Same shell (sidebar + centered 640px column). Vertical flow: back link → meta → H1 → dek → hairline → hero image → serif prose → gallery → footer back link. Adapt the article pattern; there is no author byline needed (single owner) — optional.

```
‹ all projects                                   (mono, --faint, left chevron U+2039)
NETSUITE · CASE STUDY                            (meta line, mono uppercase, --faint)
{title}                                          (H1 sans 600)
{tagline}                                        (dek, sans 18px --muted)
──────────────────────────────────────          (hairline)
[ full-width rounded hero cover, grayscale ]     (--r-2xl)
{body_markdown → serif prose}                    (Source Serif 4, 18px, lh 1.7)
[ gallery: images[] ]
← back to all projects                           (footer, mono)
```

```css
.detail__back { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--faint); text-decoration: none; }
.detail__back:hover { color: var(--text); }
.detail__meta { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--faint); margin: 24px 0 12px; }
.detail__title { font-family: var(--font-sans); font-size: clamp(1.75rem,3.2vw,2.25rem); font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; margin: 0; }
.detail__dek { font-size: 18px; color: var(--muted); line-height: 1.5; margin: 12px 0 24px; }
.detail__rule { height: 1px; background: var(--line); border: 0; margin: 0 0 32px; }
.detail__cover { width: 100%; border-radius: var(--r-2xl); filter: grayscale(1) contrast(1.05); display: block; }

/* prose — the serif body is the signature of the detail page */
.prose { font-family: var(--font-serif); font-size: 18px; line-height: 1.7; color: var(--text); margin-top: 40px; }
.prose h2 { font-family: var(--font-sans); font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em; margin: 2em 0 0.6em; }
.prose h3 { font-family: var(--font-sans); font-size: 1.05rem; font-weight: 600; margin: 1.6em 0 0.5em; }
.prose p { margin: 0 0 1.1em; }
.prose ul, .prose ol { padding-left: 1.3em; margin: 0 0 1.1em; }
.prose li { margin: 0.3em 0; }
.prose a { color: var(--text); text-decoration: underline; text-underline-offset: 2px; text-decoration-color: var(--line-strong); }
.prose code { font-family: var(--font-mono); font-size: 0.85em; background: var(--surface); padding: 1px 5px; border-radius: var(--r-sm); }
.prose blockquote { font-style: italic; border-left: 2px solid var(--line-strong); padding-left: 1em; margin: 1.4em 0; color: var(--muted); }

.gallery { display: grid; grid-template-columns: 1fr; gap: 16px; margin: 40px 0; }
.gallery img { width: 100%; border-radius: var(--r-lg); filter: grayscale(1) contrast(1.05); }
```

The `.prose` class wraps the `Markdown` component output — apply it to a container div, since `Markdown.tsx` uses `marked`. Meta line composed from `category_name` + a static `· CASE STUDY` (or `· LIVE SITE ↗` linking `project` external URL if the model later carries one). Keep the existing `Layout` wrapper. Back links appear top (`‹ all projects` → `/#projects`) and footer (`← back to all projects` → `/`).

---

## 9) Files to create / change + component tree

### Create
- `public/fonts/GeistPixel-Square.woff2` — downloaded pixel font asset.
- `src/components/Sidebar.tsx` — extracted from `Layout`; brand + 3 nav groups + active state + theme foot + mobile drawer state.
- `src/components/Hero.tsx` — halftone avatar + name + bio + socials + `StatRow`.
- `src/components/StatRow.tsx` — 4-up hairline grid from `Profile.stats[]`.
- `src/components/SectionHeader.tsx` — `NN — name` + see-all link + underrule.
- `src/components/Timeline.tsx` — résumé rail from `ResumeEntry[]`.
- `src/components/FilterPills.tsx` — category pills (or inline in `Home`).
- `src/components/icons.tsx` — the inline SVG set (move the 4 icons out of `Layout`).

### Change
- `src/index.css` — replace token block + add all component styles above; delete colored gradient/placeholder styling. This is the bulk of the work.
- `src/main.tsx` — add `@fontsource-variable/source-serif-4` import (line ~5).
- `src/components/Layout.tsx` — slim to `<div className="shell"><Sidebar/><main className="content"><div className="content-inner">{children}</div></main></div>` + add mobile `.topbar`/`.scrim`; move icons/theme logic into `Sidebar`.
- `src/components/ProjectCard.tsx` — restyle to §6.2 (grayscale cover, pixel title, monochrome placeholder — drop `gradientFor` color).
- `src/components/util.ts` — keep `initials`; retire/replace `gradientFor` (or return a fixed `--surface`). 
- `src/pages/Home.tsx` — compose `Hero` + `SectionHeader('01 — projects')` + `FilterPills` + `grid` + `SectionHeader('02 — experience')` + `Timeline`; wire `?cat=` sync.
- `src/pages/ProjectDetail.tsx` — restructure to §8 (meta, dek, rule, `--r-2xl` cover, `.prose` wrapper, top+footer back links).
- `src/pages/HireMe.tsx`, `src/pages/NotFound.tsx` — inherit new tokens; light restyle for consistency (mono headings, hairlines).
- `package.json` — `+ @fontsource-variable/source-serif-4`.

### Do NOT touch
`worker/**`, `src/admin/**`, `src/api.ts`, `src/types.ts`, `wrangler.jsonc`, `migrations/**`, `.seed.sql`, D1/R2 config. The frontend consumes `/api/home` and `/api/projects/:slug` exactly as today.

### Component tree

```
App (BrowserRouter)
├─ "/"                Home
│   └─ Layout ─ Sidebar (brand, nav groups, active, theme, mobile drawer)
│              └─ content-inner
│                 ├─ Hero (avatar-wrap[halftone] · name · bio · socials · StatRow)
│                 ├─ SectionHeader "01 — projects"  + FilterPills + grid[ ProjectCard× ]
│                 └─ SectionHeader "02 — experience" + Timeline[ ResumeEntry× ]
├─ "/projects/:slug" ProjectDetailPage
│   └─ Layout ─ Sidebar
│              └─ back · meta · H1 · dek · rule · cover · Markdown(.prose) · gallery · back
├─ "/hire-me"        HireMe   └─ Layout
├─ "/admin/*"        Admin    (frozen)
└─ "*"               NotFound └─ Layout
```

### Acceptance checklist
- Zero non-gray hex renders anywhere on the public pages (all imagery `grayscale(1)`).
- Four font families load self-hosted; no request to `fonts.googleapis.com` or `jsdelivr.net` at runtime.
- Sidebar sticky full-height with right hairline ≥861px; drawer + topbar <861px.
- Reading column caps at 640px, centered right of the rail.
- Hero halftone shows the CSS dot screen fading in from the bottom; stat row is a 4-up hairline grid (2×2 mobile).
- Section headers read `01 — projects` (pixel/faint) with a `see-all →` link and an underrule.
- Detail page body is Source Serif 4 at 18px/1.7 with sans H2s; `↗` marks external, `→`/`‹`/`←` mark internal.
- Dark mode flips via the same tokens; `::selection` inverts.