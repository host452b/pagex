# Popup Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish Pagex popup interaction quality — smooth transitions, button states, focus rings, progress bar, copy feedback, reduced motion, ARIA live regions — without changing the visual identity.

**Architecture:** Pure CSS/HTML/JS changes across 3 files. CSS adds transitions, pseudo-class states, a progress bar component, and a reduced-motion media query. HTML gains one new element and three `aria-live` attributes. JS toggles a class and button text on copy.

**Tech Stack:** Vanilla CSS, HTML, JS (Chrome Extension popup)

**Spec:** `docs/superpowers/specs/2026-04-14-popup-visual-polish-design.md`

---

### Task 1: Add smooth state transitions to CSS

**Files:**
- Modify: `popup.css:52-75` (shared section styles and `::before` pseudo-elements)
- Modify: `popup.css:89-102` (`.hero__flag`, `.hero__status`, `.summary__header` badge styles)
- Modify: `popup.css:196-229` (`.button` styles)
- Modify: `popup.css:269-275` (`.summary__note`, `.footer__hint`)
- Modify: `popup.css:282-285` (`.footer__hint`)

- [ ] **Step 1: Add transition to shared section card styles**

In `popup.css`, find the `.hero, .panel, .summary, .footer` rule block (line 52). The `::before` pseudo-elements (line 65) need transitions for the left stripe width change during error state.

Add after the existing `opacity: 0.85;` line inside `.hero::before, .panel::before, .summary::before, .footer::before`:

```css
  transition: width 200ms ease-out, background-color 200ms ease-out;
```

- [ ] **Step 2: Add transition to badge styles**

In `popup.css`, find the `.hero__flag, .hero__status, .summary__header` rule (line 89). Add at the end of that block, before the closing `}`:

```css
  transition: background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out;
```

- [ ] **Step 3: Add transition to footer hint**

In `popup.css`, find `.footer__hint` (line 282). Add at the end of the block:

```css
  transition: color 200ms ease-out;
```

- [ ] **Step 4: Verify existing button transitions are sufficient**

The `.button` rule (line 196) already has:
```css
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease,
    color 120ms ease;
```

This already covers all properties needed for state transitions. Confirm these lines exist — no change needed.

- [ ] **Step 5: Commit**

```bash
git add popup.css
git commit -m "css: add smooth state transitions to badges, stripes, and footer"
```

---

### Task 2: Add button active/pressed states

**Files:**
- Modify: `popup.css` — add rules after `.button--secondary` block (after line 229)

- [ ] **Step 1: Add active state for primary button**

In `popup.css`, after the `.button--secondary` rule (line 229), add:

```css

.button--primary:not(:disabled):active {
  transform: translateY(0);
  background: #923224;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}
```

- [ ] **Step 2: Add active state for secondary button**

Immediately after the primary active rule, add:

```css

.button--secondary:not(:disabled):active {
  transform: translateY(0);
  background: rgba(171, 58, 44, 0.08);
}
```

- [ ] **Step 3: Commit**

```bash
git add popup.css
git commit -m "css: add active/pressed states for primary and secondary buttons"
```

---

### Task 3: Add focus-visible rings for accessibility

**Files:**
- Modify: `popup.css:173-181` (`.field__input` — remove `outline: none`)
- Modify: `popup.css:183-187` (`.field__input:focus` — keep as-is)
- Modify: `popup.css` — add new `:focus-visible` rules after `.field__input:focus` block

- [ ] **Step 1: Remove outline:none from field__input base styles**

In `popup.css`, find the `.field__input` rule (line 173). Remove the `outline: none;` line (line 181). The rule becomes:

```css
.field__input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--paper-line);
  background: rgba(255, 255, 255, 0.45);
  color: var(--ink);
  appearance: none;
}
```

- [ ] **Step 2: Add focus-visible rules**

After the existing `.field__input:focus` rule (line 183–187), add:

```css

.button:focus-visible,
.field__input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--accent);
}
```

- [ ] **Step 3: Commit**

```bash
git add popup.css
git commit -m "css: add focus-visible rings for keyboard accessibility"
```

---

### Task 4: Add inline progress bar (HTML + CSS)

**Files:**
- Modify: `popup.html:30` — add progress bar element as last child of `.hero`
- Modify: `popup.css` — add progress bar styles and keyframe after `.hero__subtitle` block

- [ ] **Step 1: Add progress bar element to HTML**

In `popup.html`, find the closing `</header>` tag (line 30). Insert the progress bar div just before it, as the last child of `.hero`:

```html
        <div class="hero__progress" role="progressbar" aria-label="Parse progress"></div>
      </header>
```

Replace line 30 (`</header>`) with these two lines.

- [ ] **Step 2: Add progress bar base CSS**

In `popup.css`, after the `.hero__subtitle` rule (ends around line 153), add:

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

- [ ] **Step 3: Add progress bar running-state styles**

In `popup.css`, find the `.app[data-status="running"]` block (line 287). After the existing `.app[data-status="running"] .button--primary` rule (line 296), add:

