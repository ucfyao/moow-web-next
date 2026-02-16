# UI/UX Improvements Implementation Plan (P0 + P1)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the 9 highest-priority UI/UX improvements (P0 × 4 + P1 × 5) from the design spec.

**Architecture:** Foundation-first approach — define CSS design tokens, then build 4 new reusable components (Skeleton, ConfirmModal, EmptyState, PasswordToggle), then integrate into pages. Work is organized into 4 parallel streams by file ownership to avoid merge conflicts.

**Tech Stack:** Next.js 15, React 19, TypeScript, Emotion CSS-in-JS, Bulma CSS, Vitest + RTL

**Design Spec:** `docs/plans/2026-02-16-ui-ux-improvements-design.md`

---

## Team Parallel Streams

```
Phase 1: Foundation (team-lead, sequential)
  └─ Task 1: CSS design tokens in globals.scss

Phase 2: Components + Pages (3 agents, parallel)
  ├─ Stream A (agent-components): New components + tests
  │   └─ Task 2: Skeleton component
  │   └─ Task 3: ConfirmModal component
  │   └─ Task 4: EmptyState component
  │
  ├─ Stream B (agent-accessibility): A11y fixes on auth pages
  │   └─ Task 5: Form a11y (P0-1) on login/signup/forgetPassword/resetPassword/changePassword
  │   └─ Task 6: Password toggle (P1-2) on login/signup/resetPassword/changePassword
  │   └─ Task 7: Form a11y on addstrategy/addmarketkeys
  │
  └─ Stream C (agent-data-display): Data page improvements
      └─ Task 8: Color indicators (P0-3) on aip/strategyDetail/orders/assets
      └─ Task 9: Keyboard nav (P0-4) on Navbar
      └─ Task 10: Chart responsive (P1-4) on DingtouChart + strategyDetail

Phase 3: Integration (team-lead, after Phase 2)
  └─ Task 11: Integrate Skeleton into data pages
  └─ Task 12: Integrate ConfirmModal into aip/markets/strategyDetail
  └─ Task 13: Integrate EmptyState into aip/orders/markets/assets
  └─ Task 14: Table mobile cards (P1-3)
  └─ Task 15: Final verification + commit
```

---

## Task 1: CSS Design Tokens (Foundation)

**Owner:** team-lead
**Files:**
- Modify: `src/app/globals.scss`

**Step 1: Add design tokens to globals.scss**

Add at the top of the file, after Tailwind directives:

```scss
:root {
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Semantic Colors */
  --color-success: #23d160;
  --color-danger: #ff3860;
  --color-warning: #ffdd57;
  --color-info: #209cee;
}
```

**Step 2: Add focus-visible and reduced-motion styles**

Add before the `.home` block:

