// tests/invalid-otp.spec.ts
import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// ✅ Timeout already set to 4 minutes (5 mins = 300000 ms, optional)
test.setTimeout(240000); // 4 minutes timeout

const reportPath = path.join('report', 'Playwright-Test-Case-Report.xlsx');
const testCaseId = 'TC-8999';
const testTitle = 'Negative Test – Invalid OTP Input';

const testSteps = [
  '• Go to Transfi Buy page',
  '• Click on "Buy BTC"',
  '• Enter email: baiondatastaff@gmail.com',
  '• Click Continue',
  '• Wait for OTP input to appear',
  '• Fill invalid OTP: 331156',
  '• Expect red error toast: "Incorrect verification code"'
].join('\n');

const testData = {
  'Test Case ID': testCaseId,
  Purpose: 'Validate that an invalid OTP shows appropriate error message',
  Description: testTitle,
  'Pre-conditions': [
    '• "Buy BTC" button is visible and clickable on https://qa-buy.transfi.com',
    '• OTP input fields appear after submitting a valid email'
  ].join('\n'),
  'Test Steps': testSteps,
  'Test Data': [
    '• Email: baiondatastaff@gmail.com',
    '• OTP: 331156 (Invalid)'
  ].join('\n'),
  'Expected Result': 'Red toast appears with "Incorrect verification code"',
  'Actual Result': '',
  Comments: '',
  'Execution Time': '',
  Result: ''
};

async function saveToExcel(data: any) {
  const headers = [
    'Test Case ID',
    'Purpose',
    'Description',
    'Pre-conditions',
    'Test Steps',
    'Test Data',
    'Expected Result',
    'Actual Result',
    'Comments',
    'Execution Time',
    'Result'
  ];

  const fileExists = fs.existsSync(reportPath);
  let workbook, worksheet;

  if (fileExists) {
    workbook = XLSX.readFile(reportPath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const exists = jsonData.find((row: any) =>
      row['Test Case ID'] === data['Test Case ID'] &&
      row['Description'] === data['Description']
    );

    if (!exists) {
      jsonData.push(data);
    } else {
      const index = jsonData.findIndex((row: any) =>
        row['Test Case ID'] === data['Test Case ID'] &&
        row['Description'] === data['Description']
      );
      jsonData[index] = data;
    }

    worksheet = XLSX.utils.json_to_sheet(jsonData, { header: headers });
    workbook.Sheets[workbook.SheetNames[0]] = worksheet;
  } else {
    worksheet = XLSX.utils.json_to_sheet([data], { header: headers });
    workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TestCases');
  }

  XLSX.writeFile(workbook, reportPath);
}

test(testTitle, async ({ page }) => {
  let testFailed = false;
  let errorMessage = '';
  const startTime = Date.now();

  try {
    await test.step('1. Go to Transfi Buy page', async () => {
      await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
    });

    await test.step('2. Click "Buy BTC"', async () => {
      await page.getByRole('button', { name: 'Buy BTC' }).click();
    });

    await test.step('3. Enter Email', async () => {
      await page.getByRole('textbox', { name: 'Email' }).fill('baiondatastaff@gmail.com');
    });

    await test.step('4. Click "Continue"', async () => {
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.waitForTimeout(3000); // ⏱ wait for toast if any

      // ✅ NEW: Detect "Too many OTP requests" toast
      const rateLimitToast = page.locator('#chakra-toast-manager-bottom').getByText(/too many otp requests/i);
      if (await rateLimitToast.isVisible()) {
        const toastText = await rateLimitToast.textContent();
        errorMessage = '⚠️ Too many OTP requests – rate limited';
        testFailed = true;
        testData['Actual Result'] = `❌ Rate-limit error shown: "${toastText?.trim()}"`;
        testData.Comments = '⛔ OTP not sent due to rate limit. Cannot continue test.';
        testData.Result = 'FAIL';
        return; // 🚫 Abort further steps
      }
    });

    await test.step('5. Wait for OTP input field', async () => {
      await page.waitForTimeout(20000);
      await page.waitForSelector('input[id^="pin-input-1-"]', { state: 'visible' });
    });

    await test.step('6. Enter invalid OTP', async () => {
      const otpDigits = ['3', '3', '1', '1', '5', '6'];
      for (let i = 0; i < otpDigits.length; i++) {
        await page.locator(`#pin-input-1-${i}`).fill(otpDigits[i]);
      }
      await page.waitForTimeout(2000);
    });

    await test.step('7. Check for red error message toast', async () => {
      const toast = page.locator('#chakra-toast-manager-bottom').getByText(/incorrect verification code/i);
      try {
        await expect(toast).toBeVisible({ timeout: 5000 });
        const toastText = await toast.textContent();
        testData['Actual Result'] = `✅ Red toast shown: "${toastText?.trim()}"`;
        testData.Comments = '✅ Negative test passed';
        testData.Result = 'PASS';
      } catch (e) {
        testFailed = true;
        errorMessage = '❌ Red error toast not found';
        testData['Actual Result'] = errorMessage;
        testData.Comments = '⚠️ Negative test failed – toast not visible';
        testData.Result = 'FAIL';
      }
    });

  } catch (err: any) {
    testFailed = true;
    errorMessage = `❌ Unexpected error: ${err.message}`;
    testData['Actual Result'] = errorMessage;
    testData.Comments = '❌ Test crashed during execution';
    testData.Result = 'FAIL';
  } finally {
    const endTime = Date.now();
    const durationMin = ((endTime - startTime) / 60000).toFixed(2);
    testData['Execution Time'] = `${durationMin} min`;
    await saveToExcel(testData);

    if (testFailed) {
      throw new Error(errorMessage);
    }
  }
});
