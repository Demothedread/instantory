import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes
const SESSION_KEY = 'auth_session';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refreshTimerRef = useRef(null);

    // Load session from localStorage
    useEffect(() => {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
            try {
                const parsedSession = JSON.parse(savedSession);
                setUser(parsedSession);
            } catch (e) {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    }, []);

    // Setup refresh token timer
    useEffect(() => {
        if (user) {
            refreshTimerRef.current = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
        }
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [user]);

    const refreshToken = async () => {
        try {
            const response = await axios.post(
                `${config.apiUrl}/api/auth/refresh`,
                {},
                { withCredentials: true }
            );
            if (response.data.user) {
                updateUserSession(response.data.user);
            }
        } catch (error) {                       
            handleAuthError(error);
        }
    };

    const verifySession = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.apiUrl}/api/auth/session`,
                { withCredentials: true }
            );
            if (response.data.user) {
                updateUserSession(response.data.user);
            }
        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verifySession();
    }, []);

    const updateUserSession = (userData) => {
        setUser(userData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        setError(null);
    };

    const handleAuthError = (error) => {
        console.error('Auth error:', error);
        setError(error.response?.data?.message || 'Authentication failed');
        if (error.response?.status === 401) {
            clearSession();
        }
    };

    const clearSession = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
        }
    };

    const handleLogin = useCallback(async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(
                `${config.apiUrl}/api/auth/login`,
                userData,
                { withCredentials: true }
            );
            updateUserSession(response.data.user);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleGoogleLogin = useCallback(async (credential) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(
                `${config.apiUrl}/api/auth/google`,
                { credential },
                { withCredentials: true }
            );
            updateUserSession(response.data.user);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(
                `${config.apiUrl}/api/auth/logout`,
                {},
                { withCredentials: true }
            );
            clearSession();
        } catch (error) {
            handleAuthError(error);
        }
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                loading, 
                error,
                handleLogin,
                handleGoogleLogin,
                handleLogout,
                refreshToken,
                clearError: () => setError(null)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
