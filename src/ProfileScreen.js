import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    ScrollView,
    SafeAreaView, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
const { width } = Dimensions.get('window');


const profileImage = 'https://randomuser.me/api/portraits/men/10.jpg';

const recentUsers = [
    { id: '1', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: '2', image: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '3', image: 'https://randomuser.me/api/portraits/women/3.jpg' },
    { id: '4', image: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: '5', image: 'https://randomuser.me/api/portraits/women/5.jpg' },
];

const stories = [
    { id: '1', image: 'https://randomuser.me/api/portraits/women/6.jpg', label: 'Live', color: '#00D084' },
    { id: '2', image: 'https://randomuser.me/api/portraits/women/7.jpg' },
    { id: '3', image: 'https://randomuser.me/api/portraits/women/8.jpg' },
    { id: '4', image: 'https://randomuser.me/api/portraits/women/9.jpg' },
];
const categories = [
    {
        name: 'Clothing',
        count: 109,
        images: [
            'https://randomuser.me/api/portraits/women/21.jpg',
            'https://randomuser.me/api/portraits/women/22.jpg',
            'https://randomuser.me/api/portraits/women/23.jpg',
            'https://randomuser.me/api/portraits/women/24.jpg'
        ]
    },
    {
        name: 'Shoes',
        count: 530,
        images: [
            'https://randomuser.me/api/portraits/men/21.jpg',
            'https://randomuser.me/api/portraits/men/22.jpg',
            'https://randomuser.me/api/portraits/men/23.jpg',
            'https://randomuser.me/api/portraits/men/24.jpg'
        ]
    }
];

