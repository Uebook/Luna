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

const USER_YTD = { spendKWD: 275.35, purchases: 4, referrals: 1, currentTier: 'Silver' };

const TIER_COLORS = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
};

const TIERS = [
    {
        id: 'bronze', nameKey: 'tiers.bronze.name', color: TIER_COLORS.bronze,
        requirements: { spendMin: 0, spendMax: 199, purchasesMin: 1, purchasesMax: 2, referralsMin: 0 },
        benefitsKeys: ['tiers.bronze.b1', 'tiers.bronze.b2', 'tiers.bronze.b3'],
    },
    {
        id: 'silver', nameKey: 'tiers.silver.name', color: TIER_COLORS.silver,
        requirements: { spendMin: 200, spendMax: 499, purchasesMin: 3, purchasesMax: 5, referralsMin: 2 },
        benefitsKeys: ['tiers.silver.b1', 'tiers.silver.b2', 'tiers.silver.b3', 'tiers.silver.b4', 'tiers.silver.b5'],
    },
    {
        id: 'gold', nameKey: 'tiers.gold.name', color: TIER_COLORS.gold,
        requirements: { spendMin: 500, spendMax: 999, purchasesMin: 6, purchasesMax: 10, referralsMin: 3 },
        benefitsKeys: ['tiers.gold.b1', 'tiers.gold.b2', 'tiers.gold.b3', 'tiers.gold.b4', 'tiers.gold.b5'],
    },
    {
        id: 'platinum', nameKey: 'tiers.platinum.name', color: TIER_COLORS.platinum,
        requirements: { spendMin: 1000, spendMax: Infinity, purchasesMin: 11, purchasesMax: Infinity, referralsMin: 5 },
        benefitsKeys: ['tiers.platinum.b1', 'tiers.platinum.b2', 'tiers.platinum.b3', 'tiers.platinum.b4', 'tiers.platinum.b5'],
    },
];

const PLANS = [
    { id: 'monthly', labelKey: 'plans.monthly', priceKWD: 1.9, noteKey: 'plans.monthlyNote' },
    { id: 'yearly', labelKey: 'plans.yearly', priceKWD: 19.0, noteKey: 'plans.yearlyNote' },
];

