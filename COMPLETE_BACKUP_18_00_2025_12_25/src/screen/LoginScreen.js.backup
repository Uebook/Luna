// src/screens/LoginScreen.js
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CountryPicker from 'react-native-country-picker-modal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../store/UserStore';
import CustomAlert from '../component/CustomAlert';
import { useTheme } from '../context/ThemeContext';

const USER_STORAGE_KEY = 'luna_user';

const { width: W, height: H } = Dimensions.get('window');
const isSmall = H < 680;

/** Simple radio option */
const RadioOption = ({ label, selected, onPress, icon, COLORS, styles }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.radioItem, selected && styles.radioItemActive]}
  >
    <Ionicons
      name={icon}
      size={16}
      color={selected ? '#fff' : COLORS.gray}
      style={{ marginRight: 8 }}
    />
    <Text style={[styles.radioText, selected && styles.radioTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const LoginScreen = ({ navigation }) => {
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

  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [value, setValue] = useState('');

  // Default Bahrain
  const [countryCode, setCountryCode] = useState('BH');
  const [callingCode, setCallingCode] = useState('973');

  // Login states
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  // OTP Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userEmailPhone, setUserEmailPhone] = useState('');

  const setUser = useUserStore(s => s.setUser);

  const isValidEmail = useMemo(() => {
    if (method !== 'email') return false;
    if (!value) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value).toLowerCase());
  }, [value, method]);

  const isValidPhone = useMemo(() => {
    if (method !== 'phone') return false;
    if (!value) return false;
    const digits = String(value).replace(/[^\d]/g, '');
    return digits.length >= 6 && digits.length <= 15;
  }, [value, method]);

  const isValid = method === 'email' ? isValidEmail : isValidPhone;

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Save user data to AsyncStorage
  const saveUserToStorage = async (userData) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log('User data saved to AsyncStorage');
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

  const handleLogin = async () => {
    if (!isValid) {
      showAlert('error', `Please enter a valid ${method === 'email' ? 'email' : 'phone number'}.`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('email_phone', value.trim());

    try {
      const res = await axios.post(
        'https://luna-api.proteinbros.in/public/api/v1/auth/login',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000
        }
      );

      if (res?.data?.status) {
        // If user data is returned, set it in the store and save to AsyncStorage
        if (res.data.user) {
          setUser(res.data.user);
          await saveUserToStorage(res.data); // Save to AsyncStorage
          showAlert('success', 'Login successful!');
        } else {
          // Show OTP modal for verification
          setUserEmailPhone(value.trim());
          setShowOTPModal(true);
          showAlert('success', 'OTP sent to your email/phone. Please verify to continue.');
        }
      } else {
        showAlert('error', res?.data?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.log('Login error:', err.response?.data || err.message);

      // Handle different error scenarios
      if (err.response?.status === 404) {
        showAlert('error', 'Account not found. Please check your email/phone or create a new account.');
      } else if (err.response?.status === 401 || err.response?.data?.requires_otp) {
        // Show OTP modal for verification
        setUserEmailPhone(value.trim());
        setShowOTPModal(true);
        showAlert('success', 'OTP sent to your email/phone. Please verify to continue.');
      } else {
        showAlert('error', err?.response?.data?.message || 'Network error. Please try again.');
      }
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
      formData.append('email_phone', userEmailPhone);
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
          await saveUserToStorage(res.data); // Save to AsyncStorage
          showAlert('success', 'Login successful!');
        } else {
          showAlert('success', 'OTP verified successfully!');
          // You might want to fetch user data here or navigate to main app
          navigation.replace('MainApp');
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
      formData.append('email_phone', userEmailPhone);

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

  const onNext = () => {
    handleLogin();
  };

  return (
    <ImageBackground
      source={require('../assets/backgoundImageLogin.jpg')}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={10}
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.safe}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.brandWrap}>
                <Text style={styles.brand}>Luna</Text>
                <Text style={styles.tagline}>Welcome back</Text>
              </View>

              {/* Glass card */}
              <View style={styles.card}>
                <Text style={styles.title}>Sign in</Text>
                <Text style={styles.subtitle}>
                  Good to see you again <Text>🖤</Text>
                </Text>

                {/* Radio group */}
                <View style={styles.radioRow}>
                  <RadioOption
                    label="Email"
                    selected={method === 'email'}
                    onPress={() => {
                      setMethod('email');
                      setValue('');
                    }}
                    icon="mail-outline"
                    COLORS={COLORS}
                    styles={styles}
                  />
                  <RadioOption
                    label="Phone"
                    selected={method === 'phone'}
                    onPress={() => {
                      setMethod('phone');
                      setValue('');
                    }}
                    icon="call-outline"
                    COLORS={COLORS}
                    styles={styles}
                  />
                </View>

                {/* Input */}
                {method === 'email' ? (
                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={COLORS.gray}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your Email"
                      placeholderTextColor={COLORS.muted}
                      value={value}
                      onChangeText={setValue}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={onNext}
                    />
                    {!!value && (
                      <Ionicons
                        name={isValid ? 'checkmark-circle' : 'alert-circle'}
                        size={18}
                        color={isValid ? COLORS.success : COLORS.danger}
                      />
                    )}
                  </View>
                ) : (
                  <View style={styles.inputWrap}>
                    <CountryPicker
                      countryCode={countryCode}
                      withFlag
                      withFilter
                      withCallingCode
                      onSelect={(c) => {
                        setCountryCode(c.cca2);
                        const cc = Array.isArray(c.callingCode)
                          ? c.callingCode[0]
                          : c.callingCode;
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
                      value={value}
                      onChangeText={setValue}
                      onSubmitEditing={onNext}
                    />
                    {!!value && (
                      <Ionicons
                        name={isValid ? 'checkmark-circle' : 'alert-circle'}
                        size={18}
                        color={isValid ? COLORS.success : COLORS.danger}
                      />
                    )}
                  </View>
                )}

                {/* Next */}
                <TouchableOpacity
                  style={[styles.primaryBtn, (!isValid || loading) && styles.btnDisabled]}
                  onPress={onNext}
                  disabled={!isValid || loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryText}>Continue</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.hr} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.hr} />
                </View>

                {/* Register */}
                <View style={styles.rowCenter}>
                  <Text style={styles.muted}>New here?</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreateAccount')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.link}>Create an account</Text>
                  </TouchableOpacity>
                </View>

                {/* Legal */}
                <Text style={styles.legal}>
                  By continuing, you agree to Luna's{' '}
                  <Text style={styles.linkInline}>Terms</Text> &{' '}
                  <Text style={styles.linkInline}>Privacy Policy</Text>.
                </Text>
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
                <Text style={styles.otpEmail}>{userEmailPhone}</Text>
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

export default LoginScreen;

/* --------------------------- Styles --------------------------- */
const CARD_W = Math.min(420, W - 32);
const CARD_PAD_V = isSmall ? 18 : 24;

const createStyles = (COLORS) => StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: isSmall ? 12 : 24,
  },

  brandWrap: {
    alignItems: 'center',
    marginBottom: isSmall ? 10 : 16,
  },
  brand: {
    fontSize: isSmall ? 28 : 34,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 4,
    color: '#e5e7eb',
    fontSize: isSmall ? 14 : 15,
  },

  card: {
    alignSelf: 'center',
    width: CARD_W,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: CARD_PAD_V + 4,
    borderColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 8 },
    }),
  },

  title: { fontSize: isSmall ? 20 : 22, fontWeight: '800', color: COLORS.ink },
  subtitle: { fontSize: 14, color: COLORS.gray, marginTop: 6, marginBottom: isSmall ? 14 : 18 },

  radioRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.bg,
  },
  radioItemActive: { backgroundColor: COLORS.p1, borderColor: COLORS.p1 },
  radioText: { color: COLORS.gray, fontWeight: '700', fontSize: 13.5 },
  radioTextActive: { color: '#fff' },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  input: { flex: 1, color: COLORS.ink, fontSize: 16 },
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
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  btnDisabled: { backgroundColor: '#C8D6FF' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerText: { color: COLORS.gray, fontSize: 13 },
  hr: { flex: 1, height: 1, backgroundColor: COLORS.line },

  rowCenter: { flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  muted: { color: COLORS.gray, fontSize: 14 },
  link: { color: COLORS.p1, fontWeight: '700', fontSize: 14 },

  legal: {
    marginTop: 14,
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  linkInline: { color: COLORS.p1, fontWeight: '700' },

  // OTP Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  otpModalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
  },
  otpContent: {
    padding: 20,
    alignItems: 'center',
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