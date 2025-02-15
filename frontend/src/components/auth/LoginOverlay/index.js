import { GoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../../../contexts/auth';
import styles from './styles';

const LoginOverlay = ({ isVisible }) => {
    const { handleLogin, handleGoogleLogin, error, clearError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [fedcmEnabled, setFedcmEnabled] = useState(true);

    // Check if FedCM is supported
    useEffect(() => {
        const checkFedcmSupport = async () => {
            try {
                // Check if the identity-credentials-get feature is supported
                const supported = 'IdentityCredential' in window;
                setFedcmEnabled(supported);
            } catch (error) {
                console.warn('FedCM support check failed:', error);
                setFedcmEnabled(false);
            }
        };
        checkFedcmSupport();
    }, []);

    // Use Google One Tap as fallback when FedCM is not available
    useGoogleOneTapLogin({
        onSuccess: handleGoogleSuccess,
        onError: (error) => console.error('Google One Tap failed:', error),
        disabled: fedcmEnabled, // Only enable when FedCM is not available
    });

    useEffect(() => {
        if (isVisible) {
            setShowAnimation(true);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await handleLogin({ email });
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await handleGoogleLogin(credentialResponse.credential);
        } catch (error) {
            console.error('Google login failed:', error);
        }
    };

    return (
        <div css={styles.overlay} className={showAnimation ? 'show' : ''}>
            <div css={styles.panel}>
                <div css={styles.decoration} className="top-left" />
                <div css={styles.decoration} className="top-right" />
                <div css={styles.decoration} className="bottom-left" />
                <div css={styles.decoration} className="bottom-right" />
                
                <h2 css={styles.title}>
                    <span css={styles.titleText}>Welcome to Bartleby</span>
                    <div css={styles.titleUnderline} />
                </h2>
                
                {error && (
                    <div css={styles.errorMessage} onClick={clearError}>
                        <div css={styles.errorIcon}>!</div>
                        {error}
                        <div css={styles.errorClose}>×</div>
                    </div>
                )}
                
                <div css={styles.loginOptions}>
                    <div css={styles.googleLoginWrapper}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={(error) => {
                                console.error('Google Login Failed:', error);
                                if (error.message?.includes('identity-credentials-get')) {
                                    setFedcmEnabled(false); // Disable FedCM and fall back to traditional flow
                                }
                            }}
                            theme="filled_black"
                            shape="pill"
                            text="continue_with"
                            useOneTap={fedcmEnabled}
                            width="300px"
                            context="use"
                            flow="fedcm"
                            auto_select={fedcmEnabled}
                        />
                    </div>
                    
                    <div css={styles.divider}>
                        <div css={styles.dividerLine} />
                        <span css={styles.dividerText}>or</span>
                        <div css={styles.dividerLine} />
                    </div>
                    
                    <form onSubmit={handleEmailLogin} css={styles.emailForm}>
                        <div css={styles.inputWrapper}>
                            <input
                                type="email"
                                css={styles.emailInput}
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div css={styles.inputDecoration} />
                        </div>
                        
                        <button
                            type="submit"
                            css={[styles.emailLoginButton, isLoading && styles.loading]}
                            disabled={isLoading}
                        >
                            <span css={styles.buttonText}>
                                {isLoading ? 'Logging in...' : 'Continue with Email'}
                            </span>
                            <div css={styles.buttonDecoration} />
                        </button>
                    </form>
                </div>
                
                <div css={styles.footer}>
                    <div css={styles.footerDecoration} className="left" />
                    <div css={styles.footerText}>Secure Authentication</div>
                    <div css={styles.footerDecoration} className="right" />
                </div>
            </div>
        </div>
    );
};

export default LoginOverlay;
