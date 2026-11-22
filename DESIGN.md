# WebPulse Design System (`DESIGN.md`)

A stark, monochrome **v0 Playground Studio** design system engineered for high-density real-time web analytics. Built around a pitch-black `#000000` canvas, `#0a0a0a` recessed panels, `1px` architectural hairlines, and zero decorative clutter across `1366×768` and `1440×900` viewports.

---

## 1. Core Design Principles

1. **Stark Monochrome Studio:** Dark mode uses true black (`#000000`) and near-black (`#0a0a0a`) with crisp `#222222` hairlines and pure white (`#ffffff`) primary actions. Color is restricted exclusively to functional live status (`#10b981`).
2. **Architectural Hairlines Over Shadows:** Hierarchy is established through `1px` structural borders, divided metric strips, and dedicated panel headers rather than drop shadows or gradients.
3. **100dvh Above-the-Fold Discipline:** The top studio bar, left control rail, 4-column KPI bar, `Traffic momentum` chart, `Live geography` panel, and studio footer fit cleanly inside `100dvh` with zero sidebar scrolling.
4. **Workspace-Style Empty States:** Zero-data regions use a subtle monochrome dot-matrix canvas (`.wp-studio-canvas`) with a centered, dashed `"Ready to stream"` frame, copyable `<script>` snippet, and a direct `Verify` action.
5. **Tabular & Monospace Precision:** Every live counter, quota ratio, axis tick, and status badge uses `font-variant-numeric: tabular-nums` and `Geist Mono` so real-time updates never jitter.

---

## 2. Color System

WebPulse defaults to **v0 Studio Dark Mode** (`.dark` / `[data-theme="dark"]` on `<html>`) and includes a paired **Studio Light Mode** (`:root`).

### Surfaces & Borders

| Role | CSS Token | Dark Mode (Default) | Light Mode | Usage |
| :--- | :--- | :--- | :--- | :--- |
| App Canvas | `--wp-bg-canvas` | `#000000` | `#ffffff` | Viewport background, top bar, sidebar, dot-grid base |
| Panel Surface | `--wp-bg-surface` | `#0a0a0a` | `#ffffff` | Studio panels, panel headers, capacity card, segmented controls |
| Subtle Surface | `--wp-bg-subtle` | `#111111` | `#fafafa` | Recessed badges, icon wells, code chips |
| Hover State | `--wp-bg-hover` | `#171717` | `#f5f5f5` | Nav item and secondary button hover |
| Active State | `--wp-bg-active` | `#1f1f1f` | `#efefef` | Active nav row and selected time-range tab |
| Subtle Divider | `--wp-border-subtle` | `#171717` | `#efefef` | Panel header bottom borders, internal section dividers |
| Default Border | `--wp-border-default` | `#222222` | `#e5e5e5` | `1px` panel frames, KPI dividers, inputs, buttons |
| Strong Border | `--wp-border-strong` | `#333333` | `#d4d4d4` | Hover borders, dashed empty-state dropzone frame |
| Studio Dot Grid | `--wp-dot-color` | `rgba(255,255,255,0.075)` | `rgba(0,0,0,0.08)` | `16px × 16px` monochrome studio canvas dots |

### Text & Contrast

| Role | CSS Token | Dark Mode (Default) | Light Mode | Usage |
| :--- | :--- | :--- | :--- | :--- |
| Primary Ink | `--wp-text-primary` | `#ededed` | `#0a0a0a` | Page titles, KPI values, active labels, headings |
| Secondary Ink | `--wp-text-secondary` | `#a1a1a1` | `#525252` | Nav labels, metric labels, snippet code, secondary buttons |
| Muted Ink | `--wp-text-muted` | `#666666` | `#737373` | Section captions, axis ticks, helper copy, footer links |
| Inverted Ink | `--wp-text-inverted` | `#000000` | `#ffffff` | Text & icons inside solid primary CTA buttons and brand mark |

### Accents, Status & Data Visualization

| Role | CSS Token | Dark Mode (Default) | Light Mode | Usage |
| :--- | :--- | :--- | :--- | :--- |
| Primary CTA | `--wp-accent-solid` | `#ffffff` | `#0a0a0a` | High-contrast buttons (`+ New Project`, `Copy snippet`), brand mark |
| Primary Hover | `--wp-accent-hover` | `#e5e5e5` | `#262626` | Primary button hover state |
| Live Indicator | `--wp-status-live` | `#10b981` | `#10b981` | `6px` dot for active streams and plan status |
| Chart Primary | `--wp-chart-1` | `#ededed` | `#0a0a0a` | Primary monochrome telemetry line (`1.75px` stroke) |
| Chart Grid | `--wp-chart-grid` | `#1f1f1f` | `#e5e5e5` | Dashed horizontal gridlines (`strokeDasharray="2 4"`) |
| Quota Fill | `--wp-meter-bar` | `#ededed` | `#0a0a0a` | `3px` capacity progress fill |

---

## 3. Typography & Data Formatting

- **Sans Stack:** `"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Mono Stack:** `"Geist Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`

### Type Scale

