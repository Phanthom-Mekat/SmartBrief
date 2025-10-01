import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import summaryReducer from './slices/summarySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    summary: summaryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;