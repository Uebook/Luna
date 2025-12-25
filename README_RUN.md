# 🚀 HOW TO RUN THE APP

## Quick Start

### 1. Run Setup Script (Easiest)
```bash
./START_APP.sh
```

This will check prerequisites, install dependencies, and guide you through the setup.

---

## Manual Setup

### Backend API Setup

1. **Navigate to backend directory**:
   ```bash
   cd adminpanel/luna-api
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Setup environment**:
   ```bash
   # Copy .env.example to .env if not exists
   cp .env.example .env
   
   # Generate app key
   php artisan key:generate
   ```

4. **Configure database in `.env`**:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=luna_db
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. **Run migrations**:
   ```bash
   php artisan migrate
   ```

6. **Start server**:
   ```bash
   php artisan serve
   ```
   
   Server will run on: `http://localhost:8000`

---

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Metro bundler**:
   ```bash
   npm start
   ```

3. **Run on device** (in a new terminal):
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

---

## Using Helper Scripts

### Start Backend Only
```bash
./RUN_BACKEND.sh
```

### Start Frontend Only
```bash
./RUN_FRONTEND.sh
```

---

## What's Fixed

✅ **Image Search** - Now uses native PHP GD (no external package needed)  
✅ **Missing Imports** - All imports fixed  
✅ **Startup Scripts** - Created for easy setup  

---

## API Endpoints

Once backend is running, test these:

- **Cart**: `POST http://localhost:8000/api/v1/cart/get`
- **Address**: `POST http://localhost:8000/api/v1/address/list`
- **Notifications**: `POST http://localhost:8000/api/v1/notification/list`
- **Chat**: `POST http://localhost:8000/api/v1/chat/history`
- **Image Search**: `POST http://localhost:8000/api/v1/image-search/search`
- **Live Stream**: `POST http://localhost:8000/api/v1/stream/list`

---

## Troubleshooting

### Backend Issues

**Problem**: `composer install` fails
**Solution**: Make sure PHP 8.2+ is installed

**Problem**: Migration fails
**Solution**: Check database credentials in `.env`

**Problem**: Route not found
**Solution**: Run `php artisan route:clear`

### Frontend Issues

**Problem**: `npm install` fails
**Solution**: Make sure Node.js 18+ is installed

**Problem**: Metro bundler won't start
**Solution**: Clear cache: `npm start -- --reset-cache`

**Problem**: App crashes on device
**Solution**: Check API base URL in `src/services/api.js`

---

## Next Steps

1. ✅ Run setup script or manual setup
2. ✅ Start backend server
3. ✅ Start frontend Metro bundler
4. ✅ Run on device/emulator
5. ✅ Test all features!

---

**Status**: ✅ **READY TO RUN**

All fixes applied. No missing dependencies!




