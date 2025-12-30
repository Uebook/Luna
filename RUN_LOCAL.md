# Running Website Locally

## Quick Start

### Option 1: Using PHP Built-in Server (Easiest)

```bash
# Navigate to project directory
cd adminpanel/project

# Install dependencies (if not already installed)
composer install

# Copy .env file (if doesn't exist)
cp .env.local .env

# Generate app key
php artisan key:generate

# Clear and cache config
php artisan config:clear
php artisan cache:clear

# Start server
php artisan serve
```

Then access:
- Homepage: http://localhost:8000
- Admin Login: http://localhost:8000/admin/login

### Option 2: Using Root index.php (Testing Production Setup)

```bash
# Navigate to adminpanel root
cd adminpanel

# Start PHP server pointing to root
php -S localhost:8000 -t .
```

Then access:
- Homepage: http://localhost:8000
- Admin Login: http://localhost:8000/admin/login

## Setup Steps

### 1. Install Dependencies
```bash
cd adminpanel/project
composer install
```

### 2. Configure Environment
```bash
# Copy .env.local to .env
cp .env.local .env

# Or create .env manually with your database settings
```

### 3. Generate Application Key
```bash
php artisan key:generate
```

### 4. Set Permissions (if needed)
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### 5. Clear Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 6. Start Server

**Option A: Laravel's built-in server (Recommended)**
```bash
cd adminpanel/project
php artisan serve
# Server runs on http://localhost:8000
```

**Option B: PHP built-in server from project root**
```bash
cd adminpanel/project/public
php -S localhost:8000
# Server runs on http://localhost:8000
```

**Option C: PHP built-in server from adminpanel root (Testing production setup)**
```bash
cd adminpanel
php -S localhost:8000 -t .
# Server runs on http://localhost:8000
```

## Database Setup (Optional for Testing Routes)

If you need database:
```bash
# For SQLite (easiest for local testing)
touch database/database.sqlite
php artisan migrate

# Or configure MySQL in .env and run:
php artisan migrate
```

## Troubleshooting

### Error: "Class not found"
- Run: `composer install` or `composer dump-autoload`

### Error: "APP_KEY not set"
- Run: `php artisan key:generate`

### Error: "Storage not writable"
- Run: `chmod -R 755 storage bootstrap/cache`

### Routes not working
- Clear route cache: `php artisan route:clear`
- Check routes: `php artisan route:list`

### 500 Error
- Check logs: `tail -f storage/logs/laravel.log`
- Enable debug: Set `APP_DEBUG=true` in `.env`

## Testing Routes

After starting server, test these URLs:
- http://localhost:8000 - Homepage
- http://localhost:8000/admin/login - Admin login
- http://localhost:8000/test.php - Diagnostic (if using root setup)

## Stop Server

Press `Ctrl+C` in the terminal where server is running.

