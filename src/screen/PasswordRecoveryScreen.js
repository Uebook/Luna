import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const PasswordRecoveryScreen = ({ navigation }) => {
    const [selectedMethod, setSelectedMethod] = useState('SMS');

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <Image
                source={require('../assets/Bubblepassord.png')}
                style={styles.bgImage}
            />

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
                <Image
                    source={{
                        uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000',
                    }}
                    style={styles.avatarImage}
                />
            </View>

            {/* Title & Description */}
            <Text style={styles.title}>Password Recovery</Text>
            <Text style={styles.subtitle}>
                How would you like to restore{'\n'}your password?
            </Text>

            {/* Recovery Method Options */}
            <View style={styles.optionsContainer}>
                {['SMS', 'Email'].map(method => (
                    <TouchableOpacity
                        key={method}
                        style={[
                            styles.optionButton,
                            selectedMethod === method
                                ? styles.selectedOption
                                : styles.unselectedOption,
                        ]}
                        onPress={() => setSelectedMethod(method)}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                selectedMethod === method && styles.selectedText,
                            ]}
                        >
                            {method}
                        </Text>
                        <View
                            style={[
                                styles.radioCircle,
                                selectedMethod === method && styles.radioChecked,
                            ]}
                        >
                            {selectedMethod === method && (
                                <Feather name="check" size={12} color="white" />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PasswordRecoveryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    bgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height * 0.35,
        resizeMode: 'cover',
    },
    avatarWrapper: {
        marginTop: height * 0.25,
        backgroundColor: '#fff',
        borderRadius: 60,
        padding: 4,
        elevation: 5,
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#2d3436',
    },
    subtitle: {
        fontSize: 16,
        color: '#636e72',
        marginTop: 10,
        textAlign: 'center',
    },
    optionsContainer: {
        marginTop: 30,
        gap: 16,
    },
    optionButton: {
        width: width * 0.8,
        paddingVertical: 14,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: '#e1e9ff',
    },
    unselectedOption: {
        backgroundColor: '#ffecec',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#636e72',
    },
    selectedText: {
        color: '#004CFF',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioChecked: {
        backgroundColor: '#004CFF',
        borderColor: '#004CFF',
    },
    nextButton: {
        marginTop: 40,
        backgroundColor: '#004CFF',
        paddingVertical: 14,
        borderRadius: 30,
        width: width * 0.8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 20,
    },
    cancelText: {
        color: '#636e72',
        fontSize: 14,
    },
});

