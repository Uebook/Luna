// GlamStreamScreen.js
import React, { useMemo, useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    useWindowDimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import api from '../services/api';

const TABS = ['All', 'Celeb', 'Women', 'Men', 'Minis', 'FWD'];

/** dummy banners */
const BANNERS = [
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1600&auto=format&fit=crop',
];

export default function StreamScreen({ navigation }) {
    const { theme } = useTheme();
    const COLORS = {
        page: theme.bg,
        header: theme.header,
        text: theme.text,
        sub: theme.sub,
        chipBg: theme.line,
        chipBorder: theme.line,
        cardBg: theme.card,
        cardBorder: theme.line,
        tint: '#ff3b78',
    };
    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const [streams, setStreams] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);
    const { width } = useWindowDimensions();             // ← responsive
    const gap = 12;
    const cardWidth = (width - 16 * 2 - gap) / 2;        // ← recompute on rotation
    const cardImgH = Math.round(cardWidth * 1.1);        // keep aspect ratio tidy

    useEffect(() => {
        fetchLiveStreams();
    }, []);

    const fetchLiveStreams = async () => {
        try {
            setApiLoading(true);
            const response = await api.post('/stream/list', {
                category: 'all',
                limit: 20,
            });

            if (response.data.success && response.data.streams) {
                setStreams(response.data.streams);
            }
        } catch (error) {
            console.error('Error fetching live streams:', error);
            // Fallback to dummy data if API fails
            setStreams([
                { id: '1', title: 'VibeMatch', likes_count: 46, viewer_count: 120, cover: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop', status: 'live' },
                { id: '2', title: 'Filmfare', likes_count: 326, viewer_count: 450, cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1600&auto=format&fit=crop', status: 'live' },
            ]);
        } finally {
            setApiLoading(false);
            setLoading(false);
        }
    };

    const styles = useMemo(() => createStyles(COLORS), [COLORS]);
    const [active, setActive] = useState('All');
    const [bannerIndex, setBannerIndex] = useState(0);

    const filtered = useMemo(() => {
        if (streams.length > 0) {
            return streams;
        }
        // Fallback dummy data
        return [
            { id: '1', title: 'VibeMatch', likes_count: 46, viewer_count: 120, cover: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop', status: 'live' },
            { id: '2', title: 'Filmfare', likes_count: 326, viewer_count: 450, cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1600&auto=format&fit=crop', status: 'live' },
        ];
    }, [streams, active]);

    const openPlayer = (item) => {
        // Check if it's a live stream
        if (item.status === 'live' && item.channel_name) {
            navigation.navigate('AgoraLiveViewerScreen', { stream: item });
        } else {
            navigation.navigate('StreamPlayerScreen', { stream: item });
        }
    };

    const renderCard = ({ item }) => {
        const isLive = item.status === 'live';
        const coverImage = item.cover || item.user?.avatar || 'https://via.placeholder.com/300';
        const broadcasterName = item.user?.name || item.title;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openPlayer(item)}
                style={[styles.card, { width: cardWidth }]}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: coverImage }} style={{ width: '100%', height: cardImgH }} />
                    {isLive && (
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    )}
                    {isLive && item.viewer_count > 0 && (
                        <View style={styles.viewerBadge}>
                            <Icon name="eye" size={12} color="#fff" />
                            <Text style={styles.viewerText}>{item.viewer_count}</Text>
                        </View>
                    )}
                </View>
                <Text numberOfLines={2} style={styles.cardTitle}>{item.title || broadcasterName}</Text>
                <View style={styles.cardMeta}>
                    <View style={styles.brandRow}>
                        <View style={styles.brandDot} />
                        <Text style={styles.brandName}>{broadcasterName}</Text>
                    </View>
                    <View style={styles.likeRow}>
                        <Icon name="heart" color={COLORS.tint} size={14} />
                        <Text style={styles.likeText}>{item.likes_count || item.likes || 0}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const Header = (
        <>
            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
                {TABS.map((t) => {
                    const activeTab = t === active;
                    return (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setActive(t)}
                            style={[styles.chip, activeTab && styles.chipActive]}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.chipText, activeTab && styles.chipTextActive]}>{t}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Dummy banner carousel (top banner above grid) */}
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.x / width);
                    if (i !== bannerIndex) setBannerIndex(i);
                }}
                scrollEventThrottle={16}
                style={{ marginBottom: 12 }}
            >
                {BANNERS.map((uri) => (
                    <View key={uri} style={{ width, paddingHorizontal: 16 }}>
                        <View style={styles.hero}>
                            <Image source={{ uri }} style={styles.heroImg} />
                            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>PLAY TO SLAY!</Text></View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* dots */}
            <View style={styles.dotsRow}>
                {BANNERS.map((_, i) => (
                    <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
                ))}
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header Bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Icon name="arrow-left" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>GlamStream</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Grid with ListHeaderComponent (Tabs + Banner) */}
            {apiLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.tint} />
                    <Text style={styles.loadingText}>Loading live streams...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(it) => it.id?.toString() || Math.random().toString()}
                    renderItem={renderCard}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
                    ListHeaderComponent={Header}
                    showsVerticalScrollIndicator={false}
                    refreshing={apiLoading}
                    onRefresh={fetchLiveStreams}
                />
            )}
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.page },

    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.header,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    back: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, color: COLORS.text, fontWeight: '800' },

    /* Tabs */
    tabsRow: { paddingHorizontal: 16, paddingBottom: 8 },
    chip: {
        height: 36,
        paddingHorizontal: 14,
        marginRight: 10,
        backgroundColor: COLORS.chipBg,
        borderWidth: 1,
        borderColor: COLORS.chipBorder,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipActive: { backgroundColor: '#ffe7ef', borderColor: '#ffd0df' },
    chipText: { color: COLORS.sub, fontWeight: '700' },
    chipTextActive: { color: COLORS.tint },

    /* Banner */
    hero: { borderRadius: 18, overflow: 'hidden' },
    heroImg: { width: '100%', height: 170, borderRadius: 18 },
    heroBadge: {
        position: 'absolute', bottom: 12, left: 12,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    },
    heroBadgeText: { color: '#fff', fontWeight: '900', letterSpacing: 0.2 },
    dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e1e3e6', marginHorizontal: 4 },
    dotActive: { backgroundColor: COLORS.tint },

    /* Cards */
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardTitle: { color: COLORS.text, fontWeight: '800', marginTop: 8, marginHorizontal: 10 },
    cardMeta: {
        marginTop: 10,
        paddingHorizontal: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandRow: { flexDirection: 'row', alignItems: 'center' },
    brandDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#111', marginRight: 6 },
    brandName: { color: COLORS.text, fontWeight: '700' },
    likeRow: { flexDirection: 'row', alignItems: 'center' },
    likeText: { color: COLORS.sub, marginLeft: 4, fontWeight: '700' },

    imageContainer: {
        position: 'relative',
    },
    liveBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    liveText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    viewerBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    viewerText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.sub,
        fontSize: 14,
    },
});
