// src/screen/ProductChatBotScreen.js
// Product-specific chatbot screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import useUserStore from '../store/UserStore';
import i18n from '../i18n';
import { productChatbotAPI, getUserId } from '../services/api';

const ProductChatBotScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const user = useUserStore(state => state.user);
  const [product, setProduct] = useState(route?.params?.product || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const currentLang = i18n.language || 'en';

  // Initialize with product selection message
  useEffect(() => {
    if (product && messages.length === 0) {
      const welcomeMsg = {
        id: 'welcome',
        type: 'bot',
        text: currentLang === 'ar' 
          ? `مرحباً! أنا هنا لمساعدتك بخصوص ${product.name || 'هذا المنتج'}. كيف يمكنني مساعدتك؟`
          : `Hi! I'm here to help you with ${product.name || 'this product'}. How can I assist you?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMsg]);
      
      // Load chat history
      loadChatHistory();
    }
  }, [product, currentLang]);

  // Load chat history
  const loadChatHistory = async () => {
    if (!user?.id || !product?.id) return;

    try {
      const response = await productChatbotAPI.getChatHistory(user.id, product.id);
      if (response.data.status && response.data.messages?.length > 0) {
        const historyMessages = response.data.messages.map(msg => ({
          id: msg.id.toString(),
          type: msg.answer ? 'bot' : 'user',
          text: msg.answer || msg.question,
          pending: msg.status === 'pending',
          timestamp: msg.created_at
        }));
        setMessages(prev => {
          const welcome = prev.find(m => m.id === 'welcome');
          return welcome ? [welcome, ...historyMessages] : historyMessages;
        });
      }
    } catch (error) {
      console.log('Error loading chat history:', error);
    }
  };

  // Poll for new answers
  useEffect(() => {
    if (!product || !user?.id) return;

    const pendingMessages = messages.filter(m => m.pending);
    if (pendingMessages.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const lastMessage = messages[messages.length - 1];
        const lastMessageId = lastMessage?.queryId || lastMessage?.id;
        const response = await productChatbotAPI.checkUpdates(
          user.id,
          product.id,
          lastMessageId
        );

        if (response.data.status && response.data.new_answers?.length > 0) {
          setMessages(prev => prev.map(msg => {
            const newAnswer = response.data.new_answers.find(
              a => a.query_id.toString() === msg.queryId
            );
            if (newAnswer && msg.pending) {
              return {
                ...msg,
                text: newAnswer.answer,
                pending: false
              };
            }
            return msg;
          }));
        }
      } catch (error) {
        console.log('Error checking updates:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [messages, product, user]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !product || sending || !user?.id) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
      timestamp: new Date().toISOString(),
      queryId: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSending(true);
    setLoading(true);

    try {
      const response = await productChatbotAPI.productQuery(
        user.id,
        product.id,
        text
      );

      if (response.data.status) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: response.data.answer || response.data.message,
          isAutoAnswer: response.data.is_auto_answer || false,
          pending: !response.data.is_auto_answer,
          queryId: response.data.query_id,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: currentLang === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.type === 'user' ? styles.userText : styles.botText
      ]}>
        {item.text}
      </Text>
      {item.pending && (
        <Text style={styles.pendingText}>
          {currentLang === 'ar' ? '⏳ قيد الانتظار' : '⏳ Pending'}
        </Text>
      )}
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StandardHeader title="Select Product" navigation={navigation} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {currentLang === 'ar' ? 'يرجى اختيار منتج أولاً' : 'Please select a product first'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const productImage = product.photo || product.image || 'https://via.placeholder.com/300';
  const productName = product.name || 'Product';
  const productPrice = product.price || product.price_formatted || 'N/A';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StandardHeader 
        title={currentLang === 'ar' ? 'دعم المنتج' : 'Product Support'} 
        navigation={navigation}
        showGradient={true}
      />
      
      {/* Product Info Header */}
      <View style={[styles.productHeader, { backgroundColor: theme.card, borderBottomColor: theme.line }]}>
        <Image 
          source={{ uri: productImage }} 
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
            {productName}
          </Text>
          <Text style={[styles.productPrice, { color: theme.sub }]}>
            {productPrice}
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.p1} />
          <Text style={[styles.loadingText, { color: theme.sub }]}>
            {currentLang === 'ar' ? 'جاري البحث عن إجابة...' : 'Searching for answer...'}
          </Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.line }]}>
          <TextInput
            style={[styles.input, { 
              borderColor: theme.line, 
              color: theme.text,
              backgroundColor: theme.bg
            }]}
            placeholder={currentLang === 'ar' ? 'اكتب سؤالك...' : 'Type your question...'}
            placeholderTextColor={theme.sub}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { backgroundColor: theme.p1 },
              (sending || !inputText.trim()) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={sending || !inputText.trim()}
          >
            <Text style={styles.sendButtonText}>
              {currentLang === 'ar' ? 'إرسال' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  productHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1
  },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  productPrice: { fontSize: 14 },
  messagesList: { padding: 16, paddingBottom: 20 },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#0F1020' },
  pendingText: { fontSize: 12, color: '#6b7280', marginTop: 4, fontStyle: 'italic' },
  timestamp: { fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 4 },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  loadingText: { marginLeft: 8, fontSize: 12 },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280' }
});

export default ProductChatBotScreen;




