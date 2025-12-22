#!/usr/bin/env node

// Build script that bypasses npm configuration issues
// This script directly uses Node.js to perform the build process

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

try {
  // Create completely isolated npm environment
  console.log('Creating completely isolated npm environment...');
  const timestamp = Date.now();
  process.env.NPM_CONFIG_CACHE = `/tmp/npm-cache-${timestamp}`;
  process.env.NPM_CONFIG_PREFIX = `/tmp/npm-prefix-${timestamp}`;
  process.env.NPM_CONFIG_STRICT_SSL = 'false';
  process.env.NPM_CONFIG_ENGINE_STRICT = 'false';
  process.env.NPM_CONFIG_LEGACY_PEER_DEPS = 'true';
  process.env.NPM_CONFIG_USERCONFIG = `${process.cwd()}/.npmrc`;
  process.env.NPM_CONFIG_GLOBALCONFIG = '/dev/null';
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';

  console.log('Completely isolated npm environment created:');
  console.log('NPM_CONFIG_CACHE:', process.env.NPM_CONFIG_CACHE);
  console.log('NPM_CONFIG_PREFIX:', process.env.NPM_CONFIG_PREFIX);
  console.log('NPM_CONFIG_STRICT_SSL:', process.env.NPM_CONFIG_STRICT_SSL);
  console.log('NPM_CONFIG_ENGINE_STRICT:', process.env.NPM_CONFIG_ENGINE_STRICT);
  console.log('NPM_CONFIG_LEGACY_PEER_DEPS:', process.env.NPM_CONFIG_LEGACY_PEER_DEPS);
  console.log('NPM_CONFIG_USERCONFIG:', process.env.NPM_CONFIG_USERCONFIG);
  console.log('NPM_CONFIG_GLOBALCONFIG:', process.env.NPM_CONFIG_GLOBALCONFIG);
  console.log('');

  // Skip cache clean since npm is broken, just proceed with install
  console.log('Skipping cache clean (npm is broken), proceeding with install...');

  // Install dependencies with isolated environment
  console.log('Installing dependencies...');
  execSync('npm install --no-package-lock --legacy-peer-deps --verbose --cache-min=0 --cache-max=0', { stdio: 'inherit' });

  // Build the application
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}