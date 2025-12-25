#!/bin/bash

# Admin Panel FTP Deployment Script
# Usage: ./DEPLOY_ADMIN_PANEL.sh

echo "🚀 Admin Panel Deployment Script"
echo "=================================="
echo ""

# FTP Configuration (Set these or pass as environment variables)
FTP_HOST="${FTP_HOST:-}"
FTP_USER="${FTP_USER:-}"
FTP_PASS="${FTP_PASS:-}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/adminpanel/project}"

# Local directory to deploy
LOCAL_DIR="./adminpanel/project"

# Check if required variables are set
if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo "❌ Error: FTP credentials not set!"
    echo ""
    echo "Please set environment variables:"
    echo "  export FTP_HOST=your-ftp-host.com"
    echo "  export FTP_USER=your-username"
    echo "  export FTP_PASS=your-password"
    echo "  export FTP_REMOTE_DIR=/adminpanel/project  (optional)"
    echo ""
    echo "Or run:"
    echo "  FTP_HOST=host FTP_USER=user FTP_PASS=pass ./DEPLOY_ADMIN_PANEL.sh"
    exit 1
fi

# Check if local directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Error: Local directory not found: $LOCAL_DIR"
    exit 1
fi

echo "📁 Local Directory: $LOCAL_DIR"
echo "🌐 FTP Host: $FTP_HOST"
echo "👤 FTP User: $FTP_USER"
echo "📂 Remote Directory: $FTP_REMOTE_DIR"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "📤 Starting FTP deployment..."
echo ""

# Use lftp for better FTP support (if available)
if command -v lftp &> /dev/null; then
    echo "Using lftp..."
    lftp -c "
    set ftp:ssl-allow no
    set ssl:verify-certificate no
    open -u $FTP_USER,$FTP_PASS $FTP_HOST
    cd $FTP_REMOTE_DIR
    mirror -R --delete --verbose --exclude-glob .git/ --exclude-glob node_modules/ --exclude-glob .env $LOCAL_DIR .
    bye
    "
elif command -v ftp &> /dev/null; then
    echo "Using standard ftp (limited functionality)..."
    echo "Note: Consider installing lftp for better sync support"
    # Basic FTP upload - this is limited
    ftp -n $FTP_HOST <<EOF
    user $FTP_USER $FTP_PASS
    binary
    cd $FTP_REMOTE_DIR
    prompt
    mput $LOCAL_DIR/*
    quit
EOF
else
    echo "❌ Error: Neither lftp nor ftp is installed"
    echo "Install lftp: brew install lftp  (macOS) or apt-get install lftp (Linux)"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""



