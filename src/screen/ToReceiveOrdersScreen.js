// src/screens/ToReceiveOrdersScreen.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal, SafeAreaView,
  Platform, Dimensions, TextInput, PermissionsAndroid, Linking, I18nManager, ScrollView,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { orderAPI, homeAPI, getUserId } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width: W } = Dimensions.get('window');

const MAX_REVIEW_PHOTOS = 6;

const courierTrackUrl = (carrier, id) => {
  const c = String(carrier || '').toLowerCase();
  if (!id) return null;
  if (c === 'dhl') return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?tracking-id=${encodeURIComponent(id)}`;
  if (c === 'ups') return `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(id)}`;
  if (c === 'fedex') return `https://www.fedex.com/fedextrack/?tracknumbers=${encodeURIComponent(id)}`;
  if (c === 'usps') return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(id)}`;
  return `https://google.com/search?q=${encodeURIComponent(`${carrier} ${id} tracking`)}`;
};

const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper function to get image URL
const getImageUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  return `${IMAGE_BASE_URL}${photo}`;
};

const ImageCollage = ({ uris, COLORS }) => {
  const n = Math.min(uris.length, 4);
  const S = 76, G = 4, HALF = (S - G) / 2;

  if (n <= 0) return <View style={{ width: S, height: S, borderRadius: 12, backgroundColor: COLORS?.chip || '#E8E6F6' }} />;
  if (n === 1) return <Image source={{ uri: uris[0] }} style={{ width: S, height: S, borderRadius: 12 }} />;
  if (n === 2) {
    return (
      <View style={{ width: S, height: S, flexDirection: 'row' }}>
        {[0, 1].map(i => (
          <Image key={i} source={{ uri: uris[i] }} style={{ width: HALF, height: S, borderRadius: 12, marginRight: i === 0 ? G : 0 }} />
        ))}
      </View>
    );
  }
  if (n === 3) {
    return (
      <View style={{ width: S, height: S }}>
        <View style={{ flexDirection: 'row', marginBottom: G }}>
          <Image source={{ uri: uris[0] }} style={{ width: HALF, height: HALF, borderRadius: 12, marginRight: G }} />
          <Image source={{ uri: uris[1] }} style={{ width: HALF, height: HALF, borderRadius: 12 }} />
        </View>
        <Image source={{ uri: uris[2] }} style={{ width: S, height: HALF, borderRadius: 12 }} />
      </View>
    );
  }
  return (
    <View style={{ width: S, height: S, flexWrap: 'wrap', flexDirection: 'row' }}>
      {[0, 1, 2, 3].map(i => (
        <Image
          key={i}
          source={{ uri: uris[i] }}
          style={{ width: HALF, height: HALF, borderRadius: 12, marginRight: i % 2 === 0 ? G : 0, marginBottom: i < 2 ? G : 0 }}
        />
      ))}
    </View>
  );
};

const Badge = ({ children, styles }) => (
  <View style={styles.badge}><Text style={styles.badgeTxt}>{children}</Text></View>
);

