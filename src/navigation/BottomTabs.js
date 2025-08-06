// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // You can use other icon sets too
import { View } from 'react-native';
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

const BottomTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: '#0057FF',
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: 60,
                    borderTopWidth: 0.5,
                    borderTopColor: '#ccc',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Favorites':
                            iconName = focused ? 'heart' : 'heart-outline';
                            break;
                        case 'Tasks':
                            iconName = focused ? 'list' : 'list-outline';
                            break;
                        case 'cart':
                            iconName = focused ? 'cart' : 'cart-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                    }

                    return <Icon name={iconName} size={24} color={color} />;
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
