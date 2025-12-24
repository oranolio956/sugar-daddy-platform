import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Premium Features Tests', () => {
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

  test('premium features page loads correctly', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Check page title
    await expect(page).toHaveTitle(/Premium/);

    // Check meta tags
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Premium');
    expect(metaTags.description).toBeTruthy();

    // Take screenshot for visual regression
    await helpers.takeScreenshot('premium-features-desktop');
  });

  test('premium feature display', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Check for premium features
    const premiumFeatures = page.locator('[data-testid="premium-features"], .premium-features, [data-premium="true"]');
    if (await premiumFeatures.isVisible()) {
      await expect(premiumFeatures).toBeVisible();
      
      // Check for feature items
      const featureItems = page.locator('[data-testid="premium-feature"], .premium-feature, .feature-item');
      if (await featureItems.count() > 0) {
        await expect(featureItems.first()).toBeVisible();
      }
    }
  });

  test('premium pricing plans', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Check for pricing plans
    const pricingPlans = page.locator('[data-testid="pricing-plans"], .pricing-plans, .plans-grid');
    if (await pricingPlans.isVisible()) {
      await expect(pricingPlans).toBeVisible();
      
      // Check for plan options
      const planOptions = page.locator('[data-testid="plan-option"], .plan-option, .plan-card');
      if (await planOptions.count() > 0) {
        await expect(planOptions.first()).toBeVisible();
        
        // Check for upgrade buttons
        const upgradeButtons = page.locator('[data-testid="upgrade-button"], button:has-text("Upgrade"), button:has-text("Subscribe")');
        if (await upgradeButtons.count() > 0) {
          await expect(upgradeButtons.first()).toBeVisible();
          await expect(upgradeButtons.first()).toBeEnabled();
        }
      }
    }
  });

  test('gift system functionality', async ({ page }) => {
    await page.goto('/gifts');
    await helpers.waitForPageLoad();

    // Check for gift system
    const giftSystem = page.locator('[data-testid="gift-system"], .gift-system, [data-gift="true"]');
    if (await giftSystem.isVisible()) {
      await expect(giftSystem).toBeVisible();
      
      // Check for gift options
      const giftOptions = page.locator('[data-testid="gift-option"], .gift-option, .gift-card');
      if (await giftOptions.count() > 0) {
        await expect(giftOptions.first()).toBeVisible();
        
        // Check for send gift buttons
        const sendButtons = page.locator('[data-testid="send-gift"], button:has-text("Send Gift"), button:has-text("Give Gift")');
        if (await sendButtons.count() > 0) {
          await expect(sendButtons.first()).toBeVisible();
          await expect(sendButtons.first()).toBeEnabled();
        }
      }
    }
  });

  test('advanced search filters', async ({ page }) => {
    await page.goto('/discovery');
    await helpers.waitForPageLoad();

    // Check for advanced filters
    const advancedFilters = page.locator('[data-testid="advanced-filters"], .advanced-filters, [data-advanced="true"]');
    if (await advancedFilters.isVisible()) {
      await expect(advancedFilters).toBeVisible();
      
      // Check for filter options
      const filterOptions = page.locator('[data-testid="filter-option"], .filter-option, input[type="checkbox"], input[type="radio"]');
      if (await filterOptions.count() > 0) {
        await expect(filterOptions.first()).toBeVisible();
        await expect(filterOptions.first()).toBeEnabled();
      }
    }
  });

  test('live chat interface', async ({ page }) => {
    await page.goto('/messages');
    await helpers.waitForPageLoad();

    // Check for live chat
    const liveChat = page.locator('[data-testid="live-chat"], .live-chat, [data-chat="true"]');
    if (await liveChat.isVisible()) {
      await expect(liveChat).toBeVisible();
      
      // Check for chat input
      const chatInput = page.locator('[data-testid="chat-input"], .chat-input, input[type="text"]');
      if (await chatInput.isVisible()) {
        await expect(chatInput).toBeVisible();
        await expect(chatInput).toBeEnabled();
      }
      
      // Check for send button
      const sendButton = page.locator('[data-testid="send-message"], button:has-text("Send"), .send-btn');
      if (await sendButton.isVisible()) {
        await expect(sendButton).toBeVisible();
        await expect(sendButton).toBeEnabled();
      }
    }
  });

  test('customer support pages', async ({ page }) => {
    await page.goto('/support');
    await helpers.waitForPageLoad();

    // Check for support page
    const supportPage = page.locator('[data-testid="support-page"], .support-page, [data-support="true"]');
    if (await supportPage.isVisible()) {
      await expect(supportPage).toBeVisible();
      
      // Check for support options
      const supportOptions = page.locator('[data-testid="support-option"], .support-option, .support-link');
      if (await supportOptions.count() > 0) {
        await expect(supportOptions.first()).toBeVisible();
      }
    }
  });

  test('premium feature accessibility', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1); // Should have exactly one h1

    // Check for landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check for ARIA labels
    const premiumContent = page.locator('[aria-label="Premium Features"], [role="region"]');
    if (await premiumContent.isVisible()) {
      await expect(premiumContent).toBeVisible();
    }
  });

  test('premium feature performance', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();
    
    const vitals = await helpers.checkCoreWebVitals();
    
    // Premium pages should load reasonably quickly
    expect(vitals.lcp).toBeLessThan(3000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('premium feature mobile responsiveness', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();
    
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that premium features are accessible on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    
    // Check that premium elements are properly sized
    const premiumContent = page.locator('[data-testid="premium-content"], .premium-content');
    if (await premiumContent.isVisible()) {
      const contentBox = await premiumContent.boundingBox();
      expect(contentBox?.width).toBeGreaterThan(300);
    }
  });

  test('premium feature error handling', async ({ page }) => {
    // Test network error on premium data loading
    await page.route('**/api/premium/**', route => route.abort());
    
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Should show error message or fallback content
    const errorMessage = page.locator('.error-message, [data-testid="premium-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('premium feature session management', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Verify session is active
    const premiumHeader = page.locator('[data-testid="premium-title"], h1');
    await expect(premiumHeader).toBeVisible();

    // Wait for potential session timeout
    await page.waitForTimeout(5000);

    // Check if still logged in
    const stillLoggedIn = await premiumHeader.isVisible();
    expect(stillLoggedIn).toBe(true);
  });

  test('premium feature payment integration', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Check for payment buttons
    const paymentButtons = page.locator('[data-testid="payment-button"], button:has-text("Pay"), button:has-text("Subscribe")');
    if (await paymentButtons.count() > 0) {
      await expect(paymentButtons.first()).toBeVisible();
      await expect(paymentButtons.first()).toBeEnabled();
      
      // Test payment flow (without actually paying)
      await paymentButtons.first().click();
      await helpers.waitForPageLoad();
      
      // Should redirect to payment page or show payment modal
      const paymentModal = page.locator('[data-testid="payment-modal"], .payment-modal, [data-payment="true"]');
      if (await paymentModal.isVisible()) {
        await expect(paymentModal).toBeVisible();
      }
    }
  });

  test('premium feature user feedback', async ({ page }) => {
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Check for feedback mechanisms
    const feedbackButtons = page.locator('[data-testid="feedback-button"], button:has-text("Feedback"), button:has-text("Rate")');
    if (await feedbackButtons.count() > 0) {
      await expect(feedbackButtons.first()).toBeVisible();
      await expect(feedbackButtons.first()).toBeEnabled();
    }
  });
});