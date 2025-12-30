// src/screens/RecentlyViewedScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import { useTheme } from './context/ThemeContext';
import StandardHeader from './components/StandardHeader';
import { useResponsive } from './utils/useResponsive';
import { useTranslation } from 'react-i18next';
import { homeAPI, getUserId } from './services/api';

const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper function to get image URL
const getImageUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300';

    // If already a full URL, return as is
    if (photo.startsWith('http')) return photo;

    // Otherwise construct the full URL
    return `${IMAGE_BASE_URL}${photo}`;
};

function useColumns(width, spacing, getCardWidth) {
    const cols = width >= 720 ? 3 : 2;
    const sidePadding = spacing(16);
    const gap = spacing(12);
    const cardW = getCardWidth(cols, sidePadding, gap);
    return { cols, cardW };
}

export default function RecentlyViewedScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation('recentlyviewed');
    const { width, scale, fontSize, spacing, getCardWidth } = useResponsive();
    const { cols, cardW } = useColumns(width, spacing, getCardWidth);

    // Theme colors
    const COLORS = useMemo(() => ({
        bg: theme.bg,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
        chip: isDark ? theme.line : '#F1F5F9',
        chipActive: isDark ? theme.p4 : '#E8F0FF',
        card: theme.card,
        shadow: '#000',
        danger: theme.danger || '#EF4444',
    }), [theme, isDark]);

    const styles = useMemo(() => createStyles(COLORS, scale, fontSize, spacing), [COLORS, scale, fontSize, spacing]);

    // ✅ plain JS state (no angle brackets)
    const [tab, setTab] = useState('today');       // 'today' | 'yesterday' | 'custom'
    const [isPicker, setPicker] = useState(false);
    const [customDate, setCustomDate] = useState(null);
    const [allRecentItems, setAllRecentItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);

    const yesterdayStr = moment().subtract(1, 'day').format('DD MMM YYYY');

    // Load user ID on mount
    useEffect(() => {
        const loadUserId = async () => {
            const id = await getUserId();
            setUserId(id);
        };
        loadUserId();
    }, []);

    // Fetch data on component mount and when userId is available
    useEffect(() => {
        if (userId) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [userId]);

    // Filter items when tab or customDate changes
    useEffect(() => {
        filterItems();
    }, [tab, customDate, allRecentItems]);

    const loadData = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await homeAPI.getRecentlyViewed(userId);
            
            if (response.data.status && response.data.recent_products) {
                const data = response.data.recent_products.map(product => ({
                    id: product.id.toString(),
                    product_id: product.id,
                    title: product.name || 'Unnamed Product',
                    price: product.price || 0,
                    previous_price: product.previous_price || null,
                    image: getImageUrl(product.photo),
                    photo: product.photo,
                    rawProduct: product,
                    // Add timestamp for filtering - using updated_at or created_at from API
                    viewed_at: product.updated_at || product.created_at || new Date().toISOString()
                }));
                setAllRecentItems(data);
            } else {
                setAllRecentItems([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert(
                'Error',
                t('error_loading', { defaultValue: 'Failed to load recently viewed items. Please check your connection and try again.' })
            );
            setAllRecentItems([]);
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let filtered = [...allRecentItems];

        switch (tab) {
            case 'today':
                // Filter for items viewed today
                filtered = allRecentItems.filter(item => {
                    const itemDate = moment(item.viewed_at);
                    return itemDate.isSame(moment(), 'day');
                });
                break;

            case 'yesterday':
                // Filter for items viewed yesterday
                filtered = allRecentItems.filter(item => {
                    const itemDate = moment(item.viewed_at);
                    const yesterday = moment().subtract(1, 'day');
                    return itemDate.isSame(yesterday, 'day');
                });
                break;

            case 'custom':
                // Filter for items viewed on the selected custom date
                if (customDate) {
                    const selectedDate = moment(customDate, 'DD MMM YYYY');
                    filtered = allRecentItems.filter(item => {
                        const itemDate = moment(item.viewed_at);
                        return itemDate.isSame(selectedDate, 'day');
                    });
                }
                break;

            default:
                // Show all items
                filtered = allRecentItems;
        }

        setFilteredItems(filtered);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const openCalendar = () => setPicker(true);

    const onConfirmDate = (date) => {
        setPicker(false);
        const formattedDate = moment(date).format('DD MMM YYYY');
        setCustomDate(formattedDate);
        setTab('custom');
    };

    const handleTabChange = (newTab) => {
        setTab(newTab);
        if (newTab !== 'custom') {
            setCustomDate(null);
        }
    };

    // Right component for header (calendar button)
    const headerRightComponent = (
        <TouchableOpacity onPress={openCalendar} style={styles.headerRightBtn} activeOpacity={0.8}>
            <Icon name="calendar" size={scale(18)} color={isDark ? theme.white : theme.text} />
        </TouchableOpacity>
    );

    const Segmented = () => (
        <View style={styles.segmentWrap}>
            <TouchableOpacity
                style={[styles.segment, tab === 'today' && styles.segmentActive]}
                onPress={() => handleTabChange('today')}
                activeOpacity={0.9}
            >
                <Text style={[styles.segmentText, tab === 'today' && styles.segmentTextActive]}>{t('today')}</Text>
                {tab === 'today' && <Icon name="check-circle" size={scale(16)} color={COLORS.brand} style={{ marginLeft: spacing(6) }} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.segment, tab === 'yesterday' && styles.segmentActive]}
                onPress={() => handleTabChange('yesterday')}
                activeOpacity={0.9}
            >
                <Text style={[styles.segmentText, tab === 'yesterday' && styles.segmentTextActive]}>{t('yesterday')}</Text>
                {tab === 'yesterday' && <Icon name="check-circle" size={scale(16)} color={COLORS.brand} style={{ marginLeft: spacing(6) }} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.segment, tab === 'all' && styles.segmentActive]}
                onPress={() => handleTabChange('all')}
                activeOpacity={0.9}
            >
                <Text style={[styles.segmentText, tab === 'all' && styles.segmentTextActive]}>{t('all')}</Text>
                {tab === 'all' && <Icon name="check-circle" size={scale(16)} color={COLORS.brand} style={{ marginLeft: spacing(6) }} />}
            </TouchableOpacity>
        </View>
    );

    const DatePill = () => {
        const show = tab === 'yesterday' || tab === 'custom';
        if (!show) return null;

        let text, displayText;

        if (tab === 'yesterday') {
            text = yesterdayStr;
            displayText = `${t('viewed')}: ${text}`;
        } else if (tab === 'custom' && customDate) {
            text = customDate;
            displayText = `${t('viewed')}: ${text}`;
        } else {
            return null;
        }

        return (
            <View style={styles.datePill}>
                <Icon name="calendar" size={scale(12)} color={COLORS.brand} />
                <Text style={styles.datePillText}>{displayText}</Text>
                {(tab === 'custom' && customDate) && (
                    <TouchableOpacity
                        onPress={() => handleTabChange('all')}
                        style={styles.clearDateBtn}
                    >
                        <Icon name="x" size={scale(12)} color={COLORS.brand} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const ResultsCounter = () => {
        if (filteredItems.length === 0) return null;

        let periodText = '';
        switch (tab) {
            case 'today':
                periodText = t('viewed_today');
                break;
            case 'yesterday':
                periodText = t('viewed_yesterday');
                break;
            case 'custom':
                periodText = `${t('viewed_on')} ${customDate}`;
                break;
            default:
                periodText = t('in_total');
        }

        const itemText = filteredItems.length === 1 ? t('item') : t('items');

        return (
            <View style={styles.resultsCounter}>
                <Text style={styles.resultsText}>
                    {filteredItems.length} {itemText} {periodText}
                </Text>
            </View>
        );
    };

    const formatPrice = (price) => {
        try {
            return new Intl.NumberFormat('en', {
                style: 'currency',
                currency: 'BHD',
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
            }).format(Number(price));
        } catch {
            return `${Number(price).toFixed(3)} BHD`;
        }
    };

    const renderItem = ({ item, index }) => {
        const tall = index % 3 === 0;
        const height = Math.round(cardW * (tall ? 1.3 : 1.1));
        const hasDiscount = item.previous_price && item.previous_price > item.price;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetailScreen', {
                    productId: item.id,
                    product: item.rawProduct || item
                })}
                style={[styles.card, { width: cardW, height }]}
            >
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                        onError={(e) => console.log('Image load error for:', item.title)}
                    />
                </View>

                <View style={styles.meta}>
                    <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                            {hasDiscount ? (
                                <View style={styles.discountPriceContainer}>
                                    <Text style={styles.priceCurrent}>{formatPrice(item.price)}</Text>
                                    <Text style={styles.priceOriginal}>{formatPrice(item.previous_price)}</Text>
                                </View>
                            ) : (
                                <Text style={styles.priceCurrent}>{formatPrice(item.price)}</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.quickBtn}
                            onPress={() => navigation.navigate('ProductDetailScreen', {
                                productId: item.product_id,
                                product: item.rawProduct || item
                            })}
                        >
                            <Icon name="eye" size={scale(14)} color={COLORS.brand} />
                            <Text style={styles.quickText}>{t('view')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const EmptyState = () => {
        let message = t('empty_all');
        let subtitle = t('empty_all_subtitle');

        if (tab === 'today') {
            message = t('empty_today');
            subtitle = t('empty_today_subtitle');
        } else if (tab === 'yesterday') {
            message = t('empty_yesterday');
            subtitle = t('empty_yesterday_subtitle');
        } else if (tab === 'custom' && customDate) {
            message = t('empty_custom', { date: customDate });
            subtitle = t('empty_custom_subtitle');
        }

        return (
            <View style={styles.emptyContainer}>
                <Icon name="eye-off" size={scale(60)} color={COLORS.sub} />
                <Text style={styles.emptyTitle}>{message}</Text>
                <Text style={styles.emptySubtitle}>{subtitle}</Text>
            </View>
        );
    };

    const LoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brand} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StandardHeader
                    title={t('title')}
                    navigation={navigation}
                    showGradient={true}
                    rightComponent={headerRightComponent}
                />
                <LoadingState />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                numColumns={cols}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing(16) }}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        <StandardHeader
                            title={t('title')}
                            navigation={navigation}
                            showGradient={true}
                            rightComponent={headerRightComponent}
                        />
                        <Segmented />
                        <DatePill />
                        <ResultsCounter />
                    </>
                }
                ListEmptyComponent={<EmptyState />}
                contentContainerStyle={filteredItems.length === 0 ? styles.emptyListContainer : { paddingBottom: spacing(24) }}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />

            <DateTimePickerModal
                isVisible={isPicker}
                mode="date"
                onConfirm={onConfirmDate}
                onCancel={() => setPicker(false)}
                maximumDate={new Date()}
            />
        </SafeAreaView>
    );
}

