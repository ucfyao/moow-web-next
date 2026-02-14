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
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (E2E)

## Environment Setup

1. **Volta** manages Node.js version automatically (reads `volta` config in `package.json`: Node 22.13.1, npm 10.9.2)
2. `npm install` to install dependencies
3. Backend API must run on `localhost:3000` (dev mode proxies `/api/*` to `http://127.0.0.1:3000/api/*`)
4. `npm run dev` to start dev server (default port 3000, auto-increments if occupied)

## Commands

```bash
npm run dev            # Start dev server
npm run build          # Production build (also runs lint + type check)
npm run lint           # ESLint check
npm run start          # Start production server
npm test               # Run unit/component tests (vitest run)
npm run test:watch     # Run tests in watch mode (vitest)
npm run test:coverage  # Run tests with v8 coverage
npm run test:e2e       # Run E2E tests (playwright test)
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
  __tests__/      # Unit and component tests (Vitest)
    setup.tsx     # Global test setup with mocks
public/
  locales/        # Translation files (en.json, zh.json)
e2e/              # End-to-end tests (Playwright)
```

## Page Routes

### Auth
| Route | Dynamic Params | Description |
|-------|---------------|-------------|
| `/login` | — | Login page |
| `/signup` | — | Registration page |
| `/forgetPassword` | — | Request password reset |
| `/resetPassword` | — | Reset password form |
| `/activate/[userId]` | `userId` | Send activation email |
| `/activeConfirm/[token]` | `token` | Confirm email activation |

### Strategy (AIP)
| Route | Dynamic Params | Description |
|-------|---------------|-------------|
| `/aip` | — | Strategy list |
| `/aip/[strategyId]` | `strategyId` | Strategy detail |
| `/aip/addstrategy` | — | Create strategy |
| `/aip/addmarketkeys` | — | Add market API keys |
| `/aip/markets` | — | Market overview |

### Other
| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/about` | About page |
| `/error` | Error page |
| `/fund` | Fund page |
| `/ucenter/assets` | User assets |
| `/ucenter/invite` | User invite |

## Layout Architecture

Page skeleton defined in `src/app/layout.tsx`:

```
html (flex column, min-height: 100vh, class="has-navbar-fixed-top")
  └─ body (flex column, flex: 1)
       ├─ <Navbar />        ← fixed top (Bulma adds padding-top: 4.25rem via has-navbar-fixed-top)
       ├─ <main class="main-content">  ← flex: 1, flex column, bg: #f7f7f7
       │    └─ {children}
       └─ <Footer />
