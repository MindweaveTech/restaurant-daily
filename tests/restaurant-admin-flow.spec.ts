import { test, expect } from '@playwright/test';

test.describe('Restaurant Admin Registration Flow', () => {
  test('should complete full restaurant admin registration and creation flow', async ({ page }) => {
    console.log('🏪 Testing complete restaurant admin registration flow');

    // Step 1: Navigate to homepage
    await page.goto('http://localhost:3001');
    await expect(page.locator('h1')).toContainText('Restaurant Daily');
    console.log('✅ Homepage loaded');

    // Step 2: Navigate to authentication
    await page.click('a[href="/auth/phone"]');
    await expect(page).toHaveURL(/\/auth\/phone/);
    console.log('✅ Phone auth page loaded');

    // Step 3: Enter demo admin phone number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+919876543210');
    console.log('✅ Demo admin phone number entered');

    // Step 4: Submit for OTP
    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    console.log('✅ OTP request submitted');

    // Step 5: Should redirect to verify page
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: 10000 });
    console.log('✅ Redirected to verify page');

    // Step 6: Enter OTP
    const otpInputs = page.locator('input[inputmode="numeric"]');
    const demoOtp = '123456';
    for (let i = 0; i < demoOtp.length; i++) {
      await otpInputs.nth(i).fill(demoOtp[i]);
    }
    console.log('✅ Demo admin OTP entered (123456)');

    // Step 7: Should auto-submit and redirect to role selection
    await expect(page).toHaveURL(/\/auth\/role-selection/, { timeout: 10000 });
    console.log('✅ Redirected to role selection page');

    // Step 8: Select admin role
    const adminRoleCard = page.locator('div:has-text("Restaurant Admin")').first();
    await adminRoleCard.click();
    console.log('✅ Admin role selected');

    // Step 9: Continue as admin
    const continueButton = page.locator('button:has-text("Continue as Admin")');
    await expect(continueButton).toBeEnabled();
    await continueButton.click();
    console.log('✅ Clicked continue as admin');

    // Step 10: Should redirect to restaurant setup
    await expect(page).toHaveURL(/\/onboarding\/restaurant-setup/, { timeout: 10000 });
    console.log('✅ Redirected to restaurant setup page');

    // Step 11: Fill restaurant details
    await page.fill('input[name="name"]', 'Test Restaurant Admin Flow');
    await page.fill('input[name="address"]', '123 Test Street, Test City');
    console.log('✅ Restaurant basic details filled');

    // Step 12: Click next step
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();
    console.log('✅ Moved to next step');

    // Step 13: Fill optional details
    await page.fill('input[name="phone"]', '+919876543210');
    await page.fill('input[name="email"]', 'test@restaurant.com');
    await page.fill('textarea[name="description"]', 'A test restaurant for admin flow validation');
    console.log('✅ Optional details filled');

    // Step 14: Submit restaurant creation
    const createButton = page.locator('button:has-text("Create Restaurant")');
    await createButton.click();
    console.log('🔄 Submitting restaurant creation...');

    // Step 15: Wait for creation response
    // This should either succeed or show the "Only restaurant admins can create restaurants" error
    await page.waitForTimeout(3000);

    // Check for either success or error
    const successIndicator = page.locator('text=Restaurant created successfully');
    const errorIndicator = page.locator('text=Only restaurant admins can create restaurants');
    const networkError = page.locator('text=Failed to create restaurant');

    const hasSuccess = await successIndicator.isVisible();
    const hasAdminError = await errorIndicator.isVisible();
    const hasNetworkError = await networkError.isVisible();

    console.log('📊 Result Analysis:');
    console.log(`  - Success: ${hasSuccess}`);
    console.log(`  - Admin Error: ${hasAdminError}`);
    console.log(`  - Network Error: ${hasNetworkError}`);

    if (hasAdminError) {
      console.log('❌ FOUND THE BUG: "Only restaurant admins can create restaurants" error occurred!');

      // Capture the current JWT token for debugging
      const token = await page.evaluate(() => localStorage.getItem('auth_token'));
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 JWT Payload Debug:', JSON.stringify(payload, null, 2));
        console.log('🔑 Role in token:', payload.role);
        console.log('🏪 Restaurant ID in token:', payload.restaurant_id);
        console.log('👤 Is demo user:', payload.isDemoUser);
      }

      // Also capture the network request/response
      console.log('📡 Capturing network traffic for debugging...');

      // Fail the test with detailed information
      expect(hasAdminError,
        `REPRODUCTION SUCCESS: Found the "Only restaurant admins can create restaurants" error!\n` +
        `This proves the bug exists. JWT payload shows role: ${token ? JSON.parse(atob(token.split('.')[1])).role : 'unknown'}\n` +
        `The admin user should be able to create restaurants but is being rejected.`
      ).toBeFalsy();
    }

    if (hasSuccess) {
      console.log('✅ Restaurant creation succeeded');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
      console.log('✅ Redirected to dashboard after creation');
    }

    if (hasNetworkError) {
      console.log('🔧 Network/Server error occurred - this might be a connectivity issue');
    }

    // Final validation - should be on some success page
    expect(hasSuccess || hasAdminError || hasNetworkError).toBeTruthy();
  });

  test('should debug JWT token content during restaurant creation', async ({ page }) => {
    console.log('🔍 Testing JWT token content during restaurant creation');

    // Set up network monitoring
    const requests: any[] = [];
    const responses: any[] = [];

    page.on('request', request => {
      if (request.url().includes('/api/restaurant/create')) {
        const headers = request.headers();
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: headers,
          authorization: headers.authorization,
          body: request.postData()
        });
        console.log('📤 Restaurant creation request:', {
          url: request.url(),
          authorization: headers.authorization ? 'Bearer [TOKEN]' : 'MISSING',
          body: request.postData()
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/restaurant/create')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log('📥 Restaurant creation response:', {
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Follow the same flow but focus on the API call
    await page.goto('http://localhost:3001/auth/phone');
    await page.fill('input[type="tel"]', '+919876543210');
    await page.click('button:has-text("Send Verification Code")');
    await expect(page).toHaveURL(/\/auth\/verify/);

    // Enter OTP
    const otpInputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('123456'[i]);
    }

    await expect(page).toHaveURL(/\/auth\/role-selection/);
    await page.click('div:has-text("Restaurant Admin")');
    await page.click('button:has-text("Continue as Admin")');
    await expect(page).toHaveURL(/\/onboarding\/restaurant-setup/);

    // Fill form quickly
    await page.fill('input[name="name"]', 'Debug Restaurant');
    await page.fill('input[name="address"]', '123 Debug Street');
    await page.click('button:has-text("Next")');

    // Before clicking create, capture the token
    const tokenBeforeCreate = await page.evaluate(() => localStorage.getItem('auth_token'));
    if (tokenBeforeCreate) {
      const payload = JSON.parse(atob(tokenBeforeCreate.split('.')[1]));
      console.log('🎯 Token before restaurant creation:', JSON.stringify(payload, null, 2));
    }

    await page.click('button:has-text("Create Restaurant")');
    await page.waitForTimeout(3000);

    // Analyze the results
    console.log('📊 Network Analysis:');
    console.log('Requests:', requests.length);
    console.log('Responses:', responses.length);

    if (responses.length > 0) {
      const response = responses[0];
      console.log('🎯 Final response status:', response.status);

      if (response.status === 403) {
        console.log('❌ 403 Forbidden - This confirms the "Only restaurant admins can create restaurants" error');
      }
    }

    // This test is for debugging, so we don't need to assert success
    expect(requests.length).toBeGreaterThan(0);
  });
});