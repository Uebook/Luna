import React from 'react';
import {
    View,
    Text,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
} from 'react-native';

const AboutScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={{ uri: 'https://img.icons8.com/fluency/96/shopping-bag.png' }}
                    style={styles.logo}
                />
                <Text style={styles.title}>About Shoppe</Text>
                <Text style={styles.description}>
                    Shoppe - Shopping UI kit is likely a user interface (UI) kit designed to facilitate the development of e-commerce or shopping-related applications. UI kits are collections of pre-designed elements, components, and templates that developers and designers can use to create consistent and visually appealing user interfaces.
                </Text>
                <Text style={styles.description}>
                    If you need help or you have any questions, feel free to contact me by email.
                </Text>
                <Text style={styles.email}>hello@mydomain.com</Text>
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
        padding: 24,
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#000',
    },
    description: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: 16,
        textAlign: 'left',
    },
    email: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: 15,
    },
});

export default AboutScreen;
