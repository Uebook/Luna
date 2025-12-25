// src/screens/ChooseCurrencyScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
    Platform, ToastAndroid, Alert, I18nManager
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import { SkeletonListScreen } from '../components/SkeletonLoader';

/* ------- storage helpers ------- */
export const CURRENCY_STORAGE_KEY = '@app:selected_currency';
export const USER_STORAGE_KEY = 'luna_user';

export const getStoredCurrency = async () => {
    try { return (await AsyncStorage.getItem(CURRENCY_STORAGE_KEY)) || null; }
    catch { return null; }
};

export const setStoredCurrency = async (label) => {
    try { await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, label); } catch { }
};

/* ------- data (GCC + INR) ------- */
const CURRENCIES = [
    { label: 'BHD' }, // Bahrain Dinar
    { label: 'USD' }, // Bahrain Dinar
    // { label: 'AED' }, // UAE Dirham
    // { label: 'SAR' }, // Saudi Riyal
    // { label: 'INR' }, // Indian Rupee
];

const ChooseCurrencyScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation('currency');
    const isRTL = I18nManager.isRTL || i18n?.dir?.() === 'rtl';
    const { theme, isDark } = useTheme();
    const [loading, setLoading] = useState(true);

    const [selectedCurrency, setSelectedCurrency] = useState('BHD');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [storedUser, setStoredUser] = useState(null);
    
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

    // Load user data to get user_id - MUST be called before any early returns
    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                try {
                    const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                    if (!active) return;

                    if (savedUser) {
                        const parsedUser = JSON.parse(savedUser);
                        setStoredUser(parsedUser);

                        // Extract user_id from different possible structures
                        const userId = parsedUser?.user?.id ||
                            parsedUser?.data?.id ||
                            parsedUser?.id ||
                            parsedUser?.user_id;
                        setUserId(userId);
                    }
                } catch (error) {
                    console.log('Error loading user data:', error);
                }
            })();
            return () => { active = false; };
        }, [])
    );

    useEffect(() => {
        (async () => {
            const saved = await getStoredCurrency();
            if (saved) setSelectedCurrency(saved);
            setLoading(false);
        })();
    }, []);

    const toast = (msg, type = 'success') => {
        const message = typeof msg === 'string' ? msg : 'Currency updated successfully!';
        if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
        else Alert.alert(type === 'success' ? 'Success' : 'Error', message);
    };

    const updateCurrencyAPI = async (currency) => {
        setIsLoading(true);

        const formData = new FormData();
        formData.append('currency', currency);
        formData.append('user_id', userId);

        console.log("Updating currency with data:", {
            currency: currency,
            user_id: userId
        });

        try {
            const res = await axios.post(
                'https://luna-api.proteinbros.in/public/api/v1/auth/update-profile',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 15000
                }
            );

            console.log("Currency update response:", res.data);

            if (res?.data?.status) {
                // Update local storage with new currency data
                if (storedUser) {
                    const container = storedUser?.user ? 'user' : (storedUser?.data ? 'data' : null);
                    const base = container ? storedUser[container] : storedUser;

                    const mergedUser = {
                        ...base,
                        currency: currency,
                    };

                    let updatedUser;
                    if (container) {
                        updatedUser = { ...storedUser, [container]: mergedUser };
                    } else {
                        updatedUser = mergedUser;
                    }

                    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
                    setStoredUser(updatedUser);
                }

                // Also store currency separately for quick access
                await setStoredCurrency(currency);

                toast(t('saved', { defaultValue: 'Currency updated successfully!' }), 'success');
                return { success: true, data: res.data };
            } else {
                toast(res?.data?.message || 'Currency update failed.', 'error');
                return { success: false, error: res?.data?.message || 'Currency update failed' };
            }
        } catch (err) {
            console.log('Update currency error:', err.response?.data || err.message);
            const errorMessage = err?.response?.data?.message || 'Network error. Please try again.';
            toast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const pickCurrency = useCallback(async (currency) => {
        if (isLoading) return;

        // Update local state immediately for better UX
        setSelectedCurrency(currency);

        // Update on server if user is logged in
        if (userId) {
            await updateCurrencyAPI(currency);
        } else {
            // For guest users, just save locally
            await setStoredCurrency(currency);
            toast(t('saved_local', { defaultValue: 'Currency saved locally' }), 'success');
        }
    }, [t, userId, isLoading]);

    const renderItem = ({ item }) => {
        const isSelected = selectedCurrency === item.label;
        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    isRTL && { flexDirection: 'row-reverse' },
                    isLoading && styles.disabledItem
                ]}
                onPress={() => pickCurrency(item.label)}
                activeOpacity={0.9}
                disabled={isLoading}
            >
                <Text style={[styles.itemText, isLoading && styles.disabledText]}>{item.label}</Text>
                <View style={[styles.circle, isSelected ? styles.selectedCircle : styles.unselectedCircle]}>
                    {isSelected && <Icon name="check" size={14} color="#fff" />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* Standard Header */}
            <StandardHeader 
                title={t('title', { defaultValue: 'Currency' })}
                navigation={navigation}
                showGradient={true}
            />

            {/* Selected pill */}
            {selectedCurrency ? (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedText}>{selectedCurrency}</Text>
                    <Icon name="check-circle" size={20} color={theme.p1} />
                </View>
            ) : null}

            {/* Loading indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                        {t('updating', { defaultValue: 'Updating currency...' })}
                    </Text>
                </View>
            )}

            {/* User info */}
            {/* {userId && (
                <View style={styles.userInfoContainer}>
                    <Text style={styles.userInfoText}>
                        {t('logged_in_as', { defaultValue: 'Updating for user:' })} {userId}
                    </Text>
                </View>
            )} */}

            {/* List */}
            <FlatList
                data={CURRENCIES}
                keyExtractor={(it) => it.label}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default ChooseCurrencyScreen;

