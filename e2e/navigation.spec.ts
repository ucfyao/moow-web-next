import { test, expect } from '@playwright/test';

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
    // Should have home and aip links
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
    await expect(page.locator('a[href="/aip"]')).toBeVisible();
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
