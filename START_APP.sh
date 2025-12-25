#!/bin/bash

# Luna E-Commerce - Start Application Script
# This script sets up and starts both backend and frontend

echo "🚀 Starting Luna E-Commerce Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists php; then
    echo -e "${RED}❌ PHP is not installed${NC}"
    exit 1
fi

if ! command_exists composer; then
    echo -e "${RED}❌ Composer is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Backend Setup
echo "🔧 Setting up Backend API..."
cd adminpanel/luna-api

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your database and API credentials${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
fi

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-interaction

# Generate app key if not set
php artisan key:generate --ansi

# Run migrations
echo "🗄️  Running database migrations..."
php artisan migrate --force

# Clear caches
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Frontend Setup
echo "🔧 Setting up Frontend..."
cd ../../

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# Start services
echo "🎯 Starting services..."
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Luna E-Commerce is ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend API:"
echo "   cd adminpanel/luna-api"
echo "   php artisan serve"
echo ""
echo "2. Start React Native (in a new terminal):"
echo "   npm start"
echo ""
echo "3. Run on device/emulator:"
echo "   npm run android  (for Android)"
echo "   npm run ios      (for iOS)"
echo ""
echo -e "${YELLOW}⚠️  Make sure to:${NC}"
echo "   - Set up your database in .env"
echo "   - Add Agora credentials (optional for now)"
echo "   - Configure API base URL in src/services/api.js"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"




