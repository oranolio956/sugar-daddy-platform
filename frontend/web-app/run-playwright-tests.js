#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Set the NODE_PATH to include the global Playwright installation
process.env.NODE_PATH = '/home/metzlerdalton3/.config/nvm/versions/node/v20.19.6/lib/node_modules';

try {
  // Run Playwright tests using the global installation
  console.log('Running Playwright tests...');
  const result = execSync('npx playwright test', {
    cwd: path.join(__dirname),
    stdio: 'inherit',
    env: { ...process.env, NODE_PATH: process.env.NODE_PATH }
  });
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Tests failed:', error.message);
  process.exit(1);
}