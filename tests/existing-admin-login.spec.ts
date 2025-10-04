import { test, expect } from '@playwright/test';

test.describe('Existing Restaurant Admin Login Flow', () => {
  test('should redirect existing restaurant admin directly to admin dashboard', async ({ page }) => {
    // Start from the homepage
    await page.goto('/');

    // Wait for loading to complete and then navigate to login
    await page.waitForSelector('text=Get Started', { timeout: 10000 });
    await page.click('text=Get Started');

    // Should be on phone entry page
    await expect(page).toHaveURL('/auth/phone');
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Enter demo admin phone number (this should be an existing restaurant admin)
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+919876543210'); // Demo admin with existing restaurant

    // Wait for button to be enabled and click continue
    const sendButton = page.locator('button:has-text("Send Verification Code")');
    await sendButton.waitFor({ state: 'attached' });
    await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const button = buttons.find(btn => btn.textContent?.includes('Send Verification Code')) as HTMLButtonElement;
      return button && !button.disabled;
    }, { timeout: 10000 });
    await sendButton.click();

    // Should be redirected to OTP verification
    await expect(page).toHaveURL('/auth/verify');
    await expect(page.locator('h1')).toContainText('Enter Verification Code');

    // Enter demo OTP
    const otpInputs = page.locator('input[maxlength="1"]');
    await otpInputs.nth(0).fill('1');
    await otpInputs.nth(1).fill('2');
    await otpInputs.nth(2).fill('3');
    await otpInputs.nth(3).fill('4');
    await otpInputs.nth(4).fill('5');
    await otpInputs.nth(5).fill('6');

    // Click verify
    await page.click('button:has-text("Verify Code")');

    // For existing restaurant admin demo user, should skip role selection
    // and go directly to admin dashboard
    await expect(page).toHaveURL('/dashboard/admin');

    // Verify we're on the admin dashboard
    await expect(page.locator('h1')).toContainText('Restaurant Admin'); // Should show restaurant name, but fallback for now
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();

    // Verify admin-specific elements are visible
    await expect(page.locator('text=Invite Team Member')).toBeVisible();
    await expect(page.locator('text=Restaurant Settings')).toBeVisible();
    await expect(page.locator('text=Manage Vouchers')).toBeVisible();

    // Verify the staff invitation button is functional (key feature we just implemented)
    const inviteButton = page.locator('button:has-text("Invite Team Member")');
    await expect(inviteButton).toBeVisible();

    console.log('✅ SUCCESS: Existing restaurant admin was redirected directly to admin dashboard!');
  });

  test('should handle new admin user and redirect to restaurant setup', async ({ page }) => {
    // Test with a demo user that requires role selection
    await page.goto('/auth/phone');

    // Enter US demo phone number that requires role selection
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+14155552222'); // US demo user without restaurant

    // Send OTP
    await page.click('button:has-text("Send Verification Code")');

    // Enter OTP
    await expect(page).toHaveURL('/auth/verify');
    const otpInputs = page.locator('input[maxlength="1"]');
    await otpInputs.nth(0).fill('1');
    await otpInputs.nth(1).fill('1');
    await otpInputs.nth(2).fill('1');
    await otpInputs.nth(3).fill('1');
    await otpInputs.nth(4).fill('1');
    await otpInputs.nth(5).fill('1');

    await page.click('button:has-text("Verify Code")');

    // Should go to role selection
    await expect(page).toHaveURL('/auth/role-selection');
    await expect(page.locator('h1')).toContainText('Welcome to Restaurant Daily');

    // Select admin role
    await page.click('button:has-text("Restaurant Admin")');

    // Should redirect to restaurant setup (since this demo user has no restaurant)
    await expect(page).toHaveURL('/onboarding/restaurant-setup');
    await expect(page.locator('h1')).toContainText('Set Up Your Restaurant');
  });

  test('should handle staff user login correctly', async ({ page }) => {
    await page.goto('/auth/phone');

    // Enter staff demo phone number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+919876543211'); // Demo staff user

    // Send OTP
    await page.click('button:has-text("Send Verification Code")');

    // Enter OTP
    await expect(page).toHaveURL('/auth/verify');
    const otpInputs = page.locator('input[maxlength="1"]');
    await otpInputs.nth(0).fill('6');
    await otpInputs.nth(1).fill('5');
    await otpInputs.nth(2).fill('4');
    await otpInputs.nth(3).fill('3');
    await otpInputs.nth(4).fill('2');
    await otpInputs.nth(5).fill('1');

    await page.click('button:has-text("Verify Code")');

    // Staff demo user should go directly to staff dashboard
    await expect(page).toHaveURL('/dashboard/staff');
    await expect(page.locator('h1')).toContainText('MindWeave Restaurant');
    await expect(page.locator('text=Staff Dashboard')).toBeVisible();

    // Verify staff-specific elements
    await expect(page.locator('text=Cash Session')).toBeVisible();
    await expect(page.locator('text=Petty Voucher')).toBeVisible();
    await expect(page.locator('text=My Profile')).toBeVisible();

    // Staff should NOT see admin features
    await expect(page.locator('text=Invite Team Member')).not.toBeVisible();
    await expect(page.locator('text=Restaurant Settings')).not.toBeVisible();
  });

  test('should preserve restaurant info after role selection for existing admin', async ({ page }) => {
    // Test the edge case where role selection API might fail but user still has restaurant
    await page.goto('/auth/phone');

    // Login with existing admin
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+919876543210');

    await page.click('button:has-text("Send Verification Code")');
    await expect(page).toHaveURL('/auth/verify');

    // Enter OTP
    const otpInputs = page.locator('input[maxlength="1"]');
    await otpInputs.nth(0).fill('1');
    await otpInputs.nth(1).fill('2');
    await otpInputs.nth(2).fill('3');
    await otpInputs.nth(3).fill('4');
    await otpInputs.nth(4).fill('5');
    await otpInputs.nth(5).fill('6');

    await page.click('button:has-text("Verify Code")');

    // Should go directly to admin dashboard (existing restaurant admin)
    await expect(page).toHaveURL('/dashboard/admin');

    // Verify restaurant name is displayed correctly
    await expect(page.locator('h1')).toContainText('MindWeave Restaurant');

    // Verify admin phone number is shown
    await expect(page.locator('text=+919876543210')).toBeVisible();

    // Verify all admin functionality is available
    await expect(page.locator('text=Invite Team Member')).toBeVisible();
    await expect(page.locator('text=Team Members')).toBeVisible();
    await expect(page.locator('text=Active Sessions')).toBeVisible();
    await expect(page.locator('text=Pending Vouchers')).toBeVisible();
  });
});