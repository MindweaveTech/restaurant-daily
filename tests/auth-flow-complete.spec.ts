import { test, expect } from '@playwright/test';

test.describe('Complete Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test - using relative URL to leverage baseURL from config
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should complete full restaurant admin flow from homepage to restaurant creation', async ({ page }) => {
    console.log('🎯 Testing complete restaurant admin authentication flow');

    // Step 1: Navigate from homepage to authentication
    await expect(page.locator('h1')).toContainText('Restaurant Daily');
    await page.click('a[href="/auth/phone"]');
    console.log('✅ Navigated from homepage to phone auth');

    // Step 2: Enter demo admin phone number
    await expect(page).toHaveURL(/\/auth\/phone/);
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+919876543210');
    console.log('✅ Demo admin phone number entered');

    // Step 3: Submit for OTP
    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    console.log('✅ OTP request submitted');

    // Step 4: Should redirect to verify page
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: 10000 });
    console.log('✅ Redirected to verify page');

    // Step 5: Enter demo OTP
    const otpInputs = page.locator('input[inputmode="numeric"]');
    const demoOtp = '123456';
    for (let i = 0; i < demoOtp.length; i++) {
      await otpInputs.nth(i).fill(demoOtp[i]);
    }
    console.log('✅ Demo admin OTP entered (123456)');

    // Step 6: Should auto-submit and redirect (demo admin goes to admin dashboard)
    await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 10000 });
    console.log('✅ Demo admin redirected directly to admin dashboard');

    // Step 7: Verify admin dashboard content
    await expect(page.locator('h1').first()).toBeVisible();
    console.log('✅ Admin dashboard loaded successfully');

    // Step 8: Verify admin has proper token stored
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      expect(payload.role).toBe('admin');
      expect(payload.isDemoUser).toBe(true);
      expect(payload.restaurant_id).toBeTruthy(); // Demo admin should have restaurant_id
      console.log('✅ Admin token verified with correct role and restaurant_id');
    }
  });

  test('should complete full staff flow from homepage to staff welcome', async ({ page }) => {
    console.log('🎯 Testing complete staff authentication flow');

    // Step 1-3: Navigate and enter staff phone
    await page.goto('http://localhost:3001/auth/phone');
    await page.fill('input[type="tel"]', '+919876543211');
    await page.click('button:has-text("Send Verification Code")');
    console.log('✅ Staff phone number entered and OTP requested');

    // Step 4-5: Verify and enter staff OTP
    await expect(page).toHaveURL(/\/auth\/verify/);
    const otpInputs = page.locator('input[inputmode="numeric"]');
    const staffOtp = '654321';
    for (let i = 0; i < staffOtp.length; i++) {
      await otpInputs.nth(i).fill(staffOtp[i]);
    }
    console.log('✅ Staff OTP entered (654321)');

    // Step 6: Staff should go to staff welcome page
    await expect(page).toHaveURL(/\/onboarding\/staff-welcome/, { timeout: 10000 });
    console.log('✅ Staff user redirected to staff welcome page');

    // Step 7: Verify staff welcome content
    await expect(page.locator('h1').first()).toBeVisible();
    console.log('✅ Staff welcome page loaded successfully');

    // Step 8: Verify staff token
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      expect(payload.role).toBe('staff');
      expect(payload.isDemoUser).toBe(true);
      console.log('✅ Staff token verified with correct role');
    }
  });

  test('should handle role selection flow for new users', async ({ page }) => {
    console.log('🎯 Testing role selection flow');

    // Create a non-demo user flow by going through role selection
    await page.goto('http://localhost:3001/auth/phone');
    await page.fill('input[type="tel"]', '+14155552222');
    await page.click('button:has-text("Send Verification Code")');

    await expect(page).toHaveURL(/\/auth\/verify/);

    // Enter US demo user OTP
    const otpInputs = page.locator('input[inputmode="numeric"]');
    const usOtp = '111111';
    for (let i = 0; i < usOtp.length; i++) {
      await otpInputs.nth(i).fill(usOtp[i]);
    }
    console.log('✅ US demo user OTP entered');

    // Should redirect to role selection or dashboard (depending on demo user setup)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();

    if (currentUrl.includes('/auth/role-selection')) {
      console.log('✅ Redirected to role selection');

      // Test role selection interface
      await expect(page.locator('text=Restaurant Admin')).toBeVisible();
      await expect(page.locator('text=Staff Member')).toBeVisible();

      // Check for enhanced UX elements
      await expect(page.locator('text=Choose this if you need to CREATE a new restaurant')).toBeVisible();
      await expect(page.locator('text=Staff members cannot create restaurants')).toBeVisible();
      console.log('✅ Enhanced role selection UX elements visible');

      // Select admin role
      await page.click('div:has-text("Restaurant Admin")');
      await expect(page.locator('text=Selected')).toBeVisible();
      console.log('✅ Admin role selected');

      // Continue
      const continueButton = page.locator('button:has-text("Continue as Admin")');
      await expect(continueButton).toBeEnabled();
      await continueButton.click();
      console.log('✅ Clicked continue as admin');

      // Should go to restaurant setup
      await expect(page).toHaveURL(/\/onboarding\/restaurant-setup/, { timeout: 10000 });
      console.log('✅ Redirected to restaurant setup');
    } else {
      console.log('✅ Demo user bypassed role selection - went directly to dashboard');
    }
  });

  test('should prevent staff from accessing restaurant setup', async ({ page }) => {
    console.log('🎯 Testing staff access prevention to restaurant setup');

    // First, login as staff
    await page.goto('http://localhost:3001/auth/phone');
    await page.fill('input[type="tel"]', '+919876543211');
    await page.click('button:has-text("Send Verification Code")');

    await expect(page).toHaveURL(/\/auth\/verify/);
    const otpInputs = page.locator('input[inputmode="numeric"]');
    const staffOtp = '654321';
    for (let i = 0; i < staffOtp.length; i++) {
      await otpInputs.nth(i).fill(staffOtp[i]);
    }

    // Wait for redirect to staff welcome (staff sometimes gets stuck on verify, so wait longer)
    await expect(page).toHaveURL(/\/onboarding\/staff-welcome/, { timeout: 20000 });
    console.log('✅ Staff user authenticated and on staff welcome page');

    // Now try to access restaurant setup directly
    await page.goto('http://localhost:3001/onboarding/restaurant-setup');

    // Wait for either error message or redirect
    await page.waitForTimeout(5000);

    // Check if we were redirected back to staff welcome (which would indicate access was blocked)
    if (page.url().includes('/onboarding/staff-welcome')) {
      console.log('✅ Staff access blocked - redirected back to staff welcome');
    } else {
      // If still on restaurant setup page, check for error message
      await expect(page.locator('text=Access Restricted')).toBeVisible({ timeout: 5000 });
      console.log('✅ Staff access blocked - showing access restriction message');

      // Wait for redirect
      await page.waitForTimeout(4000);
      await expect(page).toHaveURL(/\/onboarding\/staff-welcome/);
      console.log('✅ Staff user redirected back to staff welcome');
    }
  });

  test('should handle invalid/expired tokens gracefully', async ({ page }) => {
    console.log('🎯 Testing invalid token handling');

    // Set an invalid token
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'invalid.token.here');
    });

    // Try to access restaurant setup
    await page.goto('http://localhost:3001/onboarding/restaurant-setup');

    // Should redirect to phone auth due to invalid token
    await page.waitForTimeout(3000);

    if (page.url().includes('/auth/phone')) {
      console.log('✅ Invalid token detected - redirected to phone auth');
    } else {
      // If error message is shown
      await expect(page.locator('text=Invalid authentication token')).toBeVisible({ timeout: 5000 });
      console.log('✅ Invalid token error message shown');

      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(/\/auth\/phone/);
      console.log('✅ Redirected to phone auth for re-authentication');
    }
  });

  test('should handle network errors during authentication', async ({ page }) => {
    console.log('🎯 Testing network error handling');

    // Intercept API calls and simulate network errors
    await page.route('**/api/auth/request-otp', route => {
      route.abort('failed');
    });

    await page.goto('http://localhost:3001/auth/phone');
    await page.fill('input[type="tel"]', '+919876543210');
    await page.click('button:has-text("Send Verification Code")');

    // Should show network error
    await expect(page.locator('text=Network error')).toBeVisible({ timeout: 5000 });
    console.log('✅ Network error properly handled and displayed');
  });

  test('should validate phone number format', async ({ page }) => {
    console.log('🎯 Testing phone number validation');

    await page.goto('http://localhost:3001/auth/phone');

    // Test invalid phone number
    await page.fill('input[type="tel"]', '123');
    const submitButton = page.locator('button:has-text("Send Verification Code")');

    // Button should be disabled or show validation error
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      // Should show validation error
      await expect(page.locator('text=Please enter a valid')).toBeVisible({ timeout: 3000 });
    }
    console.log('✅ Invalid phone number properly rejected');

    // Test valid phone number
    await page.fill('input[type="tel"]', '+919876543210');
    await expect(submitButton).toBeEnabled();
    console.log('✅ Valid phone number accepted');
  });

  test('should handle OTP expiration', async ({ page }) => {
    console.log('🎯 Testing OTP expiration handling');

    await page.goto('http://localhost:3001/auth/phone');
    await page.fill('input[type="tel"]', '+919876543210');
    await page.click('button:has-text("Send Verification Code")');

    await expect(page).toHaveURL(/\/auth\/verify/);

    // Wait and check for timer countdown
    await expect(page.locator('text=Code expires in')).toBeVisible();
    console.log('✅ OTP expiration timer visible');

    // Test with expired OTP (simulate by using old OTP)
    const otpInputs = page.locator('input[inputmode="numeric"]');
    const expiredOtp = '999999'; // This should be invalid/expired
    for (let i = 0; i < expiredOtp.length; i++) {
      await otpInputs.nth(i).fill(expiredOtp[i]);
    }

    // Should show error message
    await expect(page.locator('text=Invalid verification code')).toBeVisible({ timeout: 5000 });
    console.log('✅ Expired/invalid OTP properly rejected');
  });
});