import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const issues = [
    'Order Issues',
    'Item Quality',
    'Payment Issues',
    'Technical Assistance',
    'Other',
];

const ChatBotScreen = ({ navigation }) => {
    const [selectedIssue, setSelectedIssue] = useState('Order Issues');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Icon name="lock-closed-outline" size={24} color="blue" />
                </View>
                <View>
                    <Text style={styles.chatBotName}>Chat Bot</Text>
                    <Text style={styles.chatBotSubtitle}>Customer Care Service</Text>
                </View>
            </View>

            {/* Welcome Message Box */}
            <View style={styles.messageBox}>
                <Text style={styles.messageText}>
                    Hello, Amanda! Welcome to Customer Care Service. We will be happy to help you.
                    Please, provide us more details about your issue before we can start.
                </Text>
            </View>

            {/* Card for Issue Selection */}
            <View style={styles.issueCard}>
                <Text style={styles.questionText}>What's your issue?</Text>

                <View style={styles.issueOptions}>
                    {issues.map((issue) => (
                        <TouchableOpacity
                            key={issue}
                            style={[
                                styles.issueButton,
                                selectedIssue === issue && styles.issueButtonSelected,
                            ]}
                            onPress={() => setSelectedIssue(issue)}
                        >
                            {selectedIssue === issue && (
                                <Icon
                                    name="checkmark-circle"
                                    size={18}
                                    color="white"
                                    style={styles.checkIcon}
                                />
                            )}
                            <Text
                                style={[
                                    styles.issueButtonText,
                                    selectedIssue === issue && styles.issueTextSelected,
                                ]}
                            >
                                {issue}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Next Button */}
            <TouchableOpacity onPress={() => navigation.navigate('ChatSupportScreen')} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ChatBotScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
        backgroundColor: '#F9F9F9',
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e5f0ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    chatBotName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#1D4ED8',
    },
    chatBotSubtitle: {
        color: '#444',
    },
    messageBox: {
        backgroundColor: '#E0EDFF',
        padding: 12,
        borderRadius: 12,
        borderColor: '#1D4ED8',
        borderWidth: 2,
        marginBottom: 24,
    },
    messageText: {
        color: '#111',
        fontSize: 14,
    },
    issueCard: {
        borderWidth: 1,
        borderColor: '#1D4ED8',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 24,
        marginTop: 130
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#111827',
    },
    issueOptions: {
        flexWrap: 'wrap',
        gap: 5,
    },
    issueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#1D4ED8',
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
        height: 50,
    },
    issueButtonSelected: {
        backgroundColor: '#1D4ED8',
    },
    issueButtonText: {
        fontSize: 14,
        color: '#1D4ED8',
    },
    issueTextSelected: {
        color: '#fff',
        marginLeft: 6,
    },
    checkIcon: {
        marginRight: 6,
    },
    nextButton: {
        backgroundColor: '#1D4ED8',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