```css

.app[data-status="running"] .hero__progress {
  opacity: 1;
}

.app[data-status="running"] .hero__progress::after {
  animation: progress-slide 1.5s ease-in-out infinite;
}
```

- [ ] **Step 4: Add progress-slide keyframe**

In `popup.css`, after the existing `@keyframes annotation-pulse` block (ends at line 335), add:

```css

@keyframes progress-slide {
  0% {
    transform: translateX(-100%) scaleX(0.4);
  }

  50% {
    transform: translateX(40%) scaleX(0.5);
  }

  100% {
    transform: translateX(100%) scaleX(0.4);
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add popup.html popup.css
git commit -m "feat: add inline progress bar during parsing"
```

---

### Task 5: Add copy feedback animation (CSS + JS)

**Files:**
- Modify: `popup.css` — add `.button--copied` rule after `.button--secondary` active state
- Modify: `popup.js:415-427` (`handleCopyClick`) — add class toggle and text change
- Modify: `popup.js:429-441` (`setCopyFeedback`) — add button text restore in timeout
- Modify: `popup.js:443-446` (`resetCopyFeedback`) — add button text and class restore

- [ ] **Step 1: Add .button--copied CSS rule**

In `popup.css`, after the `.button--secondary:not(:disabled):active` rule (added in Task 2), add:

```css

.button--copied {
  background: rgba(42, 125, 74, 0.12);
  border-color: rgba(42, 125, 74, 0.3);
  color: #2a7d4a;
}
```

- [ ] **Step 2: Update handleCopyClick in JS to add class and change text**

In `popup.js`, find the `handleCopyClick` function (line 415). Replace:

```js
  await navigator.clipboard.writeText(formatted);
  setCopyFeedback('Copied to clipboard.');
```

With:

```js
  await navigator.clipboard.writeText(formatted);
  elements.copyButton.classList.add('button--copied');
  elements.copyButton.textContent = 'Copied';
  setCopyFeedback('Copied to clipboard.');
```

- [ ] **Step 3: Update resetCopyFeedback to restore button state**

In `popup.js`, find the `resetCopyFeedback` function (line 443). Replace:

```js
function resetCopyFeedback() {
  elements.copyFeedback.textContent =
    'Local only. Nothing is sent away.';
}
```

With:

```js
function resetCopyFeedback() {
  elements.copyFeedback.textContent =
    'Local only. Nothing is sent away.';
  elements.copyButton.classList.remove('button--copied');
  elements.copyButton.textContent = 'Copy JSON';
}
```

- [ ] **Step 4: Commit**

```bash
git add popup.css popup.js
git commit -m "feat: add copy feedback animation with green tint and text change"
```

---

### Task 6: Add ARIA live regions

**Files:**
- Modify: `popup.html:14` — add `aria-live` to `#statusText`
- Modify: `popup.html:27-29` — add `aria-live` to `#detailText`
- Modify: `popup.html:79` — add `aria-live` to `#copyFeedback`

- [ ] **Step 1: Add aria-live to statusText**

In `popup.html`, find line 14:

```html
          <span class="hero__status" id="statusText">Ready</span>
```

Replace with:

```html
          <span class="hero__status" id="statusText" aria-live="polite">Ready</span>
```

- [ ] **Step 2: Add aria-live to detailText**

In `popup.html`, find line 27:

```html
        <p class="hero__subtitle" id="detailText">
```

Replace with:

```html
        <p class="hero__subtitle" id="detailText" aria-live="polite">
```

- [ ] **Step 3: Add aria-live to copyFeedback**

In `popup.html`, find line 79:

```html
        <span class="footer__hint" id="copyFeedback">
```

Replace with:

```html
        <span class="footer__hint" id="copyFeedback" aria-live="polite">
```

- [ ] **Step 4: Commit**

```bash
git add popup.html
git commit -m "a11y: add aria-live regions for status, detail, and copy feedback"
```

---

### Task 7: Add prefers-reduced-motion support

**Files:**
- Modify: `popup.css` — add media query at the very end of the file

- [ ] **Step 1: Add reduced-motion media query**

At the very end of `popup.css`, after the last `@keyframes` block, add:

```css

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add popup.css
git commit -m "a11y: respect prefers-reduced-motion for all animations"
```

---

### Task 8: Run existing tests and verify

**Files:** None modified — verification only.

- [ ] **Step 1: Run existing unit tests**

Run: `npm test`

Expected: All 3 tests pass. These tests cover `popup-state.js` logic which is untouched.

```
✓ canCopyForSelectedTab only allows copying the currently parsed tab result
✓ getResultMismatchMessage warns when the selected tab differs from the stored result
✓ isParseButtonDisabled respects local starting state and background running state
```

- [ ] **Step 2: Manual verification checklist**

Load the extension in Chrome and verify:

1. Idle state: no progress bar visible, buttons hover/active/focus work
2. Parse: progress bar appears with sliding animation, status transitions smoothly
3. Complete: progress bar fades out, "Ready to copy" transitions in
4. Copy JSON: button shows "Copied" with green tint, reverts after ~2s
5. Keyboard Tab: focus rings appear on buttons and select
6. Reduced motion (System Preferences → Accessibility → Reduce motion): all animations suppressed
