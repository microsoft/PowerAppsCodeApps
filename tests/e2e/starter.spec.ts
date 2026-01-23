import { test, expect } from '@playwright/test';

test.describe('Starter Template', () => {
  test('should load the app and display main content', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle('Power Apps');

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Power + Code' })).toBeVisible();

    // Check that the Power Apps and React logos are present
    await expect(page.getByAltText('Power Apps logo')).toBeVisible();
    await expect(page.getByAltText('React logo')).toBeVisible();
  });

  test('should have working counter button', async ({ page }) => {
    await page.goto('/');

    // Find the counter button and verify initial state
    const counterButton = page.getByRole('button', { name: /count is/i });
    await expect(counterButton).toBeVisible();
    await expect(counterButton).toHaveText('count is 0');

    // Click the button and verify the count increments
    await counterButton.click();
    await expect(counterButton).toHaveText('count is 1');

    // Click again to verify continued functionality
    await counterButton.click();
    await expect(counterButton).toHaveText('count is 2');
  });

  test('should have theme toggle', async ({ page }) => {
    await page.goto('/');

    // Check that the theme toggle button exists
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();
  });
});
