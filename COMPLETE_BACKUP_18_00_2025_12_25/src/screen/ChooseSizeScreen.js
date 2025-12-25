import React, { useMemo, useState } from 'react';
import {
    SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Platform, I18nManager, useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

/* helpers */
const toInches = (cm) => (cm ? cm / 2.54 : 0);
const toCm = (inch) => (inch ? inch * 2.54 : 0);
const toLbs = (kg) => (kg ? kg * 2.2046226218 : 0);
const toKg = (lbs) => (lbs ? lbs / 2.2046226218 : 0);

const Row = ({ children, style }) => <View style={[styles.row, style]}>{children}</View>;
const Pill = ({ active, children, onPress, style }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
            styles.pill,
            active && { backgroundColor: '#EEF2FF', borderColor: PRIMARY },
            style,
        ]}>
        <Text style={[styles.pillText, active && { color: PRIMARY, fontWeight: '700' }]}>{children}</Text>
    </TouchableOpacity>
);
const Chip = ({ active, label, onPress, icon }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.chip, active && { borderColor: PRIMARY, backgroundColor: '#EEF2FF' }]}>
        {!!icon && <Ionicons name={icon} size={16} color={active ? PRIMARY : SUBTLE} />}
        <Text style={[styles.chipText, active && { color: PRIMARY, fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
);
const InputBox = ({ value, onChangeText, placeholder, keyboardType = 'numeric', right }) => (
    <View style={styles.inputWrap}>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            style={styles.input}
        />
        {right}
    </View>
);
const Labeled = ({ label, children, optional }) => (
    <View style={{ marginBottom: 14 }}>
        <Row style={{ marginBottom: 6 }}>
            <Text style={styles.label}>{label}</Text>
            {optional ? <Text style={styles.optional}>• {optional}</Text> : null}
        </Row>
        {children}
    </View>
);

export default function SizeProfileScreen({ navigation, route }) {
    const { t, i18n } = useTranslation('size');
    const isRTL = I18nManager.isRTL || i18n.dir?.() === 'rtl';

    // responsiveness
    const { width } = useWindowDimensions();
    const scale = Math.min(Math.max(width / 375, 0.9), 1.15);
    const fs = (n) => Math.round(n * scale);

    // tabs
    const [tab, setTab] = useState('Woman'); // Man / Woman / Kids

    // adults
    const bodyShapes = [
        'rectangle', 'hourglass', 'pear', 'apple', 'invertedTriangle', 'oval',
    ];
    const [shape, setShape] = useState('hourglass');
    const [useMetric, setUseMetric] = useState(true);
    const [heightCm, setHeightCm] = useState('180');
    const [heightIn, setHeightIn] = useState('71');
    const [weightKg, setWeightKg] = useState('73');
    const [weightLb, setWeightLb] = useState('161');
    const [bustCm, setBustCm] = useState('');
    const [waistCm, setWaistCm] = useState('');
    const [hipsCm, setHipsCm] = useState('');
    const [pref, setPref] = useState('tts'); // tts / slim / relaxed

    // kids
    const [kidGender, setKidGender] = useState('boy'); // boy | girl | na
    const [age, setAge] = useState('5');
    const [kidHeightCm, setKidHeightCm] = useState('112');
    const [kidHeightIn, setKidHeightIn] = useState('44');
    const [kidWeightKg, setKidWeightKg] = useState('19');
    const [kidWeightLb, setKidWeightLb] = useState('42');
    const [kidChestMode, setKidChestMode] = useState('none'); // none | tts

    const toggleUnits = () => {
        if (useMetric) {
            setHeightIn(String(Math.round(toInches(Number(heightCm)) || 0)));
            setWeightLb(String(Math.round(toLbs(Number(weightKg)) || 0)));
            setKidHeightIn(String(Math.round(toInches(Number(kidHeightCm)) || 0)));
            setKidWeightLb(String(Math.round(toLbs(Number(kidWeightKg)) || 0)));
        } else {
            setHeightCm(String(Math.round(toCm(Number(heightIn)) || 0)));
            setWeightKg(String(Math.round(toKg(Number(weightLb)) || 0)));
            setKidHeightCm(String(Math.round(toCm(Number(kidHeightIn)) || 0)));
            setKidWeightKg(String(Math.round(toKg(Number(kidWeightLb)) || 0)));
        }
        setUseMetric(!useMetric);
    };

    const validAdult = useMemo(() => {
        const h = useMetric ? Number(heightCm) : Number(heightIn);
        const w = useMetric ? Number(weightKg) : Number(weightLb);
        return h > 0 && w > 0;
    }, [useMetric, heightCm, heightIn, weightKg, weightLb]);

    const validKid = useMemo(() => {
        const h = useMetric ? Number(kidHeightCm) : Number(kidHeightIn);
        const w = useMetric ? Number(kidWeightKg) : Number(kidWeightLb);
        return age && h > 0 && w > 0;
    }, [age, useMetric, kidHeightCm, kidHeightIn, kidWeightKg, kidWeightLb]);

    const onSubmit = () => {
        if (tab === 'Kids' && !validKid) return;
        if (tab !== 'Kids' && !validAdult) return;

        const payload =
            tab === 'Kids'
                ? {
                    type: 'kid',
                    gender: kidGender,
                    age: Number(age),
                    height_cm: useMetric ? Number(kidHeightCm) : Math.round(toCm(Number(kidHeightIn))),
                    weight_kg: useMetric ? Number(kidWeightKg) : Number(toKg(Number(kidWeightLb)).toFixed(1)),
                    chest_pref: kidChestMode,
                }
                : {
                    type: 'adult',
                    tab,
                    body_shape: shape,
                    height_cm: useMetric ? Number(heightCm) : Math.round(toCm(Number(heightIn))),
                    weight_kg: useMetric ? Number(weightKg) : Number(toKg(Number(weightLb)).toFixed(1)),
                    bust_cm: bustCm ? Number(bustCm) : null,
                    waist_cm: waistCm ? Number(waistCm) : null,
                    hips_cm: hipsCm ? Number(hipsCm) : null,
                    fit_preference: pref,
                };

        if (route?.params?.onDone) route.params.onDone(payload);
        navigation?.goBack?.();
    };

    const headerTitle = tab === 'Kids' ? t('header.kid') : t('header.adult');

    return (
        <SafeAreaView style={[styles.container, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* Header: centered title + back button fixed LEFT (even in RTL) */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation?.goBack?.()}
                    style={[styles.navBtn, { left: 12 }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={t('a11y.back')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={22} color={TEXT} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: fs(20) }]}>{headerTitle}</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
                <View style={styles.card}>
                    <Text style={[styles.title, { fontSize: fs(22) }]}>
                        {tab === 'Kids' ? t('titles.kid') : t('titles.adult')}
                    </Text>
                    <Text style={[styles.subtitle, { fontSize: fs(13) }]}>
                        {tab === 'Kids' ? t('subtitles.kid') : t('subtitles.adult')}
                    </Text>

                    {/* Tabs */}
                    <Row style={{ marginTop: 12 }}>
                        {['Man', 'Woman', 'Kids'].map((tKey, i) => (
                            <TouchableOpacity
                                key={tKey}
                                onPress={() => setTab(tKey)}
                                style={[styles.tab, tab === tKey && { backgroundColor: PRIMARY }, i === 2 && { marginRight: 0 }]}
                                activeOpacity={0.9}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        { fontSize: fs(14) },
                                        tab === tKey && { color: '#fff', fontWeight: '700' },
                                    ]}>
                                    {t(`tabs.${tKey.toLowerCase()}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </Row>

                    {/* Kids */}
                    {tab === 'Kids' ? (
                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.sectionTitle}>{t('gender')}</Text>
                            <Row style={{ gap: 10, marginBottom: 8 }}>
                                <Pill active={kidGender === 'boy'} onPress={() => setKidGender('boy')}>{t('kidGender.boy')}</Pill>
                                <Pill active={kidGender === 'girl'} onPress={() => setKidGender('girl')}>{t('kidGender.girl')}</Pill>
                                <Pill active={kidGender === 'na'} onPress={() => setKidGender('na')}>{t('kidGender.na')}</Pill>
                            </Row>

                            <Labeled label={t('age')}>
                                <InputBox
                                    value={age}
                                    onChangeText={setAge}
                                    placeholder={t('units.years')}
                                    right={<Text style={styles.inputSuffix}>{t('units.years')}</Text>}
                                />
                            </Labeled>

                            <Row style={{ gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Labeled label={t('height')}>
                                        <InputBox
                                            value={useMetric ? kidHeightCm : kidHeightIn}
                                            onChangeText={(v) => (useMetric ? setKidHeightCm(v) : setKidHeightIn(v))}
                                            placeholder={useMetric ? t('units.cm') : t('units.in')}
                                            right={<Text style={styles.inputSuffix}>{useMetric ? t('units.cm') : t('units.in')}</Text>}
                                        />
                                    </Labeled>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Labeled label={t('weight')}>
                                        <InputBox
                                            value={useMetric ? kidWeightKg : kidWeightLb}
                                            onChangeText={(v) => (useMetric ? setKidWeightKg(v) : setKidWeightLb(v))}
                                            placeholder={useMetric ? t('units.kg') : t('units.lbs')}
                                            right={<Text style={styles.inputSuffix}>{useMetric ? t('units.kg') : t('units.lbs')}</Text>}
                                        />
                                    </Labeled>
                                </View>
                            </Row>

                            <TouchableOpacity onPress={toggleUnits} style={styles.unitToggle}>
                                <Text style={styles.unitToggleText}>
                                    {useMetric ? t('hints.kidMetric') : t('hints.kidImperial')}
                                </Text>
                            </TouchableOpacity>

                            <Labeled label={t('chest')} optional={t('optional')}>
                                <Row style={{ gap: 10 }}>
                                    <Chip label={t('preferNoSelect')} active={kidChestMode === 'none'} onPress={() => setKidChestMode('none')} icon="eye-off-outline" />
                                    <Chip label={t('trueToSize')} active={kidChestMode === 'tts'} onPress={() => setKidChestMode('tts')} icon="checkmark-circle-outline" />
                                </Row>
                            </Labeled>

                            <Row style={{ gap: 12, marginTop: 8 }}>
                                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation?.goBack?.()}>
                                    <Text style={[styles.btnText, { color: TEXT, fontSize: fs(16) }]}>{t('skip')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, !validKid && styles.btnDisabled]} onPress={onSubmit} disabled={!validKid}>
                                    <Text style={[styles.btnText, { fontSize: fs(16) }]}>{t('submit')}</Text>
                                </TouchableOpacity>
                            </Row>
                        </View>
                    ) : (
                        /* Adults */
                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.sectionTitle}>{t('bodyShape')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
                                <Row style={{ gap: 10 }}>
                                    {bodyShapes.map((key) => (
                                        <Chip key={key} label={t(`shapes.${key}`)} active={shape === key} onPress={() => setShape(key)} icon="body-outline" />
                                    ))}
                                </Row>
                            </ScrollView>

                            <Labeled label={t('height')}>
                                <InputBox
                                    value={useMetric ? heightCm : heightIn}
                                    onChangeText={(v) => (useMetric ? setHeightCm(v) : setHeightIn(v))}
                                    placeholder={useMetric ? t('units.cm') : t('units.in')}
                                    right={<Text style={styles.inputSuffix}>{useMetric ? t('units.cm') : t('units.in')}</Text>}
                                />
                            </Labeled>

                            <Labeled label={t('weight')}>
                                <InputBox
                                    value={useMetric ? weightKg : weightLb}
                                    onChangeText={(v) => (useMetric ? setWeightKg(v) : setWeightLb(v))}
                                    placeholder={useMetric ? t('units.kg') : t('units.lbs')}
                                    right={<Text style={styles.inputSuffix}>{useMetric ? t('units.kg') : t('units.lbs')}</Text>}
                                />
                            </Labeled>

                            <TouchableOpacity onPress={toggleUnits} style={styles.unitToggle}>
                                <Text style={styles.unitToggleText}>
                                    {useMetric ? t('hints.adultMetric') : t('hints.adultImperial')}
                                </Text>
                            </TouchableOpacity>

                            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('optional')}</Text>

                            <Row style={{ gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Labeled label={tab === 'Woman' ? t('bust') : t('chestSize')} optional>
                                        <InputBox value={bustCm} onChangeText={setBustCm} placeholder={t('units.cm')} right={<Text style={styles.inputSuffix}>{t('units.cm')}</Text>} />
                                    </Labeled>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Labeled label={t('waist')} optional>
                                        <InputBox value={waistCm} onChangeText={setWaistCm} placeholder={t('units.cm')} right={<Text style={styles.inputSuffix}>{t('units.cm')}</Text>} />
                                    </Labeled>
                                </View>
                            </Row>
                            <Labeled label={t('hips')} optional>
                                <InputBox value={hipsCm} onChangeText={setHipsCm} placeholder={t('units.cm')} right={<Text style={styles.inputSuffix}>{t('units.cm')}</Text>} />
                            </Labeled>

                            <Labeled label={t('preference')}>
                                <Row style={{ gap: 10 }}>
                                    <Chip label={t('trueToSize')} active={pref === 'tts'} onPress={() => setPref('tts')} icon="checkmark-circle-outline" />
                                    <Chip label={t('slim')} active={pref === 'slim'} onPress={() => setPref('slim')} icon="shirt-outline" />
                                    <Chip label={t('relaxed')} active={pref === 'relaxed'} onPress={() => setPref('relaxed')} icon="shirt-outline" />
                                </Row>
                            </Labeled>

                            <Row style={{ gap: 12, marginTop: 8 }}>
                                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => navigation?.goBack?.()}>
                                    <Text style={[styles.btnText, { color: TEXT, fontSize: fs(16) }]}>{t('skip')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, !validAdult && styles.btnDisabled]} onPress={onSubmit} disabled={!validAdult}>
                                    <Text style={[styles.btnText, { fontSize: fs(16) }]}>{t('submit')}</Text>
                                </TouchableOpacity>
                            </Row>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* styles */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG },
    header: { height: 56, alignItems: 'center', justifyContent: 'center' },
    navBtn: { position: 'absolute', top: 0, bottom: 0, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    headerTitle: { fontWeight: '800', color: TEXT },

    card: {
        backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
    },
    title: { fontWeight: '800', color: TEXT },
    subtitle: { color: SUBTLE, marginTop: 6 },

    row: { flexDirection: 'row', alignItems: 'center' },

    tab: { flex: 1, backgroundColor: '#EFF6FF', paddingVertical: 10, borderRadius: 10, marginRight: 10, alignItems: 'center' },
    tabText: { color: PRIMARY, fontWeight: '600' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 8 },

    pill: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
    pillText: { color: TEXT, fontSize: 14 },

    chip: {
        flexDirection: 'row', alignItems: 'center', columnGap: 6, borderWidth: 1, borderColor: BORDER, backgroundColor: '#fff',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    },
    chipText: { fontSize: 12, color: SUBTLE },

    inputWrap: {
        borderWidth: 1, borderColor: BORDER, borderRadius: 12, backgroundColor: '#fff',
        paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 6, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
    },
    input: { flex: 1, color: TEXT, fontSize: 14, paddingRight: 10 },
    inputSuffix: { color: SUBTLE, fontSize: 12 },

    label: { color: TEXT, fontWeight: '700' },
    optional: { marginLeft: 8, color: SUBTLE },

    unitToggle: { alignSelf: 'flex-start', marginBottom: 2, marginTop: -4 },
    unitToggleText: { color: PRIMARY, fontWeight: '700' },

    btn: { flex: 1, backgroundColor: PRIMARY, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: '#fff', fontWeight: '700' },
});
