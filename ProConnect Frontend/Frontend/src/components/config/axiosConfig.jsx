import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, application/*+json'
  },
  withCredentials: true
});

// Add request interceptor to handle token
axiosInstance.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url, 'with method:', config.method);
    
    // Ensure headers are properly set
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';
    config.headers['Accept'] = 'application/json, application/*+json';
    
    // Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  response => {
    console.log('Response received from:', response.config.url, 'Status:', response.status);
    return response;
  },
  error => {
    console.error('Axios error interceptor:', error);
    
    if (error.response) {
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;