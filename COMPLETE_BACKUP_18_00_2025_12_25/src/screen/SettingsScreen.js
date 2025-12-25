// src/screens/SettingsScreen.js
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  useWindowDimensions,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/UserStore';
import { useTheme } from '../context/ThemeContext';
import { Switch } from 'react-native';
import api from '../services/api';

// Safe area helper
const getSafeTop = () => {
  const { width: W, height: H } = Dimensions.get('window');
  const isIOS = Platform.OS === 'ios';
  const hasNotch = isIOS && Math.max(W, H) >= 812;
  if (!isIOS) return StatusBar.currentHeight || 0;
  return hasNotch ? 44 : 20;
};

/* --------------- Async keys --------------- */
const USER_STORAGE_KEY = 'luna_user';

/* --------------- image base --------------- */
const PROFILE_BASE = 'https://proteinbros.in/luna-api/public/';

/* --------------- responsive helpers --------------- */
const BASE_W = 375;
const BASE_H = 812;
function useScale() {
  const { width, height } = useWindowDimensions();
  const scale = s => (width / BASE_W) * s;
  const vscale = s => (height / BASE_H) * s;
  const ms = (s, f = 0.25) => s + (scale(s) - s) * f;
  return { width, height, scale, vscale, ms };
}

/* ---------------- small atoms ---------------- */
const RightChevron = () => <Feather name="chevron-right" size={16} color="#9CA3AF" />;

const IconBadge = ({ name, color, brandSoft, C, styles }) => {
  // Safety check for styles
  if (!styles || !styles.iconBadge) {
    console.warn('IconBadge: styles prop is missing or invalid');
    return (
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: brandSoft || C?.brandSoft || '#EEF7B8', alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={name} size={16} color={color || C?.brand || '#5C42C7'} />
      </View>
    );
  }
  
  return (
    <View style={[styles.iconBadge, { backgroundColor: brandSoft || C?.brandSoft }]}>
      <Feather name={name} size={16} color={color} />
    </View>
  );
};

