// src/screens/CartScreen.js
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Platform,
    Alert,
    useWindowDimensions,
    StatusBar,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from './services/api';

// Safe area helper
const getSafeTop = () => {
    const { width: W, height: H } = Dimensions.get('window');
    const isIOS = Platform.OS === 'ios';
    const hasNotch = isIOS && Math.max(W, H) >= 812;
    if (!isIOS) return StatusBar.currentHeight || 0;
    return hasNotch ? 44 : 20;
};

const CART_STORAGE_KEY = 'user_cart';
const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper function to get image URL
const getImageUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
    }
    return `${IMAGE_BASE_URL}${photo}`;
};

const CartScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation('cart');
    const navigation = useNavigation();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedItems, setSavedItems] = useState(new Set());

    // Responsive helpers
    const getResponsiveSize = (size) => {
        const scale = windowWidth / 375; // Base width iPhone 6/7/8
        return Math.round(size * Math.min(scale, 1.5));
    };
    const responsiveStyles = createResponsiveStyles(windowWidth, windowHeight, theme);

    // Load cart on focus
    useFocusEffect(
        useCallback(() => {
            loadCartItems();
            return () => { };
        }, [])
    );

    const loadCartItems = async () => {
        try {
            // Try to get user_id from storage or auth context
            const userId = await AsyncStorage.getItem('user_id') || '1'; // Fallback to 1 for testing
            
            // Fetch from API
            const response = await api.post('/cart/get', { user_id: userId });
            
            if (response.data.success && response.data.cart) {
                console.log('📦 Cart API response:', JSON.stringify(response.data.cart, null, 2));
                // Transform API response to match local format - use actual data from API
                const transformedCart = response.data.cart.map(item => {
                    // Try multiple image fields - prioritize thumbnail, then photo, then image
                    // Also check if image is already a full URL (from AsyncStorage)
                    let imageSource = item.thumbnail || item.photo || item.image || null;
                    let imageUrl = null;
                    
                    if (imageSource) {
                        // If already a full URL, use it directly
                        if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
                            imageUrl = imageSource;
                        } else {
                            // Construct full URL
                            imageUrl = getImageUrl(imageSource);
                        }
                    }
                    
                    console.log('🖼️ Cart item image processing:', {
                        product_id: item.product_id,
                        product_name: item.name,
                        thumbnail: item.thumbnail,
                        photo: item.photo,
                        image_field: item.image,
                        imageSource,
                        finalImageUrl: imageUrl,
                        rawItemKeys: Object.keys(item || {})
                    });
                    return {
                        id: item.product_id || item.id,
                        product_id: item.product_id || item.id,
                        name: item.name || 'Product',
                        price: parseFloat(item.price || 0),
                        previous_price: item.previous_price ? parseFloat(item.previous_price) : null,
                        image: imageUrl,
                        quantity: parseInt(item.quantity || 1),
                        selectedSize: item.size || item.selected_size || null,
                        selectedColor: item.color || item.selected_color || null,
                        colorHex: item.color_hex || item.color || '#000000',
                        size: item.size || item.selected_size || null,
                        color: item.color || item.selected_color || null,
                        sku: item.sku || '',
                        stock: parseInt(item.stock || 0),
                        // Store raw item for reference
                        rawItem: item
                    };
                });
                console.log('✅ Transformed cart items:', transformedCart.map(item => ({ id: item.id, name: item.name, image: item.image })));
                setCartItems(transformedCart);
            } else {
                // Fallback to local storage
                const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (cartData) {
                    const localCart = JSON.parse(cartData);
                    // Ensure images are properly formatted for local cart items
                    const processedCart = localCart.map(item => {
                        // If image exists but is not a full URL, construct it
                        let imageUrl = item.image;
                        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' && !imageUrl.startsWith('http')) {
                            imageUrl = getImageUrl(imageUrl);
                        }
                        // If no image, try to get from rawItem or construct from product_id
                        if (!imageUrl && item.rawItem) {
                            const rawImage = item.rawItem.thumbnail || item.rawItem.photo || item.rawItem.image;
                            if (rawImage) {
                                imageUrl = getImageUrl(rawImage);
                            }
                        }
                        // If still no image, try to get from rawProduct if available
                        if (!imageUrl && item.rawProduct) {
                            const rawImage = item.rawProduct.thumbnail || item.rawProduct.photo || item.rawProduct.image;
                            if (rawImage) {
                                imageUrl = getImageUrl(rawImage);
                            }
                        }
                        return {
                            ...item,
                            image: imageUrl
                        };
                    });
                    console.log('📦 Loaded from local storage:', processedCart.map(item => ({ id: item.id, name: item.name, image: item.image })));
                    setCartItems(processedCart);
                } else {
                    setCartItems([]);
                }
            }
        } catch (error) {
            console.log('Error loading cart:', error);
            // Fallback to local storage
            try {
                const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (cartData) {
                    const localCart = JSON.parse(cartData);
                    // Ensure images are properly formatted for local cart items
                    const processedCart = localCart.map(item => ({
                        ...item,
                        image: item.image ? (item.image.startsWith('http') ? item.image : getImageUrl(item.image)) : null
                    }));
                    console.log('📦 Loaded from local storage (error fallback):', processedCart.map(item => ({ id: item.id, name: item.name, image: item.image })));
                    setCartItems(processedCart);
                } else {
                    setCartItems([]);
                }
            } catch (e) {
                setCartItems([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateCartItemQuantity = async (itemId, selectedSize, selectedColor, newQuantity) => {
        try {
            const userId = await AsyncStorage.getItem('user_id') || '1';
            
            if (newQuantity > 0) {
                // Update via API
                await api.post('/cart/update', {
                    user_id: userId,
                    product_id: itemId,
                    quantity: newQuantity,
                });
            } else {
                // Remove via API
                await api.post('/cart/remove', {
                    user_id: userId,
                    product_id: itemId,
                });
            }
            
            // Reload cart
            await loadCartItems();
        } catch (error) {
            console.log('Error updating cart:', error);
            // Fallback to local storage
            try {
                const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                let cart = cartData ? JSON.parse(cartData) : [];
                const itemIndex = cart.findIndex(item =>
                    item.id === itemId &&
                    item.selectedSize === selectedSize &&
                    item.selectedColor === selectedColor
                );
                if (itemIndex !== -1) {
                    if (newQuantity > 0) {
                        cart[itemIndex].quantity = newQuantity;
                    } else {
                        cart.splice(itemIndex, 1);
                    }
                    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
                    setCartItems(cart);
                }
            } catch (e) {
                Alert.alert(t('error'), t('error_update'));
            }
        }
    };

    const removeCartItem = async (itemId, selectedSize, selectedColor) => {
        Alert.alert(
            t('remove_item'),
            t('remove_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('remove'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const userId = await AsyncStorage.getItem('user_id') || '1';
                            
                            // Remove via API
                            await api.post('/cart/remove', {
                                user_id: userId,
                                product_id: itemId,
                            });
                            
                            // Reload cart
                            await loadCartItems();
                        } catch (error) {
                            console.log('Error removing item:', error);
                            // Fallback to local storage
                            try {
                                const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                                let cart = cartData ? JSON.parse(cartData) : [];
                                const filteredCart = cart.filter(item =>
                                    !(item.id === itemId &&
                                        item.selectedSize === selectedSize &&
                                        item.selectedColor === selectedColor)
                                );
                                await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filteredCart));
                                setCartItems(filteredCart);
                            } catch (e) {
                                Alert.alert(t('error'), t('error_remove'));
                            }
                        }
                    }
                }
            ]
        );
    };

    const toggleSaveItem = (itemId, selectedSize, selectedColor) => {
        const itemKey = `${itemId}-${selectedSize}-${selectedColor}`;
        const next = new Set(savedItems);
        if (next.has(itemKey)) next.delete(itemKey);
        else next.add(itemKey);
        setSavedItems(next);
    };

    const isItemSaved = (itemId, selectedSize, selectedColor) => {
        const itemKey = `${itemId}-${selectedSize}-${selectedColor}`;
        return savedItems.has(itemKey);
    };

    // Calculate totals from cart items (dynamic from API data)
    const subtotal = cartItems.reduce((sum, item) => {
        const itemPrice = parseFloat(item.price || 0);
        const itemQty = parseInt(item.quantity || 1);
        return sum + (itemPrice * itemQty);
    }, 0);
    
    // Discount calculation - if API provides discount, use it; otherwise calculate from previous_price
    const discount = cartItems.reduce((sum, item) => {
        if (item.previous_price && parseFloat(item.previous_price) > parseFloat(item.price || 0)) {
            const itemDiscount = (parseFloat(item.previous_price) - parseFloat(item.price || 0)) * parseInt(item.quantity || 1);
            return sum + itemDiscount;
        }
        return sum;
    }, 0);
    
    // Shipping - free shipping threshold should come from API or settings (default: 50 BHD)
    const FREE_SHIPPING_THRESHOLD = 50;
    const SHIPPING_COST = 3.000; // Default shipping cost in BHD
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    
    const total = Math.max(0, subtotal - discount + shipping);
    const totalItems = cartItems.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);

    const formatPrice = (price) => `${parseFloat(price).toFixed(3)} BHD`;

    const getColorName = (hex) => {
        const colorMap = {
            '#000000': 'Black', '#f41c1c': 'Red', '#3c34d5': 'Blue', '#c12ec8': 'Purple',
            '#007137': 'Green', '#ffffff': 'White', '#ffa500': 'Orange', '#ffff00': 'Yellow',
            '#808080': 'Gray', '#041c1c': 'Teal',
        };
        return colorMap[hex?.toLowerCase()] || `Color ${hex}`;
    };

    const getDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const renderCartItem = (item, index) => {
        const isSaved = isItemSaved(item.id, item.selectedSize, item.selectedColor);
        const isTablet = windowWidth >= 768;

        return (
            <View
                style={[
                    responsiveStyles.cartItem,
                    isTablet && responsiveStyles.cartItemTablet
                ]}
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
            >
                {/* Selection Checkbox */}
                <TouchableOpacity style={responsiveStyles.checkbox}>
                    <Icon name="check-circle" size={getResponsiveSize(24)} color={theme.p1} />
                </TouchableOpacity>

                {/* Product Image */}
                <View style={responsiveStyles.imageContainer}>
                    <Image
                        source={{ 
                            uri: (item.image && item.image !== 'null' && item.image !== 'undefined' && String(item.image).trim() !== '') 
                                ? String(item.image) 
                                : 'https://via.placeholder.com/80x80?text=No+Image'
                        }}
                        style={responsiveStyles.productImage}
                        resizeMode="cover"
                        onError={(e) => {
                            console.log('❌ Cart image load error for item:', item.id, 'Name:', item.name, 'URL:', item.image);
                            console.log('❌ Error details:', e.nativeEvent);
                        }}
                        onLoad={() => {
                            console.log('✅ Cart image loaded successfully for item:', item.id, 'Name:', item.name, 'URL:', item.image);
                        }}
                    />
                </View>

                {/* Product Details */}
                <View style={responsiveStyles.productDetails}>
                    <Text style={responsiveStyles.productName} numberOfLines={2} ellipsizeMode="tail">
                        {item.name}
                    </Text>

                    {/* Color and Size - only show if available */}
                    {(item.selectedColor || item.color || item.size || item.selectedSize) && (
                        <View style={responsiveStyles.variantContainer}>
                            {(item.selectedColor || item.color) && (
                                <View style={responsiveStyles.variantChip}>
                                    <View style={[responsiveStyles.colorDot, { backgroundColor: item.colorHex || item.color || theme.gray }]} />
                                    <Text style={responsiveStyles.variantText}>{getColorName(item.colorHex || item.color)}</Text>
                                </View>
                            )}
                            {(item.size || item.selectedSize) && (
                                <View style={responsiveStyles.variantChip}>
                                    <Text style={responsiveStyles.variantText}>{item.size || item.selectedSize || t('one_size')}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Seller Info - remove hardcoded seller, get from API if available */}
                    {item.seller_name || item.vendor_name ? (
                        <Text style={responsiveStyles.sellerText}>{t('sold_by', { seller: item.seller_name || item.vendor_name })}</Text>
                    ) : null}

                    {/* Price and Quantity Row */}
                    <View style={responsiveStyles.priceQuantityRow}>
                        <View style={responsiveStyles.priceContainer}>
                            <Text style={responsiveStyles.currentPrice}>{formatPrice(item.price)}</Text>
                            {!!item.previous_price && item.previous_price > item.price && (
                                <Text style={responsiveStyles.originalPrice}>{formatPrice(item.previous_price)}</Text>
                            )}
                        </View>
                    </View>

                    {/* Quantity Controls */}
                    <View style={responsiveStyles.quantityContainer}>
                        <TouchableOpacity
                            style={[responsiveStyles.quantityBtn, item.quantity <= 1 && responsiveStyles.quantityBtnDisabled]}
                            onPress={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Icon name="remove" size={getResponsiveSize(16)} color={item.quantity <= 1 ? theme.muted : theme.ink} />
                        </TouchableOpacity>

                        <Text style={responsiveStyles.quantityText}>{item.quantity}</Text>

                        <TouchableOpacity
                            style={responsiveStyles.quantityBtn}
                            onPress={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        >
                            <Icon name="add" size={getResponsiveSize(16)} color={theme.ink} />
                        </TouchableOpacity>
                    </View>

                    {/* Delivery Estimate */}
                    <View style={responsiveStyles.deliveryEstimate}>
                        <Icon name="local-shipping" size={getResponsiveSize(14)} color={theme.success} />
                        <Text style={responsiveStyles.deliveryText}>
                            {t('delivery_by', { date: getDeliveryDate() })} • {shipping === 0 ? t('free') : formatPrice(shipping)}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={responsiveStyles.actionButtons}>
                        <TouchableOpacity
                            style={responsiveStyles.actionButton}
                            onPress={() => toggleSaveItem(item.id, item.selectedSize, item.selectedColor)}
                        >
                            <Icon
                                name={isSaved ? 'bookmark' : 'bookmark-border'}
                                size={getResponsiveSize(18)}
                                color={isSaved ? theme.p1 : theme.gray}
                            />
                            <Text style={[responsiveStyles.actionButtonText, isSaved && responsiveStyles.savedButtonText]}>
                                {isSaved ? t('saved') : t('save_for_later')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={responsiveStyles.actionButton}
                            onPress={() => removeCartItem(item.id, item.selectedSize, item.selectedColor)}
                        >
                            <Icon name="delete-outline" size={getResponsiveSize(18)} color={theme.gray} />
                            <Text style={responsiveStyles.actionButtonText}>{t('remove')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={responsiveStyles.safe}>
                <View style={responsiveStyles.loadingContainer}>
                    <Icon name="shopping-cart" size={getResponsiveSize(48)} color={theme.p1} />
                    <Text style={responsiveStyles.loadingText}>{t('loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={responsiveStyles.safe}>
                <View style={responsiveStyles.titleSection}>
                    <View>
                        <Text style={responsiveStyles.pageTitle}>{t('shopping_cart')}</Text>
                        <Text style={responsiveStyles.pageSubtitle}>0 {t('items')}</Text>
                    </View>
                </View>

                <View style={responsiveStyles.emptyContainer}>
                    <Icon name="remove-shopping-cart" size={getResponsiveSize(80)} color={theme.muted} />
                    <Text style={responsiveStyles.emptyTitle}>{t('empty_title')}</Text>
                    <Text style={responsiveStyles.emptySubtitle}>{t('empty_subtitle')}</Text>
                    <TouchableOpacity style={responsiveStyles.shopNowButton} onPress={() => navigation.navigate('HomeScreen')}>
                        <LinearGradient
                            colors={[theme.p1, theme.p2]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={responsiveStyles.shopNowGradient}
                        >
                            <Text style={responsiveStyles.shopNowText}>{t('start_shopping')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={responsiveStyles.safe}>
            <View style={responsiveStyles.titleSection}>
                <View>
                    <Text style={responsiveStyles.pageTitle}>{t('shopping_cart')}</Text>
                    <Text style={responsiveStyles.pageSubtitle}>
                        {totalItems} {totalItems === 1 ? t('item') : t('items')}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={responsiveStyles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={responsiveStyles.scrollContent}
            >
                {/* Cart Items */}
                <View style={responsiveStyles.cartItemsSection}>
                    <Text style={responsiveStyles.sectionTitle}>{t('items_in_cart')} ({totalItems})</Text>
                    {cartItems.map((item, index) => renderCartItem(item, index))}
                </View>

                {/* Price Details Card */}
                <View style={responsiveStyles.priceCard}>
                    <Text style={responsiveStyles.priceCardTitle}>{t('price_details')}</Text>

                    <View style={responsiveStyles.priceRow}>
                        <Text style={responsiveStyles.priceLabel}>{t('price')} ({totalItems} {totalItems === 1 ? t('item') : t('items')})</Text>
                        <Text style={responsiveStyles.priceValue}>{formatPrice(subtotal)}</Text>
                    </View>

                    <View style={responsiveStyles.priceRow}>
                        <Text style={responsiveStyles.priceLabel}>{t('discount')}</Text>
                        <Text style={[responsiveStyles.priceValue, responsiveStyles.discountValue]}>- {formatPrice(discount)}</Text>
                    </View>

                    <View style={responsiveStyles.priceRow}>
                        <Text style={responsiveStyles.priceLabel}>{t('delivery_charges')}</Text>
                        <Text style={[responsiveStyles.priceValue, shipping === 0 && responsiveStyles.freeShipping]}>
                            {shipping === 0 ? t('free') : formatPrice(shipping)}
                        </Text>
                    </View>

                    <View style={responsiveStyles.divider} />

                    <View style={responsiveStyles.totalRow}>
                        <Text style={responsiveStyles.totalLabel}>{t('total_amount')}</Text>
                        <Text style={responsiveStyles.totalValue}>{formatPrice(total)}</Text>
                    </View>

                    <Text style={responsiveStyles.savingsText}>{t('you_will_save', { amount: formatPrice(discount) })}</Text>

                    {shipping === 0 && (
                        <View style={responsiveStyles.freeShippingBanner}>
                            <Icon name="local-shipping" size={getResponsiveSize(16)} color={theme.success} />
                            <Text style={responsiveStyles.freeShippingText}>{t('free_shipping')}</Text>
                        </View>
                    )}
                </View>

                {/* Security Banner */}
                <View style={responsiveStyles.securityBanner}>
                    <Icon name="security" size={getResponsiveSize(20)} color={theme.success} />
                    <Text style={responsiveStyles.securityText}>
                        {t('safe_secure')}
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Checkout Bar */}
            <View style={responsiveStyles.checkoutBar}>
                <View style={responsiveStyles.totalContainer}>
                    <Text style={responsiveStyles.bottomTotal}>{formatPrice(total)}</Text>
                    <Text style={responsiveStyles.bottomItems}>
                        {totalItems} {totalItems === 1 ? t('item') : t('items')}
                    </Text>
                </View>
                <TouchableOpacity
                    style={responsiveStyles.checkoutButton}
                    onPress={() => navigation.navigate('CheckoutScreen')}
                >
                    <Text style={responsiveStyles.checkoutButtonText}>{t('proceed_to_checkout')}</Text>
                    <Icon name="arrow-forward" size={getResponsiveSize(20)} color={theme.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Responsive styles (unchanged except no address styles)
const createResponsiveStyles = (windowWidth, windowHeight, theme) => {
    const isTablet = windowWidth >= 768;
    const isSmallScreen = windowWidth < 375;

    const getResponsiveSize = (size) => {
        const scale = windowWidth / 375;
        return Math.round(size * Math.min(scale, 1.5)); // Cap scaling at 1.5x
    };

    const getSpacing = (size) => (isTablet ? size * 1.2 : size);

    return StyleSheet.create({
        safe: { flex: 1, backgroundColor: theme.bg },

        // Title Section
        titleSection: {
            paddingHorizontal: getSpacing(16),
            paddingTop: getSafeTop() + getSpacing(12),
            paddingBottom: getSpacing(12),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        pageTitle: {
            fontSize: getResponsiveSize(28),
            fontWeight: '900',
            color: theme.ink,
            marginBottom: 4,
        },
        pageSubtitle: {
            fontSize: getResponsiveSize(14),
            color: theme.gray,
            fontWeight: '500',
        },

        scrollView: { flex: 1 },
        scrollContent: { paddingBottom: getSpacing(20) },

        loadingContainer: {
            flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg, padding: getSpacing(20),
        },
        loadingText: {
            marginTop: getSpacing(16), fontSize: getResponsiveSize(16), color: theme.gray, fontWeight: '600', textAlign: 'center',
        },

        emptyContainer: {
            flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: getSpacing(40), backgroundColor: theme.bg,
        },
        emptyTitle: {
            fontSize: getResponsiveSize(22), fontWeight: '700', color: theme.ink, marginTop: getSpacing(20),
            marginBottom: getSpacing(8), textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: getResponsiveSize(16), color: theme.gray, textAlign: 'center',
            lineHeight: getResponsiveSize(22), marginBottom: getSpacing(30),
        },
        shopNowButton: {
            borderRadius: 16,
            overflow: 'hidden',
            ...Platform.select({ ios: { shadowColor: theme.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }, android: { elevation: 6 } }),
        },
        shopNowGradient: {
            paddingHorizontal: getSpacing(32),
            paddingVertical: getSpacing(16),
            alignItems: 'center',
            justifyContent: 'center',
        },
        shopNowText: { color: theme.white, fontSize: getResponsiveSize(16), fontWeight: '800', letterSpacing: 0.5 },

        cartItemsSection: {
            backgroundColor: theme.card, marginHorizontal: getSpacing(16), marginBottom: getSpacing(16),
            borderRadius: 12, overflow: 'hidden',
            ...Platform.select({ ios: { shadowColor: theme.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 3 } }),
        },
        sectionTitle: {
            fontSize: getResponsiveSize(16), fontWeight: '700', color: theme.ink, padding: getSpacing(16),
            backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.line,
        },
        cartItem: {
            flexDirection: 'row', padding: getSpacing(16), borderBottomWidth: 1, borderBottomColor: theme.line, backgroundColor: theme.card,
        },
        cartItemTablet: { padding: getSpacing(20) },
        checkbox: { marginRight: getSpacing(12), justifyContent: 'flex-start' },
        imageContainer: { marginRight: getSpacing(12) },
        productImage: { 
            width: getResponsiveSize(80), 
            height: getResponsiveSize(80), 
            borderRadius: 8, 
            backgroundColor: theme.bg,
            minWidth: 80,
            minHeight: 80,
        },
        productDetails: { flex: 1 },
        productName: { fontSize: getResponsiveSize(14), fontWeight: '600', color: theme.ink, lineHeight: getResponsiveSize(18), marginBottom: getSpacing(6) },
        variantContainer: { flexDirection: 'row', marginBottom: getSpacing(6), flexWrap: 'wrap' },
        variantChip: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg, paddingHorizontal: getSpacing(8),
            paddingVertical: getSpacing(4), borderRadius: 6, marginRight: getSpacing(8), marginBottom: getSpacing(4),
        },
        colorDot: { width: getResponsiveSize(12), height: getResponsiveSize(12), borderRadius: getResponsiveSize(6), marginRight: getSpacing(4), borderWidth: 1, borderColor: theme.line },
        variantText: { fontSize: getResponsiveSize(10), color: theme.gray, fontWeight: '500' },
        sellerText: { fontSize: getResponsiveSize(11), color: theme.muted, marginBottom: getSpacing(8) },

        priceQuantityRow: {
            flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'space-between', alignItems: isSmallScreen ? 'flex-start' : 'center',
            marginBottom: getSpacing(8),
        },
        priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: isSmallScreen ? getSpacing(8) : 0 },
        currentPrice: { fontSize: getResponsiveSize(16), fontWeight: '700', color: theme.ink, marginRight: getSpacing(8) },
        originalPrice: { fontSize: getResponsiveSize(12), color: theme.muted, textDecorationLine: 'line-through' },

        quantityContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: getSpacing(4) },
        quantityBtn: {
            width: getResponsiveSize(28), height: getResponsiveSize(28), borderRadius: 6, backgroundColor: theme.white,
            justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.line,
        },
        quantityBtnDisabled: { backgroundColor: theme.bg },
        quantityText: { fontSize: getResponsiveSize(14), fontWeight: '600', color: theme.ink, marginHorizontal: getSpacing(12), minWidth: getResponsiveSize(20), textAlign: 'center' },

        deliveryEstimate: { flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing(12) },
        deliveryText: { fontSize: getResponsiveSize(12), color: theme.success, fontWeight: '500', marginLeft: getSpacing(6) },

        actionButtons: { flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'space-between', gap: isSmallScreen ? getSpacing(8) : 0 },
        actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: getSpacing(8), paddingHorizontal: getSpacing(12) },
        actionButtonText: { fontSize: getResponsiveSize(12), color: theme.gray, fontWeight: '500', marginLeft: getSpacing(4) },
        savedButtonText: { color: theme.p1, fontWeight: '600' },

        priceCard: {
            backgroundColor: theme.card, marginHorizontal: getSpacing(16), marginBottom: getSpacing(16), padding: getSpacing(16), borderRadius: 12,
            ...Platform.select({ ios: { shadowColor: theme.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 3 } }),
        },
        priceCardTitle: { fontSize: getResponsiveSize(14), fontWeight: '700', color: theme.ink, marginBottom: getSpacing(16), letterSpacing: 0.5 },
        priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: getSpacing(12) },
        priceLabel: { fontSize: getResponsiveSize(14), color: theme.gray },
        priceValue: { fontSize: getResponsiveSize(14), fontWeight: '600', color: theme.ink },
        discountValue: { color: theme.success },
        freeShipping: { color: theme.success, fontWeight: '700' },
        divider: { height: 1, backgroundColor: theme.line, marginVertical: getSpacing(8) },
        totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: getSpacing(8) },
        totalLabel: { fontSize: getResponsiveSize(16), fontWeight: '700', color: theme.ink },
        totalValue: { fontSize: getResponsiveSize(18), fontWeight: '700', color: theme.p1 },
        savingsText: { fontSize: getResponsiveSize(12), color: theme.success, fontWeight: '500', textAlign: 'center', marginTop: getSpacing(8) },
        freeShippingBanner: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.p4, padding: getSpacing(8),
            borderRadius: 6, marginTop: getSpacing(12),
        },
        freeShippingText: { fontSize: getResponsiveSize(12), color: theme.success, fontWeight: '600', marginLeft: getSpacing(6) },

        securityBanner: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, marginHorizontal: getSpacing(16),
            marginBottom: getSpacing(20), padding: getSpacing(16), borderRadius: 12,
            ...Platform.select({ ios: { shadowColor: theme.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }, android: { elevation: 2 } }),
        },
        securityText: { fontSize: getResponsiveSize(12), color: theme.gray, marginLeft: getSpacing(8), flex: 1, lineHeight: getResponsiveSize(16) },

        checkoutBar: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.card,
            paddingHorizontal: getSpacing(16), paddingVertical: getSpacing(12), borderTopWidth: 1, borderTopColor: theme.line,
            ...Platform.select({ ios: { shadowColor: theme.ink, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 8 } }),
        },
        totalContainer: { flex: 1 },
        bottomTotal: { fontSize: getResponsiveSize(18), fontWeight: '700', color: theme.p1, marginBottom: 2 },
        bottomItems: { fontSize: getResponsiveSize(12), color: theme.gray },
        checkoutButton: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: theme.p1,
            paddingHorizontal: getSpacing(isTablet ? 32 : 24), paddingVertical: getSpacing(14), borderRadius: 8,
            ...Platform.select({ ios: { shadowColor: theme.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }, android: { elevation: 4 } }),
        },
        checkoutButtonText: { color: theme.white, fontSize: getResponsiveSize(14), fontWeight: '700', marginRight: getSpacing(8) },
    });
};

export default CartScreen;
