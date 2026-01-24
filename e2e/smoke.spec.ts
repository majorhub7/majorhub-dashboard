import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Smoke Suite', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('should load login page correctly', async ({ page }) => {
        await expect(loginPage.heading).toBeVisible();
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await loginPage.login('wrong@email.com', 'wrongpassword');

        // Expect error message to appear
        const errorMessage = page.locator('text=Invalid login credentials').or(page.locator('text=Email ou senha incorretos'));
        await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });
});
