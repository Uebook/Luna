# Login & Language Translation Implementation Guide

## 🔐 Login Implementation

### **Current Status**
Login is already implemented in `LoginScreen.js` with:
- Email/Phone login
- OTP verification
- User storage in Zustand + AsyncStorage

### **Improvements Needed**

#### **1. Enhanced Login with Language Support**

Update `LoginScreen.js` to save user language preference:

```javascript
// After successful login
const handleLogin = async () => {
  // ... existing code ...
  
  if (res?.data?.status && res.data.user) {
    setUser(res.data.user);
    await saveUserToStorage(res.data);
    
    // Save user language preference
    const userLang = res.data.user.language || i18n.language || 'en';
    await i18n.changeLanguage(userLang);
    await AsyncStorage.setItem('@app_lang', userLang);
    
    showAlert('success', 'Login successful!');
    navigation.replace('MainApp');
  }
};
```

#### **2. API Integration for Login**

The login API already exists at `/v1/auth/login`. Ensure it returns:
```json
{
  "status": true,
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "language": "en",  // or "ar"
    "currency": "USD"
  }
}
```

---

## 🌍 Language Translation Logic for API Responses

### **Problem**
All API responses come in one language. Need to automatically translate based on user's selected language (English/Arabic).

### **Solution: Backend Translation Middleware**

#### **1. Create Translation Service**

```php
<?php
// app/Services/TranslationService.php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class TranslationService
{
    private $defaultLang = 'en';
    private $supportedLangs = ['en', 'ar'];

    /**
     * Translate API response based on user language
     */
    public function translateResponse($data, $targetLang = 'en')
    {
        if ($targetLang === 'en' || !in_array($targetLang, $this->supportedLangs)) {
            return $data;
        }

        // If data is array, translate recursively
        if (is_array($data)) {
            return $this->translateArray($data, $targetLang);
        }

        return $data;
    }

    /**
     * Translate array recursively
     */
    private function translateArray($array, $targetLang)
    {
        $translated = [];

        foreach ($array as $key => $value) {
            // Fields that need translation
            $translatableFields = [
                'name', 'title', 'description', 'text', 'message',
                'category_name', 'brand_name', 'product_name',
                'status', 'error', 'label'
            ];

            if (in_array($key, $translatableFields) && is_string($value)) {
                $translated[$key] = $this->translateText($value, $targetLang);
            } elseif (is_array($value)) {
                $translated[$key] = $this->translateArray($value, $targetLang);
            } else {
                $translated[$key] = $value;
            }
        }

        return $translated;
    }

    /**
     * Translate single text
     */
    private function translateText($text, $targetLang)
    {
        if (empty($text) || $targetLang === 'en') {
            return $text;
        }

        // Check cache first
        $cacheKey = "translation_{$targetLang}_" . md5($text);
        $cached = Cache::get($cacheKey);
        
        if ($cached !== null) {
            return $cached;
        }

        // Check database translations first
        $dbTranslation = $this->getDatabaseTranslation($text, $targetLang);
        if ($dbTranslation) {
            Cache::put($cacheKey, $dbTranslation, now()->addDays(30));
            return $dbTranslation;
        }

        // Use Google Translate API (or your preferred service)
        $translated = $this->translateWithGoogle($text, $targetLang);
        
        if ($translated) {
            // Save to database for future use
            $this->saveTranslation($text, $targetLang, $translated);
            Cache::put($cacheKey, $translated, now()->addDays(30));
        }

        return $translated ?: $text; // Fallback to original if translation fails
    }

    /**
     * Get translation from database
     */
    private function getDatabaseTranslation($text, $targetLang)
    {
        return DB::table('translations')
            ->where('source_text', $text)
            ->where('target_language', $targetLang)
            ->value('translated_text');
    }

    /**
     * Save translation to database
     */
    private function saveTranslation($sourceText, $targetLang, $translatedText)
    {
        DB::table('translations')->insertOrIgnore([
            'source_text' => $sourceText,
            'target_language' => $targetLang,
            'translated_text' => $translatedText,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Translate using Google Translate API
     */
    private function translateWithGoogle($text, $targetLang)
    {
        try {
            $apiKey = config('services.google.translate_key');
            if (!$apiKey) {
                return null;
            }

            $response = Http::post('https://translation.googleapis.com/language/translate/v2', [
                'key' => $apiKey,
                'q' => $text,
                'target' => $targetLang,
                'source' => 'en'
            ]);

            if ($response->successful()) {
                return $response->json('data.translations.0.translatedText');
            }
        } catch (\Exception $e) {
            \Log::error('Translation error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Batch translate multiple texts
     */
    public function translateBatch(array $texts, $targetLang)
    {
        $translated = [];
        
        foreach ($texts as $text) {
            $translated[] = $this->translateText($text, $targetLang);
        }

        return $translated;
    }
}
```

#### **2. Create Translation Middleware**

