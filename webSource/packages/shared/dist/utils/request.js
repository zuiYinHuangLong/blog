import axios from 'axios';
import { API_BASE_URL } from './constants';
const request = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000
});
request.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
request.interceptors.response.use((response) => {
    const data = response.data;
    if (data.code !== 0) {
        return Promise.reject(new Error(data.message || 'Request failed'));
    }
    return response;
}, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
export default request;
//# sourceMappingURL=request.js.map