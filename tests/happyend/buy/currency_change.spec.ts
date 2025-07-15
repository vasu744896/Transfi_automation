import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');

    await page.locator('div').filter({ hasText: /^EUR$/ }).nth(2).click();

    await page.locator('div').filter({ hasText: /^Austria-EUR$/ }).first().click();

    await page.waitForTimeout(5000);

    await page.locator('div').filter({ hasText: /^EUR$/ }).nth(1).click();

    await page.locator('div').filter({ hasText: /^Andorra-EUR$/ }).first().click();

    await page.waitForTimeout(5000);

    await page.locator('div').filter({ hasText: /^EUR$/ }).nth(1).click();

    await page.locator('div').filter({ hasText: /^Belgium-EUR$/ }).first().click();

    await page.waitForTimeout(5000);

    await page.getByRole('button', { name: 'Buy BTC' }).click();
});