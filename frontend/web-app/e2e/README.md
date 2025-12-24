# Sugar Daddy Platform - Playwright E2E Tests

This directory contains comprehensive Playwright end-to-end tests that physically visit and test every single page of the sugar daddy platform.

## Test Coverage

### Core Pages
- **Homepage** (`homepage.spec.ts`) - Main landing page with hero section, navigation, and content
- **Login Page** (`login-page.spec.ts`) - User authentication with form validation and security features
- **Registration Page** (`registration-page.spec.ts`) - User sign-up with validation and verification flow
- **Dashboard** (`dashboard.spec.ts`) - User dashboard with statistics and navigation
- **Profile Page** (`profile-page.spec.ts`) - User profile management and settings
- **Discovery/Search Page** (`discovery-page.spec.ts`) - User discovery with search and filtering

### SEO Pages
- **Blog Pages** (`seo-pages.spec.ts`) - Blog index and individual posts with structured data
- **City Pages** (`seo-pages.spec.ts`) - City-specific pages for local SEO
- **Sitemap & Robots** (`seo-pages.spec.ts`) - SEO files validation

### Premium Feature Pages
- **Premium Features** (`premium-features.spec.ts`) - Premium functionality testing
- **Gift System** - Gift sending and receiving functionality
- **Advanced Search** - Premium search filters and functionality
- **Live Chat** - Real-time messaging interface
- **Customer Support** - Support pages and functionality

## Test Categories

### 1. Visual Regression Testing
- **Visual Regression Tests** (`visual-regression.spec.ts`)
  - Full-page screenshots for all major pages
  - Component-specific screenshots
  - Cross-browser visual comparisons
  - Mobile and tablet layout validation
  - Dark mode testing
  - Hover and focus state validation

### 2. Functional Testing
- **Interactive Elements** - Buttons, forms, navigation
- **Form Validation** - Input validation, error messages
- **User Flows** - Complete user journeys
- **Error Handling** - 404 pages, network errors
- **Session Management** - Login/logout, timeouts

### 3. Performance Testing
- **Core Web Vitals** (`performance.spec.ts`)
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- **JavaScript Performance** - Execution time, memory usage
- **Resource Loading** - Image optimization, lazy loading
- **Network Performance** - Request optimization, caching
- **Mobile Performance** - Touch responsiveness, load times

### 4. Accessibility Testing (WCAG Compliance)
- **Accessibility Tests** (`accessibility.spec.ts`)
  - WCAG 2.1 AA compliance
  - Keyboard navigation
  - Screen reader support
  - Color contrast validation
  - ARIA labels and roles
  - Touch target sizing (44x44px minimum)
  - Focus management

### 5. Cross-Browser Testing
- **Cross-Browser Tests** (`cross-browser.spec.ts`)
  - Chrome/Chromium
  - Firefox
  - Safari (WebKit)
  - Browser-specific feature detection
  - Consistent behavior validation

### 6. Mobile Responsiveness Testing
- **Mobile Responsive Tests** (`mobile-responsive.spec.ts`)
  - iPhone SE (375x667)
  - iPhone 12 (390x844)
  - iPad (768x1024)
  - Desktop (1920x1080)
  - Touch interactions
  - Scroll behavior
  - Responsive layouts

### 7. SEO Validation Testing
- **SEO Tests** (`seo-pages.spec.ts`)
  - Meta tags validation
  - Open Graph tags
  - Twitter Cards
  - Structured data (JSON-LD)
  - Sitemap.xml validation
  - robots.txt validation
  - Canonical URLs
  - Schema.org validation

### 8. Comprehensive User Flows
- **User Flow Tests** (`user-flows.spec.ts`)
  - Complete registration flow
  - Login and navigation flow
  - Search and discovery flow
  - Premium feature exploration
  - Error handling and edge cases
  - Mobile user experience

## Test Utilities

### Test Helpers (`utils/test-helpers.ts`)
Comprehensive utility class providing:
- Page loading and waiting
- Form filling and submission
- Accessibility checking
- Core Web Vitals measurement
- Mobile responsiveness validation
- Network request monitoring
- Console error detection
- User authentication helpers

## Running Tests

