#!/usr/bin/env python3
"""
Create a complete backup of Luna Ecom project from 18:00 today
"""
import json
import os
import shutil
from datetime import datetime
from pathlib import Path

HISTORY_DIR = Path.home() / "Library/Application Support/Cursor/User/History"
PROJECT_DIR = Path("/Users/vansh/ReactProject/Luna/LunaEcom")
BACKUP_DIR = PROJECT_DIR / "backup_18_00_2025_12_25"
TARGET_TIME = datetime(2025, 12, 25, 18, 0, 0)

def create_complete_backup():
    """Create a complete backup of all files from around 18:00"""
    
    print(f"Creating complete backup from 18:00 today...")
    print(f"Backup location: {BACKUP_DIR}\n")
    
    # Create backup directory
    BACKUP_DIR.mkdir(exist_ok=True)
    
    files_backed_up = []
    files_not_found = []
    
    # Find all files in history around 18:00
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
                
                # Find the entry closest to 18:00
                for entry in entries:
                    timestamp = entry.get('timestamp', 0)
                    if timestamp:
                        dt = datetime.fromtimestamp(timestamp / 1000)
                        diff = abs((dt - TARGET_TIME).total_seconds())
                        
                        # Prefer files within 1 hour of 18:00, but take closest
                        if diff < best_diff:
                            best_diff = diff
                            best_entry = entry
                
                if best_entry and best_diff < 3600:  # Within 1 hour
                    file_id = best_entry.get('id', '')
                    history_file = entries_file.parent / file_id
                    
                    if history_file.exists():
                        target_file = Path(resource)
                        relative_path = target_file.relative_to(PROJECT_DIR)
                        backup_file = BACKUP_DIR / relative_path
                        
                        # Create directory structure
                        backup_file.parent.mkdir(parents=True, exist_ok=True)
                        
                        # Copy file to backup
                        shutil.copy2(history_file, backup_file)
                        
                        dt = datetime.fromtimestamp(best_entry.get('timestamp', 0) / 1000)
                        files_backed_up.append({
                            'file': str(relative_path),
                            'time': dt.strftime('%H:%M:%S'),
                            'diff': int(best_diff / 60)  # minutes difference
                        })
        except Exception as e:
            continue
    
    # Also backup current files that don't have history (as fallback)
    print("Backing up current project structure...")
    important_dirs = [
        'src',
        'adminpanel',
        'App.tsx',
        'package.json',
        'index.js'
    ]
    
    for item in important_dirs:
        source = PROJECT_DIR / item
        if source.exists():
            dest = BACKUP_DIR / item
            if source.is_dir():
                if not dest.exists():
                    shutil.copytree(source, dest, ignore=shutil.ignore_patterns(
                        'node_modules', 'vendor', '.git', 'build', 'dist', 
                        '*.backup', '__pycache__', '.DS_Store'
                    ))
            else:
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, dest)
    
    # Create manifest
    manifest = {
        'backup_time': datetime.now().isoformat(),
        'target_time': TARGET_TIME.isoformat(),
        'total_files': len(files_backed_up),
        'files': sorted(files_backed_up, key=lambda x: x['file'])
    }
    
    with open(BACKUP_DIR / 'backup_manifest.json', 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✓ Backup complete!")
    print(f"✓ Backed up {len(files_backed_up)} files from history")
    print(f"✓ Backup location: {BACKUP_DIR}")
    print(f"\nFiles closest to 18:00:")
    for f in sorted(files_backed_up, key=lambda x: x['diff'])[:20]:
        print(f"  {f['time']} ({f['diff']}min diff) - {f['file']}")

if __name__ == "__main__":
    create_complete_backup()


