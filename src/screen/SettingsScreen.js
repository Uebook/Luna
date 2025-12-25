// src/screens/SettingsScreen.js
import React, { useCallback, useMemo, useState } from 'react';
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
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/UserStore';

/* ---------------- theme ---------------- */
const C = {
  bg: '#F6F8FF',
  card: '#FFFFFF',
  text: '#0F172A',
  sub: '#6B7280',
  line: '#E7EAF3',
  brand: '#2563EB',
  brandSoft: '#EEF2FF',
  accent: '#F59E0B',
  danger: '#E11D48',
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

const IconBadge = ({ name, color = C.brand }) => (
  <View style={[styles.iconBadge, { backgroundColor: C.brandSoft }]}>
    <Feather name={name} size={16} color={color} />
  </View>
);

const RowItem = ({ icon, label, value, onPress, danger }) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={onPress}>
    <IconBadge name={icon} color={danger ? C.danger : C.brand} />
    <Text style={[styles.rowLabel, danger && { color: C.danger, fontWeight: '800' }]}>{label}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    {!danger && <RightChevron />}
  </TouchableOpacity>
);

const QuickTile = ({ icon, title, subtitle, onPress, tileW }) => (
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
}) => {
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
    'BHD': 'Bahraini Dinar (.د.ب)',
  };
  return currencies[currencyCode] || 'BHD';
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

  // 🔹 State from luna_user only
  const [storedUser, setStoredUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

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
          } else {
            setStoredUser(null);
            setAvatarError(false);
          }
        } catch (error) {
          console.log('Error loading user data:', error);
          if (active) {
            setStoredUser(null);
            setAvatarError(false);
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
        <View style={[styles.titleSection, { paddingHorizontal: sidePad, paddingTop: ms(20), paddingBottom: ms(12) }]}>
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
          />
          <QuickTile
            icon="activity"
            title={t('tiles.activity.title')}
            subtitle={t('tiles.activity.subtitle')}
            onPress={() => navigation.navigate('ActivityScreen')}
            tileW={tileW}
          />
          <QuickTile
            icon="credit-card"
            title={t('tiles.rewards.title')}
            subtitle={t('tiles.rewards.subtitle', { amount: 'BHD 0.00' })}
            onPress={() => navigation.navigate('WalletScreen')}
            tileW={tileW}
          />
          <QuickTile
            icon="heart"
            title={t('tiles.wishlist.title')}
            subtitle={t('tiles.wishlist.subtitle', { count: 0 })}
            onPress={() => navigation.navigate('WishlistScreen')}
            tileW={tileW}
          />
        </View>

        {/* PERSONAL */}
        <Text style={[styles.sectionTitle, { marginLeft: sidePad, marginTop: ms(18), fontSize: ms(16) }]}>
          {t('sections.personal')}
        </Text>
        <View style={styles.sectionCard}>
          <RowItem icon="map-pin" label={t('rows.shippingAddress')} onPress={() => navigation.navigate('ShippingAddressScreen')} />
          <View style={styles.hr} />
          <RowItem icon="tag" label={t('rows.voucher')} onPress={() => navigation.navigate('VoucherScreen')} />
          <View style={styles.hr} />
          <RowItem icon="gift" label={t('rows.giftCard')} onPress={() => navigation.navigate('GiftCardBrowse')} />
          <View style={styles.hr} />
          <RowItem icon="message-square" label={t('rows.customerCare')} onPress={() => navigation.navigate('ChatBotModal')} />
          <View style={styles.hr} />
          <RowItem icon="award" label={t('rows.membership')} onPress={() => navigation.navigate('SubscriptionScreen')} />
          <View style={styles.hr} />
          <RowItem icon="truck" label={t('rows.toReceive')} onPress={() => navigation.navigate('ToReceiveOrdersScreen')} />
          <View style={styles.hr} />
          <RowItem icon="credit-card" label={t('rows.paymentMethods')} onPress={() => { }} />
          <View style={styles.hr} />
          <RowItem icon="truck" label={t('rows.contactPreference')} onPress={() => navigation.navigate('ContactPreferencesNew')} />
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
          />
          <View style={styles.hr} />
          <RowItem
            icon="dollar-sign"
            label={t('rows.currency')}
            value={displayCurrency}
            onPress={() => navigation.navigate('ChooseCurrencyScreen')}
          />
          <View style={styles.hr} />
          <RowItem
            icon="grid"
            label={t('rows.mySize')}
            value={'Select Size'}
            onPress={() => navigation.navigate('ChooseSizeScreen')}
          />
          <View style={styles.hr} />
          <RowItem
            icon="globe"
            label={t('rows.language')}
            value={displayLanguage}
            onPress={() => navigation.navigate('ChooseLanguageScreen')}
          />
        </View>

        {/* ACCOUNT */}
        <Text style={[styles.sectionTitle, { marginLeft: sidePad, marginTop: ms(18), fontSize: ms(16) }]}>
          {t('sections.account')}
        </Text>
        <View style={styles.sectionCard}>
          <RowItem icon="info" label={t('rows.about')} onPress={() => navigation.navigate('AboutScreen')} />
          <View style={styles.hr} />

          <RowItem icon="file-text" label={t('rows.terms')} onPress={() => navigation.navigate('TermsAndConditionsScreen')} />
          <View style={styles.hr} />
          <RowItem icon="shield" label={t('rows.privacy')} onPress={() => navigation.navigate('PrivacyPolicy')} />
          <View style={styles.hr} />
          <RowItem icon="rotate-ccw" label={t('rows.refund')} onPress={() => navigation.navigate('RefundPolicy')} />
          <View style={styles.hr} />
          <RowItem icon="log-out" label={t('rows.logout')} danger onPress={() => setConfirmMode('logout')} />
          <View style={styles.hr} />
          <RowItem icon="trash-2" label={t('rows.deleteAccount')} danger onPress={() => setConfirmMode('delete')} />
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
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

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
  modalRoot: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  sheetCard: {
    backgroundColor: '#fff',
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
  sheetTitle: { marginTop: 6, fontSize: 16, fontWeight: '800', color: '#111', textAlign: 'center' },
  sheetSubtitle: { marginTop: 6, fontSize: 13, color: C.sub, textAlign: 'center' },
  sheetBtnsRow: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  btn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnDark: { backgroundColor: '#111' },
  btnDarkText: { color: '#fff', fontWeight: '800' },
  btnText: { color: '#fff', fontWeight: '800' },
});