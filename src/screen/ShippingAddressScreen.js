import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ShippingAddressScreen = ({ navigation }) => {
    const [country, setCountry] = useState('Choose your country');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');
    const [phone, setPhone] = useState('');

    const handleSave = () => {
        // Save logic here
        console.log('Saved:', { country, address, city, postcode, phone });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Settings</Text>
                <Text style={styles.subHeader}>Shipping Address</Text>

                <View style={styles.rowBetween}>
                    <View>
                        <Text style={styles.label}>Country</Text>
                        <Text style={styles.country}>{country}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('ChooseCountryScreen')}  >
                        <Icon name="arrow-right-circle" size={22} color="#004BFE" />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Required"
                    value={address}
                    onChangeText={setAddress}
                />

                <Text style={styles.label}>Town / City</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Required"
                    value={city}
                    onChangeText={setCity}
                />

                <Text style={styles.label}>Postcode</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Required"
                    value={postcode}
                    onChangeText={setPostcode}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Required"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000',
    },
    subHeader: {
        fontSize: 16,
        color: '#555',
        marginBottom: 24,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '600',
        color: '#333',
    },
    country: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
    },
    input: {
        backgroundColor: '#F3F6FD',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        fontSize: 15,
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#004BFE',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ShippingAddressScreen;
