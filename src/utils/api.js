import axios from 'axios';

// Base API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tastebite-back.onrender.com/api';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API endpoint paths
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    check: '/auth/check',
  },
  
  // Recipe endpoints
  recipes: {
    list: '/recipes',
    detail: (id) => `/recipes/${id}`,
    create: '/recipes',
    update: (id) => `/recipes/${id}`,
    delete: (id) => `/recipes/${id}`,
  },
  
  // Interactions endpoints
  interactions: {
    comments: (id) => `/recipes/${id}/comments`,
    rating: (id) => `/recipes/${id}/rating`,
    favorite: (id) => `/recipes/${id}/favorite`,
    rate: (id) => `/recipes/${id}/rate`,
  },
  
  // External recipe endpoints
  external: {
    import: '/import-external-recipe',
    categories: '/external/categories',
    areas: '/external/areas',
  },
  
  // User endpoints
  user: {
    profile: '/user/profile',
    favorites: '/user/favorites',
  },
  
  // Upload endpoint
  upload: '/upload',
};

// Helper function to handle API errors consistently
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with a status other than 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    
    return {
      message: error.response.data.error || 'An error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // Request was made but no response received
    console.error('No response received');
    return {
      message: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unknown error occurred',
      status: -1
    };
  }
};

export default api; 