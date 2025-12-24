import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Performance Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('homepage performance', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check Core Web Vitals
    const vitals = await helpers.checkCoreWebVitals();
    
    // LCP should be under 2.5 seconds
    expect(vitals.lcp).toBeLessThan(2500);
    
    // FID should be under 100ms
    expect(vitals.fid).toBeLessThan(100);
    
    // CLS should be under 0.1
    expect(vitals.cls).toBeLessThan(0.1);

    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };
    });

    expect(performanceMetrics.loadTime).toBeLessThan(3000);
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
    expect(performanceMetrics.firstPaint).toBeLessThan(1500);
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1800);
  });

  test('login page performance', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    const vitals = await helpers.checkCoreWebVitals();
    
    // Login page should load quickly
    expect(vitals.lcp).toBeLessThan(2000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('dashboard performance', async ({ page }) => {
    // Login first
    await helpers.loginUser();
    await helpers.waitForPageLoad();

    const vitals = await helpers.checkCoreWebVitals();
    
    // Dashboard should load reasonably quickly
    expect(vitals.lcp).toBeLessThan(3000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('discovery page performance', async ({ page }) => {
    // Login first
    await helpers.loginUser();
    await page.goto('/discovery');
    await helpers.waitForPageLoad();

    const vitals = await helpers.checkCoreWebVitals();
    
    // Discovery page should load reasonably quickly
    expect(vitals.lcp).toBeLessThan(3000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('mobile performance', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    const vitals = await helpers.checkCoreWebVitals();
    
    // Mobile performance should be good
    expect(vitals.lcp).toBeLessThan(3000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('image loading performance', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for lazy loading
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const loading = await image.getAttribute('loading');
      
      // Images should have lazy loading or be optimized
      expect(loading).toMatch(/lazy|eager|auto/);
    }

    // Check for optimized images
    const optimizedImages = page.locator('img[srcset], img[sizes]');
    const optimizedCount = await optimizedImages.count();
    
    expect(optimizedCount).toBeGreaterThan(0);
  });

  test('resource loading performance', async ({ page }) => {
    const requests: any[] = [];
    
    page.on('response', response => {
      if (response.status() === 200) {
        requests.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length']
        });
      }
    });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for large resources
    const largeResources = requests.filter(req => 
      req.size && parseInt(req.size) > 1024 * 1024 // > 1MB
    );

    // Should not have too many large resources
    expect(largeResources.length).toBeLessThan(5);
  });

  test('JavaScript execution performance', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);
    
    // Should not have JavaScript errors
    expect(errors.length).toBe(0);

    // Check for performance bottlenecks
    const jsPerformance = await page.evaluate(() => {
      const startTime = performance.now();
      
      // Simulate some JavaScript execution
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      
      const endTime = performance.now();
      return endTime - startTime;
    });

    // JavaScript execution should be fast
    expect(jsPerformance).toBeLessThan(10);
  });

  test('CSS performance', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for critical CSS
    const criticalCSS = await page.evaluate(() => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      const criticalLinks = Array.from(stylesheets).filter(link => 
        link.getAttribute('media') === 'print' || 
        link.getAttribute('media') === 'all'
      );
      return criticalLinks.length;
    });

    // Should have optimized CSS loading
    expect(criticalCSS).toBeGreaterThan(0);
  });

  test('network performance', async ({ page }) => {
    const networkRequests: any[] = [];
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        type: request.resourceType()
      });
    });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for too many requests
    const totalRequests = networkRequests.length;
    expect(totalRequests).toBeLessThan(50);

    // Check for blocking requests
    const blockingRequests = networkRequests.filter(req => 
      req.type === 'script' || req.type === 'stylesheet'
    );
    
    expect(blockingRequests.length).toBeLessThan(20);
  });

  test('memory usage', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for memory leaks (basic check)
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    // Perform some interactions
    await helpers.simulateUserInteractions();

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    // Memory should not grow excessively
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    }
  });

  test('cache performance', async ({ page }) => {
    // First visit
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Second visit (should use cache)
    const startTime = Date.now();
    await page.goto('/');
    await helpers.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    // Should load faster on second visit
    expect(loadTime).toBeLessThan(2000);
  });

  test('third-party script performance', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for third-party scripts
    const thirdPartyScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      const thirdParty = Array.from(scripts).filter(script => {
        const src = script.src;
        return src && !src.includes(window.location.hostname);
      });
      return thirdParty.length;
    });

    // Should not have too many third-party scripts
    expect(thirdPartyScripts).toBeLessThan(10);
  });
});