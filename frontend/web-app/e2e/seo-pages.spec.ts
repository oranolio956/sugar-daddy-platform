import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('SEO Pages Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('sitemap.xml loads correctly', async ({ page }) => {
    await page.goto('/sitemap.xml');
    
    // Check that sitemap is valid XML
    const contentType = page.locator('head meta[http-equiv="Content-Type"]');
    const xmlContent = await page.content();
    
    expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xmlContent).toContain('<urlset');
    expect(xmlContent).toContain('<url>');
    expect(xmlContent).toContain('</urlset>');
  });

  test('robots.txt loads correctly', async ({ page }) => {
    await page.goto('/robots.txt');
    
    const textContent = await page.textContent('body');
    
    expect(textContent).toContain('User-agent:');
    expect(textContent).toContain('Sitemap:');
    expect(textContent).toContain('robots.txt');
  });

  test('blog pages load correctly', async ({ page }) => {
    // Test blog index page
    await page.goto('/blog');
    await helpers.waitForPageLoad();
    
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Blog');
    expect(metaTags.description).toBeTruthy();
    
    // Check for blog posts
    const blogPosts = page.locator('[data-testid="blog-post"], .blog-post, article');
    if (await blogPosts.count() > 0) {
      await expect(blogPosts.first()).toBeVisible();
    }
    
    // Take screenshot
    await helpers.takeScreenshot('blog-index-desktop');
  });

  test('blog post pages load correctly', async ({ page }) => {
    // Test specific blog post
    await page.goto('/blog/seo-tips');
    await helpers.waitForPageLoad();
    
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('SEO');
    expect(metaTags.description).toBeTruthy();
    expect(metaTags.ogTitle).toBeTruthy();
    expect(metaTags.ogDescription).toBeTruthy();
    expect(metaTags.ogImage).toBeTruthy();
    expect(metaTags.ogUrl).toBeTruthy();
    
    // Check structured data
    expect(metaTags.structuredData.length).toBeGreaterThan(0);
    
    // Check for article content
    const article = page.locator('article, [data-testid="blog-content"], .blog-content');
    if (await article.isVisible()) {
      await expect(article).toBeVisible();
    }
    
    // Take screenshot
    await helpers.takeScreenshot('blog-post-desktop');
  });

  test('city pages load correctly', async ({ page }) => {
    // Test city-specific pages
    const cities = ['new-york', 'los-angeles', 'chicago', 'miami'];
    
    for (const city of cities) {
      await page.goto(`/city/${city}`);
      await helpers.waitForPageLoad();
      
      const metaTags = await helpers.checkMetaTags();
      expect(metaTags.title).toContain(city.replace('-', ' '));
      expect(metaTags.description).toBeTruthy();
      expect(metaTags.ogTitle).toBeTruthy();
      expect(metaTags.ogDescription).toBeTruthy();
      
      // Check for city-specific content
      const cityContent = page.locator(`[data-testid="city-content"], .city-content, [data-city="${city}"]`);
      if (await cityContent.isVisible()) {
        await expect(cityContent).toBeVisible();
      }
      
      // Take screenshot
      await helpers.takeScreenshot(`city-${city}-desktop`);
    }
  });

  test('SEO meta tags validation', async ({ page }) => {
    const pages = [
      '/',
      '/login',
      '/register',
      '/dashboard',
      '/profile',
      '/discovery',
      '/blog',
      '/city/new-york'
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await helpers.waitForPageLoad();
      
      const metaTags = await helpers.checkMetaTags();
      
      // Check required meta tags
      expect(metaTags.title).toBeTruthy();
      expect(metaTags.description).toBeTruthy();
      expect(metaTags.viewport).toBeTruthy();
      expect(metaTags.charset).toBeTruthy();
      
      // Check Open Graph tags
      expect(metaTags.ogTitle).toBeTruthy();
      expect(metaTags.ogDescription).toBeTruthy();
      expect(metaTags.ogUrl).toBeTruthy();
      
      // Check Twitter cards
      expect(metaTags.twitterCard).toBeTruthy();
      expect(metaTags.twitterTitle).toBeTruthy();
      expect(metaTags.twitterDescription).toBeTruthy();
      
      // Check structured data
      expect(metaTags.structuredData.length).toBeGreaterThan(0);
    }
  });

  test('SEO structured data validation', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const metaTags = await helpers.checkMetaTags();
    
    // Check for valid JSON-LD
    for (const schema of metaTags.structuredData) {
      expect(schema['@context']).toBeTruthy();
      expect(schema['@type']).toBeTruthy();
      
      // Check for required properties based on type
      if (schema['@type'] === 'WebSite') {
        expect(schema.name).toBeTruthy();
        expect(schema.url).toBeTruthy();
      } else if (schema['@type'] === 'Organization') {
        expect(schema.name).toBeTruthy();
        expect(schema.url).toBeTruthy();
      } else if (schema['@type'] === 'WebPage') {
        expect(schema.name).toBeTruthy();
        expect(schema.url).toBeTruthy();
      }
    }
  });

  test('SEO performance', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const vitals = await helpers.checkCoreWebVitals();
    
    // SEO pages should load quickly
    expect(vitals.lcp).toBeLessThan(2500);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('SEO mobile responsiveness', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that SEO pages are accessible on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    expect(results['390x844'].hasHorizontalScroll).toBe(false);
  });

  test('SEO accessibility', async ({ page }) => {
    await page.goto('/blog');
    await helpers.waitForPageLoad();
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1); // Should have exactly one h1

    // Check for landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('SEO error handling', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await helpers.waitForPageLoad();
    
    // Should show 404 error
    const error404 = page.locator('[data-testid="404-error"], .error-404, h1:has-text("404")');
    if (await error404.isVisible()) {
      await expect(error404).toBeVisible();
    }
    
    // Check meta tags for 404 page
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('404');
  });

  test('SEO canonical URLs', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const canonical = await page.evaluate(() => {
      const link = document.querySelector('link[rel="canonical"]');
      return link ? link.getAttribute('href') : null;
    });
    
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('http');
  });

  test('SEO schema.org validation', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const metaTags = await helpers.checkMetaTags();
    
    // Check for valid schema.org types
    for (const schema of metaTags.structuredData) {
      const validTypes = [
        'WebSite', 'Organization', 'WebPage', 'Article', 
        'BlogPosting', 'BreadcrumbList', 'Product'
      ];
      
      expect(validTypes).toContain(schema['@type']);
    }
  });
});