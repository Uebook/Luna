// src/screens/CelebrityDetailScreen.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView,
    Dimensions, StatusBar, ScrollView, Modal, Pressable, TextInput, Platform,
    StyleSheet as RNStyleSheet, I18nManager, Linking, RefreshControl, ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

const { width } = Dimensions.get('window');
const CARD_W = Math.floor((width - 16 * 2 - 12) / 2);
const CARD_H = Math.round(CARD_W * 1.25);

const isRTL = I18nManager.isRTL;
const USER_STORAGE_KEY = 'luna_user';

// Currency utility function
const getCurrencySymbol = (currencyCode) => {
    return 'BHD';
};

// Normalize user data
const normalizeUser = (userData) => {
    if (!userData) return null;

    return {
        id: userData.id?.toString() || '',
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        photo: userData.photo || '',
        currency: userData.currency || 'BHD',
        language: userData.language || 'en',
    };
};

const CelebrityDetailScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const COLORS = {
        p1: theme.p1,
        muted: theme.muted,
    };
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(['celeb', 'common']);

    const celebrity = route?.params?.celebrity;
    const vendorId = celebrity?.id;

    // State management
    const [vendorData, setVendorData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [storedUser, setStoredUser] = useState(null);

    // UI states
    const [searchVisible, setSearchVisible] = useState(false);
    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState('pop');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [sortSheetVisible, setSortSheetVisible] = useState(false);
    const [filterSheetVisible, setFilterSheetVisible] = useState(false);
    const [tempSortKey, setTempSortKey] = useState(sortKey);
    const [activeFilterTab, setActiveFilterTab] = useState('Category');
    const [tempSelected, setTempSelected] = useState({});
    const [filterSearch, setFilterSearch] = useState('');

    const scrollRef = useRef(null);

    // Load user data from AsyncStorage
    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                try {
                    const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
                    if (!active) return;

                    if (savedUser) {
                        const parsed = JSON.parse(savedUser);
                        const norm = normalizeUser(parsed);
                        setStoredUser(norm);
                    } else {
                        setStoredUser(null);
                    }
                } catch (error) {
                    console.log('Error loading user data:', error);
                    if (active) {
                        setStoredUser(null);
                    }
                }
            })();
            return () => { active = false; };
        }, [])
    );

    // Get display currency
    const displayCurrency = storedUser?.currency ? getCurrencySymbol(storedUser.currency) : 'BHD';

    // Sort/Filter config
    const SORT_OPTIONS = [
        { key: 'pop', label: t('common:popularity', 'Popularity') },
        { key: 'price_asc', label: t('common:price_low_high', 'Price: Low to High') },
        { key: 'price_desc', label: t('common:price_high_low', 'Price: High to Low') },
    ];

    const FILTER_TABS = ['Category', 'Brand', 'Price', 'Discount'];

    // API Functions
    const fetchVendorProducts = async () => {
        try {
            setError(null);

            const response = await fetch('https://luna-api.proteinbros.in/public/api/v1/screen/vendor/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendor_id: vendorId
                })
            });

            const data = await response.json();

            if (data.status && data.vendor && data.products) {
                setVendorData(data.vendor);
                setProducts(data.products);
            } else {
                throw new Error(data.message || 'Failed to load vendor data');
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Network error. Please try again.');
        }
    };

    const fetchAllData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        else setRefreshing(true);

        await fetchVendorProducts();

        if (!isRefresh) setLoading(false);
        else setRefreshing(false);
    };

    useEffect(() => {
        if (vendorId) {
            fetchAllData();
        } else {
            setError('No vendor ID provided');
            setLoading(false);
        }
    }, [vendorId]);

    const onRefresh = () => {
        fetchAllData(true);
    };

    // Helper functions
    const getImageUrl = (photoPath) => {
        if (!photoPath) return null;
        const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
        return `https://proteinbros.in/assets/images/products/${cleanPath}`;
    };

    const getDisplayCelebrity = () => {
        if (vendorData) {
            return {
                id: vendorData.id.toString(),
                name: vendorData.name || 'Vendor',
                title: vendorData.shop_name || 'Shop',
                image: getImageUrl(vendorData.photo),
                banner: getImageUrl(vendorData.shop_image) || getImageUrl(vendorData.photo)
            };
        }
        return celebrity;
    };

    const transformProduct = (product) => {
        const imageUrl = getImageUrl(product.photo) || getImageUrl(product.thumbnail);
        const discount = product.previous_price ?
            Math.round(((product.previous_price - product.price) / product.previous_price) * 100) : 0;

        return {
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            previous_price: product.previous_price,
            sku: product.sku,
            badge: discount >= 40 ? 'Exclusive' : discount >= 20 ? 'New' : product.featured ? 'Featured' : null,
            image: imageUrl,
            deepLink: product.affiliate_link || `yourapp://pdp/${product.id}`,
            discount: discount,
            stock: product.stock,
            details: product.details,
            // Add fields for filtering - using actual data from API
            category: product.category_id ? `Category ${product.category_id}` : 'Uncategorized',
            brand: product.brand_id ? `Brand ${product.brand_id}` : 'Generic',
            tags: product.tags || '',
            product_type: product.product_type || 'standard',
            size: product.size,
            size_price: product.size_price,
            color: product.color,
            thumbnail: product.thumbnail,
            attributes: product.attributes,
            colors: product.colors,
            ship: product.ship,
            policy: product.policy
        };
    };

    const transformedProducts = useMemo(() => {
        return products.map(transformProduct).filter(product => product.image);
    }, [products]);

    const displayCelebrity = getDisplayCelebrity();

    // FIXED: Generate filter options from transformed products
    const generateFilterOptions = useMemo(() => {
        console.log('Generating filter options from:', transformedProducts.length, 'products');

        if (!transformedProducts || transformedProducts.length === 0) {
            return {
                Category: [],
                Brand: [],
                Price: [],
                Discount: []
            };
        }

        const categories = new Map();
        const brands = new Map();
        const priceRanges = {
            'Under 50': 0,
            '50 – 100': 0,
            'Over 100': 0
        };
        const discountRanges = {
            '20% or more': 0,
            '40% or more': 0
        };

        transformedProducts.forEach(product => {
            // Count categories
            const category = product.category;
            categories.set(category, (categories.get(category) || 0) + 1);

            // Count brands
            const brand = product.brand;
            brands.set(brand, (brands.get(brand) || 0) + 1);

            // Count price ranges
            if (product.price <= 50) priceRanges['Under 50']++;
            else if (product.price <= 100) priceRanges['50 – 100']++;
            else priceRanges['Over 100']++;

            // Count discount ranges
            if (product.discount >= 40) discountRanges['40% or more']++;
            else if (product.discount >= 20) discountRanges['20% or more']++;
        });

        return {
            Category: Array.from(categories.entries()).map(([label, count], index) => ({
                id: `cat${index + 1}`,
                label,
                count
            })),
            Brand: Array.from(brands.entries()).map(([label, count], index) => ({
                id: `brand${index + 1}`,
                label,
                count
            })),
            Price: [
                { id: 'price1', label: 'Under 50', count: priceRanges['Under 50'] },
                { id: 'price2', label: '50 – 100', count: priceRanges['50 – 100'] },
                { id: 'price3', label: 'Over 100', count: priceRanges['Over 100'] },
            ],
            Discount: [
                { id: 'discount1', label: '20% or more', count: discountRanges['20% or more'] },
                { id: 'discount2', label: '40% or more', count: discountRanges['40% or more'] },
            ]
        };
    }, [transformedProducts]);

    // Filter and sort logic
    const appliedFiltersCount = useMemo(
        () => Object.values(selectedFilters).reduce((sum, set) => sum + (set ? set.size : 0), 0),
        [selectedFilters]
    );

    const visibleProducts = useMemo(() => {
        let list = [...transformedProducts];

        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((p) =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q)
            );
        }

        // Apply filters
        Object.entries(selectedFilters).forEach(([filterType, selectedItems]) => {
            if (selectedItems && selectedItems.size > 0) {
                list = list.filter(product => {
                    switch (filterType) {
                        case 'Category':
                            return selectedItems.has(product.category);
                        case 'Brand':
                            return selectedItems.has(product.brand);
                        case 'Price':
                            return Array.from(selectedItems).some(priceRange => {
                                if (priceRange === 'Under 50') return product.price <= 50;
                                if (priceRange === '50 – 100') return product.price > 50 && product.price <= 100;
                                if (priceRange === 'Over 100') return product.price > 100;
                                return true;
                            });
                        case 'Discount':
                            return Array.from(selectedItems).some(discountRange => {
                                if (discountRange === '20% or more') return product.discount >= 20;
                                if (discountRange === '40% or more') return product.discount >= 40;
                                return true;
                            });
                        default:
                            return true;
                    }
                });
            }
        });

        // Sort logic
        if (sortKey === 'price_asc') list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        else if (sortKey === 'price_desc') list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

        return list;
    }, [transformedProducts, sortKey, selectedFilters, query]);

    /* ---------- helpers: modals ---------- */
    const openSort = () => {
        setTempSortKey(sortKey);
        setSortSheetVisible(true);
    };

    const openFilter = () => {
        const copy = {};
        for (const key of Object.keys(selectedFilters)) {
            copy[key] = new Set(selectedFilters[key]);
        }
        setTempSelected(copy);
        setActiveFilterTab(FILTER_TABS[0]);
        setFilterSearch('');
        setFilterSheetVisible(true);
    };

    const applySort = () => {
        setSortKey(tempSortKey);
        setSortSheetVisible(false);
    };

    const applyFilter = () => {
        setSelectedFilters(tempSelected);
        setFilterSheetVisible(false);
    };

    const clearAllFilters = () => {
        setTempSelected({});
        setSelectedFilters({});
    };

    /* ---------- filter helpers ---------- */
    const getTempSet = (tab) => {
        if (!tempSelected[tab]) tempSelected[tab] = new Set();
        return tempSelected[tab];
    };

    const toggleFilter = (tab, filterId) => {
        const set = getTempSet(tab);
        if (set.has(filterId)) {
            set.delete(filterId);
        } else {
            set.add(filterId);
        }
        setTempSelected({ ...tempSelected, [tab]: new Set(set) });
    };

    const isFilterSelected = (tab, filterId) => {
        return tempSelected[tab]?.has(filterId) || false;
    };

    const currentFilterItems = useMemo(() => {
        const all = generateFilterOptions[activeFilterTab] || [];
        if (!filterSearch.trim()) return all;
        const q = filterSearch.toLowerCase();
        return all.filter((x) => x.label.toLowerCase().includes(q));
    }, [activeFilterTab, filterSearch, generateFilterOptions]);

    /* ---------- deep link ---------- */
    const openDeepLink = async (url) => {
        try {
            if (!url) return;
            const supported = await Linking.canOpenURL(url);
            if (supported) await Linking.openURL(url);
        } catch { }
    };

    /* ---------- product card ---------- */
    const renderProduct = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.productCard}
            onPress={() =>

                navigation.navigate?.('ProductDetailScreen', { productId: item.id, product: item })
            }
        >
            <View style={styles.productImageWrap}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                {!!item.badge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                )}
                {item.discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{item.discount}% OFF</Text>
                    </View>
                )}
            </View>
            <Text style={styles.productName} numberOfLines={2}>
                {item.name}
            </Text>
            <View style={styles.priceContainer}>
                <Text style={styles.price}>
                    {displayCurrency}
                    {item.price}
                </Text>
                {item.previous_price && item.previous_price > item.price && (
                    <Text style={styles.originalPrice}>
                        {displayCurrency}
                        {item.previous_price}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.p1} />
                    <Text style={styles.loadingText}>Loading vendor details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error && !vendorData) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={COLORS.muted} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchAllData}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* ======= Top bar with RTL/LTR swap + back/close search ======= */}
            <View style={[styles.topbar, { flexDirection: 'row' }]}>
                {isRTL ? (
                    <>
                        {/* Search (left in RTL) */}
                        <TouchableOpacity
                            onPress={() => setSearchVisible((v) => !v)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="search-outline" size={22} color="#111" />
                        </TouchableOpacity>

                        {/* Title */}
                        <Text style={[styles.topTitle, { textAlign: 'right', marginLeft: 10 }]} numberOfLines={1}>
                            {displayCelebrity?.name}
                        </Text>

                        {/* Back / Close (right in RTL) */}
                        <TouchableOpacity
                            onPress={() => searchVisible ? setSearchVisible(false) : navigation.goBack()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityLabel={searchVisible ? 'Close search' : 'Back'}
                        >
                            <Ionicons
                                name={searchVisible ? 'close' : 'chevron-forward'}
                                size={24}
                                color="#111"
                            />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* Back / Close (left in LTR) */}
                        <TouchableOpacity
                            onPress={() => searchVisible ? setSearchVisible(false) : navigation.goBack()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityLabel={searchVisible ? 'Close search' : 'Back'}
                        >
                            <Ionicons
                                name={searchVisible ? 'close' : 'chevron-back'}
                                size={24}
                                color="#111"
                            />
                        </TouchableOpacity>

                        {/* Title */}
                        <Text style={[styles.topTitle, { textAlign: 'left', marginLeft: 10 }]} numberOfLines={1}>
                            {displayCelebrity?.name}
                        </Text>

                        {/* Search (right in LTR) */}
                        <TouchableOpacity
                            onPress={() => setSearchVisible((v) => !v)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="search-outline" size={22} color="#111" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Search */}
            {searchVisible && (
                <View style={[styles.headerSearch, { paddingBottom: 8 }]}>
                    <View style={[styles.headerSearchBox, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Ionicons name="search-outline" size={18} color="#888" />
                        <TextInput
                            style={[styles.headerSearchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                            placeholder={t('celeb:search_products', 'Search products')}
                            placeholderTextColor="#a0a0a0"
                            value={query}
                            onChangeText={setQuery}
                            returnKeyType="search"
                            autoFocus
                        />
                        {query ? (
                            <TouchableOpacity
                                onPress={() => setQuery('')}
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                                <Ionicons name="close-circle" size={18} color="#aaa" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            )}

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Ionicons name="warning-outline" size={16} color="#fff" />
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity onPress={fetchAllData}>
                        <Text style={styles.retryLink}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#111']}
                        tintColor="#111"
                    />
                }
            >
                {/* Hero (prefer banner if provided) */}
                {displayCelebrity?.banner && (
                    <View style={styles.heroWrap}>
                        <Image source={{ uri: displayCelebrity.banner }} style={styles.heroImg} />
                        <View style={styles.heroOverlay} />
                        <View style={styles.heroTextWrap}>
                            <Text style={styles.heroName} numberOfLines={1}>
                                {displayCelebrity.name}
                            </Text>
                            {!!displayCelebrity.title && (
                                <Text style={styles.heroSubtitle}>{displayCelebrity.title}</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* STICKY CONTROLS */}
                <View style={styles.stickyWrap}>
                    <View style={[styles.controlsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <TouchableOpacity style={styles.controlBtn} onPress={openSort} activeOpacity={0.85}>
                            <Ionicons name="swap-vertical" size={18} color="#111" />
                            <Text style={styles.controlText}>
                                {SORT_OPTIONS.find((o) => o.key === sortKey)?.label || 'Sort'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlBtn} onPress={openFilter} activeOpacity={0.85}>
                            <Ionicons name="funnel-outline" size={18} color="#111" />
                            <Text style={styles.controlText}>
                                {appliedFiltersCount ? `${appliedFiltersCount} selected` : t('celeb:filter', 'Filter')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Products */}
                <Text style={styles.sectionH}>{t('celeb:products', 'Products')}</Text>
                {visibleProducts?.length > 0 ? (
                    <FlatList
                        data={visibleProducts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderProduct}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                        contentContainerStyle={{ paddingBottom: 28, paddingTop: 10 }}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 20, paddingBottom: 20 }}>
                        <Ionicons name="search-outline" size={48} color="#666" />
                        <Text style={{ color: '#666', marginTop: 12 }}>
                            {query ? 'No products match your search' : 'No products available'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* ===== Sort Modal ===== */}
            <Modal visible={sortSheetVisible} transparent animationType="fade" onRequestClose={() => setSortSheetVisible(false)}>
                <View style={styles.modalRoot}>
                    <Pressable style={styles.backdrop} onPress={() => setSortSheetVisible(false)} />
                    <View style={[styles.sheet, { paddingBottom: (insets?.bottom || 0) + 12 }]}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>{t('celeb:sort_by', 'Sort By')}</Text>

                        {SORT_OPTIONS.map((opt) => {
                            const active = tempSortKey === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={styles.rowItem}
                                    onPress={() => setTempSortKey(opt.key)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.rowText, active && styles.rowTextActive]}>
                                        {opt.label}
                                    </Text>
                                    <Ionicons
                                        name={active ? 'radio-button-on' : 'radio-button-off'}
                                        size={20}
                                        color={active ? '#111' : '#9aa0a6'}
                                    />
                                </TouchableOpacity>
                            );
                        })}

                        <View style={styles.sheetActions}>
                            <TouchableOpacity style={styles.resetBtn} onPress={() => setTempSortKey('pop')}>
                                <Text style={styles.resetText}>{t('celeb:reset', 'Reset')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={applySort}>
                                <Text style={styles.applyText}>{t('celeb:show_results', 'Show Results')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ===== Filter Modal ===== */}
            <Modal visible={filterSheetVisible} transparent animationType="fade" onRequestClose={() => setFilterSheetVisible(false)}>
                <View style={styles.modalRoot}>
                    <Pressable style={styles.backdrop} onPress={() => setFilterSheetVisible(false)} />
                    <View style={[styles.sheet, { height: '70%', paddingBottom: (insets?.bottom || 0) + 12 }]}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.filterHeader}>
                            <TouchableOpacity
                                onPress={() => setFilterSheetVisible(false)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color="#111" />
                            </TouchableOpacity>
                            <Text style={styles.filterTitle}>{t('celeb:filter_by', 'Filter By')}</Text>
                            <View style={{ width: 22 }} />
                        </View>

                        <View style={[styles.filterBody, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            {/* Sidebar tabs */}
                            <View style={styles.sidebar}>
                                {FILTER_TABS.map((tname) => {
                                    const active = tname === activeFilterTab;
                                    return (
                                        <TouchableOpacity
                                            key={tname}
                                            style={[styles.sideTab, active && styles.sideTabActive]}
                                            onPress={() => setActiveFilterTab(tname)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.sideTabText, active && styles.sideTabTextActive]}>
                                                {tname}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Content area */}
                            <View style={styles.contentArea}>
                                <View style={[styles.searchBox, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <Ionicons name="search-outline" size={16} color="#888" />
                                    <TextInput
                                        style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
                                        placeholder={t('celeb:search', 'Search')}
                                        placeholderTextColor="#a0a0a0"
                                        value={filterSearch}
                                        onChangeText={setFilterSearch}
                                        returnKeyType="search"
                                    />
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                                    {currentFilterItems.length > 0 ? (
                                        currentFilterItems.map((item) => {
                                            const isSelected = isFilterSelected(activeFilterTab, item.label);
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.filterItem}
                                                    onPress={() => toggleFilter(activeFilterTab, item.label)}
                                                    activeOpacity={0.8}
                                                >
                                                    <View style={styles.filterItemContent}>
                                                        <Ionicons
                                                            name={isSelected ? 'checkbox' : 'square-outline'}
                                                            size={20}
                                                            color={isSelected ? '#111' : '#9aa0a6'}
                                                        />
                                                        <Text style={styles.filterLabel} numberOfLines={1}>
                                                            {item.label}
                                                        </Text>
                                                        <Text style={styles.filterCount}>({item.count})</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })
                                    ) : (
                                        <View style={styles.noFilters}>
                                            <Text style={styles.noFiltersText}>
                                                No {activeFilterTab.toLowerCase()} options available
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.filterActions}>
                            <TouchableOpacity style={styles.clearBtn} onPress={clearAllFilters}>
                                <Text style={styles.clearText}>{t('celeb:clear_all', 'CLEAR ALL')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
                                <Text style={styles.applyText}>{t('celeb:apply', 'APPLY')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CelebrityDetailScreen;

/* ------------------------------ Styles ------------------------------ */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    // Loading and Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#fff',
    },
    errorText: {
        marginTop: 16,
        marginBottom: 24,
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff3b30',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    errorBannerText: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        marginLeft: 8,
        marginRight: 12,
    },
    retryLink: {
        color: '#fff',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    retryButton: {
        backgroundColor: '#111',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    /* Top bar */
    topbar: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    topTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111' },

    /* Header search (non-scroll) */
    headerSearch: { paddingHorizontal: 16, backgroundColor: '#fff' },
    headerSearchBox: {
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
    },
    headerSearchInput: { marginHorizontal: 8, flex: 1, color: '#111' },

    /* Hero */
    heroWrap: { height: Math.round(width * 0.42), marginBottom: 8 },
    heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    heroOverlay: {
        ...RNStyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    heroTextWrap: { position: 'absolute', left: 16, bottom: 16, right: 16 },
    heroName: { color: '#fff', fontSize: 22, fontWeight: '800' },
    heroSubtitle: { color: '#f3f3f3', fontSize: 13, marginTop: 2 },

    /* Sticky controls */
    stickyWrap: {
        backgroundColor: '#fff',
        ...(Platform.OS === 'ios'
            ? {
                shadowColor: '#000',
                shadowOpacity: 0.07,
                shadowOffset: { width: 0, height: 6 },
                shadowRadius: 10,
            }
            : { elevation: 3 }),
    },
    controlsRow: {
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
    },
    controlBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#eaedf1',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlText: { fontSize: 15, color: '#111', fontWeight: '600' },

    sectionH: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
        paddingHorizontal: 16,
        marginTop: 14,
    },

    /* Grid */
    productCard: { width: CARD_W, marginBottom: 16 },
    productImageWrap: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f3f3f5',
        position: 'relative',
    },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#111',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#16a34a',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700'
    },
    productName: { marginTop: 6, color: '#111', fontSize: 15, fontWeight: '700' },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    price: { color: '#111', fontSize: 15, fontWeight: '600' },
    originalPrice: {
        color: '#666',
        fontSize: 13,
        textDecorationLine: 'line-through',
        marginLeft: 6,
    },

    /* Modal anchoring */
    modalRoot: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
        ...RNStyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },

    /* Sheet (shared) */
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 8,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e1e5ea',
        marginTop: 6,
        marginBottom: 12,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
        paddingHorizontal: 16,
        marginBottom: 6,
    },

    /* Rows in sheet */
    rowItem: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ededed',
    },
    rowText: { color: '#111', fontSize: 16 },
    rowTextActive: { fontWeight: '800' },

    sheetActions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 12,
        marginBottom: 6,
    },
    resetBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dfe3e8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetText: { color: '#111', fontWeight: '700' },
    applyBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyText: { color: '#fff', fontWeight: '800', letterSpacing: 0.2 },

    /* Filter modal layout */
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    filterTitle: { fontSize: 20, color: '#111', fontWeight: '800' },

    filterBody: {
        gap: 12,
        paddingHorizontal: 12,
        flex: 1,
        minHeight: 260,
        flexDirection: 'row',
    },
    sidebar: {
        width: 120,
        borderRightWidth: 1,
        borderRightColor: '#eee',
        paddingVertical: 6,
    },
    sideTab: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 6,
    },
    sideTabActive: { backgroundColor: '#111' },
    sideTabText: { color: '#111', fontWeight: '600' },
    sideTabTextActive: { color: '#fff', fontWeight: '800' },

    contentArea: { flex: 1 },
    searchBox: {
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
        flexDirection: 'row',
    },
    searchInput: { marginHorizontal: 8, flex: 1, color: '#111' },

    /* Filter items */
    filterItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    filterItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    filterLabel: {
        flex: 1,
        color: '#111',
        fontSize: 15,
        fontWeight: '500',
    },
    filterCount: {
        color: '#666',
        fontSize: 14,
        marginRight: 8,
    },
    noFilters: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    noFiltersText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
    },

    filterActions: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        marginTop: 10,
    },
    clearBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearText: { color: '#777', fontWeight: '700' },
});