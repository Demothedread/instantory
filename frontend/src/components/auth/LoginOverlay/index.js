import React, { useContext, useEffect, useState } from 'react';

import { AuthContext } from '../../../contexts/auth';
import { GoogleLogin } from '@react-oauth/google';
 import { GoogleOAuthProvider } from '@react-oauth/google';
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
    
    const executeLogin = async (credential, onGoogleLogin, loginWithGoogle, setIsLoading) => {
        setIsLoading(true);
        try {
            // Use the passed prop if available, otherwise use context
            const loginFn = onGoogleLogin || loginWithGoogle;
            
            // Add CORS debugging logging
            console.log('Executing Google login with credential', 
                        credential ? 'credential present' : 'no credential');
            console.log('Origin:', window.location.origin);
            
            // Set g_csrf_token cookie if not already present
            if (!document.cookie.includes('g_csrf_token') && window.google) {
                const csrfToken = Math.random().toString(36).substring(2);
                document.cookie = `g_csrf_token=${csrfToken}; path=/; secure; SameSite=None`;
            }
            
            // Ensure loginFn is awaited as it's likely async
            await loginFn(credential);
            
            console.log('Google login successful');
        } catch (error) {
            console.error('Google login failed:', error);
            
            // Enhanced error diagnostics for CORS issues
            if (error.message && (
                error.message.includes('Network Error') || 
                error.message.includes('Failed to fetch') ||
                error.message.includes('CORS'))) {
                console.warn('Potential CORS issue detected during authentication');
                if (clearError) clearError();
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle Google One Tap response
    const handleOneTapResponse = async (response) => {
        if (!response || !response.credential) {
            console.error('Invalid Google One Tap response: No credential');
            // Optionally reset loading/error state if it was set earlier?
            // This case might not require isLoading as the prompt failed before calling loginFn
            return;
        }
        // Delegate the actual login execution to the shared function
        // Pass necessary dependencies if they are not directly accessible in executeLogin scope
        await executeLogin(
            response.credential,
            // Pass props/context values needed by executeLogin if it's a separate function
            // Assuming onGoogleLogin, loginWithGoogle, setIsLoading are available in scope here
            onGoogleLogin,
            loginWithGoogle,
            setIsLoading
        );
    };
    
    // Handle Google OAuth login (standard button)
    // Note: This function signature might vary slightly based on the library used (@react-oauth/google etc.)
    const handleGoogleSuccess = async (credentialResponse) => {
        const credential = credentialResponse?.credential;
        if (!credential) {
            console.error('Invalid Google credential response: No credential');
            // Optionally reset loading/error state
            return;
        }
         // Delegate the actual login execution to the shared function
        await executeLogin(
            credential,
             // Pass props/context values needed by executeLogin if it's a separate function
            onGoogleLogin,
            loginWithGoogle,
            setIsLoading
        );
    };
    
    
    useEffect(() => {
        // Ensure the Google Identity Services script is loaded BEFORE this component renders.
        // You typically add <script src="https://accounts.google.com/gsi/client" async defer></script>
        // in your index.html or use a loader utility.
        if (window.google && isVisible) {
            console.log('Initializing Google One Tap...');
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || window.GOOGLE_CLIENT_ID,
                callback: handleOneTapResponse,
                auto_select: true,
                // Consider making this true for better UX, allows user to dismiss easily
                cancel_on_tap_outside: true, // Changed to true - discuss UX implications
                // Additional options can be added here, e.g., context, ux_mode
            });
    
            // Display the One Tap UI
            window.google.accounts.id.prompt();
            console.log('Google One Tap prompt displayed');
    
            // Clean up when component unmounts or isVisible becomes false
            return () => {
                 console.log('Cancelling Google One Tap...');
                 window.google.accounts.id.cancel();
            };
        } else if (!window.google && isVisible) {
             console.warn('Google Identity Services script not loaded.');
             // Handle case where script isn't loaded - perhaps show an alternative login?
        }
    }, [isVisible]);
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
        }
    

    return (
        <GoogleOAuthProvider clientId={config.googleClientId}>
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
        </GoogleOAuthProvider>
    );
};

export default LoginOverlay;
