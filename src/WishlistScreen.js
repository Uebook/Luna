// src/screens/WishlistScreen.js
import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    useWindowDimensions,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import i18n from './i18n/index';
import Colors from './constants/Colors'; // Fixed import path
import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeAPI, cartAPI, getUserId } from './services/api';

const COLORS = {
    bg: Colors.bg,
    text: Colors.ink,
    sub: Colors.gray,
    line: Colors.line,
    card: Colors.card,
    brand: Colors.brand,
    brandSoft: Colors.brandSoft,
    danger: Colors.danger,
    chip: Colors.line,
    shadow: Colors.ink,
    badge: Colors.success,
};

const CURRENCY = 'BHD';
const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

const fmtMoney = (n) => {
    try {
        return new Intl.NumberFormat(i18n.language || 'en', {
            style: 'currency',
            currency: CURRENCY,
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(Number(n));
    } catch {
        return `${Number(n).toFixed(3)} ${CURRENCY}`;
    }
};

/* ---------- helpers ---------- */
const GAP = 12;
const SIDE = 16;

function useColumns() {
    const { width } = useWindowDimensions();
    const cols = width >= 700 ? 3 : 2;
    const cardW = Math.floor((width - SIDE * 2 - GAP * (cols - 1)) / cols);
    return { cols, cardW };
}

const sizeLabel = (type, val) => {
    if (type === 'letter') return `Size ${val}`;
    if (type === 'eu') return `EU ${val}`;
    if (type === 'us') return `US ${val}`;
    return String(val);
};

const discountPercent = (price, discounted) => {
    if (!discounted || discounted >= price) return null;
    const pct = Math.round(((price - discounted) / price) * 100);
    return pct > 0 ? `${pct}% OFF` : null;
};

// Helper function to get image URL
const getImageUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300';

    // If already a full URL, return as is
    if (photo.startsWith('http')) return photo;

    // Otherwise construct the full URL
    return `${IMAGE_BASE_URL}${photo}`;
};

// Cart helper functions
const addToCartStorage = async (product) => {
    try {
        const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
        let cart = cartData ? JSON.parse(cartData) : [];

        const itemIdentifier = {
            id: product.product_id,
            selectedSize: product.size || '',
            selectedColor: product.color || ''
        };

        const existingItemIndex = cart.findIndex(item =>
            item.id === itemIdentifier.id &&
            item.selectedSize === itemIdentifier.selectedSize &&
            item.selectedColor === itemIdentifier.selectedColor
        );

        const cartItem = {
            ...itemIdentifier,
            name: product.title,
            price: product.discountedPrice || product.price,
            previous_price: product.price,
            image: product.image,
            quantity: 1,
            sku: product.rawProduct?.sku || `prod_${product.product_id}`,
            stock: product.rawProduct?.stock || 100,
            size: product.size,
            color: product.color,
            colorName: product.color,
            colorHex: product.color,
            baseProduct: product.rawProduct || product
        };

        if (existingItemIndex >= 0) {
            // Update quantity if item already exists
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item to cart
            cart.push(cartItem);
        }

        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Error adding to cart storage:', error);
        return false;
    }
};

// Add to cart using API
const addToCartAPI = async (userId, productId, quantity = 1) => {
    try {
        const response = await cartAPI.addToCart(userId, productId, quantity);
        return response.data.success === true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        return false;
    }
};

export default function WishlistScreen({ navigation }) {
    const { cols, cardW } = useColumns();
    const { t } = useTranslation(['wishlist', 'common']);
    const isRTL = i18n?.dir?.() === 'rtl';

    const [items, setItems] = useState([]);
    const [recentItems, setRecentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);

    // store chip **keys**, not labels
    const CHIP_KEYS = ['all', 'trending', 'az', 'newest'];
    const [chipKey, setChipKey] = useState('all');

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

    const loadData = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [wishlistResponse, recentResponse] = await Promise.all([
                homeAPI.getWishlist(userId),
                homeAPI.getRecentlyViewed(userId)
            ]);

            // Transform wishlist data
            if (wishlistResponse.data.status && wishlistResponse.data.wishlist_products) {
                const wishlistData = wishlistResponse.data.wishlist_products.map(product => ({
                    id: product.id.toString(),
                    product_id: product.id,
                    image: getImageUrl(product.photo),
                    title: product.name || 'Unnamed Product',
                    price: product.previous_price || product.price,
                    discountedPrice: product.previous_price && product.previous_price > product.price ? product.price : null,
                    color: product.color_all ? (Array.isArray(product.color_all) ? product.color_all[0] : '#000000') : '#000000',
                    sizeType: 'letter',
                    size: 'M',
                    rawProduct: product
                }));
                setItems(wishlistData);
            } else {
                setItems([]);
            }

            // Transform recently viewed data
            if (recentResponse.data.status && recentResponse.data.recent_products) {
                const recentData = recentResponse.data.recent_products.map(product => ({
                    id: product.id.toString(),
                    title: product.name || 'Unnamed Product',
                    price: product.price || 0,
                    thumb: getImageUrl(product.photo),
                    photo: product.photo,
                }));
                setRecentItems(recentData);
            } else {
                setRecentItems([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert(
                'Error',
                'Failed to load data. Please check your connection and try again.'
            );
            setItems([]);
            setRecentItems([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const chipLabel = (k) =>
        t(`wishlist.chips.${k}`, {
            defaultValue:
                k === 'all' ? 'All' :
                    k === 'trending' ? 'Trending' :
                        k === 'az' ? 'A–Z' : 'Newest'
        });

    const data = useMemo(() => {
        let d = [...items];
        if (chipKey === 'trending') d = d.slice(0, 3);
        if (chipKey === 'az') d.sort((a, b) => a.title.localeCompare(b.title, i18n.language || 'en'));
        if (chipKey === 'newest') d = d.slice().reverse();
        return d;
    }, [items, chipKey]);

    const removeFromWishlist = async (id, productId) => {
        if (!userId) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        try {
            const response = await homeAPI.toggleWishlist(userId, productId);
            if (response.data.status === true) {
                setItems((prev) => prev.filter((it) => it.id !== id));
                Alert.alert('Success', 'Item removed from wishlist');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to remove item from wishlist');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            Alert.alert('Error', 'Failed to remove item from wishlist');
        }
    };

    const moveToBag = async (item) => {
        if (!userId) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        try {
            const success = await addToCartAPI(userId, item.product_id, 1);
            if (success) {
                // Remove from wishlist after adding to cart
                await removeFromWishlist(item.id, item.product_id);
                Alert.alert('🎉 Added to Cart', `${item.title} has been moved to your bag!`);
            } else {
                Alert.alert('Error', 'Failed to add item to bag');
            }
        } catch (error) {
            console.error('Error moving to bag:', error);
            Alert.alert('Error', 'Failed to add item to bag');
        }
    };

    /* ---------- Sticky header (chips) ---------- */
    const ChipsHeader = () => (
        <View style={[styles.chipsWrap, isRTL && { flexDirection: 'row-reverse' }]}>
            {CHIP_KEYS.map((key) => {
                const active = chipKey === key;
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setChipKey(key)}
                        style={[styles.chip, active && styles.chipActive]}
                        activeOpacity={0.9}
                    >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {chipLabel(key)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    /* ---------- Grid card ---------- */
    const renderItem = ({ item, index }) => {
        const tall = index % 3 === 0; // varied heights
        const height = Math.round(cardW * (tall ? 1.45 : 1.45));
        const hasDiscount = !!item.discountedPrice;
        const badge = discountPercent(item.price, item.discountedPrice);

        return (
            <View style={[styles.card, { width: cardW }]}>
                <View style={[styles.imageContainer, { height: height * 0.7 }]}>
                    <Image
                        source={{ uri: item.image }}
                        style={styles.bg}
                        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                    <View style={styles.overlay} />

                    {/* discount badge */}
                    {badge && (
                        <View style={[styles.discountBadge, isRTL ? { left: 8 } : { right: 8 }]}>
                            <Text style={styles.discountTxt}>{badge}</Text>
                        </View>
                    )}

                    {/* dismiss */}
                    <TouchableOpacity
                        accessibilityLabel={t('wishlist.a11y.removeItem', { defaultValue: 'Remove from wishlist' })}
                        onPress={() => removeFromWishlist(item.id, item.product_id)}
                        style={[styles.dismiss, isRTL ? { left: 8, right: undefined } : { right: 8 }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.meta, isRTL && { flexDirection: 'column' }]}>
                    <Text numberOfLines={2} style={styles.title}>
                        {item.title}
                    </Text>

                    <View style={[styles.rowBetween, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.priceWrap, isRTL && { flexDirection: 'row-reverse' }]}>
                            {hasDiscount ? (
                                <>
                                    <Text style={styles.priceNow}>{fmtMoney(item.discountedPrice)}</Text>
                                    <Text style={[styles.priceWas, isRTL && { marginRight: 0, marginLeft: 6 }]}>
                                        {fmtMoney(item.price)}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.priceNow}>{fmtMoney(item.price)}</Text>
                            )}
                        </View>

                        <View style={[styles.tagRow, isRTL && { flexDirection: 'row-reverse' }]}>
                            <View style={[styles.tagPill, isRTL && { flexDirection: 'row-reverse' }]}>
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                <Text style={styles.tagText}>{item.color}</Text>
                            </View>
                            <View style={[styles.tagPill, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Feather
                                    name="type"
                                    size={12}
                                    color="#222"
                                    style={[{ marginRight: 6 }, isRTL && { marginRight: 0, marginLeft: 6 }]}
                                />
                                <Text style={styles.tagText}>{sizeLabel(item.sizeType, item.size)}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.cta}
                        activeOpacity={0.9}
                        onPress={() =>
                            navigation.navigate?.('ProductDetailScreen', { productId: item.id, product: item })
                        }
                    >
                        <Feather name="shopping-bag" size={16} color="#fff" />
                        <Text style={styles.ctaText}>
                            {t('wishlist.actions.moveToBag', { defaultValue: 'Move to bag' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /* ---------- List header (top area above sticky chips) ---------- */
    const TopHeader = () => (
        <View>
            {/* Title Section */}
            <View style={styles.titleSection}>
                <View>
                    <Text style={styles.h1}>{t('wishlist.title', { defaultValue: 'Wishlist' })}</Text>
                    <Text style={styles.subtitle}>{items.length} {items.length === 1 ? 'item' : 'items'} saved</Text>
                </View>
                {items.length > 0 && (
                    <View style={styles.countPill}>
                        <Text style={styles.countText}>{items.length}</Text>
                    </View>
                )}
            </View>

            {/* Recently viewed */}
            {recentItems.length > 0 && (
                <>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>
                            {t('wishlist.recentlyViewed', { defaultValue: 'Recently viewed' })}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation?.navigate?.('RecentlyViewedScreen')}
                            style={[styles.seeAllBtn, isRTL && { flexDirection: 'row-reverse' }]}
                        >
                            <Text style={styles.seeAllText}>{t('common.seeAll', { defaultValue: 'See all' })}</Text>
                            <Feather
                                name={isRTL ? 'arrow-left' : 'arrow-right'}
                                size={14}
                                color={COLORS.brand}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.rvRow, isRTL && { flexDirection: 'row-reverse' }]}
                    >
                        {recentItems.map((it) => (
                            <TouchableOpacity
                                key={it.id}
                                style={styles.rvCard}
                                onPress={() => navigation?.navigate?.('ProductDetailScreen', { productId: it.id })}
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={{ uri: it.thumb }}
                                    style={styles.rvImg}
                                    onError={(e) => console.log('RV Image error for:', it.title, 'URL:', it.thumb)}
                                />
                                <View style={styles.rvMeta}>
                                    <Text numberOfLines={1} style={styles.rvTitle}>{it.title}</Text>
                                    <Text style={styles.rvPrice}>{fmtMoney(it.price)}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}
        </View>
    );

    const Empty = () => (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyCircle}>
                <Feather name="heart" size={40} color={COLORS.brand} />
            </View>
            <Text style={styles.emptyTitle}>
                {t('wishlist.empty.title', { defaultValue: 'Your wishlist is empty' })}
            </Text>
            <Text style={styles.emptySub}>
                {t('wishlist.empty.subtitle', { defaultValue: 'Browse and add items you like' })}
            </Text>
        </View>
    );

    const Loading = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brand} />
            <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
                <Loading />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
            <FlatList
                data={data}
                keyExtractor={(it) => it.id}
                numColumns={cols}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: SIDE }}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        <TopHeader />
                        {/* sticky header comes next */}
                        {items.length > 0 && <ChipsHeader />}
                    </>
                }
                stickyHeaderIndices={items.length > 0 ? [1] : []} // ChipsHeader
                ListEmptyComponent={<Empty />}
                contentContainerStyle={data.length === 0 ? styles.emptyContainer : { paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </SafeAreaView>
    );
}

/* -------------------------- Styles -------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: COLORS.sub,
    },
    emptyContainer: {
        flexGrow: 1,
    },

    /* header */
    headerRow: {
        height: 50,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center' },
    h1: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginRight: 8 },
    countPill: { backgroundColor: COLORS.brandSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    countText: { color: COLORS.brand, fontWeight: '800', fontSize: 12 },

    sectionRow: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
    seeAllText: { color: COLORS.brand, fontWeight: '800', marginRight: 6 },

    /* Recently viewed horizontal cards */
    rvRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
    rvCard: {
        width: 120,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.line,
        backgroundColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: COLORS.shadow, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
            android: { elevation: 1 },
        }),
    },
    rvImg: { width: '100%', height: 84, resizeMode: 'cover' },
    rvMeta: { paddingHorizontal: 8, paddingVertical: 6 },
    rvTitle: { fontSize: 12.5, color: COLORS.text, fontWeight: '700' },
    rvPrice: { fontSize: 12, color: COLORS.sub, marginTop: 2, fontWeight: '700' },

    /* sticky chips */
    chipsWrap: {
        backgroundColor: COLORS.bg,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        gap: 8,
        borderBottomWidth: 1,
        borderColor: COLORS.line,
    },
    chip: {
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.line,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    chipText: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
    chipTextActive: { color: '#fff' },

    /* cards - FIXED LAYOUT */
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: COLORS.card,
        marginTop: 12,
        ...Platform.select({
            ios: { shadowColor: COLORS.shadow, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
            android: { elevation: 2 },
        }),
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
    },
    bg: { width: '100%', height: '100%', resizeMode: 'cover' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },

    /* discount badge */
    discountBadge: {
        position: 'absolute',
        top: 8,
        backgroundColor: COLORS.badge,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountTxt: { color: '#fff', fontWeight: '900', fontSize: 11.5 },

    /* dismiss */
    dismiss: {
        position: 'absolute',
        top: 8,
        backgroundColor: 'rgba(17,24,39,0.7)',
        padding: 8,
        borderRadius: 999,
    },

    meta: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderTopWidth: 1,
        borderColor: '#eef2ff',
    },
    title: {
        color: COLORS.text,
        fontWeight: '800',
        fontSize: 13.5,
        lineHeight: 16,
        marginBottom: 6,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
    },

    priceWrap: { flexDirection: 'row', alignItems: 'baseline' },
    priceNow: { color: COLORS.text, fontWeight: '900', fontSize: 14, marginRight: 6 },
    priceWas: { color: COLORS.danger, textDecorationLine: 'line-through', fontSize: 12, marginRight: 0 },

    tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    tagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.chip,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        marginLeft: 4,
        marginBottom: 4,
    },
    tagText: { color: '#222', fontWeight: '700', fontSize: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },

    cta: {
        backgroundColor: COLORS.brand,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    ctaText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },

    /* empty */
    emptyWrap: { alignItems: 'center', paddingTop: 40, paddingBottom: 60 },
    emptyCircle: {
        width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: COLORS.shadow, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
            android: { elevation: 6 },
        }),
    },
    emptyTitle: { marginTop: 14, fontSize: 16, fontWeight: '800', color: COLORS.text },
    emptySub: { marginTop: 4, color: COLORS.sub },
});