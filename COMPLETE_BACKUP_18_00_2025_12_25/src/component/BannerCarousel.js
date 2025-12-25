import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const {width} = Dimensions.get('window');

const BannerCarousel = ({
  autoPlay = true,
  timer = 3000,
  onPress,
  indicatorActiveColor = '#8337B2',
  indicatorInactiveColor = '#D3D3D3',
  animation = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const flatListRef = useRef();

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (autoPlay && banners.length > 0) {
      startAutoPlay();
    }
    return stopAutoPlay;
  }, [autoPlay, banners]);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(
        'https://argosmob.com/being-petz/public/api/v1/banner/all',
      );
      if (response.data.status && response.data.banners) {
        setBanners(response.data.banners);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const startAutoPlay = () => {
    if (intervalRef.current || banners.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: animation,
        });
        return nextIndex;
      });
    }, timer);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const restartAutoPlayWithDelay = () => {
    stopAutoPlay();
    setTimeout(() => {
      startAutoPlay();
    }, 3000);
  };

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {
      useNativeDriver: false,
      listener: event => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
      },
    },
  );

  const renderItem = ({item}) => {
    const imageUrl = `https://argosmob.com/being-petz/public/${item.mobile_image}`;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress && onPress(item)}>
        <Image source={{uri: imageUrl}} style={styles.bannerImage} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#8337B2" />
        {/* <HeaderLoader visible={loading}/> */}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error loading banners: {error}</Text>
      </View>
    );
  }

  if (banners.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No banners available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={restartAutoPlayWithDelay}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 500);
        }}
      />

      <View style={styles.indicatorContainer}>
        {banners.map((_, index) => (
          <View
            key={index.toString()}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentIndex
                    ? indicatorActiveColor
                    : indicatorInactiveColor,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    overflow: 'hidden',
    borderRadius: 16,
  },
  bannerImage: {
    width,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});

export default BannerCarousel;
