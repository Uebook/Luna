// src/screens/ToReceiveOrdersScreen.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal, SafeAreaView,
  Platform, Dimensions, TextInput, PermissionsAndroid, Linking, I18nManager, ScrollView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper function to get image URL
const getImageUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  return `${IMAGE_BASE_URL}${photo}`;
};

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

const P = (id) => `https://images.unsplash.com/photo-${id}?w=300&q=80&auto=format&fit=crop`;

const ORDERS = [
  {
    id: 'TR-1001',
    orderNo: '#92287157',
    items: [
      { thumb: P('1550547660-d9450f859349'), title: 'Classic Burger' },
      { thumb: P('1544025162-d76694265947'), title: 'Chicken Wrap' },
      { thumb: P('1525351484163-7529414344d8'), title: 'French Fries' }
    ],
    status: 'Packed',
    placedAtISO: '2025-04-06T12:10:00Z',
    etaMins: 120,
    carrier: 'dhl',
    trackingId: 'JD0146000030001'
  },
  {
    id: 'TR-1002',
    orderNo: '#92287158',
    items: [
      { thumb: P('1576866209830-5f5b4a5c0d0e'), title: 'Vegan Bowl' },
      { thumb: P('1526312426976-593c1208e02d'), title: 'Green Smoothie' },
      { thumb: P('1514516870926-2059898ee1ad'), title: 'Protein Cookie' },
      { thumb: P('1543770548-42970e19becc'), title: 'Granola Bar' }
    ],
    status: 'Shipped',
    placedAtISO: '2025-04-08T09:32:00Z',
    etaMins: 60,
    carrier: 'ups',
    trackingId: '1Z999AA10123456784'
  },
  {
    id: 'TR-1003',
    orderNo: '#92287159',
    items: [
      { thumb: P('1546069901-ba9599a7e63c'), title: 'Margherita Pizza' },
      { thumb: P('1541592106381-b31e9677c0e5'), title: 'Garlic Bread' }
    ],
    status: 'Delivered',
    placedAtISO: '2025-04-10T11:05:00Z',
    deliveredAtISO: '2025-04-10T13:05:00Z',
    carrier: 'fedex',
    trackingId: '449044304137821'
  },
  {
    id: 'TR-1004',
    orderNo: '#92287160',
    items: [
      { thumb: P('1540189549336-e6e99c3679fe'), title: 'Sushi Platter' }
    ],
    status: 'Delivered',
    placedAtISO: '2025-04-12T18:12:00Z',
    deliveredAtISO: '2025-04-12T19:02:00Z',
    carrier: 'usps',
    trackingId: '9400111202555841234567'
  }
];

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

const Badge = ({ children, styles }) => {
  if (!styles) return <View><Text>{children}</Text></View>;
  return (
    <View style={styles.badge}><Text style={styles.badgeTxt}>{children}</Text></View>
  );
};

// ⬇️ moved inside file so we can use t()
const StatusPill = ({ status, t, styles, COLORS }) => {
  if (!styles || !COLORS) {
    console.warn('StatusPill: styles or COLORS prop missing');
    return <View><Text>{status}</Text></View>;
  }
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
  const { theme, isDark } = useTheme();
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
  const styles = useMemo(() => createStyles(COLORS, isDark), [COLORS, isDark]);
  const { t } = useTranslation(['toReceive', 'status']);
  const isRTL = i18n.dir() === 'rtl';

  const [loading, setLoading] = useSkeletonLoader(true, 600);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [setLoading]);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState([]); // {uri}

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

  const submitReview = () => {
    // send {orderId, itemIndex, rating, comment, photos: reviewPhotos}
    setReviewOpen(false);
    setSelectOpen(false);
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

    if (loading) {
      return (
        <SafeAreaView style={styles.safe}>
          <StandardHeader 
            title={t('toReceive:title')}
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
          title={t('toReceive:title')}
          navigation={navigation}
          showGradient={true}
        />

      {/* Orders */}
      <FlatList
        data={ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const images = item.items.map(it => it.thumb);
          const delivered = String(item.status).toLowerCase() === 'delivered';
          const infoLine = delivered
            ? t('toReceive:deliveredAt', { date: formatDateTime(item.deliveredAtISO) })
            : item.etaMins && item.etaMins < 180
              ? t('toReceive:etaMinutes', { mins: item.etaMins })
              : t('toReceive:placed', { date: formatDateTime(item.placedAtISO) });

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrderDetails', { order: item })}
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
                  placeholderTextColor={COLORS.sub}
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

                <TouchableOpacity style={[styles.btn, styles.btnSolid, { marginTop: 12 }]} onPress={submitReview} activeOpacity={0.9}>
                  <Text style={[styles.btnTxt, { color: '#fff' }]}>{t('toReceive:submit')}</Text>
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
const createStyles = (COLORS, isDark) => StyleSheet.create({
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
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.brandBtn, backgroundColor: COLORS.card },
  btnTxt: { fontWeight: '800', fontSize: 13 },

  backdrop: { flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, maxHeight: W * 1.5,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } }, android: { elevation: 10 } }),
  },
  closeBtn: {
    position: 'absolute', right: 10, top: 8, zIndex: 2, width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.chip, alignItems: 'center', justifyContent: 'center',
  },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.line, marginTop: 6, marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text, marginBottom: 6 },

  modalRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.line, borderRadius: 12,
    padding: 8, marginTop: 10, backgroundColor: COLORS.card,
  },
  modalImg: { width: 60, height: 60, borderRadius: 10 },
  modalDesc: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  modalOrder: { fontSize: 12, color: COLORS.sub, marginTop: 2 },

  dateChip: { alignSelf: 'flex-start', backgroundColor: COLORS.chip, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  dateTxt: { fontSize: 11, color: COLORS.sub, fontWeight: '700' },

  smallBtn: { height: 32, minWidth: 80, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  smallBtnOutline: { borderWidth: 1.5, borderColor: COLORS.brandBtn, backgroundColor: COLORS.card },
  smallBtnTxt: { fontSize: 12.5, fontWeight: '800' },

  rateLabel: { marginTop: 8, fontSize: 12.5, color: COLORS.sub, fontWeight: '700' },
  starsRow: { flexDirection: 'row', marginTop: 6, marginBottom: 6 },
  commentLabel: { marginTop: 6, fontSize: 12.5, color: COLORS.sub, fontWeight: '700' },
  commentInput: {
    backgroundColor: COLORS.brandSoft, borderRadius: 12, padding: 10, fontSize: 14, height: 90,
    textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.line, color: COLORS.text,
  },

  addPhotoTile: {
    width: 110, height: 86, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
    backgroundColor: COLORS.card, marginRight: 10, alignItems: 'center', justifyContent: 'center'
  },
  addPhotoTxt: { marginTop: 4, fontSize: 11.5, fontWeight: '700', color: COLORS.sub },

  photoWrap: { width: 110, height: 86, borderRadius: 12, overflow: 'hidden', marginRight: 10 },
  photo: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center'
  },
});
