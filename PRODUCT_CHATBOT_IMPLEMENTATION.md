# Product-Specific Chatbot Implementation Guide

## 🎯 Overview

This is a **product-specific support chatbot** where:
1. User selects a product first
2. User asks questions about that specific product
3. System provides automated answers from knowledge base
4. If no answer found → Message sent to admin panel for manual response
5. Admin responds through admin panel
6. User receives response in the app

---

## 📱 Frontend Implementation (React Native)

### **1. Product Selection Screen**

Create/Update: `src/screen/ProductChatBotScreen.js`

```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import useUserStore from '../store/UserStore';
import i18n from '../i18n';

const BASE_URL = 'https://luna-api.proteinbros.in/public/api/v1';

const ProductChatBotScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const user = useUserStore(state => state.user);
  const [product, setProduct] = useState(route?.params?.product || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const currentLang = i18n.language || 'en';

  // Initialize with product selection message
  useEffect(() => {
    if (product) {
      const welcomeMsg = {
        id: 'welcome',
        type: 'bot',
        text: currentLang === 'ar' 
          ? `مرحباً! أنا هنا لمساعدتك بخصوص ${product.name || 'هذا المنتج'}. كيف يمكنني مساعدتك؟`
          : `Hi! I'm here to help you with ${product.name || 'this product'}. How can I assist you?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
    }
  }, [product, currentLang]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !product || sending) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSending(true);
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/chatbot/product-query`,
        {
          user_id: user?.id,
          product_id: product.id,
          question: text,
          language: currentLang
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.status) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: response.data.answer || response.data.message,
          isAutoAnswer: response.data.is_auto_answer || false,
          timestamp: new Date().toISOString()
        };

        // If not auto-answer, show pending status
        if (!response.data.is_auto_answer) {
          botMessage.pending = true;
          botMessage.text = currentLang === 'ar'
            ? 'شكراً لسؤالك! سنقوم بالرد عليك قريباً من خلال فريق الدعم.'
            : 'Thanks for your question! Our support team will respond soon.';
        }

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: currentLang === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.type === 'user' ? styles.userText : styles.botText
      ]}>
        {item.text}
      </Text>
      {item.pending && (
        <Text style={styles.pendingText}>
          {currentLang === 'ar' ? '⏳ قيد الانتظار' : '⏳ Pending'}
        </Text>
      )}
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StandardHeader title="Select Product" navigation={navigation} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {currentLang === 'ar' ? 'يرجى اختيار منتج أولاً' : 'Please select a product first'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StandardHeader 
        title={product.name || 'Product Support'} 
        navigation={navigation}
        showGradient={true}
      />
      
      {/* Product Info Header */}
      <View style={styles.productHeader}>
        <Image 
          source={{ uri: product.photo || product.image }} 
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            {product.price || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.p1} />
          <Text style={styles.loadingText}>
            {currentLang === 'ar' ? 'جاري البحث عن إجابة...' : 'Searching for answer...'}
          </Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={currentLang === 'ar' ? 'اكتب سؤالك...' : 'Type your question...'}
            placeholderTextColor={theme.sub}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={sending || !inputText.trim()}
          >
            <Text style={styles.sendButtonText}>
              {currentLang === 'ar' ? 'إرسال' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFBFF' },
  productHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6F6'
  },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#0F1020', marginBottom: 4 },
  productPrice: { fontSize: 14, color: '#6b7280' },
  messagesList: { padding: 16, paddingBottom: 20 },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#5C42C7'
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF7B8'
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#0F1020' },
  pendingText: { fontSize: 12, color: '#6b7280', marginTop: 4, fontStyle: 'italic' },
  timestamp: { fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 4 },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  loadingText: { marginLeft: 8, fontSize: 12, color: '#6b7280' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E6F6',
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E6F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14
  },
  sendButton: {
    backgroundColor: '#5C42C7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280' }
});

export default ProductChatBotScreen;
```

---

## 🔌 Backend API Implementation (Laravel)

### **1. Create Migration**

```bash
php artisan make:migration create_product_chatbot_queries_table
```

**Migration File:**
```php
<?php
// database/migrations/xxxx_create_product_chatbot_queries_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('product_chatbot_queries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id');
            $table->text('question');
            $table->text('answer')->nullable();
            $table->boolean('is_auto_answer')->default(false);
            $table->enum('status', ['pending', 'answered', 'closed'])->default('pending');
            $table->string('language', 10)->default('en');
            $table->unsignedBigInteger('answered_by')->nullable(); // admin user id
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index(['product_id', 'status']);
        });

        // Knowledge base for auto-answers
        Schema::create('product_faqs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->nullable(); // null = general FAQ
            $table->string('question');
            $table->text('answer');
            $table->string('language', 10)->default('en');
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index(['product_id', 'language', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_chatbot_queries');
        Schema::dropIfExists('product_faqs');
    }
};
```

