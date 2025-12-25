import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SkeletonProductListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

/* Dummy products */
const dummyProducts = [
    { id: '1', name: 'Denim Jacket', price: 1200, image: 'https://placehold.co/300x300' },
    { id: '2', name: 'Floral Dress', price: 1800, image: 'https://placehold.co/300x300' },
    { id: '3', name: 'Wireless Earbuds', price: 2500, image: 'https://placehold.co/300x300' },
    { id: '4', name: 'Sneakers', price: 2200, image: 'https://placehold.co/300x300' },
    { id: '5', name: 'Smart Watch', price: 3000, image: 'https://placehold.co/300x300' },
    { id: '6', name: 'Handbag', price: 1500, image: 'https://placehold.co/300x300' },
    { id: '7', name: 'T-Shirt', price: 800, image: 'https://placehold.co/300x300' },
    { id: '8', name: 'Hoodie', price: 1600, image: 'https://placehold.co/300x300' },
];

const CategoryProductScreen = ({ route, navigation }) => {
    const { gender, subcategories } = route.params || {};
    const [loading, setLoading] = useSkeletonLoader(true, 600);

    useEffect(() => {
        // Simulate loading - replace with actual API call
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setLoading]);

    const renderProduct = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* ---------- Header ---------- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="chevron-back" size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Products</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* ---------- Selected Filters ---------- */}
            <View style={styles.filterInfo}>
                <Text style={styles.filterText}>Gender: {gender || 'All'}</Text>
                {subcategories && subcategories.length > 0 ? (
                    <Text style={styles.filterText}>Categories: {subcategories.join(', ')}</Text>
                ) : (
                    <Text style={styles.filterText}>Categories: All</Text>
                )}
            </View>

            {/* ---------- Product grid ---------- */}
            {loading ? (
                <SkeletonProductListScreen columns={2} showHeader={false} showBanner={false} />
            ) : (
                <FlatList
                    data={dummyProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ padding: 12 }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        justifyContent: 'space-between',
    },
    backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },

    /* Filters */
    filterInfo: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fafafa',
    },
    filterText: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 4 },

    /* Products */
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
    },
    image: { width: 120, height: 120, borderRadius: 8, marginBottom: 8 },
    name: { fontWeight: '600', fontSize: 14, color: '#111' },
    price: { fontWeight: 'bold', color: '#004BFE', marginTop: 4 },
});

export default CategoryProductScreen;
