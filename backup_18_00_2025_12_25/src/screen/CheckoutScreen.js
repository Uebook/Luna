// src/screens/CheckoutScreen.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import { SkeletonCheckoutScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { apiHelpers } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

let BlurViewOptional = View;
try {
    const { BlurView } = require('@react-native-community/blur');
    BlurViewOptional = BlurView;
} catch (_) { }

const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper function to get image URL
const getImageUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
    }
    return `${IMAGE_BASE_URL}${photo}`;
};

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
    const CURRENCY = t('common:currency', { defaultValue: 'BHD' });

    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const [voucherModal, setVoucherModal] = useState(false);
    const [addrModal, setAddrModal] = useState(false);
    const [contactModal, setContactModal] = useState(false);

    const [payState, setPayState] = useState('idle');
    const [payVisible, setPayVisible] = useState(false);

    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [shipping, setShipping] = useState('standard');

    // Dynamic data states
    const [cartItems, setCartItems] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loadingCart, setLoadingCart] = useState(true);
    const [loadingVouchers, setLoadingVouchers] = useState(false);

    // User address/contact info
    const [country, setCountry] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [customerName, setCustomerName] = useState('');

    // Load user ID and user data
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('luna_user');
                if (userData) {
                    const parsed = JSON.parse(userData);
                    const user = parsed.user || parsed.data || parsed;
                    const id = user.id || parsed.id;
                    setUserId(id);

                    // Set user info
                    if (user.email) setEmail(user.email);
                    if (user.phone) setPhone(user.phone);
                    if (user.name) setCustomerName(user.name);
                    if (user.country) setCountry(user.country);
                    if (user.address) setAddressLine(user.address);
                    if (user.city) setCity(user.city);
                    if (user.postcode || user.postal_code) setPostcode(user.postcode || user.postal_code);
                }
            } catch (error) {
                console.log('Error loading user data:', error);
            }
        };
        loadUserData();
    }, []);

    // Load cart items
    const loadCartItems = useCallback(async () => {
        try {
            const uid = userId || await AsyncStorage.getItem('user_id') || '1';
            setLoadingCart(true);

            const response = await api.post('/cart/get', { user_id: uid });

            if (response.data.success && response.data.cart) {
                const transformedCart = response.data.cart.map(item => {
                    const imageSource = item.thumbnail || item.photo || item.image || null;
                    const imageUrl = imageSource ? getImageUrl(imageSource) : null;

                    return {
                        id: item.product_id || item.id,
                        title: item.name || 'Product',
                        image: imageUrl || 'https://via.placeholder.com/80x80?text=No+Image',
                        price: parseFloat(item.price || 0),
                        qty: parseInt(item.quantity || 1),
                    };
                });
                setCartItems(transformedCart);
            } else {
                // Fallback to AsyncStorage
                const cartData = await AsyncStorage.getItem('user_cart');
                if (cartData) {
                    const localCart = JSON.parse(cartData);
                    const transformed = localCart.map(item => ({
                        id: item.id || item.product_id,
                        title: item.name || 'Product',
                        image: item.image || 'https://via.placeholder.com/80x80?text=No+Image',
                        price: parseFloat(item.price || 0),
                        qty: parseInt(item.quantity || 1),
                    }));
                    setCartItems(transformed);
                }
            }
        } catch (error) {
            console.log('Error loading cart items:', error);
            // Fallback to AsyncStorage
            try {
                const cartData = await AsyncStorage.getItem('user_cart');
                if (cartData) {
                    const localCart = JSON.parse(cartData);
                    const transformed = localCart.map(item => ({
                        id: item.id || item.product_id,
                        title: item.name || 'Product',
                        image: item.image || 'https://via.placeholder.com/80x80?text=No+Image',
                        price: parseFloat(item.price || 0),
                        qty: parseInt(item.quantity || 1),
                    }));
                    setCartItems(transformed);
                }
            } catch (e) {
                console.log('Error loading cart from storage:', e);
            }
        } finally {
            setLoadingCart(false);
        }
    }, [userId]);

    // Load vouchers
    const loadVouchers = useCallback(async () => {
        if (!userId) return;

        try {
            setLoadingVouchers(true);
            const response = await apiHelpers.getUserVouchers(userId);

            if (response.data.status && response.data.vouchers) {
                // Transform vouchers to match format
                const transformed = response.data.vouchers
                    .filter(v => v.status === 'active') // Only active vouchers
                    .map(v => ({
                        code: v.code || v.coupon_code || '',
                        title: v.title || v.name || 'Voucher',
                        desc: v.description || v.desc || '',
                        type: v.type === 'percentage' ? 'percent' : (v.type || 'percent'),
                        value: parseFloat(v.value || v.discount || 0),
                        validUntil: v.expiry_date || v.valid_until || v.validUntil || '',
                    }));
                setVouchers(transformed);
            }
        } catch (error) {
            console.log('Error loading vouchers:', error);
            setVouchers([]);
        } finally {
            setLoadingVouchers(false);
        }
    }, [userId]);

    // Load data on mount and focus
    useFocusEffect(
        useCallback(() => {
            loadCartItems();
            if (userId) {
                loadVouchers();
            }
        }, [loadCartItems, loadVouchers, userId])
    );

    useEffect(() => {
        if (userId) {
            loadVouchers();
        }
    }, [userId, loadVouchers]);

    useEffect(() => {
        if (!loadingCart && !loadingVouchers) {
            const timer = setTimeout(() => setLoading(false), 200);
            return () => clearTimeout(timer);
        }
    }, [loadingCart, loadingVouchers, setLoading]);

    // Calculate totals
    const itemsTotal = useMemo(() => cartItems.reduce((s, it) => s + it.price * it.qty, 0), [cartItems]);
    const shippingCost = shipping === 'standard' ? 0 : 12.000; // Hardcoded shipping options
    const discount = selectedVoucher?.type === 'percent'
        ? (itemsTotal * selectedVoucher.value) / 100
        : (selectedVoucher?.value || 0);
    const total = Math.max(0, itemsTotal - discount) + shippingCost;

    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <View style={styles.thumbWrap}>
                <Image source={{ uri: item.image }} style={styles.thumb} />
                <View style={styles.qtyBadge}><Text style={styles.qtyText}>{item.qty}</Text></View>
            </View>
            <Text numberOfLines={2} style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemPrice}>{item.price.toFixed(3)} {CURRENCY}</Text>
        </View>
    );

    const applyVoucher = v => { setSelectedVoucher(v); setVoucherModal(false); };
    const removeVoucher = () => setSelectedVoucher(null);

    // Place order API call
    const placeOrder = async () => {
        try {
            if (!userId) {
                Alert.alert('Error', 'Please login to place an order');
                return;
            }

            if (cartItems.length === 0) {
                Alert.alert('Error', 'Your cart is empty');
                return;
            }

            if (!email) {
                Alert.alert('Error', 'Please provide your email address');
                setContactModal(true);
                return;
            }

            // Build cart JSON for API
            const cartData = cartItems.map(item => ({
                product_id: item.id,
                name: item.title,
                price: item.price,
                quantity: item.qty,
            }));

            // Calculate total quantity
            const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

            // Build order payload - ensure all required database fields have valid values
            // Database schema requires customer_phone and other fields to have values (not null, not empty)
            const orderPayload = {
                user_id: parseInt(userId),
                cart: JSON.stringify(cartData),
                method: 'card',
                shipping: shipping || 'standard',
                totalQty: parseInt(totalQty),
                pay_amount: parseFloat(total).toFixed(3),
                customer_email: email,
                customer_name: customerName || (email ? email.split('@')[0] : 'Customer'),
                customer_country: (country && country.trim() !== '') ? country : 'Bahrain',
                customer_phone: (phone && phone.trim() !== '') ? phone : '0000000000', // Default phone if not provided
                customer_address: (addressLine && addressLine.trim() !== '') ? addressLine : 'N/A',
                customer_city: (city && city.trim() !== '') ? city : 'N/A',
                customer_zip: (postcode && postcode.trim() !== '') ? postcode : 'N/A',
                shipping_name: customerName || (email ? email.split('@')[0] : 'Customer'),
                shipping_country: (country && country.trim() !== '') ? country : 'Bahrain',
                shipping_email: email || '',
                shipping_phone: (phone && phone.trim() !== '') ? phone : '0000000000', // Default phone if not provided
                shipping_address: (addressLine && addressLine.trim() !== '') ? addressLine : 'N/A',
                shipping_city: (city && city.trim() !== '') ? city : 'N/A',
                shipping_zip: (postcode && postcode.trim() !== '') ? postcode : 'N/A',
                coupon_code: selectedVoucher?.code || null,
                coupon_discount: parseFloat(discount || 0),
                currency_sign: CURRENCY || 'BHD',
                currency_name: CURRENCY || 'BHD',
                currency_value: parseFloat(1.0),
                shipping_cost: parseFloat(shippingCost || 0),
                discount: parseFloat(discount || 0),
                tax: parseFloat(0), // Tax amount (0 if no tax)
                packing_cost: parseFloat(0), // Packing cost (0 if no packing cost)
                order_note: null,

            };

            console.log('Placing order with payload:', orderPayload);

            // Call the checkout API - BASE_URL already includes /v1, so use /order/checkout
            const response = await api.post('/order/checkout', orderPayload);

            console.log('Order API response:', response.data);

            if (response.data.status) {
                // Order placed successfully
                setPayState('success');

                // Clear cart after successful order
                try {
                    // Clear cart from API if userId is available
                    if (userId) {
                        try {
                            await api.post('/cart/clear', { user_id: parseInt(userId) });
                            console.log('Cart cleared from API');
                        } catch (apiError) {
                            console.log('Error clearing cart from API:', apiError);
                            // Continue to clear local storage even if API fails
                        }
                    }

                    // Clear from AsyncStorage
                    await AsyncStorage.removeItem('user_cart');

                    // Clear cart items state
                    setCartItems([]);
                    console.log('Cart cleared successfully after order placement');
                } catch (cartError) {
                    console.log('Error clearing cart:', cartError);
                    // Even if clearing fails, continue as order is placed
                }

                // You can navigate to order confirmation screen here
                // navigation.navigate('OrderConfirmation', { orderId: response.data.data.order_id });

            } else {
                setPayState('failed');
            }
        } catch (error) {
            console.log('Error placing order:', error);
            console.log('Error response data:', error?.response?.data);
            console.log('Error message:', error?.response?.data?.error || error?.response?.data?.message || error?.message);
            setPayState('failed');
        }
    };

    const handlePay = async () => {
        // Show payment modal with processing state
        setPayVisible(true);
        setPayState('processing');

        // Call place order API
        await placeOrder();
    };

    const tryAgain = async () => {
        setPayState('processing');
        await placeOrder();
    };

    const closePaymentModal = useCallback(() => {
        if (payState === 'success') {
            setPayVisible(false);
            setPayState('idle');
            // Navigate back or to orders screen after successful order
            navigation.goBack();
        } else {
            setPayVisible(false);
            setPayState('idle');
        }
    }, [payState, navigation]);

    const goBack = () => { if (navigation?.canGoBack?.()) navigation.goBack(); };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StandardHeader
                    title={t('checkout:payment', 'Payment')}
                    navigation={navigation}
                    showGradient={true}
                />
                <SkeletonCheckoutScreen />
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
                    {country && <Text style={styles.sectionText}>{country}</Text>}
                    {(addressLine || city || postcode) && (
                        <Text style={[styles.sectionText, { marginTop: country ? 2 : 6 }]}>
                            {[addressLine, city, postcode].filter(Boolean).join(', ')}
                        </Text>
                    )}
                    {!country && !addressLine && !city && !postcode && (
                        <Text style={styles.sectionText}>No address provided</Text>
                    )}
                </View>

                {/* Contact Info */}
                <View style={styles.sectionCard}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.sectionLabel}>{t('checkout:contact_info', 'Contact Information')}</Text>
                        <TouchableOpacity onPress={() => setContactModal(true)}>
                            <Ionicons name="create-outline" size={18} color={COLORS.brand} />
                        </TouchableOpacity>
                    </View>
                    {phone && <Text style={styles.sectionText}>{phone}</Text>}
                    {email && <Text style={[styles.sectionText, { marginTop: phone ? 2 : 6 }]}>{email}</Text>}
                    {!phone && !email && (
                        <Text style={styles.sectionText}>No contact information provided</Text>
                    )}
                </View>

                {/* Items + Voucher */}
                <View style={[styles.rowBetween, { marginTop: 6, marginBottom: 8 }]}>
                    <View style={styles.itemsLeft}>
                        <Text style={styles.itemsLabel}>{t('checkout:items', 'Items')}</Text>
                        <View style={styles.countPill}><Text style={styles.countText}>{cartItems.length}</Text></View>
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

                {loadingCart ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={COLORS.brand} />
                    </View>
                ) : cartItems.length > 0 ? (
                    <FlatList
                        data={cartItems}
                        keyExtractor={i => String(i.id)}
                        renderItem={renderItem}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    />
                ) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.sub }}>No items in cart</Text>
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
                        <Text style={styles.shipPrice}>12.000 {CURRENCY}</Text>
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
                    {t('checkout:total', 'Total')} <Text style={styles.totalPrice}>{total.toFixed(3)} {CURRENCY}</Text>
                </Text>
                <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
                    <Text style={styles.payText}>{t('checkout:pay', 'Pay')}</Text>
                </TouchableOpacity>
            </View>

            {/* Voucher Modal */}
            <Modal transparent visible={voucherModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={() => setVoucherModal(false)}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHeaderRow}>
                            <Text style={styles.sheetTitle}>{t('checkout:active_vouchers', 'Active Vouchers')}</Text>
                            <TouchableOpacity onPress={() => setVoucherModal(false)}><Ionicons name="close" size={22} color={COLORS.text} /></TouchableOpacity>
                        </View>
                        {loadingVouchers ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={COLORS.brand} />
                            </View>
                        ) : vouchers.length > 0 ? (
                            vouchers.map(v => {
                                const isApplied = selectedVoucher?.code === v.code;
                                return (
                                    <View key={v.code} style={styles.voucherTicket}>
                                        <View style={styles.vTopRow}>
                                            <Text style={styles.vLabel}>{t('checkout:voucher', 'Voucher')}</Text>
                                            {v.validUntil && (
                                                <View style={styles.validPill}>
                                                    <Text style={styles.validText}>{t('checkout:valid_until', { date: v.validUntil })}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.vBody}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.vTitle}>{v.title}</Text>
                                                <Text style={styles.vDesc}>{v.desc}</Text>
                                            </View>
                                            <TouchableOpacity style={[styles.vApplyBtn, isApplied && styles.vApplyBtnOn]} onPress={() => applyVoucher(v)}>
                                                <Text style={[styles.vApplyText, isApplied && styles.vApplyTextOn]}>{isApplied ? t('checkout:applied', 'Applied') : t('checkout:apply', 'Apply')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: COLORS.sub }}>No vouchers available</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Address Modal */}
            <Modal transparent visible={addrModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={() => setAddrModal(false)}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
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
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setAddrModal(false)}><Text style={styles.primaryText}>{t('checkout:save_changes', 'Save Changes')}</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Contact Modal */}
            <Modal transparent visible={contactModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={() => setContactModal(false)}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                    <View style={styles.formSheet}>
                        <View style={styles.sheetHeaderRow}>
                            <Text style={styles.sheetTitle}>{t('checkout:contact_info', 'Contact Information')}</Text>
                            <TouchableOpacity onPress={() => setContactModal(false)}><Ionicons name="close" size={22} color={COLORS.text} /></TouchableOpacity>
                        </View>
                        <Text style={styles.label}>{t('checkout:phone', 'Phone')}</Text>
                        <TextInput value={phone} onChangeText={setPhone} placeholder={t('checkout:phone_placeholder', 'Phone number')} placeholderTextColor={COLORS.sub} style={styles.input} />
                        <Text style={styles.label}>{t('checkout:email', 'Email')}</Text>
                        <TextInput value={email} onChangeText={setEmail} placeholder={t('checkout:email_placeholder', 'Email address')} placeholderTextColor={COLORS.sub} style={styles.input} />
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setContactModal(false)}><Text style={styles.primaryText}>{t('checkout:save_changes', 'Save Changes')}</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Payment Status Modal */}
            <Modal visible={payVisible} transparent>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={closePaymentModal}>
                        <View style={styles.backdrop} />
                    </TouchableWithoutFeedback>
                    <View style={styles.centerWrap}>
                        <View style={styles.statusCard}>
                            {payState === 'processing' && (<>
                                <ActivityIndicator size="large" color={COLORS.brand} />
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
                                <Ionicons name="checkmark" size={28} color={COLORS.success} />
                                <Text style={styles.statusTitle}>{t('checkout:done', 'Done!')}</Text>
                                <Text style={styles.statusSub}>{t('checkout:payment_success', 'Your card has been successfully charged')}</Text>
                                <TouchableOpacity style={styles.primaryBtn} onPress={closePaymentModal}><Text style={styles.primaryText}>{t('checkout:track_order', 'Track My Order')}</Text></TouchableOpacity>
                            </>)}
                        </View>
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
        marginHorizontal: 16, backgroundColor: COLORS.bg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
        padding: 10, flexDirection: 'row', alignItems: 'center',
    },
    thumbWrap: { width: 54, height: 54, borderRadius: 12, overflow: 'hidden', marginRight: 10, position: 'relative' },
    thumb: { width: '100%', height: '100%' },
    qtyBadge: { position: 'absolute', left: -6, top: -6, backgroundColor: COLORS.brand, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, borderWidth: 2, borderColor: '#fff' },
    qtyText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    itemTitle: { flex: 1, color: COLORS.text, fontWeight: '600' },
    itemPrice: { color: COLORS.text, fontWeight: '800' },

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
    modalContainer: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.backdrop
    },

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