### Prerequisites
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
npx playwright test e2e/homepage.spec.ts
npx playwright test e2e/login-page.spec.ts
npx playwright test e2e/dashboard.spec.ts
```

### Run with Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Mobile Tests
```bash
npx playwright test --grep="mobile"
```

### Run Visual Regression Tests
```bash
npx playwright test --grep="visual"
```

### Run Performance Tests
```bash
npx playwright test --grep="performance"
```

### Run with Video and Screenshots
```bash
npx playwright test --video=on --screenshot=on
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

## Test Reports

### HTML Report
After running tests, generate HTML report:
```bash
npx playwright show-report
```

### JSON Results
Test results are saved to:
- `test-results/results.json`
- `test-results/results.xml` (JUnit format)

### Screenshots
Visual regression screenshots are saved to:
- `test-results/screenshots/`

### Videos
Test execution videos (if enabled):
- `test-results/videos/`

## Configuration

### Playwright Config (`playwright.config.ts`)
- Multi-browser support (Chromium, Firefox, WebKit)
- Mobile device emulation
- Test parallelization
- Retry logic for CI
- Screenshot and video capture
- Trace recording

### Environment Variables
Set in `.env` file:
```bash
BASE_URL=http://localhost:3000
```

## Test Data

### Test Users
- Email: `test@example.com`
- Password: `TestPassword123!`
- Username: `testuser`

### Test Scenarios
- Valid registration and login
- Form validation errors
- Premium feature access
- Mobile interactions
- Accessibility navigation

## Continuous Integration

### GitHub Actions
Tests are configured to run on:
- Push to main branch
- Pull requests
- Scheduled runs

### CI Configuration
- Parallel test execution
- Multiple browser testing
- Mobile device testing
- Performance monitoring
- Visual regression comparison

## Performance Benchmarks

### Core Web Vitals Targets
- **LCP**: < 2.5 seconds (Good)
- **FID**: < 100 milliseconds (Good)
- **CLS**: < 0.1 (Good)

### Page Load Targets
- **Homepage**: < 3 seconds
- **Login/Register**: < 2 seconds
- **Dashboard**: < 3 seconds
- **Discovery**: < 3 seconds

### Mobile Performance
- **Touch Response**: < 100ms
- **Scroll Performance**: 60fps
- **Memory Usage**: < 50MB

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and roles
- **Color Contrast**: Minimum 4.5:1 ratio
- **Touch Targets**: Minimum 44x44px
- **Focus Management**: Visible focus indicators
- **Error Messages**: Clear, descriptive text

## SEO Best Practices

### Meta Tags
- Title tags < 60 characters
- Meta descriptions < 160 characters
- Open Graph tags for social sharing
- Twitter Cards for Twitter sharing

### Structured Data
- JSON-LD schema.org markup
- Organization and Website schema
- Article schema for blog posts
- LocalBusiness schema for city pages

### Technical SEO
- Valid sitemap.xml
- Proper robots.txt
- Canonical URLs
- Mobile-first indexing support

## Troubleshooting

### Common Issues
1. **Tests timing out**: Check network connectivity and server status
2. **Visual diffs failing**: Update baseline images if intentional changes
3. **Performance tests failing**: Check for performance regressions
4. **Accessibility tests failing**: Review WCAG compliance issues

### Debug Commands
```bash
# Check server status
curl http://localhost:3000

# Run single test in debug mode
npx playwright test e2e/homepage.spec.ts --debug

# Generate new baseline images
npx playwright test --update-snapshots
```

## Contributing

### Adding New Tests
1. Create test file in `e2e/` directory
2. Use `TestHelpers` class for common operations
3. Follow naming convention: `page-name.spec.ts`
4. Add to appropriate test categories
5. Update this README

### Test Guidelines
- Use descriptive test names
- Include proper assertions
- Test both positive and negative scenarios
- Use page object model for complex interactions
- Add appropriate wait conditions
- Clean up test data

## Monitoring and Maintenance

### Regular Tasks
- Update baseline images when UI changes
- Review performance metrics
- Check accessibility compliance
- Validate SEO implementation
- Monitor test execution times

### Performance Monitoring
- Track Core Web Vitals over time
- Monitor test execution duration
- Watch for memory leaks
- Check network request optimization

This comprehensive test suite ensures the sugar daddy platform maintains high quality across all pages, browsers, devices, and user scenarios.