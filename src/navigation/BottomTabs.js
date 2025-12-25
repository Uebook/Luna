// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
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
    const { theme, isDark } = useTheme();

    // Dynamic styles based on theme
    const tabBarBackground = isDark ? '#1A1B2E' : '#FFFFFF';
    const tabBarBorder = isDark ? '#2A2B3E' : '#E8E6F6';
    const shadowColor = isDark ? '#000000' : '#5C42C7';

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
                        left: 12,
                        right: 12,
                        bottom: Platform.OS === 'ios' ? 20 : 16,
                        height: Platform.OS === 'ios' ? 78 : 72,
                        paddingBottom: Platform.OS === 'ios' ? 22 : 12,
                        paddingTop: 10,
                        borderRadius: 30,
                        backgroundColor: tabBarBackground,
                        borderTopWidth: 0,
                        borderWidth: 1,
                        borderColor: tabBarBorder,
                        elevation: 24,
                        shadowColor: shadowColor,
                        shadowOpacity: isDark ? 0.4 : 0.12,
                        shadowOffset: { width: 0, height: -6 },
                        shadowRadius: 24,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '700',
                        marginTop: 2,
                        letterSpacing: 0.3,
                        marginBottom: Platform.OS === 'ios' ? 0 : -2,
                    },
                    tabBarActiveTintColor: theme.p1 || '#5C42C7',
                    tabBarInactiveTintColor: isDark ? '#8B8FA3' : '#A8A8B8',
                    tabBarIcon: ({ focused, color, size }) => {
                        return (
                            <View style={styles.iconContainer}>
                                <View
                                    style={[
                                        styles.iconWrapper,
                                        focused && [
                                            styles.iconWrapperActive,
                                            {
                                                backgroundColor: (theme.p1 || '#5C42C7') + (isDark ? '20' : '15')
                                            }
                                        ]
                                    ]}
                                >
                                    <Icon
                                        name={focused ? meta.active : meta.inactive}
                                        size={focused ? 24 : 22}
                                        color={focused ? (theme.p1 || '#5C42C7') : color}
                                        style={focused ? styles.iconActive : styles.iconInactive}
                                    />
                                    {focused && (
                                        <View
                                            style={[
                                                styles.activeIndicator,
                                                {
                                                    backgroundColor: theme.p1 || '#5C42C7',
                                                    shadowColor: theme.p1 || '#5C42C7',
                                                    shadowOpacity: 0.5,
                                                    shadowRadius: 3,
                                                    shadowOffset: { width: 0, height: 1 },
                                                    elevation: 3,
                                                }
                                            ]}
                                        />
                                    )}
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
                options={{
                    tabBarLabel: 'Home',
                    tabBarStyle: {
                        height: 0,
                        borderWidth: 0,
                        elevation: 0,
                    },
                }}
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
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    iconWrapper: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minWidth: 48,
        minHeight: 48,
    },
    iconWrapperActive: {
        transform: [{ scale: 1.1 }],
    },
    iconActive: {
        transform: [{ scale: 1.2 }],
    },
    iconInactive: {
        opacity: 0.6,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -2,
        left: '50%',
        marginLeft: -16,
        width: 32,
        height: 4,
        borderRadius: 2,
    },
});

export default BottomTabs;