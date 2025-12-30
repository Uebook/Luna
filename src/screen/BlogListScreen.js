// src/screen/BlogListScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image as RNImage,
  Dimensions, RefreshControl, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

const { width } = Dimensions.get('window');
const BLOG_BASE = 'https://proteinbros.in/assets/images/blogs/';
const API_BASE = 'https://luna-api.proteinbros.in/public/api/v1';

const ensureAbs = (u, base = '') => {
  if (!u) return null;
  if (typeof u !== 'string') return u;
  if (/^(https?:|file:|content:|data:)/i.test(u)) return u;
  return `${base}${u.replace(/^\/+/, '')}`;
};

const BlogCard = ({ item, onPress, styles, THEME }) => {
  const imageUrl = ensureAbs(item.photo, BLOG_BASE) || ensureAbs(item.image, BLOG_BASE);
  
  return (
    <TouchableOpacity
      style={styles.blogCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.blogImageWrap}>
        {imageUrl ? (
          <RNImage
            source={{ uri: imageUrl }}
            style={styles.blogImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.blogImage, { backgroundColor: THEME.line, justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="image-outline" size={40} color={THEME.gray} />
          </View>
        )}
      </View>
      <View style={styles.blogContent}>
        <Text style={styles.blogCategory}>{item.category || 'Blog'}</Text>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.title || 'Untitled'}</Text>
        {item.details && (
          <Text style={styles.blogExcerpt} numberOfLines={3}>
            {item.details.replace(/<[^>]*>/g, '').substring(0, 100)}...
          </Text>
        )}
        <View style={styles.blogFooter}>
          <Text style={styles.blogAuthor}>{item.author || 'Team Luna'}</Text>
          <Text style={styles.blogDate}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BlogListScreen({ route, navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const { theme } = useTheme();
  const THEME = useMemo(() => ({
    p1: theme.p1,
    p2: theme.p2,
    white: theme.white,
    ink: theme.ink,
    gray: theme.gray,
    bg: theme.bg,
    card: theme.card,
    line: theme.line,
    isDark: theme.isDark || false,
  }), [theme]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    content: { padding: 16 },
    blogCard: {
      backgroundColor: THEME.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: THEME.line,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    blogImageWrap: { height: 200, width: '100%' },
    blogImage: { width: '100%', height: '100%' },
    blogContent: { padding: 16 },
    blogCategory: {
      fontSize: 11,
      fontWeight: '800',
      color: THEME.p1,
      letterSpacing: 0.5,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    blogTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: THEME.ink,
      marginBottom: 8,
      lineHeight: 24,
    },
    blogExcerpt: {
      fontSize: 14,
      color: THEME.gray,
      lineHeight: 20,
      marginBottom: 12,
    },
    blogFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: THEME.line,
    },
    blogAuthor: {
      fontSize: 13,
      fontWeight: '600',
      color: THEME.ink,
    },
    blogDate: {
      fontSize: 12,
      color: THEME.gray,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: THEME.gray,
      textAlign: 'center',
      marginTop: 16,
    },
    errorText: {
      fontSize: 14,
      color: THEME.red || '#FF3B30',
      textAlign: 'center',
      padding: 16,
    },
  }), [THEME]);

  const fetchBlogs = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      const url = `${API_BASE}/screen/discovers`;
      const response = await axios.post(url, {}, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      if (response?.data?.status && Array.isArray(response.data.discovers)) {
        // Process blog images to ensure full URLs
        const processedBlogs = response.data.discovers.map(blog => ({
          ...blog,
          photo: blog.photo ? ensureAbs(blog.photo, BLOG_BASE) : null,
          image: blog.image ? ensureAbs(blog.image, BLOG_BASE) : null,
        }));
        setBlogs(processedBlogs);
      } else {
        setBlogs([]);
      }
    } catch (e) {
      console.error('Error fetching blogs:', e);
      setError(e.response?.data?.message || e.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs(true);
  };

  const handleBlogPress = (blog) => {
    navigation?.navigate?.('BlogDetailScreen', { blog });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={THEME.isDark ? 'light-content' : 'dark-content'} />
      <StandardHeader
        title="From Our Blog"
        onBackPress={() => navigation?.goBack?.()}
      />
      
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={THEME.p1} />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle-outline" size={48} color={THEME.gray} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={{
              marginTop: 16,
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: THEME.p1,
              borderRadius: 8,
            }}
            onPress={() => fetchBlogs()}
          >
            <Text style={{ color: THEME.white, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : blogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="document-text-outline" size={48} color={THEME.gray} />
          <Text style={styles.emptyText}>No blogs available</Text>
        </View>
      ) : (
        <FlatList
          data={blogs}
          keyExtractor={(item, index) => item.id?.toString() || `blog-${index}`}
          renderItem={({ item }) => (
            <BlogCard
              item={item}
              onPress={() => handleBlogPress(item)}
              styles={styles}
              THEME={THEME}
            />
          )}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.p1}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

