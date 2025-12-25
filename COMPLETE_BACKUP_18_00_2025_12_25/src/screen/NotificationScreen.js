import React, { useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { SkeletonNotificationScreen } from '../components/SkeletonLoader';
import { useSkeletonLoader } from '../hooks/useSkeletonLoader';

const handleNotificationPress = async (item) => {
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const api = require('../services/api').default;
        const userId = await AsyncStorage.getItem('user_id') || '1';
        
        if (!item.is_read) {
            await api.post('/notification/mark-read', {
                user_id: userId,
                notification_id: item.id,
            });
        }
        
        // Navigate if link exists
        if (item.link) {
            // Handle navigation based on link type
            console.log('Navigate to:', item.link);
        }
    } catch (error) {
        console.log('Error handling notification:', error);
    }
};

const NotificationItem = ({ item, styles, C, onPress }) => {
    const getIcon = (type) => {
        const iconMap = {
            'order': 'truck',
            'payment': 'credit-card',
            'product': 'package',
            'info': 'info',
            'message': 'message-circle',
        };
        return iconMap[type] || 'bell';
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity 
            style={[styles.item, !item.is_read && styles.unreadItem]} 
            onPress={() => onPress && onPress(item)}
        >
            <View style={styles.iconWrapper}>
                <Icon name={getIcon(item.type)} size={22} color={C.brand} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{formatTime(item.created_at)}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};

const NotificationScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [loading, setLoading] = useSkeletonLoader(true, 600);

    const C = useMemo(() => ({
        bg: theme.bg,
        card: theme.card,
        text: theme.text,
        sub: theme.sub,
        line: theme.line,
        brand: theme.p1,
        brandSoft: theme.p4,
        p1: theme.p1,
        p2: theme.p2,
    }), [theme]);

    const styles = useMemo(() => createStyles(C), [C]);
    const safeTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                const api = require('../services/api').default;
                const userId = await AsyncStorage.getItem('user_id') || '1';
                
                const response = await api.post('/notification/list', { user_id: userId });
                if (response.data.success) {
                    setNotifications(response.data.notifications || []);
                    setUnreadCount(response.data.unread_count || 0);
                }
            } catch (error) {
                console.log('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setLoading]);

    if (loading) {
        return (
            <View style={styles.container}>
                {Platform.OS === 'android' && (
                    <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                )}
                <LinearGradient
                    colors={[C.p2, C.p1, C.p1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.header, { paddingTop: safeTop }]}
                >
                    <SafeAreaView>
                        <View style={styles.headerContent}>
                            <TouchableOpacity
                                onPress={() => navigation?.goBack()}
                                style={styles.backButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Notifications</Text>
                            <View style={styles.placeholder} />
                        </View>
                    </SafeAreaView>
                </LinearGradient>
                <SkeletonNotificationScreen />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {Platform.OS === 'android' && (
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            )}
            <LinearGradient
                colors={[C.p2, C.p1, C.p1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: safeTop }]}
            >
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => navigation?.goBack()}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Notifications</Text>
                        <View style={styles.placeholder} />
                    </View>
                </SafeAreaView>
            </LinearGradient>
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <NotificationItem item={item} styles={styles} C={C} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const createStyles = (C) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    header: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
            },
            android: { elevation: 4 },
        }),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 56,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    placeholder: {
        width: 40,
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: C.card,
        borderRadius: 12,
        padding: 16,
        gap: 14,
        borderWidth: 1,
        borderColor: C.line,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.brandSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 15,
        color: C.text,
        marginBottom: 4,
    },
    message: {
        color: C.sub,
        fontSize: 14,
    },
    time: {
        marginTop: 6,
        fontSize: 12,
        color: C.sub,
    },
});

export default NotificationScreen;