```php
<?php
// app/Http/Middleware/TranslateResponse.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\TranslationService;

class TranslateResponse
{
    protected $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Handle an incoming request and translate response
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Get target language from request
        $targetLang = $request->header('Accept-Language', 'en');
        $targetLang = strtolower(substr($targetLang, 0, 2)); // Extract 'en' or 'ar'
        
        // Also check user's saved language preference
        if ($request->user()) {
            $targetLang = $request->user()->language ?? $targetLang;
        }

        // Only translate if not English
        if ($targetLang !== 'en' && $response->getStatusCode() === 200) {
            $content = $response->getContent();
            $data = json_decode($content, true);

            if (is_array($data)) {
                $translated = $this->translationService->translateResponse($data, $targetLang);
                $response->setContent(json_encode($translated));
            }
        }

        return $response;
    }
}
```

#### **3. Register Middleware**

```php
// app/Http/Kernel.php

protected $middlewareGroups = [
    'api' => [
        // ... other middleware
        \App\Http\Middleware\TranslateResponse::class,
    ],
];
```

#### **4. Create Translations Table**

```bash
php artisan make:migration create_translations_table
```

```php
<?php
// database/migrations/xxxx_create_translations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->text('source_text'); // Original English text
            $table->string('target_language', 10); // 'ar'
            $table->text('translated_text'); // Translated text
            $table->integer('usage_count')->default(0);
            $table->timestamps();

            $table->unique(['source_text', 'target_language']);
            $table->index('target_language');
        });
    }

    public function down()
    {
        Schema::dropIfExists('translations');
    }
};
```

#### **5. Update API Controllers to Accept Language**

```php
<?php
// app/Http/Controllers/Api/HomeController.php

public function homeData(Request $request)
{
    // Get language from request
    $language = $request->header('Accept-Language', 'en');
    $language = strtolower(substr($language, 0, 2));
    
    // ... existing code ...
    
    // The middleware will automatically translate the response
    return response()->json([
        'status' => true,
        'message' => 'Data fetched successfully.',
        'products' => $products,
        // ... other data
    ]);
}
```

---

## 📱 Frontend: Send Language in API Requests

### **1. Create API Service with Language Header**

```javascript
// src/services/api.js

import axios from 'axios';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://luna-api.proteinbros.in/public/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add language header
api.interceptors.request.use(
  async (config) => {
    // Get current language
    const language = i18n.language || 'en';
    const langCode = language.startsWith('ar') ? 'ar' : 'en';
    
    // Add language to headers
    config.headers['Accept-Language'] = langCode;
    
    // Add auth token if exists
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      await AsyncStorage.removeItem('auth_token');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default api;
```

### **2. Update All API Calls**

```javascript
// Example: Update ProductDetailScreen.js

import api from '../services/api';

// Instead of:
// const response = await axios.post(url, data);

// Use:
const response = await api.post('/screen/products/details', {
  product_id: productId
});
// Language header is automatically added!
```

### **3. Language Change Handler**

```javascript
// src/screen/ChooseLanguageScreen.js

const updateLanguageAPI = async (language) => {
  setIsLoading(true);

  const formData = new FormData();
  formData.append('language', language);
  formData.append('user_id', userId);

  try {
    // Update user language in backend
    const response = await axios.post(
      `${BASE_URL}/auth/update-profile`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (response.data.status) {
      // Update app language
      await setAppLanguage(language);
      
      // Refresh current screen data with new language
      // The API will automatically return translated data
      // because Accept-Language header is updated
      
      showAlert('success', 'Language updated successfully!');
    }
  } catch (error) {
    showAlert('error', 'Failed to update language');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🔄 Complete Flow

### **1. User Changes Language**
```
User selects Arabic → 
Update user profile API → 
Change i18n language → 
All future API calls include 'Accept-Language: ar' header
```

### **2. API Request with Language**
```
Frontend sends: GET /api/v1/products
Headers: { 'Accept-Language': 'ar' }
```

### **3. Backend Processing**
```
Middleware intercepts → 
Checks Accept-Language header → 
Fetches data (in English) → 
Translates response using TranslationService → 
Returns translated data
```

### **4. Response Translation**
```
Products: [
  {
    name: "T-Shirt",  // Original
    name: "قميص"      // Translated to Arabic
  }
]
```

---

## 📋 Implementation Checklist

### **Backend:**
- [ ] Create TranslationService
- [ ] Create TranslateResponse middleware
- [ ] Create translations table migration
- [ ] Register middleware in Kernel.php
- [ ] Configure Google Translate API key (optional)
- [ ] Test translation with sample API

### **Frontend:**
- [ ] Create centralized API service
- [ ] Add language header to all requests
- [ ] Update all axios calls to use new API service
- [ ] Handle language change and refresh data
- [ ] Test with both English and Arabic

### **Database:**
- [ ] Run migrations
- [ ] Seed common translations (optional)
- [ ] Monitor translation cache performance

---

## 🎯 Key Benefits

1. **Automatic Translation**: All API responses translated based on user preference
2. **Caching**: Translations cached in database for performance
3. **Fallback**: If translation fails, returns original text
4. **Scalable**: Can add more languages easily
5. **Performance**: Database translations are instant, API translations cached

---

## 🔧 Configuration

### **Environment Variables**

```env
# .env
GOOGLE_TRANSLATE_API_KEY=your_api_key_here
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,ar
```

### **Config File**

```php
// config/services.php

'google' => [
    'translate_key' => env('GOOGLE_TRANSLATE_API_KEY'),
],
```

---

This implementation ensures all API data is automatically translated based on the user's selected language (English/Arabic) without changing the frontend code!

