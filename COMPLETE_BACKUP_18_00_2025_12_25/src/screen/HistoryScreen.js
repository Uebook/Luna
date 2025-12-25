import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Modal, TextInput, SafeAreaView, Platform, ActivityIndicator, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const ALL = 'all';
const STATUS_FILTERS = [ALL, 'delivered', 'processing'];
const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper function to get image URL
const getImageUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  return `${IMAGE_BASE_URL}${photo}`;
};

const HistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const COLORS = {
    bg: theme.bg,
    text: theme.text,
    sub: theme.sub,
    line: theme.line,
    brand: theme.p1,
    brandSoft: theme.p4,
    chip: theme.line,
    card: theme.card,
    star: theme.warning || '#FBBF24',
  };
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const { t } = useTranslation('history');
  const isRTL = i18n.dir() === 'rtl';

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // rating modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Review submission state
  const [submittingReview, setSubmittingReview] = useState(false);

  // status filter
  const [statusFilter, setStatusFilter] = useState(ALL);

  // Load user ID
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('luna_user');
        if (userData) {
          const parsed = JSON.parse(userData);
          const user = parsed.user || parsed.data || parsed;
          const id = user.id || parsed.id;
          setUserId(id);
        } else {
          // No user data found, stop loading
          setLoadingOrders(false);
          setLoading(false);
        }
      } catch (error) {
        console.log('Error loading user ID:', error);
        // On error, stop loading
        setLoadingOrders(false);
        setLoading(false);
      }
    };
    loadUserId();
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setLoadingOrders(false);
      setLoading(false);
      return;
    }

    try {
      setLoadingOrders(true);
      // Don't set loading here - let it stay false if already false

      const response = await api.post('/order/get-my', { user_id: userId });

      if (response.data.status && response.data.data && response.data.data.data) {
        // Transform API orders to match component format
        const transformedOrders = response.data.data.data.map(order => {
          // Parse cart items - handle both array format and object format
          let cartItems = [];
          try {
            let cart = typeof order.cart === 'string' ? JSON.parse(order.cart) : (order.cart || {});

            // Handle array format: [{product_id, name, price, quantity}]
            if (Array.isArray(cart)) {
              cartItems = cart;
            }
            // Handle object format: {items: {key: {name, qty, price}}}
            else if (cart.items && typeof cart.items === 'object') {
              cartItems = Object.values(cart.items).map(item => ({
                name: item.name || 'Product',
                quantity: item.qty || item.quantity || 1,
                price: item.price || 0,
                product_id: null, // Not available in old format
              }));
            }
          } catch (e) {
            console.log('Error parsing cart:', e);
            cartItems = [];
          }

          // Get first product info for display
          const firstItem = cartItems.length > 0 ? cartItems[0] : null;

          // Build title and description from cart items
          const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

          if (cartItems.length === 0) {
            // Fallback if no items
            return {
              id: order.id,
              image: require('../assets/image1.png'),
              title: 'Order',
              description: 'No items',
              orderNumber: order.order_number || `#${order.id}`,
              dateISO: order.created_at || order.date || new Date().toISOString(),
              status: 'processing',
              rawOrder: order,
              cartItems: [],
            };
          }

          const title = cartItems.length === 1
            ? (cartItems[0]?.name || 'Order')
            : `${cartItems.length} items`;
          const description = cartItems.length === 1
            ? `Quantity: ${cartItems[0]?.quantity || 1} • Total: ${totalQuantity}`
            : cartItems.slice(0, 2).map(item => item.name || 'Product').join(', ') +
            (cartItems.length > 2 ? ` +${cartItems.length - 2} more` : '');

          // Map status from API to component format
          // API status: pending, processing, delivered, cancelled, etc.
          let status = 'processing';
          if (order.status === 'delivered' || order.status === 'completed') {
            status = 'delivered';
          } else if (order.status === 'pending' || order.status === 'processing' || order.status === 'confirmed') {
            status = 'processing';
          }

          // Get first product ID for fetching image
          const firstProductId = firstItem?.product_id;
          
          // Store product_id for image fetching - will be updated in useEffect
          return {
            id: order.id,
            image: require('../assets/image1.png'), // Placeholder - will be updated when product details are fetched
            imageUri: null, // Will be set when product details are fetched
            productId: firstProductId, // Store product_id to fetch image
            title: title,
            description: description,
            orderNumber: order.order_number || `#${order.id}`,
            dateISO: order.created_at || order.date || new Date().toISOString(),
            status: status,
            rawOrder: order, // Store raw order data for details screen
            cartItems: cartItems, // Store cart items for details
          };
        });

        setOrders(transformedOrders);
        // Stop loading immediately when data is received
        setLoadingOrders(false);
        setLoading(false);
        
        // Fetch product images for orders with product_id
        fetchProductImages(transformedOrders);
      } else {
        setOrders([]);
        setLoadingOrders(false);
        setLoading(false);
      }
    } catch (error) {
      console.log('❌ Error fetching orders:', error);
      setOrders([]);
      setLoadingOrders(false);
      setLoading(false);
    }
  }, [userId, setLoading]);

  // Load orders on mount and when screen comes into focus
  // useFocusEffect(
  //   useCallback(() => {
  //     if (userId) {
  //       fetchOrders();
  //     } else {
  //       // If no userId, ensure loading is stopped
  //       setLoadingOrders(false);
  //       setLoading(false);
  //     }
  //   }, [fetchOrders, userId])
  // );

  // Also fetch when userId becomes available
  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const filtered = useMemo(() => {
    if (statusFilter === ALL) return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [statusFilter, orders]);

  const openReview = (order) => {
    setSelectedOrder(order);
    setSelectedProduct(null);
    setRating(0);
    setComment('');
    setModalVisible(true);
  };

  const showSuccess = () => {
    setSuccessVisible(true);
    setTimeout(() => setSuccessVisible(false), 1600);
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(i18n.language || 'en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(d);
    } catch {
      return iso;
    }
  };

  // Get products from order
  const getOrderProducts = (order) => {
    let cartItems = order?.cartItems || order?.rawOrder?.cart || [];

    // Handle cart if it's a string (JSON)
    if (typeof cartItems === 'string') {
      try {
        cartItems = JSON.parse(cartItems);
      } catch (e) {
        console.log('Error parsing cart:', e);
        cartItems = [];
      }
    }

    // Handle object format cart
    if (cartItems && !Array.isArray(cartItems) && cartItems.items) {
      cartItems = Object.values(cartItems.items);
    }

    return Array.isArray(cartItems) ? cartItems : [];
  };

  // Submit review to API for selected product
  const submitReview = async () => {
    if (!selectedOrder || !selectedProduct) {
      Alert.alert('Error', 'Please select a product to review');
      return;
    }

    if (!rating || rating < 1) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    const productId = selectedProduct.product_id || selectedProduct.id;
    if (!productId) {
      Alert.alert('Error', 'Invalid product selected');
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await api.post('/screen/products/add-review', {
        user_id: userId,
        product_id: productId,
        comment: comment || '',
        rating: rating,
      });
      console.log('response submitting review:', response);
      setModalVisible(false);
      showSuccess();

      // Reset form
      setRating(0);
      setComment('');
      setSelectedProduct(null);
    } catch (error) {
      console.log('Error submitting review:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Show skeleton loader only on initial load when there are no orders yet
  if (loading && orders.length === 0 && loadingOrders) {
    return (
      <SafeAreaView style={styles.safe}>
        <StandardHeader
          title={t('title')}
          navigation={navigation}
          showGradient={true}
        />
        <SkeletonListScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Standard Header */}
      <StandardHeader
        title={t('title')}
        navigation={navigation}
        showGradient={true}
      />

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>{t('filter.status')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
          style={{ flexGrow: 0 }}
        >
          {STATUS_FILTERS.map(key => {
            const active = statusFilter === key;
            const text =
              key === ALL ? t('status.all') :
                key === 'delivered' ? t('status.delivered') :
                  t('status.processing');

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setStatusFilter(key)}
                activeOpacity={0.8}
                style={[
                  styles.chip,
                  active && { backgroundColor: COLORS.brandSoft, borderColor: COLORS.brand }
                ]}
              >
                <Text style={[styles.chipTxt, active && { color: COLORS.brand, fontWeight: '900' }]}>{text}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders list */}
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {loadingOrders ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.brand} />
            <Text style={{ marginTop: 10, color: COLORS.sub }}>Loading orders...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.sub} />
            <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.text, fontWeight: '700' }}>
              No orders found
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: COLORS.sub, textAlign: 'center' }}>
              {statusFilter === ALL
                ? "You haven't placed any orders yet."
                : `No ${statusFilter} orders found.`}
            </Text>
          </View>
        ) : (
          filtered.map((order, index) => (
            <View key={order.id} style={[styles.card, index === 0 && { marginTop: 8 }]}>
              <View style={styles.cardLeft}>
                <Image source={order.image} style={styles.productImage} />
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.title} numberOfLines={1}>{order.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{order.description}</Text>

                <View style={styles.rowBetween}>
                  <Text style={styles.orderNumber}>
                    {t('order')} <Text style={styles.bold}>{order.orderNumber}</Text>
                  </Text>
                  <Text style={styles.dateChip}>{formatDate(order.dateISO)}</Text>
                </View>

                <View style={styles.rowBetween}>
                  <Text
                    style={[
                      styles.status,
                      order.status === 'delivered' && { color: '#16A34A', fontWeight: '800' }
                    ]}
                  >
                    {t(`status.${order.status}`)}
                  </Text>

                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[styles.rightBtn, { marginRight: 8 }]}
                      onPress={() => openReview(order)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="star" size={16} color={COLORS.brand} />
                      <Text style={styles.rightBtnTxt}>{t('review')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.viewBtn}
                      onPress={() => navigation.navigate('OrderDetails', {
                        order: order.rawOrder || {
                          id: order.id,
                          order_number: order.orderNumber,
                          created_at: order.dateISO,
                          status: order.status,
                        }
                      })}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="open-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.viewBtnTxt}>{t('view')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>{t('leaveReview')}</Text>

            {selectedOrder && (() => {
              const products = getOrderProducts(selectedOrder);

              return (
                <View style={styles.modalBody}>
                  <Text style={styles.selectProductLabel}>Select Product to Review</Text>
                  <ScrollView style={styles.productList} showsVerticalScrollIndicator={false}>
                    {products.map((product, index) => {
                      const productId = product.product_id || product.id;
                      const selectedId = selectedProduct?.product_id || selectedProduct?.id;
                      const isSelected = selectedProduct !== null && selectedId !== undefined && selectedId === productId;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[styles.productItem, isSelected && styles.productItemSelected]}
                          onPress={() => {
                            setSelectedProduct(product);
                            setRating(0);
                            setComment('');
                          }}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={
                              product.image
                                ? (typeof product.image === 'string' && product.image.startsWith('http')
                                  ? { uri: product.image }
                                  : product.image)
                                : require('../assets/image1.png')
                            }
                            style={styles.productItemImage}
                          />
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.productItemName} numberOfLines={2}>
                              {product.name || 'Product'}
                            </Text>
                            <Text style={styles.productItemQty}>
                              Quantity: {product.quantity || product.qty || 1}
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.brand} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {selectedProduct && (
                    <>
                      <Text style={styles.rateLabel}>{t('yourRating')}</Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <TouchableOpacity key={num} onPress={() => setRating(num)} style={{ paddingHorizontal: 4 }}>
                            <Ionicons name={rating >= num ? 'star' : 'star-outline'} size={32} color={COLORS.star} />
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={styles.commentLabel}>{t('comment')}</Text>
                      <TextInput
                        placeholder={t('commentPlaceholder')}
                        placeholderTextColor="#9CA3AF"
                        style={styles.commentInput}
                        multiline
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                      />

                      <TouchableOpacity
                        style={[styles.submitButton, submittingReview && { opacity: 0.6 }]}
                        activeOpacity={0.9}
                        onPress={submitReview}
                        disabled={submittingReview || !rating}
                      >
                        {submittingReview ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.submitText}>{t('submit')}</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  {!selectedProduct && products.length > 0 && (
                    <Text style={styles.selectHint}>Please select a product above to leave a review</Text>
                  )}
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Success Popup */}
      <Modal transparent visible={successVisible} animationType="fade">
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            <View style={styles.badgeWrap}>
              <View style={styles.badge}>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </View>
            </View>

            <Text style={styles.doneTitle}>{t('done')}</Text>
            <Text style={styles.doneSub}>{t('thanks')}</Text>

            <View style={styles.doneStars}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Ionicons key={i} name="star" size={24} color={COLORS.star} style={{ marginHorizontal: 2 }} />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HistoryScreen;

/* -------------------- Styles -------------------- */
const createStyles = (COLORS) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.line, justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: COLORS.text },

  filterRow: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2 },
  filterLabel: { color: COLORS.sub, fontWeight: '800', marginBottom: 6 },

  chip: {
    marginRight: 8,
    backgroundColor: COLORS.chip,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  chipTxt: { color: COLORS.text, fontWeight: '700', fontSize: 12.5 },

  scrollBody: { paddingHorizontal: 16, paddingBottom: 24 },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line,
    padding: 12, marginTop: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
  },
  cardLeft: { marginRight: 12 },
  productImage: { width: 84, height: 84, borderRadius: 12 },
  cardRight: { flex: 1, justifyContent: 'space-between' },
  title: { fontSize: 15, color: COLORS.text, fontWeight: '800' },
  description: { fontSize: 13.5, color: COLORS.sub, marginTop: 2 },

  rowBetween: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderNumber: { fontSize: 13, color: COLORS.sub },
  bold: { fontWeight: '800', color: COLORS.text },
  dateChip: { backgroundColor: COLORS.chip, color: COLORS.text, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12, overflow: 'hidden' },
  status: { fontSize: 13, color: COLORS.sub },

  rightBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.brandSoft, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
  },
  rightBtnTxt: { color: COLORS.brand, fontWeight: '800', marginLeft: 6, fontSize: 12.5 },

  viewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.brand, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  viewBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 12.5 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } },
      android: { elevation: 8 },
    }),
  },
  sheetHeader: { alignItems: 'center', paddingTop: 10, paddingHorizontal: 16, paddingBottom: 4 },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB', marginBottom: 8 },
  closeBtn: { position: 'absolute', right: 12, top: 8, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginTop: 4 },
  modalBody: { paddingHorizontal: 16, paddingTop: 10 },
  selectProductLabel: { fontSize: 14, color: COLORS.text, fontWeight: '800', marginBottom: 12 },
  productList: { maxHeight: 200, marginBottom: 16 },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 8,
  },
  productItemSelected: {
    borderColor: COLORS.brand,
    borderWidth: 2,
    backgroundColor: COLORS.brandSoft,
  },
  productItemImage: { width: 60, height: 60, borderRadius: 8 },
  productItemName: { fontSize: 14, color: COLORS.text, fontWeight: '800' },
  productItemQty: { fontSize: 12, color: COLORS.sub, marginTop: 4 },
  selectHint: { textAlign: 'center', color: COLORS.sub, fontSize: 13, fontStyle: 'italic', marginTop: 20 },
  rateLabel: { marginTop: 16, fontSize: 13, color: COLORS.sub, fontWeight: '700' },
  starsRow: { flexDirection: 'row', marginTop: 8, marginBottom: 8 },
  commentLabel: { marginTop: 10, fontSize: 13, color: COLORS.sub, fontWeight: '700' },
  commentInput: {
    backgroundColor: COLORS.brandSoft, borderRadius: 12, padding: 12, fontSize: 14, height: 96,
    textAlignVertical: 'top', borderWidth: 1, borderColor: '#E0E7FF', color: COLORS.text,
  },


  submitButton: { marginTop: 14, backgroundColor: COLORS.brand, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '900' },

  successBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  successCard: {
    width: '78%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 16, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 6 },
    }),
  },
  badgeWrap: { position: 'absolute', top: -22, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
  doneTitle: { marginTop: 18, fontSize: 18, fontWeight: '900', color: COLORS.text },
  doneSub: { marginTop: 4, color: COLORS.sub, fontWeight: '700' },
  doneStars: { flexDirection: 'row', marginTop: 10, marginBottom: 4 },
});
