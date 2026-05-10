/**
 * chaistrap.js
 * A lightweight utility-first CSS engine.
 * Scans the DOM for `chai-*` class names and converts them to inline styles.
 */

(function () {
  "use strict";

  // ─── DESIGN TOKENS ────────────────────────────────────────────────────────
  const SPACING_SCALE = 4; // 1 unit = 4px

  const NAMED_COLORS = {
    red: "#ef4444", orange: "#f97316", amber: "#f59e0b", yellow: "#eab308",
    lime: "#84cc16", green: "#22c55e", teal: "#14b8a6", cyan: "#06b6d4",
    blue: "#3b82f6", indigo: "#6366f1", violet: "#8b5cf6", purple: "#a855f7",
    pink: "#ec4899", rose: "#f43f5e", white: "#ffffff", black: "#000000",
    gray: "#6b7280", slate: "#64748b", zinc: "#71717a", neutral: "#737373",
    stone: "#78716c", transparent: "transparent",
  };

  const FONT_SIZE_MAP = {
    xs: "0.75rem", sm: "0.875rem", base: "1rem", md: "1rem",
    lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem",
    "4xl": "2.25rem", "5xl": "3rem",
  };

  const FONT_WEIGHT_MAP = {
    thin: "100", extralight: "200", light: "300", normal: "400",
    medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900",
  };

  const BORDER_RADIUS_MAP = {
    none: "0", sm: "0.125rem", DEFAULT: "0.25rem",
    md: "0.375rem", lg: "0.5rem", xl: "0.75rem",
    "2xl": "1rem", "3xl": "1.5rem", full: "9999px",
  };

  const SHADOW_MAP = {
    sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
    DEFAULT: "0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px -1px rgba(0,0,0,0.1)",
    md: "0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.1),0 8px 10px -6px rgba(0,0,0,0.1)",
    "2xl": "0 25px 50px -12px rgba(0,0,0,0.25)",
    none: "none",
  };

  // ─── PARSER ───────────────────────────────────────────────────────────────

  /**
   * Resolve a color name or a raw hex/rgb value.
   */
  function resolveColor(value) {
    return NAMED_COLORS[value] || value;
  }

  /**
   * Parse a single chai-* class name into a { property, value } pair.
   * Returns null if the class is not recognised.
   */
  function parseClass(cls) {
    // Strip the prefix
    if (!cls.startsWith("chai-")) return null;
    const token = cls.slice(5); // e.g. "p-4", "bg-red", "text-center"

    // ── Spacing ────────────────────────────────────────────────────────────
    const spacingMatch = token.match(
      /^(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-(\d+(?:\.\d+)?)$/
    );
    if (spacingMatch) {
      const [, abbr, num] = spacingMatch;
      const px = `${parseFloat(num) * SPACING_SCALE}px`;
      const map = {
        p: { padding: px },
        m: { margin: px },
        px: { paddingLeft: px, paddingRight: px },
        py: { paddingTop: px, paddingBottom: px },
        pt: { paddingTop: px },
        pb: { paddingBottom: px },
        pl: { paddingLeft: px },
        pr: { paddingRight: px },
        mx: { marginLeft: px, marginRight: px },
        my: { marginTop: px, marginBottom: px },
        mt: { marginTop: px },
        mb: { marginBottom: px },
        ml: { marginLeft: px },
        mr: { marginRight: px },
      };
      return map[abbr] || null;
    }

    // ── Background color ───────────────────────────────────────────────────
    const bgMatch = token.match(/^bg-(.+)$/);
    if (bgMatch) return { backgroundColor: resolveColor(bgMatch[1]) };

    // ── Text color ─────────────────────────────────────────────────────────
    const textColorMatch = token.match(
      /^text-(red|orange|amber|yellow|lime|green|teal|cyan|blue|indigo|violet|purple|pink|rose|white|black|gray|slate|zinc|neutral|stone|transparent)$/
    );
    if (textColorMatch) return { color: resolveColor(textColorMatch[1]) };

    // ── Text alignment ─────────────────────────────────────────────────────
    const alignMatch = token.match(/^text-(left|center|right|justify|start|end)$/);
    if (alignMatch) return { textAlign: alignMatch[1] };

    // ── Font size ──────────────────────────────────────────────────────────
    const fsMatch = token.match(/^text-(xs|sm|base|md|lg|xl|2xl|3xl|4xl|5xl)$/);
    if (fsMatch && FONT_SIZE_MAP[fsMatch[1]])
      return { fontSize: FONT_SIZE_MAP[fsMatch[1]] };

    // ── Font weight ────────────────────────────────────────────────────────
    const fwMatch = token.match(
      /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/
    );
    if (fwMatch) return { fontWeight: FONT_WEIGHT_MAP[fwMatch[1]] };

    // ── Font style ─────────────────────────────────────────────────────────
    if (token === "italic") return { fontStyle: "italic" };
    if (token === "not-italic") return { fontStyle: "normal" };

    // ── Text decoration ────────────────────────────────────────────────────
    if (token === "underline") return { textDecoration: "underline" };
    if (token === "line-through") return { textDecoration: "line-through" };
    if (token === "no-underline") return { textDecoration: "none" };

    // ── Line height ────────────────────────────────────────────────────────
    const leadingMatch = token.match(/^leading-(.+)$/);
    if (leadingMatch) {
      const lhMap = {
        none: "1", tight: "1.25", snug: "1.375", normal: "1.5",
        relaxed: "1.625", loose: "2",
      };
      return { lineHeight: lhMap[leadingMatch[1]] || leadingMatch[1] };
    }

    // ── Letter spacing ─────────────────────────────────────────────────────
    const trackingMatch = token.match(/^tracking-(tighter|tight|normal|wide|wider|widest)$/);
    if (trackingMatch) {
      const lsMap = {
        tighter: "-0.05em", tight: "-0.025em", normal: "0em",
        wide: "0.025em", wider: "0.05em", widest: "0.1em",
      };
      return { letterSpacing: lsMap[trackingMatch[1]] };
    }

    // ── Border ─────────────────────────────────────────────────────────────
    if (token === "border") return { border: "1px solid currentColor" };
    const borderWidthMatch = token.match(/^border-(\d+)$/);
    if (borderWidthMatch) return { borderWidth: `${borderWidthMatch[1]}px` };

    const borderColorMatch = token.match(/^border-(.+)$/);
    if (borderColorMatch && NAMED_COLORS[borderColorMatch[1]])
      return { borderColor: resolveColor(borderColorMatch[1]) };

    const borderStyleMatch = token.match(/^border-(solid|dashed|dotted|double|none)$/);
    if (borderStyleMatch) return { borderStyle: borderStyleMatch[1] };

    // ── Border radius ──────────────────────────────────────────────────────
    if (token === "rounded") return { borderRadius: BORDER_RADIUS_MAP.DEFAULT };
    const roundedMatch = token.match(/^rounded-(none|sm|md|lg|xl|2xl|3xl|full)$/);
    if (roundedMatch) return { borderRadius: BORDER_RADIUS_MAP[roundedMatch[1]] };

    // ── Shadow ─────────────────────────────────────────────────────────────
    if (token === "shadow") return { boxShadow: SHADOW_MAP.DEFAULT };
    const shadowMatch = token.match(/^shadow-(sm|md|lg|xl|2xl|none)$/);
    if (shadowMatch) return { boxShadow: SHADOW_MAP[shadowMatch[1]] };

    // ── Opacity ────────────────────────────────────────────────────────────
    const opacityMatch = token.match(/^opacity-(\d+)$/);
    if (opacityMatch) return { opacity: parseInt(opacityMatch[1]) / 100 };

    // ── Display ────────────────────────────────────────────────────────────
    const displayMap = {
      flex: "flex", block: "block", "inline-block": "inline-block",
      inline: "inline", hidden: "none", grid: "grid",
      "inline-flex": "inline-flex",
    };
    if (displayMap[token] !== undefined) return { display: displayMap[token] };

    // ── Flex utilities ─────────────────────────────────────────────────────
    if (token === "flex-col") return { flexDirection: "column" };
    if (token === "flex-row") return { flexDirection: "row" };
    if (token === "flex-wrap") return { flexWrap: "wrap" };
    if (token === "flex-nowrap") return { flexWrap: "nowrap" };
    if (token === "flex-1") return { flex: "1 1 0%" };
    if (token === "flex-auto") return { flex: "1 1 auto" };
    if (token === "flex-none") return { flex: "none" };

    // ── Justify content ────────────────────────────────────────────────────
    const justifyMatch = token.match(/^justify-(start|end|center|between|around|evenly)$/);
    if (justifyMatch) {
      const jMap = {
        start: "flex-start", end: "flex-end", center: "center",
        between: "space-between", around: "space-around", evenly: "space-evenly",
      };
      return { justifyContent: jMap[justifyMatch[1]] };
    }

    // ── Align items ────────────────────────────────────────────────────────
    const itemsMatch = token.match(/^items-(start|end|center|baseline|stretch)$/);
    if (itemsMatch) {
      const aMap = {
        start: "flex-start", end: "flex-end", center: "center",
        baseline: "baseline", stretch: "stretch",
      };
      return { alignItems: aMap[itemsMatch[1]] };
    }

    // ── Gap ────────────────────────────────────────────────────────────────
    const gapMatch = token.match(/^gap-(\d+(?:\.\d+)?)$/);
    if (gapMatch) return { gap: `${parseFloat(gapMatch[1]) * SPACING_SCALE}px` };

    const gapXMatch = token.match(/^gap-x-(\d+(?:\.\d+)?)$/);
    if (gapXMatch) return { columnGap: `${parseFloat(gapXMatch[1]) * SPACING_SCALE}px` };

    const gapYMatch = token.match(/^gap-y-(\d+(?:\.\d+)?)$/);
    if (gapYMatch) return { rowGap: `${parseFloat(gapYMatch[1]) * SPACING_SCALE}px` };

    // ── Width ──────────────────────────────────────────────────────────────
    if (token === "w-full") return { width: "100%" };
    if (token === "w-screen") return { width: "100vw" };
    if (token === "w-auto") return { width: "auto" };
    const wMatch = token.match(/^w-(\d+(?:\.\d+)?)$/);
    if (wMatch) return { width: `${parseFloat(wMatch[1]) * SPACING_SCALE}px` };
    const wFracMatch = token.match(/^w-(\d+)\/(\d+)$/);
    if (wFracMatch) return { width: `${(parseInt(wFracMatch[1]) / parseInt(wFracMatch[2])) * 100}%` };

    // ── Height ─────────────────────────────────────────────────────────────
    if (token === "h-full") return { height: "100%" };
    if (token === "h-screen") return { height: "100vh" };
    if (token === "h-auto") return { height: "auto" };
    const hMatch = token.match(/^h-(\d+(?:\.\d+)?)$/);
    if (hMatch) return { height: `${parseFloat(hMatch[1]) * SPACING_SCALE}px` };

    // ── Max/Min width & height ─────────────────────────────────────────────
    if (token === "max-w-full") return { maxWidth: "100%" };
    const maxWMatch = token.match(/^max-w-(\d+(?:\.\d+)?)$/);
    if (maxWMatch) return { maxWidth: `${parseFloat(maxWMatch[1]) * SPACING_SCALE}px` };

    // ── Position ───────────────────────────────────────────────────────────
    const posMap = { relative: "relative", absolute: "absolute", fixed: "fixed", sticky: "sticky", static: "static" };
    if (posMap[token]) return { position: posMap[token] };

    // ── Overflow ───────────────────────────────────────────────────────────
    const ovfMatch = token.match(/^overflow-(auto|hidden|visible|scroll|clip)$/);
    if (ovfMatch) return { overflow: ovfMatch[1] };

    // ── Cursor ─────────────────────────────────────────────────────────────
    const cursorMatch = token.match(/^cursor-(pointer|default|not-allowed|wait|text|move|grab)$/);
    if (cursorMatch) return { cursor: cursorMatch[1] };

    // ── Transition ─────────────────────────────────────────────────────────
    if (token === "transition") return { transition: "all 150ms ease" };
    if (token === "transition-colors") return { transition: "color,background-color,border-color 150ms ease" };

    // ── User select ────────────────────────────────────────────────────────
    const selectMatch = token.match(/^select-(none|text|all|auto)$/);
    if (selectMatch) return { userSelect: selectMatch[1] };

    return null; // unknown class
  }

  // ─── ENGINE ───────────────────────────────────────────────────────────────

  /**
   * Apply chaistrap styles to a single element.
   */
  function processElement(el) {
    const toRemove = [];

    el.classList.forEach((cls) => {
      if (!cls.startsWith("chai-")) return;

      const styles = parseClass(cls);
      if (styles) {
        Object.assign(el.style, styles);
        toRemove.push(cls);
      } else {
        console.warn(`[chaistrap] Unknown utility: "${cls}"`);
      }
    });

    toRemove.forEach((cls) => el.classList.remove(cls));
  }

  /**
   * Scan the entire DOM and process all elements.
   */
  function applyAll() {
    const elements = document.querySelectorAll('[class*="chai-"]');
    elements.forEach(processElement);
  }

  /**
   * Observe the DOM for dynamically added nodes.
   */
  function observeDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(({ addedNodes }) => {
        addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return; // elements only
          if (node.className && typeof node.className === "string" && node.className.includes("chai-")) {
            processElement(node);
          }
          // Also process descendants
          node.querySelectorAll && node.querySelectorAll('[class*="chai-"]').forEach(processElement);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────

  function init() {
    applyAll();
    observeDOM();
    console.log("[chaistrap] ✅ Engine initialized.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose public API
  window.chaistrap = { applyAll, processElement };
})();
