import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ToastAndroid,
    Alert,
    I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import i18n, { setAppLanguage } from '../i18n';
import RNRestart from 'react-native-restart';
import { useTheme } from '../context/ThemeContext';

/* ------- storage helpers ------- */
export const LANGUAGE_STORAGE_KEY = '@app:selected_language';
export const USER_STORAGE_KEY = 'luna_user';

export const getStoredLanguage = async () => {
    try { return (await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)) || 'en'; }
    catch { return 'en'; }
};

export const setStoredLanguage = async (language) => {
    try { await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { }
};

/* ------- data ------- */
const LANGUAGES = [
    { id: 'en', label: 'English' },
    { id: 'ar', label: 'Arabic' },
];

const ChooseLanguageScreen = ({ navigation }) => {
    const { t } = useTranslation('language');
    const isRTL = I18nManager.isRTL;

    const [selectedLang, setSelectedLang] = useState('en');
    const [userId, setUserId] = useState(null);
    const [storedUser, setStoredUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load user data to get user_id
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
        const current = i18n.language?.startsWith('ar') ? 'ar' : 'en';
        setSelectedLang(current);

        const onChange = (lng) => setSelectedLang(lng?.startsWith('ar') ? 'ar' : 'en');
        i18n.on('languageChanged', onChange);
        return () => i18n.off('languageChanged', onChange);
    }, []);

    const toast = (msg, type = 'success') => {
        const message = typeof msg === 'string' ? msg : 'Language updated successfully!';
        if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
        else Alert.alert(type === 'success' ? 'Success' : 'Error', message);
    };

    const updateLanguageAPI = async (language) => {
        setIsLoading(true);

        const formData = new FormData();
        formData.append('language', language);
        formData.append('user_id', userId);

        console.log("Updating language with data:", {
            language: language,
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

            console.log("Language update response:", res.data);

            if (res?.data?.status) {
                // Update local storage with new language data
                if (storedUser) {
                    const container = storedUser?.user ? 'user' : (storedUser?.data ? 'data' : null);
                    const base = container ? storedUser[container] : storedUser;

                    const mergedUser = {
                        ...base,
                        language: language,
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

                // Also store language separately for quick access
                await setStoredLanguage(language);

                // Update app language
                await setAppLanguage(language);
                setSelectedLang(language);

                toast(t('saved', { defaultValue: 'Language updated successfully!' }), 'success');

                // Restart app to fully apply RTL/LTR changes
                setTimeout(() => RNRestart.restart(), 500);

                return { success: true, data: res.data };
            } else {
                toast(res?.data?.message || 'Language update failed.', 'error');
                return { success: false, error: res?.data?.message || 'Language update failed' };
            }
        } catch (err) {
            console.log('Update language error:', err.response?.data || err.message);
            const errorMessage = err?.response?.data?.message || 'Network error. Please try again.';
            toast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const pickLanguage = useCallback(async (langId) => {
        if (isLoading) return;

        // Update local state immediately for better UX
        setSelectedLang(langId);

        // Update on server if user is logged in
        if (userId) {
            await updateLanguageAPI(langId);
        } else {
            // For guest users, just save locally and restart
            try {
                await setStoredLanguage(langId);
                await setAppLanguage(langId);

                toast(t('saved_local', { defaultValue: 'Language saved locally' }), 'success');

                // Restart app to fully apply RTL/LTR changes
                setTimeout(() => RNRestart.restart(), 500);
            } catch {
                toast(t('error_saving', { defaultValue: 'Failed to change language' }), 'error');
            }
        }
    }, [userId, isLoading, t]);

    const currentLabel = LANGUAGES.find((l) => l.id === selectedLang)?.label || 'English';

    const renderItem = ({ item }) => {
        const isSelected = selectedLang === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    isRTL && { flexDirection: 'row-reverse' },
                    isLoading && styles.disabledItem
                ]}
                onPress={() => pickLanguage(item.id)}
                activeOpacity={0.9}
                disabled={isLoading}
            >
                <Text style={[styles.itemText, isLoading && styles.disabledText]}>{item.label}</Text>
                <View
                    style={[
                        styles.circle,
                        isSelected ? styles.selectedCircle : styles.unselectedCircle,
                    ]}
                >
                    {isSelected && <Icon name="check" size={14} color="#fff" />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    onPress={() => navigation?.goBack?.()}
                    style={styles.backBtn}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    <Icon name="chevron-left" size={22} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {t('title', { defaultValue: 'Language' })}
                </Text>
                <View style={{ width: 40, height: 40 }} />
            </View>

            {/* Selected banner */}
            {selectedLang ? (
                <View style={styles.selectedContainer}>
                    <Text style={styles.selectedCountry}>{currentLabel}</Text>
                    <Icon name="check-circle" size={20} color="#004BFE" />
                </View>
            ) : null}

            {/* Loading indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>
                        {t('updating', { defaultValue: 'Updating language...' })}
                    </Text>
                </View>
            )}

            {/* User info */}
            {userId && (
                <View style={styles.userInfoContainer}>
                    <Text style={styles.userInfoText}>
                        {t('logged_in_as', { defaultValue: 'Updating for user:' })} {userId}
                    </Text>
                </View>
            )}

            {/* Radio list */}
            <FlatList
                data={LANGUAGES}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default ChooseLanguageScreen;

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
    headerRow: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A'
    },
    selectedContainer: {
        backgroundColor: '#EAF0FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
    },
    selectedCountry: {
        color: '#004BFE',
        fontWeight: '700'
    },
    item: {
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    disabledItem: {
        opacity: 0.6,
    },
    sep: {
        height: 1,
        backgroundColor: '#F1F1F1'
    },
    itemText: {
        fontSize: 15,
        color: '#000'
    },
    disabledText: {
        color: '#666'
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedCircle: {
        backgroundColor: '#004BFE'
    },
    unselectedCircle: {
        backgroundColor: '#FBCDD0'
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        borderRadius: 5,
        marginBottom: 10,
    },
    loadingText: {
        color: '#856404',
        fontSize: 14,
    },
    userInfoContainer: {
        padding: 8,
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 5,
        marginBottom: 10,
    },
    userInfoText: {
        color: '#6C757D',
        fontSize: 12,
    },
});