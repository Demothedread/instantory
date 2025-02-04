import React, { useState, useContext, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../contexts/AuthContext';
import './LoginOverlay.css';

const LoginOverlay = ({ isVisible }) => {
    const { handleLogin, handleGoogleLogin, error, clearError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);

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
        <div className={`login-overlay ${showAnimation ? 'show' : ''}`}>
            <div className="login-panel">
                <div className="login-decoration top-left"></div>
                <div className="login-decoration top-right"></div>
                <div className="login-decoration bottom-left"></div>
                <div className="login-decoration bottom-right"></div>
                
                <h2 className="login-title">
                    <span className="title-text">Welcome to Bartleby</span>
                    <div className="title-underline"></div>
                </h2>
                
                {error && (
                    <div className="error-message" onClick={clearError}>
                        <div className="error-icon">!</div>
                        {error}
                        <div className="error-close">×</div>
                    </div>
                )}
                
                <div className="login-options">
                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => console.error('Google Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            text="continue_with"
                            useOneTap
                            width="300px"
                        />
                    </div>
                    
                    <div className="divider">
                        <div className="divider-line"></div>
                        <span className="divider-text">or</span>
                        <div className="divider-line"></div>
                    </div>
                    
                    <form onSubmit={handleEmailLogin} className="email-form">
                        <div className="input-wrapper">
                            <input
                                type="email"
                                className="email-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="input-decoration"></div>
                        </div>
                        
                        <button
                            type="submit"
                            className={`email-login-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            <span className="button-text">
                                {isLoading ? 'Logging in...' : 'Continue with Email'}
                            </span>
                            <div className="button-decoration"></div>
                        </button>
                    </form>
                </div>
                
                <div className="login-footer">
                    <div className="footer-decoration left"></div>
                    <div className="footer-text">Secure Authentication</div>
                    <div className="footer-decoration right"></div>
                </div>
            </div>
        </div>
    );
};

export default LoginOverlay;
