/* eslint-disable @typescript-eslint/no-require-imports */
// Mock react-native-responsive-screen
jest.mock('react-native-responsive-screen', () => ({
  widthPercentageToDP: jest.fn(width => width),
  heightPercentageToDP: jest.fn(height => height),
  listenOrientationChange: jest.fn(),
  removeOrientationListener: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  return {
    useSharedValue: jest.fn(initialValue => ({ value: initialValue })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn(toValue => toValue),
    withTiming: jest.fn(toValue => toValue),
    interpolate: jest.fn((_value, _input, output) => output[0]),
    View: RN.View,
    Text: RN.Text,
    Image: RN.Image,
    ScrollView: RN.ScrollView,
    FlatList: RN.FlatList,
    default: {
      View: RN.View,
      Text: RN.Text,
      Image: RN.Image,
      ScrollView: RN.ScrollView,
      FlatList: RN.FlatList,
    },
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  return require('@react-native-async-storage/async-storage/jest/async-storage-mock');
});

// Mock react-native
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  PixelRatio: {
    get: jest.fn(() => 2),
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
    flatten: jest.fn(style => style),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  SafeAreaView: 'SafeAreaView',
}));

// Set up global variables
global.__DEV__ = true;
