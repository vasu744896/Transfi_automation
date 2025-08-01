import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getLatestOtpFromEmail } from '../../../utils/fetchOtp';
import * as XLSX from 'xlsx';
import fs from 'fs';

dotenv.config();
test.setTimeout(24 * 60 * 60 * 1000);

const filePath = 'report/Playwright-Test-Case-Report.xlsx';
const sheetName = 'TestCases';

function exportSingleRowToExcel(resultRow: any) {
  let wb: XLSX.WorkBook;
  let ws: XLSX.WorkSheet;
  let existingData: any[] = [];

  if (fs.existsSync(filePath)) {
    wb = XLSX.readFile(filePath);
    ws = wb.Sheets[sheetName];

    if (ws) {
      existingData = XLSX.utils.sheet_to_json(ws);
      wb.Sheets[sheetName] = XLSX.utils.json_to_sheet([...existingData, resultRow]);
    } else {
      ws = XLSX.utils.json_to_sheet([resultRow]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  } else {
    wb = XLSX.utils.book_new();
    ws = XLSX.utils.json_to_sheet([resultRow]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  XLSX.writeFile(wb, filePath);
}

test('TC-BTC-001: Buy BTC flow with invalid wallet test', async ({ page }) => {
  const email = process.env.TEST_EMAIL!;
  const startTime = Date.now(); // Start time

  const resultRow: any = {
    'Test Case ID': 'TC-BTC-001',
    Purpose: 'Buy BTC flow with invalid wallet test',
    Description: 'Complete user flow including OTP and invalid wallet entry',
    'Pre-conditions': [
    '• The "Buy BTC" flow is available and clickable on the landing page',
    '• Wallet address input field is available'
  ].join('\n'),
    'Test Steps': '',
    'Test Data': '',
    'Expected Result': 'Should show error message for invalid wallet address',
    'Actual Result': '',
    Comments: '',
    Result: '',
    'Execution Time': '', // <-- Added field
  };

  try {
    // Step 1: Navigate to site
    await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');

    // Step 2: Click Buy BTC
    await page.getByRole('button', { name: 'Buy BTC' }).click();

    // Step 3: Enter Email
    await page.getByRole('textbox', { name: 'Email' }).fill(email);

    // Step 4: Click Continue
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 5: Wait for OTP to arrive
    await page.waitForTimeout(20000);
    const otp = await getLatestOtpFromEmail();

    // Step 6: Enter OTP
    const digits = otp.trim().split('');
    const otpInputs = page.locator('input[id^="pin-input-1-"]');
    const count = await otpInputs.count();
    if (count !== 6) throw new Error(`Expected 6 OTP inputs, found ${count}`);
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(digits[i]);
    }

    // Step 7: Click Verify (if visible)
    const verifyButton = page.getByRole('button', { name: /verify/i });
    if (await verifyButton.isVisible()) {
      await verifyButton.click();
    }

    // Step 8: Enter Invalid Wallet
    const invalidWallet = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWwwwNLy';
    await page.getByRole('textbox', { name: 'Wallet address' }).fill(invalidWallet);

    // Step 9: Click Continue
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(2000);

    // Step 10: Validate Error Message
    const errorMsg = page.getByText(/Sorry, you have entered an invalid wallet address/i);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });

    resultRow['Test Steps'] = [
  '• Navigate to Buy page',
  '• Click "Buy BTC"',
  '• Enter Email',
  '• Click Continue',
  '• Wait and fetch OTP from email',
  '• Enter OTP',
  '• Click Verify',
  '• Enter invalid wallet address',
  '• Click Continue',
  '• Validate wallet error message on screen'
].join('\n');

resultRow['Test Data'] = [
  `• Email: ${email}`,
  `• OTP: ${otp}`,
  `• Wallet: ${invalidWallet}`
].join('\n');

    resultRow['Actual Result'] = 'Invalid wallet address error message displayed';
    resultRow['Result'] = 'PASS';
    resultRow['Comments'] = 'Negative test passed — system correctly handled invalid wallet';
  } catch (error: any) {
    const siteError = await page.locator('.text-red-500, .text-red-600').first().textContent();

    resultRow['Actual Result'] = `Error: ${error.message || 'Unknown error'} | UI Error: ${siteError || 'None'}`;
    resultRow['Result'] = 'FAIL';
    resultRow['Comments'] = 'Negative test failed — issue during OTP or wallet error validation';
  } finally {
    const endTime = Date.now();
    const executionMinutes = ((endTime - startTime) / 60000).toFixed(2);
    resultRow['Execution Time'] = `${executionMinutes} min`;

    exportSingleRowToExcel(resultRow);
  }
});
