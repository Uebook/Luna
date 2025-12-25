import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const LiveProductCard = () => {
    return (
        <View style={styles.card}>
            <Image
                source={require('../assets/image8.png')}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Footer overlay */}
            <View style={styles.footer}>
                <View style={styles.leftSection}>
                    <View style={styles.row}>
                        <Icon name="eye-outline" size={16} color="#000" />
                        <Text style={styles.viewerText}>2,530</Text>
                    </View>

                    <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>● Live</Text>
                    </View>
                </View>

                <View style={styles.rightSection}>
                    <TouchableOpacity style={styles.playButton}>
                        <Icon name="play-forward" size={18} color="#007bff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shopButton}>
                        <Text style={styles.shopText}>Shop</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: width,
        height: height - 30,
        backgroundColor: '#000',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white', // semi-transparent black overlay
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    viewerText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#000',
    },
    liveBadge: {
        backgroundColor: 'green',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    liveText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        marginRight: 10,
    },
    shopButton: {
        backgroundColor: '#004BFE',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    shopText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default LiveProductCard;
