# Exchange API Key Management Design (S7)

## Date: 2026-02-14

## Overview

Migrate the exchange API key management pages from Vue 2 (moow-web) to Next.js 15 (moow-web-next). Two pages: key list (`/aip/markets`) and add key (`/aip/addmarketkeys`).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/keys` | List all exchange keys (paginated, desensitized) |
| POST | `/api/v1/keys` | Create key (validates via CCXT fetchBalance) |
| DELETE | `/api/v1/keys/:id` | Soft-delete key |

Auth: `token` + `user_id` headers (handled by HTTP client interceptor).

## Pages

### Markets Page (`/aip/markets`)

- Table: exchange name, desensitized access_key, desensitized secret_key, created_at, delete button
- Delete: confirm dialog → DELETE API → refresh list → success toast
- Link to `/aip/addmarketkeys`
- Empty state when no keys

### Add Market Keys Page (`/aip/addmarketkeys`)

- Exchange selection grid with images from `/public/images/{exchange}.png`
- Form: exchange, access_key, secret_key, desc
- Validation via `getInvalidFields()`
- POST → success toast ("Key validated and saved") → redirect to `/aip/markets`
- Error: Snackbar with API error message

## Patterns

- MUI Snackbar/Alert for feedback (consistent with login/signup)
- HTTP client via `/api` proxy (not hardcoded URLs)
- Emotion CSS-in-JS + Bulma layout
- i18n via `react-i18next`
- date-fns for date formatting

## Decisions

- Include `desc` (remark) field in form
- Redirect to key list after successful creation
- Show success toast (not detailed balance) for CCXT validation
