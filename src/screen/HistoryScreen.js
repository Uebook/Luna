import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const orders = [
    {
        id: 1,
        image: require('../assets/image1.png'),
        description: 'Lorem ipsum dolor sit amet consectetur.',
        orderNumber: '#92287157',
        date: 'April,06',
    },
    {
        id: 2,
        image: require('../assets/image2.png'),
        description: 'Lorem ipsum dolor sit amet consectetur.',
        orderNumber: '#92287157',
        date: 'April,06',
    },
    {
        id: 31,
        image: require('../assets/image3.png'),
        description: 'Lorem ipsum dolor sit amet consectetur.',
        orderNumber: '#92287157',
        date: 'April,06',
    },
    {
        id: 32,
        image: require('../assets/image4.png'),
        description: 'Lorem ipsum dolor sit amet consectetur.',
        orderNumber: '#92287157',
        date: 'April,06',
    },
];

const HistoryScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const openReview = (order) => {
        setSelectedOrder(order);
        setRating(0);
        setComment('');
        setModalVisible(true);
    };

    const handleRating = (value) => setRating(value);

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require('../assets/image3.png')}
                        style={styles.avatar}
                    />
                    <Text style={styles.headerTitle}>History</Text>
                    <View style={styles.headerIcons}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="menu-outline" size={20} color="#3b82f6" />
                        </View>
                        <View style={styles.iconCircle}>
                            <Ionicons name="list-outline" size={20} color="#3b82f6" />
                        </View>
                        <View style={styles.iconCircle}>
                            <Ionicons name="settings-outline" size={20} color="#3b82f6" />
                        </View>
                    </View>
                </View>

                {/* Orders */}
                {orders.map((order) => (
                    <View key={order.id} style={styles.card}>
                        <Image source={order.image} style={styles.productImage} />
                        <View style={styles.cardContent}>
                            <Text style={styles.description}>{order.description}</Text>
                            <Text style={styles.orderNumber}>
                                Order <Text style={{ fontWeight: 'bold' }}>{order.orderNumber}</Text>
                            </Text>
                            <View style={styles.row}>
                                <Text style={styles.date}>{order.date}</Text>
                                <TouchableOpacity
                                    style={styles.reviewButton}
                                    onPress={() => openReview(order)}
                                >
                                    <Text style={styles.reviewText}>Review</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Review Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Review</Text>
                        {selectedOrder && (
                            <View style={styles.modalBody}>
                                <View style={styles.modalUserRow}>
                                    <Image source={selectedOrder.image} style={styles.modalImage} />
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.modalDesc}>{selectedOrder.description}</Text>
                                        <Text style={styles.modalOrder}>Order <Text style={{ fontWeight: 'bold' }}>{selectedOrder.orderNumber}</Text></Text>
                                    </View>
                                </View>

                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <TouchableOpacity key={num} onPress={() => handleRating(num)}>
                                            <Ionicons
                                                name={rating >= num ? 'star' : 'star-outline'}
                                                size={32}
                                                color="#fbbf24"
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    placeholder="Your comment"
                                    style={styles.commentInput}
                                    multiline
                                    value={comment}
                                    onChangeText={setComment}
                                />

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={() => {
                                        // You can send the rating/comment here
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.submitText}>Say it!</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default HistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    headerTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 10,
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,

    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        paddingVertical: 6,
        justifyContent: 'space-between',
    },
    description: {
        fontSize: 13,
        color: '#374151',
    },
    orderNumber: {
        fontSize: 14,
        marginTop: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    date: {
        backgroundColor: '#f1f3f6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 12,
    },
    reviewButton: {
        borderWidth: 1.5,
        borderColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 10,
    },
    reviewText: {
        color: '#3b82f6',
        fontWeight: 'bold',
        fontSize: 13,
    },

    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalBody: {
        marginTop: 10,
    },
    modalUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalImage: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    modalDesc: {
        fontSize: 13,
        marginBottom: 2,
    },
    modalOrder: {
        fontSize: 13,
        color: '#111',
    },
    starsRow: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 10,
    },
    commentInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        height: 90,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: 16,
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
