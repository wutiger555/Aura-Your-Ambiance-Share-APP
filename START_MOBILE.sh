#!/bin/bash

# Aura Mobile App Startup Script
# This script ensures clean startup with proper cache clearing

set -e  # Exit on error

echo "🚀 Starting Aura Mobile App..."
echo ""

# Navigate to mobile directory
cd "$(dirname "$0")/apps/mobile"

# Kill any running Metro/Expo processes
echo "📦 Cleaning up existing processes..."
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Clear caches
echo "🧹 Clearing caches..."
rm -rf .expo node_modules/.cache 2>/dev/null || true

# Clear watchman if available
if command -v watchman &> /dev/null; then
    echo "👀 Clearing watchman..."
    watchman watch-del-all 2>/dev/null || true
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Starting Expo development server..."
echo "Press 'i' for iOS Simulator"
echo "Press 'a' for Android Emulator"
echo ""

# Start with clean cache
npm start -- --clear
