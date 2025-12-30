// src/screen/BlogDetailScreen.js
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image as RNImage,
  Dimensions, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import StandardHeader from '../components/StandardHeader';

const { width } = Dimensions.get('window');
const BLOG_BASE = 'https://proteinbros.in/assets/images/blogs/';

const ensureAbs = (u, base = '') => {
  if (!u) return null;
  if (typeof u !== 'string') return u;
  if (/^(https?:|file:|content:|data:)/i.test(u)) return u;
  return `${base}${u.replace(/^\/+/, '')}`;
};

export default function BlogDetailScreen({ route, navigation }) {
  const { blog } = route?.params || {};
  const [webViewHeight, setWebViewHeight] = useState(500);

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
    scrollContent: { flexGrow: 1 },
    headerImageWrap: { width: '100%', height: 250 },
    headerImage: { width: '100%', height: '100%' },
    placeholderImage: {
      width: '100%',
      height: '100%',
      backgroundColor: THEME.line,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: { padding: 20 },
    category: {
      fontSize: 12,
      fontWeight: '800',
      color: THEME.p1,
      letterSpacing: 0.5,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: THEME.ink,
      marginBottom: 16,
      lineHeight: 36,
    },
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 20,
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: THEME.line,
    },
    author: {
      fontSize: 14,
      fontWeight: '600',
      color: THEME.ink,
    },
    date: {
      fontSize: 13,
      color: THEME.gray,
    },
    webViewContainer: {
      minHeight: 200,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: THEME.card,
      marginTop: 8,
    },
    webView: {
      backgroundColor: 'transparent',
    },
    htmlContent: {
      fontSize: 16,
      lineHeight: 24,
      color: THEME.ink,
    },
  }), [THEME]);

  const imageUrl = blog?.photo ? ensureAbs(blog.photo, BLOG_BASE) : (blog?.image ? ensureAbs(blog.image, BLOG_BASE) : null);
  
  // Sanitize HTML content - remove script tags and alerts
  const sanitizeHtml = (html) => {
    if (!html) return '';
    let sanitized = html
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove event handlers (onclick, onerror, etc.)
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove alert calls (basic removal)
      .replace(/alert\s*\([^)]*\)/gi, '')
      // Remove console calls
      .replace(/console\.[\w]+\([^)]*\)/gi, '');
    return sanitized;
  };
  
  const htmlContent = sanitizeHtml(blog?.details || blog?.description || blog?.content || '');
  
  // Handle WebView messages to calculate height
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'height' && data.height) {
        setWebViewHeight(Math.max(data.height + 50, 200)); // Add padding
      }
    } catch (e) {
      // Ignore parsing errors
    }
  };
  
  // Injected JavaScript to measure content height and remove alerts
  const injectedJavaScript = `
    (function() {
      // Prevent alerts
      window.alert = function() {};
      window.confirm = function() { return false; };
      window.prompt = function() { return null; };
      
      // Measure content height
      function measureHeight() {
        var height = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'height',
          height: height
        }));
      }
      
      // Measure on load and resize
      if (document.readyState === 'complete') {
        measureHeight();
      } else {
        window.addEventListener('load', measureHeight);
      }
      
      // Use MutationObserver to detect content changes
      var observer = new MutationObserver(measureHeight);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });
      
      // Initial measurement
      setTimeout(measureHeight, 100);
    })();
    true; // Required for iOS
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={THEME.isDark ? 'light-content' : 'dark-content'} />
      <StandardHeader
        title="Blog Details"
        onBackPress={() => navigation?.goBack?.()}
      />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View style={styles.headerImageWrap}>
          {imageUrl ? (
            <RNImage
              source={{ uri: imageUrl }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="image-outline" size={60} color={THEME.gray} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {blog?.category && (
            <Text style={styles.category}>{blog.category}</Text>
          )}
          
          <Text style={styles.title}>{blog?.title || 'Untitled'}</Text>
          
          <View style={styles.meta}>
            <Text style={styles.author}>{blog?.author || 'Team Luna'}</Text>
            <Text style={styles.date}>
              {blog?.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
            </Text>
          </View>

          {/* HTML Content */}
          {htmlContent ? (
            <View style={[styles.webViewContainer, { height: webViewHeight }]}>
              <WebView
                originWhitelist={['*']}
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                        <style>
                          * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                          }
                          body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            font-size: 16px;
                            line-height: 1.6;
                            color: ${THEME.ink};
                            background-color: ${THEME.card};
                            padding: 16px;
                          }
                          img {
                            max-width: 100% !important;
                            height: auto !important;
                            border-radius: 8px;
                            margin: 12px 0;
                          }
                          p {
                            margin-bottom: 16px;
                          }
                          h1, h2, h3, h4, h5, h6 {
                            margin-top: 24px;
                            margin-bottom: 12px;
                            color: ${THEME.ink};
                            font-weight: 700;
                          }
                          h1 { font-size: 24px; }
                          h2 { font-size: 22px; }
                          h3 { font-size: 20px; }
                          a {
                            color: ${THEME.p1};
                            text-decoration: none;
                          }
                          ul, ol {
                            margin-left: 20px;
                            margin-bottom: 16px;
                          }
                          li {
                            margin-bottom: 8px;
                          }
                          blockquote {
                            border-left: 4px solid ${THEME.p1};
                            padding-left: 16px;
                            margin: 16px 0;
                            font-style: italic;
                            color: ${THEME.gray};
                          }
                          table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 16px 0;
                          }
                          table td, table th {
                            padding: 8px;
                            border: 1px solid ${THEME.line};
                          }
                          iframe {
                            max-width: 100%;
                            width: 100%;
                            height: auto;
                            min-height: 200px;
                          }
                        </style>
                      </head>
                      <body>
                        ${htmlContent}
                      </body>
                    </html>
                  `
                }}
                style={styles.webView}
                scalesPageToFit={true}
                showsVerticalScrollIndicator={false}
                javaScriptEnabled={true}
                injectedJavaScript={injectedJavaScript}
                onMessage={handleWebViewMessage}
                onShouldStartLoadWithRequest={() => true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: THEME.gray }}>Loading content...</Text>
                  </View>
                )}
              />
            </View>
          ) : (
            <Text style={styles.htmlContent}>No content available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

