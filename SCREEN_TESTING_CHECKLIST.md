# Screen Testing Checklist

**Build Status:** ✅ BUILD SUCCESSFUL  
**App Installed:** ✅ Installed on emulator-5554  
**Date:** 2025-01-18

---

## ✅ Fully Integrated Screens (13 screens ready for testing)

### 1. Authentication
#### LoginScreen.js ✅
- [x] Uses `authAPI.login()`
- [x] Uses `authAPI.verifyOtp()`
- ⚠️ Resend OTP still uses direct axios (backend endpoint may not exist)
- **Test Cases:**
  - [ ] Login with email
  - [ ] Login with phone number
  - [ ] OTP verification flow
  - [ ] Error handling for invalid credentials
  - [ ] User data saved to AsyncStorage

---

### 2. Shopping Cart
#### CartScreen.js ✅
- [x] Uses `cartAPI.getCart()`
- [x] Uses `cartAPI.updateCart()`
- [x] Uses `cartAPI.removeFromCart()`
- **Test Cases:**
  - [ ] View cart items
  - [ ] Update item quantities (+ and -)
  - [ ] Remove items from cart
  - [ ] Empty cart state display
  - [ ] Cart totals calculation (subtotal, discount, shipping, total)
  - [ ] Navigation to checkout

---

### 3. Wishlist
#### WishlistScreen.js ✅
- [x] Uses `homeAPI.getWishlist()`
- [x] Uses `homeAPI.toggleWishlist()`
- [x] Uses `cartAPI.addToCart()`
- [x] Uses `homeAPI.getRecentlyViewed()`
- **Test Cases:**
  - [ ] View wishlist items
  - [ ] Remove items from wishlist
  - [ ] Move items from wishlist to cart
  - [ ] Empty wishlist state
  - [ ] Recently viewed section display
  - [ ] Filter/sort options (All, Trending, A-Z, Newest)

---

### 4. Recently Viewed
#### RecentlyViewedScreen.js ✅
- [x] Uses `homeAPI.getRecentlyViewed()`
- **Test Cases:**
  - [ ] View recently viewed products
  - [ ] Filter by date (Today, Yesterday, Custom)
  - [ ] Empty state when no recent items
  - [ ] Navigation to product details

---

### 5. Order History
#### HistoryScreen.js ✅
- [x] Uses `orderAPI.getMyOrders()`
- [x] Uses `homeAPI.addReview()`
- **Test Cases:**
  - [ ] View order list
  - [ ] Filter orders by status (All, Delivered, Processing)
  - [ ] View order details
  - [ ] Submit product reviews
  - [ ] Rating modal functionality
  - [ ] Empty orders state

---

### 6. Products
#### AllNewProduct.js ✅
- [x] Uses `homeAPI.getLatestProducts()`
- **Test Cases:**
  - [ ] View latest products grid
  - [ ] Search functionality
  - [ ] Sort options
  - [ ] Product image loading
  - [ ] Navigation to product details
  - [ ] Empty state handling

---

### 7. Gift Cards
#### GiftCardReviewPay.js ✅
- [x] Uses `giftCardAPI.purchaseGiftCard()`
- **Test Cases:**
  - [ ] Purchase gift card flow
  - [ ] Payment form validation
  - [ ] Success navigation

#### GiftCardReceivedScreen.js ✅
- [x] Uses `giftCardAPI.getReceivedGiftCards()`
- **Test Cases:**
  - [ ] View received gift cards
  - [ ] Copy gift card codes
  - [ ] Redeem functionality
  - [ ] Empty state

---

### 8. Vouchers
#### VoucherScreen.js ✅
- [x] Uses `voucherAPI.getUserVouchers()`
- [x] Uses `voucherAPI.collectVoucher()`
- **Test Cases:**
  - [ ] View available vouchers
  - [ ] Collect vouchers
  - [ ] Filter by status (Active, Expired, Progress)
  - [ ] Voucher card display

---

### 9. Live Streaming
#### StreamScreen.js ✅
- [x] Uses `liveStreamAPI.getActiveStreams()`
- **Test Cases:**
  - [ ] View active live streams list
  - [ ] Stream cards display
  - [ ] Navigation to stream viewer
  - [ ] Filter by category tabs

