// src/screens/AllCategoriesScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Dimensions,
  I18nManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { SkeletonCategoryScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

// === Pull the same product sources you use on Home ===
import enProductsDefault, { products as enProductsNamed } from '../store/producten';
import arProductsDefault from '../store/productar';

const { width } = Dimensions.get('window');

// Fallbacks in case producten.js exports named or default
const EN_PRODUCTS = Array.isArray(enProductsNamed)
  ? enProductsNamed
  : Array.isArray(enProductsDefault)
    ? enProductsDefault
    : [];
const AR_PRODUCTS = Array.isArray(arProductsDefault) ? arProductsDefault : [];

// Helper: safely pick the category-ish field from a product
const getCategoryFromProduct = (p) => {
  return (
    p?.category ||
    p?.type ||
    p?.detail?.category ||
    p?.attributes?.category ||
    'Other'
  );
};

// Helper: get a title string for UI
const titleCase = (s) =>
  (s || '')
    .toString()
    .replace(/[_-]/g, ' ')
    .replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase());

// Derive a display image for the category (first product thumb/gallery)
const getThumb = (p) => {
  if (!p) return null;
  // web url thumb
  if (p?.thumbnail && typeof p.thumbnail === 'string') return { uri: p.thumbnail };
  // local require thumb
  if (p?.thumbnail && typeof p.thumbnail !== 'string') return p.thumbnail;
  // gallery first
  if (Array.isArray(p?.gallery) && p.gallery.length) {
    const g0 = p.gallery[0];
    if (typeof g0 === 'string') return { uri: g0 };
    return g0;
  }
  // detail.variations.gallery
  const varGal = p?.detail?.variations?.[0]?.gallery?.[0];
  if (varGal) {
    if (typeof varGal === 'string') return { uri: varGal };
    return varGal;
  }
  return null;
};

const AllCategoriesScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRTL = I18nManager.isRTL || i18n.language?.startsWith('ar');

  // optional override via route: { dataSource: 'EN' | 'AR' }
  const dataSource = route?.params?.dataSource || (i18n.language?.startsWith('ar') ? 'AR' : 'EN');

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useSkeletonLoader(true, 600);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [setLoading]);

  // Choose products by locale
  const products = useMemo(() => {
    return dataSource === 'AR' && AR_PRODUCTS.length ? AR_PRODUCTS : EN_PRODUCTS;
  }, [dataSource]);

  // Build category list
  const categories = useMemo(() => {
    const byCat = new Map();
    for (const p of products) {
      const catRaw = getCategoryFromProduct(p);
      const cat = titleCase(catRaw);
      if (!byCat.has(cat)) {
        byCat.set(cat, { name: cat, count: 0, sample: p });
      }
      byCat.get(cat).count += 1;
      // keep earliest with a valid thumb
      if (!byCat.get(cat).thumb) {
        const th = getThumb(p);
        if (th) byCat.get(cat).thumb = th;
      }
    }
    // If nothing was found, provide a sensible fallback list
    const arr = Array.from(byCat.values());
    if (!arr.length) {
      const fallback = [
        { name: 'Men', count: 0 },
        { name: 'Women', count: 0 },
        { name: 'Kids', count: 0 },
        { name: 'Shoes', count: 0 },
        { name: 'Accessories', count: 0 },
        { name: 'Beauty', count: 0 },
      ];
      return fallback;
    }
    // sort alphabetically
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [products]);

  // Filter by search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  // Navigate to your product list screen
  const onPressCategory = (cat) => {
    // Change 'ProductList' to your actual screen name
    navigation.navigate('ProductList', {
      title: cat.name,
      filter: { category: cat.name },
      dataSource,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPressCategory(item)} activeOpacity={0.8}>
      <View style={styles.thumbWrap}>
        {item.thumb ? (
          <Image source={item.thumb} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbFallback}>
            <Icon name="pricetags-outline" size={28} />
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.title}>{item.name}</Text>
      <Text style={styles.count}>
        {item.count ? `${item.count} ${t('items', 'items')}` : t('browse', 'Browse')}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <SkeletonCategoryScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('allCategories', 'All Categories')}</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.searchRow}>
        <Icon name="search-outline" size={18} style={{ marginHorizontal: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('searchCategories', 'Search categories')}
          placeholderTextColor="#778"
          style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 6 }}>
            <Icon name="close-circle" size={18} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it, idx) => `${it.name}-${idx}`}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: GAP }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const GAP = 12;
const CARD_W = (width - 16 * 2 - GAP * 2) / 3;
const THUMB = CARD_W;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' },

  searchRow: {
    margin: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e6ea',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    paddingRight: 6,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 10 },

  card: {
    width: CARD_W,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eef0f3',
    padding: 10,
    alignItems: 'center',
  },
  thumbWrap: {
    width: THUMB - 8,
    height: THUMB - 8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f4f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  count: { fontSize: 11, color: '#6b7280', marginTop: 2 },
});

export default AllCategoriesScreen;
