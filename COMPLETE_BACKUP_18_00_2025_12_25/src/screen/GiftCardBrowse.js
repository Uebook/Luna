import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { SkeletonProductListScreen } from '../components/SkeletonLoader';
import { apiHelpers } from '../services/api';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

const CHIP_H = 40;
const TILE_H = 150;
const RADIUS = 18;

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

    const [loading, setLoading] = useState(true);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [giftCards, setGiftCards] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState({});

    // Fetch gift cards from API
    useEffect(() => {
        let isMounted = true;

        const fetchGiftCards = async () => {
            try {
                setLoading(true);
                const response = await apiHelpers.getGiftCards();

                if (!isMounted) return;

                if (response.data.status && response.data.gift_cards) {
                    console.log('Gift cards loaded:', response.data.gift_cards);
                    console.log('Sample gift card image URL:', response.data.gift_cards[0]?.image);
                    setGiftCards(response.data.gift_cards);
                } else {
                    Alert.alert('Error', response.data.message || 'Failed to load gift cards');
                }
            } catch (error) {
                if (!isMounted) return;
                console.log('Error fetching gift cards:', error);
                Alert.alert('Error', error.response?.data?.message || 'Failed to load gift cards. Please try again.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchGiftCards();

        return () => {
            isMounted = false;
        };
    }, []);

    const selectedCard = useMemo(
        () => giftCards.find((c) => c.id === selectedCardId) || null,
        [giftCards, selectedCardId]
    );

    const styles = useMemo(() => createStyles(COLORS), [COLORS]);

    const handleBack = () => (onBack ? onBack() : navigation?.goBack?.());

    const openModal = () => {
        if (selectedCard) {
            // Set default amount when opening modal
            setAmount((selectedCard.value || selectedCard.price || 0).toString());
            setName('');
            setContact('');
            setMessage('');
            setErrors({});
            setShowModal(true);
        }
    };
    const closeModal = () => {
        setShowModal(false);
        setName('');
        setContact('');
        setMessage('');
        setAmount('');
        setErrors({});
    };

    const isValidEmailPhone = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9+\-\s]{7,}$/;
        return emailRegex.test(text) || phoneRegex.test(text);
    };

    const validate = () => {
        const e = {};

        // All fields are now required
        if (!name.trim()) {
            e.name = t('errors.nameRequired', { defaultValue: 'Recipient name is required' });
        }

        if (!contact.trim()) {
            e.contact = t('errors.contactRequired', { defaultValue: 'Email or phone is required' });
        } else if (!isValidEmailPhone(contact.trim())) {
            e.contact = t('errors.validContact', { defaultValue: 'Enter valid email or phone' });
        }

        if (!amount.trim()) {
            e.amount = t('errors.amountRequired', { defaultValue: 'Amount is required' });
        } else {
            const amountValue = parseFloat(amount);
            if (isNaN(amountValue) || amountValue <= 0) {
                e.amount = t('errors.amountInvalid', { defaultValue: 'Enter a valid amount greater than 0' });
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleProceed = () => {
        if (!validate() || !selectedCard) return;

        const amountValue = parseFloat(amount) || 0;
        const payload = {
            selectedCard,
            form: {
                name: name.trim(),
                contact: contact.trim(),
                message: message.trim(),
                amount: amountValue
            }
        };
        if (onNext) onNext(payload);
        else navigation?.navigate?.('GiftCardReviewPay', payload);
    };

    const renderCard = useCallback(({ item }) => {
        const selected = item.id === selectedCardId;
        // Process image URL - ensure it's a full URL
        let imageUri = item.image || null;
        console.log(imageUri, "imageUriimageUri")
        if (imageUri) {
            // If relative path, make it absolute
            if (!imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
                if (imageUri.startsWith('/')) {
                    imageUri = 'https://proteinbros.in' + imageUri;
                } else {
                    imageUri = 'https://proteinbros.in/assets/images/giftcards/' + imageUri;
                }
            }
            console.log('Rendering gift card image:', imageUri);
        }

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
                        onError={(error) => {
                            console.log('Image load error for gift card:', item.id, imageUri, error.nativeEvent);
                        }}
                        onLoad={() => {
                            console.log('Image loaded successfully:', imageUri);
                        }}
                        resizeMode="cover"
                    >
                        <View style={styles.tileOverlay} />
                        <Text style={[styles.tileTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.value && (
                            <Text style={[styles.tileValue, isRTL && { textAlign: 'right' }]}>
                                BHD {parseFloat(item.value).toFixed(3)}
                            </Text>
                        )}
                        {selected && <View style={styles.tileSelectedGlow} />}
                    </ImageBackground>
                ) : (
                    <View style={[styles.tile, styles.tilePlaceholder]}>
                        <Icon name="gift" size={40} color={COLORS.sub} />
                        <View style={styles.tileOverlay} />
                        <Text style={[styles.tileTitle, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.value && (
                            <Text style={[styles.tileValue, isRTL && { textAlign: 'right' }]}>
                                BHD {parseFloat(item.value).toFixed(3)}
                            </Text>
                        )}
                        {selected && <View style={styles.tileSelectedGlow} />}
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [selectedCardId, styles, isRTL, COLORS]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                <StandardHeader title={t('title', { defaultValue: 'Gift Cards' })} navigation={navigation} showGradient={true} />
                <SkeletonProductListScreen columns={2} showHeader={false} showBanner={false} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            {/* Standard Header */}
            <StandardHeader
                title={t('title', { defaultValue: 'Luna Gift Cards' })}
                navigation={navigation}
                showGradient={true}
            />

            {/* GRID */}
            <View style={styles.gridPanel}>
                <FlatList
                    data={giftCards}
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
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={6}
                    windowSize={10}
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

                    {/* Amount */}
                    <View style={styles.field}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
                            {t('amount', { defaultValue: 'Gift Card Amount (BHD)' })} <Text style={{ color: COLORS.danger }}>*</Text>
                        </Text>
                        <TextInput
                            value={amount}
                            onChangeText={(text) => {
                                // Allow only numbers and decimal point
                                const cleaned = text.replace(/[^0-9.]/g, '');
                                // Only allow one decimal point
                                const parts = cleaned.split('.');
                                if (parts.length > 2) {
                                    setAmount(parts[0] + '.' + parts.slice(1).join(''));
                                } else {
                                    setAmount(cleaned);
                                }
                            }}
                            keyboardType="decimal-pad"
                            placeholder={selectedCard ? `Default: ${(selectedCard.value || selectedCard.price || 0).toFixed(3)}` : '0.000'}
                            placeholderTextColor="#7f858e"
                            style={[styles.input, errors.amount && styles.inputError]}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        {!!errors.amount && <Text style={styles.errText}>{errors.amount}</Text>}
                        {selectedCard && (
                            <Text style={[styles.label, { fontSize: 11, marginTop: 4, color: COLORS.sub }]}>
                                {t('amountHint', { defaultValue: `Default value: BHD ${(selectedCard.value || selectedCard.price || 0).toFixed(3)}` })}
                            </Text>
                        )}
                    </View>

                    {/* Name */}
                    <View style={styles.field}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
                            {t('name', { defaultValue: 'Recipient Name' })} <Text style={{ color: COLORS.danger }}>*</Text>
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder={t('phName', { defaultValue: 'Enter recipient name' })}
                            placeholderTextColor="#7f858e"
                            style={[styles.input, errors.name && styles.inputError]}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        {!!errors.name && <Text style={styles.errText}>{errors.name}</Text>}
                    </View>

                    {/* Contact */}
                    <View style={styles.field}>
                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>
                            {t('contact', { defaultValue: 'Email / Phone' })} <Text style={{ color: COLORS.danger }}>*</Text>
                        </Text>
                        <TextInput
                            value={contact}
                            onChangeText={setContact}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder={t('phContact', { defaultValue: 'Enter recipient email or phone number' })}
                            placeholderTextColor="#7f858e"
                            style={[styles.input, errors.contact && styles.inputError]}
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                        {!!errors.contact && <Text style={styles.errText}>{errors.contact}</Text>}
                        <Text style={[styles.label, { fontSize: 11, marginTop: 4, color: COLORS.sub }]}>
                            {t('contactHint', { defaultValue: 'We will check if this email/phone exists in our system' })}
                        </Text>
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
    tileImg: { borderRadius: RADIUS, resizeMode: 'cover' },
    tileOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
    tilePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.panel,
        borderRadius: RADIUS,
    },
    tileTitle: { color: COLORS.text, fontWeight: '800', fontSize: 14, paddingHorizontal: 10, paddingVertical: 10 },
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
    amountDisplay: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '800',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.isDark ? '#0d0f12' : COLORS.panel,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    discountText: {
        color: COLORS.accent,
        fontSize: 12,
        marginTop: 4,
        fontWeight: '700',
    },
    tileValue: {
        color: COLORS.text,
        fontWeight: '800',
        fontSize: 12,
        paddingHorizontal: 10,
        paddingBottom: 8,
        marginTop: -4,
    },

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
