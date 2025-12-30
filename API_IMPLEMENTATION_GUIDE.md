# API Implementation Guide for Luna E-Commerce

## Overview
All screens should use the centralized API service located at `src/services/api.js`.

## Centralized API Service
The API service (`src/services/api.js`) includes:
- `authAPI` - Authentication endpoints
- `cartAPI` - Cart operations
- `addressAPI` - Address management
- `notificationAPI` - Notifications
- `chatSupportAPI` - Chat support
- `subscriptionAPI` - Subscriptions
- `voucherAPI` - Vouchers/coupons
- `walletAPI` - Wallet operations
- `giftCardAPI` - Gift cards
- `orderAPI` - Orders
- `imageSearchAPI` - Image search
- `liveStreamAPI` - Live streaming
- `contactPreferencesAPI` - Contact preferences
- `homeAPI` - Home screen data, products, wishlist, recently viewed
- `productChatbotAPI` - Product chatbot

## Getting User ID
Most APIs require `user_id`. Use this helper:
```javascript
import { getUserId } from '../services/api';

const userId = await getUserId();
```

Or load from AsyncStorage:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'luna_user';

const loadUser = async () => {
  try {
    const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const userId = parsed?.user?.id || parsed?.data?.id || parsed?.id;
      return userId;
    }
  } catch (error) {
    console.log('Error loading user:', error);
  }
  return null;
};
```

## Implementation Pattern

### Before (Direct fetch/axios):
```javascript
const BASE_URL = 'https://luna-api.proteinbros.in/public/api/v1';

