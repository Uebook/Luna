// import React from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Image,
//   FlatList,
//   Dimensions,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import BannerCarousel from '../component/BannerCarousel';

// const {width} = Dimensions.get('window');

// const dummyProducts = [
//   {
//     title: 'Floral Dress',
//     price: '$27.99',
//     image: require('../assets/image3.png'),
//   },
//   {
//     title: 'Denim Jacket',
//     price: '$42.00',
//     image: require('../assets/image4.png'),
//   },
//   {
//     title: 'Summer Top',
//     price: '$19.99',
//     image: require('../assets/image5.png'),
//   },
// ];
// const dummyProductss = [
//   {
//     title: 'Floral Dress',
//     price: '$27.99',
//     image: require('../assets/image1.png'),
//   },
//   {
//     title: 'Denim Jacket',
//     price: '$42.00',
//     image: require('../assets/image2.png'),
//   },
//   {
//     title: 'Summer Top',
//     price: '$19.99',
//     image: require('../assets/image3.png'),
//   },
//   {
//     title: 'Summer Top',
//     price: '$19.99',
//     image: require('../assets/image4.png'),
//   },
//   {
//     title: 'Summer Top',
//     price: '$19.99',
//     image: require('../assets/image5.png'),
//   },
//   {
//     title: 'Summer Top',
//     price: '$19.99',
//     image: require('../assets/image6.png'),
//   },
// ];

// const avatarList = [
//   {id: '1', image: require('../assets/image3.png')},
//   {id: '2', image: require('../assets/image4.png')},
//   {id: '3', image: require('../assets/image1.png')},
//   {id: '4', image: require('../assets/image2.png')},
// ];
// const celebrities = [
//   {
//     name: 'Bader Almotawaa',
//     image: 'https://randomuser.me/api/portraits/men/12.jpg',
//   },
//   {
//     name: 'Fahad Alaradi',
//     image: 'https://randomuser.me/api/portraits/men/13.jpg',
//   },
//   {
//     name: 'Ahmed Alreyahi',
//     image: 'https://randomuser.me/api/portraits/men/14.jpg',
//   },
//   {
//     name: 'Bader Almotawaa',
//     image: 'https://randomuser.me/api/portraits/men/12.jpg',
//   },
//   {
//     name: 'Fahad Alaradi',
//     image: 'https://randomuser.me/api/portraits/men/13.jpg',
//   },
//   {
//     name: 'Ahmed Alreyahi',
//     image: 'https://randomuser.me/api/portraits/men/14.jpg',
//   },
// ];

// const mostPopular = [
//   {
//     title: 'Green Jacket',
//     subtitle: 'New',
//     likes: 1780,
//     image: 'https://picsum.photos/id/1021/200',
//   },
//   {
//     title: 'Beige Coat',
//     subtitle: 'Sale',
//     likes: 1780,
//     image: 'https://picsum.photos/id/1022/200',
//   },
//   {
//     title: 'Yellow Sweater',
//     subtitle: 'Hot',
//     likes: 1780,
//     image: 'https://picsum.photos/id/1023/200',
//   },
// ];

// const categories = [
//   {
//     name: 'Clothing',
//     count: 109,
//     images: [
//       'https://randomuser.me/api/portraits/women/21.jpg',
//       'https://randomuser.me/api/portraits/women/22.jpg',
//       'https://randomuser.me/api/portraits/women/23.jpg',
//       'https://randomuser.me/api/portraits/women/24.jpg',
//     ],
//   },
//   {
//     name: 'Shoes',
//     count: 530,
//     images: [
//       'https://randomuser.me/api/portraits/men/21.jpg',
//       'https://randomuser.me/api/portraits/men/22.jpg',
//       'https://randomuser.me/api/portraits/men/23.jpg',
//       'https://randomuser.me/api/portraits/men/24.jpg',
//     ],
//   },
// ];

