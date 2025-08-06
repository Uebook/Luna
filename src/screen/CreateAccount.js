import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import Icon from 'react-native-vector-icons/Feather';

const CreateAccountScreen = () => {
    const [countryCode, setCountryCode] = useState('GB');
    const [withCountryNameButton] = useState(false);
    const [withFlag] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <ImageBackground
            source={require('../assets/Bubblesignup.png')} // 🔁 Replace with your image path
            style={styles.background}
        // resizeMode="cover"
        >
            <View style={styles.container}>
                <Text style={styles.title}>Create{'\n'}Account</Text>

                <TouchableOpacity style={styles.avatarCircle}>
                    <Icon name="camera" size={24} color="#004CFF" />
                </TouchableOpacity>

                <TextInput
                    placeholder="Email"
                    style={styles.inputBox}
                    placeholderTextColor="#999"
                />

                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="Password"
                        style={[styles.input, { flex: 1 }]}

                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                        <Icon
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color="#999"
                            style={styles.eyeIcon}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                    <CountryPicker
                        {...{
                            countryCode,
                            withFlag,
                            withCountryNameButton,
                            withFilter: true,
                            onSelect: country => setCountryCode(country.cca2),
                        }}
                        containerButtonStyle={{ marginRight: 8 }}
                    />
                    <TextInput
                        placeholder="Your number"
                        style={[styles.input, {
                            flex: 1,
                            borderLeftWidth: 1,
                            borderColor: '#ccc',
                            paddingLeft: 12
                        }]}
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.doneButton}>
                        <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                    <Text style={styles.cancelText}>Cancel</Text>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 80,
        backgroundColor: 'transparent', // or remove this line entirely
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 32,
        color: '#000',
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#004CFF',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 32,
    },
    inputBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 30,
        paddingHorizontal: 20,
        fontSize: 16,
        height: 55,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 30,
        paddingHorizontal: 16,
        height: 55,
        marginBottom: 16,
    },
    input: {
        fontSize: 16,
    },
    eyeIcon: {
        marginLeft: 12,
    },
    doneButton: {
        backgroundColor: '#004CFF',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 16,
        height: 60
    },
    doneText: {
        color: '#fff',
        fontSize: 18,
    },
    cancelText: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 16,
        color: '#000',
        height: 60
    },
    bottomActions: {
        marginTop: 'auto',
        paddingBottom: 24,
    },
});

export default CreateAccountScreen;
