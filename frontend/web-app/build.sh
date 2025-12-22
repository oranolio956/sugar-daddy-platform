#!/bin/bash

# Build script for Vercel deployment
# This script works around npm configuration issues by using a clean environment

set -e

echo "Starting build process..."

# Set environment variables to work around npm configuration issues
export NPM_CONFIG_PREFIX=/tmp/npm
export NPM_CONFIG_CACHE=/tmp/npm-cache
export NPM_CONFIG_STRICT_SSL=false
export NPM_CONFIG_ENGINE_STRICT=false
export NPM_CONFIG_LEGACY_PEER_DEPS=true

# Clean npm cache
npm cache clean --force

# Install dependencies with clean configuration
npm install --no-package-lock --legacy-peer-deps

# Build the application
npm run build

echo "Build completed successfully!"