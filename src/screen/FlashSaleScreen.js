import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, FlatList, ScrollView,
    TouchableOpacity, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const discountTabs = ['All', '10%', '20%', '30%', '40%', '50%'];
const selectedTab = 2;

const products = [
    { id: 1, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/image1.png'), price: '$16,00', oldPrice: '$20,00' },
    { id: 2, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/image2.png'), price: '$16,00', oldPrice: '$20,00' },
    { id: 3, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/image3.png'), price: '$16,00', oldPrice: '$20,00' },
    { id: 4, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/image4.png'), price: '$16,00', oldPrice: '$20,00' },
    { id: 5, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/image6.png'), price: '$16,00', oldPrice: '$20,00' },
    { id: 6, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/image7.png'), price: '$16,00', oldPrice: '$20,00' },
    { id: 7, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/wel1.png'), price: '$16,00', oldPrice: '$20,00' },
    { id: 8, title: 'Lorem ipsum dolor sit amet consectetur', image: require('../assets/wel2.png'), price: '$16,00', oldPrice: '$20,00' },
];

const mostPopular = [
    { title: 'New', image: require('../assets/image1.png'), likes: 1780 },
    { title: 'Sale', image: require('../assets/image3.png'), likes: 1780 },
    { title: 'Hot', image: require('../assets/image4.png'), likes: 1780 }
]

export default function FlashSaleScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Flash Sale</Text>
                    <Text style={styles.headerSubtitle}>Choose Your Discount</Text>

                    <View style={styles.timerContainer}>
                        <Icon name="notifications-outline" size={18} color="#000" />
                        <View style={styles.timerBox}><Text style={styles.timerText}>00</Text></View>
                        <Text style={styles.timerSeparator}>:</Text>
                        <View style={styles.timerBox}><Text style={styles.timerText}>36</Text></View>
                        <Text style={styles.timerSeparator}>:</Text>
                        <View style={styles.timerBox}><Text style={styles.timerText}>58</Text></View>
                    </View>
                </View>

                {/* Discount Tabs */}
                <View style={styles.tabContainer}>
                    {discountTabs.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.tab, selectedTab === index && styles.activeTab]}>
                            <Text style={[styles.tabText, selectedTab === index && styles.activeTabText]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>20% Discount</Text>
                    <Icon name="options-outline" size={18} color="#000" />
                </View>

                {/* Product Grid */}
                <View style={styles.productGrid}>
                    {products.map(item => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('LiveProductCard')}
                            key={item.id} style={styles.productCard}>
                            <Image source={item.image} style={styles.productImage} />
                            <Text numberOfLines={2} style={styles.productTitle}>{item.title}</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.price}>{item.price}</Text>
                                <Text style={styles.oldPrice}>{item.oldPrice}</Text>
                            </View>
                            <View style={styles.discountBadge}><Text style={styles.discountText}>-20%</Text></View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Big Sale Banner */}
                <View style={styles.banner}>
                    <Image
                        resizeMode="cover"
                        source={require('../assets/ban2.png')} style={{ height: 130, width: "100%" }} />
                </View>

                {/* Most Popular */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Most Popular</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.seeAll}>See All</Text>
                        <Icon name="arrow-forward-circle" size={24} color="#004BFE" />
                    </View>
                </View>

                <FlatList
                    horizontal
                    data={mostPopular}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.popularCard}>
                            <Image source={item.image} style={styles.popularImage} />
                            <View style={styles.popularMeta}>
                                <Text style={styles.popularLikes}>{item.likes} 💙</Text>
                                <Text>{item.title}</Text>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    showsHorizontalScrollIndicator={false}
                />
            </ScrollView>

            {/* Bottom Nav (Dummy) */}
            {/* <View style={styles.bottomNav}>
                <Icon name="home-outline" size={24} />
                <Icon name="heart-outline" size={24} />
                <Icon name="grid-outline" size={24} />
                <Icon name="cart-outline" size={24} />
                <Icon name="person-outline" size={24} />
            </View> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 16 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
    headerSubtitle: { fontSize: 13, color: '#555', marginBottom: 8 },
    timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timerBox: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        elevation: 3
    },
    timerText: { fontWeight: 'bold' },
    timerSeparator: { fontWeight: 'bold' },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 12,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    tabText: { fontWeight: '500' },
    activeTab: {
        backgroundColor: '#004BFE',
    },
    activeTabText: {
        color: '#fff',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 10
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingHorizontal: 10
    },
    productCard: {
        width: (width - 48) / 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        marginBottom: 16,
        position: 'relative',
        elevation: 2,
    },
    productImage: { width: '100%', height: 150, borderRadius: 10 },
    productTitle: { fontSize: 13, marginVertical: 6, color: '#000' },
    priceRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    price: { fontWeight: 'bold', fontSize: 14, color: '#000' },
    oldPrice: { color: '#F1AEAE', textDecorationLine: 'line-through' },
    discountBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#FF4D4F',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 6
    },
    discountText: { color: '#fff', fontSize: 11 },
    banner: {
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16
    },
    bannerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    bannerSubtitle: { fontSize: 16, color: '#000' },
    happeningNow: {
        marginTop: 8,
        backgroundColor: '#004BFE',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10
    },
    happeningText: { color: '#fff', fontSize: 12 },
    seeAll: { marginRight: 6, color: '#004BFE' },
    popularCard: { width: 100, marginRight: 12 },
    popularImage: { width: 100, height: 100, borderRadius: 10 },
    popularMeta: { marginTop: 4, alignItems: 'center' },
    popularLikes: { fontWeight: '600', fontSize: 13 },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff'
    }
});
