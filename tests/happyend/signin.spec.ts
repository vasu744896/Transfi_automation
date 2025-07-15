import { test, expect } from '@playwright/test';
// had some bug in this code
test('test', async ({ page }) => {
  await page.goto('https://qa-buy.transfi.com/buy/sign-in');

  await page.getByRole('textbox', { name: 'Email' }).click();

  await page.getByRole('textbox', { name: 'Email' }).fill('baiondatastaff@gmail.com');

  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: 'Enter your first name here' }).click();

  await page.getByRole('textbox', { name: 'Enter your first name here' }).fill('baiondata');

  await page.getByRole('textbox', { name: 'Enter your last name here' }).click();

  await page.getByRole('textbox', { name: 'Enter your last name here' }).fill('solution');

  await page.getByRole('textbox', { name: 'YYYY-MM-DD' }).click();

  await page.getByRole('textbox', { name: 'YYYY-MM-DD' }).fill('2000 05 15');

  await page.getByRole('textbox', { name: 'YYYY-MM-DD' }).press('Enter');

  await page.getByLabel('Country*').selectOption('India');

  await page.getByLabel('Country*').click();

  await page.getByRole('button', { name: 'Sign up' }).click();

});
