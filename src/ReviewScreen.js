import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';

const reviews = [
    {
        id: '1',
        name: 'Veronika',
        rating: 5,
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        id: '2',
        name: 'Veronika',
        rating: 5,
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        id: '3',
        name: 'Veronika',
        rating: 5,
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
        id: '4',
        name: 'Veronika',
        rating: 5,
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
];

const ReviewItem = ({ item }) => (
    <View style={styles.reviewContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.reviewContent}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.stars}>
                {Array.from({ length: item.rating }).map((_, index) => (
                    <Icon key={index} name="star" size={18} color="#fbbf24" />
                ))}
            </View>
            <Text style={styles.text}>{item.review}</Text>
        </View>
    </View>
);

const ReviewScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Reviews</Text>
            <FlatList
                data={reviews}
                renderItem={({ item }) => <ReviewItem item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flex: 1,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    reviewContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 12,
    },
    reviewContent: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    stars: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    text: {
        fontSize: 14,
        color: '#444',
    },
});

export default ReviewScreen;
