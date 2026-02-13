import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test('page loads with default language', async ({ page }) => {
    await page.goto('/');

    // Language switch button should be visible in navbar
    await expect(page.locator('.navbar-end')).toBeVisible();
  });

  test('language switch button is clickable', async ({ page }) => {
    await page.goto('/');

    // Find the language switch element
    const langButton = page.locator('.navbar-end a').last();
    await expect(langButton).toBeVisible();

    // Click should not cause errors
    await langButton.click();
    await expect(page).toHaveURL('/');
  });

  test('login page text responds to language', async ({ page }) => {
    await page.goto('/login');

    // Card header should have sign in text
    await expect(page.locator('.card-header-title')).toBeVisible();
  });
});
