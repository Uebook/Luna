import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
    I18nManager,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ----------------- Currency & ratio (BHD) ----------------- */
const CURRENCY = 'BHD';
const BHD_PER_POINT = 0.01; // change via remote config if needed
const SAFE_RATIO = BHD_PER_POINT > 0 ? BHD_PER_POINT : 0.01;


/* ----------------- formatters & validators ----------------- */
const fmtMoney = (n) => {
    try {
        return new Intl.NumberFormat(i18n.language || 'en', {
            style: 'currency',
            currency: CURRENCY,
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(Number(n));
    } catch {
        return `${Number(n).toFixed(3)} ${CURRENCY}`;
    }
};

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

const fmtMonthLabel = (ym) => {
    // input "YYYY-MM"
    if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return ym;
    const [y, m] = ym.split('-').map((x) => parseInt(x, 10));
    try {
        const d = new Date(y, m - 1, 1);
        return new Intl.DateTimeFormat(i18n.language || 'en', {
            year: 'numeric',
            month: 'short',
        }).format(d);
    } catch {
        return ym;
    }
};

const isEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v).trim());
const isPhone = (v) => {
    const d = String(v || '').replace(/[^\d]/g, '');
    return d.length >= 6 && d.length <= 15;
};
const isCodeFormat = (v) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(String(v).trim().toUpperCase());

