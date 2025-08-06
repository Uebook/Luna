import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const SettingsProfileScreen = ({ navigation }) => {
    const [name, setName] = useState('Romina');
    const [email, setEmail] = useState('gmail@example.com');
    const [password, setPassword] = useState('**********');

    const handleSave = () => {
        // Save logic here
        console.log('Changes Saved');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.subHeader}>Your Profile</Text>

            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                    style={styles.avatar}
                />
                <TouchableOpacity

                    style={styles.editIcon}>
                    <Icon name="edit-2" size={14} color="#fff" />
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
            />

            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
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
        marginBottom: 24,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editIcon: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#004BFE',
        borderRadius: 12,
        padding: 6,
    },
    input: {
        backgroundColor: '#F3F6FD',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        fontSize: 15,
        marginBottom: 16,
    },
    saveButton: {
        backgroundColor: '#004BFE',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default SettingsProfileScreen;