/* --- styles --- */
const createStyles = (COLORS, scale, fontSize, spacing) => StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },

    headerRightBtn: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    segmentWrap: {
        paddingHorizontal: spacing(16),
        paddingVertical: spacing(10),
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(10),
        flexWrap: 'wrap',
    },
    segment: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.chip,
        borderRadius: scale(20),
        paddingVertical: spacing(8),
        paddingHorizontal: spacing(16)
    },
    segmentActive: { backgroundColor: COLORS.chipActive },
    segmentText: { fontWeight: '700', color: COLORS.text, fontSize: fontSize(14) },
    segmentTextActive: { color: COLORS.brand },

    datePill: {
        alignSelf: 'flex-start',
        marginLeft: spacing(16),
        marginBottom: spacing(8),
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(6),
        backgroundColor: COLORS.chipActive,
        borderWidth: 1,
        borderColor: COLORS.line,
        paddingHorizontal: spacing(10),
        paddingVertical: spacing(6),
        borderRadius: 999,
    },
    datePillText: { color: COLORS.brand, fontWeight: '800', fontSize: fontSize(12) },
    clearDateBtn: {
        marginLeft: spacing(4),
        padding: spacing(2),
    },

    resultsCounter: {
        paddingHorizontal: spacing(16),
        paddingBottom: spacing(8),
    },
    resultsText: {
        fontSize: fontSize(14),
        color: COLORS.sub,
        fontWeight: '600',
    },

    card: {
        borderRadius: scale(16),
        overflow: 'hidden',
        backgroundColor: COLORS.card,
        marginTop: spacing(12),
        borderWidth: 1,
        borderColor: COLORS.line,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.shadow,
                shadowOpacity: 0.06,
                shadowRadius: scale(10),
                shadowOffset: { width: 0, height: scale(6) }
            },
            android: { elevation: 2 },
        }),
    },
    imageWrapper: { padding: spacing(6), flex: 1 },
    image: { width: '100%', height: '100%', borderRadius: scale(12), resizeMode: 'cover' },

    meta: {
        position: 'absolute',
        left: spacing(10),
        right: spacing(10),
        bottom: spacing(10),
        backgroundColor: COLORS.card,
        borderRadius: scale(12),
        padding: spacing(10),
        borderWidth: 1,
        borderColor: COLORS.line
    },
    title: { fontSize: fontSize(13.5), fontWeight: '800', color: COLORS.text, lineHeight: fontSize(16) },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing(6)
    },
    priceContainer: {
        flex: 1,
    },
    discountPriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing(6),
    },
    priceCurrent: {
        fontSize: fontSize(14),
        color: COLORS.text,
        fontWeight: '900'
    },
    priceOriginal: {
        fontSize: fontSize(12),
        color: COLORS.danger || '#EF4444',
        fontWeight: '700',
        textDecorationLine: 'line-through'
    },
    quickBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(6),
        backgroundColor: COLORS.chipActive,
        borderWidth: 1,
        borderColor: COLORS.line,
        paddingHorizontal: spacing(10),
        paddingVertical: spacing(6),
        borderRadius: scale(10)
    },
    quickText: { color: COLORS.brand, fontWeight: '800', fontSize: fontSize(12) },

    /* Loading and Empty States */
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: spacing(100),
    },
    loadingText: {
        marginTop: spacing(12),
        fontSize: fontSize(16),
        color: COLORS.sub,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: spacing(100),
        paddingHorizontal: spacing(16),
    },
    emptyTitle: {
        fontSize: fontSize(18),
        fontWeight: '800',
        color: COLORS.text,
        marginTop: spacing(16),
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: fontSize(14),
        color: COLORS.sub,
        marginTop: spacing(8),
        textAlign: 'center',
    },
    emptyListContainer: {
        flexGrow: 1,
    },
});