// src/screens/PasswordTyping.js
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import axios from 'axios';
import CustomAlert from '../component/CustomAlert';
import useUserStore from '../store/UserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const obfuscate = (value = '', method = 'email') => {
  if (!value) return '';
  if (method === 'email') {
    const [name, domain] = value.split('@');
    if (!domain) return value;
    const visible = name.slice(0, Math.max(1, Math.min(3, name.length)));
    return `${visible}***@${domain}`;
  } else {
    // phone: keep last 3 digits
    const last = value.slice(-3);
    return `+*** ${last}`;
  }
};

const PasswordTyping = ({ route }) => {
  // Accept either email or phone+countryCode + a 'method' flag
  const { email, phone, method = 'email', countryCode } = route?.params || {};

  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const inputRef = useRef(null);

  useEffect(() => {
    // autofocus the hidden input when screen mounts
    const t = setTimeout(() => inputRef.current?.focus?.(), 250);
    return () => clearTimeout(t);
  }, []);

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const persistSession = async (payload) => {
    try {
      await AsyncStorage.setItem('luna_user', JSON.stringify(payload?.data || payload?.user || payload));
      if (payload?.token) {
        await AsyncStorage.setItem('luna_token', String(payload.token));
      }
    } catch (e) {
      console.log('AsyncStorage save error:', e);
    }
  };

  const handleLogin = async (pass) => {
    if (loading) return;
    setLoading(true);
    setIsError(false);

    try {
      const formData = new FormData();

      // Build payload depending on method
      if (method === 'email') {
        formData.append('email', (email || '').trim());
      } else {
        // send phone; many backends expect phone with country code
        // We pass 'phone' and 'country_code' — adjust keys to match your API if different
        const formattedPhone = phone?.startsWith('+') ? phone.trim() : `+${countryCode || ''}${phone?.trim() || ''}`;
        formData.append('phone', formattedPhone);
        if (countryCode) formData.append('country_code', String(countryCode));
      }
      formData.append('password', pass);

      const response = await axios.post(
        'https://argosmob.uk/luna/public/api/v1/auth/login',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response?.data?.status === true) {
        const payload = {
          ...(response.data || {}),
          data: response?.data?.data || response?.data?.user || {},
        };

        // update zustand
        useUserStore.getState().setUser(payload.data);

        // persist
        await persistSession(payload);

        showAlert('success', 'Login successful!');
        setTimeout(() => {
          setAlertVisible(false);
          navigation.replace('MainApp');
        }, 400);
      } else {
        const errorMsg = response?.data?.message || 'Login failed';
        setIsError(true);
        showAlert('error', errorMsg);
        setPassword('');
      }
    } catch (error) {
      setIsError(true);
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Login failed. Please try again';
      showAlert('error', serverMessage);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text) => {
    // Accept up to 6 digits (as per your design)
    if (text.length <= 6 && !loading) {
      setPassword(text);
      if (text.length === 6) {
        handleLogin(text);
      }
    }
  };

  const dotSize = useMemo(() => {
    const base = 24;
    return Math.max(18, Math.min(28, (width / 375) * base));
  }, [width]);

  const displayContact = method === 'email' ? obfuscate(email, 'email') : obfuscate(phone ? `+${countryCode || ''}${phone}` : phone, 'phone');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <Image source={require('../assets/Bubbleotp.png')} style={styles.bgImage} />

        <View style={styles.content}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000',
              }}
              style={styles.avatarImage}
            />
          </View>

          <Text style={styles.welcomeText}>Hello!!</Text>
          <Text style={styles.subText}>Type your password</Text>

          {/* Show which contact we're authenticating */}
          {displayContact ? <Text style={[styles.subText, { marginTop: 6 }]}>{displayContact}</Text> : null}

          {/* Hidden Input */}
          <TextInput
            ref={inputRef}
            value={password}
            onChangeText={handlePasswordChange}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            style={styles.hiddenInput}
            autoFocus
            importantForAutofill="no"
            autoCorrect={false}
            autoCapitalize="none"
            editable={!loading}
            caretHidden
          />

          {/* Dots */}
          <View style={[styles.dotsContainer, { gap: Math.max(10, dotSize * 0.5) }]}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: isError ? '#ff3b30' : i < password.length ? '#004CFF' : '#dfe4ea',
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={{ marginTop: 20 }}
            disabled={loading}
            onPress={() =>
              navigation.navigate('PasswordRecoveryScreen', {
                method,
                email,
                phone,
                countryCode,
              })
            }
          >
            <Text style={styles.subText}>Forget your password?</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loaderOverlay} pointerEvents="none">
            <ActivityIndicator size="large" />
          </View>
        )}

        <CustomAlert visible={alertVisible} type={alertType} message={alertMessage} onPress={() => setAlertVisible(false)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PasswordTyping;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: Math.min(350, Math.max(260, height * 0.35)),
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Math.max(40, height * 0.06),
  },
  avatarWrapper: {
    marginTop: Math.max(20, height * 0.16),
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarImage: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2d3436',
  },
  subText: {
    fontSize: 16,
    color: '#636e72',
    marginTop: 10,
  },
  hiddenInput: {
    height: 0,
    width: 0,
    position: 'absolute',
    opacity: 0,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  dot: {
    backgroundColor: '#dfe4ea',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
