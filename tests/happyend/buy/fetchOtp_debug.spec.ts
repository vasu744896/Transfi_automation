import { test, expect } from '@playwright/test';
import { getLatestOtpFromEmail } from '../../../utils/fetchOtp';

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

  console.log('⏳ Waiting for OTP email...');
  const otp = await getLatestOtpFromEmail();
  console.log('🔑 OTP received:', otp);

  await page.getByRole('textbox', { name: 'OTP' }).fill(otp);
  console.log('✅ OTP entered');

  await page.getByRole('button', { name: 'Verify' }).click();
  console.log('🔓 OTP verification done');

  await expect(page).toHaveURL(/.*select-wallet.*/);
  console.log('🎉 Buy BTC flow completed!');
});
