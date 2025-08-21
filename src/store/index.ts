import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer from './slices/studySessionSlice';

export const store = configureStore({
  reducer: {
    studySession: studySessionReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.timestamp',
          'payload.startTime',
          'payload.endTime',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['studySession.kanaProgress'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
