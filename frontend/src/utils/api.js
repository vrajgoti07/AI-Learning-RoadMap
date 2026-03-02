let base_url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
if (base_url.endsWith('8000')) {
    base_url = `${base_url}/api`;
} else if (!base_url.includes('/api')) {
    base_url = `${base_url}/api`;
}
const API_URL = base_url;

const handleResponse = async (response, originalRequest = null) => {
    if (!response.ok) {
        if (response.status === 401 && originalRequest) {
            // Attempt to refresh the token
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: refreshToken })
                    });

                    if (refreshResponse.ok) {
                        const newTokens = await refreshResponse.json();
                        localStorage.setItem('token', newTokens.access_token);
                        localStorage.setItem('refresh_token', newTokens.refresh_token);

                        // Retry original request with new token
                        originalRequest.headers['Authorization'] = `Bearer ${newTokens.access_token}`;
                        const retryResponse = await fetch(originalRequest.url, originalRequest.options);
                        if (retryResponse.ok) {
                            return retryResponse.json();
                        }
                    } else {
                        // Refresh token is expired or invalid, log out
                        localStorage.removeItem('token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                    }
                } catch (err) {
                    console.error('Failed to refresh token', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

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

        const options = { headers };
        const url = `${API_URL}${endpoint}`;

        const response = await fetch(url, options);
        return handleResponse(response, { url, options, headers });
    },

    async post(endpoint, data) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        };
        const url = `${API_URL}${endpoint}`;

        const response = await fetch(url, options);
        return handleResponse(response, { url, options, headers });
    },

    async postFormUrlEncoded(endpoint, data) {
        // Specifically used for FastAPI's OAuth2PasswordRequestForm standard
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const formBody = new URLSearchParams(data).toString();

        const options = {
            method: 'POST',
            headers,
            body: formBody,
        };
        const url = `${API_URL}${endpoint}`;

        const response = await fetch(url, options);
        return handleResponse(response, { url, options, headers });
    },

    async put(endpoint, data) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        };
        const url = `${API_URL}${endpoint}`;

        const response = await fetch(url, options);
        return handleResponse(response, { url, options, headers });
    },

    async delete(endpoint) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = {
            method: 'DELETE',
            headers,
        };
        const url = `${API_URL}${endpoint}`;

        const response = await fetch(url, options);
        return handleResponse(response, { url, options, headers });
    }
};
