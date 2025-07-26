import { test, expect } from '@playwright/test';
import { getEmailOTP } from '../../utils/fetchOtp';
import dotenv from 'dotenv';

dotenv.config();

test('Login with OTP from email', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/?apiKey=yourApiKeyHere');

  // Step 1: Trigger OTP email (e.g. enter email and submit)
  await page.getByPlaceholder('Enter your email').fill(process.env.GMAIL_USER || '');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2: Get OTP from email
  const otp = await getEmailOTP();
  if (!otp) throw new Error('OTP not found in email!');

  // Step 3: Enter OTP
  await page.getByPlaceholder('Enter verification code').fill(otp);
  await page.getByRole('button', { name: 'Verify' }).click();

  // Step 4: Validate login success
  await expect(page.getByText('Buy BTC')).toBeVisible();
});
