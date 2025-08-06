import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
} from 'react-native';

const celebrities = [
    { id: '1', name: 'Emma Watson', title: 'Actress & Activist', image: 'https://randomuser.me/api/portraits/women/11.jpg' },
    { id: '2', name: 'Chris Hemsworth', title: 'Actor', image: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { id: '3', name: 'Priyanka Chopra', title: 'Actress & Producer', image: 'https://randomuser.me/api/portraits/women/32.jpg' },
    { id: '4', name: 'Virat Kohli', title: 'Cricketer', image: 'https://randomuser.me/api/portraits/men/23.jpg' },
    { id: '5', name: 'Selena Gomez', title: 'Singer & Actress', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: '6', name: 'Tom Holland', title: 'Actor', image: 'https://randomuser.me/api/portraits/men/35.jpg' },
    { id: '7', name: 'Deepika Padukone', title: 'Actress', image: 'https://randomuser.me/api/portraits/women/55.jpg' },
    { id: '8', name: 'Shah Rukh Khan', title: 'Actor', image: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { id: '9', name: 'Kylie Jenner', title: 'Entrepreneur', image: 'https://randomuser.me/api/portraits/women/66.jpg' },
    { id: '10', name: 'Cristiano Ronaldo', title: 'Footballer', image: 'https://randomuser.me/api/portraits/men/56.jpg' },
];

const CelebritiesScreen = () => {
    const [search, setSearch] = useState('');
    const [filteredList, setFilteredList] = useState(celebrities);

    const handleSearch = (text) => {
        setSearch(text);
        const filtered = celebrities.filter(item =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredList(filtered);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.title}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Top Celebrities</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search celebrities..."
                value={search}
                onChangeText={handleSearch}
                placeholderTextColor="#aaa"
            />

            <FlatList
                data={filteredList}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#111',
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 16,
        color: '#000',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },
    title: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});

export default CelebritiesScreen;
