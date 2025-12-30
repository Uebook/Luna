# Website Troubleshooting Guide - proteinbros.in

## Current Status
- Website returns **HTTP 500** error
- Admin login page returns **404** error
- Files have been created but site still not working

## Diagnostic Steps

### 1. Check Server Configuration

First, upload and access the diagnostic file:
- Upload `adminpanel/test.php` to the server
- Access: `https://proteinbros.in/test.php`
- This will show you the server configuration and paths

### 2. Verify Document Root

The server's document root should be set to one of these:

**Option A: Point to `adminpanel/` (Recommended)**
- Document root: `/path/to/adminpanel/`
- Uses root `index.php` which bootstraps Laravel from `project/`
- Root `.htaccess` routes all requests to `index.php`

**Option B: Point to `adminpanel/project/public/`**
- Document root: `/path/to/adminpanel/project/public/`
- Uses `project/public/index.php` directly
- Requires updating all asset paths

### 3. Check Required Files

Ensure these files exist on the server:
```
adminpanel/
├── .htaccess (root level)
├── index.php (root level)
├── test.php (diagnostic - can be removed after)
└── project/
    ├── .env (MUST EXIST - check this!)
    ├── vendor/ (composer dependencies)
    ├── bootstrap/
    │   └── app.php
    ├── storage/ (must be writable)
    └── public/
        ├── index.php
        └── .htaccess
```

### 4. Common Issues and Fixes

#### Issue: HTTP 500 Error
**Possible causes:**
- Missing `.env` file
- Incorrect file permissions
- PHP errors in bootstrap
- Missing Composer dependencies

**Fix:**
```bash
# Check if .env exists
ls -la adminpanel/project/.env

# If missing, copy from .env.example
cp adminpanel/project/.env.example adminpanel/project/.env

# Set permissions
chmod -R 755 adminpanel/project/storage
chmod -R 755 adminpanel/project/bootstrap/cache
chmod 644 adminpanel/project/.env

# Install dependencies
cd adminpanel/project
composer install --no-dev --optimize-autoloader
```

#### Issue: 404 Error
**Possible causes:**
- Document root pointing to wrong location
- `.htaccess` not being processed
- mod_rewrite not enabled

**Fix:**
```bash
# Check if mod_rewrite is enabled (Apache)
# In cPanel or server config, enable mod_rewrite

# Verify .htaccess is being read
# Add a test line to .htaccess and see if it works
```

#### Issue: Permission Errors
**Fix:**
```bash
# Set proper ownership (replace 'user' with your server user)
chown -R user:user adminpanel/project/storage
chown -R user:user adminpanel/project/bootstrap/cache

# Set permissions
find adminpanel/project/storage -type f -exec chmod 644 {} \;
find adminpanel/project/storage -type d -exec chmod 755 {} \;
```

### 5. Check Laravel Logs

Check for specific errors:
```bash
# View Laravel error log
tail -f adminpanel/project/storage/logs/laravel.log

# Or check latest errors
tail -n 50 adminpanel/project/storage/logs/laravel.log
```

### 6. Verify .env Configuration

The `.env` file must exist and have correct settings:
```env
APP_NAME=Luna
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://proteinbros.in

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**Important:** Generate app key if missing:
```bash
cd adminpanel/project
php artisan key:generate
```

### 7. Clear All Caches

```bash
cd adminpanel/project
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

### 8. Test Routes Directly

Try accessing these URLs to diagnose:
- `https://proteinbros.in/test.php` - Diagnostic script
- `https://proteinbros.in/index.php` - Should bootstrap Laravel
- `https://proteinbros.in/project/public/index.php` - Direct Laravel entry

### 9. Server-Specific Checks

#### For cPanel/Hosting:
1. Check "Error Log" in cPanel
2. Verify PHP version (should be 7.4+ or 8.0+)
3. Check "Select PHP Version" - ensure required extensions are enabled
4. Verify mod_rewrite is enabled

#### For Apache:
```bash
# Check if mod_rewrite is enabled
apache2ctl -M | grep rewrite

# If not enabled, enable it
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### For Nginx:
You need to configure Nginx to route to `index.php`. The `.htaccess` file won't work with Nginx.

### 10. Alternative: Use project/public as Document Root

If the root approach doesn't work, configure server to point directly to `project/public/`:

1. Set document root to: `adminpanel/project/public/`
2. Update asset paths in Laravel config if needed
3. Remove root `index.php` and `.htaccess` (or keep them for API)

## Next Steps

1. **Upload test.php** and check the output
2. **Check server error logs** for specific PHP errors
3. **Verify .env file** exists and is configured
4. **Check file permissions** on storage and cache directories
5. **Verify Composer dependencies** are installed
6. **Check Laravel logs** for detailed error messages

## Contact Information

If issues persist after following these steps, provide:
- Output from `test.php`
- Server error log entries
- Laravel log entries
- Server type (cPanel, VPS, etc.)
- PHP version

