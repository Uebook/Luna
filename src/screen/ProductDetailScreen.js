import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const variations = [
    { id: 1, image: require('../assets/Image.jpg') },
    { id: 2, image: require('../assets/Placeholder_01.jpg') },
    { id: 3, image: require('../assets/Image.jpg') },
];


const popularItems = [
    { id: 1, image: require('../assets/image3.png'), tag: 'New', likes: 1780 },
    { id: 2, image: require('../assets/Placeholder_01.jpg'), tag: 'Sale', likes: 1780 },
    { id: 3, image: require('../assets/image2.png'), tag: 'Hot', likes: 178 },
];

const youMightLikeData = [
    { id: '1', image: require('../assets/Image.jpg') },
    { id: '2', image: require('../assets/Placeholder_01.jpg') },
    { id: '3', image: require('../assets/image1.png') },
    { id: '4', image: require('../assets/image2.png') },
];

const ProductDetailScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View>
                    <Image
                        source={require('../assets/Image.jpg')}
                        style={styles.mainImage}
                    />
                    <TouchableOpacity style={styles.shareIcon}>
                        <Icon name="share-2" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Price & Description */}
                <View style={styles.section}>
                    <Text style={styles.price}>$17,00</Text>
                    <Text style={styles.description}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </Text>
                </View>

                {/* Variations */}
                <View style={styles.section}>
                    <View style={styles.variationTopRow}>
                        <Text style={styles.sectionTitle}>Variations</Text>
                        <View style={styles.pillRow}>
                            <Text style={styles.variationPill}>Pink</Text>
                            <Text style={styles.variationPill}>M</Text>
                        </View>
                        <TouchableOpacity style={styles.arrowBtn}>
                            <Icon name="arrow-right" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        horizontal
                        data={variations}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <Image
                                source={item.image}
                                style={styles.variationImage} />
                        )}
                        contentContainerStyle={{ gap: 10, marginTop: 10 }}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>

                {/* Specifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Specifications</Text>
                    <Text style={styles.label}>Material</Text>
                    <View style={styles.chipRow}>
                        <Text style={styles.chip}>Cotton 95%</Text>
                        <Text style={styles.chip}>Nylon 5%</Text>
                    </View>
                    <Text style={styles.label}>Origin</Text>
                    <View style={styles.chipRow}>
                        <Text style={styles.chip}>EU</Text>
                    </View>
                    <TouchableOpacity style={styles.rowWithArrow}>
                        <Text style={{ fontSize: 16, fontWeight: "700" }} >Size guide</Text>
                        <TouchableOpacity style={styles.arrowBtn}>
                            <Icon name="arrow-right" size={16} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                {/* Delivery */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery</Text>
                    <View style={styles.deliveryOption}>
                        <Text style={styles.deliveryText}>Standard</Text>
                        <Text style={styles.deliveryTag}>5-7 days</Text>
                        <Text style={styles.deliveryPrice}>$3,00</Text>
                    </View>
                    <View style={styles.deliveryOption}>
                        <Text style={styles.deliveryText}>Express</Text>
                        <Text style={styles.deliveryTag}>1-2 days</Text>
                        <Text style={styles.deliveryPrice}>$12,00</Text>
                    </View>
                </View>

                {/* Reviews */}
                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>Rating & Reviews</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <Text style={{ fontSize: 20 }}>⭐⭐⭐⭐☆</Text>
                        <View style={{
                            backgroundColor: '#E6EEFF',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                            marginLeft: 15,
                        }}>
                            <Text style={{ fontWeight: 'bold', color: '#004BFE' }}>4/5</Text>
                        </View>
                    </View>

                    <View style={styles.reviewCard}>
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
                            style={styles.avatar}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.reviewer}>Veronika</Text>
                            <Text style={{ fontSize: 15 }}>⭐⭐⭐⭐☆</Text>
                            <Text style={[styles.reviewText, { marginTop: 10 }]}>
                                Lorem ipsum dolor sit amet, consectetur sadipscing elit...
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ReviewScreen')} style={styles.reviewBtn}>
                        <Text style={styles.reviewBtnText}>View All Reviews</Text>
                    </TouchableOpacity>
                </View>

                {/* Most Popular */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Most Popular</Text>
                    <FlatList
                        horizontal
                        data={popularItems}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={{
                                backgroundColor: '#fff',
                                borderRadius: 12,
                                marginRight: 10,
                                padding: 8,
                                shadowColor: '#000',
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                            }}>
                                <Image source={item.image} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{item.likes} 💙</Text>
                                    <Text>{item.tag}</Text>
                                </View>
                            </View>
                        )}
                        showsHorizontalScrollIndicator={false}
                    />

                </View>

                {/* You Might Like (Updated) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>You Might Like</Text>
                    <FlatList
                        data={youMightLikeData}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <Image
                                    source={item.image}
                                    style={styles.cardImage} />
                                <Text style={styles.cardTitle}>Lorem ipsum dolor sit amet consectetur</Text>
                                <Text style={styles.cardPrice}>$17,00</Text>
                            </View>
                        )}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingTop: 10 }}
                    />
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity>
                    <Icon name="heart" size={22} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartBtn}>
                    <Text style={styles.cartText}>Add to cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyText}>Buy now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    section: { padding: 16 },
    mainImage: { width: '100%', height: 400 },
    shareIcon: { position: 'absolute', top: 20, right: 20, backgroundColor: '#fff', borderRadius: 20, padding: 6 },
    price: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    description: { marginTop: 6, color: '#444' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    variationTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pillRow: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 12,
        flex: 1,
    },
    variationPill: {
        backgroundColor: '#F0F0F0',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        color: '#000',
        fontSize: 15,
    },
    arrowBtn: {
        backgroundColor: '#004BFE',
        borderRadius: 20,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    variationImage: { width: 80, height: 80, borderRadius: 8 },
    chipRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 12 },
    chip: {
        backgroundColor: '#FCEFEF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        fontSize: 13,
        color: '#000',
    },
    label: { fontWeight: '600', marginTop: 10, marginBottom: 4 },
    rowWithArrow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    deliveryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#004CFF',
        borderRadius: 10,
        padding: 10,
        marginVertical: 6,
    },
    deliveryText: { fontWeight: '500', flex: 1 },
    deliveryTag: {
        backgroundColor: '#E6EEFF',
        color: '#004BFE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    deliveryPrice: { fontWeight: 'bold', color: '#000' },
    reviewCard: { flexDirection: 'row', gap: 10, marginTop: 10 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    reviewer: { fontWeight: 'bold' },
    stars: { color: '#FFA500' },
    reviewText: { color: '#555' },
    reviewBtn: {
        backgroundColor: '#004BFE',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    reviewBtnText: { color: '#fff', fontWeight: '600' },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderTopWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
    },
    cartBtn: {
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cartText: { color: '#fff' },
    buyBtn: {
        backgroundColor: '#004BFE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buyText: { color: '#fff' },
    popularImage: { width: 100, height: 100, borderRadius: 8 },
    tag: { marginTop: 4, textAlign: 'center', fontWeight: '500' },

    // You Might Like Styles
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        width: '48%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default ProductDetailScreen;
