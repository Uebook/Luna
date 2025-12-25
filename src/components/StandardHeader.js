// StandardHeader.js - Reusable header component for all internal screens
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import i18n from '../i18n';

// Safe area helper
const getSafeTop = () => {
    const { width: W, height: H } = Dimensions.get('window');
    const isIOS = Platform.OS === 'ios';
    const hasNotch = isIOS && Math.max(W, H) >= 812;
    if (!isIOS) return StatusBar.currentHeight || 0;
    return hasNotch ? 44 : 20;
};

const StandardHeader = ({ 
    title, 
    navigation, 
    onBackPress, 
    rightComponent,
    showGradient = true,
    transparent = false,
}) => {
    const { theme, isDark } = useTheme();
    const isRTL = i18n?.dir?.() === 'rtl';
    
    const gradientColors = showGradient 
        ? [theme.p2, theme.p1, theme.p1]
        : [theme.header, theme.header];
    
    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (navigation) {
            navigation.goBack();
        }
    };

    const headerContent = (
        <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
                onPress={handleBackPress}
                style={[
                    styles.backBtn,
                    transparent && { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                    !transparent && !showGradient && { backgroundColor: isDark ? theme.line : '#F3F4F6' },
                ]}
                activeOpacity={0.8}
            >
                <Icon 
                    name="chevron-back" 
                    size={24} 
                    color={showGradient || transparent ? theme.white : theme.text} 
                />
            </TouchableOpacity>
            <Text 
                style={[
                    styles.headerTitle,
                    { color: showGradient || transparent ? theme.white : theme.text }
                ]}
            >
                {title}
            </Text>
            <View style={{ width: 40 }}>
                {rightComponent}
            </View>
        </View>
    );

    if (showGradient) {
        return (
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <StatusBar
                    translucent={Platform.OS === 'android'}
                    backgroundColor="transparent"
                    barStyle="light-content"
                />
                <View style={{ paddingTop: getSafeTop() }}>
                    {headerContent}
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.headerContainer, { backgroundColor: theme.header }]}>
            <StatusBar
                translucent={Platform.OS === 'android'}
                backgroundColor={transparent ? 'transparent' : theme.header}
                barStyle={isDark ? 'light-content' : 'dark-content'}
            />
            <View style={{ paddingTop: getSafeTop() }}>
                {headerContent}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerGradient: {
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        paddingBottom: 12,
    },
    headerContainer: {
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 4,
        minHeight: 50,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        flex: 1,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
});

export default StandardHeader;

