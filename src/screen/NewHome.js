// src/screens/HomeScreen.js
// Live API version — dynamic categories + home payload (For You = null)
// SVG brand logos (from URL), BHD prices, coupon revamp, blogs with HTML modal,
// category tap -> subcategory page after load.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image as RNImage,
  FlatList, Dimensions, Platform, RefreshControl, StatusBar, Modal, Linking, Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SvgUri from 'react-native-svg-uri';
// Image picker imports
import ImagePicker from 'react-native-image-crop-picker';
// Import useTheme with error handling to avoid Metro bundler issues
let useTheme;
try {
  const themeContextModule = require('../context/ThemeContext');
  useTheme = themeContextModule.useTheme || (() => {
    // Fallback hook that returns a default theme
    return {
      theme: {
        p1: '#5C42C7', p2: '#4B36A6', p3: '#BCDD0D', p4: '#EEF7B8',
        white: '#FFFFFF', ink: '#0F1020', gray: '#6b7280', muted: '#9ca3af',
        bg: '#FCFBFF', card: '#FFFFFF', line: '#E8E6F6', red: '#FF3B30',
        success: '#16a34a', danger: '#FF3B30', dangerBg: '#FFF1F1',
        brand: '#5C42C7', brandSoft: '#EEF7B8',
        gradients: { header: ['#4B36A6', '#5C42C7', '#5C42C7'] },
        isDark: false,
      },
      isDark: false,
      toggleTheme: () => { },
      setThemeMode: () => { },
    };
  });
} catch (e) {
  console.warn('Failed to import useTheme, using fallback:', e);
  useTheme = () => ({
    theme: {
      p1: '#5C42C7', p2: '#4B36A6', p3: '#BCDD0D', p4: '#EEF7B8',
      white: '#FFFFFF', ink: '#0F1020', gray: '#6b7280', muted: '#9ca3af',
      bg: '#FCFBFF', card: '#FFFFFF', line: '#E8E6F6', red: '#FF3B30',
      success: '#16a34a', danger: '#FF3B30', dangerBg: '#FFF1F1',
      brand: '#5C42C7', brandSoft: '#EEF7B8',
      gradients: { header: ['#4B36A6', '#5C42C7', '#5C42C7'] },
      isDark: false,
    },
    isDark: false,
    toggleTheme: () => { },
    setThemeMode: () => { },
  });
}
// Import getTheme with error handling
let getTheme;
try {
  const themeModule = require('../constants/Theme');
  getTheme = themeModule.getTheme || themeModule.default || ((isDark) => {
    // Fallback inline theme
    return {
      p1: '#5C42C7', p2: '#4B36A6', p3: '#BCDD0D', p4: '#EEF7B8',
      white: '#FFFFFF', ink: '#0F1020', gray: '#6b7280', muted: '#9ca3af',
      bg: '#FCFBFF', card: '#FFFFFF', line: '#E8E6F6', red: '#FF3B30',
      success: '#16a34a', danger: '#FF3B30', dangerBg: '#FFF1F1',
      brand: '#5C42C7', brandSoft: '#EEF7B8',
      gradients: { header: ['#4B36A6', '#5C42C7', '#5C42C7'] },
      isDark: false,
    };
  });
} catch (e) {
  console.warn('Failed to import getTheme, using fallback:', e);
  getTheme = (isDark) => ({
    p1: '#5C42C7', p2: '#4B36A6', p3: '#BCDD0D', p4: '#EEF7B8',
    white: '#FFFFFF', ink: '#0F1020', gray: '#6b7280', muted: '#9ca3af',
    bg: '#FCFBFF', card: '#FFFFFF', line: '#E8E6F6', red: '#FF3B30',
    success: '#16a34a', danger: '#FF3B30', dangerBg: '#FFF1F1',
    brand: '#5C42C7', brandSoft: '#EEF7B8',
    gradients: { header: ['#4B36A6', '#5C42C7', '#5C42C7'] },
    isDark: false,
  });
}
// import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');
const API_BASE = 'https://luna-api.proteinbros.in/public/api/v1';

// ============================ SAFE-AREA HELPERS ============================
const getSafeTop = () => {
  const { width: W, height: H } = Dimensions.get('window');
  const isIOS = Platform.OS === 'ios';
  const hasNotch = isIOS && Math.max(W, H) >= 812;
  if (!isIOS) return StatusBar.currentHeight || 0;
  return hasNotch ? 44 : 20;
};

// ============================ OPTIONAL FAST IMAGE / HAPTICS ============================
let FastImage = null, Haptics = null;
try { FastImage = require('react-native-fast-image'); } catch { }
try { Haptics = require('react-native-haptic-feedback'); } catch { }

// ---- Image URI Normalizer (FIX) ----
const toUriString = (input) => {
  if (!input) return null;

  // already a string url
  if (typeof input === 'string') return input;

  // local require number
  if (typeof input === 'number') return input;

  // arrays like [{url: '...'}]
  if (Array.isArray(input) && input.length) return toUriString(input[0]);

  // object — probe common keys & nested shapes
  if (typeof input === 'object') {
    const candidates = [
      input.uri, input.url, input.src, input.source, input.path, input.link,
      input.image, input.img, input.thumbnail, input.thumb, input.logo,
      input?.media?.uri, input?.media?.url,
      input?.image?.uri, input?.image?.url,
      input?.banner?.uri, input?.banner?.url,
    ];
    for (const c of candidates) {
      const u = toUriString(c);
      if (u) return u;
    }
  }
  return null;
};

const PLACEHOLDER = 'https://dummyimage.com/600x400/e5e7eb/9ca3af.png&text=+';

// Base helpers
const IMG_BASE = 'https://proteinbros.in/assets/images/products/';
const BLOG_BASE = 'https://proteinbros.in/assets/images/blogs/';
const PROFILE_BASE = 'https://proteinbros.in/uploads/profile/';

const ensureAbs = (u, base = '') => {
  if (!u) return null;
  if (typeof u !== 'string') return u;
  if (/^(https?:|file:|content:|data:)/i.test(u)) return u;
  return `${base}${u.replace(/^\/+/, '')}`;
};

const isSvgUrl = (u) => typeof u === 'string' && /\.svg(\?.*)?$/i.test(u);

const Img = React.memo(({ uri, style, resizeMode = 'cover', priority = 'normal' }) => {
  const src = toUriString(uri) ?? PLACEHOLDER;
  const rnSource = typeof src === 'number' ? src : { uri: src };

  // Only use FastImage if it's properly loaded as a component
  const FastImageComponent = FastImage?.default || FastImage;
  if (FastImageComponent && typeof FastImageComponent === 'function') {
    try {
      const priorityObj = FastImage.priority || {};
      const resizeModeObj = FastImage.resizeMode || {};
      const cacheControlObj = FastImage.cacheControl || {};

      const fastImageSource = typeof src === 'number'
        ? src
        : {
          uri: src,
          ...(priorityObj[priority] && { priority: priorityObj[priority] }),
          ...(priorityObj.normal && !priorityObj[priority] && { priority: priorityObj.normal }),
        };

      return (
        <FastImageComponent
          source={fastImageSource}
          style={style}
          resizeMode={resizeModeObj[resizeMode] || resizeModeObj.cover || 'cover'}
          cache={cacheControlObj.immutable}
        />
      );
    } catch (e) {
      // FastImage failed, fallback to RNImage (silent fallback - no need to log)
      // console.error('FastImage render error:', e);
      // Fallback to RNImage if FastImage fails
    }
  }
  // Always fallback to React Native Image component
  return <RNImage source={rnSource} style={style} resizeMode={resizeMode} />;
});

