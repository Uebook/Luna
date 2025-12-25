// src/utils/scale.js
import { Dimensions, Platform, PixelRatio } from 'react-native';

const BASE_WIDTH = 375;   // iPhone X width
const BASE_HEIGHT = 812;  // iPhone X height

export const scaleFactory = (w, h) => {
    const scale = size => (w / BASE_WIDTH) * size;
    const verticalScale = size => (h / BASE_HEIGHT) * size;
    const moderateScale = (size, factor = 0.5) =>
        size + (scale(size) - size) * factor;
    return { scale, verticalScale, moderateScale };
};
