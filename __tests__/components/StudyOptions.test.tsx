import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer from '../../src/store/slices/studySessionSlice';
import HiraganaSettingsScreen from '../../app/hiragana/index';
import KatakanaSettingsScreen from '../../app/katakana/index';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      studySession: studySessionReducer,
    },
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('Study Options UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hiragana Settings Screen', () => {
    it('should render study mode options', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      expect(screen.getByText('Study Mode')).toBeTruthy();
      expect(screen.getByText('In Order')).toBeTruthy();
      expect(screen.getByText('Shuffled')).toBeTruthy();
    });

    it('should show character count options when shuffled is selected', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Character count options should appear
      expect(screen.getByText('Number of Characters')).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
      expect(screen.getByText('20')).toBeTruthy();
      expect(screen.getByText('30')).toBeTruthy();
      expect(screen.getByText('All')).toBeTruthy();
    });

    it('should auto-select "All" when shuffled mode is first selected', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // "All" should be highlighted
      const allOption = screen.getByText('All');
      expect(allOption.props.style).toContainEqual(
        expect.objectContaining({ color: '#FFFFFF' })
      );

      // Start button should be enabled
      const startButton = screen.getByText('Start Studying');
      expect(startButton.props.style).not.toContainEqual(
        expect.objectContaining({ opacity: 0.7 })
      );
    });

    it('should hide character count options when in-order is selected', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select in-order mode
      fireEvent.press(screen.getByText('In Order'));

      // Character count options should not be visible
      expect(screen.queryByText('Number of Characters')).toBeNull();
      expect(screen.queryByText('10')).toBeNull();
      expect(screen.queryByText('20')).toBeNull();
      expect(screen.queryByText('30')).toBeNull();
      expect(screen.queryByText('All')).toBeNull();
    });

    it('should enable start button when shuffled is selected because "All" is auto-selected', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Start button should be enabled because "All" is auto-selected
      const startButton = screen.getByText('Start Studying');
      expect(startButton.props.style).not.toContainEqual(
        expect.objectContaining({ opacity: 0.7 })
      );
    });

    it('should enable start button when character count is selected in shuffled mode', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Select a character count
      fireEvent.press(screen.getByText('20'));

      // Start button should be enabled
      const startButton = screen.getByText('Start Studying');
      expect(startButton.props.style).not.toContainEqual(
        expect.objectContaining({ opacity: 0.7 })
      );
    });

    it('should enable start button immediately when in-order is selected', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select in-order mode
      fireEvent.press(screen.getByText('In Order'));

      // Start button should be enabled
      const startButton = screen.getByText('Start Studying');
      expect(startButton.props.style).not.toContainEqual(
        expect.objectContaining({ opacity: 0.7 })
      );
    });

    it('should pass correct study options when starting study session', () => {
      const mockRouter = jest.requireMock('expo-router');
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode and character count
      fireEvent.press(screen.getByText('Shuffled'));
      fireEvent.press(screen.getByText('30'));

      // Start studying
      fireEvent.press(screen.getByText('Start Studying'));

      expect(mockRouter.router.push).toHaveBeenCalledWith({
        pathname: '/hiragana/study',
        params: {
          studyOptions: JSON.stringify({
            isShuffled: true,
            characterCount: 30,
          }),
        },
      });
    });

    it('should pass correct study options for in-order mode', () => {
      const mockRouter = jest.requireMock('expo-router');
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select in-order mode
      fireEvent.press(screen.getByText('In Order'));

      // Start studying
      fireEvent.press(screen.getByText('Start Studying'));

      expect(mockRouter.router.push).toHaveBeenCalledWith({
        pathname: '/hiragana/study',
        params: {
          studyOptions: JSON.stringify({
            isShuffled: false,
            characterCount: undefined,
          }),
        },
      });
    });

    it('should pass correct study options for "All" characters in shuffled mode', () => {
      const mockRouter = jest.requireMock('expo-router');
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode and "All" characters
      fireEvent.press(screen.getByText('Shuffled'));
      fireEvent.press(screen.getByText('All'));

      // Start button should be enabled
      const startButton = screen.getByText('Start Studying');
      expect(startButton.props.style).not.toContainEqual(
        expect.objectContaining({ opacity: 0.7 })
      );

      // Start studying
      fireEvent.press(screen.getByText('Start Studying'));

      expect(mockRouter.router.push).toHaveBeenCalledWith({
        pathname: '/hiragana/study',
        params: {
          studyOptions: JSON.stringify({
            isShuffled: true,
            characterCount: undefined,
          }),
        },
      });
    });
  });

  describe('Katakana Settings Screen', () => {
    it('should render study mode options', () => {
      renderWithProvider(<KatakanaSettingsScreen />);

      expect(screen.getByText('Study Mode')).toBeTruthy();
      expect(screen.getByText('In Order')).toBeTruthy();
      expect(screen.getByText('Shuffled')).toBeTruthy();
    });

    it('should show character count options when shuffled is selected', () => {
      renderWithProvider(<KatakanaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Character count options should appear
      expect(screen.getByText('Number of Characters')).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
      expect(screen.getByText('20')).toBeTruthy();
      expect(screen.getByText('30')).toBeTruthy();
      expect(screen.getByText('All')).toBeTruthy();
    });

    it('should pass correct study options when starting katakana study session', () => {
      const mockRouter = jest.requireMock('expo-router');
      renderWithProvider(<KatakanaSettingsScreen />);

      // Select shuffled mode and character count
      fireEvent.press(screen.getByText('Shuffled'));
      fireEvent.press(screen.getByText('20'));

      // Start studying
      fireEvent.press(screen.getByText('Start Studying'));

      expect(mockRouter.router.push).toHaveBeenCalledWith({
        pathname: '/katakana/study',
        params: {
          studyOptions: JSON.stringify({
            isShuffled: true,
            characterCount: 20,
          }),
        },
      });
    });

    it('should reset character count when switching from shuffled to in-order', () => {
      renderWithProvider(<KatakanaSettingsScreen />);

      // Select shuffled mode and character count
      fireEvent.press(screen.getByText('Shuffled'));
      fireEvent.press(screen.getByText('30'));

      // Switch to in-order
      fireEvent.press(screen.getByText('In Order'));

      // Character count options should be hidden
      expect(screen.queryByText('Number of Characters')).toBeNull();

      // Switch back to shuffled
      fireEvent.press(screen.getByText('Shuffled'));

      // Character count options should appear again, with "All" selected by default
      expect(screen.getByText('Number of Characters')).toBeTruthy();

      // Start button should be enabled because "All" is selected by default
      const startButton = screen.getByText('Start Studying');
      expect(startButton.props.style).not.toContainEqual(
        expect.objectContaining({ opacity: 0.7 })
      );
    });
  });

  describe('Character Count Selection', () => {
    it('should highlight selected character count option', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Select character count
      fireEvent.press(screen.getByText('20'));

      // The selected option should have active styling
      const selectedOption = screen.getByText('20');
      expect(selectedOption.props.style).toContainEqual(
        expect.objectContaining({ color: '#FFFFFF' })
      );
    });

    it('should highlight "All" option when selected', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Select "All" option
      fireEvent.press(screen.getByText('All'));

      // The "All" option should have active styling
      const selectedOption = screen.getByText('All');
      expect(selectedOption.props.style).toContainEqual(
        expect.objectContaining({ color: '#FFFFFF' })
      );
    });

    it('should allow switching between character count options', () => {
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Select first option
      fireEvent.press(screen.getByText('10'));

      // Switch to different option
      fireEvent.press(screen.getByText('30'));

      // The new option should be selected
      const selectedOption = screen.getByText('30');
      expect(selectedOption.props.style).toContainEqual(
        expect.objectContaining({ color: '#FFFFFF' })
      );
    });

    it('should handle "All" character selection correctly', () => {
      const mockRouter = jest.requireMock('expo-router');
      renderWithProvider(<HiraganaSettingsScreen />);

      // Select shuffled mode
      fireEvent.press(screen.getByText('Shuffled'));

      // Select "All" option
      fireEvent.press(screen.getByText('All'));

      // Start button should be enabled
      const startButton = screen.getByText('Start Studying');
      expect(startButton.props.style).not.toContainEqual(
        expect.objectContaining({ opacity: 0.7 })
      );

      // Start studying
      fireEvent.press(screen.getByText('Start Studying'));

      // Should pass undefined character count
      expect(mockRouter.router.push).toHaveBeenCalledWith({
        pathname: '/hiragana/study',
        params: {
          studyOptions: JSON.stringify({
            isShuffled: true,
            characterCount: undefined,
          }),
        },
      });
    });
  });
});