```

- `has-navbar-fixed-top` on `<html>` — Bulma adds `padding-top: 4.25rem` to clear the fixed navbar
- `.main-content` in `globals.scss`: `flex: 1; display: flex; flex-direction: column;`
- `.home` class in `globals.scss` is homepage-specific: `padding-top: 26rem` (for hero banner). Other pages using `.home` class name must override this
- `.login-home` class overrides layout for login/auth pages: `padding: 0`, static navbar positioning

## Coding Conventions

### Components
- All components are **function components** with hooks. Do NOT use `React.FC`, class components, or `forwardRef`.
- All pages use `'use client'` directive since they rely on client-side hooks.
- Component names MUST start with uppercase (e.g., `ResetPassword`, not `resetPassword`).
- Export page components as `export default function PageName()`.

### Styling (CSS Framework Coexistence)

Four CSS frameworks coexist. Each has a specific role — do not mix their responsibilities:

- **Bulma** — primary layout and UI components (grid, navbar, cards, buttons). Loaded globally via `src/assets/bulma.scss`.
- **Emotion CSS-in-JS** — page-level scoped styles. Use `css` template literal from `@emotion/react`. When using the `css` prop, add `/** @jsxImportSource @emotion/react */` as the **first line** of the file (before `'use client'`).
- **MUI 6** — only for Alert, Snackbar, and similar feedback components. No global MUI Theme is used; import components individually.
- **Tailwind CSS 3** — utility classes, lightly used. **CRITICAL: Tailwind preflight is disabled** (`corePlugins: { preflight: false }` in `tailwind.config.ts`). Do NOT re-enable it — it would break Bulma's base styles.

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

### HTTP Client

Configured Axios instance in `src/lib/http.ts` (imported as `HTTP`):

- **Base URL**: `NEXT_PUBLIC_BASE_API_URL` env var or `/api` default
- **Timeout**: 60 seconds
- **JSON parsing**: Uses `json-bigint` (`storeAsString: true`) instead of `JSON.parse` to preserve large number precision
- **CSRF**: `xsrfCookieName: 'csrfToken'`, `xsrfHeaderName: 'x-csrf-token'`
- **Success response**: `res.status === 0` — interceptor returns `res` directly
- **Error status codes** (response interceptor):
  - `40001` / `40002` / `40003` — invalid/expired token, or logged in on another client (triggers logout)
  - `40005` — account not activated (redirects to `/activate`)
  - `40008` — non-VIP account (redirects to `/purchase`)
- Non-zero status responses are rejected via `Promise.reject(res)`

### Auth Flow

`src/utils/auth.js` manages authentication state via localStorage:

- **Login** (`auth.login(loginData)`): stores `user` (JSON), `token`, `is-authenticated` in localStorage
- **Logout** (`auth.logout()`): removes `user`, `token`, `permission`, `is-authenticated`
- **SSR safety**: all methods guard with `typeof window !== 'undefined'`
- **Locale**: stored in both localStorage (`locale`) and Cookie (`locale` via `js-cookie`) for SSR access
- **Other stored keys**: `symbols`, `exchanges`, `refreshinterval` (min 10s)

### Form Validation
- Use `getInvalidFields(formData, rules())` from `src/utils/validator.js`.
- Returns `false` if valid, or `{ fieldName: "error message string" }` if invalid.
- Invalid field values are **strings**, not arrays.

## Testing

### Unit / Component Tests (Vitest + React Testing Library)

- **Config**: `vitest.config.ts` — environment: `jsdom`, globals: `true`
- **Test location**: `src/__tests__/**/*.test.{ts,tsx}`
- **Setup file**: `src/__tests__/setup.tsx` provides global mocks:
  - `localStorage` — in-memory mock, cleared `beforeEach`
  - `next/navigation` — mocked `useRouter`, `usePathname`, `useSearchParams`
  - `next/image` — renders plain `<img>`
  - `next/link` — renders plain `<a>`
  - `react-i18next` — `useTranslation` returns key as-is (`t(key) → key`)
  - `@/i18n` — empty mock
- **Coverage**: v8 provider, covers `src/utils/**`, `src/store/**`, `src/components/**`
- **Conventions**:
  - File naming: `*.test.ts` (utils) or `*.test.tsx` (components)
  - Use `describe` / `it` blocks
  - Zustand store tests: use `act()` wrapper, access via `useStore.getState()` / `useStore.setState()`

### E2E Tests (Playwright)

- **Config**: `playwright.config.ts`
- **Test location**: `e2e/`
- **Browser**: Chromium only
- **Base URL**: `http://localhost:3000`
- **Dev server**: auto-starts via `npm run dev` (reuses existing server outside CI)
- **CI settings**: `forbidOnly`, 2 retries, single worker

## ESLint

- ESLint 9 flat config (`eslint.config.mjs`), NOT `.eslintrc.json`.
- Key rules: `no-unused-vars` is OFF (handled by `@typescript-eslint/no-unused-vars` as warn).
- Prettier integration enabled.

## Git Conventions

- Full git workflow (worktree, branching, PR, cleanup) is defined in the **global `~/.claude/CLAUDE.md`**. Follow that pipeline for all feature work.
- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `style:`, `refactor:`, `test:`, `revert:`.
- Enforced by commitlint + Husky pre-commit hooks.

### Pre-commit Hook Chain

```
git commit
  → .husky/pre-commit → npx lint-staged
      → *.{js,jsx,ts,tsx}: eslint --fix + prettier --write
      → *.{css,scss}: stylelint --fix + prettier --write
  → .husky/commit-msg → npx commitlint --edit
      → validates Conventional Commits format
```

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
- Do NOT enable Tailwind preflight — it will break Bulma's base styles.
- Vitest globals are enabled — no need to import `describe`, `it`, `expect`, `vi`.
