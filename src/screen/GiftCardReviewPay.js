// src/screens/GiftCardReviewPay.js
import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ScrollView,
    Platform,
    useWindowDimensions,
    I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { SkeletonCheckoutScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SIZES = {
    header: 18,
    h6: 15,
    body: 13,
    label: 12,
    button: 14,
    radius: 12,
    gap: 10,
    inset: 14,
    fieldH: 44,
};

export default function GiftCardReviewPay({ route, navigation }) {
    const { width, height } = useWindowDimensions();
    const isTablet = Math.max(width, height) >= 768;

    const { t } = useTranslation('giftcardPay');
    const isRTL = I18nManager.isRTL || i18n?.dir?.() === 'rtl';
    const { theme, isDark } = useTheme();
    const COLORS = {
        page: theme.giftCardPage || theme.page,
        header: theme.giftCardHeader || theme.header,
        panel: theme.giftCardPanel || theme.panel,
        border: theme.giftCardBorder || theme.border,
        text: theme.giftCardText || theme.text,
        sub: theme.giftCardSub || theme.sub,
        accent: theme.giftCardAccent || theme.accent,
        accentDark: theme.giftCardAccentDark || theme.accentDark,
        disabled: theme.disabled,
        danger: theme.danger,
        isDark,
    };
    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const { selectedCard = {}, form = {}, currency: currencyFromRoute } = route?.params || {};

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setLoading]);

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');

    const currency = currencyFromRoute || t('currency', { defaultValue: 'BHD' });

    const amountText = useMemo(() => {
        const amt = Number(form?.amount || 0);
        try {
            return new Intl.NumberFormat(i18n.language || 'en', { style: 'currency', currency }).format(amt);
        } catch {
            return `${amt.toFixed(2)} ${currency}`;
        }
    }, [form?.amount, currency, i18n.language]);

    const goBack = () => navigation?.goBack?.();
    const payWith = (provider) =>
        Alert.alert(provider, t('demoPayment', { defaultValue: 'Demo action — integrate your processor here.' }));

    const validateCardForm = () => {
        if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 12) {
            Alert.alert(t('errors.invalid', { defaultValue: 'Invalid' }), t('errors.cardNumber', { defaultValue: 'Enter a valid card number.' }));
            return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) {
            Alert.alert(t('errors.invalid', { defaultValue: 'Invalid' }), t('errors.expiry', { defaultValue: 'Expiry must be MM/YY.' }));
            return false;
        }
        if (!/^\d{3,4}$/.test(cvv.trim())) {
            Alert.alert(t('errors.invalid', { defaultValue: 'Invalid' }), t('errors.cvv', { defaultValue: 'Enter a valid CVV.' }));
            return false;
        }
        if (!nameOnCard.trim()) {
            Alert.alert(t('errors.invalid', { defaultValue: 'Invalid' }), t('errors.name', { defaultValue: 'Enter the name on card.' }));
            return false;
        }
        return true;
    };

    const completePurchase = async () => {
        if (!validateCardForm()) return;
        
        try {
            // Get user ID from storage
            const userData = await AsyncStorage.getItem('luna_user');
            if (!userData) {
                Alert.alert('Error', 'Please login to purchase gift cards');
                return;
            }

            const parsed = JSON.parse(userData);
            const userId = parsed.user?.id || parsed.id;
            
            if (!userId || !selectedCard?.id) {
                Alert.alert('Error', 'Invalid user or gift card');
                return;
            }

            // Extract email and phone from contact
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form?.contact || '');
            const isPhone = /^[0-9+\-\s]{7,}$/.test(form?.contact || '');
            const recipientEmail = isEmail ? form.contact : null;
            const recipientPhone = isPhone ? form.contact : null;
            const recipientName = form?.name || '';
            const amount = form?.amount || selectedCard.value || selectedCard.price || 0;

            // Call purchase API
            const response = await api.post('/gift-card/purchase', {
                user_id: userId,
                gift_card_id: selectedCard.id,
                recipient_email: recipientEmail,
                recipient_phone: recipientPhone,
                recipient_name: recipientName,
                message: form?.message || '',
                amount: amount,
            });

            if (response.data.status && response.data.data) {
                navigation.replace('GiftCardSuccess', {
                    selectedCard,
                    form,
                    amount: response.data.data.amount || amount,
                    orderId: response.data.data.purchase_id,
                    giftCardCode: response.data.data.code,
                    giftCard: response.data.data.gift_card,
                });
            } else {
                Alert.alert('Error', response.data.message || 'Failed to purchase gift card');
            }
        } catch (error) {
            console.log('Error purchasing gift card:', error);
            Alert.alert('Error', 'Failed to purchase gift card. Please try again.');
        }
    };

    const cardImageH = isTablet ? 200 : Math.min(180, Math.round(width * 0.38));
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                <SkeletonCheckoutScreen />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* HEADER: 3-slot row so title always centered; row flips in RTL */}
            <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.side}>
                    <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Icon name={isRTL ? 'arrow-right' : 'arrow-left'} size={18} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.center}>
                    <Text style={styles.headerTitle}>{t('title', { defaultValue: 'Review & Pay' })}</Text>
                </View>
                <View style={styles.side} />
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                {/* Preview + Details */}
                <View style={[styles.previewRow, { flexDirection: isTablet ? (isRTL ? 'row-reverse' : 'row') : 'column' }]}>
                    <View style={{ flex: 1 }}>
                        {!!selectedCard?.image && (
                            <Image source={{ uri: selectedCard.image }} style={[styles.cardImage, { height: cardImageH }]} resizeMode="cover" />
                        )}
                        <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                            {selectedCard?.title || t('giftCard', { defaultValue: 'Gift Card' })}
                        </Text>
                    </View>

                    <View style={styles.detailsCol}>
                        <Text style={[styles.detailsHeading, isRTL && { textAlign: 'right' }]}>{t('details', { defaultValue: 'Details' })}</Text>

                        <View style={[styles.detailLine, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.detailKey, isRTL && { textAlign: 'left' }]}>{t('amount', { defaultValue: 'Amount' })}</Text>
                            <Text style={[styles.detailVal, isRTL && { textAlign: 'left' }]}>{amountText}</Text>
                        </View>
                        <View style={[styles.detailLine, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.detailKey, isRTL && { textAlign: 'left' }]}>{t('recipient', { defaultValue: 'Recipient' })}</Text>
                            <Text style={[styles.detailVal, isRTL && { textAlign: 'left' }]}>{form?.name || '—'}</Text>
                        </View>
                        <View style={[styles.detailLine, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.detailKey, isRTL && { textAlign: 'left' }]}>{t('message', { defaultValue: 'Message' })}</Text>
                            <Text style={[styles.detailVal, isRTL && { textAlign: 'left' }]} numberOfLines={2}>
                                {form?.message || '—'}
                            </Text>
                        </View>
                        <View style={[styles.detailLine, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.detailKey, isRTL && { textAlign: 'left' }]}>{t('contact', { defaultValue: 'Email / Phone' })}</Text>
                            <Text style={[styles.detailVal, isRTL && { textAlign: 'left' }]}>{form?.contact || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* Terms */}
                <View style={[styles.termsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={styles.termsText}>{t('terms', { defaultValue: 'Terms & Conditions' })}</Text>
                    <TouchableOpacity
                        style={[styles.viewTermsBtn, isRTL && { flexDirection: 'row-reverse' }]}
                        onPress={() =>
                            Alert.alert(
                                t('terms', { defaultValue: 'Terms & Conditions' }),
                                t('viewTermsFullMsg', { defaultValue: 'Show full terms here.' })
                            )
                        }
                    >
                        <Text style={[styles.viewTermsText, isRTL ? { marginLeft: 4 } : { marginRight: 4 }]}>
                            {t('viewTerms', { defaultValue: 'View full terms' })}
                        </Text>
                        <Icon name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Payment Methods */}
                <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('paymentMethod', { defaultValue: 'Payment Method' })}</Text>
                <View style={styles.pmWrap}>
                    {[
                        { key: 'apple', label: 'Apple Pay', icon: 'smartphone', onPress: () => payWith(Platform.OS === 'ios' ? 'Apple Pay' : 'Apple Pay (simulated)') },
                        { key: 'google', label: 'Google Pay', icon: 'smartphone', onPress: () => payWith('Google Pay') },
                        { key: 'wallet', label: t('providers.wallet', { defaultValue: 'UPI / Wallet' }), icon: 'credit-card', onPress: () => payWith(t('providers.wallet', { defaultValue: 'UPI / Wallet' })) },
                    ].map((b) => (
                        <TouchableOpacity key={b.key} style={styles.pmBtn} onPress={b.onPress} activeOpacity={0.9}>
                            <Icon name={b.icon} size={14} color="#0f1114" />
                            <Text style={styles.pmBtnText}>{t(`providers.${b.key}`, { defaultValue: b.label })}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Card form */}
                <View style={[styles.formRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.inputWrap, { flex: 1.1 }]}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('cardForm.number', { defaultValue: 'Card Number' })}</Text>
                        <TextInput
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            keyboardType="number-pad"
                            placeholder={t('cardForm.ph.number', { defaultValue: '1234 5678 9012 3456' })}
                            placeholderTextColor="#7f858e"
                            style={styles.input}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                    </View>
                    <View style={[styles.inputWrap, { flex: 0.9 }]}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('cardForm.expiry', { defaultValue: 'Expiry (MM/YY)' })}</Text>
                        <TextInput
                            value={expiry}
                            onChangeText={setExpiry}
                            keyboardType="number-pad"
                            placeholder={t('cardForm.ph.expiry', { defaultValue: '08/28' })}
                            placeholderTextColor="#7f858e"
                            style={styles.input}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                    </View>
                </View>

                <View style={[styles.formRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.inputWrap, { flex: 0.9 }]}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('cardForm.cvv', { defaultValue: 'CVV' })}</Text>
                        <TextInput
                            value={cvv}
                            onChangeText={setCvv}
                            keyboardType="number-pad"
                            placeholder={t('cardForm.ph.cvv', { defaultValue: '***' })}
                            placeholderTextColor="#7f858e"
                            style={styles.input}
                            secureTextEntry
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                    </View>
                    <View style={[styles.inputWrap, { flex: 1.1 }]}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('cardForm.name', { defaultValue: 'Name on Card' })}</Text>
                        <TextInput
                            value={nameOnCard}
                            onChangeText={setNameOnCard}
                            placeholder={t('cardForm.ph.name', { defaultValue: 'Full name' })}
                            placeholderTextColor="#7f858e"
                            style={styles.input}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                    </View>
                </View>

                {/* Actions */}
                <View style={[styles.actionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity style={styles.btnGhost} onPress={goBack} activeOpacity={0.85}>
                        <Text style={styles.btnGhostText}>{t('actions.edit', { defaultValue: 'Edit Details' })}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnPrimary} onPress={completePurchase} activeOpacity={0.9}>
                        <Text style={styles.btnPrimaryText}>{t('actions.complete', { defaultValue: 'Complete Purchase' })}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.page },

    /* Header: three slots (side/center/side) to keep title centered; flips with row-reverse in RTL */
    header: {
        height: 50,
        backgroundColor: COLORS.header,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    side: { width: 40, alignItems: 'center', justifyContent: 'center' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    backBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },

    /* Body */
    body: { padding: 14 },

    previewRow: { gap: 12, marginBottom: 12 },

    cardImage: {
        width: '100%',
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 6,
    },
    cardTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800' },

    detailsCol: {
        flex: 1,
        backgroundColor: COLORS.panel,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    detailsHeading: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 6 },
    detailLine: { flexDirection: 'row', marginBottom: 6 },
    detailKey: { color: COLORS.sub, fontSize: 12, width: 110 },
    detailVal: { color: COLORS.text, fontSize: 13, flex: 1, fontWeight: '700' },

    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 10,
        marginTop: 8,
        marginBottom: 10,
    },
    termsText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
    viewTermsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.panel,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    viewTermsText: { color: COLORS.text, fontSize: 12 },

    sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 8 },

    /* Payment methods */
    pmWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
    },
    pmBtn: {
        flexGrow: 1,
        flexBasis: '32%',
        height: 42,
        borderRadius: 10,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        columnGap: 6,
    },
    pmBtnText: { color: COLORS.isDark ? '#0f1114' : '#FFFFFF', fontWeight: '900', fontSize: 13 },

    /* Form */
    formRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    inputWrap: {},
    label: { color: COLORS.sub, fontSize: 12, marginBottom: 6 },
    input: {
        height: SIZES.fieldH,
        borderRadius: SIZES.radius,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        backgroundColor: COLORS.isDark ? '#0d0f12' : COLORS.panel,
        fontSize: 13,
    },

    /* Actions */
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    btnGhost: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    btnGhostText: { color: COLORS.accent, fontWeight: '900', fontSize: 13 },
    btnPrimary: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accentDark,
    },
    btnPrimaryText: { color: COLORS.isDark ? '#0f1114' : '#FFFFFF', fontWeight: '900', fontSize: 13 },
});
