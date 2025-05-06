import React, { useContext, useState } from 'react';
import { css } from '@emotion/react';
import { AuthContext } from '../../../contexts/auth';
import GoogleAuth from '../GoogleAuth';
import styles from './styles';

const LoginOverlay = ({ isVisible }) => {
    const { login, adminLogin, register, error, clearError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login', 'register', or 'admin'
    
    // Handle email login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        
        setIsLoading(true);
        try {
            await login({ email, password });
        } catch (error) {
            // Error handling is managed in the AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    // Handle user registration
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email || !password || !name) return;
        
        setIsLoading(true);
        try {
            await register({ email, password, name });
        } catch (error) {
            // Error handling is managed in the AuthContext
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
            // Error handling is managed in the AuthContext
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
                    <form onSubmit={handleRegister} css={styles.emailForm}>
                        <input
                            type="text"
                            css={styles.emailInput}
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="email"
                            css={styles.emailInput}
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            css={styles.emailInput}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        <button
                            type="submit"
                            css={isLoading ? [styles.emailLoginButton, styles.loading] : styles.emailLoginButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                        <div css={styles.switchMode}>
                            <span>Already have an account? </span>
                            <button type="button" onClick={() => switchMode('login')} css={styles.switchButton}>
                                Sign In
                            </button>
                        </div>
                    </form>
                );
            case 'admin':
                return (
                    <form onSubmit={handleAdminLogin} css={styles.emailForm}>
                        <input
                            type="email"
                            css={styles.emailInput}
                            placeholder="Admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            css={styles.emailInput}
                            placeholder="Admin override password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        <button
                            type="submit"
                            css={isLoading ? [styles.emailLoginButton, styles.loading] : [styles.emailLoginButton, styles.adminButton]}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Admin Login'}
                        </button>
                        <div css={styles.switchMode}>
                            <span>Not an admin? </span>
                            <button type="button" onClick={() => switchMode('login')} css={styles.switchButton}>
                                Regular Login
                            </button>
                        </div>
                    </form>
                );
            // Default is the regular login
            default:
                return (
                    <form onSubmit={handleEmailLogin} css={styles.emailForm}>
                        <input
                            type="email"
                            css={styles.emailInput}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            css={styles.emailInput}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                        <button
                            type="submit"
                            css={isLoading ? [styles.emailLoginButton, styles.loading] : styles.emailLoginButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Sign In'}
                        </button>
                        <div css={styles.switchMode}>
                            <span>New to Bartleby? </span>
                            <button type="button" onClick={() => switchMode('register')} css={styles.switchButton}>
                                Create Account
                            </button>
                            <span> | </span>
                            <button type="button" onClick={() => switchMode('admin')} css={styles.switchButton}>
                                Admin
                            </button>
                        </div>
                    </form>
                );
        }
    };

    return (
        <div css={styles.overlay} data-testid="login-overlay">
            <div css={styles.panel}>
                <h2 css={styles.title}>
                    {mode === 'register' ? 'Create Your Account' : 
                     mode === 'admin' ? 'Admin Access' : 'Welcome to Bartleby'}
                </h2>

                {error && (
                    <div css={styles.errorMessage} onClick={clearError}>
                        <span>⚠️ {error}</span>
                        {(error.includes('Network') || error.includes('failed to fetch') || error.includes('TypeError')) && (
                            <div css={styles.errorDetail}>
                                A network error occurred. Please try again later or contact support.
                            </div>
                        )}
                    </div>
                )}

                <div css={styles.loginOptions}>
                    {mode !== 'admin' && (
                        <>
                            <div css={styles.googleLoginWrapper}>
                                <GoogleAuth 
                                    buttonText={mode === 'register' ? 'Sign up with Google' : 'Sign in with Google'}
                                />
                            </div>

                            <div css={styles.divider}>
                                <div css={styles.dividerLine} />
                                <span css={styles.dividerText}>or</span>
                                <div css={styles.dividerLine} />
                            </div>
                        </>
                    )}

                    {renderForm()}
                </div>

                <div css={styles.footer}>
                    <span css={styles.footerText}>
                        {mode === 'admin' ? 'Admin Portal Access' : 'Secure Authentication'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginOverlay;
