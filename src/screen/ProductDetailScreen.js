// src/screens/ProductDetailScreen.js
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Dimensions,
    Platform,
    Alert,
    Modal,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { SkeletonProductDetailScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import i18n from '../i18n';
import { homeAPI, getUserId } from '../services/api';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = Math.min(420, H * 0.5);

const CART_STORAGE_KEY = 'user_cart';
const USER_STORAGE_KEY = 'luna_user';

// Hero Image Component with error handling - defined outside to avoid hooks issues
const HeroImageItem = React.memo(({ uri, index, onFirstImageLoad, THEME, styles }) => {
    console.log()
    const [imageError, setImageError] = React.useState(false);
    const [localLoading, setLocalLoading] = React.useState(index === 0);

    return (
        <View style={styles.heroImageContainer}>
            {localLoading && !imageError && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME.p1} />
                </View>
            )}
            {imageError ? (
                <View style={[styles.heroImg, { backgroundColor: THEME.line, justifyContent: 'center', alignItems: 'center' }]}>
                    <Icon name="image-outline" size={60} color={THEME.gray} />
                </View>
            ) : (
                <Image
                    source={{ uri }}
                    style={styles.heroImg}
                    onLoadStart={() => {
                        setLocalLoading(true);
                    }}
                    onLoad={() => {
                        setLocalLoading(false);
                        if (index === 0 && onFirstImageLoad) {
                            onFirstImageLoad();
                        }
                    }}
                    onError={(error) => {
                        console.log('Image load error for URL:', uri);
                        console.log('Error details:', error.nativeEvent);
                        setImageError(true);
                        setLocalLoading(false);
                        if (index === 0 && onFirstImageLoad) {
                            onFirstImageLoad();
                        }
                    }}
                    resizeMode="cover"
                />
            )}
        </View>
    );
});

