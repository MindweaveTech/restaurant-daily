import { test, expect } from '@playwright/test';

test.describe('Production Debug - OTP Flow', () => {
  test('debug production OTP redirect issue', async ({ page }) => {
    test.setTimeout(20000);
    // Enable console logging to capture any JavaScript errors
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });

    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('/api/auth/')) {
        console.log(`REQUEST: ${request.method()} ${request.url()}`);
        console.log(`BODY: ${request.postDataJSON()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/auth/')) {
        console.log(`RESPONSE: ${response.status()} ${response.url()}`);
        response.json().then(data => {
          console.log(`RESPONSE BODY:`, JSON.stringify(data, null, 2));
        }).catch(() => {
          console.log('Could not parse response as JSON');
        });
      }
    });

    // Go to production site
    console.log('🚀 Testing production site: https://restaurant-daily.mindweave.tech');
    await page.goto('https://restaurant-daily.mindweave.tech/auth/phone');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Welcome Back');
    console.log('✅ Phone auth page loaded');

    // Enter demo phone number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('9876543210');
    console.log('✅ Demo phone number entered');

    // Wait for validation and button to be enabled
    const submitButton = page.locator('button:has-text("Send Verification Code")');
    await expect(submitButton).not.toBeDisabled({ timeout: 3000 });
    console.log('✅ Submit button enabled');

    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/before-click.png', fullPage: true });

    // Click the button and wait for network activity
    console.log('🔄 Clicking Send Verification Code button...');
    await Promise.all([
      // Wait for the network request to complete
      page.waitForResponse(response =>
        response.url().includes('/api/auth/request-otp') && response.status() === 200,
        { timeout: 10000 }
      ),
      // Click the button
      submitButton.click()
    ]);

    console.log('✅ API request completed');

    // Wait a moment for any JavaScript to execute
    await page.waitForTimeout(2000);

    // Take screenshot after click
    await page.screenshot({ path: 'test-results/after-click.png', fullPage: true });

    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL after click: ${currentUrl}`);

    // Check if we're on the verify page
    if (currentUrl.includes('/auth/verify')) {
      console.log('✅ SUCCESS: Redirected to verify page');
      await expect(page.locator('h1')).toContainText('Enter Verification Code');
    } else {
      console.log('❌ ISSUE: Still on phone page');

      // Check for any error messages on the page
      const errorElements = page.locator('[class*="error"], [class*="red"], .text-red-500, .text-red-600, .text-red-700');
      const errorCount = await errorElements.count();

      if (errorCount > 0) {
        console.log(`⚠️  Found ${errorCount} potential error elements:`);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorElements.nth(i).textContent();
          if (errorText && errorText.trim()) {
            console.log(`   ERROR ${i + 1}: "${errorText}"`);
          }
        }
      }

      // Check session storage
      const pendingPhone = await page.evaluate(() => sessionStorage.getItem('pendingPhone'));
      const otpMethod = await page.evaluate(() => sessionStorage.getItem('otpMethod'));
      console.log(`📱 Session Storage - pendingPhone: ${pendingPhone}, otpMethod: ${otpMethod}`);

      // Check if button is in loading state
      const buttonText = await submitButton.textContent();
      const buttonDisabled = await submitButton.isDisabled();
      console.log(`🔘 Button state - text: "${buttonText}", disabled: ${buttonDisabled}`);
    }

    // Final state check
    console.log('🔍 Final page state analysis complete');
  });
});