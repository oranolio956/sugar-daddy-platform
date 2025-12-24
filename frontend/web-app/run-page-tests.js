#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function runPageTests() {
  console.log('🚀 Starting Sugar Daddy Platform Page Validation Tests...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport for consistent testing
  await page.setViewport({ width: 1920, height: 1080 });
  
  const testResults = [];
  
  // Test URLs to validate
  const testUrls = [
    { path: '/', name: 'Homepage' },
    { path: '/login', name: 'Login Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/profile', name: 'Profile Page' },
    { path: '/discovery', name: 'Discovery Page' }
  ];
  
  for (const testUrl of testUrls) {
    try {
      console.log(`Testing ${testUrl.name}...`);
      
      const startTime = Date.now();
      const response = await page.goto(`http://localhost:3000${testUrl.path}`, { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });
      const loadTime = Date.now() - startTime;
      
      const result = {
        name: testUrl.name,
        url: testUrl.path,
        status: response.status(),
        loadTime: loadTime,
        success: response.ok(),
        errors: []
      };
      
      // Check for common issues
      const pageContent = await page.content();
      
      if (pageContent.includes('Error') || pageContent.includes('error')) {
        result.errors.push('Page contains error text');
      }
      
      if (loadTime > 5000) {
        result.errors.push(`Slow loading: ${loadTime}ms`);
      }
      
      // Take screenshot for visual validation
      await page.screenshot({ 
        path: `test-results/${testUrl.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true 
      });
      
      testResults.push(result);
      console.log(`✅ ${testUrl.name}: ${response.status()} (${loadTime}ms)`);
      
    } catch (error) {
      const result = {
        name: testUrl.name,
        url: testUrl.path,
        status: 'ERROR',
        loadTime: 0,
        success: false,
        errors: [error.message]
      };
      testResults.push(result);
      console.log(`❌ ${testUrl.name}: ${error.message}`);
    }
  }
  
  // SEO Validation
  console.log('\n🔍 SEO Validation...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    const metaTitle = await page.title();
    const metaDescription = await page.$eval('meta[name="description"]', el => el.content);
    const viewport = await page.$eval('meta[name="viewport"]', el => el.content);
    
    console.log(`✅ Meta Title: ${metaTitle}`);
    console.log(`✅ Meta Description: ${metaDescription ? 'Present' : 'Missing'}`);
    console.log(`✅ Viewport: ${viewport}`);
    
  } catch (error) {
    console.log(`❌ SEO Validation Error: ${error.message}`);
  }
  
  // Performance Metrics
  console.log('\n📊 Performance Metrics...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        server: timing.responseEnd - timing.requestStart,
        dom: timing.domContentLoadedEventEnd - timing.navigationStart,
        load: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    console.log(`✅ DNS Lookup: ${metrics.dns}ms`);
    console.log(`✅ TCP Connection: ${metrics.tcp}ms`);
    console.log(`✅ Server Response: ${metrics.server}ms`);
    console.log(`✅ DOM Ready: ${metrics.dom}ms`);
    console.log(`✅ Page Load: ${metrics.load}ms`);
    
  } catch (error) {
    console.log(`❌ Performance Metrics Error: ${error.message}`);
  }
  
  // Accessibility Check
  console.log('\n♿ Accessibility Check...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    const accessibilityIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt || img.alt.trim() === '') {
          issues.push(`Image ${index} missing alt text`);
        }
      });
      
      // Check for form labels
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input, index) => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label && !input.getAttribute('aria-label')) {
          issues.push(`Input ${index} missing label`);
        }
      });
      
      return issues;
    });
    
    if (accessibilityIssues.length === 0) {
      console.log('✅ No accessibility issues found');
    } else {
      console.log(`⚠️  ${accessibilityIssues.length} accessibility issues found:`);
      accessibilityIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
  } catch (error) {
    console.log(`❌ Accessibility Check Error: ${error.message}`);
  }
  
  // Summary
  console.log('\n📈 Test Summary:');
  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total Tests: ${testResults.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.name}: ${result.errors.join(', ')}`);
    });
  }
  
  await browser.close();
  
  // Save results to file
  const fs = require('fs');
  const resultsPath = 'test-results/test-summary.json';
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Test results saved to: ${resultsPath}`);
  
  return failed === 0;
}

// Run tests
runPageTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });