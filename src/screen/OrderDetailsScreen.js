// src/screens/OrderDetailsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    Platform,
    Linking,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useMemo } from 'react';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';
import StandardHeader from '../components/StandardHeader';
import { orderAPI, getUserId } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const Section = ({ title, right, children, style, styles }) => (
    <View style={[styles.section, style]}>
        <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {right ? <View>{right}</View> : <View style={{ width: 1 }} />}
        </View>
        {children}
    </View>
);

const InfoRow = ({ icon, label, value, onPress, COLORS, styles, multiline = false }) => (
    <TouchableOpacity disabled={!onPress} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} style={styles.infoRow}>
        <View style={styles.infoRowLeft}>
            <Ionicons name={icon} size={18} color={COLORS.sub} />
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={[styles.infoValue, multiline && styles.infoValueMultiline]} numberOfLines={multiline ? undefined : 2} ellipsizeMode={multiline ? undefined : 'tail'}>{value}</Text>
    </TouchableOpacity>
);

const CartItem = ({ item, styles }) => (
    <View style={styles.itemCard}>
        <Image source={item.image} style={styles.itemImg} />
        <View style={{ flex: 1, marginLeft: 10 }}>
            <Text numberOfLines={2} style={styles.itemTitle}>{item.title}</Text>
            {item.variant ? <Text style={styles.itemSub}>{item.variant}</Text> : null}
            <Text style={styles.itemSub}>Qty: {item.qty}</Text>
        </View>
        <Text style={styles.itemPrice}>{item.priceFmt}</Text>
    </View>
);

const Step = ({ index, label, active, last, COLORS, styles }) => (
    <View style={styles.stepRow}>
        <View style={styles.stepGutter}>
            {index !== 0 && <View style={[styles.stepLine, { backgroundColor: active ? COLORS.brand : COLORS.line }]} />}
            <View
                style={[
                    styles.stepDot,
                    active ? { backgroundColor: COLORS.brand, borderColor: COLORS.brand } : { backgroundColor: '#fff', borderColor: COLORS.line },
                ]}
            >
                {active ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
            </View>
            {!last && <View style={[styles.stepLine, { backgroundColor: active ? COLORS.brand : COLORS.line }]} />}
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[styles.stepLabel, active && { color: COLORS.text, fontWeight: '800' }]}>{label}</Text>
        </View>
    </View>
);

const currency = (n, c = 'BHD') => `${Number(n).toFixed(3)} ${c}`;

const IMAGE_BASE_URL = 'https://proteinbros.in/assets/images/products/';

// Helper to get image URL
const getImageUrl = (photo) => {
    if (!photo) return require('../assets/image1.png');
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return { uri: photo };
    }
    return { uri: `${IMAGE_BASE_URL}${photo}` };
};

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    } catch {
        return dateString;
    }
};

