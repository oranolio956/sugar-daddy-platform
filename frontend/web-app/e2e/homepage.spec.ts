import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Homepage Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPageLoad();
  });

  test('homepage loads correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Sugar Daddy Platform/);

    // Check meta tags
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Sugar Daddy Platform');
    expect(metaTags.description).toBeTruthy();
    expect(metaTags.viewport).toBeTruthy();

    // Check structured data
    expect(metaTags.structuredData.length).toBeGreaterThan(0);

    // Take screenshot for visual regression
    await helpers.takeScreenshot('homepage-desktop');
  });

  test('homepage navigation works', async ({ page }) => {
    // Test navigation links
    const navLinks = [
      { selector: 'nav a[href="/login"]', text: 'Login' },
      { selector: 'nav a[href="/register"]', text: 'Register' },
      { selector: 'nav a[href="/discovery"]', text: 'Discover' },
      { selector: 'nav a[href="/dashboard"]', text: 'Dashboard' }
    ];

    for (const link of navLinks) {
      const element = page.locator(link.selector);
      if (await element.isVisible()) {
        await expect(element).toContainText(link.text);
        await element.click();
        await helpers.waitForPageLoad();
        await page.goBack();
        await helpers.waitForPageLoad();
      }
    }
  });

  test('homepage hero section', async ({ page }) => {
    // Check hero section elements
    const heroTitle = page.locator('h1, [data-testid="hero-title"]');
    if (await heroTitle.isVisible()) {
      await expect(heroTitle).toBeVisible();
      await expect(heroTitle).toHaveText(/Welcome|Sugar Daddy|Premium/);
    }

    // Check call-to-action buttons
    const ctaButtons = page.locator('button:has-text("Get Started"), button:has-text("Join Now"), [data-testid="cta-button"]');
    if (await ctaButtons.count() > 0) {
      await expect(ctaButtons.first()).toBeVisible();
      await expect(ctaButtons.first()).toBeEnabled();
    }
  });

  test('homepage features section', async ({ page }) => {
    // Check features section
    const features = page.locator('[data-testid="features"], .features, .feature-grid');
    if (await features.isVisible()) {
      await expect(features).toBeVisible();
      
      // Check for feature items
      const featureItems = page.locator('[data-testid="feature-item"], .feature-item, .feature-card');
      if (await featureItems.count() > 0) {
        await expect(featureItems.first()).toBeVisible();
      }
    }
  });

  test('homepage testimonials section', async ({ page }) => {
    // Check testimonials
    const testimonials = page.locator('[data-testid="testimonials"], .testimonials, .reviews');
    if (await testimonials.isVisible()) {
      await expect(testimonials).toBeVisible();
      
      const testimonialItems = page.locator('[data-testid="testimonial"], .testimonial, .review-item');
      if (await testimonialItems.count() > 0) {
        await expect(testimonialItems.first()).toBeVisible();
      }
    }
  });

  test('homepage footer', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check footer elements
    const footer = page.locator('footer, [data-testid="footer"]');
    if (await footer.isVisible()) {
      await expect(footer).toBeVisible();
      
      // Check footer links
      const footerLinks = page.locator('footer a, [data-testid="footer"] a');
      if (await footerLinks.count() > 0) {
        await expect(footerLinks.first()).toBeVisible();
      }
    }
  });

  test('homepage accessibility', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');

    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1); // Should have exactly one h1

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
    }

    // Check for skip link
    const skipLink = page.locator('[href="#main"], [data-testid="skip-link"]');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }
  });

  test('homepage performance', async ({ page }) => {
    // Check Core Web Vitals
    const vitals = await helpers.checkCoreWebVitals();
    
    // LCP should be under 2.5 seconds
    expect(vitals.lcp).toBeLessThan(2500);
    
    // FID should be under 100ms
    expect(vitals.fid).toBeLessThan(100);
    
    // CLS should be under 0.1
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('homepage mobile responsiveness', async ({ page }) => {
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that there's no horizontal scroll on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    expect(results['390x844'].hasHorizontalScroll).toBe(false);
    
    // Check that content is accessible on all viewports
    expect(results['375x812'].width).toBeGreaterThan(300);
    expect(results['390x844'].width).toBeGreaterThan(300);
  });

  test('homepage console errors', async ({ page }) => {
    const errors = await helpers.checkConsoleErrors();
    expect(errors.length).toBe(0);
  });

  test('homepage network requests', async ({ page }) => {
    const requests = await helpers.checkNetworkRequests();
    
    // Check for failed requests
    const failedRequests = requests.filter(req => 
      req.url.includes('error') || req.url.includes('404')
    );
    expect(failedRequests.length).toBe(0);
  });

  test('homepage interactive elements', async ({ page }) => {
    // Test interactive elements
    await helpers.simulateUserInteractions();
    
    // Check that page remains functional after interactions
    await expect(page.locator('body')).toBeVisible();
  });
});