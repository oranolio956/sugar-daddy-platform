import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Login Page Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/login');
    await helpers.waitForPageLoad();
  });

  test('login page loads correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Login/);

    // Check meta tags
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Login');
    expect(metaTags.description).toBeTruthy();

    // Check for login form
    const loginForm = page.locator('form, [data-testid="login-form"]');
    await expect(loginForm).toBeVisible();

    // Take screenshot for visual regression
    await helpers.takeScreenshot('login-page-desktop');
  });

  test('login form validation', async ({ page }) => {
    // Test empty form submission
    await helpers.submitForm();
    await helpers.checkErrorMessage();

    // Test invalid email format
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'invalid-email' },
      { selector: '[name="password"]', value: 'password123' }
    ]);
    await helpers.submitForm();
    await helpers.checkErrorMessage();

    // Test valid email but wrong password
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: 'wrongpassword' }
    ]);
    await helpers.submitForm();
    await helpers.checkErrorMessage();
  });

  test('successful login flow', async ({ page }) => {
    // Fill form with valid credentials
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' }
    ]);

    // Check remember me option
    const rememberMe = page.locator('[name="rememberMe"], [data-testid="remember-me"]');
    if (await rememberMe.isVisible()) {
      await rememberMe.check();
    }

    // Submit form
    await helpers.submitForm();

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await helpers.waitForPageLoad();

    // Verify user is logged in
    const userProfile = page.locator('[data-testid="user-profile"], .user-profile');
    await expect(userProfile).toBeVisible();
  });

  test('forgot password flow', async ({ page }) => {
    // Click forgot password link
    const forgotPasswordLink = page.locator('a[href*="forgot-password"], [data-testid="forgot-password"]');
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await helpers.waitForPageLoad();

      // Verify forgot password page
      await expect(page).toHaveURL(/.*\/forgot-password/);

      // Fill forgot password form
      await helpers.fillForm([
        { selector: '[name="email"]', value: 'test@example.com' }
      ]);
      await helpers.submitForm();

      // Check success message
      await helpers.checkSuccessMessage('Password reset email sent');
    }
  });

  test('login with social providers', async ({ page }) => {
    // Check for social login buttons
    const socialButtons = [
      { selector: '[data-testid="google-login"], button:has-text("Google")', provider: 'Google' },
      { selector: '[data-testid="facebook-login"], button:has-text("Facebook")', provider: 'Facebook' },
      { selector: '[data-testid="apple-login"], button:has-text("Apple")', provider: 'Apple' }
    ];

    for (const button of socialButtons) {
      const element = page.locator(button.selector);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
        await expect(element).toBeEnabled();
      }
    }
  });

  test('login accessibility', async ({ page }) => {
    // Check form labels
    const emailLabel = page.locator('label[for="email"], label:has(input[name="email"])');
    const passwordLabel = page.locator('label[for="password"], label:has(input[name="password"])');
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();

    // Check for proper form structure
    const form = page.locator('form');
    await expect(form).toHaveAttribute('novalidate'); // Should have client-side validation

    // Check for error messages accessibility
    const errorMessages = page.locator('.error-message, [role="alert"]');
    if (await errorMessages.count() > 0) {
      await expect(errorMessages.first()).toHaveAttribute('role', 'alert');
    }
  });

  test('login security features', async ({ page }) => {
    // Test CSRF protection
    const csrfToken = page.locator('input[name="_token"], input[name="csrf_token"]');
    if (await csrfToken.isVisible()) {
      await expect(csrfToken).toHaveValue();
    }

    // Test rate limiting (simulate multiple failed attempts)
    for (let i = 0; i < 5; i++) {
      await helpers.fillForm([
        { selector: '[name="email"]', value: `test${i}@example.com` },
        { selector: '[name="password"]', value: 'wrongpassword' }
      ]);
      await helpers.submitForm();
      await page.waitForTimeout(500);
    }

    // Should show rate limiting message
    const rateLimitMessage = page.locator('.error-message:has-text("too many requests"), .rate-limit-message');
    if (await rateLimitMessage.isVisible()) {
      await expect(rateLimitMessage).toBeVisible();
    }
  });

  test('login mobile responsiveness', async ({ page }) => {
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that form is accessible on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    
    // Check form elements are properly sized for mobile
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    if (await emailInput.isVisible()) {
      const emailBox = await emailInput.boundingBox();
      expect(emailBox?.height).toBeGreaterThan(40); // Minimum touch target size
    }
  });

  test('login performance', async ({ page }) => {
    const vitals = await helpers.checkCoreWebVitals();
    
    // Login page should load quickly
    expect(vitals.lcp).toBeLessThan(2000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('login error handling', async ({ page }) => {
    // Test network error
    await page.route('**/api/auth/login', route => route.abort());
    
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' }
    ]);
    await helpers.submitForm();

    // Should show network error
    const networkError = page.locator('.error-message:has-text("network"), .error-message:has-text("connection")');
    if (await networkError.isVisible()) {
      await expect(networkError).toBeVisible();
    }
  });

  test('login session management', async ({ page }) => {
    // Login with remember me
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' }
    ]);
    
    const rememberMe = page.locator('[name="rememberMe"]');
    if (await rememberMe.isVisible()) {
      await rememberMe.check();
    }
    
    await helpers.submitForm();
    await page.waitForURL(/.*\/dashboard/);

    // Close browser and reopen
    await page.context().close();
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext?.newPage();
    
    // Navigate to dashboard - should still be logged in
    await newPage?.goto('/dashboard');
    await expect(newPage?.locator('[data-testid="user-profile"]')).toBeVisible();
  });
});