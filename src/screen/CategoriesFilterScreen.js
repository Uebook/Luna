import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const categoriesData = [
    {
        name: 'Clothing',
        image: '👗',
        expanded: true,
        subcategories: [
            'Dresses', 'Pants', 'Skirts', 'Shorts',
            'Jackets', 'Hoodies', 'Shirts', 'Polo',
            'T-Shirts', 'Tunics'
        ]
    },
    {
        name: 'Shoes', image: '👟', expanded: false, subcategories: []
    },
    {
        name: 'Bags', image: '👜', expanded: false, subcategories: []
    },
    {
        name: 'Lingerie', image: '🩲', expanded: false, subcategories: []
    },
    {
        name: 'Accessories', image: '👗', expanded: false, subcategories: []
    },
    {
        name: 'Just for You', image: '✨', special: true, subcategories: []
    }
];

const CategoriesFilterScreen = ({ navigation }) => {
    const [gender, setGender] = useState('Female');
    const [categories, setCategories] = useState(categoriesData);

    const toggleExpand = (index) => {
        const updated = [...categories];
        updated[index].expanded = !updated[index].expanded;
        setCategories(updated);
    };

    const renderSubcategory = (name, index) => (
        <TouchableOpacity key={index} style={styles.subcategoryButton}>
            <Text style={styles.subcategoryText}>{name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>All Categories</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} >
                        <Icon name="x" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Gender Filter */}
                <View style={styles.genderRow}>
                    {['All', 'Female', 'Male'].map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[styles.genderBtn, gender === g && styles.genderSelected]}
                            onPress={() => setGender(g)}
                        >
                            <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Category Sections */}
                {categories.map((cat, index) => (
                    <View key={cat.name} style={styles.categorySection}>
                        <TouchableOpacity
                            style={styles.categoryHeader}
                            onPress={() => cat.special ? null : toggleExpand(index)}
                        >
                            <View style={styles.catTitleWrap}>
                                <Text style={styles.catIcon}>{cat.image}</Text>
                                <Text style={styles.catTitle}>{cat.name}</Text>
                            </View>
                            {cat.special ? (
                                <MaterialIcons name="arrow-forward" size={20} color="#000" />
                            ) : (
                                <Icon name={cat.expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#000" />
                            )}
                        </TouchableOpacity>

                        {cat.expanded && cat.subcategories.length > 0 && (
                            <View style={styles.subcategoriesGrid}>
                                {cat.subcategories.map(renderSubcategory)}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000'
    },
    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    genderBtn: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 4,
        backgroundColor: '#F2F2F2',
        borderRadius: 10,
        alignItems: 'center'
    },
    genderSelected: {
        backgroundColor: '#004BFE'
    },
    genderText: {
        fontWeight: '600',
        color: '#000'
    },
    genderTextActive: {
        color: '#fff'
    },
    categorySection: {
        marginBottom: 14
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        padding: 12,
        borderRadius: 10
    },
    catTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    catIcon: {
        fontSize: 20
    },
    catTitle: {
        fontWeight: 'bold',
        fontSize: 15
    },
    subcategoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 10
    },
    subcategoryButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#FFD9D9',
        borderRadius: 10
    },
    subcategoryText: {
        fontSize: 14,
        color: '#000'
    }
});

export default CategoriesFilterScreen;