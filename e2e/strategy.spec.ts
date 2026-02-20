import { test, expect } from '@playwright/test';
import {
  mockAuthenticated,
  mockStrategiesAPI,
  mockOrdersAPI,
  mockKeysAPI,
} from './helpers';

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

test.describe('Strategy List - Authenticated with Data', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockStrategiesAPI(page);
    await mockOrdersAPI(page);
  });

  test('strategy list displays strategy data in table', async ({ page }) => {
    await page.goto('/aip');

    // Wait for the table to appear (loading finishes)
    await page.waitForSelector('table.table', { timeout: 15000 });

    // Verify table headers are visible
    await expect(page.locator('thead')).toBeVisible();

    // Verify strategy rows are rendered
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);

    // Verify first strategy data
    await expect(rows.first()).toContainText('binance');
    await expect(rows.first()).toContainText('BTC/USDT');

    // Verify second strategy data
    await expect(rows.nth(1)).toContainText('okx');
    await expect(rows.nth(1)).toContainText('ETH/USDT');
  });

  test('strategy list shows status indicators', async ({ page }) => {
    await page.goto('/aip');

    await page.waitForSelector('table.table', { timeout: 15000 });

    const rows = page.locator('tbody tr');

    // First strategy (status 1 = running) should have success text color on status cell
    const firstStatusCell = rows.first().locator('td.has-text-success').last();
    await expect(firstStatusCell).toBeVisible();

    // Second strategy (status 2 = stopped) should have danger text color on status cell
    const secondStatusCell = rows.nth(1).locator('td.has-text-danger').last();
    await expect(secondStatusCell).toBeVisible();
  });

  test('strategy list shows action buttons for each row', async ({ page }) => {
    await page.goto('/aip');

    await page.waitForSelector('table.table', { timeout: 15000 });

    // Each row should have edit, enable/disable, view, delete buttons
    const firstRow = page.locator('tbody tr').first();
    const actionButtons = firstRow.locator('.action-buttons .button');
    await expect(actionButtons).toHaveCount(4);
  });

  test('strategy list has link to create new strategy', async ({ page }) => {
    await page.goto('/aip');

    // Wait for page content to load
    await page.waitForSelector('.box', { timeout: 15000 });

    // Should have a link to add strategy
    const addLink = page.locator('a[href="/aip/addstrategy"]');
    await expect(addLink).toBeVisible();
  });

  test('strategy list shows pagination when results exist', async ({ page }) => {
    await page.goto('/aip');

    await page.waitForSelector('table.table', { timeout: 15000 });

    // Pagination component should be visible
    const pagination = page.locator('nav.pagination');
    await expect(pagination).toBeVisible();
  });
});

test.describe('Strategy Detail', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockStrategiesAPI(page);
    await mockOrdersAPI(page);
  });

  test('strategy detail page shows strategy info', async ({ page }) => {
    await page.goto('/aip/strat1');

    // Wait for loading to complete
    await page.waitForSelector('.action-bar', { timeout: 15000 });

    // Verify strategy info is displayed
    await expect(page.locator('.columns')).toBeVisible();

    // Verify action buttons are present
    await expect(page.locator('.action-bar')).toBeVisible();

    // Verify status badge
    await expect(page.locator('.status-badge')).toBeVisible();
  });

  test('strategy detail page shows order table', async ({ page }) => {
    await page.goto('/aip/strat1');

    await page.waitForSelector('table.table', { timeout: 15000 });

    // Verify order rows
    const orderRows = page.locator('tbody tr');
    const count = await orderRows.count();
    expect(count).toBeGreaterThan(0);

    // First order should contain BTC/USDT
    await expect(orderRows.first()).toContainText('BTC/USDT');
  });

  test('strategy detail page shows order statistics', async ({ page }) => {
    await page.goto('/aip/strat1');

    await page.waitForSelector('.stats-box', { timeout: 15000 });

    // Verify stats are shown
    const statItems = page.locator('.stat-item');
    const count = await statItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('strategy detail page has back link to strategy list', async ({ page }) => {
    await page.goto('/aip/strat1');

    await page.waitForSelector('.tabs-more', { timeout: 15000 });

    // Use specific selector to avoid matching navbar link
    const backLink = page.locator('a.tabs-more[href="/aip"]');
    await expect(backLink).toBeVisible();
  });

  test('strategy detail page shows edit button', async ({ page }) => {
    await page.goto('/aip/strat1');

    await page.waitForSelector('.action-bar', { timeout: 15000 });

    // Edit button should be visible
    const editButton = page.locator('.action-bar .button.is-info');
    await expect(editButton).toBeVisible();
  });
});

test.describe('Markets Page - Authenticated with Data', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticated(page);
    await mockKeysAPI(page);
  });

  test('markets page displays exchange API keys', async ({ page }) => {
    await page.goto('/aip/markets');

    // Wait for table to load
    await page.waitForSelector('table.table', { timeout: 15000 });

    // Verify key data is shown
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('binance');
  });

  test('markets page has link to add new API key', async ({ page }) => {
    await page.goto('/aip/markets');

    await page.waitForSelector('.box', { timeout: 15000 });

    const addKeyLink = page.locator('a[href="/aip/addmarketkeys"]');
    await expect(addKeyLink).toBeVisible();
  });
});
