# Quick Start Guide - Product Chatbot & Translation

## 🚀 Implementation Complete!

All files have been created. Follow these steps to get everything running:

---

## Step 1: Run Database Migrations

```bash
cd adminpanel/luna-api
php artisan migrate
```

This creates:
- ✅ `product_chatbot_queries` table
- ✅ `product_faqs` table  
- ✅ `translations` table

---

## Step 2: Test the API

### Test Chatbot Endpoint:
```bash
curl -X POST http://your-domain.com/api/v1/chatbot/product-query \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "user_id": 1,
    "product_id": 1,
    "question": "What is the size?",
    "language": "en"
  }'
```

### Test Translation:
```bash
curl -X POST http://your-domain.com/api/v1/screen/home \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ar" \
  -d '{}'
```

---

## Step 3: Add Sample FAQ (Optional)

```bash
cd adminpanel/luna-api
php artisan tinker
```

```php
DB::table('product_faqs')->insert([
    'product_id' => 1, // Your product ID
    'question' => 'What is the size?',
    'answer' => 'This product comes in sizes S, M, L, and XL.',
    'language' => 'en',
    'priority' => 10,
    'is_active' => true,
    'created_at' => now(),
    'updated_at' => now()
]);

// Arabic version
DB::table('product_faqs')->insert([
    'product_id' => 1,
    'question' => 'ما هو الحجم؟',
    'answer' => 'هذا المنتج متوفر بمقاسات S و M و L و XL.',
    'language' => 'ar',
    'priority' => 10,
    'is_active' => true,
    'created_at' => now(),
    'updated_at' => now()
]);
```

---

## Step 4: Test in React Native App

1. **Open Product Detail Screen**
2. **Click "Ask About Product" button** (new button added)
3. **Send a question**
4. **Check if auto-answer works** (if FAQ exists)
5. **Check if pending message is saved** (if no FAQ match)

---

## Step 5: Admin Panel Setup

### Add Routes to Admin Panel

Add to `adminpanel/project/routes/web.php`:

```php
Route::prefix('admin')->group(function () {
    // ... existing routes ...
    
    Route::get('/chatbot/pending', function() {
        $queries = DB::table('product_chatbot_queries as q')
            ->join('users as u', 'q.user_id', '=', 'u.id')
            ->join('products as p', 'q.product_id', '=', 'p.id')
            ->where('q.status', 'pending')
            ->select('q.*', 'u.name as user_name', 'p.name as product_name')
            ->orderBy('q.created_at', 'desc')
            ->get();
        
        return view('admin.chatbot.pending', compact('queries'));
    })->name('admin-chatbot-pending');
    
    Route::post('/chatbot/answer/{id}', function(Request $request, $id) {
        DB::table('product_chatbot_queries')
            ->where('id', $id)
            ->update([
                'answer' => $request->answer,
                'status' => 'answered',
                'answered_by' => auth('admin')->id(),
                'answered_at' => now()
            ]);
        
        return redirect()->back()->with('success', 'Answer sent');
    })->name('admin-chatbot-answer');
});
```

---

## Step 6: Update Existing API Calls

Replace `axios` with new `api` service in these files:

### Files to Update:
1. `src/screen/LoginScreen.js`
2. `src/screen/NewHome.js`
3. `src/screen/ProductDetailScreen.js`
4. `src/screen/CelebritiesScreen.js`
5. All other screens using `axios`

### Example Update:

**Before:**
```javascript
import axios from 'axios';
const response = await axios.post(url, data);
```

**After:**
```javascript
import api from '../services/api';
const response = await api.post(url, data);
// Language header automatically added!
```

---

## Step 7: Environment Configuration

### Backend (.env)

Add to `adminpanel/luna-api/.env`:

```env
# Optional: Google Translate API Key
GOOGLE_TRANSLATE_API_KEY=your_google_api_key_here
```

**Note:** Translation will work without Google API key - it will use database translations only.

---

## ✅ Testing Checklist

### Chatbot:
- [ ] User can open chatbot from product detail
- [ ] User can send questions
- [ ] Auto-answer works if FAQ exists
- [ ] Pending status shown if no FAQ match
- [ ] Admin can see pending queries
- [ ] Admin can answer queries
- [ ] User receives answer (polling works)
- [ ] Chat history loads correctly

### Translation:
- [ ] API responses translated in Arabic
- [ ] API responses in English when language is English
- [ ] Translations cached in database
- [ ] Language header sent in all requests
- [ ] Language change refreshes data

---

## 🐛 Troubleshooting

### Migration Fails:
```bash
# Check if tables already exist
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback
```

### API Not Working:
- Check routes are registered: `php artisan route:list | grep chatbot`
- Check controller exists
- Check database connection

### Translation Not Working:
- Check middleware is registered in `bootstrap/app.php`
- Check `Accept-Language` header is being sent
- Check translation service is working

### Frontend Errors:
- Check `api.js` is imported correctly
- Check navigation route is added
- Check product data is passed correctly

---

## 📝 Next Steps

1. ✅ Run migrations
2. ✅ Test API endpoints
3. ✅ Add chatbot button to ProductDetailScreen (already done)
4. ✅ Create admin panel views
5. ✅ Update all axios calls to use new api service
6. ✅ Test with English and Arabic
7. ✅ Add more FAQs for better auto-answers

---

## 🎉 Success!

Once all steps are complete:
- ✅ Product chatbot fully functional
- ✅ Auto-answers from FAQ
- ✅ Admin escalation working
- ✅ All API responses translated
- ✅ Multi-language support (EN/AR)

**All implementation files are ready to use!** 🚀




