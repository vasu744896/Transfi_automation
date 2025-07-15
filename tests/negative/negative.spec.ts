import { test, expect } from '@playwright/test';

test('Invalid Google login should show error', async ({ page }) => {
  test.setTimeout(60000); 

  await page.goto('https://qa-buy.transfi.com/buy/sign-in');

  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    page.getByRole('button', { name: 'Use Google' }).click(),
  ]);

  const contextPage = popup || page;

  await contextPage.getByRole('textbox', { name: 'Email or phone' }).click();
  await contextPage.getByRole('textbox', { name: 'Email or phone' }).fill('baiondatastaff@gmail.com');
  await contextPage.getByRole('button', { name: 'Next' }).click();

  await contextPage.getByRole('textbox', { name: 'Enter your password' }).waitFor({ timeout: 10000 });
  await contextPage.getByRole('textbox', { name: 'Enter your password' }).fill('WrongPassword123!');
  await contextPage.getByRole('button', { name: 'Next' }).click();

  const errorLocator = contextPage.locator('text=/Wrong password/i');
  await errorLocator.waitFor({ timeout: 10000 }).catch(() => {});
  const errorVisible = await errorLocator.isVisible();

  expect(errorVisible).toBe(true);
});