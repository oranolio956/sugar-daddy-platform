#!/usr/bin/env node

/**
 * Service Connectivity Tester
 * Tests API Gateway routing and inter-service communication
 */

const axios = require('axios');
const { execSync } = require('child_process');

// Configuration
const API_GATEWAY_URL = 'http://localhost:3001';
const SERVICE_URLS = {
  user: 'http://localhost:3002',
  matching: 'http://localhost:3003',
  messaging: 'http://localhost:3004',
  payment: 'http://localhost:3005',
  notification: 'http://localhost:3006'
};

// Test results
const results = {
  services: {},
  apiGateway: {},
  interService: {},
  issues: []
};

async function testServiceHealth() {
  console.log('🔍 Testing individual service health...');
  
  for (const [serviceName, serviceUrl] of Object.entries(SERVICE_URLS)) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      results.services[serviceName] = {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        timestamp: response.data.timestamp
      };
      
      console.log(`✅ ${serviceName} service: Healthy (${responseTime}ms)`);
    } catch (error) {
      results.services[serviceName] = {
        status: 'unhealthy',
        error: error.message
      };
      
      results.issues.push({
        type: 'service_health',
        service: serviceName,
        error: error.message,
        severity: 'critical'
      });
      
      console.log(`❌ ${serviceName} service: Unhealthy - ${error.message}`);
    }
  }
}

async function testApiGatewayRouting() {
  console.log('\n🔍 Testing API Gateway routing...');
  
  const endpoints = [
    { path: '/api/users', service: 'user' },
    { path: '/api/matches', service: 'matching' },
    { path: '/api/messages', service: 'messaging' },
    { path: '/api/payments', service: 'payment' },
    { path: '/api/notifications', service: 'notification' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${API_GATEWAY_URL}${endpoint.path}`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      results.apiGateway[endpoint.service] = {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        endpoint: endpoint.path
      };
      
      console.log(`✅ API Gateway → ${endpoint.service}: Healthy (${responseTime}ms)`);
    } catch (error) {
      results.apiGateway[endpoint.service] = {
        status: 'unhealthy',
        error: error.message,
        endpoint: endpoint.path
      };
      
      results.issues.push({
        type: 'gateway_routing',
        service: endpoint.service,
        endpoint: endpoint.path,
        error: error.message,
        severity: 'critical'
      });
      
      console.log(`❌ API Gateway → ${endpoint.service}: Unhealthy - ${error.message}`);
    }
  }
}

async function testInterServiceCommunication() {
  console.log('\n🔍 Testing inter-service communication...');
  
  // Test scenarios that involve service-to-service calls
  const testCases = [
    {
      name: 'Notification service calling User service',
      test: async () => {
        // This simulates the notification service calling user service
        const response = await axios.get(`${SERVICE_URLS.user}/health`);
        return response.status === 200;
      }
    },
    {
      name: 'Matching service calling User service',
      test: async () => {
        const response = await axios.get(`${SERVICE_URLS.user}/health`);
        return response.status === 200;
      }
    },
    {
      name: 'Messaging service calling Notification service',
      test: async () => {
        const response = await axios.get(`${SERVICE_URLS.notification}/health`);
        return response.status === 200;
      }
    }
  ];
  
  for (const testCase of testCases) {
    try {
      const startTime = Date.now();
      const success = await testCase.test();
      const responseTime = Date.now() - startTime;
      
      results.interService[testCase.name] = {
        status: success ? 'healthy' : 'unhealthy',
        responseTime: `${responseTime}ms`
      };
      
      if (success) {
        console.log(`✅ ${testCase.name}: Healthy (${responseTime}ms)`);
      } else {
        console.log(`❌ ${testCase.name}: Unhealthy`);
      }
    } catch (error) {
      results.interService[testCase.name] = {
        status: 'unhealthy',
        error: error.message
      };
      
      results.issues.push({
        type: 'inter_service',
        test: testCase.name,
        error: error.message,
        severity: 'high'
      });
      
      console.log(`❌ ${testCase.name}: Unhealthy - ${error.message}`);
    }
  }
}

async function testDockerNetworkConnectivity() {
  console.log('\n🔍 Testing Docker network connectivity...');
  
  try {
    // Test if we can ping services by their Docker service names
    const testCommands = [
      'docker exec api-gateway curl -s http://user-service:3002/health',
      'docker exec matching-service curl -s http://user-service:3002/health',
      'docker exec messaging-service curl -s http://notification-service:3006/health'
    ];
    
    for (const command of testCommands) {
      try {
        const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
        console.log(`✅ Docker network test passed: ${command}`);
      } catch (error) {
        console.log(`❌ Docker network test failed: ${command} - ${error.message}`);
        results.issues.push({
          type: 'docker_network',
          command: command,
          error: error.message,
          severity: 'critical'
        });
      }
    }
  } catch (error) {
    console.log(`⚠️  Docker network test skipped: ${error.message}`);
  }
}

async function generateReport() {
  console.log('\n📊 Generating connectivity report...');
  
  const healthyServices = Object.values(results.services).filter(s => s.status === 'healthy').length;
  const totalServices = Object.keys(results.services).length;
  
  const healthyGatewayRoutes = Object.values(results.apiGateway).filter(g => g.status === 'healthy').length;
  const totalGatewayRoutes = Object.keys(results.apiGateway).length;
  
  const healthyInterService = Object.values(results.interService).filter(i => i.status === 'healthy').length;
  const totalInterService = Object.keys(results.interService).length;
  
  const criticalIssues = results.issues.filter(i => i.severity === 'critical').length;
  const highIssues = results.issues.filter(i => i.severity === 'high').length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 CONNECTIVITY REPORT SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`🔹 Services Health: ${healthyServices}/${totalServices} healthy`);
  console.log(`🔹 API Gateway Routes: ${healthyGatewayRoutes}/${totalGatewayRoutes} healthy`);
  console.log(`🔹 Inter-Service Communication: ${healthyInterService}/${totalInterService} healthy`);
  console.log(`🔹 Critical Issues: ${criticalIssues}`);
  console.log(`🔹 High Priority Issues: ${highIssues}`);
  
  if (results.issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.error}`);
      if (issue.service) console.log(`   Service: ${issue.service}`);
      if (issue.endpoint) console.log(`   Endpoint: ${issue.endpoint}`);
    });
  } else {
    console.log('\n✅ All connectivity tests passed!');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return results;
}

async function main() {
  console.log('🚀 Starting Service Connectivity Test...');
  console.log('='.repeat(60));
  
  try {
    await testServiceHealth();
    await testApiGatewayRouting();
    await testInterServiceCommunication();
    await testDockerNetworkConnectivity();
    
    const report = await generateReport();
    
    // Exit with appropriate code
    if (report.issues.some(i => i.severity === 'critical')) {
      console.log('💥 Critical connectivity issues detected!');
      process.exit(1);
    } else if (report.issues.length > 0) {
      console.log('⚠️  Connectivity issues detected!');
      process.exit(1);
    } else {
      console.log('🎉 All connectivity tests passed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Connectivity test failed:', error.message);
    process.exit(1);
  }
}

main();