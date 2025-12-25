import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';

const fmtDate = (isoish) => {
    if (!isoish) return '';
    try {
        const d = new Date(isoish);
        return new Intl.DateTimeFormat(i18n.language || 'en', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        }).format(d);
    } catch {
        return String(isoish);
    }
};

const fmtMoney = (n) => {
    try {
        return new Intl.NumberFormat(i18n.language || 'en', {
            style: 'currency',
            currency: 'BHD',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(Number(n));
    } catch {
        return `${Number(n).toFixed(3)} BHD`;
    }
};

export default function ReceivedGiftScreen({ navigation }) {
    const { theme } = useTheme();
    const COLORS = {
        bg: theme.bg,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        card: theme.card,
        brand: theme.p1,
        success: theme.success,
        muted: theme.muted,
    };
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);
    const { t } = useTranslation('wallet');
    const isRTL = i18n?.dir?.() === 'rtl';

    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Load user ID
    useEffect(() => {
        const loadUserId = async () => {
            try {
                const userData = await AsyncStorage.getItem('luna_user');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    const user = parsed.user || parsed.data || parsed;
                    const id = user.id || parsed.id;
                    setUserId(id);
                }
            } catch (error) {
                console.log('Error loading user ID:', error);
                setLoading(false);
            }
        };
        loadUserId();
    }, []);

    // Fetch received gifts
    const fetchReceivedGifts = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const response = await api.post('/wallet/received-gifts', { user_id: userId });

            if (response.data.status && response.data.data) {
                setGifts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching received gifts:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchReceivedGifts();
    }, [fetchReceivedGifts]);

    const GiftCard = ({ item }) => {
        const pointsValue = (item.points || 0) * 0.01; // Assuming 1 point = 0.01 BHD
        return (
            <View style={styles.giftCard}>
                <View style={styles.giftHeader}>
                    <View style={styles.giftIcon}>
                        <Feather name="gift" size={24} color={COLORS.brand} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.giftPoints}>
                            +{item.points} {t('ptsShort', 'pts')}
                        </Text>
                        <Text style={styles.giftValue}>
                            {fmtMoney(pointsValue)}
                        </Text>
                    </View>
                </View>
                {item.message && (
                    <Text style={styles.giftMessage}>{item.message}</Text>
                )}
                <View style={styles.giftFooter}>
                    <View>
                        <Text style={styles.giftLabel}>{t('fromX', 'From")}</Text>
                        <Text style={styles.giftFrom}>{item.from || item.recipient || 'Unknown'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.giftLabel}>{t('dateOn', 'on')}</Text>
                        <Text style={styles.giftDate}>
                            {fmtDate(item.redeemed_at || item.created_at)}
                        </Text>
                    </View>
                </View>
                {item.code && (
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>Code:</Text>
                        <Text style={styles.codeValue}>{item.code}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StandardHeader
                title={t('giftReceived', 'Received Gifts')}
                navigation={navigation}
                showGradient={true}
            />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.brand} />
                </View>
            ) : (
                <FlatList
                    data={gifts}
                    keyExtractor={(item) => item.id?.toString() || `gift-${item.code}`}
                    renderItem={({ item }) => <GiftCard item={item} />}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="gift" size={64} color={COLORS.muted} />
                            <Text style={styles.emptyText}>
                                {t('noReceivedGifts', 'No received gifts yet')}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    giftCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.line,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
            },
            android: { elevation: 2 },
        }),
    },
    giftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    giftIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.brand + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    giftPoints: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.brand,
    },
    giftValue: {
        fontSize: 14,
        color: COLORS.sub,
        marginTop: 2,
    },
    giftMessage: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    giftFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.line,
    },
    giftLabel: {
        fontSize: 11,
        color: COLORS.sub,
        marginBottom: 4,
    },
    giftFrom: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
    giftDate: {
        fontSize: 13,
        color: COLORS.sub,
    },
    codeContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.line,
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeLabel: {
        fontSize: 12,
        color: COLORS.sub,
        marginRight: 8,
    },
    codeValue: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.brand,
        fontFamily: 'monospace',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.sub,
        marginTop: 16,
    },
});

