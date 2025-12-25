# Implementation Steps - Product Chatbot & Translation

## ✅ Step 1: Run Database Migrations

```bash
cd adminpanel/luna-api
php artisan migrate
```

This will create:
- `product_chatbot_queries` table
- `product_faqs` table
- `translations` table

## ✅ Step 2: API Endpoints Created

**Files Created:**
- ✅ `app/Http/Controllers/Api/ProductChatbotController.php`
- ✅ `app/Models/ProductChatbotQuery.php`
- ✅ `app/Models/ProductFaq.php`
- ✅ Routes added to `routes/api.php`

**Endpoints Available:**
- `POST /api/v1/chatbot/product-query` - Send product question
- `POST /api/v1/chatbot/chat-history` - Get chat history
- `POST /api/v1/chatbot/check-updates` - Check for new answers

## ✅ Step 3: Translation System Created

**Files Created:**
- ✅ `app/Services/TranslationService.php`
- ✅ `app/Http/Middleware/TranslateResponse.php`
- ✅ Middleware registered in `bootstrap/app.php`

**How it works:**
- All API responses are automatically translated based on `Accept-Language` header
- Translations cached in database for performance
- Supports English ↔ Arabic

## ✅ Step 4: Frontend Files Created

**Files Created:**
- ✅ `src/services/api.js` - Centralized API service with language support
- ✅ `src/screen/ProductChatBotScreen.js` - Product chatbot screen
- ✅ Screen added to navigation

## 📋 Step 5: Update Product Detail Screen

Add chatbot button to `ProductDetailScreen.js`:

```javascript
// Add this import
import { useNavigation } from '@react-navigation/native';

// In the component, add a button:
<TouchableOpacity
  style={styles.chatbotButton}
  onPress={() => navigation.navigate('ProductChatBot', { product: productData })}
>
  <Icon name="chatbubble-outline" size={20} color="#fff" />
  <Text style={styles.chatbotButtonText}>
    {i18n.language === 'ar' ? 'اسأل عن المنتج' : 'Ask About Product'}
  </Text>
</TouchableOpacity>
```

## 📋 Step 6: Add Screen to Navigation

The screen is already added to imports. Just ensure it's in the Stack:

```javascript
<Stack.Screen name="ProductChatBot" component={ProductChatBotScreen} />
```

## 📋 Step 7: Create Admin Panel Views

### **7.1 Admin Controller**

