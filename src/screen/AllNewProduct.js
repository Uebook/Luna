// AllNewProduct.js
// - Banner with gradient header
// - Search and sort functionality
// - Product grid with new arrival badges
// - Rating at top right corner
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
import { SkeletonProductListScreen } from '../components/SkeletonLoader';
import { homeAPI, IMAGE_BASE_URL } from '../services/api';

/* Helpers */
const ms = (w, size, factor = 0.25) =>
    size + (Math.max(w, 320) / 375 - 1) * size * factor;
const getColumns = (w) => (w >= 1000 ? 4 : w >= 700 ? 3 : 2);

// Helper function to get image URL
const getImageUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300';

    // If already a full URL, return as is
    if (photo.startsWith('http')) return photo;

    // Otherwise construct the full URL
    return `${IMAGE_BASE_URL}${photo}`;
};

// API helper function to fetch latest products
const fetchLatestProducts = async () => {
    try {
        console.log('Fetching latest products...');

        const response = await homeAPI.getLatestProducts();
        const data = response.data;

        console.log('Parsed latest products data:', data);

        if (data.status && data.products) {
            return data.products.map(product => ({
                id: product.id.toString(),
                product_id: product.id,
                title: product.name || 'Unnamed Product',
                price: product.price || 0,
                previous_price: product.previous_price || null,
                image: getImageUrl(product.photo),
                photo: product.photo,
                rating: 4.0 + (Math.random() * 0.6), // Generate random rating between 4.0-4.6
                stock: product.stock || 0,
                is_discount: product.is_discount || false,
                discount_date: product.discount_date,
                created_at: product.created_at,
                updated_at: product.updated_at,
                is_new: product.latest === 1, // Use the latest flag from API
                rawProduct: product
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching latest products:', error);
        throw error;
    }
};

const SORTS = [
    { key: 'reco', label: 'Recommended' },
    { key: 'popular', label: 'Popular' },
    { key: 'low', label: 'Price: Low to High' },
    { key: 'high', label: 'Price: High to Low' },
    { key: 'newest', label: 'Newest First' },
];

// Default banner for new products
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop';

export default function AllNewProductScreen(props = {}) {
    const navigation = props.navigation || {};
    const { theme } = useTheme();

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
    };
    const gradientHeader = theme.gradients?.header || [THEME.p2, THEME.p1, THEME.p1];
    const TEXT_DARK = THEME.ink;
    const styles = useMemo(() => createStyles(THEME, TEXT_DARK), [THEME, TEXT_DARK]);

    const { width } = useWindowDimensions();
    const numColumns = getColumns(width);
    const GAP = 12;
    const H_PADDING = 12;
    const cardWidth = (width - H_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;
    const imageHeight = Math.round(cardWidth * 0.66);

    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState('newest');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState([]);
    const [sortSheet, setSortSheet] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const isSearching = query.trim()?.length > 0;

    // Fetch latest products on component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const products = await fetchLatestProducts();
            setData(products);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert(
                'Error',
                'Failed to load new products. Please check your connection and try again.'
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
        // Simulate loading more data (in real app, you'd call paginated API)
        setTimeout(() => {
            setData(prev => [...prev]);
            setLoadingMore(false);
        }, 900);
    }, [loadingMore]);

    const onEndReached = useCallback(() => {
        // Don't paginate while searching or when list is empty
        if (isSearching || filtered?.length === 0) return;
        loadMore();
    }, [isSearching, filtered?.length, loadMore]);

    const filtered = useMemo(() => {
        let list = [...data];
        if (isSearching) {
            const q = query.toLowerCase();
            list = list.filter(i => i.title.toLowerCase().includes(q));
        }
        switch (sortKey) {
            case 'low': list.sort((a, b) => a.price - b.price); break;
            case 'high': list.sort((a, b) => b.price - a.price); break;
            case 'popular': list.sort((a, b) => b.rating - a.rating); break;
            case 'newest': list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
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

    // Helper to check if product is new (within 7 days)
    const isProductNew = (createdAt) => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(createdAt) > sevenDaysAgo;
    };

    const ProductCard = ({ item }) => {
        const hasDiscount = item.previous_price && item.previous_price > item.price;
        const isOutOfStock = item.stock <= 0;
        const isNew = item.is_new || isProductNew(item.created_at);

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

                {/* Rating at Top Right */}
                {!isOutOfStock && (
                    <View style={styles.ratingTopRight}>
                        <Icon name="star" size={12} color="#fff" />
                        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                )}

                {/* New Arrival Badge - Top Left */}
                {isNew && !isOutOfStock && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                )}

                {/* Discount Badge - Below Rating */}
                {hasDiscount && !isOutOfStock && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            {Math.round(((item.previous_price - item.price) / item.previous_price) * 100)}% OFF
                        </Text>
                    </View>
                )}

                <Text numberOfLines={2} style={[styles.title, { fontSize: ms(width, 14) }, isOutOfStock && styles.textDisabled]}>
                    {item.title}
                </Text>

                {/* Price Section - Clean without rating */}
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

                {/* Recently Added Indicator */}
                {isNew && !isOutOfStock && (
                    <View style={styles.recentIndicator}>
                        <Icon name="time-outline" size={10} color={THEME.success} />
                        <Text style={styles.recentText}>Recently Added</Text>
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
                    placeholder="Search new arrivals"
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
                <Text style={styles.bannerTitle}>New Arrivals</Text>
                <Text style={styles.bannerSubtitle}>Discover the latest products just for you</Text>
                <View style={styles.bannerStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{data.length}</Text>
                        <Text style={styles.statLabel}>New Products</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {data.filter(item => item.is_discount).length}
                        </Text>
                        <Text style={styles.statLabel}>On Sale</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const EmptyList = () => (
        <View style={styles.emptyWrap}>
            <Icon name="sparkles-outline" size={48} color={THEME.gray} />
            <Text style={styles.emptyTitle}>
                {isSearching ? 'No products found' : 'No new products available'}
            </Text>
            <Text style={styles.emptySub}>
                {isSearching ? 'Try a different search term.' : 'Check back later for new arrivals.'}
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
                <LinearGradient
                    colors={gradientHeader}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.header, { paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 8 }]}
                >
                    <TouchableOpacity onPress={() => navigation.goBack && navigation.goBack()} style={styles.back}>
                        <Icon name="chevron-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Arrivals</Text>
                    <View style={{ width: 32 }} />
                </LinearGradient>
                <SkeletonProductListScreen columns={numColumns} showHeader={false} showBanner={false} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
            {/* Gradient AppBar */}
            <LinearGradient
                colors={gradientHeader}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 8 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack && navigation.goBack()} style={styles.back}>
                    <Icon name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Arrivals</Text>
                <View style={{ width: 32 }} />
            </LinearGradient>

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
const createStyles = (THEME, TEXT_DARK) => StyleSheet.create({
    header: {
        paddingHorizontal: 12, paddingBottom: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomLeftRadius: 16, borderBottomRightRadius: 16, elevation: 2,
    },
    back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

    bannerContainer: {
        position: 'relative',
        height: 180,
    },
    banner: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ddd'
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
        gap: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '500',
    },

    toolbar: {
        flexDirection: 'row', gap: 10, paddingTop: 10, paddingBottom: 12,
        alignItems: 'center', backgroundColor: THEME.bg, paddingHorizontal: 12
    },
    searchBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.white,
        borderRadius: 12, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: THEME.line
    },
    sortBtn: {
        height: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: THEME.white,
        borderWidth: 1, borderColor: THEME.line, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 6
    },
    sortText: { color: THEME.p2, fontWeight: '700' },

    card: {
        backgroundColor: THEME.white,
        borderRadius: 16,
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#eef2ff',
        position: 'relative'
    },
    cardDisabled: {
        opacity: 0.6,
    },
    image: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f1f5f9'
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

    // Rating at Top Right
    ratingTopRight: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: THEME.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        zIndex: 3,
    },
    ratingText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 11
    },

    // New badge - Top Left
    newBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: THEME.brand,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 2,
    },
    newBadgeText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 10,
    },

    // Discount badge - Below Rating
    discountBadge: {
        position: 'absolute',
        top: 40, // Position below the rating badge
        right: 8,
        backgroundColor: THEME.danger,
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

    // Price container - clean without rating
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

    // Recent indicator
    recentIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    recentText: {
        color: THEME.success,
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
    sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
    sheet: {
        backgroundColor: THEME.white,
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