### **2. Create Model**

```bash
php artisan make:model ProductChatbotQuery
php artisan make:model ProductFaq
```

**Models:**
```php
<?php
// app/Models/ProductChatbotQuery.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductChatbotQuery extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'question', 'answer',
        'is_auto_answer', 'status', 'language', 'answered_by', 'answered_at'
    ];

    protected $casts = [
        'is_auto_answer' => 'boolean',
        'answered_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function answeredBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'answered_by');
    }
}
```

```php
<?php
// app/Models/ProductFaq.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductFaq extends Model
{
    protected $fillable = [
        'product_id', 'question', 'answer', 'language', 'priority', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
```

### **3. Create Controller**

```bash
php artisan make:controller Api/ProductChatbotController
```

**Controller:**
```php
<?php
// app/Http/Controllers/Api/ProductChatbotController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductChatbotQuery;
use App\Models\ProductFaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductChatbotController extends Controller
{
    /**
     * Handle product-specific chatbot query
     */
    public function productQuery(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'question' => 'required|string|max:500',
            'language' => 'nullable|string|in:en,ar'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = $request->user_id;
        $productId = $request->product_id;
        $question = $request->question;
        $language = $request->language ?? 'en';

        // Step 1: Try to find auto-answer from FAQ
        $autoAnswer = $this->findAutoAnswer($productId, $question, $language);

        if ($autoAnswer) {
            // Save query with auto-answer
            $query = ProductChatbotQuery::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'question' => $question,
                'answer' => $autoAnswer['answer'],
                'is_auto_answer' => true,
                'status' => 'answered',
                'language' => $language,
                'answered_at' => now()
            ]);

            return response()->json([
                'status' => true,
                'is_auto_answer' => true,
                'answer' => $autoAnswer['answer'],
                'query_id' => $query->id,
                'message' => 'Auto-answer provided'
            ]);
        }

        // Step 2: No auto-answer found - save for admin response
        $query = ProductChatbotQuery::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'question' => $question,
            'is_auto_answer' => false,
            'status' => 'pending',
            'language' => $language
        ]);

        // TODO: Send notification to admin panel

        return response()->json([
            'status' => true,
            'is_auto_answer' => false,
            'message' => 'Your question has been sent to our support team. We will respond soon.',
            'query_id' => $query->id
        ]);
    }

    /**
     * Find matching FAQ answer
     */
    private function findAutoAnswer($productId, $question, $language)
    {
        // Normalize question for matching
        $normalizedQuestion = strtolower(trim($question));
        $keywords = explode(' ', $normalizedQuestion);

        // First: Try product-specific FAQs
        $productFaqs = ProductFaq::where('product_id', $productId)
            ->where('language', $language)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($productFaqs as $faq) {
            $faqQuestion = strtolower($faq->question);
            $matchScore = $this->calculateMatchScore($normalizedQuestion, $faqQuestion, $keywords);
            
            if ($matchScore >= 0.6) { // 60% match threshold
                return [
                    'answer' => $faq->answer,
                    'faq_id' => $faq->id,
                    'match_score' => $matchScore
                ];
            }
        }

        // Second: Try general FAQs (product_id = null)
        $generalFaqs = ProductFaq::whereNull('product_id')
            ->where('language', $language)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($generalFaqs as $faq) {
            $faqQuestion = strtolower($faq->question);
            $matchScore = $this->calculateMatchScore($normalizedQuestion, $faqQuestion, $keywords);
            
            if ($matchScore >= 0.5) { // Lower threshold for general FAQs
                return [
                    'answer' => $faq->answer,
                    'faq_id' => $faq->id,
                    'match_score' => $matchScore
                ];
            }
        }

        return null;
    }

    /**
     * Calculate similarity score between question and FAQ
     */
    private function calculateMatchScore($question, $faqQuestion, $keywords)
    {
        // Exact match
        if (strpos($faqQuestion, $question) !== false || strpos($question, $faqQuestion) !== false) {
            return 1.0;
        }

        // Keyword matching
        $faqWords = explode(' ', $faqQuestion);
        $matchedKeywords = 0;
        
        foreach ($keywords as $keyword) {
            if (strlen($keyword) > 2) { // Ignore very short words
                foreach ($faqWords as $faqWord) {
                    if (strpos($faqWord, $keyword) !== false || strpos($keyword, $faqWord) !== false) {
                        $matchedKeywords++;
                        break;
                    }
                }
            }
        }

        if (count($keywords) === 0) return 0;
        
        return $matchedKeywords / count($keywords);
    }

    /**
     * Get chat history for a product
     */
    public function getChatHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $queries = ProductChatbotQuery::where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($query) {
                return [
                    'id' => $query->id,
                    'question' => $query->question,
                    'answer' => $query->answer,
                    'is_auto_answer' => $query->is_auto_answer,
                    'status' => $query->status,
                    'created_at' => $query->created_at->toISOString(),
                    'answered_at' => $query->answered_at?->toISOString()
                ];
            });

        return response()->json([
            'status' => true,
            'messages' => $queries
        ]);
    }
}
```

