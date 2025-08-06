import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const vouchers = [
    {
        id: 1,
        title: 'First Purchase',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore',
        expiry: 'Valid Until 4.21.20',
        daysLeft: '3 days left',
        type: '🛍️',
        highlight: true
    },
    {
        id: 2,
        title: 'Loyal Customer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore',
        expiry: 'Valid Until 6.20.20',
        type: '❤️',
        highlight: false
    },
    {
        id: 3,
        title: 'Review Maker',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore',
        expiry: 'Valid Until 6.20.20',
        type: '⭐',
        highlight: false
    },
    {
        id: 4,
        title: 'Big Soul',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore',
        expiry: 'Valid Until 6.20.20',
        type: '☁️',
        highlight: false
    },
    {
        id: 5,
        title: 'T-Shirt Collector',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore',
        expiry: 'Valid Until 6.20.20',
        type: '👕',
        highlight: false
    },
    {
        id: 6,
        title: '10+ Orders',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonumy eirmod tempor invidunt ut labore',
        expiry: 'Valid Until 6.20.20',
        type: '😊',
        highlight: false
    }
];

const VoucherCard = ({ item }) => {
    const borderColor = item.highlight ? '#F45C5C' : '#004BFE';
    const bgColor = item.highlight ? '#FFF6F6' : '#fff';
    const dashedColor = item.highlight ? '#FEC8C8' : '#73A5FF';

    return (
        <View style={{ marginBottom: 24 }}>
            <View style={{ position: 'relative', paddingHorizontal: 16 }}>
                <View style={[styles.notch, { left: 10, backgroundColor: '#fff', borderColor }]} />
                <View style={[styles.notch, { right: 10, backgroundColor: '#fff', borderColor }]} />

                <View style={[styles.voucherWrapper, { borderColor, backgroundColor: bgColor }]}>
                    <View style={styles.topRow}>
                        <Text style={[styles.voucherLabel, { color: borderColor }]}>Voucher</Text>
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            {item.daysLeft && (
                                <Text style={[styles.daysLeft, { color: borderColor }]}>{item.daysLeft}</Text>
                            )}
                            <Text style={styles.expiry}>{item.expiry}</Text>
                        </View>
                    </View>

                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderStyle: 'dashed',
                            borderColor: dashedColor,
                            marginVertical: 8
                        }}
                    />

                    <View style={styles.contentRow}>
                        <Text style={styles.emoji}>{item.type}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.desc}>{item.description}</Text>
                        </View>
                        <View style={styles.collectBtn}>
                            <Text style={styles.collectText}>Collected</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const VoucherScreen = () => {
    const [activeTab, setActiveTab] = useState('Active Rewards');

    const renderProgress = () => {
        return (
            <View style={{ paddingHorizontal: 16 }}>
                <View style={styles.gridContainer}>
                    {vouchers.map((item) => (
                        <View key={item.id} style={styles.rewardItem}>
                            <View style={styles.progressCircle}>
                                <Text style={{ fontSize: 22 }}>{item.type}</Text>
                            </View>
                            <Text style={styles.rewardTitle}>{item.title}</Text>
                            <Text style={styles.rewardDesc}>{item.description}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.headerTitle}>Vouchers</Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Active Rewards' && styles.activeTab]}
                        onPress={() => setActiveTab('Active Rewards')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Active Rewards' && styles.activeTabText]}>
                            Active Rewards
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Progress' && styles.activeTab]}
                        onPress={() => setActiveTab('Progress')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Progress' && styles.activeTabText]}>
                            Progress
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Voucher List or Progress View */}
                {activeTab === 'Active Rewards' ? (
                    vouchers.map(v => <VoucherCard key={v.id} item={v} />)
                ) : (
                    renderProgress()
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { paddingTop: 20, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16
    },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', flex: 1 },

    tabs: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: '#F4F4F4',
        borderRadius: 12
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 12
    },
    activeTab: {
        backgroundColor: '#004BFE'
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000'
    },
    activeTabText: {
        color: '#fff'
    },

    voucherWrapper: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        overflow: 'hidden'
    },
    notch: {
        position: 'absolute',
        top: 54,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        zIndex: 2
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    voucherLabel: {
        fontWeight: 'bold',
        fontSize: 16
    },
    daysLeft: {
        fontSize: 12,
        fontWeight: '600'
    },
    expiry: {
        fontSize: 12,
        backgroundColor: '#f3f3f3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden'
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    emoji: {
        fontSize: 20
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    desc: {
        fontSize: 13,
        color: '#555'
    },
    collectBtn: {
        backgroundColor: '#004BFE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    collectText: {
        color: '#fff',
        fontSize: 12
    },

    // Progress Styles
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    rewardItem: {
        width: (width - 48) / 2,
        marginBottom: 24,
        alignItems: 'center'
    },
    progressCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: '#004BFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    rewardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000'
    },
    rewardDesc: {
        fontSize: 13,
        textAlign: 'center',
        color: '#555'
    }
});

export default VoucherScreen;