#### AgoraLiveViewerScreen.js ✅
- [x] Uses `liveStreamAPI.getAgoraToken()`
- [x] Uses `liveStreamAPI.viewerJoin()`
- [x] Uses `liveStreamAPI.viewerLeave()`
- [x] Uses `liveStreamAPI.likeStream()`
- **Test Cases:**
  - [ ] Join stream as viewer
  - [ ] View live stream video
  - [ ] Like/unlike stream
  - [ ] Viewer count updates
  - [ ] Leave stream functionality

#### AgoraLiveStreamScreen.js ✅
- [x] Uses `liveStreamAPI.createStream()`
- [x] Uses `liveStreamAPI.getAgoraToken()`
- [x] Uses `liveStreamAPI.endStream()`
- **Test Cases:**
  - [ ] Create new stream
  - [ ] Start broadcasting
  - [ ] Viewer count display
  - [ ] End stream functionality
  - [ ] Permissions handling (camera, microphone)

---

### 10. Product Chatbot
#### ProductChatBotScreen.js ✅
- [x] Uses `productChatbotAPI.productQuery()`
- [x] Uses `productChatbotAPI.getChatHistory()`
- [x] Uses `productChatbotAPI.checkUpdates()`
- **Test Cases:**
  - [ ] Send queries to chatbot
  - [ ] View chat history
  - [ ] Real-time updates polling
  - [ ] Message display (user/bot)
  - [ ] Pending message indicators

---

## 🧪 Testing Procedure

### Step 1: Authentication Testing
1. Open the app
2. Navigate to Login screen
3. Test login flow with valid credentials
4. Verify OTP verification works
5. Check if user data is saved

### Step 2: Core Shopping Features
1. **Home Screen** → Browse products
2. **Product Detail** → Add to cart/wishlist
3. **Cart Screen** → Manage cart items
4. **Wishlist** → Manage wishlist
5. **Checkout** → Complete purchase flow

### Step 3: Order Management
1. **Order History** → View past orders
2. **Order Details** → View order information
3. **Review Products** → Submit reviews

### Step 4: Additional Features
1. **Gift Cards** → Browse and purchase
2. **Vouchers** → View and collect
3. **Live Streams** → Watch and create streams
4. **Chatbot** → Interact with product chatbot

---

## 🔍 Key Areas to Test

### API Integration
- [ ] All API calls use centralized service
- [ ] Auth tokens are included in requests
- [ ] User ID is retrieved correctly
- [ ] Error handling works properly

### Data Flow
- [ ] Data loads correctly from API
- [ ] Loading states display properly
- [ ] Empty states show when no data
- [ ] Refresh functionality works

### User Experience
- [ ] Navigation flows smoothly
- [ ] Images load correctly
- [ ] Forms validate properly
- [ ] Error messages are user-friendly

### Edge Cases
- [ ] Network errors handled gracefully
- [ ] Empty responses handled
- [ ] Invalid data handled
- [ ] User logout scenarios

---

## 🐛 Known Issues & Notes

1. **Resend OTP in LoginScreen**
   - Still uses direct axios call
   - Backend endpoint `/auth/resend-otp` may not exist
   - Consider adding to authAPI if needed

2. **API Response Formats**
   - Some APIs may return slightly different structures
   - May need minor adjustments based on actual responses

3. **Image URLs**
   - Verify IMAGE_BASE_URL matches backend
   - Check for broken image links

---

## 📊 Test Results Log

```
Date: ___________
Tester: ___________

Screen: ___________________
Status: [✅ Pass / ❌ Fail / ⚠️ Issues]

Notes:
________________________________________
________________________________________
```

---

## ✅ Quick Test Commands

```bash
# Check Metro bundler is running
# (Should be running in background)

# View logs
npx react-native log-android

# Reload app
# Press 'r' in Metro bundler terminal or shake device

# Open dev menu
# Press Ctrl+M (Android) or Cmd+D (iOS)
```

---

## 🎯 Success Criteria

All screens should:
- ✅ Load data from API correctly
- ✅ Handle errors gracefully
- ✅ Show loading states
- ✅ Display empty states when appropriate
- ✅ Allow user interactions (tap, scroll, etc.)
- ✅ Navigate correctly between screens
- ✅ Save/retrieve data from AsyncStorage where needed

---

**Happy Testing! 🚀**




