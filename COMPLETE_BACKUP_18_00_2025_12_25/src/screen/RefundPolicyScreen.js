// src/screens/RefundPolicyScreen.js
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

const RefundPolicyScreen = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>Refund Policy</Text>
                <View style={{ width: 40, height: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Refund & Returns Policy</Text>

                <Text style={styles.sectionTitle}>1. Eligibility</Text>
                <Text style={styles.text}>
                    • Items must be unused, in original packaging, and with all tags attached.{'\n'}
                    • A valid proof of purchase is required (order number or receipt).
                </Text>

                <Text style={styles.sectionTitle}>2. Return Window</Text>
                <Text style={styles.text}>
                    You can request a return or refund within 14 days from the delivery date unless otherwise stated on the product page.
                </Text>

                <Text style={styles.sectionTitle}>3. Non-returnable Items</Text>
                <Text style={styles.text}>
                    • Gift cards and downloadable items{'\n'}
                    • Personal care items (for hygiene reasons){'\n'}
                    • Final sale/clearance items (marked as non-returnable)
                </Text>

                <Text style={styles.sectionTitle}>4. How to Start a Return</Text>
                <Text style={styles.text}>
                    • Go to Orders → select the item → tap “Return/Refund”.{'\n'}
                    • Choose the reason and upload photos if requested.{'\n'}
                    • We’ll send you a return label or pickup instructions (where available).
                </Text>

                <Text style={styles.sectionTitle}>5. Inspection & Approval</Text>
                <Text style={styles.text}>
                    Once we receive the item, we’ll inspect it. If approved, your refund will be processed to the original payment method.
                </Text>

                <Text style={styles.sectionTitle}>6. Refund Timeline</Text>
                <Text style={styles.text}>
                    • Processing: 2–5 business days after item is received.{'\n'}
                    • Bank posting times may vary (typically 3–10 business days).
                </Text>

                <Text style={styles.sectionTitle}>7. Shipping Fees</Text>
                <Text style={styles.text}>
                    Original shipping fees are non-refundable unless the return is due to our error or a defective item. Return shipping may be deducted from the refund where applicable.
                </Text>

                <Text style={styles.sectionTitle}>8. Exchanges</Text>
                <Text style={styles.text}>
                    For fast service, place a new order and return the original item for a refund.
                </Text>

                <Text style={styles.sectionTitle}>9. Damaged or Defective</Text>
                <Text style={styles.text}>
                    If you received a damaged or defective product, contact support within 48 hours with photos and your order number for priority resolution.
                </Text>

                <Text style={styles.sectionTitle}>10. Contact</Text>
                <Text style={styles.text}>
                    Need help? Reach out via in-app Support or email: support@example.com
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RefundPolicyScreen;

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
