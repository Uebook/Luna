// src/screens/ChooseCountryScreen.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
    Platform, ToastAndroid, Alert, I18nManager
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';

/* ------- storage helpers (can be reused elsewhere) ------- */
export const COUNTRY_STORAGE_KEY = '@app:selected_country';
export const getStoredCountry = async () => {
    try { return (await AsyncStorage.getItem(COUNTRY_STORAGE_KEY)) || null; }
    catch { return null; }
};
export const setStoredCountry = async (country) => {
    try { await AsyncStorage.setItem(COUNTRY_STORAGE_KEY, country); } catch { }
};

/* ------- v1.0: restrict to Bahrain only ------- */
const COUNTRIES = [{ key: 'Bahrain', flag: '🇧🇭' }];

export default function ChooseCountryScreen({ navigation }) {
    const { t } = useTranslation('country');
    const isRTL = I18nManager.isRTL || i18n?.dir?.() === 'rtl';

    const [selectedCountry, setSelectedCountry] = useState('Bahrain');

    useEffect(() => {
        (async () => {
            const saved = await getStoredCountry();
            if (saved) setSelectedCountry(saved);
        })();
    }, []);

    const toast = (msg) => {
        if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
        else Alert.alert('', msg);
    };

    const pickCountry = useCallback(async (countryName) => {
        setSelectedCountry(countryName);
        await setStoredCountry(countryName);
        toast(t('saved', { defaultValue: 'Country saved' }));
    }, [t]);

    const openRules = () => {
        if (navigation?.navigate) {
            try { navigation.navigate('ShippingPaymentRules'); return; } catch { }
        }
        Alert.alert(
            t('rulesTitle', { defaultValue: 'Shipping & Payment' }),
            t('v1only', { defaultValue: 'v1.0 is available only in Bahrain.' })
        );
    };

    return (
        <SafeAreaView style={[styles.container, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* Header: centered title + back button ALWAYS on LEFT */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation?.goBack?.()}
                    style={[styles.navBtn, { left: 12 }]}             // <- stays left even in RTL
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.8}
                    accessibilityLabel={t('a11y.back')}
                >
                    <Icon name="chevron-left" size={22} color="#0F172A" /> {/* left chevron always */}
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('title', { defaultValue: 'Country' })}</Text>
            </View>

            {/* Info note + rules link (optional) */}
            {/* <View style={[styles.noteRow, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={[styles.noteText, isRTL && { textAlign: 'right' }]}>
          {t('v1only', { defaultValue: 'v1.0 is available only in Bahrain.' })}
        </Text>
        <TouchableOpacity onPress={openRules} activeOpacity={0.9}>
          <Text style={styles.noteLink}>{t('rulesLink', { defaultValue: 'Shipping & Payment rules' })}</Text>
        </TouchableOpacity>
      </View> */}

            {/* Selected pill */}
            <View style={styles.selectedContainer}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.flag}>🇧🇭</Text>
                    <Text style={styles.selectedCountry}>
                        {t('names.Bahrain', { defaultValue: 'Bahrain' })}
                    </Text>
                </View>
                <Icon name="check-circle" size={20} color="#004BFE" />
            </View>

            {/* List (Bahrain-only) */}
            <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => {
                    const isSelected = item.key === selectedCountry;
                    return (
                        <TouchableOpacity
                            style={[
                                styles.item,
                                isSelected && styles.selectedItem,
                                isRTL && { flexDirection: 'row-reverse' }
                            ]}
                            onPress={() => pickCountry(item.key)}
                            activeOpacity={0.9}
                        >
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={styles.flag}>{item.flag}</Text>
                                <Text style={styles.itemText}>{t(`names.${item.key}`, { defaultValue: item.key })}</Text>
                            </View>
                            <View style={[styles.circle, isSelected ? styles.selectedCircle : styles.unselectedCircle]}>
                                {isSelected && <Icon name="check" size={14} color="#fff" />}
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },

    /* header (centered title; back button fixed LEFT) */
    header: { height: 56, alignItems: 'center', justifyContent: 'center' },
    navBtn: {
        position: 'absolute',
        top: 0, bottom: 0, width: 40,
        alignItems: 'center', justifyContent: 'center', borderRadius: 20,
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },

    /* note + link */
    noteRow: {
        marginTop: 6, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between',
        gap: 10, flexDirection: 'row',
    },
    noteText: { color: '#667085', flex: 1, fontSize: 13 },
    noteLink: { color: '#004BFE', fontWeight: '800', fontSize: 13 },

    /* selected pill */
    selectedContainer: {
        backgroundColor: '#EAF0FF',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 14, borderRadius: 10, marginBottom: 10,
    },
    selectedCountry: { color: '#004BFE', fontWeight: '700' },
    flag: { fontSize: 20 },

    /* list items */
    item: {
        paddingVertical: 14, paddingHorizontal: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#F1F1F1',
    },
    selectedItem: { backgroundColor: '#EAF0FF', borderColor: '#CCE0FF' },
    sep: { height: 10 },
    itemText: { fontSize: 15, color: '#000' },

    /* radio circle */
    circle: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    selectedCircle: { backgroundColor: '#004BFE' },
    unselectedCircle: { backgroundColor: '#FBCDD0' },
});
