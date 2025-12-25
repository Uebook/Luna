#!/bin/bash

# Start Backend API Server

cd adminpanel/luna-api

echo "🚀 Starting Laravel API Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create it first."
    exit 1
fi

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Start server
php artisan serve --host=0.0.0.0 --port=8000




