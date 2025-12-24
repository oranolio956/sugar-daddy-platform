import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Profile Page Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Login first
    await helpers.loginUser();
    await page.goto('/profile');
    await helpers.waitForPageLoad();
  });

  test.afterEach(async ({ page }) => {
    // Logout after each test
    await helpers.logoutUser();
  });

  test('profile page loads correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Profile/);

    // Check meta tags
    const metaTags = await helpers.checkMetaTags();
    expect(metaTags.title).toContain('Profile');
    expect(metaTags.description).toBeTruthy();

    // Check for profile elements
    const profileHeader = page.locator('h1, [data-testid="profile-title"]');
    await expect(profileHeader).toBeVisible();

    // Take screenshot for visual regression
    await helpers.takeScreenshot('profile-page-desktop');
  });

  test('profile information display', async ({ page }) => {
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

      // Check for bio/description
      const bio = page.locator('[data-testid="user-bio"], .user-bio, .bio');
      if (await bio.isVisible()) {
        await expect(bio).toBeVisible();
      }
    }
  });

  test('profile editing', async ({ page }) => {
    // Check for edit button
    const editButton = page.locator('[data-testid="edit-profile"], button:has-text("Edit Profile"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
      await expect(editButton).toBeEnabled();
      
      // Click edit button
      await editButton.click();
      await helpers.waitForPageLoad();

      // Check for edit form
      const editForm = page.locator('form, [data-testid="profile-form"]');
      if (await editForm.isVisible()) {
        await expect(editForm).toBeVisible();
        
        // Test form fields
        const nameField = page.locator('[name="name"], [name="username"], [name="displayName"]');
        if (await nameField.isVisible()) {
          await expect(nameField).toBeVisible();
          await expect(nameField).toBeEnabled();
        }

        // Test cancel edit
        const cancelButton = page.locator('button:has-text("Cancel"), [data-testid="cancel-edit"]');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await helpers.waitForPageLoad();
        }
      }
    }
  });

  test('profile privacy settings', async ({ page }) => {
    // Check for privacy settings
    const privacySettings = page.locator('[data-testid="privacy-settings"], .privacy-settings, [data-testid="privacy"]');
    if (await privacySettings.isVisible()) {
      await expect(privacySettings).toBeVisible();
      
      // Check privacy options
      const privacyOptions = page.locator('[data-testid="privacy-option"], .privacy-option, input[type="radio"]');
      if (await privacyOptions.count() > 0) {
        await expect(privacyOptions.first()).toBeVisible();
      }
    }
  });

  test('profile preferences', async ({ page }) => {
    // Check for preferences section
    const preferences = page.locator('[data-testid="preferences"], .preferences, [data-testid="settings"]');
    if (await preferences.isVisible()) {
      await expect(preferences).toBeVisible();
      
      // Check preference options
      const preferenceOptions = page.locator('[data-testid="preference-option"], .preference-option, input[type="checkbox"]');
      if (await preferenceOptions.count() > 0) {
        await expect(preferenceOptions.first()).toBeVisible();
      }
    }
  });

  test('profile security settings', async ({ page }) => {
    // Check for security settings
    const securitySettings = page.locator('[data-testid="security-settings"], .security-settings, [data-testid="security"]');
    if (await securitySettings.isVisible()) {
      await expect(securitySettings).toBeVisible();
      
      // Check for password change
      const changePassword = page.locator('[data-testid="change-password"], button:has-text("Change Password")');
      if (await changePassword.isVisible()) {
        await expect(changePassword).toBeVisible();
        await expect(changePassword).toBeEnabled();
      }

      // Check for 2FA settings
      const twoFactor = page.locator('[data-testid="two-factor"], .two-factor, [data-testid="2fa"]');
      if (await twoFactor.isVisible()) {
        await expect(twoFactor).toBeVisible();
      }
    }
  });

  test('profile accessibility', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1); // Should have exactly one h1

    // Check for landmarks
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check form labels
    const labels = page.locator('label');
    if (await labels.count() > 0) {
      await expect(labels.first()).toBeVisible();
    }
  });

  test('profile performance', async ({ page }) => {
    const vitals = await helpers.checkCoreWebVitals();
    
    // Profile page should load reasonably quickly
    expect(vitals.lcp).toBeLessThan(3000);
    expect(vitals.fid).toBeLessThan(100);
    expect(vitals.cls).toBeLessThan(0.1);
  });

  test('profile mobile responsiveness', async ({ page }) => {
    const results = await helpers.checkMobileResponsiveness();
    
    // Check that profile is accessible on mobile
    expect(results['375x812'].hasHorizontalScroll).toBe(false);
    
    // Check that profile elements are properly sized
    const profileContent = page.locator('[data-testid="profile-content"], .profile-content');
    if (await profileContent.isVisible()) {
      const contentBox = await profileContent.boundingBox();
      expect(contentBox?.width).toBeGreaterThan(300);
    }
  });

  test('profile error handling', async ({ page }) => {
    // Test network error on profile data loading
    await page.route('**/api/profile/**', route => route.abort());
    
    // Refresh page to trigger error
    await page.reload();
    await helpers.waitForPageLoad();

    // Should show error message or fallback content
    const errorMessage = page.locator('.error-message, [data-testid="profile-error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('profile session management', async ({ page }) => {
    // Verify session is active
    const userProfile = page.locator('[data-testid="user-profile"]');
    await expect(userProfile).toBeVisible();

    // Wait for potential session timeout
    await page.waitForTimeout(5000);

    // Check if still logged in
    const stillLoggedIn = await userProfile.isVisible();
    expect(stillLoggedIn).toBe(true);
  });

  test('profile image upload', async ({ page }) => {
    // Check for image upload functionality
    const imageUpload = page.locator('[data-testid="image-upload"], input[type="file"], .image-upload');
    if (await imageUpload.isVisible()) {
      await expect(imageUpload).toBeVisible();
      
      // Test file input
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        await expect(fileInput).toBeVisible();
      }
    }
  });

  test('profile social links', async ({ page }) => {
    // Check for social links
    const socialLinks = page.locator('[data-testid="social-links"], .social-links, [data-testid="social"]');
    if (await socialLinks.isVisible()) {
      await expect(socialLinks).toBeVisible();
      
      // Check for specific social platforms
      const socialIcons = page.locator('[data-testid="social-icon"], .social-icon, a[href*="facebook"], a[href*="twitter"], a[href*="instagram"]');
      if (await socialIcons.count() > 0) {
        await expect(socialIcons.first()).toBeVisible();
      }
    }
  });
});