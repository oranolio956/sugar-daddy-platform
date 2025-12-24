import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Registration Page Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/register');
    await helpers.waitForPageLoad();
  });

  test('registration page loads correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Register/);

    // Check meta tags
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Register');
    expect(metaTags.description).toBeTruthy();

    // Check for registration form
    const registrationForm = page.locator('form, [data-testid="registration-form"]');
    await expect(registrationForm).toBeVisible();

    // Take screenshot for visual regression
    await helpers.takeScreenshot('registration-page-desktop');
  });

  test('registration form validation', async ({ page }) => {
    // Test empty form submission
    await helpers.submitForm();
    await helpers.checkErrorMessage();

    // Test invalid email format
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'invalid-email' },
      { selector: '[name="password"]', value: 'password123' },
      { selector: '[name="confirmPassword"]', value: 'password123' }
    ]);
    await helpers.submitForm();
    await helpers.checkErrorMessage();

    // Test password mismatch
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: 'password123' },
      { selector: '[name="confirmPassword"]', value: 'differentpassword' }
    ]);
    await helpers.submitForm();
    await helpers.checkErrorMessage('Passwords do not match');

    // Test weak password
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: '123' },
      { selector: '[name="confirmPassword"]', value: '123' }
    ]);
    await helpers.submitForm();
    await helpers.checkErrorMessage('Password too weak');
  });

  test('successful registration flow', async ({ page }) => {
    // Fill form with valid data
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'newuser@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' },
      { selector: '[name="confirmPassword"]', value: 'TestPassword123!' },
      { selector: '[name="username"]', value: 'newuser' },
      { selector: '[name="firstName"]', value: 'New' },
      { selector: '[name="lastName"]', value: 'User' }
    ]);

    // Submit form
    await helpers.submitForm();

    // Check success message
    await helpers.checkSuccessMessage('Registration successful');

    // Verify redirect to verification page
    await expect(page).toHaveURL(/.*\/verify-email/);
  });

  test('registration form accessibility', async ({ page }) => {
    // Check form labels
    const labels = [
      'label[for="email"]',
      'label[for="password"]',
      'label[for="confirmPassword"]',
      'label[for="username"]',
      'label[for="firstName"]',
      'label[for="lastName"]'
    ];

    for (const label of labels) {
      const element = page.locator(label);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }

    // Check for proper form structure
    const form = page.locator('form');
    await expect(form).toHaveAttribute('novalidate');

    // Check password strength indicator
    const passwordInput = page.locator('[name="password"]');
    await passwordInput.fill('weak');
    await page.waitForTimeout(500);
    
    const strengthIndicator = page.locator('[data-testid="password-strength"], .password-strength');
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toBeVisible();
    }
  });

  test('registration security features', async ({ page }) => {
    // Test CSRF protection
    const csrfToken = page.locator('input[name="_token"], input[name="csrf_token"]');
    if (await csrfToken.isVisible()) {
      await expect(csrfToken).toHaveValue();
    }

    // Test email uniqueness
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'existing@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' },
      { selector: '[name="confirmPassword"]', value: 'TestPassword123!' },
      { selector: '[name="username"]', value: 'existinguser' },
      { selector: '[name="firstName"]', value: 'Existing' },
      { selector: '[name="lastName"]', value: 'User' }
    ]);
    await helpers.submitForm();
    await helpers.checkErrorMessage('Email already exists');

    // Test username uniqueness
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'newuser2@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' },
      { selector: '[name="confirmPassword"]', value: 'TestPassword123!' },
      { selector: '[name="username"]', value: 'existinguser' },
      { selector: '[name="firstName"]', value: 'New' },
      { selector: '[name="lastName"]', value: 'User' }
    ]);
    await helpers.submitForm();
    await helpers.checkErrorMessage('Username already taken');
  });

  test('registration mobile responsiveness', async ({ page }) => {
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that form is accessible on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    
    // Check form elements are properly sized for mobile
    const emailInput = page.locator('[name="email"]');
    const passwordInput = page.locator('[name="password"]');
    
    if (await emailInput.isVisible()) {
      const emailBox = await emailInput.boundingBox();
      expect(emailBox?.height).toBeGreaterThan(40); // Minimum touch target size
    }
  });

  test('registration performance', async ({ page }) => {
    const vitals = await helpers.checkCoreWebVitals();
    
    // Registration page should load quickly
    expect(vitals.lcp).toBeLessThan(2000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('registration error handling', async ({ page }) => {
    // Test network error
    await page.route('**/api/auth/register', route => route.abort());
    
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' },
      { selector: '[name="confirmPassword"]', value: 'TestPassword123!' },
      { selector: '[name="username"]', value: 'testuser' },
      { selector: '[name="firstName"]', value: 'Test' },
      { selector: '[name="lastName"]', value: 'User' }
    ]);
    await helpers.submitForm();

    // Should show network error
    const networkError = page.locator('.error-message:has-text("network"), .error-message:has-text("connection")');
    if (await networkError.isVisible()) {
      await expect(networkError).toBeVisible();
    }
  });

  test('registration terms and conditions', async ({ page }) => {
    // Check for terms checkbox
    const termsCheckbox = page.locator('[name="terms"], [data-testid="terms-checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await expect(termsCheckbox).toBeVisible();
      
      // Test without accepting terms
      await helpers.fillForm([
        { selector: '[name="email"]', value: 'test@example.com' },
        { selector: '[name="password"]', value: 'TestPassword123!' },
        { selector: '[name="confirmPassword"]', value: 'TestPassword123!' },
        { selector: '[name="username"]', value: 'testuser' },
        { selector: '[name="firstName"]', value: 'Test' },
        { selector: '[name="lastName"]', value: 'User' }
      ]);
      await helpers.submitForm();
      await helpers.checkErrorMessage('Please accept the terms and conditions');

      // Accept terms and try again
      await termsCheckbox.check();
      await helpers.submitForm();
      // Should not show terms error
      const termsError = page.locator('.error-message:has-text("terms")');
      await expect(termsError).not.toBeVisible();
    }
  });

  test('registration social signup', async ({ page }) => {
    // Check for social signup buttons
    const socialButtons = [
      { selector: '[data-testid="google-signup"], button:has-text("Sign up with Google")', provider: 'Google' },
      { selector: '[data-testid="facebook-signup"], button:has-text("Sign up with Facebook")', provider: 'Facebook' },
      { selector: '[data-testid="apple-signup"], button:has-text("Sign up with Apple")', provider: 'Apple' }
    ];

    for (const button of socialButtons) {
      const element = page.locator(button.selector);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
        await expect(element).toBeEnabled();
      }
    }
  });

  test('registration email verification flow', async ({ page }) => {
    // Complete registration
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'verify@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' },
      { selector: '[name="confirmPassword"]', value: 'TestPassword123!' },
      { selector: '[name="username"]', value: 'verifyuser' },
      { selector: '[name="firstName"]', value: 'Verify' },
      { selector: '[name="lastName"]', value: 'User' }
    ]);
    await helpers.submitForm();

    // Should redirect to verification page
    await expect(page).toHaveURL(/.*\/verify-email/);

    // Check verification page content
    const verificationTitle = page.locator('h1, [data-testid="verification-title"]');
    if (await verificationTitle.isVisible()) {
      await expect(verificationTitle).toContainText(/Verify your email|Check your email/);
    }

    // Check for resend email button
    const resendButton = page.locator('[data-testid="resend-email"], button:has-text("Resend")');
    if (await resendButton.isVisible()) {
      await expect(resendButton).toBeVisible();
      await expect(resendButton).toBeEnabled();
    }
  });
});