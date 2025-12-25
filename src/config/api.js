/**
 * Centralized API Configuration
 * All API endpoints and base URLs should be defined here
 */

// API Base URLs
export const API_BASE_URL = 'https://luna-api.proteinbros.in/public/api/v1';
export const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';
export const ASSETS_BASE_URL = 'https://proteinbros.in/assets/';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    UPDATE_PROFILE: '/auth/update-profile',
    LOGOUT: '/user/logout',
    FORGOT_PASSWORD: '/user/forgot',
    FORGOT_SUBMIT: '/user/forgot/submit',
  },

  // Screen/Home
  SCREEN: {
    HOME: '/screen/home',
    ALL_CATEGORY: '/screen/all-category',
    STORIES: '/screen/stories',
    DISCOVERS: '/screen/discovers',
    VENDORS: '/screen/vendors',
    BRANDS: '/screen/brands',
    COUPONS: '/screen/coupons',
    PRODUCTS: '/screen/products',
    PRODUCT_DETAILS: '/screen/products/details',
    ADD_REVIEW: '/screen/products/add-review',
    EDIT_REVIEW: '/screen/products/edit-review',
    HOT_PRODUCTS: '/screen/products/hot',
    LATEST_PRODUCTS: '/screen/products/latest',
    TRENDING_PRODUCTS: '/screen/products/trending',
    BEST_PRODUCTS: '/screen/products/best',
    SALE_PRODUCTS: '/screen/products/sale',
    FLASH_PRODUCTS: '/screen/products/flash',
    VENDOR_PRODUCTS: '/screen/vendor/products',
    SUB_CATEGORY_PRODUCTS: '/screen/sub-category/products',
    BRAND_PRODUCTS: '/screen/brand/products',
    RECENTLY_VIEWED_ADD: '/screen/recently-viewed/add',
    RECENTLY_VIEWED: '/screen/recently-viewed',
    WISHLIST_TOGGLE: '/screen/wishlist/toggle',
    WISHLIST: '/screen/wishlist',
  },

  // User (requires auth)
  USER: {
    DASHBOARD: '/user/dashboard',
    PROFILE_UPDATE: '/user/profile/update',
    PASSWORD_UPDATE: '/user/password/update',
    FAVORITE_VENDORS: '/user/favorite/vendors',
    FAVORITE_STORE: '/user/favorite/store',
    FAVORITE_DELETE: '/user/favorite/delete',
    ORDERS: '/user/orders',
    ORDER_DETAILS: '/user/order',
    UPDATE_TRANSACTION: '/user/update/transactionid',
    WISHLISTS: '/user/wishlists',
    WISHLIST_ADD: '/user/wishlist/add',
    WISHLIST_REMOVE: '/user/wishlist/remove',
    MY_SIZE: '/user/my-size',
    MY_SIZE_STORE: '/user/my-size/store',
    MY_SIZE_UPDATE: '/user/my-size/update',
  },

  // Frontend (public)
  FRONT: {
    SLIDERS: '/front/sliders',
    SETTINGS: '/front/settings',
    PRODUCTS: '/front/products',
    PRODUCT_DETAILS: '/front/product',
    CATEGORIES: '/front/categories',
    SEARCH: '/front/search',
    CHECKOUT: '/front/checkout',
    ORDER_TRACK: '/front/ordertrack',
  },

  // Order
  ORDER: {
    CHECKOUT: '/order/checkout',
    MY_ORDERS: '/order/get-my',
  },
};

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Get image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

/**
 * API Request Helper
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', text);
      throw new Error('Invalid JSON response');
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { data, response };
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * API Request with FormData (for file uploads)
 */
export const apiRequestFormData = async (endpoint, formData, options = {}) => {
  const url = getApiUrl(endpoint);
  const defaultOptions = {
    headers: {
      'Accept': 'application/json',
    },
    body: formData,
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', text);
      throw new Error('Invalid JSON response');
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { data, response };
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