export default function WalletScreen({ navigation }) {
    const { theme } = useTheme();
    const COLORS = {
        bg: theme.bg,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        card: theme.card,
        brand: theme.p1,
        brandSoft: theme.p4,
        danger: theme.danger,
        success: theme.success,
        muted: theme.muted,
    };
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);
    const { t } = useTranslation(['wallet']);
    const isRTL = i18n?.dir?.() === 'rtl';

    /* ---------- Reward state ---------- */
    const [points, setPoints] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pointsToBhdRatio, setPointsToBhdRatio] = useState(SAFE_RATIO);

    /* ---------- UI state ---------- */
    const [tab, setTab] = useState('rewards'); // 'rewards' | 'purchases'

    // send gift modal
    const [sendOpen, setSendOpen] = useState(false);
    const [toContact, setToContact] = useState('');
    const [giftPts, setGiftPts] = useState('');
    const [giftMsg, setGiftMsg] = useState('');
    const [sending, setSending] = useState(false);

    // redeem gift modal
    const [redeemOpen, setRedeemOpen] = useState(false);
    const [code, setCode] = useState('');
    const [redeeming, setRedeeming] = useState(false);

    // month filter for purchases
    const allMonths = useMemo(() => {
        const set = new Set();
        purchases.forEach((p) => set.add(p.at.slice(0, 7))); // YYYY-MM
        const arr = Array.from(set).sort().reverse();
        return ['All', ...arr];
    }, [purchases]);
    const [month, setMonth] = useState('All');

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

    // Fetch wallet data
    const fetchWalletData = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const [walletRes, transactionsRes, purchasesRes] = await Promise.all([
                api.post('/wallet/info', { user_id: userId }),
                api.post('/wallet/reward-transactions', { user_id: userId }),
                api.post('/wallet/purchase-history', { user_id: userId }),
            ]);

            if (walletRes.data.status && walletRes.data.data) {
                setPoints(walletRes.data.data.points || 0);
                setPointsToBhdRatio(walletRes.data.data.points_to_bhd_ratio || SAFE_RATIO);
            }

            if (transactionsRes.data.status && transactionsRes.data.data) {
                setTransactions(transactionsRes.data.data);
            }

            if (purchasesRes.data.status && purchasesRes.data.data) {
                setPurchases(purchasesRes.data.data);
                if (purchasesRes.data.data.length > 0) {
                    const firstMonth = purchasesRes.data.data[0].at.slice(0, 7);
                    setMonth(firstMonth);
                }
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    /* ---------- derived ---------- */
    const fiatValue = useMemo(() => (points * pointsToBhdRatio).toFixed(3), [points, pointsToBhdRatio]);

    const filteredPurchases = useMemo(() => {
        if (month === 'All') return purchases;
        return purchases.filter((p) => p.at.startsWith(month));
    }, [purchases, month]);

    const totalSpent = useMemo(
        () =>
            filteredPurchases
                .filter((p) => p.status !== 'refunded')
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(3),
        [filteredPurchases]
    );

    /* ---------- helpers ---------- */
    const pointsPreviewMoney = (() => {
        const p = parseInt(giftPts || '0', 10);
        if (!p || p <= 0) return null;
        return (p * SAFE_RATIO).toFixed(3);
    })();

    /* ---------- send gift: validation + confirm + secure code ---------- */
    const confirmAndSendGift = () => {
        const p = parseInt(giftPts || '0', 10);
        const rcpt = toContact.trim();

        if (!p || p <= 0) return Alert.alert(t('wallet:invalidPoints'));
        if (p > points) return Alert.alert(t('wallet:insufficientPoints'));
        if (!rcpt) return Alert.alert(t('wallet:enterRecipient'));
        if (!isEmail(rcpt) && !isPhone(rcpt)) return Alert.alert(t('wallet:invalidRecipient'));

        Alert.alert(
            t('wallet:confirmSendTitle'),
            t('wallet:confirmSendBody', { pts: p, fiat: fmtMoney(p * SAFE_RATIO), to: rcpt }),
            [
                { text: t('wallet:cancel'), style: 'cancel' },
                {
                    text: t('wallet:confirm'),
                    style: 'default',
                    onPress: performSendGift,
                },
            ]
        );
    };

    const performSendGift = async () => {
        const p = parseInt(giftPts || '0', 10);
        const rcpt = toContact.trim();
        if (!p || p <= 0 || p > points || !rcpt || !userId) return;

        setSending(true);
        try {
            const response = await api.post('/wallet/send-gift', {
                user_id: userId,
                points: p,
                recipient: rcpt,
                message: giftMsg.trim() || '',
            });

            if (response.data.status && response.data.data) {
                setPoints((x) => x - p);
                // Refresh transactions
                fetchWalletData();
                setSendOpen(false);
                setToContact('');
                setGiftPts('');
                setGiftMsg('');
                Alert.alert(
                    t('wallet:giftCreated'),
                    `${t('wallet:giftCreatedShare')}\n\n${response.data.data.code}`
                );
            } else {
                Alert.alert('Error', response.data.message || 'Failed to send gift');
            }
        } catch (error) {
            console.error('Error sending gift:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send gift. Please try again.');
        } finally {
            setSending(false);
        }
    };

    /* ---------- redeem gift: validate format + reuse + expiry + live update ---------- */
    const onRedeemGift = async () => {
        const c = code.trim().toUpperCase();
        if (!c) return Alert.alert(t('wallet:enterGiftCode'));
        if (!isCodeFormat(c)) return Alert.alert(t('wallet:invalidCodeFormat'));
        if (!userId) return;

        setRedeeming(true);
        try {
            const response = await api.post('/wallet/redeem-gift', {
                user_id: userId,
                code: c,
            });

            if (response.data.status && response.data.data) {
                // Refresh wallet data
                await fetchWalletData();
                setRedeemOpen(false);
                setCode('');
                Alert.alert(t('wallet:redeemSuccessTitle'), t('wallet:redeemSuccessBody'));
            } else {
                Alert.alert('Error', response.data.message || 'Failed to redeem gift code');
            }
        } catch (error) {
            console.error('Error redeeming gift:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to redeem gift code. Please try again.');
        } finally {
            setRedeeming(false);
        }
    };

    /* ---------- small components ---------- */
    const BalanceCard = () => (
        <View style={styles.balanceCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.balanceLabel}>{t('wallet:rewardPoints')}</Text>
                <Text style={styles.balanceValue}>{points}</Text>
                <Text style={styles.balanceSub}>
                    {t('wallet:fiatEquivalent', { value: fmtMoney(fiatValue) })}
                    {BHD_PER_POINT <= 0 && (
                        <Text style={{ color: COLORS.danger }}> • {t('wallet:ratioFallback')}</Text>
                    )}
                </Text>
            </View>
            <View style={styles.actionCol}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setSendOpen(true)}>
                    <Feather name="gift" color={COLORS.brand} size={16} />
                    <Text style={styles.secondaryTxt}>{t('wallet:sendGift')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setRedeemOpen(true)}>
                    <Feather name="codesandbox" color={COLORS.brand} size={16} />
                    <Text style={styles.secondaryTxt}>{t('wallet:redeemGift')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.secondaryBtn} 
                    onPress={() => navigation.navigate('ReceivedGiftScreen')}
                >
                    <Feather name="inbox" color={COLORS.brand} size={16} />
                    <Text style={styles.secondaryTxt}>{t('wallet:receivedGifts') || 'Received Gifts'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const TxnRow = ({ item }) => {
        const isIn = item.points > 0;
        const kind = item.type === 'gift_sent' ? t('wallet:giftSent') : t('wallet:giftReceived');
        return (
            <View style={styles.row}>
                <Feather
                    name={isIn ? 'arrow-down' : 'arrow-up'}
                    size={16}
                    color={COLORS.text}
                    style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{kind}</Text>
                    <Text style={styles.rowNote}>
                        {item.type === 'gift_sent'
                            ? t('wallet:toX', { x: item.note })
                            : t('wallet:fromX', { x: item.note })}{' '}
                        • {t('wallet:dateOn', { date: fmtDate(item.at) })}
                    </Text>
                </View>
                <Text
                    style={[
                        styles.rowPts,
                        { color: isIn ? COLORS.success : COLORS.danger },
                    ]}
                >
                    {isIn ? '+' : ''}
                    {item.points} {t('wallet:ptsShort')}
                </Text>
            </View>
        );
    };

    const PurchaseRow = ({ item }) => (
        <View style={styles.row}>
            <Feather name="shopping-bag" size={16} color={COLORS.text} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowNote}>
                    {t('wallet:orderNo')} {item.orderNo} • {fmtDate(item.at)}
                </Text>
            </View>
            <Text
                style={[
                    styles.rowPts,
                    { color: item.status === 'refunded' ? COLORS.muted : COLORS.text },
                ]}
            >
                {item.status === 'refunded'
                    ? `- ${fmtMoney(item.amount)}`
                    : fmtMoney(item.amount)}
            </Text>
        </View>
    );

    /* ---------- render ---------- */
    if (loading && points === 0 && transactions.length === 0 && purchases.length === 0) {
        return (
            <SafeAreaView style={styles.safe}>
                <StandardHeader title={t('wallet:title')} navigation={navigation} showGradient={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.brand} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StandardHeader title={t('wallet:title')} navigation={navigation} showGradient={true} />

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                <BalanceCard />

                {/* Tabs */}
                <View style={styles.tabRow}>
                    {[
                        { key: 'rewards', label: t('wallet:tabRewards') },
                        { key: 'purchases', label: t('wallet:tabPurchases') },
                    ].map(({ key, label }) => {
                        const active = tab === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => setTab(key)}
                                style={[styles.tabBtn, active && styles.tabBtnActive]}
                            >
                                <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Rewards tab */}
                {tab === 'rewards' && (
                    <FlatList
                        data={transactions}
                        keyExtractor={(it) => it.id}
                        renderItem={({ item }) => <TxnRow item={item} />}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6 }}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', color: COLORS.sub, paddingVertical: 16 }}>
                                {t('wallet:noTransactions')}
                            </Text>
                        }
                    />
                )}

                {/* Purchases tab */}
                {tab === 'purchases' && (
                    <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
                        {/* Month filter */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterRow}
                            style={isRTL ? { transform: [{ scaleX: -1 }] } : null}
                        >
                            {allMonths.map((m) => {
                                const active = m === month;
                                const label = m === 'All' ? t('wallet:monthAll') : fmtMonthLabel(m);
                                return (
                                    <TouchableOpacity
                                        key={m}
                                        onPress={() => setMonth(m)}
                                        style={[styles.filterChip, active && styles.filterChipActive, isRTL && { transform: [{ scaleX: -1 }] }]}
                                        activeOpacity={0.9}
                                    >
                                        <Text style={[styles.filterTxt, active && styles.filterTxtActive]}>{label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Summary */}
                        <View style={styles.spendCard}>
                            <Text style={styles.spendLabel}>
                                {month === 'All'
                                    ? t('wallet:totalSpentAllTime')
                                    : t('wallet:totalSpentInMonth', { month: fmtMonthLabel(month) })}
                            </Text>
                            <Text style={styles.spendValue}>{fmtMoney(totalSpent)}</Text>
                        </View>

                        {/* List */}
                        <FlatList
                            data={filteredPurchases}
                            keyExtractor={(it) => it.id}
                            renderItem={({ item }) => <PurchaseRow item={item} />}
                            scrollEnabled={false}
                            contentContainerStyle={{ paddingTop: 8 }}
                            ListEmptyComponent={
                                <Text style={{ color: COLORS.sub, paddingVertical: 16, textAlign: 'center' }}>
                                    {t('wallet:noPurchases')}
                                </Text>
                            }
                        />
                    </View>
                )}
            </ScrollView>

            {/* Send Gift */}
            <Modal visible={sendOpen} transparent animationType="slide" onRequestClose={() => setSendOpen(false)}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        {/* Header with close */}
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{t('wallet:sendGift')}</Text>
                            <TouchableOpacity onPress={() => setSendOpen(false)} style={styles.closeBtn}>
                                <Feather name="x" size={22} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={toContact}
                            onChangeText={setToContact}
                            placeholder={t('wallet:recipientPh')}
                            placeholderTextColor={COLORS.muted}
                            style={styles.input}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        <TextInput
                            value={giftPts}
                            onChangeText={setGiftPts}
                            placeholder={t('wallet:pointsPh')}
                            placeholderTextColor={COLORS.muted}
                            keyboardType="number-pad"
                            style={styles.input}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        {!!pointsPreviewMoney && (
                            <Text style={{ color: COLORS.sub, marginBottom: 6, fontWeight: '700' }}>
                                {t('wallet:equivNow', { value: fmtMoney(pointsPreviewMoney) })}
                            </Text>
                        )}
                        <TextInput
                            value={giftMsg}
                            onChangeText={setGiftMsg}
                            placeholder={t('wallet:messagePh')}
                            placeholderTextColor={COLORS.muted}
                            style={styles.input}
                            textAlign={isRTL ? 'right' : 'left'}
                        />

                        <TouchableOpacity style={styles.primaryBtnWide} onPress={confirmAndSendGift} disabled={sending}>
                            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryTxtWide}>{t('wallet:createGiftCode')}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Redeem Gift */}
            <Modal visible={redeemOpen} transparent animationType="slide" onRequestClose={() => setRedeemOpen(false)}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        {/* Header with close */}
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{t('wallet:redeemGift')}</Text>
                            <TouchableOpacity onPress={() => setRedeemOpen(false)} style={styles.closeBtn}>
                                <Feather name="x" size={22} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={code}
                            onChangeText={setCode}
                            placeholder={t('wallet:giftCodePh')}
                            placeholderTextColor={COLORS.muted}
                            style={styles.input}
                            autoCapitalize="characters"
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        <TouchableOpacity style={styles.primaryBtnWide} onPress={onRedeemGift} disabled={redeeming}>
                            {redeeming ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryTxtWide}>{t('wallet:redeem')}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* ----------------- STYLES ----------------- */
const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },


    balanceCard: {
        margin: 16,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.line,
        padding: 14,
        flexDirection: 'row',
    },
    balanceLabel: { color: COLORS.sub, fontWeight: '700' },
    balanceValue: { color: COLORS.text, fontSize: 28, fontWeight: '900', marginTop: 2 },
    balanceSub: { color: COLORS.sub, marginTop: 4 },
    actionCol: { justifyContent: 'space-between' },
    secondaryBtn: {
        backgroundColor: COLORS.brandSoft,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    secondaryTxt: { color: COLORS.brand, fontWeight: '800' },

    tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.line, marginHorizontal: 16 },
    tabBtn: { paddingVertical: 10, marginRight: 18 },
    tabBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.text },
    tabTxt: { color: COLORS.sub, fontWeight: '800' },
    tabTxtActive: { color: COLORS.text },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.line,
        marginBottom: 8,
    },
    rowTitle: { fontWeight: '800', color: COLORS.text },
    rowNote: { color: COLORS.sub, fontSize: 12, marginTop: 2 },
    rowPts: { fontWeight: '900', marginLeft: 8 },

    /* Purchases filter + summary */
    filterRow: { paddingVertical: 8 },
    filterChip: {
        height: 40,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.line,
        backgroundColor: '#fff',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    filterTxt: { color: COLORS.text, fontWeight: '800' },
    filterTxtActive: { color: '#fff' },

    spendCard: {
        marginTop: 8,
        marginBottom: 6,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.line,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    spendLabel: { color: COLORS.sub, fontWeight: '700' },
    spendValue: { color: COLORS.text, fontSize: 18, fontWeight: '900', marginTop: 6 },

    /* Modals */
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },

    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },

    sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F6F8FF',
        paddingHorizontal: 14,
        color: COLORS.text,
        fontWeight: '600',
        marginBottom: 10,
    },
    primaryBtnWide: {
        marginTop: 10,
        backgroundColor: COLORS.text,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryTxtWide: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