// ⬇️ moved inside file so we can use t()
const StatusPill = ({ status, t, styles, COLORS }) => {
  const key = String(status || '').toLowerCase(); // 'packed' | 'shipped' | 'delivered'
  const delivered = key === 'delivered';
  return (
    <View style={styles.statusRow}>
      <Text style={[styles.status, delivered && { color: COLORS.text }]}>
        {t(`status:${key}`, status)}
      </Text>
      {delivered && (
        <View style={styles.checkDot}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </View>
  );
};

export default function ToReceiveOrdersScreen({ navigation }) {
  const { theme } = useTheme();
  const COLORS = {
    bg: theme.bg,
    text: theme.text,
    sub: theme.sub,
    line: theme.line,
    brand: theme.p1,
    brandBtn: theme.p2,
    brandSoft: theme.p4,
    chip: theme.line,
    card: theme.card,
    success: theme.success,
    star: theme.warning || '#f59e0b',
  };
  const styles = useMemo(() => createStyles(COLORS), [COLORS]);
  const { t } = useTranslation(['toReceive', 'status']);
  const isRTL = i18n.dir() === 'rtl';

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]); // {uri}
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load user ID
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
      } catch (error) {
        console.log('Error loading user ID:', error);
      }
    };
    loadUserId();
  }, []);

  // Transform API order to component format
  const transformOrder = useCallback((order) => {
    // Parse cart items
    let cartItems = [];
    try {
      let cart = typeof order.cart === 'string' ? JSON.parse(order.cart) : (order.cart || {});

      // Handle array format
      if (Array.isArray(cart)) {
        cartItems = cart;
      }
      // Handle object format
      else if (cart.items && typeof cart.items === 'object') {
        cartItems = Object.values(cart.items);
      }
    } catch (e) {
      console.log('Error parsing cart:', e);
      cartItems = [];
    }

    // Get product images
    const items = cartItems.map((item, idx) => {
      const productData = item.item || item;
      const imageUrl = productData.photo || productData.image || productData.thumbnail;
      return {
        thumb: imageUrl ? getImageUrl(imageUrl) : null,
        title: productData.name || 'Product',
        product_id: productData.id || productData.product_id,
      };
    });

    // Map status
    const statusMap = {
      'pending': 'Packed',
      'processing': 'Packed',
      'confirmed': 'Packed',
      'packed': 'Packed',
      'shipped': 'Shipped',
      'out_for_delivery': 'Shipped',
      'delivered': 'Delivered',
      'completed': 'Delivered',
    };
    const status = statusMap[order.status?.toLowerCase()] || 'Packed';

    // Calculate ETA (if available)
    const placedDate = order.created_at ? new Date(order.created_at) : new Date();
    const now = new Date();
    const diffMins = Math.floor((now - placedDate) / (1000 * 60));

    return {
      id: order.id,
      orderNo: order.order_number || `#${order.id}`,
      items: items,
      status: status,
      placedAtISO: order.created_at || new Date().toISOString(),
      deliveredAtISO: order.status === 'delivered' || order.status === 'completed' ? (order.updated_at || order.created_at) : null,
      etaMins: status === 'Shipped' ? 120 : status === 'Packed' ? 180 : null,
      carrier: order.shipping?.title || order.shipping_title || 'Standard',
      trackingId: order.transaction_id || order.txnid || order.tracking_code || null,
      rawOrder: order, // Store raw order for details
    };
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (!userId) {
      setLoadingOrders(false);
      return;
    }

    try {
      if (!isRefresh) {
        setLoadingOrders(true);
      }
      setError(null);

      const response = await orderAPI.getMyOrders(userId);

      if (response.data?.status && response.data?.data?.data) {
        // Filter orders that are not delivered/completed (to receive orders)
        const toReceiveOrders = response.data.data.data.filter(order => {
          const status = order.status?.toLowerCase();
          return status !== 'delivered' && status !== 'completed' && status !== 'cancelled';
        });

        // Transform orders
        const transformedOrders = toReceiveOrders.map(transformOrder);
        setOrders(transformedOrders);
        setError(null);
      } else {
        setOrders([]);
        setError('No orders found');
      }
    } catch (error) {
      console.log('❌ Error fetching orders:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load orders';
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [userId, transformOrder]);

  // Fetch orders when userId is available
  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId, fetchOrders]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchOrders();
      }
    }, [userId, fetchOrders])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders(true);
  }, [fetchOrders]);

  const openSelectModal = (order) => {
    setSelectedOrder(order);
    setSelectOpen(true);
  };

  const openReviewModal = (idx) => {
    setSelectedItemIndex(idx);
    setRating(0);
    setComment('');
    setReviewPhotos([]);
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!selectedOrder || selectedItemIndex == null) {
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

    const product = selectedOrder.items[selectedItemIndex];
    const productId = product?.product_id;
    if (!productId) {
      Alert.alert('Error', 'Invalid product selected');
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await homeAPI.addReview({
        user_id: userId,
        product_id: productId,
        comment: comment || '',
        rating: rating,
      });

      if (response.data?.status) {
        Alert.alert('Success', 'Review submitted successfully!');
        setReviewOpen(false);
        setSelectOpen(false);
        setRating(0);
        setComment('');
        setReviewPhotos([]);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.log('Error submitting review:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const orderItems = useMemo(
    () => (selectedOrder ? selectedOrder.items.map((it, i) => ({ ...it, idx: i })) : []),
    [selectedOrder]
  );

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(i18n.language || 'en', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      }).format(d);
    } catch { return iso; }
  };

  const openTracking = (order) => {
    const url = courierTrackUrl(order?.carrier, order?.trackingId);
    if (url) Linking.openURL(url).catch(() => { });
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const res = await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    } catch { return false; }
  };

  const pickPhotos = async () => {
    const ok = await requestGalleryPermission();
    if (!ok) return;
    try {
      const left = MAX_REVIEW_PHOTOS - reviewPhotos.length;
      if (left <= 0) return;
      const imgs = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        maxFiles: left,
        compressImageQuality: 0.85,
      });
      const selected = Array.isArray(imgs) ? imgs : [imgs];
      setReviewPhotos(prev => [
        ...prev,
        ...selected.map(x => ({ uri: x.path || x.sourceURL || x.uri }))
      ].slice(0, MAX_REVIEW_PHOTOS));
    } catch { }
  };

  const takePhoto = async () => {
    try {
      const img = await ImagePicker.openCamera({
        mediaType: 'photo',
        compressImageQuality: 0.85,
      });
      if (img?.path) {
        setReviewPhotos(prev => [...prev, { uri: img.path }].slice(0, MAX_REVIEW_PHOTOS));
      }
    } catch { }
  };

  const removePhoto = (idx) => {
    setReviewPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('toReceive:title')}</Text>
        <View style={{ width: 40, height: 40 }} />
      </View>

      {/* Orders */}
      {loadingOrders && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <ActivityIndicator size="large" color={COLORS.brand} />
          <Text style={{ marginTop: 12, color: COLORS.sub }}>Loading orders...</Text>
        </View>
      ) : error && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.sub} />
          <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.text, fontWeight: '700' }}>
            Error loading orders
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: COLORS.sub, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { marginTop: 16 }]}
            onPress={() => fetchOrders()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="cube-outline" size={64} color={COLORS.sub} />
          <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.text, fontWeight: '700' }}>
            No orders to receive
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: COLORS.sub, textAlign: 'center' }}>
            All your orders have been delivered or you haven't placed any orders yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.brand]}
              tintColor={COLORS.brand}
            />
          }
          renderItem={({ item }) => {
          const images = item.items.map(it => it.thumb || '').filter(Boolean);
          const delivered = String(item.status).toLowerCase() === 'delivered';
          const infoLine = delivered
            ? t('toReceive:deliveredAt', { date: formatDateTime(item.deliveredAtISO) })
            : item.etaMins && item.etaMins < 180
              ? t('toReceive:etaMinutes', { mins: item.etaMins })
              : t('toReceive:placed', { date: formatDateTime(item.placedAtISO) });

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrderDetails', { 
                order: {
                  ...(item.rawOrder || {}),
                  id: item.id,
                  order_number: item.orderNo,
                  number: item.orderNo,
                  created_at: item.placedAtISO,
                  status: item.status,
                }
              })}
              style={styles.card}
            >
              <ImageCollage uris={images} COLORS={COLORS} />
              <View style={styles.info}>
                <Text style={styles.orderLine}>
                  {t('toReceive:order')} <Text style={styles.orderBold}>{item.orderNo}</Text>
                </Text>
                <Text style={styles.sub}>{infoLine}</Text>
                <StatusPill status={item.status} t={t} styles={styles} COLORS={COLORS} />
              </View>
              <View style={styles.right}>
                <Badge styles={styles}>{t('toReceive:itemsCount', { count: item.items.length })}</Badge>

                {delivered ? (
                  <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => openSelectModal(item)}>
                    <Text style={[styles.btnTxt, { color: COLORS.brandBtn }]}>{t('toReceive:review')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.btn, styles.btnSolid]} onPress={() => openTracking(item)}>
                    <Text style={[styles.btnTxt, { color: '#fff' }]}>{t('toReceive:track')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        />
      )}

      {/* Select item */}
      <Modal transparent animationType="slide" visible={selectOpen} onRequestClose={() => setSelectOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectOpen(false)}>
              <Ionicons name="close" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('toReceive:selectItemTitle')}</Text>

            {orderItems.map((it) => (
              <View key={it.idx} style={styles.modalRow}>
                <Image source={{ uri: it.thumb }} style={styles.modalImg} />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={styles.modalDesc} numberOfLines={2}>{it.title}</Text>
                  <Text style={styles.modalOrder}>
                    {t('toReceive:order')} <Text style={styles.orderBold}>{selectedOrder?.orderNo}</Text>
                  </Text>
                  <View style={styles.dateChip}>
                    <Text style={styles.dateTxt}>
                      {t('toReceive:placed', { date: formatDateTime(selectedOrder?.placedAtISO) })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.smallBtn, styles.smallBtnOutline]} onPress={() => openReviewModal(it.idx)}>
                  <Text style={[styles.smallBtnTxt, { color: COLORS.brandBtn }]}>{t('toReceive:review')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* Review form */}
      <Modal transparent animationType="slide" visible={reviewOpen} onRequestClose={() => setReviewOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setReviewOpen(false)}>
              <Ionicons name="close" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t('toReceive:leaveReview')}</Text>

            {!!selectedOrder && selectedItemIndex != null && (
              <>
                <View style={[styles.modalRow, { borderWidth: 0, paddingHorizontal: 0 }]}>
                  <Image source={{ uri: selectedOrder.items[selectedItemIndex].thumb }} style={styles.modalImg} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.modalDesc} numberOfLines={2}>{t('toReceive:selectedItem')}</Text>
                    <Text style={styles.modalOrder}>
                      {t('toReceive:order')} <Text style={styles.orderBold}>{selectedOrder.orderNo}</Text>
                    </Text>
                  </View>
                </View>

                <Text style={styles.rateLabel}>{t('toReceive:yourRating')}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity key={n} onPress={() => setRating(n)} style={{ paddingHorizontal: 2 }}>
                      <Ionicons name={rating >= n ? 'star' : 'star-outline'} size={30} color={COLORS.star} />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.commentLabel}>{t('toReceive:comment')}</Text>
                <TextInput
                  placeholder={t('toReceive:commentPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  style={styles.commentInput}
                  multiline
                  value={comment}
                  onChangeText={setComment}
                />

                {/* Photos */}
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.commentLabel, { marginBottom: 8 }]}>{t('toReceive:addPhotos')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity style={styles.addPhotoTile} onPress={pickPhotos} activeOpacity={0.85}>
                      <Ionicons name="images-outline" size={20} color={COLORS.brandBtn} />
                      <Text style={styles.addPhotoTxt}>{t('toReceive:addPhotos')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addPhotoTile} onPress={takePhoto} activeOpacity={0.85}>
                      <Ionicons name="camera-outline" size={20} />
                      <Text style={styles.addPhotoTxt}>{t('toReceive:takePhoto')}</Text>
                    </TouchableOpacity>

                    {reviewPhotos.map((p, i) => (
                      <View key={`${p.uri}-${i}`} style={styles.photoWrap}>
                        <Image source={{ uri: p.uri }} style={styles.photo} />
                        <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(i)}>
                          <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  <Text style={{ color: COLORS.sub, fontSize: 12, marginTop: 4 }}>
                    {t('toReceive:limitHint', { max: MAX_REVIEW_PHOTOS })}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.btn, styles.btnSolid, { marginTop: 12 }, submittingReview && { opacity: 0.6 }]} 
                  onPress={submitReview} 
                  activeOpacity={0.9}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.btnTxt, { color: '#fff' }]}>{t('toReceive:submit')}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* -------------------- styles -------------------- */
