import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartbrief_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common error scenarios
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear stored auth data
      localStorage.removeItem('smartbrief_token');
      localStorage.removeItem('smartbrief_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} User data and token
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('smartbrief_token', token);
      localStorage.setItem('smartbrief_user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  },

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('smartbrief_token', token);
      localStorage.setItem('smartbrief_user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  },

  /**
   * Logout user - clear stored data
   */
  logout() {
    localStorage.removeItem('smartbrief_token');
    localStorage.removeItem('smartbrief_user');
  },

  /**
   * Get current user profile (fetch fresh data from backend)
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      
      // Update localStorage with fresh data
      localStorage.setItem('smartbrief_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get user profile';
      throw new Error(message);
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('smartbrief_token');
    const user = localStorage.getItem('smartbrief_user');
    return !!(token && user);
  },

  /**
   * Get stored token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem('smartbrief_token');
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getStoredUser() {
    try {
      const user = localStorage.getItem('smartbrief_user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },
};

export default authService;

// Export the configured axios instance for other services
export { api };