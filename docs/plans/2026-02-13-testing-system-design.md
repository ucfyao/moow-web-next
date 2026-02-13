# Testing System Design

## Tech Stack

- **Unit / Component tests**: Vitest + React Testing Library + jsdom
- **E2E tests**: Playwright
- **Coverage**: Vitest v8 coverage

## Directory Structure

```
src/
├── __tests__/
│   ├── utils/
│   │   ├── auth.test.ts
│   │   ├── validator.test.ts
│   │   ├── util.test.ts
│   │   └── defines.test.ts
│   ├── store/
│   │   ├── index.test.ts
│   │   └── user.test.ts
│   └── components/
│       ├── Navbar.test.tsx
│       ├── Pagination.test.tsx
│       ├── Tip.test.tsx
│       └── Footer.test.tsx
e2e/
├── auth.spec.ts
├── strategy.spec.ts
├── navigation.spec.ts
└── i18n.spec.ts
```

## npm Scripts

- `test` — Run Vitest unit/component tests
- `test:e2e` — Run Playwright E2E tests
- `test:coverage` — Run tests with coverage report

## Unit Tests

### auth.test.ts (~10 cases)
- `login()`: valid `{ user, token }` → writes to localStorage, returns true
- `login()`: non-object input → returns false
- `logout()`: clears all auth-related localStorage items
- `isAuthenticated()`: true after login, false after logout
- `getToken()` / `getUser()`: reads correct stored values
- `getUser()`: invalid JSON in localStorage → returns null without throwing
- `setSymbols` / `getSymbols`: array ↔ comma-separated string conversion
- `getRefreshInterval()`: values < 10 corrected to 10

### validator.test.ts (~8 cases)
- `validate()`: empty email → returns error array
- `validate()`: valid data → returns false
- `getInvalidFields()`: returns `{ field: message }` format
- Edge cases: null/undefined data or rules → no crash

### util.test.ts (~10 cases)
- `formatNumber()`: normal values, NaN, custom precision
- `readableNumber()`: < 100k, 100k~1B, > 1B ranges
- `formatDate()`: valid dates, empty values
- `desensitization()`: phone, email, ID card, bank card masking

### defines.test.ts (~3 cases)
- `fetchExchangeSymbolList()`: binance/huobipro/other exchanges return correct symbol lists
- No parameter → returns base list

## Store Tests

### user.test.ts (~4 cases)
- `setUserInfo()`: updates `userInfo` correctly
- `setUserInfo(null)`: clears user info
- Initial state: `userInfo` is null

### index.test.ts (~3 cases)
- dispatch SET_SYMBOLS → state updates
- dispatch SET_EXCHANGES → state updates
- Initial state structure correct

## Component Tests

### Pagination.test.tsx (~5 cases)
- Renders correct page buttons
- Click triggers `onPageChange` callback
- First page: previous button disabled
- Last page: next button disabled
- Total 0: no render

### Tip.test.tsx (~2 cases)
- Renders content text correctly
- Renders correct class names

### Navbar.test.tsx (~4 cases)
- Not logged in: shows login/signup links
- Logged in: shows username and logout button
- Logout click: calls logout and redirects
- Language switch works

### Footer.test.tsx (~1 case)
- Renders footer content correctly

## E2E Tests

### auth.spec.ts (~6 cases)
- Visit login page → shows form and captcha
- Empty form submit → shows validation errors
- Wrong password → shows error toast
- Correct login → redirects to home, Navbar shows username
- Signup page → form renders and validates
- Forget password → send email flow

### strategy.spec.ts (~5 cases)
- Strategy list page loads → shows strategy cards/table
- Click strategy → enters detail page with chart
- Create new strategy → fill form and submit
- Strategy status toggle (enable/pause)
- Exchange API Key management page loads

### navigation.spec.ts (~4 cases)
- Homepage Banner Swiper renders
- Navbar links navigate correctly
- Unauthenticated access to protected pages → redirect to login
- Mobile responsive navigation menu

### i18n.spec.ts (~3 cases)
- Default displays English
- Switch to Chinese → all text changes
- Refresh page → language setting persists

## E2E Configuration Notes
- Use `webServer` config to auto-start `next dev`
- Auth tests use `storageState` to reuse login session
- Strategy/API Key tests may need mock API or test environment
