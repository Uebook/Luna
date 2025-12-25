// src/screens/ProfileScreen.js
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform,
    PermissionsAndroid,
    Modal,
    Dimensions,
    KeyboardAvoidingView,
    ScrollView,
    Animated,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CountryPicker from 'react-native-country-picker-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { scaleFactory } from '../utils/scale';
import axios from 'axios';
import CustomAlert from '../component/CustomAlert';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

const USER_STORAGE_KEY = 'luna_user';

const { width: W, height: H } = Dimensions.get('window');
const { scale, verticalScale, moderateScale } = scaleFactory(W, H);
const s = n => Math.round(scale(n));
const vs = n => Math.round(verticalScale(n));
const ms = (n, f = 0.5) => Math.round(moderateScale(n, f));

/* ---------- image URL helpers ---------- */
const PROFILE_BASE = 'https://proteinbros.in/luna-api/public/';
const PUBLIC_BASE = 'https://argosmob.uk/luna/public/';

const resolveUrl = (p) => {
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    const clean = String(p).replace(/^\/+/, '');
    if (clean.startsWith('uploads/')) return PUBLIC_BASE + clean;
    return PROFILE_BASE + clean;
};

const normalizeUser = raw => {
    const u = raw?.user ?? raw?.data ?? raw ?? {};
    return {
        id: u.id ?? null,
        name: u.name ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        photo: u.photo ?? null,
        gender: u.gender ?? null,
        country: u.country ?? 'Bahrain',
        date_of_birth: u.date_of_birth ?? null,
    };
};

const splitName = (full = '') => {
    const parts = String(full || '').trim().split(/\s+/);
    if (!parts.length) return { first: '', last: '' };
    if (parts.length === 1) return { first: parts[0], last: '' };
    return { first: parts[0], last: parts.slice(1).join(' ') };
};

/* ---------- validation helpers (run ONLY on SAVE) ---------- */
const isEmail = v => /^\S+@\S+\.\S+$/.test(String(v).trim());
const isName = v => /^[\p{L}][\p{L}\s'\-]{1,49}$/u.test(String(v).trim()); // 2+ letters
const digitsOnly = v => String(v || '').replace(/[^\d]/g, '');
const isPhone = v => {
    const n = digitsOnly(v);
    return n.length >= 6 && n.length <= 15;
};

// Helper function to parse date string to Date object
const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
        // Handle different date formats (YYYY-MM-DD, etc.)
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
};

const ProfileScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const COLORS = {
        bg: theme.bg,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        ink: theme.ink,
        gray: theme.gray,
        muted: theme.muted,
        danger: theme.danger,
        dangerBg: theme.dangerBg,
        p1: theme.p1,
        card: theme.card,
    };
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);
    // ----- values kept in refs so typing does NOT re-render -----
    const firstNameRef = useRef('');
    const lastNameRef = useRef('');
    const emailRef = useRef('');
    const phoneRef = useRef('');

    // non-text states
    const [gender, setGender] = useState(null); // 'male' | 'female' | 'other' | null
    const [birthday, setBirthday] = useState(null);

    // nationality / phone country
    const [countryCode, setCountryCode] = useState('BH');
    const [nationality, setNationality] = useState('Bahrain');
    const [phoneCca2, setPhoneCca2] = useState('BH');
    const [phoneDial, setPhoneDial] = useState('973');

    // avatar
    const [avatarUri, setAvatarUri] = useState(null);
    const [avatarError, setAvatarError] = useState(false);
    const [newAvatar, setNewAvatar] = useState(null); // For newly selected avatar

    // pickers & sheet state
    const [showCountry, setShowCountry] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [iosDate, setIosDate] = useState(birthday || new Date());
    const [avatarSheet, setAvatarSheet] = useState(false);

    // API states
    const [loading, setLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [userId, setUserId] = useState(null);

    // error flags (set only on SAVE)
    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        birthday: false,
    });

    // snackbar (no external libs)
    const [snack, setSnack] = useState({ visible: false, text: '', type: 'info' });
    const snackTimerRef = useRef(null);
    const snackAnim = useRef(new Animated.Value(0)).current;
    const showSnack = (text, type = 'info', msDur = 2200) => {
        setSnack({ visible: true, text, type });
        Animated.timing(snackAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
        if (snackTimerRef.current) clearTimeout(snackTimerRef.current);
        snackTimerRef.current = setTimeout(() => {
            Animated.timing(snackAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
                setSnack(s => ({ ...s, visible: false }));
            });
        }, msDur);
    };

    const showAlert = (type, message) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    // To update defaultValue of uncontrolled inputs after async hydrate, we remount them once.
    const [formKey, setFormKey] = useState(0);

    const initialRef = useRef({
        email: '', firstName: '', lastName: '', phone: '',
        gender: null, birthday: null, countryCode: 'BH', nationality: 'Bahrain',
        avatarUri: null, phoneCca2: 'BH', phoneDial: '973',
    });

    // --- hydrate ONCE to avoid keyboard drops ---
    const hydratedRef = useRef(false);
    useFocusEffect(
        React.useCallback(() => {
            let active = true;
            (async () => {
                if (hydratedRef.current) return;
                try {
                    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
                    console.log("Raw user data from storage:", raw);

                    if (!active || !raw) return;
                    const parsed = JSON.parse(raw);
                    const u = normalizeUser(parsed);
                    const { first, last } = splitName(u.name);

                    firstNameRef.current = first || '';
                    lastNameRef.current = last || '';
                    emailRef.current = u.email || '';
                    phoneRef.current = u.phone || '';
                    setUserId(u.id);

                    // Set gender from storage
                    if (u.gender) {
                        setGender(u.gender);
                    }

                    // Set nationality/country from storage
                    if (u.country) {
                        setNationality(u.country);
                        // You might want to map country name to country code here
                        // For now, we'll keep default as BH
                    }

                    // Set birthday from storage
                    if (u.date_of_birth) {
                        const parsedDate = parseDate(u.date_of_birth);
                        if (parsedDate) {
                            setBirthday(parsedDate);
                            setIosDate(parsedDate);
                        }
                    }

                    const abs = u.photo ? PROFILE_BASE + u.photo : null;
                    console.log("Avatar URL:", abs);

                    setAvatarUri(abs);
                    setAvatarError(false);

                    initialRef.current = {
                        email: emailRef.current,
                        firstName: firstNameRef.current,
                        lastName: lastNameRef.current,
                        phone: phoneRef.current,
                        gender: u.gender || null,
                        birthday: u.date_of_birth ? parseDate(u.date_of_birth) : null,
                        countryCode,
                        nationality: u.country || 'Bahrain',
                        avatarUri: abs,
                        phoneCca2,
                        phoneDial,
                    };

                    setFormKey(k => k + 1);
                    setErrors({ firstName: false, lastName: false, email: false, phone: false, birthday: false });
                    hydratedRef.current = true;
                } catch (error) {
                    console.log("Error hydrating user data:", error);
                }
            })();
            return () => { active = false; };
        }, [])
    );

    /* ---------- avatar pickers ---------- */
    const requestGalleryPermission = async () => {
        if (Platform.OS !== 'android') return true;
        try {
            const res = await PermissionsAndroid.request(
                Platform.Version >= 33
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                { title: 'Photo Permission', message: 'Allow access to set your profile picture.', buttonPositive: 'OK' }
            );
            return res === PermissionsAndroid.RESULTS.GRANTED;
        } catch { return false; }
    };

    const openGallery = async () => {
        const ok = await requestGalleryPermission();
        if (!ok) return;
        try {
            const img = await ImagePicker.openPicker({
                width: 900, height: 900, cropping: true,
                cropperCircleOverlay: true, compressImageQuality: 0.85,
            });
            setAvatarUri(img.path);
            setNewAvatar(img);
            setAvatarError(false);
        } catch { }
    };

    const openCamera = async () => {
        try {
            const img = await ImagePicker.openCamera({
                width: 900, height: 900, cropping: true,
                cropperCircleOverlay: true, compressImageQuality: 0.85,
            });
            setAvatarUri(img.path);
            setNewAvatar(img);
            setAvatarError(false);
        } catch { }
    };

    const formatDate = d =>
        !d ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    /* ---------- validate ONLY on SAVE ---------- */
    const validateAll = () => {
        const f = firstNameRef.current;
        const l = lastNameRef.current;
        const e = emailRef.current;
        const p = phoneRef.current;

        const next = {
            firstName: !isName(f),
            lastName: !isName(l),
            email: !isEmail(e),
            phone: !isPhone(p),
            birthday: birthday ? birthday > new Date() : false, // error only if future
        };
        setErrors(next);
        return !Object.values(next).some(Boolean);
    };

    const updateProfileAPI = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append('first_name', firstNameRef.current.trim());
        formData.append('last_name', lastNameRef.current.trim());
        formData.append('email', emailRef.current.trim());
        formData.append('phone', digitsOnly(phoneRef.current));
        formData.append('user_id', userId);
        formData.append('country', nationality);

        // Append gender if selected
        if (gender) {
            formData.append('gender', gender);
        }

        // Append date of birth if selected
        if (birthday) {
            formData.append('date_of_birth', formatDate(birthday));
        }

        // Append photo if new avatar is selected
        if (newAvatar) {
            formData.append('photo', {
                uri: newAvatar.path,
                type: newAvatar.mime || 'image/jpeg',
                name: newAvatar.filename || `profile_${Date.now()}.jpg`,
            });
        }

        console.log("Updating profile with data:", {
            first_name: firstNameRef.current.trim(),
            last_name: lastNameRef.current.trim(),
            email: emailRef.current.trim(),
            phone: digitsOnly(phoneRef.current),
            user_id: userId,
            country: nationality,
            gender: gender,
            date_of_birth: birthday ? formatDate(birthday) : null,
            has_photo: !!newAvatar
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

            console.log("Profile update response:", res.data);

            if (res?.data?.status) {
                // Update local storage with new data
                const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
                let payload = raw ? JSON.parse(raw) : {};

                const container = payload?.user ? 'user' : (payload?.data ? 'data' : null);
                const base = container ? payload[container] : payload;

                const mergedUser = {
                    ...base,
                    name: [firstNameRef.current, lastNameRef.current].filter(Boolean).join(' ').trim(),
                    email: String(emailRef.current).trim(),
                    phone: digitsOnly(phoneRef.current),
                    photo: res.data.user?.photo || avatarUri || base?.photo || null,
                    gender: gender || base?.gender || null,
                    country: nationality || base?.country || 'Bahrain',
                    date_of_birth: birthday ? formatDate(birthday) : base?.date_of_birth || null,
                };

                if (container) payload[container] = mergedUser; else payload = mergedUser;
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));

                initialRef.current = {
                    email: emailRef.current,
                    firstName: firstNameRef.current,
                    lastName: lastNameRef.current,
                    phone: digitsOnly(phoneRef.current),
                    gender,
                    birthday,
                    countryCode,
                    nationality,
                    avatarUri: res.data.user?.photo ? PROFILE_BASE + res.data.user.photo : avatarUri,
                    phoneCca2,
                    phoneDial,
                };

                setNewAvatar(null); // Reset new avatar after successful upload
                setFormKey(k => k + 1);
                showAlert('success', 'Profile updated successfully!');
            } else {
                showAlert('error', res?.data?.message || 'Profile update failed.');
            }
        } catch (err) {
            console.log('Update profile error:', err.response?.data || err.message);
            showAlert('error', err?.response?.data?.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onSave = async () => {
        if (!validateAll()) {
            showSnack('Please fix the highlighted fields.', 'error');
            return;
        }

        if (!userId) {
            showAlert('error', 'User ID not found. Please login again.');
            return;
        }

        await updateProfileAPI();
    };

    const RowDivider = () => <View style={styles.hr} />;

    // Uncontrolled text input wrapper (no value prop)
    const InputWithIcon = ({
        icon, defaultValue, onChangeTextRef, placeholder,
        keyboardType = 'default', editable = true, error, errorMsg, onPress
    }) => {
        const field = (
            <>
                <View style={[
                    styles.inputWrap,
                    error && { borderColor: COLORS.danger, backgroundColor: COLORS.dangerBg }
                ]}>
                    <Ionicons name={icon} size={ms(16)} color={COLORS.muted} style={{ marginRight: s(8) }} />
                    <TextInput
                        style={styles.valueInput}
                        defaultValue={defaultValue}
                        onChangeText={onChangeTextRef}
                        placeholder={placeholder}
                        placeholderTextColor={COLORS.muted}
                        keyboardType={keyboardType}
                        editable={editable}
                        blurOnSubmit={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                {error && !!errorMsg && <Text style={styles.errText}>{errorMsg}</Text>}
            </>
        );
        if (onPress) {
            return (
                <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                    <View pointerEvents="none">{field}</View>
                </TouchableOpacity>
            );
        }
        return field;
    };

    const PhoneInput = () => (
        <>
            <View style={[
                styles.phoneWrap,
                errors.phone && { borderColor: COLORS.danger, backgroundColor: COLORS.dangerBg }
            ]}>
                <CountryPicker
                    countryCode={phoneCca2}
                    withFilter
                    withFlag
                    withCallingCode
                    withCallingCodeButton
                    onSelect={c => {
                        setPhoneCca2(c.cca2);
                        const dial = Array.isArray(c.callingCode) ? c.callingCode[0] : c.callingCode;
                        setPhoneDial(dial || '');
                    }}
                    containerButtonStyle={styles.ccBtn}
                />
                <View style={styles.vDivider} />
                <Text style={{ marginRight: s(6), color: COLORS.ink }}>+{phoneDial}</Text>
                <TextInput
                    style={styles.phoneInput}
                    defaultValue={phoneRef.current}
                    onChangeText={(t) => { phoneRef.current = t; }}
                    placeholder="0000 0000"
                    placeholderTextColor={COLORS.muted}
                    keyboardType="phone-pad"
                    blurOnSubmit={false}
                />
            </View>
            {errors.phone && <Text style={styles.errText}>Enter a valid phone number (6–15 digits).</Text>}
        </>
    );

    const saveEnabled = true;

    // cleanup snackbar timer
    useEffect(() => () => snackTimerRef.current && clearTimeout(snackTimerRef.current), []);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: vs(140) }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                    removeClippedSubviews={false}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top bar */}
                    <View style={styles.topbar}>
                        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="chevron-back" size={ms(20)} color={COLORS.ink} />
                        </TouchableOpacity>
                        <Text style={styles.topTitle}>Profile</Text>
                        <View style={{ width: ms(20) }} />
                    </View>

                    {/* Avatar */}
                    <View style={styles.heroCard}>
                        <TouchableOpacity onPress={() => setAvatarSheet(true)} activeOpacity={0.9} style={styles.avatarBtn}>
                            {avatarUri && !avatarError ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatar} onError={() => setAvatarError(true)} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Ionicons name="person" size={ms(42)} color="#fff" />
                                </View>
                            )}
                            <View style={styles.camBtn}>
                                <Ionicons name="camera" size={ms(14)} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.heroHint}>Update your profile photo</Text>
                    </View>

                    {/* Personal information */}
                    <View key={formKey} style={styles.card}>
                        <Text style={styles.cardTitle}>Personal information</Text>

                        {/* First Name */}
                        <View style={styles.row}>
                            <Text style={styles.label}>First Name</Text>
                            <InputWithIcon
                                icon="person-outline"
                                defaultValue={firstNameRef.current}
                                onChangeTextRef={(t) => { firstNameRef.current = t; }}
                                placeholder="First Name"
                                error={errors.firstName}
                                errorMsg="Enter a valid first name (2+ letters)."
                            />
                        </View>
                        <RowDivider />

                        {/* Last Name */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Last Name</Text>
                            <InputWithIcon
                                icon="person-outline"
                                defaultValue={lastNameRef.current}
                                onChangeTextRef={(t) => { lastNameRef.current = t; }}
                                placeholder="Last Name"
                                error={errors.lastName}
                                errorMsg="Enter a valid last name (2+ letters)."
                            />
                        </View>
                        <RowDivider />

                        {/* Email */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Email</Text>
                            <InputWithIcon
                                icon="mail-outline"
                                defaultValue={emailRef.current}
                                onChangeTextRef={(t) => { emailRef.current = String(t).trimStart(); }}
                                placeholder="name@email.com"
                                keyboardType="email-address"
                                error={errors.email}
                                errorMsg="Enter a valid email address."
                            />
                        </View>
                        <RowDivider />

                        {/* Phone */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Phone number</Text>
                            <PhoneInput />
                        </View>
                        <RowDivider />

                        {/* Gender */}
                        <View style={[styles.row, { alignItems: 'flex-start' }]}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={{ flex: 1, flexDirection: 'row', gap: s(10), flexWrap: 'wrap' }}>
                                <TouchableOpacity
                                    style={[styles.pill, gender === 'male' && styles.pillOn]}
                                    onPress={() => setGender('male')}
                                >
                                    <Ionicons name="male" size={ms(14)} color={gender === 'male' ? '#fff' : COLORS.gray} />
                                    <Text style={[styles.pillTxt, gender === 'male' && styles.pillTxtOn]}>Male</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.pill, gender === 'female' && styles.pillOn]}
                                    onPress={() => setGender('female')}
                                >
                                    <Ionicons name="female" size={ms(14)} color={gender === 'female' ? '#fff' : COLORS.gray} />
                                    <Text style={[styles.pillTxt, gender === 'female' && styles.pillTxtOn]}>Female</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.pill, gender === 'other' && styles.pillOn]}
                                    onPress={() => setGender('other')}
                                >
                                    <Ionicons name="person" size={ms(14)} color={gender === 'other' ? '#fff' : COLORS.gray} />
                                    <Text style={[styles.pillTxt, gender === 'other' && styles.pillTxtOn]}>Other</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <RowDivider />

                        {/* Birthday */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Birthday</Text>
                            <InputWithIcon
                                icon="calendar-outline"
                                defaultValue={formatDate(birthday)}
                                onChangeTextRef={() => { }}
                                placeholder="YYYY-MM-DD"
                                editable={false}
                                onPress={() => { setIosDate(birthday || new Date()); setShowDate(true); }}
                                error={errors.birthday}
                                errorMsg={"Birthday can't be in the future."}
                            />
                        </View>
                        <RowDivider />

                        {/* Nationality */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Nationality</Text>
                            <InputWithIcon
                                icon="flag-outline"
                                defaultValue={nationality}
                                onChangeTextRef={() => { }}
                                placeholder="Select nationality"
                                editable={false}
                                onPress={() => setShowCountry(true)}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* SAVE bar */}
            <View style={styles.saveBar}>
                <TouchableOpacity
                    style={[styles.saveBtn, (!saveEnabled || loading) && styles.saveBtnDisabled]}
                    activeOpacity={0.9}
                    onPress={onSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveTxt}>SAVE</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Country picker */}
            <CountryPicker
                visible={showCountry}
                withFilter
                withFlag
                withFlagButton={false}
                onClose={() => setShowCountry(false)}
                onSelect={c => {
                    setCountryCode(c.cca2);
                    setNationality(c.name);
                    setShowCountry(false);
                    setFormKey(k => k + 1);
                }}
                countryCode={countryCode}
            />

            {/* Date picker */}
            {Platform.OS === 'android' ? (
                showDate && (
                    <DateTimePicker
                        value={birthday || new Date()}
                        onChange={(e, d) => { setShowDate(false); if (d) { setBirthday(d); setFormKey(k => k + 1); } }}
                        mode="date"
                        display="calendar"
                        maximumDate={new Date()}
                    />
                )
            ) : (
                <Modal visible={showDate} animationType="slide" transparent onRequestClose={() => setShowDate(false)}>
                    <View style={styles.backdrop} />
                    <View style={styles.sheetFull}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Select birthday</Text>
                            <TouchableOpacity onPress={() => setShowDate(false)}>
                                <Ionicons name="close" size={ms(20)} color={COLORS.ink} />
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={iosDate}
                            onChange={(e, d) => d && setIosDate(d)}
                            mode="date"
                            display="inline"
                            maximumDate={new Date()}
                            style={{ alignSelf: 'stretch' }}
                        />
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => { setBirthday(iosDate); setShowDate(false); setFormKey(k => k + 1); }}>
                            <Text style={styles.primaryText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}

            {/* Avatar source chooser */}
            <Modal visible={avatarSheet} animationType="slide" transparent onRequestClose={() => setAvatarSheet(false)}>
                <View style={styles.backdrop} />
                <View style={styles.sheetFull}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Profile photo</Text>
                        <TouchableOpacity onPress={() => setAvatarSheet(false)}>
                            <Ionicons name="close" size={ms(20)} color={COLORS.ink} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.actionRow} onPress={() => { setAvatarSheet(false); openCamera(); }}>
                        <Ionicons name="camera-outline" size={ms(18)} color={COLORS.ink} />
                        <Text style={styles.actionText}>Take a photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionRow} onPress={() => { setAvatarSheet(false); openGallery(); }}>
                        <Ionicons name="image-outline" size={ms(18)} color={COLORS.ink} />
                        <Text style={styles.actionText}>Choose from gallery</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Snackbar */}
            {snack.visible && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.snackbar,
                        { backgroundColor: snack.type === 'error' ? COLORS.danger : COLORS.success },
                        {
                            opacity: snackAnim,
                            transform: [{
                                translateY: snackAnim.interpolate({ inputRange: [0, 1], outputRange: [s(30), 0] })
                            }]
                        }
                    ]}
                >
                    <Text style={styles.snackbarText}>{snack.text}</Text>
                </Animated.View>
            )}

            <CustomAlert
                visible={alertVisible}
                type={alertType}
                message={alertMessage}
                onPress={() => {
                    setAlertVisible(false);
                }}
            />
        </SafeAreaView>
    );
};

