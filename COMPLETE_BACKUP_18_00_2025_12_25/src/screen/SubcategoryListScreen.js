// src/screens/SubcategoryListScreen.js
import React, { useMemo, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, FlatList,
    Dimensions, Platform, StatusBar, NativeModules   // ⬅️ add NativeModules
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

const { width } = Dimensions.get('window');
const { StatusBarManager } = NativeModules; // ⬅️ iOS status bar height
const COLS = 3;
const GAP = 12;
const SUBCAT_W = (width - GAP * 2 - GAP * 2) / COLS;

const SubcatCard = ({ sc, onPress, styles }) => (
    <TouchableOpacity style={styles.subcatCard} activeOpacity={0.9} onPress={onPress}>
        <Image source={{ uri: sc.img }} style={styles.subcatImg} resizeMode="cover" />
        <View style={styles.subcatBadge}>
            <Text style={styles.subcatName} numberOfLines={1}>{sc.t}</Text>
        </View>
        <Text style={styles.subcatTag} numberOfLines={1}>{sc.tag}</Text>
    </TouchableOpacity>
);

export default function SubcategoryListScreen({ route, navigation }) {
    const { title = 'Sub-Categories', items = [], category } = route?.params || {};
    const data = useMemo(() => (Array.isArray(items) ? items : []), [items]);

    const { theme } = useTheme();
    const THEME = {
        p1: theme.p1,
        p2: theme.p2,
        p3: theme.p3,
        p4: theme.p4,
        white: theme.white,
        ink: theme.ink,
        gray: theme.gray,
        line: theme.line,
        card: theme.card,
        bg: theme.bg,
    };
    const gradientHeader = [THEME.p1, THEME.p2, THEME.p3];
    const styles = useMemo(() => createStyles(THEME), [THEME]);
    // ✅ robust safe-top without extra libs
    const [safeTop, setSafeTop] = useState(
        Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0
    );
    useEffect(() => {
        if (Platform.OS === 'ios' && StatusBarManager) {
            // on iOS this returns 20 on older iPhones, 44+ on notched ones
            StatusBarManager.getHeight
                ? StatusBarManager.getHeight(({ height }) => setSafeTop(height || 0))
                : setSafeTop(StatusBarManager.HEIGHT || 0);
        }
    }, []);

    const Header = () => (
        <LinearGradient
            colors={gradientHeader}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            // pull under the status bar, then pad content down by safeTop
            style={[styles.header, { marginTop: -safeTop, paddingTop: safeTop + 10 }]}
        >
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
                    <Icon name="chevron-back" size={22} color={THEME.white} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {title}{category ? ` — ${category}` : ''}
                    </Text>
                </View>
                <View style={{ width: 36 }} />
            </View>
        </LinearGradient>
    );

    const Empty = () => (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
                <Icon name="albums-outline" size={22} color={THEME.p3} />
            </View>
            <Text style={styles.emptyTitle}>No sub-categories found</Text>
            <Text style={styles.emptyDesc}>We’ll add items here when this category gets updated.</Text>
        </View>
    );

    return (
        <View style={styles.page}>
            <Header />
            <FlatList
                data={data}
                keyExtractor={(_, i) => `sub-${i}`}
                numColumns={COLS}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: GAP }}
                ListEmptyComponent={<Empty />}
                renderItem={({ item }) => (
                    <SubcatCard sc={item} onPress={() => { navigation?.navigate?.('ExploreScreen') }} styles={styles} />
                )}
            />
        </View>
    );
}

const createStyles = (THEME) => StyleSheet.create({
    page: { flex: 1, backgroundColor: THEME.bg },

    /* Header */
    header: {
        paddingBottom: 12,
        paddingHorizontal: 12,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,

    },
    headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 30 },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)', marginRight: 8,
    },
    headerTitle: { color: THEME.white, fontWeight: '900', fontSize: 18 },

    /* Grid */
    listContent: { paddingTop: 12, paddingBottom: 24 },
    subcatCard: {
        width: SUBCAT_W,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 14,
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.line
    },
    subcatImg: { width: '100%', height: SUBCAT_W * 1.05, backgroundColor: '#eee' },
    subcatBadge: { position: 'absolute', left: 8, top: 8, backgroundColor: THEME.white, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    subcatName: { fontSize: 12, fontWeight: '800', color: THEME.ink },
    subcatTag: { textAlign: 'center', color: THEME.white, fontWeight: '900', backgroundColor: THEME.p3, paddingVertical: 8 },

    /* Empty */
    emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 20 },
    emptyIcon: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF',
        alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E9D5FF'
    },
    emptyTitle: { fontSize: 16, fontWeight: '900', color: THEME.ink },
    emptyDesc: { marginTop: 6, color: THEME.gray, textAlign: 'center' },
});
