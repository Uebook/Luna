#!/bin/bash
# Restore script for backup from 2025-12-25 18:00
# Usage: ./restore_backup.sh

BACKUP_DIR="/Users/vansh/ReactProject/Luna/LunaEcom/COMPLETE_BACKUP_18_00_2025_12_25"
PROJECT_DIR="/Users/vansh/ReactProject/Luna/LunaEcom"

echo "Restoring from backup..."
echo "Backup: $BACKUP_DIR"
echo "Target: $PROJECT_DIR"
echo ""
read -p "This will overwrite current files. Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$PROJECT_DIR"
    rsync -av --exclude='node_modules' --exclude='vendor' --exclude='.git' \
        --exclude='build' --exclude='dist' "$BACKUP_DIR/" .
    echo "✓ Restore complete!"
else
    echo "Restore cancelled."
fi