// const NewHome = ({navigation}) => (
//   <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//     {/* Header */}
//     <View style={styles.headerContainer}>
//       <Text style={styles.title}>Shop</Text>
//       <View style={styles.searchBox}>
//         <Icon name="search" size={18} color="#888" style={{marginRight: 8}} />
//         <TextInput
//           placeholder="Search"
//           placeholderTextColor="#888"
//           style={styles.searchInput}
//         />
//         <Icon name="camera" size={18} color="#888" />
//       </View>
//     </View>

//     {/* Big Sale Banner */}
//     <View style={styles.bannerWrapper}>
//       <BannerCarousel />
//       {/* <Image
//                 source={require('../assets/abnner.png')}
//                 style={styles.bannerImage}
//                 resizeMode="cover"
//             /> */}
//       {/* <View style={styles.bannerOverlay}>
//                 <Text style={styles.bannerTitle}>Big Sale</Text>
//                 <Text style={styles.bannerSubtitle}>Up to 50% Off Happening Now</Text>
//             </View> */}
//     </View>

//     {/* Celebrities */}
//     <Text style={styles.sectionTitle}>Celebrities</Text>
//     <View style={styles.celebrityWrapper}>
//       {celebrities.map((item, index) => (
//         <View key={index} style={styles.celebrityCard}>
//           <Image source={{uri: item.image}} style={styles.celebrityImage} />
//           <Text style={styles.celebrityName}>{item.name}</Text>
//         </View>
//       ))}
//     </View>
//     {/* Categories */}
// <View style={styles.rowBetween}>
//   <Text style={styles.sectionTitle}>Categories</Text>
//   <TouchableOpacity>
//     <Text style={styles.link}>View All</Text>
//   </TouchableOpacity>
// </View>

// <View style={styles.gridWrapper}>
//   {categories.map((category, index) => (
//     <View key={index} style={styles.categoryBox}>
//       <View style={styles.imageGrid}>
//         {category.images.map((img, i) => (
//           <Image key={i} source={{uri: img}} style={styles.gridImage} />
//         ))}
//       </View>
//       <View style={styles.categoryLabelRow}>
//         <Text style={styles.categoryLabel}>{category.name}</Text>
//         <View style={styles.categoryBadge}>
//           <Text style={styles.categoryCount}>{category.count}</Text>
//         </View>
//       </View>
//     </View>
//   ))}
// </View>
//     {/* Top Products */}
//     <Text style={styles.sectionTitle}>Top Products</Text>
//     <FlatList
//       horizontal
//       data={avatarList}
//       keyExtractor={(item, index) => index.toString()}
//       renderItem={({item}) => (
//         <Image source={item?.image} style={styles.circleAvatar} />
//       )}
//       contentContainerStyle={{paddingHorizontal: 16}}
//       showsHorizontalScrollIndicator={false}
//     />

//     {/* New Items */}
//     <View style={styles.rowBetween}>
//       <Text style={styles.sectionTitle}>New Items</Text>
//       <TouchableOpacity>
//         <Text style={styles.link}>View All</Text>
//       </TouchableOpacity>
//     </View>
//     <FlatList
//       horizontal
//       data={dummyProducts}
//       keyExtractor={(item, index) => index.toString()}
//       showsHorizontalScrollIndicator={false}
//       renderItem={({item}) => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate('ProductDetailScreen')}
//           style={styles.productCard}>
//           <Image source={item?.image} style={styles.productImage} />
//           <Text numberOfLines={2} style={styles.productTitle}>
//             {item.title}
//           </Text>
//           <Text style={{fontWeight: '700', fontSize: 15, color: '#000'}}>
//             {item.price}
//           </Text>
//         </TouchableOpacity>
//       )}
//       contentContainerStyle={{paddingHorizontal: 16}}
//     />
//     {/* Flash Sale */}
//     <View style={styles.flashSaleContainer}>
//       <View style={styles.flashSaleHeader}>
//         <Text style={styles.sectionTitle}>Flash Sale</Text>
//         <View style={styles.timerBox}>
//           <Icon
//             name="time-outline"
//             size={16}
//             color="#004BFE"
//             style={{marginRight: 4}}
//           />
//           <Text style={styles.timerText}>00</Text>
//           <Text style={styles.timerText}>36</Text>
//           <Text style={styles.timerText}>58</Text>
//         </View>
//       </View>

