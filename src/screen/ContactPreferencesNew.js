import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
    Switch, Alert, Platform, Linking, useWindowDimensions, Modal,
    TextInput, KeyboardAvoidingView, I18nManager, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

/* ---------- tiny responsive scaler ---------- */
const useScale = () => {
    const { width } = useWindowDimensions();
    const s = (n) => Math.round((width / 390) * n);
    return { s };
};

const ContactPreferencesNew = ({ navigation }) => {
    const { s } = useScale();
    const { t } = useTranslation('contact');
    const { theme } = useTheme();

    // Define color constants from theme
    const COLORS = {
        bg: theme.bg,
        bgSoft: theme.bgSoft || '#F7FAFF',
        text: theme.text,
        sub: theme.sub,
        primary: theme.p1 || '#4F7DFF',
        primaryDark: theme.p2 || '#2563EB',
        stroke: theme.line || '#E5E7EB',
    };

    const BG_SOFT = COLORS.bgSoft;
    const TEXT = COLORS.text;
    const SUBTEXT = COLORS.sub;
    const PRIMARY = COLORS.primary;
    const PRIMARY_DARK = COLORS.primaryDark;
    const STROKE = COLORS.stroke;

    // Create styles memo
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);

    // Row component helper
    const Row = ({ children, style }) => (
        <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
            {children}
        </View>
    );

    // Component definitions with access to constants
    const Section = ({ title, right, children, style }) => (
        <View style={[styles.section, style]}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {right ? right : null}
            </Row>
            {children}
        </View>
    );

    const LinkBtn = ({ label, onPress }) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.link}>{label}</Text>
        </TouchableOpacity>
    );

    const Chip = ({ icon, label }) => (
        <View style={styles.chip}>
            <Icon name={icon} size={14} color={PRIMARY_DARK} />
            <Text style={styles.chipTxt}>{label}</Text>
        </View>
    );

    const ToggleRow = ({ icon, title, subtitle, value, onChange }) => (
        <Row style={styles.toggleRow}>
            <Row style={{ gap: 12, flex: 1 }}>
                <View style={styles.bulletIcon}>
                    <Icon name={icon} size={16} color={PRIMARY_DARK} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.tTitle}>{title}</Text>
                    {!!subtitle && <Text style={styles.tSub}>{subtitle}</Text>}
                </View>
            </Row>
            <Switch
                value={value}
                onValueChange={onChange}
                thumbColor={Platform.OS === 'android' ? (value ? '#fff' : '#f4f3f4') : undefined}
                trackColor={{ false: '#D8E1F5', true: '#93B4FF' }}
                ios_backgroundColor="#D8E1F5"
            />
        </Row>
    );

    // Reusable identity editor modal
    const IdentityEditModal = ({ visible, type, initialValue, onClose, onSave }) => {
        const [value, setValue] = useState(initialValue || '');
        const [error, setError] = useState('');

        React.useEffect(() => {
            if (visible) {
                setValue(initialValue || '');
                setError('');
            }
        }, [visible, initialValue]);

        const validate = () => {
            const trimmed = (value || '').trim();
            if (type === 'email') {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!re.test(trimmed)) return t('errors.invalidEmail');
            } else {
                const digits = trimmed.replace(/[\s-]/g, '');
                const re = /^\+?\d{8,15}$/;
                if (!re.test(digits)) return t('errors.invalidPhone');
            }
            return '';
        };

        const handleSave = () => {
            const msg = validate();
            if (msg) {
                setError(msg);
                return;
            }
            onSave((value || '').trim());
        };

        const title =
            type === 'email'
                ? t('modal.titles.email')
                : type === 'sms'
                    ? t('modal.titles.sms')
                    : t('modal.titles.whatsapp');

        const modalStyles = styles;

        return (
            <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={modalStyles.modalWrap}
                >
                    <TouchableOpacity style={modalStyles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                    <View style={modalStyles.modalCard}>
                        <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={modalStyles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose} accessibilityLabel={t('a11y.close')}>
                                <Icon name="x" size={20} color={SUBTEXT} />
                            </TouchableOpacity>
                        </Row>

                        <Text style={modalStyles.modalHint}>
                            {type === 'email' ? t('modal.hints.email') : t('modal.hints.phone')}
                        </Text>

                        <View style={[modalStyles.inputWrap, !!error && { borderColor: '#EF4444' }]}>
                            <TextInput
                                placeholder={
                                    type === 'email' ? t('placeholders.email') : t('placeholders.phoneExample')
                                }
                                placeholderTextColor="#9AA6B2"
                                style={[modalStyles.input, I18nManager.isRTL && { textAlign: 'right' }]}
                                keyboardType={type === 'email' ? 'email-address' : 'phone-pad'}
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={value}
                                onChangeText={setValue}
                                returnKeyType="done"
                                onSubmitEditing={handleSave}
                            />
                        </View>
                        {!!error && <Text style={modalStyles.errorTxt}>{error}</Text>}

                        <Row style={{ gap: 10, marginTop: 14 }}>
                            <TouchableOpacity style={[modalStyles.btn, modalStyles.btnSecondary]} onPress={onClose}>
                                <Text style={[modalStyles.btnTxt, { color: PRIMARY_DARK }]}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyles.btn, modalStyles.btnPrimary]} onPress={handleSave}>
                                <Text style={[modalStyles.btnTxt, { color: '#fff' }]}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </Row>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    // Loading state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // identities
    const [email, setEmail] = useState('');
    const [smsPhone, setSmsPhone] = useState('');
    const [waPhone, setWaPhone] = useState('');

    // toggles
    const [notifNewMsg, setNotifNewMsg] = useState(true);
    const [emailPromo, setEmailPromo] = useState(false);
    const [smsPromo, setSmsPromo] = useState(false);
    const [waPromo, setWaPromo] = useState(false);

    // Store initial values to detect changes (actual unmasked values)
    const [initialValues, setInitialValues] = useState(null);

    // Store actual (unmasked) values for API calls
    const [actualEmail, setActualEmail] = useState('');
    const [actualSmsPhone, setActualSmsPhone] = useState('');
    const [actualWaPhone, setActualWaPhone] = useState('');

    // modal control
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null); // 'email' | 'sms' | 'whatsapp'
    const [modalInitial, setModalInitial] = useState('');

    const openModal = (type) => {
        setModalType(type);
        setModalInitial(
            type === 'email'
                ? actualEmail
                : type === 'sms'
                    ? actualSmsPhone
                    : actualWaPhone
        );
        setModalVisible(true);
    };

    const closeModal = () => setModalVisible(false);

    const saveModalValue = (val) => {
        // Store actual values (not masked) for API calls
        // We'll mask them for display in the UI
        const maskEmail = (email) => {
            if (!email) return '';
            const [local, domain] = email.split('@');
            if (!domain || local.length <= 2) return email;
            return `${local[0]}***${local[local.length - 1]}@${domain}`;
        };

        const maskPhone = (phone) => {
            if (!phone) return '';
            const cleaned = phone.replace(/[\s-]/g, '');
            if (cleaned.length < 8) return phone;
            return `${cleaned.substring(0, 3)} •• •• ${cleaned.substring(cleaned.length - 4)}`;
        };

        if (modalType === 'email') {
            setActualEmail(val);
            setEmail(maskEmail(val));
        } else if (modalType === 'sms') {
            setActualSmsPhone(val);
            setSmsPhone(maskPhone(val));
        } else if (modalType === 'whatsapp') {
            setActualWaPhone(val);
            setWaPhone(maskPhone(val));
        }
        setModalVisible(false);
    };

    // Fetch contact preferences on mount
    useEffect(() => {
        fetchContactPreferences();
    }, []);

    const fetchContactPreferences = useCallback(async () => {
        try {
            setLoading(true);
            const userData = await AsyncStorage.getItem('luna_user');
            if (!userData) {
                Alert.alert('Error', 'User not found. Please login again.');
                navigation.goBack();
                return;
            }

            const parsed = JSON.parse(userData);
            const user = parsed.user || parsed.data || parsed;
            const userIdValue = user.id || parsed.id;

            if (!userIdValue) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                navigation.goBack();
                return;
            }

            console.log('Fetching contact preferences for user_id:', userIdValue);
            console.log('API Base URL:', api.defaults.baseURL);
            console.log('Full endpoint will be:', `${api.defaults.baseURL}/contact-preferences/get`);

            const response = await api.post('/contact-preferences/get', { user_id: parseInt(userIdValue) });

            console.log('Contact preferences API response:', JSON.stringify(response.data, null, 2));

            if (response.data.status && response.data.data) {
                const prefs = response.data.data;

                // Mask email/phone if needed (show partial)
                const maskEmail = (email) => {
                    if (!email || email.includes('*')) return email;
                    const [local, domain] = email.split('@');
                    if (local.length <= 2) return email;
                    return `${local[0]}***${local[local.length - 1]}@${domain}`;
                };

                const maskPhone = (phone) => {
                    if (!phone || phone.includes('•')) return phone;
                    const cleaned = phone.replace(/[\s-]/g, '');
                    if (cleaned.length < 8) return phone;
                    return `${cleaned.substring(0, 3)} •• •• ${cleaned.substring(cleaned.length - 4)}`;
                };

                // Store actual values
                const actualEmailVal = prefs.email || '';
                const actualSmsPhoneVal = prefs.sms_phone || '';
                const actualWaPhoneVal = prefs.whatsapp_phone || '';

                setActualEmail(actualEmailVal);
                setActualSmsPhone(actualSmsPhoneVal);
                setActualWaPhone(actualWaPhoneVal);

                // Display masked values
                setEmail(maskEmail(actualEmailVal));
                setSmsPhone(maskPhone(actualSmsPhoneVal));
                setWaPhone(maskPhone(actualWaPhoneVal));
                setNotifNewMsg(prefs.notif_new_msg !== undefined ? prefs.notif_new_msg : true);
                setEmailPromo(prefs.email_promo !== undefined ? prefs.email_promo : false);
                setSmsPromo(prefs.sms_promo !== undefined ? prefs.sms_promo : false);
                setWaPromo(prefs.whatsapp_promo !== undefined ? prefs.whatsapp_promo : false);

                // Store initial values for comparison (actual unmasked values)
                setInitialValues({
                    email: actualEmailVal,
                    smsPhone: actualSmsPhoneVal,
                    waPhone: actualWaPhoneVal,
                    notifNewMsg: prefs.notif_new_msg !== undefined ? prefs.notif_new_msg : true,
                    emailPromo: prefs.email_promo !== undefined ? prefs.email_promo : false,
                    smsPromo: prefs.sms_promo !== undefined ? prefs.sms_promo : false,
                    waPromo: prefs.whatsapp_promo !== undefined ? prefs.whatsapp_promo : false,
                });
            }
        } catch (error) {
            console.error('Error fetching contact preferences:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load contact preferences';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [navigation]);

    const somethingChanged = useMemo(() => {
        if (!initialValues) return false;

        // Check if any value has changed (compare actual values, not masked display values)
        return (
            actualEmail !== initialValues.email ||
            actualSmsPhone !== initialValues.smsPhone ||
            actualWaPhone !== initialValues.waPhone ||
            notifNewMsg !== initialValues.notifNewMsg ||
            emailPromo !== initialValues.emailPromo ||
            smsPromo !== initialValues.smsPromo ||
            waPromo !== initialValues.waPromo
        );
    }, [actualEmail, actualSmsPhone, actualWaPhone, notifNewMsg, emailPromo, smsPromo, waPromo, initialValues]);

    const openPolicy = () => Linking.openURL('https://example.com/privacy');
    const openHelp = () => Linking.openURL('https://example.com/help');

    const handleSave = useCallback(async () => {
        try {
            setSaving(true);
            const userData = await AsyncStorage.getItem('luna_user');
            if (!userData) {
                Alert.alert('Error', 'User not found. Please login again.');
                return;
            }

            const parsed = JSON.parse(userData);
            const user = parsed.user || parsed.data || parsed;
            const userId = user.id || parsed.id;

            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                return;
            }

            // Use actual (unmasked) values for API
            const response = await api.post('/contact-preferences/save', {
                user_id: parseInt(userId),
                email: actualEmail,
                sms_phone: actualSmsPhone.replace(/[\s-]/g, ''),
                wa_phone: actualWaPhone.replace(/[\s-]/g, ''),
                notif_new_msg: notifNewMsg,
                email_promo: emailPromo,
                sms_promo: smsPromo,
                wa_promo: waPromo,
            });

            if (response.data.status) {
                Alert.alert(t('alerts.savedTitle'), t('alerts.savedBody'));
                // Refresh data to get updated values
                await fetchContactPreferences();
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating contact preferences:', error);
            Alert.alert('Error', 'Failed to update contact preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [actualEmail, actualSmsPhone, actualWaPhone, notifNewMsg, emailPromo, smsPromo, waPromo, t, fetchContactPreferences]);

    const activeChips = useMemo(() => {
        const chips = [];
        if (notifNewMsg) chips.push({ icon: 'bell', label: t('chips.newMessage') });
        if (emailPromo) chips.push({ icon: 'mail', label: t('chips.emailPromos') });
        if (smsPromo) chips.push({ icon: 'message-circle', label: t('chips.smsPromos') });
        if (waPromo) chips.push({ icon: 'message-square', label: t('chips.waPromos') });
        return chips;
    }, [notifNewMsg, emailPromo, smsPromo, waPromo, t]);

    const componentStyles = styles;

    if (loading) {
        return (
            <SafeAreaView style={[componentStyles.safe, { backgroundColor: BG_SOFT }]}>
                <View style={componentStyles.container}>
                    <Row style={[componentStyles.header, { paddingHorizontal: s(16), paddingVertical: s(12) }]}>
                        <TouchableOpacity onPress={() => navigation?.goBack?.()} accessibilityLabel={t('a11y.back')}>
                            <Icon name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'} size={s(22)} color={TEXT} />
                        </TouchableOpacity>
                        <Text style={[componentStyles.headerTitle, { fontSize: s(18) }]}>
                            {t('titles.contactPreferences')}
                        </Text>
                        <View style={{ width: s(22) }} />
                    </Row>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={PRIMARY} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[componentStyles.safe, { backgroundColor: BG_SOFT }]}>
            <View style={componentStyles.container}>
                {/* Header */}
                <Row style={[componentStyles.header, { paddingHorizontal: s(16), paddingVertical: s(12) }]}>
                    <TouchableOpacity onPress={() => navigation?.goBack?.()} accessibilityLabel={t('a11y.back')}>
                        <Icon name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'} size={s(22)} color={TEXT} />
                    </TouchableOpacity>
                    <Text style={[componentStyles.headerTitle, { fontSize: s(18) }]}>
                        {t('titles.contactPreferences')}
                    </Text>
                    <View style={{ width: s(22) }} />
                </Row>

                <ScrollView
                    contentContainerStyle={{ padding: s(16), paddingBottom: s(120) }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero summary (solid blue card) */}
                    <View style={[componentStyles.hero, { padding: s(16) }]}>
                        <Row style={{ justifyContent: 'space-between', marginBottom: s(6) }}>
                            <Text style={[componentStyles.heroTitle, { fontSize: s(15) }]}>{t('hero.title')}</Text>
                            <Icon name="settings" size={s(18)} color="#E9F2FF" />
                        </Row>
                        <Text style={[componentStyles.heroSub, { fontSize: s(12), lineHeight: s(18) }]}>
                            {t('hero.sub')}
                        </Text>

                        <Row style={{ flexWrap: 'wrap', gap: s(8), marginTop: s(10) }}>
                            {activeChips.length ? (
                                activeChips.map((c, idx) => <Chip key={idx} icon={c.icon} label={c.label} />)
                            ) : (
                                <Text style={[componentStyles.heroSub, { opacity: 0.95 }]}>{t('hero.allOff')}</Text>
                            )}
                        </Row>
                    </View>

                    {/* New message notifications */}
                    <Section
                        title={t('sections.newMsg.title')}
                        right={<Text style={componentStyles.badge}>{notifNewMsg ? t('common.on') : t('common.off')}</Text>}
                    >
                        <ToggleRow
                            icon="bell"
                            title={t('sections.newMsg.row.title')}
                            subtitle={t('sections.newMsg.row.sub')}
                            value={notifNewMsg}
                            onChange={setNotifNewMsg}
                        />
                    </Section>

                    {/* Email */}
                    <Section title={t('sections.email.title')}>
                        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={componentStyles.identity}>{t('sections.email.identity')}</Text>
                            <LinkBtn label={t('common.change')} onPress={() => openModal('email')} />
                        </Row>
                        <Text style={componentStyles.identityValue}>
                            {email}  •  {t('sections.email.ownerOnly')}
                        </Text>

                        <ToggleRow
                            icon="mail"
                            title={t('sections.email.toggle.title')}
                            subtitle={t('sections.email.toggle.sub')}
                            value={emailPromo}
                            onChange={setEmailPromo}
                        />
                    </Section>

                    {/* SMS */}
                    <Section title={t('sections.sms.title')}>
                        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={componentStyles.identity}>{t('sections.sms.identity')}</Text>
                            <LinkBtn label={t('common.change')} onPress={() => openModal('sms')} />
                        </Row>
                        <Text style={componentStyles.identityValue}>{smsPhone}</Text>

                        <ToggleRow
                            icon="message-circle"
                            title={t('sections.sms.toggle.title')}
                            subtitle={t('sections.sms.toggle.sub')}
                            value={smsPromo}
                            onChange={setSmsPromo}
                        />
                    </Section>

                    {/* WhatsApp */}
                    <Section title={t('sections.wa.title')}>
                        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={componentStyles.identity}>{t('sections.wa.identity')}</Text>
                            <LinkBtn label={t('common.change')} onPress={() => openModal('whatsapp')} />
                        </Row>
                        <Text style={componentStyles.identityValue}>{waPhone}</Text>

                        <ToggleRow
                            icon="message-square"
                            title={t('sections.wa.toggle.title')}
                            subtitle={t('sections.wa.toggle.sub')}
                            value={waPromo}
                            onChange={setWaPromo}
                        />
                    </Section>

                    {/* Legal */}
                    <View style={componentStyles.legalBox}>
                        <Icon name="shield" size={16} color={PRIMARY_DARK} />
                        <Text style={componentStyles.legalTxt}>
                            {t('legal.prefix')}{' '}
                            <Text style={componentStyles.link} onPress={openPolicy}>{t('legal.privacy')}</Text>. {t('legal.help')}{' '}
                            <Text style={componentStyles.link} onPress={openHelp}>{t('legal.here')}</Text>.
                        </Text>
                    </View>
                </ScrollView>

                {/* Sticky Save */}
                <View style={[componentStyles.saveWrap, { padding: s(16) }]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        disabled={!somethingChanged || saving}
                        onPress={handleSave}
                        style={[
                            componentStyles.saveBtn,
                            { height: s(48), backgroundColor: PRIMARY },
                            (!somethingChanged || saving) && { opacity: 0.6 },
                        ]}
                    >
                        <Row style={{ justifyContent: 'center', gap: s(8) }}>
                            {saving ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Icon name="save" size={s(16)} color="#fff" />
                            )}
                            <Text style={[componentStyles.saveTxt, { fontSize: s(15) }]}>
                                {saving ? 'Saving...' : t('common.savePrefs')}
                            </Text>
                        </Row>
                    </TouchableOpacity>
                </View>
            </View>

            {/* MODAL */}
            <IdentityEditModal
                visible={modalVisible}
                type={modalType}
                initialValue={modalInitial}
                onClose={closeModal}
                onSave={saveModalValue}
            />
        </SafeAreaView>
    );
};

export default ContactPreferencesNew;

/* ----------------------------- styles ----------------------------- */
const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1 },
    container: { flex: 1 },
    header: { alignItems: 'center' },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '700',
        color: COLORS.text,
    },

    hero: { borderRadius: 16, backgroundColor: COLORS.primaryDark },
    heroTitle: { color: '#E9F2FF', fontWeight: '700' },
    heroSub: { color: '#E9F2FF', opacity: 0.95 },

    section: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginTop: 14,
        borderColor: COLORS.stroke,
        borderWidth: 1,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },

    row: { flexDirection: 'row', alignItems: 'center' },

    badge: {
        fontSize: 12,
        color: COLORS.primaryDark,
        backgroundColor: '#E7EEFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        overflow: 'hidden',
    },

    toggleRow: {
        marginTop: 10,
        paddingVertical: 8,
        justifyContent: 'space-between',
    },
    bulletIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#E9F0FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tTitle: { fontSize: 13.5, color: COLORS.text, fontWeight: '600' },
    tSub: { fontSize: 12, color: COLORS.sub, marginTop: 2, lineHeight: 16 },

    identity: { fontSize: 12, color: COLORS.sub, textAlign: I18nManager.isRTL ? 'right' : 'left' },
    identityValue: { fontSize: 13, color: COLORS.text, marginTop: 4, marginBottom: 8, textAlign: I18nManager.isRTL ? 'right' : 'left' },

    link: { color: COLORS.primary, fontWeight: '700' },

    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DDE8FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        gap: 6,
    },
    chipTxt: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '700' },

    legalBox: {
        flexDirection: 'row',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#EEF4FF',
        borderWidth: 1,
        borderColor: COLORS.stroke,
        marginTop: 16,
    },
    legalTxt: { flex: 1, color: '#334155', fontSize: 12, lineHeight: 17, textAlign: I18nManager.isRTL ? 'right' : 'left' },

    saveWrap: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(247,250,255,0.92)',
    },
    saveBtn: {
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 2,
    },
    saveTxt: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },

    /* Modal */
    modalWrap: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
    modalCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderColor: COLORS.stroke,
        borderWidth: 1,
    },
    modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: I18nManager.isRTL ? 'right' : 'left' },
    modalHint: { fontSize: 12, color: COLORS.sub, marginTop: 6, marginBottom: 10, textAlign: I18nManager.isRTL ? 'right' : 'left' },
    inputWrap: {
        borderWidth: 1,
        borderColor: COLORS.stroke,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        backgroundColor: '#fff',
    },
    input: { fontSize: 14, color: COLORS.text },
    errorTxt: { color: '#EF4444', marginTop: 6, fontSize: 12, textAlign: I18nManager.isRTL ? 'right' : 'left' },

    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.stroke,
    },
    btnSecondary: { backgroundColor: '#F3F6FF' },
    btnPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    btnTxt: { fontSize: 14, fontWeight: '700' },
});