const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <Image source={{ uri: profileImage }} style={styles.avatar} />
                    <TouchableOpacity style={styles.activityBtn}>
                        <Text style={styles.activityText}>My Activity</Text>
                    </TouchableOpacity>
                    <Icon name="bell" size={20} style={styles.iconBtn} />
                    <Icon name="menu" size={20} style={styles.iconBtn} />
                    <Icon name="settings" size={20} style={styles.iconBtn} />
                </View>

                {/* Greeting */}
                <Text style={styles.greetingText}>Hello, Romina!!</Text>

                {/* Reward */}
                <View style={styles.rewardBox}>
                    <View style={styles.rewardIconCircle}>
                        <Icon name="check-circle" size={24} color="#004BFE" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rewardTitle}>Announcement</Text>
                        <Text style={styles.rewardDesc}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas hendrerit luctus libero.
                        </Text>
                    </View>
                </View>

                {/* Recently Viewed */}
                <Text style={styles.sectionTitle}>Recently viewed</Text>
                <FlatList
                    horizontal
                    data={recentUsers}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item.image }} style={styles.recentAvatar} />
                    )}
                />

                {/* My Orders */}
                <Text style={styles.sectionTitle}>My Orders</Text>
                <View style={styles.orderTabs}>
                    <TouchableOpacity style={styles.tabBtn}><Text style={styles.tabText}>To Pay</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.tabBtn, styles.activeTab]}>
                        <Text style={[styles.tabText, styles.activeTabText]}>To Receive</Text>
                        <View style={styles.dot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabBtn}><Text style={styles.tabText}>To Review</Text></TouchableOpacity>
                </View>

                {/* Stories */}
                <Text style={styles.sectionTitle}>Stories</Text>
                <FlatList
                    horizontal
                    data={stories}
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.storyCard}>
                            <Image source={{ uri: item.image }} style={styles.storyImage} />
                            {item.label && (
                                <View style={[styles.liveTag, { backgroundColor: item.color }]}>
                                    <Text style={styles.liveText}>{item.label}</Text>
                                </View>
                            )}
                            <Icon name="play-circle" size={24} color="#fff" style={styles.playIcon} />
                        </View>
                    )}
                />

                {/* New Items */}
                <Text style={styles.sectionTitle}>New Items</Text>
                <FlatList
                    horizontal
                    data={stories}
                    keyExtractor={item => item.id + '_new'}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.productCard}>
                            <Image source={{ uri: item.image }} style={styles.productImage} />
                            <Text style={styles.productTitle}>Lorem ipsum dolor</Text>
                            <Text style={styles.productPrice}>$17.00</Text>
                        </View>
                    )}
                />

                {/* Most Popular */}
                <Text style={styles.sectionTitle}>Most Popular</Text>
                <FlatList
                    horizontal
                    data={stories}
                    keyExtractor={item => item.id + '_popular'}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.productCard}>
                            <Image source={{ uri: item.image }} style={styles.productImage} />
                            <View style={styles.popularTag}>
                                <Icon name="zap" size={12} color="#FFD700" />
                                <Text style={styles.popularText}>Hot</Text>
                            </View>
                            <Text style={styles.productTitle}>Product name</Text>
                            <Text style={styles.productPrice}>$21.00</Text>
                        </View>
                    )}
                />
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.gridWrapper}>
                    {categories.map((category, index) => (
                        <View key={index} style={styles.categoryBox}>
                            <View style={styles.imageGrid}>
                                {category.images.map((img, i) => (
                                    <Image key={i} source={{ uri: img }} style={styles.gridImage} />
                                ))}
                            </View>
                            <View style={styles.categoryLabelRow}>
                                <Text style={styles.categoryLabel}>{category.name}</Text>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryCount}>{category.count}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Categories */}



                {/* Flash Sale */}
                <Text style={styles.sectionTitle}>Flash Sale</Text>
                <View style={styles.flashRow}>
                    {stories.map((item, i) => (
                        <View key={i} style={styles.flashCard}>
                            <Image source={{ uri: item.image }} style={styles.flashImage} />
                            <View style={styles.flashBadge}><Text style={styles.flashBadgeText}>-20%</Text></View>
                        </View>
                    ))}
                </View>

                {/* Top Products */}
                <Text style={styles.sectionTitle}>Top Products</Text>
                <FlatList
                    horizontal
                    data={recentUsers}
                    keyExtractor={item => item.id + '_top'}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item.image }} style={styles.topAvatar} />
                    )}
                    showsHorizontalScrollIndicator={false}
                />

                {/* Just For You */}
                <Text style={styles.sectionTitle}>Just For You</Text>
                <View style={styles.justForYouGrid}>
                    {stories.concat(stories).map((item, i) => (
                        <View key={i} style={styles.productCardGrid}>
                            <Image source={{ uri: item.image }} style={styles.productImageGrid} />
                            <Text style={styles.productTitle}>Lorem ipsum</Text>
                            <Text style={styles.productPrice}>$17.00</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    activityBtn: { backgroundColor: '#004BFE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
    activityText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    iconBtn: { marginHorizontal: 4, color: '#555' },
    greetingText: { fontSize: 26, fontWeight: 'bold', marginTop: 20 },
    rewardBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F5F9FF', borderRadius: 12, padding: 14, marginTop: 12 },
    rewardIconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    rewardTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    rewardDesc: { fontSize: 12, color: '#555' },
    sectionTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 20, marginBottom: 6 },
    recentAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
    orderTabs: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
    tabBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
    tabText: { fontSize: 13, color: '#000', fontWeight: '600' },
    activeTab: { backgroundColor: '#DDE8FF' },
    activeTabText: { color: '#004BFE' },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C853', marginLeft: 6 },
    storyCard: { width: 100, height: 150, borderRadius: 16, overflow: 'hidden', marginRight: 10, position: 'relative' },
    storyImage: { width: '100%', height: '100%' },
    liveTag: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    liveText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
    playIcon: { position: 'absolute', bottom: 8, left: 8 },
    productCard: { width: 120, marginRight: 12 },
    productImage: { width: 120, height: 150, borderRadius: 12 },
    productTitle: { fontSize: 12, marginTop: 4, fontWeight: '600' },
    productPrice: { fontSize: 12, color: '#333', marginTop: 2 },
    popularTag: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', backgroundColor: '#FFF9C4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    popularText: { fontSize: 10, marginLeft: 4, fontWeight: 'bold' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    categoryCard: { width: '47%', marginVertical: 6 },
    categoryImage: { width: '100%', height: 100, borderRadius: 12 },
    categoryText: { fontSize: 13, fontWeight: '600', marginTop: 4 },
    flashRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    flashCard: { width: '47%', height: 150, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    flashImage: { width: '100%', height: '100%' },
    flashBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF5252', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    flashBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    topAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    justForYouGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    productCardGrid: { width: '47%', marginBottom: 16 },
    productImageGrid: { width: '100%', height: 160, borderRadius: 12 },
    gridWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
    categoryBox: {
        width: (width - 48) / 2, backgroundColor: '#fff', borderRadius: 12,
        padding: 8, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3
    },
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridImage: { width: (width - 80) / 4, height: (width - 80) / 4, borderRadius: 8, marginBottom: 6 },
    categoryLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    categoryLabel: { fontWeight: 'bold', fontSize: 16 },
    categoryBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    categoryCount: { fontSize: 14, color: '#333' },

});

export default ProfileScreen;
