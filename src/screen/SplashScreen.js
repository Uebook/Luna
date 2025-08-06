import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, SafeAreaView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';

const SplashScreen = ({ navigation }) => {
    const iconPosition = useRef(new Animated.Value(-100)).current;
    const iconOpacity = useRef(new Animated.Value(0)).current;
    const footerPosition = useRef(new Animated.Value(50)).current;
    const footerOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Icon animation (comes from top)
        Animated.parallel([
            Animated.timing(iconPosition, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }),
            Animated.timing(iconOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Footer animation (fades in after a delay)
        Animated.parallel([
            Animated.timing(footerPosition, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.exp),
                delay: 400,
                useNativeDriver: true,
            }),
            Animated.timing(footerOpacity, {
                toValue: 1,
                duration: 600,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            transform: [{ translateY: iconPosition }],
                            opacity: iconOpacity,
                        }
                    ]}
                >
                    <Icon name="shopping-bag" size={60} color="#004CFF" style={styles.icon} />
                </Animated.View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Shoppe</Text>
                    <Text style={styles.subtitle}>
                        Beautiful eCommerce UI Kit{"\n"}
                        for your online store
                    </Text>
                </View>
            </View>

            <Animated.View
                style={[
                    styles.footer,
                    {
                        transform: [{ translateY: footerPosition }],
                        opacity: footerOpacity,
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('CreateAccount')}
                >
                    <Text style={styles.buttonText}>Let's get started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('LoginScreen')}
                >
                    <Text style={styles.loginText}>I already have an account</Text>
                    <View style={styles.arrowCircle}>
                        <FeatherIcon name="arrow-right" size={16} color="white" />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 30,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        color: '#2d3436',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#636e72',
        textAlign: 'center',
        lineHeight: 27,
    },
    footer: {
        position: 'absolute',
        bottom: height * 0.08,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
    },
    primaryButton: {
        backgroundColor: '#004CFF',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#6c5ce7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginText: {
        color: '#004CFF',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 8,
    },
    arrowCircle: {
        backgroundColor: '#004CFF',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SplashScreen;