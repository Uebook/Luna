/**
 * SkeletonLoader Component Library
 * 
 * Comprehensive skeleton loading animations for all screen types in the app.
 * 
 * Usage:
 * 1. Import the skeleton component you need:
 *    import { SkeletonProductListScreen, SkeletonDetailScreen } from '../components/SkeletonLoader';
 * 
 * 2. Use in your screen:
 *    if (loading) {
 *      return <SkeletonProductListScreen />;
 *    }
 * 
 * 3. Or use the hook for automatic loading management:
 *    import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
 *    const [loading, setLoading] = useSkeletonLoader(true, 600);
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const isSmall = width < 360;

// Shimmer animation hook
const useShimmer = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    return shimmerAnim;
};

// Base Skeleton Box Component
export const SkeletonBox = ({ width, height, borderRadius = 8, style }) => {
    const { theme } = useTheme();
    const shimmerAnim = useShimmer();

    const THEME = theme || {
        bg: '#FCFBFF',
        card: '#FFFFFF',
        line: '#E8E6F6',
    };

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View
            style={[
                {
                    width: width || '100%',
                    height: height || 20,
                    borderRadius,
                    backgroundColor: THEME.line || '#E8E6F6',
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: THEME.card || '#FFFFFF',
                        opacity: shimmerOpacity,
                    },
                ]}
            />
        </View>
    );
};

// Skeleton Text Component
export const SkeletonText = ({ width = '100%', height = 16, lines = 1, style }) => {
    if (lines === 1) {
        return <SkeletonBox width={width} height={height} borderRadius={4} style={style} />;
    }

    return (
        <View style={[{ gap: 8 }, style]}>
            {Array.from({ length: lines }).map((_, index) => (
                <SkeletonBox
                    key={index}
                    width={index === lines - 1 ? '80%' : '100%'}
                    height={height}
                    borderRadius={4}
                />
            ))}
        </View>
    );
};

// Skeleton Card Component
export const SkeletonCard = ({ style }) => {
    const { theme } = useTheme();
    const THEME = theme || {
        card: '#FFFFFF',
        line: '#E8E6F6',
    };

    return (
        <View
            style={[
                {
                    backgroundColor: THEME.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: THEME.line,
                    marginBottom: 16,
                },
                style,
            ]}
        >
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <SkeletonBox width={50} height={50} borderRadius={25} />
                <View style={{ flex: 1, gap: 8 }}>
                    <SkeletonText width="70%" height={16} />
                    <SkeletonText width="100%" height={14} lines={2} />
                    <SkeletonText width="40%" height={12} />
                </View>
            </View>
        </View>
    );
};

// Skeleton List Item Component
export const SkeletonListItem = ({ style }) => {
    return (
        <View style={[{ flexDirection: 'row', gap: 12, marginBottom: 16 }, style]}>
            <SkeletonBox width={60} height={60} borderRadius={12} />
            <View style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
                <SkeletonText width="60%" height={16} />
                <SkeletonText width="90%" height={14} />
                <SkeletonText width="40%" height={12} />
            </View>
        </View>
    );
};

// Skeleton Product Card Component
export const SkeletonProductCard = ({ style, columns = 2 }) => {
    const cardWidth = columns === 2 ? (width - 48) / 2 : (width - 64) / 3;

    return (
        <View
            style={[
                {
                    width: cardWidth,
                    marginBottom: 16,
                },
                style,
            ]}
        >
            <SkeletonBox width="100%" height={cardWidth * 1.2} borderRadius={12} />
            <View style={{ marginTop: 12, gap: 8 }}>
                <SkeletonText width="80%" height={14} />
                <SkeletonText width="60%" height={16} />
                <SkeletonText width="50%" height={12} />
            </View>
        </View>
    );
};

// Skeleton Header Component
export const SkeletonHeader = ({ style, withGradient = false }) => {
    const { theme } = useTheme();
    const THEME = theme || {
        p1: '#5C42C7',
        p2: '#4B36A6',
        bg: '#FCFBFF',
        card: '#FFFFFF',
        line: '#E8E6F6',
    };

    const headerContent = (
        <View style={[{ padding: 16, gap: 12 }, style]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <SkeletonBox width={40} height={40} borderRadius={20} />
                <View style={{ flex: 1, gap: 6 }}>
                    <SkeletonText width="50%" height={16} />
                    <SkeletonText width="40%" height={14} />
                </View>
                <SkeletonBox width={36} height={36} borderRadius={18} />
            </View>
        </View>
    );

    if (withGradient) {
        return (
            <LinearGradient
                colors={[THEME.p2, THEME.p1, THEME.p1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {headerContent}
            </LinearGradient>
        );
    }

    return headerContent;
};

// Skeleton Banner Component
export const SkeletonBanner = ({ style }) => {
    return (
        <View style={[{ marginBottom: 16 }, style]}>
            <SkeletonBox width="100%" height={200} borderRadius={0} />
        </View>
    );
};

// Skeleton Form Field Component
export const SkeletonFormField = ({ style }) => {
    return (
        <View style={[{ marginBottom: 16, gap: 8 }, style]}>
            <SkeletonText width="30%" height={14} />
            <SkeletonBox width="100%" height={50} borderRadius={12} />
        </View>
    );
};

// ==================== SCREEN SKELETONS ====================

// Notification/List Screen Skeleton
export const SkeletonNotificationScreen = () => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
        card: '#FFFFFF',
        line: '#E8E6F6',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
            {Array.from({ length: 5 }).map((_, index) => (
                <View
                    key={index}
                    style={{
                        flexDirection: 'row',
                        marginBottom: 20,
                        backgroundColor: THEME.card,
                        borderRadius: 12,
                        padding: 16,
                        gap: 14,
                        borderWidth: 1,
                        borderColor: THEME.line,
                    }}
                >
                    <SkeletonBox width={40} height={40} borderRadius={20} />
                    <View style={{ flex: 1, gap: 8 }}>
                        <SkeletonText width="60%" height={15} />
                        <SkeletonText width="100%" height={14} lines={2} />
                        <SkeletonText width="40%" height={12} />
                    </View>
                </View>
            ))}
        </View>
    );
};

// Product List/Grid Screen Skeleton
export const SkeletonProductListScreen = ({ columns = 2, showHeader = true, showBanner = false }) => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
        p1: '#5C42C7',
        p2: '#4B36A6',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            {showHeader && <SkeletonHeader withGradient={true} />}
            {showBanner && <SkeletonBanner />}
            <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {Array.from({ length: columns === 2 ? 6 : 9 }).map((_, index) => (
                        <SkeletonProductCard key={index} columns={columns} />
                    ))}
                </View>
            </View>
        </View>
    );
};

// Product Detail Screen Skeleton
export const SkeletonProductDetailScreen = () => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
        card: '#FFFFFF',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            <SkeletonBox width="100%" height={400} borderRadius={0} />
            <View style={{ padding: 16, gap: 16 }}>
                <SkeletonText width="80%" height={24} />
                <SkeletonText width="60%" height={20} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <SkeletonBox width={60} height={60} borderRadius={8} />
                    <SkeletonBox width={60} height={60} borderRadius={8} />
                    <SkeletonBox width={60} height={60} borderRadius={8} />
                </View>
                <SkeletonText width="100%" height={16} lines={3} />
                <SkeletonText width="50%" height={28} />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <SkeletonBox width={100} height={50} borderRadius={12} />
                    <SkeletonBox width={100} height={50} borderRadius={12} />
                </View>
            </View>
        </View>
    );
};

// Profile/Settings Screen Skeleton
export const SkeletonProfileScreen = () => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
        card: '#FFFFFF',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <SkeletonBox width={100} height={100} borderRadius={50} />
                <View style={{ marginTop: 16, alignItems: 'center', gap: 8 }}>
                    <SkeletonText width="40%" height={20} />
                    <SkeletonText width="60%" height={16} />
                </View>
            </View>
            {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonListItem key={index} />
            ))}
        </View>
    );
};

// Form Screen Skeleton
export const SkeletonFormScreen = () => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
        card: '#FFFFFF',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
            {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonFormField key={index} />
            ))}
            <SkeletonBox width="100%" height={56} borderRadius={14} style={{ marginTop: 24 }} />
        </View>
    );
};

// Checkout Screen Skeleton
export const SkeletonCheckoutScreen = () => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
        card: '#FFFFFF',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
            <SkeletonText width="40%" height={20} style={{ marginBottom: 16 }} />
            {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
            <View style={{ marginTop: 24, gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SkeletonText width="30%" height={16} />
                    <SkeletonText width="40%" height={16} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <SkeletonText width="30%" height={16} />
                    <SkeletonText width="40%" height={16} />
                </View>
            </View>
            <SkeletonBox width="100%" height={56} borderRadius={14} style={{ marginTop: 24 }} />
        </View>
    );
};

// General List Screen Skeleton
export const SkeletonListScreen = () => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
            <SkeletonHeader />
            {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonListItem key={index} />
            ))}
        </View>
    );
};

// Category/Grid Screen Skeleton
export const SkeletonCategoryScreen = () => {
    const { theme } = useTheme();
    const THEME = theme || {
        bg: '#FCFBFF',
        p1: '#5C42C7',
        p2: '#4B36A6',
    };

    return (
        <View style={{ flex: 1, backgroundColor: THEME.bg }}>
            <SkeletonHeader withGradient={true} />
            <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <View key={index} style={{ width: (width - 48) / 2, marginBottom: 16 }}>
                            <SkeletonBox width="100%" height={120} borderRadius={12} />
                            <SkeletonText width="80%" height={16} style={{ marginTop: 8 }} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

// Generic Skeleton Screen with type prop
export const SkeletonScreen = ({ type = 'list', ...props }) => {
    switch (type) {
        case 'notification':
            return <SkeletonNotificationScreen />;
        case 'product':
            return <SkeletonProductListScreen {...props} />;
        case 'product-detail':
            return <SkeletonProductDetailScreen />;
        case 'profile':
            return <SkeletonProfileScreen />;
        case 'form':
            return <SkeletonFormScreen />;
        case 'checkout':
            return <SkeletonCheckoutScreen />;
        case 'category':
            return <SkeletonCategoryScreen />;
        case 'list':
        default:
            return <SkeletonListScreen />;
    }
};

export default SkeletonScreen;
