import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    SafeAreaView,
    ScrollView
} from 'react-native';

const reviews = [
    {
        id: '1',
        name: 'Veronika',
        rating: 4,
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
    },
    {
        id: '2',
        name: 'Veronika',
        rating: 5,
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
    },
    {
        id: '3',
        name: 'Veronika',
        rating: 5,
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
    },
    {
        id: '4',
        name: 'Veronika',
        rating: 5,
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        review:
            'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum',
    },
];

const ReviewScreen = () => {
    const [loading, setLoading] = useSkeletonLoader(true, 600);

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setLoading]);

    if (loading) {
        return <SkeletonListScreen />;
    }

    const renderStars = (count) => {
        return (
            <Text style={styles.stars}>
                {'★'.repeat(count)}{'☆'.repeat(5 - count)}
            </Text>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollWrap}>
                <Text style={styles.title}>Reviews</Text>
                {reviews.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            {renderStars(item.rating)}
                            <Text style={styles.reviewText}>{item.review}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollWrap: { padding: 16 },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    card: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    stars: {
        color: '#FFA500',
        marginBottom: 6,
        fontSize: 16,
    },
    reviewText: {
        color: '#333',
        fontSize: 14,
    },
});

export default ReviewScreen;
