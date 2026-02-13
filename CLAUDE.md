# CLAUDE.md

## Project Overview

Moow - cryptocurrency robo-advisory platform. A Next.js App Router web application with i18n support (Chinese/English).

## Tech Stack

- **Runtime**: Node.js 22 LTS (managed via Volta)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.8 (strict mode)
- **UI**: React 19, Emotion CSS-in-JS, Bulma CSS, MUI 6, Tailwind CSS 3
- **State**: Zustand 5 (preferred for new code), Redux 5 (legacy, avoid adding new usage)
- **i18n**: i18next + react-i18next (NOT next-i18next, which is for Pages Router)
- **HTTP**: Axios with json-bigint for large number precision
- **Charts**: Highcharts 11
- **Carousel**: Swiper 11 (import from `swiper/react`, NOT `react-id-swiper`)

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build (also runs lint + type check)
npm run lint      # ESLint check
npm run start     # Start production server
```

## Project Structure

```
src/
  app/            # Next.js App Router pages and layouts
  components/     # Reusable React components (Navbar, Footer, Tip, Pagination)
  lib/            # HTTP client (http.ts with Axios + json-bigint)
  store/          # State management
    user.ts       # Zustand store (user info, persisted to localStorage)
    index.ts      # Redux store (legacy: locale, auth state)
  utils/          # Utilities
    auth.js       # Auth helpers (login, logout, token, localStorage)
    defines.tsx   # Constants (exchange symbol lists)
    util.tsx      # Formatters (date, number, currency) using date-fns
    validator.js  # Form validation using async-validator
  assets/         # Static resources (images, SCSS)
  i18n.ts         # i18n configuration
public/
  locales/        # Translation files (en.json, zh.json)
```

## Coding Conventions

### Components
- All components are **function components** with hooks. Do NOT use `React.FC`, class components, or `forwardRef`.
- All pages use `'use client'` directive since they rely on client-side hooks.
- Component names MUST start with uppercase (e.g., `ResetPassword`, not `resetPassword`).
- Export page components as `export default function PageName()`.

### Styling
- Use **Emotion CSS-in-JS** (`css` template literal from `@emotion/react`) for component-scoped styles.
- When using Emotion's `css` prop, add `/** @jsxImportSource @emotion/react */` as the FIRST line of the file (before `'use client'`).
- Bulma CSS classes are available globally via `src/assets/bulma.scss`.
- MUI components are available for form elements (Alert, Snackbar, etc.).

### State Management
- **New code**: Use Zustand with `create<StateType>()(...)` syntax (double parentheses for v5).
- **Existing Redux**: Use `legacy_createStore` import to avoid deprecation warnings. Do not add new Redux usage.

### i18n
- Import `useTranslation` from `'react-i18next'` (NOT `'next-i18next'`).
- Supported locales: `en`, `zh`. Default: `zh`.
- Translation keys use dot notation: `t('label.exchange_apikey')`.

### Navigation
- Use `<Link>` from `next/link` for internal navigation. Do NOT use `<a>` tags for internal links.
- Use `useRouter` and `useSearchParams` from `next/navigation` (NOT `next/router`).
- Pages using `useSearchParams()` MUST be wrapped in a `<Suspense>` boundary.

### TypeScript
- Strict mode is enabled. All function parameters must have explicit types.
- Path alias `@/*` maps to `src/*`.
- `@typescript-eslint/no-explicit-any` is OFF (any is allowed when needed).

### HTTP Requests
- Use the configured Axios instance from `src/lib/http.ts` (imported as `HTTP`).
- Base API URL: `NEXT_PUBLIC_BASE_API_URL` env var or `/api` default.
- 60-second timeout with CSRF token support.

### Form Validation
- Use `getInvalidFields(formData, rules())` from `src/utils/validator.js`.
- Returns `false` if valid, or `{ fieldName: "error message string" }` if invalid.
- Invalid field values are **strings**, not arrays.

## ESLint

- ESLint 9 flat config (`eslint.config.mjs`), NOT `.eslintrc.json`.
- Key rules: `no-unused-vars` is OFF (handled by `@typescript-eslint/no-unused-vars` as warn).
- Prettier integration enabled.

## Git Conventions

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `style:`, `refactor:`, `test:`, `revert:`.
- Enforced by commitlint + Husky pre-commit hooks.
- Lint-staged runs ESLint + Prettier on staged `.js/.jsx/.ts/.tsx` files.

## Code Formatting

- **Prettier** config (`.prettierrc`):
  - 2-space indentation, no tabs
  - Single quotes, double quotes in JSX
  - 100-char line width
  - Trailing commas (ES5)
  - Always use parentheses around arrow function params

## next.config.mjs

- `rewrites()` must always return an array (return `[]` for non-development).
- Dev API proxy: `/api/*` -> `http://127.0.0.1:3000/api/*`.

## Common Pitfalls

- Do NOT import from `next-i18next` or `next/router` - these are Pages Router APIs.
- Do NOT use `React.FC` - use plain function declarations.
- Do NOT use `router.push({ pathname, query })` - pass a string URL instead.
- Do NOT pass objects/arrays as React children - extract `.message` or stringify first.
- Empty page files must have a default export or the build will fail.
- Zustand v5: `create<T>()(...)` with double parentheses, not `create<T, any>(...)`.
