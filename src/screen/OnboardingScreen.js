import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
const onboardingData = [
    {
        id: '1',
        title: 'Hello',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non consectetur turpis. Morbi eu eleifend lacus.',
        image: require('../assets/wel1.png')
    },
    {
        id: '2',
        title: 'Discover',
        description: 'Explore the best deals and collections curated just for you.',
        image: require('../assets/wel2.png')
    },
    {
        id: '3',
        title: 'Shop Fast',
        description: 'Smooth checkout with express delivery options.',
        image: require('../assets/image6.png')
    },
    {
        id: '4',
        title: 'Get Started',
        description: 'Sign up now and enjoy exclusive member benefits.',
        image: require('../assets/image7.png')
    },
];

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef();

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.navigate('SplashScreen')
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.card}>
                <Image source={item.image} style={styles.image} />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../assets/Bubblelogin.png')}
            resizeMode="cover"
            style={styles.container}
        >

            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
            />

            <View style={styles.pagination}>
                {onboardingData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index && styles.activeDot,
                        ]}
                    />
                ))}
            </View>

            {currentIndex === onboardingData.length - 1 && (
                <TouchableOpacity onPress={handleNext} style={styles.buttonContainer}>
                    <LinearGradient
                        colors={['#007BFF', '#0056D2']}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Let’s Start</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </ImageBackground>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: width * 0.88,
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    image: {
        width: '100%',
        height: 380,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#007BFF',
        resizeMode: 'cover',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 6,
    },
    activeDot: {
        backgroundColor: '#007BFF',
    },
    buttonContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginBottom: 15
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
