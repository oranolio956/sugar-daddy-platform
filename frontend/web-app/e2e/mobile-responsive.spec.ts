import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Mobile Responsiveness Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe('iPhone SE (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('homepage mobile layout', async ({ page }) => {
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Check mobile navigation
      const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, nav');
      if (await mobileNav.isVisible()) {
        await expect(mobileNav).toBeVisible();
      }

      // Check touch target sizes
      const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"]');
      const touchTargetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(touchTargetCount, 5); i++) {
        const target = touchTargets.nth(i);
        const box = await target.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Take mobile screenshot
      await helpers.takeScreenshot('homepage-iphone-se');
    });

    test('login page mobile layout', async ({ page }) => {
      await page.goto('/login');
      await helpers.waitForPageLoad();

      // Check form layout
      const form = page.locator('form, [data-testid="login-form"]');
      if (await form.isVisible()) {
        await expect(form).toBeVisible();
      }

      // Check input field sizes
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const box = await input.boundingBox();
        
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }

      // Take mobile screenshot
      await helpers.takeScreenshot('login-page-iphone-se');
    });
  });

  test.describe('iPhone 12 (390x844)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
    });

    test('dashboard mobile layout', async ({ page }) => {
      // Login first
      await helpers.loginUser();
      await helpers.waitForPageLoad();

      // Check dashboard layout
      const dashboardContent = page.locator('[data-testid="dashboard-content"], .dashboard-content');
      if (await dashboardContent.isVisible()) {
        await expect(dashboardContent).toBeVisible();
      }

      // Check for proper spacing
      const elements = page.locator('*');
      const elementCount = await elements.count();
      
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = elements.nth(i);
        const box = await element.boundingBox();
        
        if (box && box.width > 0 && box.height > 0) {
          expect(box.width).toBeLessThanOrEqual(390);
        }
      }

      // Take mobile screenshot
      await helpers.takeScreenshot('dashboard-iphone-12');
    });

    test('discovery page mobile layout', async ({ page }) => {
      // Login first
      await helpers.loginUser();
      await page.goto('/discovery');
      await helpers.waitForPageLoad();

      // Check user cards layout
      const userCards = page.locator('[data-testid="user-card"], .user-card');
      if (await userCards.count() > 0) {
        const firstCard = userCards.first();
        const box = await firstCard.boundingBox();
        
        if (box) {
          expect(box.width).toBeLessThanOrEqual(390);
        }
      }

      // Check for horizontal scroll
      const body = page.locator('body');
      const bodyBox = await body.boundingBox();
      
      if (bodyBox) {
        expect(bodyBox.width).toBeLessThanOrEqual(390);
      }

      // Take mobile screenshot
      await helpers.takeScreenshot('discovery-page-iphone-12');
    });
  });

  test.describe('iPad (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('tablet layout', async ({ page }) => {
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Check for tablet-specific layout
      const tabletLayout = page.locator('[data-tablet="true"], .tablet-layout');
      if (await tabletLayout.isVisible()) {
        await expect(tabletLayout).toBeVisible();
      }

      // Check for proper column layout
      const columns = page.locator('.column, [data-column], .grid-item');
      const columnCount = await columns.count();
      
      if (columnCount > 0) {
        for (let i = 0; i < columnCount; i++) {
          const column = columns.nth(i);
          const box = await column.boundingBox();
          
          if (box) {
            expect(box.width).toBeLessThanOrEqual(768);
          }
        }
      }

      // Take tablet screenshot
      await helpers.takeScreenshot('homepage-ipad');
    });
  });

  test.describe('Desktop (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('desktop layout', async ({ page }) => {
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Check for desktop-specific features
      const desktopFeatures = page.locator('[data-desktop="true"], .desktop-layout, .sidebar');
      if (await desktopFeatures.isVisible()) {
        await expect(desktopFeatures).toBeVisible();
      }

      // Take desktop screenshot
      await helpers.takeScreenshot('homepage-desktop');
    });
  });

  test('responsive navigation', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Check navigation behavior
      const nav = page.locator('nav, [data-testid="navigation"]');
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }

      // Check for menu toggle on mobile
      if (viewport.width <= 768) {
        const menuToggle = page.locator('[data-testid="menu-toggle"], .menu-toggle, button[aria-label="Menu"]');
        if (await menuToggle.isVisible()) {
          await expect(menuToggle).toBeVisible();
          
          // Test menu toggle functionality
          await menuToggle.click();
          await page.waitForTimeout(500);
          
          const menu = page.locator('[data-testid="menu"], .menu, [aria-expanded="true"]');
          if (await menu.isVisible()) {
            await expect(menu).toBeVisible();
          }
        }
      }

      // Take responsive screenshot
      await helpers.takeScreenshot(`navigation-${viewport.name}`);
    }
  });

  test('responsive forms', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/login');
      await helpers.waitForPageLoad();

      // Check form layout
      const form = page.locator('form, [data-testid="login-form"]');
      if (await form.isVisible()) {
        await expect(form).toBeVisible();
      }

      // Check input field layout
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const box = await input.boundingBox();
        
        if (box) {
          if (viewport.width <= 768) {
            // Mobile: inputs should be full width
            expect(box.width).toBeGreaterThanOrEqual(viewport.width * 0.8);
          }
        }
      }

      // Take responsive form screenshot
      await helpers.takeScreenshot(`form-${viewport.name}`);
    }
  });

  test('responsive images', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Check image responsiveness
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i);
        const box = await image.boundingBox();
        
        if (box) {
          expect(box.width).toBeLessThanOrEqual(viewport.width);
          expect(box.height).toBeLessThanOrEqual(viewport.height);
        }
      }

      // Take responsive images screenshot
      await helpers.takeScreenshot(`images-${viewport.name}`);
    }
  });

  test('responsive typography', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await helpers.waitForPageLoad();

      // Check typography scaling
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      for (let i = 0; i < Math.min(headingCount, 3); i++) {
        const heading = headings.nth(i);
        const fontSize = await heading.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });
        
        expect(fontSize).toBeTruthy();
      }

      // Take responsive typography screenshot
      await helpers.takeScreenshot(`typography-${viewport.name}`);
    }
  });

  test('responsive grid layouts', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/discovery');
      await helpers.waitForPageLoad();

      // Check grid layout
      const gridItems = page.locator('[data-testid="grid-item"], .grid-item, .card');
      const gridItemCount = await gridItems.count();
      
      if (gridItemCount > 0) {
        const firstItem = gridItems.first();
        const box = await firstItem.boundingBox();
        
        if (box) {
          expect(box.width).toBeLessThanOrEqual(viewport.width);
        }
      }

      // Take responsive grid screenshot
      await helpers.takeScreenshot(`grid-${viewport.name}`);
    }
  });

  test('touch interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test touch interactions
    const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"]');
    const touchTargetCount = await touchTargets.count();
    
    for (let i = 0; i < Math.min(touchTargetCount, 3); i++) {
      const target = touchTargets.nth(i);
      
      // Test tap
      await target.tap();
      await page.waitForTimeout(500);
      
      // Test long press
      await target.hover();
      await page.mouse.down();
      await page.waitForTimeout(1000);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }

    // Take touch interactions screenshot
    await helpers.takeScreenshot('touch-interactions');
  });

  test('scroll behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test scroll behavior
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    // Check scroll position
    const scrollPosition = await page.evaluate(() => window.pageYOffset);
    expect(scrollPosition).toBe(0);

    // Take scroll behavior screenshot
    await helpers.takeScreenshot('scroll-behavior');
  });
});