export default ProfileScreen;

/* ---------------- styles ---------------- */
const createStyles = (COLORS) => StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },

    topbar: {
        height: s(50),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(14),
    },
    topTitle: { flex: 1, textAlign: 'center', fontSize: ms(16), fontWeight: '800', color: COLORS.ink },

    heroCard: {
        alignSelf: 'center',
        width: '92%',
        backgroundColor: COLORS.card,
        borderRadius: s(16),
        borderWidth: 1,
        borderColor: COLORS.line,
        paddingVertical: s(16),
        paddingHorizontal: s(16),
        marginBottom: s(10),
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 }
            },
            android: { elevation: 2 }
        }),
    },
    avatarBtn: { width: s(110), height: s(110), borderRadius: s(55), overflow: 'hidden', position: 'relative' },
    avatar: { width: '100%', height: '100%' },
    avatarFallback: { backgroundColor: COLORS.p1, alignItems: 'center', justifyContent: 'center' },
    camBtn: {
        position: 'absolute',
        right: s(6),
        bottom: s(6),
        backgroundColor: COLORS.p1,
        width: s(32),
        height: s(32),
        borderRadius: s(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroHint: { marginTop: s(8), color: COLORS.gray, fontSize: ms(12) },

    card: {
        alignSelf: 'center',
        width: '92%',
        backgroundColor: COLORS.card,
        borderRadius: s(16),
        borderWidth: 1,
        borderColor: COLORS.line,
        paddingHorizontal: s(16),
        paddingTop: s(12),
        paddingBottom: s(8),
    },
    cardTitle: { fontSize: ms(16), fontWeight: '800', color: COLORS.ink, marginBottom: s(6) },

    row: { paddingVertical: s(10) },
    label: { color: COLORS.ink, fontWeight: '700', marginBottom: s(6), fontSize: ms(12) },

    inputWrap: {
        height: s(40),
        borderRadius: s(10),
        borderWidth: 1,
        borderColor: '#EDF0F4',
        backgroundColor: '#F7F9FE',
        paddingHorizontal: s(12),
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueInput: { flex: 1, height: s(40), paddingVertical: 0, color: COLORS.ink, fontSize: ms(14) },

    phoneWrap: {
        height: s(40),
        borderRadius: s(10),
        borderWidth: 1,
        borderColor: '#EDF0F4',
        backgroundColor: '#F7F9FE',
        paddingLeft: s(6),
        paddingRight: s(10),
        flexDirection: 'row',
        alignItems: 'center',
    },
    ccBtn: {
        paddingHorizontal: s(6),
        paddingVertical: s(4),
        borderRadius: s(8),
        backgroundColor: '#EEF3FF',
        marginRight: s(6),
    },
    vDivider: { width: 1, height: '60%', backgroundColor: '#E3E7F0', marginRight: s(8) },
    phoneInput: { flex: 1, height: s(40), paddingVertical: 0, color: COLORS.ink, fontSize: ms(14) },

    hr: { height: 1, backgroundColor: COLORS.line },

    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(8),
        paddingHorizontal: s(16),
        paddingVertical: s(9),
        borderRadius: s(16),
        backgroundColor: '#EFF1F5',
    },
    pillOn: { backgroundColor: COLORS.p1 },
    pillTxt: { color: COLORS.gray, fontWeight: '800', fontSize: ms(13) },
    pillTxtOn: { color: '#fff' },

    saveBar: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        paddingHorizontal: s(16),
        paddingTop: s(8),
        paddingBottom: s(12),
        backgroundColor: COLORS.bg,
        borderTopWidth: 1,
        borderTopColor: COLORS.line,
    },
    saveBtn: {
        height: vs(52),
        borderRadius: s(14),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.p1,
    },
    saveBtnDisabled: { backgroundColor: '#C8D6FF' },
    saveTxt: { color: '#fff', fontWeight: '900', letterSpacing: 1, fontSize: ms(15) },

    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },

    sheetFull: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        width: '100%',
        backgroundColor: COLORS.card,
        borderTopLeftRadius: s(16),
        borderTopRightRadius: s(16),
        paddingHorizontal: s(16),
        paddingTop: s(12),
        paddingBottom: s(16),
    },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: s(8) },
    sheetTitle: { fontSize: ms(14), fontWeight: '800', color: COLORS.ink },

    primaryBtn: {
        marginTop: s(8),
        backgroundColor: COLORS.p1,
        height: vs(48),
        borderRadius: s(12),
        alignItems: 'center',
        justifyContent: 'center'
    },
    primaryText: { color: '#fff', fontWeight: '800', fontSize: ms(15) },

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(10),
        paddingVertical: s(12),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.line,
    },
    actionText: { color: COLORS.ink, fontWeight: '700', fontSize: ms(14) },

    errText: { color: COLORS.danger, marginTop: s(6), fontSize: ms(11), fontWeight: '600' },

    snackbar: {
        position: 'absolute',
        left: s(12),
        right: s(12),
        bottom: vs(64), // above the Save bar
        borderRadius: s(12),
        paddingVertical: s(12),
        paddingHorizontal: s(14),
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    snackbarText: { color: '#fff', fontSize: ms(13), fontWeight: '700', textAlign: 'center' },
});