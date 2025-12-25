// StreamPlayerScreen.js
import React, { useMemo, useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    useWindowDimensions,
    Platform,
    Alert,
    ToastAndroid,
    Share,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

// ⬇️ Ensure this path points to where you export DUMMY_PRODUCTS_10
// import { DUMMY_PRODUCTS_10 } from '../screen/NewHome';
import arProductsDefault from '../store/productar';

// Cards link to real product IDs from your Home dummy list
const PRODUCTS = [
    { productId: 'p11' }, // Classic Cotton T-Shirt
    { productId: 'p10' }, // Aurora Pendant Necklace
    { productId: 'p2' },  // AirFlex Runner
];

const findProduct = (id) => arProductsDefault.find((p) => p.id === id);

// Very lightweight cart in AsyncStorage
async function addToCartStorage(item) {
    try {
        const raw = await AsyncStorage.getItem('cart');
        const cart = raw ? JSON.parse(raw) : [];
        cart.push({ ...item, qty: 1, addedAt: Date.now() });
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
        if (Platform.OS === 'android') {
            ToastAndroid.show('Added to cart successfully', ToastAndroid.SHORT);
        } else {
            Alert.alert('Success', 'Added to cart successfully');
        }
    } catch (e) {
        Alert.alert('Oops', 'Could not add to cart right now.');
    }
}

export default function StreamPlayerScreen({ navigation, route }) {
    const { theme, isDark } = useTheme();
    const COLORS = {
        page: isDark ? theme.page : '#000',
        header: isDark ? theme.header : 'rgba(0,0,0,0.35)',
        text: isDark ? theme.text : '#fff',
        sub: isDark ? theme.sub : 'rgba(255,255,255,0.8)',
        dim: isDark ? theme.muted : 'rgba(255,255,255,0.6)',
        border: isDark ? theme.border : 'rgba(255,255,255,0.18)',
        accent: '#ff3b78',
        cardBg: isDark ? theme.card : '#ffffff',
        cardText: isDark ? theme.text : '#0d0e10',
        cardSub: isDark ? theme.sub : '#5c6168',
    };
    const stream = route?.params?.stream || {};
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // ——— Responsive scale (based on iPhone 12 width ~390)
    const base = 390;
    const scale = Math.max(0.85, Math.min(width / base, 1.15));
    const rs = (n) => Math.round(n * scale);

    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const [muted, setMuted] = useState(false);
    const [trayOpen, setTrayOpen] = useState(false);

    // Like / Share
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(Number(stream?.likes ?? 47));

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setLoading]);

    const styles = useMemo(() => createStyles(COLORS), [COLORS]);
    const toggleTray = () => setTrayOpen((v) => !v);
    const toggleMute = () => setMuted((m) => !m);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <StandardHeader
                    title={stream?.title || 'Stream'}
                    navigation={navigation}
                    showGradient={true}
                />
                <SkeletonProductDetailScreen />
            </SafeAreaView>
        );
    }

    const onLike = () => {
        setLiked((prev) => {
            const next = !prev;
            setLikes((c) => (next ? c + 1 : Math.max(0, c - 1)));
            return next;
        });
    };

    const onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    stream?.shareText ||
                    `Check out this stream${stream?.title ? `: ${stream.title}` : ''}!`,
                url: stream?.video,
                title: stream?.title || 'GlamStream',
            });
            // You can check result.action if you need analytics
        } catch {
            Alert.alert('Share failed', 'Unable to share right now.');
        }
    };

    // Tray sizes
    const trayOpenHeight = useMemo(
        () => Math.min(Math.max(height * 0.28, rs(170)), rs(300)),
        [height, scale]
    );
    const trayClosedHeight = rs(112);
    const cardWidth = Math.min(width - rs(48), rs(360));

    const goToDetails = (productId) => {
        const product = findProduct(productId);
        if (!product) {
            Alert.alert('Not found', 'Product details unavailable.');
            return;
        }
        navigation.navigate('ProductDetailScreen', { product });
    };

    const addToCart = async (productId) => {
        const product = findProduct(productId);
        if (!product) {
            Alert.alert('Not found', 'Product unavailable.');
            return;
        }
        await addToCartStorage(product);
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Video */}
            <Video
                source={{
                    uri:
                        stream.video ||
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                }}
                style={{ position: 'absolute', top: 0, left: 0, width, height }}
                resizeMode="cover"
                repeat
                muted={muted}
            />

            {/* Header: Back + name only */}
            <View style={[styles.topBar, { height: rs(64), paddingHorizontal: rs(12) }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ width: rs(32), height: rs(32), alignItems: 'center', justifyContent: 'center' }}
                >
                    <Icon name="arrow-left" size={rs(20)} color={COLORS.text} />
                </TouchableOpacity>
                <Text numberOfLines={1} style={[styles.title, { fontSize: rs(16), marginLeft: rs(8) }]}>
                    {stream?.title || 'Filmfare'}
                </Text>
                <View style={{ width: rs(32) }} />
            </View>

            {/* Right action rail (no bookmark) */}
            <View
                style={[
                    styles.rightRail,
                    {
                        top: height * 0.24,
                        right: rs(12),
                        gap: rs(16),
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.railBtn,
                        {
                            width: rs(56),
                            height: rs(56),
                            borderRadius: rs(28),
                        },
                    ]}
                    activeOpacity={0.9}
                    onPress={onLike}
                >
                    <Icon name="heart" size={rs(22)} color={liked ? COLORS.accent : '#fff'} />
                    <Text style={[styles.railCount, { fontSize: rs(12), marginTop: rs(4) }]}>{likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.railBtn,
                        {
                            width: rs(56),
                            height: rs(56),
                            borderRadius: rs(28),
                        },
                    ]}
                    activeOpacity={0.9}
                    onPress={onShare}
                >
                    <Icon name="share-2" size={rs(22)} color="#fff" />
                    <Text style={[styles.railCount, { fontSize: rs(12), marginTop: rs(4) }]}>Share</Text>
                </TouchableOpacity>
            </View>

            {/* Mute + hint */}
            <View style={[styles.volumeHint, { bottom: rs(220) }]}>
                <TouchableOpacity
                    style={[
                        styles.volPill,
                        {
                            width: rs(44),
                            height: rs(44),
                            borderRadius: rs(22),
                        },
                    ]}
                    onPress={toggleMute}
                    activeOpacity={0.9}
                >
                    <Icon name={muted ? 'volume-x' : 'volume-2'} size={rs(16)} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.swipeHint, { fontSize: rs(14), marginTop: rs(8) }]}>
                    Swipe to see more
                </Text>
            </View>

            {/* Product tray */}
            <View
                style={[
                    styles.productsBar,
                    {
                        height: trayOpen ? trayOpenHeight : trayClosedHeight,
                        paddingBottom: (insets.bottom || rs(12)) + rs(8),
                        borderTopLeftRadius: rs(16),
                        borderTopRightRadius: rs(16),
                        paddingTop: rs(8),
                    },
                ]}
            >
                <View style={[styles.grabberRow, { marginBottom: rs(2) }]}>
                    <View
                        style={{
                            width: rs(46),
                            height: rs(4),
                            borderRadius: rs(2),
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            marginBottom: rs(6),
                        }}
                    />
                    <TouchableOpacity onPress={toggleTray} activeOpacity={0.8}>
                        <Text style={[styles.trayToggle, { fontSize: rs(12) }]}>
                            {trayOpen ? 'Hide products' : 'Show products'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    snapToInterval={cardWidth + rs(12)}
                    contentContainerStyle={{
                        paddingHorizontal: rs(16),
                        paddingTop: rs(6),
                        paddingBottom: insets.bottom || rs(12),
                    }}
                >
                    {PRODUCTS.map(({ productId }) => {
                        const p = findProduct(productId);
                        if (!p) return null;
                        return (
                            <View
                                key={productId}
                                style={[
                                    styles.card,
                                    {
                                        width: cardWidth,
                                        marginRight: rs(12),
                                        borderRadius: rs(16),
                                        shadowRadius: rs(8),
                                        shadowOffset: { width: 0, height: rs(4) },
                                    },
                                ]}
                            >
                                <Image
                                    source={{ uri: p.thumbnail }}
                                    style={{ width: rs(110), height: rs(110) }}
                                />
                                <View style={{ flex: 1, padding: rs(12), justifyContent: 'center' }}>
                                    <Text numberOfLines={2} style={[styles.cardTitle, { fontSize: rs(14) }]}>
                                        {p.name}
                                    </Text>

                                    <View style={[styles.priceRow, { marginTop: rs(6) }]}>
                                        <Text style={[styles.price, { fontSize: rs(16) }]}>
                                            {`${Number(p.price).toFixed(3)} ${p.currency}`}
                                        </Text>
                                        <View style={[styles.dot, { width: rs(4), height: rs(4), borderRadius: rs(2), marginHorizontal: rs(8) }]} />
                                        <Text style={[styles.deliv, { fontSize: rs(12) }]}>Fast delivery</Text>
                                    </View>

                                    <View style={[styles.ctaRow, { marginTop: rs(10) }]}>
                                        <TouchableOpacity
                                            style={[
                                                styles.primaryBtn,
                                                { paddingHorizontal: rs(14), paddingVertical: rs(10), borderRadius: rs(10) },
                                            ]}
                                            activeOpacity={0.9}
                                            onPress={() => addToCart(productId)}
                                        >
                                            <Text style={[styles.primaryBtnText, { fontSize: rs(12) }]}>ADD TO BAG</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.ghostBtn,
                                                {
                                                    marginLeft: rs(10),
                                                    paddingHorizontal: rs(12),
                                                    paddingVertical: rs(10),
                                                    borderRadius: rs(10),
                                                    borderWidth: 1,
                                                },
                                            ]}
                                            activeOpacity={0.9}
                                            onPress={() => goToDetails(productId)}
                                        >
                                            <Icon name="info" size={rs(16)} color={COLORS.accent} />
                                            <Text style={[styles.ghostBtnText, { fontSize: rs(12), marginLeft: rs(6) }]}>
                                                Details
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ width: rs(8) }} />
                </ScrollView>
            </View>

            {/* Floating Shop FAB */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggleTray}
                style={[
                    styles.fab,
                    {
                        right: rs(16),
                        height: rs(48),
                        borderRadius: rs(24),
                        paddingHorizontal: rs(16),
                        bottom: (insets.bottom || rs(16)) + rs(24) + (trayOpen ? trayOpenHeight : 0),
                    },
                ]}
            >
                <Icon name="shopping-bag" size={rs(20)} color="#fff" />
                <Text style={[styles.fabText, { fontSize: rs(14), marginLeft: rs(8) }]}>Shop</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.page },

    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.header,
    },
    title: { flex: 1, color: COLORS.text, fontWeight: '800' },

    rightRail: { position: 'absolute', zIndex: 10, alignItems: 'center' },
    railBtn: {
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    railCount: { color: COLORS.text, fontWeight: '800', textAlign: 'center' },

    volumeHint: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
    volPill: {
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    swipeHint: { color: COLORS.text, fontWeight: '800' },

    productsBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0a0a0b',
    },
    grabberRow: { alignItems: 'center' },
    trayToggle: { color: COLORS.sub, fontWeight: '700' },

    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBg,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        elevation: 6,
    },
    cardTitle: { color: COLORS.cardText, fontWeight: '800' },

    priceRow: { flexDirection: 'row', alignItems: 'center' },
    price: { color: COLORS.cardText, fontWeight: '900' },
    dot: { backgroundColor: '#dadde2' },
    deliv: { color: COLORS.cardSub, fontWeight: '700' },

    ctaRow: { flexDirection: 'row', alignItems: 'center' },
    primaryBtn: { backgroundColor: COLORS.accent },
    primaryBtnText: { color: '#fff', fontWeight: '900' },
    ghostBtn: { flexDirection: 'row', alignItems: 'center', borderColor: COLORS.accent },
    ghostBtnText: { color: COLORS.accent, fontWeight: '900' },

    fab: {
        position: 'absolute',
        backgroundColor: COLORS.accent,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        zIndex: 25,
    },
    fabText: { color: '#fff', fontWeight: '900' },
});
