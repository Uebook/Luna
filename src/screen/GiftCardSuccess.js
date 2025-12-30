// src/screens/GiftCardSuccess.js
import React, { useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Share,
    Alert,
    useWindowDimensions,
    I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';

const CARD_W = 260;
const CARD_H = 160;

export default function GiftCardSuccess({ route, navigation }) {
    useWindowDimensions();
    const { t } = useTranslation('giftcardSuccess');

    // Use RN's global RTL flag as the source of truth, with i18n as fallback
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
        success: theme.success,
        isDark,
    };

    const {
        selectedCard = {},
        form = {},
        amount = 0,
        orderId,
        currency: currencyFromRoute,
    } = route?.params || {};

    const currency = currencyFromRoute || t('currency', { defaultValue: 'BHD' });

    const amountText = (() => {
        const val = Number(amount || form?.amount || 0);
        try {
            return new Intl.NumberFormat(i18n.language || 'en', {
                style: 'currency',
                currency,
            }).format(val);
        } catch {
            return `${val.toFixed(2)} ${currency}`;
        }
    })();

    const back = () => navigation?.goBack?.();

    const shareIt = async () => {
        try {
            await Share.share({
                message: t('shareMessage', {
                    defaultValue: 'Luna Gift Card sent to {{name}} for {{amount}}.',
                    name: form?.name || t('recipientFallback', { defaultValue: 'recipient' }),
                    amount: amountText,
                }),
            });
        } catch { }
    };

    const openReceipt = () => {
        Alert.alert(
            t('receiptTitle', { defaultValue: 'Receipt' }),
            t('receiptBody', {
                defaultValue: 'Order {{orderId}}\nAmount: {{amount}}',
                orderId: orderId || '#123456',
                amount: amountText,
            }),
        );
    };

    const sendAnother = () =>
        navigation?.goBack?.(2) || navigation?.navigate?.('GiftCardTemplatePicker');

    const styles = useMemo(() => createStyles(COLORS), [COLORS]);

    return (
        <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* Header (absolute back button so it ALWAYS flips sides) */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={back}
                    style={[styles.backBtnAbs, isRTL ? styles.backBtnRTL : styles.backBtnLTR]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name={isRTL ? 'arrow-right' : 'arrow-left'} size={18} color={COLORS.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {t('title', { defaultValue: 'Gift Card Sent' })}
                </Text>
            </View>

            <View style={styles.body}>
                {/* Brand */}
                <View style={styles.brandWrap}>
                    <View style={styles.brandCircle}>
                        <Icon name="moon" size={26} color={COLORS.accent} />
                    </View>
                    <Text style={styles.brandText}>{t('brand', { defaultValue: 'Luna Boutique' })}</Text>
                </View>

                {/* Headline */}
                <Text style={styles.title}>{t('headline', { defaultValue: 'Gift Card Sent!' })}</Text>
                <Text style={styles.subtitle}>
                    {t('subtitle', {
                        defaultValue: 'Congratulations! Your gift card has been successfully delivered.',
                    })}
                </Text>

                {/* Glowing card preview */}
                <View style={styles.cardStage}>
                    <View style={styles.cardGlow} />
                    <View style={styles.sparkleDots} />
                    <View style={styles.cardShadow} />
                    <View style={styles.cardWrap}>
                        {!!selectedCard?.image ? (
                            <Image source={{ uri: selectedCard.image }} style={styles.cardImg} />
                        ) : (
                            <View style={[styles.cardImg, { alignItems: 'center', justifyContent: 'center' }]}>
                                <Icon name="gift" size={28} color={COLORS.accent} />
                            </View>
                        )}
                        <View style={styles.cardOverlay} />

                        {/* Brand & Amount swap sides in RTL */}
                        <Text style={[styles.cardBrand, isRTL ? { right: 14 } : { left: 14 }]}>
                            {t('brandShort', { defaultValue: 'Luna' })}
                        </Text>
                        <Text style={[styles.cardAmount, isRTL ? { left: 14 } : { right: 14 }]}>
                            {amountText}
                        </Text>
                    </View>
                </View>

                {/* Status */}
                <View style={[styles.statusRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View
                        style={[
                            styles.statusBadge,
                            isRTL ? { marginLeft: 10, marginRight: 0 } : { marginRight: 10 },
                        ]}
                    >
                        <Icon name="check-circle" size={18} color={COLORS.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.statusTitle, isRTL && { textAlign: 'right' }]}>
                            {t('status.label', { defaultValue: 'Delivery Status: Confirmed' })}
                        </Text>
                        <TouchableOpacity
                            onPress={() =>
                                Alert.alert(
                                    t('trackTitle', { defaultValue: 'Track' }),
                                    t('trackMsg', { defaultValue: 'Open your tracking view.' }),
                                )
                            }
                        >
                            <Text style={[styles.statusLink, isRTL && { textAlign: 'right' }]}>
                                {t('status.track', { defaultValue: 'Track Delivery' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Actions */}
                <View style={[styles.actionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity style={styles.actionBtn} onPress={shareIt} activeOpacity={0.85}>
                        <Icon name="share-2" size={14} color={COLORS.text} />
                        <Text style={styles.actionText}>{t('actions.share', { defaultValue: 'Share' })}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={openReceipt} activeOpacity={0.85}>
                        <Icon name="file-text" size={14} color={COLORS.text} />
                        <Text style={styles.actionText}>
                            {t('actions.receipt', { defaultValue: 'Receipt' })}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={sendAnother} activeOpacity={0.85}>
                        <Icon name="send" size={14} color={COLORS.text} />
                        <Text style={styles.actionText}>
                            {t('actions.sendAnother', { defaultValue: 'Send Another' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom nav stub */}
            {/* <View style={[styles.bottomNavStub, isRTL && { flexDirection: 'row-reverse' }]}>
                <Icon name="home" size={16} color={COLORS.sub} />
                <Icon name="shopping-bag" size={16} color={COLORS.sub} />
                <Icon name="gift" size={16} color={COLORS.accent} />
                <Icon name="user" size={16} color={COLORS.sub} />
            </View> */}
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.page },

    /* Header with absolute back button and centered title */
    header: {
        height: 48,
        paddingHorizontal: 14,
        backgroundColor: COLORS.header,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnAbs: {
        position: 'absolute',
        top: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnLTR: { left: 14 },
    backBtnRTL: { right: 14 },
    headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },

    body: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },

    brandWrap: { alignItems: 'center', marginBottom: 8 },
    brandCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 1,
        borderColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.isDark ? '#101214' : COLORS.panel,
    },
    brandText: { marginTop: 6, color: COLORS.text, fontWeight: '800', letterSpacing: 0.3 },

    title: { color: COLORS.accent, fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 6 },
    subtitle: { color: COLORS.sub, fontSize: 13, textAlign: 'center', marginTop: 6 },

    cardStage: { alignItems: 'center', marginVertical: 18, width: '100%' },
    cardGlow: {
        position: 'absolute',
        top: 18,
        width: CARD_W * 1.25,
        height: CARD_H * 0.9,
        borderRadius: 20,
        backgroundColor: COLORS.accent,
        opacity: 0.08,
    },
    sparkleDots: {
        position: 'absolute',
        width: CARD_W * 1.1,
        height: CARD_H * 1.1,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(230,204,143,0.12)',
    },
    cardShadow: {
        position: 'absolute',
        top: CARD_H + 20,
        width: CARD_W * 0.9,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000',
        opacity: 0.35,
    },
    cardWrap: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.accent,
        backgroundColor: '#111315',
    },
    cardImg: { width: '100%', height: '100%' },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(230,204,143,0.35)',
        borderRadius: 16,
    },
    cardBrand: { position: 'absolute', bottom: 12, color: COLORS.accent, fontSize: 16, fontWeight: '800' },
    cardAmount: { position: 'absolute', bottom: 12, color: COLORS.accent, fontSize: 16, fontWeight: '800' },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: COLORS.panel,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f1510',
        borderWidth: 1,
        borderColor: 'rgba(109,211,109,0.25)',
    },
    statusTitle: { color: COLORS.text, fontWeight: '800', fontSize: 14 },
    statusLink: { color: COLORS.accent, fontSize: 12, marginTop: 2 },

    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 10 },
    actionBtn: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        columnGap: 6,
        backgroundColor: COLORS.isDark ? '#121416' : COLORS.panel,
    },
    actionText: { color: COLORS.text, fontWeight: '800', fontSize: 13 },

    bottomNavStub: {
        height: 54,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.header,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});
