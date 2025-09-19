import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should enforce admin-only access to restaurant setup', async ({ page }) => {
    console.log('🔒 Testing admin-only restaurant setup access');

    // Test 1: Unauthenticated access
    await page.goto('http://localhost:3000/onboarding/restaurant-setup');
    await expect(page.locator('text=Authentication required')).toBeVisible({ timeout: 5000 });
    console.log('✅ Unauthenticated users blocked from restaurant setup');

    // Wait for redirect to phone auth
    await expect(page).toHaveURL(/\/auth\/phone/, { timeout: 3000 });

    // Test 2: Staff access
    // Login as staff first
    await page.fill('input[type="tel"]', '+919876543211');
    await page.click('button:has-text("Send Verification Code")');
    await expect(page).toHaveURL(/\/auth\/verify/);

    const otpInputs = page.locator('input[inputmode="numeric"]');
    const staffOtp = '654321';
    for (let i = 0; i < staffOtp.length; i++) {
      await otpInputs.nth(i).fill(staffOtp[i]);
    }

    await expect(page).toHaveURL(/\/onboarding\/staff-welcome/, { timeout: 10000 });
    console.log('✅ Staff user authenticated');

    // Now try to access restaurant setup as staff
    await page.goto('http://localhost:3000/onboarding/restaurant-setup');
    await expect(page.locator('text=Access Restricted')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Staff members cannot create restaurants')).toBeVisible();
    console.log('✅ Staff users properly blocked from restaurant setup');

    // Should redirect to staff welcome
    await page.waitForTimeout(4000);
    await expect(page).toHaveURL(/\/onboarding\/staff-welcome/);
    console.log('✅ Staff redirected back to appropriate page');
  });

  test('should allow admin access to restaurant setup', async ({ page }) => {
    console.log('🔓 Testing admin access to restaurant setup');

    // Login as admin through role selection
    await page.goto('http://localhost:3000/auth/phone');
    await page.fill('input[type="tel"]', '+14155552222'); // US demo user goes through role selection
    await page.click('button:has-text("Send Verification Code")');

    await expect(page).toHaveURL(/\/auth\/verify/);

    const otpInputs = page.locator('input[inputmode="numeric"]');
    const usOtp = '111111';
    for (let i = 0; i < usOtp.length; i++) {
      await otpInputs.nth(i).fill(usOtp[i]);
    }

    await page.waitForTimeout(2000);
    const currentUrl = page.url();

    if (currentUrl.includes('/auth/role-selection')) {
      // Go through role selection
      await page.click('div:has-text("Restaurant Admin")');
      await page.click('button:has-text("Continue as Admin")');
      await expect(page).toHaveURL(/\/onboarding\/restaurant-setup/, { timeout: 10000 });
      console.log('✅ Admin user allowed access to restaurant setup via role selection');
    } else {
      // Direct admin user
      await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 10000 });
      console.log('✅ Demo admin user went directly to dashboard');

      // Try accessing restaurant setup
      await page.goto('http://localhost:3000/onboarding/restaurant-setup');
      // Should be allowed (loading screen then form)
      await expect(page.locator('text=Restaurant Setup')).toBeVisible({ timeout: 5000 });
      console.log('✅ Admin user allowed direct access to restaurant setup');
    }
  });

  test('should prevent role escalation attacks', async ({ page }) => {
    console.log('🛡️ Testing role escalation prevention');

    // Login as staff
    await page.goto('http://localhost:3000/auth/phone');
    await page.fill('input[type="tel"]', '+919876543211');
    await page.click('button:has-text("Send Verification Code")');
    await expect(page).toHaveURL(/\/auth\/verify/);

    const otpInputs = page.locator('input[inputmode="numeric"]');
    const staffOtp = '654321';
    for (let i = 0; i < staffOtp.length; i++) {
      await otpInputs.nth(i).fill(staffOtp[i]);
    }

    await expect(page).toHaveURL(/\/onboarding\/staff-welcome/, { timeout: 10000 });

    // Get the staff token
    const staffToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(staffToken).toBeTruthy();

    // Manually modify token to try to escalate to admin (this should fail server-side)
    if (staffToken) {
      const payload = JSON.parse(atob(staffToken.split('.')[1]));
      expect(payload.role).toBe('staff');
      console.log('✅ Verified staff token contains staff role');

      // Try to access admin endpoints with staff token
      const response = await page.request.post('http://localhost:3000/api/restaurant/create', {
        headers: {
          'Authorization': `Bearer ${staffToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Hack Attempt Restaurant',
          address: '123 Hack Street'
        }
      });

      expect(response.status()).toBe(403);
      const responseBody = await response.json();
      expect(responseBody.error).toContain('Only restaurant admins can create restaurants');
      console.log('✅ Role escalation attack properly blocked by server');
    }
  });

  test('should handle token tampering gracefully', async ({ page }) => {
    console.log('🔐 Testing token tampering protection');

    // Login normally first
    await page.goto('http://localhost:3000/auth/phone');
    await page.fill('input[type="tel"]', '+919876543210');
    await page.click('button:has-text("Send Verification Code")');
    await expect(page).toHaveURL(/\/auth\/verify/);

    const otpInputs = page.locator('input[inputmode="numeric"]');
    const adminOtp = '123456';
    for (let i = 0; i < adminOtp.length; i++) {
      await otpInputs.nth(i).fill(adminOtp[i]);
    }

    await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 10000 });

    // Now tamper with the token
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'tampered.invalid.token');
    });

    // Try to access protected resource
    await page.goto('http://localhost:3000/onboarding/restaurant-setup');

    // Should detect invalid token and redirect
    await expect(page.locator('text=Invalid authentication token')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/auth\/phone/);
    console.log('✅ Token tampering detected and handled properly');
  });

  test('should validate role consistency across navigation', async ({ page }) => {
    console.log('🔄 Testing role consistency during navigation');

    // Login as admin
    await page.goto('http://localhost:3000/auth/phone');
    await page.fill('input[type="tel"]', '+919876543210');
    await page.click('button:has-text("Send Verification Code")');
    await expect(page).toHaveURL(/\/auth\/verify/);

    const otpInputs = page.locator('input[inputmode="numeric"]');
    const adminOtp = '123456';
    for (let i = 0; i < adminOtp.length; i++) {
      await otpInputs.nth(i).fill(adminOtp[i]);
    }

    await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 10000 });
    console.log('✅ Admin authenticated and on admin dashboard');

    // Navigate to different admin-accessible pages
    const adminPages = [
      '/onboarding/restaurant-setup',
      '/dashboard/admin',
      '/dashboard'
    ];

    for (const pagePath of adminPages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      await page.waitForTimeout(1000);

      // Should not show access denied messages
      const accessDenied = await page.locator('text=Access Restricted').isVisible().catch(() => false);
      expect(accessDenied).toBe(false);
      console.log(`✅ Admin access maintained for ${pagePath}`);
    }
  });

  test('should handle role changes properly', async ({ page }) => {
    console.log('🔄 Testing role change flow');

    // Start with role selection flow
    await page.goto('http://localhost:3000/auth/phone');
    await page.fill('input[type="tel"]', '+14155552222');
    await page.click('button:has-text("Send Verification Code")');
    await expect(page).toHaveURL(/\/auth\/verify/);

    const otpInputs = page.locator('input[inputmode="numeric"]');
    const usOtp = '111111';
    for (let i = 0; i < usOtp.length; i++) {
      await otpInputs.nth(i).fill(usOtp[i]);
    }

    await page.waitForTimeout(2000);

    if (page.url().includes('/auth/role-selection')) {
      console.log('✅ User at role selection page');

      // First select staff role
      await page.click('div:has-text("Staff Member")');
      await expect(page.locator('text=Selected')).toBeVisible();

      // Check that warning is shown
      await expect(page.locator('text=Staff cannot create restaurants')).toBeVisible();
      console.log('✅ Staff role warnings displayed');

      // Change to admin role
      await page.click('div:has-text("Restaurant Admin")');
      await expect(page.locator('text=This role allows you to create new restaurants')).toBeVisible();
      console.log('✅ Admin role confirmation displayed');

      // Continue as admin
      await page.click('button:has-text("Continue as Admin")');
      await expect(page).toHaveURL(/\/onboarding\/restaurant-setup/, { timeout: 10000 });
      console.log('✅ Role change to admin successful');

      // Verify token has admin role
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        expect(payload.role).toBe('admin');
        console.log('✅ Token correctly reflects admin role');
      }
    } else {
      console.log('✅ Demo user bypassed role selection');
    }
  });

  test('should show appropriate error messages for different scenarios', async ({ page }) => {
    console.log('📝 Testing error message specificity');

    const testScenarios = [
      {
        name: 'No token',
        setup: async () => {
          await page.evaluate(() => localStorage.removeItem('auth_token'));
        },
        expectedMessage: 'Authentication required'
      },
      {
        name: 'Invalid token format',
        setup: async () => {
          await page.evaluate(() => localStorage.setItem('auth_token', 'not.a.jwt'));
        },
        expectedMessage: 'Invalid authentication token'
      },
      {
        name: 'Staff role',
        setup: async () => {
          // Create a valid staff token
          const staffPayload = {
            phone: '+919876543211',
            role: 'staff',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
          };
          const fakeToken = 'fake.' + btoa(JSON.stringify(staffPayload)) + '.signature';
          await page.evaluate((token) => localStorage.setItem('auth_token', token), fakeToken);
        },
        expectedMessage: 'Staff members cannot create restaurants'
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`Testing scenario: ${scenario.name}`);

      await scenario.setup();
      await page.goto('http://localhost:3000/onboarding/restaurant-setup');

      await expect(page.locator(`text=${scenario.expectedMessage}`)).toBeVisible({ timeout: 5000 });
      console.log(`✅ Correct error message shown for ${scenario.name}`);

      // Clear for next test
      await page.evaluate(() => localStorage.clear());
    }
  });
});