const createStyles = (COLORS) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.line, justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.chip,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: COLORS.text },

  card: {
    backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.line,
    padding: 10, flexDirection: 'row', alignItems: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, android: { elevation: 2 } }),
  },

  info: { flex: 1, marginLeft: 10 },
  orderLine: { fontSize: 13, color: COLORS.sub },
  orderBold: { fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.sub, marginTop: 2 },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  status: { fontSize: 15, fontWeight: '900', color: COLORS.brandBtn },
  checkDot: {
    marginLeft: 8, width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.success,
  },

  right: { alignItems: 'flex-end', height: 76, justifyContent: 'space-between' },

  badge: { backgroundColor: COLORS.chip, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt: { fontSize: 12, fontWeight: '700', color: COLORS.text },

  btn: { height: 34, minWidth: 92, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnSolid: { backgroundColor: COLORS.brandBtn },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.brandBtn, backgroundColor: '#fff' },
  btnTxt: { fontWeight: '800', fontSize: 13 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, maxHeight: W * 1.5,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } }, android: { elevation: 10 } }),
  },
  closeBtn: {
    position: 'absolute', right: 10, top: 8, zIndex: 2, width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.chip, alignItems: 'center', justifyContent: 'center',
  },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB', marginTop: 6, marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text, marginBottom: 6 },

  modalRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.line, borderRadius: 12,
    padding: 8, marginTop: 10,
  },
  modalImg: { width: 60, height: 60, borderRadius: 10 },
  modalDesc: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  modalOrder: { fontSize: 12, color: COLORS.sub, marginTop: 2 },

  dateChip: { alignSelf: 'flex-start', backgroundColor: COLORS.chip, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  dateTxt: { fontSize: 11, color: COLORS.sub, fontWeight: '700' },

  smallBtn: { height: 32, minWidth: 80, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  smallBtnOutline: { borderWidth: 1.5, borderColor: COLORS.brandBtn, backgroundColor: '#fff' },
  smallBtnTxt: { fontSize: 12.5, fontWeight: '800' },

  rateLabel: { marginTop: 8, fontSize: 12.5, color: COLORS.sub, fontWeight: '700' },
  starsRow: { flexDirection: 'row', marginTop: 6, marginBottom: 6 },
  commentLabel: { marginTop: 6, fontSize: 12.5, color: COLORS.sub, fontWeight: '700' },
  commentInput: {
    backgroundColor: COLORS.brandSoft, borderRadius: 12, padding: 10, fontSize: 14, height: 90,
    textAlignVertical: 'top', borderWidth: 1, borderColor: '#E0E7FF', color: COLORS.text,
  },

  addPhotoTile: {
    width: 110, height: 86, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
    backgroundColor: '#fff', marginRight: 10, alignItems: 'center', justifyContent: 'center'
  },
  addPhotoTxt: { marginTop: 4, fontSize: 11.5, fontWeight: '700', color: COLORS.sub },

  photoWrap: { width: 110, height: 86, borderRadius: 12, overflow: 'hidden', marginRight: 10 },
  photo: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center'
  },

  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.brand,
    borderRadius: 12,
    marginTop: 16,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
