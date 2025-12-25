# API Integration Guide - Luna Ecom App

## Overview
This document outlines the API integration status and requirements for all screens in the Luna Ecom app.

## Centralized API Configuration
✅ **Created**: `src/config/api.js`
- Contains all API endpoints
- Provides helper functions: `getApiUrl()`, `getImageUrl()`, `apiRequest()`, `apiRequestFormData()`
- Base URL: `https://luna-api.proteinbros.in/public/api/v1`

## Bottom Navigation
✅ **Updated**: `src/navigation/BottomTabs.js`
- Clean structure with 5 tabs: Home, Wishlist, Celebrities, Cart, Profile
- Proper icons and labels
- Better styling

## API Endpoints Available

### Authentication (`/api/v1/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /verify-otp` - OTP verification
- `POST /update-profile` - Update user profile

### Screen/Home (`/api/v1/screen/`)
- `POST /home` - Home data
- `GET /all-category` - All categories
- `POST /stories` - Stories
- `POST /products` - Products list
- `POST /products/details` - Product details
- `POST /products/hot` - Hot products
- `POST /products/latest` - Latest products
- `POST /products/trending` - Trending products
- `POST /products/best` - Best products
- `POST /products/flash` - Flash sale products
- `POST /brand/products` - Brand products
- `POST /sub-category/products` - Sub-category products
- `POST /wishlist` - Get wishlist
- `POST /wishlist/toggle` - Toggle wishlist
- `POST /recently-viewed` - Recently viewed products
- `POST /recently-viewed/add` - Add to recently viewed

### User (requires auth) (`/api/v1/user/`)
- `GET /dashboard` - User dashboard
- `POST /profile/update` - Update profile
- `GET /orders` - User orders
- `GET /order/{id}/details` - Order details
- `GET /wishlists` - Wishlists
- `POST /wishlist/add` - Add to wishlist
- `GET /wishlist/remove/{id}` - Remove from wishlist
- `GET /my-size` - Get user size
- `POST /my-size/store` - Store user size
- `POST /my-size/update` - Update user size

### Order (`/api/v1/order/`)
- `POST /checkout` - Checkout
- `POST /get-my` - My orders

## Screens Status

### ✅ Completed
1. **Bottom Navigation** - Updated with proper structure
2. **API Config** - Centralized configuration created

### 🔄 Needs Update (Priority Order)

#### High Priority
1. **NewHome.js** - Main home screen
   - Update to use `API_ENDPOINTS.SCREEN.HOME`
   - Use `apiRequest()` helper

2. **WishlistScreen.js** - Wishlist
   - Update to use `API_ENDPOINTS.SCREEN.WISHLIST`
   - Use `getImageUrl()` helper

3. **CartScreen.js** - Shopping cart
   - Integrate with checkout API
   - Use `API_ENDPOINTS.ORDER.CHECKOUT`

4. **ProductDetailScreen.js** - Product details
   - Update to use `API_ENDPOINTS.SCREEN.PRODUCT_DETAILS`
   - Add review functionality

5. **CheckoutScreen.js** - Checkout
   - Use `API_ENDPOINTS.ORDER.CHECKOUT`
   - Integrate payment flow

#### Medium Priority
6. **HistoryScreen.js** - Order history
   - Use `API_ENDPOINTS.USER.ORDERS`
   - Use `API_ENDPOINTS.USER.ORDER_DETAILS`

7. **SettingsScreen.js** - Settings
   - Profile update API
   - Use `API_ENDPOINTS.USER.PROFILE_UPDATE`

8. **SettingsProfileScreen.js** - Profile settings
   - Use `API_ENDPOINTS.AUTH.UPDATE_PROFILE`

9. **CelebritiesScreen.js** - Celebrities/Vendors
   - Use `API_ENDPOINTS.SCREEN.VENDORS`

10. **CelebrityDetailScreen.js** - Celebrity details
    - Use `API_ENDPOINTS.SCREEN.VENDOR_PRODUCTS`

#### Lower Priority
11. **BestProductsScreen.js** - Best products
12. **FlashSaleScreen.js** - Flash sale
13. **TrendingProductsScreen.js** - Trending products
14. **AllNewProduct.js** - Latest products
15. **TopProductsScreen.js** - Top products
16. **BrandStoreScreen.js** - Brand store
17. **CategoryProductScreen.js** - Category products
18. **SubCategoryProductsScreen.js** - Sub-category products
19. **RecentlyViewedScreen.js** - Recently viewed
20. **WalletScreen.js** - Wallet
21. **VoucherScreen.js** - Vouchers
22. **GiftCardBrowse.js** - Gift cards
23. **OrderDetailsScreen.js** - Order details
24. **ToReceiveOrdersScreen.js** - To receive orders
25. **And 50+ more screens...**

## Migration Pattern

### Before:
```javascript
const BASE_URL = 'https://luna-api.proteinbros.in/public/api/v1';
const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

const response = await fetch(`${BASE_URL}/screen/wishlist`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
});
```

### After:
```javascript
import { API_ENDPOINTS, apiRequest, getImageUrl } from '../config/api';

const { data } = await apiRequest(API_ENDPOINTS.SCREEN.WISHLIST, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
});

const imageUrl = getImageUrl(product.photo);
```

## Next Steps

1. Update high-priority screens first
2. Test each screen after update
3. Update medium-priority screens
4. Complete remaining screens
5. Add error handling consistently
6. Add loading states
7. Add proper authentication token handling

## Notes

- All screens should import from `src/config/api.js`
- Use `apiRequest()` for JSON requests
- Use `apiRequestFormData()` for file uploads
- Use `getImageUrl()` for all image URLs
- Add proper error handling
- Add loading states
- Handle authentication tokens properly

