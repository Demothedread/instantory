import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { authConfig } from '../../config/auth';
import axios from 'axios';
import config from '../../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refreshTimerRef = useRef(null);

    // Load session from localStorage
    useEffect(() => {
        const savedSession = localStorage.getItem(authConfig.sessionKey);
        if (savedSession) {
            try {
                const parsedSession = JSON.parse(savedSession);
                setUser(parsedSession);
            } catch (e) {
                localStorage.removeItem(authConfig.sessionKey);
            }
        }
    }, []);

    // Setup refresh token timer
    useEffect(() => {
        if (user) {
            refreshTimerRef.current = setInterval(refreshToken, authConfig.tokenRefreshInterval);
        }
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [user, refreshToken]);

    const refreshToken = async () => {
        try {
            const response = await axios.post(
                `${config.apiUrl}${authConfig.endpoints.refresh}`,
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
                `${config.apiUrl}${authConfig.endpoints.session}`,
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
    }, [verifySession]);

    const updateUserSession = (userData) => {
        setUser(userData);
        localStorage.setItem(authConfig.sessionKey, JSON.stringify(userData));
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
        localStorage.removeItem(authConfig.sessionKey);
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
        }
    };

    const handleLogin = useCallback(async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(
                `${config.apiUrl}${authConfig.endpoints.login}`,
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
                `${config.apiUrl}${authConfig.endpoints.googleLogin}`,
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
                `${config.apiUrl}${authConfig.endpoints.logout}`,
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
