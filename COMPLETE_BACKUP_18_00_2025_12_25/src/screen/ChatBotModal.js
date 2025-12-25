// src/screens/ChatBotSingleScreen.js
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Keyboard,
    BackHandler,
    useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

const ISSUES = [
    { key: 'Order Issues', icon: 'cube-outline' },
    { key: 'Item Quality', icon: 'color-palette-outline' },
    { key: 'Payment Issues', icon: 'card-outline' },
    { key: 'Technical Assistance', icon: 'settings-outline' },
    { key: 'Other', icon: 'chatbubble-ellipses-outline' },
];

const seedFor = (issue) => ([
    { id: 'm1', from: 'bot', text: `Hi! You selected “${issue}”. I’m here to help.`, at: 'now' },
    { id: 'm2', from: 'bot', text: 'Could you describe the problem in a line or two?', at: 'now' },
]);

/* ---------------- responsive helpers ---------------- */
const BASE_W = 375;
const BASE_H = 812;
function useScale() {
    const { width, height } = useWindowDimensions();
    const scale = (s) => (width / BASE_W) * s;
    const vscale = (s) => (height / BASE_H) * s;
    const ms = (s, f = 0.25) => s + (scale(s) - s) * f; // moderate scale
    return { width, height, scale, vscale, ms };
}

const ChatBotSingleScreen = ({ navigation }) => {
    const { width, ms } = useScale();

    const [step, setStep] = useState('select'); // 'select' | 'chat'
    const [selected, setSelected] = useState('Order Issues');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const listRef = useRef(null);

    const startChat = () => {
        setMessages(seedFor(selected));
        setStep('chat');
        setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 0);
    };

    const send = () => {
        const txt = input.trim();
        if (!txt) return;
        const mine = { id: String(Date.now()), from: 'me', text: txt, at: 'now' };
        setMessages((prev) => [...prev, mine]);
        setInput('');
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: String(Date.now() + 1),
                    from: 'bot',
                    text: 'Thanks! I’m checking this for you. Meanwhile, could you share your order number?',
                    at: 'now',
                },
            ]);
            requestAnimationFrame(() => listRef.current?.scrollToEnd?.({ animated: true }));
        }, 550);
        requestAnimationFrame(() => listRef.current?.scrollToEnd?.({ animated: true }));
    };

    const headerTitle = step === 'chat' ? 'Customer Care' : 'Chat Bot';

    // Centralized back behavior (header + Android hardware back)
    const goBack = () => {
        if (step === 'chat') {
            Keyboard.dismiss();
            setStep('select');
            return true;
        }
        if (navigation?.goBack) {
            navigation.goBack();
            return true;
        }
        return false;
    };

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', goBack);
        return () => sub.remove();
    }, [step, navigation]);

    // responsive grid
    const sidePad = ms(16);
    const gridGap = ms(10);
    const cols = width < 360 ? 1 : 2;
    const issueW = (width - sidePad * 2 - gridGap * (cols - 1)) / cols;

    const botHeader = useMemo(() => (
        <View style={[styles.botCard, { borderRadius: ms(14), padding: ms(12) }]}>
            <View style={[styles.avatarCircle, {
                width: ms(44), height: ms(44), borderRadius: ms(22), marginRight: ms(12),
            }]}>
                <Ionicons name="shield-checkmark-outline" size={ms(20)} color={C.brand} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.botTitle, { fontSize: ms(16) }]}>Luna Care</Text>
                <Text style={[styles.botSub, { fontSize: ms(12), marginTop: ms(2) }]}>Usually replies in minutes</Text>
            </View>
        </View>
    ), [ms]);

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: sidePad, paddingTop: ms(10), paddingBottom: ms(12) }]}>
                <TouchableOpacity onPress={goBack} style={[styles.backBtn, {
                    width: ms(40), height: ms(40), borderRadius: ms(20),
                }]} activeOpacity={0.8}>
                    <Ionicons name="chevron-back" size={ms(20)} color={C.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: ms(18) }]}>{headerTitle}</Text>
                <View style={{ width: ms(40), height: ms(40) }} />
            </View>

            {step === 'select' ? (
                <View style={{ paddingHorizontal: sidePad, paddingBottom: sidePad }}>
                    {botHeader}

                    {/* Welcome bubble */}
                    <View style={[styles.msgBubble, {
                        marginTop: ms(14), borderRadius: ms(12), padding: ms(12),
                    }]}>
                        <Ionicons name="sparkles" size={ms(16)} color={C.brand} style={{ marginRight: ms(6) }} />
                        <Text style={[styles.msgText, { fontSize: ms(13), lineHeight: ms(18) }]}>
                            Hello! Tell us what you’re facing and we’ll route you to the best help.
                        </Text>
                    </View>

                    {/* Issue selector card */}
                    <View style={[styles.card, {
                        marginTop: ms(16), borderRadius: ms(14), padding: ms(14),
                    }]}>
                        <Text style={[styles.qTitle, { fontSize: ms(16) }]}>What’s your issue?</Text>
                        <Text style={[styles.qSub, { fontSize: ms(12), marginTop: ms(4), marginBottom: ms(10) }]}>
                            Choose one to get started.
                        </Text>

                        <View style={[styles.grid, { gap: gridGap }]}>
                            {ISSUES.map(({ key, icon }) => {
                                const active = selected === key;
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.issue,
                                            {
                                                width: issueW,
                                                height: ms(56),
                                                borderRadius: ms(12),
                                                paddingHorizontal: ms(10),
                                            },
                                            active && styles.issueActive,
                                        ]}
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            setSelected(key);
                                            startChat();
                                        }}
                                    >
                                        <View style={[
                                            styles.issueIcon,
                                            {
                                                width: ms(26), height: ms(26), borderRadius: ms(13), marginRight: ms(8),
                                            },
                                            active && styles.issueIconActive,
                                        ]}>
                                            <Ionicons
                                                name={active ? 'checkmark' : icon}
                                                size={ms(16)}
                                                color={active ? '#fff' : C.brand}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.issueText,
                                                { fontSize: ms(13) },
                                                active && styles.issueTextActive,
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {key}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.primaryBtn,
                                { height: ms(46), borderRadius: ms(12), marginTop: ms(4) },
                            ]}
                            activeOpacity={0.9}
                            onPress={startChat}
                        >
                            <Ionicons name="arrow-forward" size={ms(18)} color="#fff" style={{ marginRight: ms(8) }} />
                            <Text style={[styles.primaryBtnText, { fontSize: ms(15) }]}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                // CHAT
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? ms(8) : 0}
                >
                    <View style={{ flex: 1, paddingHorizontal: sidePad, paddingBottom: ms(8) }}>
                        {botHeader}

                        <FlatList
                            ref={listRef}
                            data={messages}
                            keyExtractor={(m) => m.id}
                            contentContainerStyle={{ paddingTop: ms(10), paddingBottom: ms(8) }}
                            renderItem={({ item }) => {
                                const mine = item.from === 'me';
                                return (
                                    <View style={[styles.rowMsg, { marginVertical: ms(4) }, mine && { justifyContent: 'flex-end' }]}>
                                        {!mine && (
                                            <View style={[styles.msgAvatar, {
                                                width: ms(26), height: ms(26), borderRadius: ms(13), marginRight: ms(6),
                                            }]}>
                                                <Ionicons name="person-circle-outline" size={ms(22)} color={C.brand} />
                                            </View>
                                        )}
                                        <View style={[
                                            styles.bubble,
                                            { borderRadius: ms(14), paddingVertical: ms(8), paddingHorizontal: ms(10), borderWidth: 1 },
                                            mine ? styles.bubbleMe : styles.bubbleBot,
                                        ]}>
                                            <Text style={[
                                                styles.bubbleTxt,
                                                { fontSize: ms(14), lineHeight: ms(20) },
                                                mine ? styles.bubbleTxtMe : styles.bubbleTxtBot,
                                            ]}>
                                                {item.text}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }}
                            onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
                        />
                    </View>

                    {/* Composer */}
                    <View style={[styles.composerWrap, { padding: ms(10) }]}>
                        <View style={[
                            styles.composer,
                            {
                                minHeight: ms(44),
                                borderRadius: ms(14),
                                paddingHorizontal: ms(10),
                                paddingVertical: ms(6),
                            },
                        ]}>
                            <TouchableOpacity style={[styles.composerIcon, { width: ms(32), height: ms(32), borderRadius: ms(16) }]}>
                                <Ionicons name="attach" size={ms(18)} color={C.sub} />
                            </TouchableOpacity>
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Type your message…"
                                placeholderTextColor="#9CA3AF"
                                style={[styles.input, { fontSize: ms(14), paddingVertical: ms(6), paddingHorizontal: ms(6) }]}
                                multiline
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendBtn,
                                    { height: ms(36), minWidth: ms(36), paddingHorizontal: ms(10), borderRadius: ms(10), marginLeft: ms(6) },
                                ]}
                                onPress={send}
                                activeOpacity={0.9}
                            >
                                <Ionicons name="send" size={ms(16)} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
};

