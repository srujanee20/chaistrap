<div align="center">

<img src="logo.png" alt="chaistrap Logo" width="120" />
<br/>

<img src="https://img.shields.io/badge/chaistrap-Utility--First%20CSS%20Engine-ff6600?style=for-the-badge&logo=javascript&logoColor=white" alt="chaistrap" />

<br/><br/>

**A lightweight, zero-dependency, utility-first CSS engine built in pure JavaScript.**  
Write `chai-*` class names → get inline styles applied automatically. No build step. No config. No framework.

<br/>

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-22c55e?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-3b82f6?style=flat-square)
![Size](https://img.shields.io/badge/Size-~5KB-a855f7?style=flat-square)

</div>

---

## What Is chaistrap?

chaistrap is a **DOM-scanning CSS engine** that mimics the behaviour of utility-first frameworks like Tailwind CSS — but runs entirely in the browser with a single `<script>` tag.

Instead of pre-generating a CSS file, chaistrap **reads your class names at runtime**, parses them with regex rules, converts them into concrete CSS property–value pairs, and writes them as **inline styles** directly onto each element. The `chai-*` classes are then removed from the DOM, leaving only clean, computed styles.

```html
<!-- You write this -->
<div class="chai-p-4 chai-bg-blue chai-text-white chai-rounded-lg">Hello</div>

<!-- chaistrap turns it into this -->
<div style="padding:16px; background-color:#3b82f6; color:#ffffff; border-radius:0.5rem;">Hello</div>
```

---

## Quick Start

1. Copy `chaistrap.js` into your project.
2. Add a single `<script>` tag at the bottom of your HTML `<body>`.
3. Use `chai-*` classes anywhere in your markup.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Page</title>
</head>
<body>

  <div class="chai-flex chai-justify-center chai-items-center chai-p-8">
    <button class="chai-bg-orange chai-text-white chai-px-6 chai-py-3 chai-rounded-lg chai-font-semibold chai-shadow-md">
      Click me
    </button>
  </div>

  <script src="chaistrap.js"></script>
</body>
</html>
```

That's it. No npm install. No bundler. No config file.

---

## How It Works — Architecture Deep Dive

chaistrap is wrapped in an **IIFE (Immediately Invoked Function Expression)** to keep all internals private and avoid polluting the global scope. Only a minimal public API (`window.chaistrap`) is exposed.

```
┌─────────────────────────────────────────────────────┐
│                    chaistrap.js                     │
│                                                     │
│  ┌──────────────┐   ┌───────────┐   ┌───────────┐  │
│  │ Design Tokens│   │  Parser   │   │  Engine   │  │
│  │              │──▶│parseClass │──▶│processEl  │  │
│  │ SPACING_SCALE│   │           │   │applyAll   │  │
│  │ NAMED_COLORS │   │resolveCol │   │observeDOM │  │
│  │ FONT_SIZE_MAP│   │           │   │           │  │
│  │ SHADOW_MAP   │   │           │   │           │  │
│  └──────────────┘   └───────────┘   └───────────┘  │
│                                           │         │
│                                      ┌───▼──────┐  │
│                                      │   Init   │  │
│                                      │ + DOM    │  │
│                                      │ Observer │  │
│                                      └──────────┘  │
└─────────────────────────────────────────────────────┘
```

### Phase 1 — Design Tokens (Lines 10–47)

All style values are centralised as **lookup tables** (plain JS objects). This makes chaistrap easy to customise and extend.

| Token Table | Purpose |
|---|---|
| `SPACING_SCALE = 4` | Multiplier: `chai-p-2` → `2 × 4 = 8px` |
| `NAMED_COLORS` | Maps color names → hex values (22 colors) |
| `FONT_SIZE_MAP` | Maps size names → `rem` values (`xs` → `0.75rem`) |
| `FONT_WEIGHT_MAP` | Maps weight names → numeric strings (`bold` → `700`) |
| `BORDER_RADIUS_MAP` | Maps size names → `rem` / `px` values |
| `SHADOW_MAP` | Maps size names → full `box-shadow` strings |

### Phase 2 — The Parser (Lines 49–262)

The parser is the heart of chaistrap. It has two functions:

#### `resolveColor(value)`
A tiny helper. It first checks `NAMED_COLORS`; if the name isn't found, it passes the raw value through unchanged. This lets you write both `chai-bg-red` and `chai-bg-#ff0000` (custom hex).

```js
resolveColor("violet")   // → "#8b5cf6"
resolveColor("#ff0000")  // → "#ff0000"  (pass-through)
```

#### `parseClass(cls)`
Takes a single class name string, returns a **style object** (`{ cssProperty: "value" }`) or `null` if not recognised.

**Step 1 — Prefix guard:**
```js
if (!cls.startsWith("chai-")) return null;
const token = cls.slice(5); // strips "chai-" prefix
```

**Step 2 — Sequential regex matching.** Each category has its own regex. The first match wins and returns immediately.

```
"chai-p-4"
    │
    ▼  strip "chai-"
  "p-4"
    │
    ▼  spacingMatch: /^(p|m|px|py|...)-(\d+)$/
  abbr = "p", num = "4"
    │
    ▼  px = 4 × 4 = "16px"
    │
    ▼  return { padding: "16px" }
```

The parsing order is carefully sequenced to avoid ambiguous matches (e.g., `border-{color}` is tested **after** `border-{number}` and `border` exact match):

```
Spacing → BG Color → Text Color → Text Align → Font Size →
Font Weight → Font Style → Text Decoration → Line Height →
Letter Spacing → Border → Border Radius → Shadow → Opacity →
Display → Flex → Justify → Align → Gap → Width → Height →
Max-Width → Position → Overflow → Cursor → Transition → Select
```

### Phase 3 — The Engine (Lines 264–293)

#### `processElement(el)`
The core applier. For each element:

1. Iterates `el.classList` 
2. Calls `parseClass(cls)` for every `chai-*` class
3. If a style object is returned → `Object.assign(el.style, styles)` applies all properties at once
4. Pushes recognised classes to a `toRemove` queue
5. After the loop, removes all queued classes from the element

The two-phase approach (collect → remove) avoids mutating the classList **while iterating** it, which would cause skipped items.

```js
function processElement(el) {
  const toRemove = [];

  el.classList.forEach((cls) => {
    if (!cls.startsWith("chai-")) return;   // skip non-chai classes
    const styles = parseClass(cls);
    if (styles) {
      Object.assign(el.style, styles);       // apply styles
      toRemove.push(cls);                    // queue for removal
    } else {
      console.warn(`[chaistrap] Unknown utility: "${cls}"`);
    }
  });

  toRemove.forEach((cls) => el.classList.remove(cls));  // clean up
}
```

#### `applyAll()`
The initial bulk processor. Uses a single attribute selector to find every element that could have a `chai-` class, then runs `processElement` on each.

```js
function applyAll() {
  const elements = document.querySelectorAll('[class*="chai-"]');
  elements.forEach(processElement);
}
```

#### `observeDOM()`
Keeps chaistrap working for **dynamically injected content** (e.g., elements added by JavaScript after page load). Uses the browser's `MutationObserver` API to watch the entire document for new nodes.

```js
function observeDOM() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;  // text/comment nodes → skip
        if (node.className?.includes("chai-")) processElement(node);
        // Also process any chai-* descendants of the new node
        node.querySelectorAll?.('[class*="chai-"]').forEach(processElement);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
```

### Phase 4 — Initialisation (Lines 315–330)

```js
function init() {
  applyAll();     // process what's already in the DOM
  observeDOM();   // watch for future changes
  console.log("[chaistrap] ✅ Engine initialized.");
}

// Safe init — works regardless of when the script is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();  // DOM already ready (script loaded at bottom of body)
}
```

The guard ensures chaistrap initialises correctly whether the `<script>` tag is in the `<head>` (DOM still loading) or at the end of `<body>` (DOM already parsed).

---

## Utility Reference

### 📐 Spacing

Scale: `n × 4px` (so `chai-p-4` = `padding: 16px`)

| Class | CSS Output |
|---|---|
| `chai-p-{n}` | `padding: {n×4}px` |
| `chai-m-{n}` | `margin: {n×4}px` |
| `chai-px-{n}` | `padding-left + padding-right` |
| `chai-py-{n}` | `padding-top + padding-bottom` |
| `chai-pt/pb/pl/pr-{n}` | Individual padding sides |
| `chai-mt/mb/ml/mr-{n}` | Individual margin sides |
| `chai-mx-{n}` | `margin-left + margin-right` |
| `chai-my-{n}` | `margin-top + margin-bottom` |

### 🎨 Colors

22 named colors available: `red orange amber yellow lime green teal cyan blue indigo violet purple pink rose white black gray slate zinc neutral stone transparent`

| Class | CSS Output |
|---|---|
| `chai-bg-{color}` | `background-color: {hex}` |
| `chai-text-{color}` | `color: {hex}` |
| `chai-border-{color}` | `border-color: {hex}` |

### 🔤 Typography

| Class | CSS Output |
|---|---|
| `chai-text-{xs\|sm\|base\|lg\|xl\|2xl\|3xl\|4xl\|5xl}` | `font-size` |
| `chai-font-{thin\|light\|normal\|medium\|semibold\|bold\|extrabold\|black}` | `font-weight` |
| `chai-text-{left\|center\|right\|justify}` | `text-align` |
| `chai-italic` | `font-style: italic` |
| `chai-underline` | `text-decoration: underline` |
| `chai-line-through` | `text-decoration: line-through` |
| `chai-leading-{none\|tight\|snug\|normal\|relaxed\|loose}` | `line-height` |
| `chai-tracking-{tighter\|tight\|normal\|wide\|wider\|widest}` | `letter-spacing` |

### 📦 Layout & Flexbox

| Class | CSS Output |
|---|---|
| `chai-flex` | `display: flex` |
| `chai-block` | `display: block` |
| `chai-hidden` | `display: none` |
| `chai-flex-col` | `flex-direction: column` |
| `chai-flex-row` | `flex-direction: row` |
| `chai-flex-wrap` | `flex-wrap: wrap` |
| `chai-flex-1` | `flex: 1 1 0%` |
| `chai-justify-{start\|end\|center\|between\|around\|evenly}` | `justify-content` |
| `chai-items-{start\|end\|center\|baseline\|stretch}` | `align-items` |
| `chai-gap-{n}` | `gap: {n×4}px` |
| `chai-gap-x-{n}` / `chai-gap-y-{n}` | `column-gap` / `row-gap` |

### 📏 Sizing

| Class | CSS Output |
|---|---|
| `chai-w-full` | `width: 100%` |
| `chai-w-screen` | `width: 100vw` |
| `chai-w-{n}` | `width: {n×4}px` |
| `chai-w-1/2` | `width: 50%` (fraction syntax) |
| `chai-h-full` | `height: 100%` |
| `chai-h-screen` | `height: 100vh` |
| `chai-h-{n}` | `height: {n×4}px` |
| `chai-max-w-full` | `max-width: 100%` |
| `chai-max-w-{n}` | `max-width: {n×4}px` |

### 🔲 Borders

| Class | CSS Output |
|---|---|
| `chai-border` | `border: 1px solid currentColor` |
| `chai-border-{n}` | `border-width: {n}px` |
| `chai-border-{solid\|dashed\|dotted\|double}` | `border-style` |
| `chai-rounded` | `border-radius: 0.25rem` |
| `chai-rounded-{sm\|md\|lg\|xl\|2xl\|3xl\|full}` | `border-radius` |

### ✨ Effects & Misc

| Class | CSS Output |
|---|---|
| `chai-shadow` / `chai-shadow-{sm\|md\|lg\|xl\|2xl}` | `box-shadow` |
| `chai-opacity-{0–100}` | `opacity: 0.0–1.0` |
| `chai-transition` | `transition: all 150ms ease` |
| `chai-transition-colors` | Transition for color properties |
| `chai-cursor-{pointer\|not-allowed\|wait\|grab…}` | `cursor` |
| `chai-overflow-{hidden\|auto\|scroll\|clip}` | `overflow` |
| `chai-select-{none\|text\|all\|auto}` | `user-select` |
| `chai-relative / absolute / fixed / sticky` | `position` |

---

## Public API

chaistrap exposes two functions on `window.chaistrap`:

```js
// Re-process the entire DOM (useful after bulk DOM updates)
window.chaistrap.applyAll();

// Process a single element programmatically
const el = document.getElementById("my-div");
el.classList.add("chai-p-6", "chai-bg-violet");
window.chaistrap.processElement(el);
```

---

## Extending chaistrap

To add your own utility, open `chaistrap.js` and add a new parsing branch inside `parseClass()`, before the final `return null`:

```js
// Example: chai-z-{n} → z-index
const zMatch = token.match(/^z-(\d+)$/);
if (zMatch) return { zIndex: zMatch[1] };
```

To add a new named color, add an entry to `NAMED_COLORS`:

```js
const NAMED_COLORS = {
  // ...existing colors
  brand: "#ff6600",   // now chai-bg-brand works
};
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **IIFE wrapper** | Prevents token tables and helper functions from leaking into global scope |
| **Inline styles** | Highest specificity — no CSS conflicts. Works without any stylesheet. |
| **Remove classes after processing** | Keeps DevTools clean; prevents re-processing on `applyAll()` calls |
| **Collect-then-remove pattern** | Avoids mutating `classList` while iterating it (which causes skipped items) |
| **MutationObserver** | Handles React / Vue / vanilla JS dynamic content without any manual calls |
| **`readyState` guard** | Script works whether placed in `<head>` or end of `<body>` |
| **Lookup tables over CSS vars** | Simpler to parse; no dependency on CSS custom properties being available |

---

## Project Structure

```
chaistrap/
├── chaistrap.js   ← The engine (all you need to ship)
├── index.html     ← Live demo + interactive class inspector
├── docs.html      ← Full interactive documentation
└── README.md      ← This file
```

---

## License

MIT — use freely in personal and commercial projects.
