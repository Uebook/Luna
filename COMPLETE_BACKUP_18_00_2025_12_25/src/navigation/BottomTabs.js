// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // You can use other icon sets too
import { View, Text } from 'react-native';
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
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 20,
                    height: 78,
                    paddingBottom: 14,
                    paddingTop: 10,
                    borderRadius: 26,
                    backgroundColor: '#111226',
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOpacity: 0.25,
                    shadowOffset: { width: 0, height: 8 },
                    shadowRadius: 16,
                },
                tabBarIcon: ({ focused }) => {
                    const meta = TAB_META[route.name] || { label: route.name, active: 'ellipse', inactive: 'ellipse-outline' };
                    const color = focused ? '#F8F7FF' : 'rgba(248,247,255,0.6)';
                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View
                                style={{
                                    paddingHorizontal: focused ? 18 : 12,
                                    paddingVertical: focused ? 10 : 8,
                                    borderRadius: 18,
                                    backgroundColor: focused ? 'rgba(92,66,199,0.28)' : 'transparent',
                                }}
                            >
                                <Icon
                                    name={focused ? meta.active : meta.inactive}
                                    size={22}
                                    color={color}
                                />
                            </View>
                            <Text
                                style={{
                                    marginTop: 6,
                                    fontSize: 12,
                                    fontWeight: focused ? '800' : '600',
                                    color,
                                }}
                            >
                                {meta.label}
                            </Text>
                        </View>
                    );
                },
            })}
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
