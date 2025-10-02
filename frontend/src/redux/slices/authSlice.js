import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

/**
 * Async Thunk: Refresh user data from backend
 */
export const refreshUser = createAsyncThunk(
  'auth/refreshUser',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.getCurrentUser();
      return userData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to refresh user data');
    }
  }
);

// Check if user token exists in localStorage on app initialization
const getInitialAuthState = () => {
  try {
    const token = localStorage.getItem('smartbrief_token');
    const user = localStorage.getItem('smartbrief_user');
    
    if (token && user) {
      return {
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        loading: false,
        refreshLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    // Clear invalid data
    localStorage.removeItem('smartbrief_token');
    localStorage.removeItem('smartbrief_user');
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    refreshLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    // Set loading state during authentication requests
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    
    // Handle successful login/registration
    setLoginCredentials: (state, action) => {
      const { user, token } = action.payload;
      
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      
      // Persist to localStorage
      localStorage.setItem('smartbrief_token', token);
      localStorage.setItem('smartbrief_user', JSON.stringify(user));
    },
    
    // Handle authentication errors
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Update user data (e.g., after credit usage)
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('smartbrief_user', JSON.stringify(state.user));
      }
    },
    
    // Update user credits specifically
    updateUserCredits: (state, action) => {
      if (state.user) {
        state.user.credits = action.payload;
        localStorage.setItem('smartbrief_user', JSON.stringify(state.user));
      }
    },
    
    // Decrement user credits (called after summary creation)
    decrementCredits: (state, action) => {
      if (state.user && state.user.credits > 0) {
        const amount = action.payload || 1;
        state.user.credits -= amount;
        localStorage.setItem('smartbrief_user', JSON.stringify(state.user));
      }
    },
    
    // Handle logout
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('smartbrief_token');
      localStorage.removeItem('smartbrief_user');
    },
    
    // Clear error messages
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Refresh User
      .addCase(refreshUser.pending, (state) => {
        state.refreshLoading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.refreshLoading = false;
        state.user = action.payload;
        // Data is already saved to localStorage by authService
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.refreshLoading = false;
        // Silently fail - don't show error for background refresh
        console.error('Failed to refresh user data:', action.payload);
      });
  },
});

export const {
  setAuthLoading,
  setLoginCredentials,
  setAuthError,
  updateUser,
  updateUserCredits,
  decrementCredits,
  logoutUser,
  clearAuthError,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectRefreshLoading = (state) => state.auth.refreshLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;