import { test, expect } from '@playwright/test';

test('test', async ({ page, context }) => {
    await page.goto('https://qa-buy.transfi.com/');

    await page.getByRole('navigation').locator('path').click();
    await page.getByRole('button', { name: 'Sign In' }).click();

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Use Google' }).click();
    const page1 = await page1Promise;

    await page1.getByRole('textbox', { name: 'Email or phone' }).fill('baiondatacontrol@gmail.com');
    await page1.getByRole('button', { name: 'Next' }).click();
    await page1.getByRole('textbox', { name: 'Enter your password' }).fill('Baiondata@solution');
    await page1.getByRole('button', { name: 'Next' }).click();

    await page.waitForTimeout(10000);


    await page.getByRole('navigation').getByRole('img').click();
    await page.getByRole('listitem').filter({ hasText: 'Sign Outbaiondatacontrol@' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForTimeout(3000);


    await page.getByRole('navigation').getByRole('img').click();
    await page.getByRole('button', { name: 'Sign In' }).click();

    const contextPagePromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Use Google' }).click();
    const contextPage = await contextPagePromise;

    await contextPage.waitForLoadState('domcontentloaded');

    await contextPage.getByRole('link', { name: 'Use another account' }).click();
    await contextPage.getByRole('textbox', { name: 'Email or phone' }).fill('baiondatacontrol@gmail.com');
    await contextPage.getByRole('button', { name: 'Next' }).click();
    await contextPage.getByRole('textbox', { name: 'Enter your password' }).fill('Baiondata@solutionas');
    await contextPage.getByRole('button', { name: 'Next' }).click();


    let popupClosed = false;
    contextPage.on('close', () => {
        console.log('❗ Popup was closed before error could be validated');
        popupClosed = true;
    });

    try {
        const errorLocator = contextPage.locator('text=/Wrong password/i');
        await errorLocator.waitFor({ timeout: 10000 });
    
    if (!popupClosed) {
        const errorVisible = await errorLocator.isVisible();
        expect(errorVisible).toBe(true);
    } else {
        throw new Error('Popup closed before error check.');
        }
    } catch (error) {
    console.error('❌ Failed to validate wrong password error:', error.message);
    throw error;
    }
});
