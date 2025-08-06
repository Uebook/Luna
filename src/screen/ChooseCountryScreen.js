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

const countries = [
    'India', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
    'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan'
];

const ChooseCountryScreen = () => {
    const [selectedCountry, setSelectedCountry] = useState('India');

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.subHeader}>Country</Text>

            <FlatList
                data={countries}
                keyExtractor={(item) => item}
                ListHeaderComponent={() => (
                    selectedCountry ? (
                        <View style={styles.selectedContainer}>
                            <Text style={styles.selectedCountry}>{selectedCountry}</Text>
                            <Icon name="check-circle" size={20} color="#004BFE" />
                        </View>
                    ) : null
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => setSelectedCountry(item)}
                    >
                        <Text style={styles.itemText}>{item}</Text>
                    </TouchableOpacity>
                )}
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
    selectedContainer: {
        backgroundColor: '#EAF0FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
    },
    selectedCountry: {
        color: '#004BFE',
        fontWeight: '600',
    },
    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    itemText: {
        fontSize: 15,
        color: '#000',
    },
});

export default ChooseCountryScreen;
