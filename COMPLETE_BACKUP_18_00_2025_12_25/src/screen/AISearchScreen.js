// src/screens/AIChatScreen.js
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput,
    KeyboardAvoidingView, Platform, ScrollView, Keyboard
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SkeletonListScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

// ---- Helpers ----
const CATEGORY_CHIPS = ['Fashion', 'Mobile', 'Electronics', 'Appliances', 'Beauty', 'Home'];

function parsePriceToNumber(priceStr) {
    if (!priceStr) return null;
    const nums = (priceStr.match(/[\d,]+/g) || []).join('');
    if (!nums) return null;
    return Number(nums.replace(/,/g, ''));
}
function makeProductIndex(DB) {
    const sections = ['deals', 'picks', 'trending', 'bestSellers', 'newArrivals', 'flash', 'celebPicks'];
    const res = [];
    Object.entries(DB || {}).forEach(([category, obj]) => {
        sections.forEach(section => {
            const arr = Array.isArray(obj?.[section]) ? obj[section] : [];
            arr.forEach(it => {
                if (!it) return;
                res.push({
                    id: `${category}-${section}-${it.id || it.title}`,
                    title: it.title || '',
                    price: it.price || '',
                    img: it.img,
                    thumb: it.thumb,
                    category,
                    section: section.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).trim(),
                    raw: it,
                });
            });
        });
    });
    const seen = new Set();
    return res.filter(p => {
        const key = p.id || `${p.title}-${p.img}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
function getSubcats(DB, category) {
    const raw = Array.isArray(DB?.[category]?.subcats) ? DB[category].subcats : [];
    const names = [...new Set(raw.map(s => s.t).filter(Boolean))];
    return names.slice(0, 8);
}
function filterProducts(index, { category, subcategory, budget }) {
    return index.filter(p => {
        if (category && p.category !== category) return false;

        if (subcategory) {
            const sub = subcategory.toLowerCase();
            const hay = `${p.title} ${p.section}`.toLowerCase();
            // soft-match: if it's clearly unrelated, drop; otherwise allow
            if (!hay.includes(sub) && Math.random() < 0.5) return false;
        }

        if (budget != null) {
            const pn = parsePriceToNumber(p.price);
            if (pn != null && pn > budget) return false;
        }
        return true;
    });
}

// ---- Chat UI ----
const BotBubble = ({ text, children }) => (
    <View style={styles.row}>
        <View style={styles.botAvatar}>
            <Icon name="sparkles-outline" size={16} color="#fff" />
        </View>
        <View style={styles.botBubble}>
            {text ? <Text style={styles.botText}>{text}</Text> : null}
            {children}
        </View>
    </View>
);

const UserBubble = ({ text }) => (
    <View style={[styles.row, { justifyContent: 'flex-end' }]}>
        <View style={styles.userBubble}>
            <Text style={styles.userText}>{text}</Text>
        </View>
    </View>
);

const Chip = ({ label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.chip} activeOpacity={0.85}>
        <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
);

export default function AIChatScreen({ route, navigation }) {
    const DB = route?.params?.DB || {};
    const THEME = route?.params?.THEME || {
        p1: '#A78BFA', p2: '#7C3AED', p3: '#5B21B6', p4: '#C4B5FD',
        white: '#ffffff', ink: '#111111', gray: '#6b7280', muted: '#9ca3af',
        line: '#e6e6f0', card: '#FFFFFF', bg: '#fafafb', red: '#FF3B30',
    };
    const [loading, setLoading] = useSkeletonLoader(true, 600);

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setLoading]);

    const index = useMemo(() => makeProductIndex(DB), [DB]);

    /**
     * Flow:
     * step 0: category
     * step 1: subcategory (from DB)
     * step 2: budget
     * step 3: results CTA
     */
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ category: null, subcategory: null, budget: null });
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 'm0', role: 'bot', text: 'Hey! I’ll help you find the perfect product. What category are you shopping for?' },
        { id: 'm0c', role: 'bot', chips: CATEGORY_CHIPS },
    ]);

    const listRef = useRef(null);

    useEffect(() => {
        setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);
    }, [messages]);

    const pushBot = (text, extra) => {
        setMessages(prev => [...prev, { id: `b-${prev.length}`, role: 'bot', text, ...extra }]);
    };
    const pushUser = (text) => {
        setMessages(prev => [...prev, { id: `u-${prev.length}`, role: 'user', text }]);
    };

    const nextFromCategory = (cat) => {
        const category = cat || '';
        setAnswers(a => ({ ...a, category, subcategory: null, budget: null }));
        pushUser(category);

        const subs = getSubcats(DB, category);
        setTimeout(() => {
            if (subs.length) {
                pushBot('Nice! Pick a sub-category:');
                pushBot(null, { chips: subs });
                setStep(1);
            } else {
                pushBot('Cool. What’s your max budget? You can type or pick below:');
                pushBot(null, { chips: ['₹1,000', '₹5,000', '₹10,000', '₹25,000', '₹50,000'] });
                setStep(2);
            }
        }, 200);
    };

    const nextFromSubcategory = (sub) => {
        const subcategory = sub || '';
        setAnswers(a => ({ ...a, subcategory }));
        pushUser(subcategory);

        setTimeout(() => {
            pushBot('Great! What’s your max budget? You can type or pick below:');
            pushBot(null, { chips: ['₹1,000', '₹5,000', '₹10,000', '₹25,000', '₹50,000'] });
            setStep(2);
        }, 200);
    };

    const parseBudget = (txt) => {
        const m = (txt || '').replace(/,/g, '').match(/(\d{3,7})/);
        return m ? Number(m[1]) : null;
    };

    const nextFromBudget = (budgetNum) => {
        setAnswers(a => ({ ...a, budget: budgetNum }));
        pushUser(`₹${budgetNum.toLocaleString('en-IN')}`);

        setTimeout(() => {
            const summary = [
                answers.category ? `Category: ${answers.category}` : null,
                answers.subcategory ? `Sub-category: ${answers.subcategory}` : null,
                budgetNum ? `Budget: ₹${budgetNum.toLocaleString('en-IN')}` : null,
            ].filter(Boolean).join(' • ');

            const resultItems = filterProducts(index, {
                category: answers.category,
                subcategory: answers.subcategory,
                budget: budgetNum,
            });

            pushBot(`All set! Here’s your plan:\n${summary}`);
            pushBot(null, {
                cta: {
                    count: resultItems.length,
                    onPress: () => {
                        navigation.navigate('ProductResults', {
                            THEME,
                            title: `${answers.category || 'Results'}`,
                            items: resultItems,
                            summary,
                        });
                    }
                }
            });
            setStep(3);
        }, 220);
    };

    // Handle free-typed input per step
    const handleSend = () => {
        const txt = input.trim();
        if (!txt) return;

        switch (step) {
            case 0: {
                const match = CATEGORY_CHIPS.find(c => c.toLowerCase() === txt.toLowerCase());
                if (match) nextFromCategory(match);
                else {
                    pushUser(txt);
                    pushBot('Please choose a category:', { chips: CATEGORY_CHIPS });
                }
                break;
            }
            case 1: {
                // accept any text as subcategory or guide again with chips
                const subs = getSubcats(DB, answers.category || '');
                if (subs.length && !subs.map(s => s.toLowerCase()).includes(txt.toLowerCase())) {
                    pushUser(txt);
                    pushBot('Pick one of the sub-categories below or type your own:', { chips: subs });
                } else {
                    nextFromSubcategory(txt);
                }
                break;
            }
            case 2: {
                const b = parseBudget(txt);
                if (b) nextFromBudget(b);
                else {
                    pushUser(txt);
                    pushBot('Enter a number like 5000, or pick a chip:', { chips: ['₹1,000', '₹5,000', '₹10,000', '₹25,000', '₹50,000'] });
                }
                break;
            }
            default:
                break;
        }

        setInput('');
        Keyboard.dismiss();
    };

    const renderItem = ({ item }) => {
        if (item.role === 'user') return <UserBubble text={item.text} />;

        return (
            <BotBubble text={item.text}>
                {item.chips ? (
                    <View style={styles.chipsWrap}>
                        {item.chips.map((c, i) => (
                            <Chip
                                key={`${c}-${i}`}
                                label={c}
                                onPress={() => {
                                    if (step === 0) return nextFromCategory(c);
                                    if (step === 1) return nextFromSubcategory(c);
                                    if (step === 2) {
                                        const b = parseBudget(c);
                                        return nextFromBudget(b || parseBudget(c.replace(/[^\d]/g, '')));
                                    }
                                }}
                            />
                        ))}
                    </View>
                ) : null}

                {item.cta ? (
                    <View style={styles.ctaCard}>
                        <Text style={styles.ctaText}>
                            {item.cta.count > 0
                                ? `Found ${item.cta.count} matching products.`
                                : `No exact matches with that budget/preferences. You can still view suggestions.`}
                        </Text>
                        <TouchableOpacity
                            style={styles.ctaBtn}
                            onPress={item.cta.onPress}
                            activeOpacity={0.9}
                        >
                            <Icon name="open-outline" size={16} color="#fff" />
                            <Text style={styles.ctaBtnText}>View Results</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </BotBubble>
        );
    };

    if (loading) {
        return <SkeletonListScreen />;
    }

    return (
        <View style={[styles.page, { backgroundColor: THEME.bg }]}>
            {/* Header */}
            <LinearGradient colors={[THEME.p1, THEME.p2, THEME.p3]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hIcon}>
                        <Icon name="chevron-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.hTitle}>AI Assist</Text>
                    <View style={styles.hActions}>
                        <Icon name="sparkles-outline" size={18} color="#fff" />
                    </View>
                </View>
            </LinearGradient>

            {/* Messages */}
            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(_, i) => `m-${i}`}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
            />

            {/* Composer */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.composer}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder={
                            step === 0 ? 'Type a category…' :
                                step === 1 ? 'Type a sub-category…' :
                                    'Enter budget (e.g., 5000)…'
                        }
                        placeholderTextColor="#9ba3af"
                        style={styles.input}
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.9}>
                        <Icon name="send" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1 },

    header: { paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    hIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    hTitle: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '900', fontSize: 18 },
    hActions: { width: 36, alignItems: 'center' },

    row: { flexDirection: 'row', marginBottom: 10 },
    botAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#5B21B6', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 2 },
    botBubble: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e6e6f0', padding: 10 },
    botText: { color: '#111', fontSize: 14, lineHeight: 20 },

    userBubble: { maxWidth: '80%', backgroundColor: '#EDE9FE', borderColor: '#DDD6FE', borderWidth: 1, borderRadius: 12, padding: 10 },
    userText: { color: '#111', fontSize: 14 },

    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, backgroundColor: '#F3E8FF', borderWidth: 1, borderColor: '#E9D5FF', marginRight: 8, marginTop: 8 },
    chipText: { color: '#5B21B6', fontWeight: '700' },

    ctaCard: { marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e6e6f0', backgroundColor: '#FAFAFF' },
    ctaText: { color: '#111', marginBottom: 10, fontWeight: '700' },
    ctaBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#5B21B6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    ctaBtnText: { color: '#fff', fontWeight: '800' },

    composer: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
    input: { flex: 1, height: 44, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#F9FAFB', color: '#111' },
    sendBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#5B21B6', alignItems: 'center', justifyContent: 'center' },
});
