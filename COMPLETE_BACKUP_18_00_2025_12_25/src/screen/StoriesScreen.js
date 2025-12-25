// StoriesScreen.js
// Full-screen story viewer: supports image & video, groups flat API list by user,
// long-press to pause, tap right=next / left=prev, notch-safe.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Image, Dimensions, Pressable,
    TouchableOpacity, ActivityIndicator, Animated, StatusBar, Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { useTheme } from '../context/ThemeContext';
import { SkeletonProductDetailScreen } from '../components/SkeletonLoader';

const { width, height } = Dimensions.get('window');

/* ---------- helpers ---------- */

// absolutize relative paths like "uploads/profile/x.jpg"
const ensureAbsoluteUrl = (u) => {
    if (!u) return null;
    if (typeof u !== 'string') return null;
    if (/^(https?:|file:|content:|data:)/i.test(u)) return u;
    return `https://proteinbros.in/${u.replace(/^\/+/, '')}`;
};

// group flat API stories by user_id
const groupStories = (flat = []) => {
    const map = new Map();
    for (const s of flat) {
        const uid = s.user_id ?? s.userId ?? s.uid ?? 'unknown';
        const g = map.get(uid) || {
            id: uid,
            name: s.user_name || s.userName || 'User',
            avatar: ensureAbsoluteUrl(s.user_photo) || 'https://i.pravatar.cc/100?img=12',
            items: [],
        };
        g.items.push({
            id: s.id,
            type: s.type || 'image',                  // 'image' | 'video'
            uri: ensureAbsoluteUrl(s.file) || s.file, // file is already absolute for you, but safe
            caption: s.caption || '',
            // optional duration hint (ms); images default later
            duration: s.duration ? Number(s.duration) : undefined,
        });
        map.set(uid, g);
    }
    return Array.from(map.values());
};

