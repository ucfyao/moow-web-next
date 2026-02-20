import { test, expect } from '@playwright/test';
import { mockAuthenticated, mockCaptchaAPI, mockCommonAPIs, mockLogoutAPI } from './helpers';

test.describe('Authentication', () => {
  test('login page renders form and captcha', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[name="captcha"]')).toBeVisible();
    // Captcha SVG should be rendered
    await expect(page.locator('svg')).toBeVisible();
  });

  test('login page shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Click the login button using CSS selector (text is i18n-dependent)
    await page.click('button.button.is-link.is-fullwidth');

    // Should show validation error messages
    await expect(page.locator('.help.is-danger').first()).toBeVisible();
  });

  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
  });

  test('login page has link to forget password', async ({ page }) => {
    await page.goto('/login');

    const forgetLink = page.locator('a[href="/forgetPassword"]');
    await expect(forgetLink).toBeVisible();
  });

  test('forget password page renders', async ({ page }) => {
    await page.goto('/forgetPassword');

    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('Authentication - Login Flow', () => {
  test('successful login redirects to home and sets localStorage', async ({ page }) => {
    // Mock captcha API
    await mockCaptchaAPI(page);

    // Mock login API - the login page uses axios directly, so response.data is the raw body
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            _id: '1',
            email: 'test@test.com',
            nick_name: 'TestUser',
            vipLevel: 1,
          },
          token: 'mock-token-123',
        }),
      }),
    );

    await page.goto('/login');

    // Fill in the login form
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="captcha"]', 'ABCD');

    // Click the login button (CSS selector, not text-dependent)
    await page.click('button.button.is-link.is-fullwidth');

    // Wait for navigation to home page
    await page.waitForURL('/', { timeout: 10000 });

    // Verify localStorage is set
    const isAuth = await page.evaluate(() => window.localStorage.getItem('is-authenticated'));
    expect(isAuth).toBe('true');

    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(token).toBe('mock-token-123');

    const user = await page.evaluate(() => window.localStorage.getItem('user'));
    expect(user).not.toBeNull();
    const parsedUser = JSON.parse(user!);
    expect(parsedUser.email).toBe('test@test.com');
  });

  test('login with API error shows error message', async ({ page }) => {
    await mockCaptchaAPI(page);

    // Mock login API to return an error
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      }),
    );

    await page.goto('/login');

    // Fill in the form
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.fill('input[name="captcha"]', 'ABCD');

    // Click login
    await page.click('button.button.is-link.is-fullwidth');

    // Wait for error alert to appear (MUI Snackbar)
    await expect(page.locator('.MuiAlert-root')).toBeVisible({ timeout: 10000 });
  });

  test('login form shows validation errors for invalid email', async ({ page }) => {
    await mockCaptchaAPI(page);
    await page.goto('/login');

    // Fill invalid email
    await page.fill('input[name="email"]', 'not-an-email');
    // Trigger blur to invoke validation
    await page.locator('input[name="password"]').click();

    // Wait for validation error on email field
    await expect(
      page.locator('.field:has(#login-email) .help.is-danger').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('login with redirect parameter navigates to target page after login', async ({ page }) => {
    await mockCaptchaAPI(page);

    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { _id: '1', email: 'test@test.com', nick_name: 'TestUser', vipLevel: 1 },
          token: 'mock-token-123',
        }),
      }),
    );

    // Navigate to login with redirect param
    await page.goto('/login?redirect=/aip');

    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="captcha"]', 'ABCD');
    await page.click('button.button.is-link.is-fullwidth');

    // Should redirect to the specified page
    await page.waitForURL('**/aip', { timeout: 10000 });
  });
});

test.describe('Authentication - Signup Flow', () => {
  test('successful signup redirects to activation page', async ({ page }) => {
    await mockCaptchaAPI(page);

    // Mock signup API
    await page.route('**/api/v1/auth/signup', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            _id: 'new-user-1',
            email: 'newuser@test.com',
          },
        }),
      }),
    );

    await page.goto('/signup');

    // Fill signup form
    await page.fill('input[name="email"]', 'newuser@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.fill('input[name="captcha"]', 'ABCD');

    // Click signup button (CSS selector, not text-dependent)
    await page.click('button.button.is-link.is-fullwidth');

    // Should show success message (MUI Alert)
    await expect(page.locator('.MuiAlert-root')).toBeVisible({ timeout: 10000 });

    // Should redirect to activate page after timeout
    await page.waitForURL('**/activate/**', { timeout: 15000 });
  });

  test('signup page has link to login', async ({ page }) => {
    await page.goto('/signup');

    // The card footer contains the login link
    const loginLink = page.locator('.card-footer a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });

  test('signup with API error shows error message', async ({ page }) => {
    await mockCaptchaAPI(page);

    await page.route('**/api/v1/auth/signup', (route) =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email already registered' }),
      }),
    );

    await page.goto('/signup');

    await page.fill('input[name="email"]', 'existing@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.fill('input[name="captcha"]', 'ABCD');
    await page.click('button.button.is-link.is-fullwidth');

    // Should show error alert
    await expect(page.locator('.MuiAlert-root')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Authentication - Logout Flow', () => {
  test('logout from profile page clears auth state and redirects to home', async ({ page }) => {
    // Setup authenticated state
    await mockAuthenticated(page);
    await mockCommonAPIs(page);
    await mockLogoutAPI(page);

    // Handle window.confirm dialog for logout
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.goto('/ucenter/profile');

    // Wait for the page to finish loading
    await page.waitForSelector('.button.is-danger.is-outlined', { timeout: 10000 });

    // Click the logout button
    await page.click('.button.is-danger.is-outlined');

    // Should redirect to home page
    await page.waitForURL('/', { timeout: 10000 });

    // Verify localStorage is cleared
    const isAuth = await page.evaluate(() => window.localStorage.getItem('is-authenticated'));
    expect(isAuth).toBeNull();

    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
