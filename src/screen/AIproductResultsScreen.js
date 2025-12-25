// src/screens/ProductResultsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SkeletonProductListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

const CARD_W = 164;

const ProductCard = ({ item, THEME }) => (
    <TouchableOpacity style={[styles.card, { borderColor: THEME.line, backgroundColor: THEME.card }]} activeOpacity={0.9}>
        <Image source={{ uri: item.img || item.thumb }} style={styles.cardImg} />
        <Text numberOfLines={2} style={[styles.cardTitle, { color: THEME.ink }]}>{item.title}</Text>
        {item.price ? <Text style={[styles.cardPrice, { color: THEME.p3 }]}>{item.price}</Text> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: '#6b7280' }}>{item.category}</Text>
        </View>
        <TouchableOpacity style={[styles.openBtn, { backgroundColor: THEME.p3 }]}>
            <Icon name="cart-outline" size={16} color="#fff" />
            <Text style={styles.openBtnText}>Open Product</Text>
        </TouchableOpacity>
    </TouchableOpacity>
);

export default function ProductResultsScreen({ route, navigation }) {
    const THEME = route?.params?.THEME || {
        p1: '#A78BFA', p2: '#7C3AED', p3: '#5B21B6', p4: '#C4B5FD',
        white: '#ffffff', ink: '#111111', gray: '#6b7280', muted: '#9ca3af',
        line: '#e6e6f0', card: '#FFFFFF', bg: '#fafafb', red: '#FF3B30',
    };
    const title = route?.params?.title || 'Results';
    const items = route?.params?.items || [];
    const summary = route?.params?.summary;
    const [loading, setLoading] = useSkeletonLoader(true, 600);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setLoading]);

    if (loading) {
        return <SkeletonProductListScreen columns={2} showHeader={false} showBanner={false} />;
    }

    return (
        <View style={[styles.page, { backgroundColor: THEME.bg }]}>
            <LinearGradient colors={[THEME.p1, THEME.p2, THEME.p3]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hIcon}>
                        <Icon name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.hTitle}>{title}</Text>
                    <View style={{ width: 36 }} />
                </View>
                {summary ? <Text style={styles.summary}>{summary}</Text> : null}
            </LinearGradient>

            <FlatList
                data={items}
                keyExtractor={(it) => it.id}
                numColumns={2}
                columnWrapperStyle={{ paddingHorizontal: 12, justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingVertical: 12, paddingBottom: 24 }}
                renderItem={({ item }) => <ProductCard item={item} THEME={THEME} />}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: THEME.gray }}>No products found.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1 },
    header: { paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    hIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    hTitle: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '900', fontSize: 18 },
    summary: { marginTop: 8, color: '#fff', opacity: 0.9 },

    card: { width: CARD_W, borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 8 },
    cardImg: { width: '100%', height: 120, borderRadius: 10, backgroundColor: '#f5f5f5', marginBottom: 6 },
    cardTitle: { fontSize: 13 },
    cardPrice: { fontSize: 15, fontWeight: '900', marginTop: 2 },
    openBtn: { marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    openBtnText: { color: '#fff', fontWeight: '800' },
});