/* ---------------- styles ---------------- */
const createStyles = (theme, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 16 },

    /* header */
    headerRow: {
        height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: isDark ? theme.line : '#F3F4F6',
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.text },

    /* selected pill */
    selectedContainer: {
        backgroundColor: isDark ? theme.p4 : '#EAF0FF',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 14, borderRadius: 10, marginTop: 6, marginBottom: 10,
        borderWidth: 1,
        borderColor: isDark ? theme.line : 'transparent',
    },
    selectedText: { color: theme.p1, fontWeight: '700' },

    /* list rows */
    item: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: isDark ? theme.card : '#F9F9F9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: isDark ? theme.line : '#F1F1F1',
    },
    disabledItem: {
        opacity: 0.6,
    },
    sep: { height: 10 },
    itemText: { fontSize: 15, color: theme.text },
    disabledText: { color: theme.sub },

    /* radio look */
    circle: {
        width: 20, height: 20, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2,
        borderColor: isDark ? theme.line : '#E0E0E0',
    },
    selectedCircle: { 
        backgroundColor: theme.p1,
        borderColor: theme.p1,
    },
    unselectedCircle: { 
        backgroundColor: isDark ? theme.bg : '#FFFFFF',
        borderColor: isDark ? theme.line : '#E0E0E0',
    },

    /* loading */
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: isDark ? theme.warning + '30' : '#FFF3CD',
        borderRadius: 5,
        marginBottom: 10,
    },
    loadingText: {
        color: isDark ? theme.warning : '#856404',
        fontSize: 14,
    },

    /* user info */
    userInfoContainer: {
        padding: 8,
        alignItems: 'center',
        backgroundColor: isDark ? theme.card : '#F8F9FA',
        borderRadius: 5,
        marginBottom: 10,
    },
    userInfoText: {
        color: theme.sub,
        fontSize: 12,
    },
});