//       <View style={styles.flashGrid}>
//         {dummyProductss.map((item, index) => (
//           <TouchableOpacity
//             onPress={() => navigation.navigate('FlashSaleScreen')}
//             key={index}
//             style={styles.flashCard}>
//             <Image source={item.image} style={styles.flashImage} />
//             <View style={styles.discountBadge}>
//               <Text style={styles.discountText}>-20%</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>

//     {/* Most Popular */}
//     <Text style={styles.sectionTitle}>Most Popular</Text>
//     <FlatList
//       horizontal
//       data={mostPopular}
//       keyExtractor={(item, index) => index.toString()}
//       showsHorizontalScrollIndicator={false}
//       renderItem={({item}) => (
//         <View style={styles.popularCard}>
//           <Image source={{uri: item.image}} style={styles.popularImage} />
//           <View style={styles.popularMeta}>
//             <Text style={styles.likes}>{item.likes} 💙</Text>
//             <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
//           </View>
//         </View>
//       )}
//       contentContainerStyle={{paddingHorizontal: 16}}
//     />

//     {/* Just For You */}
//     <Text style={styles.sectionTitle}>Just For You</Text>
//     <FlatList
//       numColumns={2}
//       data={dummyProducts.concat(dummyProducts)}
//       keyExtractor={(item, index) => index.toString()}
//       renderItem={({item}) => (
//         <View
//           style={[styles.productCard, {width: (width - 48) / 2, margin: 8}]}>
//           <Image source={item?.image} style={styles.productImage} />
//           <Text numberOfLines={2} style={styles.productTitle}>
//             {item.title}
//           </Text>
//           <Text style={{fontWeight: '700', fontSize: 15, color: '#000'}}>
//             {item.price}
//           </Text>
//         </View>
//       )}
//       contentContainerStyle={{paddingBottom: 32}}
//     />
//   </ScrollView>
// );

