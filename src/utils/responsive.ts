import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Dimensions } from 'react-native';

export { wp, hp };
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
