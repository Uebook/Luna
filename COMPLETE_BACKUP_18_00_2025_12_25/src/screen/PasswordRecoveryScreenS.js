import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ImageBackground,
    TextInput,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const PasswordRecoveryScreenS = ({ navigation }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef([]);

    const handleChange = (text, index) => {
        if (/^\d$/.test(text)) {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);
            if (index < 3) {
                inputs.current[index + 1].focus();
            }
        } else if (text === '') {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
        }
    };

    return (<View style={styles.container}>
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


        {/* Title */}
        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.subtitle}>
            Enter the 4-digit code we sent to your phone number
        </Text>
        <Text style={styles.phoneNumber}>+98******00</Text>

        {/* OTP Input Fields */}
        <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                    autoFocus={index === 0}
                />
            ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.sendAgainButton}>
            <Text style={styles.sendAgainText}>Send Again</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
    </View>


    );
};

export default PasswordRecoveryScreenS;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width,
        height,
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    avatarWrapper: {
        marginTop: height * 0.18,
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
        marginBottom: 6,
        lineHeight: 20,
    },
    phoneNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 40,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#DCE1F3',
        textAlign: 'center',
        fontSize: 18,
        backgroundColor: '#F3F4F6',
        color: '#000',
    },
    sendAgainButton: {
        backgroundColor: '#FF5790',
        paddingVertical: 14,
        paddingHorizontal: 50,
        borderRadius: 25,
        marginBottom: 20,
    },
    sendAgainText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    cancelText: {
        fontSize: 16,
        color: '#000',
    },
});
