// src/context/ThemeContext.js
// Theme context provider for managing light/dark mode

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_STORAGE_KEY, getTheme } from '../constants/Theme';

// Fallback theme to avoid calling getTheme at module load
const FALLBACK_THEME = {
  p1: '#5C42C7', p2: '#4B36A6', p3: '#BCDD0D', p4: '#EEF7B8',
  white: '#FFFFFF', ink: '#0F1020', gray: '#6b7280', muted: '#9ca3af',
  bg: '#FCFBFF', card: '#FFFFFF', line: '#E8E6F6', red: '#FF3B30',
  success: '#16a34a', danger: '#FF3B30', brand: '#5C42C7',
  gradients: { header: ['#4B36A6', '#5C42C7', '#5C42C7'] },
};

const ThemeContext = createContext({
  theme: FALLBACK_THEME,
  isDark: false,
  toggleTheme: () => { },
  setThemeMode: () => { },
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage immediately
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (active) {
          // If no saved theme, default to light mode
          const darkMode = savedTheme === 'dark';
          setIsDark(darkMode);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
        if (active) {
          setIsDark(false); // Default to light mode
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  // Provide theme even while loading to prevent flash
  const theme = getTheme(isDark);

  // Toggle theme
  const toggleTheme = useCallback(async () => {
    const newMode = !isDark;
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
      setIsDark(newMode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, [isDark]);

  // Set theme mode explicitly
  const setThemeMode = useCallback(async (dark) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
      setIsDark(dark);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  const value = {
    theme,
    isDark,
    isLoading,
    toggleTheme,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
