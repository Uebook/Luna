import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    StyleSheet,
    View
} from 'react-native';

const TermsAndConditionsScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 6,
        color: '#333'
    },
    text: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20
    }
});

export default TermsAndConditionsScreen;