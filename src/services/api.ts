import axios from 'axios';

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:5000';
const baseUrl = `${API_BASE_URL.replace(/\/$/, '')}/api`;

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Job API functions
export const jobAPI = {
  getJobs: (params?: any) => api.get('/jobs', { params }),
  getJob: (id: string) => api.get(`/jobs/${id}`),
  createJob: (jobData: any) => api.post('/jobs', jobData),
  updateJob: (id: string, jobData: any) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),
  getMyJobs: (params?: any) => api.get('/jobs/employer/my-jobs', { params }),
};

// Application API functions
export const applicationAPI = {
  applyForJob: (applicationData: any) => api.post('/applications', applicationData),
  getMyApplications: (params?: any) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId: string, params?: any) => 
    api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (id: string, statusData: any) => 
    api.put(`/applications/${id}`, statusData),
  deleteApplication: (id: string) => api.delete(`/applications/${id}`),
};

// User API functions
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id: string) => api.get(`/users/${id}`),
};

export default api;
