import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('User Flow Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('complete user registration flow', async ({ page }) => {
    // 1. Start at homepage
    await page.goto('/');
    await helpers.waitForPageLoad();

    // 2. Navigate to registration
    const registerLink = page.locator('[data-testid="register-link"], a[href="/register"], button:has-text("Register")');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await helpers.waitForPageLoad();
    } else {
      await page.goto('/register');
      await helpers.waitForPageLoad();
    }

    // 3. Fill registration form
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'flowtest@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' },
      { selector: '[name="confirmPassword"]', value: 'TestPassword123!' },
      { selector: '[name="username"]', value: 'flowtestuser' },
      { selector: '[name="firstName"]', value: 'Flow' },
      { selector: '[name="lastName"]', value: 'Test' }
    ]);

    // 4. Submit registration
    await helpers.submitForm();

    // 5. Check success and redirect to verification
    await helpers.checkSuccessMessage('Registration successful');
    await expect(page).toHaveURL(/.*\/verify-email/);

    // 6. Complete email verification (simulate)
    await page.goto('/verify-email?token=mock-token');
    await helpers.waitForPageLoad();

    // 7. Navigate to login
    const loginLink = page.locator('[data-testid="login-link"], a[href="/login"], button:has-text("Login")');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await helpers.waitForPageLoad();
    } else {
      await page.goto('/login');
      await helpers.waitForPageLoad();
    }

    // 8. Login with new credentials
    await helpers.fillForm([
      { selector: '[name="email"]', value: 'flowtest@example.com' },
      { selector: '[name="password"]', value: 'TestPassword123!' }
    ]);
    await helpers.submitForm();

    // 9. Verify successful login and redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await helpers.waitForPageLoad();

    // 10. Verify user is logged in
    const userProfile = page.locator('[data-testid="user-profile"], .user-profile');
    await expect(userProfile).toBeVisible();

    // Take screenshot of successful flow completion
    await helpers.takeScreenshot('user-flow-completion');
  });

  test('login and dashboard navigation flow', async ({ page }) => {
    // 1. Start at login page
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // 2. Login
    await helpers.loginUser();

    // 3. Verify dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    const dashboardTitle = page.locator('[data-testid="dashboard-title"], h1');
    await expect(dashboardTitle).toBeVisible();

    // 4. Navigate to profile
    const profileLink = page.locator('[data-testid="nav-profile"], a[href="/profile"]');
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await helpers.waitForPageLoad();
    }

    // 5. Verify profile page
    await expect(page).toHaveURL(/.*\/profile/);
    const profileTitle = page.locator('[data-testid="profile-title"], h1');
    await expect(profileTitle).toBeVisible();

    // 6. Navigate to discovery
    const discoveryLink = page.locator('[data-testid="nav-discovery"], a[href="/discovery"]');
    if (await discoveryLink.isVisible()) {
      await discoveryLink.click();
      await helpers.waitForPageLoad();
    }

    // 7. Verify discovery page
    await expect(page).toHaveURL(/.*\/discovery/);
    const discoveryTitle = page.locator('[data-testid="discovery-title"], h1');
    await expect(discoveryTitle).toBeVisible();

    // 8. Navigate to premium features
    const premiumLink = page.locator('[data-testid="nav-premium"], a[href*="premium"]');
    if (await premiumLink.isVisible()) {
      await premiumLink.click();
      await helpers.waitForPageLoad();
    }

    // 9. Verify premium page
    await expect(page).toHaveURL(/.*\/premium/);
    const premiumTitle = page.locator('[data-testid="premium-title"], h1');
    await expect(premiumTitle).toBeVisible();

    // 10. Logout
    await helpers.logoutUser();

    // 11. Verify logout
    await expect(page).toHaveURL(/.*\/(login|home)/);

    // Take screenshot of flow completion
    await helpers.takeScreenshot('navigation-flow-completion');
  });

  test('search and discovery flow', async ({ page }) => {
    // 1. Login first
    await helpers.loginUser();

    // 2. Go to discovery
    await page.goto('/discovery');
    await helpers.waitForPageLoad();

    // 3. Use search functionality
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('premium');
      await page.keyboard.press('Enter');
      await helpers.waitForPageLoad();
    }

    // 4. Apply filters
    const filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter"), .filter-toggle');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await helpers.waitForPageLoad();
    }

    // 5. Select filter options
    const filterOptions = page.locator('[data-testid="filter-option"], .filter-option input[type="checkbox"]');
    if (await filterOptions.count() > 0) {
      await filterOptions.first().click();
      await helpers.waitForPageLoad();
    }

    // 6. Sort results
    const sortDropdown = page.locator('[data-testid="sort-dropdown"], select[name="sort"]');
    if (await sortDropdown.isVisible()) {
      await sortDropdown.selectOption({ index: 1 });
      await helpers.waitForPageLoad();
    }

    // 7. Interact with user cards
    const userCards = page.locator('[data-testid="user-card"], .user-card');
    if (await userCards.count() > 0) {
      // Like a user
      const likeButton = page.locator('[data-testid="like-button"], button:has-text("Like")');
      if (await likeButton.count() > 0) {
        await likeButton.first().click();
        await helpers.waitForPageLoad();
      }

      // Message a user
      const messageButton = page.locator('[data-testid="message-button"], button:has-text("Message")');
      if (await messageButton.count() > 0) {
        await messageButton.first().click();
        await helpers.waitForPageLoad();
      }
    }

    // 8. Navigate to messages
    const messagesLink = page.locator('[data-testid="nav-messages"], a[href*="messages"]');
    if (await messagesLink.isVisible()) {
      await messagesLink.click();
      await helpers.waitForPageLoad();
    }

    // 9. Verify messages page
    await expect(page).toHaveURL(/.*\/messages/);
    const messagesTitle = page.locator('[data-testid="messages-title"], h1');
    await expect(messagesTitle).toBeVisible();

    // Take screenshot of search flow completion
    await helpers.takeScreenshot('search-flow-completion');
  });

  test('premium feature exploration flow', async ({ page }) => {
    // 1. Login first
    await helpers.loginUser();

    // 2. Go to premium features
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // 3. Explore premium features
    const premiumFeatures = page.locator('[data-testid="premium-feature"], .premium-feature');
    if (await premiumFeatures.count() > 0) {
      // Click on a premium feature
      await premiumFeatures.first().click();
      await helpers.waitForPageLoad();
    }

    // 4. View pricing plans
    const pricingPlans = page.locator('[data-testid="pricing-plan"], .pricing-plan');
    if (await pricingPlans.count() > 0) {
      await pricingPlans.first().click();
      await helpers.waitForPageLoad();
    }

    // 5. Attempt to upgrade (without actually paying)
    const upgradeButton = page.locator('[data-testid="upgrade-button"], button:has-text("Upgrade"), button:has-text("Subscribe")');
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();
      await helpers.waitForPageLoad();
    }

    // 6. Navigate to gift system
    await page.goto('/gifts');
    await helpers.waitForPageLoad();

    // 7. Explore gift options
    const giftOptions = page.locator('[data-testid="gift-option"], .gift-option');
    if (await giftOptions.count() > 0) {
      await giftOptions.first().click();
      await helpers.waitForPageLoad();
    }

    // 8. Navigate to customer support
    await page.goto('/support');
    await helpers.waitForPageLoad();

    // 9. Explore support options
    const supportOptions = page.locator('[data-testid="support-option"], .support-option');
    if (await supportOptions.count() > 0) {
      await supportOptions.first().click();
      await helpers.waitForPageLoad();
    }

    // Take screenshot of premium flow completion
    await helpers.takeScreenshot('premium-flow-completion');
  });

  test('error handling and edge cases flow', async ({ page }) => {
    // 1. Test 404 page
    await page.goto('/non-existent-page');
    await helpers.waitForPageLoad();
    
    const error404 = page.locator('[data-testid="404-error"], .error-404, h1:has-text("404")');
    if (await error404.isVisible()) {
      await expect(error404).toBeVisible();
    }

    // 2. Navigate back to homepage
    await page.goto('/');
    await helpers.waitForPageLoad();

    // 3. Test form validation errors
    await page.goto('/register');
    await helpers.waitForPageLoad();

    // Submit empty form
    await helpers.submitForm();
    await helpers.checkErrorMessage();

    // 4. Test network errors (simulate)
    await page.route('**/api/auth/**', route => route.abort());
    
    await page.goto('/login');
    await helpers.waitForPageLoad();

    await helpers.fillForm([
      { selector: '[name="email"]', value: 'test@example.com' },
      { selector: '[name="password"]', value: 'password123' }
    ]);
    await helpers.submitForm();

    // Should show network error
    const networkError = page.locator('.error-message:has-text("network"), .error-message:has-text("connection")');
    if (await networkError.isVisible()) {
      await expect(networkError).toBeVisible();
    }

    // 5. Test session timeout
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await helpers.waitForPageLoad();

    // Should redirect to login due to session timeout
    await expect(page).toHaveURL(/.*\/login/);

    // Take screenshot of error handling flow completion
    await helpers.takeScreenshot('error-handling-flow-completion');
  });

  test('mobile user flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // 1. Start at homepage
    await page.goto('/');
    await helpers.waitForPageLoad();

    // 2. Navigate to login
    const menuButton = page.locator('[data-testid="menu-button"], .menu-toggle, button[aria-label="Menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await helpers.waitForPageLoad();
    }

    const loginLink = page.locator('[data-testid="login-link"], a[href="/login"]');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await helpers.waitForPageLoad();
    }

    // 3. Login on mobile
    await helpers.loginUser();

    // 4. Navigate through mobile menu
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, [role="navigation"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await helpers.waitForPageLoad();
    }

    // 5. Test mobile-specific interactions
    const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"]');
    const touchTargetCount = await touchTargets.count();
    
    for (let i = 0; i < Math.min(touchTargetCount, 3); i++) {
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();
      
      // Check minimum touch target size (44x44px recommended)
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      
      await target.click({ timeout: 5000 });
      await page.waitForTimeout(500);
    }

    // Take screenshot of mobile flow completion
    await helpers.takeScreenshot('mobile-flow-completion');
  });
});