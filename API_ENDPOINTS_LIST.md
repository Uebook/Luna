# Luna E-Commerce API Endpoints

**Base URL:** `https://luna-api.proteinbros.in/public/api/v1`

All endpoints use POST method unless specified otherwise.

---

## 🔐 Authentication APIs (`/v1/auth`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/auth/register` | POST | `register` | User registration |
| `/auth/login` | POST | `login` | User login |
| `/auth/verify-otp` | POST | `verifyOtp` | Verify OTP code |
| `/auth/update-profile` | POST | `updateProfile` | Update user profile |

---

## 🛒 Cart APIs (`/v1/cart`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/cart/get` | POST | `getCart` | Get user's cart |
| `/cart/add` | POST | `addToCart` | Add product to cart |
| `/cart/update` | POST | `updateCart` | Update cart item |
| `/cart/remove` | POST | `removeFromCart` | Remove item from cart |
| `/cart/clear` | POST | `clearCart` | Clear entire cart |

---

## 📍 Address APIs (`/v1/address`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/address/list` | POST | `getAddresses` | Get user addresses |
| `/address/add` | POST | `addAddress` | Add new address |
| `/address/update/{id}` | POST | `updateAddress` | Update address by ID |
| `/address/delete/{id}` | POST | `deleteAddress` | Delete address by ID |
| `/address/set-default/{id}` | POST | `setDefault` | Set default address |

---

## 🔔 Notification APIs (`/v1/notification`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/notification/list` | POST | `getNotifications` | Get user notifications |
| `/notification/mark-read` | POST | `markAsRead` | Mark notification as read |
| `/notification/mark-all-read` | POST | `markAllAsRead` | Mark all notifications as read |
| `/notification/delete/{id}` | POST | `deleteNotification` | Delete notification by ID |

---

## 💬 Chat Support APIs (`/v1/chat`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/chat/messages` | POST | `getMessages` | Get chat messages |
| `/chat/send` | POST | `sendMessage` | Send chat message |
| `/chat/history` | POST | `getChatHistory` | Get chat history |

---

## 💳 Subscription APIs (`/v1/subscription`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/subscription/tiers-plans` | POST | `getTiersAndPlans` | Get subscription tiers and plans |
| `/subscription/user-stats` | POST | `getUserStats` | Get user subscription stats |
| `/subscription/subscribe` | POST | `subscribe` | Subscribe to a plan |

---

## 🎟️ Voucher APIs (`/v1/voucher`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/voucher/list` | POST | `getUserVouchers` | Get user vouchers |
| `/voucher/collect` | POST | `collectVoucher` | Collect a voucher |

---

## 💰 Wallet APIs (`/v1/wallet`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/wallet/info` | POST | `getWalletInfo` | Get wallet info (points, balance) |
| `/wallet/purchase-history` | POST | `getPurchaseHistory` | Get purchase history |
| `/wallet/reward-transactions` | POST | `getRewardTransactions` | Get reward transactions |

---

## 🎁 Gift Card APIs (`/v1/gift-card`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/gift-card/list` | POST | `getGiftCards` | Get available gift cards |
| `/gift-card/purchase` | POST | `purchaseGiftCard` | Purchase a gift card |
| `/gift-card/my-cards` | POST | `getUserGiftCards` | Get user's gift cards |
| `/gift-card/validate` | POST | `validateGiftCard` | Validate gift card code |
| `/gift-card/received` | POST | `getReceivedGiftCards` | Get received gift cards |
| `/gift-card/redeem` | POST | `redeemGiftCard` | Redeem gift card |

---

## 📦 Order APIs (`/v1/order`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/order/checkout` | POST | `checkout` | Place an order |
| `/order/get-my` | POST | `myOrders` | Get user orders |
| `/order/details` | POST | `orderDetails` | Get order details |
| `/order/activity-stats` | POST | `getActivityStats` | Get activity statistics |
| `/order/update-status` | POST | `updateOrderStatus` | Update order status |
| `/order/coupon` | POST | `getCoupon` | Get coupon details |
| `/order/shipping-packaging` | POST | `getShippingPackaging` | Get shipping and packaging options |
| `/order/vendor-shipping` | POST | `VendorWisegetShippingPackaging` | Get vendor-wise shipping |
| `/order/countries` | GET | `countries` | Get countries list |

---

## 🛍️ Checkout APIs (`/v1/checkout`) - Legacy

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/checkout/checkout` | POST | `store` | Legacy checkout (use `/order/checkout`) |
| `/checkout/get-my` | POST | `myOrders` | Legacy get orders (use `/order/get-my`) |

---

## 🖼️ Image Search APIs (`/v1/image-search`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/image-search/search` | POST | `searchByImage` | Search products by image |

