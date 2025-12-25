// screens/TopProductsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { SkeletonProductListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

const { width } = Dimensions.get('window');
const H_PADDING = 16;
const GAP = 16;
const CARD_WIDTH = (width - H_PADDING * 2 - GAP) / 2;

const LATEST_API = 'https://argosmob.uk/luna/public/api/v1/products/latest';

const TopProductsScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const [refreshing, setRefreshing] = useState(false);

    const load = async (signal) => {
        try {
            const res = await axios.get(LATEST_API, { signal });
            // API can be { data: [...] } OR { products: [...] }
            const list =
                Array.isArray(res?.data?.data)
                    ? res.data.data
                    : Array.isArray(res?.data?.products)
                        ? res.data.products
                        : [];
            setItems(list);
        } catch (e) {
            if (axios.isCancel?.(e) || e.name === 'CanceledError') return;
            console.log('Latest products error:', e?.message || e);
            setItems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        const controller = new AbortController();
        load(controller.signal);
    }, []);

    const renderItem = ({ item }) => {
        const img = item?.product_images?.[0]?.image || 'https://placehold.co/400x400';
        const price = item?.discounted_price ?? item?.price ?? '0.00';

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.card}
                onPress={() => {
                    // navigation.navigate('ProductDetail', { product: item });
                }}
            >
                <Image source={{ uri: img }} style={styles.image} />
                <Text numberOfLines={2} style={styles.title}>
                    {item?.name || '—'}
                </Text>
                <Text style={styles.price}>₹{price}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Top Products</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <SkeletonProductListScreen columns={2} showHeader={false} showBanner={false} />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(it) => String(it.id)}
                    numColumns={2}
                    renderItem={renderItem}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: H_PADDING }}
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, rowGap: 0 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

export default TopProductsScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        paddingHorizontal: H_PADDING,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginRight: 36,
    },

    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 16,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#eaeaea',
    },
    image: {
        width: '100%',
        height: CARD_WIDTH, // square
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 14,
        color: '#000',
        paddingHorizontal: 10,
        paddingTop: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 24,
        color: '#666',
    },
});
