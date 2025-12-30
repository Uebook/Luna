import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CountryPicker from 'react-native-country-picker-modal';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import useUserStore from '../store/UserStore';
import CustomAlert from '../component/CustomAlert';
import { useTheme } from '../context/ThemeContext';
import { SkeletonFormScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

const { width: W, height: H } = Dimensions.get('window');
const isSmall = H < 680;
const CARD_W = Math.min(420, W - 32);
const CARD_PAD_V = isSmall ? 18 : 24;

// Language and Currency Options
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
];

const CreateAccountScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const COLORS = {
    bg: theme.bg,
    text: theme.text,
    sub: theme.sub,
    line: theme.line,
    ink: theme.ink,
    gray: theme.gray,
    muted: theme.muted,
    p1: theme.p1,
    success: theme.success,
    danger: theme.danger,
    card: theme.card || '#FFFFFF',
    white: theme.white || '#FFFFFF',
  };
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const [initialLoading, setInitialLoading] = useSkeletonLoader(true, 600);
  const [countryCode, setCountryCode] = useState('BH'); // Bahrain default
  const [callingCode, setCallingCode] = useState('973');

  React.useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, [setInitialLoading]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [language, setLanguage] = useState(LANGUAGES[0]); // Default to English
  const [currency, setCurrency] = useState(CURRENCIES[0]); // Default to USD

  // OTP Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [userData, setUserData] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  const setUser = useUserStore(s => s.setUser);

  const isValidEmail = useMemo(() => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }, [email]);

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const res = await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Photo Permission',
          message: 'Allow access to set your profile picture.',
          buttonPositive: 'OK',
        }
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const pickAvatar = async () => {
    const ok = await requestGalleryPermission();
    if (!ok) {
      showAlert('error', 'Please allow media access to choose a profile image.');
      return;
    }
    try {
      const img = await ImagePicker.openPicker({
        width: 600,
        height: 600,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.85,
      });
      setAvatar(img);
    } catch (e) {
      if (e?.code !== 'E_PICKER_CANCELLED') {
        showAlert('error', 'Could not open gallery.');
      }
    }
  };

  const onCreateAccount = async () => {
    if (!firstName.trim()) return showAlert('error', 'Please enter your first name.');
    if (!lastName.trim()) return showAlert('error', 'Please enter your last name.');
    if (!isValidEmail) return showAlert('error', 'Enter a valid email.');
    if (!phone.trim()) return showAlert('error', 'Please enter your phone number.');
    if (!avatar) return showAlert('error', 'Please select a profile image.');

    setLoading(true);
    const form = new FormData();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    form.append('first_name', firstName.trim());
    form.append('last_name', lastName.trim());
    form.append('name', fullName);
    form.append('email', email.trim());
    form.append('phone', phone.trim());
    form.append('password', 'password');
    form.append('language', language.code);
    form.append('currency', currency.code);
    form.append('profile', {
      uri: avatar.path,
      type: avatar.mime || 'image/jpeg',
      name: avatar.filename || `profile_${Date.now()}.jpg`,
    });
    form.append('country_code', countryCode);
    form.append('calling_code', callingCode);

    try {
      const res = await axios.post(
        'https://luna-api.proteinbros.in/public/api/v1/auth/register',
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        }
      );

      if (res?.data?.status) {
        // Save user data for OTP verification
        setUserData({
          email_phone: email.trim(),
          user_id: res.data.user?.id,
          temp_data: res.data
        });

        // Show OTP modal for verification
        setShowOTPModal(true);
        showAlert('success', 'OTP sent to your email/phone. Please verify to complete registration.');
      } else {
        showAlert('error', res?.data?.message || 'Registration failed.');
      }
    } catch (err) {
      console.log('Registration error:', err.response?.data || err.message);
      showAlert('error', err?.response?.data?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      return showAlert('error', 'Please enter a valid 6-digit OTP.');
    }

    setVerifyLoading(true);
    try {
      const formData = new FormData();
      formData.append('email_phone', userData.email_phone);
      formData.append('otp', otp.trim());

      const res = await axios.post(
        'https://luna-api.proteinbros.in/public/api/v1/auth/verify-otp',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        }
      );

      if (res?.data?.status) {
        setShowOTPModal(false);
        setOtp('');

        if (res.data.user) {
          setUser(res.data.user);
          showAlert('success', 'Account verified successfully!');
        } else {
          showAlert('success', 'OTP verified successfully! Please login.');
          navigation.replace('LoginScreen');
        }
      } else {
        showAlert('error', res?.data?.message || 'OTP verification failed.');
      }
    } catch (err) {
      console.log('OTP verification error:', err.response?.data || err.message);
      showAlert('error', err?.response?.data?.message || 'Network error during OTP verification.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const resendOTP = async () => {
    setResendLoading(true);
    try {
      const formData = new FormData();
      formData.append('email_phone', userData.email_phone);

      const res = await axios.post(
        'https://luna-api.proteinbros.in/public/api/v1/auth/resend-otp',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        }
      );

      if (res?.data?.status) {
        showAlert('success', 'OTP resent successfully!');
      } else {
        showAlert('error', res?.data?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      console.log('Resend OTP error:', err.response?.data || err.message);
      showAlert('error', err?.response?.data?.message || 'Network error while resending OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => {
        setLanguage(item);
        setShowLanguageModal(false);
      }}
    >
      <Text style={styles.optionFlag}>{item.flag}</Text>
      <Text style={styles.optionText}>{item.name}</Text>
      {language.code === item.code && (
        <Ionicons name="checkmark" size={20} color={COLORS.p1} style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  const renderCurrencyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => {
        setCurrency(item);
        setShowCurrencyModal(false);
      }}
    >
      <Text style={styles.optionSymbol}>{item.symbol}</Text>
      <View style={styles.currencyTextContainer}>
        <Text style={styles.optionText}>{item.name}</Text>
        <Text style={styles.currencyCode}>({item.code})</Text>
      </View>
      {currency.code === item.code && (
        <Ionicons name="checkmark" size={20} color={COLORS.p1} style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  const disabled = !(firstName && lastName && isValidEmail && phone && avatar);

  if (initialLoading) {
    return <SkeletonFormScreen />;
  }

  return (
    <ImageBackground
      source={require('../assets/backgoundImageLogin.jpg')}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={10}
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              {/* Header */}
              <View style={styles.brandWrap}>
                <Text style={styles.brand}>Luna</Text>
                <Text style={styles.tagline}>Let's get started</Text>
              </View>

              {/* Card */}
              <View style={styles.card}>
                <Text style={styles.title}>Create account</Text>
                <Text style={styles.subtitle}>We'll set up your profile in seconds</Text>

                {/* Avatar */}
                <TouchableOpacity style={styles.avatar} onPress={pickAvatar} activeOpacity={0.85}>
                  {avatar ? (
                    <Image source={{ uri: avatar.path }} style={styles.avatarImg} />
                  ) : (
                    <View style={styles.avatarInner}>
                      <Ionicons name="camera" size={20} color={COLORS.p1} />
                      <Text style={styles.avatarLabel}>Add photo</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* First Name */}
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor={COLORS.muted}
                    value={firstName}
                    onChangeText={setFirstName}
                    returnKeyType="next"
                  />
                </View>

                {/* Last Name */}
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor={COLORS.muted}
                    value={lastName}
                    onChangeText={setLastName}
                    returnKeyType="next"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={COLORS.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {email?.length > 0 && (
                    <Ionicons
                      name={isValidEmail ? 'checkmark-circle' : 'alert-circle'}
                      size={18}
                      color={isValidEmail ? COLORS.success : COLORS.danger}
                    />
                  )}
                </View>

                {/* Phone */}
                <View style={styles.inputWrap}>
                  <CountryPicker
                    countryCode={countryCode}
                    withFlag
                    withFilter
                    withCallingCode
                    onSelect={c => {
                      setCountryCode(c.cca2);
                      const cc = Array.isArray(c.callingCode) ? c.callingCode[0] : c.callingCode;
                      if (cc) setCallingCode(String(cc));
                    }}
                    containerButtonStyle={{ marginRight: 8 }}
                  />
                  <Text style={styles.dialCode}>+{callingCode}</Text>
                  <View style={styles.pipe} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor={COLORS.muted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Language Selection */}
                <TouchableOpacity
                  style={styles.selectWrap}
                  onPress={() => setShowLanguageModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="language-outline" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
                  <Text style={styles.selectText}>{language.flag} {language.name}</Text>
                  <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
                </TouchableOpacity>

                {/* Currency Selection */}
                <TouchableOpacity
                  style={styles.selectWrap}
                  onPress={() => setShowCurrencyModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cash-outline" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
                  <Text style={styles.selectText}>{currency.symbol} {currency.name} ({currency.code})</Text>
                  <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
                </TouchableOpacity>

                {/* Button */}
                <TouchableOpacity
                  style={[styles.primaryBtn, disabled && styles.btnDisabled]}
                  onPress={onCreateAccount}
                  disabled={loading || disabled}
                  activeOpacity={0.8}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Create account</Text>}
                </TouchableOpacity>

                {/* Already have account */}
                <View style={styles.rowCenter}>
                  <Text style={styles.muted}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
                    <Text style={styles.link}>Sign in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <Modal
        visible={showOTPModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOTPModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.otpModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verify OTP</Text>
              <TouchableOpacity onPress={() => setShowOTPModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.otpContent}>
              <Ionicons name="shield-checkmark-outline" size={60} color={COLORS.p1} style={styles.otpIcon} />
              <Text style={styles.otpTitle}>Enter Verification Code</Text>
              <Text style={styles.otpSubtitle}>
                We've sent a 6-digit verification code to{'\n'}
                <Text style={styles.otpEmail}>{userData?.email_phone}</Text>
              </Text>

              <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={COLORS.muted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
              />

              <TouchableOpacity
                style={[styles.verifyBtn, (!otp || otp.length !== 6) && styles.btnDisabled]}
                onPress={verifyOTP}
                disabled={verifyLoading || !otp || otp.length !== 6}
                activeOpacity={0.8}
              >
                {verifyLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifyBtnText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={resendOTP}
                disabled={resendLoading}
                activeOpacity={0.7}
              >
                {resendLoading ? (
                  <ActivityIndicator color={COLORS.p1} />
                ) : (
                  <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendLink}>Resend OTP</Text></Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={item => item.code}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              renderItem={renderCurrencyItem}
              keyExtractor={item => item.code}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onPress={() => {
          setAlertVisible(false);
          if (alertType === 'success' && !showOTPModal) {
            navigation.replace('MainApp');
          }
        }}
      />
    </ImageBackground>
  );
};

export default CreateAccountScreen;

/* ---------------- Styles ---------------- */
const createStyles = (COLORS) => StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: isSmall ? 12 : 24 },

  brandWrap: { alignItems: 'center', marginBottom: isSmall ? 10 : 16 },
  brand: { fontSize: isSmall ? 28 : 34, color: '#fff', fontWeight: '800' },
  tagline: { marginTop: 4, color: '#e5e7eb', fontSize: isSmall ? 14 : 15 },

  card: {
    alignSelf: 'center',
    width: CARD_W,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: CARD_PAD_V,
    borderColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 4 },
    }),
  },
  title: { fontSize: isSmall ? 20 : 22, fontWeight: '800', color: COLORS.ink },
  subtitle: { fontSize: 14, color: COLORS.gray, marginTop: 6, marginBottom: isSmall ? 12 : 14 },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.p1,
    alignSelf: 'flex-start',
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: 86, height: 86, borderRadius: 43 },
  avatarInner: { alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { marginTop: 6, fontSize: 12, color: COLORS.p1, fontWeight: '700' },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginTop: 10,
  },
  input: { flex: 1, color: COLORS.ink, fontSize: 16 },

  selectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  selectText: { color: COLORS.ink, fontSize: 16, flex: 1 },

  dialCode: { color: COLORS.ink, fontSize: 15, fontWeight: '700', marginRight: 6 },
  pipe: { width: 1, height: 22, backgroundColor: COLORS.line, marginRight: 8 },

  primaryBtn: {
    marginTop: 14,
    backgroundColor: COLORS.p1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnDisabled: { backgroundColor: '#C8D6FF' },

  rowCenter: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16 },
  muted: { color: COLORS.gray, fontSize: 14 },
  link: { color: COLORS.p1, fontWeight: '700', fontSize: 14 },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: COLORS.card || COLORS.white || '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  otpModalContent: {
    backgroundColor: COLORS.card || COLORS.white || '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 16 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    backgroundColor: COLORS.card || COLORS.white || '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
  },
  optionsList: {
    paddingHorizontal: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  optionSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    width: 24,
  },
  currencyTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.ink,
  },
  currencyCode: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 'auto',
  },

  // OTP Modal Styles
  otpContent: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.card || COLORS.white || '#FFFFFF',
  },
  otpIcon: {
    marginBottom: 20,
  },
  otpTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  otpEmail: {
    fontWeight: '600',
    color: COLORS.p1,
  },
  otpInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: COLORS.p1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  resendBtn: {
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  resendLink: {
    color: COLORS.p1,
    fontWeight: '600',
  },
});