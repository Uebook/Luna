import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const currencies = [
    { label: '$ USD' },
    { label: '€ EURO' },
    { label: '₫ VND' },
    { label: '₽ RUB' },
];

const ChooseCurrencyScreen = () => {
    const [selectedCurrency, setSelectedCurrency] = useState('$ USD');

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.subHeader}>Currency</Text>

            <FlatList
                data={currencies}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => {
                    const isSelected = selectedCurrency === item.label;
                    return (
                        <TouchableOpacity
                            style={[styles.item, isSelected && styles.selectedItem]}
                            onPress={() => setSelectedCurrency(item.label)}
                        >
                            <Text style={styles.itemText}>{item.label}</Text>
                            <View style={[styles.circle, isSelected ? styles.selectedCircle : styles.unselectedCircle]}>
                                {isSelected && <Icon name="check" size={14} color="#fff" />}
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    subHeader: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
    },
    selectedItem: {
        backgroundColor: '#EAF0FF',
    },
    itemText: {
        fontSize: 15,
        color: '#000',
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCircle: {
        backgroundColor: '#004BFE',
    },
    unselectedCircle: {
        backgroundColor: '#FBCDD0',
    },
});

export default ChooseCurrencyScreen;
