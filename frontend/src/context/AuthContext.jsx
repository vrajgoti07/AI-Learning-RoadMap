import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [plan, setPlan] = useState('GO');
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await api.get('/auth/me');
            setUser(userData);
            setPlan(userData.plan || 'GO');
        } catch (error) {
            console.error('Failed to authenticate:', error);
            logout(); // Clear bad token
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const signup = async (userData) => {
        // userData requires: name, email, password
        const response = await api.post('/auth/signup', userData);
        return response; // Successfully created. Caller can then redirect to login.
    };

    const login = async (email, password) => {
        try {
            // Using our JSON endpoint instead of standard x-www-form-urlencoded
            const response = await api.post('/auth/login-json', { email, password });
            localStorage.setItem('token', response.access_token);
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }
            await fetchUser(); // Hydrate user state
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const googleLogin = async (credentialOrToken, isAccessToken = false) => {
        try {
            const body = isAccessToken
                ? { access_token: credentialOrToken }
                : { credential: credentialOrToken };
            const response = await api.post('/auth/google', body);
            localStorage.setItem('token', response.access_token);
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }
            await fetchUser();
            return true;
        } catch (error) {
            console.error("Google Auth failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setPlan('GO');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    };

    const upgradePlan = async (newPlan) => {
        try {
            await api.put('/users/upgrade-plan', { plan: newPlan });
            setPlan(newPlan);
            if (user) {
                setUser({ ...user, plan: newPlan });
            }
        } catch (error) {
            console.error("Upgrade failed:", error);
            throw error;
        }
    };

    const updateUserInfo = (newData) => {
        if (user) {
            setUser({ ...user, ...newData });
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, signup, logout, plan, upgradePlan, updateUserInfo, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
