import { test, expect } from '@playwright/test';
import { mockAuthenticated, mockCommonAPIs, mockStrategiesAPI } from './helpers';

test.describe('Navigation', () => {
  test('homepage loads with banner', async ({ page }) => {
    await page.goto('/');

    // Page should load successfully
    await expect(page).toHaveURL('/');
    // Navbar should be visible
    await expect(page.locator('nav.navbar')).toBeVisible();
  });

  test('navbar contains main navigation links', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.navbar-start')).toBeVisible();
    // Should have home and aip links in the navbar
    await expect(page.locator('.navbar-start a[href="/"]').first()).toBeVisible();
    await expect(page.locator('.navbar-start a[href="/aip"]')).toBeVisible();
  });

  test('navbar shows login button when not authenticated', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('a[href="/login"]')).toBeVisible();
  });

  test('footer is visible on pages', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer.footer')).toBeVisible();
  });
});

test.describe('Navigation - Authenticated User Menu', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
  });

  test('authenticated user sees email in navbar instead of login button', async ({ page }) => {
    await page.goto('/');

    // Should see user email in the navbar dropdown trigger
    await expect(page.locator('.navbar-end .navbar-link')).toContainText('test@test.com');

    // Should NOT see login/signup button
    await expect(page.locator('a[href="/login"].button')).not.toBeVisible();
  });

  test('authenticated user dropdown contains navigation links', async ({ page }) => {
    await page.goto('/');

    // Hover the user dropdown to see items
    const userDropdown = page.locator('.navbar-end .has-dropdown');
    await userDropdown.hover();

    // Should see profile link
    await expect(page.locator('.navbar-dropdown a[href="/ucenter/profile"]')).toBeVisible();

    // Should see assets link
    await expect(page.locator('.navbar-dropdown a[href="/assets"]')).toBeVisible();

    // Should see invite link
    await expect(page.locator('.navbar-dropdown a[href="/invite"]')).toBeVisible();

    // Should see exchange API keys link
    await expect(page.locator('.navbar-dropdown a[href="/aip/markets"]')).toBeVisible();
  });
});

test.describe('Navigation - Protected Route Redirects', () => {
  test('visiting /ucenter/profile without auth redirects to /login', async ({ page }) => {
    await mockCommonAPIs(page);
    await page.goto('/ucenter/profile');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting /ucenter/assets without auth redirects to /login', async ({ page }) => {
    await mockCommonAPIs(page);
    await mockStrategiesAPI(page);
    await page.goto('/ucenter/assets');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting /ucenter/invite without auth redirects to /login', async ({ page }) => {
    await mockCommonAPIs(page);
    await page.goto('/ucenter/invite');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Navigation - Page Transitions', () => {
  test('clicking AIP link navigates to strategy list', async ({ page }) => {
    await page.goto('/');

    // Use the navbar-specific AIP link to avoid strict mode violation
    const aipLink = page.locator('.navbar-start a[href="/aip"]');
    await aipLink.click();

    await page.waitForURL('**/aip', { timeout: 10000 });
    await expect(page).toHaveURL(/\/aip/);
  });

  test('navbar is fixed and visible after scrolling', async ({ page }) => {
    await page.goto('/');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Navbar should still be visible (it is fixed)
    await expect(page.locator('nav.navbar')).toBeVisible();
  });

  test('language switch button toggles locale label', async ({ page }) => {
    await page.goto('/');

    // The language switch should be in the navbar-end
    const langItem = page.locator('.navbar-end > a.navbar-item').last();
    await expect(langItem).toBeVisible();

    // Get current text
    const initialText = await langItem.textContent();

    // Click to switch
    await langItem.click();

    // Text should change (English <-> Chinese)
    const newText = await langItem.textContent();
    expect(newText).not.toBe(initialText);
  });
});
