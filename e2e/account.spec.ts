import { test, expect } from '@playwright/test';
import {
  mockAuthenticated,
  mockCommonAPIs,
  mockStrategiesAPI,
} from './helpers';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockCommonAPIs(page);
  });

  test('profile page loads and displays user info', async ({ page }) => {
    await page.goto('/ucenter/profile');

    // Wait for loading to complete
    await page.waitForSelector('.box .title.is-5', { timeout: 15000 });

    // Verify user email is displayed (in a disabled input)
    const emailInput = page.locator('input[type="text"][disabled]').first();
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue('test@test.com');
  });

  test('profile page shows nickname field', async ({ page }) => {
    await page.goto('/ucenter/profile');

    await page.waitForSelector('.box .title.is-5', { timeout: 15000 });

    // Verify nickname input is editable
    const nicknameInput = page.locator('input[type="text"]:not([disabled])').first();
    await expect(nicknameInput).toBeVisible();
    await expect(nicknameInput).toHaveValue('TestUser');
  });

  test('profile page shows VIP status', async ({ page }) => {
    await page.goto('/ucenter/profile');

    await page.waitForSelector('.box .title.is-5', { timeout: 15000 });

    // Should show VIP status tag
    const vipTag = page.locator('.tag');
    await expect(vipTag).toBeVisible();
  });

  test('profile page has save, change password, and logout buttons', async ({ page }) => {
    await page.goto('/ucenter/profile');

    await page.waitForSelector('.action-buttons', { timeout: 15000 });

    // Save button
    await expect(page.locator('.button.is-link')).toBeVisible();

    // Change password link
    await expect(page.locator('a[href="/ucenter/changePassword"]')).toBeVisible();

    // Logout button
    await expect(page.locator('.button.is-danger.is-outlined')).toBeVisible();
  });

  test('updating nickname calls PATCH API', async ({ page }) => {
    await page.goto('/ucenter/profile');

    await page.waitForSelector('.action-buttons', { timeout: 15000 });

    // Clear nickname and type new one
    const nicknameInput = page.locator('input[type="text"]:not([disabled])').first();
    await nicknameInput.fill('NewNickname');

    // Click save and wait for PATCH request
    const patchPromise = page.waitForRequest(
      (req) => req.url().includes('/api/v1/users/') && req.method() === 'PATCH',
      { timeout: 10000 },
    );
    await page.click('.button.is-link');
    const patchRequest = await patchPromise;

    // Verify the request was made with the correct nickname
    const body = patchRequest.postDataJSON();
    expect(body.nick_name).toBe('NewNickname');
  });
});

test.describe('Assets Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockCommonAPIs(page);
    await mockStrategiesAPI(page);
  });

  test('assets page loads and shows account info', async ({ page }) => {
    await page.goto('/ucenter/assets');

    // Wait for page to load
    await page.waitForSelector('.title.is-5', { timeout: 15000 });

    // Should display account info section
    await expect(page.locator('.info-item').first()).toBeVisible();

    // Should show email
    await expect(page.locator('.info-value').first()).toContainText('test@test.com');
  });

  test('assets page shows strategy summary cards', async ({ page }) => {
    await page.goto('/ucenter/assets');

    await page.waitForSelector('.summary-card', { timeout: 15000 });

    // Should show 4 summary cards
    const summaryCards = page.locator('.summary-card');
    await expect(summaryCards).toHaveCount(4);
  });

  test('assets page shows XBT balance section', async ({ page }) => {
    await page.goto('/ucenter/assets');

    await page.waitForSelector('.xbt-balance', { timeout: 15000 });

    // Should display XBT amount
    await expect(page.locator('.xbt-amount')).toContainText('100');
    await expect(page.locator('.xbt-unit')).toContainText('XBT');
  });

  test('assets page shows VIP status', async ({ page }) => {
    await page.goto('/ucenter/assets');

    await page.waitForSelector('.tag', { timeout: 15000 });

    const vipTag = page.locator('.tag').first();
    await expect(vipTag).toBeVisible();
  });
});

test.describe('Invite Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockCommonAPIs(page);
  });

  test('invite page loads and shows invite code', async ({ page }) => {
    await page.goto('/ucenter/invite');

    // Wait for page to load
    await page.waitForSelector('.invite-code-display', { timeout: 15000 });

    // Should display invite code
    await expect(page.locator('.invite-code-display .code')).toContainText('ABC123');
  });

  test('invite page shows invite link input and copy button', async ({ page }) => {
    await page.goto('/ucenter/invite');

    await page.waitForSelector('.invite-link-section', { timeout: 15000 });

    // Should have invite link input (readonly)
    const linkInput = page.locator('.invite-link-row input');
    await expect(linkInput).toBeVisible();

    // Should have copy and poster buttons
    const copyButton = page.locator('.invite-link-row .button.is-info');
    await expect(copyButton).toBeVisible();
  });

  test('invite page shows invite history table', async ({ page }) => {
    await page.goto('/ucenter/invite');

    // Wait for history table
    await page.waitForSelector('table.table', { timeout: 15000 });

    // Should show invited user
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('invite page shows QR code section', async ({ page }) => {
    await page.goto('/ucenter/invite');

    await page.waitForSelector('.qr-section', { timeout: 15000 });

    // QR code canvas should be rendered
    await expect(page.locator('.qr-section canvas')).toBeVisible();
  });
});
