import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';
import { launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';

const categoriesData = [
    { name: 'Dresses', image: 'https://picsum.photos/id/1011/100', selected: true },
    { name: 'Pants', image: 'https://picsum.photos/id/1012/100', selected: true },
    { name: 'Skirts', image: 'https://picsum.photos/id/1013/100', selected: false },
    { name: 'Shorts', image: 'https://picsum.photos/id/1014/100', selected: false },
    { name: 'Jackets', image: 'https://picsum.photos/id/1015/100', selected: false },
    { name: 'Hoodies', image: 'https://picsum.photos/id/1016/100', selected: false },
    { name: 'Shirts', image: 'https://picsum.photos/id/1017/100', selected: false },
    { name: 'Polo', image: 'https://picsum.photos/id/1018/100', selected: false },
    { name: 'T-shirts', image: 'https://picsum.photos/id/1019/100', selected: true },
    { name: 'Tunics', image: 'https://picsum.photos/id/1020/100', selected: false },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const colors = ['white', 'black', 'blue', 'red', 'cyan', 'gold', 'purple'];
const sortOptions = ['Popular', 'Newest', 'Price High to Low', 'Price Low to High'];

const ShopScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [categoryList, setCategoryList] = useState(categoriesData);
    const [selectedType, setSelectedType] = useState('Clothes');
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('white');
    const [minPrice, setMinPrice] = useState(10);
    const [maxPrice, setMaxPrice] = useState(150);
    const [selectedSort, setSelectedSort] = useState('Popular');
    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'App needs access to your camera',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // iOS auto handles with plist
    };
    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        launchCamera({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) console.error('Camera error:', response.errorMessage);
            else console.log('Image:', response.assets);
        });
    };
    const toggleCategory = (name) => {
        setCategoryList(prev =>
            prev.map(item =>
                item.name === name ? { ...item, selected: !item.selected } : item
            )
        );
    };

    const products = Array.from({ length: 6 }, (_, i) => ({
        id: i.toString(),
        image: `https://randomuser.me/api/portraits/women/${20 + i}.jpg`,
        title: 'Lorem ipsum dolor sit amet consectetur',
        price: '$17.00',
    }));

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{item.price}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.searchBarContainer}>
                <View style={styles.searchInputWrapper}>

                    <TextInput
                        placeholder="Search products"
                        placeholderTextColor="#aaa"
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    <Icon name="search" size={18} color="#888" />
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={openCamera}>
                        <Icon name="camera" size={20} color="#000" style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFilterVisible(true)}>
                        <Icon name="sliders" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Product Grid */}
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
            />

            {/* Filter Modal */}
            <Modal visible={filterVisible} animationType="slide" transparent onRequestClose={() => setFilterVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter</Text>
                            <Pressable onPress={() => setFilterVisible(false)}>
                                <Text style={{ fontSize: 20 }}>✕</Text>
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Categories */}
                            <Text style={styles.sectionTitle}>Category</Text>
                            <View style={styles.categoryWrap}>
                                {categoryList.map(item => (
                                    <TouchableOpacity key={item.name} onPress={() => toggleCategory(item.name)} style={styles.categoryItem}>
                                        <Image source={{ uri: item.image }} style={styles.categoryImage} />
                                        {item.selected && <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>}
                                        <Text style={styles.categoryLabel}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Type Toggle */}
                            <Text style={styles.sectionTitle}>Size</Text>
                            <View style={styles.typeToggle}>
                                <TouchableOpacity
                                    style={[styles.typeButton, selectedType === 'Clothes' && styles.typeSelected]}
                                    onPress={() => setSelectedType('Clothes')}
                                >
                                    <Text style={{ color: selectedType === 'Clothes' ? '#004BFE' : '#000' }}>Clothes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, selectedType === 'Shoes' && styles.typeSelectedPink]}
                                    onPress={() => setSelectedType('Shoes')}
                                >
                                    <Text style={{ color: selectedType === 'Shoes' ? '#DB3C72' : '#000' }}>Shoes</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Sizes */}
                            <View style={styles.sizeWrap}>
                                {sizes.map(size => (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => setSelectedSize(size)}
                                        style={[styles.sizeButton, selectedSize === size && styles.sizeSelected]}
                                    >
                                        <Text style={{ color: selectedSize === size ? '#fff' : '#000' }}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Colors */}
                            <Text style={styles.sectionTitle}>Color</Text>
                            <View style={styles.colorRow}>
                                {colors.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        style={[
                                            styles.colorCircle,
                                            {
                                                backgroundColor: color,
                                                borderWidth: selectedColor === color ? 2 : 0,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>

                            {/* Price */}
                            <Text style={styles.sectionTitle}>Price</Text>
                            <Slider
                                minimumValue={10}
                                maximumValue={150}
                                step={1}
                                value={minPrice}
                                onValueChange={setMinPrice}
                                minimumTrackTintColor="#004BFE"
                                style={{ marginTop: 10 }}
                            />
                            <Text style={styles.priceText}>${minPrice} — ${maxPrice}</Text>

                            {/* Sort Options */}
                            <Text style={styles.sectionTitle}>Sort By</Text>
                            <View style={styles.sortOptions}>
                                {sortOptions.map(option => (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => setSelectedSort(option)}
                                        style={[
                                            styles.sortOption,
                                            selectedSort === option && styles.sortOptionSelected,
                                        ]}
                                    >
                                        <Text style={{ color: selectedSort === option ? '#004BFE' : '#000' }}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Actions */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => {
                                        setCategoryList(categoriesData);
                                        setSelectedColor('white');
                                        setMinPrice(10);
                                        setMaxPrice(150);
                                        setSelectedSort('Popular');
                                        setSelectedSize('M');
                                        setSelectedType('Clothes');
                                    }}
                                >
                                    <Text style={{ color: '#004BFE' }}>Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.applyButton} onPress={() => setFilterVisible(false)}>
                                    <Text style={{ color: '#fff' }}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16 },
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    searchInputWrapper: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#E0F2FE', borderRadius: 25,
        paddingHorizontal: 12, paddingVertical: 6, marginRight: 10,
    },
    searchFilterTag: {
        fontSize: 13, color: '#004BFE', backgroundColor: '#D2EAFE',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 8,
    },
    searchInput: { flex: 1, fontSize: 14, color: '#000', marginRight: 8 },
    headerIcons: { flexDirection: 'row', gap: 14 },
    productList: { paddingBottom: 16 },
    card: {
        backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 16, width: '48%',
        shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 2,
    },
    productImage: { width: '100%', height: 160 },
    title: { fontSize: 13, paddingHorizontal: 10, paddingTop: 8, color: '#222' },
    price: { fontSize: 14, fontWeight: 'bold', padding: 10, color: '#000' },
    icon: { marginRight: 10 },

    modalContainer: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, maxHeight: '95%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    sectionTitle: { marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 16 },

    categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    categoryItem: { width: '30%', alignItems: 'center', marginBottom: 15, position: 'relative' },
    categoryImage: { width: 60, height: 60, borderRadius: 30 },
    categoryLabel: { marginTop: 5, fontSize: 12 },
    checkCircle: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#004BFE', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    },
    checkMark: { color: '#fff', fontSize: 12 },

    typeToggle: { flexDirection: 'row', marginBottom: 15 },
    typeButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, backgroundColor: '#eee' },
    typeSelected: { backgroundColor: '#D2EAFE', borderColor: '#004BFE', borderWidth: 1 },
    typeSelectedPink: { backgroundColor: '#FADBE6', borderColor: '#DB3C72', borderWidth: 1 },

    sizeWrap: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
    sizeButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#eee' },
    sizeSelected: { backgroundColor: '#004BFE' },

    colorRow: { flexDirection: 'row', gap: 10 },
    colorCircle: { width: 30, height: 30, borderRadius: 15, borderColor: '#004BFE' },

    priceText: { marginTop: 10, fontWeight: '600' },

    sortOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    sortOption: {
        paddingHorizontal: 14, paddingVertical: 8,
        backgroundColor: '#f0f0f0', borderRadius: 20,
    },
    sortOptionSelected: {
        backgroundColor: '#D2EAFE', borderWidth: 1, borderColor: '#004BFE',
    },

    modalFooter: {
        flexDirection: 'row', justifyContent: 'space-between', marginTop: 30,
    },
    clearButton: {
        paddingVertical: 12, paddingHorizontal: 20,
        borderWidth: 1, borderColor: '#004BFE', borderRadius: 10,
    },
    applyButton: {
        paddingVertical: 12, paddingHorizontal: 30,
        backgroundColor: '#004BFE', borderRadius: 10,
    },
});

export default ShopScreen;
