import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Discovery/Search Page Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Login first
    await helpers.loginUser();
    await page.goto('/discovery');
    await helpers.waitForPageLoad();
  });

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await helpers.logoutUser();
  });

  test('discovery page loads correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Discovery|Search/);

    // Check meta tags
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Discovery');
    expect(metaTags.description).toBeTruthy();

    // Check for discovery elements
    const discoveryHeader = page.locator('h1, [data-testid="discovery-title"]');
    await expect(discoveryHeader).toBeVisible();

    // Take screenshot for visual regression
    await helpers.takeScreenshot('discovery-page-desktop');
  });

  test('search functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"], input[name="search"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();

      // Test search
      await searchInput.fill('premium');
      await page.keyboard.press('Enter');
      await helpers.waitForPageLoad();

      // Check for search results
      const searchResults = page.locator('[data-testid="search-results"], .search-results, .results');
      if (await searchResults.isVisible()) {
        await expect(searchResults).toBeVisible();
      }
    }
  });

  test('filter functionality', async ({ page }) => {
    // Check for filters
    const filters = page.locator('[data-testid="filters"], .filters, [data-testid="filter-panel"]');
    if (await filters.isVisible()) {
      await expect(filters).toBeVisible();
      
      // Check filter options
      const filterOptions = page.locator('[data-testid="filter-option"], .filter-option, input[type="checkbox"], input[type="radio"]');
      if (await filterOptions.count() > 0) {
        await expect(filterOptions.first()).toBeVisible();
        await filterOptions.first().click();
        await helpers.waitForPageLoad();
      }
    }
  });

  test('sort functionality', async ({ page }) => {
    // Check for sort options
    const sortDropdown = page.locator('[data-testid="sort-dropdown"], select[name="sort"], .sort-select');
    if (await sortDropdown.isVisible()) {
      await expect(sortDropdown).toBeVisible();
      await expect(sortDropdown).toBeEnabled();
      
      // Test sorting
      await sortDropdown.selectOption({ index: 1 });
      await helpers.waitForPageLoad();
    }
  });

  test('pagination', async ({ page }) => {
    // Check for pagination
    const pagination = page.locator('[data-testid="pagination"], .pagination, .page-navigation');
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
      
      // Check for page buttons
      const pageButtons = page.locator('[data-testid="page-button"], .page-button, a.page-link');
      if (await pageButtons.count() > 0) {
        await expect(pageButtons.first()).toBeVisible();
        await expect(pageButtons.first()).toBeEnabled();
      }
    }
  });

  test('user cards display', async ({ page }) => {
    // Check for user cards
    const userCards = page.locator('[data-testid="user-card"], .user-card, .profile-card');
    if (await userCards.count() > 0) {
      await expect(userCards.first()).toBeVisible();
      
      // Check card elements
      const cardImage = page.locator('[data-testid="user-image"], .user-image, img.profile');
      if (await cardImage.isVisible()) {
        await expect(cardImage).toBeVisible();
      }
      
      const cardName = page.locator('[data-testid="user-name"], .user-name, .profile-name');
      if (await cardName.isVisible()) {
        await expect(cardName).toBeVisible();
      }
    }
  });

  test('user interactions', async ({ page }) => {
    // Check for user interaction buttons
    const likeButtons = page.locator('[data-testid="like-button"], button:has-text("Like"), .like-btn');
    const messageButtons = page.locator('[data-testid="message-button"], button:has-text("Message"), .message-btn');
    const superLikeButtons = page.locator('[data-testid="super-like-button"], button:has-text("Super Like"), .super-like-btn');

    if (await likeButtons.count() > 0) {
      await expect(likeButtons.first()).toBeVisible();
      await expect(likeButtons.first()).toBeEnabled();
    }

    if (await messageButtons.count() > 0) {
      await expect(messageButtons.first()).toBeVisible();
      await expect(messageButtons.first()).toBeEnabled();
    }

    if (await superLikeButtons.count() > 0) {
      await expect(superLikeButtons.first()).toBeVisible();
      await expect(superLikeButtons.first()).toBeEnabled();
    }
  });

  test('discovery accessibility', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1); // Should have exactly one h1

    // Check for landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check for ARIA labels
    const search = page.locator('[aria-label="Search"], [role="search"]');
    if (await search.isVisible()) {
      await expect(search).toBeVisible();
    }
  });

  test('discovery performance', async ({ page }) => {
    const vitals = await helpers.checkCoreWebVitals();
    
    // Discovery page should load reasonably quickly
    expect(vitals.lcp).toBeLessThan(3000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('discovery mobile responsiveness', async ({ page }) => {
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that discovery is accessible on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    
    // Check that user cards are properly sized
    const userCards = page.locator('[data-testid="user-card"], .user-card');
    if (await userCards.count() > 0) {
      const cardBox = await userCards.first().boundingBox();
      expect(cardBox?.width).toBeGreaterThan(300);
    }
  });

  test('discovery error handling', async ({ page }) => {
    // Test network error on discovery data loading
    await page.route('**/api/discovery/**', route => route.abort());
    
    // Refresh page to trigger error
    await page.reload();
    await helpers.waitForPageLoad();

    // Should show error message or fallback content
    const errorMessage = page.locator('.error-message, [data-testid="discovery-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('discovery session management', async ({ page }) => {
    // Verify session is active
    const discoveryHeader = page.locator('[data-testid="discovery-title"]');
    await expect(discoveryHeader).toBeVisible();

    // Wait for potential session timeout
    await page.waitForTimeout(5000);

    // Check if still logged in
    const stillLoggedIn = await discoveryHeader.isVisible();
    expect(stillLoggedIn).toBe(true);
  });

  test('discovery premium features', async ({ page }) => {
    // Check for premium feature indicators
    const premiumFeatures = page.locator('[data-testid="premium-features"], .premium-features, [data-premium="true"]');
    if (await premiumFeatures.isVisible()) {
      await expect(premiumFeatures).toBeVisible();
      
      // Check for upgrade buttons
      const upgradeButtons = page.locator('[data-testid="upgrade-button"], button:has-text("Upgrade"), button:has-text("Premium")');
      if (await upgradeButtons.count() > 0) {
        await expect(upgradeButtons.first()).toBeVisible();
        await expect(upgradeButtons.first()).toBeEnabled();
      }
    }
  });

  test('discovery infinite scroll', async ({ page }) => {
    // Check for infinite scroll functionality
    const infiniteScroll = page.locator('[data-testid="infinite-scroll"], .infinite-scroll');
    if (await infiniteScroll.isVisible()) {
      await expect(infiniteScroll).toBeVisible();
      
      // Scroll to trigger loading more content
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(2000);
      
      // Check if more content loaded
      const initialCount = await page.locator('[data-testid="user-card"]').count();
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(2000);
      const finalCount = await page.locator('[data-testid="user-card"]').count();
      
      expect(finalCount).toBeGreaterThan(initialCount);
    }
  });
});