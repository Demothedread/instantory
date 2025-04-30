import React, { useContext, useEffect, useState } from 'react';

import { AuthContext } from '../../../contexts/auth';
import { GoogleLogin } from '@react-oauth/google';
import { css } from '@emotion/react';
import styles from './styles';

const LoginOverlay = ({ isVisible, onGoogleLogin }) => {
    const { login, adminLogin, register, loginWithGoogle, error, clearError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login', 'register', or 'admin'

    // Initialize Google One Tap when component mounts
    useEffect(() => {
        if (window.google && isVisible) {
            // Only show One Tap if the login overlay is visible
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || window.GOOGLE_CLIENT_ID,
                callback: handleOneTapResponse,
                auto_select: true,
                cancel_on_tap_outside: false,
            });
            
            // Display the One Tap UI
            window.google.accounts.id.prompt();
            
            // Clean up when component unmounts
            return () => {
                window.google.accounts.id.cancel();
            };
        }
    }, [isVisible]);
    
    // Handle Google One Tap response
    const handleOneTapResponse = (response) => {
        if (!response || !response.credential) {
            console.error('Invalid Google One Tap response');
            return;
        }
        setIsLoading(true);
        try {
            // Use the passed prop if available, otherwise use context
            const loginFn = onGoogleLogin || loginWithGoogle;
            loginFn(response.credential);
        } catch (error) {
            console.error('Google One Tap login failed:', error);
            setIsLoading(false);
        }
    };

    // Handle Google OAuth login (standard button)
    const handleGoogleSuccess = async (credentialResponse) => {
        const credential = credentialResponse?.credential;
        if (!credential) {
            console.error('Invalid Google credential response');
            return;
        }
        setIsLoading(true);
        try {
            // Use the passed prop if available, otherwise use context
            const loginFn = onGoogleLogin || loginWithGoogle;
            await loginFn(credential);
        } catch (error) {
            console.error('Google login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle email login with improved error handling
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        
        setIsLoading(true);
        try {
            await login({ email, password });
        } catch (error) {
            console.error('Email login failed:', error);
            
            // Check if this might be a CORS error
            if (error.message && error.message.includes('NetworkError') || 
                error.name === 'TypeError' || 
                error.message && error.message.includes('Failed to fetch')) {
                clearError();
                // Set a more user-friendly error message
                console.warn('Authentication server connection issue detected. This could be a CORS error.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle user registration with improved error handling
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email || !password || !name) return;
        
        setIsLoading(true);
        try {
            await register({ email, password, name });
        } catch (error) {
            console.error('Registration failed:', error);
            
            // Detect network and CORS issues
            if (error.message && error.message.includes('NetworkError') || 
                error.name === 'TypeError' || 
                error.message && error.message.includes('Failed to fetch')) {
                clearError();
                // Set a more user-friendly error message
                console.warn('Authentication server connection issue detected. This could be a CORS error.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle admin login
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        if (!email || !adminPassword) return;
        
        setIsLoading(true);
        try {
            await adminLogin({ email, admin_password: adminPassword });
        } catch (error) {
            console.error('Admin login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Switch between different auth modes
    const switchMode = (newMode) => {
        clearError();
        setMode(newMode);
    };

    if (!isVisible) return null;

    // Render the appropriate form based on the current mode
    const renderForm = () => {
        switch (mode) {
            case 'register':
                return (
                    <form onSubmit={handleRegister} css={css(styles.emailForm)}>
                        <input
                            type="text"
                            css={css(styles.emailInput)}
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="email"
                            css={css(styles.emailInput)}
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            css={css(styles.emailInput)}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autocomplete="new-password"
                        />
                        <button
                            type="submit"
                            css={css(isLoading ? [styles.emailLoginButton, styles.loading] : styles.emailLoginButton)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                        <div css={css(styles.switchMode)}>
                            <span>Already have an account? </span>
                            <button type="button" onClick={() => switchMode('login')} css={css(styles.switchButton)}>
                                Sign In
                            </button>
                        </div>
                    </form>
                );
            case 'admin':
                return (
                    <form onSubmit={handleAdminLogin} css={css(styles.emailForm)}>
                        <input
                            type="email"
                            css={css(styles.emailInput)}
                            placeholder="Admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            css={css(styles.emailInput)}
                            placeholder="Admin override password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autocomplete="current-password"
                        />
                        <button
                            type="submit"
                            css={css(isLoading ? [styles.emailLoginButton, styles.loading] : [styles.emailLoginButton, styles.adminButton])}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Admin Login'}
                        </button>
                        <div css={css(styles.switchMode)}>
                            <span>Not an admin? </span>
                            <button type="button" onClick={() => switchMode('login')} css={css(styles.switchButton)}>
                                Regular Login
                            </button>
                        </div>
                    </form>
                );
            // Default is the regular login
            default:
                return (
                    <form onSubmit={handleEmailLogin} css={css(styles.emailForm)}>
                        <input
                            type="email"
                            css={css(styles.emailInput)}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            css={css(styles.emailInput)}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autocomplete="current-password"
                        />
                        <button
                            type="submit"
                            css={css(isLoading ? [styles.emailLoginButton, styles.loading] : styles.emailLoginButton)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Sign In'}
                        </button>
                        <div css={css(styles.switchMode)}>
                            <span>New to Bartleby? </span>
                            <button type="button" onClick={() => switchMode('register')} css={css(styles.switchButton)}>
                                Create Account
                            </button>
                            <span> | </span>
                            <button type="button" onClick={() => switchMode('admin')} css={css(styles.switchButton)}>
                                Admin
                            </button>
                        </div>
                    </form>
                );
        }
    };

    return (
        <div css={css(styles.overlay)}>
            <div css={css(styles.panel)}>
                <h2 css={css(styles.title)}>
                    {mode === 'register' ? 'Create Your Account' : 
                     mode === 'admin' ? 'Admin Access' : 'Welcome to Bartleby'}
                </h2>

                {error && (
                    <div css={css(styles.errorMessage)} onClick={clearError}>
                        <span>⚠️ {error}</span>
                        {(error.includes('NetworkError') || error.includes('Failed to fetch') || error.includes('TypeError')) && (
                            <div css={css(styles.errorDetail)}>
                                A network error occurred. Please try again later or contact support if the issue persists.
                            </div>
                        )}
                    </div>
                )}

                <div css={css(styles.loginOptions)}>
                    {mode !== 'admin' && (
                        <>
                            <div css={css(styles.googleLoginWrapper)}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={(error) => console.error('Google Login Failed:', error)}
                                    theme="outline"
                                    size="large"
                                    shape="pill"
                                    width="300px"
                                />
                            </div>

                            <div css={css(styles.divider)}>
                                <div css={css(styles.dividerLine)} />
                                <span css={css(styles.dividerText)}>or</span>
                                <div css={css(styles.dividerLine)} />
                            </div>
                        </>
                    )}

                    {renderForm()}
                </div>

                <div css={css(styles.footer)}>
                    <span css={css(styles.footerText)}>
                        {mode === 'admin' ? 'Admin Portal Access' : 'Secure Authentication'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginOverlay;
