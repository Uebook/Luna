<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ProductChatbotController;
use App\Http\Controllers\Api\LiveStreamController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ChatSupportController;
use App\Http\Controllers\Api\ImageSearchController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\GiftCardController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->prefix('v1/auth')->group(function () {
    Route::post('/register', 'register');
    Route::post('/login', 'login');
    Route::post('/verify-otp', 'verifyOtp');
    Route::post('/update-profile', 'updateProfile');
});
Route::controller(CheckoutController::class)->prefix('v1/order')->group(function () {
    Route::post('/checkout', 'store');
    Route::post('/get-my', 'myOrders');
    Route::post('/activity-stats', 'getActivityStats');
});
Route::controller(HomeController::class)->prefix('v1/screen')->group(function () {
   Route::post('/home','homeData');
   Route::get('/all-category','getCategories');
   Route::post('/all-category','getCategories'); // Also allow POST for mobile compatibility
   Route::post('/stories', 'stories');
   Route::post('/discovers', 'discovers');
   Route::post('/vendors', 'vendors');
   Route::post('/brands', 'brands');
   Route::post('/coupons', 'coupons');
   
   // Voucher endpoints
   Route::controller(VoucherController::class)->prefix('voucher')->group(function () {
       Route::post('/list', 'getUserVouchers');
       Route::post('/collect', 'collectVoucher');
   });

   // Subscription/Membership endpoints
   Route::controller(SubscriptionController::class)->prefix('v1/subscription')->group(function () {
       Route::post('/tiers-plans', 'getTiersAndPlans');
       Route::post('/user-stats', 'getUserStats');
       Route::post('/subscribe', 'subscribe');
   });

   // Gift Card endpoints
   Route::controller(GiftCardController::class)->prefix('v1/gift-card')->group(function () {
       Route::post('/list', 'getGiftCards');
       Route::post('/purchase', 'purchaseGiftCard');
       Route::post('/user-cards', 'getUserGiftCards');
       Route::post('/validate', 'validateGiftCard');
   });
   Route::post('/products', 'products');
   Route::post('/products/details', 'productDetails');
   Route::post('/products/add-review', 'addReview');
   Route::post('/products/edit-review', 'editReview');
   Route::post('/products/hot', 'hotProducts');
   Route::post('/products/latest', 'latestProducts');
   Route::post('/products/trending', 'trendingProducts');
   Route::post('/products/best', 'bestProducts');
   Route::post('/products/sale', 'saleProducts');
   Route::post('/products/flash', 'flashProducts');
   Route::post('/vendor/products', 'celebrityProducts');
   Route::post('/sub-category/products', 'getProductsBySubCategory');
   Route::post('/brand/products', 'getProductsByBrand');
   
   Route::post('/recently-viewed/add','addProduct');
   Route::post('/recently-viewed','getProducts');
   
   Route::post('/wishlist/toggle','toggleWishlistProduct');
   Route::post('/wishlist','getWishlistProducts');
});

Route::controller(ProductChatbotController::class)->prefix('v1/chatbot')->group(function () {
    Route::post('/product-query', 'productQuery');
    Route::post('/chat-history', 'getChatHistory');
    Route::post('/check-updates', 'checkUpdates');
});

Route::controller(LiveStreamController::class)->prefix('v1/stream')->group(function () {
    Route::post('/agora-token', 'getAgoraToken');
    Route::post('/create', 'createStream');
    Route::post('/list', 'getActiveStreams');
    Route::post('/details', 'getStreamDetails');
    Route::post('/end', 'endStream');
    Route::post('/viewer-join', 'viewerJoin');
    Route::post('/viewer-leave', 'viewerLeave');
    Route::post('/like', 'likeStream');
    Route::post('/products/add', 'addProduct');
    Route::post('/products/remove', 'removeProduct');
    Route::post('/products/list', 'getStreamProducts');
    Route::post('/products/available', 'getAvailableProducts');
    Route::post('/products/update-order', 'updateProductOrder');
});

Route::controller(CartController::class)->prefix('v1/cart')->group(function () {
    Route::post('/get', 'getCart');
    Route::post('/add', 'addToCart');
    Route::post('/update', 'updateCart');
    Route::post('/remove', 'removeFromCart');
    Route::post('/clear', 'clearCart');
});

Route::controller(AddressController::class)->prefix('v1/address')->group(function () {
    Route::post('/list', 'getAddresses');
    Route::post('/add', 'addAddress');
    Route::post('/update/{id}', 'updateAddress');
    Route::post('/delete/{id}', 'deleteAddress');
    Route::post('/set-default/{id}', 'setDefault');
});

Route::controller(NotificationController::class)->prefix('v1/notification')->group(function () {
    Route::post('/list', 'getNotifications');
    Route::post('/mark-read', 'markAsRead');
    Route::post('/mark-all-read', 'markAllAsRead');
    Route::post('/delete/{id}', 'deleteNotification');
});

Route::controller(ChatSupportController::class)->prefix('v1/chat')->group(function () {
    Route::post('/messages', 'getMessages');
    Route::post('/send', 'sendMessage');
    Route::post('/history', 'getChatHistory');
});

Route::controller(ImageSearchController::class)->prefix('v1/image-search')->group(function () {
    Route::post('/search', 'searchByImage');
});

Route::controller(WalletController::class)->prefix('v1/wallet')->group(function () {
    Route::post('/info', 'getWalletInfo');
    Route::post('/purchases', 'getPurchaseHistory');
    Route::post('/transactions', 'getRewardTransactions');
});

