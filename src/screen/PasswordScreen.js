import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const PasswordScreen = () => {
    return (
        <View style={styles.container}>
            {/* Background PNG Shape */}
            <Image
                source={require('../assets/Bubbleotp.png')}
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

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Hello, Romina!!</Text>
            <Text style={styles.subText}>Type your password</Text>

            {/* 4 Digit Input Boxes */}
            <View style={styles.codeInputContainer}>
                {[1, 2, 3, 4].map((_, index) => (
                    <TextInput
                        key={index}
                        style={styles.codeBox}
                        keyboardType="numeric"
                        maxLength={1}
                    />
                ))}
            </View>

            {/* Bottom Row */}
            <View style={styles.bottomRow}>
                <Text style={styles.notYouText}>Not you?</Text>
                <TouchableOpacity style={styles.circleButton}>
                    <FeatherIcon name="arrow-right" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 60,
    },
    bgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: 350,
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
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#2d3436',
    },
    subText: {
        fontSize: 16,
        color: '#636e72',
        marginTop: 10,
    },
    codeInputContainer: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 15,
    },
    codeBox: {
        width: 50,
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dcdde1',
        textAlign: 'center',
        fontSize: 20,
        color: '#2d3436',
        backgroundColor: '#f5f6fa',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.25,
    },
    notYouText: {
        fontSize: 14,
        color: '#636e72',
        marginRight: 10,
    },
    circleButton: {
        backgroundColor: '#004CFF',
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
