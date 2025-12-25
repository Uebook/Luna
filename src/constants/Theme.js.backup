// src/constants/Theme.js
// Centralized theme system with light/dark mode support

// Light Theme (default)
const LIGHT_THEME = {
  // Primary Colors
  p1: '#5C42C7',
  p2: '#4B36A6',
  p3: '#BCDD0D',
  p4: '#EEF7B8',

  // Background Colors
  page: '#FCFBFF',
  header: '#FFFFFF',
  panel: '#FFFFFF',
  card: '#FFFFFF',
  bg: '#FCFBFF',

  // Text Colors
  text: '#0F1020',
  sub: '#6b7280',
  muted: '#9ca3af',
  ink: '#0F1020',
  gray: '#6b7280',

  // Border & Line Colors
  border: '#E8E6F6',
  line: '#E8E6F6',

  // Common Colors
  white: '#FFFFFF',
  red: '#FF3B30',

  // Accent Colors (for gift cards)
  accent: '#5C42C7',
  accentDark: '#4B36A6',
  disabled: '#9ca3af',

  // Semantic Colors
  success: '#16a34a',
  danger: '#FF3B30',
  dangerBg: '#FFF1F1',
  warning: '#F59E0B',
  info: '#2563EB',

  // Brand Colors
  brand: '#5C42C7',
  brandSoft: '#EEF7B8',

  // Gift Card Specific (light mode)
  giftCardPage: '#FCFBFF',
  giftCardHeader: '#FFFFFF',
  giftCardPanel: '#FFFFFF',
  giftCardBorder: '#E8E6F6',
  giftCardText: '#0F1020',
  giftCardSub: '#6b7280',
  giftCardAccent: '#5C42C7',
  giftCardAccentDark: '#4B36A6',
};

// Dark Theme - Improved for better contrast and visibility
const DARK_THEME = {
  // Primary Colors (same as light, but slightly brighter for dark mode)
  p1: '#7B5FE8',  // Brighter purple for better visibility
  p2: '#6B4FD6',  // Brighter purple variant
  p3: '#BCDD0D',  // Keep bright green
  p4: '#3a2f5c',  // Darker purple tint for backgrounds

  // Background Colors - Lighter for better contrast
  page: '#1a1d24',  // Lighter dark background
  header: '#1f2329',  // Slightly lighter header
  panel: '#252932',  // Lighter panel
  card: '#252932',  // Lighter card background
  bg: '#1a1d24',  // Main background

  // Text Colors - Brighter for better readability
  text: '#f0f1f3',  // Brighter text
  sub: '#c8ccd1',  // Brighter secondary text
  muted: '#9ca3af',
  ink: '#f0f1f3',  // Primary text color
  gray: '#c8ccd1',  // Gray text

  // Border & Line Colors - More visible
  border: '#3a3f47',  // Lighter borders
  line: '#3a3f47',  // Lighter lines

  // Common Colors
  white: '#FFFFFF',
  red: '#ff6b6b',

  // Accent Colors
  accent: '#7B5FE8',  // Use brand color as accent
  accentDark: '#6B4FD6',
  disabled: '#5a5f6a',

  // Semantic Colors - Brighter for visibility
  success: '#4ade80',  // Brighter green
  danger: '#ff6b6b',
  dangerBg: '#4a2f2f',  // Lighter danger background
  warning: '#fbbf24',  // Brighter yellow
  info: '#60a5fa',  // Brighter blue

  // Brand Colors
  brand: '#7B5FE8',  // Brighter brand color
  brandSoft: '#3a2f5c',  // Darker purple for soft backgrounds

  // Gift Card Specific (dark mode)
  giftCardPage: '#1a1d24',
  giftCardHeader: '#1f2329',
  giftCardPanel: '#252932',
  giftCardBorder: '#3a3f47',
  giftCardText: '#f0f1f3',
  giftCardSub: '#c8ccd1',
  giftCardAccent: '#7B5FE8',
  giftCardAccentDark: '#6B4FD6',
};

// Gradient Definitions
const GRADIENTS = {
  header: ['#4B36A6', '#5C42C7', '#5C42C7'],
  button: ['#5C42C7', '#4B36A6'],
  success: ['#10b981', '#059669'],
  warning: ['#f59e0b', '#d97706'],
};

// Theme storage key
export const THEME_STORAGE_KEY = 'luna_theme_mode';

// Get theme based on mode
export const getTheme = (isDark = false) => {
  const baseTheme = isDark ? DARK_THEME : LIGHT_THEME;
  return {
    ...baseTheme,
    gradients: GRADIENTS,
    isDark,
  };
};

// Default export (light theme for backward compatibility)
export default getTheme(false);

