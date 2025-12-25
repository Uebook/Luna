# 🚀 Admin Panel Deployment Guide

## Security Warning ⚠️

**DO NOT share FTP credentials in chat!** Instead, use one of these secure methods:

## Method 1: Environment Variables (Recommended)

Set credentials as environment variables:

```bash
# Set credentials
export FTP_HOST=your-ftp-host.com
export FTP_USER=your-username
export FTP_PASS=your-password
export FTP_REMOTE_DIR=/adminpanel/project

# Run deployment script
./DEPLOY_ADMIN_PANEL.sh
```

## Method 2: Direct Command Line

```bash
FTP_HOST=host.com FTP_USER=user FTP_PASS=pass ./DEPLOY_ADMIN_PANEL.sh
```

## Method 3: Python Script (Most Flexible)

```bash
# Install required library (if not already installed)
pip3 install --upgrade pip

# Set credentials
export FTP_HOST=your-ftp-host.com
export FTP_USER=your-username
export FTP_PASS=your-password

# Run Python script
python3 DEPLOY_ADMIN_PANEL_PYTHON.py
```

## Method 4: SFTP/SSH (Most Secure)

If you have SSH access, use SFTP:

```bash
# Set credentials
export SFTP_HOST=your-server.com
export SFTP_USER=your-username
export SFTP_KEY=/path/to/ssh/key  # Optional

# Run SFTP script
./DEPLOY_ADMIN_PANEL_SFTP.sh
```

## What Gets Deployed

The scripts will upload:
- ✅ All PHP files
- ✅ All Blade templates
- ✅ Configuration files
- ✅ Assets (CSS, JS, images)

The scripts will **exclude**:
- ❌ `.git/` directory
- ❌ `node_modules/`
- ❌ `vendor/` (you should run `composer install` on server)
- ❌ `.env` file (keep your production .env)
- ❌ `storage/logs/`

## After Deployment

1. **SSH into your server** (if possible)
2. **Run composer install** (if vendor was excluded):
   ```bash
   cd /path/to/adminpanel/project
   composer install --no-dev --optimize-autoloader
   ```
3. **Set proper permissions**:
   ```bash
   chmod -R 755 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```
4. **Clear cache**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan view:clear
   ```

## Troubleshooting

### "lftp not found"
Install lftp:
- macOS: `brew install lftp`
- Linux: `apt-get install lftp` or `yum install lftp`

### "rsync not found"
Install rsync:
- macOS: `brew install rsync`
- Linux: `apt-get install rsync`

### Connection Timeout
- Check firewall settings
- Verify FTP host and port (default is 21)
- Try passive mode: Add `set ftp:passive-mode true` for lftp

### Permission Denied
- Ensure remote directory exists
- Check FTP user permissions
- Verify write permissions on remote directory

## Manual Deployment Alternative

If scripts don't work, you can:

1. **Create a zip file**:
   ```bash
   cd adminpanel/project
   zip -r ../adminpanel_deploy.zip . -x "*.git*" -x "*node_modules*" -x "*.env"
   ```

2. **Upload via FTP client** (FileZilla, Cyberduck, etc.)

3. **Extract on server** via SSH or cPanel

## Questions?

If you need help with deployment, you can:
1. Share your deployment method preference
2. Let me know if you encounter any errors
3. Ask for a custom deployment script for your specific setup



