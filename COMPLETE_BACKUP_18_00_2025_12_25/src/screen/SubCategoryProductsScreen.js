// SubCategoryProductsScreen.js
// - Banner with gradient header
// - Search and sort functionality
// - Product grid with category-specific badges
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

// API helper function to fetch subcategory products
const fetchSubCategoryProducts = async (subcategoryId) => {
    try {
        console.log('Fetching subcategory products for ID:', subcategoryId);

        const response = await fetch(`${BASE_URL}/screen/sub-category/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ subcategory_id: subcategoryId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log('Raw subcategory products response:', responseText.substring(0, 200));

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid JSON response from server');
        }

        console.log('Parsed subcategory products data:', data);

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
                category_id: product.category_id,
                subcategory_id: product.subcategory_id,
                created_at: product.created_at,
                updated_at: product.updated_at,
                rawProduct: product
            }));
        }

        return [];
    } catch (error) {
        console.error('Error fetching subcategory products:', error);
        throw error;
    }
};

const SORTS = [
    { key: 'reco', label: 'Recommended' },
    { key: 'popular', label: 'Most Popular' },
    { key: 'low', label: 'Price: Low to High' },
    { key: 'high', label: 'Price: High to Low' },
    { key: 'new', label: 'New Arrivals' },
];

// Default banner for subcategory
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop';

// Mock subcategory data - in real app, this would come from navigation params
const MOCK_SUBCATEGORY = {
    id: 6,
    name: 'Electronics',
    description: 'Latest electronic gadgets and devices',
    banner: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1600&auto=format&fit=crop'
};

export default function SubCategoryProductsScreen(props = {}) {
    const navigation = props.navigation || {};
    const route = props.route || {};
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

    // Get subcategory from navigation params or use mock data
    const subcategory = route.params?.subcategory || MOCK_SUBCATEGORY;

    const { width } = useWindowDimensions();
    const numColumns = getColumns(width);
    const GAP = 12;
    const H_PADDING = 12;
    const cardWidth = (width - H_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;
    const imageHeight = Math.round(cardWidth * 0.66);

    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState('reco');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState([]);
    const [sortSheet, setSortSheet] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const isSearching = query.trim()?.length > 0;

    // Fetch subcategory products on component mount
    useEffect(() => {
        loadData();
    }, [subcategory.id]);

    const loadData = async () => {
        try {
            const products = await fetchSubCategoryProducts(subcategory.id);
            setData(products);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert(
                'Error',
                'Failed to load category products. Please check your connection and try again.'
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
    }, [subcategory.id]);

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
            case 'popular': list.sort((a, b) => b.stock - a.stock); break; // Using stock as popularity proxy
            case 'new': list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
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

    // Helper to check if product is new (within 30 days)
    const isProductNew = (createdAt) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(createdAt) > thirtyDaysAgo;
    };

    const ProductCard = ({ item }) => {
        const hasDiscount = item.previous_price && item.previous_price > item.price;
        const isOutOfStock = item.stock <= 0;
        const isNew = isProductNew(item.created_at);

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

                {/* New Badge - Top Left */}
                {isNew && !isOutOfStock && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                )}

                {/* Discount Badge - Top Right */}
                {hasDiscount && !isOutOfStock && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.discount_percentage}%</Text>
                    </View>
                )}

                {/* Category Badge - Top Right (if no discount) */}
                {!hasDiscount && !isOutOfStock && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{subcategory.name}</Text>
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

                {/* Stock Indicator */}
                {!isOutOfStock && item.stock > 0 && (
                    <View style={styles.stockIndicator}>
                        <Icon name="cube-outline" size={10} color={THEME.success} />
                        <Text style={styles.stockText}>
                            {item.stock > 10 ? 'In Stock' : `Only ${item.stock} left`}
                        </Text>
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
                    placeholder={`Search in ${subcategory.name}`}
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
                source={{ uri: subcategory.banner || DEFAULT_BANNER }}
                style={styles.banner}
                onError={(e) => console.log('Banner image load error')}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.bannerOverlay}
            >
                <Text style={styles.bannerTitle}>{subcategory.name}</Text>
                <Text style={styles.bannerSubtitle}>{subcategory.description || 'Explore our collection'}</Text>
                <View style={styles.bannerStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{data.length}</Text>
                        <Text style={styles.statLabel}>Products</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {data.filter(item => item.is_discount).length}
                        </Text>
                        <Text style={styles.statLabel}>On Sale</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {data.filter(item => isProductNew(item.created_at)).length}
                        </Text>
                        <Text style={styles.statLabel}>New Arrivals</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const EmptyList = () => (
        <View style={styles.emptyWrap}>
            <Icon name="grid-outline" size={48} color={THEME.gray} />
            <Text style={styles.emptyTitle}>
                {isSearching ? 'No products found' : `No products in ${subcategory.name}`}
            </Text>
            <Text style={styles.emptySub}>
                {isSearching ? 'Try a different search term.' : 'Check back later for new products.'}
            </Text>
            {!isSearching && (
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryButtonText}>Refresh</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const LoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.brand} />
            <Text style={styles.loadingText}>Loading {subcategory.name} products...</Text>
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
                    <Text style={styles.headerTitle}>{subcategory.name}</Text>
                    <View style={{ width: 32 }} />
                </LinearGradient>
                <LoadingState />
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
                <Text style={styles.headerTitle}>{subcategory.name}</Text>
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
        paddingHorizontal: 12,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 2,
    },
    back: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },

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
        backgroundColor: THEME.white,
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
        backgroundColor: THEME.white,
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

    // Category badge - Top Right (when no discount)
    categoryBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        zIndex: 2,
    },
    categoryBadgeText: {
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

    // Stock indicator
    stockIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    stockText: {
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
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)'
    },
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