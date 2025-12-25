// src/screens/SubscriptionScreen.js
import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Modal,
    useWindowDimensions,
    Platform,
    I18nManager,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { SkeletonFormScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import { apiHelpers } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function SubscriptionScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const COLORS = {
        bg: theme.bg,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        card: theme.card,
        brand: theme.p1,
        brandSoft: theme.p4,
        chip: theme.line,
        shadow: theme.ink,
    };
    const styles = useMemo(() => createStyles(COLORS, isDark), [COLORS, isDark]);
    const { width } = useWindowDimensions();
    const { t } = useTranslation('membership');

    // Robust RTL flag (works even if I18nManager.isRTL hasn't been toggled)
    const lang = String(i18n?.language || '').toLowerCase();
    const rtl = I18nManager.isRTL || /^(ar|fa|ur|he|ku|ps|ug|dv)/.test(lang);

    const pad = Math.max(12, Math.min(18, Math.round(width * 0.04)));
    const gap = Math.max(8, Math.min(14, Math.round(width * 0.03)));
    const f = (base) => (width >= 420 ? base + 1 : width < 340 ? Math.max(11, base - 1) : base);

    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingTierId, setPendingTierId] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [tierColors, setTierColors] = useState({});
    const [userStats, setUserStats] = useState({ spendKWD: 0, purchases: 0, referrals: 0, currentTier: 'Bronze' });
    const [userId, setUserId] = useState(null);

    // Load user ID from storage
    React.useEffect(() => {
        const loadUserId = async () => {
            try {
                const userData = await AsyncStorage.getItem('luna_user');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    const userId = parsed.user?.id || parsed.id;
                    setUserId(userId);
                }
            } catch (error) {
                console.log('Error loading user ID:', error);
            }
        };
        loadUserId();
    }, []);

    // Fetch tiers, plans, and user stats
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch tiers and plans
                const tiersPlansResponse = await apiHelpers.getTiersAndPlans();
                if (tiersPlansResponse.data.status) {
                    const formattedTiers = tiersPlansResponse.data.tiers.map(tier => ({
                        id: tier.code,
                        code: tier.code,
                        nameKey: tier.name_key,
                        color: tier.color,
                        requirements: {
                            spendMin: tier.requirements.spend_min,
                            spendMax: tier.requirements.spend_max === null ? Infinity : tier.requirements.spend_max,
                            purchasesMin: tier.requirements.purchases_min,
                            purchasesMax: tier.requirements.purchases_max === null ? Infinity : tier.requirements.purchases_max,
                            referralsMin: tier.requirements.referrals_min,
                        },
                        benefitsKeys: tier.benefits_keys || [],
                    }));
                    setTiers(formattedTiers);
                    setPlans(tiersPlansResponse.data.plans);
                    setTierColors(tiersPlansResponse.data.tier_colors || {});

                    // Set default plan
                    if (tiersPlansResponse.data.plans.length > 0 && !selectedPlan) {
                        setSelectedPlan(tiersPlansResponse.data.plans[0].code);
                    }
                }

                // Fetch user stats if user is logged in
                if (userId) {
                    const statsResponse = await apiHelpers.getUserStats(userId);
                    if (statsResponse.data.status && statsResponse.data.stats) {
                        setUserStats({
                            spendKWD: statsResponse.data.stats.spend_kwd,
                            purchases: statsResponse.data.stats.purchases,
                            referrals: statsResponse.data.stats.referrals,
                            currentTier: statsResponse.data.stats.current_tier,
                        });
                    }
                }
            } catch (error) {
                console.log('Error fetching subscription data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, setLoading]);

    const currentTierObj = useMemo(() => {
        if (tiers.length === 0) return null;
        return tiers.find((tier) => tier.code.toLowerCase() === userStats.currentTier.toLowerCase());
    }, [tiers, userStats.currentTier]);

    const fmtCurrency = (amount) => {
        try {
            return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'BHD', minimumFractionDigits: 3 }).format(amount);
        } catch {
            return `BHD ${amount.toFixed(3)}`;
        }
    };

    const onSubscribe = (tierId) => { setPendingTierId(tierId); setConfirmOpen(true); };

    const confirmSubscribe = async () => {
        if (!userId) {
            Alert.alert('Error', 'Please login to subscribe');
            return;
        }

        if (!selectedPlan || !pendingTierId) {
            Alert.alert('Error', 'Please select a plan and tier');
            return;
        }

        try {
            // Find tier and plan - use database IDs
            const tier = tiers.find(t => t.id === pendingTierId || t.code === pendingTierId);
            const plan = plans.find(p => p.code === selectedPlan);

            if (!tier || !plan) {
                Alert.alert('Error', 'Invalid tier or plan selected');
                return;
            }

            // Use database IDs for API call
            const response = await apiHelpers.subscribe(userId, tier.id || tier.code, plan.id || plan.code);

            if (response.data.status) {
                setConfirmOpen(false);
                // Refresh user stats
                const statsResponse = await apiHelpers.getUserStats(userId);
                if (statsResponse.data.status && statsResponse.data.stats) {
                    setUserStats({
                        spendKWD: statsResponse.data.stats.spend_kwd,
                        purchases: statsResponse.data.stats.purchases,
                        referrals: statsResponse.data.stats.referrals,
                        currentTier: statsResponse.data.stats.current_tier,
                    });
                }
                Alert.alert('Success', response.data.message || 'Subscription activated successfully!');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to subscribe');
            }
        } catch (error) {
            console.log('Error subscribing:', error);
            Alert.alert('Error', 'Failed to subscribe. Please try again.');
        }
    };

    const StatusItem = ({ label, value }) => (
        <View style={[styles.sRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.statusLabel, { fontSize: f(12), textAlign: rtl ? 'left' : 'right' }]} numberOfLines={1}>{label}</Text>
            <Text style={[styles.statusVal, { fontSize: f(14), textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>{value}</Text>
        </View>
    );

    const PlanPicker = ({ selected, onChange }) => (
        <View style={[styles.planRow, { gap, flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            {plans.map((p) => {
                const active = selected === p.code;
                return (
                    <TouchableOpacity
                        key={p.id || p.code}
                        onPress={() => onChange(p.code)}
                        style={[styles.planChip, { paddingHorizontal: pad - 2, paddingVertical: 8 }, active && styles.planChipActive]}
                        activeOpacity={0.9}
                    >
                        <Text style={[styles.planTxt, { fontSize: f(13) }, active && styles.planTxtActive]} numberOfLines={1}>{t(p.label_key)}</Text>
                        <Text style={[styles.planPrice, { fontSize: f(12) }, active && styles.planTxtActive]} numberOfLines={1}>{fmtCurrency(p.price_kwd)}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const TierCard = ({ item }) => {
        const isCurrent = item.code && item.code.toLowerCase() === userStats.currentTier.toLowerCase();
        const stackCols = width < 420;

        return (
            <View style={[styles.tierCard, { padding: pad }]}>
                <View style={[styles.tierHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.tierDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.tierTitle, { fontSize: f(16) }]} numberOfLines={1}>{t(item.nameKey)}</Text>
                    {isCurrent && (
                        <View style={styles.badge}>
                            <Text style={[styles.badgeTxt, { fontSize: f(11) }]}>{t('current')}</Text>
                        </View>
                    )}
                </View>

                <View
                    style={[
                        styles.split,
                        { flexDirection: stackCols ? 'column' : rtl ? 'row-reverse' : 'row', marginTop: gap, columnGap: gap, rowGap: gap },
                    ]}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.subhead, { fontSize: f(13) }]}>{t('eligibility')}</Text>
                        <Text style={[styles.li, { fontSize: f(12) }]}>
                            • {t('spend')}: {item.requirements.spendMin}–
                            {item.requirements.spendMax === Infinity ? '∞' : item.requirements.spendMax} / {t('per.year')}
                        </Text>
                        <Text style={[styles.li, { fontSize: f(12) }]}>
                            • {t('purchases')}: {item.requirements.purchasesMin}–
                            {item.requirements.purchasesMax === Infinity ? '∞' : item.requirements.purchasesMax} / {t('per.year')}
                        </Text>
                        {item.requirements.referralsMin > 0 && (
                            <Text style={[styles.li, { fontSize: f(12) }]}>• {t('referrals')}: {item.requirements.referralsMin}+</Text>
                        )}
                    </View>

                    <View style={{ flex: 1 }}>
                        <Text style={[styles.subhead, { fontSize: f(13) }]}>{t('benefits')}</Text>
                        {item.benefitsKeys.map((k, i) => (
                            <Text key={i} style={[styles.li, { fontSize: f(12) }]}>• {t(k)}</Text>
                        ))}
                    </View>
                </View>

                {!isCurrent && (
                    <View style={{ marginTop: gap, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', gap }}>
                        <PlanPicker selected={selectedPlan} onChange={setSelectedPlan} />
                        <TouchableOpacity style={[styles.primaryBtn, { paddingHorizontal: pad, paddingVertical: 12 }]} onPress={() => onSubscribe(item.id)} activeOpacity={0.9}>
                            <Text style={[styles.primaryTxt, { fontSize: f(13) }]}>{t('subscribe')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    // Back button component (used on one side; matching spacer keeps title centered)
    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <StandardHeader
                    title={t('title', { defaultValue: 'Membership' })}
                    navigation={navigation}
                    showGradient={true}
                />
                <SkeletonFormScreen />
            </SafeAreaView>
        );
    }

    const BackBtn = () => (
        <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backChip}
        >
            <Feather name={rtl ? 'chevron-right' : 'chevron-left'} size={22} color={COLORS.text} />
        </TouchableOpacity>
    );
    const Slot = () => <View />; // invisible spacer

    return (
        <SafeAreaView style={[styles.safe, { writingDirection: rtl ? 'rtl' : 'ltr' }]}>
            {/* Standard Header */}
            <StandardHeader
                title={t('membership')}
                navigation={navigation}
                showGradient={true}
            />

            <FlatList
                data={tiers}
                keyExtractor={(it) => it.id}
                renderItem={({ item }) => <TierCard item={item} />}
                ListHeaderComponent={
                    <View style={[styles.statusCard, { margin: pad, padding: pad }]}>
                        <StatusItem label={t('currentTier')} value={currentTierObj ? t(currentTierObj.nameKey) : '-'} />
                        <StatusItem label={t('ytdSpend')} value={fmtCurrency(userStats.spendKWD)} />
                        <StatusItem label={t('orders')} value={String(userStats.purchases)} />
                    </View>
                }
                ListFooterComponent={
                    <Text style={[styles.terms, { marginTop: pad, fontSize: f(12), textAlign: 'center', paddingBottom: 24 }]}>{t('termsLine')}</Text>
                }
                contentContainerStyle={{ paddingHorizontal: pad, paddingTop: 4, rowGap: gap, paddingBottom: 24 }}
                ItemSeparatorComponent={() => <View style={{ height: gap }} />}
                showsVerticalScrollIndicator={false}
            />

            <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
                <View style={styles.overlay}>
                    <View
                        style={[
                            styles.sheet,
                            {
                                padding: pad,
                                width: '90%',
                                ...Platform.select({
                                    ios: { shadowColor: COLORS.shadow, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
                                    android: { elevation: 6 },
                                }),
                            },
                        ]}
                    >
                        <View style={[styles.sheetHeader, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                            <Text style={[styles.sheetTitle, { fontSize: f(16) }]}>{t('confirm.title')}</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setConfirmOpen(false)}>
                                <Feather name="x" size={18} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sheetBody, { fontSize: f(13) }]}>
                            {t('confirm.plan')}: {selectedPlan ? t(plans.find((p) => p.code === selectedPlan)?.label_key) : '-'}
                            {'\n'}
                            {t('confirm.tier')}: {pendingTierId ? t(tiers.find((t0) => t0.id === pendingTierId)?.nameKey) : '-'}
                        </Text>

                        <TouchableOpacity style={[styles.primaryBtnWide, { height: 48, borderRadius: 12 }]} onPress={confirmSubscribe} activeOpacity={0.9}>
                            <Text style={[styles.primaryTxtWide, { fontSize: f(15) }]}>{t('confirm.activate')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (COLORS, isDark) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },

    header: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.line,
    },
    backChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.chip,
        borderWidth: 1,
        borderColor: COLORS.line,
    },
    h1: { fontWeight: '800', color: COLORS.text, textAlign: 'center', flexShrink: 1 },

    statusCard: { borderRadius: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line },

    sRow: { alignItems: 'center', marginBottom: 8, columnGap: 12 },
    statusLabel: { flex: 1, color: COLORS.sub, fontWeight: '700' },
    statusVal: { flex: 1, color: COLORS.text, fontWeight: '900' },

    tierCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line },
    tierHeader: { alignItems: 'center', columnGap: 8, paddingRight: 4, paddingLeft: 4 },
    tierDot: { width: 18, height: 18, borderRadius: 9 },
    tierTitle: { fontWeight: '800', color: COLORS.text, flex: 1 },
    badge: { backgroundColor: COLORS.brandSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    badgeTxt: { color: COLORS.brand, fontWeight: '800' },

    split: {},
    subhead: { fontWeight: '800', color: COLORS.text, marginBottom: 6 },
    li: { color: COLORS.text, marginBottom: 4 },

    planRow: { flexWrap: 'wrap' },
    planChip: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, backgroundColor: COLORS.card },
    planChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
    planTxt: { color: COLORS.text, fontWeight: '800' },
    planTxtActive: { color: '#fff' },
    planPrice: { color: COLORS.sub, fontWeight: '700' },

    primaryBtn: { backgroundColor: COLORS.brand, borderRadius: 10 },
    primaryTxt: { color: '#fff', fontWeight: '800' },

    terms: { color: COLORS.sub },

    overlay: { flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
    sheet: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.line },
    sheetHeader: { alignItems: 'center', justifyContent: 'space-between' },
    sheetTitle: { fontWeight: '800', color: COLORS.text },
    closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? COLORS.line : '#F3F4F6' },
    sheetBody: { color: COLORS.text, marginTop: 10, marginBottom: 12 },

    primaryBtnWide: { backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
    primaryTxtWide: { color: '#fff', fontWeight: '800' },
});
