// src/screens/PrivacyPolicyScreen.js
import React, { useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const PrivacyPolicyScreen = ({ navigation }) => {
    const { theme } = useTheme();
    
    const C = useMemo(() => ({
        bg: theme.bg,
        card: theme.card,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
    }), [theme]);
    
    const styles = useMemo(() => createStyles(C), [C]);
    
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation?.goBack?.()}
                    style={styles.backBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40, height: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Privacy Policy</Text>

                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                <Text style={styles.text}>
                    • Account data (name, email, phone){'\n'}
                    • Order and payment data{'\n'}
                    • Device and usage data (app version, logs, crashes){'\n'}
                    • Location (when you grant permission)
                </Text>

                <Text style={styles.sectionTitle}>2. How We Use Information</Text>
                <Text style={styles.text}>
                    • To provide and improve our services{'\n'}
                    • To process orders and payments{'\n'}
                    • To personalize recommendations and offers{'\n'}
                    • To send service and marketing communications (where permitted)
                </Text>

                <Text style={styles.sectionTitle}>3. Legal Bases</Text>
                <Text style={styles.text}>
                    We process data based on your consent, to perform a contract, to comply with legal obligations, and for our legitimate interests (e.g., fraud prevention, product improvement).
                </Text>

                <Text style={styles.sectionTitle}>4. Sharing & Transfers</Text>
                <Text style={styles.text}>
                    We may share data with payment processors, logistics partners, analytics providers, and support tools under strict confidentiality and security obligations.
                </Text>

                <Text style={styles.sectionTitle}>5. Data Retention</Text>
                <Text style={styles.text}>
                    We retain information as long as necessary for the purposes above and to meet legal or accounting requirements.
                </Text>

                <Text style={styles.sectionTitle}>6. Your Rights</Text>
                <Text style={styles.text}>
                    Depending on your region, you may have rights to access, correct, delete, restrict, or port your data, and to object to certain processing. You may also withdraw consent at any time.
                </Text>

                <Text style={styles.sectionTitle}>7. Cookies & Tracking</Text>
                <Text style={styles.text}>
                    We use cookies or similar technologies to remember preferences and analyze usage. You can control cookies in your device settings where applicable.
                </Text>

                <Text style={styles.sectionTitle}>8. Security</Text>
                <Text style={styles.text}>
                    We apply organizational and technical safeguards to protect your data. No method of transmission is 100% secure.
                </Text>

                <Text style={styles.sectionTitle}>9. Children</Text>
                <Text style={styles.text}>
                    Our services are not directed to children under 13 (or the age defined by local law). We do not knowingly collect data from children.
                </Text>

                <Text style={styles.sectionTitle}>10. Changes</Text>
                <Text style={styles.text}>
                    We may update this policy from time to time. Changes take effect when posted in the app.
                </Text>

                <Text style={styles.sectionTitle}>11. Contact</Text>
                <Text style={styles.text}>
                    For privacy questions or requests, contact: privacy@example.com
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    /* Header */
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#0F172A' },

    /* Body */
    content: { padding: 20, paddingBottom: 28 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 6, color: '#333' },
    text: { fontSize: 14, color: '#555', lineHeight: 20 },
});
