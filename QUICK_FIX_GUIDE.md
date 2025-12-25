# 🔧 QUICK FIX GUIDE
## Fix All Warnings Before Production

### 1. Install Missing Dependency

```bash
cd adminpanel/luna-api
composer require intervention/image
```

This package is required for the Image Search API to process uploaded images.

---

### 2. Set Environment Variables

Add to `adminpanel/luna-api/.env`:

```env
# Agora Configuration (REQUIRED for production)
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_certificate_here

# Google Translate (OPTIONAL)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key_here
```

**How to get Agora credentials:**
1. Sign up at https://www.agora.io/
2. Create a new project
3. Get App ID and App Certificate from dashboard

---

### 3. Run Database Migrations

```bash
cd adminpanel/luna-api
php artisan migrate
```

Or use the SQL files:
- `database/migrations/all_tables_one_line.sql`
- `database/migrations/all_new_tables_one_line.sql`

---

### 4. Clear Cache

```bash
cd adminpanel/luna-api
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

### 5. Verify File Permissions

```bash
# Make sure storage is writable
chmod -R 775 adminpanel/luna-api/storage
chmod -R 775 adminpanel/luna-api/bootstrap/cache
```

---

### 6. Test Image Upload

After installing `intervention/image`, test the image search:

```bash
curl -X POST https://your-domain.com/api/v1/image-search/search \
  -F "image=@/path/to/test-image.jpg" \
  -H "Accept-Language: en"
```

---

### 7. Test Agora Token Generation

```bash
curl -X POST https://your-domain.com/api/v1/stream/agora-token \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "channelName": "test-channel",
    "role": "broadcaster"
  }'
```

---

## ✅ Verification Checklist

After applying fixes, verify:

- [ ] `intervention/image` package installed
- [ ] Agora credentials set in `.env`
- [ ] Database migrations run successfully
- [ ] Cache cleared
- [ ] File permissions correct
- [ ] Image upload works
- [ ] Agora token generation works
- [ ] All API endpoints respond correctly

---

## 🐛 Troubleshooting

### Issue: Image processing fails
**Solution**: Make sure `intervention/image` is installed and `storage/app/public` is writable.

### Issue: Agora token generation fails
**Solution**: Verify `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` are set correctly in `.env`.

### Issue: Database errors
**Solution**: Run migrations again: `php artisan migrate:fresh` (WARNING: This will drop all tables)

### Issue: Routes not found
**Solution**: Clear route cache: `php artisan route:clear`

---

**All fixes should take less than 10 minutes!** ⚡




