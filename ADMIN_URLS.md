# 🔐 Admin Panel URLs

## Admin Login URL

### Main Admin Panel (Production)
```
https://proteinbros.in/admin/login
```
**Note**: Do NOT include `/public/` in the URL. The document root is already configured.

### Alternative Domain (if configured):
```
https://luna-api.proteinbros.in/admin/login
```
**Note**: Only use `/public/` if your server's document root is specifically set to the `public` subdirectory.

### Local Development:
```
http://localhost:8000/admin/login
```

### Troubleshooting 404 Errors:
- ❌ **Wrong**: `https://proteinbros.in/public/admin/login` (404 - `/public/` should not be in URL)
- ✅ **Correct**: `https://proteinbros.in/admin/login`

**If you still get 404, check the following:**

1. **Server Document Root Configuration**
   - The web server's document root must point to the `adminpanel/` directory
   - The `index.php` file should be at: `adminpanel/index.php`
   - Verify this in your web server configuration (Apache/Nginx)

2. **`.htaccess` File (Apache)**
   - A `.htaccess` file has been created at `adminpanel/.htaccess`
   - Ensure `mod_rewrite` is enabled on your Apache server
   - For Nginx, you'll need to configure URL rewriting in the server block

3. **Laravel Routes**
   - Routes are defined in `adminpanel/project/routes/web.php`
   - Verify the route exists: `Route::get('/login', ...)` inside `Route::prefix('admin')->group(...)`

4. **File Permissions**
   - Ensure `adminpanel/` directory has proper read permissions
   - Storage directories need write permissions: `adminpanel/project/storage/`

5. **PHP Configuration**
   - Ensure PHP is properly installed and configured
   - Check PHP error logs for any runtime errors

---

## All Admin URLs

### Authentication
- **Login**: `/admin/login`
- **Logout**: `/admin/logout`
- **Forgot Password**: `/admin/forgot`
- **Change Password**: `/admin/change-password/{token}`

### Dashboard
- **Dashboard**: `/admin/` or `/admin/dashboard`

### Live Stream Management
- **List Streams**: `/admin/livestream`
- **Stream Details**: `/admin/livestream/{id}/show`
- **Manage Products**: `/admin/livestream/{id}/products`
- **End Stream**: `/admin/livestream/{id}/end`

**Note**: Live Stream routes require `permissions:products` middleware. If you get a 500 error:
1. Check that the `live_streams` table exists in the database
2. Verify the `LiveStream` model exists and is properly configured
3. Check server error logs for specific error messages
4. Ensure the admin user has the required permissions

### Celebrity Admin Panel
- **Login**: `/celebrity/login`
- **Dashboard**: `/celebrity/dashboard`
- **Products**: `/celebrity/products`

---

## Quick Access

### For Production:
```
https://your-domain.com/admin/login
```

### For Local Development:
1. Start Laravel server:
   ```bash
   cd adminpanel/project
   php artisan serve
   ```

2. Access:
   ```
   http://localhost:8000/admin/login
   ```

---

## Default Admin Credentials

Check your database `admins` table or `.env` file for default credentials.

To create an admin user:
```bash
cd adminpanel/project
php artisan tinker
```
Then:
```php
$admin = new App\Models\Admin();
$admin->name = 'Admin';
$admin->email = 'admin@example.com';
$admin->password = Hash::make('password');
$admin->save();
```

---

## Celebrity Login URL

### Production:
```
https://proteinbros.in/celebrity/login
```
**Note**: Do NOT include double slashes (`//`) in the URL. Use single slash only.

### Local Development:
```
http://localhost:8000/celebrity/login
```

### Celebrity Login Requirements:
- User must have `is_provider = 1` in the `users` table
- Email and password must match a celebrity/vendor account
- After login, redirects to `/celebrity/dashboard`

---

## Server Configuration

### Apache Configuration
The `.htaccess` file has been created at `adminpanel/.htaccess`. Ensure:
- `mod_rewrite` is enabled: `sudo a2enmod rewrite`
- Apache is configured to allow `.htaccess` overrides
- Document root points to `adminpanel/` directory

### Nginx Configuration
If using Nginx, add this to your server block:
```nginx
server {
    listen 80;
    server_name proteinbros.in;
    root /path/to/adminpanel;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

---

**Note**: Replace `your-domain.com` with your actual domain name.

