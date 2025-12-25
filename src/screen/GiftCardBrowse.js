import React, { useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ImageBackground,
    Dimensions,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { I18nManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { getImageUrl } from '../config/api';

const { width } = Dimensions.get('window');

const CHIP_H = 40;
const TILE_H = 150;
const RADIUS = 18;

const TABS = [
    { slug: 'all' },
    { slug: 'birthday' },
    { slug: 'anniversary' },
    { slug: 'holiday' },
    { slug: 'thankyou' },
    { slug: 'congrats' },
];

export default function GiftCardTemplatePicker({ navigation, onBack, onNext }) {
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
        disabled: theme.disabled,
        danger: theme.danger,
        isDark,
    }), [theme, isDark]);

    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const [giftCards, setGiftCards] = useState([]);
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedCardId, setSelectedCardId] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState({});

    // Fetch gift cards from API
    const fetchGiftCards = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/gift-card/get-all');
            
            if (response.data.status && response.data.gift_cards) {
                // Map API data to match expected format
                const formattedCards = response.data.gift_cards.map((card) => ({
                    id: card.id,
                    title: card.title,
                    description: card.description,
                    image: card.image || null,
                    price: card.price,
                    value: card.value,
                    discount: card.discount,
                    validity_days: card.validity_days,
                    // Map to category for filtering (you can adjust this based on your data)
                    category: 'all', // Default category
                }));
                setGiftCards(formattedCards);
            } else {
                setGiftCards([]);
            }
        } catch (error) {
            console.log('Error fetching gift cards:', error);
            setGiftCards([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchGiftCards();
    }, [fetchGiftCards]);

    const filteredCards = useMemo(() => {
        if (selectedTab === 'all') return giftCards;
        return giftCards.filter((c) => c.category === selectedTab);
    }, [selectedTab, giftCards]);

    const selectedCard = useMemo(
        () => giftCards.find((c) => c.id === selectedCardId) || null,
        [selectedCardId, giftCards]
    );

    const styles = useMemo(() => createStyles(COLORS), [COLORS]);

    const handleBack = useCallback(() => (onBack ? onBack() : navigation?.goBack?.()), [onBack, navigation]);

    const isValidEmailPhone = useCallback((text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9+\-\s]{7,}$/;
        return emailRegex.test(text) || phoneRegex.test(text);
    }, []);

    const openModal = useCallback(() => { 
        if (selectedCard) {
            // Pre-fill amount with gift card value if available
            if (selectedCard.value && !amount) {
                setAmount(selectedCard.value.toString());
            }
            setShowModal(true);
        }
    }, [selectedCard, amount]);

    const closeModal = useCallback(() => setShowModal(false), []);

    const validate = useCallback(() => {
        const e = {};
        if (!name.trim()) e.name = t('errors.required', { defaultValue: 'Required' });
        if (!contact.trim()) e.contact = t('errors.required', { defaultValue: 'Required' });
        else if (!isValidEmailPhone(contact.trim()))
            e.contact = t('errors.validContact', { defaultValue: 'Enter valid email or phone' });
        if (!amount.trim()) e.amount = t('errors.required', { defaultValue: 'Required' });
        else if (isNaN(Number(amount)) || Number(amount) <= 0)
            e.amount = t('errors.validAmount', { defaultValue: 'Enter valid amount' });
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [name, contact, amount, isValidEmailPhone, t]);

    const handleProceed = useCallback(() => {
        if (!validate()) return;
        // Use gift card value if amount not provided
        const finalAmount = amount ? Number(amount) : (selectedCard?.value || selectedCard?.price || 0);
        const payload = { 
            selectedCard, 
            form: { 
                name, 
                contact, 
                message, 
                amount: finalAmount 
            } 
        };
        if (onNext) onNext(payload);
        else navigation?.navigate?.('GiftCardReviewPay', payload);
    }, [validate, amount, selectedCard, name, contact, message, onNext, navigation]);

    const renderCard = ({ item }) => {
        const selected = item.id === selectedCardId;
        const imageUri = item.image ? getImageUrl(item.image) : null;
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedCardId(item.id)}
                style={[styles.tileWrap, selected && styles.tileWrapSelected]}
            >
                {imageUri ? (
                    <ImageBackground 
                        source={{ uri: imageUri }} 
                        style={styles.tile} 
                        imageStyle={styles.tileImg}
                    >
                        <View style={styles.tileOverlay} />
                        <Text style={[styles.tileTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.value && (
                            <Text style={[styles.tileValue, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                                {item.value} BHD
                            </Text>
                        )}
                        {selected && <View style={styles.tileSelectedGlow} />}
                    </ImageBackground>
                ) : (
                    <View style={[styles.tile, { backgroundColor: COLORS.panel, alignItems: 'center', justifyContent: 'center' }]}>
                        <Icon name="gift" size={40} color={COLORS.accent} />
                        <View style={styles.tileOverlay} />
                        <Text style={[styles.tileTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.value && (
                            <Text style={[styles.tileValue, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                                {item.value} BHD
                            </Text>
                        )}
                        {selected && <View style={styles.tileSelectedGlow} />}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                <StandardHeader
                    title={t('title', { defaultValue: 'Luna Gift Cards' })}
                    navigation={navigation}
                    showGradient={true}
                />
                <SkeletonListScreen />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>

            {/* HEADER */}
            <StandardHeader
                title={t('title', { defaultValue: 'Luna Gift Cards' })}
                navigation={navigation}
                showGradient={true}
            />

            {/* TABS */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabsWrap}
                contentContainerStyle={[styles.tabsRow, isRTL && { flexDirection: 'row-reverse' }]}
            >
                {TABS.map((tab) => {
                    const active = selectedTab === tab.slug;
                    return (
                        <TouchableOpacity
                            key={tab.slug}
                            onPress={() => setSelectedTab(tab.slug)}
                            activeOpacity={0.85}
                            style={[styles.chip, active && styles.chipActive, isRTL && { marginRight: 0, marginLeft: 10 }]}
                        >
                            <Text numberOfLines={1} style={[styles.chipText, active && styles.chipTextActive]}>
                                {t(`tabs.${tab.slug}`, {
                                    defaultValue:
                                        tab.slug === 'all' ? 'All Occasions'
                                            : tab.slug === 'birthday' ? 'Birthday'
                                                : tab.slug === 'anniversary' ? 'Anniversary'
                                                    : tab.slug === 'holiday' ? 'Holiday'
                                                        : tab.slug === 'thankyou' ? 'Thank You'
                                                            : 'Congratulations',
                                })}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* GRID */}
            <View style={styles.gridPanel}>
                <FlatList
                    data={filteredCards}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCard}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0, paddingBottom: 8 }}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>{t('noCards', { defaultValue: 'No cards in this category.' })}</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
                <View style={[styles.selectedInfo, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={styles.selectedLabel}>{t('selectedLabel', { defaultValue: 'Selected Card:' })} </Text>
                    <Text style={styles.selectedValue}>{selectedCard ? selectedCard.title : '—'}</Text>
                </View>
                <TouchableOpacity
                    disabled={!selectedCard}
                    activeOpacity={0.85}
                    onPress={openModal}
                    style={[styles.btnPrimary, !selectedCard && { backgroundColor: COLORS.disabled }]}
                >
                    <Text style={styles.btnPrimaryText}>{t('next', { defaultValue: 'NEXT' })}</Text>
                </TouchableOpacity>
            </View>

            {/* MODAL (no backdrop tap to close) */}
            <Modal visible={showModal} animationType="slide" transparent onRequestClose={closeModal}>
                <View style={styles.modalBackdrop} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalCard}
                >
                    <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.modalTitle}>{t('enterDetails', { defaultValue: 'Enter Details' })}</Text>
                        <TouchableOpacity onPress={closeModal} style={[styles.modalClose, isRTL && { right: undefined, left: 6 }]}>
                            <Text style={{ color: COLORS.text, fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedCard && (
                        <Text style={[styles.modalSub, isRTL && { textAlign: 'right' }]}>
                            {t('cardPrefix', { defaultValue: 'Card:' })}{' '}
                            <Text style={{ fontWeight: '800', color: COLORS.text }}>{selectedCard.title}</Text>
                        </Text>
                    )}

                    {/* Name */}
                    <View style={styles.field}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('name', { defaultValue: 'Name' })}</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder={t('phName', { defaultValue: 'Enter your name' })}
                            placeholderTextColor="#7f858e"
                            style={[styles.input, errors.name && styles.inputError]}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        {!!errors.name && <Text style={styles.errText}>{errors.name}</Text>}
                    </View>

                    {/* Contact */}
                    <View style={styles.field}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('contact', { defaultValue: 'Email / Phone' })}</Text>
                        <TextInput
                            value={contact}
                            onChangeText={setContact}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder={t('phContact', { defaultValue: 'you@example.com or +1 555 123 4567' })}
                            placeholderTextColor="#7f858e"
                            style={[styles.input, errors.contact && styles.inputError]}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        {!!errors.contact && <Text style={styles.errText}>{errors.contact}</Text>}
                    </View>

                    {/* Message */}
                    <View style={styles.field}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('message', { defaultValue: 'Message' })}</Text>
                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder={t('phMessage', { defaultValue: 'Optional message' })}
                            placeholderTextColor="#7f858e"
                            style={[styles.input, { height: 90, textAlignVertical: 'top', paddingTop: 12 }]}
                            multiline
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                    </View>

                    {/* Amount */}
                    <View style={styles.field}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('amount', { defaultValue: 'Amount' })}</Text>
                        <TextInput
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholder={t('phAmount', { defaultValue: 'Enter amount' })}
                            placeholderTextColor="#7f858e"
                            style={[styles.input, errors.amount && styles.inputError]}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        {!!errors.amount && <Text style={styles.errText}>{errors.amount}</Text>}
                    </View>

                    <TouchableOpacity onPress={handleProceed} style={styles.btnProceed} activeOpacity={0.9}>
                        <Text style={styles.btnProceedText}>{t('proceed', { defaultValue: 'PROCEED' })}</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.page },

    /* Header: centered title + absolute leading back */
    header: {
        height: 56,
        backgroundColor: COLORS.header,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
    backAbs: {
        position: 'absolute',
        top: 16,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabsWrap: { height: CHIP_H, minHeight: CHIP_H, maxHeight: CHIP_H },
    tabsRow: { paddingHorizontal: 12, alignItems: 'center' },

    chip: {
        height: CHIP_H,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: COLORS.accent,
        borderRadius: CHIP_H / 2,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    chipText: { color: COLORS.accent, fontWeight: '800', fontSize: 16 },
    chipTextActive: { color: COLORS.isDark ? '#0f1114' : '#FFFFFF' },

    gridPanel: { flex: 1, marginTop: 20 },

    tileWrap: {
        width: (width - 16 * 2 - 12) / 2,
        height: TILE_H,
        marginBottom: 12,
        borderRadius: RADIUS,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tileWrapSelected: { borderColor: COLORS.accent, borderWidth: 2 },
    tile: { flex: 1, justifyContent: 'flex-end' },
    tileImg: { borderRadius: RADIUS },
    tileOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
    tileTitle: { color: COLORS.text, fontWeight: '800', fontSize: 14, paddingHorizontal: 10, paddingTop: 10 },
    tileValue: { color: COLORS.accent, fontWeight: '700', fontSize: 12, paddingHorizontal: 10, paddingBottom: 10 },
    tileSelectedGlow: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS, borderWidth: 2, borderColor: COLORS.accent, opacity: 0.35 },

    emptyWrap: { paddingVertical: 40, alignItems: 'center' },
    emptyText: { color: COLORS.sub },

    footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.panel,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 14,
    },
    selectedInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    selectedLabel: { color: COLORS.sub, fontSize: 14 },
    selectedValue: { color: COLORS.text, fontSize: 14, fontWeight: '700' },

    btnPrimary: {
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accentDark,
    },
    btnPrimaryText: { color: COLORS.isDark ? '#0f1114' : '#FFFFFF', fontWeight: '900' },

    /* Modal */
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalCard: {
        backgroundColor: COLORS.panel,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
    modalClose: { position: 'absolute', right: 6, top: 2, padding: 6 },
    modalSub: { color: COLORS.sub, marginBottom: 10 },

    field: { marginBottom: 12 },
    label: { color: COLORS.sub, marginBottom: 6, fontSize: 13 },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        backgroundColor: COLORS.isDark ? '#0d0f12' : COLORS.panel,
    },
    inputError: { borderColor: COLORS.danger },
    errText: { color: COLORS.danger, marginTop: 6, fontSize: 12 },

    btnProceed: {
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accentDark,
        marginTop: 6,
    },
    btnProceedText: { color: COLORS.isDark ? '#0f1114' : '#FFFFFF', fontWeight: '900' },
});