| Class | Size | Weight | Tracking | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.wp-title-page` | `15px` | `500` | `-0.02em` | `1.25` | Single-row studio workspace heading (`Global Insights`) |
| `.wp-title-card` | `12px` | `500` | `-0.01em` | `1.30` | Studio panel header title (`Traffic momentum`, `Live geography`) |
| `.wp-label-section` | `11px` | `500` | `0.02em` | `1.20` | Subtle sentence-case sidebar section headers (`Workspace`, `Capacity`) |
| `.wp-kpi-value` | `24px` | `500` | `-0.03em` | `1.10` | Primary KPI figures (`tabular-nums` enforced) |
| `.wp-metric-mono` | `11.5px` | `400` | `0` | `1.40` | Quotas, percentages, badges, axis labels, and code snippets |

### Micro-Data Rules
- **Small Percentages:** Non-zero usage below `0.1%` (e.g., `263 / 500,000`) must render as `<0.1%` rather than `0%`.
- **Locale Formatting:** Format counts with separators (`263`, `500,000`) or compact quota denominators (`/ 500k`).

---

## 4. Layout & Shell Architecture

### App Shell (`.wp-shell`)
- **Grid:** `grid-template-columns: 224px minmax(0, 1fr)` and `grid-template-rows: 46px minmax(0, 1fr)` inside `height: 100dvh; overflow: hidden`. Collapses to single-column below `768px`.
- **Top Studio Bar (`46px`):**
  - Left: `22px × 22px` inverted `.wp-brand-mark`, `WebPulse` wordmark, `/` separator, and monospace `Powered by Edge Telemetry` chip.
  - Right: `V2 Beta` secondary button, theme toggle, notification bell with accent dot, and compact account badge.
- **Left Control Rail (`224px`):**
  - Workspace nav items at `30px` height (`--wp-nav-item-h`), flat `--wp-bg-active` active state.
  - Empty `Pinned domains` collapses to a single `Pin a domain` action row.
  - Recessed `Capacity` card pinned to the bottom with `Events` and `Storage` meters plus `Manage plan`.
- **Main Studio Workspace (`p-4`, `gap-3`):**
  1. **Single-Row Toolbar:** `Global Insights` + muted subtitle on the left; segmented time-range selector (`Realtime` / `24h` / `7d` / `30d`) + `+ New Project` button on the right.
  2. **Unified 4-Column KPI Bar:** A single `.wp-panel` container split by `1px` vertical hairlines (`lg:grid-cols-4 lg:divide-x divide-line`), fixed at `82px` row height.
  3. **Studio Split Workspace (`lg:grid-cols-12`):** `Traffic momentum` (**7 cols**) and `Live geography` (**5 cols**), each structured with a `.wp-panel-header` bar over a `.wp-studio-canvas` workspace.
  4. **Minimal Studio Footer:** Compact `11px` status strip (`WebPulse Studio • Realtime Edge • How it works` on the left, `100% operational` mono status on the right).

---

## 5. Component Specifications

### Studio Panel (`.wp-panel` & `.wp-panel-header`)
- **Container:** `1px solid var(--wp-border-default)`, `border-radius: 8px`, `overflow: hidden`, flat background (`--wp-bg-surface`), zero box-shadow.
- **Header:** `10px 14px` padding, `1px solid var(--wp-border-subtle)` bottom divider, title on the left and compact monospace chip or icon on the right.

### Studio Dot-Matrix Canvas (`.wp-studio-canvas`)
- Applied to chart bodies and geography/empty-state wells:
  ```css
  background-color: var(--wp-bg-canvas);
  background-image: radial-gradient(var(--wp-dot-color) 1px, transparent 1px);
  background-size: 16px 16px;
  ```

### Buttons (`.wp-btn`)
- **Geometry:** `30px` default height (`28px` / `h-7` in top bar and capacity footer), `6px` radius, `12.5px` medium text.
- **Primary (`.wp-btn-primary`):** Solid `#ffffff` with `#000000` text in dark mode (`#0a0a0a` with `#ffffff` text in light mode).
- **Secondary (`.wp-btn-secondary`):** Transparent background, `1px` `--wp-border-default`, transitions to `--wp-bg-hover` and `--wp-border-strong` on hover.
- **Focus Ring:** High-contrast `2px` canvas offset + `1.5px` outer ring (`--wp-focus-ring`).

### Live Status Dot (`.wp-live-dot`) & Quota Track (`.wp-meter-track`)
- **Live Dot:** `6px × 6px` `#10b981` circle paired with monospace `Live` text—no glowing pill wrapper.
- **Quota Track:** `3px` height, `--wp-border-default` track, `--wp-meter-bar` fill (`1%–2%` minimum width for non-zero values).

---

## 6. Motion & Interaction

- **Easing:** `cubic-bezier(0.2, 0, 0, 1)` (`--wp-ease-standard`).
- **Durations:** `120ms` (`--wp-dur-fast`) for hover, focus, and border transitions; `160ms` (`--wp-dur-base`) for meter fills.
- **Restraint:** Zero bounce physics, zero neon glows, and zero entrance delays on telemetry panels.

---

## 7. Do's and Don'ts

- **Do** use a single hairline-divided `.wp-panel` for KPI strips instead of four disconnected floating cards.
- **Do** keep dark mode surfaces strictly neutral (`#000000`, `#0a0a0a`, `#111111`) with zero blue or purple tint.
- **Do** provide a copyable tracker `<script>` and `Verify` CTA inside the dashed `"Ready to stream"` studio well when `liveVisitors === 0`.
- **Don't** add colored box-shadows, gradient backgrounds, or decorative emojis to controls.
- **Don't** introduce hardcoded hex colors outside the `--wp-*` custom property layer.