---

## 📺 Live Stream APIs (`/v1/stream`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/stream/token` | POST | `getAgoraToken` | Get Agora streaming token |
| `/stream/create` | POST | `createStream` | Create a live stream |
| `/stream/list` | POST | `getActiveStreams` | Get active streams |
| `/stream/details` | POST | `getStreamDetails` | Get stream details |
| `/stream/end` | POST | `endStream` | End a stream |
| `/stream/viewer-join` | POST | `viewerJoin` | Viewer joins stream |
| `/stream/viewer-leave` | POST | `viewerLeave` | Viewer leaves stream |
| `/stream/like` | POST | `likeStream` | Like a stream |

---

## ⚙️ Contact Preferences APIs (`/v1/contact-preferences`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/contact-preferences/get` | POST | `getPreferences` | Get contact preferences |
| `/contact-preferences/save` | POST | `savePreferences` | Save contact preferences |

---

## 🏠 Screen/Home APIs (`/v1/screen`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/screen/home` | POST | `homeData` | Get home screen data |
| `/screen/all-category` | GET/POST | `getCategories` | Get all categories |
| `/screen/stories` | POST | `stories` | Get stories |
| `/screen/discovers` | POST | `discovers` | Get discover content |
| `/screen/vendors` | POST | `vendors` | Get vendors |
| `/screen/brands` | POST | `brands` | Get brands |
| `/screen/coupons` | POST | `coupons` | Get coupons |
| `/screen/products` | POST | `products` | Get products |
| `/screen/products/details` | POST | `productDetails` | Get product details |
| `/screen/products/add-review` | POST | `addReview` | Add product review |
| `/screen/products/edit-review` | POST | `editReview` | Edit product review |
| `/screen/products/hot` | POST | `hotProducts` | Get hot products |
| `/screen/products/latest` | POST | `latestProducts` | Get latest products |
| `/screen/products/trending` | POST | `trendingProducts` | Get trending products |
| `/screen/products/best` | POST | `bestProducts` | Get best products |
| `/screen/products/sale` | POST | `saleProducts` | Get sale products |
| `/screen/products/flash` | POST | `flashProducts` | Get flash sale products |
| `/screen/vendor/products` | POST | `celebrityProducts` | Get vendor/celebrity products |
| `/screen/sub-category/products` | POST | `getProductsBySubCategory` | Get products by subcategory |
| `/screen/brand/products` | POST | `getProductsByBrand` | Get products by brand |
| `/screen/recently-viewed/add` | POST | `addProduct` | Add to recently viewed |
| `/screen/recently-viewed` | POST | `getProducts` | Get recently viewed products |
| `/screen/wishlist/toggle` | POST | `toggleWishlistProduct` | Toggle wishlist product |
| `/screen/wishlist` | POST | `getWishlistProducts` | Get wishlist products |

---

## 🤖 Product Chatbot APIs (`/v1/chatbot`)

| Endpoint | Method | Function | Description |
|----------|--------|----------|-------------|
| `/chatbot/query` | POST | `productQuery` | Query product chatbot |
| `/chatbot/history` | POST | `getChatHistory` | Get chatbot history |
| `/chatbot/check-updates` | POST | `checkUpdates` | Check for updates |

---

## 📊 Summary

**Total API Endpoints: 78**

### By Category:
- **Authentication:** 4 endpoints
- **Cart:** 5 endpoints
- **Address:** 5 endpoints
- **Notification:** 4 endpoints
- **Chat Support:** 3 endpoints
- **Subscription:** 3 endpoints
- **Voucher:** 2 endpoints
- **Wallet:** 3 endpoints
- **Gift Card:** 6 endpoints
- **Order:** 9 endpoints
- **Checkout (Legacy):** 2 endpoints
- **Image Search:** 1 endpoint
- **Live Stream:** 7 endpoints
- **Contact Preferences:** 2 endpoints
- **Screen/Home:** 20 endpoints
- **Product Chatbot:** 3 endpoints

---

## 🔑 Authentication

Most endpoints require authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

The token is obtained from the `/auth/login` or `/auth/verify-otp` endpoints.

---

## 📝 Notes

1. All POST endpoints accept JSON data in the request body
2. Most endpoints require `user_id` in the request payload
3. Image upload endpoints may use `multipart/form-data`
4. The `/order/countries` endpoint is GET, all others are POST
5. Legacy checkout endpoints are maintained for backward compatibility

---

**Last Updated:** Based on routes file from live admin panel

