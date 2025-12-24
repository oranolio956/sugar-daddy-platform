const { test, expect } = require('@playwright/test');

test.describe('Sugar Daddy Platform - Page Validation', () => {
  
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check page title
    await expect(page).toHaveTitle(/BrandyBabe/);
    
    // Check for key elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Take screenshot for visual validation
    await page.screenshot({ path: 'test-results/homepage.png' });
  });

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Check for login form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/login-page.png' });
  });

  test('Dashboard loads correctly', async ({ page }) => {
    // This would require authentication, so we'll just check the route exists
    await page.goto('http://localhost:3000/dashboard');
    
    // Check if page loads without errors
    await expect(page.locator('body')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/dashboard.png' });
  });

  test('Profile page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    
    // Check if page loads
    await expect(page.locator('body')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/profile.png' });
  });

  test('Discovery page loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/discovery');
    
    // Check if page loads
    await expect(page.locator('body')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/discovery.png' });
  });

  test('SEO validation - Meta tags', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check meta tags
    await expect(page.locator('meta[name="description"]')).toBeVisible();
    await expect(page.locator('meta[name="viewport"]')).toBeVisible();
    
    // Check Open Graph tags
    await expect(page.locator('meta[property="og:title"]')).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('nav')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('nav')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/mobile-responsive.png' });
  });

  test('Performance check', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    const loadTime = Date.now() - startTime;
    
    // Check if page loads within reasonable time (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Check for performance metrics
    const metrics = await page.evaluate(() => {
      return JSON.stringify(window.performance.timing);
    });
    
    console.log('Performance metrics:', metrics);
  });

});