#!/bin/bash

# Build script for Vercel deployment
# This script works around npm configuration issues by using a clean environment

set -e

echo "Starting build process..."

# Create completely isolated npm environment
echo "Creating completely isolated npm environment..."
export NPM_CONFIG_CACHE="/tmp/npm-cache-$(date +%s)"
export NPM_CONFIG_PREFIX="/tmp/npm-prefix-$(date +%s)"
export NPM_CONFIG_STRICT_SSL="false"
export NPM_CONFIG_ENGINE_STRICT="false"
export NPM_CONFIG_LEGACY_PEER_DEPS="true"
export NPM_CONFIG_USERCONFIG="$PWD/.npmrc"
export NPM_CONFIG_GLOBALCONFIG="/dev/null"
export NPM_CONFIG_NPM_CONFIG_GLOBALCONFIG="/dev/null"
export NODE_OPTIONS="--max-old-space-size=4096"

echo "Completely isolated npm environment created:"
echo "NPM_CONFIG_CACHE: $NPM_CONFIG_CACHE"
echo "NPM_CONFIG_PREFIX: $NPM_CONFIG_PREFIX"
echo "NPM_CONFIG_STRICT_SSL: $NPM_CONFIG_STRICT_SSL"
echo "NPM_CONFIG_ENGINE_STRICT: $NPM_CONFIG_ENGINE_STRICT"
echo "NPM_CONFIG_LEGACY_PEER_DEPS: $NPM_CONFIG_LEGACY_PEER_DEPS"
echo "NPM_CONFIG_USERCONFIG: $NPM_CONFIG_USERCONFIG"
echo "NPM_CONFIG_GLOBALCONFIG: $NPM_CONFIG_GLOBALCONFIG"
echo ""

# Skip cache clean since npm is broken, just proceed with install
echo "Skipping cache clean (npm is broken), proceeding with install..."

# Install dependencies with isolated environment
echo "Installing dependencies..."
npm install --no-package-lock --legacy-peer-deps --verbose --cache-min=0 --cache-max=0

# Build the application
echo "Building application..."
npm run build

echo "Build completed successfully!"