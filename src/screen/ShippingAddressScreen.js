// src/screens/ShippingAddressScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Platform,
    FlatList,
    Modal,
    Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';
import {
    getAddresses,
    setAddresses as persistAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setPrimary,
} from '../storage/AddressStorage';

const TAGS = [
    { key: 'home', label: 'Home', icon: 'home-outline' },
    { key: 'office', label: 'Office', icon: 'briefcase-outline' },
    { key: 'other', label: 'Other', icon: 'location-outline' },
];

const initialForm = {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    country: 'Bahrain',
    tag: 'home',       // 'home' | 'office' | 'other'
    isPrimary: false,  // boolean
};

export default function ShippingAddressScreen({ navigation }) {
    const { theme } = useTheme();
    const COLORS = {
        bg: theme.bg,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
        p1: theme.p1,
        p2: theme.p2,
        red: theme.red,
        white: theme.white,
        gradients: {
            header: [theme.p2, theme.p1, theme.p1],
            button: [theme.p1, theme.p2],
        },
    };
    const gradientHeader = COLORS.gradients.header;
    const styles = useMemo(() => createStyles(COLORS), [COLORS]);

    const [addresses, setAddressesState] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [openModal, setOpenModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            const data = await getAddresses();
            setAddressesState(data);
        })();
    }, []);

    useEffect(() => {
        persistAddresses(addresses);
    }, [addresses]);

    const valid = useMemo(() => {
        return (
            form.fullName.trim().length >= 2 &&
            form.phone.trim().length >= 6 &&
            form.address.trim().length >= 5 &&
            form.city.trim().length >= 2
        );
    }, [form]);

    const handleOpenCreate = () => {
        // First address becomes primary by default
        const autoPrimary = addresses.length === 0;
        setForm({ ...initialForm, isPrimary: autoPrimary });
        setEditingId(null);
        setError('');
        setOpenModal(true);
    };

    const handleEdit = (item) => {
        setForm({
            fullName: item.fullName || '',
            phone: item.phone || '',
            address: item.address || '',
            city: item.city || '',
            postcode: item.postcode || '',
            country: item.country || 'Bahrain',
            tag: item.tag || 'other',
            isPrimary: !!item.isPrimary,
        });
        setEditingId(item.id);
        setError('');
        setOpenModal(true);
    };

    const handleDelete = async (id) => {
        const next = await removeAddress(id);
        setAddressesState(next);
    };

    const handleSubmit = async () => {
        if (!valid) {
            setError('Please fill all required fields.');
            return;
        }
        if (editingId) {
            const next = await updateAddress(editingId, form);
            setAddressesState(next);
        } else {
            const next = await addAddress(form);
            setAddressesState(next);
        }
        setOpenModal(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const handleQuickPrimary = async (id) => {
        const next = await setPrimary(id);
        setAddressesState(next);
    };

    const TagChip = ({ tag }) => {
        const item = TAGS.find(t => t.key === tag) || TAGS[2];
        return (
            <View style={styles.tagChip}>
                <Icon name={item.icon} size={12} color={COLORS.brand} />
                <Text style={styles.tagChipText}>{item.label}</Text>
            </View>
        );
    };

    const PrimaryChip = () => (
        <Text style={styles.primaryChip}>Primary</Text>
    );

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Text style={styles.cardName}>{item.fullName}</Text>
                    <TagChip tag={item.tag} />
                    {item.isPrimary ? <PrimaryChip /> : null}
                </View>
                <Text style={styles.cardLine}>{item.phone}</Text>
                <Text style={styles.cardLine}>{item.address}</Text>
                <Text style={styles.cardLine}>
                    {item.city}{item.postcode ? ` • ${item.postcode}` : ''}
                </Text>
                <Text style={styles.badge}>{item.country || 'Bahrain'}</Text>
            </View>

            <View style={styles.cardActions}>
                {!item.isPrimary ? (
                    <TouchableOpacity onPress={() => handleQuickPrimary(item.id)} style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>Set Primary</Text>
                    </TouchableOpacity>
                ) : <View style={{ height: 36 }} />}

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
                        <Icon name="create-outline" size={18} color={COLORS.p1} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                        <Icon name="trash-outline" size={18} color={COLORS.red} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            {/* HEADER (saved preference) */}
            <LinearGradient
                colors={gradientHeader}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[
                    styles.header,
                    { paddingTop: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 8 },
                ]}
            >
                <TouchableOpacity
                    onPress={() => navigation?.goBack && navigation.goBack()}
                    style={styles.back}
                >
                    <Icon name="chevron-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Addresses</Text>
                <View style={{ width: 32 }} />
            </LinearGradient>

            {/* CONTENT */}
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Saved Addresses</Text>
                    <TouchableOpacity onPress={handleOpenCreate} style={styles.addBtn}>
                        <LinearGradient
                            colors={COLORS.gradients.button}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.addBtnInner}
                        >
                            <Icon name="add" size={18} color="#fff" />
                            <Text style={styles.addBtnText}>Add New</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyTitle}>No addresses yet</Text>
                            <Text style={styles.emptySub}>
                                Add your first address in Bahrain to speed up checkout.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            </ScrollView>

            {/* CREATE / EDIT MODAL */}
            <Modal visible={openModal} animationType="slide" transparent onRequestClose={() => setOpenModal(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'New Address'}</Text>

                        {/* Tag selector */}
                        <View style={styles.tagRow}>
                            {TAGS.map(t => {
                                const active = form.tag === t.key;
                                return (
                                    <TouchableOpacity
                                        key={t.key}
                                        onPress={() => setForm(s => ({ ...s, tag: t.key }))}
                                        style={[styles.tagBtn, active && styles.tagBtnActive]}
                                    >
                                        <Icon
                                            name={t.icon}
                                            size={14}
                                            color={active ? COLORS.white : COLORS.brand}
                                        />
                                        <Text style={[styles.tagBtnText, active && styles.tagBtnTextActive]}>
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Ali Hassan"
                                placeholderTextColor={COLORS.muted}
                                value={form.fullName}
                                onChangeText={(t) => setForm(s => ({ ...s, fullName: t }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+973 3xxxxxxx"
                                keyboardType="phone-pad"
                                placeholderTextColor={COLORS.muted}
                                value={form.phone}
                                onChangeText={(t) => setForm(s => ({ ...s, phone: t }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.inputMultiline]}
                                placeholder="Building / Road / Block"
                                placeholderTextColor={COLORS.muted}
                                value={form.address}
                                onChangeText={(t) => setForm(s => ({ ...s, address: t }))}
                                multiline
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.col]}>
                                <Text style={styles.label}>City</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Manama"
                                    placeholderTextColor={COLORS.muted}
                                    value={form.city}
                                    onChangeText={(t) => setForm(s => ({ ...s, city: t }))}
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.col]}>
                                <Text style={styles.label}>Postcode (optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 123"
                                    placeholderTextColor={COLORS.muted}
                                    value={form.postcode}
                                    onChangeText={(t) => setForm(s => ({ ...s, postcode: t }))}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: COLORS.line }]}
                                value={form.country}
                                editable={false}
                            />
                        </View>

                        {/* Primary toggle */}
                        <View style={styles.primaryRow}>
                            <Text style={styles.primaryLabel}>Make primary</Text>
                            <Switch
                                value={form.isPrimary}
                                onValueChange={(v) => setForm(s => ({ ...s, isPrimary: v }))}
                                trackColor={{ false: COLORS.line, true: COLORS.p3 }}
                                thumbColor={form.isPrimary ? COLORS.p2 : '#fff'}
                            />
                        </View>

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setOpenModal(false)} style={styles.ghostBtn}>
                                <Text style={styles.ghostBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit} style={styles.ctaBtn}>
                                <LinearGradient
                                    colors={COLORS.gradients.button}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.ctaBtnInner}
                                >
                                    <Text style={styles.ctaBtnText}>{editingId ? 'Save Changes' : 'Save Address'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (COLORS) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: COLORS.p1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    back: {
        width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    headerTitle: {
        flex: 1, textAlign: 'center', color: COLORS.white,
        fontSize: 18, fontWeight: '700', letterSpacing: 0.3,
    },

    content: { padding: 16, gap: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { flex: 1, fontSize: 16, color: COLORS.ink, fontWeight: '700' },
    addBtn: { borderRadius: 12, overflow: 'hidden' },
    addBtnInner: {
        paddingHorizontal: 14, paddingVertical: 10,
        flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12,
    },
    addBtnText: { color: COLORS.white, fontWeight: '700' },

    card: {
        flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16,
        backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.line,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 }, elevation: 2, marginBottom: 12,
    },
    cardName: { color: COLORS.ink, fontWeight: '700', fontSize: 15 },
    cardLine: { color: COLORS.gray, fontSize: 13, marginTop: 2 },
    badge: {
        marginTop: 8, alignSelf: 'flex-start', color: COLORS.brand,
        backgroundColor: COLORS.brandSoft, paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 999, fontSize: 12, overflow: 'hidden',
    },
    cardActions: { justifyContent: 'space-between', alignItems: 'flex-end' },
    iconBtn: {
        width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.line,
    },

    primaryBtn: {
        alignSelf: 'flex-end',
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 10, backgroundColor: COLORS.p4, borderWidth: 1, borderColor: COLORS.p3,
        marginBottom: 8,
    },
    primaryBtnText: { color: COLORS.p2, fontWeight: '700', fontSize: 12 },

    tagChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
        backgroundColor: COLORS.brandSoft, borderWidth: 1, borderColor: COLORS.brand,
    },
    tagChipText: { color: COLORS.brand, fontSize: 11, fontWeight: '700' },
    primaryChip: {
        color: COLORS.white, backgroundColor: COLORS.p2, fontSize: 11, fontWeight: '800',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden',
    },

    modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,16,32,0.35)', justifyContent: 'flex-end' },
    modalCard: {
        backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 16, paddingBottom: 24, borderWidth: 1, borderColor: COLORS.line, gap: 10,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.ink, textAlign: 'center', marginBottom: 8 },

    tagRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
    tagBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
        backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.brand,
    },
    tagBtnActive: { backgroundColor: COLORS.brand },
    tagBtnText: { color: COLORS.brand, fontWeight: '700', fontSize: 12 },
    tagBtnTextActive: { color: COLORS.white },

    inputGroup: { marginBottom: 10 },
    label: { fontSize: 12, color: COLORS.gray, marginBottom: 6, marginLeft: 4 },
    input: {
        backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.line,
        borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12,
        color: COLORS.ink, fontSize: 14,
    },
    inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 10 },
    col: { flex: 1 },

    primaryRow: {
        marginTop: 2, marginBottom: 4,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 6,
    },
    primaryLabel: { color: COLORS.ink, fontWeight: '700' },

    error: { color: COLORS.red, textAlign: 'center', fontSize: 12, marginTop: 2 },

    modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
    ghostBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
        borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center',
    },
    ghostBtnText: { color: COLORS.gray, fontWeight: '700' },
    ctaBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    ctaBtnInner: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    ctaBtnText: { color: COLORS.white, fontWeight: '800' },

    emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 6 },
    emptyTitle: { fontWeight: '800', color: COLORS.ink },
    emptySub: { color: COLORS.gray, fontSize: 13, textAlign: 'center', paddingHorizontal: 16 },
});
