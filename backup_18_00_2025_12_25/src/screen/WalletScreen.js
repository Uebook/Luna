import React, { useMemo, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { apiHelpers } from '../services/api';

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
const isCodeFormat = (v) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(String(v).trim().toUpperCase()); // Reward gift code format
const isGiftCardCodeFormat = (v) => /^GC-[A-Z0-9]{8}$/i.test(String(v).trim().toUpperCase()); // Gift card code format (GC-XXXXXXXX)

export default function WalletScreen({ navigation }) {
    const route = useRoute();
    const { theme, isDark } = useTheme();
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
    const styles = useMemo(() => createStyles(COLORS, isDark), [COLORS, isDark]);
    const { t } = useTranslation(['wallet']);
    const isRTL = i18n?.dir?.() === 'rtl';

    /* ---------- Reward state ---------- */
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);

    /* ---------- Purchases ---------- */
    const [purchases, setPurchases] = useState([]);

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
    
    // Check if redeemCode was passed from navigation
    const redeemCodeFromRoute = route?.params?.redeemCode;
    
    // Open redeem modal if code is provided
    useEffect(() => {
        if (redeemCodeFromRoute) {
            setCode(redeemCodeFromRoute);
            setRedeemOpen(true);
        }
    }, [redeemCodeFromRoute]);

    // Fetch wallet data
    useEffect(() => {
        let isMounted = true;
        const fetchWalletData = async () => {
            try {
                setLoading(true);

                // Get user ID from AsyncStorage
                const userData = await AsyncStorage.getItem('luna_user');
                if (!userData) {
                    if (isMounted) {
                        setLoading(false);
                    }
                    return;
                }

                const user = JSON.parse(userData);
                const userId = user.user?.id || user.id;
                console.log('useruseruser', user);

                if (!userId) {
                    if (isMounted) {
                        setLoading(false);
                    }
                    return;
                }

                // Fetch wallet info, purchases, and transactions in parallel
                const [walletResponse, purchasesResponse, transactionsResponse] = await Promise.all([
                    api.post('/wallet/info', { user_id: userId }).catch(() => ({ data: { status: false } })),
                    api.post('/wallet/purchases', { user_id: userId }).catch(() => ({ data: { status: false } })),
                    api.post('/wallet/transactions', { user_id: userId }).catch(() => ({ data: { status: false } })),
                ]);

                console.log('Wallet API Response:', JSON.stringify(walletResponse.data, null, 2));
                console.log('Purchases API Response:', JSON.stringify(purchasesResponse.data, null, 2));
                console.log('Transactions API Response:', JSON.stringify(transactionsResponse.data, null, 2));

                if (isMounted) {
                    // Update points and total purchase amount
                    if (walletResponse.data.status && walletResponse.data.data) {
                        const pointsValue = walletResponse.data.data.points || 0;
                        const purchaseAmount = walletResponse.data.data.total_purchase_amount || 0;
                        console.log('Setting points to:', pointsValue);
                        console.log('Setting total purchase amount to:', purchaseAmount);
                        setPoints(pointsValue);
                        setTotalPurchaseAmount(purchaseAmount);
                    } else {
                        console.log('Wallet response status false or no data:', walletResponse.data);
                    }

                    // Update purchases
                    if (purchasesResponse.data.status && purchasesResponse.data.data) {
                        console.log('Setting purchases:', purchasesResponse.data.data);
                        setPurchases(purchasesResponse.data.data);
                    } else {
                        console.log('Purchases response status false or no data:', purchasesResponse.data);
                    }

                    // Update transactions
                    if (transactionsResponse.data.status && transactionsResponse.data.data) {
                        console.log('Setting transactions:', transactionsResponse.data.data);
                        setTransactions(transactionsResponse.data.data);
                    } else {
                        console.log('Transactions response status false or no data:', transactionsResponse.data);
                    }
                }
            } catch (error) {
                console.log('Error fetching wallet data:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchWalletData();

        return () => {
            isMounted = false;
        };
    }, []);

    // month filter for purchases
    const allMonths = useMemo(() => {
        const set = new Set();
        purchases.forEach((p) => {
            if (p.at && p.at.length >= 7) {
                set.add(p.at.slice(0, 7)); // YYYY-MM
            }
        });
        const arr = Array.from(set).sort().reverse();
        return ['All', ...arr];
    }, [purchases]);
    const [month, setMonth] = useState(allMonths[0] || 'All');

    /* ---------- derived ---------- */
    const fiatValue = useMemo(() => (points * SAFE_RATIO).toFixed(3), [points]);

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
        if (!p || p <= 0 || p > points || !rcpt) return;

        setSending(true);
        try {
            const userData = await AsyncStorage.getItem('luna_user');
            if (!userData) {
                Alert.alert('Error', 'User not found. Please login again.');
                setSending(false);
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.user?.id || user.id;

            if (!userId) {
                Alert.alert('Error', 'User not found. Please login again.');
                setSending(false);
                return;
            }

            // Determine if recipient is email or phone
            const isEmailRecipient = isEmail(rcpt);
            const payload = {
                user_id: userId,
                points: p,
                message: giftMsg.trim() || '',
            };
            if (isEmailRecipient) {
                payload.to_email = rcpt;
            } else {
                payload.to_phone = rcpt;
            }

            const response = await api.post('/wallet/send-gift', payload);

            if (response.data.status && response.data.data) {
                const giftCode = response.data.data.code;
                setPoints((x) => x - p);
                // Refresh wallet data
                const walletResponse = await api.post('/wallet/info', { user_id: userId });
                if (walletResponse.data.status && walletResponse.data.data) {
                    setPoints(walletResponse.data.data.points || 0);
                }
                // Refresh transactions
                const txnResponse = await api.post('/wallet/transactions', { user_id: userId });
                if (txnResponse.data.status && txnResponse.data.data) {
                    setTransactions(txnResponse.data.data);
                }

                setSending(false);
                setSendOpen(false);
                setToContact('');
                setGiftPts('');
                setGiftMsg('');
                Alert.alert(t('wallet:giftCreated'), `${t('wallet:giftCreatedShare')}\n\n${giftCode}`);
            } else {
                Alert.alert('Error', response.data.message || 'Failed to send gift. Please try again.');
                setSending(false);
            }
        } catch (error) {
            console.log('Error sending gift:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send gift. Please try again.');
            setSending(false);
        }
    };

    /* ---------- redeem gift: validate format + reuse + expiry + live update ---------- */
    const onRedeemGift = async () => {
        const c = code.trim().toUpperCase();
        if (!c) return Alert.alert(t('wallet:enterGiftCode'));

        setRedeeming(true);
        try {
            const userData = await AsyncStorage.getItem('luna_user');
            if (!userData) {
                Alert.alert('Error', 'User not found. Please login again.');
                setRedeeming(false);
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.user?.id || user.id;

            if (!userId) {
                Alert.alert('Error', 'User not found. Please login again.');
                setRedeeming(false);
                return;
            }

            // Check if it's a gift card code (GC-XXXXXXXX) or reward gift code (XXXX-XXXX)
            const isGiftCard = isGiftCardCodeFormat(c);
            const isRewardCode = isCodeFormat(c);

            if (!isGiftCard && !isRewardCode) {
                Alert.alert('Invalid Code', 'Please enter a valid gift card code (GC-XXXXXXXX) or reward code (XXXX-XXXX)');
                setRedeeming(false);
                return;
            }

            let response;
            if (isGiftCard) {
                // Redeem gift card
                response = await apiHelpers.redeemGiftCard(userId, c);
            } else {
                // Redeem reward gift code
                response = await api.post('/wallet/redeem-code', {
                    user_id: userId,
                    code: c,
                });
            }

            if (response.data.status && response.data.data) {
                const pointsAdded = response.data.data.points || response.data.data.points_added || 0;
                const valueBHD = response.data.data.value_bhd || 0;
                
                // Refresh wallet data
                const walletResponse = await api.post('/wallet/info', { user_id: userId });
                if (walletResponse.data.status && walletResponse.data.data) {
                    setPoints(walletResponse.data.data.points || 0);
                }
                // Refresh transactions
                const txnResponse = await api.post('/wallet/transactions', { user_id: userId });
                if (txnResponse.data.status && txnResponse.data.data) {
                    setTransactions(txnResponse.data.data);
                }

                setRedeeming(false);
                setRedeemOpen(false);
                setCode('');
                
                // Show success message with details
                if (isGiftCard) {
                    Alert.alert(
                        'Gift Card Redeemed!',
                        `Successfully redeemed gift card worth ${valueBHD.toFixed(3)} BHD.\n${pointsAdded} points added to your wallet.`
                    );
                } else {
                    Alert.alert(t('wallet:redeemSuccessTitle'), t('wallet:redeemSuccessBody'));
                }
            } else {
                Alert.alert('Error', response.data.message || 'Failed to redeem code. Please try again.');
                setRedeeming(false);
            }
        } catch (error) {
            console.log('Error redeeming code:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to redeem code. Please try again.');
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
                {totalPurchaseAmount > 0 && (
                    <Text style={[styles.balanceSub, { marginTop: 8, fontWeight: '700' }]}>
                        {t('wallet:totalPurchases', { defaultValue: 'Total Purchases' })}: {fmtMoney(totalPurchaseAmount)}
                    </Text>
                )}
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
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('GiftCardReceivedScreen')}>
                    <Feather name="inbox" color={COLORS.brand} size={16} />
                    <Text style={styles.secondaryTxt}>Received Gifts</Text>
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
    return (
        <SafeAreaView style={styles.safe}>
            {/* Standard Header */}
            <StandardHeader
                title={t('wallet:title')}
                navigation={navigation}
                showGradient={true}
            />

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
                        {loading ? (
                            <View style={{ padding: 16, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={COLORS.brand} />
                            </View>
                        ) : (
                            <>
                                {/* Month filter */}
                                {allMonths.length > 1 && (
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
                                )}

                                {/* Summary */}
                                {filteredPurchases.length > 0 && (
                                    <View style={styles.spendCard}>
                                        <Text style={styles.spendLabel}>
                                            {month === 'All'
                                                ? t('wallet:totalSpentAllTime')
                                                : t('wallet:totalSpentInMonth', { month: fmtMonthLabel(month) })}
                                        </Text>
                                        <Text style={styles.spendValue}>{fmtMoney(totalSpent)}</Text>
                                    </View>
                                )}

                                {/* List */}
                                <FlatList
                                    data={filteredPurchases}
                                    keyExtractor={(it, index) => it.id?.toString() || index.toString()}
                                    renderItem={({ item }) => <PurchaseRow item={item} />}
                                    scrollEnabled={false}
                                    contentContainerStyle={{ paddingTop: 8 }}
                                    ListEmptyComponent={
                                        <Text style={{ color: COLORS.sub, paddingVertical: 16, textAlign: 'center' }}>
                                            {t('wallet:noPurchases')}
                                        </Text>
                                    }
                                />
                            </>
                        )}
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
                            placeholder="GC-XXXXXXXX or XXXX-XXXX"
                            placeholderTextColor={COLORS.muted}
                            style={styles.input}
                            autoCapitalize="characters"
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        <Text style={[styles.balanceSub, { marginTop: 4, fontSize: 11, marginBottom: 12 }]}>
                            Enter gift card code (GC-XXXXXXXX) or reward gift code (XXXX-XXXX)
                        </Text>
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
const createStyles = (COLORS, isDark) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },

    header: {
        height: 50,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.line,
    },
    h1: { fontSize: 20, fontWeight: '800', color: COLORS.text },

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
    actionCol: { gap: 8 },
    secondaryBtn: {
        backgroundColor: COLORS.brandSoft,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
        backgroundColor: COLORS.card,
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
        backgroundColor: isDark ? COLORS.bg : COLORS.card,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
    filterTxt: { color: COLORS.text, fontWeight: '800' },
    filterTxtActive: { color: COLORS.white },

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
    sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },

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
        backgroundColor: isDark ? COLORS.bg : '#F3F4F6',
    },

    sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.line,
        backgroundColor: isDark ? COLORS.bg : COLORS.card,
        paddingHorizontal: 14,
        color: COLORS.text,
        fontWeight: '600',
        marginBottom: 10,
        placeholderTextColor: COLORS.sub,
    },
    primaryBtnWide: {
        marginTop: 10,
        backgroundColor: COLORS.brand,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryTxtWide: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
