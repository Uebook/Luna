// ExploreScreen.js
import React, { useCallback, useMemo, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
    FlatList, Image, RefreshControl, ActivityIndicator, Platform, Modal,
    Pressable, StatusBar, ActionSheetIOS, useWindowDimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

/* ===== Data ===== */
const ALL_CATEGORIES = ['All', 'Fashion', 'Mobile', 'Electronics', 'Beauty', 'Home', 'Sports', 'Footwear', 'Watches'];
const ALL_SORTS = [
    { key: 'reco', label: 'Recommended' },
    { key: 'popular', label: 'Popular' },
    { key: 'low', label: 'Price: Low to High' },
    { key: 'high', label: 'Price: High to Low' },
    { key: 'new', label: 'New Arrivals' },
];

const seed = [
    { id: '1', title: 'Signature Tee', price: 799, image: 'https://images.unsplash.com/photo-1520975922215-cf1bd5081163?q=80&w=800&auto=format&fit=crop', category: 'Fashion', rating: 4.4 },
    { id: '2', title: 'Retro Shades', price: 1299, image: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=800&auto=format&fit=crop', category: 'Fashion', rating: 4.6 },
    { id: '3', title: 'Running Shoes', price: 2199, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', category: 'Footwear', rating: 4.2 },
    { id: '4', title: 'Smart Watch', price: 3499, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop', category: 'Watches', rating: 4.1 },
    { id: '5', title: 'Bluetooth Buds', price: 1699, image: 'https://images.unsplash.com/photo-1518449007433-1dbbe8d46d57?q=80&w=800&auto=format&fit=crop', category: 'Electronics', rating: 4.3 },
    { id: '6', title: 'Denim Jacket', price: 1899, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop', category: 'Fashion', rating: 4.5 },
    { id: '7', title: 'Mixer Grinder', price: 2899, image: 'https://images.unsplash.com/photo-1562184552-97d3f5dc53a6?q=80&w=800&auto=format&fit=crop', category: 'Home', rating: 4.0 },
    { id: '8', title: 'Kajal Pack', price: 249, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop', category: 'Beauty', rating: 4.1 },
];

/* ===== Responsive helpers ===== */
// moderate font scaling based on width (guideline 375)
const ms = (width, size, factor = 0.25) =>
    size + (Math.max(width, 320) / 375 - 1) * size * factor;

// pick columns by width (phones 2, phablets 3, tablets 4)
const getColumns = (width) => {
    if (width >= 1000) return 4;
    if (width >= 700) return 3;
    return 2;
};

export default function ExploreScreen({ navigation }) {
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
        red: theme.red,
    };
    const gradientHeader = [THEME.p1, THEME.p2, THEME.p3];
    const CHIP_BG = '#EEE8FF';
    const TEXT_DARK = '#111827';
    const styles = useMemo(() => createStyles(THEME), [THEME]);
    const { width } = useWindowDimensions();
    const numColumns = getColumns(width);
    const GAP = 12;
    const H_PADDING = 12;

    // available width for a card
    const cardWidth = (width - H_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;
    const imageHeight = Math.round(cardWidth * 0.66); // ~3:2 ratio

    const [query, setQuery] = useState('');
    const [activeCat, setActiveCat] = useState('All');
    const [sortKey, setSortKey] = useState('reco');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState(seed);
    const [sortSheet, setSortSheet] = useState(false);

    const filtered = useMemo(() => {
        let list = [...data];
        if (activeCat !== 'All') list = list.filter(i => i.category === activeCat);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(i => i.title.toLowerCase().includes(q));
        }
        switch (sortKey) {
            case 'low': list.sort((a, b) => a.price - b.price); break;
            case 'high': list.sort((a, b) => b.price - a.price); break;
            case 'popular': list.sort((a, b) => b.rating - a.rating); break;
            case 'new':
            case 'reco':
            default: break;
        }
        return list;
    }, [data, activeCat, query, sortKey]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setData(prev => [...prev]);
            setRefreshing(false);
        }, 900);
    }, []);

    const loadMore = useCallback(() => {
        if (loadingMore) return;
        setLoadingMore(true);
        setTimeout(() => {
            const next = seed.map(x => ({ ...x, id: String(Math.random()) }));
            setData(prev => [...prev, ...next]);
            setLoadingMore(false);
        }, 900);
    }, [loadingMore]);

    const openSort = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [...ALL_SORTS.map(s => s.label), 'Cancel'],
                    cancelButtonIndex: ALL_SORTS.length,
                    userInterfaceStyle: 'light',
                },
                (idx) => {
                    if (idx >= 0 && idx < ALL_SORTS.length) setSortKey(ALL_SORTS[idx].key);
                }
            );
        } else {
            setSortSheet(true);
        }
    };

    const renderChip = (label) => {
        const active = activeCat === label;
        return (
            <TouchableOpacity
                key={label}
                style={[styles.chip, active && { backgroundColor: THEME.p2, borderColor: THEME.p2 }]}
                onPress={() => setActiveCat(label)}
                activeOpacity={0.85}
            >
                <Text
                    style={[
                        styles.chipText,
                        { fontSize: ms(width, 13) },
                        active && { color: '#fff' },
                    ]}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const ProductCard = ({ item }) => (
        <TouchableOpacity style={[styles.card, { width: cardWidth }]} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={[styles.image, { height: imageHeight }]} />
            <Text numberOfLines={2} style={[styles.title, { fontSize: ms(width, 14) }]}>{item.title}</Text>
            <View style={styles.cardRow}>
                <Text style={[styles.price, { fontSize: ms(width, 14) }]}>₹{item.price.toLocaleString('en-IN')}</Text>
                <View style={styles.ratingPill}>
                    <Icon name="star" size={12} color="#fff" />
                    <Text style={[styles.ratingText, { fontSize: ms(width, 12) }]}>{item.rating}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
            {/* Header with gradient */}
            <LinearGradient
                colors={gradientHeader}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[
                    styles.header,
                    { paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 8 }
                ]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Icon name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: ms(width, 18) }]}>Explore</Text>
                <View style={{ width: 32 }} />
            </LinearGradient>

            {/* Toolbar */}
            <View style={[styles.toolbar, { paddingHorizontal: H_PADDING }]}>
                <View style={styles.searchBox}>
                    <Icon name="search" size={18} color={THEME.muted} />
                    <TextInput
                        placeholder="Search products"
                        placeholderTextColor={THEME.muted}
                        value={query}
                        onChangeText={setQuery}
                        style={{ flex: 1, paddingLeft: 8, fontSize: ms(width, 14) }}
                        returnKeyType="search"
                    />
                </View>
                <TouchableOpacity style={styles.sortBtn} onPress={openSort} activeOpacity={0.85}>
                    <Icon name="filter-outline" size={18} color={THEME.p2} />
                    <Text style={[styles.sortText, { fontSize: ms(width, 13) }]}>
                        {ALL_SORTS.find(s => s.key === sortKey)?.label ?? 'Sort'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Category Chips */}
            <FlatList
                data={ALL_CATEGORIES}
                keyExtractor={(x) => x}
                renderItem={({ item }) => renderChip(item)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingVertical: 8, height: 70 }}
            />

            {/* Grid */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PADDING }}
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
                renderItem={({ item }) => <ProductCard item={item} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onEndReachedThreshold={0.2}
                onEndReached={loadMore}
                ListFooterComponent={loadingMore ? (
                    <View style={{ paddingVertical: 16 }}>
                        <ActivityIndicator />
                    </View>
                ) : null}
            />

            {/* Android Sort Bottom Sheet */}
            <Modal visible={sortSheet} animationType="slide" transparent onRequestClose={() => setSortSheet(false)}>
                <Pressable style={styles.sheetBackdrop} onPress={() => setSortSheet(false)} />
                <View style={styles.sheet}>
                    <View style={styles.sheetGrab} />
                    <Text style={styles.sheetTitle}>Sort by</Text>
                    {ALL_SORTS.map((s) => (
                        <TouchableOpacity
                            key={s.key}
                            style={styles.sheetItem}
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
const createStyles = (THEME) => StyleSheet.create({
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
    back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#fff', fontWeight: '700' },

    toolbar: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 10,
        paddingBottom: 12,
        alignItems: 'center',
        backgroundColor: THEME.bg,
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
    sortText: { color: THEME.p2, fontWeight: '700' },

    chip: {
        backgroundColor: CHIP_BG,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e9ddff',
        height: 40
    },
    chipText: { color: TEXT_DARK, fontWeight: '600' },

    card: {
        backgroundColor: THEME.white,
        borderRadius: 16,
        padding: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#eef2ff',
    },
    image: { width: '100%', borderRadius: 12, marginBottom: 8, backgroundColor: '#f1f5f9' },
    title: { color: TEXT_DARK, fontWeight: '600', marginBottom: 6 },
    cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    price: { fontWeight: '800', color: TEXT_DARK },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999
    },
    ratingText: { color: '#fff', fontWeight: '700' },

    // Bottom sheet
    sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
    sheet: {
        backgroundColor: THEME.white,
        paddingTop: 8,
        paddingHorizontal: 16,
        paddingBottom: 24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    sheetGrab: {
        alignSelf: 'center',
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: THEME.line,
        marginBottom: 8,
    },
    sheetTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 6 },
    sheetItem: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: THEME.line,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sheetItemText: { fontSize: 15, color: TEXT_DARK },
});
