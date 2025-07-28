import { test, expect } from '@playwright/test';

test.setTimeout(240000); // Set timeout to 4 minutes

test('Negative test - invalid OTP input', async ({ page }) => {
  // Step 1: Go to Transfi Buy page
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
  console.log('🌐 Navigated to Transfi Buy page');

  // Step 2: Start Buy BTC flow
  await page.getByRole('button', { name: 'Buy BTC' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('baiondatastaff@gmail.com');
  await page.getByRole('button', { name: 'Continue' }).click();

  console.log('✅ Email entered successfully...');

  // Step 3: Wait for OTP input fields
  await page.waitForTimeout(20000); // Let OTP inputs load
  await page.waitForSelector('input[id^="pin-input-1-"]', { state: 'visible', });

  // Step 4: Fill invalid OTP
  await page.locator('#pin-input-1-0').click();
  await page.locator('#pin-input-1-0').fill('3');
  await page.locator('#pin-input-1-1').fill('3');
  await page.locator('#pin-input-1-2').fill('1');
  await page.locator('#pin-input-1-3').fill('1');
  await page.locator('#pin-input-1-4').fill('5');
  await page.locator('#pin-input-1-5').fill('6');

  await page.waitForTimeout(2000); // Wait for error message to appear

  // Step 5: Check for error message using specific container
  const errorMsg = page.locator('#chakra-toast-manager-bottom').getByText(/incorrect verification code/i);
  
  try {
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    console.log('❌ OTP incorrect — error message displayed as expected (Negative test passed)');
  } catch (error) {
    console.log('⚠️ ERROR: Expected "Incorrect verification code" not shown — test failed');
    throw error; // Fail test
  }
});
