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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from './constants/Colors';
import { cartAPI, getUserId } from './services/api';

const CART_STORAGE_KEY = 'user_cart';
const USER_STORAGE_KEY = 'luna_user';
const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper to get full image URL
const getImageUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300';
    if (photo.startsWith('http')) return photo;
    return `${IMAGE_BASE_URL}${photo}`;
};

const CartScreen = () => {
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
    const responsiveStyles = createResponsiveStyles(windowWidth, windowHeight);

    // Load cart on focus
    useFocusEffect(
        useCallback(() => {
            loadCartItems();
            return () => { };
        }, [])
    );

    const loadCartItems = async () => {
        try {
            setLoading(true);
            const userId = await getUserId();
            
            if (!userId) {
                // No user logged in, try AsyncStorage as fallback
                const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (cartData) {
                    setCartItems(JSON.parse(cartData));
                } else {
                    setCartItems([]);
                }
                return;
            }

            // Load cart from API
            const response = await cartAPI.getCart(userId);
            
            if (response.data.success && response.data.cart) {
                // Transform API response to match UI structure
                const transformedCart = response.data.cart.map(item => ({
                    id: item.product_id || item.id,
                    product_id: item.product_id,
                    cart_id: item.id, // Keep cart ID for reference
                    name: item.name || 'Product',
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity || 1,
                    image: getImageUrl(item.photo || item.thumbnail),
                    photo: item.photo || item.thumbnail,
                    sku: item.sku || '',
                    stock: item.stock || 0,
                    selectedSize: item.size || '',
                    selectedColor: item.color || '',
                    colorHex: item.color || '#000000',
                    size: item.size || '',
                    previous_price: item.previous_price || null,
                }));
                
                setCartItems(transformedCart);
                
                // Also save to AsyncStorage for offline support
                await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(transformedCart));
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.log('Error loading cart:', error);
            // Fallback to AsyncStorage on error
            try {
                const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (cartData) {
                    setCartItems(JSON.parse(cartData));
                } else {
                    setCartItems([]);
                }
            } catch (storageError) {
                setCartItems([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateCartItemQuantity = async (itemId, selectedSize, selectedColor, newQuantity) => {
        try {
            const userId = await getUserId();
            const productId = itemId; // Use product_id for API

            if (!userId) {
                // Fallback to AsyncStorage if not logged in
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
                return;
            }

            if (newQuantity <= 0) {
                // Remove item
                await removeCartItem(itemId, selectedSize, selectedColor);
                return;
            }

            // Update via API
            const response = await cartAPI.updateCart(userId, productId, newQuantity);
            
            if (response.data.success) {
                // Reload cart to get updated data
                await loadCartItems();
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update cart item');
            }
        } catch (error) {
            console.log('Error updating cart:', error);
            Alert.alert('Error', 'Failed to update cart item. Please try again.');
        }
    };

    const removeCartItem = async (itemId, selectedSize, selectedColor, showAlert = true) => {
        const performRemove = async () => {
            try {
                const userId = await getUserId();
                const productId = itemId; // Use product_id for API

                if (!userId) {
                    // Fallback to AsyncStorage if not logged in
                    const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                    let cart = cartData ? JSON.parse(cartData) : [];
                    const filteredCart = cart.filter(item =>
                        !(item.id === itemId &&
                            item.selectedSize === selectedSize &&
                            item.selectedColor === selectedColor)
                    );
                    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filteredCart));
                    setCartItems(filteredCart);
                    return;
                }

                // Remove via API
                const response = await cartAPI.removeFromCart(userId, productId);
                
                if (response.data.success) {
                    // Reload cart to get updated data
                    await loadCartItems();
                } else {
                    Alert.alert('Error', response.data.message || 'Failed to remove item from cart');
                }
            } catch (error) {
                console.log('Error removing item:', error);
                Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
            }
        };

        if (showAlert) {
            Alert.alert(
                'Remove Item',
                'Are you sure you want to remove this item from your cart?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: performRemove
                    }
                ]
            );
        } else {
            await performRemove();
        }
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

    // Totals (KWD)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * 0.10; // 10% discount
    const shipping = subtotal > 50 ? 0 : 49.000; // Free shipping above 50 KWD
    const total = subtotal - discount + shipping;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const formatPrice = (price) => `${parseFloat(price).toFixed(3)} KWD`;

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
                    <Icon name="check-circle" size={getResponsiveSize(24)} color={Colors.p1} />
                </TouchableOpacity>

                {/* Product Image */}
                <View style={responsiveStyles.imageContainer}>
                    <Image
                        source={{ uri: item.image || 'https://via.placeholder.com/80x80' }}
                        style={responsiveStyles.productImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Product Details */}
                <View style={responsiveStyles.productDetails}>
                    <Text style={responsiveStyles.productName} numberOfLines={2} ellipsizeMode="tail">
                        {item.name}
                    </Text>

                    {/* Color and Size */}
                    <View style={responsiveStyles.variantContainer}>
                        <View style={responsiveStyles.variantChip}>
                            <View style={[responsiveStyles.colorDot, { backgroundColor: item.colorHex || Colors.gray }]} />
                            <Text style={responsiveStyles.variantText}>{getColorName(item.colorHex)}</Text>
                        </View>
                        <View style={responsiveStyles.variantChip}>
                            <Text style={responsiveStyles.variantText}>{item.size || 'One Size'}</Text>
                        </View>
                    </View>

                    {/* Seller Info */}
                    <Text style={responsiveStyles.sellerText}>Sold by: ProteinBros Bahrain</Text>

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
                            <Icon name="remove" size={getResponsiveSize(16)} color={item.quantity <= 1 ? Colors.muted : Colors.ink} />
                        </TouchableOpacity>

                        <Text style={responsiveStyles.quantityText}>{item.quantity}</Text>

                        <TouchableOpacity
                            style={responsiveStyles.quantityBtn}
                            onPress={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        >
                            <Icon name="add" size={getResponsiveSize(16)} color={Colors.ink} />
                        </TouchableOpacity>
                    </View>

                    {/* Delivery Estimate */}
                    <View style={responsiveStyles.deliveryEstimate}>
                        <Icon name="local-shipping" size={getResponsiveSize(14)} color={Colors.success} />
                        <Text style={responsiveStyles.deliveryText}>
                            Delivery by {getDeliveryDate()} • {shipping === 0 ? 'FREE' : formatPrice(shipping)}
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
                                color={isSaved ? Colors.p1 : Colors.gray}
                            />
                            <Text style={[responsiveStyles.actionButtonText, isSaved && responsiveStyles.savedButtonText]}>
                                {isSaved ? 'Saved' : 'Save for later'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={responsiveStyles.actionButton}
                            onPress={() => removeCartItem(item.id, item.selectedSize, item.selectedColor)}
                        >
                            <Icon name="delete-outline" size={getResponsiveSize(18)} color={Colors.gray} />
                            <Text style={responsiveStyles.actionButtonText}>Remove</Text>
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
                    <Icon name="shopping-cart" size={getResponsiveSize(48)} color={Colors.p1} />
                    <Text style={responsiveStyles.loadingText}>Loading your cart...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={responsiveStyles.safe}>
                <View style={responsiveStyles.titleSection}>
                    <View>
                        <Text style={responsiveStyles.pageTitle}>Shopping Cart</Text>
                        <Text style={responsiveStyles.pageSubtitle}>0 items</Text>
                    </View>
                </View>

                <View style={responsiveStyles.emptyContainer}>
                    <Icon name="remove-shopping-cart" size={getResponsiveSize(80)} color={Colors.muted} />
                    <Text style={responsiveStyles.emptyTitle}>Your cart is empty</Text>
                    <Text style={responsiveStyles.emptySubtitle}>Browse our categories and discover our best deals!</Text>
                    <TouchableOpacity style={responsiveStyles.shopNowButton} onPress={() => navigation.navigate('HomeScreen')}>
                        <LinearGradient
                            colors={[Colors.p1, Colors.p2]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={responsiveStyles.shopNowGradient}
                        >
                            <Text style={responsiveStyles.shopNowText}>START SHOPPING</Text>
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
                    <Text style={responsiveStyles.pageTitle}>Shopping Cart</Text>
                    <Text style={responsiveStyles.pageSubtitle}>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
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
                    <Text style={responsiveStyles.sectionTitle}>Items in your cart ({totalItems})</Text>
                    {cartItems.map((item, index) => renderCartItem(item, index))}
                </View>

                {/* Price Details Card */}
                <View style={responsiveStyles.priceCard}>
                    <Text style={responsiveStyles.priceCardTitle}>PRICE DETAILS</Text>

                    <View style={responsiveStyles.priceRow}>
                        <Text style={responsiveStyles.priceLabel}>Price ({totalItems} {totalItems === 1 ? 'item' : 'items'})</Text>
                        <Text style={responsiveStyles.priceValue}>{formatPrice(subtotal)}</Text>
                    </View>

                    <View style={responsiveStyles.priceRow}>
                        <Text style={responsiveStyles.priceLabel}>Discount</Text>
                        <Text style={[responsiveStyles.priceValue, responsiveStyles.discountValue]}>- {formatPrice(discount)}</Text>
                    </View>

                    <View style={responsiveStyles.priceRow}>
                        <Text style={responsiveStyles.priceLabel}>Delivery Charges</Text>
                        <Text style={[responsiveStyles.priceValue, shipping === 0 && responsiveStyles.freeShipping]}>
                            {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                        </Text>
                    </View>

                    <View style={responsiveStyles.divider} />

                    <View style={responsiveStyles.totalRow}>
                        <Text style={responsiveStyles.totalLabel}>Total Amount</Text>
                        <Text style={responsiveStyles.totalValue}>{formatPrice(total)}</Text>
                    </View>

                    <Text style={responsiveStyles.savingsText}>You will save {formatPrice(discount)} on this order</Text>

                    {shipping === 0 && (
                        <View style={responsiveStyles.freeShippingBanner}>
                            <Icon name="local-shipping" size={getResponsiveSize(16)} color={Colors.success} />
                            <Text style={responsiveStyles.freeShippingText}>You qualify for free shipping!</Text>
                        </View>
                    )}
                </View>

                {/* Security Banner */}
                <View style={responsiveStyles.securityBanner}>
                    <Icon name="security" size={getResponsiveSize(20)} color={Colors.success} />
                    <Text style={responsiveStyles.securityText}>
                        Safe and Secure Payments. Easy returns. 100% Authentic products.
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Checkout Bar */}
            <View style={responsiveStyles.checkoutBar}>
                <View style={responsiveStyles.totalContainer}>
                    <Text style={responsiveStyles.bottomTotal}>{formatPrice(total)}</Text>
                    <Text style={responsiveStyles.bottomItems}>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={responsiveStyles.checkoutButton}
                    onPress={() => navigation.navigate('CheckoutScreen')}
                >
                    <Text style={responsiveStyles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
                    <Icon name="arrow-forward" size={getResponsiveSize(20)} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Responsive styles (unchanged except no address styles)
const createResponsiveStyles = (windowWidth, windowHeight) => {
    const isTablet = windowWidth >= 768;
    const isSmallScreen = windowWidth < 375;

    const getResponsiveSize = (size) => {
        const scale = windowWidth / 375;
        return Math.round(size * Math.min(scale, 1.5)); // Cap scaling at 1.5x
    };

    const getSpacing = (size) => (isTablet ? size * 1.2 : size);

    return StyleSheet.create({
        safe: { flex: 1, backgroundColor: Colors.bg },

        // Title Section
        titleSection: {
            paddingHorizontal: getSpacing(16),
            paddingVertical: getSpacing(16),
            backgroundColor: Colors.card,
            borderBottomWidth: 1,
            borderBottomColor: Colors.line,
        },
        pageTitle: {
            fontSize: getResponsiveSize(24),
            fontWeight: '700',
            color: Colors.ink,
            marginBottom: getSpacing(4),
        },
        pageSubtitle: {
            fontSize: getResponsiveSize(14),
            color: Colors.gray,
            fontWeight: '500',
        },

        // Gradient Header
        headerGradient: {
            paddingHorizontal: getSpacing(16),
            paddingBottom: getSpacing(12),
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        headerBack: {
            width: 32, height: 32, borderRadius: 16,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.18)',
        },
        headerGradientTitle: {
            flex: 1, textAlign: 'center', color: Colors.white,
            fontSize: getResponsiveSize(18), fontWeight: '700', letterSpacing: 0.3,
        },

        scrollView: { flex: 1 },
        scrollContent: { paddingBottom: getSpacing(20) },

        loadingContainer: {
            flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg, padding: getSpacing(20),
        },
        loadingText: {
            marginTop: getSpacing(16), fontSize: getResponsiveSize(16), color: Colors.gray, fontWeight: '600', textAlign: 'center',
        },

        emptyContainer: {
            flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: getSpacing(40), backgroundColor: Colors.bg,
        },
        emptyTitle: {
            fontSize: getResponsiveSize(22), fontWeight: '700', color: Colors.ink, marginTop: getSpacing(20),
            marginBottom: getSpacing(8), textAlign: 'center',
        },
        emptySubtitle: {
            fontSize: getResponsiveSize(16), color: Colors.gray, textAlign: 'center',
            lineHeight: getResponsiveSize(22), marginBottom: getSpacing(30),
        },
        shopNowButton: {
            backgroundColor: Colors.p1, paddingHorizontal: getSpacing(32), paddingVertical: getSpacing(16),
            borderRadius: 8, ...Platform.select({ ios: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }, android: { elevation: 4 } }),
        },
        shopNowText: { color: Colors.white, fontSize: getResponsiveSize(16), fontWeight: '700' },

        cartItemsSection: {
            backgroundColor: Colors.card, marginHorizontal: getSpacing(16), marginBottom: getSpacing(16),
            borderRadius: 12, overflow: 'hidden',
            ...Platform.select({ ios: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 3 } }),
        },
        sectionTitle: {
            fontSize: getResponsiveSize(16), fontWeight: '700', color: Colors.ink, padding: getSpacing(16),
            backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.line,
        },
        cartItem: {
            flexDirection: 'row', padding: getSpacing(16), borderBottomWidth: 1, borderBottomColor: Colors.line, backgroundColor: Colors.card,
        },
        cartItemTablet: { padding: getSpacing(20) },
        checkbox: { marginRight: getSpacing(12), justifyContent: 'flex-start' },
        imageContainer: { marginRight: getSpacing(12) },
        productImage: { width: getResponsiveSize(80), height: getResponsiveSize(80), borderRadius: 8, backgroundColor: Colors.bg },
        productDetails: { flex: 1 },
        productName: { fontSize: getResponsiveSize(14), fontWeight: '600', color: Colors.ink, lineHeight: getResponsiveSize(18), marginBottom: getSpacing(6) },
        variantContainer: { flexDirection: 'row', marginBottom: getSpacing(6), flexWrap: 'wrap' },
        variantChip: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg, paddingHorizontal: getSpacing(8),
            paddingVertical: getSpacing(4), borderRadius: 6, marginRight: getSpacing(8), marginBottom: getSpacing(4),
        },
        colorDot: { width: getResponsiveSize(12), height: getResponsiveSize(12), borderRadius: getResponsiveSize(6), marginRight: getSpacing(4), borderWidth: 1, borderColor: Colors.line },
        variantText: { fontSize: getResponsiveSize(10), color: Colors.gray, fontWeight: '500' },
        sellerText: { fontSize: getResponsiveSize(11), color: Colors.muted, marginBottom: getSpacing(8) },

        priceQuantityRow: {
            flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'space-between', alignItems: isSmallScreen ? 'flex-start' : 'center',
            marginBottom: getSpacing(8),
        },
        priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: isSmallScreen ? getSpacing(8) : 0 },
        currentPrice: { fontSize: getResponsiveSize(16), fontWeight: '700', color: Colors.ink, marginRight: getSpacing(8) },
        originalPrice: { fontSize: getResponsiveSize(12), color: Colors.muted, textDecorationLine: 'line-through' },

        quantityContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: getSpacing(4) },
        quantityBtn: {
            width: getResponsiveSize(28), height: getResponsiveSize(28), borderRadius: 6, backgroundColor: Colors.white,
            justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.line,
        },
        quantityBtnDisabled: { backgroundColor: Colors.bg },
        quantityText: { fontSize: getResponsiveSize(14), fontWeight: '600', color: Colors.ink, marginHorizontal: getSpacing(12), minWidth: getResponsiveSize(20), textAlign: 'center' },

        deliveryEstimate: { flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing(12) },
        deliveryText: { fontSize: getResponsiveSize(12), color: Colors.success, fontWeight: '500', marginLeft: getSpacing(6) },

        actionButtons: { flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'space-between', gap: isSmallScreen ? getSpacing(8) : 0 },
        actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: getSpacing(8), paddingHorizontal: getSpacing(12) },
        actionButtonText: { fontSize: getResponsiveSize(12), color: Colors.gray, fontWeight: '500', marginLeft: getSpacing(4) },
        savedButtonText: { color: Colors.p1, fontWeight: '600' },

        priceCard: {
            backgroundColor: Colors.card, marginHorizontal: getSpacing(16), marginBottom: getSpacing(16), padding: getSpacing(16), borderRadius: 12,
            ...Platform.select({ ios: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 3 } }),
        },
        priceCardTitle: { fontSize: getResponsiveSize(14), fontWeight: '700', color: Colors.ink, marginBottom: getSpacing(16), letterSpacing: 0.5 },
        priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: getSpacing(12) },
        priceLabel: { fontSize: getResponsiveSize(14), color: Colors.gray },
        priceValue: { fontSize: getResponsiveSize(14), fontWeight: '600', color: Colors.ink },
        discountValue: { color: Colors.success },
        freeShipping: { color: Colors.success, fontWeight: '700' },
        divider: { height: 1, backgroundColor: Colors.line, marginVertical: getSpacing(8) },
        totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: getSpacing(8) },
        totalLabel: { fontSize: getResponsiveSize(16), fontWeight: '700', color: Colors.ink },
        totalValue: { fontSize: getResponsiveSize(18), fontWeight: '700', color: Colors.p1 },
        savingsText: { fontSize: getResponsiveSize(12), color: Colors.success, fontWeight: '500', textAlign: 'center', marginTop: getSpacing(8) },
        freeShippingBanner: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.p4, padding: getSpacing(8),
            borderRadius: 6, marginTop: getSpacing(12),
        },
        freeShippingText: { fontSize: getResponsiveSize(12), color: Colors.success, fontWeight: '600', marginLeft: getSpacing(6) },

        securityBanner: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, marginHorizontal: getSpacing(16),
            marginBottom: getSpacing(20), padding: getSpacing(16), borderRadius: 12,
            ...Platform.select({ ios: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }, android: { elevation: 2 } }),
        },
        securityText: { fontSize: getResponsiveSize(12), color: Colors.gray, marginLeft: getSpacing(8), flex: 1, lineHeight: getResponsiveSize(16) },

        checkoutBar: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card,
            paddingHorizontal: getSpacing(16), paddingVertical: getSpacing(12), borderTopWidth: 1, borderTopColor: Colors.line,
            ...Platform.select({ ios: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 8 } }),
        },
        totalContainer: { flex: 1 },
        bottomTotal: { fontSize: getResponsiveSize(18), fontWeight: '700', color: Colors.p1, marginBottom: 2 },
        bottomItems: { fontSize: getResponsiveSize(12), color: Colors.gray },
        checkoutButton: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.p1,
            paddingHorizontal: getSpacing(isTablet ? 32 : 24), paddingVertical: getSpacing(14), borderRadius: 8,
            ...Platform.select({ ios: { shadowColor: Colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }, android: { elevation: 4 } }),
        },
        checkoutButtonText: { color: Colors.white, fontSize: getResponsiveSize(14), fontWeight: '700', marginRight: getSpacing(8) },
    });
};

export default CartScreen;
