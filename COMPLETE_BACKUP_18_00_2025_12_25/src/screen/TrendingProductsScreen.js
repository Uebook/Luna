// TrendingProductsScreen.js
// - Banner with gradient header
// - Search and sort functionality
// - Product grid with trending badges
// - No ratings (as requested)
// - Empty state for no results
// - Keyboard stays open while typing

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image,
    FlatList, TextInput, StatusBar, Platform, RefreshControl, Modal,
    Pressable, ActivityIndicator, ActionSheetIOS, useWindowDimensions, Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { SkeletonProductListScreen } from '../components/SkeletonLoader';

/* Helpers */
const ms = (w, size, factor = 0.25) =>
    size + (Math.max(w, 320) / 375 - 1) * size * factor;
const getColumns = (w) => (w >= 1000 ? 4 : w >= 700 ? 3 : 2);

const BASE_URL = 'https://luna-api.proteinbros.in/public/api/v1';
const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper function to get image URL
const getImageUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300';

    // If already a full URL, return as is
    if (photo.startsWith('http')) return photo;

    // Otherwise construct the full URL
    return `${IMAGE_BASE_URL}${photo}`;
};

// API helper function to fetch trending/hot products
const fetchTrendingProducts = async () => {
    try {
        console.log('Fetching trending products...');

        const response = await fetch(`${BASE_URL}/screen/products/hot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log('Raw trending products response:', responseText.substring(0, 200));

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid JSON response from server');
        }

        console.log('Parsed trending products data:', data);

        if (data.status && data.products) {
            return data.products.map(product => ({
                id: product.id.toString(),
                product_id: product.id,
                title: product.name || 'Unnamed Product',
                price: product.price || 0,
                previous_price: product.previous_price || null,
                image: getImageUrl(product.photo),
                photo: product.photo,
                stock: product.stock || 0,
                is_discount: product.is_discount || false,
                discount_percentage: product.previous_price && product.previous_price > product.price
                    ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100)
                    : 0,
                views: product.views || 0,
                trending: product.trending || 0,
                created_at: product.created_at,
                updated_at: product.updated_at,
                rawProduct: product
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching trending products:', error);
        throw error;
    }
};

const SORTS = [
    { key: 'reco', label: 'Recommended' },
    { key: 'popular', label: 'Most Popular' },
    { key: 'low', label: 'Price: Low to High' },
    { key: 'high', label: 'Price: High to Low' },
    { key: 'trending', label: 'Most Trending' },
];

// Default banner for trending products
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1600&auto=format&fit=crop';

export default function TrendingProductsScreen(props = {}) {
    const navigation = props.navigation || {};
    const { theme, isDark } = useTheme();

    const THEME = {
        p1: theme.p1,
        p2: theme.p2,
        p3: theme.p3,
        p4: theme.p4,
        white: theme.white,
        ink: theme.ink,
        gray: theme.gray,
        muted: theme.muted,
        line: theme.line,
        card: theme.card,
        bg: theme.bg,
        brand: theme.brand,
        brandSoft: theme.brandSoft,
        danger: theme.danger,
        success: theme.success,
        red: theme.red,
        text: theme.text,
    };
    const TEXT_DARK = THEME.ink;
    const styles = useMemo(() => createStyles(THEME, TEXT_DARK, isDark), [THEME, TEXT_DARK, isDark]);

    const { width } = useWindowDimensions();
    const numColumns = getColumns(width);
    const GAP = 12;
    const H_PADDING = 12;
    const cardWidth = (width - H_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;
    const imageHeight = Math.round(cardWidth * 0.66);

    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState('trending');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState([]);
    const [sortSheet, setSortSheet] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const isSearching = query.trim()?.length > 0;

    // Fetch trending products on component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const products = await fetchTrendingProducts();
            setData(products);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert(
                'Error',
                'Failed to load trending products. Please check your connection and try again.'
            );
            setData([]);
        } finally {
            setInitialLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => {
            setRefreshing(false);
        });
    }, []);

    const loadMore = useCallback(() => {
        if (loadingMore) return;
        setLoadingMore(true);
        // Simulate loading more data
        setTimeout(() => {
            setData(prev => [...prev]);
            setLoadingMore(false);
        }, 900);
    }, [loadingMore]);

    const onEndReached = useCallback(() => {
        if (isSearching || filtered?.length === 0) return;
        loadMore();
    }, [isSearching, filtered?.length, loadMore]);

    const filtered = useMemo(() => {
        let list = [...data];

        // Apply search filter
        if (isSearching) {
            const q = query.toLowerCase();
            list = list.filter(i => i.title.toLowerCase().includes(q));
        }

        // Apply sort
        switch (sortKey) {
            case 'low': list.sort((a, b) => a.price - b.price); break;
            case 'high': list.sort((a, b) => b.price - a.price); break;
            case 'popular': list.sort((a, b) => b.views - a.views); break;
            case 'trending': list.sort((a, b) => b.trending - a.trending); break;
            default: break;
        }
        return list;
    }, [data, isSearching, query, sortKey]);

    const openSort = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: [...SORTS.map(s => s.label), 'Cancel'], cancelButtonIndex: SORTS?.length },
                i => (i >= 0 && i < SORTS?.length) && setSortKey(SORTS[i].key)
            );
        } else {
            setSortSheet(true);
        }
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

    // Helper to format view counts
    const formatViews = (views) => {
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'k';
        }
        return views.toString();
    };

    const ProductCard = ({ item }) => {
        const hasDiscount = item.previous_price && item.previous_price > item.price;
        const isOutOfStock = item.stock <= 0;
        const isTrending = item.trending === 1 || item.views > 50; // Consider trending if views > 50

        return (
            <TouchableOpacity
                style={[styles.card, { width: cardWidth }, isOutOfStock && styles.cardDisabled]}
                activeOpacity={0.9}
                onPress={() => {
                    if (!isOutOfStock) {
                        navigation.navigate('ProductDetailScreen', {
                            productId: item.product_id,
                            product: item.rawProduct || item
                        });
                    }
                }}
                disabled={isOutOfStock}
            >
                <Image
                    source={{ uri: item.image }}
                    style={[styles.image, { height: imageHeight }, isOutOfStock && styles.imageDisabled]}
                    onError={(e) => console.log('Image load error for:', item.title)}
                />

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}

                {/* Trending Badge - Top Left */}
                {isTrending && !isOutOfStock && (
                    <View style={styles.trendingBadge}>
                        <Icon name="trending-up" size={12} color="#fff" />
                        <Text style={styles.trendingBadgeText}>TRENDING</Text>
                    </View>
                )}

                {/* Discount Badge - Top Right */}
                {hasDiscount && !isOutOfStock && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.discount_percentage}%</Text>
                    </View>
                )}

                {/* Views Badge - Top Right (if no discount) */}
                {!hasDiscount && !isOutOfStock && item.views > 0 && (
                    <View style={styles.viewsBadge}>
                        <Icon name="eye" size={10} color="#fff" />
                        <Text style={styles.viewsText}>{formatViews(item.views)}</Text>
                    </View>
                )}

                <Text numberOfLines={2} style={[styles.title, { fontSize: ms(width, 14) }, isOutOfStock && styles.textDisabled]}>
                    {item.title}
                </Text>

                {/* Price Section */}
                <View style={styles.priceContainer}>
                    {hasDiscount ? (
                        <View style={styles.discountPriceContainer}>
                            <Text style={[styles.priceCurrent, isOutOfStock && styles.textDisabled]}>
                                {formatPrice(item.price)}
                            </Text>
                            <Text style={styles.priceOriginal}>
                                {formatPrice(item.previous_price)}
                            </Text>
                        </View>
                    ) : (
                        <Text style={[styles.priceCurrent, isOutOfStock && styles.textDisabled]}>
                            {formatPrice(item.price)}
                        </Text>
                    )}
                </View>

                {/* Popular Indicator */}
                {item.views > 100 && !isOutOfStock && (
                    <View style={styles.popularIndicator}>
                        <Icon name="flame" size={10} color={THEME.danger} />
                        <Text style={styles.popularText}>Popular Choice</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const Toolbar = () => (
        <View style={[styles.toolbar, { paddingHorizontal: H_PADDING }]}>
            <View style={styles.searchBox}>
                <Icon name="search" size={18} color={THEME.muted} />
                <TextInput
                    placeholder="Search trending products"
                    placeholderTextColor={THEME.muted}
                    value={query}
                    onChangeText={setQuery}
                    style={{ flex: 1, paddingLeft: 8, fontSize: ms(width, 14), color: THEME.ink }}
                    returnKeyType="search"
                    blurOnSubmit={false}
                />
            </View>
            <TouchableOpacity style={styles.sortBtn} onPress={openSort} activeOpacity={0.85}>
                <Icon name="filter-outline" size={18} color={THEME.p2} />
                <Text style={styles.sortText}>
                    {SORTS.find(s => s.key === sortKey)?.label ?? 'Sort'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const Banner = () => (
        <View style={styles.bannerContainer}>
            <Image
                source={{ uri: DEFAULT_BANNER }}
                style={styles.banner}
                onError={(e) => console.log('Banner image load error')}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.bannerOverlay}
            >
                <Text style={styles.bannerTitle}>Trending Now</Text>
                <Text style={styles.bannerSubtitle}>Discover what's hot and popular right now</Text>
                <View style={styles.bannerStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{data.length}</Text>
                        <Text style={styles.statLabel}>Trending Items</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {data.filter(item => item.views > 100).length}
                        </Text>
                        <Text style={styles.statLabel}>Highly Viewed</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {data.filter(item => item.trending === 1).length}
                        </Text>
                        <Text style={styles.statLabel}>Top Trending</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const EmptyList = () => (
        <View style={styles.emptyWrap}>
            <Icon name="trending-up-outline" size={48} color={THEME.gray} />
            <Text style={styles.emptyTitle}>
                {isSearching ? 'No products found' : 'No trending products available'}
            </Text>
            <Text style={styles.emptySub}>
                {isSearching ? 'Try a different search term.' : 'Check back later for trending products.'}
            </Text>
            {!isSearching && (
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryButtonText}>Refresh</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (initialLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
                <StandardHeader title="Trending Now" navigation={navigation} showGradient={true} />
                <SkeletonProductListScreen columns={numColumns} showHeader={false} showBanner={true} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
            {/* Standard Header */}
            <StandardHeader title="Trending Now" navigation={navigation} showGradient={true} />

            {/* Banner */}
            <Banner />

            {/* Toolbar with Search and Sort */}
            <Toolbar />

            {/* Product Grid */}
            <FlatList
                data={filtered}
                keyExtractor={(i) => i.id}
                numColumns={numColumns}
                columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PADDING }}
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
                renderItem={({ item }) => <ProductCard item={item} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReachedThreshold={0.2}
                onEndReached={onEndReached}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="always"
                ListEmptyComponent={<EmptyList />}
                ListFooterComponent={
                    loadingMore && !isSearching && filtered?.length > 0
                        ? <View style={{ paddingVertical: 16 }}><ActivityIndicator color={THEME.brand} /></View>
                        : null
                }
            />

            {/* Android Sort Sheet */}
            <Modal visible={sortSheet} animationType="slide" transparent onRequestClose={() => setSortSheet(false)}>
                <Pressable style={styles.sheetBackdrop} onPress={() => setSortSheet(false)} />
                <View style={styles.sheet}>
                    <View style={styles.sheetGrab} />
                    <Text style={styles.sheetTitle}>Sort by</Text>
                    {SORTS.map((s) => (
                        <TouchableOpacity key={s.key} style={styles.sheetItem}
                            onPress={() => { setSortKey(s.key); setSortSheet(false); }}>
                            <Text style={[styles.sheetItemText, sortKey === s.key && { color: THEME.p2, fontWeight: '700' }]}>{s.label}</Text>
                            {sortKey === s.key && <Icon name="checkmark" size={18} color={THEME.p2} />}
                        </TouchableOpacity>
                    ))}
                    <View style={{ height: 12 }} />
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* ===== Styles ===== */
const createStyles = (THEME, TEXT_DARK, isDark) => StyleSheet.create({
    bannerContainer: {
        position: 'relative',
        height: 180,
    },
    banner: {
        width: '100%',
        height: '100%',
        backgroundColor: isDark ? THEME.bg : '#ddd'
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 20,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
    },
    bannerStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '500',
    },

    toolbar: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 10,
        paddingBottom: 12,
        alignItems: 'center',
        backgroundColor: THEME.bg,
        paddingHorizontal: 12
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? THEME.bg : THEME.card,
        borderRadius: 12,
        paddingHorizontal: 10,
        height: 44,
        borderWidth: 1,
        borderColor: THEME.line
    },
    sortBtn: {
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: isDark ? THEME.bg : THEME.card,
        borderWidth: 1,
        borderColor: THEME.line,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6
    },
    sortText: {
        color: THEME.p2,
        fontWeight: '700'
    },

    card: {
        backgroundColor: THEME.card,
        borderRadius: 16,
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: THEME.line,
        position: 'relative'
    },
    cardDisabled: {
        opacity: 0.6,
    },
    image: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: isDark ? THEME.bg : '#f1f5f9'
    },
    imageDisabled: {
        opacity: 0.5,
    },
    title: {
        color: TEXT_DARK,
        fontWeight: '600',
        marginBottom: 6,
        lineHeight: 18
    },
    textDisabled: {
        color: THEME.gray,
    },

    // Trending badge - Top Left
    trendingBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: THEME.danger,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 2,
    },
    trendingBadgeText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 10,
    },

    // Discount badge - Top Right
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: THEME.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 2,
    },
    discountText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 10,
    },

    // Views badge - Top Right (when no discount)
    viewsBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        zIndex: 2,
    },
    viewsText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 9,
    },

    // Price container
    priceContainer: {
        marginTop: 4,
    },
    discountPriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    priceCurrent: {
        fontWeight: '800',
        color: TEXT_DARK,
        fontSize: 14
    },
    priceOriginal: {
        fontSize: 12,
        color: THEME.danger,
        fontWeight: '600',
        textDecorationLine: 'line-through'
    },

    // Popular indicator
    popularIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    popularText: {
        color: THEME.danger,
        fontSize: 10,
        fontWeight: '600',
    },

    // Out of stock overlay
    outOfStockOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 10,
    },

    // Empty state
    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '800',
        color: TEXT_DARK,
        textAlign: 'center'
    },
    emptySub: {
        marginTop: 8,
        color: THEME.gray,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: THEME.brand,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: THEME.gray,
    },

    // bottom sheet
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    sheet: {
        backgroundColor: THEME.card,
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
    },
    sheetGrab: {
        alignSelf: 'center',
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: THEME.line,
        marginBottom: 8
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: TEXT_DARK,
        marginBottom: 6
    },
    sheetItem: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: THEME.line,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sheetItemText: {
        fontSize: 15,
        color: TEXT_DARK
    },
});