```scss
/* Focus visible */
*:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 3: Commit**

```bash
git add src/app/globals.scss
git commit -m "feat: add CSS design tokens, focus-visible and reduced-motion"
```

---

## Task 2: Skeleton Component

**Owner:** agent-components
**Files:**
- Create: `src/components/Skeleton.tsx`
- Create: `src/__tests__/components/Skeleton.test.tsx`

**Spec:** See design doc P0-2. Variants: `text`, `rect`, `circle`. Shimmer animation via Emotion CSS.

**Key implementation details:**
- Use Emotion `css` + `keyframes` for shimmer effect
- Props: `variant: 'text' | 'rect' | 'circle'`, `width?: string`, `height?: string`, `count?: number` (for text variant)
- Text variant: renders `count` rows of shimmer bars
- Rect variant: renders a single rectangle
- Circle variant: renders a circle
- Animation: `@keyframes shimmer` — linear gradient sweep left to right, 1.5s infinite

**Test cases:**
- Renders correct number of text lines when `count` is provided
- Renders rect with custom width/height
- Renders circle variant
- Has shimmer animation keyframe
- Applies correct CSS class per variant

---

## Task 3: ConfirmModal Component

**Owner:** agent-components
**Files:**
- Create: `src/components/ConfirmModal.tsx`
- Create: `src/__tests__/components/ConfirmModal.test.tsx`

**Spec:** See design doc P1-1. Based on Bulma `.modal` structure.

**Key implementation details:**
- Use `/** @jsxImportSource @emotion/react */` + Emotion for scoped styles
- Props: `isOpen`, `title`, `message`, `confirmText`, `cancelText`, `variant: 'danger' | 'warning' | 'info'`, `onConfirm`, `onCancel`, `loading`
- Variant maps to confirm button class: `is-danger`, `is-warning`, `is-info`
- `Escape` key calls `onCancel`
- Clicking backdrop calls `onCancel`
- Confirm button shows `is-loading` when `loading=true`
- `useEffect` to add/remove `overflow: hidden` on `document.body`
- Support i18n: default texts use `useTranslation`

**Test cases:**
- Does not render when `isOpen=false`
- Renders title and message when `isOpen=true`
- Calls `onCancel` when Escape is pressed
- Calls `onCancel` when backdrop clicked
- Calls `onConfirm` when confirm button clicked
- Shows loading state on confirm button
- Applies correct button class per variant

---

## Task 4: EmptyState Component

**Owner:** agent-components
**Files:**
- Create: `src/components/EmptyState.tsx`
- Create: `src/__tests__/components/EmptyState.test.tsx`

**Spec:** See design doc P1-5. Vertically centered layout with icon, title, description, action button.

**Key implementation details:**
- Use Emotion for scoped styles
- Props: `title: string`, `description?: string`, `actionText?: string`, `actionHref?: string`, `icon?: React.ReactNode`
- Uses `<Link>` from `next/link` for action button
- Centered flex column layout, padding 48px
- Title: 18px bold, description: 14px gray (#666), button: Bulma `is-link`
- Support i18n via `useTranslation`

**Test cases:**
- Renders title
- Renders description when provided
- Renders action button with correct href
- Does not render button when actionText not provided
- Renders custom icon when provided

---

## Task 5: Form Accessibility — Auth Pages

**Owner:** agent-accessibility
**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/signup/page.tsx`
- Modify: `src/app/forgetPassword/page.tsx`
- Modify: `src/app/resetPassword/page.tsx`
- Modify: `src/app/ucenter/changePassword/page.tsx`

**Spec:** See design doc P0-1.

**Changes per file:**
1. Add `id` to every `<input>` and matching `<label htmlFor="...">` (use Bulma `.label` class) or `aria-label`
2. Add `role="alert"` + `aria-live="polite"` to all error `<p className="help is-danger">` elements
3. Ensure error text is actually populated (check `errors.fieldName` is rendered)
4. Captcha images: add `alt="验证码，点击刷新"` and `role="button"` + `tabIndex={0}` + keyboard handler

**Commit after each file pair (page + test update).**

---

## Task 6: Password Toggle — Auth Pages

**Owner:** agent-accessibility
**Files:**
- Same files as Task 5

**Spec:** See design doc P1-2.

**Changes per file:**
1. Add `showPassword` state variable per password field
2. Wrap password input in Bulma `has-icons-right` control
3. Add eye icon button (`<span className="icon is-right">`) with click handler
4. Toggle `type="password"` / `type="text"` based on state
5. Add `aria-label` to toggle button

**This builds on Task 5, so it must run after Task 5 completes.**

---

## Task 7: Form Accessibility — Strategy Pages

**Owner:** agent-accessibility
**Files:**
- Modify: `src/app/aip/addstrategy/page.tsx`
- Modify: `src/app/aip/addmarketkeys/page.tsx`

**Spec:** See design doc P0-1.

**Changes:**
1. Add `aria-label` to inputs (these use Bulma controls without visible labels)
2. Add `role="alert"` to error elements
3. Exchange/symbol selection cards: add `tabIndex={0}`, `role="button"`, `aria-label`, `onKeyDown` (Enter/Space triggers click)
4. Add `cursor: pointer` to clickable cards

---

## Task 8: Color Indicators — Data Pages

**Owner:** agent-data-display
**Files:**
- Modify: `src/app/aip/page.tsx`
- Modify: `src/app/aip/[strategyId]/page.tsx`
- Modify: `src/app/aip/orders/page.tsx`
- Modify: `src/app/ucenter/assets/page.tsx`

**Spec:** See design doc P0-3.

**Changes per file:**
1. Profit values: prepend `▲` for positive, `▼` for negative, alongside existing color
2. Status tags: add `● ` prefix for running, `■ ` prefix for stopped
3. Create a small helper function `formatProfit(value: number): string` that returns the formatted string with prefix

