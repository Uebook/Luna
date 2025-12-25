// src/constants/Colors.js

const THEME = {
    // Primary Colors
    p1: '#5C42C7',
    p2: '#4B36A6',
    p3: '#BCDD0D',
    p4: '#EEF7B8',

    // Neutral Colors
    white: '#FFFFFF',
    ink: '#0F1020',
    gray: '#6b7280',
    muted: '#9ca3af',
    bg: '#FCFBFF',
    card: '#FFFFFF',
    line: '#E8E6F6',

    // Semantic Colors
    red: '#FF3B30',
    danger: '#D92D20',
    dangerBg: '#FFF1F1',
    success: '#16a34a',
    brand: '#004CFF',
    brandSoft: '#E8F0FF',
};

// Gradient Definitions
const GRADIENTS = {
    header: [THEME.p2, THEME.p1, THEME.p1],
    button: [THEME.p1, THEME.p2],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
};

// Export everything
export default {
    ...THEME,
    gradients: GRADIENTS,
};