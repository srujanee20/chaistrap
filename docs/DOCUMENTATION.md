# Documentation

## Overview

chaistrap is a runtime utility-first CSS engine. It scans the DOM for `chai-*` class names and converts them into inline styles automatically. No build step, no configuration, no dependencies.

## Installation

Add one script tag to the bottom of your `<body>`:

```html
<!-- Minified (recommended) -->
<script src="https://cdn.jsdelivr.net/gh/srujanee20/chaistrap@v1.0.0/chaistrap.min.js"></script>

<!-- Full source -->
<script src="https://cdn.jsdelivr.net/gh/srujanee20/chaistrap@v1.0.0/chaistrap.js"></script>
```

## Usage

Write `chai-*` classes in your HTML markup. chaistrap processes them automatically on page load.

```html
<div class="chai-flex chai-justify-center chai-p-8">
  <button class="chai-bg-orange chai-text-white chai-px-6 chai-py-3 chai-rounded-lg chai-font-semibold">
    Click me
  </button>
</div>
```

## Utility Categories

| Category | Example Classes |
| :--- | :--- |
| Spacing | `chai-p-4`, `chai-mx-2`, `chai-py-6`, `chai-mt-8` |
| Colors | `chai-bg-violet`, `chai-text-amber`, `chai-border-teal` |
| Typography | `chai-text-xl`, `chai-font-bold`, `chai-italic`, `chai-tracking-wide` |
| Flexbox | `chai-flex`, `chai-justify-center`, `chai-items-center`, `chai-gap-4` |
| Sizing | `chai-w-full`, `chai-h-screen`, `chai-w-1/2`, `chai-max-w-80` |
| Borders | `chai-border`, `chai-rounded-lg`, `chai-rounded-full`, `chai-border-2` |
| Effects | `chai-shadow-md`, `chai-opacity-70`, `chai-transition` |
| Layout | `chai-block`, `chai-hidden`, `chai-flex-col`, `chai-flex-wrap` |

## Spacing Scale

All spacing values use a `n × 4px` scale.

| Class | Output |
| :--- | :--- |
| `chai-p-1` | `padding: 4px` |
| `chai-p-4` | `padding: 16px` |
| `chai-p-8` | `padding: 32px` |

## Named Colors

22 colors available: `red` `orange` `amber` `yellow` `lime` `green` `teal` `cyan` `blue` `indigo` `violet` `purple` `pink` `rose` `white` `black` `gray` `slate` `zinc` `neutral` `stone` `transparent`

## Public API

```js
// Re-process the entire DOM after bulk updates
window.chaistrap.applyAll();

// Process a single element programmatically
const el = document.getElementById('my-div');
el.classList.add('chai-p-6', 'chai-bg-violet');
window.chaistrap.processElement(el);
```

## Dynamic Content

chaistrap uses a `MutationObserver` to automatically style elements added to the DOM after page load. No manual calls needed.

## Files

| File | Size | Purpose |
| :--- | :--- | :--- |
| `chaistrap.js` | 17 KB | Development build — readable and commented |
| `chaistrap.min.js` | 6.7 KB | Production build — 61% smaller |
| `index.html` | — | Live demo and interactive class inspector |
