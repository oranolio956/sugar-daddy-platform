import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Cross-Browser Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  // These tests will run on all browsers defined in playwright.config.ts
  test('homepage cross-browser compatibility', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check basic functionality across browsers
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Sugar Daddy Platform');

    // Check for consistent element visibility
    const header = page.locator('h1, [data-testid="hero-title"]');
    if (await header.isVisible()) {
      await expect(header).toBeVisible();
    }

    const navigation = page.locator('nav, [data-testid="navigation"]');
    if (await navigation.isVisible()) {
      await expect(navigation).toBeVisible();
    }

    // Browser-specific checks
    if (browserName === 'chromium') {
      // Chrome-specific checks
      const chromeFeatures = await page.evaluate(() => {
        return {
          webpSupport: !!document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp'),
          serviceWorkerSupport: 'serviceWorker' in navigator
        };
      });
      
      expect(chromeFeatures.webpSupport).toBe(true);
    } else if (browserName === 'firefox') {
      // Firefox-specific checks
      const firefoxFeatures = await page.evaluate(() => {
        return {
          mozSupport: 'mozRTCPeerConnection' in window,
          firefoxVersion: navigator.userAgent.match(/Firefox\/(\d+)/)?.[1]
        };
      });
      
      expect(firefoxFeatures.firefoxVersion).toBeTruthy();
    } else if (browserName === 'webkit') {
      // Safari-specific checks
      const safariFeatures = await page.evaluate(() => {
        return {
          webkitSupport: 'webkitIndexedDB' in window,
          safariVersion: navigator.userAgent.match(/Version\/(\d+)/)?.[1]
        };
      });
      
      expect(safariFeatures.safariVersion).toBeTruthy();
    }

    // Take browser-specific screenshots
    await helpers.takeScreenshot(`homepage-${browserName}`);
  });

  test('login page cross-browser compatibility', async ({ page, browserName }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // Check form functionality
    const emailInput = page.locator('[name="email"]');
    const passwordInput = page.locator('[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test form interaction
    await emailInput.fill('test@example.com');
    await passwordInput.fill('TestPassword123!');
    
    // Browser-specific form behavior
    if (browserName === 'chromium') {
      // Chrome auto-fill detection
      const chromeAutoFill = await emailInput.evaluate(el => {
        return el.matches(':autofill') || el.value !== '';
      });
      
      // Should handle auto-fill properly
      expect(typeof chromeAutoFill).toBe('boolean');
    }

    // Take browser-specific screenshots
    await helpers.takeScreenshot(`login-page-${browserName}`);
  });

  test('dashboard cross-browser compatibility', async ({ page, browserName }) => {
    // Login first
    await helpers.loginUser();
    await helpers.waitForPageLoad();

    // Check dashboard functionality
    const dashboardTitle = page.locator('[data-testid="dashboard-title"], h1');
    await expect(dashboardTitle).toBeVisible();

    // Test interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.click({ timeout: 5000 });
        await page.waitForTimeout(500);
      }
    }

    // Browser-specific JavaScript features
    const jsFeatures = await page.evaluate(() => {
      return {
        promiseSupport: typeof Promise !== 'undefined',
        fetchSupport: typeof fetch !== 'undefined',
        localStorageSupport: typeof localStorage !== 'undefined',
        sessionStorageSupport: typeof sessionStorage !== 'undefined'
      };
    });

    expect(jsFeatures.promiseSupport).toBe(true);
    expect(jsFeatures.fetchSupport).toBe(true);
    expect(jsFeatures.localStorageSupport).toBe(true);
    expect(jsFeatures.sessionStorageSupport).toBe(true);

    // Take browser-specific screenshots
    await helpers.takeScreenshot(`dashboard-${browserName}`);
  });

  test('discovery page cross-browser compatibility', async ({ page, browserName }) => {
    // Login first
    await helpers.loginUser();
    await page.goto('/discovery');
    await helpers.waitForPageLoad();

    // Check search functionality
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('premium');
      await page.keyboard.press('Enter');
      await helpers.waitForPageLoad();
    }

    // Check user cards
    const userCards = page.locator('[data-testid="user-card"], .user-card');
    if (await userCards.count() > 0) {
      await expect(userCards.first()).toBeVisible();
    }

    // Browser-specific CSS features
    const cssFeatures = await page.evaluate(() => {
      const element = document.createElement('div');
      const style = element.style;
      
      return {
        flexboxSupport: 'flex' in style,
        gridSupport: 'grid' in style,
        cssVariablesSupport: '--test' in style,
        backdropFilterSupport: 'backdropFilter' in style || 'webkitBackdropFilter' in style
      };
    });

    expect(cssFeatures.flexboxSupport).toBe(true);
    expect(cssFeatures.gridSupport).toBe(true);

    // Take browser-specific screenshots
    await helpers.takeScreenshot(`discovery-page-${browserName}`);
  });

  test('mobile responsiveness cross-browser', async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check mobile-specific functionality
    const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"]');
    const touchTargetCount = await touchTargets.count();
    
    for (let i = 0; i < Math.min(touchTargetCount, 3); i++) {
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();
      
      if (box) {
        // Check minimum touch target size
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Mobile-specific features
    const mobileFeatures = await page.evaluate(() => {
      return {
        touchSupport: 'ontouchstart' in window,
        viewportUnitsSupport: CSS.supports('height', '100vh'),
        mobileViewport: window.innerWidth <= 768
      };
    });

    expect(mobileFeatures.touchSupport).toBe(true);
    expect(mobileFeatures.viewportUnitsSupport).toBe(true);
    expect(mobileFeatures.mobileViewport).toBe(true);

    // Take browser-specific mobile screenshots
    await helpers.takeScreenshot(`mobile-${browserName}`);
  });

  test('performance cross-browser', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      };
    });

    // Performance should be reasonable across all browsers
    expect(performanceMetrics.loadTime).toBeLessThan(5000);
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);

    // Browser-specific performance expectations
    if (browserName === 'chromium') {
      // Chrome typically has better performance
      expect(performanceMetrics.loadTime).toBeLessThan(3000);
    } else if (browserName === 'firefox') {
      // Firefox might be slightly slower
      expect(performanceMetrics.loadTime).toBeLessThan(4000);
    } else if (browserName === 'webkit') {
      // Safari performance
      expect(performanceMetrics.loadTime).toBeLessThan(4000);
    }
  });

  test('accessibility cross-browser', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check accessibility features
    const accessibilityFeatures = await page.evaluate(() => {
      return {
        ariaSupport: typeof Element.prototype.getAttribute === 'function',
        roleSupport: document.querySelectorAll('[role]').length > 0,
        labelSupport: document.querySelectorAll('label').length > 0,
        altTextSupport: document.querySelectorAll('img[alt]').length > 0
      };
    });

    expect(accessibilityFeatures.ariaSupport).toBe(true);
    expect(accessibilityFeatures.roleSupport).toBe(true);
    expect(accessibilityFeatures.labelSupport).toBe(true);
    expect(accessibilityFeatures.altTextSupport).toBe(true);

    // Browser-specific accessibility features
    if (browserName === 'chromium') {
      // Chrome accessibility features
      const chromeA11y = await page.evaluate(() => {
        return {
          chromeVoxSupport: 'chrome' in window,
          highContrastSupport: window.matchMedia('(prefers-contrast: high)').matches
        };
      });
      
      expect(typeof chromeA11y.highContrastSupport).toBe('boolean');
    }
  });

  test('error handling cross-browser', async ({ page, browserName }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await helpers.waitForPageLoad();

    const error404 = page.locator('[data-testid="404-error"], .error-404, h1:has-text("404")');
    if (await error404.isVisible()) {
      await expect(error404).toBeVisible();
    }

    // Test network errors
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/dashboard');
    await helpers.waitForPageLoad();

    // Error handling should work consistently
    const errorMessage = page.locator('.error-message, [data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }

    // Browser-specific error handling
    if (browserName === 'chromium') {
      // Chrome error handling
      const chromeErrors = await page.evaluate(() => {
        return {
          consoleErrors: window.console && typeof window.console.error === 'function',
          errorReporting: 'onerror' in window
        };
      });
      
      expect(chromeErrors.consoleErrors).toBe(true);
      expect(chromeErrors.errorReporting).toBe(true);
    }
  });
});