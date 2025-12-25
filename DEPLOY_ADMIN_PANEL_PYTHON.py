#!/usr/bin/env python3
"""
Admin Panel FTP Deployment Script (Python)
Usage: python3 DEPLOY_ADMIN_PANEL_PYTHON.py
"""

import os
import sys
import ftplib
from pathlib import Path

# Configuration
FTP_HOST = os.getenv('FTP_HOST', '')
FTP_USER = os.getenv('FTP_USER', '')
FTP_PASS = os.getenv('FTP_PASS', '')
FTP_REMOTE_DIR = os.getenv('FTP_REMOTE_DIR', '/adminpanel/project')
LOCAL_DIR = Path('./adminpanel/project')

# Directories to exclude
EXCLUDE_DIRS = {'.git', 'node_modules', 'vendor', 'storage/logs', '__pycache__'}
EXCLUDE_FILES = {'.env', '.env.example', '.gitignore'}

def should_exclude(path):
    """Check if path should be excluded"""
    parts = Path(path).parts
    return any(excluded in parts for excluded in EXCLUDE_DIRS) or path.name in EXCLUDE_FILES

def upload_file(ftp, local_path, remote_path):
    """Upload a single file"""
    try:
        with open(local_path, 'rb') as file:
            ftp.storbinary(f'STOR {remote_path}', file)
        print(f"✅ Uploaded: {remote_path}")
        return True
    except Exception as e:
        print(f"❌ Error uploading {remote_path}: {e}")
        return False

def upload_directory(ftp, local_dir, remote_dir):
    """Recursively upload directory"""
    local_path = Path(local_dir)
    
    # Ensure remote directory exists
    try:
        ftp.mkd(remote_dir)
        print(f"📁 Created directory: {remote_dir}")
    except ftplib.error_perm:
        pass  # Directory already exists
    
    # Change to remote directory
    ftp.cwd(remote_dir)
    
    uploaded = 0
    failed = 0
    
    # Walk through local directory
    for root, dirs, files in os.walk(local_dir):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d))]
        
        # Get relative path
        rel_root = os.path.relpath(root, local_dir)
        
        # Create subdirectories
        if rel_root != '.':
            remote_subdir = os.path.join(remote_dir, rel_root).replace('\\', '/')
            try:
                ftp.mkd(remote_subdir)
            except ftplib.error_perm:
                pass
            ftp.cwd(remote_subdir)
        else:
            ftp.cwd(remote_dir)
        
        # Upload files
        for file in files:
            local_file = os.path.join(root, file)
            if not should_exclude(local_file):
                remote_file = file
                if rel_root != '.':
                    remote_file = os.path.join(rel_root, file).replace('\\', '/')
                
                current_remote = ftp.pwd()
                if upload_file(ftp, local_file, remote_file):
                    uploaded += 1
                else:
                    failed += 1
                ftp.cwd(current_remote)
    
    return uploaded, failed

def main():
    print("🚀 Admin Panel FTP Deployment Script")
    print("=" * 40)
    print()
    
    # Check credentials
    if not all([FTP_HOST, FTP_USER, FTP_PASS]):
        print("❌ Error: FTP credentials not set!")
        print()
        print("Please set environment variables:")
        print("  export FTP_HOST=your-ftp-host.com")
        print("  export FTP_USER=your-username")
        print("  export FTP_PASS=your-password")
        print("  export FTP_REMOTE_DIR=/adminpanel/project  (optional)")
        sys.exit(1)
    
    # Check local directory
    if not LOCAL_DIR.exists():
        print(f"❌ Error: Local directory not found: {LOCAL_DIR}")
        sys.exit(1)
    
    print(f"📁 Local Directory: {LOCAL_DIR}")
    print(f"🌐 FTP Host: {FTP_HOST}")
    print(f"👤 FTP User: {FTP_USER}")
    print(f"📂 Remote Directory: {FTP_REMOTE_DIR}")
    print()
    
    response = input("Continue with deployment? (y/n): ")
    if response.lower() != 'y':
        print("Deployment cancelled.")
        sys.exit(0)
    
    print()
    print("📤 Connecting to FTP server...")
    
    try:
        # Connect to FTP server
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Connected successfully!")
        print()
        
        # Change to remote directory
        try:
            ftp.cwd(FTP_REMOTE_DIR)
        except ftplib.error_perm:
            print(f"📁 Creating remote directory: {FTP_REMOTE_DIR}")
            # Try to create directory structure
            parts = FTP_REMOTE_DIR.strip('/').split('/')
            current = ''
            for part in parts:
                current += '/' + part
                try:
                    ftp.mkd(current)
                except ftplib.error_perm:
                    pass
            ftp.cwd(FTP_REMOTE_DIR)
        
        print("📤 Starting upload...")
        print()
        
        # Upload files
        uploaded, failed = upload_directory(ftp, str(LOCAL_DIR), FTP_REMOTE_DIR)
        
        # Close connection
        ftp.quit()
        
        print()
        print("=" * 40)
        print(f"✅ Upload complete!")
        print(f"   Uploaded: {uploaded} files")
        if failed > 0:
            print(f"   Failed: {failed} files")
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()



