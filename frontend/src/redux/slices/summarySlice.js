import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import summaryService from '../../services/summaryService';

/**
 * Async Thunk: Create a new summary
 * Calls the API to generate a summary and handles all async states
 */
export const createSummary = createAsyncThunk(
  'summary/createSummary',
  async (content, { rejectWithValue }) => {
    try {
      // ✅ Using ASYNC endpoint - jobs will appear in Bull Board!
      const jobResponse = await summaryService.createSummaryAsync(content);
      const { jobId } = jobResponse;
      
      // Poll for job completion every 2 seconds
      const pollInterval = 2000;
      const maxAttempts = 60; // 2 minutes timeout
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        const statusResponse = await summaryService.getJobStatus(jobId, 'summarization');
        
        if (statusResponse.jobStatus === 'completed') {
          // Job completed successfully!
          return statusResponse.summary;
        } else if (statusResponse.jobStatus === 'failed') {
          throw new Error(statusResponse.failedReason || 'Summarization failed');
        }
        // Still processing... continue polling
        attempts++;
      }
      
      throw new Error('Summarization timed out. Please try again.');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create summary');
    }
  }
);

/**
 * Async Thunk: Fetch user's summary history
 */
export const fetchSummaries = createAsyncThunk(
  'summary/fetchSummaries',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await summaryService.getUserSummaries(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch summaries');
    }
  }
);

/**
 * Async Thunk: Delete a summary
 */
export const deleteSummary = createAsyncThunk(
  'summary/deleteSummary',
  async (summaryId, { rejectWithValue }) => {
    try {
      await summaryService.deleteSummary(summaryId);
      return summaryId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete summary');
    }
  }
);

/**
 * Async Thunk: Create summary from uploaded file
 */
export const createSummaryFromFile = createAsyncThunk(
  'summary/createSummaryFromFile',
  async (file, { rejectWithValue }) => {
    try {
      // ✅ Using ASYNC endpoint - jobs will appear in Bull Board!
      const jobResponse = await summaryService.createSummaryFromFileAsync(file);
      const { jobId } = jobResponse;
      
      // Poll for job completion every 2 seconds
      const pollInterval = 2000;
      const maxAttempts = 60; // 2 minutes timeout
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        const statusResponse = await summaryService.getJobStatus(jobId, 'file-processing');
        
        if (statusResponse.jobStatus === 'completed') {
          // Job completed successfully!
          return statusResponse.summary;
        } else if (statusResponse.jobStatus === 'failed') {
          throw new Error(statusResponse.failedReason || 'File processing failed');
        }
        // Still processing... continue polling
        attempts++;
      }
      
      throw new Error('File processing timed out. Please try again.');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create summary from file');
    }
  }
);

/**
 * Async Thunk: Regenerate summary with custom prompt
 */
export const regenerateSummary = createAsyncThunk(
  'summary/regenerateSummary',
  async ({ summaryId, customPrompt }, { rejectWithValue }) => {
    try {
      const response = await summaryService.regenerateSummary(summaryId, customPrompt);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to regenerate summary');
    }
  }
);

/**
 * Summary Slice
 * Manages all state related to content summaries
 */
const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    // Current summary being displayed
    currentSummary: null,
    
    // List of user's summaries
    summaries: [],
    
    // Pagination info
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalSummaries: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    
    // User statistics
    statistics: {
      totalSummaries: 0,
      totalOriginalWords: 0,
      totalSummaryWords: 0,
      averageCompressionRatio: 0,
      wordsReduced: 0,
    },
    
    // Updated credits from backend (after summary creation)
    updatedCredits: null,
    
    // Async operation states
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    fetchStatus: 'idle',
    deleteStatus: 'idle',
    
    // Error messages
    error: null,
    fetchError: null,
    deleteError: null,
  },
  reducers: {
    // Clear current summary
    clearCurrentSummary: (state) => {
      state.currentSummary = null;
      state.status = 'idle';
      state.error = null;
      state.updatedCredits = null;
    },
    
    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.fetchError = null;
      state.deleteError = null;
    },
    
    // Reset summary state (for logout)
    resetSummaryState: (state) => {
      state.currentSummary = null;
      state.summaries = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalSummaries: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
      state.statistics = {
        totalSummaries: 0,
        totalOriginalWords: 0,
        totalSummaryWords: 0,
        averageCompressionRatio: 0,
        wordsReduced: 0,
      };
      state.status = 'idle';
      state.fetchStatus = 'idle';
      state.deleteStatus = 'idle';
      state.error = null;
      state.fetchError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Summary
      .addCase(createSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // For async endpoints, payload is already the summary object
        state.currentSummary = action.payload;
        state.error = null;
        
        // Update statistics if provided (async returns summary directly)
        // Statistics will be fetched separately if needed
      })
      .addCase(createSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create summary';
        state.currentSummary = null;
      })
      
      // Fetch Summaries
      .addCase(fetchSummaries.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchSummaries.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.summaries = action.payload.summaries || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.statistics = action.payload.statistics || state.statistics;
        state.fetchError = null;
      })
      .addCase(fetchSummaries.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError = action.payload || 'Failed to fetch summaries';
      })
      
      // Delete Summary
      .addCase(deleteSummary.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(deleteSummary.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        // Remove the deleted summary from the list
        state.summaries = state.summaries.filter(
          (summary) => summary._id !== action.payload
        );
        state.deleteError = null;
        
        // Update total count
        if (state.pagination.totalSummaries > 0) {
          state.pagination.totalSummaries -= 1;
        }
      })
      .addCase(deleteSummary.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload || 'Failed to delete summary';
      })

      // Create Summary from File (same as create summary)
      .addCase(createSummaryFromFile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createSummaryFromFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // For async endpoints, payload is already the summary object
        state.currentSummary = action.payload;
        state.error = null;
      })
      .addCase(createSummaryFromFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to create summary from file';
        state.currentSummary = null;
      })

      // Regenerate Summary (does not cost credits)
      .addCase(regenerateSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(regenerateSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentSummary = action.payload.summary;
        state.error = null;
        
        if (action.payload.statistics) {
          state.statistics = action.payload.statistics;
        }
        // Note: No credits are deducted for regeneration
      })
      .addCase(regenerateSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to regenerate summary';
      });
  },
});

// Export actions
export const { 
  clearCurrentSummary, 
  clearErrors, 
  resetSummaryState 
} = summarySlice.actions;

// Selectors
export const selectCurrentSummary = (state) => state.summary.currentSummary;
export const selectSummaries = (state) => state.summary.summaries;
export const selectSummaryStatus = (state) => state.summary.status;
export const selectFetchStatus = (state) => state.summary.fetchStatus;
export const selectDeleteStatus = (state) => state.summary.deleteStatus;
export const selectSummaryError = (state) => state.summary.error;
export const selectFetchError = (state) => state.summary.fetchError;
export const selectDeleteError = (state) => state.summary.deleteError;
export const selectPagination = (state) => state.summary.pagination;
export const selectStatistics = (state) => state.summary.statistics;
export const selectUpdatedCredits = (state) => state.summary.updatedCredits;

// Combined selectors for convenience
export const selectIsCreating = (state) => state.summary.status === 'loading';
export const selectIsFetching = (state) => state.summary.fetchStatus === 'loading';
export const selectIsDeleting = (state) => state.summary.deleteStatus === 'loading';

export default summarySlice.reducer;
