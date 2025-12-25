import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SetupNewPasswordScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    
    const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

    const handleSave = () => {
        if (newPassword === repeatPassword && newPassword.length >= 6) {
            // Save logic
            console.log('Password saved');
        } else {
            alert('Passwords do not match or are too short.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <Image
                source={require('../assets/Bubblepassord.png')}
                style={styles.bgImage}
            />

            {/* User Image */}
            <View style={styles.avatarWrapper}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D' }} // use your avatar image
                    style={styles.avatarImage}
                />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Setup New Password</Text>
            <Text style={styles.subtitle}>
                Please, setup a new password for{'\n'}your account
            </Text>

            {/* Inputs */}
            <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                placeholderTextColor="#ccc"
            />
            <TextInput
                placeholder="Repeat Password"
                secureTextEntry
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                style={styles.input}
                placeholderTextColor="#ccc"
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SetupNewPasswordScreen;

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
        marginTop: 8,
        textAlign: 'center',
    },
    input: {
        width: width * 0.8,
        height: 50,
        backgroundColor: '#f1f1f1',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginTop: 20,
        fontSize: 16,
        color: '#2d3436',
    },
    saveButton: {
        marginTop: 40,
        backgroundColor: '#004CFF',
        paddingVertical: 14,
        borderRadius: 30,
        width: width * 0.8,
        alignItems: 'center',
    },
    saveButtonText: {
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
