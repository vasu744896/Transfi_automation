import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  await page.goto('https://qa-buy.transfi.com/buy/sign-in');

  const page1Promise = page.waitForEvent('popup');

  await page.getByRole('button', { name: 'Use Google' }).click();

  const page1 = await page1Promise;

  await page1.getByRole('textbox', { name: 'Email or phone' }).click();

  await page1.getByRole('textbox', { name: 'Email or phone' }).fill('baiondatacontrol@gmail.com');

  await page1.getByRole('button', { name: 'Next' }).click();

  await page1.getByRole('textbox', { name: 'Enter your password' }).click();

  await page1.getByRole('textbox', { name: 'Enter your password' }).fill('Baiondata@solution');

  await page1.getByRole('button', { name: 'Next' }).click();

  await page.waitForTimeout(10000);

  await page.getByRole('navigation').getByRole('img').click();

  await page.getByText('Hi Baiondata').click();
  
});