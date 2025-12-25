// navigation/RootNavigator.js
// Import ALL screens directly to prevent "Downloading..." message
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Import all screens directly (no lazy loading)
import BottomTabs from './BottomTabs';
import SplashVideoScreen from '../screen/SplashVideoScreen';
import NewHome from '../screen/NewHome';
import LoginScreen from '../screen/LoginScreen';
import OnboardingScreen from '../screen/OnboardingScreen';
import SplashScreen from '../screen/SplashScreen';
import CreateAccountScreen from '../screen/CreateAccount';
import ChatBotModal from '../screen/ChatBotModal';
import HistoryScreen from '../screen/HistoryScreen';
import OrderTrackingScreen from '../screen/OrderTrackingScreen';
import PasswordRecoveryScreen from '../screen/PasswordRecoveryScreen';
import PasswordScreen from '../screen/PasswordScreen';
import SetupNewPasswordScreen from '../screen/SetupNewPasswordScreen';
import ToReceiveOrdersScreen from '../screen/ToReceiveOrdersScreen';
import CartScreen from '../CartScreen';
import ProfileScreen from '../ProfileScreen';
import RecentlyViewedScreen from '../RecentlyViewedScreen';
import ReviewScreen from '../ReviewScreen';
import ShopScreen from '../ShopScreen';
import WishlistScreen from '../WishlistScreen';
import ProductDetailScreen from '../screen/ProductDetailScreen';
import ActivityScreen from '../screen/ActivityScreen';
import NotificationScreen from '../screen/NotificationScreen';
import SettingsProfileScreen from '../screen/SettingsProfileScreen';
import ShippingAddressScreen from '../screen/ShippingAddressScreen';
import ChooseCountryScreen from '../screen/ChooseCountryScreen';
import ChooseCurrencyScreen from '../screen/ChooseCurrencyScreen';
import ChooseSizeScreen from '../screen/ChooseSizeScreen';
import TermsAndConditionsScreen from '../screen/TermsAndConditionsScreen';
import AboutScreen from '../screen/AboutScreen';
import ChooseLanguageScreen from '../screen/ChooseLanguageScreen';
import CategoriesFilterScreen from '../screen/CategoriesFilterScreen';
import VoucherScreen from '../screen/VoucherScreen';
import FlashSaleScreen from '../screen/FlashSaleScreen';
import LiveProductCard from '../screen/LiveProductCard';
import ChatSupportScreen from '../screen/ChatSupportScreen';
import PasswordTyping from '../screen/PasswordTyping';
import TopProductsScreen from '../screen/TopProductsScreen';
import ImageSearchResults from '../screen/ImageSearchResults';
import CelebrityDetailScreen from '../screen/CelebrityDetailScreen';
import CheckoutScreen from '../screen/CheckoutScreen';
import SearchScreen from '../screen/SearchScreen';
import CategoryProductScreen from '../screen/CategoryProductScreen';
import WalletScreen from '../screen/WalletScreen';
import SubscriptionScreen from '../screen/SubscriptionScreen';
import ContactPreferencesNew from '../screen/ContactPreferencesNew';
import OrderDetailsScreen from '../screen/OrderDetailsScreen';
import RefundPolicyScreen from '../screen/RefundPolicyScreen';
import PrivacyPolicyScreen from '../screen/PrivacyPolicyScreen';
import GiftCardBrowse from '../screen/GiftCardBrowse';
import GiftCardReviewPay from '../screen/GiftCardReviewPay';
import GiftCardSuccess from '../screen/GiftCardSuccess';
import StreamScreen from '../screen/StreamScreen';
import StreamPlayerScreen from '../screen/StreamPlayerScreen';
import AllCategoriesScreen from '../screen/AllCategoriesScreen';
import CelebritiesExploreScreen from '../screen/CelebritiesScreen';
import SubcategoryListScreen from '../screen/SubcategoryListScreen';
import AISearchScreen from '../screen/AISearchScreen';
import ProductResultsScreen from '../screen/AIproductResultsScreen';
import ExploreScreen from '../screen/ExploreScreen';
import BrandStoreScreen from '../screen/BrandStoreScreen';
import StoriesScreen from '../screen/StoriesScreen';
import BestProductsScreen from '../screen/BestProductsScreen';
import AllNewProductScreen from '../screen/AllNewProduct';
import TrendingProductsScreen from '../screen/TrendingProductsScreen';
import SubCategoryProductsScreen from '../screen/SubCategoryProductsScreen';
import ReceivedGiftScreen from '../screen/ReceivedGiftScreen';
import BlogListScreen from '../screen/BlogListScreen';
import BlogDetailScreen from '../screen/BlogDetailScreen';

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
        <Stack.Screen name="BlogListScreen" component={BlogListScreen} />
        <Stack.Screen name="BlogDetailScreen" component={BlogDetailScreen} />



      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