export default function SubscriptionScreen({ navigation }) {
    const { theme } = useTheme();
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
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);
    const { width } = useWindowDimensions();
    const { t } = useTranslation('membership');

    // Robust RTL flag (works even if I18nManager.isRTL hasn't been toggled)
    const lang = String(i18n?.language || '').toLowerCase();
    const rtl = I18nManager.isRTL || /^(ar|fa|ur|he|ku|ps|ug|dv)/.test(lang);

    const pad = Math.max(12, Math.min(18, Math.round(width * 0.04)));
    const gap = Math.max(8, Math.min(14, Math.round(width * 0.03)));
    const f = (base) => (width >= 420 ? base + 1 : width < 340 ? Math.max(11, base - 1) : base);

    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingTierId, setPendingTierId] = useState(null);

    const currentTierObj = useMemo(() => {
        return TIERS.find((tier) => t(tier.nameKey).toLowerCase().startsWith(USER_YTD.currentTier.toLowerCase()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18n.language]);

    const fmtCurrency = (amount) => {
        try {
            return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'BHD', minimumFractionDigits: 3 }).format(amount);
        } catch {
            return `BHD ${amount.toFixed(3)}`;
        }
    };

    const onSubscribe = (tierId) => { setPendingTierId(tierId); setConfirmOpen(true); };
    const confirmSubscribe = () => {
        setConfirmOpen(false);
        const plan = PLANS.find((p) => p.id === selectedPlan);
        const per = selectedPlan === 'monthly' ? t('per.month') : t('per.year');
        alert(`${t('confirm.active')}\n${t('confirm.plan')}: ${t(plan.labelKey)}\n${fmtCurrency(plan.priceKWD)}/${per}`);
    };

    const StatusItem = ({ label, value }) => (
        <View style={[styles.sRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.statusLabel, { fontSize: f(12), textAlign: rtl ? 'left' : 'right' }]} numberOfLines={1}>{label}</Text>
            <Text style={[styles.statusVal, { fontSize: f(14), textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>{value}</Text>
        </View>
    );

    const PlanPicker = ({ selected, onChange }) => (
        <View style={[styles.planRow, { gap, flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            {PLANS.map((p) => {
                const active = selected === p.id;
                return (
                    <TouchableOpacity
                        key={p.id}
                        onPress={() => onChange(p.id)}
                        style={[styles.planChip, { paddingHorizontal: pad - 2, paddingVertical: 8 }, active && styles.planChipActive]}
                        activeOpacity={0.9}
                    >
                        <Text style={[styles.planTxt, { fontSize: f(13) }, active && styles.planTxtActive]} numberOfLines={1}>{t(p.labelKey)}</Text>
                        <Text style={[styles.planPrice, { fontSize: f(12) }, active && styles.planTxtActive]} numberOfLines={1}>{fmtCurrency(p.priceKWD)}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const TierCard = ({ item }) => {
        const isCurrent = t(item.nameKey).toLowerCase().startsWith(USER_YTD.currentTier.toLowerCase());
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
            {/* Symmetric header – title centered, back on start side */}
            <View style={[styles.header, { paddingHorizontal: pad, flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                {rtl ? <Slot /> : <BackBtn />}
                <Text style={[styles.h1, { fontSize: f(22) }]} numberOfLines={1}>{t('membership')}</Text>
                {rtl ? <BackBtn /> : <Slot />}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.statusCard, { margin: pad, padding: pad }]}>
                    <StatusItem label={t('currentTier')} value={currentTierObj ? t(currentTierObj.nameKey) : '-'} />
                    <StatusItem label={t('ytdSpend')} value={fmtCurrency(USER_YTD.spendKWD)} />
                    <StatusItem label={t('orders')} value={String(USER_YTD.purchases)} />
                </View>

                <FlatList
                    data={TIERS}
                    keyExtractor={(it) => it.id}
                    renderItem={({ item }) => <TierCard item={item} />}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingHorizontal: pad, paddingTop: 4, rowGap: gap }}
                    ItemSeparatorComponent={() => <View style={{ height: gap }} />}
                />

                <Text style={[styles.terms, { marginTop: pad, fontSize: f(12), textAlign: 'center' }]}>{t('termsLine')}</Text>
            </ScrollView>

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
                            {t('confirm.plan')}: {t(PLANS.find((p) => p.id === selectedPlan)?.labelKey)}
                            {'\n'}
                            {t('confirm.tier')}: {pendingTierId ? t(TIERS.find((t0) => t0.id === pendingTierId)?.nameKey) : '-'}
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

const createStyles = (COLORS) => StyleSheet.create({
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

    tierCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: COLORS.line },
    tierHeader: { alignItems: 'center', columnGap: 8, paddingRight: 4, paddingLeft: 4 },
    tierDot: { width: 18, height: 18, borderRadius: 9 },
    tierTitle: { fontWeight: '800', color: COLORS.text, flex: 1 },
    badge: { backgroundColor: COLORS.brandSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    badgeTxt: { color: COLORS.brand, fontWeight: '800' },

    split: {},
    subhead: { fontWeight: '800', color: COLORS.text, marginBottom: 6 },
    li: { color: COLORS.text, marginBottom: 4 },

    planRow: { flexWrap: 'wrap' },
    planChip: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, backgroundColor: '#fff' },
    planChipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    planTxt: { color: COLORS.text, fontWeight: '800' },
    planTxtActive: { color: '#fff' },
    planPrice: { color: COLORS.sub, fontWeight: '700' },

    primaryBtn: { backgroundColor: COLORS.text, borderRadius: 10 },
    primaryTxt: { color: '#fff', fontWeight: '800' },

    terms: { color: COLORS.sub },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 },
    sheet: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: COLORS.line },
    sheetHeader: { alignItems: 'center', justifyContent: 'space-between' },
    sheetTitle: { fontWeight: '800', color: COLORS.text },
    closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
    sheetBody: { color: COLORS.text, marginTop: 10, marginBottom: 12 },

    primaryBtnWide: { backgroundColor: COLORS.text, alignItems: 'center', justifyContent: 'center' },
    primaryTxtWide: { color: '#fff', fontWeight: '800' },
});
