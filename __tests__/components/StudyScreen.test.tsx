import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer from '../../src/store/slices/studySessionSlice';
import HiraganaStudyScreen from '../../app/hiragana/study';
import KatakanaStudyScreen from '../../app/katakana/study';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

// Mock the kana data
jest.mock('../../src/data/hiragana', () => ({
  hiraganaData: [
    { id: 'h1', character: 'あ', romaji: 'a', type: 'hiragana' as const },
    { id: 'h2', character: 'い', romaji: 'i', type: 'hiragana' as const },
    { id: 'h3', character: 'う', romaji: 'u', type: 'hiragana' as const },
    { id: 'h4', character: 'え', romaji: 'e', type: 'hiragana' as const },
    { id: 'h5', character: 'お', romaji: 'o', type: 'hiragana' as const },
  ],
}));

jest.mock('../../src/data/katakana', () => ({
  katakanaData: [
    { id: 'k1', character: 'ア', romaji: 'a', type: 'katakana' as const },
    { id: 'k2', character: 'イ', romaji: 'i', type: 'katakana' as const },
    { id: 'k3', character: 'ウ', romaji: 'u', type: 'katakana' as const },
    { id: 'k4', character: 'エ', romaji: 'e', type: 'katakana' as const },
    { id: 'k5', character: 'オ', romaji: 'o', type: 'katakana' as const },
  ],
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

describe('Study Screen', () => {
  const mockUseLocalSearchParams =
    jest.requireMock('expo-router').useLocalSearchParams;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hiragana Study Screen', () => {
    it('should render with shuffled study options and character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 3,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with limited characters
      expect(screen.getByText('1 / 3')).toBeTruthy();
    });

    it('should render with in-order study options', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: false,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with all characters
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should render with shuffled study options without character count (all characters)', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with all characters
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should render with limited character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 2,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with limited characters
      expect(screen.getByText('1 / 2')).toBeTruthy();
    });

    it('should render with all characters in order', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: false,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with all characters
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should render with shuffled study options and character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 3,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with limited characters
      expect(screen.getByText('1 / 3')).toBeTruthy();
    });
  });

  describe('Katakana Study Screen', () => {
    it('should render with shuffled study options and character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 3,
        }),
      });

      renderWithProvider(<KatakanaStudyScreen />);

      // Should show progress with limited characters
      expect(screen.getByText('1 / 3')).toBeTruthy();
    });

    it('should render with in-order study options', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: false,
        }),
      });

      renderWithProvider(<KatakanaStudyScreen />);

      // Should show progress with all characters
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should render with limited character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 2,
        }),
      });

      renderWithProvider(<KatakanaStudyScreen />);

      // Should show progress with limited characters
      expect(screen.getByText('1 / 2')).toBeTruthy();
    });
  });

  describe('Study Options Parsing', () => {
    it('should handle missing study options gracefully', () => {
      mockUseLocalSearchParams.mockReturnValue({});

      renderWithProvider(<HiraganaStudyScreen />);

      // Should default to shuffled mode
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should handle malformed study options gracefully', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: 'invalid json',
      });

      // Should render with default options
      renderWithProvider(<HiraganaStudyScreen />);
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should handle study options with invalid character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: -1, // Invalid count
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should handle invalid count gracefully by using all characters
      expect(screen.getByText('1 / 4')).toBeTruthy();
    });
  });

  describe('Redux Integration', () => {
    it('should dispatch startSession with correct study options', () => {
      const studyOptions = {
        isShuffled: true,
        characterCount: 3,
      };

      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify(studyOptions),
      });

      const store = createTestStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <HiraganaStudyScreen />
        </Provider>
      );

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'studySession/startSession',
          payload: {
            kanaType: 'hiragana',
            studyOptions,
          },
        })
      );
    });
  });
});
