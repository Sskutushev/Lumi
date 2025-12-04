import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate to homepage
    await page.goto('/');
  });

  test('should allow user to sign up, login, and logout', async ({ page }) => {
    // 1. Click sign in button to open auth modal
    await page.getByText('Sign In').click();

    // 2. Switch to sign up
    await page.getByText("Don't have an account?").click();
    await page.getByText('Sign Up').click();

    // 3. Fill in sign up form
    await page.locator('#email').fill('testuser@example.com');
    await page.locator('#password').fill('TestPassword123!');

    // 4. Submit the form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // 5. Verify success message or redirect
    await expect(page.getByText('Success')).toBeVisible();
    await expect(page.getByText('Check your email to confirm')).toBeVisible();
  });

  test('should allow user to sign in with existing account', async ({ page }) => {
    // 1. Click sign in button to open auth modal
    await page.getByText('Sign In').click();

    // 2. Fill in login form
    await page.locator('#email').fill('testuser@example.com');
    await page.locator('#password').fill('TestPassword123!');

    // 3. Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 4. Verify successful login (dashboard should be visible)
    await expect(page.getByText('Lumi')).toBeVisible();
    await expect(page.getByText('Inbox')).toBeVisible();
  });

  test('should allow user to log out', async ({ page }) => {
    // First, sign in
    await page.getByText('Sign In').click();
    await page.locator('#email').fill('testuser@example.com');
    await page.locator('#password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for login to complete
    await page.waitForURL('**/dashboard');

    // Click on user menu (using profile settings button)
    const userMenuButton = page.locator('.w-10.h-10.rounded-full').first();
    await userMenuButton.click();

    // Click logout
    await page.getByRole('button', { name: 'Log Out' }).click();

    // Verify successful logout
    await expect(page.getByText('Sign In')).toBeVisible();
    await expect(page.getByText('Get Started')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Click sign in button to open auth modal
    await page.getByText('Sign In').click();

    // Fill in wrong credentials
    await page.locator('#email').fill('wrong@example.com');
    await page.locator('#password').fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify error message
    await expect(page.getByText('Authentication failed')).toBeVisible();
  });
});
