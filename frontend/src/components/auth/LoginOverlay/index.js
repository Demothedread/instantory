import React, { useContext, useState } from 'react';

import { AuthContext }  from '../../../contexts/auth';
import { GoogleLogin } from '@react-oauth/google';
import { css } from '@emotion/react';
import styles from './styles';

const LoginOverlay = ({ isVisible, onGoogleLogin }) => {
    const { login, loginWithGoogle, error, clearError, setUser } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            // Use the passed prop if available, otherwise use context
            const loginFn = onGoogleLogin || loginWithGoogle;
            await loginFn(credential);
        } catch (error) {
            // Google Sign-In API changed - profileObj is no longer available in newer versions
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
            // Send both email and password to the login function
            await login({ email, password });
        } catch (error) {
            console.error('Email login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div css={css(styles.overlay)}>
            <div css={css(styles.panel)}>
                <h2 css={css(styles.title)}>Welcome to Instantory</h2>

                {error && (
                    <div css={css(styles.errorMessage)} onClick={clearError}>
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <div css={css(styles.loginOptions)}>
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
                        />
                        <button
                            type="submit"
                            css={css(isLoading ? [styles.emailLoginButton, styles.loading] : styles.emailLoginButton)}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <div css={css(styles.footer)}>
                    <span css={css(styles.footerText)}>Secure Authentication</span>
                </div>
            </div>
        </div>
    );
};

export default LoginOverlay;
