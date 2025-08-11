import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const dummyProducts = [
  {
    title: 'Floral Dress',
    price: '$27.99',
    image: 'https://picsum.photos/id/1011/200',
  },
  {
    title: 'Denim Jacket',
    price: '$42.00',
    image: 'https://picsum.photos/id/1012/200',
  },
  {
    title: 'Summer Top',
    price: '$19.99',
    image: 'https://picsum.photos/id/1013/200',
  },
];

const avatarList = [
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/women/34.jpg',
  'https://randomuser.me/api/portraits/women/35.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/women/34.jpg',
  'https://randomuser.me/api/portraits/women/35.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/women/34.jpg',
  'https://randomuser.me/api/portraits/women/35.jpg',
];

const celebrities = [
  {
    name: 'Bader Almotawaa',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    name: 'Fahad Alaradi',
    image: 'https://randomuser.me/api/portraits/men/13.jpg',
  },
  {
    name: 'Ahmed Alreyahi',
    image: 'https://randomuser.me/api/portraits/men/14.jpg',
  },
  {
    name: 'Bader Almotawaa',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    name: 'Fahad Alaradi',
    image: 'https://randomuser.me/api/portraits/men/13.jpg',
  },
  {
    name: 'Ahmed Alreyahi',
    image: 'https://randomuser.me/api/portraits/men/14.jpg',
  },
];

const mostPopular = [
  {
    title: 'Green Jacket',
    subtitle: 'New',
    likes: 1780,
    image: 'https://picsum.photos/id/1021/200',
  },
  {
    title: 'Beige Coat',
    subtitle: 'Sale',
    likes: 1780,
    image: 'https://picsum.photos/id/1022/200',
  },
  {
    title: 'Yellow Sweater',
    subtitle: 'Hot',
    likes: 1780,
    image: 'https://picsum.photos/id/1023/200',
  },
];

const categories = [
  {
    name: 'Clothing',
    count: 109,
    images: [
      'https://randomuser.me/api/portraits/women/21.jpg',
      'https://randomuser.me/api/portraits/women/22.jpg',
      'https://randomuser.me/api/portraits/women/23.jpg',
      'https://randomuser.me/api/portraits/women/24.jpg',
    ],
  },
  {
    name: 'Shoes',
    count: 530,
    images: [
      'https://randomuser.me/api/portraits/men/21.jpg',
      'https://randomuser.me/api/portraits/men/22.jpg',
      'https://randomuser.me/api/portraits/men/23.jpg',
      'https://randomuser.me/api/portraits/men/24.jpg',
    ],
  },
];

