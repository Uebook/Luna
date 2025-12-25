#!/bin/bash

# Script to restore files from Cursor history (9:00 to 19:00 today)
HISTORY_DIR="$HOME/Library/Application Support/Cursor/User/History"
PROJECT_DIR="/Users/vansh/ReactProject/Luna/LunaEcom"

echo "Searching for files modified between 9:00 and 19:00 today..."

# Find all entries.json files and extract file paths with timestamps
find "$HISTORY_DIR" -name "entries.json" | while read entries_file; do
    dir=$(dirname "$entries_file")
    
    # Extract file path and latest timestamp
    file_path=$(grep -o 'file://[^"]*' "$entries_file" | head -1 | sed 's|file://||')
    
    if [[ "$file_path" == *"LunaEcom"* ]]; then
        # Get latest entry timestamp
        timestamp=$(grep -o '"timestamp":[0-9]*' "$entries_file" | tail -1 | cut -d: -f2)
        
        if [ ! -z "$timestamp" ]; then
            # Convert timestamp to hour
            hour=$(date -r $(($timestamp/1000)) "+%H" 2>/dev/null)
            
            if [ "$hour" -ge 9 ] && [ "$hour" -lt 19 ]; then
                # Get latest PHP/JS file in this directory
                latest_file=$(ls -t "$dir"/*.php "$dir"/*.js 2>/dev/null | head -1)
                
                if [ ! -z "$latest_file" ] && [ -f "$latest_file" ]; then
                    # Get relative path from project
                    rel_path=$(echo "$file_path" | sed "s|$PROJECT_DIR/||")
                    
                    if [ -f "$file_path" ]; then
                        echo "Restoring: $rel_path"
                        cp "$latest_file" "$file_path"
                        echo "✓ Restored $rel_path"
                    fi
                fi
            fi
        fi
    fi
done

echo "Restoration complete!"


