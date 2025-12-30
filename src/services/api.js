// Centralized API Service for Luna E-Commerce App
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Update this to match your backend
const API_BASE_URL = 'https://luna-api.proteinbros.in/public/api/v1';
// Alternative: const API_BASE_URL = 'https://argosmob.uk/luna/public/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const userData = await AsyncStorage.getItem('luna_user');
      if (userData) {
        const user = JSON.parse(userData);
        const token = user?.token || user?.user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear storage and redirect to login
      AsyncStorage.removeItem('luna_user');
    }
    return Promise.reject(error);
  }
);

// Helper to get user ID from storage
const getUserId = async () => {
  try {
    const userData = await AsyncStorage.getItem('luna_user');
    if (userData) {
      const user = JSON.parse(userData);
      return user?.user?.id || user?.id || user?.data?.id;
    }
  } catch (error) {
    console.log('Error getting user ID:', error);
  }
  return null;
};

// ==================== AUTH API ====================
export const authAPI = {
  // Register
  register: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return apiClient.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Login
  login: async (emailPhone) => {
    const formData = new FormData();
    formData.append('email_phone', emailPhone);
    return apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Verify OTP
  verifyOtp: async (emailPhone, otp) => {
    const formData = new FormData();
    formData.append('email_phone', emailPhone);
    formData.append('otp', otp);
    return apiClient.post('/auth/verify-otp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update Profile
  updateProfile: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return apiClient.post('/auth/update-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ==================== CART API ====================
export const cartAPI = {
  // Get cart
  getCart: async (userId) => {
    return apiClient.post('/cart/get', { user_id: userId });
  },

  // Add to cart
  addToCart: async (userId, productId, quantity = 1, size = null, color = null) => {
    const payload = {
      user_id: userId,
      product_id: productId,
      quantity,
    };
    if (size) payload.size = size;
    if (color) payload.color = color;
    return apiClient.post('/cart/add', payload);
  },

  // Update cart item
  updateCart: async (userId, productId, quantity) => {
    return apiClient.post('/cart/update', {
      user_id: userId,
      product_id: productId,
      quantity,
    });
  },

  // Remove from cart - accepts either product_id or cart_id
  removeFromCart: async (userId, productIdOrCartId, useCartId = false) => {
    const payload = { user_id: userId };
    if (useCartId) {
      payload.cart_id = productIdOrCartId;
    } else {
      payload.product_id = productIdOrCartId;
    }
    return apiClient.post('/cart/remove', payload);
  },

  // Clear cart
  clearCart: async (userId) => {
    return apiClient.post('/cart/clear', { user_id: userId });
  },
};

// ==================== ADDRESS API ====================
export const addressAPI = {
  // Get addresses
  getAddresses: async (userId) => {
    return apiClient.post('/address/list', { user_id: userId });
  },

  // Add address
  addAddress: async (data) => {
    return apiClient.post('/address/add', data);
  },

  // Update address
  updateAddress: async (id, data) => {
    return apiClient.post(`/address/update/${id}`, data);
  },

  // Delete address
  deleteAddress: async (userId, id) => {
    return apiClient.post(`/address/delete/${id}`, { user_id: userId });
  },

  // Set default address
  setDefault: async (userId, id) => {
    return apiClient.post(`/address/set-default/${id}`, { user_id: userId });
  },
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
  // Get notifications
  getNotifications: async (userId, limit = 20) => {
    return apiClient.post('/notification/list', { user_id: userId, limit });
  },

  // Mark as read
  markAsRead: async (userId, notificationId) => {
    return apiClient.post('/notification/mark-read', {
      user_id: userId,
      notification_id: notificationId,
    });
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    return apiClient.post('/notification/mark-all-read', { user_id: userId });
  },

  // Delete notification
  deleteNotification: async (userId, notificationId) => {
    return apiClient.post(`/notification/delete/${notificationId}`, {
      user_id: userId,
    });
  },
};

// ==================== CHAT SUPPORT API ====================
export const chatSupportAPI = {
  // Get messages
  getMessages: async (userId, limit = 50) => {
    return apiClient.post('/chat/messages', { user_id: userId, limit });
  },

  // Send message
  sendMessage: async (userId, message, type = 'text') => {
    return apiClient.post('/chat/send', {
      user_id: userId,
      message,
      type,
    });
  },

  // Get chat history
  getChatHistory: async (userId) => {
    return apiClient.post('/chat/history', { user_id: userId });
  },
};

// ==================== SUBSCRIPTION API ====================
export const subscriptionAPI = {
  // Get tiers and plans
  getTiersAndPlans: async () => {
    return apiClient.post('/subscription/tiers-plans', {});
  },

  // Get user stats
  getUserStats: async (userId) => {
    return apiClient.post('/subscription/user-stats', { user_id: userId });
  },

  // Subscribe
  subscribe: async (userId, planId) => {
    return apiClient.post('/subscription/subscribe', {
      user_id: userId,
      plan_id: planId,
    });
  },
};

// ==================== VOUCHER API ====================
export const voucherAPI = {
  // Get user vouchers
  getUserVouchers: async (userId) => {
    return apiClient.post('/voucher/list', { user_id: userId });
  },

  // Collect voucher
  collectVoucher: async (userId, couponId) => {
    return apiClient.post('/voucher/collect', {
      user_id: userId,
      coupon_id: couponId,
    });
  },
};

// ==================== WALLET API ====================
export const walletAPI = {
  // Get wallet info
  getWalletInfo: async (userId) => {
    return apiClient.post('/wallet/info', { user_id: userId });
  },

  // Get purchase history
  getPurchaseHistory: async (userId) => {
    return apiClient.post('/wallet/purchase-history', { user_id: userId });
  },

  // Get reward transactions
  getRewardTransactions: async (userId) => {
    return apiClient.post('/wallet/reward-transactions', { user_id: userId });
  },
};

// ==================== GIFT CARD API ====================
export const giftCardAPI = {
  // Get gift cards
  getGiftCards: async () => {
    return apiClient.post('/gift-card/list', {});
  },

  // Purchase gift card
  purchaseGiftCard: async (data) => {
    return apiClient.post('/gift-card/purchase', data);
  },

  // Get user gift cards
  getUserGiftCards: async (userId) => {
    return apiClient.post('/gift-card/my-cards', { user_id: userId });
  },

  // Validate gift card
  validateGiftCard: async (code) => {
    return apiClient.post('/gift-card/validate', { code });
  },

  // Get received gift cards
  getReceivedGiftCards: async (userId) => {
    return apiClient.post('/gift-card/received', { user_id: userId });
  },

  // Redeem gift card
  redeemGiftCard: async (userId, code) => {
    return apiClient.post('/gift-card/redeem', {
      user_id: userId,
      code,
    });
  },
};

// ==================== ORDER API ====================
export const orderAPI = {
  // Checkout
  checkout: async (data) => {
    return apiClient.post('/order/checkout', data);
  },

  // Get my orders
  getMyOrders: async (userId) => {
    return apiClient.post('/order/get-my', { user_id: userId });
  },

  // Order details - accepts order_number or order_id
  getOrderDetails: async (orderNumberOrId, userId = null) => {
    const payload = {};
    // Check if it's a number (ID) or string (order_number)
    if (typeof orderNumberOrId === 'number' || /^\d+$/.test(orderNumberOrId)) {
      payload.order_id = orderNumberOrId;
    } else {
      payload.order_number = orderNumberOrId;
    }
    if (userId) payload.user_id = userId;
    return apiClient.post('/order/details', payload);
  },

  // Get activity stats
  getActivityStats: async (userId, year = null, month = null) => {
    const payload = { user_id: userId };
    if (year !== null) payload.year = year;
    if (month !== null) payload.month = month;
    return apiClient.post('/order/activity-stats', payload);
  },

  // Update order status
  updateOrderStatus: async (data) => {
    return apiClient.post('/order/update-status', data);
  },

  // Get coupon
  getCoupon: async (code) => {
    return apiClient.post('/order/coupon', { code });
  },

  // Get shipping packaging
  getShippingPackaging: async () => {
    return apiClient.post('/order/shipping-packaging', {});
  },

  // Get vendor shipping
  getVendorShipping: async (vendorId) => {
    return apiClient.post('/order/vendor-shipping', { vendor_id: vendorId });
  },

  // Get countries
  getCountries: async () => {
    return apiClient.get('/order/countries');
  },
};

// ==================== IMAGE SEARCH API ====================
export const imageSearchAPI = {
  // Search by image
  searchByImage: async (imageUri, userId = null) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'search.jpg',
    });
    if (userId) {
      formData.append('user_id', userId);
    }
    return apiClient.post('/image-search/search', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ==================== LIVE STREAM API ====================
export const liveStreamAPI = {
  // Get Agora token
  getAgoraToken: async (channelName, userId, role = 'broadcaster') => {
    return apiClient.post('/stream/token', {
      channel_name: channelName,
      user_id: userId,
      role,
    });
  },

  // Create stream
  createStream: async (data) => {
    return apiClient.post('/stream/create', data);
  },

  // Get active streams
  getActiveStreams: async () => {
    return apiClient.post('/stream/list', {});
  },

  // Get stream details
  getStreamDetails: async (streamId) => {
    return apiClient.post('/stream/details', { stream_id: streamId });
  },

  // End stream
  endStream: async (streamId, userId) => {
    return apiClient.post('/stream/end', {
      stream_id: streamId,
      user_id: userId,
    });
  },

  // Viewer join
  viewerJoin: async (streamId, userId) => {
    return apiClient.post('/stream/viewer-join', {
      stream_id: streamId,
      user_id: userId,
    });
  },

  // Viewer leave
  viewerLeave: async (streamId, userId) => {
    return apiClient.post('/stream/viewer-leave', {
      stream_id: streamId,
      user_id: userId,
    });
  },

  // Like stream
  likeStream: async (streamId, userId) => {
    return apiClient.post('/stream/like', {
      stream_id: streamId,
      user_id: userId,
    });
  },
};

// ==================== CONTACT PREFERENCES API ====================
export const contactPreferencesAPI = {
  // Get preferences
  getPreferences: async (userId) => {
    return apiClient.post('/contact-preferences/get', { user_id: userId });
  },

  // Save preferences
  savePreferences: async (userId, preferences) => {
    return apiClient.post('/contact-preferences/save', {
      user_id: userId,
      ...preferences,
    });
  },
};

// ==================== HOME/SCREEN API ====================
export const homeAPI = {
  // Get home data
  getHomeData: async (userId = null) => {
    const payload = userId ? { user_id: userId } : {};
    return apiClient.post('/screen/home', payload);
  },

  // Get all categories
  getCategories: async () => {
    return apiClient.get('/screen/all-category');
  },

  // Get stories
  getStories: async () => {
    return apiClient.post('/screen/stories', {});
  },

  // Get discovers
  getDiscovers: async () => {
    return apiClient.post('/screen/discovers', {});
  },

  // Get vendors (celebrities)
  getVendors: async () => {
    return apiClient.post('/screen/vendors', {});
  },

  // Get brands
  getBrands: async () => {
    return apiClient.post('/screen/brands', {});
  },

  // Get coupons
  getCoupons: async () => {
    return apiClient.post('/screen/coupons', {});
  },

  // Get products
  getProducts: async (filters = {}) => {
    return apiClient.post('/screen/products', filters);
  },

  // Get product details
  getProductDetails: async (productId, userId = null) => {
    const payload = { product_id: productId };
    if (userId) payload.user_id = userId;
    return apiClient.post('/screen/products/details', payload);
  },

  // Add review
  addReview: async (data) => {
    return apiClient.post('/screen/products/add-review', data);
  },

  // Edit review
  editReview: async (data) => {
    return apiClient.post('/screen/products/edit-review', data);
  },

  // Get hot products
  getHotProducts: async () => {
    return apiClient.post('/screen/products/hot', {});
  },

  // Get latest products
  getLatestProducts: async () => {
    return apiClient.post('/screen/products/latest', {});
  },

  // Get trending products
  getTrendingProducts: async () => {
    return apiClient.post('/screen/products/trending', {});
  },

  // Get best products
  getBestProducts: async () => {
    return apiClient.post('/screen/products/best', {});
  },

  // Get sale products
  getSaleProducts: async () => {
    return apiClient.post('/screen/products/sale', {});
  },

  // Get flash sale products
  getFlashProducts: async () => {
    return apiClient.post('/screen/products/flash', {});
  },

  // Get celebrity/vendor products
  getCelebrityProducts: async (vendorId) => {
    return apiClient.post('/screen/vendor/products', { vendor_id: vendorId });
  },

  // Get products by subcategory
  getProductsBySubCategory: async (subCategoryId) => {
    return apiClient.post('/screen/sub-category/products', {
      sub_category_id: subCategoryId,
    });
  },

  // Get products by brand
  getProductsByBrand: async (brandId) => {
    return apiClient.post('/screen/brand/products', { brand_id: brandId });
  },

  // Add recently viewed
  addRecentlyViewed: async (userId, productId) => {
    return apiClient.post('/screen/recently-viewed/add', {
      user_id: userId,
      product_id: productId,
    });
  },

  // Get recently viewed
  getRecentlyViewed: async (userId) => {
    return apiClient.post('/screen/recently-viewed', { user_id: userId });
  },

  // Toggle wishlist
  toggleWishlist: async (userId, productId) => {
    return apiClient.post('/screen/wishlist/toggle', {
      user_id: userId,
      product_id: productId,
    });
  },

  // Get wishlist
  getWishlist: async (userId) => {
    return apiClient.post('/screen/wishlist', { user_id: userId });
  },
};

// ==================== PRODUCT CHATBOT API ====================
export const productChatbotAPI = {
  // Product query
  productQuery: async (userId, productId, query) => {
    return apiClient.post('/chatbot/query', {
      user_id: userId,
      product_id: productId,
      query,
    });
  },

  // Get chat history
  getChatHistory: async (userId, productId) => {
    return apiClient.post('/chatbot/history', {
      user_id: userId,
      product_id: productId,
    });
  },

  // Check updates
  checkUpdates: async (userId, productId, lastMessageId) => {
    return apiClient.post('/chatbot/check-updates', {
      user_id: userId,
      product_id: productId,
      last_message_id: lastMessageId,
    });
  },
};

// Export all APIs
export default {
  authAPI,
  cartAPI,
  addressAPI,
  notificationAPI,
  chatSupportAPI,
  subscriptionAPI,
  voucherAPI,
  walletAPI,
  giftCardAPI,
  orderAPI,
  imageSearchAPI,
  liveStreamAPI,
  contactPreferencesAPI,
  homeAPI,
  productChatbotAPI,
  getUserId,
  API_BASE_URL,
};

