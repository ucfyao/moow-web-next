# Exchange API Key Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement exchange API key list and add-key pages with full API integration, i18n, validation, and delete functionality.

**Architecture:** Two page rewrites — `/aip/markets` (key list with table + delete) and `/aip/addmarketkeys` (form with exchange selector + validation). Both follow existing project patterns: MUI Snackbar for alerts, Emotion + Bulma for styling, `getInvalidFields()` for validation, project HTTP client for API calls.

**Tech Stack:** Next.js 15, React 19, TypeScript, Emotion CSS-in-JS, Bulma CSS, MUI Alert/Snackbar, react-i18next, date-fns, Vitest + React Testing Library

---

## Task 1: Add missing i18n keys

**Files:**
- Modify: `public/locales/en.json`
- Modify: `public/locales/zh.json`

**Step 1: Add new keys to en.json**

Add these keys (merge into existing structure):

```json
{
  "prompt": {
    "key_validated_saved": "API key validated and saved successfully",
    "confirm_delete_key_title": "Delete Exchange Key",
    "no_exchange_keys": "No exchange API keys yet. Add one to get started."
  }
}
```

**Step 2: Add new keys to zh.json**

```json
{
  "prompt": {
    "key_validated_saved": "API密钥验证成功并已保存",
    "confirm_delete_key_title": "删除交易所密钥",
    "no_exchange_keys": "暂无交易所API密钥，请先添加。"
  }
}
```

**Step 3: Commit**

```bash
git add public/locales/en.json public/locales/zh.json
git commit -m "feat: add i18n keys for exchange key management pages"
```

---

## Task 2: Rewrite markets page (key list)

**Files:**
- Modify: `src/app/aip/markets/page.tsx`

**Context:**
- HTTP client: `import HTTP from '@/lib/http'` — `HTTP.get('/v1/keys')` returns `{ data: { list: [...], total: N } }` (response interceptor unwraps to `res` when `status === 0`)
- Date formatting: `import util from '@/utils/util'` — `util.formatDate(date)` returns `yyyy-MM-dd HH:mm:ss`
- i18n keys already exist: `caption.market_api_keys`, `action.new_exchange_apikey`, `title.exchange`, `label.access_key`, `label.secret_key`, `label.creation_time`, `title.operations`, `action.delete`, `prompt.confirm_delete_market`, `prompt.operation_succeed`, `prompt.operation_failed`, `prompt.error_occurs`
- MUI pattern from login page: `Snackbar` + `Alert` with `alertMessage` state
- Auth: HTTP client auto-attaches `Authorization` header from localStorage `token`

**Step 1: Write the markets page**

Replace entire `src/app/aip/markets/page.tsx` with:

```tsx
/** @jsxImportSource @emotion/react */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { css } from '@emotion/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import HTTP from '@/lib/http';
import util from '@/utils/util';

interface ExchangeKey {
  _id: string;
  exchange: string;
  access_key: string;
  secret_show: string;
  desc: string;
  created_at: string;
}

export default function MarketsPage() {
  const { t } = useTranslation('');
  const [keys, setKeys] = useState<ExchangeKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await HTTP.get('/v1/keys');
      setKeys(res.data?.list || []);
    } catch (error: any) {
      const msg = error?.message || t('prompt.error_occurs');
      setAlertMessage({ type: 'error', message: msg });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleDelete = async (key: ExchangeKey) => {
    const confirmed = window.confirm(
      t('prompt.confirm_delete_market', { exchange: key.exchange }),
    );
    if (!confirmed) return;

    try {
      await HTTP.delete(`/v1/keys/${key._id}`);
      setAlertMessage({ type: 'success', message: t('prompt.operation_succeed') });
      setOpen(true);
      fetchKeys();
    } catch (error: any) {
      const msg = error?.message || t('prompt.operation_failed');
      setAlertMessage({ type: 'error', message: msg });
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div css={pageStyle} className="container">
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {alertMessage ? (
          <Alert onClose={handleClose} severity={alertMessage.type}>
            {alertMessage.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      <section className="section">
        <div className="box">
          <div className="box-header">
            <div className="tabs">
              <ul>
                <li className="is-active">
                  <a>{t('caption.market_api_keys')}</a>
                </li>
              </ul>
            </div>
            <Link href="/aip/addmarketkeys" className="button is-link is-small">
              {t('action.new_exchange_apikey')}
            </Link>
          </div>
          {loading ? (
            <p className="has-text-centered py-4">{t('prompt.loading')}</p>
          ) : keys.length === 0 ? (
            <p className="has-text-centered has-text-grey py-4">
              {t('prompt.no_exchange_keys')}
            </p>
          ) : (
            <div className="table-container">
              <table
                className="table is-fullwidth is-striped"
                style={{ minWidth: '800px', fontSize: '0.85rem' }}
              >
                <thead>
                  <tr>
                    <th>{t('title.exchange')}</th>
                    <th>{t('label.access_key')}</th>
                    <th>{t('label.secret_key')}</th>
                    <th>{t('label.creation_time')}</th>
                    <th>{t('title.operations')}</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key._id}>
                      <td>{key.exchange}</td>
                      <td>{key.access_key}</td>
                      <td>{key.secret_show}</td>
                      <td>{util.formatDate(key.created_at)}</td>
                      <td>
                        <button
                          className="button is-small is-link is-outlined"
                          onClick={() => handleDelete(key)}
                        >
                          {t('action.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const pageStyle = css`
  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .box-header .tabs {
    margin-bottom: 0;
  }

  .py-4 {
    padding: 2rem 0;
  }
