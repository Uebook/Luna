// src/screens/CheckoutScreen.js
import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    TextInput,
    ActivityIndicator,
    I18nManager,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StandardHeader from '../components/StandardHeader';
import { addressAPI, orderAPI, voucherAPI, getUserId } from '../services/api';

const CART_STORAGE_KEY = 'user_cart';
const USER_STORAGE_KEY = 'luna_user';

const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Normalize user data (same as profile page) - defined at module level like SettingsProfileScreen
const normalizeUser = (raw) => {
    const u = raw && raw.user ? raw.user : (raw && raw.data ? raw.data : (raw || {}));
    return {
        id: u.id || null,
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        photo: u.photo || null,
        gender: u.gender || null,
        country: u.country || 'Bahrain',
        date_of_birth: u.date_of_birth || null,
    };
};

// Helper to get full image URL
const getImageUrl = (photo) => {
    if (!photo) return 'https://via.placeholder.com/300';
    if (photo.startsWith('http')) return photo;
    return `${IMAGE_BASE_URL}${photo}`;
};

let BlurViewOptional = View;
try {
    const { BlurView } = require('@react-native-community/blur');
    BlurViewOptional = BlurView;
} catch (_) { }

const isRTL = I18nManager.isRTL;
const dirRow = { flexDirection: isRTL ? 'row-reverse' : 'row' };
const dirBetween = { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' };

const CheckoutScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    
    const COLORS = {
        bg: theme.bg,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
        brandSoft: theme.p4,
        card: theme.card,
        danger: theme.danger,
        success: theme.success,
        muted: theme.muted,
        chip: theme.p4,
        backdrop: 'rgba(0,0,0,0.35)',
    };
    const styles = useMemo(() => createStyles(COLORS, isDark), [COLORS, isDark]);
    const { t } = useTranslation(['checkout', 'common']);
    const CURRENCY = 'BHD'; // Fixed to BHD

    const [loading, setLoading] = useState(true);
    const [voucherModal, setVoucherModal] = useState(false);
    const [addrModal, setAddrModal] = useState(false);
    const [contactModal, setContactModal] = useState(false);

    const [payState, setPayState] = useState('idle');
    const [payVisible, setPayVisible] = useState(false);

    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [shipping, setShipping] = useState('standard');

    const [country, setCountry] = useState('Bahrain');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');

    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Debug: Log cart items when they change
    useEffect(() => {
        console.log('🛒 Cart items updated:', cartItems.length, 'items');
        if (cartItems.length > 0) {
            console.log('🛒 First item:', cartItems[0]);
        }
    }, [cartItems]);

    // Load data on focus
    useFocusEffect(
        useCallback(() => {
            loadCheckoutData();
            return () => {};
        }, [])
    );

    const loadCheckoutData = async () => {
        try {
            setLoading(true);
            
            // Load cart items from AsyncStorage (local management)
            try {
                const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (cartData) {
                    const cart = JSON.parse(cartData);
                    if (Array.isArray(cart) && cart.length > 0) {
                        const transformedCart = cart.map(item => ({
                            id: item.product_id || item.id,
                            product_id: item.product_id || item.id,
                            cart_id: item.cart_id || item.id,
                            title: item.name || item.title || 'Product',
                            name: item.name || item.title || 'Product',
                            price: parseFloat(item.price) || 0,
                            qty: item.quantity || item.qty || 1,
                            quantity: item.quantity || item.qty || 1,
                            image: getImageUrl(item.photo || item.image),
                            photo: item.photo || item.image,
                            size: item.size || item.selectedSize || '',
                            color: item.color || item.selectedColor || '',
                            selectedSize: item.size || item.selectedSize || '',
                            selectedColor: item.color || item.selectedColor || '',
                        }));
                        console.log('✅ Loaded cart from local storage:', transformedCart.length, 'items');
                        setCartItems(transformedCart);
                    } else {
                        setCartItems([]);
                    }
                } else {
                    setCartItems([]);
                }
            } catch (storageError) {
                console.log('Error loading cart from storage:', storageError);
                setCartItems([]);
            }
            
            const userId = await getUserId();
            
            if (!userId) {
                // Load user contact info from storage (same approach as profile page)
                try {
                    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
                    if (userData) {
                        const parsed = JSON.parse(userData);
                        const normalizedUser = normalizeUser(parsed);
                        setPhone(normalizedUser.phone || '');
                        setEmail(normalizedUser.email || '');
                        console.log('✅ Loaded contact info (no userId):', {
                            phone: normalizedUser.phone,
                            email: normalizedUser.email
                        });
                    }
                } catch (userError) {
                    console.log('Error loading user data:', userError);
                }
                
                setLoading(false);
                return;
            }

            // Load addresses
            try {
                const addressResponse = await addressAPI.getAddresses(userId);
                if (addressResponse.data.success && addressResponse.data.addresses) {
                    const addrList = Array.isArray(addressResponse.data.addresses) 
                        ? addressResponse.data.addresses 
                        : [];
                    setAddresses(addrList);
                    // Select default address or first address
                    const defaultAddr = addrList.find(a => a.is_default === 1 || a.is_default === true) || addrList[0];
                    if (defaultAddr) {
                        setSelectedAddress(defaultAddr);
                        setCountry(defaultAddr.country || 'Bahrain');
                        setAddressLine(defaultAddr.address || defaultAddr.address_line || '');
                        setCity(defaultAddr.city || '');
                        setPostcode(defaultAddr.postcode || defaultAddr.postal_code || '');
                    }
                }
            } catch (addrError) {
                console.log('Error loading addresses:', addrError);
                // Continue without addresses - user can add manually
            }

            // Load user contact info (same approach as profile page)
            try {
                const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
                if (userData) {
                    const parsed = JSON.parse(userData);
                    const normalizedUser = normalizeUser(parsed);
                    setPhone(normalizedUser.phone || '');
                    setEmail(normalizedUser.email || '');
                    console.log('✅ Loaded contact info from user storage:', {
                        phone: normalizedUser.phone,
                        email: normalizedUser.email
                    });
                }
            } catch (userError) {
                console.log('Error loading user data:', userError);
            }

            // Load vouchers (optional - don't fail if this errors)
            try {
                const voucherResponse = await voucherAPI.getUserVouchers(userId);
                if (voucherResponse.data.success && voucherResponse.data.vouchers) {
                    setVouchers(voucherResponse.data.vouchers);
                }
            } catch (voucherError) {
                console.log('Error loading vouchers:', voucherError);
                // Continue without vouchers
            }
        } catch (error) {
            console.log('Error loading checkout data:', error);
            // Don't show alert for every error - just log it
            // Only show alert if it's a critical error
        } finally {
            setLoading(false);
        }
    };

    const itemsTotal = useMemo(() => cartItems.reduce((s, it) => s + (it.price * it.qty), 0), [cartItems]);
    const shippingCost = shipping === 'standard' ? 0 : 12;
    const discount = selectedVoucher?.type === 'percent' ? (itemsTotal * selectedVoucher.value) / 100 : (selectedVoucher?.value || 0);
    const total = Math.max(0, itemsTotal - discount) + shippingCost;

    const renderItem = ({ item }) => {
        const itemImage = item.image || getImageUrl(item.photo) || 'https://via.placeholder.com/100';
        const itemTitle = item.title || item.name || 'Product';
        const itemPrice = parseFloat(item.price) || 0;
        const itemQty = item.qty || item.quantity || 1;
        const totalItemPrice = itemPrice * itemQty;

        return (
            <View style={styles.itemRow}>
                <View style={styles.thumbWrap}>
                    <Image 
                        source={{ uri: itemImage }} 
                        style={styles.thumb}
                        onError={(e) => {
                            console.log('Image load error:', itemImage);
                        }}
                    />
                    <View style={styles.qtyBadge}>
                        <Text style={styles.qtyText}>{itemQty}</Text>
                    </View>
                </View>
                <View style={styles.itemDetails}>
                    <Text numberOfLines={2} style={styles.itemTitle}>{itemTitle}</Text>
                    {item.size && (
                        <Text style={styles.itemVariant}>Size: {item.size}</Text>
                    )}
                    {item.color && (
                        <Text style={styles.itemVariant}>Color: {item.color}</Text>
                    )}
                    <View style={styles.itemPriceRow}>
                        <Text style={styles.itemPrice}>
                            {CURRENCY} {itemPrice.toFixed(3)} × {itemQty}
                        </Text>
                        <Text style={styles.itemTotalPrice}>
                            {CURRENCY} {totalItemPrice.toFixed(3)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const applyVoucher = v => { setSelectedVoucher(v); setVoucherModal(false); };
    const removeVoucher = () => setSelectedVoucher(null);

    const handlePay = async () => {
        try {
            const userId = await getUserId();
            if (!userId) {
                Alert.alert('Error', 'Please login to continue');
                return;
            }

            if (!selectedAddress && (!addressLine || !city)) {
                Alert.alert('Error', 'Please provide shipping address');
                return;
            }

            if (!phone || !email) {
                Alert.alert('Error', 'Please provide contact information');
                return;
            }

            if (cartItems.length === 0) {
                Alert.alert('Error', 'Your cart is empty');
                return;
            }

            setPayVisible(true);
            setPayState('processing');

            // Prepare order data
            const orderData = {
                user_id: userId,
                products: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.qty,
                    price: item.price,
                })),
                shipping_address: selectedAddress ? {
                    address_id: selectedAddress.id,
                } : {
                    country: country,
                    address: addressLine,
                    city: city,
                    postcode: postcode,
                },
                contact: {
                    phone: phone,
                    email: email,
                },
                shipping_method: shipping,
                payment_method: 'card', // Default payment method
                coupon_code: selectedVoucher?.code || null,
                subtotal: itemsTotal,
                discount: discount,
                shipping_cost: shippingCost,
                total: total,
            };

            // Create order
            const response = await orderAPI.checkout(orderData);

            if (response.data.success) {
                setPayState('success');
                // Clear cart from local storage after successful order
                try {
                    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
                    setCartItems([]);
                    console.log('✅ Cart cleared from local storage after successful order');
                } catch (clearError) {
                    console.log('Error clearing cart:', clearError);
                }
            } else {
                setPayState('failed');
                Alert.alert('Error', response.data.message || 'Failed to create order');
            }
        } catch (error) {
            console.log('Error creating order:', error);
            setPayState('failed');
            Alert.alert('Error', error.response?.data?.message || 'Failed to create order. Please try again.');
        }
    };

    const tryAgain = () => { 
        setPayState('processing'); 
        handlePay(); 
    };

    const closePaymentModal = () => { 
        setPayVisible(false); 
        setPayState('idle');
        if (payState === 'success') {
            // Navigate to order details or history
            navigation.replace('HistoryScreen');
        }
    };

    const goBack = () => { if (navigation?.canGoBack?.()) navigation.goBack(); };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StandardHeader 
                    title={t('checkout:payment', 'Payment')}
                    navigation={navigation}
                    showGradient={true}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.brand} />
                    <Text style={{ marginTop: 16, color: COLORS.sub }}>Loading checkout data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Standard Header */}
            <StandardHeader 
                title={t('checkout:payment', 'Payment')}
                navigation={navigation}
                showGradient={true}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Shipping Address */}
                <View style={styles.sectionCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionLabel}>{t('checkout:shipping_address', 'Shipping Address')}</Text>
                        <TouchableOpacity onPress={() => setAddrModal(true)}>
                            <Ionicons name="create-outline" size={18} color={COLORS.brand} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sectionText}>{country}</Text>
                    <Text style={[styles.sectionText, { marginTop: 2 }]}>{addressLine}, {city} {postcode}</Text>
                </View>

                {/* Contact Info */}
                <View style={styles.sectionCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionLabel}>{t('checkout:contact_info', 'Contact Information')}</Text>
                        <TouchableOpacity onPress={() => setContactModal(true)}>
                            <Ionicons name="create-outline" size={18} color={COLORS.brand} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sectionText}>{phone}</Text>
                    <Text style={[styles.sectionText, { marginTop: 2 }]}>{email}</Text>
                </View>

                {/* Items + Voucher */}
                <View style={[styles.rowBetween, { marginTop: 6, marginBottom: 8 }]}>
                    <View style={styles.itemsLeft}>
                        <Text style={styles.itemsLabel}>{t('checkout:items', 'Items')}</Text>
                        <View style={styles.countPill}>
                            <Text style={styles.countText}>
                                {cartItems.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0)}
                            </Text>
                        </View>
                    </View>
                    {selectedVoucher ? (
                        <TouchableOpacity style={styles.appliedVoucherBtn} onPress={removeVoucher}>
                            <Ionicons name="pricetag" size={14} color={COLORS.brand} />
                            <Text style={styles.appliedVoucherText}>{selectedVoucher.code}</Text>
                            <Ionicons name="close" size={14} color={COLORS.brand} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.ghostBtn} onPress={() => setVoucherModal(true)}>
                            <Text style={styles.ghostBtnText}>{t('checkout:add_voucher', 'Add Voucher')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Items List */}
                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={COLORS.brand} />
                        <Text style={{ color: COLORS.sub, marginTop: 8 }}>Loading items...</Text>
                    </View>
                ) : cartItems.length > 0 ? (
                    <View style={styles.itemsContainer}>
                        <FlatList 
                            data={cartItems} 
                            keyExtractor={(item, index) => `${item.id || index}-${item.cart_id || item.product_id || ''}-${item.selectedSize || ''}-${item.selectedColor || ''}`} 
                            renderItem={renderItem} 
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                            ListEmptyComponent={null}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyCartContainer}>
                        <Ionicons name="cart-outline" size={48} color={COLORS.muted} />
                        <Text style={styles.emptyCartText}>Your cart is empty</Text>
                        <Text style={styles.emptyCartSubtext}>Add items to your cart to proceed with checkout</Text>
                        <TouchableOpacity 
                            style={styles.shopNowBtn}
                            onPress={() => navigation.navigate('NewHome')}
                        >
                            <Text style={styles.shopNowBtnText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Shipping Options */}
                <Text style={styles.blockTitle}>{t('checkout:shipping_options', 'Shipping Options')}</Text>
                <View style={styles.shippingCard}>
                    <TouchableOpacity onPress={() => setShipping('standard')} style={[styles.shipRow, shipping === 'standard' && styles.shipRowActive]}>
                        <View style={styles.shipLeft}>
                            <View style={[styles.radio, shipping === 'standard' && styles.radioOn]}>{shipping === 'standard' ? <View style={styles.radioDot} /> : null}</View>
                            <Text style={styles.shipTitle}>{t('checkout:standard', 'Standard')}</Text>
                            <View style={styles.badge}><Text style={styles.badgeText}>{t('checkout:days_5_7', '5–7 days')}</Text></View>
                        </View>
                        <Text style={[styles.shipPrice, { color: COLORS.success }]}>{t('checkout:free', 'FREE')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShipping('express')} style={[styles.shipRow, shipping === 'express' && styles.shipRowActive]}>
                        <View style={styles.shipLeft}>
                            <View style={[styles.radio, shipping === 'express' && styles.radioOn]}>{shipping === 'express' ? <View style={styles.radioDot} /> : null}</View>
                            <Text style={styles.shipTitle}>{t('checkout:express', 'Express')}</Text>
                            <View style={[styles.badge, { backgroundColor: isDark ? COLORS.brandSoft : '#E9F5FF', borderColor: isDark ? COLORS.line : '#CFE9FF' }]}>
                                <Text style={[styles.badgeText, { color: COLORS.brand }]}>{t('checkout:days_1_2', '1–2 days')}</Text>
                            </View>
                        </View>
                        <Text style={styles.shipPrice}>{CURRENCY}12.00</Text>
                    </TouchableOpacity>

                    <Text style={styles.deliveryNote}>{t('checkout:delivery_note', 'Delivered on or before Thursday, 23 April 2020')}</Text>
                </View>

                {/* Payment Method */}
                <Text style={styles.blockTitle}>{t('checkout:payment_method', 'Payment Method')}</Text>
                <View style={styles.sectionCard}>
                    <View style={styles.rowBetween}>
                        <View style={styles.methodChip}>
                            <Ionicons name="card-outline" size={16} color={COLORS.brand} />
                            <Text style={styles.methodText}>{t('checkout:card', 'Card')}</Text>
                        </View>
                        <TouchableOpacity><Ionicons name="create-outline" size={18} color={COLORS.brand} /></TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Pay Bar */}
            <View style={styles.payBar}>
                <Text style={styles.totalText}>
                    {t('checkout:total', 'Total')} <Text style={styles.totalPrice}>{CURRENCY} {total.toFixed(3)}</Text>
                </Text>
                <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
                    <Text style={styles.payText}>{t('checkout:pay', 'Pay')}</Text>
                </TouchableOpacity>
            </View>

            {/* Voucher Modal */}
            <Modal transparent visible={voucherModal} animationType="slide">
                <View style={styles.sheet}>
                    <View style={styles.sheetHeaderRow}>
                        <Text style={styles.sheetTitle}>{t('checkout:active_vouchers', 'Active Vouchers')}</Text>
                        <TouchableOpacity onPress={() => setVoucherModal(false)}><Ionicons name="close" size={22} color={COLORS.text} /></TouchableOpacity>
                    </View>
                    {vouchers.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.sub }}>No vouchers available</Text>
                        </View>
                    ) : (
                        vouchers.map(v => {
                            const isApplied = selectedVoucher?.code === v.code;
                            return (
                                <View key={v.code || v.id} style={styles.voucherTicket}>
                                    <View style={styles.vTopRow}>
                                        <Text style={styles.vLabel}>{t('checkout:voucher', 'Voucher')}</Text>
                                        {v.valid_until && (
                                            <View style={styles.validPill}>
                                                <Text style={styles.validText}>
                                                    {t('checkout:valid_until', { date: v.valid_until })}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.vBody}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.vTitle}>{v.title || v.code}</Text>
                                            <Text style={styles.vDesc}>{v.description || v.desc || ''}</Text>
                                        </View>
                                        <TouchableOpacity style={[styles.vApplyBtn, isApplied && styles.vApplyBtnOn]} onPress={() => applyVoucher(v)}>
                                            <Text style={[styles.vApplyText, isApplied && styles.vApplyTextOn]}>{isApplied ? t('checkout:applied', 'Applied') : t('checkout:apply', 'Apply')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </Modal>

            {/* Address Modal */}
            <Modal transparent visible={addrModal} animationType="slide">
                <View style={styles.formSheet}>
                    <View style={styles.sheetHeaderRow}>
                        <Text style={styles.sheetTitle}>{t('checkout:shipping_address', 'Shipping Address')}</Text>
                        <TouchableOpacity onPress={() => setAddrModal(false)}><Ionicons name="close" size={22} color={COLORS.text} /></TouchableOpacity>
                    </View>
                    <Text style={styles.label}>{t('checkout:country', 'Country')}</Text>
                    <TextInput value={country} onChangeText={setCountry} placeholder={t('checkout:country_placeholder', 'Country')} placeholderTextColor={COLORS.sub} style={styles.input} />
                    <Text style={styles.label}>{t('checkout:address', 'Address')}</Text>
                    <TextInput value={addressLine} onChangeText={setAddressLine} placeholder={t('checkout:address_placeholder', 'Street, house no., area')} placeholderTextColor={COLORS.sub} style={styles.input} />
                    <Text style={styles.label}>{t('checkout:city', 'City')}</Text>
                    <TextInput value={city} onChangeText={setCity} placeholder={t('checkout:city_placeholder', 'City, State')} placeholderTextColor={COLORS.sub} style={styles.input} />
                    <Text style={styles.label}>{t('checkout:postcode', 'Postcode')}</Text>
                    <TextInput value={postcode} onChangeText={setPostcode} placeholder={t('checkout:postcode_placeholder', 'PIN / ZIP')} placeholderTextColor={COLORS.sub} style={styles.input} />
                    <TouchableOpacity 
                        style={styles.primaryBtn} 
                        onPress={async () => {
                            try {
                                const userId = await getUserId();
                                if (userId && selectedAddress) {
                                    // Update existing address
                                    await addressAPI.updateAddress(selectedAddress.id, {
                                        user_id: userId,
                                        country: country,
                                        address: addressLine,
                                        city: city,
                                        postcode: postcode,
                                    });
                                } else if (userId) {
                                    // Add new address
                                    await addressAPI.addAddress({
                                        user_id: userId,
                                        country: country,
                                        address: addressLine,
                                        city: city,
                                        postcode: postcode,
                                        is_default: addresses.length === 0 ? 1 : 0,
                                    });
                                }
                                setAddrModal(false);
                                await loadCheckoutData(); // Reload addresses
                            } catch (error) {
                                console.log('Error saving address:', error);
                                Alert.alert('Error', 'Failed to save address. Please try again.');
                            }
                        }}
                    >
                        <Text style={styles.primaryText}>{t('checkout:save_changes', 'Save Changes')}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Contact Modal */}
            <Modal transparent visible={contactModal} animationType="slide">
                <View style={styles.formSheet}>
                    <View style={styles.sheetHeaderRow}>
                        <Text style={styles.sheetTitle}>{t('checkout:contact_info', 'Contact Information')}</Text>
                        <TouchableOpacity onPress={() => setContactModal(false)}><Ionicons name="close" size={22} color={COLORS.text} /></TouchableOpacity>
                    </View>
                    <Text style={styles.label}>{t('checkout:phone', 'Phone')}</Text>
                    <TextInput value={phone} onChangeText={setPhone} placeholder={t('checkout:phone_placeholder', 'Phone number')} placeholderTextColor={COLORS.sub} style={styles.input} />
                    <Text style={styles.label}>{t('checkout:email', 'Email')}</Text>
                    <TextInput value={email} onChangeText={setEmail} placeholder={t('checkout:email_placeholder', 'Email address')} placeholderTextColor={COLORS.sub} style={styles.input} />
                    <TouchableOpacity 
                        style={styles.primaryBtn} 
                        onPress={async () => {
                            // Contact info is stored in user profile, so we just close the modal
                            // The values are already updated in state
                            setContactModal(false);
                        }}
                    >
                        <Text style={styles.primaryText}>{t('checkout:save_changes', 'Save Changes')}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Payment Status Modal */}
            <Modal visible={payVisible} transparent>
                <View style={styles.centerWrap}>
                    <View style={styles.statusCard}>
                        {payState === 'processing' && (<>
                            <ActivityIndicator size="large" />
                            <Text style={styles.statusTitle}>{t('checkout:payment_processing', 'Payment is in progress')}</Text>
                            <Text style={styles.statusSub}>{t('checkout:please_wait', 'Please, wait a few moments')}</Text>
                        </>)}
                        {payState === 'failed' && (<>
                            <Ionicons name="alert-circle" size={28} color={COLORS.danger} />
                            <Text style={styles.statusTitle}>{t('checkout:payment_failed', 'We couldn’t proceed your payment')}</Text>
                            <Text style={styles.statusSub}>{t('checkout:try_again_msg', 'Please, change your payment method or try again')}</Text>
                            <TouchableOpacity style={styles.primaryBtn} onPress={tryAgain}><Text style={styles.primaryText}>{t('checkout:try_again', 'Try Again')}</Text></TouchableOpacity>
                        </>)}
                        {payState === 'success' && (<>
                            <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                            <Text style={styles.statusTitle}>{t('checkout:done', 'Order Placed Successfully!')}</Text>
                            <Text style={styles.statusSub}>{t('checkout:payment_success', 'Your order has been placed successfully')}</Text>
                            <TouchableOpacity style={styles.primaryBtn} onPress={closePaymentModal}><Text style={styles.primaryText}>{t('checkout:view_orders', 'View My Orders')}</Text></TouchableOpacity>
                        </>)}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CheckoutScreen;


/* ==================== Styles ==================== */
const createStyles = (COLORS, isDark) => StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },

    sectionCard: {
        marginHorizontal: 16,
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.line,
        marginBottom: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 2 },
        }),
    },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionLabel: { color: COLORS.text, fontWeight: '800' },
    sectionText: { color: COLORS.sub, marginTop: 6 },

    itemsLeft: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    itemsLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    countPill: { marginLeft: 8, backgroundColor: COLORS.brandSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
    countText: { color: COLORS.brand, fontWeight: '800', fontSize: 12 },
    ghostBtn: { borderWidth: 1, borderColor: COLORS.brand, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 16 },
    ghostBtnText: { color: COLORS.brand, fontWeight: '800', fontSize: 12 },
    appliedVoucherBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.brand,
        backgroundColor: COLORS.brandSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 16,
    },
    appliedVoucherText: { color: COLORS.brand, fontWeight: '800', fontSize: 12 },

    itemRow: {
        marginHorizontal: 16, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
        padding: 12, flexDirection: 'row', alignItems: 'flex-start',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
            android: { elevation: 2 },
        }),
    },
    thumbWrap: { width: 70, height: 70, borderRadius: 12, overflow: 'hidden', marginRight: 12, position: 'relative', backgroundColor: COLORS.bg },
    thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    qtyBadge: { position: 'absolute', right: -4, top: -4, backgroundColor: COLORS.brand, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 2, borderColor: COLORS.card, minWidth: 24, alignItems: 'center', justifyContent: 'center' },
    qtyText: { color: '#fff', fontWeight: '800', fontSize: 11 },
    itemDetails: { flex: 1, flexDirection: 'column' },
    itemTitle: { flex: 1, color: COLORS.text, fontWeight: '600', fontSize: 14, marginBottom: 4, lineHeight: 18 },
    itemVariant: { color: COLORS.sub, fontSize: 12, marginBottom: 2 },
    itemPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    itemPrice: { color: COLORS.sub, fontWeight: '600', fontSize: 12 },
    itemTotalPrice: { color: COLORS.text, fontWeight: '800', fontSize: 14 },
    itemsContainer: {
        marginHorizontal: 16,
        marginBottom: 8,
    },
    emptyCartContainer: {
        marginHorizontal: 16,
        marginVertical: 24,
        padding: 32,
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.line,
    },
    emptyCartText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyCartSubtext: {
        fontSize: 14,
        color: COLORS.sub,
        textAlign: 'center',
        marginBottom: 20,
    },
    shopNowBtn: {
        backgroundColor: COLORS.brand,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopNowBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },

    blockTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginTop: 14, marginBottom: 8 },

    shippingCard: { marginHorizontal: 16, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.line },
    shipRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.line,
        borderRadius: 12, padding: 12, backgroundColor: isDark ? COLORS.bg : COLORS.card, marginBottom: 8,
    },
    shipRowActive: { borderColor: COLORS.brandSoft, backgroundColor: isDark ? COLORS.brandSoft : '#F9FBFF' },
    shipLeft: { flexDirection: 'row', alignItems: 'center' },
    radio: { width: 20, height: 20, borderRadius: 12, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: isDark ? COLORS.bg : COLORS.card },
    radioOn: { borderColor: COLORS.brand },
    radioDot: { width: 10, height: 10, borderRadius: 6, backgroundColor: COLORS.brand },
    shipTitle: { fontWeight: '800', color: COLORS.text, marginRight: 8 },
    badge: { backgroundColor: COLORS.chip, borderColor: isDark ? COLORS.line : '#DBE5FF', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    badgeText: { color: isDark ? COLORS.text : COLORS.muted, fontSize: 12, fontWeight: '700' },
    shipPrice: { fontWeight: '800', color: COLORS.text },

    deliveryNote: { color: COLORS.sub, marginTop: 2, marginLeft: 2 },

    methodChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.brandSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6 },
    methodText: { color: COLORS.brand, fontWeight: '800' },

    /* sticky pay bar */
    payBar: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.line, backgroundColor: COLORS.bg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 6 },
        }),
    },
    totalText: { color: COLORS.text, fontWeight: '700' },
    totalPrice: { color: COLORS.text, fontWeight: '900' },
    payBtn: { backgroundColor: COLORS.brand, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    payText: { color: '#fff', fontWeight: '800' },

    /* generic modal scaffolding */
    backdrop: { flex: 1, backgroundColor: COLORS.backdrop },

    /* voucher sheet */
    sheet: {
        position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: COLORS.bg,
        borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10,
    },
    sheetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },

    voucherTicket: {
        borderWidth: 2, borderColor: COLORS.brand, borderRadius: 12, marginHorizontal: 4, marginVertical: 8, padding: 12, backgroundColor: COLORS.card, position: 'relative',
    },
    ticketNotchLeft: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.bg, position: 'absolute', left: -9, top: '50%', marginTop: -9, borderWidth: 2, borderColor: COLORS.brand },
    ticketNotchRight: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.bg, position: 'absolute', right: -9, top: '50%', marginTop: -9, borderWidth: 2, borderColor: COLORS.brand },
    vTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    vLabel: { color: COLORS.brand, fontWeight: '900' },
    validPill: { borderWidth: 1, borderColor: isDark ? COLORS.line : '#c3d1ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: isDark ? COLORS.bg : '#F7FAFF' },
    validText: { color: COLORS.sub, fontWeight: '700', fontSize: 12 },
    dash: { height: 1, borderStyle: 'dashed', borderTopWidth: 1, borderColor: '#c3d1ff', marginVertical: 10 },
    vBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    vTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    vDesc: { color: COLORS.sub, marginTop: 2 },
    vApplyBtn: { backgroundColor: isDark ? COLORS.bg : '#EEF3FF', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, alignSelf: 'flex-start' },
    vApplyBtnOn: { backgroundColor: COLORS.brand },
    vApplyText: { color: COLORS.brand, fontWeight: '800' },
    vApplyTextOn: { color: '#fff' },

    /* forms */
    formSheet: {
        position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: COLORS.bg,
        borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16,
    },
    label: { color: COLORS.text, marginTop: 10, marginBottom: 6, fontWeight: '700' },
    readonlyRow: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, backgroundColor: isDark ? COLORS.bg : COLORS.card, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    readonlyText: { color: COLORS.sub, fontWeight: '800' },
    input: { 
        height: 50, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: COLORS.line, 
        backgroundColor: isDark ? COLORS.bg : COLORS.card, 
        paddingHorizontal: 14, 
        color: COLORS.text, 
        fontWeight: '600',
        placeholderTextColor: COLORS.sub,
    },
    primaryBtn: { marginTop: 16, backgroundColor: COLORS.brand, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    /* payment status */
    centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    statusCard: {
        width: '100%', maxWidth: 340, borderRadius: 14, backgroundColor: COLORS.card, paddingHorizontal: 18, paddingVertical: 18, borderWidth: 1, borderColor: COLORS.line,
        ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } }, android: { elevation: 8 } }),
    },
    statusIconWrap: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statusTitle: { textAlign: 'center', fontWeight: '800', color: COLORS.text, fontSize: 18, marginTop: 2 },
    statusSub: { textAlign: 'center', color: COLORS.sub, marginTop: 6, marginBottom: 12 },
    actionsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
    btnPrimary: { backgroundColor: COLORS.text, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnPrimaryText: { color: '#fff', fontWeight: '800' },
    btnGhost: { backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
    btnGhostText: { color: COLORS.text, fontWeight: '800' },
});
