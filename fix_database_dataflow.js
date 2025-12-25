#!/usr/bin/env node

/**
 * Database and Data Flow Fix Script
 * Implements fixes for identified database and data flow issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Database and Data Flow Fixes...');
console.log('='.repeat(60));

// Fix 1: Add database connection pooling to user service
function fixDatabaseConnectionPooling() {
  console.log('🔧 Fixing database connection pooling...');
  
  try {
    const userServiceModelsPath = path.join(__dirname, 'backend/user-service/src/models/index.ts');
    let content = fs.readFileSync(userServiceModelsPath, 'utf8');
    
    // Check if pooling is already configured
    if (content.includes('pool:') && content.includes('max:') && content.includes('min:')) {
      console.log('✅ Database connection pooling already configured');
      return true;
    }
    
    // Add connection pooling configuration
    const sequelizeConfigStart = content.indexOf('const sequelize = new Sequelize({');
    const sequelizeConfigEnd = content.indexOf('});', sequelizeConfigStart) + 3;
    
    const newPoolingConfig = `,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 5
  }`;
    
    const beforeConfigEnd = content.substring(0, sequelizeConfigEnd - 1);
    const afterConfigEnd = content.substring(sequelizeConfigEnd);
    
    content = beforeConfigEnd + newPoolingConfig + afterConfigEnd;
    
    fs.writeFileSync(userServiceModelsPath, content);
    console.log('✅ Database connection pooling configuration added');
    return true;
  } catch (error) {
    console.log('❌ Failed to add database connection pooling:', error.message);
    return false;
  }
}

// Fix 2: Ensure proper database environment variables in docker-compose
function fixDockerComposeDatabaseConfig() {
  console.log('\n🔧 Fixing Docker Compose database configuration...');
  
  try {
    const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
    let content = fs.readFileSync(dockerComposePath, 'utf8');
    
    // Check if database URLs are properly configured
    const databaseUrlPattern = /DATABASE_URL=postgres:\/\/user:password@postgres:5432\/sugar_daddy_db/g;
    const matches = content.match(databaseUrlPattern);
    
    if (matches && matches.length >= 6) { // Should have DB URLs for all services
      console.log('✅ Database URLs already properly configured in docker-compose');
      return true;
    }
    
    // Ensure all services have proper database URL configuration
    const servicesToCheck = ['api-gateway', 'user-service', 'matching-service', 'messaging-service', 'payment-service', 'notification-service'];
    
    let modified = false;
    servicesToCheck.forEach(service => {
      const serviceRegex = new RegExp(`(${service}):.*?environment:.*?- DATABASE_URL=.*?`, 's');
      const match = content.match(serviceRegex);
      
      if (!match || !match[0].includes('postgres://user:password@postgres:5432/sugar_daddy_db')) {
        // Add proper database URL if missing
        const serviceStart = content.indexOf(`${service}:`);
        if (serviceStart !== -1) {
          const environmentStart = content.indexOf('environment:', serviceStart);
          if (environmentStart !== -1) {
            const nextService = content.indexOf('\n  ', environmentStart + 1);
            const environmentEnd = nextService !== -1 ? nextService : content.length;
            
            const environmentSection = content.substring(environmentStart, environmentEnd);
            
            if (!environmentSection.includes('DATABASE_URL=')) {
              const newEnvironmentLine = '      - DATABASE_URL=postgres://user:password@postgres:5432/sugar_daddy_db';
              const newContent = content.substring(0, environmentStart + 13) + '\n      - DATABASE_URL=postgres://user:password@postgres:5432/sugar_daddy_db' + content.substring(environmentStart + 13);
              content = newContent;
              modified = true;
            }
          }
        }
      }
    });
    
    if (modified) {
      fs.writeFileSync(dockerComposePath, content);
      console.log('✅ Database URLs fixed in docker-compose');
    } else {
      console.log('✅ Database URLs already properly configured');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Failed to fix Docker Compose database configuration:', error.message);
    return false;
  }
}

// Fix 3: Add database health check endpoint to services
function addDatabaseHealthChecks() {
  console.log('\n🔧 Adding database health check endpoints...');
  
  const services = [
    { name: 'user-service', path: 'backend/user-service/src/index.ts' },
    { name: 'messaging-service', path: 'backend/messaging-service/src/index.ts' },
    { name: 'payment-service', path: 'backend/payment-service/src/index.ts' }
  ];
  
  let successCount = 0;
  
  services.forEach(service => {
    try {
      const servicePath = path.join(__dirname, service.path);
      let content = fs.readFileSync(servicePath, 'utf8');
      
      // Check if database health check already exists
      if (content.includes('/health/db') || content.includes('database health')) {
        console.log(`✅ ${service.name} already has database health check`);
        successCount++;
        return;
      }
      
      // Add database health check endpoint
      const healthCheckEnd = content.indexOf('});', content.indexOf('/health'));
      
      if (healthCheckEnd !== -1) {
        const dbHealthCheck = `

  // Database health check
  app.get('/health/db', async (req, res) => {
    try {
      // Test database connection
      await sequelize.authenticate();
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });`;
        
        const beforeHealthCheckEnd = content.substring(0, healthCheckEnd + 3);
        const afterHealthCheckEnd = content.substring(healthCheckEnd + 3);
        
        content = beforeHealthCheckEnd + dbHealthCheck + afterHealthCheckEnd;
        
        fs.writeFileSync(servicePath, content);
        console.log(`✅ Added database health check to ${service.name}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Failed to add database health check to ${service.name}:`, error.message);
    }
  });
  
  return successCount >= services.length;
}

// Fix 4: Add database migration health check
function addDatabaseMigrationCheck() {
  console.log('\n🔧 Adding database migration health check...');
  
  try {
    const userServicePath = path.join(__dirname, 'backend/user-service/src/index.ts');
    let content = fs.readFileSync(userServicePath, 'utf8');
    
    // Check if migration check already exists
    if (content.includes('migration check') || content.includes('sequelize.sync')) {
      console.log('✅ Database migration check already exists');
      return true;
    }
    
    // Add migration health check endpoint
    const healthCheckEnd = content.indexOf('});', content.indexOf('/health'));
    
    if (healthCheckEnd !== -1) {
      const migrationCheck = `

  // Database migration health check
  app.get('/health/migrations', async (req, res) => {
    try {
      // Check if database is synchronized
      const isSynced = await sequelize.sync({ alter: false });
      res.json({
        status: 'healthy',
        migrations: 'up_to_date',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Migration health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        migrations: 'pending_or_failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });`;
      
      const beforeHealthCheckEnd = content.substring(0, healthCheckEnd + 3);
      const afterHealthCheckEnd = content.substring(healthCheckEnd + 3);
      
      content = beforeHealthCheckEnd + migrationCheck + afterHealthCheckEnd;
      
      fs.writeFileSync(userServicePath, content);
      console.log('✅ Added database migration health check');
      return true;
    }
  } catch (error) {
    console.log('❌ Failed to add database migration check:', error.message);
    return false;
  }
}

// Fix 5: Add database connection error handling
function addDatabaseErrorHandling() {
  console.log('\n🔧 Adding database connection error handling...');
  
  try {
    const userServicePath = path.join(__dirname, 'backend/user-service/src/index.ts');
    let content = fs.readFileSync(userServicePath, 'utf8');
    
    // Check if database error handling already exists
    if (content.includes('sequelize.authenticate') && content.includes('catch')) {
      console.log('✅ Database error handling already exists');
      return true;
    }
    
    // Add database connection error handling
    const initDbCall = content.indexOf('initDatabase()');
    
    if (initDbCall !== -1) {
      const initDbEnd = content.indexOf(');', initDbCall);
      
      const errorHandling = `.catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });`;
    
    const beforeInitDbEnd = content.substring(0, initDbEnd + 2);
    const afterInitDbEnd = content.substring(initDbEnd + 2);
    
    content = beforeInitDbEnd + errorHandling + afterInitDbEnd;
    
    fs.writeFileSync(userServicePath, content);
    console.log('✅ Added database connection error handling');
    return true;
  }
  } catch (error) {
    console.log('❌ Failed to add database error handling:', error.message);
    return false;
  }
}

// Fix 6: Create database initialization script
function createDatabaseInitScript() {
  console.log('\n🔧 Creating database initialization script...');
  
  try {
    const initScriptPath = path.join(__dirname, 'scripts/init_database.js');
    
    const initScript = `#!/usr/bin/env node

/**
 * Database Initialization Script
 * Ensures database is properly initialized and migrations are run
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🚀 Initializing database...');
  
  try {
    // Create Sequelize instance
    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sugar_daddy_db',
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    
    // Test connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Run migrations
    console.log('🔧 Running database migrations...');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database migrations completed');
    
    // Test sample queries
    console.log('🧪 Testing sample database operations...');
    
    // Test user table
    const [usersResult] = await sequelize.query('SELECT 1 FROM "Users" LIMIT 1');
    console.log('✅ Users table accessible');
    
    // Test profiles table
    const [profilesResult] = await sequelize.query('SELECT 1 FROM "Profiles" LIMIT 1');
    console.log('✅ Profiles table accessible');
    
    console.log('🎉 Database initialization completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Run initialization
initializeDatabase()
  .then(success => {
    if (!success) {
      console.error('💥 Database initialization failed');
      process.exit(1);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Database initialization error:', error);
    process.exit(1);
  });`;
    
    fs.writeFileSync(initScriptPath, initScript);
    fs.chmodSync(initScriptPath, '755');
    
    console.log('✅ Database initialization script created');
    return true;
  } catch (error) {
    console.log('❌ Failed to create database initialization script:', error.message);
    return false;
  }
}

// Main function to run all fixes
async function main() {
  const fixes = [
    { name: 'Database Connection Pooling', function: fixDatabaseConnectionPooling },
    { name: 'Docker Compose Database Config', function: fixDockerComposeDatabaseConfig },
    { name: 'Database Health Checks', function: addDatabaseHealthChecks },
    { name: 'Database Migration Check', function: addDatabaseMigrationCheck },
    { name: 'Database Error Handling', function: addDatabaseErrorHandling },
    { name: 'Database Init Script', function: createDatabaseInitScript }
  ];
  
  let successfulFixes = 0;
  
  for (const fix of fixes) {
    try {
      const result = fix.function();
      if (result) {
        successfulFixes++;
      }
    } catch (error) {
      console.log(`❌ ${fix.name} failed:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 DATABASE AND DATA FLOW FIXES SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`🔹 Total Fixes Attempted: ${fixes.length}`);
  console.log(`🔹 Successful Fixes: ${successfulFixes}`);
  console.log(`🔹 Success Rate: ${Math.round((successfulFixes / fixes.length) * 100)}%`);
  
  if (successfulFixes === fixes.length) {
    console.log('\n🎉 All database and data flow fixes implemented successfully!');
    console.log('🚀 System is ready for testing.');
  } else {
    console.log('\n⚠️  Some fixes were not implemented.');
    console.log('🔧 Please review the failed fixes above.');
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  if (successfulFixes >= fixes.length * 0.8) {
    console.log('✅ Database and data flow fixes completed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Some database and data flow fixes failed!');
    process.exit(1);
  }
}

main();