const tap = () =>
  Haptics?.trigger?.('impactLight', { enableVibrateFallback: true, ignoreAndroidSystemSettings: false });

// Price helper (BHD)
const priceBHD = (p) => {
  if (p === null || p === undefined || p === '') return null;
  const n = Number(p);
  if (Number.isNaN(n)) return `BHD ${p}`;
  return `BHD ${n.toFixed(3)}`;
};

// ============================ UI PRIMITIVES ============================
const SectionHeader = React.memo(({ title, linkLabel, onPressLink, extraRight, styles }) => {
  // Safety check for styles
  if (!styles || !styles.sectionHeader) {
    console.warn('SectionHeader: styles prop is missing or invalid');
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>{title}</Text>
        {!!linkLabel && (
          <TouchableOpacity onPress={() => { tap(); onPressLink && onPressLink(); }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#5C42C7' }}>{linkLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {extraRight}
        {!!linkLabel && (
          <TouchableOpacity onPress={() => { tap(); onPressLink && onPressLink(); }}>
            <Text style={styles.seeAll}>{linkLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// Brand chip (SVG-aware)
const BrandChip = React.memo(({ logo, name, onPress, styles }) => {
  const src = typeof logo === 'number' ? logo : (toUriString?.(logo) ?? logo);
  const showSvg = typeof src === 'string' && isSvgUrl(src);

  return (
    <TouchableOpacity
      onPress={() => { tap(); onPress && onPress(); }}
      style={styles.brandChip}
      activeOpacity={0.85}
    >
      <View style={{ width: 52, height: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        {showSvg ? (
          <SvgUri width={52} height={28} source={{ uri: src }} />
        ) : (
          <Img uri={src} style={styles.brandLogo} resizeMode="contain" />
        )}
      </View>
      <Text numberOfLines={1} style={styles.brandText}>{name}</Text>
    </TouchableOpacity>
  );
});

// Product cards — navigate with productId & product
const DealCard = React.memo(({ item, onPress, styles }) => (
  <TouchableOpacity
    style={styles.dealCard}
    activeOpacity={0.9}
    onPress={onPress}
  >
    <Img uri={ensureAbs(item.photo, IMG_BASE) || item.img || item.image || item} style={styles.dealImg} />
    <Text numberOfLines={2} style={styles.dealTitle}>{item.title || item.name}</Text>
    {item.price ? <Text style={styles.dealPrice}>{priceBHD(item.price)}</Text> : null}
  </TouchableOpacity>
));

// Theme-aware subcategory gradients
const getSubcatColors = (variant, isDark) => {
  if (isDark) {
    // Dark mode gradients - more vibrant and visible
    const darkGradients = [
      ['#3a2f5c', '#4a3f6c'], // Purple tones
      ['#2a3f4c', '#3a4f5c'], // Blue tones
      ['#4a3f2c', '#5a4f3c'], // Brown/amber tones
    ];
    return darkGradients[variant % darkGradients.length];
  }
  // Light mode gradients - soft and elegant
  const lightGradients = [
    ['#F5EEFF', '#E5D9FF'],
    ['#E7F5FF', '#D2EBFF'],
    ['#FFF4EA', '#FFE2C5'],
  ];
  return lightGradients[variant % lightGradients.length];
};

const SubcatCard = React.memo(({ sc, navigation, variant = 0, styles, THEME }) => {
  const handlePress = () => {
    navigation.navigate('SubCategoryProductsScreen', {
      subcategory: {
        id: sc.id,
        name: sc.name || 'Sub-category',
        description: sc.slug || '',
        banner: null,
      }
    });
  };

  const colors = getSubcatColors(variant, THEME.isDark);

  return (
    <TouchableOpacity
      style={styles.subcatCard}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.subcatGradient}
      >
        <Text style={styles.subcatName} numberOfLines={2}>{sc.name || 'Sub-category'}</Text>
        <View style={styles.subcatRow}>
          <Text style={styles.subcatInfo}>
            {sc.products_count ? `${sc.products_count} products` : 'Explore now'}
          </Text>
          <Icon name="chevron-forward" size={18} color={THEME.isDark ? THEME.white : THEME.p1} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// Flash / Picks / SmallSquare (BHD + navigation)
const FlashCard = React.memo(({ f, navigation, styles }) => {
  // Safety check for styles
  if (!styles || !styles.flashCard) {
    console.warn('FlashCard: styles prop is missing or invalid');
    return (
      <TouchableOpacity
        style={{ width: 160, marginRight: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#f3f4f6' }}
        activeOpacity={0.9}
        onPress={() => navigation?.navigate?.('ProductDetailScreen', { productId: f.id, product: f })}
      >
        <RNImage source={{ uri: ensureAbs(f.photo, IMG_BASE) || PLACEHOLDER }} style={{ width: '100%', height: 200 }} />
        {f.price ? (
          <View style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: '#5C42C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{priceBHD(f.price)}</Text>
          </View>
        ) : null}
        {f.off ? <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#FF3B30', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>-{f.off}%</Text>
        </View> : null}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.flashCard}
      activeOpacity={0.9}
      onPress={() => navigation?.navigate?.('ProductDetailScreen', { productId: f.id, product: f })}
    >
      <Img uri={ensureAbs(f.photo, IMG_BASE)} style={styles.flashImg} />
      {f.price ? (
        <View style={styles.flashPricePill}>
          <Text style={styles.flashPriceText}>{priceBHD(f.price)}</Text>
        </View>
      ) : null}
      {f.off ? <View style={styles.flashBadge}><Text style={styles.flashText}>-{f.off}%</Text></View> : null}
    </TouchableOpacity>
  );
});

const PickCard = React.memo(({ p, navigation, onPress, styles }) => (
  <TouchableOpacity
    style={styles.pickCard}
    activeOpacity={0.9}
    onPress={onPress || (() => navigation?.navigate?.('ProductDetailScreen', { productId: p.id, product: p }))}
  >
    <Img uri={ensureAbs(p.photo, IMG_BASE)} style={styles.pickImg} />
    <Text numberOfLines={2} style={styles.pickTitle}>{p.title || p.name}</Text>
    {p.price ? <Text style={styles.pickPrice}>{priceBHD(p.price)}</Text> : null}
  </TouchableOpacity>
));

const SmallSquare = React.memo(({ item, navigation, onPress, styles }) => (
  <TouchableOpacity
    style={styles.smallSquare}
    activeOpacity={0.9}
    onPress={onPress || (() => navigation?.navigate?.('ProductDetailScreen', { productId: item.id, product: item }))}
  >
    <Img uri={ensureAbs(item.photo, IMG_BASE)} style={styles.smallSquareImg} />
    <Text style={styles.smallSquareTitle} numberOfLines={2}>{item.title || item.name}</Text>
    {item.price ? <Text style={styles.smallSquarePrice}>{priceBHD(item.price)}</Text> : null}
  </TouchableOpacity>
));

const CouponPill = React.memo(({ c, styles }) => {
  // c: { id, code, type, price, start_date, end_date, coupon_type, ... }
  const isPercent = Number(c.type) === 1; // assuming 1 = percent, 0 = flat (from your note)
  const discount = isPercent ? `${c.price}% off` : `${priceBHD(c.price)} off`;
  const validity = [c.start_date, c.end_date].filter(Boolean).join(' → ');
  const scope = c.coupon_type ? c.coupon_type.toUpperCase() : 'GENERAL';

  return (
    <View style={styles.couponCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.couponCodeBadge}>
          <Text style={styles.couponCodeText}>{String(c.code || '').toUpperCase()}</Text>
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.couponDiscount}>{discount}</Text>
          {!!validity && <Text style={styles.couponValidity}>Valid: {validity}</Text>}
        </View>
      </View>
      <View style={styles.couponFooterRow}>
        <Text style={styles.couponScope}>{scope}</Text>
        <TouchableOpacity style={styles.couponApplyBtn} onPress={tap}>
          <Text style={styles.couponApplyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Theme-aware celebrity gradients
const getCelebGradients = (accent, isDark) => {
  if (isDark) {
    // Dark mode gradients - richer and more visible
    const darkGradients = [
      ['#3a2f5c', '#4a3f6c', '#5a4f7c'], // Purple gradient
      ['#2a3f4c', '#3a4f5c', '#4a5f6c'], // Blue gradient
      ['#4a3f2c', '#5a4f3c', '#6a5f4c'], // Amber gradient
    ];
    return darkGradients[accent % darkGradients.length];
  }
  // Light mode gradients - soft and elegant
  const lightGradients = [
    ['#F1ECFF', '#E4E6FF'],
    ['#E3F6FF', '#D3EDFF'],
    ['#FFEFE8', '#FFE1D4'],
  ];
  return lightGradients[accent % lightGradients.length];
};

const CelebChip = React.memo(({ c, navigation, accent = 0, styles, THEME }) => {
  const colors = getCelebGradients(accent, THEME?.isDark || false);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation?.navigate?.('CelebrityDetail', { celebrity: c })}
      style={styles.celebCard}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.celebGradient}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Img
            uri={ensureAbs(c.photo, PROFILE_BASE) || c.avatar || c.image}
            style={styles.celebAvatarLg}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.celebName} numberOfLines={1}>{c.name}</Text>
            <Text style={styles.celebTag} numberOfLines={1}>{c.tag || 'Featured ambassador'}</Text>
          </View>
          <View style={styles.celebBtn}>
            <Text style={styles.celebBtnText}>View</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

/* ===== Story strip (optional, if API returns) ===== */
const StoryStrip = React.memo(({ data, navigation, THEME }) => {
  const storyStyles = StyleSheet.create({
    item: { alignItems: 'center', marginRight: 12, width: 70 },
    ring: { padding: 2, borderRadius: 40 },
    thumb: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eee' },
    caption: { marginTop: 6, fontSize: 11, color: THEME.ink, textAlign: 'center' }
  });

  return (
    Array.isArray(data) && data.length ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
      >
        {data.map((it, idx) => (
          <TouchableOpacity
            key={it.id || idx}
            activeOpacity={0.9}
            style={storyStyles.item}
            onPress={() => {
              tap();
              navigation?.navigate?.('StoriesScreen', { index: idx, data });
            }}
          >
            <LinearGradient colors={[THEME.p1, THEME.p3]} style={storyStyles.ring}>
              <Img uri={it.file} style={storyStyles.thumb} />
            </LinearGradient>
            <Text numberOfLines={1} style={storyStyles.caption}>{it.title || 'Story'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ) : null
  );
});

const SectionDivider = React.memo(({ styles }) => <View style={styles.sectionDivider} />);

// ============================ CATEGORY BAR ============================
const CategoryBar = ({ categories, activeId, onChange, styles, THEME, loading }) => {
  // Always show "For You" even if categories haven't loaded yet
  const displayCategories = categories && categories.length > 0
    ? categories
    : [{ id: null, name: 'For You', icon: 'sparkles-outline' }];

  // Removed excessive logging to prevent console spam

  if (loading && displayCategories.length <= 1) {
    return (
      <View style={styles.stickyWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          <View style={[styles.catChip, { opacity: 0.5 }]}>
            <Text style={styles.catText}>Loading...</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.stickyWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {displayCategories.map((c, index) => {
          const isActive = activeId === c.id;
          return (
            <TouchableOpacity
              key={`c-${c.id === null ? 'forYou' : c.id}-${index}`}
              onPress={() => {
                tap();
                onChange(c.id, c.name);
              }}
              activeOpacity={0.85}
              style={[styles.catChip, isActive && styles.catChipActive]}
            >
              <Icon name={c.icon || 'pricetags-outline'} size={16} color={isActive ? THEME.white : THEME.p1} />
              <Text style={[styles.catText, isActive && styles.catTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ============================ HEADER ============================
const HeaderBlock = React.memo(({
  name,
  searchHint,
  onPressAI,
  safeTop = 0,
  searchValue = '',
  onChangeSearch,
  onSubmitSearch,
  THEME,
  styles,
  navigation,
  onImageSearch,
}) => {
  const gradientHeader = [THEME.p2, THEME.p1, THEME.p1];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  };
  const isSmall = width < 360;
  const avatarSize = isSmall ? 38 : 42;
  const iconBox = isSmall ? 34 : 36;
  const searchH = isSmall ? 42 : 44;

  return (
    <LinearGradient
      colors={gradientHeader}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.headerWrap, { paddingTop: safeTop + 12 }]}
    >
      {Platform.OS === 'android' ? (
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      ) : null}

      <View style={styles.headerTopRow}>
        <View style={styles.userRow}>
          <RNImage source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.greetHi, { fontSize: isSmall ? 15 : 16 }]}>Hi, {name}</Text>
            <Text style={[styles.greetLine, { fontSize: isSmall ? 12 : 13 }]}>{getGreeting()} 👋</Text>
          </View>

          <TouchableOpacity style={[styles.roundIcon, { width: iconBox, height: iconBox }]} onPress={onPressAI}>
            <Icon name="sparkles-outline" size={20} color={THEME.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roundIcon, { width: iconBox, height: iconBox, marginLeft: 8 }]}
            onPress={() => {
              tap();
              navigation?.navigate?.('NotificationScreen');
            }}
          >
            <Icon name="notifications-outline" size={20} color={THEME.white} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBox, { height: searchH }]}>
          <Icon name="search-outline" size={18} color="#888" />
          <TextInput
            placeholder={searchHint}
            placeholderTextColor="#9ba3af"
            style={[styles.searchInput, { height: searchH }]}
            value={searchValue}
            onChangeText={onChangeSearch}
            returnKeyType="search"
            onSubmitEditing={() => onSubmitSearch?.(searchValue)}
          />
          <TouchableOpacity style={styles.suffixIcon} onPress={onImageSearch || tap}>
            <Icon name="scan-outline" size={20} color={THEME.p1} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
});

// ============================ NORMALIZER ============================
const normalizeHomePayload = (payload = {}) => {
  const arr = (k) => Array.isArray(payload[k]) ? payload[k] : [];
  return {
    searchHint: payload.searchHint || 'Search products, brands & more',
    stories: arr('stories'),
    blogs: arr('blogs'),
    banners: arr('banners'),
    partners: arr('partners'),
    coupons: arr('coupons'),
    vendors: arr('vendors'),
    brands: arr('brands'),
    subcats: arr('subCategories'),

    // product buckets
    random: arr('random_products'),
    hot: arr('hot_products'),
    latest: arr('latest_products'),
    best: arr('best_products'),
    trending: arr('trending_products'),
    sale: arr('sale_products'),
    flash: arr('flash_deal_products'),

    promo: payload.promo || payload.promoBanner || null,
  };
};

// ============================ MAIN ============================
export default function HomeScreen({ navigation }) {
  // Get theme with proper fallback
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (e) {
    themeContext = null;
  }

  const theme = themeContext?.theme || getTheme(false);
  const THEME = theme || getTheme(false);

  // Safety check - ensure THEME has required properties
  if (!THEME || !THEME.bg || !THEME.p1 || !THEME.p2) {
    console.error('HomeScreen: THEME is invalid:', THEME);
    const fallbackTheme = getTheme(false);
    return (
      <View style={{ flex: 1, backgroundColor: fallbackTheme.bg || '#FCFBFF', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: fallbackTheme.ink || '#000', fontSize: 16 }}>Loading theme...</Text>
      </View>
    );
  }

  const gradientHeader = [THEME.p2, THEME.p1, THEME.p1];
  const styles = useMemo(() => {
    try {
      return createStyles(THEME);
    } catch (e) {
      return createStyles(getTheme(false));
    }
  }, [THEME]);

  const SAFE_TOP = getSafeTop();

  const [name, setName] = useState('Vansh');
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState([
    { id: null, name: 'For You', icon: 'sparkles-outline' }, // synthetic default
  ]);

  // Removed debug logging to prevent console spam
  const [activeId, setActiveId] = useState(null);
  const [activeName, setActiveName] = useState('For You');

  const [data, setData] = useState(normalizeHomePayload({}));
  const [timer, setTimer] = useState('02:15:37');
  const [bannerIndex, setBannerIndex] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState(null);

  // Blog modal
  const [blogModal, setBlogModal] = useState({ visible: false, blog: null });

  // Read user name (for header greeting)
  useEffect(() => {
    const readUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('userdata');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.name) setName(u.name.split(' ')[0]);
        }
      } catch { }
    };
    readUser();
  }, []);

  // Countdown for flash deals - run once on mount, don't restart on category change
  useEffect(() => {
    let t = 2 * 60 * 60 + 15 * 60 + 37;
    const id = setInterval(() => {
      t = Math.max(0, t - 1);
      const hh = String(Math.floor(t / 3600)).padStart(2, '0');
      const mm = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
      const ss = String(t % 60).padStart(2, '0');
      setTimer(`${hh}:${mm}:${ss}`);
    }, 1000);
    return () => clearInterval(id);
  }, []); // Empty dependency array - run once on mount only

  // AbortController ref for categories fetch
  const categoriesAbortRef = useRef(null);

  // Fetch categories once with retry logic
  useEffect(() => {
    // Cancel any ongoing request
    if (categoriesAbortRef.current) {
      categoriesAbortRef.current.abort();
    }
    
    let didCancel = false;
    let retryCount = 0;
    const maxRetries = 3;
    const abortController = new AbortController();
    categoriesAbortRef.current = abortController;

      const fetchCategories = async (attempt = 1) => {
        if (attempt === 1) {
          setLoadingCats(true);
        }

        try {
          // Construct URL - remove any trailing slash from API_BASE
          const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
          const url = `${baseUrl}/screen/all-category`;
          
          // Try POST method since GET is giving 404 but POST routes work
          const res = await axios.post(url, {}, {
            timeout: 15000,
            signal: abortController.signal, // Cancel request if screen loses focus
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
        
        // Removed excessive logging to prevent console spam

        if (res?.status !== 200) {
          console.error('❌ HTTP Status not 200:', res?.status);
          throw new Error(`HTTP ${res?.status}: Failed to load categories`);
        }

        if (!res?.data) {
          console.error('❌ No data in response');
          throw new Error('No data in response');
        }

        if (res?.data?.status === false) {
          console.error('❌ API returned status false:', res?.data?.message);
          throw new Error(res?.data?.message || 'Failed to load categories');
        }

        // Extract categories from response
        const apiCats = Array.isArray(res?.data?.categories) ? res.data.categories : [];

        if (!res?.data?.categories) {
          console.error('❌ No categories field in response');
          console.error('❌ Response structure:', Object.keys(res?.data || {}));
        }

        if (apiCats.length === 0) {
          console.error('❌ Categories array is empty or not found');
        }

        const mapped = apiCats
          .filter(c => {
            const isValid = c && (c.id !== undefined && c.id !== null) && c.name;
            if (!isValid) {
              console.warn('⚠️ Invalid category filtered out:', c);
            }
            return isValid;
          })
          .map(c => ({
            id: c.id,
            name: c.name || 'Unknown',
            icon: 'pricetags-outline',
            raw: c,
          }));

        const finalCats = [{ id: null, name: 'For You', icon: 'sparkles-outline' }, ...mapped];

        if (!didCancel) {
          setCategories(finalCats);
          setError(null); // Clear any previous errors
          setLoadingCats(false);
        }
      } catch (e) {
        // Don't process errors for aborted requests
        if (axios.isCancel?.(e) || e.name === 'CanceledError' || abortController.signal.aborted || didCancel) {
          return;
        }

        console.error('❌ ERROR in fetchCategories:', e.message);

        // Retry logic
        if (attempt < maxRetries && !didCancel && !abortController.signal.aborted) {
          retryCount++;
          const delayMs = 2000 * attempt; // Exponential backoff: 2s, 4s, 6s
          setTimeout(() => {
            if (!didCancel && !abortController.signal.aborted) {
              fetchCategories(attempt + 1);
            }
          }, delayMs);
          return;
        }

        // All retries failed
        if (!didCancel && !abortController.signal.aborted) {
          const errorMsg = e.response?.data?.message
            || (e.code === 'ECONNABORTED' ? 'Request timeout. Please check your connection.'
              : e.message || 'Failed to load categories. Please check your connection.');
          setError(errorMsg);
          // Set empty categories with just "For You" as fallback
          setCategories([{ id: null, name: 'For You', icon: 'sparkles-outline' }]);
          setLoadingCats(false);
        }
      }
    };

    fetchCategories(1).catch(err => {
      if (!didCancel && !abortController.signal.aborted) {
        console.error('❌ CRITICAL: Unhandled error in fetchCategories:', err);
      }
    });

    // Cleanup: cancel request when component unmounts
    return () => {
      didCancel = true;
      if (categoriesAbortRef.current) {
        categoriesAbortRef.current.abort();
        categoriesAbortRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // AbortController ref to cancel requests when navigating away
  const abortControllerRef = useRef(null);

  // Fetch home data for selected category
  const fetchHome = useCallback(async (categoryId, signal) => {
    setLoading(true);
    setError(null);
    try {
      const body = { category_id: categoryId }; // null for For You
      const url = `${API_BASE}/screen/home`;

      const res = await axios.post(url, body, {
        timeout: 15000,
        signal, // Pass abort signal to cancel request
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Check if request was aborted
      if (signal?.aborted) {
        return;
      }

      if (res?.status !== 200) {
        throw new Error(`HTTP ${res?.status}: Failed to load home feed`);
      }

      const payload = res?.data || {};
      setData(normalizeHomePayload(payload));
    } catch (e) {
      // Don't log errors for aborted requests
      if (axios.isCancel?.(e) || e.name === 'CanceledError' || signal?.aborted) {
        return;
      }
      
      console.error('Error loading home feed:', {
        message: e.message,
        code: e.code,
        response: e.response?.data,
        status: e.response?.status,
        url: e.config?.url,
      });

      const errorMsg = e.response?.status === 404
        ? 'Home feed endpoint not found. Please check your connection.'
        : e.response?.data?.message || e.message || 'Failed to load home feed.';
      setError(errorMsg);
      setData(normalizeHomePayload({})); // reset
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch home data when category changes - with request cancellation
  useEffect(() => {
    // Cancel any ongoing requests first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Only fetch after categories are loaded
    if (!loadingCats) {
      fetchHome(activeId, abortController.signal);
    }

    // Cleanup: abort request when component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, loadingCats]); // Only re-fetch when category or loading state changes

  // Removed navigation to SubcategoryListScreen - categories now filter data on same screen
  // useEffect(() => {
  //   if (!navToSubcats) return;
  //   const subcats = Array.isArray(data.subcats) ? data.subcats : [];
  //   if (subcats.length) {
  //     navigation?.navigate?.('SubcategoryListScreen', {
  //       title: 'Sub-Categories',
  //       category: activeName,
  //       items: subcats,
  //     });
  //     setNavToSubcats(false);
  //   }
  // }, [data.subcats, navToSubcats, activeName, navigation]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchHome(activeId);
      setTimer('02:15:37');
      setBannerIndex(0);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchSubmit = useCallback((value) => {
    const query = (value ?? searchQuery).trim();
    if (!query) return;
    navigation?.navigate?.('ExploreScreen', { search: query });
  }, [navigation, searchQuery]);

  const handleImageSearch = useCallback(() => {
    tap(); // Haptic feedback

    // Show action sheet for camera or gallery
    Alert.alert(
      'Search by Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const image = await ImagePicker.openCamera({
                width: 1200,
                height: 1200,
                cropping: false,
                compressImageQuality: 0.8,
              });

              if (image && image.path) {
                navigation?.navigate?.('ImageSearchResults', {
                  image: {
                    uri: image.path,
                    type: image.mime || 'image/jpeg',
                    fileName: image.filename || 'camera-image.jpg',
                  },
                });
              }
            } catch (error) {
              if (error.code !== 'E_PICKER_CANCELLED') {
                // User cancelled is expected, only log real errors
                console.error('Camera error:', error);
                Alert.alert('Error', 'Failed to open camera');
              }
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            try {
              const image = await ImagePicker.openPicker({
                width: 1200,
                height: 1200,
                cropping: false,
                compressImageQuality: 0.8,
              });

              if (image && image.path) {
                navigation?.navigate?.('ImageSearchResults', {
                  image: {
                    uri: image.path,
                    type: image.mime || 'image/jpeg',
                    fileName: image.filename || 'gallery-image.jpg',
                  },
                });
              }
            } catch (error) {
              if (error.code !== 'E_PICKER_CANCELLED') {
                // User cancelled is expected, only log real errors
                console.error('Gallery error:', error);
                Alert.alert('Error', 'Failed to open gallery');
              }
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, [navigation]);

  const handleBannerMomentumEnd = useCallback(({ nativeEvent }) => {
    if (!nativeEvent?.contentOffset) return;
    const next = Math.round(nativeEvent.contentOffset.x / width);
    if (!Number.isNaN(next)) setBannerIndex(next);
  }, [width]);

  const renderBannerItem = useCallback(({ item }) => {
    const heroUri = ensureAbs(item?.image || item?.banner || item?.photo) || PLACEHOLDER;
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.heroItemWrap}
        onPress={() => {
          tap();
          if (item?.link) {
            Linking.openURL(item.link).catch(() => { });
          }
        }}
      >
        <Img uri={heroUri} resizeMode="cover" style={[styles.heroBanner, { height: HERO_H }]} />
      </TouchableOpacity>
    );
  }, [styles, HERO_H]);

  // Short-hands with safe defaults
  const arr = (key) => Array.isArray(data[key]) ? data[key] : [];

  const stories = arr('stories');
  const banners = arr('banners');
  const subcatsRaw = arr('subcats');
  const deals = arr('deals'); // (only if backend provides)
  const brands = arr('brands');
  const flash = arr('flash');
  const picks = arr('random');      // random_products
  const trending = arr('trending');    // trending_products
  const bestSellers = arr('best');        // best_products
  const coupons = arr('coupons');
  const newArrivals = arr('latest');      // latest_products
  const celebs = arr('vendors');     // vendors list
  const blogs = arr('blogs');       // blog list

  const subcats = subcatsRaw.length ? subcatsRaw.slice(0, 6) : [];
  const HERO_H = Math.round(width * 0.45);

  // Category change handler (tap category -> also mark to navigate to subcats)
  const onCategoryChange = (id, name) => {
    setActiveId(id);
    setActiveName(name);
    // Data will be updated automatically via useEffect that watches activeId
    // No need to navigate - just filter data on same screen
  };

  // BLOG modal content
  const renderBlogModal = () => (
    <Modal
      transparent
      visible={blogModal.visible}
      animationType="fade"
      onRequestClose={() => setBlogModal({ visible: false, blog: null })}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>{blogModal.blog?.title || 'Details'}</Text>
            <TouchableOpacity onPress={() => setBlogModal({ visible: false, blog: null })} style={styles.modalCloseBtn}>
              <Icon name="close" size={20} color="#111" />
            </TouchableOpacity>
          </View>
          {/* <WebView
            originWhitelist={['*']}
            style={{ height: 360, borderRadius: 10, overflow: 'hidden' }}
            source={{
              html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <style> body{font-family:-apple-system,Segoe UI,Roboto,system-ui,sans-serif;padding:12px;color:#111;line-height:1.5}
                  img{max-width:100%;height:auto;border-radius:8px} h1,h2,h3{margin:0 0 8px}</style>
                </head>
                <body>${blogModal.blog?.details || ''}</body>
              </html>` }}
          /> */}
        </View>
      </View>
    </Modal>
  );

  // Removed render logging to prevent console spam

  try {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.p3}
              colors={[THEME.p3, THEME.p2]}
              progressBackgroundColor="#fff"
            />
          }
          contentContainerStyle={{ paddingBottom: 40, backgroundColor: THEME.bg }}
        >
          {/* Sticky header stack (Header + Category Bar) */}
          <View style={styles.stickyHeaderContainer}>
            <HeaderBlock
              name={name}
              searchHint={data.searchHint || 'Search'}
              onPressAI={() => { }}
              safeTop={SAFE_TOP}
              searchValue={searchQuery}
              onChangeSearch={setSearchQuery}
              onSubmitSearch={handleSearchSubmit}
              styles={styles}
              THEME={THEME}
              navigation={navigation}
              onImageSearch={handleImageSearch}
            />
            <CategoryBar
              categories={categories}
              activeId={activeId}
              onChange={onCategoryChange}
              styles={styles}
              loading={loadingCats}
              THEME={THEME}
              loading={loadingCats}
            />
          </View>

          {/* INFO / ERRORS */}
          {error ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
              <Text style={{ color: THEME.red, fontWeight: '700' }}>{error}</Text>
            </View>
          ) : null}
          
          {/* STORIES - Only show title and section if stories are available */}
          {!loading && stories.length > 0 && (
            <>
              <SectionHeader title="Reels" linkLabel="View all" onPressLink={() => navigation?.navigate?.('CelebritiesScreen')} styles={styles} />
              <StoryStrip data={stories} navigation={navigation} THEME={THEME} />
            </>
          )}

          {/* HERO BANNERS */}

          {loading ? (
            <View style={{ paddingHorizontal: 12, marginTop: 8 }}>
              <Shimmer width={width - 24} height={HERO_H} radius={12} />
              <View style={styles.dotsRow}>
                <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
              </View>
            </View>
          ) : banners.length > 0 ? (
            <>
              <FlatList
                data={banners}
                keyExtractor={(u, i) => `b-${i}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleBannerMomentumEnd}
                renderItem={renderBannerItem}
              />
              <View style={styles.dotsRow}>
                {banners.map((_, i) => (
                  <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
                ))}
              </View>
            </>
          ) : null}

          {/* CELEBS */}
          {loading && !celebs.length ? (
            <View style={styles.celebSkeletonRow}>
              {[0, 1, 2].map(i => (
                <View key={`celeb-s-${i}`} style={styles.celebCard}>
                  <Shimmer width={220} height={92} radius={18} />
                </View>
              ))}
            </View>
          ) : !loading && celebs.length > 0 ? (
            <>
              <SectionHeader title="Celebrities" linkLabel="View all" onPressLink={() => navigation?.navigate?.('CelebritiesScreen')} styles={styles} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}>
                {celebs.map((c, idx) => <CelebChip key={c.id || idx} c={c} navigation={navigation} accent={idx} styles={styles} THEME={THEME} />)}
              </ScrollView>
            </>
          ) : null}
          {((loading && !celebs.length) || (!loading && celebs.length > 0)) && <SectionDivider styles={styles} />}

          {/* SUB-CATEGORIES */}
          {!loading && subcats.length > 0 && (
            <>
              <SectionHeader
                title={`${activeName} Sub-Categories`}
                linkLabel="View all"
                onPressLink={() => {
                  navigation?.navigate?.('SubcategoryListScreen', {
                    title: 'Sub-Categories',
                    category: activeName,
                    items: subcatsRaw,
                  });
                }}
                styles={styles}
              />
              <View style={styles.subcatGrid}>
                {subcats.map((sc, i) => (
                  <SubcatCard sc={sc} key={`sc-${i}`} navigation={navigation} variant={i} styles={styles} THEME={THEME} />
                ))}
              </View>
            </>
          )}

          {/* COUPONS — redesigned */}
          {!loading && coupons.length > 0 && (
            <>
              <SectionHeader title="Coupons & Offers" styles={styles} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 2 }}
              >
                {coupons.map((c) => <CouponPill key={c.id} c={c} styles={styles} />)}
              </ScrollView>
              <SectionDivider styles={styles} />
            </>
          )}

          {/* DEALS (if any) */}
          {!loading && deals && deals.length > 0 && (
            <>
              <SectionHeader title={`${activeName} Deals`} linkLabel="See all" onPressLink={() => navigation?.navigate?.('ExploreScreen')} styles={styles} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={deals}
                keyExtractor={(it, idx) => it.id || `d-${idx}`}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => (
                  <DealCard
                    item={item}
                    onPress={() => navigation?.navigate?.('ProductDetailScreen', { productId: item.id, product: item })}
                    styles={styles}
                  />
                )}
                initialNumToRender={6}
                windowSize={7}
                maxToRenderPerBatch={10}
                removeClippedSubviews
              />
            </>
          )}

          {/* BRANDS */}
          {!loading && brands.length > 0 && (
            <>
              <SectionHeader title="Brand Stores" styles={styles} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={brands}
                keyExtractor={(it, idx) => it.name || `br-${idx}`}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => (
                  <BrandChip
                    logo={item.logo}
                    name={item.name}
                    styles={styles}
                    onPress={() => navigation?.navigate?.('BrandStoreScreen', { brand: { name: item.name, logo: item.logo || item.image } })}
                  />
                )}
                initialNumToRender={8}
                windowSize={7}
                maxToRenderPerBatch={12}
                removeClippedSubviews
              />
              <SectionDivider styles={styles} />
            </>
          )}

          {/* FLASH */}
          {!loading && flash.length > 0 && (
            <>
              <SectionHeader
                title="Flash Deals"
                extraRight={
                  <View style={styles.timerPill}>
                    <Icon name="time-outline" size={14} color={THEME.ink} />
                    <Text style={styles.timerText}>{timer}</Text>
                  </View>
                }
                linkLabel="See all"
                styles={styles}
                onPressLink={() => navigation?.navigate?.('FlashSaleScreen')}
              />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={flash}
                keyExtractor={(f, idx) => f.id || `fl-${idx}`}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => <FlashCard f={item} navigation={navigation} styles={styles} />}
                initialNumToRender={6}
                windowSize={7}
                maxToRenderPerBatch={10}
                removeClippedSubviews
              />
              <SectionDivider styles={styles} />
            </>
          )}

          {/* TRENDING */}
          {!loading && trending.length > 0 && (
            <>
              <SectionHeader title="Trending Collections" linkLabel="Explore" onPressLink={() => navigation?.navigate?.('TrendingProductsScreen')} styles={styles} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={trending}
                keyExtractor={(i, idx) => i.id || `tr-${idx}`}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => <SmallSquare item={item} navigation={navigation} styles={styles} />}
                initialNumToRender={6}
                windowSize={7}
                maxToRenderPerBatch={10}
                removeClippedSubviews
              />
            </>
          )}

          {/* PICKS */}
          {!loading && picks.length > 0 && (
            <>
              <SectionHeader title="Top Picks for You" styles={styles} />
              <View className="picks" style={styles.picksGrid}>
                {picks.map((p, idx) => (
                  <PickCard
                    key={p.id || `pk-${idx}`}
                    p={p}
                    navigation={navigation}
                    styles={styles}
                    onPress={() => navigation?.navigate?.('ProductDetailScreen', { productId: p.id, product: p })}
                  />
                ))}
              </View>
            </>
          )}

          {/* BEST SELLERS */}
          {!loading && bestSellers.length > 0 && (
            <>
              <SectionHeader title="Best Sellers" linkLabel="See all" onPressLink={() => { navigation.navigate('BestProductsScreen') }} styles={styles} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={bestSellers}
                keyExtractor={(i, idx) => i.id || `bs-${idx}`}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => <SmallSquare item={item} navigation={navigation} styles={styles} />}
                initialNumToRender={6}
                windowSize={7}
                maxToRenderPerBatch={10}
                removeClippedSubviews
              />
            </>
          )}

          {/* NEW ARRIVALS */}
          {!loading && newArrivals.length > 0 && (
            <>
              <SectionHeader title="New Arrivals" linkLabel="See all" onPressLink={() => { navigation.navigate('AllNewProductScreen') }} styles={styles} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={newArrivals}
                keyExtractor={(i, idx) => i.id || `na-${idx}`}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => <SmallSquare item={item} navigation={navigation} styles={styles} />}
                initialNumToRender={6}
                windowSize={7}
                maxToRenderPerBatch={10}
                removeClippedSubviews
              />
            </>
          )}

          {/* BLOGS (at the last) */}
          {!loading && blogs.length > 0 && (
            <>
              <SectionHeader title="From Our Blog" linkLabel="View more" onPressLink={() => {
                navigation?.navigate?.('BlogListScreen');
              }} styles={styles} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={blogs}
                keyExtractor={(b, i) => b.id || `blog-${i}`}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    activeOpacity={0.92}
                    style={styles.blogCard}
                    onPress={() => navigation?.navigate?.('BlogDetailScreen', { blog: item })}
                  >
                    <View style={styles.blogImageWrap}>
                      <Img uri={ensureAbs(item.photo, BLOG_BASE) || ensureAbs(item.image, BLOG_BASE) || ensureAbs(item.img, BLOG_BASE)} style={styles.blogImg} />
                    </View>
                    <View style={styles.blogContent}>
                      <Text style={styles.blogEyebrow}>{item.category || `Story ${index + 1}`}</Text>
                      <Text numberOfLines={2} style={styles.blogTitle}>{item.title}</Text>
                      <View style={styles.blogFooter}>
                        <Text style={styles.blogMeta}>{item.author || 'Team Luna'}</Text>
                        <Icon name="arrow-forward" size={16} color={THEME.p1} />
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                initialNumToRender={6}
                windowSize={6}
                maxToRenderPerBatch={8}
                removeClippedSubviews
              />
            </>
          )}

          {/* PROMO */}
          {!loading && !!data.promo && (
            <>
              <SectionHeader title="Discover More" styles={styles} />
              <View style={{ paddingHorizontal: 12, marginTop: 2 }}>
                <Img uri={data.promo} style={styles.bottomBanner} />
                <Text style={styles.bottomTitle}>New this week</Text>
                <Text style={styles.bottomDesc}>Fresh picks across fashion, tech and home.</Text>
                <TouchableOpacity onPress={tap}><Text style={styles.bottomLink}>Discover now</Text></TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        {/* Blog modal */}
        {renderBlogModal()}
      </View>
    );
  } catch (error) {
    console.error('HomeScreen: CRITICAL RENDER ERROR:', error);
    console.error('HomeScreen: Error message:', error.message);
    console.error('HomeScreen: Error stack:', error.stack);
    console.error('HomeScreen: Error name:', error.name);
    const fallbackTheme = getTheme(false);
    return (
      <View style={{ flex: 1, backgroundColor: fallbackTheme.bg || '#FCFBFF', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: fallbackTheme.ink || '#000', fontSize: 16, marginBottom: 10, fontWeight: 'bold' }}>Error loading screen</Text>
        <Text style={{ color: fallbackTheme.ink || '#000', fontSize: 12 }}>{error.message || 'Unknown error'}</Text>
        <Text style={{ color: '#666', fontSize: 10, marginTop: 10 }}>Check console for details</Text>
      </View>
    );
  }
}

// ============================ SHIMMER ============================
const Shimmer = ({ width = 160, height = 16, radius = 8 }) => (
  <View style={{ width, height, borderRadius: radius, overflow: 'hidden', backgroundColor: '#f1f1f6' }}>
    <LinearGradient
      colors={['#f1f1f6', '#e7e7ee', '#f1f1f6']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={{ width: '60%', height: '100%', transform: [{ translateX: -width }] }}
    />
  </View>
);

// ============================ STYLES ============================
const CARD_R = 14;
const SUBCAT_TILE_W = (width - 12 * 2 - 12) / 2;
const BLOG_W = 220;

const createStyles = (THEME) => StyleSheet.create({
  page: { backgroundColor: THEME.bg },

  /* Header */
  stickyHeaderContainer: {
    backgroundColor: THEME.bg,
    zIndex: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerWrap: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingBottom: 12,
  },
  headerTopRow: { gap: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingHorizontal: 15 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#fff' },
  greetHi: { color: THEME.white, fontWeight: '800', fontSize: 16 },
  greetLine: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  roundIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: THEME.white, borderRadius: 12, paddingHorizontal: 15, height: 44, marginHorizontal: 15
  },
  searchInput: { flex: 1, height: 44, color: THEME.ink },
  suffixIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  /* Sticky Categories */
  stickyWrap: {
    backgroundColor: THEME.bg, paddingVertical: 10, paddingHorizontal: 8,
    borderBottomWidth: 1, borderColor: '#f0f0f5',
  },
  catRow: { paddingHorizontal: 4, gap: 8, alignItems: 'center' },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100,
    backgroundColor: 'rgba(92,66,199,0.10)', borderWidth: 1, borderColor: 'rgba(92,66,199,0.28)',
    paddingTop: 10
  },
  catChipActive: { backgroundColor: THEME.p1, borderColor: THEME.p1 },
  catText: { color: THEME.p1, fontWeight: '700' },
  catTextActive: { color: THEME.white },

  /* Section header */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginTop: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: THEME.p1 },
  seeAll: { color: THEME.p1, fontWeight: '800', marginLeft: 12 },
  sectionDivider: { height: 1, backgroundColor: THEME.line, marginHorizontal: 12, marginTop: 18 },

  /* Hero */
  heroItemWrap: { width, paddingHorizontal: 12 },
  heroBanner: { width: width - 24, alignSelf: 'center', borderRadius: 16, backgroundColor: '#fff' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(92,66,199,0.30)' },
  dotActive: { backgroundColor: THEME.p1 },

  /* Sub-categories */
  subcatGrid: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subcatCard: {
    width: SUBCAT_TILE_W,
    marginBottom: 14,
  },
  subcatGradient: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 112,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,16,32,0.05)',
  },
  subcatName: { color: THEME.isDark ? THEME.white : THEME.ink, fontWeight: '900', fontSize: 15 },
  subcatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  subcatInfo: { color: THEME.isDark ? 'rgba(255,255,255,0.7)' : THEME.gray, fontSize: 12, fontWeight: '600' },

  /* Coupon — redesigned */
  couponCard: {
    marginRight: 12, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: THEME.line, minWidth: 240,
    backgroundColor: THEME.card,
  },
  couponCodeBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: THEME.p4, borderWidth: 1, borderColor: THEME.line,
  },
  couponCodeText: { fontWeight: '900', color: THEME.ink, letterSpacing: 0.5 },
  couponDiscount: { marginTop: 2, fontWeight: '800', color: THEME.p1 },
  couponValidity: { marginTop: 2, color: THEME.gray, fontSize: 12 },
  couponFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  couponScope: { fontSize: 12, fontWeight: '700', color: THEME.muted },
  couponApplyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: THEME.p1 },
  couponApplyText: { color: THEME.white, fontWeight: '800' },

  /* Deals rail */
  dealCard: { width: 150, borderRadius: CARD_R, marginRight: 12, backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.line, padding: 8 },
  dealImg: { width: '100%', height: 110, borderRadius: 10, backgroundColor: '#f5f5f5' },
  dealTitle: { fontSize: 13, marginTop: 6, color: THEME.ink },
  dealPrice: { fontSize: 15, fontWeight: '900', marginTop: 4, color: THEME.p1 },

  /* Brand strip */
  brandChip: { width: 92, marginRight: 12, borderWidth: 1, borderColor: THEME.line, borderRadius: 10, padding: 8, alignItems: 'center', backgroundColor: THEME.card },
  brandLogo: { width: 52, height: 28 },
  brandText: { fontSize: 12, fontWeight: '700', color: THEME.ink },

  /* Flash deals */
  timerPill: { marginRight: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(92,66,199,0.10)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: THEME.p3, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  flashText: { fontSize: 12, fontWeight: '900', color: THEME.ink },
  flashPricePill: { position: 'absolute', left: 8, bottom: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  flashPriceText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  timerText: { fontSize: 12, fontWeight: '900', color: THEME.ink },
  flashCard: { width: 120, height: 140, borderRadius: 12, backgroundColor: '#f5f5f5', marginRight: 12, overflow: 'hidden', borderWidth: 1, borderColor: THEME.line },
  flashImg: { width: '100%', height: '100%' },

  /* Picks grid */
  picksGrid: { paddingHorizontal: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  pickCard: { width: (width - 12 * 2 - 12) / 2, borderRadius: 14, borderWidth: 1, borderColor: THEME.line, backgroundColor: THEME.card, marginBottom: 12, overflow: 'hidden', padding: 8 },
  pickImg: { width: '100%', height: 160, borderRadius: 10, backgroundColor: '#f5f5f5' },
  pickTitle: { marginTop: 6, fontSize: 13, color: THEME.ink },
  pickPrice: { fontSize: 15, fontWeight: '900', marginTop: 4, color: THEME.p1 },

  /* Small squares */
  smallSquare: { width: 140, borderRadius: 12, backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.line, marginRight: 12, padding: 8 },
  smallSquareImg: { width: '100%', height: 110, borderRadius: 8, backgroundColor: '#f4f4f6' },
  smallSquareTitle: { marginTop: 6, fontSize: 13, color: THEME.ink },
  smallSquarePrice: { marginTop: 4, fontWeight: '900', color: THEME.p1 },

  /* Celebrities */
  celebCard: { marginRight: 12 },
  celebGradient: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,16,32,0.06)',
    minWidth: 220,
  },
  celebSkeletonRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 4 },
  celebAvatarLg: { width: 56, height: 56, borderRadius: 16, backgroundColor: THEME.isDark ? THEME.line : '#eee' },
  celebName: { fontWeight: '900', color: THEME.isDark ? THEME.white : THEME.ink, fontSize: 14 },
  celebTag: { color: THEME.isDark ? 'rgba(255,255,255,0.7)' : THEME.gray, fontSize: 12, marginTop: 2 },
  celebBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME.isDark ? 'rgba(255,255,255,0.15)' : THEME.white,
    borderWidth: 1,
    borderColor: THEME.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,16,32,0.08)',
  },
  celebBtnText: { fontWeight: '800', color: THEME.isDark ? THEME.white : THEME.p1, fontSize: 12 },

  /* Blog */
  blogCard: {
    width: BLOG_W,
    marginRight: 16,
    borderRadius: 18,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: 'rgba(15,16,32,0.08)',
    overflow: 'hidden',
    shadowColor: '#0F1020',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  blogImageWrap: { height: 130, overflow: 'hidden' },
  blogImg: { width: '100%', height: '100%' },
  blogContent: { padding: 14, gap: 8 },
  blogEyebrow: { fontSize: 11, fontWeight: '800', color: THEME.p1, letterSpacing: 0.2 },
  blogTitle: { color: THEME.ink, fontWeight: '900', fontSize: 14 },
  blogFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  blogMeta: { fontSize: 12, color: THEME.gray },

  /* Bottom promo */
  bottomBanner: { width: '100%', height: Math.round(width * 0.55), borderRadius: 14, backgroundColor: '#e5e7eb' },
  bottomTitle: { marginTop: 12, fontSize: 20, fontWeight: '900', color: THEME.ink },
  bottomDesc: { marginTop: 6, color: THEME.gray },
  bottomLink: { marginTop: 10, fontWeight: '900', color: THEME.p1, textDecorationLine: 'underline' },

  /* Modal */
  modalBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16
  },
  modalCard: { width: '100%', borderRadius: 14, backgroundColor: '#fff', padding: 12, maxWidth: 520 },
  modalHeader: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { flex: 1, fontWeight: '900', color: THEME.ink, fontSize: 16 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' },
});
