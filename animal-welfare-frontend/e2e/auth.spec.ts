import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user successfully', async ({ page }) => {
    const randomUser = `user_${Math.floor(Math.random() * 100000)}`;
    
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Create your account');

    await page.fill('[data-testid="firstname-input"]', 'Test');
    await page.fill('[data-testid="lastname-input"]', 'User');
    await page.fill('[data-testid="username-input"]', randomUser);
    await page.fill('[data-testid="email-input"]', `${randomUser}@example.com`);
    await page.fill('[data-testid="password-input"]', 'password123');

    await page.click('[data-testid="register-submit"]');

    // Registration redirects to home page '/' and logs in
    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="navbar-profile-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="navbar-profile-btn"]')).toContainText(randomUser);
  });

  test('should login and logout successfully', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[data-testid="username-input"]', 'aayush');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-submit"]');

    await page.waitForURL('**/');
    await expect(page.locator('[data-testid="navbar-profile-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="navbar-profile-btn"]')).toContainText('aayush');

    // 2. Logout
    await page.click('[data-testid="navbar-profile-btn"]');
    await expect(page.locator('[data-testid="navbar-logout"]')).toBeVisible();
    await page.click('[data-testid="navbar-logout"]');

    await expect(page.locator('[data-testid="navbar-login"]')).toBeVisible();
  });
});
