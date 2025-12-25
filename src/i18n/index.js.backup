// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// EXISTING imports
import enCommon from './locales/en/common.json';
import enAbout from './locales/en/about.json';
import arCommon from './locales/ar/common.json';
import arAbout from './locales/ar/about.json';

// ➕ already added
import enHome from './locales/en/home.json';
import arHome from './locales/ar/home.json';
import ensettings from './locales/en/settings.json';
import arsettings from './locales/ar/settings.json';

// ➕ NEW: history namespace
import enHistory from './locales/en/history.json';
import arHistory from './locales/ar/history.json';

import enWishlist from './locales/en/wishlist.json';
import arWishlist from './locales/ar/wishlist.json';

import entoReceive from './locales/en/toReceive.json';
import artoReceive from './locales/ar/toReceive.json';

import enwallet from './locales/en/wallet.json';
import arwallet from './locales/ar/wallet.json';

import enAddress from './locales/en/address.json';
import arAddress from './locales/ar/address.json';

import enActivity from './locales/en/activity.json';
import arActivity from './locales/ar/activity.json';

import enVoucher from './locales/en/voucher.json';
import arVoucher from './locales/ar/voucher.json';

import engiftcard from './locales/en/giftcard.json';
import argiftcard from './locales/ar/giftcard.json';


import engiftcardPay from './locales/en/giftcardPay.json';
import argiftcardPay from './locales/ar/giftcardPay.json';

import engiftcardSuccess from './locales/en/giftcardSuccess.json';
import argiftcardSuccess from './locales/ar/giftcardSuccess.json';

import enmembership from './locales/en/membership.json';
import armembership from './locales/ar/membership.json';


import encountry from './locales/en/country.json';
import arcountry from './locales/ar/country.json';


import enContact from './locales/en/contact.json';
import arContact from './locales/ar/contact.json';

import enCurrency from './locales/en/currency.json';
import arCurrency from './locales/ar/currency.json';

import enSize from './locales/en/size.json';
import arSize from './locales/ar/size.json';

import enCart from './locales/en/cart.json';
import arCart from './locales/ar/cart.json';

import enCheckout from './locales/en/checkout.json';
import arCheckout from './locales/ar/checkout.json';

import enexplore from './locales/en/explore.json';
import arexplore from './locales/ar/explore.json';

import enceleb from './locales/en/celeb.json';
import arceleb from './locales/ar/celeb.json';

import enRecentlyViewed from './locales/en/recentlyviewed.json';
import arRecentlyViewed from './locales/ar/recentlyviewed.json';

import enLanguage from './locales/en/language.json';
import arLanguage from './locales/ar/language.json';



const LANG_KEY = '@app_lang';

const resources = {
    en: {
        common: enCommon,
        about: enAbout,
        home: enHome,
        settings: ensettings,
        history: enHistory,
        wishlist: enWishlist,
        toReceive: entoReceive,
        wallet: enwallet,
        address: enAddress,
        activity: enActivity,
        voucher: enVoucher,
        giftcard: engiftcard,
        giftcardPay: engiftcardPay,
        giftcardSuccess: engiftcardSuccess,
        membership: enmembership,
        country: encountry,
        contact: enContact,
        currency: enCurrency,
        size: enSize,
        cart: enCart,
        checkout: enCheckout,
        explore: enexplore,
        celeb: enceleb,
        recentlyviewed: enRecentlyViewed,
        language: enLanguage


        // 👈 add
    },
    ar: {
        common: arCommon,
        about: arAbout,
        home: arHome,
        settings: arsettings,
        history: arHistory,
        wishlist: arWishlist,
        toReceive: artoReceive,
        wallet: arwallet,
        address: arAddress,
        activity: arActivity,
        voucher: arVoucher,
        giftcard: argiftcard,
        giftcardPay: argiftcardPay,
        giftcardSuccess: argiftcardSuccess,
        membership: armembership,
        country: arcountry,
        contact: arContact,
        currency: arCurrency,
        size: arSize,
        cart: arCart,
        checkout: arCheckout,
        explore: arexplore,
        celeb: arceleb,
        recentlyviewed: arRecentlyViewed,
        language: arLanguage
        // 👈 add
    },
};

function detectDeviceLang() {
    const locales = RNLocalize.getLocales();
    const code = locales?.[0]?.languageCode || 'en';
    return code.startsWith('ar') ? 'ar' : 'en';
}

export async function setAppLanguage(lang) {
    const isRTL = lang === 'ar';
    try { await AsyncStorage.setItem(LANG_KEY, lang); } catch { }
    await i18n.changeLanguage(lang);

    if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(true);       // allow RTL either way
        I18nManager.forceRTL(isRTL);
        // NOTE: some layouts may need an app reload to fully flip directions
    }
}

async function getInitialLang() {
    try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved) return saved; // respect user preference
    } catch { }
    return detectDeviceLang();
}

// Avoid adding multiple listeners during Fast Refresh
let _listenerAdded = false;

const start = async () => {
    const initialLang = await getInitialLang()

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: initialLang,
            fallbackLng: 'en',
            ns: ['common', 'about', 'home', 'settings', 'history', 'wishlist', 'toReceive', 'wallet', 'address', 'activity', 'voucher', 'giftcard', 'giftcardPay', 'giftcardSuccess', 'membership', 'country', 'currency', 'cart', 'checkout', 'explore', 'celeb', 'recentlyviewed', 'language'], // 👈 include history
            defaultNS: 'common',
            returnEmptyString: false,
            compatibilityJSON: 'v3',
            interpolation: { escapeValue: false },
        });

    if (!_listenerAdded) {
        RNLocalize.addEventListener('change', async () => {
            // Only auto-switch to device language if the user has not chosen one manually.
            try {
                const saved = await AsyncStorage.getItem(LANG_KEY);
                if (!saved) {
                    setAppLanguage(detectDeviceLang());
                }
            } catch { }
        });
        _listenerAdded = true;
    }
};

start();

export default i18n;
