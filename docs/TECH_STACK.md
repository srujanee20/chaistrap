# Tech Stack

## Core

| Technology | Version | Role |
| :--- | :--- | :--- |
| JavaScript (ES6+) | Vanilla | Engine logic, DOM manipulation, regex parsing |
| HTML5 | — | Demo page structure and semantic markup |
| CSS3 | Vanilla | Base reset and glassmorphism aesthetics for the demo page |

## Browser APIs Used

| API | Purpose |
| :--- | :--- |
| `document.querySelectorAll` | Bulk DOM scan for elements with `chai-*` classes |
| `Element.classList` | Reading and removing utility class names |
| `Element.style` + `Object.assign` | Applying computed inline styles |
| `MutationObserver` | Watching for dynamically added nodes |
| `document.readyState` | Safe initialisation regardless of script placement |
| `navigator.clipboard` | Copy-to-clipboard for CDN snippets on the demo page |

## Fonts (Demo Page Only)

| Font | Source | Usage |
| :--- | :--- | :--- |
| Inter | Google Fonts | Body text and UI labels |
| JetBrains Mono | Google Fonts | Code blocks and the class inspector |

## Tooling

| Tool | Purpose |
| :--- | :--- |
| Git | Version control |
| GitHub | Remote repository and release hosting |
| jsDelivr CDN | Free, reliable CDN delivery direct from GitHub releases |
| Terser (optional) | Automated minification for future releases |

## Dependencies

**Zero.** chaistrap has no runtime dependencies. No npm packages, no frameworks, no external CSS files.

## Browser Compatibility

chaistrap works in all modern browsers that support ES6 and `MutationObserver`:

| Browser | Minimum Version |
| :--- | :--- |
| Chrome | 49+ |
| Firefox | 44+ |
| Safari | 10+ |
| Edge | 14+ |
