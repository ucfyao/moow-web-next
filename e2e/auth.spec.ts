import { test, expect } from '@playwright/test';

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

    await page.click('button:has-text("sign_in")');

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
