// navigation/RootNavigator.js
import React, { lazy } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Critical screens - load immediately
import BottomTabs from './BottomTabs';
import SplashVideoScreen from '../screen/SplashVideoScreen';
import NewHome from '../screen/NewHome';
import LoginScreen from '../screen/LoginScreen';
import OnboardingScreen from '../screen/OnboardingScreen';

// Lazy load all other screens for better performance
const SplashScreen = lazy(() => import('../screen/SplashScreen'));
const CreateAccountScreen = lazy(() => import('../screen/CreateAccount'));
const ChatBotModal = lazy(() => import('../screen/ChatBotModal'));
const HistoryScreen = lazy(() => import('../screen/HistoryScreen'));
const OrderTrackingScreen = lazy(() => import('../screen/OrderTrackingScreen'));
const PasswordRecoveryScreen = lazy(() => import('../screen/PasswordRecoveryScreen'));
const PasswordScreen = lazy(() => import('../screen/PasswordScreen'));
const SetupNewPasswordScreen = lazy(() => import('../screen/SetupNewPasswordScreen'));
const ToReceiveOrdersScreen = lazy(() => import('../screen/ToReceiveOrdersScreen'));
const CartScreen = lazy(() => import('../CartScreen'));
const ProfileScreen = lazy(() => import('../ProfileScreen'));
const RecentlyViewedScreen = lazy(() => import('../RecentlyViewedScreen'));
const ReviewScreen = lazy(() => import('../ReviewScreen'));
const ShopScreen = lazy(() => import('../ShopScreen'));
const WishlistScreen = lazy(() => import('../WishlistScreen'));
const ProductDetailScreen = lazy(() => import('../screen/ProductDetailScreen'));
const ActivityScreen = lazy(() => import('../screen/ActivityScreen'));
const NotificationScreen = lazy(() => import('../screen/NotificationScreen'));
const SettingsProfileScreen = lazy(() => import('../screen/SettingsProfileScreen'));
const ShippingAddressScreen = lazy(() => import('../screen/ShippingAddressScreen'));
const ChooseCountryScreen = lazy(() => import('../screen/ChooseCountryScreen'));
const ChooseCurrencyScreen = lazy(() => import('../screen/ChooseCurrencyScreen'));
const ChooseSizeScreen = lazy(() => import('../screen/ChooseSizeScreen'));
const TermsAndConditionsScreen = lazy(() => import('../screen/TermsAndConditionsScreen'));
const AboutScreen = lazy(() => import('../screen/AboutScreen'));
const ChooseLanguageScreen = lazy(() => import('../screen/ChooseLanguageScreen'));
const CategoriesFilterScreen = lazy(() => import('../screen/CategoriesFilterScreen'));
const VoucherScreen = lazy(() => import('../screen/VoucherScreen'));
const FlashSaleScreen = lazy(() => import('../screen/FlashSaleScreen'));
const LiveProductCard = lazy(() => import('../screen/LiveProductCard'));
const ChatSupportScreen = lazy(() => import('../screen/ChatSupportScreen'));
const PasswordTyping = lazy(() => import('../screen/PasswordTyping'));
const TopProductsScreen = lazy(() => import('../screen/TopProductsScreen'));
const ImageSearchResults = lazy(() => import('../screen/ImageSearchResults'));
const CelebrityDetailScreen = lazy(() => import('../screen/CelebrityDetailScreen'));
const CheckoutScreen = lazy(() => import('../screen/CheckoutScreen'));
const SearchScreen = lazy(() => import('../screen/SearchScreen'));
const CategoryProductScreen = lazy(() => import('../screen/CategoryProductScreen'));
const WalletScreen = lazy(() => import('../screen/WalletScreen'));
const SubscriptionScreen = lazy(() => import('../screen/SubscriptionScreen'));
const ContactPreferencesNew = lazy(() => import('../screen/ContactPreferencesNew'));
const OrderDetailsScreen = lazy(() => import('../screen/OrderDetailsScreen'));
const RefundPolicyScreen = lazy(() => import('../screen/RefundPolicyScreen'));
const PrivacyPolicyScreen = lazy(() => import('../screen/PrivacyPolicyScreen'));
const GiftCardBrowse = lazy(() => import('../screen/GiftCardBrowse'));
const GiftCardReviewPay = lazy(() => import('../screen/GiftCardReviewPay'));
const GiftCardSuccess = lazy(() => import('../screen/GiftCardSuccess'));
const StreamScreen = lazy(() => import('../screen/StreamScreen'));
const StreamPlayerScreen = lazy(() => import('../screen/StreamPlayerScreen'));
const AllCategoriesScreen = lazy(() => import('../screen/AllCategoriesScreen'));
const CelebritiesExploreScreen = lazy(() => import('../screen/CelebritiesScreen'));
const SubcategoryListScreen = lazy(() => import('../screen/SubcategoryListScreen'));
const AISearchScreen = lazy(() => import('../screen/AISearchScreen'));
const ProductResultsScreen = lazy(() => import('../screen/AIproductResultsScreen'));
const ExploreScreen = lazy(() => import('../screen/ExploreScreen'));
const BrandStoreScreen = lazy(() => import('../screen/BrandStoreScreen'));
const StoriesScreen = lazy(() => import('../screen/StoriesScreen'));
const BestProductsScreen = lazy(() => import('../screen/BestProductsScreen'));
const AllNewProductScreen = lazy(() => import('../screen/AllNewProduct'));
const TrendingProductsScreen = lazy(() => import('../screen/TrendingProductsScreen'));
const SubCategoryProductsScreen = lazy(() => import('../screen/SubCategoryProductsScreen'));
const ReceivedGiftScreen = lazy(() => import('../screen/ReceivedGiftScreen'));

