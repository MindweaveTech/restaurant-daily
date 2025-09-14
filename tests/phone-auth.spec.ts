import { test, expect } from '@playwright/test';

test.describe('Phone Authentication', () => {
  test('should display phone input page correctly', async ({ page }) => {
    await page.goto('/auth/phone');

    // Check page title and header
    await expect(page).toHaveTitle(/Restaurant Daily/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('text=Enter your phone number to receive a verification code')).toBeVisible();

    // Check back button
    await expect(page.locator('a:has-text("Back")')).toBeVisible();

    // Check Restaurant Daily branding
    await expect(page.locator('text=Restaurant Daily')).toBeVisible();

    // Verify phone input component is present
    await expect(page.locator('label:has-text("Phone Number")')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();

    // Check country selector is present (should show India flag and +91)
    await expect(page.locator('text=🇮🇳')).toBeVisible();
    await expect(page.locator('text=+91')).toBeVisible();

    // Verify submit button is present but disabled initially
    await expect(page.locator('button:has-text("Send Verification Code")')).toBeVisible();
    await expect(page.locator('button:has-text("Send Verification Code")')).toBeDisabled();

    // Check help text (using more specific selectors)
    await expect(page.locator('#submit-help')).toContainText('6-digit code via WhatsApp');

    // Check security notice
    await expect(page.locator('text=Secure Authentication')).toBeVisible();
  });

  test('should validate phone number input', async ({ page }) => {
    await page.goto('/auth/phone');

    const phoneInput = page.locator('input[type="tel"]');
    const submitButton = page.locator('button:has-text("Send Verification Code")');

    // Initially button should be disabled
    await expect(submitButton).toBeDisabled();

    // Type valid Indian mobile number
    await phoneInput.fill('8826175074');

    // Wait for validation to complete and button to be enabled
    await expect(submitButton).not.toBeDisabled({ timeout: 3000 });
  });

  test('should handle country selection', async ({ page }) => {
    await page.goto('/auth/phone');

    // Click country selector
    const countrySelector = page.locator('button').filter({ hasText: '🇮🇳' }).first();
    await countrySelector.click();

    // Verify dropdown opens
    await expect(page.locator('text=India')).toBeVisible();
    await expect(page.locator('text=United States')).toBeVisible();
    await expect(page.locator('text=United Kingdom')).toBeVisible();
    await expect(page.locator('text=Australia')).toBeVisible();

    // Select US
    await page.locator('button:has-text("United States")').click();

    // Verify US is now selected
    await expect(page.locator('text=🇺🇸')).toBeVisible();
    await expect(page.locator('text=+1')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/phone');

    // Check mobile layout
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('input[type="tel"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Verification Code")')).toBeVisible();

    // Verify the form takes full width on mobile
    const container = page.locator('.container').first();
    await expect(container).toBeVisible();

    // Check that country selector is properly sized for mobile
    await expect(page.locator('text=🇮🇳')).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/auth/phone');

    // Click back button
    await page.locator('a:has-text("Back")').click();

    // Should be on home page
    await expect(page.locator('h1')).toContainText('Restaurant Daily');
    await expect(page.locator('a:has-text("Get Started")')).toBeVisible();
  });
});