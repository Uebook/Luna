// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';
import NewHome from '../screen/NewHome';
import WishlistScreen from '../WishlistScreen';
import CelebritiesScreen from '../screen/CelebritiesScreen';
import CartScreen from '../CartScreen';
import SettingsScreen from '../screen/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_META = {
    Home: {
        label: 'Home',
        active: 'home',
        inactive: 'home-outline',
        component: NewHome
    },
    Wishlist: {
        label: 'Wishlist',
        active: 'heart',
        inactive: 'heart-outline',
        component: WishlistScreen
    },
    Celebrities: {
        label: 'Celebs',
        active: 'star',
        inactive: 'star-outline',
        component: CelebritiesScreen
    },
    Cart: {
        label: 'Cart',
        active: 'cart',
        inactive: 'cart-outline',
        component: CartScreen
    },
    Profile: {
        label: 'Profile',
        active: 'person',
        inactive: 'person-outline',
        component: SettingsScreen
    },
};

const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const meta = TAB_META[route.name] || {
                    label: route.name,
                    active: 'ellipse',
                    inactive: 'ellipse-outline'
                };

                return {
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarLabel: meta.label,
                    tabBarHideOnKeyboard: true,
                    tabBarStyle: {
                        position: 'absolute',
                        left: 16,
                        right: 16,
                        bottom: 20,
                        height: 70,
                        paddingBottom: 10,
                        paddingTop: 8,
                        borderRadius: 26,
                        backgroundColor: '#111226',
                        borderTopWidth: 0,
                        elevation: 12,
                        shadowColor: '#000',
                        shadowOpacity: 0.25,
                        shadowOffset: { width: 0, height: 8 },
                        shadowRadius: 16,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                        marginTop: -4,
                    },
                    tabBarActiveTintColor: '#F8F7FF',
                    tabBarInactiveTintColor: 'rgba(248,247,255,0.6)',
                    tabBarIcon: ({ focused, color }) => {
                        return (
                            <View style={styles.iconContainer}>
                                <View
                                    style={[
                                        styles.iconWrapper,
                                        focused && styles.iconWrapperActive
                                    ]}
                                >
                                    <Icon
                                        name={focused ? meta.active : meta.inactive}
                                        size={24}
                                        color={color}
                                    />
                                </View>
                            </View>
                        );
                    },
                };
            }}
        >
            <Tab.Screen
                name="Home"
                component={TAB_META.Home.component}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Wishlist"
                component={TAB_META.Wishlist.component}
                options={{ tabBarLabel: 'Wishlist' }}
            />
            <Tab.Screen
                name="Celebrities"
                component={TAB_META.Celebrities.component}
                options={{ tabBarLabel: 'Celebs' }}
            />
            <Tab.Screen
                name="Cart"
                component={TAB_META.Cart.component}
                options={{ tabBarLabel: 'Cart' }}
            />
            <Tab.Screen
                name="Profile"
                component={TAB_META.Profile.component}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    iconWrapper: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    iconWrapperActive: {
        backgroundColor: 'rgba(92,66,199,0.28)',
    },
});

export default BottomTabs;