Create: `adminpanel/project/app/Http/Controllers/Admin/ProductChatbotAdminController.php`

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductChatbotAdminController extends Controller
{
    public function pendingQueries()
    {
        $queries = DB::table('product_chatbot_queries as q')
            ->join('users as u', 'q.user_id', '=', 'u.id')
            ->join('products as p', 'q.product_id', '=', 'p.id')
            ->where('q.status', 'pending')
            ->select('q.*', 'u.name as user_name', 'u.email', 'p.name as product_name')
            ->orderBy('q.created_at', 'desc')
            ->paginate(20);

        return view('admin.chatbot.pending', compact('queries'));
    }

    public function answerQuery(Request $request, $id)
    {
        $request->validate([
            'answer' => 'required|string|max:2000'
        ]);

        DB::table('product_chatbot_queries')
            ->where('id', $id)
            ->update([
                'answer' => $request->answer,
                'status' => 'answered',
                'answered_by' => auth('admin')->id(),
                'answered_at' => now()
            ]);

        return redirect()->back()->with('success', 'Answer sent successfully');
    }

    public function manageFaqs($productId = null)
    {
        $faqs = DB::table('product_faqs')
            ->where('product_id', $productId)
            ->orderBy('priority', 'desc')
            ->get();

        return view('admin.chatbot.faqs', compact('faqs', 'productId'));
    }

    public function saveFaq(Request $request)
    {
        $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'question' => 'required|string|max:500',
            'answer' => 'required|string|max:2000',
            'language' => 'required|in:en,ar',
            'priority' => 'nullable|integer|min:0|max:100'
        ]);

        DB::table('product_faqs')->insert([
            'product_id' => $request->product_id,
            'question' => $request->question,
            'answer' => $request->answer,
            'language' => $request->language,
            'priority' => $request->priority ?? 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return redirect()->back()->with('success', 'FAQ saved successfully');
    }
}
```

### **7.2 Admin Routes**

Add to `adminpanel/project/routes/web.php`:

```php
Route::prefix('admin')->group(function () {
    Route::get('/chatbot/pending', 'Admin\ProductChatbotAdminController@pendingQueries')
        ->name('admin-chatbot-pending');
    
    Route::post('/chatbot/answer/{id}', 'Admin\ProductChatbotAdminController@answerQuery')
        ->name('admin-chatbot-answer');
    
    Route::get('/chatbot/faqs/{productId?}', 'Admin\ProductChatbotAdminController@manageFaqs')
        ->name('admin-chatbot-faqs');
    
    Route::post('/chatbot/faq/save', 'Admin\ProductChatbotAdminController@saveFaq')
        ->name('admin-chatbot-faq-save');
});
```

### **7.3 Admin Views**

Create basic Blade templates in `adminpanel/project/resources/views/admin/chatbot/`:

- `pending.blade.php` - List pending queries
- `faqs.blade.php` - Manage FAQs

## 📋 Step 8: Update Existing API Calls

Replace all `axios` calls with the new API service:

**Before:**
```javascript
import axios from 'axios';
const response = await axios.post(url, data);
```

**After:**
```javascript
import api from '../services/api';
const response = await api.post(url, data);
```

**Files to Update:**
- `LoginScreen.js` - Use `apiHelpers.login()`
- `ProductDetailScreen.js` - Use `api` instead of `axios`
- `NewHome.js` - Use `api` instead of `axios`
- All other screens making API calls

## 📋 Step 9: Test Implementation

### **Test Chatbot:**
1. Open a product detail screen
2. Click "Ask About Product" button
3. Send a question
4. Check if auto-answer works (if FAQ exists)
5. Check if pending message is saved
6. Answer from admin panel
7. Check if user receives answer

### **Test Translation:**
1. Change app language to Arabic
2. Make API calls
3. Verify responses are translated
4. Check translation cache in database

## 🔧 Configuration

### **Environment Variables**

Add to `adminpanel/luna-api/.env`:

```env
# Optional: Google Translate API Key
GOOGLE_TRANSLATE_API_KEY=your_key_here
```

### **Config File**

Update `adminpanel/luna-api/config/services.php`:

```php
'google' => [
    'translate_key' => env('GOOGLE_TRANSLATE_API_KEY'),
],
```

## ✅ Summary

**Backend:**
- ✅ Migrations created
- ✅ Models created
- ✅ API Controller created
- ✅ Routes added
- ✅ Translation service created
- ✅ Translation middleware created

**Frontend:**
- ✅ API service created
- ✅ ProductChatBotScreen created
- ✅ Navigation updated

**Next Actions:**
- [ ] Run migrations
- [ ] Add chatbot button to ProductDetailScreen
- [ ] Create admin panel views
- [ ] Update existing API calls to use new service
- [ ] Test with English and Arabic

## 🚀 Quick Start Commands

```bash
# 1. Run migrations
cd adminpanel/luna-api
php artisan migrate

# 2. Seed some sample FAQs (optional)
php artisan tinker
>>> DB::table('product_faqs')->insert([
    'product_id' => 1,
    'question' => 'What is the size?',
    'answer' => 'This product comes in multiple sizes.',
    'language' => 'en',
    'priority' => 10,
    'is_active' => true
]);

# 3. Test API
curl -X POST http://localhost/api/v1/chatbot/product-query \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ar" \
  -d '{"user_id":1,"product_id":1,"question":"What is the size?","language":"en"}'
```

All implementation files are ready! 🎉




