# Website Fix Guide - proteinbros.in

## Issues Identified

1. **HTTP 404 Error** - The website is returning a 404 error for all routes
2. **Missing Public Directory Files** - The `adminpanel/project/public/` directory was empty
3. **Server Routing** - Requests are not being routed through Laravel properly
4. **Admin Panel Route** - The route exists in code (`/admin/login`) but is not accessible

## Current Structure

```
adminpanel/
├── index.php (points to project/)
├── project/
│   ├── routes/web.php (has /admin/login route)
│   ├── public/ (EMPTY - this is the problem!)
│   └── ...
└── luna-api/ (API for mobile app)
```

## Required Fixes

### 1. Create Missing Public Directory Files

The `adminpanel/project/public/` directory needs:
- `index.php` - Laravel entry point
- `.htaccess` - URL rewriting rules
- `robots.txt` (optional)
- Asset directories if needed

### 2. Create .htaccess File

Create `adminpanel/project/public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 3. Create index.php File

Create `adminpanel/project/public/index.php`:

```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
|
| If the application is in maintenance / demo mode via the "down" command
| we will load this file so that any pre-rendered content can be shown
| instead of starting the framework, which could cause an exception.
|
*/

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| this application. We just need to utilize it! We'll simply require it
| into the script here so we don't need to manually load our classes.
|
*/

require __DIR__.'/../vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

### 4. Root .htaccess File

I've created `adminpanel/.htaccess` that routes all requests through the root `index.php` file, which then bootstraps Laravel from the `project/` directory.

### 5. Server Configuration

The web server needs to be configured to:
- Point the document root to `adminpanel/` (the root directory)
- The root `index.php` will bootstrap Laravel from `project/`
- OR alternatively, point document root to `adminpanel/project/public/` and update paths accordingly

### 5. Check Server Logs

Check the server error logs for specific PHP errors:
- `/var/log/apache2/error.log` (Apache)
- `/var/log/nginx/error.log` (Nginx)
- Or check Laravel logs: `adminpanel/project/storage/logs/laravel.log`

## Deployment Steps

1. **Upload the missing files** to the server:
   - `adminpanel/project/public/index.php`
   - `adminpanel/project/public/.htaccess`
   - `adminpanel/.htaccess` (root level)

2. **Set proper permissions**:
   ```bash
   chmod -R 755 adminpanel/project/storage
   chmod -R 755 adminpanel/project/bootstrap/cache
   chmod 644 adminpanel/.htaccess
   chmod 644 adminpanel/project/public/.htaccess
   chmod 644 adminpanel/project/public/index.php
   ```

3. **Check environment file** - Ensure `adminpanel/project/.env` exists and is configured with:
   - `APP_URL=https://proteinbros.in`
   - Database credentials
   - Other required settings

4. **Clear cache** (run from `adminpanel/project/` directory):
   ```bash
   cd adminpanel/project
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   php artisan route:cache  # Cache routes for better performance
   ```

5. **Verify server configuration**:
   - Document root should point to `adminpanel/` (where root `index.php` is)
   - OR point to `adminpanel/project/public/` if using that approach
   - Ensure mod_rewrite is enabled in Apache

## Quick Test

After fixes, test:
- `https://proteinbros.in` - Should show homepage
- `https://proteinbros.in/admin/login` - Should show admin login page

## Alternative: Use Root index.php

If you want to keep using the root `adminpanel/index.php`, ensure:
1. The document root points to `adminpanel/`
2. The `index.php` correctly references `project/` paths
3. All paths in `index.php` are correct

