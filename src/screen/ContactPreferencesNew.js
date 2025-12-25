import React, { useMemo, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
    Switch, Alert, Platform, Linking, useWindowDimensions, Modal,
    TextInput, KeyboardAvoidingView, I18nManager
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

/* ---------- tiny responsive scaler ---------- */
const useScale = () => {
    const { width } = useWindowDimensions();
    const s = (n) => Math.round((width / 390) * n);
    return { s };
};

const Row = ({ children, style }) => <View style={[styles.row, style]}>{children}</View>;

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

/* ---------- Reusable identity editor modal ---------- */
const IdentityEditModal = ({ visible, type, initialValue, onClose, onSave }) => {
    const { t } = useTranslation('contact');
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

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalWrap}
            >
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                <View style={styles.modalCard}>
                    <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose} accessibilityLabel={t('a11y.close')}>
                            <Icon name="x" size={20} color={SUBTEXT} />
                        </TouchableOpacity>
                    </Row>

                    <Text style={styles.modalHint}>
                        {type === 'email' ? t('modal.hints.email') : t('modal.hints.phone')}
                    </Text>

                    <View style={[styles.inputWrap, !!error && { borderColor: '#EF4444' }]}>
                        <TextInput
                            placeholder={
                                type === 'email' ? t('placeholders.email') : t('placeholders.phoneExample')
                            }
                            placeholderTextColor="#9AA6B2"
                            style={[styles.input, I18nManager.isRTL && { textAlign: 'right' }]}
                            keyboardType={type === 'email' ? 'email-address' : 'phone-pad'}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={value}
                            onChangeText={setValue}
                            returnKeyType="done"
                            onSubmitEditing={handleSave}
                        />
                    </View>
                    {!!error && <Text style={styles.errorTxt}>{error}</Text>}

                    <Row style={{ gap: 10, marginTop: 14 }}>
                        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
                            <Text style={[styles.btnTxt, { color: PRIMARY_DARK }]}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
                            <Text style={[styles.btnTxt, { color: '#fff' }]}>{t('common.save')}</Text>
                        </TouchableOpacity>
                    </Row>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const ContactPreferencesNew = ({ navigation }) => {
    const { s } = useScale();
    const { t } = useTranslation('contact');

    // identities (replace with your store/API)
    const [email, setEmail] = useState('y***s@mail.com');
    const [smsPhone, setSmsPhone] = useState('+91 •• •• 9709');
    const [waPhone, setWaPhone] = useState('+91 •• •• 9709');

    // toggles
    const [notifNewMsg, setNotifNewMsg] = useState(true);
    const [emailPromo, setEmailPromo] = useState(false);
    const [smsPromo, setSmsPromo] = useState(false);
    const [waPromo, setWaPromo] = useState(true);

    // modal control
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null); // 'email' | 'sms' | 'whatsapp'
    const [modalInitial, setModalInitial] = useState('');

    const openModal = (type) => {
        setModalType(type);
        setModalInitial(
            type === 'email'
                ? (email.includes('*') ? '' : email)
                : type === 'sms'
                    ? (/\*/.test(smsPhone) ? '' : smsPhone)
                    : (/\*/.test(waPhone) ? '' : waPhone)
        );
        setModalVisible(true);
    };

    const closeModal = () => setModalVisible(false);

    const saveModalValue = (val) => {
        if (modalType === 'email') setEmail(val);
        else if (modalType === 'sms') setSmsPhone(val);
        else if (modalType === 'whatsapp') setWaPhone(val);
        setModalVisible(false);
    };

    const somethingChanged = useMemo(() => true, [
        notifNewMsg, emailPromo, smsPromo, waPromo, email, smsPhone, waPhone,
    ]);

    const openPolicy = () => Linking.openURL('https://example.com/privacy');
    const openHelp = () => Linking.openURL('https://example.com/help');

    const handleSave = () => {
        Alert.alert(t('alerts.savedTitle'), t('alerts.savedBody'));
        // TODO: call API
    };

    const activeChips = useMemo(() => {
        const chips = [];
        if (notifNewMsg) chips.push({ icon: 'bell', label: t('chips.newMessage') });
        if (emailPromo) chips.push({ icon: 'mail', label: t('chips.emailPromos') });
        if (smsPromo) chips.push({ icon: 'message-circle', label: t('chips.smsPromos') });
        if (waPromo) chips.push({ icon: 'message-square', label: t('chips.waPromos') });
        return chips;
    }, [notifNewMsg, emailPromo, smsPromo, waPromo, t]);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: BG_SOFT }]}>
            <View style={styles.container}>
                {/* Header */}
                <Row style={[styles.header, { paddingHorizontal: s(16), paddingVertical: s(12) }]}>
                    <TouchableOpacity onPress={() => navigation?.goBack?.()} accessibilityLabel={t('a11y.back')}>
                        <Icon name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'} size={s(22)} color={TEXT} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontSize: s(18) }]}>
                        {t('titles.contactPreferences')}
                    </Text>
                    <View style={{ width: s(22) }} />
                </Row>

                <ScrollView
                    contentContainerStyle={{ padding: s(16), paddingBottom: s(120) }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero summary (solid blue card) */}
                    <View style={[styles.hero, { padding: s(16) }]}>
                        <Row style={{ justifyContent: 'space-between', marginBottom: s(6) }}>
                            <Text style={[styles.heroTitle, { fontSize: s(15) }]}>{t('hero.title')}</Text>
                            <Icon name="settings" size={s(18)} color="#E9F2FF" />
                        </Row>
                        <Text style={[styles.heroSub, { fontSize: s(12), lineHeight: s(18) }]}>
                            {t('hero.sub')}
                        </Text>

                        <Row style={{ flexWrap: 'wrap', gap: s(8), marginTop: s(10) }}>
                            {activeChips.length ? (
                                activeChips.map((c, idx) => <Chip key={idx} icon={c.icon} label={c.label} />)
                            ) : (
                                <Text style={[styles.heroSub, { opacity: 0.95 }]}>{t('hero.allOff')}</Text>
                            )}
                        </Row>
                    </View>

                    {/* New message notifications */}
                    <Section
                        title={t('sections.newMsg.title')}
                        right={<Text style={styles.badge}>{notifNewMsg ? t('common.on') : t('common.off')}</Text>}
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
                            <Text style={styles.identity}>{t('sections.email.identity')}</Text>
                            <LinkBtn label={t('common.change')} onPress={() => openModal('email')} />
                        </Row>
                        <Text style={styles.identityValue}>
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
                            <Text style={styles.identity}>{t('sections.sms.identity')}</Text>
                            <LinkBtn label={t('common.change')} onPress={() => openModal('sms')} />
                        </Row>
                        <Text style={styles.identityValue}>{smsPhone}</Text>

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
                            <Text style={styles.identity}>{t('sections.wa.identity')}</Text>
                            <LinkBtn label={t('common.change')} onPress={() => openModal('whatsapp')} />
                        </Row>
                        <Text style={styles.identityValue}>{waPhone}</Text>

                        <ToggleRow
                            icon="message-square"
                            title={t('sections.wa.toggle.title')}
                            subtitle={t('sections.wa.toggle.sub')}
                            value={waPromo}
                            onChange={setWaPromo}
                        />
                    </Section>

                    {/* Legal */}
                    <View style={styles.legalBox}>
                        <Icon name="shield" size={16} color={PRIMARY_DARK} />
                        <Text style={styles.legalTxt}>
                            {t('legal.prefix')}{' '}
                            <Text style={styles.link} onPress={openPolicy}>{t('legal.privacy')}</Text>. {t('legal.help')}{' '}
                            <Text style={styles.link} onPress={openHelp}>{t('legal.here')}</Text>.
                        </Text>
                    </View>
                </ScrollView>

                {/* Sticky Save */}
                <View style={[styles.saveWrap, { padding: s(16) }]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        disabled={!somethingChanged}
                        onPress={handleSave}
                        style={[
                            styles.saveBtn,
                            { height: s(48), backgroundColor: PRIMARY },
                            !somethingChanged && { opacity: 0.6 },
                        ]}
                    >
                        <Row style={{ justifyContent: 'center', gap: s(8) }}>
                            <Icon name="save" size={s(16)} color="#fff" />
                            <Text style={[styles.saveTxt, { fontSize: s(15) }]}>{t('common.savePrefs')}</Text>
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
const styles = StyleSheet.create({
    safe: { flex: 1 },
    container: { flex: 1 },
    header: { alignItems: 'center' },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '700',
        color: TEXT,
    },

    hero: { borderRadius: 16, backgroundColor: PRIMARY_DARK },
    heroTitle: { color: '#E9F2FF', fontWeight: '700' },
    heroSub: { color: '#E9F2FF', opacity: 0.95 },

    section: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginTop: 14,
        borderColor: STROKE,
        borderWidth: 1,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT },

    row: { flexDirection: 'row', alignItems: 'center' },

    badge: {
        fontSize: 12,
        color: PRIMARY_DARK,
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
    tTitle: { fontSize: 13.5, color: TEXT, fontWeight: '600' },
    tSub: { fontSize: 12, color: SUBTEXT, marginTop: 2, lineHeight: 16 },

    identity: { fontSize: 12, color: SUBTEXT, textAlign: I18nManager.isRTL ? 'right' : 'left' },
    identityValue: { fontSize: 13, color: TEXT, marginTop: 4, marginBottom: 8, textAlign: I18nManager.isRTL ? 'right' : 'left' },

    link: { color: PRIMARY, fontWeight: '700' },

    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DDE8FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        gap: 6,
    },
    chipTxt: { fontSize: 12, color: PRIMARY_DARK, fontWeight: '700' },

    legalBox: {
        flexDirection: 'row',
        gap: 10,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#EEF4FF',
        borderWidth: 1,
        borderColor: STROKE,
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
        shadowColor: PRIMARY_DARK,
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
        borderColor: STROKE,
        borderWidth: 1,
    },
    modalTitle: { fontSize: 16, fontWeight: '700', color: TEXT, textAlign: I18nManager.isRTL ? 'right' : 'left' },
    modalHint: { fontSize: 12, color: SUBTEXT, marginTop: 6, marginBottom: 10, textAlign: I18nManager.isRTL ? 'right' : 'left' },
    inputWrap: {
        borderWidth: 1,
        borderColor: STROKE,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        backgroundColor: '#fff',
    },
    input: { fontSize: 14, color: TEXT },
    errorTxt: { color: '#EF4444', marginTop: 6, fontSize: 12, textAlign: I18nManager.isRTL ? 'right' : 'left' },

    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: STROKE,
    },
    btnSecondary: { backgroundColor: '#F3F6FF' },
    btnPrimary: { backgroundColor: PRIMARY, borderColor: PRIMARY },
    btnTxt: { fontSize: 14, fontWeight: '700' },
});
