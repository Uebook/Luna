# Skeleton Loading Implementation Guide

This guide shows how to add skeleton loading to all 40+ screens in the app.

## Quick Implementation Steps

### Step 1: Import Required Components

Add these imports to your screen file:

```javascript
import { SkeletonProductListScreen, SkeletonListScreen, SkeletonNotificationScreen, SkeletonFormScreen, SkeletonProfileScreen, SkeletonProductDetailScreen, SkeletonCheckoutScreen, SkeletonCategoryScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
```

Or use the helper utility:

```javascript
import { getSkeletonType, getSkeletonProps } from '../utils/skeletonHelper';
import { SkeletonScreen } from '../components/SkeletonLoader';
```

### Step 2: Add Loading State

Replace existing loading states with skeleton:

**Before:**
```javascript
const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={THEME.brand} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

if (initialLoading) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <StandardHeader title="Screen Title" navigation={navigation} />
      <LoadingState />
    </SafeAreaView>
  );
}
```

**After:**
```javascript
if (initialLoading) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <StandardHeader title="Screen Title" navigation={navigation} />
      <SkeletonProductListScreen showHeader={false} showBanner={true} />
    </SafeAreaView>
  );
}
```

### Step 3: Screen Type Mapping

Use the appropriate skeleton type for each screen:

| Screen Type | Skeleton Component | Example Screens |
|------------|-------------------|-----------------|
| Product Grid | `SkeletonProductListScreen` | BestProductsScreen, TrendingProductsScreen, FlashSaleScreen, AllNewProductScreen, SubCategoryProductsScreen, CategoryProductScreen, BrandStoreScreen, WishlistScreen, SearchScreen, ExploreScreen |
| Product Detail | `SkeletonProductDetailScreen` | ProductDetailScreen, CelebrityDetail, StoriesScreen, StreamPlayerScreen |
| List/Notification | `SkeletonNotificationScreen` or `SkeletonListScreen` | NotificationScreen, ActivityScreen, HistoryScreen, OrderTrackingScreen, ToReceiveOrdersScreen, OrderDetails, CartScreen, WalletScreen, VoucherScreen |
| Profile/Settings | `SkeletonProfileScreen` | ProfileScreen, SettingsScreen, SettingsProfileScreen, AboutScreen |
| Form | `SkeletonFormScreen` | CreateAccount, ShippingAddressScreen, ChooseCountryScreen, ChooseCurrencyScreen, ChooseLanguageScreen, ChooseSizeScreen, PasswordRecoveryScreen, SetupNewPasswordScreen, PasswordTyping, SubscriptionScreen, ContactPreferencesNew |
| Checkout | `SkeletonCheckoutScreen` | CheckoutScreen, GiftCardReviewPay |
| Category Grid | `SkeletonCategoryScreen` | AllCategoriesScreen, SubcategoryListScreen, CelebritiesScreen |

## Implementation Examples

### Example 1: Product List Screen (BestProductsScreen.js)

```javascript
import { SkeletonProductListScreen } from '../components/SkeletonLoader';

// In component:
if (initialLoading) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <StandardHeader title="Best Products" navigation={navigation} showGradient={true} />
      <SkeletonProductListScreen columns={numColumns} showHeader={false} showBanner={true} />
    </SafeAreaView>
  );
}
```

### Example 2: List Screen (ActivityScreen.js)

```javascript
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

// In component:
const [loading, setLoading] = useSkeletonLoader(true, 600);

useEffect(() => {
  let alive = true;
  (async () => {
    setLoading(true);
    const data = await fetchData();
    if (!alive) return;
    setData(data);
    setLoading(false);
  })();
  return () => { alive = false; };
}, []);

if (loading) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <SkeletonListScreen />
    </SafeAreaView>
  );
}
```

### Example 3: Using Helper Utility (Automatic Type Detection)

```javascript
import { getSkeletonType, getSkeletonProps } from '../utils/skeletonHelper';
import { SkeletonScreen } from '../components/SkeletonLoader';

// In component:
const skeletonType = getSkeletonType('BestProductsScreen');
const skeletonProps = getSkeletonProps('BestProductsScreen');

if (initialLoading) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
      <StandardHeader title="Best Products" navigation={navigation} />
      <SkeletonScreen type={skeletonType} {...skeletonProps} />
    </SafeAreaView>
  );
}
```

## Complete Screen List with Skeleton Types

### Product Screens (Use SkeletonProductListScreen)
- BestProductsScreen.js
- AllNewProduct.js
- TrendingProductsScreen.js
- TopProductsScreen.js
- FlashSaleScreen.js
- SubCategoryProductsScreen.js
- CategoryProductScreen.js
- BrandStoreScreen.js
- AIproductResultsScreen.js
- ImageSearchResults.js
- SearchScreen.js
- ExploreScreen.js
- AISearchScreen.js
- WishlistScreen.js

### Detail Screens (Use SkeletonProductDetailScreen)
- ProductDetailScreen.js
- CelebrityDetailScreen.js
- StoriesScreen.js
- StreamPlayerScreen.js

### List/Notification Screens (Use SkeletonListScreen or SkeletonNotificationScreen)
- NotificationScreen.js ✅ (Already implemented)
- ActivityScreen.js
- HistoryScreen.js
- OrderTrackingScreen.js
- ToReceiveOrdersScreen.js
- OrderDetailsScreen.js
- CartScreen.js
- WalletScreen.js
- VoucherScreen.js
- ChatBotModal.js
- ChatSupportScreen.js

### Profile/Settings Screens (Use SkeletonProfileScreen)
- ProfileScreen.js
- SettingsScreen.js
- SettingsProfileScreen.js
- AboutScreen.js

### Form Screens (Use SkeletonFormScreen)
- CreateAccount.js
- ShippingAddressScreen.js
- ChooseCountryScreen.js
- ChooseCurrencyScreen.js
- ChooseLanguageScreen.js
- ChooseSizeScreen.js
- PasswordRecoveryScreen.js
- PasswordRecoveryScreenS.js
- PasswordScreen.js
- PasswordTyping.js
- SetupNewPasswordScreen.js
- SubscriptionScreen.js
- ContactPreferencesNew.js
- ReviewScreen.js

### Checkout Screens (Use SkeletonCheckoutScreen)
- CheckoutScreen.js
- GiftCardReviewPay.js
- GiftCardBrowse.js (can use product type)

### Category Screens (Use SkeletonCategoryScreen)
- AllCategoriesScreen.js
- SubcategoryListScreen.js
- CelebritiesScreen.js

### Special Screens (No skeleton needed)
- LoginScreen.js (instant load)
- OnboardingScreen.js (instant load)
- SplashScreen.js (instant load)
- SplashVideoScreen.js (instant load)
- GiftCardSuccess.js (instant load)

## Quick Batch Update Script

For screens that use `initialLoading` state pattern:

1. Find: `const LoadingState = () =>`
2. Replace with skeleton import and usage
3. Remove `LoadingState` component
4. Update `if (initialLoading)` block to use skeleton

## Testing Checklist

- [ ] Skeleton appears immediately on screen load
- [ ] Skeleton matches screen layout
- [ ] Smooth transition from skeleton to content
- [ ] No flickering or layout shifts
- [ ] Works on both iOS and Android
- [ ] Proper theme colors applied

## Notes

- Skeleton screens automatically use theme colors
- Shimmer animation is included
- All skeletons are responsive
- Minimum loading time can be set with `useSkeletonLoader` hook

