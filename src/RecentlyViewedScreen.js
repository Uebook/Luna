import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';

const dummyData = [{
    id: `1`,
    image: require('./assets/Image.jpg'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 17
},
{
    id: `12`,
    image: require('./assets/image1.png'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 27
},
{
    id: `13`,
    image: require('./assets/image2.png'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 17
},
{
    id: `14`,
    image: require('./assets/image3.png'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 37
},
{
    id: `15`,
    image: require('./assets/image4.png'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 47
},

{
    id: `16`,
    image: require('./assets/image5.png'),
    title: 'Lorem ipsum dolor sit amet consectetur',
    price: 17
}];

const RecentlyViewedScreen = () => {
    const [selectedTab, setSelectedTab] = useState('today');
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleTabPress = (tab) => {
        if (tab === 'yesterday') {
            setDatePickerVisible(true);
        } else {
            setSelectedTab(tab);
        }
    };

    const handleConfirm = (date) => {
        setDatePickerVisible(false);
        setSelectedDate(moment(date).format('DD MMM YYYY'));
        setSelectedTab('yesterday');
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.imageWrapper}>
                <Image source={item.image} style={styles.image} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Recently viewed</Text>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'today' && styles.activeTab]}
                    onPress={() => handleTabPress('today')}
                >
                    <Text style={[styles.tabText, selectedTab === 'today' && styles.activeTabText]}>
                        Today
                    </Text>
                    {selectedTab === 'today' && (
                        <Icon name="check-circle" size={16} color="#0057FF" style={styles.checkIcon} />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'yesterday' && styles.activeTab]}
                    onPress={() => handleTabPress('yesterday')}
                >
                    <Text style={[styles.tabText, selectedTab === 'yesterday' && styles.activeTabText]}>
                        Yesterday
                    </Text>
                    {selectedTab === 'yesterday' && (
                        <Icon name="check-circle" size={16} color="#0057FF" style={styles.checkIcon} />
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.iconWrapper}>
                    <Icon name="chevron-down" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={dummyData}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            />

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisible(false)}
                maximumDate={new Date()}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 10,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    activeTab: {
        backgroundColor: '#e8f0ff',
    },
    tabText: {
        fontWeight: '600',
        color: '#000',
    },
    activeTabText: {
        color: '#0057FF',
    },
    checkIcon: {
        marginLeft: 6,
    },
    iconWrapper: {
        backgroundColor: '#004BFE',
        padding: 10,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemCard: {
        width: '48%',
        marginTop: 20,
    },
    imageWrapper: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111',
        marginTop: 10,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
        color: '#111',
    },
});

export default RecentlyViewedScreen;
