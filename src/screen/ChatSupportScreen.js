import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, FlatList, TextInput, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const orders = [
    {
        id: '92287157',
        items: 3,
        status: 'Shipped',
        images: [
            'https://randomuser.me/api/portraits/women/21.jpg',
            'https://randomuser.me/api/portraits/women/22.jpg',
            'https://randomuser.me/api/portraits/women/23.jpg',
        ]
    },
    {
        id: '92287158',
        items: 2,
        status: 'Delivered',
        images: [
            'https://randomuser.me/api/portraits/women/24.jpg',
            'https://randomuser.me/api/portraits/women/25.jpg',
        ]
    }
];

export default function ChatSupportScreen() {
    const [step, setStep] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (step === 0 && selectedOrder) {
            setStep(1);
        } else if (step === 1) {
            setStep(2);
            setLoading(true);

            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        from: 'agent',
                        text: `Hello, Amanda! I'm Maggy, your personal assistant from Customer Care Service. Let me go through your order and check its current status. Wait a moment please.`,
                    }
                ]);

                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        { from: 'user', text: 'Hello, Maggy! Sure!' },
                        {
                            from: 'agent',
                            text: `Thank you for waiting Amanda! I just checked your order status and seems like there was a problem on our end. You will receive your parcel within 2 days.`,
                        }
                    ]);
                    setLoading(false);
                }, 2500);
            }, 2000);
        }
    };

    const renderOrderCard = (order) => (
        <TouchableOpacity
            key={order.id}
            style={[
                styles.orderCard,
                selectedOrder === order.id && styles.orderCardSelected
            ]}
            onPress={() => setSelectedOrder(order.id)}
        >
            <Text style={styles.orderTitle}>Order #{order.id}</Text>
            <Text style={styles.orderSubtitle}>Standard Delivery</Text>
            <Text style={styles.orderStatus}>{order.status}</Text>
            <View style={styles.imageRow}>
                {order.images.map((img, i) => (
                    <Image key={i} source={{ uri: img }} style={styles.itemImage} />
                ))}
            </View>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.chatContainer}>
                {/* Step 0 - ChatBot intro + order selection */}
                {step === 0 && (
                    <>
                        <Text style={styles.botLabel}>Chat Bot</Text>
                        <View style={styles.botMessage}>
                            <Text>Hello, Amanda! Welcome to Customer Care Service. Please provide more details about your issue before we start.</Text>
                        </View>
                        <Text style={styles.selectText}>Select one of your orders</Text>
                        {orders.map(renderOrderCard)}
                        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={!selectedOrder}>
                            <Text style={styles.nextText}>Next</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Step 1 - Agent welcome + show selected order */}
                {step >= 1 && (
                    <>
                        <View style={styles.agentHeader}>
                            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/30.jpg' }} style={styles.agentImage} />
                            <Text style={styles.agentName}>Maggy Lee</Text>
                            <Text style={styles.agentRole}>Customer Care Service</Text>
                        </View>

                        <View style={styles.agentMessage}>
                            <Text>Hello, Amanda! Welcome to Customer Care Service...</Text>
                        </View>

                        <View style={styles.selectedOrderBox}>
                            <Text style={{ fontWeight: 'bold' }}>Order #{selectedOrder}</Text>
                            <Text>Standard Delivery</Text>
                            <Text style={{ fontWeight: '600', marginTop: 4 }}>
                                {orders.find(o => o.id === selectedOrder)?.status}
                            </Text>
                            <View style={styles.imageRow}>
                                {orders.find(o => o.id === selectedOrder)?.images.map((img, i) => (
                                    <Image key={i} source={{ uri: img }} style={styles.itemImage} />
                                ))}
                            </View>
                        </View>

                        {step === 1 && (
                            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                                <Text style={styles.nextText}>Next</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* Step 2 - Conversation */}
                {step === 2 && (
                    <>
                        {messages.map((msg, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.chatBubble,
                                    msg.from === 'user' ? styles.userBubble : styles.agentBubble
                                ]}
                            >
                                <Text style={{ color: msg.from === 'user' ? '#000' : '#fff' }}>{msg.text}</Text>
                            </View>
                        ))}
                        {loading && <Text style={styles.typing}>Typing...</Text>}
                    </>
                )}
            </ScrollView>

            {/* Fixed ChatBot Suggestions */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.suggestionBtn}>
                    <Text style={styles.suggestionText}>✔️ Order Issues</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionBtn}>
                    <Text style={styles.suggestionText}>✔️ I didn't receive my parcel</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    chatContainer: { padding: 16, paddingBottom: 100 },
    botLabel: { fontWeight: 'bold', fontSize: 16, color: '#004BFE' },
    botMessage: {
        backgroundColor: '#EEF4FF',
        padding: 10,
        borderRadius: 10,
        marginVertical: 12,
    },
    selectText: { fontWeight: 'bold', marginBottom: 10 },
    orderCard: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    orderCardSelected: {
        borderColor: '#004BFE',
        backgroundColor: '#EAF1FF',
    },
    orderTitle: { fontWeight: 'bold' },
    orderSubtitle: { fontSize: 12, color: '#666' },
    orderStatus: { marginTop: 4, fontWeight: '600', color: '#333' },
    imageRow: { flexDirection: 'row', marginTop: 8 },
    itemImage: { width: 32, height: 32, borderRadius: 6, marginRight: 6 },
    nextBtn: {
        backgroundColor: '#004BFE',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    nextText: { color: '#fff', fontWeight: 'bold' },

    agentHeader: { alignItems: 'center', marginBottom: 10 },
    agentImage: { width: 50, height: 50, borderRadius: 25 },
    agentName: { fontWeight: 'bold', fontSize: 16 },
    agentRole: { fontSize: 12, color: '#888' },

    agentMessage: {
        backgroundColor: '#EEF4FF',
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    selectedOrderBox: {
        borderWidth: 1,
        borderColor: '#004BFE',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    chatBubble: {
        maxWidth: '80%',
        padding: 10,
        marginVertical: 6,
        borderRadius: 10,
    },
    userBubble: {
        backgroundColor: '#F1F1F1',
        alignSelf: 'flex-end',
    },
    agentBubble: {
        backgroundColor: '#004BFE',
        alignSelf: 'flex-start',
    },
    typing: {
        fontStyle: 'italic',
        color: '#999',
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 8
    },
    suggestionBtn: {
        backgroundColor: '#004BFE',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    suggestionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    }
});
