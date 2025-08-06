import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Svg, { Circle } from 'react-native-svg';

const ActivityScreen = () => {
    const total = 365;
    const segments = [
        { value: 183, color: '#004BFE' },
        { value: 92, color: '#95C93D' },
        { value: 47, color: '#FF7B00' },
        { value: 43, color: '#F45CA5' },
    ];

    const circumference = 2 * Math.PI * 60;
    let offset = 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
                            style={styles.avatar}
                        />
                        <Text style={styles.headerTitle}>My Activity</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity><Icon name="circle" size={18} style={styles.icon} /></TouchableOpacity>
                        <TouchableOpacity><Icon name="list" size={18} style={styles.icon} /></TouchableOpacity>
                        <TouchableOpacity><Icon name="settings" size={18} /></TouchableOpacity>
                    </View>
                </View>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <Icon name="chevron-left" size={20} color="#888" />
                    <Text style={styles.monthText}>April</Text>
                    <Icon name="chevron-right" size={20} color="#888" />
                </View>

                {/* Donut Chart */}
                <View style={styles.chartWrapper}>
                    <Svg height="140" width="140">
                        {segments.map((seg, index) => {
                            const dashLength = (seg.value / total) * circumference;
                            const strokeDashoffset = circumference - offset;
                            const circle = (
                                <Circle
                                    key={index}
                                    cx="70"
                                    cy="70"
                                    r="60"
                                    stroke={seg.color}
                                    strokeWidth="15"
                                    strokeDasharray={`${dashLength}, ${circumference}`}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            );
                            offset += dashLength;
                            return circle;
                        })}
                    </Svg>
                    <View style={styles.chartCenter}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>$365,00</Text>
                    </View>
                </View>

                {/* Legend */}
                <View style={styles.legendRow}>
                    <Text style={[styles.legendItem, { backgroundColor: '#004BFE' }]}>Clothing $183.00</Text>
                    <Text style={[styles.legendItem, { backgroundColor: '#95C93D' }]}>Lingerie $92.00</Text>
                </View>
                <View style={styles.legendRow}>
                    <Text style={[styles.legendItem, { backgroundColor: '#FF7B00' }]}>Shoes $47.00</Text>
                    <Text style={[styles.legendItem, { backgroundColor: '#F45CA5' }]}>Bags $43.00</Text>
                </View>

                {/* Status Circles */}
                <View style={styles.statusRow}>
                    <View style={styles.statusCircle}><Text style={styles.statusNum}>12</Text><Text style={styles.statusText}>Ordered</Text></View>
                    <View style={styles.statusCircle}><Text style={styles.statusNum}>7</Text><Text style={styles.statusText}>Received</Text></View>
                    <View style={styles.statusCircle}><Text style={styles.statusNum}>5</Text><Text style={styles.statusText}>To Receive</Text></View>
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Order History</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 16, alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: 12,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    headerIcons: { flexDirection: 'row', gap: 12 },
    icon: { marginHorizontal: 4 },
    monthSelector: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, gap: 12,
        backgroundColor: '#f4f4f4', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 20
    },
    monthText: { fontSize: 18, fontWeight: '600' },
    chartWrapper: {
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    chartCenter: {
        position: 'absolute', top: 45, alignItems: 'center', justifyContent: 'center',
    },
    totalLabel: { fontSize: 14, color: '#555' },
    totalAmount: { fontSize: 18, fontWeight: 'bold' },
    legendRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
    legendItem: {
        color: '#fff', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 16, overflow: 'hidden', fontSize: 13,
    },
    statusRow: {
        flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, marginBottom: 30,
    },
    statusCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 },
    },
    statusNum: { fontSize: 18, fontWeight: 'bold', color: '#004BFE' },
    statusText: { fontSize: 12, marginTop: 4 },
    button: {
        backgroundColor: '#004BFE', paddingVertical: 14,
        paddingHorizontal: 32, borderRadius: 10, width: '100%', alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ActivityScreen;