export default function StoriesScreen({ route, navigation }) {
    const { theme } = useTheme();
    const THEME = {
        p1: theme.p1,
        p2: theme.p2,
        p3: theme.p3,
        white: theme.white,
        ink: theme.ink,
        gray: theme.gray,
        muted: theme.muted,
        bg: theme.bg,
    };
    const gradientHeader = [THEME.p1, THEME.p2, THEME.p3];
    const styles = useMemo(() => createStyles(THEME), [THEME]);
    const raw = route?.params?.data || [];          // flat list from API
    const groups = useMemo(() => groupStories(raw), [raw]);

    const startGroup = Math.min(Math.max(route?.params?.index ?? 0, 0), Math.max(groups.length - 1, 0));
    const [groupIndex, setGroupIndex] = useState(startGroup);
    const [itemIndex, setItemIndex] = useState(0);

    const progress = useRef(new Animated.Value(0)).current;
    const animRef = useRef(null);
    const lastValRef = useRef(0);
    const pausedRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [videoNaturalMs, setVideoNaturalMs] = useState(null); // set from onLoad

    const currentGroup = groups[groupIndex] || { items: [] };
    const items = currentGroup.items || [];
    const currentItem = items[itemIndex];

    const SAFE_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 44;

    useEffect(() => {
        const id = progress.addListener(({ value }) => (lastValRef.current = value));
        return () => progress.removeListener(id);
    }, [progress]);

    // restart when item or group changes
    useEffect(() => {
        setLoading(true);
        setVideoNaturalMs(null);
        startAnim(0);
        return stopAnim;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupIndex, itemIndex]);

    // duration rules:
    // - image: 5s default
    // - video: use metadata duration (cap 15s, floor 4s); fallback 10s
    const computedDuration = (() => {
        if (!currentItem) return 5000;
        if (currentItem.type === 'video') {
            const d = videoNaturalMs ?? currentItem.duration;
            if (d) return Math.max(4000, Math.min(15000, Math.round(d)));
            return 10000;
        }
        return currentItem.duration || 5000;
    })();

    const startAnim = (from = 0) => {
        stopAnim();
        progress.setValue(from);
        animRef.current = Animated.timing(progress, {
            toValue: 1,
            duration: (1 - from) * computedDuration,
            useNativeDriver: false,
        });
        animRef.current.start(({ finished }) => {
            if (finished) handleNext();
        });
    };

    const stopAnim = () => {
        if (animRef.current) {
            animRef.current.stop();
            animRef.current = null;
        }
    };

    const pause = () => {
        if (pausedRef.current) return;
        pausedRef.current = true;
        stopAnim();
    };

    const resume = () => {
        if (!pausedRef.current) return;
        pausedRef.current = false;
        startAnim(lastValRef.current);
    };

    const handleNext = () => {
        if (itemIndex < items.length - 1) {
            setItemIndex((i) => i + 1);
        } else if (groupIndex < groups.length - 1) {
            setGroupIndex((g) => g + 1);
            setItemIndex(0);
        } else {
            navigation?.goBack?.();
        }
    };

    const handlePrev = () => {
        if (itemIndex > 0) {
            setItemIndex((i) => i - 1);
        } else if (groupIndex > 0) {
            const prevLen = groups[groupIndex - 1].items.length;
            setGroupIndex((g) => g - 1);
            setItemIndex(Math.max(prevLen - 1, 0));
        } else {
            startAnim(0);
        }
    };

    const onImageLoad = () => {
        setLoading(false);
        if (!pausedRef.current) startAnim(lastValRef.current || 0);
    };

    const onVideoLoad = (meta) => {
        // meta.duration is in seconds; convert to ms
        const durMs = meta?.duration ? meta.duration * 1000 : null;
        setVideoNaturalMs(durMs);
        setLoading(false);
        // restart animation with the new duration baseline
        if (!pausedRef.current) {
            lastValRef.current = 0;
            startAnim(0);
        }
    };

    const progressBars = useMemo(() => {
        return items.map((_, idx) => {
            const barWidth = progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
            });
            return (
                <View key={idx} style={styles.progressTrack}>
                    {idx < itemIndex ? (
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    ) : idx === itemIndex ? (
                        <Animated.View style={[styles.progressFill, { width: barWidth }]} />
                    ) : (
                        <View style={[styles.progressFill, { width: '0%' }]} />
                    )}
                </View>
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, itemIndex, progress]);

    const renderMedia = () => {
        if (!currentItem?.uri) return null;
        if (currentItem.type === 'video') {
            return (
                <Video
                    source={{ uri: currentItem.uri }}
                    style={styles.image}
                    resizeMode="cover"
                    paused={pausedRef.current}   // follow long-press pause
                    muted={false}
                    repeat={false}
                    onLoad={onVideoLoad}
                    onEnd={handleNext}
                    posterResizeMode="cover"
                />
            );
        }
        return (
            <Image
                source={{ uri: currentItem.uri }}
                style={styles.image}
                resizeMode="cover"
                onLoadEnd={onImageLoad}
            />
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Story media */}
            <Pressable style={styles.media} onPress={handleNext} onLongPress={pause} onPressOut={resume}>
                {renderMedia()}
                {loading && (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator color="#fff" />
                    </View>
                )}
            </Pressable>

            {/* Left tap zone for previous */}
            <Pressable style={styles.leftZone} onPress={handlePrev} onLongPress={pause} onPressOut={resume} />

            {/* Top gradient paint under status bar */}
            <LinearGradient colors={['rgba(0,0,0,0.65)', 'transparent']} style={styles.topGrad} />

            {/* Top overlay content offset by SAFE_TOP (replaces SafeAreaView) */}
            <View style={[styles.safeOverlay, { paddingTop: SAFE_TOP + 8 }]}>
                {/* Progress bars */}
                <View style={styles.progressRow}>{progressBars}</View>

                {/* User row */}
                <View style={styles.userRow}>
                    <Image source={{ uri: currentGroup?.avatar }} style={styles.avatar} />
                    <Text style={styles.userName}>{currentGroup?.name || 'User'}</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.iconBtn}>
                        <Icon name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {!!currentItem?.caption && (
                    <Text style={styles.caption} numberOfLines={2}>{currentItem.caption}</Text>
                )}
            </View>

            {/* Bottom gradient for contrast (optional CTA area) */}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.bottomGrad} />
        </View>
    );
}

/* ---------- styles ---------- */
const createStyles = (THEME) => StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    media: { width, height },
    image: { width, height, backgroundColor: '#000' },
    loaderWrap: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        alignItems: 'center', justifyContent: 'center',
    },
    leftZone: { position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.33 },
    topGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
    bottomGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 },
    safeOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },

    progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 8 },
    progressTrack: {
        flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.35)',
        borderRadius: 2, overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#fff' },

    userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 10 },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#999' },
    userName: { color: '#fff', fontWeight: '800', marginLeft: 8, fontSize: 14 },
    iconBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    caption: { color: '#fff', paddingHorizontal: 12, paddingTop: 8, fontSize: 13, opacity: 0.95 },
});