/* ---------- build a safe order from route params (API data) ---------- */
function buildOrder(orderFromParams) {
    const defaults = {
        id: 1,
        orderNumber: '#00000000',
        date: formatDate(new Date()),
        status: 'Processing',
        steps: ['Ordered', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'],
        currentStepIndex: 1,
        items: [],
        shipping: { name: 'N/A', phone: 'N/A', address1: 'N/A', address2: '', city: 'N/A', state: '', zip: 'N/A', country: 'N/A' },
        payment: { method: 'Card', billingSame: true },
        prices: { currency: 'BHD', subtotal: 0, shipping: 0, discount: 0, tax: 0, total: 0 },
        tracking: { carrier: '-', code: '-', eta: '-', url: '' },
    };

    const p = orderFromParams || {};

    // Extract order number - handle both 'number' (from API) and 'order_number' formats
    const orderNumber = p.number || p.order_number || p.orderNumber || p.orderNo || defaults.orderNumber;

    // Format date
    const date = formatDate(p.created_at || p.date);

    // Map status
    const status = p.status || defaults.status;
    const statusMap = {
        'pending': 'Processing',
        'processing': 'Processing',
        'confirmed': 'Processing',
        'packed': 'Packed',
        'shipped': 'Shipped',
        'out_for_delivery': 'Out for delivery',
        'delivered': 'Delivered',
        'completed': 'Delivered',
        'cancelled': 'Cancelled',
    };
    const displayStatus = statusMap[status?.toLowerCase()] || status || 'Processing';

    // Map status to step index
    const stepMap = {
        'pending': 0,
        'processing': 0,
        'confirmed': 0,
        'packed': 1,
        'shipped': 2,
        'out_for_delivery': 3,
        'delivered': 4,
        'completed': 4,
    };
    const currentStepIndex = stepMap[status?.toLowerCase()] ?? 0;

    // Parse cart items - handle both API format (ordered_products) and old format (cart)
    let items = [];
    try {
        // Check for ordered_products from API first
        if (p.ordered_products && typeof p.ordered_products === 'object') {
            items = Object.values(p.ordered_products).map((productData, idx) => {
                const item = productData.item?.item || productData.item || productData;
                return {
                    id: `item-${idx}-${item.id || idx}`,
                    title: item.name || 'Product',
                    variant: item.size || item.color ? `${item.size || ''}${item.size && item.color ? ' • ' : ''}${item.color || ''}`.trim() : null,
                    qty: item.qty || item.quantity || 1,
                    price: parseFloat(item.price || 0),
                    priceFmt: currency(parseFloat(item.price || 0), p.currency_sign || 'BHD'),
                    image: getImageUrl(item.photo || item.image || item.thumbnail),
                };
            });
        } else {
            // Fallback to old cart format
            let cart = typeof p.cart === 'string' ? JSON.parse(p.cart) : (p.cart || []);

            if (Array.isArray(cart)) {
                items = cart.map((item, idx) => ({
                    id: `item-${idx}-${item.product_id || idx}`,
                    title: item.name || 'Product',
                    variant: item.size || item.color ? `${item.size || ''}${item.size && item.color ? ' • ' : ''}${item.color || ''}`.trim() : null,
                    qty: item.quantity || 1,
                    price: parseFloat(item.price || 0),
                    priceFmt: currency(parseFloat(item.price || 0), p.currency_sign || 'BHD'),
                    image: getImageUrl(item.image || item.photo || item.thumbnail),
                }));
            } else if (cart.items && typeof cart.items === 'object') {
                items = Object.values(cart.items).map((item, idx) => ({
                    id: `item-${idx}`,
                    title: item.name || 'Product',
                    variant: null,
                    qty: item.qty || item.quantity || 1,
                    price: parseFloat(item.price || 0),
                    priceFmt: currency(parseFloat(item.price || 0), p.currency_sign || 'BHD'),
                    image: getImageUrl(item.photo || item.image || item.thumbnail),
                }));
            }
        }
    } catch (e) {
        console.log('Error parsing cart items:', e);
        items = [];
    }

    // Calculate prices - handle both API format (total, paid_amount) and calculated format
    let subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingCost = parseFloat(p.shipping_cost || p.shipping || 0);
    const packingCost = parseFloat(p.packing_cost || 0);
    const discount = parseFloat(p.coupon_discount || p.discount || 0);
    const tax = parseFloat(p.tax || 0);

    // If API provides total/paid_amount, use it; otherwise calculate
    let total = 0;
    if (p.total) {
        // Extract number from formatted string like "BHD 50.000"
        const totalMatch = p.total.toString().match(/[\d.]+/);
        total = totalMatch ? parseFloat(totalMatch[0]) : 0;
    } else if (p.paid_amount) {
        const paidMatch = p.paid_amount.toString().match(/[\d.]+/);
        total = paidMatch ? parseFloat(paidMatch[0]) : 0;
    } else {
        total = parseFloat(p.pay_amount || (subtotal + shippingCost + packingCost + tax - discount));
    }

    // Extract currency from formatted string or use default
    let currencyCode = 'BHD';
    if (p.total && typeof p.total === 'string') {
        const currencyMatch = p.total.match(/^([A-Z]+)/);
        if (currencyMatch) currencyCode = currencyMatch[1];
    } else if (p.paid_amount && typeof p.paid_amount === 'string') {
        const currencyMatch = p.paid_amount.match(/^([A-Z]+)/);
        if (currencyMatch) currencyCode = currencyMatch[1];
    } else {
        currencyCode = p.currency_sign || p.currency_name || 'BHD';
    }

    const prices = {
        currency: currencyCode,
        subtotal: subtotal,
        shipping: shippingCost + packingCost,
        discount: discount,
        tax: tax,
        total: total,
    };

    // Shipping address
    const shipping = {
        name: p.shipping_name || p.customer_name || 'N/A',
        phone: p.shipping_phone || p.customer_phone || 'N/A',
        address1: p.shipping_address || p.customer_address || 'N/A',
        address2: '',
        city: p.shipping_city || p.customer_city || 'N/A',
        state: p.shipping_state || p.customer_state || '',
        zip: p.shipping_zip || p.customer_zip || 'N/A',
        country: p.shipping_country || p.customer_country || 'N/A',
    };

    // Payment method - handle both 'method' and 'payment_method' from API
    const paymentMethod = p.payment_method || p.method || 'Card';
    const payment = {
        method: paymentMethod === 'cod' ? 'Cash on Delivery' :
            (paymentMethod === 'card' ? 'Card Payment' :
                (paymentMethod === 'stripe' ? 'Stripe' :
                    (paymentMethod === 'paypal' ? 'PayPal' : paymentMethod || 'Card'))),
        billingSame: true,
    };

    // Tracking (if available) - handle both API format and old format
    const tracking = {
        carrier: p.shipping?.title || p.shipping_title || p.shipping || '-',
        code: p.transaction_id || p.txnid || p.tracking_code || '-',
        eta: p.estimated_delivery || p.eta || '-',
        url: p.tracking_url || p.trackingUrl || '',
    };

    return {
        id: p.id || defaults.id,
        orderNumber,
        date,
        status: displayStatus,
        steps: defaults.steps,
        currentStepIndex,
        items: items.length > 0 ? items : defaults.items,
        shipping,
        payment,
        prices,
        tracking,
    };
}

const OrderDetailsScreen = ({ route, navigation }) => {
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
    };
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);
    const [loading, setLoading] = useSkeletonLoader(true, 600);
    const [orderData, setOrderData] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);

    // Get order number from route params
    const routeOrder = route?.params?.order;
    const orderNumber = routeOrder?.order_number || routeOrder?.orderNumber || routeOrder?.number;
    const orderId = routeOrder?.id;

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

    // Fetch order details from API
    const fetchOrderDetails = useCallback(async (isRefresh = false) => {
        // If we have order_number, fetch from API
        if (orderNumber && userId) {
            try {
                if (!isRefresh) {
                    setApiLoading(true);
                }
                setError(null);

                const response = await orderAPI.getOrderDetails(orderNumber, userId);

                if (response.data?.status && response.data?.data) {
                    console.log('Order details fetched from API:', response.data.data);
                    // API returns data in response.data.data
                    setOrderData(response.data.data);
                    setError(null);
                } else {
                    console.log('No order data in API response, using route params');
                    // Fallback to route params
                    setOrderData(routeOrder);
                }
            } catch (err) {
                console.log('Error fetching order details:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load order details';
                setError(errorMessage);
                // Fallback to route params on error
                setOrderData(routeOrder);
            } finally {
                setApiLoading(false);
                setLoading(false);
                if (isRefresh) {
                    setRefreshing(false);
                }
            }
        } else if (routeOrder) {
            // No order number or userId, use route params directly
            setOrderData(routeOrder);
            setLoading(false);
        }
    }, [orderNumber, orderId, userId, routeOrder]);

    // Fetch on mount
    useEffect(() => {
        if (userId || !orderNumber) {
            fetchOrderDetails();
        }
    }, [orderNumber, orderId, userId, fetchOrderDetails]);

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            if (userId && orderNumber) {
                fetchOrderDetails();
            }
        }, [userId, orderNumber, fetchOrderDetails])
    );

    // Pull to refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrderDetails(true);
    }, [fetchOrderDetails]);

    // Build order from API data or route params
    const order = buildOrder(orderData || routeOrder);

    const P = order.prices;
    const steps = order.steps || [];
    const current = Math.max(0, Math.min(order.currentStepIndex ?? 0, steps.length - 1));

    if (loading || apiLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <StandardHeader
                    title="Order Details"
                    navigation={navigation}
                    showGradient={true}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.brand} />
                    <Text style={{ marginTop: 12, color: COLORS.sub }}>Loading order details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !orderData) {
        return (
            <SafeAreaView style={styles.safe}>
                <StandardHeader
                    title="Order Details"
                    navigation={navigation}
                    showGradient={true}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle-outline" size={64} color={COLORS.sub} />
                    <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.text, fontWeight: '700', textAlign: 'center' }}>
                        Failed to load order details
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 14, color: COLORS.sub, textAlign: 'center' }}>
                        {error}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Standard Header */}
            <StandardHeader
                title="Order Details"
                navigation={navigation}
                showGradient={true}
            />

            <ScrollView
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.brand]}
                        tintColor={COLORS.brand}
                    />
                }
            >
                {/* Order summary strip */}
                <View style={styles.orderStrip}>
                    <View>
                        <Text style={styles.orderLabel}>Order</Text>
                        <Text style={styles.orderNo}>{order.orderNumber}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.orderDate}>{order.date}</Text>
                        <View style={styles.statusChip}>
                            <Ionicons
                                name={order.status === 'Delivered' ? 'checkmark-circle' : order.status === 'Shipped' ? 'airplane' : 'cube'}
                                size={14}
                                color="#fff"
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.statusChipText}>{order.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Tracking */}
                <Section
                    title="Tracking"
                    styles={styles}
                    right={
                        order.tracking?.url ? (
                            <TouchableOpacity activeOpacity={0.7} onPress={() => Linking.openURL(order.tracking.url)}>
                                <Text style={styles.link}>View on carrier</Text>
                            </TouchableOpacity>
                        ) : null
                    }
                >
                    <InfoRow icon="airplane" label="Carrier" value={order.tracking?.carrier || '-'} COLORS={COLORS} styles={styles} />
                    <InfoRow
                        icon="barcode"
                        label="Tracking code"
                        value={order.tracking?.code || '-'}
                        COLORS={COLORS}
                        styles={styles}
                        multiline={true}
                        onPress={order.tracking?.url ? () => Linking.openURL(order.tracking.url) : null}
                    />
                    <InfoRow icon="time-outline" label="Estimated delivery" value={order.tracking?.eta || '-'} COLORS={COLORS} styles={styles} />
                </Section>

                {/* Status timeline */}
                <Section title="Status" styles={styles}>
                    <View style={styles.stepsWrap}>
                        {steps.map((label, i) => (
                            <Step key={label} index={i} label={label} active={i <= current} last={i === steps.length - 1} COLORS={COLORS} styles={styles} />
                        ))}
                    </View>
                </Section>

                {/* Items */}
                <Section title="Items" styles={styles}>
                    {order.items.map((it) => (<CartItem key={it.id} item={it} styles={styles} />))}
                </Section>

                {/* Shipping */}
                <Section title="Shipping address" styles={styles} right={<Text style={styles.link}>Change</Text>}>
                    <Text style={styles.addrLine}>{order.shipping?.name}</Text>
                    <Text style={styles.addrLine}>{order.shipping?.phone}</Text>
                    <Text style={styles.addrLine}>{order.shipping?.address1}</Text>
                    {order.shipping?.address2 ? <Text style={styles.addrLine}>{order.shipping.address2}</Text> : null}
                    <Text style={styles.addrLine}>
                        {order.shipping?.city}, {order.shipping?.state} {order.shipping?.zip}
                    </Text>
                    <Text style={styles.addrLine}>{order.shipping?.country}</Text>
                </Section>

                {/* Payment */}
                <Section title="Payment" styles={styles}>
                    <InfoRow icon="card" label="Method" value={order.payment?.method || '-'} COLORS={COLORS} styles={styles} />
                    <InfoRow icon="home" label="Billing Address" value={order.payment?.billingSame ? 'Same as shipping' : 'Different address'} COLORS={COLORS} styles={styles} />
                </Section>

                {/* Price summary */}
                <Section title="Summary" styles={styles}>
                    <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumValue}>{currency(P.subtotal, P.currency)}</Text></View>
                    <View style={styles.sumRow}><Text style={styles.sumLabel}>Shipping</Text><Text style={styles.sumValue}>{P.shipping === 0 ? 'Free' : currency(P.shipping, P.currency)}</Text></View>
                    <View style={styles.sumRow}><Text style={styles.sumLabel}>Discount</Text><Text style={[styles.sumValue, { color: '#16A34A' }]}>-{currency(P.discount, P.currency)}</Text></View>
                    <View style={styles.sumRow}><Text style={styles.sumLabel}>Tax</Text><Text style={styles.sumValue}>{currency(P.tax, P.currency)}</Text></View>
                    <View style={[styles.sumRow, { marginTop: 8 }]}><Text style={styles.sumTotal}>Total</Text><Text style={styles.sumTotal}>{currency(P.total, P.currency)}</Text></View>
                </Section>

                <View style={{ height: 96 }} />
            </ScrollView>

            {/* Sticky bottom actions */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={[styles.bottomBtn, styles.ghostBtn]} activeOpacity={0.85}>
                    <Ionicons name="navigate-outline" size={18} color={COLORS.brand} style={{ marginRight: 6 }} />
                    <Text style={styles.bottomGhostText}>Track Package</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.bottomBtn, styles.ghostBtn, { flex: 1 }]} activeOpacity={0.85}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.brand} style={{ marginRight: 6 }} />
                    <Text style={styles.bottomGhostText}>Support</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default OrderDetailsScreen;

