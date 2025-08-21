import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStorage } from '../../src/hooks/useStorage';
import { storageUtils } from '../../src/store/storage';
import { StudySession, StudyProgress } from '../../src/types';

// Mock storage utils
jest.mock('../../src/store/storage', () => ({
  storageUtils: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockStorageUtils = storageUtils as jest.Mocked<typeof storageUtils>;

describe('useStorage Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', async () => {
      mockStorageUtils.get.mockResolvedValueOnce([]).mockResolvedValueOnce({});
      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sessions).toEqual([]);
      expect(result.current.kanaProgress).toEqual({});
      expect(typeof result.current.saveSession).toBe('function');
      expect(typeof result.current.saveProgress).toBe('function');
      expect(typeof result.current.clearData).toBe('function');
      expect(typeof result.current.loadData).toBe('function');
    });
  });

  describe('loadData', () => {
    it('should load data on mount', async () => {
      const mockSessions: StudySession[] = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: new Date(),
          endTime: new Date(),
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
        },
      ];

      const mockProgress = {
        '1': { correctCount: 5, incorrectCount: 2, lastReviewed: new Date() },
      };

      mockStorageUtils.get
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockProgress);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sessions).toEqual(mockSessions);
      expect(result.current.kanaProgress).toEqual(mockProgress);
      expect(mockStorageUtils.get).toHaveBeenCalledWith('studySessions', []);
      expect(mockStorageUtils.get).toHaveBeenCalledWith('kanaProgress', {});
    });

    it('should handle loading errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockStorageUtils.get.mockRejectedValueOnce(new Error('Storage error'));

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sessions).toEqual([]);
      expect(result.current.kanaProgress).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should load data manually when called', async () => {
      const mockSessions: StudySession[] = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: new Date(),
          endTime: new Date(),
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
        },
      ];

      const mockProgress = {
        '1': { correctCount: 5, incorrectCount: 2, lastReviewed: new Date() },
      };

      mockStorageUtils.get
        .mockResolvedValueOnce([]) // Initial load
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(mockSessions) // Manual load
        .mockResolvedValueOnce(mockProgress);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Manual load
      await act(async () => {
        await result.current.loadData();
      });

      expect(result.current.sessions).toEqual(mockSessions);
      expect(result.current.kanaProgress).toEqual(mockProgress);
    });
  });

  describe('saveSession', () => {
    it('should save session successfully', async () => {
      const mockSessions: StudySession[] = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: new Date(),
          endTime: new Date(),
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
        },
      ];

      const newSession: StudySession = {
        id: '2',
        kanaType: 'katakana',
        startTime: new Date(),
        endTime: new Date(),
        cardsReviewed: 5,
        correctAnswers: 4,
        incorrectAnswers: 1,
      };

      mockStorageUtils.get
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce({});

      mockStorageUtils.set.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.saveSession(newSession);
      });

      expect(result.current.sessions).toHaveLength(2);
      expect(result.current.sessions).toContainEqual(newSession);
      expect(mockStorageUtils.set).toHaveBeenCalledWith('studySessions', [
        ...mockSessions,
        newSession,
      ]);
    });

    it('should handle save session errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockStorageUtils.get.mockResolvedValueOnce([]).mockResolvedValueOnce({});

      mockStorageUtils.set.mockRejectedValueOnce(new Error('Save error'));

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newSession: StudySession = {
        id: '1',
        kanaType: 'hiragana',
        startTime: new Date(),
        endTime: new Date(),
        cardsReviewed: 10,
        correctAnswers: 8,
        incorrectAnswers: 2,
      };

      await act(async () => {
        await result.current.saveSession(newSession);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving session:',
        expect.any(Error)
      );
      expect(result.current.sessions).toHaveLength(1); // Still updates local state

      consoleSpy.mockRestore();
    });
  });

  describe('saveProgress', () => {
    it('should save progress for new kana', async () => {
      mockStorageUtils.get.mockResolvedValueOnce([]).mockResolvedValueOnce({});

      mockStorageUtils.set.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const progress: StudyProgress = {
        kanaId: '1',
        isCorrect: true,
        responseTime: 1000,
        timestamp: new Date(),
      };

      await act(async () => {
        await result.current.saveProgress(progress);
      });

      expect(result.current.kanaProgress['1'].correctCount).toBe(1);
      expect(result.current.kanaProgress['1'].incorrectCount).toBe(0);
      expect(result.current.kanaProgress['1'].lastReviewed).toBe(
        progress.timestamp
      );
    });

    it('should update existing kana progress', async () => {
      const existingProgress = {
        '1': { correctCount: 2, incorrectCount: 1, lastReviewed: new Date() },
      };

      mockStorageUtils.get
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(existingProgress);

      mockStorageUtils.set.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const progress: StudyProgress = {
        kanaId: '1',
        isCorrect: false,
        responseTime: 2000,
        timestamp: new Date(),
      };

      await act(async () => {
        await result.current.saveProgress(progress);
      });

      expect(result.current.kanaProgress['1'].correctCount).toBe(2);
      expect(result.current.kanaProgress['1'].incorrectCount).toBe(2);
      expect(result.current.kanaProgress['1'].lastReviewed).toBe(
        progress.timestamp
      );
    });

    it('should handle save progress errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockStorageUtils.get.mockResolvedValueOnce([]).mockResolvedValueOnce({});

      mockStorageUtils.set.mockRejectedValueOnce(new Error('Save error'));

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const progress: StudyProgress = {
        kanaId: '1',
        isCorrect: true,
        responseTime: 1000,
        timestamp: new Date(),
      };

      await act(async () => {
        await result.current.saveProgress(progress);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving progress:',
        expect.any(Error)
      );
      expect(result.current.kanaProgress['1'].correctCount).toBe(1); // Still updates local state

      consoleSpy.mockRestore();
    });
  });

  describe('clearData', () => {
    it('should clear all data successfully', async () => {
      const mockSessions: StudySession[] = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: new Date(),
          endTime: new Date(),
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
        },
      ];

      const mockProgress = {
        '1': { correctCount: 5, incorrectCount: 2, lastReviewed: new Date() },
      };

      mockStorageUtils.get
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockProgress);

      mockStorageUtils.set.mockResolvedValue(undefined);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearData();
      });

      expect(result.current.sessions).toEqual([]);
      expect(result.current.kanaProgress).toEqual({});
      expect(mockStorageUtils.set).toHaveBeenCalledWith('studySessions', []);
      expect(mockStorageUtils.set).toHaveBeenCalledWith('kanaProgress', {});
    });

    it('should handle clear data errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockStorageUtils.get.mockResolvedValueOnce([]).mockResolvedValueOnce({});

      mockStorageUtils.set.mockRejectedValueOnce(new Error('Clear error'));

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearData();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error clearing data:',
        expect.any(Error)
      );
      expect(result.current.sessions).toEqual([]); // Still clears local state
      expect(result.current.kanaProgress).toEqual({});

      consoleSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('should handle complete data lifecycle', async () => {
      mockStorageUtils.get.mockResolvedValueOnce([]).mockResolvedValueOnce({});

      mockStorageUtils.set.mockResolvedValue(undefined);

      const { result } = renderHook(() => useStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Save a session
      const session: StudySession = {
        id: '1',
        kanaType: 'hiragana',
        startTime: new Date(),
        endTime: new Date(),
        cardsReviewed: 10,
        correctAnswers: 8,
        incorrectAnswers: 2,
      };

      await act(async () => {
        await result.current.saveSession(session);
      });

      expect(result.current.sessions).toHaveLength(1);

      // Save some progress
      const progress: StudyProgress = {
        kanaId: '1',
        isCorrect: true,
        responseTime: 1000,
        timestamp: new Date(),
      };

      await act(async () => {
        await result.current.saveProgress(progress);
      });

      expect(result.current.kanaProgress['1'].correctCount).toBe(1);

      // Clear everything
      await act(async () => {
        await result.current.clearData();
      });

      expect(result.current.sessions).toEqual([]);
      expect(result.current.kanaProgress).toEqual({});
    });
  });
});