### **4. Add Routes**

```php
// routes/api.php

Route::controller(ProductChatbotController::class)->prefix('v1/chatbot')->group(function () {
    Route::post('/product-query', 'productQuery');
    Route::post('/chat-history', 'getChatHistory');
});
```

---

## 🖥️ Admin Panel Implementation

### **1. Admin Controller**

```php
<?php
// app/Http/Controllers/Admin/ProductChatbotAdminController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductChatbotQuery;
use App\Models\ProductFaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductChatbotAdminController extends Controller
{
    /**
     * List pending queries
     */
    public function pendingQueries()
    {
        $queries = ProductChatbotQuery::with(['user', 'product'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.chatbot.pending', compact('queries'));
    }

    /**
     * Answer a query
     */
    public function answerQuery(Request $request, $id)
    {
        $request->validate([
            'answer' => 'required|string|max:2000'
        ]);

        $query = ProductChatbotQuery::findOrFail($id);
        
        $query->update([
            'answer' => $request->answer,
            'status' => 'answered',
            'answered_by' => auth('admin')->id(),
            'answered_at' => now()
        ]);

        // TODO: Send push notification to user

        return redirect()->back()->with('success', 'Answer sent successfully');
    }

    /**
     * Manage FAQs
     */
    public function manageFaqs($productId = null)
    {
        $faqs = ProductFaq::where('product_id', $productId)
            ->orderBy('priority', 'desc')
            ->get();

        return view('admin.chatbot.faqs', compact('faqs', 'productId'));
    }

    /**
     * Create/Update FAQ
     */
    public function saveFaq(Request $request)
    {
        $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'question' => 'required|string|max:500',
            'answer' => 'required|string|max:2000',
            'language' => 'required|in:en,ar',
            'priority' => 'nullable|integer|min:0|max:100'
        ]);

        ProductFaq::updateOrCreate(
            ['id' => $request->id],
            $request->only(['product_id', 'question', 'answer', 'language', 'priority', 'is_active'])
        );

        return redirect()->back()->with('success', 'FAQ saved successfully');
    }
}
```

### **2. Admin Routes**

```php
// routes/web.php (in admin section)

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

---

## 🔄 Real-time Updates (Optional)

### **Polling for New Answers**

Add to `ProductChatBotScreen.js`:

```javascript
// Poll for new answers every 5 seconds if there are pending messages
useEffect(() => {
  if (!product || !user?.id) return;

  const pendingMessages = messages.filter(m => m.pending);
  if (pendingMessages.length === 0) return;

  const interval = setInterval(async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/chatbot/check-updates`,
        {
          user_id: user.id,
          product_id: product.id,
          last_check: messages[messages.length - 1]?.timestamp
        }
      );

      if (response.data.status && response.data.new_answers?.length > 0) {
        // Update pending messages with answers
        setMessages(prev => prev.map(msg => {
          const newAnswer = response.data.new_answers.find(
            a => a.query_id === msg.queryId
          );
          if (newAnswer && msg.pending) {
            return {
              ...msg,
              text: newAnswer.answer,
              pending: false
            };
          }
          return msg;
        }));
      }
    } catch (error) {
      console.log('Error checking updates:', error);
    }
  }, 5000); // Check every 5 seconds

  return () => clearInterval(interval);
}, [messages, product, user]);
```

---

## 📋 Summary

### **Flow:**
1. User selects product → Opens chatbot
2. User asks question → Sent to API
3. API searches FAQ database → Auto-answer if found
4. If no match → Saved as pending → Admin notified
5. Admin responds → User receives answer
6. All messages stored in database

### **Key Features:**
- ✅ Product-specific support
- ✅ Auto-answer from FAQ
- ✅ Admin escalation
- ✅ Multi-language support (EN/AR)
- ✅ Chat history
- ✅ Real-time updates (polling)

### **Next Steps:**
1. Create database migrations
2. Implement API endpoints
3. Create admin panel views
4. Add FAQ management
5. Integrate with product detail screen

