import { test, expect } from '@playwright/test';

test.describe('Vite React Template', () => {
  test('should load the app and display main content', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle('vite');

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Vite + React' })).toBeVisible();

    // Check that the Vite and React logos are present
    await expect(page.getByAltText('Vite logo')).toBeVisible();
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
});
