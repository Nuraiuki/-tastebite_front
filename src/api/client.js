// src/api/client.js
import axios from 'axios';

console.log('Environment variables:', import.meta.env);
const API_URL = import.meta.env.VITE_API_URL;
console.log('API_URL:', API_URL);

if (!API_URL) {
    console.error('VITE_API_URL is not set in environment variables');
}

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include JWT token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Request:', config.method.toUpperCase(), config.url, 'Base URL:', config.baseURL);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
client.interceptors.response.use(
    (response) => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('Response Error:', error.response?.status, error.config?.url);
        return Promise.reject(error);
    }
);

export default client;
