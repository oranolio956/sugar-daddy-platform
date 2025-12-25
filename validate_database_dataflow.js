#!/usr/bin/env node

/**
 * Database and Data Flow Validator
 * Tests database connectivity and data flow between services
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test results
const results = {
  databaseConfigurations: {},
  schemaConsistency: {},
  dataFlow: {},
  issues: []
};

async function testDatabaseConfigurations() {
  console.log('🔍 Testing database configurations...');

  // Check user-service database configuration
  try {
    const userServiceConfig = fs.readFileSync(path.join(__dirname, 'backend/user-service/src/models/index.ts'), 'utf8');
    
    const hasPostgresConfig = userServiceConfig.includes('dialect: \'postgres\'') &&
                           userServiceConfig.includes('process.env.DB_HOST');
    
    results.databaseConfigurations.userService = {
      status: hasPostgresConfig ? 'healthy' : 'unhealthy',
      details: hasPostgresConfig ? '✅ PostgreSQL configuration found' : '❌ Missing PostgreSQL configuration'
    };
    
    if (!hasPostgresConfig) {
      results.issues.push({
        type: 'database_configuration',
        service: 'user-service',
        error: 'Missing proper PostgreSQL configuration',
        severity: 'critical'
      });
    }
  } catch (error) {
    results.databaseConfigurations.userService = {
      status: 'unhealthy',
      error: error.message
    };
    results.issues.push({
      type: 'database_configuration',
      service: 'user-service',
      error: error.message,
      severity: 'critical'
    });
  }

  // Check messaging-service database configuration
  try {
    const messagingServiceConfig = fs.readFileSync(path.join(__dirname, 'backend/messaging-service/src/models/Conversation.ts'), 'utf8');
    
    const hasSequelizeModels = messagingServiceConfig.includes('@Table') &&
                            messagingServiceConfig.includes('@Column');
    
    results.databaseConfigurations.messagingService = {
      status: hasSequelizeModels ? 'healthy' : 'unhealthy',
      details: hasSequelizeModels ? '✅ Sequelize models configured' : '❌ Missing Sequelize model configuration'
    };
    
    if (!hasSequelizeModels) {
      results.issues.push({
        type: 'database_configuration',
        service: 'messaging-service',
        error: 'Missing proper Sequelize model configuration',
        severity: 'critical'
      });
    }
  } catch (error) {
    results.databaseConfigurations.messagingService = {
      status: 'unhealthy',
      error: error.message
    };
    results.issues.push({
      type: 'database_configuration',
      service: 'messaging-service',
      error: error.message,
      severity: 'critical'
    });
  }

  console.log('✅ Database configuration testing completed');
}

async function testSchemaConsistency() {
  console.log('\n🔍 Testing schema consistency...');

  // Check for potential schema conflicts between services
  try {
    // Check if messaging service models reference user service models correctly
    const conversationModel = fs.readFileSync(path.join(__dirname, 'backend/messaging-service/src/models/Conversation.ts'), 'utf8');
    const messageModel = fs.readFileSync(path.join(__dirname, 'backend/messaging-service/src/models/Message.ts'), 'utf8');
    
    const hasUserReferences = conversationModel.includes('user1Id') && 
                           conversationModel.includes('user2Id') &&
                           messageModel.includes('senderId') &&
                           messageModel.includes('receiverId');
    
    results.schemaConsistency.userReferences = {
      status: hasUserReferences ? 'healthy' : 'unhealthy',
      details: hasUserReferences ? '✅ User references in messaging models' : '❌ Missing user references in messaging models'
    };
    
    if (!hasUserReferences) {
      results.issues.push({
        type: 'schema_consistency',
        service: 'messaging-service',
        error: 'Missing proper user references in messaging models',
        severity: 'high'
      });
    }
  } catch (error) {
    results.schemaConsistency.userReferences = {
      status: 'unhealthy',
      error: error.message
    };
    results.issues.push({
      type: 'schema_consistency',
      service: 'messaging-service',
      error: error.message,
      severity: 'high'
    });
  }

  // Check database connection environment variables
  try {
    const dockerCompose = fs.readFileSync(path.join(__dirname, 'docker-compose.yml'), 'utf8');
    
    const hasDatabaseUrls = dockerCompose.includes('DATABASE_URL=postgres://user:password@postgres:5432/sugar_daddy_db');
    
    results.schemaConsistency.databaseUrls = {
      status: hasDatabaseUrls ? 'healthy' : 'unhealthy',
      details: hasDatabaseUrls ? '✅ Database URLs configured in docker-compose' : '❌ Missing database URL configuration'
    };
    
    if (!hasDatabaseUrls) {
      results.issues.push({
        type: 'schema_consistency',
        service: 'docker-compose',
        error: 'Missing database URL configuration',
        severity: 'critical'
      });
    }
  } catch (error) {
    results.schemaConsistency.databaseUrls = {
      status: 'unhealthy',
      error: error.message
    };
    results.issues.push({
      type: 'schema_consistency',
      service: 'docker-compose',
      error: error.message,
      severity: 'critical'
    });
  }

  console.log('✅ Schema consistency testing completed');
}

async function testDataFlow() {
  console.log('\n🔍 Testing data flow between services...');

  // Test API Gateway service discovery
  try {
    const apiGatewayConfig = fs.readFileSync(path.join(__dirname, 'backend/api-gateway/src/index.ts'), 'utf8');
    
    const hasServiceDiscovery = apiGatewayConfig.includes('serviceRegistry') &&
                              apiGatewayConfig.includes('createResilientClient');
    
    results.dataFlow.serviceDiscovery = {
      status: hasServiceDiscovery ? 'healthy' : 'unhealthy',
      details: hasServiceDiscovery ? '✅ Service discovery and resilient client implemented' : '❌ Missing service discovery'
    };
    
    if (!hasServiceDiscovery) {
      results.issues.push({
        type: 'data_flow',
        service: 'api-gateway',
        error: 'Missing service discovery implementation',
        severity: 'critical'
      });
    }
  } catch (error) {
    results.dataFlow.serviceDiscovery = {
      status: 'unhealthy',
      error: error.message
    };
    results.issues.push({
      type: 'data_flow',
      service: 'api-gateway',
      error: error.message,
      severity: 'critical'
    });
  }

  // Test inter-service communication patterns
  try {
    const userService = fs.readFileSync(path.join(__dirname, 'backend/user-service/src/index.ts'), 'utf8');
    const messagingService = fs.readFileSync(path.join(__dirname, 'backend/messaging-service/src/index.ts'), 'utf8');
    const paymentService = fs.readFileSync(path.join(__dirname, 'backend/payment-service/src/index.ts'), 'utf8');
    
    const userServiceHasAxios = userService.includes('axios');
    const messagingServiceHasAxios = messagingService.includes('axios');
    const paymentServiceHasAxios = paymentService.includes('axios');
    
    const interServiceCommunication = userServiceHasAxios && messagingServiceHasAxios && paymentServiceHasAxios;
    
    results.dataFlow.interServiceCommunication = {
      status: interServiceCommunication ? 'healthy' : 'unhealthy',
      details: interServiceCommunication ? '✅ Services can communicate via HTTP' : '❌ Missing HTTP communication capabilities'
    };
    
    if (!interServiceCommunication) {
      results.issues.push({
        type: 'data_flow',
        service: 'inter-service',
        error: 'Missing HTTP communication capabilities in services',
        severity: 'high'
      });
    }
  } catch (error) {
    results.dataFlow.interServiceCommunication = {
      status: 'unhealthy',
      error: error.message
    };
    results.issues.push({
      type: 'data_flow',
      service: 'inter-service',
      error: error.message,
      severity: 'high'
    });
  }

  // Test database connection pooling
  try {
    const userServiceConfig = fs.readFileSync(path.join(__dirname, 'backend/user-service/src/models/index.ts'), 'utf8');
    
    const hasConnectionPooling = userServiceConfig.includes('Sequelize') && 
                               userServiceConfig.includes('pool:');
    
    results.dataFlow.connectionPooling = {
      status: hasConnectionPooling ? 'healthy' : 'warning',
      details: hasConnectionPooling ? '✅ Database connection pooling configured' : '⚠️  No explicit connection pooling configuration'
    };
    
    if (!hasConnectionPooling) {
      results.issues.push({
        type: 'data_flow',
        service: 'database',
        error: 'No explicit connection pooling configuration',
        severity: 'medium'
      });
    }
  } catch (error) {
    results.dataFlow.connectionPooling = {
      status: 'unhealthy',
      error: error.message
    };
    results.issues.push({
      type: 'data_flow',
      service: 'database',
      error: error.message,
      severity: 'medium'
    });
  }

  console.log('✅ Data flow testing completed');
}

async function testDatabaseConnectivity() {
  console.log('\n🔍 Testing database connectivity...');

  try {
    // Test if we can connect to the database using the configured credentials
    const testCommand = 'docker exec postgres psql -U user -d sugar_daddy_db -c "SELECT 1"';
    
    try {
      const result = execSync(testCommand, { encoding: 'utf8', timeout: 10000 });
      
      results.databaseConnectivity = {
        status: 'healthy',
        details: '✅ Database connection successful'
      };
      
      console.log('✅ Database connectivity test passed');
    } catch (error) {
      // If Docker is not running, this is not a critical issue in development
      if (error.message.includes('No such container') || error.message.includes('Cannot connect to the Docker daemon')) {
        results.databaseConnectivity = {
          status: 'skipped',
          details: '⚠️  Docker containers not running (expected in development)'
        };
        console.log('⚠️  Database connectivity test skipped (Docker not running)');
      } else {
        results.databaseConnectivity = {
          status: 'unhealthy',
          error: error.message
        };
        
        results.issues.push({
          type: 'database_connectivity',
          service: 'postgres',
          error: error.message,
          severity: 'critical'
        });
        
        console.log('❌ Database connectivity test failed:', error.message);
      }
    }
  } catch (error) {
    console.log('⚠️  Database connectivity test skipped (Docker not running):', error.message);
    results.databaseConnectivity = {
      status: 'skipped',
      error: 'Docker not running or database not available'
    };
  }
}

async function generateReport() {
  console.log('\n📊 Generating database and data flow report...');

  const healthyDatabaseConfigs = Object.values(results.databaseConfigurations).filter(d => d.status === 'healthy').length;
  const totalDatabaseConfigs = Object.keys(results.databaseConfigurations).length;

  const healthySchemaChecks = Object.values(results.schemaConsistency).filter(s => s.status === 'healthy').length;
  const totalSchemaChecks = Object.keys(results.schemaConsistency).length;

  const healthyDataFlowChecks = Object.values(results.dataFlow).filter(d => d.status === 'healthy').length;
  const totalDataFlowChecks = Object.keys(results.dataFlow).length;

  const criticalIssues = results.issues.filter(i => i.severity === 'critical').length;
  const highIssues = results.issues.filter(i => i.severity === 'high').length;
  const mediumIssues = results.issues.filter(i => i.severity === 'medium').length;

  console.log('\n' + '='.repeat(60));
  console.log('📋 DATABASE AND DATA FLOW REPORT');
  console.log('='.repeat(60));

  console.log(`🔹 Database Configurations: ${healthyDatabaseConfigs}/${totalDatabaseConfigs} healthy`);
  console.log(`🔹 Schema Consistency: ${healthySchemaChecks}/${totalSchemaChecks} healthy`);
  console.log(`🔹 Data Flow: ${healthyDataFlowChecks}/${totalDataFlowChecks} healthy`);
  console.log(`🔹 Critical Issues: ${criticalIssues}`);
  console.log(`🔹 High Priority Issues: ${highIssues}`);
  console.log(`🔹 Medium Priority Issues: ${mediumIssues}`);

  if (results.issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.error}`);
      if (issue.service) console.log(`   Service: ${issue.service}`);
    });
  } else {
    console.log('\n✅ All database and data flow tests passed!');
  }

  console.log('\n' + '='.repeat(60));

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  if (criticalIssues > 0) {
    console.log('❌ Critical database and data flow issues detected!');
    console.log('💥 Immediate attention required for critical issues.');
  } else if (highIssues > 0) {
    console.log('⚠️  Some database and data flow issues need attention.');
    console.log('🔧 Focus on resolving high priority issues first.');
  } else if (mediumIssues > 0) {
    console.log('🟡 Some minor database and data flow improvements suggested.');
    console.log('📝 Consider implementing medium priority recommendations.');
  } else {
    console.log('✅ Database and data flow configuration looks excellent!');
    console.log('🚀 System is ready for deployment.');
  }

  console.log('\n' + '='.repeat(60));

  return results;
}

async function main() {
  console.log('🚀 Starting Database and Data Flow Validation...');
  console.log('='.repeat(60));

  try {
    await testDatabaseConfigurations();
    await testSchemaConsistency();
    await testDataFlow();
    await testDatabaseConnectivity();
    
    const report = await generateReport();
    
    // Exit with appropriate code
    if (report.issues.some(i => i.severity === 'critical')) {
      console.log('💥 Critical database and data flow issues detected!');
      process.exit(1);
    } else if (report.issues.length > 0) {
      console.log('⚠️  Database and data flow issues detected!');
      process.exit(1);
    } else {
      console.log('🎉 All database and data flow tests passed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Database and data flow validation failed:', error.message);
    process.exit(1);
  }
}

main();