import { Page } from '@playwright/test';

/**
 * Mock authenticated state by setting localStorage via addInitScript.
 * This runs before any page navigation, so auth checks see the values immediately.
 */
export async function mockAuthenticated(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('is-authenticated', 'true');
    window.localStorage.setItem('token', 'mock-token-123');
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        _id: '1',
        email: 'test@test.com',
        nick_name: 'TestUser',
        vipLevel: 1,
        seq_id: '1',
      }),
    );
    // Zustand persisted store also needs user info for Navbar to show authenticated UI
    window.localStorage.setItem(
      'x-user-storage',
      JSON.stringify({
        state: { userInfo: { email: 'test@test.com', name: 'TestUser' } },
        version: 0,
      }),
    );
  });
}

/**
 * Setup captcha API mock — returns an SVG string.
 * Login page expects raw SVG string, signup page also uses it.
 */
export async function mockCaptchaAPI(page: Page) {
  await page.route('**/api/v1/captcha*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><text x="10" y="30">ABCD</text></svg>',
    }),
  );
}

/**
 * Setup common API mocks used across multiple pages.
 * Includes captcha and user endpoints.
 */
export async function mockCommonAPIs(page: Page) {
  await mockCaptchaAPI(page);

  // Mock user profile endpoint — match /api/v1/users/ followed by any path
  await page.route(/\/api\/v1\/users\//, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 0,
          data: {
            _id: '1',
            email: 'test@test.com',
            nick_name: 'TestUser',
            vip_time_out_at: '2027-12-31T00:00:00Z',
            is_activated: true,
            created_at: '2024-01-01T00:00:00Z',
            XBT: '100',
            invitation_code: 'ABC123',
            invite_reward: '5',
            invite_total: '50',
            invitations: [
              {
                _id: 'inv1',
                email: 'friend@test.com',
                created_at: '2024-06-01T00:00:00Z',
              },
            ],
          },
        }),
      });
    } else if (route.request().method() === 'PATCH') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 0 }),
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock strategies API — handles both list and single strategy endpoints.
 * Uses regex patterns so query params are matched correctly.
 */
export async function mockStrategiesAPI(page: Page) {
  // Use a single route handler with regex to handle both list and detail routes
  await page.route(/\/api\/v1\/strategies/, (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Check if this is a single strategy detail (has an ID after /strategies/)
    const isDetail = /\/api\/v1\/strategies\/[^?/]/.test(url);

    if (isDetail) {
      if (method === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 0,
            data: {
              info: {
                _id: 'strat1',
                created_at: '2024-03-15T10:30:00Z',
                exchange: 'binance',
                symbol: 'BTC/USDT',
                quote: 'BTC',
                quote_total: 0.05,
                price_native: '65000',
                price_total: 0,
                base: 'USDT',
                base_limit: 100,
                base_total: 1000,
                profit: 150,
                profit_percentage: 15,
                stop_profit_percentage: 30,
                price_usd: '65000',
                status: 1,
              },
              symbolPrice: { price_usd: '65000' },
            },
          }),
        });
      } else if (method === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 0 }),
        });
      } else if (method === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 0 }),
        });
      } else {
        route.continue();
      }
    } else {
      // List endpoint: /api/v1/strategies or /api/v1/strategies?...
      if (method === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 0,
            data: {
              list: [
                {
                  _id: 'strat1',
                  created_at: '2024-03-15T10:30:00Z',
                  exchange: 'binance',
                  symbol: 'BTC/USDT',
                  base_total: 1000,
                  quote_total: 0.05,
                  price_native: 65000,
                  profit: 150,
                  profit_percentage: 15,
                  status: 1,
                },
                {
                  _id: 'strat2',
                  created_at: '2024-04-01T08:00:00Z',
                  exchange: 'okx',
                  symbol: 'ETH/USDT',
                  base_total: 500,
                  quote_total: 0.25,
                  price_native: 3200,
                  profit: -20,
                  profit_percentage: -4,
                  status: 2,
                },
              ],
              pageNumber: 1,
              pageSize: 20,
              total: 2,
            },
          }),
        });
      } else if (method === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 0, data: { id: 'new-strat' } }),
        });
      } else {
        route.continue();
      }
    }
  });
}

/**
 * Mock orders API.
 */
export async function mockOrdersAPI(page: Page) {
  await page.route(/\/api\/v1\/orders/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 0,
        data: {
          list: [
            {
              _id: 'ord1',
              created_at: '2024-03-16T12:00:00Z',
              symbol: 'BTC/USDT',
              side: 'buy',
              price: '64000',
              amount: '0.001',
              funds: '64',
              record_amount: '0.001',
              avg_price: '64000',
              base_total: 64,
              value_total: 65,
              cost: '64',
            },
            {
              _id: 'ord2',
              created_at: '2024-03-17T12:00:00Z',
              symbol: 'BTC/USDT',
              side: 'buy',
              price: '63000',
              amount: '0.001',
              funds: '63',
              record_amount: '0.001',
              avg_price: '63000',
              base_total: 127,
              value_total: 130,
              cost: '63',
            },
          ],
          total: 2,
        },
      }),
    });
  });
}

/**
 * Mock keys (exchange API keys) endpoint.
 */
export async function mockKeysAPI(page: Page) {
  await page.route(/\/api\/v1\/keys/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 0,
        data: {
          list: [
            {
              _id: 'key1',
              exchange: 'binance',
              access_key: 'abc***',
              secret_show: '***xyz',
              desc: 'My Binance',
              created_at: '2024-01-15T00:00:00Z',
            },
          ],
          total: 1,
        },
      }),
    });
  });
}

/**
 * Mock logout API.
 */
export async function mockLogoutAPI(page: Page) {
  await page.route('**/api/v1/auth/logout', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 0 }),
    }),
  );
}
