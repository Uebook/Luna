// src/screen/GiftCardReceivedScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    RefreshControl,
    ActivityIndicator,
    I18nManager,
    useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { apiHelpers } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect } from '@react-navigation/native';

const CARD_W = 260;
const CARD_H = 160;

export default function GiftCardReceivedScreen({ navigation }) {
    useWindowDimensions();
    const { t } = useTranslation('giftcard');
    const isRTL = I18nManager.isRTL || i18n?.dir?.() === 'rtl';
    const { theme, isDark } = useTheme();
    const COLORS = useMemo(() => ({
        page: theme.giftCardPage || theme.page,
        header: theme.giftCardHeader || theme.header,
        panel: theme.giftCardPanel || theme.panel,
        border: theme.giftCardBorder || theme.border,
        text: theme.giftCardText || theme.text,
        sub: theme.giftCardSub || theme.sub,
        accent: theme.giftCardAccent || theme.accent,
        accentDark: theme.giftCardAccentDark || theme.accentDark,
        success: theme.success,
        danger: theme.danger,
        isDark,
    }), [theme, isDark]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [receivedGifts, setReceivedGifts] = useState([]);

    const fetchReceivedGifts = useCallback(async () => {
        try {
            const userData = await AsyncStorage.getItem('luna_user');
            if (!userData) {
                setLoading(false);
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.user?.id || user.id;

            if (!userId) {
                setLoading(false);
                return;
            }

            const response = await apiHelpers.getReceivedGiftCards(userId);
            
            if (response.data.status && response.data.data) {
                setReceivedGifts(response.data.data);
            } else {
                setReceivedGifts([]);
            }
        } catch (error) {
            console.log('Error fetching received gift cards:', error);
            Alert.alert('Error', 'Failed to load received gift cards');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchReceivedGifts();
        }, [fetchReceivedGifts])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReceivedGifts();
    }, [fetchReceivedGifts]);

    const copyCode = (code) => {
        Clipboard.setString(code);
        Alert.alert('Copied', 'Gift card code copied to clipboard');
    };

    const redeemInWallet = async (code) => {
        try {
            const userData = await AsyncStorage.getItem('luna_user');
            if (!userData) {
                Alert.alert('Error', 'Please login');
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.user?.id || user.id;

            // Navigate to wallet with pre-filled code
            navigation.navigate('WalletScreen', { redeemCode: code });
        } catch (error) {
            Alert.alert('Error', 'Failed to open wallet');
        }
    };

    const renderGiftCard = useCallback(({ item }) => {
        const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
        const isRedeemed = item.status === 'used' || item.redeemed_at;
        // Get image from gift_card object first (template image), then fallback to item.image
        const imageUri = item.gift_card?.image || item.image || null;
        // Process image URL - if it's already a full URL, use it; otherwise construct full URL
        let fullImageUri = imageUri;
        if (imageUri && !imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
            // Relative path, make it absolute
            if (imageUri.startsWith('/')) {
                fullImageUri = `https://proteinbros.in${imageUri}`;
            } else {
                fullImageUri = `https://proteinbros.in/assets/images/giftcards/${imageUri}`;
            }
        }

        const amountValue = parseFloat(item.value || item.remaining_value || 0).toFixed(3);
        const amountText = `BHD ${amountValue}`;

        return (
            <View style={styles.cardContainer}>
                {/* Glowing card preview - same as GiftCardSuccess */}
                <View style={styles.cardStage}>
                    <View style={styles.cardGlow} />
                    <View style={styles.sparkleDots} />
                    <View style={styles.cardShadow} />
                    <View style={styles.cardWrap}>
                        {fullImageUri ? (
                            <Image 
                                source={{ uri: fullImageUri }} 
                                style={styles.cardImg} 
                                resizeMode="cover"
                                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                            />
                        ) : (
                            <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
                                <Icon name="gift" size={40} color={COLORS.accent} />
                            </View>
                        )}
                        <View style={styles.cardOverlay} />

                        {/* Brand & Amount on card - same positioning as success screen */}
                        <Text style={[styles.cardBrand, isRTL ? { right: 14 } : { left: 14 }]}>
                            {item.gift_card?.title || item.title || 'Luna'}
                        </Text>
                        <Text style={[styles.cardAmount, isRTL ? { left: 14 } : { right: 14 }]}>
                            {amountText}
                        </Text>
                    </View>
                </View>

                {/* Status badges - positioned below card */}
                {(isRedeemed || isExpired) && (
                    <View style={styles.statusBadgeContainer}>
                        {isRedeemed && (
                            <View style={styles.statusBadge}>
                                <Icon name="check-circle" size={16} color={COLORS.success} />
                                <Text style={styles.statusBadgeText}>Redeemed</Text>
                            </View>
                        )}
                        {isExpired && !isRedeemed && (
                            <View style={[styles.statusBadge, styles.expiredStatusBadge]}>
                                <Icon name="clock" size={16} color={COLORS.danger} />
                                <Text style={[styles.statusBadgeText, styles.expiredStatusBadgeText]}>Expired</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Card details */}
                <View style={styles.cardDetails}>
                    {item.sender_name && (
                        <Text style={styles.senderText} numberOfLines={1}>
                            From: {item.sender_name}
                        </Text>
                    )}

                    {/* Gift Card Code - same style as success screen */}
                    {item.code && (
                        <View style={styles.codeContainer}>
                            <Text style={[styles.codeLabel, isRTL && { textAlign: 'right' }]}>
                                Gift Card Code
                            </Text>
                            <View style={[styles.codeBox, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={styles.codeText}>{item.code}</Text>
                                <TouchableOpacity
                                    onPress={() => copyCode(item.code)}
                                    style={styles.copyBtn}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="copy" size={18} color={COLORS.accent} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {item.message && (
                        <Text style={styles.messageText} numberOfLines={3}>
                            "{item.message}"
                        </Text>
                    )}

                    {item.expires_at && (
                        <Text style={styles.expiresText}>
                            Expires: {new Date(item.expires_at).toLocaleDateString()}
                        </Text>
                    )}

                    {!isRedeemed && !isExpired && (
                        <TouchableOpacity
                            style={styles.redeemBtn}
                            onPress={() => redeemInWallet(item.code)}
                            activeOpacity={0.85}
                        >
                            <Icon name="credit-card" size={18} color="#fff" />
                            <Text style={styles.redeemBtnText}>Redeem in Wallet</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }, [COLORS, isRTL, navigation, copyCode, redeemInWallet]);

    const styles = useMemo(() => createStyles(COLORS), [COLORS]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                <StandardHeader title={t('receivedGifts', { defaultValue: 'Received Gift Cards' })} navigation={navigation} showGradient={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            <StandardHeader 
                title={t('receivedGifts', { defaultValue: 'Received Gift Cards' })} 
                navigation={navigation} 
                showGradient={true} 
            />

            {receivedGifts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="gift" size={64} color={COLORS.sub} />
                    <Text style={styles.emptyText}>
                        {t('noReceivedGifts', { defaultValue: 'No gift cards received yet' })}
                    </Text>
                    <Text style={styles.emptySubText}>
                        {t('noReceivedGiftsSub', { defaultValue: 'Gift cards sent to you will appear here' })}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={receivedGifts}
                    keyExtractor={(item) => item.id?.toString() || item.code}
                    renderItem={renderGiftCard}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.page },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubText: {
        color: COLORS.sub,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    listContent: {
        padding: 18,
    },
    cardContainer: {
        backgroundColor: COLORS.panel,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    // Card stage - same as GiftCardSuccess
    cardStage: {
        alignItems: 'center',
        marginVertical: 8,
        marginBottom: 16,
        width: '100%',
    },
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
    cardImg: {
        width: '100%',
        height: '100%',
        backgroundColor: '#111315',
    },
    cardImgPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111315',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(230,204,143,0.35)',
        borderRadius: 16,
    },
    cardBrand: {
        position: 'absolute',
        bottom: 14,
        color: COLORS.accent,
        fontSize: 16,
        fontWeight: '800',
    },
    cardAmount: {
        position: 'absolute',
        bottom: 14,
        color: COLORS.accent,
        fontSize: 16,
        fontWeight: '800',
    },
    statusBadgeContainer: {
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(109, 211, 109, 0.12)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(109, 211, 109, 0.25)',
        gap: 8,
    },
    expiredStatusBadge: {
        backgroundColor: 'rgba(255, 59, 48, 0.12)',
        borderColor: 'rgba(255, 59, 48, 0.25)',
    },
    statusBadgeText: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    expiredStatusBadgeText: {
        color: COLORS.danger,
    },
    cardDetails: {
        paddingTop: 4,
    },
    senderText: {
        color: COLORS.sub,
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    // Code container - same style as GiftCardSuccess
    codeContainer: {
        marginTop: 4,
        marginBottom: 16,
    },
    codeLabel: {
        color: COLORS.sub,
        fontSize: 13,
        marginBottom: 10,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.page,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        paddingHorizontal: 18,
        paddingVertical: 14,
        justifyContent: 'space-between',
    },
    codeText: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 2.5,
        fontFamily: 'monospace',
        flex: 1,
    },
    copyBtn: {
        padding: 6,
        marginLeft: 8,
    },
    messageText: {
        color: COLORS.sub,
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 8,
    },
    expiresText: {
        color: COLORS.sub,
        fontSize: 12,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    redeemBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accentDark,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        gap: 10,
        marginTop: 4,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    redeemBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
});

