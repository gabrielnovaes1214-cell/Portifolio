import axios from 'axios';

// Default to localhost:8000/api, allowing override via VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const salesApi = {
  uploadFiles: async (formData) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getSummary: async () => {
    return api.get('/metrics/summary');
  },

  getSalesByMonth: async () => {
    return api.get('/metrics/sales-by-month');
  },

  getSalesByState: async () => {
    return api.get('/metrics/sales-by-state');
  },

  getTopCategories: async () => {
    return api.get('/metrics/top-categories');
  }
};

export default api;
