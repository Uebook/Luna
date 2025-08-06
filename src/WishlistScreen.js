import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const recentlyViewed = [
    'https://randomuser.me/api/portraits/women/1.jpg',
    'https://randomuser.me/api/portraits/women/2.jpg',
    'https://randomuser.me/api/portraits/women/3.jpg',
    'https://randomuser.me/api/portraits/women/4.jpg',
    'https://randomuser.me/api/portraits/women/5.jpg',
];

const wishlistItems = [
    {
        id: '1',
        image: require('./assets/image1.png'),
        title: 'Lorem ipsum dolor sit amet consectetur.',
        price: 17,
        discountedPrice: null,
        color: 'Pink',
        size: 'M',
    },
    {
        id: '2',
        image: require('./assets/image2.png'),
        title: 'Lorem ipsum dolor sit amet consectetur.',
        price: 17,
        discountedPrice: 12,
        color: 'Pink',
        size: 'M',
    },
    {
        id: '3',
        image: require('./assets/image3.png'),
        title: 'Lorem ipsum dolor sit amet consectetur.',
        price: 27,
        discountedPrice: null,
        color: 'Pink',
        size: 'M',
    },
    {
        id: '4',
        image: require('./assets/image4.png'),
        title: 'Lorem ipsum dolor sit amet consectetur.',
        price: 19,
        discountedPrice: null,
        color: 'Pink',
        size: 'M',
    },
];


const dummyProductss = [
    { title: 'Floral Dress', price: '$27.99', image: require('./assets/image1.png') },
    { title: 'Denim Jacket', price: '$42.00', image: require('./assets/image2.png') },
    { title: 'Summer Top', price: '$19.99', image: require('./assets/image3.png') },
    { title: 'Summer Top', price: '$19.99', image: require('./assets/image4.png') },
    { title: 'Summer Top', price: '$19.99', image: require('./assets/image5.png') },
    { title: 'Summer Top', price: '$19.99', image: require('./assets/image6.png') },

];
const WishlistScreen = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.imageWrapper}>
                <Image source={item.image} style={styles.itemImage} />
                <TouchableOpacity style={styles.deleteBtn}>
                    <Icon name="trash" size={16} color="#e11d48" />
                </TouchableOpacity>
            </View>

            <View style={styles.contentWrapper}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                </Text>

                <View style={styles.priceRow}>
                    {item.discountedPrice && (
                        <Text style={styles.strikePrice}>${item.price.toFixed(2)}</Text>
                    )}
                    <Text style={styles.price}>
                        ${item.discountedPrice ? item.discountedPrice.toFixed(2) : item.price.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.tagRow}>
                    <Text style={styles.tag}>Pink</Text>
                    <Text style={styles.tag}>M</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.cartBtn}>
                <Icon name="cart-plus" size={20} color="#004CFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Wishlist</Text>

            <View style={styles.headerRow}>
                <Text style={styles.subtitle}>Recently viewed</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('RecentlyViewedScreen')}
                    style={styles.arrowBtn}>
                    <Icon name="arrow-right" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {recentlyViewed.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.avatar} />
                ))}
            </ScrollView>

            <FlatList
                data={wishlistItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    arrowBtn: {
        backgroundColor: "#004CFF",
        padding: 10,
        borderRadius: 30,
    },
    scrollRow: {
        marginTop: 12,
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#eee',
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FC',
        borderRadius: 12,
        padding: 10,
        marginBottom: 16,
        elevation: 2,
    },
    imageWrapper: {
        position: 'relative',
        width: 90,
        height: 90,
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    deleteBtn: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 6,
        elevation: 4,
    },
    contentWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111',
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    strikePrice: {
        textDecorationLine: 'line-through',
        color: '#e11d48',
        marginRight: 8,
        fontSize: 14,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    tagRow: {
        flexDirection: 'row',
        marginTop: 2,
    },
    tag: {
        backgroundColor: '#E5EBFC',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: '600',
        color: '#222',
        marginRight: 8,
    },
    cartBtn: {
        padding: 10,
        backgroundColor: '#E6F0FF',
        borderRadius: 10,
        marginLeft: 8,
    },
});

export default WishlistScreen;
