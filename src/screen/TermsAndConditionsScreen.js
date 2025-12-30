// src/screens/TermsAndConditionsScreen.js
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

const TermsAndConditionsScreen = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                {/* spacer keeps title centered */}
                <View style={{ width: 40, height: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Terms and Conditions</Text>

                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.text}>
                    Welcome to our app. By accessing or using our services, you agree to be bound by these terms and conditions.
                </Text>

                <Text style={styles.sectionTitle}>2. Use of Service</Text>
                <Text style={styles.text}>
                    You agree to use the service only for lawful purposes and in accordance with these terms. You must not use the service in any way that may damage the app or impair anyone else's use.
                </Text>

                <Text style={styles.sectionTitle}>3. Account Security</Text>
                <Text style={styles.text}>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                </Text>

                <Text style={styles.sectionTitle}>4. Modifications</Text>
                <Text style={styles.text}>
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the app.
                </Text>

                <Text style={styles.sectionTitle}>5. Contact Us</Text>
                <Text style={styles.text}>
                    If you have any questions about these Terms, please contact our support team.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsAndConditionsScreen;
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

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 6,
        color: '#333',
    },
    text: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
});