// Wrapper component for lazy loaded screens
const LazyScreen = ({ component: Component, ...props }) => {
  return (
    <React.Suspense fallback={null}>
      <Component {...props} />
    </React.Suspense>
  );
};

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashVideoScreen"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashVideoScreen" component={SplashVideoScreen} />

        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />

        <Stack.Screen name="NewHome" component={NewHome} />

        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="MainApp" component={BottomTabs} />
        <Stack.Screen name="ChatBotModal" component={ChatBotModal} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
        <Stack.Screen name="TopProductsScreen" component={TopProductsScreen} />
        <Stack.Screen
          name="OrderTrackingScreen"
          component={OrderTrackingScreen}
        />
        <Stack.Screen
          name="PasswordRecoveryScreen"
          component={PasswordRecoveryScreen}
        />
        <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
        <Stack.Screen name="PasswordTyping" component={PasswordTyping} />

        <Stack.Screen
          name="SetNewPasswordScreen"
          component={SetupNewPasswordScreen}
        />
        <Stack.Screen
          name="ToReceiveOrdersScreen"
          component={ToReceiveOrdersScreen}
        />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen
          name="RecentlyViewedScreen"
          component={RecentlyViewedScreen}
        />
        <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
        <Stack.Screen name="ShopScreen" component={ShopScreen} />
        <Stack.Screen name="WishlistScreen" component={WishlistScreen} />

        <Stack.Screen name="BestProductsScreen" component={BestProductsScreen} />

        <Stack.Screen name="AllNewProductScreen" component={AllNewProductScreen} />
        <Stack.Screen name="TrendingProductsScreen" component={TrendingProductsScreen} />

        <Stack.Screen name="SubCategoryProductsScreen" component={SubCategoryProductsScreen} />

        {/* <Stack.Screen
          name="ShoppingHomeScreen"
          component={ShoppingHomeScreen}
        /> */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen
          name="ProductDetailScreen"
          component={ProductDetailScreen}
        />

        <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
        />
        <Stack.Screen
          name="SettingsProfileScreen"
          component={SettingsProfileScreen}
        />
        <Stack.Screen
          name="ShippingAddressScreen"
          component={ShippingAddressScreen}
        />
        <Stack.Screen
          name="ChooseCountryScreen"
          component={ChooseCountryScreen}
        />

        <Stack.Screen
          name="ChooseCurrencyScreen"
          component={ChooseCurrencyScreen}
        />

        <Stack.Screen name="ChooseSizeScreen" component={ChooseSizeScreen} />

        <Stack.Screen
          name="TermsAndConditionsScreen"
          component={TermsAndConditionsScreen}
        />

        <Stack.Screen name="AboutScreen" component={AboutScreen} />
        <Stack.Screen
          name="ChooseLanguageScreen"
          component={ChooseLanguageScreen}
        />
        <Stack.Screen
          name="CategoriesFilterScreen"
          component={CategoriesFilterScreen}
        />
        <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
        <Stack.Screen name="FlashSaleScreen" component={FlashSaleScreen} />
        <Stack.Screen name="LiveProductCard" component={LiveProductCard} />
        <Stack.Screen name="ChatSupportScreen" component={ChatSupportScreen} />
        <Stack.Screen name="ImageSearchResults" component={ImageSearchResults} />
        <Stack.Screen name="CelebrityDetail" component={CelebrityDetailScreen} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="CategoryProductScreen" component={CategoryProductScreen} />
        <Stack.Screen name="WalletScreen" component={WalletScreen} />
        <Stack.Screen name="ReceivedGiftScreen" component={ReceivedGiftScreen} />
        <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
        <Stack.Screen name="ContactPreferencesNew" component={ContactPreferencesNew} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="GiftCardBrowse" component={GiftCardBrowse} />
        <Stack.Screen name="GiftCardReviewPay" component={GiftCardReviewPay} />
        <Stack.Screen name="GiftCardSuccess" component={GiftCardSuccess} />
        <Stack.Screen name="StreamScreen" component={StreamScreen} />
        <Stack.Screen name="StreamPlayerScreen" component={StreamPlayerScreen} />

        <Stack.Screen name="AllCategoriesScreen" component={AllCategoriesScreen} />
        <Stack.Screen name="CelebritiesScreen" component={CelebritiesExploreScreen} />

        <Stack.Screen name="SubcategoryListScreen" component={SubcategoryListScreen} />
        <Stack.Screen name="AISearch" component={AISearchScreen} />
        <Stack.Screen name="ProductResults" component={ProductResultsScreen} />
        <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
        <Stack.Screen name="BrandStoreScreen" component={BrandStoreScreen} />
        <Stack.Screen name="StoriesScreen" component={StoriesScreen} />



      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
