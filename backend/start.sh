#!/bin/bash

# Start Backend Service

set -e

# Get script directory and change to it
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 Starting Backend Service"
echo "=================================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found!"
    echo "Installing dependencies..."
    pnpm install
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "Building backend..."
    pnpm run build
fi

echo "✓ Backend ready"
echo ""
echo "🔄 Starting Backend Service..."
echo "URL: http://localhost:3000"
echo "API: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the service
pnpm run start:dev
