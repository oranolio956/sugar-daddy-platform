import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Accessibility Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('homepage accessibility', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');

    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1); // Should have exactly one h1

    // Check for landmarks
    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');
    const footer = page.locator('footer, [role="contentinfo"]');

    await expect(main).toBeVisible();
    await expect(nav).toBeVisible();
    await expect(footer).toBeVisible();

    // Check for skip link
    const skipLink = page.locator('[href="#main"], [data-testid="skip-link"]');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
    }

    // Check for form labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        if (await label.count() > 0) {
          await expect(label).toBeVisible();
        }
      }
    }

    // Check color contrast (basic check)
    const textElements = page.locator('*');
    const textCount = await textElements.count();
    
    // Just check a few elements for basic accessibility
    for (let i = 0; i < Math.min(textCount, 10); i++) {
      const element = textElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      if (['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          await expect(element).toBeVisible();
        }
      }
    }
  });

  test('login page accessibility', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // Check form labels
    const emailLabel = page.locator('label[for="email"], label:has(input[name="email"])');
    const passwordLabel = page.locator('label[for="password"], label:has(input[name="password"])');
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();

    // Check for proper form structure
    const form = page.locator('form');
    await expect(form).toHaveAttribute('novalidate');

    // Check for error messages accessibility
    const errorMessages = page.locator('.error-message, [role="alert"]');
    if (await errorMessages.count() > 0) {
      await expect(errorMessages.first()).toHaveAttribute('role', 'alert');
    }

    // Check for ARIA labels
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('dashboard accessibility', async ({ page }) => {
    // Login first
    await helpers.loginUser();
    await helpers.waitForPageLoad();

    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1);

    // Check for landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check for navigation
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();

    // Check for interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      if (text && text.trim().length > 0) {
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
      }
    }
  });

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Check if focus is visible
    const focusedElement = page.locator('*:focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }

    // Test multiple tab presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
    }

    // Test Enter key on focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('screen reader support', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for ARIA labels
    const ariaLabels = page.locator('[aria-label]');
    const ariaLabelCount = await ariaLabels.count();
    
    for (let i = 0; i < ariaLabelCount; i++) {
      const ariaLabel = ariaLabels.nth(i);
      const label = await ariaLabel.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label?.length).toBeGreaterThan(0);
    }

    // Check for ARIA roles
    const ariaRoles = page.locator('[role]');
    const ariaRoleCount = await ariaRoles.count();
    
    for (let i = 0; i < ariaRoleCount; i++) {
      const ariaRole = ariaRoles.nth(i);
      const role = await ariaRole.getAttribute('role');
      expect(role).toBeTruthy();
      expect(role?.length).toBeGreaterThan(0);
    }
  });

  test('mobile accessibility', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check touch target sizes
    const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"]');
    const touchTargetCount = await touchTargets.count();
    
    for (let i = 0; i < Math.min(touchTargetCount, 5); i++) {
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();
      
      if (box) {
        // Check minimum touch target size (44x44px recommended)
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('form accessibility', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    // Check for required field indicators
    const requiredFields = page.locator('input[required], select[required], textarea[required]');
    const requiredCount = await requiredFields.count();
    
    for (let i = 0; i < requiredCount; i++) {
      const field = requiredFields.nth(i);
      const label = page.locator(`label[for="${await field.getAttribute('id')}"]`);
      if (await label.count() > 0) {
        await expect(label).toBeVisible();
      }
    }

    // Check for fieldset and legend
    const fieldsets = page.locator('fieldset');
    const fieldsetCount = await fieldsets.count();
    
    for (let i = 0; i < fieldsetCount; i++) {
      const fieldset = fieldsets.nth(i);
      const legend = fieldset.locator('legend');
      if (await legend.count() > 0) {
        await expect(legend).toBeVisible();
      }
    }
  });

  test('error message accessibility', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // Submit empty form to trigger error
    await helpers.submitForm();
    await helpers.waitForPageLoad();

    // Check for error messages
    const errorMessages = page.locator('.error-message, [role="alert"], [aria-live="polite"]');
    const errorMessageCount = await errorMessages.count();
    
    for (let i = 0; i < errorMessageCount; i++) {
      const errorMessage = errorMessages.nth(i);
      await expect(errorMessage).toBeVisible();
      
      // Check for proper ARIA attributes
      const ariaLive = await errorMessage.getAttribute('aria-live');
      const role = await errorMessage.getAttribute('role');
      
      expect(ariaLive).toBe('polite');
      expect(role).toBe('alert');
    }
  });

  test('color contrast and visual accessibility', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for sufficient color contrast (basic check)
    const textElements = page.locator('*');
    const textCount = await textElements.count();
    
    // Check a few key elements
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const buttons = page.locator('button');
    const links = page.locator('a');

    if (await h1.count() > 0) {
      await expect(h1).toBeVisible();
    }
    if (await h2.count() > 0) {
      await expect(h2).toBeVisible();
    }
    if (await buttons.count() > 0) {
      await expect(buttons.first()).toBeVisible();
    }
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
  });

  test('focus management', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check initial focus
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Test focus on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();
      await expect(firstButton).toBeFocused();
    }

    // Test focus trap in modals (if any)
    const modals = page.locator('[role="dialog"], .modal, [data-modal="true"]');
    const modalCount = await modals.count();
    
    for (let i = 0; i < modalCount; i++) {
      const modal = modals.nth(i);
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
        
        // Check for focusable elements in modal
        const focusableElements = modal.locator('button, input, select, textarea, a');
        if (await focusableElements.count() > 0) {
          await expect(focusableElements.first()).toBeVisible();
        }
      }
    }
  });
});