/* ---------------- styles ---------------- */
const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },

    header: {
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
        flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: COLORS.line,
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: COLORS.text },

    body: { paddingHorizontal: 16, paddingBottom: 12 },

    orderStrip: {
        marginTop: 14, marginBottom: 10,
        backgroundColor: COLORS.card, borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.line,
        padding: 14, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
            android: { elevation: 2 },
        }),
    },
    orderLabel: { color: COLORS.sub, fontSize: 12, fontWeight: '700' },
    orderNo: { color: COLORS.text, fontWeight: '900', fontSize: 16 },
    orderDate: { color: COLORS.sub, fontWeight: '700', marginBottom: 6 },
    statusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: COLORS.brand },
    statusChipText: { color: '#fff', fontWeight: '800', fontSize: 12 },

    section: {
        backgroundColor: COLORS.card, borderRadius: 16,
        borderWidth: 1, borderColor: COLORS.line,
        padding: 14, marginTop: 12,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 1 },
        }),
    },
    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text },
    link: { color: COLORS.brand, fontWeight: '800' },

    infoRow: { paddingVertical: 10, flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: COLORS.line },
    infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
    infoLabel: { marginLeft: 8, color: COLORS.sub, fontWeight: '700', flexShrink: 0 },
    infoValue: { marginLeft: 'auto', color: COLORS.text, fontWeight: '700', flex: 1, textAlign: 'right', fontSize: 12 },
    infoValueMultiline: { fontSize: 11, lineHeight: 16 },

    stepsWrap: { paddingTop: 6 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
    stepGutter: { width: 24, alignItems: 'center' },
    stepLine: { width: 2, flex: 1 },
    stepDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    stepLabel: { color: COLORS.sub, paddingBottom: 10, marginLeft: 8, paddingTop: 2 },

    itemCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line },
    itemImg: { width: 62, height: 62, borderRadius: 10 },
    itemTitle: { color: COLORS.text, fontWeight: '800' },
    itemSub: { color: COLORS.sub, marginTop: 2 },
    itemPrice: { marginLeft: 8, color: COLORS.text, fontWeight: '900' },

    addrLine: { color: COLORS.text, marginBottom: 4 },

    sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
    sumLabel: { color: COLORS.sub, fontWeight: '700' },
    sumValue: { color: COLORS.text, fontWeight: '800' },
    sumTotal: { color: COLORS.text, fontWeight: '900', fontSize: 16 },

    bottomBar: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: 12, backgroundColor: '#FFFFFFF2',
        borderTopWidth: 1, borderTopColor: COLORS.line,
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    bottomBtn: { flex: 1, height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    ghostBtn: { backgroundColor: COLORS.brandSoft },
    bottomGhostText: { color: COLORS.brand, fontWeight: '800' },
    primaryBtn: { backgroundColor: COLORS.brand },
    primaryBtnText: { color: '#fff', fontWeight: '900' },
});
