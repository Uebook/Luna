import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const notifications = [
    {
        id: '1',
        title: 'Order Shipped',
        message: 'Your order #12345 has been shipped.',
        time: '2h ago',
        icon: 'truck',
    },
    {
        id: '2',
        title: 'Payment Successful',
        message: 'You have paid $45.00 for your order.',
        time: '5h ago',
        icon: 'credit-card',
    },
    {
        id: '3',
        title: 'New Message',
        message: 'Customer support replied to your query.',
        time: '1d ago',
        icon: 'message-circle',
    },
    {
        id: '4',
        title: 'Welcome!',
        message: 'Thanks for joining our app. Enjoy shopping!',
        time: '2d ago',
        icon: 'smile',
    },
];

const NotificationItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
        <View style={styles.iconWrapper}>
            <Icon name={item.icon} size={22} color="#004BFE" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
        </View>
    </TouchableOpacity>
);

const NotificationScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <NotificationItem item={item} />}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#F4F7FE',
        borderRadius: 12,
        padding: 16,
        gap: 14,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0EBFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#000',
        marginBottom: 4,
    },
    message: {
        color: '#444',
        fontSize: 14,
    },
    time: {
        marginTop: 6,
        fontSize: 12,
        color: '#888',
    },
});

export default NotificationScreen;