export default ChatBotSingleScreen;

/* ---------------- static styles (responsive overrides are applied inline) ---------------- */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: C.line,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    backBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
    headerTitle: { flex: 1, textAlign: 'center', fontWeight: '800', color: C.text },

    botCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: C.line,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
            android: { elevation: 2 },
        }),
    },
    avatarCircle: { backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
    botTitle: { fontWeight: '900', color: C.text },
    botSub: { color: C.sub },

    msgBubble: {
        borderWidth: 1,
        borderColor: C.brand,
        backgroundColor: C.brandSoft,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    msgText: { color: C.text, flex: 1 },

    card: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: C.line,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 1 },
        }),
    },
    qTitle: { fontWeight: '900', color: C.text },
    qSub: { color: C.sub },

    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    issue: {
        borderWidth: 1,
        borderColor: C.brand,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    issueActive: { backgroundColor: C.brand, borderColor: C.brand },
    issueIcon: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.brandSoft },
    issueIconActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
    issueText: { color: C.brand, fontWeight: '700', flex: 1 },
    issueTextActive: { color: '#fff' },

    primaryBtn: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: C.brand },
    primaryBtnText: { color: '#fff', fontWeight: '900' },

    rowMsg: { flexDirection: 'row', alignItems: 'flex-end' },
    msgAvatar: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.brandSoft },
    bubble: { maxWidth: '78%' },
    bubbleBot: { backgroundColor: C.bot, borderColor: C.line },
    bubbleMe: { backgroundColor: C.me, borderColor: C.me },
    bubbleTxt: {},
    bubbleTxtBot: { color: C.text, fontWeight: '600' },
    bubbleTxtMe: { color: '#fff', fontWeight: '700' },

    composerWrap: { borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#fff' },
    composer: { borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' },
    composerIcon: { alignItems: 'center', justifyContent: 'center' },
    input: { flex: 1, color: C.text },
    sendBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.brand },
});
