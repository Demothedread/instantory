import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../../../contexts/auth';
import { GoogleLogin } from '@react-oauth/google';
import styles from './styles';

const LoginOverlay = ({ isVisible }) => {
    const { handleLogin, handleGoogleLogin, error, clearError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle Google OAuth login
    const handleGoogleSuccess = async (credentialResponse) => {
        const credential = credentialResponse?.credential;
        if (!credential) {
            console.error('Invalid Google credential response');
            return;
        }
        setIsLoading(true);
        try {
            await handleGoogleLogin(credential);
        } catch (error) {
            console.error('Google login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle email login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        try {
            await handleLogin(email);
        } catch (error) {
            console.error('Email login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div css={styles.overlay}>
            <div css={styles.panel}>
                <h2 css={styles.title}>Welcome to Bartleby</h2>

                {error && (
                    <div css={styles.errorMessage} onClick={clearError}>
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <div css={styles.loginOptions}>
                    <div css={styles.googleLoginWrapper}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={(error) => console.error('Google Login Failed:', error)}
                            theme="outline"
                            size="large"
                            shape="pill"
                            width="300px"
                        />
                    </div>

                    <div css={styles.divider}>
                        <div css={styles.dividerLine} />
                        <span css={styles.dividerText}>or</span>
                        <div css={styles.dividerLine} />
                    </div>

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
                        <button
                            type="submit"
                            css={[styles.emailLoginButton, isLoading && styles.loading]}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Continue with Email'}
                        </button>
                    </form>
                </div>

                <div css={styles.footer}>
                    <span css={styles.footerText}>Secure Authentication</span>
                </div>
            </div>
        </div>
    );
};

export default LoginOverlay;