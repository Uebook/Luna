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
import { SkeletonProductListScreen } from '../components/SkeletonLoader';
import api from '../services/api';
// Image picker is now handled via react-native-image-crop-picker in NewHome.js

const ImageSearchResults = ({ navigation, route }) => {
    const { width, scale, fontSize, spacing, getCardWidth } = useResponsive();
    const image = route?.params?.image; // asset from image-crop-picker
    // Handle both formats: string URI or object with uri/path property
    const imageUri = typeof image === 'string' ? image : (image?.uri || image?.path);

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
                if (!imageUri) {
                    setLoading(false);
                    return;
                }

                // Create form data for image upload
                const formData = new FormData();
                
                // Handle image-crop-picker format (returns object with path property)
                // imageUri is already extracted as string (path or uri), so use it directly
                formData.append('image', {
                    uri: imageUri,
                    type: image?.mime || image?.type || 'image/jpeg',
                    name: image?.filename || image?.fileName || 'search-image.jpg',
                });

                // Call API
                const response = await api.post('/v1/image-search/search', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (!mounted) return;

                if (response.data.success && response.data.products) {
                    // Transform API response to match expected format
                    const transformed = response.data.products.map(product => {
                        // Handle image URL - build full URL if relative path
                        let imageUrl = product.thumbnail || product.photo;
                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('file://')) {
                            // If relative path, prepend base URL
                            const baseUrl = 'https://luna-api.proteinbros.in/public/uploads/products/';
                            imageUrl = baseUrl + (imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl);
                        }
                        
                        return {
                            id: product.id,
                            name: product.name || product.title || 'Product',
                            price: parseFloat(product.price || 0),
                            product_images: [{
                                image: imageUrl || 'https://via.placeholder.com/400'
                            }],
                        };
                    });
                    setResults(transformed);
                    setErr(''); // Clear any previous errors
                } else {
                    setResults([]);
                    setErr(response.data.message || 'No products found');
                }
            } catch (e) {
                console.log('Image search error:', e);
                console.log('Error details:', e.response?.data || e.message);
                setErr(e.response?.data?.message || e.response?.data?.errors?.image?.[0] || 'Failed to search products. Please try again.');
                // Fallback to empty results
                setResults([]);
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
            {(imageUri || image?.uri) ? (
                <View style={styles.queryWrap}>
                    <Image source={{ uri: imageUri || image?.uri }} style={styles.queryImg} />
                    <Text style={styles.queryCaption} numberOfLines={1}>
                        {image?.fileName || image?.name || 'Chosen image'}
                    </Text>
                </View>
            ) : null}

            {/* Body */}
            {loading ? (
                <SkeletonProductListScreen columns={2} showHeader={false} showBanner={false} />
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
