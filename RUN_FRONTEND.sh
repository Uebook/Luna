#!/bin/bash

# Start React Native Frontend

echo "🚀 Starting React Native Metro Bundler..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Metro bundler
npm start




