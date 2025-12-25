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
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getImageUrl } from '../config/api';
import api from '../services/api';

let BlurViewOptional = View;
try {
    const { BlurView } = require('@react-native-community/blur');
    BlurViewOptional = BlurView;
} catch (_) { }

const CART_STORAGE_KEY = 'user_cart';
const USER_STORAGE_KEY = 'luna_user';

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
    const CURRENCY = 'BHD';

    // State
    const [cartItems, setCartItems] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voucherModal, setVoucherModal] = useState(false);
    const [addrModal, setAddrModal] = useState(false);
    const [contactModal, setContactModal] = useState(false);
    const [payState, setPayState] = useState('idle');
    const [payVisible, setPayVisible] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [shipping, setShipping] = useState('standard');
    const [userId, setUserId] = useState(null);

    // Address and contact info
    const [country, setCountry] = useState('Bahrain');
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Load data on focus
    useFocusEffect(
        useCallback(() => {
            loadCheckoutData();
        }, [])
    );

    const loadCheckoutData = async () => {
        try {
            setLoading(true);
            // Load cart items
            const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
            const items = cartData ? JSON.parse(cartData) : [];
            setCartItems(items);

            // Load user data
            const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (userData) {
                const user = JSON.parse(userData);
                setUserId(user.id || user.user_id);
                setEmail(user.email || '');
                setPhone(user.phone || '');
            }

            // Load saved addresses
            const { getAddresses } = require('../storage/AddressStorage');
            const addresses = await getAddresses();
            if (addresses && addresses.length > 0) {
                const primaryAddress = addresses.find(a => a.isPrimary) || addresses[0];
                if (primaryAddress) {
                    setCountry(primaryAddress.country || 'Bahrain');
                    setAddressLine(primaryAddress.address || '');
                    setCity(primaryAddress.city || '');
                    setPostcode(primaryAddress.postcode || '');
                    if (primaryAddress.phone) setPhone(primaryAddress.phone);
                }
            }

            // Fetch vouchers
            if (userId) {
                try {
                    const voucherResponse = await api.post('/voucher/list', { user_id: userId });
                    if (voucherResponse.data?.status && voucherResponse.data?.data) {
                        const activeVouchers = voucherResponse.data.data.filter(v => v.status === 'active' || v.status === 'pending');
                        setVouchers(activeVouchers || []);
                    }
                } catch (error) {
                    console.log('Error fetching vouchers:', error);
                    setVouchers([]);
                }
            }
        } catch (error) {
            console.log('Error loading checkout data:', error);
            Alert.alert('Error', 'Failed to load checkout data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals dynamically
    const itemsTotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 1)), 0);
    }, [cartItems]);

    const shippingCost = shipping === 'standard' ? 0 : 12.000;
    const discount = useMemo(() => {
        if (!selectedVoucher) return 0;
        if (selectedVoucher.type === 'percent') {
            return (itemsTotal * parseFloat(selectedVoucher.value || 0)) / 100;
        } else if (selectedVoucher.type === 'flat') {
            return parseFloat(selectedVoucher.value || 0);
        }
        return 0;
    }, [selectedVoucher, itemsTotal]);

    const total = Math.max(0, itemsTotal - discount + shippingCost);

    const renderItem = ({ item }) => {
        const imageSource = item.image || item.photo || item.thumbnail || item.product_image;
        const imageUri = imageSource ? getImageUrl(imageSource) : null;
        const itemPrice = parseFloat(item.price || 0);
        const itemQty = parseInt(item.quantity || 1);

        return (
            <View style={styles.itemRow}>
                <View style={styles.thumbWrap}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.thumb} />
                    ) : (
                        <View style={[styles.thumb, { backgroundColor: COLORS.line, justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="image-outline" size={24} color={COLORS.muted} />
                        </View>
                    )}
                    <View style={styles.qtyBadge}><Text style={styles.qtyText}>{itemQty}</Text></View>
                </View>
                <Text numberOfLines={2} style={styles.itemTitle}>{item.name || item.title || 'Product'}</Text>
                <Text style={styles.itemPrice}>{CURRENCY} {itemPrice.toFixed(3)}</Text>
            </View>
        );
    };

    const applyVoucher = v => { setSelectedVoucher(v); setVoucherModal(false); };
    const removeVoucher = () => setSelectedVoucher(null);

    const clearCart = async () => {
        try {
            await AsyncStorage.removeItem('user_cart');
            console.log('Cart cleared after successful checkout');
        } catch (error) {
            console.log('Error clearing cart:', error);
        }
    };

    const handlePay = async () => {
        // Validate required fields
        if (!addressLine || !city || !phone || !email) {
            Alert.alert('Missing Information', 'Please fill in all required address and contact information');
            return;
        }

        if (cartItems.length === 0) {
            Alert.alert('Empty Cart', 'Your cart is empty');
            return;
        }

        setPayVisible(true);
        setPayState('processing');

        try {
            // Prepare order data
            const orderData = {
                user_id: userId,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity || 1,
                    price: item.price,
                    size: item.selectedSize,
                    color: item.selectedColor,
                })),
                shipping_address: {
                    country,
                    address: addressLine,
                    city,
                    postcode,
                },
                contact_info: {
                    phone,
                    email,
                },
                shipping_method: shipping,
                voucher_code: selectedVoucher?.code || null,
                total_amount: total,
            };

            // Call checkout API
            const response = await api.post('/order/checkout', orderData);
            
            if (response.data?.status) {
                setPayState('success');
                // Clear cart when payment is successful
                await clearCart();
            } else {
                setPayState('failed');
                Alert.alert('Payment Failed', response.data?.message || 'Failed to process payment');
            }
        } catch (error) {
            console.log('Checkout error:', error);
            setPayState('failed');
            Alert.alert('Payment Failed', error.response?.data?.message || 'Failed to process payment. Please try again.');
        }
    };
    const tryAgain = () => { setPayState('processing'); fakeCharge(); };
    const closePaymentModal = (wasSuccess = false) => { 
        setPayVisible(false); 
        setPayState('idle');
        // Navigate back to home after successful payment
        if (wasSuccess) {
            setTimeout(() => {
                navigation.navigate('NewHome');
            }, 300);
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
                    <Text style={{ marginTop: 12, color: COLORS.sub }}>Loading checkout...</Text>
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
                    {country || addressLine || city ? (
                        <>
                            <Text style={styles.sectionText}>{country || 'Not set'}</Text>
                            <Text style={[styles.sectionText, { marginTop: 2 }]}>
                                {[addressLine, city, postcode].filter(Boolean).join(', ') || 'No address set'}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.sectionText}>No address set. Please add one.</Text>
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
                    {phone || email ? (
                        <>
                            <Text style={styles.sectionText}>{phone || 'Not set'}</Text>
                            <Text style={[styles.sectionText, { marginTop: 2 }]}>{email || 'Not set'}</Text>
                        </>
                    ) : (
                        <Text style={styles.sectionText}>No contact information set. Please add one.</Text>
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

                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={COLORS.brand} />
                    </View>
                ) : cartItems.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.sub }}>Your cart is empty</Text>
                    </View>
                ) : (
                    <FlatList 
                        data={cartItems} 
                        keyExtractor={(item, index) => `${item.id || index}-${item.selectedSize || ''}-${item.selectedColor || ''}`} 
                        renderItem={renderItem} 
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />} 
                    />
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
                        <Text style={styles.shipPrice}>{CURRENCY} 12.000</Text>
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
                            const isApplied = selectedVoucher?.code === v.code || selectedVoucher?.id === v.id;
                            return (
                                <View key={v.id || v.code} style={styles.voucherTicket}>
                                    <View style={styles.vTopRow}>
                                        <Text style={styles.vLabel}>{t('checkout:voucher', 'Voucher')}</Text>
                                        {v.valid_until && (
                                            <View style={styles.validPill}>
                                                <Text style={styles.validText}>{t('checkout:valid_until', { date: v.valid_until })}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.vBody}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.vTitle}>{v.title || v.name || v.code}</Text>
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
                            // Save address to AsyncStorage
                            try {
                                const { getAddresses, setAddresses } = require('../storage/AddressStorage');
                                const addresses = await getAddresses();
                                const newAddress = {
                                    id: Date.now().toString(),
                                    fullName: 'User',
                                    phone: phone,
                                    address: addressLine,
                                    city: city,
                                    postcode: postcode,
                                    country: country,
                                    tag: 'home',
                                    isPrimary: true,
                                };
                                // Update or add address
                                const existingIndex = addresses.findIndex(a => a.isPrimary);
                                if (existingIndex >= 0) {
                                    addresses[existingIndex] = { ...addresses[existingIndex], ...newAddress };
                                } else {
                                    addresses.push(newAddress);
                                }
                                await setAddresses(addresses);
                            } catch (error) {
                                console.log('Error saving address:', error);
                            }
                            setAddrModal(false);
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
                            // Save contact info to user data
                            try {
                                const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
                                if (userData) {
                                    const user = JSON.parse(userData);
                                    user.email = email;
                                    user.phone = phone;
                                    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
                                }
                            } catch (error) {
                                console.log('Error saving contact info:', error);
                            }
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
                            <Ionicons name="checkmark" size={28} color={COLORS.success} />
                            <Text style={styles.statusTitle}>{t('checkout:done', 'Done!')}</Text>
                            <Text style={styles.statusSub}>{t('checkout:payment_success', 'Your card has been successfully charged')}</Text>
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => closePaymentModal(true)}><Text style={styles.primaryText}>{t('checkout:track_order', 'Track My Order')}</Text></TouchableOpacity>
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
