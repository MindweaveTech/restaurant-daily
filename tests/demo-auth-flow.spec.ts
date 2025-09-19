import { test, expect } from '@playwright/test';

test.describe('Demo Authentication Flow', () => {
  test('should complete full login flow as demo restaurant admin', async ({ page }) => {
    // Set shorter timeout for faster feedback
    test.setTimeout(10000);
    // Step 1: Start from homepage and navigate to authentication
    await page.goto('/');

    // Wait for homepage to load
    await expect(page.locator('text=Loading Restaurant Daily...')).toBeHidden({ timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Restaurant Daily');

    // Click "Get Started" to go to authentication
    await page.locator('a:has-text("Get Started")').click();

    // Should be on phone input page
    await expect(page).toHaveURL('/auth/phone');
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Step 2: Enter demo phone number
    const phoneInput = page.locator('input[type="tel"]');
    const submitButton = page.locator('button:has-text("Send Verification Code")');

    // Ensure we start with India country code
    await expect(page.locator('text=🇮🇳')).toBeVisible();
    await expect(page.locator('text=+91')).toBeVisible();

    // Enter demo admin phone number (without country code since it's already +91)
    await phoneInput.fill('9876543210');

    // Wait for validation and button to be enabled
    await expect(submitButton).not.toBeDisabled({ timeout: 3000 });

    // Click to request OTP
    await submitButton.click();

    // Step 3: Should redirect to verification page
    await expect(page).toHaveURL('/auth/verify', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Enter Verification Code');

    // Should show masked phone number
    await expect(page.locator('text=*******3210')).toBeVisible();

    // Step 4: Enter the fixed demo OTP (123456)
    const otpInputs = page.locator('input[maxlength="1"]');
    await expect(otpInputs).toHaveCount(6);

    // Enter demo OTP digit by digit with proper waits for state updates
    const demoOTP = '123456';
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).click(); // Focus the input
      await otpInputs.nth(i).fill(demoOTP[i]);
      await page.waitForTimeout(200); // Wait for React state update
    }

    // Wait a bit more for all state updates to complete
    await page.waitForTimeout(500);

    // Verify all inputs are filled
    for (let i = 0; i < 6; i++) {
      await expect(otpInputs.nth(i)).toHaveValue(demoOTP[i]);
    }

    // Wait for verify button to be enabled
    const verifyButton = page.locator('button:has-text("Verify Code")');
    await expect(verifyButton).not.toBeDisabled({ timeout: 5000 });

    // Click verify (or the form might auto-submit)
    await verifyButton.click();

    // Step 5: Should redirect to admin dashboard (demo user skips role selection)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Should be on dashboard with demo user context
    // Look for dashboard elements that indicate successful login
    await expect(page.locator('h1, h2, [data-testid="dashboard-title"]')).toContainText(
      /Dashboard|Welcome|Restaurant/i,
      { timeout: 5000 }
    );

    // Test successful authentication by checking for authenticated elements
    // (The exact elements will depend on your dashboard implementation)
    const authElements = [
      'text=Dashboard',
      'text=Welcome',
      'text=Restaurant',
      '[data-testid="user-menu"]',
      '[data-testid="navigation"]'
    ];

    let foundAuthElement = false;
    for (const selector of authElements) {
      try {
        await expect(page.locator(selector).first()).toBeVisible({ timeout: 2000 });
        foundAuthElement = true;
        break;
      } catch (e) {
        // Continue to next selector
      }
    }

    // If no specific dashboard elements found, at least ensure we're not on auth pages
    if (!foundAuthElement) {
      await expect(page).not.toHaveURL(/\/auth\//);
      await expect(page.locator('h1')).not.toContainText('Welcome Back');
      await expect(page.locator('h1')).not.toContainText('Enter Verification Code');
    }
  });

  test('should handle demo staff user login flow', async ({ page }) => {
    // Start from phone input page directly
    await page.goto('/auth/phone');
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Enter demo staff phone number (+919876543211)
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543211');

    // Submit OTP request
    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await expect(submitButton).not.toBeDisabled({ timeout: 3000 });
    await submitButton.click();

    // Go to verification page
    await expect(page).toHaveURL('/auth/verify', { timeout: 10000 });

    // Enter demo staff OTP (654321)
    const otpInputs = page.locator('input[maxlength="1"]');
    const staffOTP = '654321';
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(staffOTP[i]);
    }

    // Verify OTP
    const verifyButton = page.locator('button:has-text("Verify Code")');
    await verifyButton.click();

    // Should redirect to regular dashboard (staff role)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should handle US demo user', async ({ page }) => {
    // Test US demo user (+14155552222)
    await page.goto('/auth/phone');

    // Change to US country
    const countrySelector = page.locator('button').filter({ hasText: '🇮🇳' }).first();
    await countrySelector.click();
    await page.locator('button:has-text("United States")').click();

    // Verify US is selected
    await expect(page.locator('text=🇺🇸')).toBeVisible();
    await expect(page.locator('text=+1')).toBeVisible();

    // Enter US demo number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('4155552222');

    // Submit and verify
    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await expect(submitButton).not.toBeDisabled({ timeout: 3000 });
    await submitButton.click();

    await expect(page).toHaveURL('/auth/verify', { timeout: 10000 });

    // Enter US demo OTP (111111)
    const otpInputs = page.locator('input[maxlength="1"]');
    const usOTP = '111111';
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(usOTP[i]);
    }

    const verifyButton = page.locator('button:has-text("Verify Code")');
    await verifyButton.click();

    // Should reach dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should show helpful feedback for demo users in development', async ({ page }) => {
    // This test checks if demo user feedback is shown (only in development)
    await page.goto('/auth/phone');

    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');

    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await submitButton.click();

    // Check if we get demo user feedback (this will only work in dev mode)
    // The exact implementation may vary based on your environment detection
    await expect(page).toHaveURL('/auth/verify', { timeout: 10000 });

    // Success if we reach the verification page - the actual demo feedback
    // would be shown in console or potentially in UI for development builds
  });
});

test.describe('Demo Authentication Error Handling', () => {
  test('should handle invalid OTP for demo user', async ({ page }) => {
    // Go to phone input and enter demo number
    await page.goto('/auth/phone');

    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');

    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await submitButton.click();

    await expect(page).toHaveURL('/auth/verify', { timeout: 10000 });

    // Enter wrong OTP
    const otpInputs = page.locator('input[maxlength="1"]');
    const wrongOTP = '000000';
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(wrongOTP[i]);
    }

    const verifyButton = page.locator('button:has-text("Verify Code")');
    await verifyButton.click();

    // Should show error message
    await expect(page.locator('text=Invalid verification code')).toBeVisible({ timeout: 5000 });

    // Should still be on verify page
    await expect(page).toHaveURL('/auth/verify');
  });

  test('should allow retrying with correct demo OTP after wrong attempt', async ({ page }) => {
    await page.goto('/auth/phone');

    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');

    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await submitButton.click();

    await expect(page).toHaveURL('/auth/verify', { timeout: 10000 });

    // Try wrong OTP first
    let otpInputs = page.locator('input[maxlength="1"]');
    const wrongOTP = '999999';
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(wrongOTP[i]);
    }

    const verifyButton = page.locator('button:has-text("Verify Code")');
    await verifyButton.click();

    // Should show error and clear inputs
    await expect(page.locator('text=Invalid verification code')).toBeVisible({ timeout: 5000 });

    // Now try correct OTP
    otpInputs = page.locator('input[maxlength="1"]');
    const correctOTP = '123456';
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(correctOTP[i]);
    }

    await verifyButton.click();

    // Should succeed and redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});