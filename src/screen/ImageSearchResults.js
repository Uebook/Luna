// src/screens/ImageSearchResults.js
import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useResponsive } from '../utils/useResponsive';

// TODO: replace with your real API call
async function mockSearchByImage(imageUri) {
    await new Promise((r) => setTimeout(r, 700));
    const img = (n) => `https://picsum.photos/seed/${encodeURIComponent(imageUri + n)}/400/400`;
    return [
        { id: 'p1', name: 'Classic Sneakers', price: 49.0, product_images: [{ image: img(1) }] },
        { id: 'p2', name: 'Everyday Trainers', price: 59.0, product_images: [{ image: img(2) }] },
        { id: 'p3', name: 'Mesh Running Shoes', price: 79.0, product_images: [{ image: img(3) }] },
        { id: 'p4', name: 'Slip-On Comfort', price: 39.0, product_images: [{ image: img(4) }] },
        { id: 'p5', name: 'Sporty Canvas', price: 29.0, product_images: [{ image: img(5) }] },
        { id: 'p6', name: 'Court Low', price: 89.0, product_images: [{ image: img(6) }] },
    ];
}

const ImageSearchResults = ({ navigation, route }) => {
    const { width, scale, fontSize, spacing, getCardWidth } = useResponsive();
    const image = route?.params?.image; // asset from image-picker
    const imageUri = image?.uri;

    // Responsive card dimensions
    const CARD_W = useMemo(() => getCardWidth(2, scale(16), scale(12)), [width, scale, getCardWidth]);
    const CARD_H = useMemo(() => Math.floor(CARD_W * 1.15), [CARD_W]);

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    const [err, setErr] = useState('');

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Replace with your real API:
                // const data = await searchByImage(imageUri);
                const data = await mockSearchByImage(imageUri);
                if (!mounted) return;
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {
                setErr('Failed to fetch results.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [imageUri]);

    const styles = useMemo(() => createStyles(scale, fontSize, spacing, CARD_W, CARD_H), [scale, fontSize, spacing, CARD_W, CARD_H]);

    const renderCard = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate?.('ProductDetail', { productId: item.id, product: item })}
        >
            <Image
                source={{ uri: item?.product_images?.[0]?.image || 'https://placehold.co/400x400' }}
                style={styles.cardImg}
            />
            <Text style={styles.cardTitle} numberOfLines={2}>{item?.name || '—'}</Text>
            <Text style={styles.cardPrice}>{item?.price != null ? `₹${item.price}` : ''}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Top bar */}
            <View style={styles.topbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.title}>Matches</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Query image */}
            {imageUri ? (
                <View style={styles.queryWrap}>
                    <Image source={{ uri: imageUri }} style={styles.queryImg} />
                    <Text style={styles.queryCaption} numberOfLines={1}>
                        {image?.fileName || 'Chosen image'}
                    </Text>
                </View>
            ) : null}

            {/* Body */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator />
                    <Text style={{ marginTop: 8, color: '#666' }}>Searching similar items…</Text>
                </View>
            ) : err ? (
                <View style={styles.center}>
                    <Text style={{ color: 'tomato' }}>{err}</Text>
                </View>
            ) : results.length === 0 ? (
                <View style={styles.center}>
                    <Text style={{ color: '#333', fontWeight: '600' }}>No matches found</Text>
                    <Text style={{ color: '#666', marginTop: 6 }}>Try a clearer photo or a different angle.</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, idx) => String(item?.id ?? idx)}
                    renderItem={renderCard}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing(16) }}
                    contentContainerStyle={{ paddingBottom: spacing(24), paddingTop: spacing(8) }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default ImageSearchResults;

const createStyles = (scale, fontSize, spacing, cardW, cardH) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    topbar: {
        paddingHorizontal: spacing(12),
        paddingVertical: spacing(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: { fontSize: fontSize(18), fontWeight: '700', color: '#111' },

    queryWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing(16),
        paddingBottom: spacing(8),
    },
    queryImg: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(8),
        marginRight: spacing(10),
        backgroundColor: '#eee'
    },
    queryCaption: { color: '#333', flex: 1, fontSize: fontSize(14) },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    card: {
        width: cardW,
        marginBottom: spacing(12),
    },
    cardImg: {
        width: cardW,
        height: cardH,
        borderRadius: scale(12),
        backgroundColor: '#f1f1f1',
    },
    cardTitle: {
        marginTop: spacing(8),
        color: '#111',
        fontSize: fontSize(14),
    },
    cardPrice: {
        marginTop: spacing(2),
        color: '#000',
        fontWeight: '700',
        fontSize: fontSize(15),
    },
});
