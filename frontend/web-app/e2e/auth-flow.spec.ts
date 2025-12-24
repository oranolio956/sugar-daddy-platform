import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete user registration flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill out registration form
    await page.fill('[name="email"]', 'test-e2e@example.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Registration successful');

    // Verify redirect to verification page
    await expect(page).toHaveURL(/.*\/verify-email/);
  });

  test('user login flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill out login form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify successful login (redirect to dashboard)
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Verify user is logged in (check for user-specific content)
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('login with remember me', async ({ page }) => {
    await page.goto('/login');

    // Fill out login form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');

    // Check remember me
    await page.check('[name="rememberMe"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify login
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Close browser and reopen
    await page.context().close();
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext?.newPage();

    // Navigate to dashboard - should still be logged in
    await newPage?.goto('/dashboard');
    await expect(newPage?.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('logout flow', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Verify login
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Logout
    await page.click('[data-testid="logout-button"]');

    // Verify logout (redirect to home or login)
    await expect(page).toHaveURL(/.*\/(login|home)/);

    // Verify user is logged out
    await expect(page.locator('[data-testid="user-profile"]')).not.toBeVisible();
  });

  test('password reset flow', async ({ page }) => {
    // Navigate to forgot password page
    await page.goto('/forgot-password');

    // Enter email
    await page.fill('[name="email"]', 'test@example.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Password reset email sent');

    // Simulate clicking the reset link from email (mock)
    // In real scenario, this would be a real email link
    await page.goto('/reset-password?token=mock-token');

    // Fill out new password
    await page.fill('[name="password"]', 'NewPassword123!');
    await page.fill('[name="confirmPassword"]', 'NewPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Password reset successful');
  });

  test('CSRF protection', async ({ page }) => {
    // Try to submit login form without CSRF token
    await page.goto('/login');

    // Fill form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');

    // Try to submit without proper CSRF token (simulate)
    const response = await page.evaluate(async () => {
      const form = document.querySelector('form');
      const formData = new FormData(form);
      
      return fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    });

    // Should fail due to CSRF protection
    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);
  });

  test('rate limiting protection', async ({ page }) => {
    // Try to login multiple times quickly (simulate rate limiting)
    await page.goto('/login');

    for (let i = 0; i < 10; i++) {
      await page.fill('[name="email"]', `test${i}@example.com`);
      await page.fill('[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
    }

    // Should eventually get rate limited
    await expect(page.locator('.error-message')).toContainText(/too many requests/i);
  });

  test('session timeout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Verify login
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Wait for session to timeout (simulate)
    // In real scenario, this would be actual timeout
    await page.waitForTimeout(30000); // 30 seconds

    // Try to access protected page
    await page.goto('/dashboard');

    // Should be redirected to login due to session timeout
    await expect(page).toHaveURL(/.*\/login/);
  });
});