const ShoppingHomeScreen = ({navigation}) => (
  <ScrollView style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Image source={{uri: avatarList[0]}} style={styles.avatar} />
      <TouchableOpacity
        onPress={() => navigation.navigate('ActivityScreen')}
        style={styles.myActivityButton}>
        <Text style={styles.myActivityText}>My Activity</Text>
      </TouchableOpacity>
      <View style={styles.headerIcons}>
        {/* <Icon name="remove-outline" size={20} /> */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NotificationScreen')}>
          <Icon
            name="notifications-outline"
            size={30}
            style={{marginLeft: 10}}
          />
        </TouchableOpacity>
      </View>
    </View>

    {/* Greeting */}
    <Text style={styles.sectionTitle}>Hello, Romina!</Text>

    {/* Announcement */}
    <View style={styles.announcementBox}>
      <Text style={styles.announcementTitle}>Announcement</Text>
      <Text style={styles.announcementText}>Lorem ipsum dolor sit amet</Text>
      <View style={styles.blueCircle}>
        <Icon name="arrow-forward" size={16} color="#fff" />
      </View>
    </View>

    {/* Recently viewed */}
    <Text style={styles.sectionTitle}>Recently viewed</Text>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={avatarList}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({item}) => (
        <Image source={{uri: item}} style={styles.circleAvatar} />
      )}
      contentContainerStyle={{paddingLeft: 16}}
    />

    {/* Celebrities */}
    <Text style={styles.sectionTitle}>Celebrities</Text>
    <View style={styles.celebrityWrapper}>
      {celebrities.map((item, index) => (
        <View key={index} style={styles.celebrityCard}>
          <Image source={{uri: item.image}} style={styles.celebrityImage} />
          <Text style={styles.celebrityName}>{item.name}</Text>
        </View>
      ))}
    </View>

    {/* New Items */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
      }}>
      <Text style={styles.sectionTitle}>New Items</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ShopScreen')}>
        <Text style={[styles.sectionTitle, {color: '#004BFE', fontSize: 14}]}>
          View All
        </Text>
      </TouchableOpacity>
    </View>

    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={dummyProducts}
      renderItem={({item}) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetailScreen')}
          style={styles.productCard}>
          <Image source={{uri: item.image}} style={styles.productImage} />
          <Text numberOfLines={2} style={styles.productTitle}>
            {item.title}
          </Text>
          <Text>{item.price}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingLeft: 16}}
    />

    {/* Most Popular */}
    <Text style={styles.sectionTitle}>Most Popular</Text>
    <FlatList
      horizontal
      data={mostPopular}
      showsHorizontalScrollIndicator={false}
      renderItem={({item}) => (
        <View style={styles.popularCard}>
          <Image source={{uri: item.image}} style={styles.popularImage} />
          <View style={styles.popularMeta}>
            <Text style={styles.likes}>{item.likes} 💙</Text>
            <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingLeft: 16, padding: 10}}
    />

    {/* Categories */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
      }}>
      <Text style={styles.sectionTitle}>Categories Items</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('CategoriesFilterScreen')}>
        <Text style={[styles.sectionTitle, {color: '#004BFE', fontSize: 14}]}>
          View All
        </Text>
      </TouchableOpacity>
    </View>

    <View style={styles.gridWrapper}>
      {categories.map((category, index) => (
        <View key={index} style={styles.categoryBox}>
          <View style={styles.imageGrid}>
            {category.images.map((img, i) => (
              <Image key={i} source={{uri: img}} style={styles.gridImage} />
            ))}
          </View>
          <View style={styles.categoryLabelRow}>
            <Text style={styles.categoryLabel}>{category.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>

    {/* Flash Sale */}
    <Text style={styles.sectionTitle}>Flash Sale</Text>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={dummyProducts}
      renderItem={({item}) => (
        <View style={styles.productCard}>
          <Image source={{uri: item.image}} style={styles.productImage} />
          <Text numberOfLines={2} style={styles.productTitle}>
            {item.title}
          </Text>
          <Text>{item.price}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingLeft: 16}}
    />

    {/* Top Products */}
    <Text style={styles.sectionTitle}>Top Products</Text>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={avatarList}
      renderItem={({item}) => (
        <Image source={{uri: item}} style={styles.circleAvatar} />
      )}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingLeft: 16}}
    />

    {/* Just For You */}
    <Text style={styles.sectionTitle}>Just For You</Text>
    <FlatList
      numColumns={2}
      data={dummyProducts.concat(dummyProducts)}
      renderItem={({item}) => (
        <View
          style={[styles.productCard, {width: (width - 48) / 2, margin: 8}]}>
          <Image source={{uri: item.image}} style={styles.productImage} />
          <Text numberOfLines={2} style={styles.productTitle}>
            {item.title}
          </Text>
          <Text>{item.price}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingHorizontal: 8}}
    />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16},
  avatar: {width: 40, height: 40, borderRadius: 20},
  myActivityButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  myActivityText: {color: '#fff'},
  headerIcons: {flexDirection: 'row', marginLeft: 'auto'},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginTop: 24,
    color: '#000',
    paddingBottom: 10,
  },
  announcementBox: {
    backgroundColor: '#f1f1f1',
    margin: 16,
    padding: 12,
    borderRadius: 10,
    position: 'relative',
  },
  announcementTitle: {fontWeight: 'bold', fontSize: 16},
  announcementText: {fontSize: 14, color: '#555', marginTop: 4},
  blueCircle: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: '#007bff',
    borderRadius: 16,
    padding: 8,
  },
  circleAvatar: {width: 60, height: 60, borderRadius: 50, margin: 10},
  celebrityWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  celebrityCard: {
    width: (width - 64) / 3,
    alignItems: 'center',
    marginBottom: 16,
  },
  celebrityImage: {width: 80, height: 80, borderRadius: 40, marginBottom: 6},
  celebrityName: {fontSize: 14, color: '#000', textAlign: 'center'},
  productCard: {width: 140, marginRight: 16, marginTop: 16},
  productImage: {width: '100%', height: 140, borderRadius: 10},
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#000',
  },
  popularCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  popularImage: {width: '100%', height: 160, resizeMode: 'cover'},
  popularMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  likes: {fontWeight: 'bold', fontSize: 14, color: '#007bff'},
  popularSubtitle: {fontSize: 14, color: '#555'},
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  categoryBox: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridImage: {
    width: (width - 80) / 4,
    height: (width - 80) / 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryLabel: {fontWeight: 'bold', fontSize: 16},
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryCount: {fontSize: 14, color: '#333'},
});
export default ShoppingHomeScreen;
