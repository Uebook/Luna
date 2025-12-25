#!/usr/bin/env python3
"""
Restore files from Cursor history (9:00 to 19:00 today)
"""
import json
import os
import glob
import shutil
from datetime import datetime
from pathlib import Path

HISTORY_DIR = Path.home() / "Library/Application Support/Cursor/User/History"
PROJECT_DIR = Path("/Users/vansh/ReactProject/Luna/LunaEcom")

def restore_files():
    restored_count = 0
    files_to_restore = []
    
    print("Searching for files modified between 9:00 and 19:00 today...\n")
    
    # Find all entries.json files
    for entries_file in HISTORY_DIR.glob("*/entries.json"):
        try:
            with open(entries_file, 'r') as f:
                data = json.load(f)
                resource = data.get('resource', '').replace('file://', '')
                
                # Only process files in LunaEcom project
                if 'LunaEcom' not in resource:
                    continue
                
                entries = data.get('entries', [])
                if not entries:
                    continue
                
                # Get the latest entry
                latest_entry = entries[-1]
                timestamp = latest_entry.get('timestamp', 0)
                
                if timestamp:
                    dt = datetime.fromtimestamp(timestamp / 1000)
                    hour = dt.hour
                    
                    # Check if file was modified between 9:00 and 19:00
                    if 9 <= hour < 19:
                        file_id = latest_entry.get('id', '')
                        history_file = entries_file.parent / file_id
                        
                        if history_file.exists():
                            target_file = Path(resource)
                            
                            if target_file.exists():
                                files_to_restore.append({
                                    'source': history_file,
                                    'target': target_file,
                                    'time': dt.strftime("%H:%M:%S"),
                                    'relative': str(target_file.relative_to(PROJECT_DIR))
                                })
        except Exception as e:
            continue
    
    # Sort by time (latest first)
    files_to_restore.sort(key=lambda x: x['time'], reverse=True)
    
    # Restore files
    print(f"Found {len(files_to_restore)} files to restore:\n")
    for file_info in files_to_restore:
        try:
            # Create backup of current file
            backup_file = file_info['target'].with_suffix(file_info['target'].suffix + '.backup')
            if file_info['target'].exists():
                shutil.copy2(file_info['target'], backup_file)
            
            # Restore from history
            shutil.copy2(file_info['source'], file_info['target'])
            print(f"✓ Restored: {file_info['relative']} (from {file_info['time']})")
            restored_count += 1
        except Exception as e:
            print(f"✗ Failed to restore {file_info['relative']}: {e}")
    
    print(f"\n✓ Successfully restored {restored_count} files!")
    print(f"Backups saved with .backup extension")

if __name__ == "__main__":
    restore_files()


