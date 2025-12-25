import React, { useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    I18nManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const AboutScreen = ({ navigation }) => {
    const { t } = useTranslation(['about', 'common']);
    const isRTL = I18nManager.isRTL;
    const { theme } = useTheme();
    
    const C = useMemo(() => ({
        bg: theme.bg,
        card: theme.card,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
        brandSoft: theme.p4,
    }), [theme]);
    
    const styles = useMemo(() => createStyles(C), [C]);

    // Brand/app names used in the original screen
    const app = 'Luna';
    const metaBrand = 'Slada';
    const version = '1.0';

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header: back + centered title */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation?.goBack?.()}
                    style={styles.backBtn}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('about:headerTitle', { app })}</Text>
                <View style={{ width: 40, height: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/fluency/96/shopping-bag.png' }}
                        style={styles.logo}
                    />

                    <Text style={styles.title}>{t('about:title', { app })}</Text>

                    <Text style={styles.paragraph}>{t('about:p1')}</Text>

                    <Text style={styles.paragraph}>{t('about:p2')}</Text>

                    <View style={[styles.emailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Ionicons
                            name="mail"
                            size={16}
                            color={C.brand}
                            style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
                        />
                        <Text style={styles.email}>{t('about:email')}</Text>
                    </View>
                </View>

                {/* Footer meta */}
                <View style={styles.meta}>
                    <Text style={styles.metaText}>{t('common:meta', { brand: metaBrand, v: version })}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AboutScreen;

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },

    /* header */
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: C.line,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: C.text },

    /* body */
    content: { padding: 16, paddingBottom: 24 },

    card: {
        backgroundColor: C.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.line,
        padding: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
            android: { elevation: 2 },
        }),
    },
    logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 20, fontWeight: '900', color: C.text, textAlign: 'center', marginBottom: 10 },

    paragraph: { fontSize: 14, color: C.sub, lineHeight: 20, marginBottom: 12 },
    emailRow: { alignItems: 'center', marginTop: 4 },
    email: { color: C.brand, fontWeight: '800', fontSize: 14 },

    meta: { alignItems: 'center', marginTop: 14 },
    metaText: { color: C.sub, fontSize: 12, fontWeight: '700' },
});
