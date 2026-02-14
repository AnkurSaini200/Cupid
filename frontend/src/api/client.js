import axios from 'axios';

const client = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
client.interceptors.request.use(
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

// Response interceptor for error handling
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        // Handle 401 Unauthorized (token expired or invalid)
        if (response && response.status === 401) {
            localStorage.removeItem('token');
            // Ideally redirect to login, but we'll let the context handle state updates
            // window.location.href = '/login'; 
        }

        return Promise.reject(error);
    }
);

export default client;
