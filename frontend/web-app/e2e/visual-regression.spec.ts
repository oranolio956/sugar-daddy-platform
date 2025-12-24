import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Visual Regression Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('homepage visual regression', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Specific sections
    const heroSection = page.locator('[data-testid="hero"], .hero, h1');
    if (await heroSection.isVisible()) {
      await expect(heroSection).toHaveScreenshot('homepage-hero.png');
    }

    const navigation = page.locator('nav, [data-testid="navigation"]');
    if (await navigation.isVisible()) {
      await expect(navigation).toHaveScreenshot('homepage-navigation.png');
    }

    const footer = page.locator('footer, [data-testid="footer"]');
    if (await footer.isVisible()) {
      await expect(footer).toHaveScreenshot('homepage-footer.png');
    }
  });

  test('login page visual regression', async ({ page }) => {
    await page.goto('/login');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('login-page-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Login form
    const loginForm = page.locator('form, [data-testid="login-form"]');
    if (await loginForm.isVisible()) {
      await expect(loginForm).toHaveScreenshot('login-form.png');
    }
  });

  test('registration page visual regression', async ({ page }) => {
    await page.goto('/register');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('registration-page-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Registration form
    const registrationForm = page.locator('form, [data-testid="registration-form"]');
    if (await registrationForm.isVisible()) {
      await expect(registrationForm).toHaveScreenshot('registration-form.png');
    }
  });

  test('dashboard visual regression', async ({ page }) => {
    // Login first
    await helpers.loginUser();
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Dashboard header
    const dashboardHeader = page.locator('[data-testid="dashboard-header"], h1');
    if (await dashboardHeader.isVisible()) {
      await expect(dashboardHeader).toHaveScreenshot('dashboard-header.png');
    }

    // Dashboard content
    const dashboardContent = page.locator('[data-testid="dashboard-content"], .dashboard-content');
    if (await dashboardContent.isVisible()) {
      await expect(dashboardContent).toHaveScreenshot('dashboard-content.png');
    }
  });

  test('profile page visual regression', async ({ page }) => {
    // Login first
    await helpers.loginUser();
    await page.goto('/profile');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('profile-page-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Profile header
    const profileHeader = page.locator('[data-testid="profile-header"], h1');
    if (await profileHeader.isVisible()) {
      await expect(profileHeader).toHaveScreenshot('profile-header.png');
    }

    // Profile form
    const profileForm = page.locator('form, [data-testid="profile-form"]');
    if (await profileForm.isVisible()) {
      await expect(profileForm).toHaveScreenshot('profile-form.png');
    }
  });

  test('discovery page visual regression', async ({ page }) => {
    // Login first
    await helpers.loginUser();
    await page.goto('/discovery');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('discovery-page-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Search section
    const searchSection = page.locator('[data-testid="search-section"], .search-section');
    if (await searchSection.isVisible()) {
      await expect(searchSection).toHaveScreenshot('discovery-search.png');
    }

    // User cards
    const userCards = page.locator('[data-testid="user-cards"], .user-cards');
    if (await userCards.isVisible()) {
      await expect(userCards).toHaveScreenshot('discovery-user-cards.png');
    }
  });

  test('premium features visual regression', async ({ page }) => {
    // Login first
    await helpers.loginUser();
    await page.goto('/premium');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('premium-features-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Pricing plans
    const pricingPlans = page.locator('[data-testid="pricing-plans"], .pricing-plans');
    if (await pricingPlans.isVisible()) {
      await expect(pricingPlans).toHaveScreenshot('premium-pricing.png');
    }
  });

  test('blog page visual regression', async ({ page }) => {
    await page.goto('/blog');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('blog-page-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Blog posts
    const blogPosts = page.locator('[data-testid="blog-posts"], .blog-posts');
    if (await blogPosts.isVisible()) {
      await expect(blogPosts).toHaveScreenshot('blog-posts.png');
    }
  });

  test('city page visual regression', async ({ page }) => {
    await page.goto('/city/new-york');
    await helpers.waitForPageLoad();

    // Full page screenshot
    await expect(page).toHaveScreenshot('city-page-full.png', {
      fullPage: true,
      threshold: 0.2
    });

    // City content
    const cityContent = page.locator('[data-testid="city-content"], .city-content');
    if (await cityContent.isVisible()) {
      await expect(cityContent).toHaveScreenshot('city-content.png');
    }
  });

  test('error pages visual regression', async ({ page }) => {
    // 404 page
    await page.goto('/non-existent-page');
    await helpers.waitForPageLoad();

    const error404 = page.locator('[data-testid="404-error"], .error-404, h1:has-text("404")');
    if (await error404.isVisible()) {
      await expect(error404).toHaveScreenshot('error-404.png');
    }

    // Error page full
    await expect(page).toHaveScreenshot('error-page-full.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('mobile visual regression', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Mobile homepage
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.2
    });

    // Mobile navigation
    const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, nav');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toHaveScreenshot('mobile-navigation.png');
    }
  });

  test('tablet visual regression', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Tablet homepage
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('dark mode visual regression', async ({ page }) => {
    // Toggle dark mode if available
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"], button:has-text("Dark"), button:has-text("Light")');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await helpers.waitForPageLoad();
    }

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Dark mode homepage
    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('loading states visual regression', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto('/dashboard');
    await helpers.waitForPageLoad();

    // Loading state
    const loadingState = page.locator('[data-testid="loading"], .loading, [aria-busy="true"]');
    if (await loadingState.isVisible()) {
      await expect(loadingState).toHaveScreenshot('loading-state.png');
    }
  });

  test('hover states visual regression', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test hover states
    const buttons = page.locator('button, a');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.hover();
        await page.waitForTimeout(500);
        
        await expect(button).toHaveScreenshot(`button-hover-${i}.png`);
      }
    }
  });

  test('focus states visual regression', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test focus states
    const inputs = page.locator('input, button');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        await input.focus();
        await page.waitForTimeout(500);
        
        await expect(input).toHaveScreenshot(`focus-state-${i}.png`);
      }
    }
  });
});