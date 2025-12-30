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
    RefreshControl,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { walletAPI, getUserId } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

/* ----------------- Currency & ratio (BHD) ----------------- */
const CURRENCY = 'BHD';
const BHD_PER_POINT = 0.01; // change via remote config if needed
const SAFE_RATIO = BHD_PER_POINT > 0 ? BHD_PER_POINT : 0.01;

const GIFT_TTL_DAYS = 14; // gift codes expire in 14 days
const ME = { id: 3, email: 'me@luna.app' };

/* ----------------- in-memory gift store (demo) ----------------- */
const fakeGiftStore = new Map();
const nowISO = () => new Date().toISOString();

/* Secure(ish) code generator: AAAA-BBBB using non-ambiguous chars */
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1
function secureRandomCode() {
    const pick = (n) => {
        let out = '';
        try {
            // Prefer crypto if available (RN + react-native-get-random-values)
            const len = n;
            const buf = new Uint8Array(len);
            // eslint-disable-next-line no-undef
            if (global.crypto && global.crypto.getRandomValues) {
                // eslint-disable-next-line no-undef
                global.crypto.getRandomValues(buf);
                for (let i = 0; i < len; i++) out += ALPH[buf[i] % ALPH.length];
            } else {
                for (let i = 0; i < len; i++) out += ALPH[Math.floor(Math.random() * ALPH.length)];
            }
        } catch {
            for (let i = 0; i < n; i++) out += ALPH[Math.floor(Math.random() * ALPH.length)];
        }
        return out;
    };
    return `${pick(4)}-${pick(4)}`;
}

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
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [loadingWallet, setLoadingWallet] = useState(true);
    const [loadingPurchases, setLoadingPurchases] = useState(true);
    const [userId, setUserId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

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

    // Load user ID
    useEffect(() => {
        const loadUserId = async () => {
            try {
                const id = await getUserId();
                setUserId(id);
            } catch (error) {
                console.log('Error loading user ID:', error);
            }
        };
        loadUserId();
    }, []);

    // Fetch wallet info (points balance)
    const fetchWalletInfo = useCallback(async () => {
        if (!userId) return;
        try {
            setLoadingWallet(true);
            const response = await walletAPI.getWalletInfo(userId);
            if (response.data?.status && response.data?.data) {
                setPoints(response.data.data.points || 0);
            }
        } catch (error) {
            console.log('Error fetching wallet info:', error);
        } finally {
            setLoadingWallet(false);
        }
    }, [userId]);

    // Fetch reward transactions
    const fetchTransactions = useCallback(async () => {
        if (!userId) return;
        try {
            setLoadingTransactions(true);
            const response = await walletAPI.getRewardTransactions(userId);
            if (response.data?.status && response.data?.data) {
                setTransactions(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.log('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setLoadingTransactions(false);
        }
    }, [userId]);

    // Fetch purchase history
    const fetchPurchases = useCallback(async () => {
        if (!userId) return;
        try {
            setLoadingPurchases(true);
            const response = await walletAPI.getPurchaseHistory(userId);
            if (response.data?.status && response.data?.data) {
                setPurchases(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.log('Error fetching purchases:', error);
            setPurchases([]);
        } finally {
            setLoadingPurchases(false);
        }
    }, [userId]);

    // Fetch all data when userId is available
    useEffect(() => {
        if (userId) {
            fetchWalletInfo();
            fetchTransactions();
            fetchPurchases();
        }
    }, [userId, fetchWalletInfo, fetchTransactions, fetchPurchases]);

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchWalletInfo();
                fetchTransactions();
                fetchPurchases();
            }
        }, [userId, fetchWalletInfo, fetchTransactions, fetchPurchases])
    );

    // Refresh handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (userId) {
            await Promise.all([
                fetchWalletInfo(),
                fetchTransactions(),
                fetchPurchases(),
            ]);
        }
        setRefreshing(false);
    }, [userId, fetchWalletInfo, fetchTransactions, fetchPurchases]);

    // month filter for purchases
    const allMonths = useMemo(() => {
        const set = new Set();
        purchases.forEach((p) => set.add(p.at.slice(0, 7))); // YYYY-MM
        const arr = Array.from(set).sort().reverse();
        return ['All', ...arr];
    }, [purchases]);
    const [month, setMonth] = useState('All');

    // Update month filter when purchases change
    useEffect(() => {
        if (allMonths.length > 0 && month === 'All') {
            // Keep 'All' selected by default
        }
    }, [allMonths, month]);

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

    /* ---------- helpers ---------- */
    const pushTxn = (tx) =>
        setTransactions((prev) => [{ ...tx, id: 't' + Date.now(), at: nowISO() }, ...prev]);

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

    const performSendGift = () => {
        const p = parseInt(giftPts || '0', 10);
        const rcpt = toContact.trim();
        if (!p || p <= 0 || p > points || !rcpt) return;

        setSending(true);
        setTimeout(() => {
            const giftCode = secureRandomCode();
            fakeGiftStore.set(giftCode, {
                from_user_id: ME.id,
                to_contact: rcpt,
                message: giftMsg.trim() || '',
                points: p,
                status: 'sent',
                created_at: nowISO(),
            });

            setPoints((x) => x - p);
            pushTxn({ type: 'gift_sent', points: -p, note: rcpt });

            setSending(false);
            setSendOpen(false);
            setToContact('');
            setGiftPts('');
            setGiftMsg('');
            Alert.alert(t('wallet:giftCreated'), `${t('wallet:giftCreatedShare')}\n\n${giftCode}`);
        }, 500);
    };

    /* ---------- redeem gift: validate format + reuse + expiry + live update ---------- */
    const onRedeemGift = () => {
        const c = code.trim().toUpperCase();
        if (!c) return Alert.alert(t('wallet:enterGiftCode'));
        if (!isCodeFormat(c)) return Alert.alert(t('wallet:invalidCodeFormat'));

        setRedeeming(true);
        setTimeout(() => {
            const stored = fakeGiftStore.get(c);
            if (!stored) {
                setRedeeming(false);
                return Alert.alert(t('wallet:invalidCode'));
            }
            if (stored.from_user_id === ME.id) {
                setRedeeming(false);
                return Alert.alert(t('wallet:selfRedeemNotAllowed'));
            }
            if (stored.status !== 'sent') {
                setRedeeming(false);
                return Alert.alert(t('wallet:codeUsed'));
            }
            // expiry
            const created = new Date(stored.created_at);
            const ageMs = Date.now() - created.getTime();
            const ttlMs = GIFT_TTL_DAYS * 24 * 60 * 60 * 1000;
            if (ageMs > ttlMs) {
                setRedeeming(false);
                return Alert.alert(t('wallet:codeExpired'));
            }

            // live update
            setPoints((x) => x + stored.points);
            pushTxn({ type: 'gift_received', points: stored.points, note: stored.to_contact });

            stored.status = 'claimed';
            fakeGiftStore.set(c, stored);

            setRedeeming(false);
            setRedeemOpen(false);
            setCode('');
            Alert.alert(t('wallet:redeemSuccessTitle'), t('wallet:redeemSuccessBody'));
        }, 600);
    };

    /* ---------- small components ---------- */
    const BalanceCard = () => (
        <View style={styles.balanceCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.balanceLabel}>{t('wallet:rewardPoints')}</Text>
                {loadingWallet ? (
                    <ActivityIndicator size="small" color={COLORS.brand} style={{ marginTop: 8 }} />
                ) : (
                    <>
                        <Text style={styles.balanceValue}>{points}</Text>
                        <Text style={styles.balanceSub}>
                            {t('wallet:fiatEquivalent', { value: fmtMoney(fiatValue) })}
                            {BHD_PER_POINT <= 0 && (
                                <Text style={{ color: COLORS.danger }}> • {t('wallet:ratioFallback')}</Text>
                            )}
                        </Text>
                    </>
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
            </View>
        </View>
    );

    const TxnRow = ({ item }) => {
        const isIn = item.points > 0;
        let kind = '';
        let icon = isIn ? 'arrow-down' : 'arrow-up';
        
        // Map transaction types to labels
        switch (item.type) {
            case 'gift_sent':
                kind = t('wallet:giftSent');
                icon = 'arrow-up';
                break;
            case 'gift_received':
                kind = t('wallet:giftReceived');
                icon = 'arrow-down';
                break;
            case 'purchase':
                kind = t('wallet:purchase', { defaultValue: 'Purchase' });
                icon = 'shopping-bag';
                break;
            case 'redeem_code':
                kind = t('wallet:redeemCode', { defaultValue: 'Redeemed Code' });
                icon = 'arrow-down';
                break;
            case 'admin_adjustment':
                kind = t('wallet:adminAdjustment', { defaultValue: 'Admin Adjustment' });
                icon = isIn ? 'arrow-down' : 'arrow-up';
                break;
            default:
                kind = item.type || t('wallet:transaction', { defaultValue: 'Transaction' });
        }
        
        return (
            <View style={styles.row}>
                <Feather
                    name={icon}
                    size={16}
                    color={COLORS.text}
                    style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{kind}</Text>
                    <Text style={styles.rowNote}>
                        {item.type === 'gift_sent'
                            ? t('wallet:toX', { x: item.note || '' })
                            : item.type === 'gift_received'
                            ? t('wallet:fromX', { x: item.note || '' })
                            : item.note || ''}{' '}
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack?.()}>
                    <Feather
                        name={isRTL ? 'chevron-right' : 'chevron-left'}
                        size={22}
                        color={COLORS.text}
                    />
                </TouchableOpacity>
                <Text style={styles.h1}>{t('wallet:title')}</Text>
                <View style={{ width: 22 }} />
            </View>

            <ScrollView 
                contentContainerStyle={{ paddingBottom: 24 }} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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
                    <>
                        {loadingTransactions ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={COLORS.brand} />
                                <Text style={{ marginTop: 12, color: COLORS.sub }}>
                                    {t('wallet:loading', { defaultValue: 'Loading...' })}
                                </Text>
                            </View>
                        ) : (
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
                    </>
                )}

                {/* Purchases tab */}
                {tab === 'purchases' && (
                    <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
                        {loadingPurchases ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={COLORS.brand} />
                                <Text style={{ marginTop: 12, color: COLORS.sub }}>
                                    {t('wallet:loading', { defaultValue: 'Loading...' })}
                                </Text>
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
                                    keyExtractor={(it) => String(it.id)}
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
