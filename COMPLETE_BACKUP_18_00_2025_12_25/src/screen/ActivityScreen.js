// src/screens/ActivityScreen.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ScrollView, Dimensions, Platform, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Svg, { G, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width: W } = Dimensions.get('window');

/* -------------------- Locale months (RTL friendly) -------------------- */
const getMonthNames = (lng = 'en') => {
    try {
        const f = new Intl.DateTimeFormat(lng, { month: 'long' });
        return Array.from({ length: 12 }, (_, i) => f.format(new Date(2024, i, 1)));
    } catch {
        // fallback EN
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }
};
const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

export default function ActivityScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation('activity'); // <-- using "activity" namespace
    const isRTL = i18n?.dir?.() === 'rtl';
    const lang = i18n?.language || 'en';
    const { theme } = useTheme();

    // helper with default fallbacks during wiring
    const tr = (key, fallback) => t(key, { defaultValue: fallback });

    // Theme colors
    const PALETTE = useMemo(() => ({
        bg: theme.bg,
        card: theme.card,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
        brandSoft: theme.p4,
    }), [theme]);

    const styles = useMemo(() => createStyles(PALETTE), [PALETTE]);

    // date state
    const [yearIdx, setYearIdx] = useState(0);
    const [monthIdx, setMonthIdx] = useState(new Date().getMonth());
    const year = YEARS[yearIdx];

    // locale months
    const months = useMemo(() => getMonthNames(lang), [lang]);

    // dynamic data
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [counters, setCounters] = useState({ ordered: 0, received: 0, toReceive: 0 });

    useEffect(() => {
        let isMounted = true;
        const fetchActivityData = async () => {
            try {
                setLoading(true);
                console.log('Activity stats API response:');
                // Get user ID from AsyncStorage
                const userData = await AsyncStorage.getItem('luna_user');

                if (!userData) {
                    if (isMounted) {
                        setLoading(false);
                        setCategories([]);
                        setCounters({ ordered: 0, received: 0, toReceive: 0 });
                    }
                    return;
                }
                const user = JSON.parse(userData);
                const userId = user.user.id;
                console.log('Activity stats API response:', userId);

                if (!userId) {
                    if (isMounted) {
                        setLoading(false);
                        setCategories([]);
                        setCounters({ ordered: 0, received: 0, toReceive: 0 });
                    }
                    return;
                }

                // Fetch activity statistics from API
                const response = await api.post('/order/activity-stats', {
                    user_id: userId,
                    year: year,
                    month: monthIdx, // Send 0-11
                });

                console.log('Activity stats API response:', response.data);

                if (isMounted && response.data.status) {
                    const data = response.data.data;
                    console.log('Activity stats data:', data);
                    setCategories(data.categories || []);
                    setCounters(data.counters || { ordered: 0, received: 0, toReceive: 0 });
                } else if (isMounted) {
                    console.log('Activity stats API returned status false:', response.data);
                    setCategories([]);
                    setCounters({ ordered: 0, received: 0, toReceive: 0 });
                }
            } catch (error) {
                console.log('Error fetching activity stats:', error);
                console.log('Error response:', error.response?.data);
                if (isMounted) {
                    setCategories([]);
                    setCounters({ ordered: 0, received: 0, toReceive: 0 });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchActivityData();

        return () => {
            isMounted = false;
        };
    }, [year, monthIdx]);

    const total = useMemo(
        () => categories.reduce((s, c) => s + Math.max(0, Number(c.amount) || 0), 0),
        [categories]
    );

    /* -------------------- Donut sizing -------------------- */
    const RING_SIZE = Math.min(360, Math.max(260, Math.round(W * 0.72)));
    const OUTER_R = Math.round(RING_SIZE * 0.36);
    const STROKE = Math.max(14, Math.round(RING_SIZE * 0.065));
    const INNER_R = OUTER_R - STROKE - 8;
    const CIRC = 2 * Math.PI * OUTER_R;

    /* -------------------- Segments: proportional by amount -------------------- */
    const segments = useMemo(() => {
        const n = categories.length;
        if (!n) return [];
        const amounts = categories.map(c => Math.max(0, +c.amount || 0));
        const sum = amounts.reduce((a, b) => a + b, 0);
        const lens = sum > 0 ? amounts.map(a => (a / sum) * CIRC) : Array(n).fill(CIRC / n);
        const sumFirst = lens.slice(0, -1).reduce((a, b) => a + b, 0);
        lens[lens.length - 1] = Math.max(0, CIRC - sumFirst);

        let start = 0;
        return categories.map((c, i) => {
            const len = lens[i];
            const id = `${c.key}-${i}`;
            const offset = CIRC - start;
            start += len;
            // NOTE: we are already in 'activity' namespace → no 'activity.' prefix
            const label = t(`categories.${c.key}`, { defaultValue: c.label });
            return { id, color: c.color, len, offset, label, amount: amounts[i] };
        });
    }, [categories, CIRC, t]);

    /* -------------------- Percentages for legend -------------------- */
    const itemsWithPercent = useMemo(() => {
        const denom = total > 0 ? total : 1;
        return segments.map(s => ({ ...s, percent: (s.amount / denom) * 100 }));
    }, [segments, total]);

    /* -------------------- Month / Year actions -------------------- */
    const canPrevMonth = yearIdx < YEARS.length - 1 || monthIdx > 0;
    const canNextMonth = yearIdx > 0 || monthIdx < 11;
    const goPrevMonth = () => {
        if (!canPrevMonth) return;
        if (monthIdx > 0) setMonthIdx(m => m - 1);
        else if (yearIdx < YEARS.length - 1) { setYearIdx(y => y + 1); setMonthIdx(11); }
    };
    const goNextMonth = () => {
        if (!canNextMonth) return;
        if (monthIdx < 11) setMonthIdx(m => m + 1);
        else if (yearIdx > 0) { setYearIdx(y => y - 1); setMonthIdx(0); }
    };

    /* -------------------- Tooltip logic -------------------- */
    const [activeIdx, setActiveIdx] = useState(null);
    const [tip, setTip] = useState(null);
    const svgRef = useRef(null);

    const pickSegmentFromPoint = (x, y) => {
        const cx = RING_SIZE / 2;
        const cy = RING_SIZE / 2;
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.hypot(dx, dy);

        if (r < INNER_R || r > OUTER_R + STROKE / 2) return null;

        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const a = (angle + 360) % 360;     // 0..360
        const progress = (a + 90) % 360;   // 0 at 12 o'clock
        const pos = (progress / 360) * CIRC;

        let acc = 0;
        for (let i = 0; i < segments.length; i++) {
            acc += segments[i].len;
            if (pos <= acc) return i;
        }
        return segments.length - 1;
    };

    const onSvgPress = (evt) => {
        const { locationX, locationY } = evt?.nativeEvent || {};
        if (locationX == null || locationY == null) return;
        const idx = pickSegmentFromPoint(locationX, locationY);
        if (idx == null) {
            setActiveIdx(null);
            setTip(null);
            return;
        }
        setActiveIdx(idx);
        const pad = 12;
        const x = Math.min(Math.max(locationX, pad), RING_SIZE - pad);
        const y = Math.min(Math.max(locationY, pad), RING_SIZE - pad);
        setTip({ x, y });
    };

    const money = (n) => {
        try {
            // Use BHD currency with 3 decimal places
            return new Intl.NumberFormat(lang === 'ar' ? 'ar-BH' : 'en-BH', {
                style: 'currency',
                currency: 'BHD',
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
            }).format(n);
        } catch {
            return `${Number(n).toFixed(3)} BHD`;
        }
    };

    /* -------------------- Small UI blocks -------------------- */
    const LegendPill = ({ color, label, amount, percent, index }) => {
        const active = index === activeIdx;
        return (
            <TouchableOpacity
                onPress={() => setActiveIdx(active ? null : index)}
                activeOpacity={0.8}
                style={[styles.legendPill, { borderColor: color }, active && { backgroundColor: PALETTE.brandSoft }]}
            >
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.legendLabel} numberOfLines={1}>{label}</Text>
                    <Text style={styles.legendSub}>
                        {percent.toFixed(1)}% • {money(amount)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const StatCard = ({ value, label, onPress }) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.statWrap}>
            <View style={styles.statOuter}>
                <View style={styles.statInner}>
                    <Text style={styles.statNumber}>{value}</Text>
                </View>
            </View>
            <Text style={styles.statLabel}>{label}</Text>
        </TouchableOpacity>
    );

    /* -------------------- Render -------------------- */
    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                <StandardHeader
                    title={tr('title', 'My Activity')}
                    navigation={navigation}
                    showGradient={true}
                />
                <SkeletonListScreen />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* Standard Header */}
            <StandardHeader
                title={tr('title', 'My Activity')}
                navigation={navigation}
                showGradient={true}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>

                {/* Year chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.yearRow, isRTL && { flexDirection: 'row-reverse' }]}
                >
                    {YEARS.map((y, i) => {
                        const active = i === yearIdx;
                        return (
                            <TouchableOpacity key={y} onPress={() => setYearIdx(i)} style={[styles.yearChip, active && styles.yearChipActive]}>
                                <Text style={[styles.yearTxt, active && styles.yearTxtActive]}>{y}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Month strip */}
                <View style={styles.monthStrip}>
                    <TouchableOpacity onPress={goPrevMonth} disabled={!canPrevMonth} style={[styles.arrowBtn, !canPrevMonth && { opacity: 0.4 }]}>
                        <Feather name={isRTL ? 'chevron-right' : 'chevron-left'} size={20} color={PALETTE.brand} />
                    </TouchableOpacity>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.monthRow, isRTL && { flexDirection: 'row-reverse' }]}
                    >
                        {months.map((m, i) => {
                            const active = i === monthIdx;
                            return (
                                <TouchableOpacity key={`${m}-${i}`} onPress={() => setMonthIdx(i)} style={[styles.monthChip, active && styles.monthChipActive]}>
                                    <Text style={[styles.monthTxt, active && styles.monthTxtActive]} numberOfLines={1}>{m}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity onPress={goNextMonth} disabled={!canNextMonth} style={[styles.arrowBtn, !canNextMonth && { opacity: 0.4 }]}>
                        <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={PALETTE.brand} />
                    </TouchableOpacity>
                </View>

                {/* Card: donut + legend */}
                <View style={[styles.card, { paddingBottom: 18 }]}>
                    <View style={{ alignItems: 'center', marginTop: 8 }}>
                        <View style={[styles.donutWrap, { width: RING_SIZE, height: RING_SIZE }]}>
                            <Svg width={RING_SIZE} height={RING_SIZE} onPress={onSvgPress}>
                                <G originX={RING_SIZE / 2} originY={RING_SIZE / 2} rotation={-90}>
                                    {/* Rail */}
                                    <Circle
                                        cx={RING_SIZE / 2}
                                        cy={RING_SIZE / 2}
                                        r={OUTER_R}
                                        stroke={PALETTE.brandSoft}
                                        strokeWidth={STROKE}
                                        fill="none"
                                    />
                                    {/* Slices */}
                                    {!loading && segments.map((seg, i) => (
                                        <Circle
                                            key={seg.id}
                                            cx={RING_SIZE / 2}
                                            cy={RING_SIZE / 2}
                                            r={OUTER_R}
                                            stroke={seg.color}
                                            strokeWidth={STROKE}
                                            strokeDasharray={[seg.len, CIRC - seg.len]}
                                            strokeDashoffset={seg.offset}
                                            strokeLinecap="butt"
                                            fill="none"
                                            opacity={activeIdx != null && activeIdx !== i ? 0.35 : 1}
                                        />
                                    ))}
                                </G>
                            </Svg>

                            {/* Center total / loading */}
                            <View
                                style={[
                                    styles.centerDisk,
                                    {
                                        width: INNER_R * 2,
                                        height: INNER_R * 2,
                                        borderRadius: INNER_R,
                                        left: (RING_SIZE - INNER_R * 2) / 2,
                                        top: (RING_SIZE - INNER_R * 2) / 2,
                                        backgroundColor: PALETTE.card,
                                        borderColor: PALETTE.line,
                                    },
                                ]}
                            >
                                <Text style={styles.centerLabel}>
                                    {loading ? tr('loading', 'Loading') : tr('total', 'Total')}
                                </Text>
                                <Text style={styles.centerValue}>{loading ? '…' : money(total)}</Text>
                            </View>

                            {/* Tooltip */}
                            {tip && activeIdx != null && itemsWithPercent[activeIdx] && (
                                <View
                                    pointerEvents="none"
                                    style={[
                                        styles.tooltip,
                                        {
                                            left: Math.max(8, Math.min(tip.x - 70, RING_SIZE - 140 - 8)),
                                            top: Math.max(8, Math.min(tip.y - 50, RING_SIZE - 80 - 8)),
                                            borderColor: itemsWithPercent[activeIdx].color,
                                            backgroundColor: PALETTE.card,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.tooltipTitle, { color: itemsWithPercent[activeIdx].color }]}>
                                        {itemsWithPercent[activeIdx].label}
                                    </Text>
                                    <Text style={styles.tooltipLine}>{itemsWithPercent[activeIdx].percent.toFixed(1)}%</Text>
                                    <Text style={styles.tooltipLine}>{money(itemsWithPercent[activeIdx].amount)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legendWrap}>
                        {itemsWithPercent.map((it, idx) => (
                            <LegendPill
                                key={it.id}
                                index={idx}
                                color={it.color}
                                label={it.label}
                                amount={it.amount}
                                percent={it.percent}
                            />
                        ))}
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <StatCard
                        value={counters.ordered}
                        label={tr('ordered', 'Ordered')}
                        onPress={() => navigation.navigate('HistoryScreen')}
                    />
                    <StatCard
                        value={counters.received}
                        label={tr('received', 'Received')}
                        onPress={() => navigation.navigate('HistoryScreen', { filter: 'delivered' })}
                    />
                    <StatCard
                        value={counters.toReceive}
                        label={tr('toReceive', 'To Receive')}
                        onPress={() => navigation.navigate('ToReceiveOrdersScreen')}
                    />
                </View>

                {/* CTA */}
                <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('HistoryScreen')} activeOpacity={0.9}>
                    <Text style={styles.ctaTxt}>{tr('orderHistory', 'Order History')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

/* -------------------- Styles -------------------- */
const createStyles = (PALETTE) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: PALETTE.bg },

    /* Year row */
    yearRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    yearChip: {
        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
        backgroundColor: PALETTE.card, borderWidth: 1, borderColor: PALETTE.line,
    },
    yearChipActive: { backgroundColor: PALETTE.brandSoft, borderColor: PALETTE.brand },
    yearTxt: { color: PALETTE.text, fontWeight: '800' },
    yearTxtActive: { color: PALETTE.brand },

    /* Month strip */
    monthStrip: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: 12,
        paddingHorizontal: 4, paddingVertical: 6, backgroundColor: PALETTE.brandSoft,
        borderRadius: 14, borderWidth: 1, borderColor: PALETTE.line,
    },
    arrowBtn: {
        width: 36, height: 36, borderRadius: 18, borderWidth: 1,
        borderColor: PALETTE.line, backgroundColor: PALETTE.card,
        alignItems: 'center', justifyContent: 'center',
    },
    monthRow: { paddingHorizontal: 8, gap: 10 },
    monthChip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16,
        backgroundColor: PALETTE.card, borderWidth: 1, borderColor: PALETTE.line, marginRight: 8,
    },
    monthChipActive: { backgroundColor: PALETTE.brand, borderColor: PALETTE.brand },
    monthTxt: { color: PALETTE.text, fontWeight: '800' },
    monthTxtActive: { color: '#fff' },

    /* Card */
    card: {
        margin: 16, backgroundColor: PALETTE.card, borderRadius: 18,
        borderWidth: 1, borderColor: PALETTE.line,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
            android: { elevation: 2 },
        }),
        paddingTop: 10,
    },

    /* Donut */
    donutWrap: { position: 'relative' },
    centerDisk: {
        position: 'absolute', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
            android: { elevation: 2 },
        }),
    },
    centerLabel: { color: PALETTE.sub, fontWeight: '700', marginBottom: 4 },
    centerValue: { color: PALETTE.text, fontSize: 20, fontWeight: '900' },

    /* Tooltip */
    tooltip: {
        position: 'absolute',
        width: 140,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 8 } },
            android: { elevation: 3 },
        }),
    },
    tooltipTitle: { fontWeight: '900', marginBottom: 2 },
    tooltipLine: { color: PALETTE.text, fontWeight: '700' },

    /* Legend */
    legendWrap: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
        paddingHorizontal: 16, marginTop: 12,
    },
    legendPill: {
        flexBasis: '48%', paddingVertical: 10, paddingHorizontal: 12,
        borderRadius: 12, borderWidth: 1.5, backgroundColor: PALETTE.card,
        flexDirection: 'row', alignItems: 'center',
    },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendLabel: { color: PALETTE.text, fontWeight: '800' },
    legendSub: { color: PALETTE.sub, fontWeight: '700', marginTop: 2 },

    /* Stats */
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-around',
        marginHorizontal: 16, marginTop: 6, marginBottom: 18,
    },
    statWrap: { alignItems: 'center' },
    statOuter: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: PALETTE.brandSoft,
        alignItems: 'center', justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
            android: { elevation: 2 },
        }),
    },
    statInner: {
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: PALETTE.brand,
        alignItems: 'center', justifyContent: 'center',
    },
    statNumber: { color: '#fff', fontSize: 18, fontWeight: '900' },
    statLabel: { marginTop: 6, color: PALETTE.text, fontWeight: '700' },

    /* CTA */
    cta: {
        marginHorizontal: 16, backgroundColor: PALETTE.brand,
        borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 52,
    },
    ctaTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
