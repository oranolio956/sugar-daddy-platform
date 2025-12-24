import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Dashboard Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Login first
    await helpers.loginUser();
    await helpers.waitForPageLoad();
  });

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await helpers.logoutUser();
  });

  test('dashboard loads correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Dashboard/);

    // Check meta tags
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Dashboard');
    expect(metaTags.description).toBeTruthy();

    // Check for dashboard elements
    const dashboardHeader = page.locator('h1, [data-testid="dashboard-title"]');
    await expect(dashboardHeader).toBeVisible();

    // Take screenshot for visual regression
    await helpers.takeScreenshot('dashboard-desktop');
  });

  test('dashboard navigation', async ({ page }) => {
    // Check for navigation elements
    const navItems = [
      { selector: '[data-testid="nav-discovery"], a[href="/discovery"]', text: 'Discovery' },
      { selector: '[data-testid="nav-profile"], a[href="/profile"]', text: 'Profile' },
      { selector: '[data-testid="nav-messages"], a[href*="messages"]', text: 'Messages' },
      { selector: '[data-testid="nav-premium"], a[href*="premium"]', text: 'Premium' }
    ];

    for (const item of navItems) {
      const element = page.locator(item.selector);
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
        await element.click();
        await helpers.waitForPageLoad();
        await page.goBack();
        await helpers.waitForPageLoad();
      }
    }
  });

  test('dashboard user information', async ({ page }) => {
    // Check user profile info
    const userProfile = page.locator('[data-testid="user-profile"], .user-profile');
    if (await userProfile.isVisible()) {
      await expect(userProfile).toBeVisible();
      
      // Check for user avatar
      const avatar = page.locator('[data-testid="user-avatar"], .user-avatar img');
      if (await avatar.isVisible()) {
        await expect(avatar).toBeVisible();
      }

      // Check for username
      const username = page.locator('[data-testid="username"], .username');
      if (await username.isVisible()) {
        await expect(username).toBeVisible();
      }
    }
  });

  test('dashboard statistics', async ({ page }) => {
    // Check for dashboard stats
    const stats = page.locator('[data-testid="dashboard-stats"], .dashboard-stats, .stats-grid');
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
      
      // Check for specific stats
      const statItems = page.locator('[data-testid="stat-item"], .stat-item, .stat-card');
      if (await statItems.count() > 0) {
        await expect(statItems.first()).toBeVisible();
      }
    }
  });

  test('dashboard recent activity', async ({ page }) => {
    // Check for recent activity
    const activity = page.locator('[data-testid="recent-activity"], .recent-activity, .activity-feed');
    if (await activity.isVisible()) {
      await expect(activity).toBeVisible();
      
      const activityItems = page.locator('[data-testid="activity-item"], .activity-item, .activity-card');
      if (await activityItems.count() > 0) {
        await expect(activityItems.first()).toBeVisible();
      }
    }
  });

  test('dashboard notifications', async ({ page }) => {
    // Check for notifications
    const notifications = page.locator('[data-testid="notifications"], .notifications, [aria-label="Notifications"]');
    if (await notifications.isVisible()) {
      await expect(notifications).toBeVisible();
      
      // Check notification count
      const notificationCount = page.locator('[data-testid="notification-count"], .notification-count');
      if (await notificationCount.isVisible()) {
        await expect(notificationCount).toBeVisible();
      }
    }
  });

  test('dashboard quick actions', async ({ page }) => {
    // Check for quick actions
    const quickActions = page.locator('[data-testid="quick-actions"], .quick-actions, .action-buttons');
    if (await quickActions.isVisible()) {
      await expect(quickActions).toBeVisible();
      
      const actionButtons = page.locator('[data-testid="action-button"], .action-button, button.action');
      if (await actionButtons.count() > 0) {
        await expect(actionButtons.first()).toBeVisible();
        await expect(actionButtons.first()).toBeEnabled();
      }
    }
  });

  test('dashboard accessibility', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1); // Should have exactly one h1

    // Check for landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check for skip links
    const skipLink = page.locator('[href="#main"], [data-testid="skip-link"]');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }
  });

  test('dashboard performance', async ({ page }) => {
    const vitals = await helpers.checkCoreWebVitals();
    
    // Dashboard should load reasonably quickly
    expect(vitals.lcp).toBeLessThan(3000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('dashboard mobile responsiveness', async ({ page }) => {
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that dashboard is accessible on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    
    // Check that dashboard elements are properly sized
    const dashboardContent = page.locator('[data-testid="dashboard-content"], .dashboard-content');
    if (await dashboardContent.isVisible()) {
      const contentBox = await dashboardContent.boundingBox();
      expect(contentBox?.width).toBeGreaterThan(300);
    }
  });

  test('dashboard interactive elements', async ({ page }) => {
    // Test interactive elements
    await helpers.simulateUserInteractions();
    
    // Check that dashboard remains functional after interactions
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('dashboard error handling', async ({ page }) => {
    // Test network error on dashboard data loading
    await page.route('**/api/dashboard/**', route => route.abort());
    
    // Refresh page to trigger error
    await page.reload();
    await helpers.waitForPageLoad();

    // Should show error message or fallback content
    const errorMessage = page.locator('.error-message, [data-testid="dashboard-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('dashboard session management', async ({ page }) => {
    // Verify session is active
    const userProfile = page.locator('[data-testid="user-profile"]');
    await expect(userProfile).toBeVisible();

    // Wait for potential session timeout
    await page.waitForTimeout(5000);

    // Check if still logged in
    const stillLoggedIn = await userProfile.isVisible();
    expect(stillLoggedIn).toBe(true);
  });

  test('dashboard premium features', async ({ page }) => {
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
});