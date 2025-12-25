// src/utils/useResponsive.js
// Comprehensive responsive utility hook for all Android device sizes
import { useWindowDimensions, Platform, PixelRatio } from 'react-native';

// Base dimensions (iPhone X/11 Pro - commonly used as design reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Device size breakpoints
const BREAKPOINTS = {
    small: 320,      // Small phones (iPhone SE, etc.)
    medium: 375,     // Standard phones (iPhone X, 11, 12)
    large: 414,      // Large phones (iPhone 11 Pro Max, 12 Pro Max)
    tablet: 768,     // Tablets (iPad, Android tablets)
    largeTablet: 1024, // Large tablets
};

/**
 * Comprehensive responsive hook for handling all device sizes
 * @returns {Object} Responsive utilities including scaling functions, device info, and breakpoints
 */
export const useResponsive = () => {
    const { width, height } = useWindowDimensions();
    
    // Device type detection
    const isSmallPhone = width < BREAKPOINTS.medium;
    const isMediumPhone = width >= BREAKPOINTS.medium && width < BREAKPOINTS.large;
    const isLargePhone = width >= BREAKPOINTS.large && width < BREAKPOINTS.tablet;
    const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.largeTablet;
    const isLargeTablet = width >= BREAKPOINTS.largeTablet;
    
    // Android-specific: Common Android device widths
    // Small: 320-360px (older/smaller devices)
    // Medium: 360-400px (most common)
    // Large: 400-480px (phablets)
    // Tablet: 600px+ (Android tablets)
    const isAndroidSmall = Platform.OS === 'android' && width < 360;
    const isAndroidMedium = Platform.OS === 'android' && width >= 360 && width < 400;
    const isAndroidLarge = Platform.OS === 'android' && width >= 400 && width < 600;
    const isAndroidTablet = Platform.OS === 'android' && width >= 600;
    
    // Scaling functions
    /**
     * Scale based on width (for fonts, icons, horizontal spacing)
     * @param {number} size - Base size to scale
     * @param {Object} options - Scaling options
     * @param {number} options.min - Minimum scale factor (default: 0.8)
     * @param {number} options.max - Maximum scale factor (default: 1.3)
     * @returns {number} Scaled size
     */
    const scale = (size, options = {}) => {
        const { min = 0.8, max = 1.3 } = options;
        const scaleFactor = width / BASE_WIDTH;
        const clampedScale = Math.max(min, Math.min(max, scaleFactor));
        return Math.round(size * clampedScale);
    };
    
    /**
     * Vertical scale based on height (for vertical spacing, heights)
     * @param {number} size - Base size to scale
     * @param {Object} options - Scaling options
     * @param {number} options.min - Minimum scale factor (default: 0.8)
     * @param {number} options.max - Maximum scale factor (default: 1.3)
     * @returns {number} Scaled size
     */
    const verticalScale = (size, options = {}) => {
        const { min = 0.8, max = 1.3 } = options;
        const scaleFactor = height / BASE_HEIGHT;
        const clampedScale = Math.max(min, Math.min(max, scaleFactor));
        return Math.round(size * clampedScale);
    };
    
    /**
     * Moderate scale - less aggressive scaling (good for fonts)
     * @param {number} size - Base size to scale
     * @param {number} factor - Scaling factor (0-1, default: 0.5)
     * @returns {number} Scaled size
     */
    const moderateScale = (size, factor = 0.5) => {
        const scaleFactor = width / BASE_WIDTH;
        const diff = (scaleFactor - 1) * factor;
        return Math.round(size * (1 + diff));
    };
    
    /**
     * Get responsive font size
     * @param {number} size - Base font size
     * @param {Object} options - Options
     * @returns {number} Responsive font size
     */
    const fontSize = (size, options = {}) => {
        const { min = 0.85, max = 1.2 } = options;
        return moderateScale(size, 0.3); // Less aggressive for fonts
    };
    
    /**
     * Get responsive spacing (padding, margin)
     * @param {number} size - Base spacing size
     * @returns {number} Responsive spacing
     */
    const spacing = (size) => {
        if (isTablet || isLargeTablet) {
            return Math.round(size * 1.2);
        }
        return scale(size, { min: 0.9, max: 1.1 });
    };
    
    /**
     * Get number of columns for grid layouts
     * @param {Object} options - Column options
     * @param {number} options.phone - Columns for phones (default: 2)
     * @param {number} options.tablet - Columns for tablets (default: 3)
     * @param {number} options.largeTablet - Columns for large tablets (default: 4)
     * @returns {number} Number of columns
     */
    const getColumns = (options = {}) => {
        const { phone = 2, tablet = 3, largeTablet = 4 } = options;
        if (isLargeTablet) return largeTablet;
        if (isTablet) return tablet;
        return phone;
    };
    
    /**
     * Get responsive card width for grid layouts
     * @param {number} columns - Number of columns
     * @param {number} sidePadding - Side padding (default: 16)
     * @param {number} gap - Gap between items (default: 12)
     * @returns {number} Card width
     */
    const getCardWidth = (columns, sidePadding = 16, gap = 12) => {
        const totalPadding = sidePadding * 2;
        const totalGaps = gap * (columns - 1);
        return Math.floor((width - totalPadding - totalGaps) / columns);
    };
    
    /**
     * Check if device is in landscape mode
     * @returns {boolean}
     */
    const isLandscape = width > height;
    
    /**
     * Get pixel ratio for high-DPI displays
     * @returns {number}
     */
    const pixelRatio = PixelRatio.get();
    
    return {
        // Dimensions
        width,
        height,
        
        // Device type flags
        isSmallPhone,
        isMediumPhone,
        isLargePhone,
        isTablet,
        isLargeTablet,
        isAndroidSmall,
        isAndroidMedium,
        isAndroidLarge,
        isAndroidTablet,
        isLandscape,
        
        // Scaling functions
        scale,
        verticalScale,
        moderateScale,
        fontSize,
        spacing,
        
        // Layout helpers
        getColumns,
        getCardWidth,
        
        // Other
        pixelRatio,
        breakpoints: BREAKPOINTS,
    };
};

// Export for backward compatibility
export default useResponsive;

