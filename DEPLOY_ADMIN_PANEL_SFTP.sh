#!/bin/bash

# Admin Panel SFTP Deployment Script (More Secure)
# Usage: ./DEPLOY_ADMIN_PANEL_SFTP.sh

echo "🚀 Admin Panel SFTP Deployment Script"
echo "======================================"
echo ""

# SFTP Configuration
SFTP_HOST="${SFTP_HOST:-}"
SFTP_USER="${SFTP_USER:-}"
SFTP_KEY="${SFTP_KEY:-$HOME/.ssh/id_rsa}"
SFTP_REMOTE_DIR="${SFTP_REMOTE_DIR:-/adminpanel/project}"

# Local directory
LOCAL_DIR="./adminpanel/project"

# Check if required variables are set
if [ -z "$SFTP_HOST" ] || [ -z "$SFTP_USER" ]; then
    echo "❌ Error: SFTP credentials not set!"
    echo ""
    echo "Please set environment variables:"
    echo "  export SFTP_HOST=your-server.com"
    echo "  export SFTP_USER=your-username"
    echo "  export SFTP_KEY=/path/to/ssh/key  (optional, defaults to ~/.ssh/id_rsa)"
    echo "  export SFTP_REMOTE_DIR=/adminpanel/project  (optional)"
    exit 1
fi

# Check if local directory exists
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ Error: Local directory not found: $LOCAL_DIR"
    exit 1
fi

echo "📁 Local Directory: $LOCAL_DIR"
echo "🌐 SFTP Host: $SFTP_HOST"
echo "👤 SFTP User: $SFTP_USER"
echo "🔑 SSH Key: $SFTP_KEY"
echo "📂 Remote Directory: $SFTP_REMOTE_DIR"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "📤 Starting SFTP deployment with rsync..."
echo ""

# Use rsync over SSH (recommended)
if command -v rsync &> /dev/null; then
    echo "Using rsync over SSH..."
    
    # Build rsync command
    RSYNC_CMD="rsync -avz --delete --exclude '.git' --exclude 'node_modules' --exclude '.env' --exclude 'vendor' --exclude 'storage/logs'"
    
    if [ -f "$SFTP_KEY" ]; then
        RSYNC_CMD="$RSYNC_CMD -e 'ssh -i $SFTP_KEY'"
    fi
    
    RSYNC_CMD="$RSYNC_CMD $LOCAL_DIR/ $SFTP_USER@$SFTP_HOST:$SFTP_REMOTE_DIR/"
    
    echo "Running: $RSYNC_CMD"
    eval $RSYNC_CMD
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment complete!"
    else
        echo ""
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Error: rsync is not installed"
    echo "Install rsync: brew install rsync (macOS) or apt-get install rsync (Linux)"
    exit 1
fi



