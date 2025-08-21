import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { StudySession, StudyProgress } from '../../types';
import { storageUtils } from '../storage';

interface StudySessionState {
  sessions: StudySession[];
  currentSession: StudySession | null;
  kanaProgress: Record<
    string,
    { correctCount: number; incorrectCount: number; lastReviewed?: string }
  >;
  isLoading: boolean;
  error: string | null;
}

// Helper function to check if old IDs exist and clear store if needed
const shouldClearStore = (kanaProgress: Record<string, any>) => {
  // Check if any old numeric IDs exist (1, 2, 3, etc.)
  return Object.keys(kanaProgress).some(key => /^\d+$/.test(key));
};

// Async thunks for storage operations
export const loadStoredData = createAsyncThunk(
  'studySession/loadStoredData',
  async () => {
    const [sessions, kanaProgress] = await Promise.all([
      storageUtils.get('studySessions', []),
      storageUtils.get('kanaProgress', {}),
    ]);

    // If old IDs are detected, clear the store completely
    if (shouldClearStore(kanaProgress)) {
      console.log('🔄 Old ID format detected, clearing store for fresh start');
      await Promise.all([
        storageUtils.set('studySessions', []),
        storageUtils.set('kanaProgress', {}),
      ]);
      return { sessions: [], kanaProgress: {} };
    }

    return { sessions, kanaProgress };
  }
);

export const saveSessions = createAsyncThunk(
  'studySession/saveSessions',
  async (sessions: StudySession[]) => {
    await storageUtils.set('studySessions', sessions);
    return sessions;
  }
);

export const saveKanaProgress = createAsyncThunk(
  'studySession/saveKanaProgress',
  async (
    kanaProgress: Record<
      string,
      {
        correctCount: number;
        incorrectCount: number;
        lastReviewed?: string;
      }
    >
  ) => {
    await storageUtils.set('kanaProgress', kanaProgress);
    return kanaProgress;
  }
);

const initialState: StudySessionState = {
  sessions: [],
  currentSession: null,
  kanaProgress: {},
  isLoading: false,
  error: null,
};

const studySessionSlice = createSlice({
  name: 'studySession',
  initialState,
  reducers: {
    startSession: (
      state,
      action: PayloadAction<{
        kanaType: 'hiragana' | 'katakana';
        isShuffled: boolean;
      }>
    ) => {
      const newSession: StudySession = {
        id: Date.now().toString(),
        kanaType: action.payload.kanaType,
        startTime: new Date().toISOString(),
        cardsReviewed: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
      };
      state.currentSession = newSession;
    },

    endSession: (
      state,
      action: PayloadAction<{ endTime: Date; progress: StudyProgress[] }>
    ) => {
      if (state.currentSession) {
        const { endTime, progress } = action.payload;
        const correctCount = progress.filter(p => p.isCorrect).length;
        const incorrectCount = progress.filter(p => !p.isCorrect).length;

        const completedSession: StudySession = {
          ...state.currentSession,
          endTime: endTime.toISOString(),
          cardsReviewed: progress.length,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
        };

        state.sessions.push(completedSession);
        state.currentSession = null;

        // Update kana progress
        progress.forEach(p => {
          if (!state.kanaProgress[p.kanaId]) {
            state.kanaProgress[p.kanaId] = {
              correctCount: 0,
              incorrectCount: 0,
            };
          }
          if (p.isCorrect) {
            state.kanaProgress[p.kanaId].correctCount += 1;
          } else {
            state.kanaProgress[p.kanaId].incorrectCount += 1;
          }
          state.kanaProgress[p.kanaId].lastReviewed = p.timestamp;
        });
      }
    },

    addProgress: (state, action: PayloadAction<StudyProgress>) => {
      const progress = action.payload;

      // Update current session
      if (state.currentSession) {
        state.currentSession.cardsReviewed += 1;
        if (progress.isCorrect) {
          state.currentSession.correctAnswers += 1;
        } else {
          state.currentSession.incorrectAnswers += 1;
        }
      }

      // Update kana progress
      if (!state.kanaProgress[progress.kanaId]) {
        state.kanaProgress[progress.kanaId] = {
          correctCount: 0,
          incorrectCount: 0,
        };
      }
      if (progress.isCorrect) {
        state.kanaProgress[progress.kanaId].correctCount += 1;
      } else {
        state.kanaProgress[progress.kanaId].incorrectCount += 1;
      }
      state.kanaProgress[progress.kanaId].lastReviewed = progress.timestamp;
    },

    clearSessions: state => {
      state.sessions = [];
      state.kanaProgress = {};
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadStoredData.pending, state => {
        state.isLoading = true;
      })
      .addCase(loadStoredData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.sessions;
        state.kanaProgress = action.payload.kanaProgress;
      })
      .addCase(loadStoredData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load data';
      });
  },
});

export const {
  startSession,
  endSession,
  addProgress,
  clearSessions,
  setLoading,
  setError,
} = studySessionSlice.actions;

// Selectors
export const selectSessions = (state: { studySession: StudySessionState }) =>
  state.studySession.sessions;
export const selectCurrentSession = (state: {
  studySession: StudySessionState;
}) => state.studySession.currentSession;
export const selectKanaProgress = (state: {
  studySession: StudySessionState;
}) => state.studySession.kanaProgress;
export const selectIsLoading = (state: { studySession: StudySessionState }) =>
  state.studySession.isLoading;
export const selectError = (state: { studySession: StudySessionState }) =>
  state.studySession.error;

// Helper selectors
export const selectSessionsByType = (
  state: { studySession: StudySessionState },
  kanaType: 'hiragana' | 'katakana'
) =>
  state.studySession.sessions.filter(session => session.kanaType === kanaType);

export const selectTotalStudyTime = (state: {
  studySession: StudySessionState;
}) => {
  return state.studySession.sessions.reduce((total, session) => {
    if (session.endTime) {
      const duration =
        new Date(session.endTime).getTime() -
        new Date(session.startTime).getTime();
      return total + duration;
    }
    return total;
  }, 0);
};

export const selectTotalCardsReviewed = (state: {
  studySession: StudySessionState;
}) => {
  return state.studySession.sessions.reduce(
    (total, session) => total + session.cardsReviewed,
    0
  );
};

export const selectTotalCorrectAnswers = (state: {
  studySession: StudySessionState;
}) => {
  return state.studySession.sessions.reduce(
    (total, session) => total + session.correctAnswers,
    0
  );
};

export default studySessionSlice.reducer;
