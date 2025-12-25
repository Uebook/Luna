/**
 * Skeleton Helper Utility
 * 
 * Maps screen names to appropriate skeleton types for automatic skeleton loading.
 * This helps apply skeleton loading consistently across all screens.
 */

export const getSkeletonType = (screenName) => {
  const screenTypeMap = {
    // Product screens
    'ProductDetailScreen': 'product-detail',
    'ProductResults': 'product',
    'AIproductResultsScreen': 'product',
    'ImageSearchResults': 'product',
    'BestProductsScreen': 'product',
    'AllNewProductScreen': 'product',
    'TrendingProductsScreen': 'product',
    'TopProductsScreen': 'product',
    'FlashSaleScreen': 'product',
    'SubCategoryProductsScreen': 'product',
    'CategoryProductScreen': 'product',
    
    // List screens
    'NotificationScreen': 'notification',
    'ActivityScreen': 'list',
    'HistoryScreen': 'list',
    'OrderTrackingScreen': 'list',
    'ToReceiveOrdersScreen': 'list',
    'OrderDetails': 'list',
    
    // Category/Grid screens
    'AllCategoriesScreen': 'category',
    'SubcategoryListScreen': 'category',
    'CelebritiesScreen': 'category',
    'BrandStoreScreen': 'product',
    
    // Profile/Settings screens
    'ProfileScreen': 'profile',
    'SettingsScreen': 'profile',
    'SettingsProfileScreen': 'profile',
    'AboutScreen': 'profile',
    'ContactPreferencesNew': 'form',
    
    // Form screens
    'CreateAccount': 'form',
    'ShippingAddressScreen': 'form',
    'ChooseCountryScreen': 'form',
    'ChooseCurrencyScreen': 'form',
    'ChooseLanguageScreen': 'form',
    'ChooseSizeScreen': 'form',
    'PasswordRecoveryScreen': 'form',
    'SetupNewPasswordScreen': 'form',
    'PasswordTyping': 'form',
    
    // Checkout screens
    'CheckoutScreen': 'checkout',
    'GiftCardBrowse': 'product',
    'GiftCardReviewPay': 'checkout',
    
    // Other screens
    'WishlistScreen': 'product',
    'CartScreen': 'list',
    'WalletScreen': 'list',
    'SubscriptionScreen': 'form',
    'VoucherScreen': 'list',
    'SearchScreen': 'product',
    'ExploreScreen': 'product',
    'AISearch': 'product',
    
    // Detail screens
    'CelebrityDetail': 'product-detail',
    'StoriesScreen': 'product-detail',
    'StreamPlayerScreen': 'product-detail',
    
    // Modal/Support screens
    'ChatBotModal': 'list',
    'ChatSupportScreen': 'list',
    'ReviewScreen': 'form',
  };

  return screenTypeMap[screenName] || 'list';
};

/**
 * Get skeleton props based on screen name
 */
export const getSkeletonProps = (screenName) => {
  const propsMap = {
    'BestProductsScreen': { columns: 2, showHeader: true, showBanner: true },
    'TrendingProductsScreen': { columns: 2, showHeader: true, showBanner: true },
    'FlashSaleScreen': { columns: 2, showHeader: true, showBanner: true },
    'AllNewProductScreen': { columns: 2, showHeader: true, showBanner: false },
    'SubCategoryProductsScreen': { columns: 2, showHeader: true, showBanner: true },
    'CategoryProductScreen': { columns: 2, showHeader: true, showBanner: false },
    'BrandStoreScreen': { columns: 2, showHeader: true, showBanner: true },
    'WishlistScreen': { columns: 2, showHeader: false, showBanner: false },
    'SearchScreen': { columns: 2, showHeader: true, showBanner: false },
    'ExploreScreen': { columns: 2, showHeader: true, showBanner: false },
  };

  return propsMap[screenName] || {};
};

export default { getSkeletonType, getSkeletonProps };

