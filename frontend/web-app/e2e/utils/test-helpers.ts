import { Page, Locator, expect } from '@playwright/test';

export class TestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for page to be fully loaded with all resources
   */
  async waitForPageLoad(timeout: number = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Check if element is visible and accessible
   */
  async checkAccessibility(element: Locator) {
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
  }

  /**
   * Fill form fields with validation
   */
  async fillForm(fields: { selector: string; value: string }[]) {
    for (const field of fields) {
      const element = this.page.locator(field.selector);
      await this.checkAccessibility(element);
      await element.fill(field.value);
      await this.page.waitForTimeout(100); // Small delay for validation
    }
  }

  /**
   * Submit form and wait for response
   */
  async submitForm(submitSelector: string = 'button[type="submit"]') {
    const submitButton = this.page.locator(submitSelector);
    await this.checkAccessibility(submitButton);
    await submitButton.click();
    await this.page.waitForTimeout(1000); // Wait for form submission
  }

  /**
   * Check for success message
   */
  async checkSuccessMessage(message?: string) {
    const successLocator = this.page.locator('.success-message, [data-testid="success-message"]');
    await expect(successLocator).toBeVisible();
    if (message) {
      await expect(successLocator).toContainText(message);
    }
  }

  /**
   * Check for error message
   */
  async checkErrorMessage(message?: string) {
    const errorLocator = this.page.locator('.error-message, [data-testid="error-message"]');
    await expect(errorLocator).toBeVisible();
    if (message) {
      await expect(errorLocator).toContainText(message);
    }
  }

  /**
   * Take a screenshot with consistent naming
   */
  async takeScreenshot(name: string, fullPage: boolean = true) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage 
    });
  }

  /**
   * Check Core Web Vitals
   */
  async checkCoreWebVitals() {
    const vitals = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Check LCP
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.lcp = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Check FID
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          vitals.fid = entries[0].processingStart - entries[0].startTime;
        }).observe({ entryTypes: ['first-input'] });

        // Check CLS
        new PerformanceObserver((entryList) => {
          let clsValue = 0;
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Resolve after a short delay to collect metrics
        setTimeout(() => resolve(vitals), 2000);
      });
    });

    return vitals;
  }

  /**
   * Check accessibility with axe-core
   */
  async checkAccessibilityWithAxe() {
    // Inject axe-core
    await this.page.addScriptTag({ path: './node_modules/axe-core/axe.min.js' });
    
    const results = await this.page.evaluate(() => {
      return (window as any).axe.run(document, {
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'aria-labels': { enabled: true },
          'alt-text': { enabled: true },
          'landmark-one-main': { enabled: true },
          'skip-link': { enabled: true }
        }
      });
    });

    return results;
  }

  /**
   * Check SEO meta tags
   */
  async checkMetaTags() {
    const metaTags = await this.page.evaluate(() => {
      const tags: any = {};
      
      // Basic meta tags
      tags.title = document.title;
      tags.description = document.querySelector('meta[name="description"]')?.getAttribute('content');
      tags.viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
      tags.charset = document.querySelector('meta[charset]')?.getAttribute('charset');
      
      // Open Graph tags
      tags.ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      tags.ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
      tags.ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      tags.ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
      
      // Twitter cards
      tags.twitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
      tags.twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      tags.twitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
      tags.twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
      
      // Structured data
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      tags.structuredData = Array.from(scripts).map(script => JSON.parse(script.textContent || '{}'));
      
      return tags;
    });

    return metaTags;
  }

  /**
   * Check mobile responsiveness
   */
  async checkMobileResponsiveness() {
    const viewports = [
      { width: 375, height: 812 }, // iPhone SE
      { width: 390, height: 844 }, // iPhone 12
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ];

    const results: any = {};

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Allow for responsive changes
      
      const layout = await this.page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        return {
          width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
          height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
          hasHorizontalScroll: document.body.scrollWidth > document.body.clientWidth,
          hasVerticalScroll: document.body.scrollHeight > document.body.clientHeight
        };
      });

      results[`${viewport.width}x${viewport.height}`] = layout;
    }

    return results;
  }

  /**
   * Simulate user interactions
   */
  async simulateUserInteractions() {
    // Scroll down the page
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await this.page.waitForTimeout(1000);

    // Scroll to bottom
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await this.page.waitForTimeout(1000);

    // Scroll back to top
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await this.page.waitForTimeout(1000);

    // Click on interactive elements
    const buttons = this.page.locator('button:not([disabled]), a[href], input[type="submit"]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        await buttons.nth(i).click({ timeout: 5000 });
        await this.page.waitForTimeout(500);
      } catch (e) {
        // Element might not be clickable or visible
        continue;
      }
    }
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await this.page.waitForTimeout(2000);
    
    return errors;
  }

  /**
   * Check network requests
   */
  async checkNetworkRequests() {
    const requests: any[] = [];
    
    this.page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    await this.page.waitForTimeout(3000);
    
    return requests;
  }

  /**
   * Login helper method
   */
  async loginUser(email: string = 'test@example.com', password: string = 'TestPassword123!') {
    await this.page.goto('/login');
    await this.fillForm([
      { selector: '[name="email"]', value: email },
      { selector: '[name="password"]', value: password }
    ]);
    await this.submitForm();
    
    // Wait for redirect to dashboard
    await this.page.waitForURL(/.*\/dashboard/);
    await this.waitForPageLoad();
  }

  /**
   * Logout helper method
   */
  async logoutUser() {
    const logoutButton = this.page.locator('[data-testid="logout-button"], button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.page.waitForURL(/.*\/(login|home)/);
    }
  }
}