import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, FlatList, TextInput, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { useNavigation } from '@react-navigation/native';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const [step, setStep] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [initialLoading, setInitialLoading] = useSkeletonLoader(true, 600);

    React.useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const userData = await AsyncStorage.getItem('luna_user');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    const userId = parsed.user?.id || parsed.id;
                    if (userId) {
                        const response = await api.post('/v1/chat/history', { user_id: userId });
                        if (response.data.success && response.data.messages) {
                            setMessages(response.data.messages.map(msg => ({
                                from: msg.sender === 'user' ? 'user' : 'agent',
                                text: msg.message,
                                time: msg.created_at,
                            })));
                        }
                    }
                }
            } catch (error) {
                console.log('Error loading chat history:', error);
            } finally {
                setInitialLoading(false);
            }
        };
        loadChatHistory();
    }, [setInitialLoading]);
    
    const C = useMemo(() => ({
        bg: theme.bg,
        card: theme.card,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
        brandSoft: theme.p4,
        white: theme.white,
    }), [theme]);
    
    const styles = useMemo(() => createStyles(C, isDark), [C, isDark]);

    const handleNext = () => {
        if (step === 0 && selectedOrder) {
            setStep(1);
        } else if (step === 1) {
            setStep(2);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
            from: 'user',
            text: inputText.trim(),
            time: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const userData = await AsyncStorage.getItem('luna_user');
            if (userData) {
                const parsed = JSON.parse(userData);
                const userId = parsed.user?.id || parsed.id;
                if (userId) {
                    const response = await api.post('/v1/chat/send', {
                        user_id: userId,
                        message: userMessage.text,
                    });

                    if (response.data.success && response.data.message) {
                        // Message sent successfully
                        // Admin will respond later, show confirmation
                        const agentMessage = {
                            from: 'agent',
                            text: 'Thank you for your message. Our support team will respond shortly.',
                            time: new Date().toISOString(),
                        };
                        setTimeout(() => {
                            setMessages(prev => [...prev, agentMessage]);
                            setLoading(false);
                        }, 500);
                    } else {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.log('Error sending message:', error);
            setLoading(false);
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

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StandardHeader 
                    title="Chat Support"
                    navigation={navigation}
                    showGradient={true}
                />
                <SkeletonListScreen />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StandardHeader 
                title="Chat Support"
                navigation={navigation}
                showGradient={true}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.chatContainer}>
                {/* Step 0 - ChatBot intro + order selection */}
                {step === 0 && (
                    <>
                        <Text style={styles.botLabel}>Chat Bot</Text>
                        <View style={styles.botMessage}>
                            <Text style={{ color: C.text }}>Hello, Amanda! Welcome to Customer Care Service. Please provide more details about your issue before we start.</Text>
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
                            <Text style={{ color: C.text }}>Hello, Amanda! Welcome to Customer Care Service...</Text>
                        </View>

                        <View style={styles.selectedOrderBox}>
                            <Text style={[styles.orderTitle, { fontWeight: 'bold' }]}>Order #{selectedOrder}</Text>
                            <Text style={styles.orderSubtitle}>Standard Delivery</Text>
                            <Text style={[styles.orderStatus, { fontWeight: '600', marginTop: 4 }]}>
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
                                <Text style={{ color: msg.from === 'user' ? C.text : C.white }}>{msg.text}</Text>
                            </View>
                        ))}
                        {loading && <Text style={styles.typing}>Typing...</Text>}
                    </>
                )}
            </ScrollView>

            {/* Chat Input for Step 2 */}
            {step === 2 && (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor={C.sub}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSendMessage}
                        disabled={!inputText.trim() || loading}
                    >
                        <Icon name="send" size={20} color={C.white} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Fixed ChatBot Suggestions */}
            {step < 2 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.suggestionBtn}>
                        <Text style={styles.suggestionText}>✔️ Order Issues</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.suggestionBtn}>
                        <Text style={styles.suggestionText}>✔️ I didn't receive my parcel</Text>
                    </TouchableOpacity>
                </View>
            )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (C, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    chatContainer: { padding: 16, paddingBottom: 100 },
    botLabel: { fontWeight: 'bold', fontSize: 16, color: C.brand },
    botMessage: {
        backgroundColor: C.brandSoft,
        padding: 10,
        borderRadius: 10,
        marginVertical: 12,
    },
    selectText: { fontWeight: 'bold', marginBottom: 10, color: C.text },
    orderCard: {
        borderWidth: 1,
        borderColor: C.line,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        backgroundColor: C.card,
    },
    orderCardSelected: {
        borderColor: C.brand,
        backgroundColor: C.brandSoft,
    },
    orderTitle: { fontWeight: 'bold', color: C.text },
    orderSubtitle: { fontSize: 12, color: C.sub },
    orderStatus: { marginTop: 4, fontWeight: '600', color: C.text },
    imageRow: { flexDirection: 'row', marginTop: 8 },
    itemImage: { width: 32, height: 32, borderRadius: 6, marginRight: 6 },
    nextBtn: {
        backgroundColor: C.brand,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    nextText: { color: C.white, fontWeight: 'bold' },

    agentHeader: { alignItems: 'center', marginBottom: 10 },
    agentImage: { width: 50, height: 50, borderRadius: 25 },
    agentName: { fontWeight: 'bold', fontSize: 16, color: C.text },
    agentRole: { fontSize: 12, color: C.sub },

    agentMessage: {
        backgroundColor: C.brandSoft,
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    selectedOrderBox: {
        borderWidth: 1,
        borderColor: C.brand,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        backgroundColor: C.card,
    },
    chatBubble: {
        maxWidth: '80%',
        padding: 10,
        marginVertical: 6,
        borderRadius: 10,
    },
    userBubble: {
        backgroundColor: isDark ? C.bg : C.line,
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderColor: C.line,
    },
    agentBubble: {
        backgroundColor: C.brand,
        alignSelf: 'flex-start',
    },
    typing: {
        fontStyle: 'italic',
        color: C.sub,
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: C.card,
        borderTopWidth: 1,
        borderColor: C.line,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 8
    },
    suggestionBtn: {
        backgroundColor: C.brand,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    suggestionText: {
        color: C.white,
        fontSize: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: C.card,
        borderTopWidth: 1,
        borderTopColor: C.line,
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: C.bg,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        color: C.text,
        fontSize: 14,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.brand,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    suggestionText: {
        color: C.white,
        fontWeight: '600',
        fontSize: 13,
    }
});
