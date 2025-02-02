// AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication status on app load
        const verifySession = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/auth/session`, {
                    withCredentials: true,
                });
                if (response.data.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Session verification failed:', error);
            } finally {
                setLoading(false);
            }
        };
        verifySession();
    }, []);

    const handleLogin = useCallback((userData) => {
        setUser(userData);
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(`${config.apiUrl}/api/auth/logout`, {}, { withCredentials: true });
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, handleLogin, handleLogout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;