const RowItem = ({ icon, label, value, onPress, danger, rightComponent, C, styles }) => {
  // Safety check for styles
  if (!styles || !styles.row) {
    console.warn('RowItem: styles prop is missing or invalid');
    return (
      <TouchableOpacity 
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C?.card || '#fff', marginBottom: 1 }} 
        activeOpacity={0.9} 
        onPress={onPress}
        disabled={!!rightComponent}
      >
        <IconBadge name={icon} color={danger ? C?.danger : C?.brand} brandSoft={C?.brandSoft} C={C} styles={styles} />
        <Text style={{ flex: 1, fontSize: 15, fontWeight: danger ? '800' : '500', color: danger ? (C?.danger || '#FF3B30') : (C?.ink || '#000'), marginLeft: 12 }}>{label}</Text>
        {value ? <Text style={{ fontSize: 14, color: C?.gray || '#6b7280', marginRight: 8 }}>{value}</Text> : null}
        {rightComponent || (!danger && <RightChevron />)}
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={onPress} disabled={!!rightComponent}>
      <IconBadge name={icon} color={danger ? C.danger : C.brand} brandSoft={C.brandSoft} C={C} styles={styles} />
      <Text style={[styles.rowLabel, danger && { color: C.danger, fontWeight: '800' }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {rightComponent || (!danger && <RightChevron />)}
    </TouchableOpacity>
  );
};

const QuickTile = ({ icon, title, subtitle, onPress, tileW, C, styles }) => {
  // Safety check for styles
  if (!styles || !styles.tile) {
    console.warn('QuickTile: styles prop is missing or invalid');
    return (
      <TouchableOpacity
        style={[{ width: tileW, backgroundColor: C?.card || '#fff', borderRadius: 12, padding: 12, marginBottom: 12 }]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C?.brandSoft || '#EEF7B8', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Feather name={icon} size={16} color={C?.brand || '#5C42C7'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C?.ink || '#000' }} numberOfLines={1}>{title}</Text>
            <Text style={{ fontSize: 12, color: C?.gray || '#6b7280', marginTop: 2 }} numberOfLines={1}>{subtitle}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[styles.tile, { width: tileW }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.tileLeft}>
        <View style={styles.tileIcon}>
          <Feather name={icon} size={16} color={C.brand} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tileTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.tileSub} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
    <RightChevron />
  </TouchableOpacity>
  );
};

/* ---------------- confirm modal ---------------- */
const ConfirmSheet = ({
  visible,
  onClose,
  onConfirm,
  confirmLabel,
  confirmTone = '#111',
  title,
  subtitle,
  iconBg = '#EFEFEF',
  iconColor = '#111',
  cancelLabel,
  styles,
  C,
}) => {
  // Safety check for styles
  if (!styles || !styles.modalRoot) {
    console.warn('ConfirmSheet: styles prop is missing or invalid');
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          {Platform.OS === 'ios' ? (
            <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={14} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />
          )}

          <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 18, paddingTop: 28, paddingBottom: 16, alignItems: 'center' }}>
            <View style={{ position: 'absolute', top: -18, alignSelf: 'center', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg }}>
              <Feather name="alert-circle" size={20} color={iconColor} />
            </View>

            <Text style={{ marginTop: 6, fontSize: 16, fontWeight: '800', color: '#111', textAlign: 'center' }}>{title}</Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: C?.sub || '#6b7280', textAlign: 'center' }}>{subtitle}</Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' }}>
              <Pressable style={{ flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }} onPress={onClose}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{cancelLabel}</Text>
              </Pressable>
              <Pressable style={{ flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: confirmTone }} onPress={onConfirm}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        {Platform.OS === 'ios' ? (
          <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={14} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />
        )}

        <View style={styles.sheetCard}>
          <View style={[styles.badge, { backgroundColor: iconBg }]}>
            <Feather name="alert-circle" size={20} color={iconColor} />
          </View>

          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetSubtitle}>{subtitle}</Text>

          <View style={styles.sheetBtnsRow}>
            <Pressable style={[styles.btn, styles.btnDark]} onPress={onClose}>
              <Text style={styles.btnDarkText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: confirmTone }]} onPress={onConfirm}>
              <Text style={styles.btnText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ---------------- helpers ---------------- */
const normalizeUser = (raw) => {
  const u = raw?.user ?? raw?.data ?? raw ?? {};
  return {
    id: u.id ?? null,
    name: u.name ?? null,
    email: u.email ?? null,
    phone: u.phone ?? null,
    photo: u.photo ?? null,
    role: u.role ?? null,
    status: u.status ?? null,
    country: u.country ?? null,
    language: u.language ?? null,
    currency: u.currency ?? null,
    gender: u.gender ?? null,
    date_of_birth: u.date_of_birth ?? null,
  };
};

// Helper function to get display names for language codes
const getLanguageDisplayName = (langCode) => {
  const languages = {
    'en': 'English',
    'ar': 'Arabic',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'hi': 'Hindi',
  };
  return languages[langCode] || langCode || 'Select Language';
};

// Helper function to get display names for currency codes
const getCurrencyDisplayName = (currencyCode) => {
  const currencies = {
    'USD': 'US Dollar ($)',
    'BHD': 'Bahraini Dinar (.د.ب)',
    'EUR': 'Euro (€)',
    'GBP': 'British Pound (£)',
    'INR': 'Indian Rupee (₹)',
    'AED': 'UAE Dirham (د.إ)',
    'SAR': 'Saudi Riyal (﷼)',
    'CAD': 'Canadian Dollar (C$)',
    'AUD': 'Australian Dollar (A$)',
    'JPY': 'Japanese Yen (¥)',
  };
  return currencies[currencyCode] || currencyCode || 'Select Currency';
};

// Helper function to get display names for countries
const getCountryDisplayName = (countryName) => {
  // If it's already a full country name, return it
  if (countryName && countryName.length > 2) {
    return countryName;
  }

  const countries = {
    'BH': 'Bahrain',
    'US': 'United States',
    'GB': 'United Kingdom',
    'IN': 'India',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'CA': 'Canada',
    'AU': 'Australia',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'BR': 'Brazil',
    'RU': 'Russia',
  };
  return countries[countryName] || countryName || 'Select Country';
};

/* ---------------- main ---------------- */
const SettingsScreen = ({ navigation }) => {
  const { ms, width } = useScale();
  const { t } = useTranslation('settings');

  const storeUser = useUserStore(state => state.user);
  const setStoreUser = useUserStore(state => state.setUser);
  const { theme, isDark, toggleTheme } = useTheme();

  const C = {
    bg: theme.bg,
    card: theme.card,
    text: theme.text,
    sub: theme.sub,
    line: theme.line,
    brand: theme.p1,
    brandSoft: theme.p4,
    accent: theme.warning || '#F59E0B',
    danger: theme.danger,
  };
  const styles = useMemo(() => createStyles(C), [C]);

  // 🔹 State from luna_user only
  const [storedUser, setStoredUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  
  // Reward points state
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rewardBHD, setRewardBHD] = useState(0);

  // Grid math
  const gap = ms(12);
  const sidePad = ms(16);
  const tileW = (width - sidePad * 2 - gap) / 2;

  // Modal state
  const [confirmMode, setConfirmMode] = useState(null); // 'logout' | 'delete' | null
  const visible = !!confirmMode;

  // Load user data from luna_user whenever screen focuses
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

          if (!active) return;

          console.log('Loaded user from AsyncStorage:', savedUser);

          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            const norm = normalizeUser(parsed);
            setStoredUser(norm);
            setAvatarError(false);

            if (!storeUser) setStoreUser(norm);

            // Fetch wallet info for rewards
            const userId = parsed.user?.id || parsed.id;
            if (userId && active) {
              try {
                const walletResponse = await api.post('/wallet/info', { user_id: userId });
                if (walletResponse.data.status && walletResponse.data.data && active) {
                  const points = walletResponse.data.data.points || 0;
                  const bhd = walletResponse.data.data.balance_bhd || 0;
                  setRewardPoints(points);
                  setRewardBHD(bhd);
                }
              } catch (error) {
                console.log('Error fetching wallet info:', error);
                if (active) {
                  setRewardPoints(0);
                  setRewardBHD(0);
                }
              }
            }
          } else {
            setStoredUser(null);
            setAvatarError(false);
            setRewardPoints(0);
            setRewardBHD(0);
          }
        } catch (error) {
          console.log('Error loading user data:', error);
          if (active) {
            setStoredUser(null);
            setAvatarError(false);
            setRewardPoints(0);
            setRewardBHD(0);
          }
        }
      })();
      return () => { active = false; };
    }, [setStoreUser, storeUser])
  );

  // Get display values from storedUser
  const displayCountry = storedUser?.country ? getCountryDisplayName(storedUser.country) : 'Select Country';
  const displayCurrency = storedUser?.currency ? getCurrencyDisplayName(storedUser.currency) : 'Select Currency';
  const displayLanguage = storedUser?.language ? getLanguageDisplayName(storedUser.language) : 'Select Language';

  // Header data
  const headerName = storedUser?.name ?? storeUser?.name ?? '';
  const headerEmail = storedUser?.email ?? storeUser?.email ?? '';
  const avatarUri = storedUser?.photo ? PROFILE_BASE + storedUser.photo : null;

  const copy = useMemo(() => {
    if (confirmMode === 'delete') {
      return {
        title: t('confirm.delete.title'),
        subtitle: t('confirm.delete.subtitle'),
        confirmLabel: t('confirm.delete.confirm'),
        confirmTone: '#e57373',
        iconBg: '#ffe8e8',
        iconColor: '#e57373',
      };
    }
    return {
      title: t('confirm.logout.title'),
      subtitle: t('confirm.logout.subtitle'),
      confirmLabel: t('confirm.logout.confirm'),
      confirmTone: '#111',
      iconBg: '#EFEFEF',
      iconColor: '#111',
    };
  }, [confirmMode, t]);

  const closeModal = () => setConfirmMode(null);

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['luna_user', 'luna_token']);
    } catch { }
    setStoreUser(null);
  }, [setStoreUser]);

  const handleConfirm = useCallback(async () => {
    try {
      await clearSession();
    } finally {
      closeModal();
      if (navigation?.replace) navigation.replace('LoginScreen');
      else if (navigation?.navigate) navigation.navigate('LoginScreen');
    }
  }, [clearSession, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: ms(28) }}>
        {/* Title Section */}
        <View style={[styles.titleSection, { paddingHorizontal: sidePad, paddingTop: getSafeTop() + ms(12), paddingBottom: ms(12) }]}>
          <View>
            <Text style={[styles.pageTitle, { fontSize: ms(28) }]}>{t('title', 'Profile')}</Text>
            <Text style={[styles.pageSubtitle, { fontSize: ms(14) }]}>
              {headerName ? `Welcome back, ${headerName.split(' ')[0]}` : 'Manage your account'}
            </Text>
          </View>
        </View>

        {/* profile card */}
        <View style={[styles.profileCard, { marginHorizontal: sidePad, padding: ms(14) }]}>
          <View style={styles.profileRow}>
            {/* Avatar: server photo if available, else initial */}
            {avatarUri && !avatarError ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: ms(48), height: ms(48), borderRadius: ms(24), backgroundColor: '#E5E7EB' }}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={[styles.avatar, { width: ms(48), height: ms(48), borderRadius: ms(24) }]}>
                <Text style={{ color: '#111827', fontWeight: '800', fontSize: ms(16) }}>
                  {(headerName || 'U').slice(0, 1)}
                </Text>
              </View>
            )}

            <View style={{ flex: 1, marginLeft: ms(10) }}>
              <Text style={[styles.name, { fontSize: ms(18) }]} numberOfLines={1}>{headerName}</Text>
              <Text style={[styles.email, { fontSize: ms(13) }]} numberOfLines={1}>{headerEmail}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('SettingsProfileScreen')}
              style={[styles.editBtn, { paddingHorizontal: ms(12), height: ms(30), borderRadius: ms(15) }]}
              activeOpacity={0.9}
            >
              <Text style={[styles.editTxt, { fontSize: ms(12) }]}>{t('actions.edit')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.progressWrap, { marginTop: ms(10) }]}>
            <View style={[styles.progressBar, { width: '20%' }]} />
          </View>
          <Text style={[styles.progressHint, { marginTop: ms(6), fontSize: ms(12) }]}>
            {t('profile.progressHint')}
          </Text>
        </View>

        {/* quick tiles */}
        <View style={[styles.tilesRow, { marginHorizontal: sidePad, gap }]}>
          <QuickTile
            icon="package"
            title={t('tiles.history.title')}
            subtitle={t('tiles.history.subtitle')}
            onPress={() => navigation.navigate('HistoryScreen')}
            tileW={tileW}
            C={C}
            styles={styles}
          />
          <QuickTile
            icon="activity"
            title={t('tiles.activity.title')}
            subtitle={t('tiles.activity.subtitle')}
            onPress={() => navigation.navigate('ActivityScreen')}
            tileW={tileW}
            C={C}
            styles={styles}
          />
          <QuickTile
            icon="credit-card"
            title={t('tiles.rewards.title')}
            subtitle={rewardPoints > 0 
              ? `${rewardPoints} pts (${rewardBHD.toFixed(3)} BHD)`
              : t('tiles.rewards.subtitle', { amount: 'BHD 0.000' })
            }
            onPress={() => navigation.navigate('WalletScreen')}
            tileW={tileW}
            C={C}
            styles={styles}
          />
          <QuickTile
            icon="heart"
            title={t('tiles.wishlist.title')}
            subtitle={t('tiles.wishlist.subtitle', { count: 0 })}
            onPress={() => navigation.navigate('WishlistScreen')}
            tileW={tileW}
            C={C}
            styles={styles}
          />
        </View>

        {/* PERSONAL */}
        <Text style={[styles.sectionTitle, { marginLeft: sidePad, marginTop: ms(18), fontSize: ms(16) }]}>
          {t('sections.personal')}
        </Text>
        <View style={styles.sectionCard}>
          <RowItem icon="map-pin" label={t('rows.shippingAddress')} onPress={() => navigation.navigate('ShippingAddressScreen')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="tag" label={t('rows.voucher')} onPress={() => navigation.navigate('VoucherScreen')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="gift" label={t('rows.giftCard')} onPress={() => navigation.navigate('GiftCardBrowse')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="message-square" label={t('rows.customerCare')} onPress={() => navigation.navigate('ChatBotModal')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="award" label={t('rows.membership')} onPress={() => navigation.navigate('SubscriptionScreen')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="truck" label={t('rows.toReceive')} onPress={() => navigation.navigate('ToReceiveOrdersScreen')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="credit-card" label={t('rows.paymentMethods')} onPress={() => { }} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="truck" label={t('rows.contactPreference')} onPress={() => navigation.navigate('ContactPreferencesNew')} C={C} styles={styles} />
        </View>

        {/* SHOP */}
        <Text style={[styles.sectionTitle, { marginLeft: sidePad, marginTop: ms(18), fontSize: ms(16) }]}>
          {t('sections.shop')}
        </Text>
        <View style={styles.sectionCard}>
          <RowItem
            icon="flag"
            label={t('rows.country')}
            value={displayCountry}
            onPress={() => navigation.navigate('ChooseCountryScreen')}
            C={C}
            styles={styles}
          />
          <View style={styles.hr} />
          <RowItem
            icon="dollar-sign"
            label={t('rows.currency')}
            value={displayCurrency}
            onPress={() => navigation.navigate('ChooseCurrencyScreen')}
            C={C}
            styles={styles}
          />
          <View style={styles.hr} />
          <RowItem
            icon="grid"
            label={t('rows.mySize')}
            value={'Select Size'}
            onPress={() => navigation.navigate('ChooseSizeScreen')}
            C={C}
            styles={styles}
          />
          <View style={styles.hr} />
          <RowItem
            icon="globe"
            label={t('rows.language')}
            value={displayLanguage}
            onPress={() => navigation.navigate('ChooseLanguageScreen')}
            C={C}
            styles={styles}
          />
          <View style={styles.hr} />
          <RowItem
            icon={isDark ? "moon" : "sun"}
            label={t('rows.theme', { defaultValue: 'Theme' })}
            value={isDark ? t('rows.darkMode', { defaultValue: 'Dark' }) : t('rows.lightMode', { defaultValue: 'Light' })}
            onPress={toggleTheme}
            C={C}
            styles={styles}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E5E7EB', true: C.brand }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
              />
            }
          />
        </View>

        {/* ACCOUNT */}
        <Text style={[styles.sectionTitle, { marginLeft: sidePad, marginTop: ms(18), fontSize: ms(16) }]}>
          {t('sections.account')}
        </Text>
        <View style={styles.sectionCard}>
          <RowItem icon="info" label={t('rows.about')} onPress={() => navigation.navigate('AboutScreen')} C={C} styles={styles} />
          <View style={styles.hr} />

          <RowItem icon="file-text" label={t('rows.terms')} onPress={() => navigation.navigate('TermsAndConditionsScreen')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="shield" label={t('rows.privacy')} onPress={() => navigation.navigate('PrivacyPolicy')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="rotate-ccw" label={t('rows.refund')} onPress={() => navigation.navigate('RefundPolicy')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="log-out" label={t('rows.logout')} danger onPress={() => setConfirmMode('logout')} C={C} styles={styles} />
          <View style={styles.hr} />
          <RowItem icon="trash-2" label={t('rows.deleteAccount')} danger onPress={() => setConfirmMode('delete')} C={C} styles={styles} />
        </View>

        {/* footer */}
        <View style={{ alignItems: 'center', marginTop: ms(22), marginBottom: ms(6) }}>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: ms(14) }}>Luna</Text>
          <Text style={{ color: C.sub, fontSize: ms(12), marginTop: 2 }}>
            {t('footer.version', { version: '1.0', month: 'August', year: '2025' })}
          </Text>
        </View>
      </ScrollView>

      {/* Need help bubble */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ChatBotModal')}
        activeOpacity={0.9}
        style={[styles.helpBubble, {
          right: ms(16),
          bottom: ms(24),
          paddingHorizontal: ms(14),
          height: ms(40),
          borderRadius: ms(20),
        }]}
      >
        <Ionicons name="information-circle" size={ms(18)} color="#111827" />
        <Text style={{ marginLeft: 6, fontWeight: '800', color: '#111827', fontSize: ms(13) }}>
          {t('help.needHelp')}
        </Text>
      </TouchableOpacity>

      <ConfirmSheet
        visible={visible}
        onClose={() => setConfirmMode(null)}
        onConfirm={handleConfirm}
        confirmLabel={copy.confirmLabel}
        confirmTone={copy.confirmTone}
        title={copy.title}
        subtitle={copy.subtitle}
        iconBg={copy.iconBg}
        iconColor={copy.iconColor}
        cancelLabel={t('actions.cancel')}
        styles={styles}
        C={C}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;

/* ---------------- styles ---------------- */
const createStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  /* title section */
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontWeight: '900',
    color: C.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    color: C.sub,
    fontWeight: '500',
  },

  /* header card */
  profileCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 2 },
    }),
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: C.text, fontWeight: '800' },
  email: { color: C.sub, marginTop: 2 },
  editBtn: { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  editTxt: { color: C.brand, fontWeight: '800' },

  progressWrap: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: C.accent, borderRadius: 999 },
  progressHint: { color: C.sub },

  /* tiles */
  tilesRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  tileIcon: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: C.brandSoft,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  tileTitle: { color: C.text, fontWeight: '800' },
  tileSub: { color: C.sub, fontSize: 12, marginTop: 2 },

  /* sections */
  sectionTitle: { color: C.text, fontWeight: '800' },
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    marginHorizontal: 16,
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
  },
  hr: { height: 1, backgroundColor: C.line, marginHorizontal: 14 },

  /* rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconBadge: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  rowLabel: { flex: 1, color: C.text, fontWeight: '700' },
  rowValue: { color: C.sub, marginRight: 8, fontWeight: '600' },

  /* help bubble */
  helpBubble: {
    position: 'absolute',
    backgroundColor: '#FFE924',
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* modal */
  modalRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  badge: {
    position: 'absolute',
    top: -18,
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { marginTop: 6, fontSize: 16, fontWeight: '800', color: C.text, textAlign: 'center' },
  sheetSubtitle: { marginTop: 6, fontSize: 13, color: C.sub, textAlign: 'center' },
  sheetBtnsRow: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  btn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: C.text },
  btnDarkText: { color: C.bg, fontWeight: '800' },
  btnText: { color: C.bg, fontWeight: '800' },
});