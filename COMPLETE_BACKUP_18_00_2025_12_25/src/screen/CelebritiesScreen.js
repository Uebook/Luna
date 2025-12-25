import React, { useMemo, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, FlatList, TouchableOpacity,
    SafeAreaView, TextInput, Dimensions, I18nManager, ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');
const GAP = 12;
const COLS = 2;
const CARD_W = Math.floor((width - 16 * 2 - GAP) / COLS);

// Fallback image URLs
const FALLBACK_IMAGES = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/women/1.jpg',
    'https://randomuser.me/api/portraits/men/2.jpg',
    'https://randomuser.me/api/portraits/women/2.jpg',
];

const CelebritiesExploreScreen = ({ navigation }) => {
    const { t } = useTranslation(['explore']);
    const isRTL = I18nManager.isRTL;
    const dirRow = { flexDirection: isRTL ? 'row-reverse' : 'row' };

    const CHIPS = useMemo(() => ([
        t('explore:chip_all', 'All'),
        t('explore:chip_trending', 'Trending'),
        t('explore:chip_az', 'A–Z'),
        t('explore:chip_new', 'New')
    ]), [t]);

    const [query, setQuery] = useState('');
    const [chip, setChip] = useState(CHIPS[0]);
    const [liked, setLiked] = useState(() => new Set());
    const [celebrities, setCelebrities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to construct proper image URL
    const getImageUrl = (photoPath, vendorId) => {
        if (!photoPath) {
            // Return a fallback image based on vendor ID for consistency
            const fallbackIndex = vendorId % FALLBACK_IMAGES.length;
            return FALLBACK_IMAGES[fallbackIndex];
        }

        // Remove leading slash if present
        const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;

        // Construct the full URL
        const baseUrl = 'https://luna-api.proteinbros.in/public';
        const fullUrl = `${baseUrl}/${cleanPath}`;

        console.log('Image URL:', fullUrl);
        return fullUrl;
    };

    // Fetch celebrities from API
    const fetchCelebrities = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://luna-api.proteinbros.in/public/api/v1/screen/vendors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (data.status && data.vendors) {
                // Transform API data to match our component structure
                const transformedData = data.vendors.map(vendor => {
                    console.log('Vendor photo:', vendor.photo);
                    return {
                        id: vendor.id.toString(),
                        name: vendor.name || `${vendor.first_name} ${vendor.last_name}`,
                        title: vendor.shop_name || 'Vendor',
                        image: getImageUrl(vendor.photo, vendor.id),
                        city: vendor.city,
                        country: vendor.country,
                        shop_details: vendor.shop_details,
                        originalPhoto: vendor.photo, // Keep original for debugging
                    };
                });

                setCelebrities(transformedData);
            } else {
                setError('Failed to load celebrities');
            }
        } catch (err) {
            console.error('API Error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCelebrities();
    }, []);

    const toggleLike = (id) => {
        setLiked(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const filtered = useMemo(() => {
        let data = [...celebrities];

        if (chip === CHIPS[1]) data = data.slice(0, 6);                 // Trending
        if (chip === CHIPS[2]) data.sort((a, b) => a.name.localeCompare(b.name)); // A–Z
        if (chip === CHIPS[3]) data = data.slice().reverse();            // New

        if (query.trim()) {
            const q = query.toLowerCase();
            data = data.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.title.toLowerCase().includes(q) ||
                (c.city && c.city.toLowerCase().includes(q)) ||
                (c.country && c.country.toLowerCase().includes(q))
            );
        }
        return data;
    }, [chip, query, CHIPS, celebrities]);

    const renderChip = (label) => {
        const active = chip === label;
        return (
            <TouchableOpacity
                key={label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setChip(label)}
                activeOpacity={0.9}
            >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (itemId) => {
        console.log(`Image failed to load for item ${itemId}`);
        setImageErrors(prev => ({
            ...prev,
            [itemId]: true
        }));
    };

    const getFallbackImage = (itemId) => {
        const fallbackIndex = parseInt(itemId) % FALLBACK_IMAGES.length;
        return FALLBACK_IMAGES[fallbackIndex];
    };

    const renderItem = ({ item, index }) => {
        const tall = index % 3 === 0;
        const height = tall ? Math.round(CARD_W * 1.45) : Math.round(CARD_W * 1.45);
        const isLiked = liked.has(item.id);
        const hasImageError = imageErrors[item.id];
        const imageSource = hasImageError ? { uri: getFallbackImage(item.id) } : { uri: item.image };

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, { height }]}
                onPress={() => navigation?.navigate?.('CelebrityDetail', { celebrity: item })}
            >
                <Image
                    source={imageSource}
                    style={styles.bg}
                    onError={() => handleImageError(item.id)}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />

                <TouchableOpacity
                    onPress={() => toggleLike(item.id)}
                    activeOpacity={0.8}
                    style={styles.heartBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={isLiked ? t('explore:unfavourite', 'Remove from favorites') : t('explore:favourite', 'Add to favorites')}
                >
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isLiked ? COLORS.red : COLORS.ink}
                    />
                </TouchableOpacity>

                <View style={styles.meta}>
                    <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
                    <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                    {(item.city || item.country) && (
                        <Text numberOfLines={1} style={styles.location}>
                            {[item.city, item.country].filter(Boolean).join(', ')}
                        </Text>
                    )}
                </View>

                <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>

                {/* Debug info - remove in production */}
                {__DEV__ && (
                    <View style={styles.debugInfo}>
                        <Text style={styles.debugText} numberOfLines={1}>
                            {hasImageError ? 'Fallback' : 'Original'}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.titleSection}>
                    <View>
                        <Text style={styles.h1}>{t('explore:header', 'Celebrities')}</Text>
                        <Text style={styles.subtitle}>Discover your favorite influencers</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.p1} />
                    <Text style={styles.loadingText}>Loading celebrities...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.titleSection}>
                    <View>
                        <Text style={styles.h1}>{t('explore:header', 'Celebrities')}</Text>
                        <Text style={styles.subtitle}>Discover your favorite influencers</Text>
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={COLORS.muted} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchCelebrities}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Title Section */}
            <View style={styles.titleSection}>
                <View>
                    <Text style={styles.h1}>{t('explore:header', 'Celebrities')}</Text>
                    <Text style={styles.subtitle}>{filtered.length} {filtered.length === 1 ? 'celebrity' : 'celebrities'} available</Text>
                </View>
            </View>

            {/* Search */}
            <View style={[styles.search, dirRow]}>
                <Ionicons
                    name="search-outline"
                    size={18}
                    color={COLORS.muted}
                    style={{ marginLeft: isRTL ? 0 : 10, marginRight: isRTL ? 10 : 8 }}
                />
                <TextInput
                    style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={t('explore:search_placeholder', 'Search vendors')}
                    placeholderTextColor={COLORS.muted}
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                />
                {query ? (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <Ionicons name="close-circle" size={18} color={COLORS.muted} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Chips */}
            <View style={[styles.chipsRow, dirRow]}>
                {CHIPS.map(renderChip)}
            </View>

            {/* Grid */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
                contentContainerStyle={{ paddingVertical: 12, paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
                refreshing={loading}
                onRefresh={fetchCelebrities}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={COLORS.muted} />
                        <Text style={styles.emptyText}>{t('explore:no_matches', 'No matches found')}</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default CelebritiesExploreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg
    },

    header: {
        paddingTop: 4,
        paddingHorizontal: 16,
        paddingBottom: 6,
        alignItems: 'center'
    },
    h1: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.ink
    },

    search: {
        alignItems: 'center',
        backgroundColor: COLORS.card,
        marginHorizontal: 16,
        borderRadius: 18,
        paddingVertical: 10,
        marginTop: 6,
        paddingRight: 10,
        borderWidth: 1,
        borderColor: COLORS.line,
    },
    input: {
        flex: 1,
        color: COLORS.ink,
        fontSize: 14
    },

    chipsRow: {
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.line,
        backgroundColor: COLORS.card,
    },
    chipActive: {
        backgroundColor: COLORS.p1,
        borderColor: COLORS.p1
    },
    chipText: {
        fontSize: 13,
        color: COLORS.ink,
        fontWeight: '600'
    },
    chipTextActive: {
        color: COLORS.white
    },

    card: {
        width: CARD_W,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: COLORS.line,
        position: 'relative'
    },
    bg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)'
    },

    heartBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 999,
        padding: 6
    },

    meta: {
        position: 'absolute',
        left: 10,
        right: 10,
        bottom: 10
    },
    name: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14
    },
    title: {
        color: '#f0f0f0',
        fontSize: 12,
        marginTop: 2
    },
    location: {
        color: '#f0f0f0',
        fontSize: 10,
        marginTop: 2,
        opacity: 0.8
    },

    tag: {
        position: 'absolute',
        left: 10,
        top: 10,
        backgroundColor: COLORS.white,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999
    },
    tagText: {
        color: COLORS.ink,
        fontWeight: '800',
        fontSize: 11
    },

    // Debug info
    debugInfo: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    debugText: {
        color: COLORS.white,
        fontSize: 8,
        fontWeight: '600',
    },

    // Loading and Error states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.muted,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        marginTop: 16,
        marginBottom: 24,
        color: COLORS.muted,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    retryButton: {
        backgroundColor: COLORS.p1,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 12,
        color: COLORS.muted,
        fontSize: 16,
        textAlign: 'center',
    },
});