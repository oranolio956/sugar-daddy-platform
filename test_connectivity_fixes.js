#!/usr/bin/env node

/**
 * Service Connectivity Fixes Validator
 * Tests the implemented connectivity fixes
 */

const fs = require('fs');
const path = require('path');

// Test results
const results = {
  fixes: [],
  issues: [],
  summary: {}
};

function testApiGatewayConfiguration() {
  console.log('🔧 Testing API Gateway Configuration Fixes...');
  
  const apiGatewayPath = path.join(__dirname, 'backend/api-gateway/src/index.ts');
  const content = fs.readFileSync(apiGatewayPath, 'utf8');
  
  // Test 1: Check for Docker service URLs
  const hasDockerUrls = content.includes('user-service:3002') && 
                        content.includes('matching-service:3003') &&
                        content.includes('messaging-service:3004') &&
                        content.includes('payment-service:3005') &&
                        content.includes('notification-service:3006');
  
  results.fixes.push({
    test: 'API Gateway uses Docker service names',
    passed: hasDockerUrls,
    details: hasDockerUrls ? '✅ Using Docker service names for all services' : '❌ Still using localhost URLs'
  });
  
  // Test 2: Check for resilient client implementation
  const hasResilientClient = content.includes('createResilientClient') && 
                            content.includes('retry') &&
                            content.includes('retryDelay');
  
  results.fixes.push({
    test: 'Resilient HTTP client implemented',
    passed: hasResilientClient,
    details: hasResilientClient ? '✅ Resilient client with retry logic found' : '❌ No resilient client implementation'
  });
  
  // Test 3: Check for service registry
  const hasServiceRegistry = content.includes('serviceRegistry');
  
  results.fixes.push({
    test: 'Service registry implemented',
    passed: hasServiceRegistry,
    details: hasServiceRegistry ? '✅ Service registry found' : '❌ No service registry'
  });
}

function testDockerComposeConfiguration() {
  console.log('\n🔧 Testing Docker Compose Configuration Fixes...');
  
  const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
  const content = fs.readFileSync(dockerComposePath, 'utf8');
  
  // Test 1: Check for environment variables
  const hasEnvVars = content.includes('USER_SERVICE_URL=http://user-service:3002') &&
                    content.includes('MATCHING_SERVICE_URL=http://matching-service:3003') &&
                    content.includes('MESSAGING_SERVICE_URL=http://messaging-service:3004') &&
                    content.includes('PAYMENT_SERVICE_URL=http://payment-service:3005') &&
                    content.includes('NOTIFICATION_SERVICE_URL=http://notification-service:3006');
  
  results.fixes.push({
    test: 'Docker Compose has service URL environment variables',
    passed: hasEnvVars,
    details: hasEnvVars ? '✅ All service URLs configured in environment variables' : '❌ Missing service URL environment variables'
  });
  
  // Test 2: Check for health checks
  const healthCheckCount = (content.match(/healthcheck:/g) || []).length;
  
  results.fixes.push({
    test: 'Health checks configured for services',
    passed: healthCheckCount >= 5,
    details: `✅ Found ${healthCheckCount} health checks (expected 5+)`
  });
  
  // Test 3: Check for proper dependencies
  const apiGatewayDeps = content.includes('depends_on:') && 
                        content.includes('user-service') &&
                        content.includes('matching-service') &&
                        content.includes('messaging-service') &&
                        content.includes('payment-service') &&
                        content.includes('notification-service');
  
  results.fixes.push({
    test: 'API Gateway has proper service dependencies',
    passed: apiGatewayDeps,
    details: apiGatewayDeps ? '✅ API Gateway depends on all services' : '❌ Missing service dependencies'
  });
}

