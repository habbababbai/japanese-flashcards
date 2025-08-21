// Color palette for Japanese Flashcards app
export const colors = {
  // Primary brand colors
  primary: {
    main: '#4A90E2', // Main blue used throughout the app
    light: '#6BA3E8',
    dark: '#357ABD',
    contrast: '#FFFFFF',
  },

  // Secondary colors
  secondary: {
    main: '#FFC107', // Yellow for flashcard backs
    light: '#FFD54F',
    dark: '#FF8F00',
    contrast: '#000000',
  },

  // Success/Error colors
  success: {
    main: '#4CAF50', // Green for correct answers
    light: '#66BB6A',
    dark: '#388E3C',
    contrast: '#FFFFFF',
  },

  error: {
    main: '#F44336', // Red for incorrect answers
    light: '#EF5350',
    dark: '#D32F2F',
    contrast: '#FFFFFF',
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#FAFAFA',
  },

  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#9E9E9E',
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },

  // Study-specific colors
  study: {
    hiragana: '#4A90E2', // Blue for hiragana
    katakana: '#9C27B0', // Purple for katakana
    progress: '#4CAF50', // Green for progress
    warning: '#FF9800', // Orange for warnings
  },
} as const;

// Type for color keys
export type ColorKey = keyof typeof colors;

// Semantic color helpers
export const semanticColors = {
  // Button colors
  button: {
    primary: colors.primary.main,
    primaryPressed: colors.primary.dark,
    secondary: colors.neutral.gray[200],
    secondaryPressed: colors.neutral.gray[300],
    success: colors.success.main,
    error: colors.error.main,
  },

  // Card colors
  card: {
    background: colors.background.primary,
    border: colors.border.light,
    shadow: colors.shadow.light,
  },

  // Input colors
  input: {
    background: colors.background.primary,
    border: colors.border.medium,
    borderFocused: colors.primary.main,
    placeholder: colors.text.tertiary,
  },

  // Tab colors
  tab: {
    active: colors.primary.main,
    inactive: colors.text.tertiary,
    background: colors.background.primary,
  },
} as const;

// Export everything
export default colors;
