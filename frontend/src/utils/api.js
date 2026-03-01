const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let errorMessage = 'Something went wrong';
        
        if (error.detail) {
            if (Array.isArray(error.detail)) {
                // Handle FastAPI validation errors (e.g., invalid email)
                errorMessage = error.detail.map(err => err.msg).join(', ');
            } else if (typeof error.detail === 'string') {
                errorMessage = error.detail;
            } else {
                errorMessage = JSON.stringify(error.detail);
            }
        }
        
        throw new Error(errorMessage);
    }
    return response.json();
};

export const api = {
    async get(endpoint) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, { headers });
        return handleResponse(response);
    },

    async post(endpoint, data) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async postFormUrlEncoded(endpoint, data) {
        // Specifically used for FastAPI's OAuth2PasswordRequestForm standard
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const formBody = new URLSearchParams(data).toString();

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formBody,
        });
        return handleResponse(response);
    },

    async put(endpoint, data) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    async delete(endpoint) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        return handleResponse(response);
    }
};
