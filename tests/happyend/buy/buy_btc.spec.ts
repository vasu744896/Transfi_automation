// tests/happyend/buy/buy_btc.spec.ts
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getLatestOtpFromEmail } from '../../../utils/fetchOtp';

dotenv.config();

test.setTimeout(5 * 60 * 1000); // 5 minutes

test('Buy BTC flow with email OTP', async ({ page }) => {
  console.log('🚀 Starting Buy BTC flow test');

  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
  console.log('🌐 Navigated to Transfi Buy page');

  await page.getByRole('button', { name: 'Buy BTC' }).click();
  console.log('🪙 Clicked Buy BTC');

  const email = process.env.TEST_EMAIL!;
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  console.log(`📧 Entered email: ${email}`);

  await page.getByRole('button', { name: 'Continue' }).click();
  console.log('➡️ Clicked Continue');
  await page.waitForTimeout(20000); // Wait for OTP input to appear

  // Wait for OTP email and extract
  console.log('⏳ Waiting for OTP email...');
  const otp = await getLatestOtpFromEmail(); // Example: '492102'
  console.log('🔑 OTP received:', otp);

  const digits = otp.trim().split('');

  // Wait until OTP inputs are visible and interactable
  await page.waitForSelector('input[id^="pin-input-1-"]', { state: 'visible', timeout: 15000 });

  // Locate all OTP input fields
  const otpInputs = page.locator('input[id^="pin-input-1-"]');
  const count = await otpInputs.count();

  if (count !== 6) {
    throw new Error(`❌ Expected 6 OTP inputs, but found ${count}`);
  }

  // Fill each digit into corresponding input
  for (let i = 0; i < 6; i++) {
    await otpInputs.nth(i).fill(digits[i]);
  }

  console.log('✅ OTP filled');

  // Optional: click Verify if button is needed
  const verifyButton = page.getByRole('button', { name: /verify/i });
  if (await verifyButton.isVisible()) {
    await verifyButton.click();
    console.log('🔓 OTP verified');
  }

  await page.getByRole('textbox', { name: 'Wallet address' }).click();

  await page.getByRole('textbox', { name: 'Wallet address' }).fill('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy');

  await page.waitForTimeout(2000); 

  await page.getByRole('button', { name: 'Continue' }).click();

  console.log('wallet address added successfully');

  await page.locator('div').filter({ hasText: /^SEPA Bank Transfer$/ }).click();

  await page.getByRole('button', { name: 'Continue' }).click();

  await page.waitForTimeout(5000);
  
  console.log('✅ Successfully completed Buy BTC flow');
});
