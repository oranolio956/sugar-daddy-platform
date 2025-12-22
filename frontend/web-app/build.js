#!/usr/bin/env node

// Build script that bypasses npm configuration issues
// This script directly uses Node.js to perform the build process

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

try {
  // Set environment variables to work around npm configuration issues
  process.env.NPM_CONFIG_PREFIX = '/tmp/npm';
  process.env.NPM_CONFIG_CACHE = '/tmp/npm-cache';
  process.env.NPM_CONFIG_STRICT_SSL = 'false';
  process.env.NPM_CONFIG_ENGINE_STRICT = 'false';
  process.env.NPM_CONFIG_LEGACY_PEER_DEPS = 'true';
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';

  // Clean npm cache
  console.log('Cleaning npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Install dependencies with clean configuration
  console.log('Installing dependencies...');
  execSync('npm install --no-package-lock --legacy-peer-deps', { stdio: 'inherit' });

  // Build the application
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}