`;
```

**Step 2: Verify build compiles**

Run: `cd /path/to/worktree && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/app/aip/markets/page.tsx
git commit -m "feat: implement exchange key list page with API integration"
```

---

## Task 3: Rewrite addmarketkeys page (add key form)

**Files:**
- Modify: `src/app/aip/addmarketkeys/page.tsx`

**Context:**
- Current page already has exchange selection UI and form structure, but uses direct `axios` with hardcoded URL and `alert()` instead of Snackbar
- Use `HTTP.post('/v1/keys', data)` instead of `axios.post('http://127.0.0.1:3000/api/v1/keys', data)`
- Exchange list: hardcoded to match available images in `/public/images/` (binance, huobi, okex, gateio, bitfinex, bibox, zb)
- Validation: `getInvalidFields(formData, rules())` — returns `false` if valid, `{ field: "msg" }` if invalid
- On success: Snackbar success toast → redirect to `/aip/markets`

**Step 1: Rewrite the addmarketkeys page**

Replace entire `src/app/aip/addmarketkeys/page.tsx` with:

```tsx
/** @jsxImportSource @emotion/react */
'use client';

import React, { useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { getInvalidFields } from '@/utils/validator';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import HTTP from '@/lib/http';

interface ExchangeItem {
  exchange: string;
  name: string;
  url: string;
}

interface FormData {
  exchange: string;
  access_key: string;
  secret_key: string;
  desc: string;
}

interface InvalidFields {
  exchange?: string;
  access_key?: string;
  secret_key?: string;
  desc?: string;
}

const EXCHANGE_LIST: ExchangeItem[] = [
  { exchange: 'binance', name: 'Binance', url: 'https://www.binance.com' },
  { exchange: 'huobi', name: 'Huobi', url: 'https://www.huobi.com' },
  { exchange: 'okex', name: 'OKEx', url: 'https://www.okex.com' },
  { exchange: 'gateio', name: 'Gate.io', url: 'https://www.gate.io' },
  { exchange: 'bitfinex', name: 'Bitfinex', url: 'https://www.bitfinex.com' },
  { exchange: 'bibox', name: 'Bibox', url: 'https://www.bibox.com' },
];

export default function AddMarketKeysPage() {
  const { t } = useTranslation('');
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    exchange: '',
    access_key: '',
    secret_key: '',
    desc: '',
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [open, setOpen] = useState(false);

  const rules = () => ({
    exchange: [{ required: true, message: t('validator.exchange_cant_empty') }],
    access_key: [
      { required: true, message: t('validator.key_cant_empty') },
      { max: 65, message: t('validator.input_too_long') },
    ],
    secret_key: [
      { required: true, message: t('validator.secret_cant_empty') },
      { max: 65, message: t('validator.input_too_long') },
    ],
    desc: [{ required: true, message: t('validator.desc_cant_empty') }],
  });

  function handleSelectExchange(exchange: string) {
    setFormData((prev) => ({ ...prev, exchange }));
    setInvalidFields((prev) => ({ ...prev, exchange: undefined }));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setInvalidFields((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit() {
    if (isProcessing) return;

    const errors = await getInvalidFields(formData, rules());
    if (errors) {
      setInvalidFields(errors);
      return;
    }

    setIsProcessing(true);
    try {
      await HTTP.post('/v1/keys', formData);
      setAlertMessage({ type: 'success', message: t('prompt.key_validated_saved') });
      setOpen(true);
      setTimeout(() => {
        router.push('/aip/markets');
      }, 1500);
    } catch (error: any) {
      const msg = error?.message || t('prompt.error_occurs');
      setAlertMessage({ type: 'error', message: msg });
      setOpen(true);
      setIsProcessing(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div css={pageStyle} className="container">
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {alertMessage ? (
          <Alert onClose={handleClose} severity={alertMessage.type}>
            {alertMessage.message}
          </Alert>
        ) : undefined}
      </Snackbar>
      <section className="section">
        <div className="box">
          <div className="box-header">
            <p className="is-size-6">{t('caption.new_exchange_apikey')}</p>
            <button type="button" className="button is-small" onClick={() => router.back()}>
              {t('action.go_back')}
            </button>
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.select')}
              {t('label.exchange')}
            </label>
            <div className="control">
              <ul className="exchange-list">
                {EXCHANGE_LIST.map((item) => (
                  <li
                    key={item.exchange}
                    className={`exchange-item ${formData.exchange === item.exchange ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="exchange-button"
                      onClick={() => handleSelectExchange(item.exchange)}
                    >
                      <div className="exchange-title">
                        <img src={`/images/${item.exchange}.png`} alt={item.name} />
                        {item.name}
                      </div>
                      <p className="exchange-url">{item.url}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {invalidFields.exchange && <p className="help is-danger">{invalidFields.exchange}</p>}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.access_key')}
            </label>
            <div className="control">
              <input
                className="input key-input"
                type="text"
                name="access_key"
                value={formData.access_key}
                onChange={handleInputChange}
                placeholder={t('placeholder.access_key')}
              />
            </div>
            {invalidFields.access_key && (
              <p className="help is-danger">{invalidFields.access_key}</p>
            )}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.secret_key')}
            </label>
            <div className="control">
              <input
                className="input key-input"
                type="text"
                name="secret_key"
                value={formData.secret_key}
                onChange={handleInputChange}
                placeholder={t('placeholder.secret_key')}
              />
            </div>
            {invalidFields.secret_key && (
              <p className="help is-danger">{invalidFields.secret_key}</p>
            )}
          </div>

          <div className="field">
            <label className="label">
              <span className="has-text-danger">*</span>
              {t('label.input')}
              {t('label.remark')}
            </label>
            <div className="control">
              <input
                className="input key-input"
                type="text"
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                placeholder={t('placeholder.remark')}
              />
            </div>
            {invalidFields.desc && <p className="help is-danger">{invalidFields.desc}</p>}
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button
                type="button"
                className={`button is-link ${isProcessing ? 'is-loading' : ''}`}
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {t('action.confirm')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const pageStyle = css`
  .box {
    margin: 0 auto;
    padding: 50px;
  }

  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .key-input {
    max-width: 600px;
  }

  .exchange-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .exchange-item {
    width: 168px;
    background-color: #f6f6f6;
    border-radius: 8px;
    border: 2px solid transparent;
    text-align: center;
    cursor: pointer;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
    overflow: hidden;
  }

  .exchange-item.active {
    border-color: #3273dc;
    box-shadow: 0 0 8px rgba(50, 115, 220, 0.4);
  }

  .exchange-button {
    display: block;
    width: 100%;
    padding: 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
  }

  .exchange-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .exchange-title img {
    width: 22px;
  }

  .exchange-url {
    margin-top: 8px;
    font-size: 0.85em;
    color: #888;
  }

  @media screen and (max-width: 768px) {
    .box {
      padding: 30px 10px;
    }

    .key-input {
      max-width: 100%;
    }
  }
`;
```

**Step 2: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/app/aip/addmarketkeys/page.tsx
git commit -m "feat: implement add exchange key page with validation and API integration"
```

---

## Task 4: Write tests for markets page

**Files:**
- Create: `src/__tests__/pages/markets.test.tsx`

**Context:**
- Test setup (`src/__tests__/setup.tsx`) already mocks: `next/navigation`, `next/link`, `react-i18next` (t returns key), `localStorage`
- Need to mock: `@/lib/http` (the HTTP client), `@/utils/util` (formatDate)
- Pattern from `Navbar.test.tsx`: mock modules with `vi.mock()`, render, assert text content

**Step 1: Write the test file**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockGet = vi.fn();
const mockDelete = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

// Mock util
vi.mock('@/utils/util', () => ({
  default: {
    formatDate: (date: string) => '2024-01-15 10:30:00',
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', { value: mockConfirm, writable: true });

import MarketsPage from '@/app/aip/markets/page';

describe('MarketsPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockDelete.mockReset();
    mockConfirm.mockReset();
  });

  it('renders loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {})); // never resolves
    render(<MarketsPage />);
    expect(screen.getByText('prompt.loading')).toBeInTheDocument();
  });

  it('renders empty state when no keys', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('prompt.no_exchange_keys')).toBeInTheDocument();
    });
  });

  it('renders key list from API', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: '1',
            exchange: 'binance',
            access_key: 'abc***xyz',
            secret_show: '***xyz',
            desc: 'My Binance',
            created_at: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
      },
    });
    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('binance')).toBeInTheDocument();
      expect(screen.getByText('abc***xyz')).toBeInTheDocument();
      expect(screen.getByText('***xyz')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15 10:30:00')).toBeInTheDocument();
    });
  });

  it('renders add key link', async () => {
    mockGet.mockResolvedValue({ data: { list: [], total: 0 } });
    render(<MarketsPage />);
    await waitFor(() => {
      const link = screen.getByText('action.new_exchange_apikey');
      expect(link.closest('a')).toHaveAttribute('href', '/aip/addmarketkeys');
    });
  });

  it('calls delete API when confirmed', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: '123',
            exchange: 'binance',
            access_key: 'abc***xyz',
            secret_show: '***xyz',
            desc: 'test',
            created_at: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
      },
    });
    mockDelete.mockResolvedValue({});
    mockConfirm.mockReturnValue(true);

    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('action.delete'));
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('/v1/keys/123');
    });
  });

  it('does not call delete API when cancelled', async () => {
    mockGet.mockResolvedValue({
      data: {
        list: [
          {
            _id: '123',
            exchange: 'binance',
            access_key: 'abc***xyz',
            secret_show: '***xyz',
            desc: 'test',
            created_at: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
      },
    });
    mockConfirm.mockReturnValue(false);

    render(<MarketsPage />);
    await waitFor(() => {
      expect(screen.getByText('action.delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('action.delete'));
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run the test**

Run: `npm test -- src/__tests__/pages/markets.test.tsx`
Expected: All 6 tests pass

**Step 3: Commit**

```bash
git add src/__tests__/pages/markets.test.tsx
git commit -m "test: add unit tests for exchange key list page"
```

---

## Task 5: Write tests for addmarketkeys page

**Files:**
- Create: `src/__tests__/pages/addmarketkeys.test.tsx`

**Context:**
- Need to mock: `@/lib/http`, `@/utils/validator`
- Router mock from setup: `useRouter` returns `{ push: vi.fn(), back: vi.fn() }`
- `getInvalidFields` returns `false` when valid, `{ field: "msg" }` when invalid

**Step 1: Write the test file**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock HTTP module
const mockPost = vi.fn();
vi.mock('@/lib/http', () => ({
  default: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

// Mock validator
const mockGetInvalidFields = vi.fn();
vi.mock('@/utils/validator', () => ({
  getInvalidFields: (...args: any[]) => mockGetInvalidFields(...args),
}));

import AddMarketKeysPage from '@/app/aip/addmarketkeys/page';

describe('AddMarketKeysPage', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGetInvalidFields.mockReset();
  });

  it('renders the form with exchange list', () => {
    render(<AddMarketKeysPage />);
    expect(screen.getByText('Binance')).toBeInTheDocument();
    expect(screen.getByText('Huobi')).toBeInTheDocument();
    expect(screen.getByText('OKEx')).toBeInTheDocument();
  });

  it('renders form input fields', () => {
    render(<AddMarketKeysPage />);
    expect(screen.getByPlaceholderText('placeholder.access_key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.secret_key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.remark')).toBeInTheDocument();
  });

  it('shows validation errors when form is invalid', async () => {
    mockGetInvalidFields.mockResolvedValue({
      exchange: 'validator.exchange_cant_empty',
      access_key: 'validator.key_cant_empty',
    });

    render(<AddMarketKeysPage />);
    fireEvent.click(screen.getByText('action.confirm'));

    await waitFor(() => {
      expect(screen.getByText('validator.exchange_cant_empty')).toBeInTheDocument();
      expect(screen.getByText('validator.key_cant_empty')).toBeInTheDocument();
    });
  });

  it('highlights selected exchange', () => {
    const { container } = render(<AddMarketKeysPage />);
    fireEvent.click(screen.getByText('Binance'));

    const activeItem = container.querySelector('.exchange-item.active');
    expect(activeItem).toBeInTheDocument();
  });

  it('submits form data to API when valid', async () => {
    mockGetInvalidFields.mockResolvedValue(false);
    mockPost.mockResolvedValue({ data: { _id: '123' } });

    render(<AddMarketKeysPage />);

    // Select exchange
    fireEvent.click(screen.getByText('Binance'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('placeholder.access_key'), {
      target: { value: 'test-key', name: 'access_key' },
    });
    fireEvent.change(screen.getByPlaceholderText('placeholder.secret_key'), {
      target: { value: 'test-secret', name: 'secret_key' },
    });
    fireEvent.change(screen.getByPlaceholderText('placeholder.remark'), {
      target: { value: 'test desc', name: 'desc' },
    });

    fireEvent.click(screen.getByText('action.confirm'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/v1/keys', {
        exchange: 'binance',
        access_key: 'test-key',
        secret_key: 'test-secret',
        desc: 'test desc',
      });
    });
  });

  it('shows error alert when API fails', async () => {
    mockGetInvalidFields.mockResolvedValue(false);
    mockPost.mockRejectedValue({ message: 'Invalid API key' });

    render(<AddMarketKeysPage />);
    fireEvent.click(screen.getByText('Binance'));
    fireEvent.click(screen.getByText('action.confirm'));

    await waitFor(() => {
      expect(screen.getByText('Invalid API key')).toBeInTheDocument();
    });
  });

  it('renders go back button', () => {
    render(<AddMarketKeysPage />);
    expect(screen.getByText('action.go_back')).toBeInTheDocument();
  });
});
```

**Step 2: Run the test**

Run: `npm test -- src/__tests__/pages/addmarketkeys.test.tsx`
Expected: All 7 tests pass

**Step 3: Commit**

```bash
git add src/__tests__/pages/addmarketkeys.test.tsx
git commit -m "test: add unit tests for add exchange key page"
```

---

## Task 6: Run full test suite and verify

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass (existing + new)

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Final commit if any lint fixes needed**

```bash
git add -A
git commit -m "style: fix lint issues in exchange key pages"
```

---

## Task 7: Create PR

**Step 1: Push branch**

```bash
git push -u origin feature/exchange-keys
```

**Step 2: Create PR**

```bash
gh pr create --title "feat: exchange API key management (S7)" --body "$(cat <<'EOF'
## Summary
- Rewrote exchange key list page (`/aip/markets`) with full API integration (GET/DELETE /api/v1/keys)
- Rewrote add key page (`/aip/addmarketkeys`) with form validation, exchange selector, and CCXT validation feedback
- Added MUI Snackbar alerts, i18n support, Emotion styling
- Added unit tests for both pages

## Test plan
- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run lint` — no errors
- [ ] Manual: navigate to /aip/markets, verify empty state shows
- [ ] Manual: add a key via /aip/addmarketkeys, verify success toast and redirect
- [ ] Manual: delete a key, verify confirm dialog and list refresh

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
