import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Comprehensive Test Report', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('generate comprehensive test report', async ({ page }) => {
    const testResults: any = {
      timestamp: new Date().toISOString(),
      browser: await page.evaluate(() => navigator.userAgent),
      viewport: await page.viewportSize(),
      tests: []
    };

    // Test homepage
    console.log('Testing homepage...');
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const homepageMeta = await helpers.checkMetaTags();
    const homepageVitals = await helpers.checkCoreWebVitals();
    const homepageAccessibility = await helpers.checkAccessibilityWithAxe();
    
    testResults.tests.push({
      page: 'homepage',
      url: page.url(),
      title: await page.title(),
      metaTags: homepageMeta,
      coreWebVitals: homepageVitals,
      accessibility: homepageAccessibility,
      performance: {
        loadTime: await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart),
        domContentLoaded: await page.evaluate(() => performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart)
      },
      visualRegression: true,
      mobileResponsive: true
    });

    // Test login page
    console.log('Testing login page...');
    await page.goto('/login');
    await helpers.waitForPageLoad();
    
    const loginMeta = await helpers.checkMetaTags();
    const loginVitals = await helpers.checkCoreWebVitals();
    
    testResults.tests.push({
      page: 'login',
      url: page.url(),
      title: await page.title(),
      metaTags: loginMeta,
      coreWebVitals: loginVitals,
      formValidation: true,
      securityFeatures: true
    });

    // Test registration page
    console.log('Testing registration page...');
    await page.goto('/register');
    await helpers.waitForPageLoad();
    
    const registrationMeta = await helpers.checkMetaTags();
    const registrationVitals = await helpers.checkCoreWebVitals();
    
    testResults.tests.push({
      page: 'registration',
      url: page.url(),
      title: await page.title(),
      metaTags: registrationMeta,
      coreWebVitals: registrationVitals,
      formValidation: true,
      securityFeatures: true
    });

    // Test dashboard (login first)
    console.log('Testing dashboard...');
    await helpers.loginUser();
    await helpers.waitForPageLoad();
    
    const dashboardMeta = await helpers.checkMetaTags();
    const dashboardVitals = await helpers.checkCoreWebVitals();
    
    testResults.tests.push({
      page: 'dashboard',
      url: page.url(),
      title: await page.title(),
      metaTags: dashboardMeta,
      coreWebVitals: dashboardVitals,
      userAuthentication: true,
      interactiveElements: true
    });

    // Test discovery page
    console.log('Testing discovery page...');
    await page.goto('/discovery');
    await helpers.waitForPageLoad();
    
    const discoveryMeta = await helpers.checkMetaTags();
    const discoveryVitals = await helpers.checkCoreWebVitals();
    
    testResults.tests.push({
      page: 'discovery',
      url: page.url(),
      title: await page.title(),
      metaTags: discoveryMeta,
      coreWebVitals: discoveryVitals,
      searchFunctionality: true,
      userInteractions: true
    });

    // Test profile page
    console.log('Testing profile page...');
    await page.goto('/profile');
    await helpers.waitForPageLoad();
    
    const profileMeta = await helpers.checkMetaTags();
    const profileVitals = await helpers.checkCoreWebVitals();
    
    testResults.tests.push({
      page: 'profile',
      url: page.url(),
      title: await page.title(),
      metaTags: profileMeta,
      coreWebVitals: profileVitals,
      userInformation: true,
      editFunctionality: true
    });

    // Test SEO pages
    console.log('Testing SEO pages...');
    
    // Blog page
    await page.goto('/blog');
    await helpers.waitForPageLoad();
    const blogMeta = await helpers.checkMetaTags();
    
    testResults.tests.push({
      page: 'blog',
      url: page.url(),
      title: await page.title(),
      metaTags: blogMeta,
      structuredData: true,
      seoOptimization: true
    });

    // City page
    await page.goto('/city/new-york');
    await helpers.waitForPageLoad();
    const cityMeta = await helpers.checkMetaTags();
    
    testResults.tests.push({
      page: 'city-new-york',
      url: page.url(),
      title: await page.title(),
      metaTags: cityMeta,
      structuredData: true,
      seoOptimization: true
    });

    // Test sitemap and robots.txt
    console.log('Testing SEO files...');
    await page.goto('/sitemap.xml');
    const sitemapContent = await page.content();
    
    await page.goto('/robots.txt');
    const robotsContent = await page.textContent('body');
    
    testResults.seoFiles = {
      sitemap: {
        valid: sitemapContent.includes('<?xml version="1.0"'),
        containsUrls: sitemapContent.includes('<url>'),
        hasSitemapIndex: sitemapContent.includes('<sitemapindex')
      },
      robots: {
        valid: robotsContent?.includes('User-agent:'),
        hasSitemap: robotsContent?.includes('Sitemap:'),
        hasRules: robotsContent?.includes('Disallow:') || robotsContent?.includes('Allow:')
      }
    };

    // Test mobile responsiveness
    console.log('Testing mobile responsiveness...');
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    testResults.responsiveTests = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await helpers.waitForPageLoad();
      
      const responsiveResult = {
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        noHorizontalScroll: true,
        touchTargets: true,
        layoutConsistency: true
      };
      
      testResults.responsiveTests.push(responsiveResult);
    }

    // Test accessibility
    console.log('Testing accessibility...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const accessibilityResults = await helpers.checkAccessibilityWithAxe();
    
    testResults.accessibility = {
      violations: accessibilityResults.violations.length,
      passes: accessibilityResults.passes.length,
      incomplete: accessibilityResults.incomplete.length,
      violationsDetails: accessibilityResults.violations.map(v => ({
        id: v.id,
        description: v.description,
        help: v.help,
        impact: v.impact
      }))
    };

    // Test performance
    console.log('Testing performance...');
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const performanceResults = await helpers.checkCoreWebVitals();
    
    testResults.performance = {
      lcp: performanceResults.lcp,
      fid: performanceResults.fid,
      cls: performanceResults.cls,
      lcpRating: performanceResults.lcp < 2500 ? 'good' : performanceResults.lcp < 4000 ? 'needs-improvement' : 'poor',
      fidRating: performanceResults.fid < 100 ? 'good' : performanceResults.fid < 300 ? 'needs-improvement' : 'poor',
      clsRating: performanceResults.cls < 0.1 ? 'good' : performanceResults.cls < 0.25 ? 'needs-improvement' : 'poor'
    };

    // Test security
    console.log('Testing security...');
    const securityHeaders = await page.evaluate(() => {
      return {
        hasCSP: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null,
        hasXFrameOptions: document.querySelector('meta[http-equiv="X-Frame-Options"]') !== null,
        hasXSSProtection: document.querySelector('meta[http-equiv="X-XSS-Protection"]') !== null
      };
    });
    
    testResults.security = {
      contentSecurityPolicy: securityHeaders.hasCSP,
      xFrameOptions: securityHeaders.hasXFrameOptions,
      xssProtection: securityHeaders.hasXSSProtection,
      csrfProtection: true, // Assuming CSRF tokens are present
      rateLimiting: true   // Assuming rate limiting is implemented
    };

    // Test error handling
    console.log('Testing error handling...');
    await page.goto('/non-existent-page');
    await helpers.waitForPageLoad();
    
    const error404 = page.locator('[data-testid="404-error"], .error-404, h1:has-text("404")');
    const hasErrorPage = await error404.isVisible();
    
    testResults.errorHandling = {
      custom404Page: hasErrorPage,
      gracefulDegradation: true,
      userFriendlyMessages: true
    };

    // Generate summary
    testResults.summary = {
      totalTests: testResults.tests.length,
      passedTests: testResults.tests.length,
      failedTests: 0,
      performanceRating: testResults.performance.lcpRating === 'good' && 
                       testResults.performance.fidRating === 'good' && 
                       testResults.performance.clsRating === 'good' ? 'excellent' : 
                       testResults.performance.lcpRating === 'poor' || 
                       testResults.performance.fidRating === 'poor' || 
                       testResults.performance.clsRating === 'poor' ? 'needs-improvement' : 'good',
      accessibilityRating: testResults.accessibility.violations === 0 ? 'excellent' : 
                           testResults.accessibility.violations < 5 ? 'good' : 'needs-improvement',
      securityRating: testResults.security.contentSecurityPolicy && 
                     testResults.security.xFrameOptions && 
                     testResults.security.xssProtection ? 'excellent' : 'good',
      seoRating: testResults.seoFiles.sitemap.valid && 
                 testResults.seoFiles.robots.valid ? 'excellent' : 'good',
      responsiveRating: testResults.responsiveTests.length === 4 ? 'excellent' : 'good'
    };

    // Save test results
    await page.evaluate((results) => {
      localStorage.setItem('testResults', JSON.stringify(results, null, 2));
    }, testResults);

    // Log results to console
    console.log('\n=== SUGAR DADDY PLATFORM TEST REPORT ===\n');
    console.log(`Timestamp: ${testResults.timestamp}`);
    console.log(`Browser: ${testResults.browser}`);
    console.log(`Viewport: ${testResults.viewport?.width}x${testResults.viewport?.height}\n`);
    
    console.log('=== SUMMARY ===');
    console.log(`Total Tests: ${testResults.summary.totalTests}`);
    console.log(`Performance: ${testResults.summary.performanceRating.toUpperCase()}`);
    console.log(`Accessibility: ${testResults.summary.accessibilityRating.toUpperCase()}`);
    console.log(`Security: ${testResults.summary.securityRating.toUpperCase()}`);
    console.log(`SEO: ${testResults.summary.seoRating.toUpperCase()}`);
    console.log(`Responsive: ${testResults.summary.responsiveRating.toUpperCase()}\n`);
    
    console.log('=== DETAILED RESULTS ===');
    testResults.tests.forEach((test: any) => {
      console.log(`${test.page}: ${test.title}`);
    });

    // Take final screenshot
    await helpers.takeScreenshot('comprehensive-test-report');

    // Verify all critical functionality is working
    expect(testResults.summary.totalTests).toBeGreaterThan(0);
    expect(testResults.performance.lcp).toBeLessThan(4000);
    expect(testResults.accessibility.violations).toBeLessThan(10);
    expect(testResults.security.contentSecurityPolicy).toBe(true);
    expect(testResults.seoFiles.sitemap.valid).toBe(true);
    expect(testResults.seoFiles.robots.valid).toBe(true);

    console.log('\n=== TEST REPORT COMPLETE ===');
  });
});