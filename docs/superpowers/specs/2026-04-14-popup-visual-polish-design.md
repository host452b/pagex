# Pagex Popup Visual Polish

**Date:** 2026-04-14
**Scope:** Interaction quality, transitions, accessibility, progress indication, copy feedback
**Constraint:** No visual identity changes — same colors, fonts, layout, spacing, section structure

## Context

Pagex is a Chrome extension popup (420×560px) with an editorial magazine aesthetic: warm cream paper (`#f6f0e6`), red annotation accent (`#ab3a2c`), serif fonts, card-based sections with red left stripe. The current implementation works but has basic interaction states — no active/pressed feedback, no smooth transitions, no progress indication during parsing, no accessibility focus rings, and instant state snaps.

## Changes

### 1. Smooth State Transitions

Add CSS `transition` to all elements whose appearance changes between `data-status` values (`idle`, `running`, `completed`, `error`):

- Properties: `background-color`, `color`, `border-color`, `opacity`, `box-shadow`
- Duration: `200ms`
- Easing: `ease-out`
- Applied to: `.hero__flag`, `.hero__status`, `.summary__header`, `.footer__hint`, `.button`, `.hero::before`, `.panel::before`, `.summary::before`, `.footer::before` (the left red stripes)

The existing `annotation-pulse` keyframe on `.button--primary` during `running` state stays unchanged.

### 2. Button Active/Pressed States

Add `:active` pseudo-class styles to `.button`:

| State | Transform | Background | Notes |
|-------|-----------|------------|-------|
| Rest | none | existing | No change |
| Hover (existing) | `translateY(-1px)` | existing + border-color accent | Keep as-is |
| Active | `translateY(0)` | slightly darkened | Fast 120ms ease |

Specifics:
- `.button--primary:not(:disabled):active`: `background: #923224` (darkened accent), `box-shadow: inset 0 1px 2px rgba(0,0,0,0.15)`
- `.button--secondary:not(:disabled):active`: `background: rgba(171, 58, 44, 0.08)`
- Transition on `.button`: add `transform 120ms ease` (already present), ensure `background-color 120ms ease` covers active state

### 3. Focus Rings (Accessibility)

Add `:focus-visible` styles to all interactive elements:

```css
.button:focus-visible,
.field__input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--accent);
}
```

- Double-ring pattern: inner ring (`2px`) matches paper background for contrast separation, outer ring (`4px`) is accent color
- Applied only on `:focus-visible` (keyboard navigation), not `:focus` (avoids showing on mouse clicks)
- Remove the existing `outline: none` from `.field__input` base styles — move it into `:focus-visible` only
- The existing `.field__input:focus` border-color + box-shadow stays as-is for backwards compatibility, but augment `:focus-visible` with the ring pattern

### 4. Inline Progress Bar

New HTML element inside `.hero`:

```html
<div class="hero__progress" role="progressbar" aria-label="Parse progress"></div>
```

Placed as the last child of `.hero`, positioned at the bottom of the hero card.

CSS:

```css
.hero__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(171, 58, 44, 0.12);
  overflow: hidden;
  opacity: 0;
  transition: opacity 300ms ease-out;
}

.hero__progress::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
}
```

State behavior:
- **idle**: `opacity: 0` (hidden)
- **running**: `opacity: 1`, `::after` plays indeterminate animation — slides left to right repeatedly

```css
.app[data-status="running"] .hero__progress {
  opacity: 1;
}

.app[data-status="running"] .hero__progress::after {
  animation: progress-slide 1.5s ease-in-out infinite;
}

@keyframes progress-slide {
  0%   { transform: translateX(-100%) scaleX(0.4); }
  50%  { transform: translateX(40%) scaleX(0.5); }
  100% { transform: translateX(100%) scaleX(0.4); }
}
```

- **completed / error / idle**: `opacity: 0` — the `running` → any-other-state transition triggers the `opacity 300ms ease-out` transition, which fades the bar out smoothly. No special "fill to 100%" step needed; the fade-out is sufficient.

### 5. Copy Feedback Animation

When the user copies JSON:

1. JS adds class `.button--copied` to `#copyBtn`
2. CSS for `.button--copied`:

```css
.button--copied {
  background: rgba(42, 125, 74, 0.12);
  border-color: rgba(42, 125, 74, 0.3);
  color: #2a7d4a;
}
```

3. JS changes button text from "Copy JSON" to "Copied"
4. After the existing 2200ms timeout, JS removes `.button--copied` class and restores "Copy JSON" text

Transition is handled by the existing `transition` on `.button` (background-color, border-color, color all at 120ms).

### 6. Reduced Motion Support

Wrap all animations and transitions in a `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This respects the user's OS-level preference to reduce motion.

### 7. ARIA Live Regions

Add attributes to existing HTML elements (no new elements):

- `#statusText`: add `aria-live="polite"` — screen readers announce status changes
- `#detailText`: add `aria-live="polite"` — screen readers announce detail text changes
- `#copyFeedback`: add `aria-live="polite"` — screen readers announce copy feedback

## Files Changed

| File | Change |
|------|--------|
| `popup.css` | Add transitions, `:active` states, `:focus-visible` rings, progress bar styles, `.button--copied`, `prefers-reduced-motion`, progress animation keyframe |
| `popup.html` | Add `.hero__progress` div, add `aria-live` attributes to 3 elements |
| `popup.js` | Add `.button--copied` class toggle in `handleCopyClick`, change copy button text to "Copied" / restore on timeout |

## Files NOT Changed

- `manifest.json`, `background.js`, `content.js`, `src/shared/*`, `tests/*`, icons, store assets — all untouched.

## Testing

1. Load the extension in Chrome (`chrome://extensions` → Load unpacked)
2. Open any web page and click the Pagex icon
3. Verify idle state: no progress bar visible, buttons respond to hover/active/focus
4. Click Parse: verify progress bar appears with sliding animation, button shows "Reading...", status transitions smoothly
5. After parse completes: verify progress bar fades out, status transitions smoothly to "Ready to copy"
6. Click Copy JSON: verify button text changes to "Copied" with green tint, reverts after ~2s
7. Tab through all interactive elements: verify focus rings appear on keyboard focus
8. Enable "Reduce motion" in OS settings: verify all animations are suppressed
9. Run existing tests: `npm test` should still pass (no logic changes)
