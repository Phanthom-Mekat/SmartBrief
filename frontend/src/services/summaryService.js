import { api } from './authService';

/**
 * Summary Service
 * Handles all API calls related to content summarization
 */
const summaryService = {
  /**
   * Create a new summary from content
   * @param {string} content - Text content to summarize
   * @returns {Promise<Object>} Summary data
   */
  async createSummary(content) {
    try {
      const response = await api.post('/summaries', { content });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create summary';
      throw new Error(message);
    }
  },

  /**
   * Get all summaries for the current user
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of items per page
   * @returns {Promise<Object>} Summaries list with pagination
   */
  async getUserSummaries(page = 1, limit = 10) {
    try {
      const response = await api.get(`/summaries?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch summaries';
      throw new Error(message);
    }
  },

  /**
   * Get a specific summary by ID
   * @param {string} summaryId - Summary ID
   * @returns {Promise<Object>} Summary details
   */
  async getSummaryById(summaryId) {
    try {
      const response = await api.get(`/summaries/${summaryId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch summary';
      throw new Error(message);
    }
  },

  /**
   * Delete a summary
   * @param {string} summaryId - Summary ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteSummary(summaryId) {
    try {
      const response = await api.delete(`/summaries/${summaryId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete summary';
      throw new Error(message);
    }
  },

  /**
   * Create summary from uploaded file
   * @param {File} file - File object (.txt or .docx)
   * @returns {Promise<Object>} Summary data
   */
  async createSummaryFromFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/summaries/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload and process file';
      throw new Error(message);
    }
  },

  /**
   * Regenerate summary with custom prompt
   * @param {string} summaryId - Summary ID to regenerate
   * @param {string} customPrompt - Optional custom instructions
   * @returns {Promise<Object>} Regenerated summary data
   */
  async regenerateSummary(summaryId, customPrompt = null) {
    try {
      const response = await api.post(`/summaries/${summaryId}/regenerate`, {
        customPrompt
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to regenerate summary';
      throw new Error(message);
    }
  },

  /**
   * ========== ASYNC QUEUE-BASED METHODS (Visible in Bull Board) ==========
   */

  /**
   * Create summary asynchronously using queue (returns job ID)
   * @param {string} content - Text content to summarize
   * @returns {Promise<Object>} Job ID and status endpoint
   */
  async createSummaryAsync(content) {
    try {
      const response = await api.post('/summaries/async', { text: content });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to queue summary';
      throw new Error(message);
    }
  },

  /**
   * Create summary from file asynchronously using queue (returns job ID)
   * @param {File} file - File object (.txt or .docx)
   * @returns {Promise<Object>} Job ID and status endpoint
   */
  async createSummaryFromFileAsync(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/summaries/upload/async', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to queue file processing';
      throw new Error(message);
    }
  },

  /**
   * Get job status and result
   * @param {string} jobId - Job ID returned from async endpoint
   * @param {string} queue - Queue name (summarization, file-processing, email)
   * @returns {Promise<Object>} Job status and result (if completed)
   */
  async getJobStatus(jobId, queue = 'file-processing') {
    try {
      const response = await api.get(`/summaries/job/${jobId}?queue=${queue}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get job status';
      throw new Error(message);
    }
  },
};

export default summaryService;