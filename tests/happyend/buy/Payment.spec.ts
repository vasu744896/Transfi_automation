import { test, expect } from '@playwright/test'; 

test('Loop through currencies and cryptos, append to CSV', async ({ page }) => { 
 
  await page.goto('https://qa-buy.transfi.com/?apiKey=2ybWAQ398nDwXPla');
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded');

   await page.getByRole('button', { name: 'Buy BTC' }).click();
   await page.waitForTimeout(3000);
})