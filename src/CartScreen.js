import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const cartItems = [
    {
        id: '1',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        title: 'Lorem ipsum dolor sit amet consectetur.',
        color: 'Pink',
        size: 'M',
        price: 17,
        quantity: 1,
    },
    {
        id: '2',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        title: 'Lorem ipsum dolor sit amet consectetur.',
        color: 'Pink',
        size: 'M',
        price: 17,
        quantity: 1,
    },
];

const wishlistItems = [
    {
        id: '3',
        image: 'https://randomuser.me/api/portraits/women/3.jpg',
        title: 'Lorem ipsum dolor sit amet consectetur.',
        color: 'Pink',
        size: 'M',
        price: 17,
    },
    {
        id: '4',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
        title: 'Lorem ipsum dolor sit amet consectetur.',
        color: 'Pink',
        size: 'M',
        price: 17,
    },
];

const CartScreen = () => {
    const [items, setItems] = useState(cartItems);

    const updateQuantity = (id, amount) => {
        const updated = items.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity + amount) }
                : item
        );
        setItems(updated);
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const renderCartItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.imageBox}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteButton}>
                    <Icon name="trash-2" size={18} color="#e11d48" />
                </TouchableOpacity>
            </View>
            <View style={styles.cartContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtext}>{item.color}, Size {item.size}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                        <Icon name="minus" size={16} color="#004BFE" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                        <Icon name="plus" size={16} color="#004BFE" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderWishlistItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.imageBox}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <TouchableOpacity style={styles.deleteButton}>
                    <Icon name="trash-2" size={18} color="#e11d48" />
                </TouchableOpacity>
            </View>
            <View style={styles.wishlistContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                <View style={styles.optionRow}>
                    <Text style={styles.tag}>Pink</Text>
                    <Text style={styles.tag}>M</Text>
                    <TouchableOpacity style={styles.addToCart}>
                        <Icon name="shopping-cart" size={18} color="#004BFE" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Cart</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{items.length}</Text>
                </View>
            </View>

            {/* Address */}
            <View style={styles.addressCard}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.addressLabel}>Shipping Address</Text>
                    <Text style={styles.addressText}>26, Duong So 2, Thao Dien Ward, An Phu, District 2, Ho Chi Minh city</Text>
                </View>
                <TouchableOpacity>
                    <Icon name="edit" size={20} color="#004BFE" />
                </TouchableOpacity>
            </View>

            {/* Cart List */}
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={renderCartItem}
                ListFooterComponent={
                    <>
                        <Text style={styles.wishlistHeader}>From Your Wishlist</Text>
                        <FlatList
                            data={wishlistItems}
                            keyExtractor={item => item.id}
                            renderItem={renderWishlistItem}
                            scrollEnabled={false}
                        />
                    </>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.totalText}>Total <Text style={styles.totalPrice}>${total.toFixed(2)}</Text></Text>
                <TouchableOpacity style={styles.checkoutBtn}>
                    <Text style={styles.checkoutText}>Checkout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    header: { fontSize: 26, fontWeight: 'bold' },
    countBadge: {
        marginLeft: 10,
        backgroundColor: '#e5ebfc',
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    countText: { fontWeight: 'bold', fontSize: 14 },
    addressCard: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 12,
        borderRadius: 12,
        marginVertical: 16,
        alignItems: 'center',
        gap: 12,
    },
    addressLabel: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    addressText: { fontSize: 13, color: '#333' },

    card: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 16,
        padding: 10,
        alignItems: 'flex-start',
    },
    imageBox: {
        position: 'relative',
        marginRight: 10,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 10,
    },
    deleteButton: {
        position: 'absolute',
        bottom: -6,
        left: -6,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        elevation: 4,
    },
    cartContent: { flex: 1 },
    wishlistContent: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600', color: '#111' },
    subtext: { fontSize: 13, color: '#444', marginTop: 4 },
    price: { fontWeight: 'bold', fontSize: 16, marginTop: 6 },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    qtyBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#E5EBFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 12,
    },
    wishlistHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 24,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    tag: {
        backgroundColor: '#E5EBFC',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: '600',
        marginRight: 8,
        color: '#333',
    },
    addToCart: {
        backgroundColor: '#e0edff',
        padding: 6,
        borderRadius: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    totalText: { fontSize: 18, fontWeight: 'bold' },
    totalPrice: { color: '#004BFE' },
    checkoutBtn: {
        backgroundColor: '#004BFE',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default CartScreen;
