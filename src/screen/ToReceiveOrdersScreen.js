import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const dummyOrders = [
  {
    id: '1',
    images: [
      'https://randomuser.me/api/portraits/women/4.jpg',
      'https://randomuser.me/api/portraits/women/4.jpg',
    ],
    status: 'Packed',
    items: 3,
  },
  {
    id: '2',
    images: [
      'https://randomuser.me/api/portraits/women/24.jpg',
      'https://randomuser.me/api/portraits/women/34.jpg',
    ],
    status: 'Shipped',
    items: 4,
  },
  {
    id: '3',
    images: [
      'https://randomuser.me/api/portraits/women/24.jpg',
      'https://randomuser.me/api/portraits/women/24.jpg',
    ],
    status: 'Delivered',
    items: 2,
  },
  {
    id: '4',
    images: ['https://randomuser.me/api/portraits/women/44.jpg'],
    status: 'Delivered',
    items: 5,
  },
  {
    id: '5',
    images: ['https://randomuser.me/api/portraits/women/24.jpg'],
    status: 'Delivered',
    items: 1,
  },
  {
    id: '6',
    images: [
      'https://randomuser.me/api/portraits/women/24.jpg',
      'https://randomuser.me/api/portraits/women/24.jpg',
    ],
    status: 'Delivered',
    items: 2,
  },
  {
    id: '7',
    images: ['https://randomuser.me/api/portraits/women/44.jpg'],
    status: 'Delivered',
    items: 5,
  },
  {
    id: '8',
    images: ['https://randomuser.me/api/portraits/women/24.jpg'],
    status: 'Delivered',
    items: 1,
  },
];

const ToReceiveOrdersScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.profileSection}>
          <Image
            source={{uri: 'https://randomuser.me/api/portraits/women/1.jpg'}}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.title}>To Receive</Text>
            <Text style={styles.subtitle}>My Orders</Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <Ionicons name="list-outline" size={22} style={styles.icon} />
          <Ionicons
            name="ellipse"
            size={8}
            style={[styles.icon, {color: '#3b82f6'}]}
          />
          <Ionicons name="settings-outline" size={22} style={styles.icon} />
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={dummyOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingBottom: 20}}
        renderItem={({item}) => (
          <View style={styles.card}>
            {/* Product Images */}
            <View style={styles.imageRow}>
              {item.images.map((img, index) => (
                <Image
                  key={index}
                  source={{uri: img}}
                  style={styles.orderImage}
                />
              ))}
            </View>

            {/* Order Info */}
            <View style={styles.infoSection}>
              <Text style={styles.orderId}>Order #92287157</Text>
              <Text style={styles.delivery}>Standard Delivery</Text>
              <View style={styles.statusRow}>
                <Text style={styles.status}>{item.status}</Text>
                {item.status === 'Delivered' && (
                  <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                )}
              </View>
            </View>

            {/* Right Side */}
            <View style={styles.rightSection}>
              <Text style={styles.itemCount}>
                {item.items} {item.items > 1 ? 'items' : 'item'}
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  navigation.navigate('OrderTrackingScreen');
                }}>
                <Text style={styles.actionText}>
                  {item.status === 'Delivered' ? 'Review' : 'Track'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ToReceiveOrdersScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', paddingHorizontal: 16},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  profileSection: {flexDirection: 'row', alignItems: 'center', gap: 10},
  profileImage: {width: 50, height: 50, borderRadius: 25},
  title: {fontWeight: 'bold', fontSize: 18},
  subtitle: {fontSize: 12, color: '#6b7280'},
  iconRow: {flexDirection: 'row', gap: 12, alignItems: 'center'},
  icon: {color: '#3b82f6'},

  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  imageRow: {flexDirection: 'row', gap: 4},
  orderImage: {width: 60, height: 60, borderRadius: 8},
  infoSection: {flex: 1},
  orderId: {fontWeight: 'bold', fontSize: 14},
  delivery: {fontSize: 12, color: '#6b7280', marginBottom: 4},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  status: {fontWeight: 'bold', fontSize: 14},

  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  itemCount: {fontSize: 12, color: '#6b7280'},
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: {color: '#fff', fontWeight: '500', fontSize: 12},
});
