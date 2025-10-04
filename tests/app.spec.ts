import { test, expect } from '@playwright/test';

test.describe('Restaurant Daily Landing Page', () => {
  test('should load homepage and display all sections', async ({ page }) => {
    await page.goto('/');

    // Hero Section
    await expect(page.locator('h1')).toContainText('Simplify Your Restaurant');
    await expect(page.locator('text=Stop chasing receipts')).toBeVisible();
    await expect(page.locator('text=Secure • Mobile-First • Built for Indian Restaurants')).toBeVisible();
    await expect(page.locator('img[alt="Restaurant Daily Logo"]')).toBeVisible();

    // Primary CTA
    const ctaButtons = page.locator('a:has-text("Get Started Free")');
    await expect(ctaButtons.first()).toBeVisible();

    // Features Section
    await expect(page.locator('text=Everything You Need to Run Your Restaurant')).toBeVisible();
    await expect(page.locator('text=Daily Cash Reconciliation')).toBeVisible();
    await expect(page.locator('text=Real-Time Payment Tracking')).toBeVisible();
    await expect(page.locator('text=Team Management')).toBeVisible();

    // Feature details
    await expect(page.locator('text=Balance your cash drawer in under 2 minutes')).toBeVisible();
    await expect(page.locator('text=Automatic cash counting')).toBeVisible();
    await expect(page.locator('text=Role-based permissions')).toBeVisible();

    // How It Works Section
    await expect(page.locator('text=Get Started in 3 Simple Steps')).toBeVisible();
    await expect(page.locator('text=Sign Up with WhatsApp')).toBeVisible();
    await expect(page.locator('text=Set Up Your Restaurant')).toBeVisible();
    await expect(page.locator('text=Start Tracking')).toBeVisible();

    // Social Proof Section
    await expect(page.locator('h2:has-text("Built for Indian Restaurants")')).toBeVisible();
    await expect(page.locator('text=Average cash reconciliation time')).toBeVisible();
    await expect(page.locator('text=Secure WhatsApp authentication')).toBeVisible();

    // Final CTA Section
    await expect(page.locator('text=Ready to Simplify Your Restaurant Operations?')).toBeVisible();

    // Footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=© 2025 Mindweave Technologies')).toBeVisible();

    // Check page title and icons
    await expect(page).toHaveTitle(/Restaurant Daily/);
    const icons = page.locator('svg');
    await expect(icons.first()).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Hero should be visible
    await expect(page.locator('h1')).toContainText('Simplify Your Restaurant');
    await expect(page.locator('img[alt="Restaurant Daily Logo"]')).toBeVisible();

    // CTA should be visible and clickable
    const cta = page.locator('a:has-text("Get Started Free")').first();
    await expect(cta).toBeVisible();

    // Features should stack vertically
    await expect(page.locator('text=Daily Cash Reconciliation')).toBeVisible();
    await expect(page.locator('text=Real-Time Payment Tracking')).toBeVisible();

    // Footer should be visible
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check CTA link
    const ctaLink = page.locator('a:has-text("Get Started Free")').first();
    await expect(ctaLink).toHaveAttribute('href', '/auth/phone');

    // Check footer links exist
    await expect(page.locator('footer a:has-text("About Mindweave")')).toBeVisible();
  });
});