const ProductDetailScreen = () => {
    const { theme, isDark } = useTheme();
    const THEME = theme;
    const styles = useMemo(() => createStyles(THEME, isDark), [THEME, isDark]);
    const navigation = useNavigation();
    const route = useRoute();
    const routeProduct = route?.params?.product;
    const routeProductId = route?.params?.productId || routeProduct?.id;
    const routeGalleries = route?.params?.galleries || [];

    const [product, setProduct] = useState(routeProduct);
    const [galleries, setGalleries] = useState(routeGalleries);
    const [productLoading, setProductLoading] = useState(!routeProduct && !!routeProductId);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    const [galleryIndex, setGalleryIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const heroImageListRef = useRef(null);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);

    // ALL HOOKS MUST BE BEFORE ANY EARLY RETURNS - Rules of Hooks

    // Selection States
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    // Modal States
    const [sizeChartOpen, setSizeChartOpen] = useState(false);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const [policyOpen, setPolicyOpen] = useState(false);

    // Delivery State
    const [selectedDelivery, setSelectedDelivery] = useState('standard');

    // Load user data from AsyncStorage
    const loadUserData = useCallback(async () => {
        try {
            const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                // Extract user ID from different possible field names
                const userId = parsed.user.id
                console.log('Loaded user from AsyncStorageparsed:', parsed);

                if (userId) {
                    setUserId(userId);
                    console.log('User ID set to:', userId);
                } else {
                    setUserId(null);
                    console.log('No user ID found in user data');
                }
            } else {
                setUserId(null);
                console.log('No user found in AsyncStorage');
            }
        } catch (error) {
            console.log('Error loading user data:', error);
            setUserId(null);
        } finally {
            setUserLoading(false);
        }
    }, []);

    // Cart functions - defined early so they can be used in useEffect hooks
    const loadCartQuantity = useCallback(async () => {
        if (!product?.id) return;
        try {
            const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
            if (cartData) {
                const cart = JSON.parse(cartData);

                // Find the exact item with current selections
                const cartItem = cart.find(item =>
                    item.id === product.id &&
                    item.selectedSize === (selectedSize?.size || '') &&
                    item.selectedColor === (selectedColor?.color || '')
                );

                const quantity = cartItem ? cartItem.quantity : 0;
                console.log('Cart quantity loaded:', quantity, 'for product:', product.id, 'size:', selectedSize?.size, 'color:', selectedColor?.color);
                setCartQuantity(quantity);
            } else {
                console.log('No cart data found');
                setCartQuantity(0);
            }
        } catch (error) {
            console.log('Error loading cart:', error);
            setCartQuantity(0);
        }
    }, [product?.id, selectedSize?.size, selectedColor?.color]);

    // Fetch product details if productId is provided but product data is missing
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!routeProductId) return; // Already have product data
            console.log('Product data routeProductId:', routeProductId);
            try {
                setProductLoading(true);
                const userId = await getUserId();
                const response = await homeAPI.getProductDetails(routeProductId, userId);
                const data = response.data;

                console.log('📦 Product data received:', data?.galleries);
                if (data.status) {

                    console.log('📦 Product data received:', {
                        productId: data.product.id,
                        galleriesCount: data.galleries?.length || 0
                    });

                    // Print full JSON data for debugging
                    console.log('🔍 ========== FULL API RESPONSE JSON ==========');
                    console.log(JSON.stringify(data, null, 2));
                    console.log('🔍 ========== END API RESPONSE ==========');

                    // Print product data separately
                    console.log('🔍 ========== PRODUCT DATA ==========');
                    console.log("PRODUCT DATA", JSON.stringify(data.product, null, 2));
                    console.log('🔍 ========== END PRODUCT DATA ==========');

                    // Print galleries data separately
                    console.log('🔍 ========== GALLERIES DATA ==========');
                    console.log(JSON.stringify(data.galleries || [], null, 2));
                    console.log('🔍 Galleries count:', data.galleries?.length || 0);
                    console.log('🔍 Galleries type:', typeof data.galleries);
                    console.log('🔍 Is galleries array?', Array.isArray(data.galleries));
                    if (Array.isArray(data.galleries) && data.galleries.length > 0) {
                        console.log('🔍 Gallery items details:', data.galleries.map((g, idx) => ({
                            index: idx,
                            id: g.id,
                            product_id: g.product_id,
                            photo: g.photo,
                            photoType: typeof g.photo,
                            fullGalleryObject: g
                        })));
                    }
                    console.log('🔍 ========== END GALLERIES DATA ==========');

                    setProduct(data.product);
                    // Set galleries if available - ensure we set it even if empty array
                    if (Array.isArray(data.galleries)) {
                        console.log('📸 Setting galleries state with', data.galleries.length, 'items');
                        setGalleries(data.galleries);
                    } else {
                        console.log('⚠️ Galleries is not an array:', data.galleries);
                        setGalleries([]);
                    }
                    // Set reviews and ratings
                    if (Array.isArray(data.ratings)) {
                        console.log('⭐ Setting reviews with', data.ratings.length, 'items');
                        setReviews(data.ratings);
                    } else {
                        setReviews([]);
                    }
                    // Set average rating
                    if (data.average_rating !== undefined) {
                        setAverageRating(data.average_rating);
                    }
                    // Set related products
                    if (Array.isArray(data.related_products)) {
                        console.log('🛍️ Setting related products with', data.related_products.length, 'items');
                        setRelatedProducts(data.related_products);
                    } else {
                        setRelatedProducts([]);
                    }
                } else {
                    console.log('❌ Invalid API response:', data);
                    console.log('❌ Invalid API response JSON:', JSON.stringify(data, null, 2));
                }
            } catch (error) {
                console.log('Error fetching product details:', error);
            } finally {
                setProductLoading(false);
            }
        };
        fetchProductDetails();
    }, [routeProductId, routeProduct]);

    // Load user data on component mount
    useEffect(() => {
        loadUserData();
        // Simulate initial loading
        const timer = setTimeout(() => setInitialLoading(false), 800);
        return () => clearTimeout(timer);
    }, [loadUserData]);

    // Reload cart quantity when size or color selection changes
    useEffect(() => {
        if (product?.id) {
            loadCartQuantity();
        }
    }, [selectedSize, selectedColor, loadCartQuantity]);

    // Also reload when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadCartQuantity();
            loadUserData(); // Reload user data when screen comes into focus
        }, [loadCartQuantity, loadUserData])
    );

    // API call to add product to recently viewed
    const addToRecentlyViewed = useCallback(async () => {
        if (!product?.id || !userId) {
            console.log('Cannot add to recently viewed - missing product ID or user ID');
            return;
        }

        try {
            const response = await homeAPI.addRecentlyViewed(userId, product.id);
            if (response.data?.status) {
                console.log('Added to recently viewed:', response.data);
            } else {
                console.log('Recently viewed API error:', response.data);
            }
        } catch (error) {
            console.log('Error adding to recently viewed:', error);
        }
    }, [product?.id, userId]);

    // API call to toggle wishlist
    const toggleWishlist = async () => {
        if (!product?.id) {
            Alert.alert('Error', 'Product information is missing');
            return;
        }

        if (!userId) {
            Alert.alert('Login Required', 'Please login to add items to your wishlist');
            return;
        }

        setWishlistLoading(true);
        try {
            const response = await homeAPI.toggleWishlist(userId, product.id);
            const data = response.data;

            if (data?.status) {
                setIsWishlisted(!isWishlisted);
                Alert.alert(
                    isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
                    isWishlisted
                        ? 'Product has been removed from your wishlist.'
                        : 'Product has been added to your wishlist!'
                );
            } else {
                Alert.alert('Error', data?.message || 'Failed to update wishlist');
            }
        } catch (error) {
            console.log('Wishlist API error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update wishlist. Please try again.');
        } finally {
            setWishlistLoading(false);
        }
    };

    // Check if product is in wishlist
    const checkWishlistStatus = useCallback(async () => {
        if (!userId || !product?.id) {
            setIsWishlisted(false);
            return;
        }

        try {
            const response = await homeAPI.getWishlist(userId);
            if (response.data?.status && Array.isArray(response.data?.data)) {
                const wishlistItems = response.data.data;
                const isInWishlist = wishlistItems.some(item =>
                    (item.product_id || item.id) === product.id
                );
                setIsWishlisted(isInWishlist);
            } else {
                setIsWishlisted(false);
            }
        } catch (error) {
            console.log('Error checking wishlist status:', error);
            setIsWishlisted(false);
        }
    }, [userId, product?.id]);

    // Parse size and color data from API - MUST be before early returns (Rules of Hooks)
    const productSizes = useMemo(() => {
        if (!product || !product.size) return [];
        try {
            const sizes = product.size.split(',').map(s => s.trim()).filter(s => s);
            const sizeQtys = product.size_qty ? product.size_qty.split(',').map(q => parseInt(q.trim()) || 0) : [];
            const sizePrices = product.size_price ? product.size_price.split(',').map(p => parseFloat(p.trim()) || product.price) : [];

            return sizes.map((size, index) => ({
                size: size,
                quantity: sizeQtys[index] !== undefined ? sizeQtys[index] : product.stock || 0,
                price: sizePrices[index] !== undefined ? sizePrices[index] : product.price,
                id: `size-${index}-${size}`,
                inStock: (sizeQtys[index] || product.stock || 0) > 0
            }));
        } catch (error) {
            console.log('Error parsing sizes:', error);
            return [];
        }
    }, [product]);

    // Process color array - remove duplicates and create color objects
    const productColors = useMemo(() => {
        if (!product || !product.color) return [];
        try {
            const colors = product.color.split(',').map(c => c.trim()).filter(c => c);
            const uniqueColors = [...new Set(colors)];

            return uniqueColors.map((color, index) => ({
                color: color,
                name: color,
                id: `color-${index}-${color}`,
                hex: color
            }));
        } catch (error) {
            console.log('Error parsing colors:', error);
            return [];
        }
    }, [product]);

    const hasSizes = productSizes.length > 0;
    const hasColors = productColors.length > 0;

    // Initialize default selections - MUST be before early returns (Rules of Hooks)
    const initializeSelections = useCallback(() => {
        if (!product) return;
        if (hasSizes) {
            const availableSize = productSizes.find(size => size.inStock) || productSizes[0];
            setSelectedSize(availableSize);
        }
        if (hasColors) {
            setSelectedColor(productColors[0]);
        }
    }, [product, hasSizes, hasColors, productSizes, productColors]);

    // Load cart quantity and initialize on component mount - MUST be before early returns (Rules of Hooks)
    useEffect(() => {
        if (!userLoading && product?.id) {
            loadCartQuantity();
            initializeSelections();
            addToRecentlyViewed();
            checkWishlistStatus();
        }
    }, [product?.id, userLoading, loadCartQuantity, initializeSelections, addToRecentlyViewed, checkWishlistStatus]);

    // Calculate current price based on selections - MUST be before early returns (Rules of Hooks)
    const currentPrice = useMemo(() => {
        if (!product) return 0;
        return selectedSize ? selectedSize.price : product.price;
    }, [selectedSize, product?.price]);

    // Get available stock for selected size - MUST be before early returns (Rules of Hooks)
    const availableStock = useMemo(() => {
        if (!product) return 0;
        if (selectedSize && selectedSize.quantity !== null) {
            return selectedSize.quantity;
        }
        return product.stock || 0;
    }, [selectedSize, product?.stock]);

    // Image URL construction helper - MUST be before early returns (Rules of Hooks)
    const getImageUrl = useCallback((imagePath, isGallery = false) => {
        if (!imagePath) return null;
        // If already a full URL, return as is
        if (/^(https?:|file:|content:|data:)/i.test(imagePath)) {
            return imagePath;
        }
        // Construct full URL with appropriate base path
        // Gallery images are in /assets/images/galleries/
        // Product images are in /assets/images/products/
        const IMG_BASE = isGallery
            ? 'https://proteinbros.in/assets/images/galleries/'
            : 'https://proteinbros.in/assets/images/products/';
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        return `${IMG_BASE}${cleanPath}`;
    }, []);

    // Hero images - MUST be before early returns (Rules of Hooks)
    // Collect ALL available images: product images + all gallery images
    const heroImages = useMemo(() => {
        if (!product) {
            console.log('⚠️ No product data available');
            return [];
        }
        const images = [];
        const imageUrls = new Set(); // Use Set to track unique URLs

        console.log('🖼️ ========== BUILDING heroImages ==========');
        console.log('🖼️ Product ID:', product?.id);
        console.log('🖼️ Product image fields:', {
            image: product.image || 'N/A',
            photo: product.photo || 'N/A',
            thumbnail: product.thumbnail || 'N/A'
        });
        console.log('🖼️ Galleries state:', {
            type: typeof galleries,
            isArray: Array.isArray(galleries),
            length: galleries?.length || 0,
            value: galleries
        });
        console.log('🖼️ Galleries JSON:', JSON.stringify(galleries || [], null, 2));

        // Helper function to add image URL
        const addImageUrl = (url, source, isGalleryImage = false) => {
            if (!url || typeof url !== 'string' || url.trim() === '') {
                console.log(`  ❌ ${source}: Empty or invalid URL`);
                return false;
            }

            // Trim whitespace
            url = url.trim();

            // Check if URL is already absolute
            const isAbsoluteUrl = /^(https?:|file:|content:|data:)/i.test(url);

            // Construct full URL if needed
            let fullUrl = url;
            if (!isAbsoluteUrl) {
                // Relative URL - construct full path using isGalleryImage to determine base directory
                fullUrl = getImageUrl(url, isGalleryImage);
                console.log(`  🔗 ${source}: Constructed URL from relative path: ${fullUrl.substring(0, 80)}...`);
            } else {
                console.log(`  🔗 ${source}: Already absolute URL: ${fullUrl.substring(0, 80)}...`);
            }

            // Add if not already in set (avoid duplicates)
            if (fullUrl && !imageUrls.has(fullUrl)) {
                imageUrls.add(fullUrl);
                images.push(fullUrl);
                console.log(`  ✅ Added ${source}: ${fullUrl.substring(0, 80)}...`);
                return true;
            } else if (fullUrl && imageUrls.has(fullUrl)) {
                console.log(`  ⏭️ ${source}: Skipped (duplicate): ${fullUrl.substring(0, 80)}...`);
            }
            return false;
        };

        // 1. FIRST: Add ALL gallery images (these are the multiple images from admin panel)
        // Gallery images should appear first as they are the main product images
        console.log('  📸 Checking galleries - Type:', typeof galleries, 'Is Array:', Array.isArray(galleries), 'Length:', galleries?.length || 0);
        console.log('  📸 Galleries raw value:', galleries);
        console.log('  📸 Galleries JSON stringified:', JSON.stringify(galleries || null, null, 2));

        if (Array.isArray(galleries) && galleries.length > 0) {
            console.log(`  📸 Processing ${galleries.length} gallery images...`);
            galleries.forEach((gallery, idx) => {
                console.log(`  📸 Gallery[${idx}] object:`, JSON.stringify(gallery));
                console.log(`  📸 Gallery[${idx}] photo value:`, gallery?.photo);
                console.log(`  📸 Gallery[${idx}] photo type:`, typeof gallery?.photo);

                if (gallery?.photo) {
                    // Gallery images - photo field may already be full URL or relative path
                    // Since API returns full URLs, we should use them directly
                    // Pass true for isGalleryImage to use correct base path ONLY if URL needs construction
                    console.log(`  📸 Calling addImageUrl for gallery[${idx}] with photo:`, gallery.photo);
                    const added = addImageUrl(gallery.photo, `gallery[${idx}]`, true);
                    console.log(`  📸 Gallery[${idx}] addImageUrl returned:`, added);
                    if (!added) {
                        console.log(`  ⚠️ Gallery ${idx + 1} photo not added (duplicate or invalid): ${gallery.photo}`);
                    }
                } else {
                    console.log(`  ⚠️ Gallery ${idx + 1} missing photo field. Gallery object:`, JSON.stringify(gallery));
                }
            });
            console.log(`  📸 Processed ${galleries.length} gallery images, total images now: ${images.length}`);
            console.log(`  📸 Current images array:`, images);
        } else {
            console.log('  ⚠️ No gallery images found. Galleries value:', galleries);
            console.log('  ⚠️ Galleries is array?', Array.isArray(galleries));
            console.log('  ⚠️ Galleries length?', galleries?.length);
        }

        // 2. THEN: Add product images (image, photo, thumbnail) as fallback/featured image
        if (product.image) {
            addImageUrl(product.image, 'product.image', false);
        }
        if (product.photo) {
            addImageUrl(product.photo, 'product.photo', false);
        }
        if (product.thumbnail) {
            addImageUrl(product.thumbnail, 'product.thumbnail', false);
        }

        // 3. Placeholder if no images at all
        if (images.length === 0) {
            const placeholder = 'https://dummyimage.com/600x400/e5e7eb/9ca3af.png&text=No+Image';
            images.push(placeholder);
            console.log('  ⚠️ No images found, using placeholder');
        }

        console.log(`🖼️ Total heroImages collected: ${images.length}`);
        console.log('  🖼️ Final Image URLs array:', images);
        console.log('  🖼️ Final Image URLs (formatted):');
        images.forEach((url, idx) => {
            console.log(`    [${idx}] ${url}`);
        });
        console.log('🖼️ ========== END BUILDING heroImages ==========');
        return images;
    }, [product, galleries, getImageUrl]);

    // Image loading handler
    const handleImageLoad = () => {
        console.log('✅ First image loaded, hiding loader');
        setImageLoading(false);
    };

    // Reset image loading when product or galleries change - MUST be before early returns
    useEffect(() => {
        if (product) {
            console.log('🔄 Product/galleries changed, resetting image loading state');
            setImageLoading(true);
        }
    }, [product?.id, galleries?.length]);

    // Handle missing product data - AFTER all hooks
    if (!product) {
        if (initialLoading || productLoading) {
            return (
                <SafeAreaView style={styles.safe}>
                    <SkeletonProductDetailScreen />
                </SafeAreaView>
            );
        }
        return (
            <SafeAreaView style={[styles.safe, styles.centerContent]}>
                <Text style={styles.errorText}>Product data missing.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Show skeleton while initial loading
    if (initialLoading || productLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <SkeletonProductDetailScreen />
            </SafeAreaView>
        );
    }

    // Helper function to get color name from hex
    const getColorName = (hex) => {
        const colorMap = {
            '#000000': 'Black',
            '#f41c1c': 'Red',
            '#3c34d5': 'Blue',
            '#c12ec8': 'Purple',
            '#007137': 'Green',
            '#FFFFFF': 'White',
            '#FFA500': 'Orange',
            '#FFFF00': 'Yellow',
            '#808080': 'Gray'
        };
        return colorMap[hex?.toLowerCase()] || `Color ${hex}`;
    };

    const requiresSelection = hasSizes || hasColors;

    // Delivery options for Bahrain
    const deliveryOptions = [
        { id: 'standard', name: 'Standard 5-7 days', price: 3.00, days: '5-7 days' },
        { id: 'express', name: 'Express 1-2 days', price: 12.00, days: '1-2 days' }
    ];

    // Helper function to format review date
    const formatReviewDate = (dateString) => {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            return `${Math.floor(diffDays / 365)} years ago`;
        } catch (e) {
            return 'Recently';
        }
    };

    // Helper function to get product image URL
    const getProductImageUrl = (product) => {
        if (!product) return 'https://via.placeholder.com/200x200';
        if (product.photo && product.photo.startsWith('http')) return product.photo;
        if (product.image && product.image.startsWith('http')) return product.image;
        if (product.thumbnail && product.thumbnail.startsWith('http')) return product.thumbnail;
        if (product.photo) return `https://proteinbros.in/assets/images/products/${product.photo}`;
        if (product.image) return `https://proteinbros.in/assets/images/products/${product.image}`;
        if (product.thumbnail) return `https://proteinbros.in/assets/images/products/${product.thumbnail}`;
        return 'https://via.placeholder.com/200x200';
    };


    // These hooks are now defined above before early returns
    // Calculate discount and other derived values
    const previousPrice = product?.previous_price;
    const discount = previousPrice && currentPrice ?
        Math.round(((previousPrice - currentPrice) / previousPrice) * 100) : 0;
    const hasDiscount = discount > 0;

    const isInStock = availableStock > 0;

    // Cart functions
    const updateCart = async (newQuantity) => {
        try {
            if (requiresSelection) {
                if (hasSizes && !selectedSize) {
                    Alert.alert('Size Required', 'Please select a size before adding to cart.');
                    return;
                }
                if (hasColors && !selectedColor) {
                    Alert.alert('Color Required', 'Please select a color before adding to cart.');
                    return;
                }
            }

            if (newQuantity > availableStock) {
                Alert.alert('Stock Limit', `Only ${availableStock} items available in stock.`);
                return;
            }

            const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
            let cart = cartData ? JSON.parse(cartData) : [];

            const itemIdentifier = {
                id: product.id,
                selectedSize: selectedSize?.size || '',
                selectedColor: selectedColor?.color || ''
            };

            const existingItemIndex = cart.findIndex(item =>
                item.id === itemIdentifier.id &&
                item.selectedSize === itemIdentifier.selectedSize &&
                item.selectedColor === itemIdentifier.selectedColor
            );

            if (newQuantity > 0) {
                const cartItem = {
                    ...itemIdentifier,
                    name: product.name,
                    price: currentPrice,
                    previous_price: previousPrice,
                    image: getImageUrl(product.image) || getImageUrl(product.thumbnail),
                    quantity: newQuantity,
                    sku: product.sku,
                    stock: availableStock,
                    size: selectedSize?.size,
                    color: selectedColor?.color,
                    colorName: selectedColor?.name,
                    colorHex: selectedColor?.hex,
                    baseProduct: product
                };

                if (existingItemIndex >= 0) {
                    cart[existingItemIndex] = cartItem;
                } else {
                    cart.push(cartItem);
                }
            } else {
                if (existingItemIndex >= 0) {
                    cart.splice(existingItemIndex, 1);
                }
            }

            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            setCartQuantity(newQuantity);

            if (newQuantity === 1 && existingItemIndex === -1) {
                let message = `${product.name} added to cart!`;
                if (selectedSize) message += `\nSize: ${selectedSize.size}`;
                if (selectedColor) message += `\nColor: ${selectedColor.name}`;
                Alert.alert('🎉 Added to Cart', message);
            }

        } catch (error) {
            console.log('Error updating cart:', error);
            Alert.alert('Error', 'Failed to update cart. Please try again.');
        }
    };

    const handleAddToCart = async () => {
        if (requiresSelection) {
            if (hasSizes && !selectedSize) {
                Alert.alert('Selection Required', 'Please select a size before adding to cart.');
                return;
            }
            if (hasColors && !selectedColor) {
                Alert.alert('Selection Required', 'Please select a color before adding to cart.');
                return;
            }
        }

        setIsAddingToCart(true);
        await updateCart(1);
        setIsAddingToCart(false);
    };

    const handleIncreaseQuantity = () => {
        const newQuantity = cartQuantity + 1;
        if (newQuantity <= availableStock) {
            updateCart(newQuantity);
        } else {
            Alert.alert('Stock Limit', `Only ${availableStock} items available in stock.`);
        }
    };

    const handleDecreaseQuantity = () => {
        if (cartQuantity > 1) {
            updateCart(cartQuantity - 1);
        } else {
            updateCart(0);
        }
    };

    const handleBuyNow = async () => {
        if (requiresSelection) {
            if (hasSizes && !selectedSize) {
                Alert.alert('Selection Required', 'Please select a size before adding to cart.');
                return;
            }
            if (hasColors && !selectedColor) {
                Alert.alert('Selection Required', 'Please select a color before adding to cart.');
                return;
            }
        }

        setIsAddingToCart(true);
        if (cartQuantity === 0) {
            await updateCart(1);
        }
        setIsAddingToCart(false);
        navigation.navigate('CartScreen');
    };

    // These are now defined above before early returns - removed duplicates

    // Format price with KWD
    const formatPrice = (price) => {
        return `${parseFloat(price).toFixed(3)} BHD`;
    };

    // Product details - ensure it's always a string
    const productDetails = (product?.details && typeof product.details === 'string')
        ? product.details
        : 'No description available.';
    const productName = (product?.name && typeof product.name === 'string')
        ? product.name
        : 'Product Name';
    const productSku = (product?.sku && typeof product.sku === 'string')
        ? product.sku
        : 'SKU not available';

    const renderHeroImage = ({ item, index }) => (
        <HeroImageItem
            uri={item}
            index={index}
            onFirstImageLoad={handleImageLoad}
            THEME={THEME}
            styles={styles}
        />
    );

    const renderColorOption = ({ item }) => {
        const isSelected = selectedColor?.color === item.color;
        return (
            <TouchableOpacity
                style={[
                    styles.colorOption,
                    isSelected && styles.colorOptionSelected
                ]}
                onPress={() => setSelectedColor(item)}
                activeOpacity={0.7}
            >
                <View style={styles.colorCircleWrapper}>
                    <View style={[styles.colorCircle, { backgroundColor: item.hex || item.color }]} />
                    {isSelected && (
                        <View style={styles.colorCheckmark}>
                            <Icon name="checkmark" size={14} color={THEME.white} />
                        </View>
                    )}
                </View>
                <Text style={[
                    styles.colorText,
                    isSelected && styles.colorTextSelected
                ]} numberOfLines={1}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderPopularProduct = ({ item }) => {
        const imageUrl = getImageUrl(item.photo || item.image || item.thumbnail, false);
        return (
            <TouchableOpacity
                style={styles.popularProductCard}
                onPress={() => {
                    navigation.push('ProductDetailScreen', {
                        productId: item.id || item.product_id,
                    });
                }}
            >
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../assets/image1.png')}
                    style={styles.popularProductImage}
                />
                <Text style={styles.popularProductName} numberOfLines={2}>
                    {item.name || item.title || 'Product'}
                </Text>
                <Text style={styles.popularProductPrice}>
                    {item.price ? `${item.price} BHD` : 'N/A'}
                </Text>
            </TouchableOpacity>
        );
    };

    // Size Guide Modal for Bahrain
    const SizeGuideModal = () => (
        <Modal
            visible={sizeChartOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSizeChartOpen(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Size Guide - Bahrain</Text>
                        <TouchableOpacity
                            onPress={() => setSizeChartOpen(false)}
                            style={styles.closeButton}
                        >
                            <Icon name="x" size={24} color={THEME.muted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.sizeGuideContent}>
                        <Text style={styles.sizeGuideText}>
                            Find your perfect fit with our Bahrain size guide:
                        </Text>

                        <View style={styles.sizeTable}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Intl Size</Text>
                                <Text style={styles.tableHeaderText}>Bahrain Size</Text>
                                <Text style={styles.tableHeaderText}>Chest (cm)</Text>
                                <Text style={styles.tableHeaderText}>Waist (cm)</Text>
                            </View>
                            {[
                                { intl: 'XS', bh: '32', chest: '81-86', waist: '66-71' },
                                { intl: 'S', bh: '34', chest: '86-91', waist: '71-76' },
                                { intl: 'M', bh: '36', chest: '91-96', waist: '76-81' },
                                { intl: 'L', bh: '38', chest: '96-102', waist: '81-86' },
                                { intl: 'XL', bh: '40', chest: '102-107', waist: '86-91' },
                                { intl: 'XXL', bh: '42', chest: '107-112', waist: '91-97' }
                            ].map((size) => (
                                <View key={size.intl} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{size.intl}</Text>
                                    <Text style={styles.tableCell}>{size.bh}</Text>
                                    <Text style={styles.tableCell}>{size.chest}</Text>
                                    <Text style={styles.tableCell}>{size.waist}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.sizeTip}>
                            <Icon name="info" size={20} color={THEME.p1} />
                            <Text style={styles.sizeTipText}>
                                All measurements in centimeters. For best fit, measure your body and compare.
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // Reviews Modal
    const ReviewsModal = () => (
        <Modal
            visible={reviewsOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setReviewsOpen(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Customer Reviews - Bahrain</Text>
                        <TouchableOpacity
                            onPress={() => setReviewsOpen(false)}
                            style={styles.closeButton}
                        >
                            <Icon name="x" size={24} color={THEME.muted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.reviewsContent}>
                        <Text style={styles.reviewsCount}>{reviews.length} Reviews</Text>
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <View key={review.id} style={styles.reviewItem}>
                                    <View style={styles.reviewHeader}>
                                        <Text style={styles.reviewUser}>{review.user_name || 'Anonymous'}</Text>
                                        <Text style={styles.reviewDate}>{formatReviewDate(review.review_date)}</Text>
                                    </View>
                                    <View style={styles.ratingStars}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Icon
                                                key={star}
                                                name="star"
                                                size={16}
                                                color={star <= (review.rating || 0) ? "#FFD700" : THEME.line}
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewComment}>{review.review || 'No comment provided'}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No reviews yet. Be the first to review!</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // Policy Modal
    const PolicyModal = () => (
        <Modal
            visible={policyOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setPolicyOpen(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Product Policy</Text>
                        <TouchableOpacity
                            onPress={() => setPolicyOpen(false)}
                            style={styles.closeButton}
                        >
                            <Icon name="x" size={24} color={THEME.muted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.policyContent}>
                        {product.policy ? (
                            <RenderHtml
                                contentWidth={W - 32}
                                source={{ html: product.policy }}
                                baseStyle={styles.policyText}
                            />
                        ) : (
                            <Text style={styles.policyText}>
                                No policy information available for this product.
                            </Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
            <StandardHeader
                title=""
                navigation={navigation}
                showGradient={true}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>

                {/* HERO SECTION */}
                <View style={styles.heroWrap}>
                    <FlatList
                        ref={heroImageListRef}
                        data={heroImages}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, idx) => `hero-${idx}`}
                        onMomentumScrollEnd={(e) => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / W);
                            setGalleryIndex(idx);
                        }}
                        renderItem={renderHeroImage}
                        getItemLayout={(data, index) => ({
                            length: W,
                            offset: W * index,
                            index,
                        })}
                    />

                    {/* Image Indicators */}
                    {heroImages.length > 1 && (
                        <View style={styles.imageIndicators}>
                            {heroImages.map((_, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.indicatorDot,
                                        idx === galleryIndex && styles.indicatorDotActive
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <SafeAreaView style={styles.heroTopRow}>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={toggleWishlist}
                                disabled={wishlistLoading || !userId}
                            >
                                {wishlistLoading ? (
                                    <ActivityIndicator size="small" color={THEME.red} />
                                ) : (
                                    <Icon
                                        name={isWishlisted ? "heart" : "heart-outline"}
                                        size={22}
                                        color={isWishlisted ? THEME.red : (!userId ? THEME.muted : THEME.ink)}
                                    />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Icon name="share-outline" size={22} color={THEME.ink} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* THUMBNAIL GALLERY */}
                {heroImages && Array.isArray(heroImages) && heroImages.length > 0 && (
                    <View style={styles.thumbnailGallery}>
                        <FlatList
                            data={heroImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, idx) => `thumb-${idx}-${item}`}
                            contentContainerStyle={styles.thumbnailList}
                            renderItem={({ item, index }) => {
                                // Validate item is a valid string URL
                                if (!item || typeof item !== 'string' || item.trim() === '') {
                                    console.log('⚠️ Invalid thumbnail item at index:', index, item);
                                    return (
                                        <View style={[styles.thumbnailItem, { backgroundColor: THEME.line, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Icon name="image-outline" size={24} color={THEME.gray} />
                                        </View>
                                    );
                                }
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.thumbnailItem,
                                            index === galleryIndex && styles.thumbnailItemActive
                                        ]}
                                        onPress={() => {
                                            setGalleryIndex(index);
                                            try {
                                                heroImageListRef.current?.scrollToIndex({
                                                    index,
                                                    animated: true
                                                });
                                            } catch (error) {
                                                // Fallback to scrollToOffset if scrollToIndex fails
                                                heroImageListRef.current?.scrollToOffset({
                                                    offset: index * W,
                                                    animated: true
                                                });
                                            }
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={{ uri: item }}
                                            style={styles.thumbnailImage}
                                            resizeMode="cover"
                                            onError={(error) => {
                                                console.log('Thumbnail load error:', item, error);
                                            }}
                                        />
                                        {index === galleryIndex && (
                                            <View style={styles.thumbnailOverlay} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                )}

                {/* PRODUCT INFO */}
                <View style={styles.section}>
                    <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{formatPrice(currentPrice)}</Text>
                            {hasDiscount && (
                                <Text style={styles.originalPrice}>{formatPrice(previousPrice)}</Text>
                            )}
                        </View>
                        {hasDiscount && (
                            <LinearGradient
                                colors={[THEME.red, THEME.red]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.discountBadge}
                            >
                                <Text style={styles.discountText}>-{discount}%</Text>
                            </LinearGradient>
                        )}
                    </View>

                    <Text style={styles.productTitle}>{productName}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.skuBadge}>
                            <Icon name="barcode-outline" size={14} color={THEME.gray} />
                            <Text style={styles.productSku}>{productSku}</Text>
                        </View>
                        <View style={[styles.stockBadge, isInStock ? styles.stockBadgeIn : styles.stockBadgeOut]}>
                            <Icon
                                name={isInStock ? "checkmark-circle" : "close-circle"}
                                size={14}
                                color={isInStock ? THEME.success : THEME.red}
                            />
                            <Text style={[styles.stockText, isInStock ? styles.inStock : styles.outOfStock]}>
                                {isInStock ? `${availableStock} available` : 'Out of Stock'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* VARIATIONS */}
                {(hasColors || hasSizes) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Options</Text>

                        {/* Color Selection */}
                        {hasColors && (
                            <View style={styles.variationBlock}>
                                <View style={styles.variationHeader}>
                                    <Text style={styles.variationLabel}>Color</Text>
                                    {selectedColor && (
                                        <Text style={styles.selectedVariationText}>{selectedColor.name}</Text>
                                    )}
                                </View>
                                <FlatList
                                    horizontal
                                    data={productColors}
                                    keyExtractor={(item) => item.id}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.colorsList}
                                    renderItem={renderColorOption}
                                />
                            </View>
                        )}

                        {/* Size Selection */}
                        {hasSizes && (
                            <View style={styles.variationBlock}>
                                <View style={styles.variationHeader}>
                                    <Text style={styles.variationLabel}>Size</Text>
                                    <TouchableOpacity
                                        style={styles.sizeGuideLink}
                                        onPress={() => setSizeChartOpen(true)}
                                    >
                                        <Icon name="resize-outline" size={16} color={THEME.p1} />
                                        <Text style={styles.sizeGuideLinkText}>Size Guide</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.sizeGrid}>
                                    {productSizes.map((sizeItem) => (
                                        <TouchableOpacity
                                            key={sizeItem.id}
                                            style={[
                                                styles.sizeButton,
                                                selectedSize?.size === sizeItem.size && styles.sizeButtonSelected,
                                                !sizeItem.inStock && styles.sizeButtonDisabled
                                            ]}
                                            onPress={() => setSelectedSize(sizeItem)}
                                            disabled={!sizeItem.inStock}
                                        >
                                            {selectedSize?.size === sizeItem.size && (
                                                <LinearGradient
                                                    colors={[THEME.p1, THEME.p2]}
                                                    style={StyleSheet.absoluteFill}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                />
                                            )}
                                            <Text style={[
                                                styles.sizeButtonText,
                                                selectedSize?.size === sizeItem.size && styles.sizeButtonTextSelected,
                                                !sizeItem.inStock && styles.sizeButtonTextDisabled
                                            ]}>
                                                {sizeItem.size}
                                            </Text>
                                            {!sizeItem.inStock && (
                                                <View style={styles.outOfStockOverlay} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* PRODUCT DESCRIPTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Description</Text>
                    {productDetails && typeof productDetails === 'string' && productDetails.trim() ? (
                        // Check if content contains HTML tags
                        (productDetails.includes('<') && productDetails.includes('>')) ? (
                            <RenderHtml
                                contentWidth={W - 32}
                                source={{ html: productDetails }}
                                baseStyle={styles.description}
                            />
                        ) : (
                            <Text style={styles.description}>{productDetails}</Text>
                        )
                    ) : (
                        <Text style={styles.description}>No description available.</Text>
                    )}
                </View>

                {/* PRODUCT POLICY */}
                {product.policy && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.policyButton}
                            onPress={() => setPolicyOpen(true)}
                        >
                            <Text style={styles.policyButtonText}>View Product Policy & Services</Text>
                            <Icon name="chevron-right" size={20} color={THEME.p1} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* DELIVERY - BAHRAIN */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery - Bahrain</Text>
                    {deliveryOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.deliveryOption,
                                selectedDelivery === option.id && styles.deliveryOptionSelected
                            ]}
                            onPress={() => setSelectedDelivery(option.id)}
                        >
                            <View style={styles.deliveryInfo}>
                                <Text style={styles.deliveryName}>{option.name}</Text>
                                <Text style={styles.deliveryPrice}>{formatPrice(option.price)}</Text>
                            </View>
                            <View style={[
                                styles.radio,
                                selectedDelivery === option.id && styles.radioSelected
                            ]}>
                                {selectedDelivery === option.id && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* RATING & REVIEWS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Rating & Reviews</Text>
                        <TouchableOpacity onPress={() => setReviewsOpen(true)}>
                            <Text style={styles.seeAllText}>View All Reviews</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.ratingSummary}>
                        <Text style={styles.rating}>{averageRating > 0 ? `${averageRating.toFixed(1)}/5` : 'No rating'}</Text>
                        <Text style={styles.ratingCount}>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</Text>
                    </View>

                    {reviews.length > 0 ? (
                        reviews.slice(0, 1).map((review) => (
                            <View key={review.id} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewUser}>{review.user_name || 'Anonymous'}</Text>
                                    <Text style={styles.reviewDate}>{formatReviewDate(review.review_date)}</Text>
                                </View>
                                <View style={styles.ratingStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Icon
                                            key={star}
                                            name="star"
                                            size={16}
                                            color={star <= (review.rating || 0) ? "#FFD700" : THEME.line}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.reviewComment}>{review.review || 'No comment provided'}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No reviews yet. Be the first to review!</Text>
                        </View>
                    )}
                </View>

                {/* MOST POPULAR */}
                {relatedProducts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Most Popular</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            data={relatedProducts.slice(0, 10)}
                            keyExtractor={(item) => String(item.id || item.product_id)}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.popularList}
                            renderItem={renderPopularProduct}
                        />
                    </View>
                )}

                {/* PROMO BANNERS */}
                <View style={styles.promoSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoList}>
                        {product.featured && <View style={styles.promoBanner}><Text style={styles.promoText}>Featured</Text></View>}
                        {product.best && <View style={styles.promoBanner}><Text style={styles.promoText}>Best Seller</Text></View>}
                        {product.hot && <View style={styles.promoBanner}><Text style={styles.promoText}>Hot</Text></View>}
                        {product.sale && <View style={styles.promoBanner}><Text style={styles.promoText}>Sale</Text></View>}
                        {product.trending && <View style={styles.promoBanner}><Text style={styles.promoText}>Trending</Text></View>}
                        {product.flash_deal && <View style={styles.promoBanner}><Text style={styles.promoText}>Flash Deal</Text></View>}
                    </ScrollView>
                </View>

                {/* YOU MIGHT LIKE */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>You Might Like</Text>
                    <View style={styles.productsGrid}>
                        {relatedProducts.length > 0 ? (
                            relatedProducts.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.productCard}
                                    onPress={() => {
                                        navigation.push('ProductDetailScreen', {
                                            productId: item.id,
                                            product: item
                                        });
                                    }}
                                >
                                    <Image source={{ uri: getProductImageUrl(item) }} style={styles.productImage} />
                                    <Text style={styles.productName} numberOfLines={2}>{item.name || 'Product'}</Text>
                                    <Text style={styles.productPrice}>{formatPrice(item.price || 0)}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No related products available</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
            <View style={styles.bottomActionBarSpacer} />

            {/* MODALS */}
            <SizeGuideModal />
            <ReviewsModal />
            <PolicyModal />

            {/* BOTTOM ACTION BAR */}
            <View style={styles.bottomActionBar}>
                {isInStock ? (
                    (cartQuantity > 0) ? (
                        <View style={styles.cartActions}>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={styles.quantityBtn}
                                    onPress={handleDecreaseQuantity}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="remove" size={20} color={THEME.ink} />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{cartQuantity}</Text>
                                <TouchableOpacity
                                    style={[styles.quantityBtn, cartQuantity >= availableStock && styles.quantityBtnDisabled]}
                                    onPress={handleIncreaseQuantity}
                                    disabled={cartQuantity >= availableStock}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="add" size={20} color={cartQuantity >= availableStock ? THEME.muted : THEME.ink} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.buyNowBtn}
                                onPress={handleBuyNow}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={[THEME.p1, THEME.p2]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buyNowGradient}
                                >
                                    <Text style={styles.buyNowText}>BUY NOW</Text>
                                    <Icon name="arrow-forward" size={18} color={THEME.white} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addToCartBtn}
                            onPress={handleAddToCart}
                            disabled={isAddingToCart}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[THEME.p1, THEME.p2]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.addToCartGradient}
                            >
                                {isAddingToCart ? (
                                    <ActivityIndicator size="small" color={THEME.white} />
                                ) : (
                                    <>
                                        <Icon name="cart" size={20} color={THEME.white} />
                                        <Text style={styles.addToCartText}>ADD TO CART</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    )
                ) : (
                    <TouchableOpacity style={styles.notifyBtn} activeOpacity={0.9}>
                        <LinearGradient
                            colors={[THEME.gray, THEME.muted]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.notifyGradient}
                        >
                            <Icon name="notifications-outline" size={18} color={THEME.white} />
                            <Text style={styles.notifyText}>NOTIFY WHEN AVAILABLE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Chatbot Button */}
                {product && (
                    <TouchableOpacity
                        style={styles.chatbotButton}
                        onPress={() => navigation.navigate('ProductChatBot', { product })}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[THEME.p4, THEME.p3]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.chatbotGradient}
                        >
                            <Icon name="chatbubble-ellipses-outline" size={18} color={THEME.p1} />
                            <Text style={styles.chatbotText}>
                                {i18n.language === 'ar' ? 'اسأل عن المنتج' : 'Ask About Product'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default ProductDetailScreen;

/* ------------------------ STYLES ------------------------ */
const createStyles = (THEME, isDark) => StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },

    /* HERO SECTION */
    heroWrap: {
        height: HERO_H,
        backgroundColor: THEME.bg,
        position: 'relative',
    },
    heroImageContainer: {
        width: W,
        height: HERO_H,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.bg,
    },
    heroImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        zIndex: 5,
    },
    indicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    },
    indicatorDotActive: {
        width: 24,
        backgroundColor: isDark ? THEME.white : THEME.ink,
    },
    /* THUMBNAIL GALLERY */
    thumbnailGallery: {
        backgroundColor: THEME.card,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: THEME.line,
    },
    thumbnailList: {
        gap: 10,
        paddingRight: 16,
    },
    thumbnailItem: {
        width: 70,
        height: 70,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: THEME.line,
    },
    thumbnailItemActive: {
        borderColor: THEME.p1,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        borderColor: THEME.p1,
        borderRadius: 6,
    },
    heroTopRow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 8 : 12,
        zIndex: 10,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.card,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.95,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    /* SECTIONS */
    section: {
        padding: 20,
        backgroundColor: THEME.card,
        borderBottomWidth: 1,
        borderBottomColor: THEME.line,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: THEME.ink,
        marginBottom: 4,
    },

    /* PRODUCT INFO */
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 12,
    },
    price: {
        fontSize: 28,
        fontWeight: '900',
        color: THEME.ink,
    },
    originalPrice: {
        fontSize: 18,
        color: THEME.muted,
        textDecorationLine: 'line-through',
        fontWeight: '600',
    },
    discountBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    discountText: {
        color: THEME.white,
        fontSize: 13,
        fontWeight: '800',
    },
    productTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: THEME.ink,
        lineHeight: 28,
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    skuBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: THEME.bg,
        borderRadius: 8,
    },
    productSku: {
        fontSize: 12,
        color: THEME.gray,
        fontWeight: '600',
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    stockBadgeIn: {
        backgroundColor: THEME.success + '20',
    },
    stockBadgeOut: {
        backgroundColor: THEME.red + '20',
    },
    stockText: {
        fontSize: 12,
        fontWeight: '700',
    },
    inStock: {
        color: THEME.success,
    },
    outOfStock: {
        color: THEME.red,
    },

    /* VARIATIONS */
    variationBlock: {
        marginBottom: 24,
    },
    variationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    variationLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: THEME.ink,
    },
    selectedVariationText: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.p1,
    },
    colorsList: {
        paddingVertical: 4,
    },
    colorOption: {
        alignItems: 'center',
        marginRight: 16,
        padding: 8,
    },
    colorOptionSelected: {
        backgroundColor: THEME.bg,
        borderRadius: 12,
        padding: 8,
    },
    colorCircleWrapper: {
        position: 'relative',
        marginBottom: 8,
    },
    colorCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: THEME.line,
    },
    colorCheckmark: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: THEME.p1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: THEME.white,
    },
    colorText: {
        fontSize: 12,
        fontWeight: '600',
        color: THEME.gray,
        maxWidth: 64,
        textAlign: 'center',
    },
    colorTextSelected: {
        color: THEME.p1,
        fontWeight: '800',
    },

    /* SIZE SECTION */
    sizeGuideLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: THEME.bg,
        borderRadius: 8,
    },
    sizeGuideLinkText: {
        fontSize: 13,
        color: THEME.p1,
        fontWeight: '700',
    },
    sizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sizeButton: {
        minWidth: 64,
        height: 48,
        borderWidth: 2,
        borderColor: THEME.line,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.card,
        position: 'relative',
        overflow: 'hidden',
    },
    sizeButtonSelected: {
        borderColor: THEME.p1,
    },
    sizeButtonDisabled: {
        borderColor: THEME.line,
        backgroundColor: THEME.bg,
        opacity: 0.5,
    },
    sizeButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: THEME.ink,
        zIndex: 1,
    },
    sizeButtonTextSelected: {
        color: THEME.white,
    },
    sizeButtonTextDisabled: {
        color: THEME.muted,
    },
    outOfStockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },

    /* PRODUCT DESCRIPTION */
    description: {
        fontSize: 15,
        color: THEME.gray,
        lineHeight: 24,
        fontWeight: '400',
    },

    /* POLICY BUTTON */
    policyButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: THEME.bg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: THEME.line,
    },
    policyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.p1,
    },

    /* DELIVERY */
    deliveryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: THEME.line,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: THEME.card,
    },
    deliveryOptionSelected: {
        borderColor: THEME.p1,
        backgroundColor: THEME.bg,
    },
    deliveryInfo: {
        flex: 1,
    },
    deliveryName: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.ink,
        marginBottom: 4,
    },
    deliveryPrice: {
        fontSize: 14,
        color: THEME.gray,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: THEME.line,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: THEME.p1,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: THEME.p1,
    },

    /* RATING & REVIEWS */
    ratingSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    rating: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.ink,
    },
    ratingCount: {
        fontSize: 14,
        color: THEME.gray,
    },
    seeAllText: {
        fontSize: 14,
        color: THEME.p1,
        fontWeight: '600',
    },
    reviewItem: {
        padding: 16,
        backgroundColor: THEME.bg,
        borderRadius: 8,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUser: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.ink,
    },
    reviewDate: {
        fontSize: 12,
        color: THEME.gray,
    },
    ratingStars: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    reviewComment: {
        fontSize: 14,
        color: THEME.gray,
        lineHeight: 20,
    },

    /* MOST POPULAR */
    popularList: {
        paddingVertical: 8,
    },
    popularProductCard: {
        width: 140,
        marginRight: 16,
    },
    popularProductImage: {
        width: 140,
        height: 140,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: THEME.bg,
    },
    popularProductName: {
        fontSize: 12,
        color: THEME.text,
        marginBottom: 4,
        lineHeight: 16,
    },
    popularProductPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.ink,
    },

    /* PROMO BANNERS */
    promoSection: {
        padding: 20,
        backgroundColor: THEME.bg,
    },
    promoList: {
        flexDirection: 'row',
        gap: 12,
    },
    promoBanner: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: THEME.p1,
        borderRadius: 20,
    },
    promoText: {
        fontSize: 12,
        fontWeight: '700',
        color: THEME.white,
    },

    /* YOU MIGHT LIKE */
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    productCard: {
        width: '48%',
        marginBottom: 16,
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: THEME.bg,
    },
    productName: {
        fontSize: 12,
        color: THEME.text,
        marginBottom: 4,
        lineHeight: 16,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.ink,
    },

    /* BOTTOM ACTION BAR */
    bottomActionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 20 : 12,
        backgroundColor: THEME.card,
        borderTopWidth: 1,
        borderTopColor: THEME.line,
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    cartActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: THEME.bg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: THEME.line,
        minWidth: 120,
    },
    quantityBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: THEME.card,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: THEME.line,
    },
    quantityBtnDisabled: {
        backgroundColor: THEME.bg,
        opacity: 0.5,
    },
    quantityText: {
        fontSize: 17,
        fontWeight: '800',
        color: THEME.ink,
        minWidth: 32,
        textAlign: 'center',
    },
    addToCartBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    addToCartGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 20,
    },
    addToCartText: {
        color: THEME.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    buyNowBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    buyNowGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 20,
    },
    buyNowText: {
        color: THEME.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    notifyBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
    },
    notifyGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 20,
    },
    notifyText: {
        color: THEME.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    chatbotButton: {
        marginTop: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    chatbotGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    chatbotText: {
        fontSize: 15,
        fontWeight: '600',
        color: THEME.p1,
        marginLeft: 8,
    },

    /* MODAL STYLES */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: THEME.card,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: H * 0.8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: THEME.line,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.ink,
    },
    closeButton: {
        padding: 4,
    },

    /* SIZE GUIDE MODAL */
    sizeGuideContent: {
        padding: 16,
    },
    sizeGuideText: {
        fontSize: 16,
        color: THEME.gray,
        marginBottom: 16,
        lineHeight: 22,
    },
    sizeTable: {
        borderWidth: 1,
        borderColor: THEME.line,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: THEME.bg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.line,
    },
    tableHeaderText: {
        flex: 1,
        padding: 12,
        fontSize: 14,
        fontWeight: '700',
        color: THEME.text,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: THEME.line,
    },
    tableCell: {
        flex: 1,
        padding: 12,
        fontSize: 14,
        color: THEME.gray,
        textAlign: 'center',
    },
    sizeTip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        padding: 12,
        backgroundColor: THEME.bg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: THEME.line,
    },
    sizeTipText: {
        fontSize: 14,
        color: THEME.p1,
        flex: 1,
        lineHeight: 20,
    },

    /* REVIEWS MODAL */
    reviewsContent: {
        padding: 16,
    },
    reviewsCount: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.ink,
        marginBottom: 16,
    },

    /* POLICY MODAL */
    policyContent: {
        padding: 16,
    },
    policyText: {
        fontSize: 14,
        color: THEME.gray,
        lineHeight: 22,
    },

    /* UTILITY STYLES */
    loadingContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    bottomSpacer: {
        height: 20,
    },
    bottomActionBarSpacer: {
        height: 80,
    },
    errorText: {
        color: THEME.ink,
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: THEME.p1,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: THEME.white,
        fontWeight: '600',
        fontSize: 16,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        color: THEME.gray,
        fontSize: 14,
        textAlign: 'center',
    },
    averageRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    averageRatingText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '600',
        color: THEME.ink,
    },
});