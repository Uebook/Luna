#!/usr/bin/env python3
"""
Create a COMPLETE backup of Luna Ecom project from 18:00 today
This includes all files with their versions from history or current state
"""
import json
import os
import shutil
from datetime import datetime
from pathlib import Path

HISTORY_DIR = Path.home() / "Library/Application Support/Cursor/User/History"
PROJECT_DIR = Path("/Users/vansh/ReactProject/Luna/LunaEcom")
BACKUP_DIR = PROJECT_DIR / "COMPLETE_BACKUP_18_00_2025_12_25"
TARGET_TIME = datetime(2025, 12, 25, 18, 0, 0)

# Directories/files to exclude from backup
EXCLUDE_PATTERNS = [
    'node_modules',
    'vendor',
    '.git',
    'build',
    'dist',
    '__pycache__',
    '.DS_Store',
    '*.backup',
    'backup_*',
    'COMPLETE_BACKUP_*',
    '.cursor',
    'Pods',
    '*.log',
    '*.tmp'
]

def should_exclude(path):
    """Check if path should be excluded"""
    path_str = str(path)
    for pattern in EXCLUDE_PATTERNS:
        if pattern in path_str:
            return True
    return False

def create_complete_backup():
    """Create a complete backup of the entire project"""
    
    print("=" * 60)
    print("Creating COMPLETE backup of Luna Ecom project from 18:00")
    print("=" * 60)
    print(f"Backup location: {BACKUP_DIR}\n")
    
    # Create backup directory
    BACKUP_DIR.mkdir(exist_ok=True)
    
    # Step 1: Build a map of files from history around 18:00
    print("Step 1: Scanning Cursor history for files around 18:00...")
    history_files = {}
    
    for entries_file in HISTORY_DIR.glob("*/entries.json"):
        try:
            with open(entries_file, 'r') as f:
                data = json.load(f)
                resource = data.get('resource', '').replace('file://', '')
                
                if 'LunaEcom' not in resource:
                    continue
                
                entries = data.get('entries', [])
                best_entry = None
                best_diff = float('inf')
                best_time = None
                
                # Find the entry closest to 18:00
                for entry in entries:
                    timestamp = entry.get('timestamp', 0)
                    if timestamp:
                        dt = datetime.fromtimestamp(timestamp / 1000)
                        diff = abs((dt - TARGET_TIME).total_seconds())
                        
                        if diff < best_diff:
                            best_diff = diff
                            best_entry = entry
                            best_time = dt
                
                # Use files within 2 hours of 18:00
                if best_entry and best_diff < 7200:
                    file_id = best_entry.get('id', '')
                    history_file = entries_file.parent / file_id
                    
                    if history_file.exists():
                        target_file = Path(resource)
                        if target_file.exists():
                            history_files[str(target_file)] = {
                                'source': history_file,
                                'time': best_time,
                                'diff': best_diff
                            }
        except Exception as e:
            continue
    
    print(f"  Found {len(history_files)} files in history around 18:00\n")
    
    # Step 2: Copy entire project structure
    print("Step 2: Copying complete project structure...")
    
    files_copied = 0
    files_from_history = 0
    files_from_current = 0
    
    # Important directories to backup
    important_items = [
        'src',
        'adminpanel',
        'android',
        'ios',
        'App.tsx',
        'index.js',
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'babel.config.js',
        'metro.config.js',
        'jest.config.js',
        'app.json',
        'README.md',
        '.gitignore'
    ]
    
    for item in important_items:
        source = PROJECT_DIR / item
        if source.exists() and not should_exclude(source):
            dest = BACKUP_DIR / item
            
            if source.is_dir():
                # Copy directory
                for root, dirs, files in os.walk(source):
                    # Filter excluded directories
                    dirs[:] = [d for d in dirs if not should_exclude(Path(root) / d)]
                    
                    for file in files:
                        if should_exclude(file):
                            continue
                        
                        src_file = Path(root) / file
                        rel_path = src_file.relative_to(PROJECT_DIR)
                        dst_file = BACKUP_DIR / rel_path
                        
                        # Check if we have a history version
                        if str(src_file) in history_files:
                            # Use history version
                            hist_info = history_files[str(src_file)]
                            dst_file.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(hist_info['source'], dst_file)
                            files_from_history += 1
                        else:
                            # Use current version
                            dst_file.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(src_file, dst_file)
                            files_from_current += 1
                        
                        files_copied += 1
            else:
                # Copy file
                dest.parent.mkdir(parents=True, exist_ok=True)
                
                if str(source) in history_files:
                    hist_info = history_files[str(source)]
                    shutil.copy2(hist_info['source'], dest)
                    files_from_history += 1
                else:
                    shutil.copy2(source, dest)
                    files_from_current += 1
                
                files_copied += 1
    
    # Step 3: Create manifest
    print("\nStep 3: Creating backup manifest...")
    
    manifest = {
        'backup_created': datetime.now().isoformat(),
        'target_time': TARGET_TIME.isoformat(),
        'total_files': files_copied,
        'files_from_history': files_from_history,
        'files_from_current': files_from_current,
        'project_path': str(PROJECT_DIR),
        'backup_path': str(BACKUP_DIR)
    }
    
    with open(BACKUP_DIR / 'BACKUP_MANIFEST.json', 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Step 4: Create restore script
    restore_script = f"""#!/bin/bash
# Restore script for backup from {TARGET_TIME.strftime('%Y-%m-%d %H:%M')}
# Usage: ./restore_backup.sh

BACKUP_DIR="{BACKUP_DIR}"
PROJECT_DIR="{PROJECT_DIR}"

echo "Restoring from backup..."
echo "Backup: $BACKUP_DIR"
echo "Target: $PROJECT_DIR"
echo ""
read -p "This will overwrite current files. Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$PROJECT_DIR"
    rsync -av --exclude='node_modules' --exclude='vendor' --exclude='.git' \\
        --exclude='build' --exclude='dist' "$BACKUP_DIR/" .
    echo "✓ Restore complete!"
else
    echo "Restore cancelled."
fi
"""
    
    with open(BACKUP_DIR / 'restore_backup.sh', 'w') as f:
        f.write(restore_script)
    os.chmod(BACKUP_DIR / 'restore_backup.sh', 0o755)
    
    # Summary
    print("\n" + "=" * 60)
    print("✓ COMPLETE BACKUP CREATED!")
    print("=" * 60)
    print(f"Total files backed up: {files_copied}")
    print(f"  - From history (around 18:00): {files_from_history}")
    print(f"  - From current state: {files_from_current}")
    print(f"\nBackup location: {BACKUP_DIR}")
    print(f"\nTo restore this backup, run:")
    print(f"  cd {BACKUP_DIR}")
    print(f"  ./restore_backup.sh")
    print("=" * 60)

if __name__ == "__main__":
    create_complete_backup()


