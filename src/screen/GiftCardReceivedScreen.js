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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { giftCardAPI, getUserId } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect } from '@react-navigation/native';

export default function GiftCardReceivedScreen({ navigation }) {
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
            const userId = await getUserId();
            if (!userId) {
                setLoading(false);
                return;
            }

            const response = await giftCardAPI.getReceivedGiftCards({
                user_id: userId,
            });
            
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
        const imageUri = item.image || (item.gift_card?.image || null);
        const fullImageUri = imageUri && !imageUri.startsWith('http') 
            ? `https://proteinbros.in/assets/images/giftcards/${imageUri}`
            : imageUri;

        return (
            <TouchableOpacity
                style={[styles.card, isRTL && { flexDirection: 'row-reverse' }]}
                activeOpacity={0.9}
                onPress={() => copyCode(item.code)}
            >
                <View style={styles.cardImageContainer}>
                    {fullImageUri ? (
                        <Image source={{ uri: fullImageUri }} style={styles.cardImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.cardImagePlaceholder}>
                            <Icon name="gift" size={40} color={COLORS.sub} />
                        </View>
                    )}
                    {isRedeemed && (
                        <View style={styles.redeemedBadge}>
                            <Icon name="check-circle" size={16} color={COLORS.success} />
                            <Text style={styles.redeemedText}>Redeemed</Text>
                        </View>
                    )}
                    {isExpired && !isRedeemed && (
                        <View style={styles.expiredBadge}>
                            <Icon name="clock" size={16} color={COLORS.danger} />
                            <Text style={styles.expiredText}>Expired</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.gift_card?.title || item.title || 'Gift Card'}
                    </Text>
                    
                    {item.sender_name && (
                        <Text style={styles.senderText} numberOfLines={1}>
                            From: {item.sender_name}
                        </Text>
                    )}

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Amount:</Text>
                        <Text style={styles.amountValue}>
                            BHD {parseFloat(item.value || item.remaining_value || 0).toFixed(3)}
                        </Text>
                    </View>

                    <View style={styles.codeRow}>
                        <Text style={styles.codeLabel}>Code:</Text>
                        <Text style={styles.codeText} numberOfLines={1}>{item.code}</Text>
                        <TouchableOpacity
                            onPress={() => copyCode(item.code)}
                            style={styles.copyBtn}
                        >
                            <Icon name="copy" size={16} color={COLORS.accent} />
                        </TouchableOpacity>
                    </View>

                    {item.message && (
                        <Text style={styles.messageText} numberOfLines={2}>
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
                            activeOpacity={0.9}
                        >
                            <Icon name="credit-card" size={16} color="#fff" />
                            <Text style={styles.redeemBtnText}>Redeem in Wallet</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [COLORS, isRTL, navigation]);

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
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.panel,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardImageContainer: {
        width: 120,
        height: 160,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.page,
        alignItems: 'center',
        justifyContent: 'center',
    },
    redeemedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(109, 211, 109, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    redeemedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    expiredBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expiredText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    cardTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    senderText: {
        color: COLORS.sub,
        fontSize: 12,
        marginBottom: 8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    amountLabel: {
        color: COLORS.sub,
        fontSize: 12,
        marginRight: 8,
    },
    amountValue: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '800',
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: COLORS.page,
        padding: 8,
        borderRadius: 8,
    },
    codeLabel: {
        color: COLORS.sub,
        fontSize: 12,
        marginRight: 8,
    },
    codeText: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'monospace',
        letterSpacing: 1,
    },
    copyBtn: {
        padding: 4,
    },
    messageText: {
        color: COLORS.sub,
        fontSize: 12,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    expiresText: {
        color: COLORS.sub,
        fontSize: 11,
        marginBottom: 8,
    },
    redeemBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accentDark,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 8,
        marginTop: 8,
    },
    redeemBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
});

