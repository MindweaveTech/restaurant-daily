import { test, expect } from '@playwright/test';

test.describe('Restaurant Daily App', () => {
  test('should load homepage and display core elements', async ({ page }) => {
    await page.goto('/');

    // Wait for loading to complete (the loading spinner should disappear)
    await expect(page.locator('text=Loading Restaurant Daily...')).toBeVisible();
    await expect(page.locator('text=Loading Restaurant Daily...')).toBeHidden({ timeout: 5000 });

    // Check main title and branding
    await expect(page.locator('h1')).toContainText('Restaurant Daily');
    await expect(page.locator('text=Track your restaurant\'s performance with ease')).toBeVisible();

    // Verify core feature cards are displayed
    await expect(page.locator('text=Cash Management')).toBeVisible();
    await expect(page.locator('text=Performance Tracking')).toBeVisible();
    await expect(page.locator('text=Team Management')).toBeVisible();

    // Check that feature descriptions are present
    await expect(page.locator('text=Track daily cash sessions and transactions')).toBeVisible();
    await expect(page.locator('text=Monitor sales and operational metrics')).toBeVisible();
    await expect(page.locator('text=Role-based access for your team')).toBeVisible();

    // Verify call-to-action button
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
    await expect(page.locator('text=Sign in with your phone number to continue')).toBeVisible();

    // Check that icons are loaded (ChefHat, DollarSign, TrendingUp, Users)
    const icons = page.locator('svg');
    await expect(icons).not.toHaveCount(0);

    // Verify responsive design - page should have proper container and styling
    await expect(page.locator('.container')).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle(/Restaurant Daily/);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for loading to complete
    await expect(page.locator('text=Loading Restaurant Daily...')).toBeHidden({ timeout: 5000 });

    // Check mobile layout
    await expect(page.locator('h1')).toContainText('Restaurant Daily');
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();

    // Verify feature cards are visible on mobile (they may have multiple divs)
    await expect(page.locator('text=Cash Management')).toBeVisible();
    await expect(page.locator('text=Performance Tracking')).toBeVisible();
    await expect(page.locator('text=Team Management')).toBeVisible();
  });
});