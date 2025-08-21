import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Dimensions } from 'react-native';

export { wp, hp };

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export { screenWidth, screenHeight };

export const fp = (percent: number) => {
  const { width } = Dimensions.get('window');
  const baseWidth = 375; // iPhone X width as base
  const scale = width / baseWidth;
  return Math.round((percent * scale * width) / 100);
};

// Custom helpers
export const isSmallDevice = () => wp(100) < 375;
export const isTablet = () => wp(100) > 768;
export const isLargeDevice = () => wp(100) > 414;

// Common responsive values
export const spacing = {
  xs: hp(1), // ~8px on most devices
  sm: hp(1.5), // ~12px on most devices
  md: hp(2), // ~16px on most devices
  lg: hp(3), // ~24px on most devices
  xl: hp(4), // ~32px on most devices
  xxl: hp(6), // ~48px on most devices
};

export const fontSize = {
  xs: wp(3), // ~12px
  sm: wp(4), // ~16px
  md: wp(5), // ~20px
  lg: wp(6), // ~24px
  xl: wp(8), // ~32px
  xxl: wp(12), // ~48px
  huge: wp(24), // ~96px
};

// Additional responsive utilities
export const borderRadius = {
  xs: wp(1), // ~4px
  sm: wp(2), // ~8px
  md: wp(3), // ~12px
  lg: wp(4), // ~16px
  xl: wp(6), // ~24px
  xxl: wp(8), // ~32px
};

export const iconSize = {
  xs: wp(4), // ~16px
  sm: wp(5), // ~20px
  md: wp(6), // ~24px
  lg: wp(8), // ~32px
  xl: wp(10), // ~40px
  xxl: wp(12), // ~48px
};

// Responsive layout helpers
export const cardDimensions = {
  width: Math.min(screenWidth * 0.9, 350),
  height: Math.min(screenHeight * 0.5, 400),
};

export const buttonHeight = {
  small: hp(5), // ~40px
  medium: hp(6), // ~48px
  large: hp(8), // ~64px
};
