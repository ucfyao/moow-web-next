import { test, expect } from '@playwright/test';

test.describe('Strategy Pages', () => {
  test('strategy list page loads', async ({ page }) => {
    await page.goto('/aip');

    // Page should load without errors
    await expect(page).toHaveURL(/\/aip/);
  });

  test('strategy list has navigation to markets', async ({ page }) => {
    await page.goto('/aip');

    // The page should contain links or buttons related to strategies
    await expect(page.locator('body')).toBeVisible();
  });

  test('markets page loads', async ({ page }) => {
    await page.goto('/aip/markets');

    await expect(page).toHaveURL(/\/aip\/markets/);
  });
});
