// navigation/RootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import CreateAccountScreen from '../screen/CreateAccount';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screen/SplashScreen';
import ChatBotModal from '../screen/ChatBotModal';
import HistoryScreen from '../screen/HistoryScreen';
import OnboardingScreen from '../screen/OnboardingScreen';
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
import ShoppingHomeScreen from '../screen/ShoppingHomeScreen';
import LoginScreen from '../screen/LoginScreen';
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
import NewHome from '../screen/NewHome';
import FlashSaleScreen from '../screen/FlashSaleScreen';
import LiveProductCard from '../screen/LiveProductCard';
import ChatSupportScreen from '../screen/ChatSupportScreen';



const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="OnboardingScreen" screenOptions={{ headerShown: false }}>

                <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />

                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
                <Stack.Screen name="MainApp" component={BottomTabs} />
                <Stack.Screen name="ChatBotModal" component={ChatBotModal} />
                <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
                <Stack.Screen name="OrderTrackingScreen" component={OrderTrackingScreen} />
                <Stack.Screen name="PasswordRecoveryScreen" component={PasswordRecoveryScreen} />
                <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
                <Stack.Screen name="SetNewPasswordScreen" component={SetupNewPasswordScreen} />
                <Stack.Screen name="ToReceiveOrdersScreen" component={ToReceiveOrdersScreen} />
                <Stack.Screen name="CartScreen" component={CartScreen} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                <Stack.Screen name="RecentlyViewedScreen" component={RecentlyViewedScreen} />
                <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
                <Stack.Screen name="ShopScreen" component={ShopScreen} />
                <Stack.Screen name="WishlistScreen" component={WishlistScreen} />

                <Stack.Screen name="ShoppingHomeScreen" component={ShoppingHomeScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />

                <Stack.Screen name="ActivityScreen" component={ActivityScreen} />
                <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
                <Stack.Screen name="SettingsProfileScreen" component={SettingsProfileScreen} />
                <Stack.Screen name="ShippingAddressScreen" component={ShippingAddressScreen} />
                <Stack.Screen name="ChooseCountryScreen" component={ChooseCountryScreen} />

                <Stack.Screen name="ChooseCurrencyScreen" component={ChooseCurrencyScreen} />

                <Stack.Screen name="ChooseSizeScreen" component={ChooseSizeScreen} />

                <Stack.Screen name="TermsAndConditionsScreen" component={TermsAndConditionsScreen} />

                <Stack.Screen name="AboutScreen" component={AboutScreen} />
                <Stack.Screen name="ChooseLanguageScreen" component={ChooseLanguageScreen} />
                <Stack.Screen name="CategoriesFilterScreen" component={CategoriesFilterScreen} />
                <Stack.Screen name="VoucherScreen" component={VoucherScreen} />
                <Stack.Screen name="NewHome" component={NewHome} />
                <Stack.Screen name="FlashSaleScreen" component={FlashSaleScreen} />
                <Stack.Screen name="LiveProductCard" component={LiveProductCard} />
                <Stack.Screen name="ChatSupportScreen" component={ChatSupportScreen} />



            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
