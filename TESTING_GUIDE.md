# Testing Guide for API Integration

## ✅ Screens Ready for Testing

### Fully Integrated Screens (11 screens)
1. **CartScreen.js** ✅
   - Test: Add items to cart, update quantities, remove items
   - APIs: `cartAPI.getCart()`, `cartAPI.updateCart()`, `cartAPI.removeFromCart()`

2. **WishlistScreen.js** ✅
   - Test: View wishlist, toggle wishlist items, move to cart
   - APIs: `homeAPI.getWishlist()`, `homeAPI.toggleWishlist()`, `cartAPI.addToCart()`

3. **RecentlyViewedScreen.js** ✅
   - Test: View recently viewed products with date filtering
   - APIs: `homeAPI.getRecentlyViewed()`

4. **HistoryScreen.js** ✅
   - Test: View order history, filter by status, submit reviews
   - APIs: `orderAPI.getMyOrders()`, `homeAPI.addReview()`

5. **LoginScreen.js** ✅
   - Test: Login with email/phone, OTP verification
   - APIs: `authAPI.login()`, `authAPI.verifyOtp()`
   - Note: Resend OTP still uses direct API call (endpoint may not exist in backend)

6. **AllNewProduct.js** ✅
   - Test: View latest products, search, sort
   - APIs: `homeAPI.getLatestProducts()`

7. **GiftCardReviewPay.js** ✅
   - Test: Purchase gift cards
   - APIs: `giftCardAPI.purchaseGiftCard()`

8. **GiftCardReceivedScreen.js** ✅
   - Test: View received gift cards
   - APIs: `giftCardAPI.getReceivedGiftCards()`

9. **VoucherScreen.js** ✅
   - Test: View vouchers, collect vouchers
   - APIs: `voucherAPI.getUserVouchers()`, `voucherAPI.collectVoucher()`

10. **StreamScreen.js** ✅
    - Test: View live streams
    - APIs: `liveStreamAPI.getActiveStreams()`

11. **AgoraLiveViewerScreen.js** ✅
    - Test: Watch live streams, like streams
    - APIs: `liveStreamAPI.getAgoraToken()`, `liveStreamAPI.viewerJoin()`, `liveStreamAPI.likeStream()`

12. **AgoraLiveStreamScreen.js** ✅
    - Test: Create and manage live streams
    - APIs: `liveStreamAPI.createStream()`, `liveStreamAPI.getAgoraToken()`, `liveStreamAPI.endStream()`

13. **ProductChatBotScreen.js** ✅
    - Test: Chat with product chatbot
    - APIs: `productChatbotAPI.productQuery()`, `productChatbotAPI.getChatHistory()`, `productChatbotAPI.checkUpdates()`

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Login with email
- [ ] Login with phone number
- [ ] OTP verification
- [ ] Error handling for invalid credentials
- [ ] User data saved to AsyncStorage

### Cart Functionality
- [ ] View cart items
- [ ] Update item quantities
- [ ] Remove items from cart
- [ ] Empty cart state
- [ ] Cart totals calculation

### Wishlist Functionality
- [ ] View wishlist items
- [ ] Add items to wishlist
- [ ] Remove items from wishlist
- [ ] Move items from wishlist to cart
- [ ] Empty wishlist state

### Order History
- [ ] View order list
- [ ] Filter orders by status
- [ ] View order details
- [ ] Submit product reviews
- [ ] Empty orders state

### Product Browsing
- [ ] View latest products
- [ ] Search products
- [ ] Sort products
- [ ] Product image loading
- [ ] Product details navigation

### Gift Cards & Vouchers
- [ ] View available gift cards
- [ ] Purchase gift card
- [ ] View received gift cards
- [ ] View vouchers
- [ ] Collect vouchers

### Live Streaming
- [ ] View active streams
- [ ] Join stream as viewer
- [ ] Like/unlike streams
- [ ] Create stream (broadcaster)
- [ ] End stream

### Chat Features
- [ ] Product chatbot queries
- [ ] Chat history loading
- [ ] Real-time updates

## 🐛 Common Issues to Watch For

1. **Authentication Token**
   - Check if token is being added to requests
   - Verify token expiry handling

2. **User ID**
   - Ensure user ID is retrieved correctly
   - Check for null/undefined user ID cases

3. **Image URLs**
   - Verify image URLs are constructed correctly
   - Check for missing or broken images

4. **Error Handling**
   - Test network errors
   - Test invalid responses
   - Check error messages display

5. **Loading States**
   - Verify loading indicators appear
   - Check skeleton loaders
   - Ensure loading states clear properly

6. **Data Format**
   - Check API response structure matches expectations
   - Verify data transformation logic

## 🔍 Debugging Tips

1. **Check Console Logs**
   - Look for API request/response logs
   - Check for error messages

2. **Network Tab**
   - Verify API endpoints are called correctly
   - Check request/response payloads
   - Verify status codes

3. **AsyncStorage**
   - Check if user data is saved correctly
   - Verify user ID retrieval

4. **API Service**
   - Check base URL configuration
   - Verify auth token injection
   - Check error interceptors

## ⚠️ Known Issues

1. **Resend OTP in LoginScreen**
   - Still uses direct axios call
   - Backend endpoint may not exist: `/auth/resend-otp`
   - Consider adding to authAPI if endpoint exists

2. **API Response Structure**
   - Some APIs may return different response structures
   - May need adjustment based on actual API responses

3. **Image Base URLs**
   - Verify IMAGE_BASE_URL matches backend configuration
   - Check for CDN or different image hosting

## 📝 Test Results Template

```
Screen: [Screen Name]
Date: [Date]
Tester: [Name]

✅ Passed:
- [Test case 1]
- [Test case 2]

❌ Failed:
- [Test case 1] - [Error description]

⚠️ Issues:
- [Issue 1] - [Description]

Notes:
[Additional notes]
```

## 🚀 Quick Test Commands

```bash
# Run app on Android
npm run android

# Run app on iOS
npm run ios

# Check for linting errors
npm run lint

# Check Metro bundler logs
# (Check terminal where npm start is running)
```




