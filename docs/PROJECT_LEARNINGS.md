# Project Learnings

## What I Learned

### 1. How Utility-First CSS Frameworks Work Internally
Building chaistrap from scratch gave me a much deeper understanding of what frameworks like Tailwind CSS actually do under the hood — mapping a class name string to a concrete CSS property-value pair. The challenge of doing this at runtime (vs. build time) sharpened my appreciation for the trade-offs involved.

### 2. The Importance of Parser Order
Early in development, regex patterns would match too eagerly. For example, `border-red` would be caught by the `border-{number}` rule before reaching the `border-{color}` rule. Learning to sequence the checks carefully — and understanding why order matters in a chain of conditionals — was a key insight.

### 3. DOM APIs in Depth
This project pushed me to use several browser APIs I had not worked with deeply before:
- `classList.forEach` and the pitfall of mutating it mid-iteration (solved with the collect-then-remove pattern)
- `Object.assign(el.style, styles)` as an efficient way to apply multiple CSS properties at once
- `MutationObserver` for reacting to dynamically added DOM nodes without polling
- `document.readyState` for safe script initialisation regardless of placement

### 4. The Value of Design Tokens
Centralising all style values into lookup tables (`NAMED_COLORS`, `FONT_SIZE_MAP`, etc.) rather than hardcoding them inside the parser made the codebase significantly easier to maintain and extend. Adding a new color or shadow required a one-line change in one place.

### 5. Scope Isolation with IIFEs
Wrapping the entire engine in an Immediately Invoked Function Expression meant none of the internal variables or helpers leaked into the global scope. Only the public API (`window.chaistrap`) was intentionally exposed. This is a pattern I will carry forward into future vanilla JS projects.

### 6. Minification Trade-offs
Hand-minifying the file gave me visibility into exactly what a minifier does — shortening variable names, removing whitespace, collapsing constant objects. Using a tool like `terser` automates this correctly and is strongly preferred for future releases.

### 7. Open-Source Packaging
Publishing a library on GitHub involves more than just writing code:
- A clear README with quick-start instructions matters as much as the code itself.
- Semantic versioning and git tags are what make CDN links (jsDelivr) stable and reliable.
- A `LICENSE` file is non-negotiable for anyone wanting to use the project in their own work.
