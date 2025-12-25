import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useResponsive } from '../utils/useResponsive';

const PasswordScreen = () => {
    const { width, height, scale, fontSize, spacing, verticalScale } = useResponsive();
    const styles = useMemo(() => createStyles(width, height, scale, fontSize, spacing, verticalScale), [width, height, scale, fontSize, spacing, verticalScale]);

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

const createStyles = (width, height, scale, fontSize, spacing, verticalScale) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: verticalScale(60),
    },
    bgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: verticalScale(350),
        resizeMode: 'cover',
    },
    avatarWrapper: {
        marginTop: height * 0.25,
        backgroundColor: '#fff',
        borderRadius: scale(60),
        padding: scale(4),
        elevation: 5,
    },
    avatarImage: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
    },
    welcomeText: {
        fontSize: fontSize(24),
        fontWeight: 'bold',
        marginTop: spacing(20),
        color: '#2d3436',
    },
    subText: {
        fontSize: fontSize(16),
        color: '#636e72',
        marginTop: spacing(10),
    },
    codeInputContainer: {
        flexDirection: 'row',
        marginTop: spacing(30),
        gap: spacing(15),
    },
    codeBox: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(10),
        borderWidth: 1,
        borderColor: '#dcdde1',
        textAlign: 'center',
        fontSize: fontSize(20),
        color: '#2d3436',
        backgroundColor: '#f5f6fa',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.25,
    },
    notYouText: {
        fontSize: fontSize(14),
        color: '#636e72',
        marginRight: spacing(10),
    },
    circleButton: {
        backgroundColor: '#004CFF',
        width: scale(34),
        height: scale(34),
        borderRadius: scale(17),
        alignItems: 'center',
        justifyContent: 'center',
    },
});