**Commit per file.**

---

## Task 9: Keyboard Navigation — Navbar

**Owner:** agent-data-display
**Files:**
- Modify: `src/components/Navbar.tsx`
- Update: `src/__tests__/components/Navbar.test.tsx`

**Spec:** See design doc P0-4.

**Changes:**
1. Dropdown menus: add `role="menu"`, `aria-expanded`, `aria-haspopup="true"`
2. Menu items: add `role="menuitem"`
3. Add `onKeyDown` handler to dropdown triggers:
   - `Enter` / `Space`: toggle dropdown
   - `Escape`: close dropdown
   - `ArrowDown`: focus next item
   - `ArrowUp`: focus previous item
4. Track `activeDropdown` state and focused item index

---

## Task 10: Chart Responsive

**Owner:** agent-data-display
**Files:**
- Modify: `src/components/DingtouChart.tsx`
- Modify: `src/app/aip/[strategyId]/page.tsx` (chart section only)

**Spec:** See design doc P1-4.

**Changes to DingtouChart:**
1. Set container `style={{ width: '100%' }}`
2. Add `chart: { reflow: true }` to Highcharts config
3. Add `useEffect` with debounced `window.resize` listener calling `chart.reflow()`
4. Responsive height: use `window.innerWidth < 768 ? 250 : 400`

**Changes to strategy detail chart:**
1. Same responsive config
2. Add time range selector (buttons: 7天/30天/90天/全部)
3. Filter chart data based on selected range
4. Use Bulma `.buttons.has-addons` style for selector

---

## Tasks 11-14: Integration (Phase 3)

After Phase 2 agents complete, the team-lead integrates the new components into pages:

### Task 11: Integrate Skeleton
- Add `<Skeleton>` to: `/aip`, `/aip/orders`, `/aip/markets`, `/aip/[strategyId]`, `/ucenter/assets`, `/ucenter/invite`, homepage charts
- Replace `loading...` text or empty states during data fetch

### Task 12: Integrate ConfirmModal
- Replace `window.confirm` in `/aip`, `/aip/markets`, `/aip/[strategyId]`
- Wire up `onConfirm` to existing delete/toggle handlers

### Task 13: Integrate EmptyState
- Replace empty state images/text in `/aip`, `/aip/orders`, `/aip/markets`, `/ucenter/assets`
- Configure per design doc table

### Task 14: Table Mobile Cards (P1-3)
- Add responsive card view to `/aip`, `/aip/orders`, `/aip/markets`, `/aip/[strategyId]` tables
- Use CSS media query `@media (max-width: 768px)` to switch between table and card layout

### Task 15: Final Verification
- Run `npm run lint` and `npm test`
- Fix any issues
- Final commit and PR

---

## File Ownership Map (Conflict Prevention)

| File | Owner | Tasks |
|------|-------|-------|
| `src/app/globals.scss` | team-lead | 1 |
| `src/components/Skeleton.tsx` | agent-components | 2 |
| `src/components/ConfirmModal.tsx` | agent-components | 3 |
| `src/components/EmptyState.tsx` | agent-components | 4 |
| `src/app/login/page.tsx` | agent-accessibility | 5, 6 |
| `src/app/signup/page.tsx` | agent-accessibility | 5, 6 |
| `src/app/forgetPassword/page.tsx` | agent-accessibility | 5 |
| `src/app/resetPassword/page.tsx` | agent-accessibility | 5, 6 |
| `src/app/ucenter/changePassword/page.tsx` | agent-accessibility | 5, 6 |
| `src/app/aip/addstrategy/page.tsx` | agent-accessibility | 7 |
| `src/app/aip/addmarketkeys/page.tsx` | agent-accessibility | 7 |
| `src/app/aip/page.tsx` | agent-data-display | 8 |
| `src/app/aip/[strategyId]/page.tsx` | agent-data-display | 8, 10 |
| `src/app/aip/orders/page.tsx` | agent-data-display | 8 |
| `src/app/ucenter/assets/page.tsx` | agent-data-display | 8 |
| `src/components/Navbar.tsx` | agent-data-display | 9 |
| `src/components/DingtouChart.tsx` | agent-data-display | 10 |
