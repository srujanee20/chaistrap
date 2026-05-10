# Project Approach

## Problem Statement

Utility-first CSS frameworks like Tailwind CSS require a Node.js environment, a build pipeline, and configuration files to generate a stylesheet. This makes them inaccessible for quick prototyping, legacy projects, or simple HTML pages without a toolchain.

The goal was to deliver the same developer experience — write a class name, get a style — but with zero setup overhead.

## Design Philosophy

- **Runtime over build-time**: Instead of generating a CSS file ahead of time, parse class names live in the browser.
- **Zero dependencies**: The entire engine is a single JavaScript file with no external imports.
- **Non-invasive**: chaistrap removes processed classes from the DOM after applying styles, keeping DevTools clean.
- **Extensible by design**: All style values live in plain JS lookup tables (tokens), making them easy to customise or extend.

## Architecture

The engine is divided into four phases, all wrapped in an IIFE to keep internals private:

**Phase 1 — Design Tokens**
All style values (colors, font sizes, shadow strings, border radii) are centralised as constant lookup tables. This separates data from logic and makes the system easy to extend.

**Phase 2 — The Parser**
The `parseClass(cls)` function takes a single class name string and returns a CSS style object (`{ property: value }`) or `null` if the class is not recognised. It uses sequential regex matching — each category has its own pattern, and the first match wins. The order is carefully chosen to avoid ambiguous matches (e.g., `border-{color}` is checked after `border-{number}`).

**Phase 3 — The Engine**
`processElement(el)` iterates an element's class list, calls the parser on each `chai-*` class, applies the returned style via `Object.assign(el.style, styles)`, and queues recognised classes for removal. The two-phase collect-then-remove approach avoids mutating the class list while iterating it.

`applyAll()` runs a single DOM query (`[class*="chai-"]`) and calls `processElement` on every match.

**Phase 4 — Initialisation**
A `readyState` guard ensures the engine initialises correctly whether the script is placed in the `<head>` or at the end of `<body>`. A `MutationObserver` watches for dynamically added nodes and processes them automatically.

## Key Technical Decisions

| Decision | Reason |
| :--- | :--- |
| IIFE wrapper | Prevents token tables and helpers from polluting the global scope |
| Inline styles | Highest CSS specificity — no stylesheet conflicts |
| Remove classes after processing | Keeps DevTools readable; prevents double-processing on `applyAll()` calls |
| Collect-then-remove pattern | Avoids skipped items caused by mutating `classList` mid-iteration |
| MutationObserver | Handles dynamically injected content without manual intervention |
| Regex per category | Clear, maintainable, and easy to extend with new utility patterns |