const fetchWishlist = async (userId) => {
  const response = await fetch(`${BASE_URL}/screen/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = await response.json();
  return data;
};
```

### After (Using centralized API):
```javascript
import { homeAPI, getUserId } from '../services/api';

const loadWishlist = async () => {
  try {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert('Error', 'Please login first');
      return;
    }
    const response = await homeAPI.getWishlist(userId);
    if (response.data.status) {
      setItems(response.data.wishlist_products || []);
    }
  } catch (error) {
    console.error('Error loading wishlist:', error);
    Alert.alert('Error', 'Failed to load wishlist');
  }
};
```

## Screen-by-Screen Implementation Status

### ✅ Completed Infrastructure
- [x] Centralized API service (`src/services/api.js`)
- [x] API routes updated (`adminpanel/luna-api/routes/api.php`)

### 🔄 Needs Implementation

#### Authentication Screens
- [ ] LoginScreen.js - Use `authAPI.login()`
- [ ] CreateAccount.js - Use `authAPI.register()`
- [ ] PasswordTyping.js - Use `authAPI.login()`
- [ ] PasswordRecoveryScreen.js - Needs API endpoint
- [ ] SetupNewPasswordScreen.js - Needs API endpoint

#### Cart & Checkout
- [ ] CartScreen.js - Use `cartAPI.getCart()`, `cartAPI.updateCart()`, `cartAPI.removeFromCart()`
- [ ] CheckoutScreen.js - Use `orderAPI.checkout()`, `addressAPI.getAddresses()`

#### Product Screens
- [ ] ProductDetailScreen.js - Use `homeAPI.getProductDetails()`, `cartAPI.addToCart()`, `homeAPI.toggleWishlist()`
- [ ] AllNewProduct.js - Use `homeAPI.getLatestProducts()`
- [ ] TrendingProductsScreen.js - Use `homeAPI.getTrendingProducts()`
- [ ] BestProductsScreen.js - Use `homeAPI.getBestProducts()`
- [ ] FlashSaleScreen.js - Use `homeAPI.getFlashProducts()`
- [ ] TopProductsScreen.js - Use `homeAPI.getHotProducts()` or `homeAPI.getLatestProducts()`
- [ ] SearchScreen.js - Use `homeAPI.getProducts()` with search filters
- [ ] CategoryProductScreen.js - Use `homeAPI.getProductsBySubCategory()`
- [ ] SubCategoryProductsScreen.js - Use `homeAPI.getProductsBySubCategory()`
- [ ] BrandStoreScreen.js - Use `homeAPI.getProductsByBrand()`

#### User & Profile
- [ ] SettingsProfileScreen.js - Use `authAPI.updateProfile()`
- [ ] SettingsScreen.js - Use `authAPI.updateProfile()` for preferences
- [ ] ProfileScreen.js - Use `authAPI.updateProfile()`

#### Wishlist & Recently Viewed
- [ ] WishlistScreen.js - Use `homeAPI.getWishlist()`, `homeAPI.toggleWishlist()`
- [ ] RecentlyViewedScreen.js - Use `homeAPI.getRecentlyViewed()`, `homeAPI.addRecentlyViewed()`

#### Orders
- [ ] OrderDetailsScreen.js - Use `orderAPI.getOrderDetails()`
- [ ] OrderTrackingScreen.js - Use `orderAPI.getOrderDetails()`
- [ ] HistoryScreen.js - Use `orderAPI.getMyOrders()`
- [ ] ToReceiveOrdersScreen.js - Use `orderAPI.getMyOrders()` with status filter
- [ ] ActivityScreen.js - Use `orderAPI.getActivityStats()`

#### Address
- [ ] ShippingAddressScreen.js - Use `addressAPI.getAddresses()`, `addressAPI.addAddress()`, `addressAPI.updateAddress()`, `addressAPI.deleteAddress()`

#### Notifications
- [ ] NotificationScreen.js - Use `notificationAPI.getNotifications()`, `notificationAPI.markAsRead()`, `notificationAPI.deleteNotification()`

#### Chat Support
- [ ] ChatSupportScreen.js - Use `chatSupportAPI.getMessages()`, `chatSupportAPI.sendMessage()`, `chatSupportAPI.getChatHistory()`

#### Subscriptions
- [ ] SubscriptionScreen.js - Use `subscriptionAPI.getTiersAndPlans()`, `subscriptionAPI.getUserStats()`, `subscriptionAPI.subscribe()`

#### Vouchers
- [ ] VoucherScreen.js - Use `voucherAPI.getUserVouchers()`, `voucherAPI.collectVoucher()`

#### Wallet
- [ ] WalletScreen.js - Use `walletAPI.getWalletInfo()`, `walletAPI.getPurchaseHistory()`, `walletAPI.getRewardTransactions()`

#### Gift Cards
- [ ] GiftCardBrowse.js - Use `giftCardAPI.getGiftCards()`
- [ ] GiftCardReviewPay.js - Use `giftCardAPI.purchaseGiftCard()`
- [ ] GiftCardReceivedScreen.js - Use `giftCardAPI.getReceivedGiftCards()`
- [ ] GiftCardSuccess.js - Display success message

#### Live Stream
- [ ] AgoraLiveStreamScreen.js - Use `liveStreamAPI.createStream()`, `liveStreamAPI.getAgoraToken()`, `liveStreamAPI.endStream()`
- [ ] AgoraLiveViewerScreen.js - Use `liveStreamAPI.getAgoraToken()`, `liveStreamAPI.viewerJoin()`, `liveStreamAPI.viewerLeave()`, `liveStreamAPI.likeStream()`
- [ ] StreamScreen.js - Use `liveStreamAPI.getActiveStreams()`
- [ ] StreamPlayerScreen.js - Use `liveStreamAPI.getStreamDetails()`

#### Celebrities/Vendors
- [ ] CelebritiesScreen.js - Use `homeAPI.getVendors()`
- [ ] CelebrityDetailScreen.js - Use `homeAPI.getCelebrityProducts()`

#### Other Screens
- [ ] NewHome.js - Use `homeAPI.getHomeData()`, `homeAPI.getCategories()`, etc.
- [ ] AISearchScreen.js - Use `imageSearchAPI.searchByImage()`
- [ ] ImageSearchResults.js - Display results from image search
- [ ] ProductChatBotScreen.js - Use `productChatbotAPI.productQuery()`, `productChatbotAPI.getChatHistory()`
- [ ] ChatBotModal.js - Use `productChatbotAPI.productQuery()`
- [ ] ContactPreferencesNew.js - Use `contactPreferencesAPI.getPreferences()`, `contactPreferencesAPI.savePreferences()`
- [ ] ReviewScreen.js - Use `homeAPI.addReview()`, `homeAPI.editReview()`

## Example Implementation

### CartScreen.js Example
```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { cartAPI, getUserId } from '../services/api';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const response = await cartAPI.getCart(userId);
      if (response.data.success) {
        setCartItems(response.data.cart || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(loadCart);

  const updateQuantity = async (cartId, quantity) => {
    try {
      const userId = await getUserId();
      const response = await cartAPI.updateCart(userId, cartId, quantity);
      if (response.data.success) {
        loadCart(); // Reload cart
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update cart');
    }
  };

  const removeItem = async (cartId) => {
    try {
      const userId = await getUserId();
      const response = await cartAPI.removeFromCart(userId, cartId);
      if (response.data.success) {
        loadCart(); // Reload cart
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  // ... rest of component
};
```

## Notes

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators while fetching data
3. **User Authentication**: Check for userId before making API calls that require it
4. **Response Structure**: Handle different response formats (`response.data.status`, `response.data.success`, etc.)
5. **Image URLs**: Construct full image URLs using base paths (e.g., `https://proteinbros.in/assets/images/products/`)
6. **Refresh**: Implement pull-to-refresh where appropriate
7. **Optimistic Updates**: Consider updating UI immediately, then sync with API

## Testing
After implementing API integration for each screen:
1. Test with logged-in user
2. Test with logged-out user (should handle gracefully)
3. Test error scenarios (network errors, API errors)
4. Test loading states
5. Test pull-to-refresh functionality




