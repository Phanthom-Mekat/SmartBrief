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
};

export default summaryService;