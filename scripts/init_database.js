#!/usr/bin/env node

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
  });