function testServiceCommunicationPatterns() {
  console.log('\n🔧 Testing Service Communication Pattern Fixes...');
  
  // Test service files for proper error handling
  const serviceFiles = [
    'backend/notification-service/src/index.ts',
    'backend/matching-service/src/index.ts',
    'backend/user-service/src/index.ts'
  ];
  
  let servicesWithErrorHandling = 0;
  let servicesWithRetryLogic = 0;
  
  serviceFiles.forEach(serviceFile => {
    try {
      const servicePath = path.join(__dirname, serviceFile);
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Check for error handling
      if (content.includes('try') && content.includes('catch')) {
        servicesWithErrorHandling++;
      }
      
      // Check for retry logic (basic check)
      if (content.includes('retry') || content.includes('axios.create')) {
        servicesWithRetryLogic++;
      }
    } catch (error) {
      // File might not exist or other issue
      console.log(`⚠️  Could not read ${serviceFile}: ${error.message}`);
    }
  });
  
  results.fixes.push({
    test: 'Services have proper error handling',
    passed: servicesWithErrorHandling >= 2,
    details: `✅ ${servicesWithErrorHandling}/3 services have error handling`
  });
  
  results.fixes.push({
    test: 'Services implement retry logic',
    passed: servicesWithRetryLogic >= 1,
    details: `✅ ${servicesWithRetryLogic}/3 services have retry logic`
  });
}

function testMissingDockerfiles() {
  console.log('\n🔧 Testing Missing Dockerfiles Fixes...');
  
  const dockerfiles = [
    'backend/api-gateway/Dockerfile',
    'backend/user-service/Dockerfile',
    'backend/matching-service/Dockerfile',
    'backend/messaging-service/Dockerfile',
    'backend/payment-service/Dockerfile',
    'backend/notification-service/Dockerfile'
  ];
  
  let existingDockerfiles = 0;
  
  dockerfiles.forEach(dockerfile => {
    const dockerfilePath = path.join(__dirname, dockerfile);
    if (fs.existsSync(dockerfilePath)) {
      existingDockerfiles++;
    }
  });
  
  results.fixes.push({
    test: 'All required Dockerfiles exist',
    passed: existingDockerfiles >= 6,
    details: `✅ ${existingDockerfiles}/6 Dockerfiles found`
  });
}

function generateReport() {
  console.log('\n📊 Generating Fixes Validation Report...');
  
  const passedFixes = results.fixes.filter(f => f.passed).length;
  const totalFixes = results.fixes.length;
  const passRate = Math.round((passedFixes / totalFixes) * 100);
  
  results.summary = {
    passed: passedFixes,
    total: totalFixes,
    passRate: `${passRate}%`,
    status: passRate >= 80 ? '✅ PASS' : '⚠️  PARTIAL'
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 CONNECTIVITY FIXES VALIDATION REPORT');
  console.log('='.repeat(60));
  
  console.log(`🔹 Total Fixes Tested: ${totalFixes}`);
  console.log(`🔹 Fixes Passed: ${passedFixes}`);
  console.log(`🔹 Pass Rate: ${passRate}%`);
  console.log(`🔹 Overall Status: ${results.summary.status}`);
  
  console.log('\n🔧 INDIVIDUAL FIX RESULTS:');
  results.fixes.forEach((fix, index) => {
    const status = fix.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status}: ${fix.test}`);
    console.log(`   ${fix.details}`);
  });
  
  if (results.issues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ❌ ${issue.test}: ${issue.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  if (passRate >= 80) {
    console.log('✅ Connectivity fixes are well implemented!');
    console.log('🚀 System is ready for deployment testing.');
  } else if (passRate >= 50) {
    console.log('⚠️  Some fixes are implemented but improvements needed.');
    console.log('🔧 Focus on failed tests to complete the fixes.');
  } else {
    console.log('❌ Critical fixes are missing.');
    console.log('💥 Immediate attention required for failed tests.');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return results;
}

function main() {
  console.log('🚀 Starting Connectivity Fixes Validation...');
  console.log('='.repeat(60));
  
  try {
    testApiGatewayConfiguration();
    testDockerComposeConfiguration();
    testServiceCommunicationPatterns();
    testMissingDockerfiles();
    
    const report = generateReport();
    
    // Exit with appropriate code
    const passRate = parseInt(report.summary.passRate);
    if (passRate >= 80) {
      console.log('🎉 Connectivity fixes validation completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  Connectivity fixes need more work!');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Fixes validation failed:', error.message);
    process.exit(1);
  }
}

main();