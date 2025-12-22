#!/usr/bin/env bash
set -euo pipefail

echo "Starting build process (Vercel friendly)..."

# Allow more memory for large builds
export NODE_OPTIONS="--max-old-space-size=4096"

# Prefer clean install in CI
echo "Installing dependencies (npm ci --legacy-peer-deps)..."
npm ci --quiet --legacy-peer-deps || {
  echo "npm ci failed, falling back to npm install --legacy-peer-deps"
  npm install --no-audit --no-fund --legacy-peer-deps
}

echo "Running Next.js build..."
npm run build

echo "Build completed successfully."