// const styles = StyleSheet.create({
//   container: {flex: 1, backgroundColor: '#fff'},
//   headerContainer: {padding: 16},
//   title: {fontSize: 28, fontWeight: '700', color: '#202020', marginBottom: 12},
//   searchBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     height: 40,
//   },
//   searchInput: {flex: 1, fontSize: 14, color: '#000'},
//   bannerWrapper: {
//     marginHorizontal: 16,
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   bannerImage: {width: '100%', height: 180, borderRadius: 16},
//   bannerOverlay: {position: 'absolute', top: 20, left: 20},
//   bannerTitle: {fontSize: 24, fontWeight: 'bold', color: '#fff'},
//   bannerSubtitle: {fontSize: 16, color: '#fff', marginTop: 4},
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     paddingHorizontal: 16,
//     paddingTop: 20,
//   },
//   link: {fontSize: 14, color: '#004BFE', paddingRight: 16},
//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 20,
//   },
//   celebrityWrapper: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     flexWrap: 'wrap',
//   },
//   celebrityCard: {
//     width: (width - 64) / 3,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   celebrityImage: {width: 80, height: 80, borderRadius: 40},
//   celebrityName: {
//     fontSize: 14,
//     color: '#000',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   productCard: {width: 140, marginRight: 16, marginTop: 16},
//   productImage: {width: '100%', height: 140, borderRadius: 10},
//   productTitle: {fontSize: 14, marginVertical: 4, color: '#000'},
//   popularCard: {
//     width: 140,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginRight: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: {width: 0, height: 2},
//     shadowRadius: 4,
//     elevation: 3,
//     overflow: 'hidden',
//   },
//   popularImage: {width: '100%', height: 160},
//   popularMeta: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 8,
//   },
//   likes: {fontWeight: 'bold', fontSize: 14, color: '#007bff'},
//   popularSubtitle: {fontSize: 14, color: '#555'},
//   gridWrapper: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//   },
//   categoryBox: {
//     width: (width - 48) / 2,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 8,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: {width: 0, height: 2},
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   imageGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   gridImage: {
//     width: (width - 80) / 4,
//     height: (width - 80) / 4,
//     borderRadius: 8,
//     marginBottom: 6,
//   },
//   categoryLabelRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   categoryLabel: {fontWeight: 'bold', fontSize: 16},
//   categoryBadge: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   categoryCount: {fontSize: 14, color: '#333'},
//   circleAvatar: {width: 60, height: 60, borderRadius: 50, margin: 10},
//   flashSaleContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 24,
//   },
//   flashSaleHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   timerBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F6F6F6',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   timerText: {
//     fontWeight: 'bold',
//     fontSize: 14,
//     marginHorizontal: 4,
//     backgroundColor: '#fff',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   flashGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   flashCard: {
//     width: (width - 48) / 3,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: {width: 0, height: 1},
//     shadowRadius: 2,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   flashImage: {
//     width: '100%',
//     height: 120,
//     borderRadius: 12,
//   },
//   discountBadge: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     backgroundColor: '#FF3B30',
//     borderRadius: 6,
//     paddingVertical: 2,
//     paddingHorizontal: 6,
//   },
//   discountText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
// });

// export default NewHome;

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
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useUserStore from '../store/UserStore';
import BannerCarousel from '../component/BannerCarousel';

const {width} = Dimensions.get('window');

const dummyProducts = [
  {
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$17.00',
    image: require('../assets/image1.png'),
  },
  {
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$32.00',
    image: require('../assets/image2.png'),
  },
  {
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$21.00',
    image: require('../assets/image3.png'),
  },
  {
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$17.00',
    image: require('../assets/image1.png'),
  },
  {
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$32.00',
    image: require('../assets/image2.png'),
  },
  {
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: '$21.00',
    image: require('../assets/image3.png'),
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

const mostPopular = [
  {title: 'New', likes: 1780},
  {title: 'Sale', likes: 1780},
  {title: 'Hot', likes: 471},
];

const HomeScreen = ({navigation}) => (
  <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    {/* Header */}
    {/* <View style={styles.header}>
      <Text style={styles.headerTitle}>Shop</Text>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>
    </View> */}

    <View style={styles.header}>
      <Text style={styles.headerTitle}>Shop</Text>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
        <Image
          source={require('../assets/CameraIcon.png')} // Adjust path to your image
          style={styles.cameraIcon}
        />
      </View>
    </View>

    <BannerCarousel />

    {/* Categories */}
    <View style={styles.rowBetween}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}
        onPress={() => navigation.navigate('CategoriesFilterScreen')}>
        <Text style={styles.seeAll}>See All</Text>
        <Image
          source={require('../assets/seeAll.png')}
          style={styles.seeAllIcon}
        />
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

    {/* <FlatList
      horizontal
      data={categories}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) => (
        <TouchableOpacity style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <Icon name={item.icon} size={24} color="#000" />
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.categoryList}
      showsHorizontalScrollIndicator={false}
    /> */}

    {/* Top Products */}
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Top Products</Text>
    </View>

    <FlatList
      horizontal
      data={[1, 2, 3, 4]}
      keyExtractor={item => item.toString()}
      renderItem={({item}) => (
        <View style={styles.topProductAvatar}>
          <Image
            source={require('../assets/image6.png')}
            style={styles.avatarImage}
          />
        </View>
      )}
      contentContainerStyle={styles.topProductsList}
      showsHorizontalScrollIndicator={false}
    />

    {/* New Items */}
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>New Items</Text>
      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.seeAll}>See All</Text>
        <Image
          source={require('../assets/seeAll.png')}
          style={styles.seeAllIcon}
        />
      </TouchableOpacity>
    </View>

    <FlatList
      horizontal
      data={dummyProducts}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) => (
        <View style={styles.productCard}>
          <Image source={item.image} style={styles.productImage} />
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.productPrice}>{item.price}</Text>
        </View>
      )}
      contentContainerStyle={styles.productList}
      showsHorizontalScrollIndicator={false}
    />

    {/* Flash Sale */}
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Flash Sale</Text>
      <View style={styles.timerContainer}>
        <Icon name="time-outline" size={16} color="#004BFE" />
        <Text style={styles.timerText}>00</Text>
        <Text style={styles.timerText}>36</Text>
        <Text style={styles.timerText}>58</Text>
      </View>
    </View>

    <FlatList
      horizontal
      // numColumns={3}
      data={dummyProducts}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) => (
        <View style={styles.flashSaleCard}>
          <Image source={item.image} style={styles.flashSaleImage} />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-20%</Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.flashSaleList}
      showsHorizontalScrollIndicator={false}
    />

    {/* Most Popular */}
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Most Popular</Text>
      <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.seeAll}>See All</Text>
        <Image
          source={require('../assets/seeAll.png')}
          style={styles.seeAllIcon}
        />
      </TouchableOpacity>
    </View>

    <FlatList
      horizontal
      data={dummyProducts}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) => (
        <View style={styles.flashSaleCard}>
          <Image source={item.image} style={styles.flashSaleImage} />
          <View style={styles.discountBadge}>
            {/* <Text style={styles.discountText}>-20%</Text> */}
          </View>
        </View>
      )}
      contentContainerStyle={styles.flashSaleList}
      showsHorizontalScrollIndicator={false}
    />

    {/* Just For You */}
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Just For You</Text>
    </View>

    <View style={styles.justForYouGrid}>
      {dummyProducts.map((item, index) => (
        <View key={index} style={styles.justForYouCard}>
          <Image source={item.image} style={styles.justForYouImage} />
          <Text style={styles.justForYouTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.justForYouPrice}>{item.price}</Text>
        </View>
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent:'center',
    gap: 10,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    // marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    width: '80%',
    // paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    margin: 16,
  },
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
  celebrityImage: {width: 80, height: 80, borderRadius: 40},
  celebrityName: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  productCard: {width: 140, marginRight: 16, marginTop: 16},
  productImage: {width: '100%', height: 140, borderRadius: 10},
  productTitle: {fontSize: 14, marginVertical: 4, color: '#000'},
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
  popularImage: {width: '100%', height: 160},
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  //   seeAll: {
  //     fontSize: 14,
  //     color: '#004BFE',
  //   },
  seeAll: {
    fontSize: 16,
    // color: '#004BFE',
    fontWeight: '600',
    marginRight: 4, // Space between text and icon
  },
  seeAllIcon: {
    width: 30, // Adjust based on your image
    height: 30, // Adjust based on your image
    // tintColor: '#004BFE', // Optional: match text color
  },
  categoryList: {
    paddingLeft: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#000',
  },
  topProductsList: {
    paddingLeft: 16,
  },
  topProductAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  productList: {
    paddingLeft: 16,
  },
  productCard: {
    width: 160,
    marginRight: 16,
  },
  productImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productTitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#004BFE',
    marginHorizontal: 4,
  },
  flashSaleList: {
    paddingLeft: 16,
  },
  flashSaleCard: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 16,
    overflow: 'hidden',
  },
  flashSaleImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  popularList: {
    paddingLeft: 16,
  },
  popularCard: {
    width: 100,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularLikes: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  popularTitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
  justForYouGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  justForYouCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  justForYouImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  justForYouTitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  justForYouPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default HomeScreen;
