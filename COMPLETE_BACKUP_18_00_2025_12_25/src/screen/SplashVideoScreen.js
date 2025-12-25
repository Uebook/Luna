// src/screens/SplashVideoScreen.js
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    Easing,
    StatusBar,
    Platform,
} from 'react-native';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SplashVideoScreen = ({ navigation }) => {
    const logoY = useRef(new Animated.Value(20)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const shimmerX = useRef(new Animated.Value(-width)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(logoY, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();

        const loop = Animated.loop(
            Animated.timing(shimmerX, {
                toValue: width,
                duration: 1800,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.quad),
            })
        );
        loop.start();

        // Safety timer in case video never calls onEnd/onError
        const t = setTimeout(() => {
            tryNavigate();
        }, 4500);

        return () => {
            loop.stop();
            clearTimeout(t);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tryNavigate = async () => {
        try {
            const raw = await AsyncStorage.getItem('luna_user');
            const user = raw ? JSON.parse(raw) : null;
            if (user && Object.keys(user || {}).length > 0) {
                navigation.replace('MainApp');
            } else {
                navigation.replace('LoginScreen');
            }
        } catch (e) {
            // If storage read fails, fallback to login
            navigation.replace('LoginScreen');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background video */}
            <Video
                source={require('../assets/splash.mp4')}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                muted
                repeat={false}
                controls={false}
                paused={false}
                onError={() => tryNavigate()}
                onEnd={() => tryNavigate()}
                ignoreSilentSwitch="obey"
                disableFocus
                playInBackground={false}
                playWhenInactive={false}
            />

            {/* Dim overlay for contrast */}
            <View style={styles.dimOverlay} />

            {/* Animated overlay content */}
            <View style={styles.overlayContent} pointerEvents="none">
                <Animated.View
                    style={[
                        styles.logoWrap,
                        { transform: [{ translateY: logoY }], opacity: logoOpacity },
                    ]}
                >
                    <Text style={styles.brand}>Luna</Text>
                </Animated.View>

                <View style={styles.taglineWrap}>
                    <Text style={styles.tagline}>Find your next favorite</Text>
                    <Animated.View
                        style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
                    />
                </View>
            </View>
        </View>
    );
};

export default SplashVideoScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },

    dimOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },

    overlayContent: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.select({ ios: 44, android: 24 }),
    },

    logoWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    brand: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 1,
        color: '#fff',
    },

    taglineWrap: {
        marginTop: 8,
        overflow: 'hidden',
    },

    tagline: {
        fontSize: 14,
        color: '#f0f0f0',
        opacity: 0.9,
        textAlign: 'center',
    },

    shimmer: {
        height: 2,
        width: width,
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.35)',
        borderRadius: 1,
    },
});
