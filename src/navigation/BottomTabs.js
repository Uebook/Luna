// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // You can use other icon sets too
import { View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ShoppingHomeScreen from '../screen/ShoppingHomeScreen';
import WishlistScreen from '../WishlistScreen';
import CelebritiesScreen from '../screen/CelebritiesScreen';
import CartScreen from '../CartScreen';
import ProfileScreen from '../ProfileScreen';
import SettingsScreen from '../screen/SettingsScreen';
import NewHome from '../screen/NewHome';

// Dummy Screens
const Home = () => <View style={{ flex: 1, backgroundColor: 'white' }} />;
const Favorites = () => <View style={{ flex: 1, backgroundColor: 'white' }} />;
const Tasks = () => <View style={{ flex: 1, backgroundColor: 'white' }} />;
const Mail = () => <View style={{ flex: 1, backgroundColor: 'white' }} />;
const Profile = () => <View style={{ flex: 1, backgroundColor: 'white' }} />;

const Tab = createBottomTabNavigator();

const TAB_META = {
    Home: { label: 'Home', active: 'home', inactive: 'home-outline' },
    Favorites: { label: 'Wishlist', active: 'heart', inactive: 'heart-outline' },
    Tasks: { label: 'Celebs', active: 'sparkles', inactive: 'sparkles-outline' },
    cart: { label: 'Cart', active: 'cart', inactive: 'cart-outline' },
    Profile: { label: 'Profile', active: 'person', inactive: 'person-outline' },
};

const BottomTabs = () => {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 8);
    
    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const isCenterTab = route.name === 'Tasks';
                return {
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarHideOnKeyboard: true,
                    tabBarStyle: {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 75 + bottomPadding,
                        paddingBottom: bottomPadding,
                        paddingTop: 10,
                        backgroundColor: '#FFFFFF',
                        borderTopWidth: 1,
                        borderTopColor: '#E5E7EB',
                        elevation: 20,
                        shadowColor: '#000',
                        shadowOpacity: 0.15,
                        shadowOffset: { width: 0, height: -4 },
                        shadowRadius: 12,
                        ...Platform.select({
                            ios: {
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                            },
                            android: {
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                            },
                        }),
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        marginTop: 2,
                        marginBottom: 0,
                    },
                    tabBarActiveTintColor: '#5C42C7',
                    tabBarInactiveTintColor: '#9CA3AF',
                    tabBarIcon: ({ focused }) => {
                        const meta = TAB_META[route.name] || { label: route.name, active: 'ellipse', inactive: 'ellipse-outline' };
                        const isCenter = isCenterTab;
                        const iconSize = isCenter ? 28 : 24;
                        const iconColor = focused ? '#5C42C7' : '#9CA3AF';
                        const labelColor = focused ? '#5C42C7' : '#9CA3AF';
                        
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                {isCenter ? (
                                    <View
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 30,
                                            backgroundColor: focused ? '#5C42C7' : '#F3F4F6',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: -5,
                                            marginTop: -5,
                                            elevation: focused ? 8 : 2,
                                            shadowColor: '#5C42C7',
                                            shadowOpacity: focused ? 0.4 : 0.1,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowRadius: 8,
                                            borderWidth: 3,
                                            borderColor: '#FFFFFF',
                                        }}
                                    >
                                        <Icon
                                            name={focused ? meta.active : meta.inactive}
                                            size={iconSize}
                                            color={focused ? '#FFFFFF' : '#6B7280'}
                                        />
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 6,
                                            borderRadius: 12,
                                            backgroundColor: focused ? '#F3F4F6' : 'transparent',
                                            marginBottom: 2,
                                        }}
                                    >
                                        <Icon
                                            name={focused ? meta.active : meta.inactive}
                                            size={iconSize}
                                            color={iconColor}
                                        />
                                    </View>
                                )}
                                {!isCenter && (
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            fontWeight: focused ? '700' : '500',
                                            color: labelColor,
                                            marginTop: 2,
                                        }}
                                    >
                                        {meta.label}
                                    </Text>
                                )}
                                {isCenter && (
                                    <Text
                                        style={{
                                            fontSize: 10,
                                            fontWeight: focused ? '700' : '500',
                                            color: labelColor,
                                            marginTop: 2,
                                        }}
                                    >
                                        {meta.label}
                                    </Text>
                                )}
                            </View>
                        );
                    },
                };
            }}
        >
            <Tab.Screen name="Home" component={NewHome} />
            <Tab.Screen name="Favorites" component={WishlistScreen} />
            <Tab.Screen name="Tasks" component={CelebritiesScreen} />
            <Tab.Screen name="cart" component={CartScreen} />
            <Tab.Screen name="Profile" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabs;
