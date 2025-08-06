import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard'; // Use this package for RN 0.65+

const trackingUpdates = [
    {
        status: 'Packed',
        date: 'April,19 12:31',
        description: 'Your parcel is packed and will be handed over to our delivery partner.',
        active: true,
    },
    {
        status: 'On the Way to Logistic Facility',
        date: 'April,19 16:20',
        description:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore.',
        active: true,
    },
    {
        status: 'Arrived at Logistic Facility',
        date: 'April,19 19:07',
        description:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore.',
        active: true,
    },
    {
        status: 'Shipped',
        date: 'Expected on April,20',
        description:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore.',
        active: false,
    },
];

const OrderTrackingScreen = () => {
    const trackingNumber = 'LGS-i92927839300763731';

    const copyToClipboard = () => {
        Clipboard.setString(trackingNumber);
        Alert.alert('Copied', 'Tracking number copied to clipboard!');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
                        style={styles.profileImage}
                    />
                    <View>
                        <Text style={styles.title}>To Receive</Text>
                        <Text style={styles.subtitle}>Track Your Order</Text>
                    </View>
                </View>
                <View style={styles.iconRow}>
                    <Ionicons name="list-outline" size={22} style={styles.icon} />
                    <Ionicons name="ellipse" size={8} style={[styles.icon, { color: '#3b82f6' }]} />
                    <Ionicons name="settings-outline" size={22} style={styles.icon} />
                </View>
            </View>

            {/* Gradient Progress Bar */}
            <View style={styles.progressContainer}>
                <LinearGradient
                    colors={['#007bff', '#1e3cff', '#f30a62']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBar}
                />
                {/* Step Dots */}
                <View style={[styles.progressDot, { left: 0, backgroundColor: '#007bff' }]} />
                <View style={[styles.progressDot, { left: '50%', backgroundColor: '#1e3cff' }]} />
                <View style={[styles.progressDot, { right: 0, backgroundColor: '#f30a62' }]} />
            </View>

            {/* Tracking Number */}
            <View style={styles.trackingBox}>
                <Text style={styles.trackingLabel}>Tracking Number</Text>
                <View style={styles.trackingRow}>
                    <Text style={styles.trackingNumber}>{trackingNumber}</Text>
                    <TouchableOpacity onPress={copyToClipboard}>
                        <Ionicons name="copy-outline" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Timeline */}
            {trackingUpdates.map((item, index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                    <View style={styles.statusRow}>
                        <Text style={[styles.status, !item.active && styles.inactive]}>
                            {item.status}
                        </Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <Text style={[styles.description, !item.active && styles.inactive]}>
                        {item.description}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
};

export default OrderTrackingScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    profileSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    profileImage: { width: 50, height: 50, borderRadius: 25 },
    title: { fontWeight: 'bold', fontSize: 18 },
    subtitle: { fontSize: 12, color: '#6b7280' },
    iconRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    icon: { color: '#000' },

    // New Gradient Progress Styles
    progressContainer: {
        height: 20,
        marginVertical: 24,
        justifyContent: 'center',
        position: 'relative',
    },
    gradientBar: {
        height: 6,
        borderRadius: 8,
        width: '100%',
    },
    progressDot: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        top: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },

    trackingBox: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    trackingLabel: { fontWeight: '600', marginBottom: 4 },
    trackingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trackingNumber: { fontWeight: '500', fontSize: 14, color: '#1f2937' },

    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    status: { fontWeight: 'bold', fontSize: 16, color: '#111827' },
    date: {
        fontSize: 12,
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        color: '#374151',
    },
    description: { fontSize: 13, color: '#4b5563', marginTop: 4 },

    inactive: { color: '#cbd5e1' },
});
