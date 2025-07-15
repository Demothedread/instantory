import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../../../contexts/auth/index';
import config from '../../../config';
import styles from './styles';

/**
 * MagicUI Login Component
 * A unified authentication interface with clockwork-inspired animations
 * Component Genealogy: Login Form → Clockwork Mechanism → Data Observatory Gateway
 * 
 * Features:
 * - Clockwork aesthetic matching ClockworkLoadingPage
 * - Seamless transitions between auth modes
 * - Mechanical gear animations
 * - Pendulum progress indicators
 * - Art Deco geometric patterns
 * - Error handling with visual feedback
 */
const MagicUILogin = ({ 
  onSuccess, 
  onError,
  showCloseButton = false,
  onClose,
  variant = 'modal' // 'modal', 'page', 'inline'
}) => {
  const { loginWithGoogle, login, register, error, clearError, user } = useContext(AuthContext);
  
  // State management
  const [mode, setMode] = useState('welcome'); // 'welcome', 'google', 'email', 'register', 'processing', 'success'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  
  // Animation refs and values
  const containerRef = useRef(null);
  const mainGearRotation = useMotionValue(0);
  const pendulumAngle = useMotionValue(0);
  const progressValue = useMotionValue(0);
  
  // Transform values for animations
  const gearRotation = useTransform(mainGearRotation, [0, 360], [0, 360]);
  const pendulumRotation = useTransform(pendulumAngle, [-15, 15], [-15, 15]);
  const progressWidth = useTransform(progressValue, [0, 100], ['0%', '100%']);

  // Animation cycles
  useEffect(() => {
    let interval;
    if (mode !== 'processing') {
      interval = setInterval(() => {
        mainGearRotation.set(mainGearRotation.get() + 1);
        pendulumAngle.set(Math.sin(Date.now() / 1000) * 15);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [mode, mainGearRotation, pendulumAngle]);

  // Progress animation during processing
  useEffect(() => {
    if (mode === 'processing') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => setMode('success'), 500);
        }
        progressValue.set(progress);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [mode, progressValue]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  // Handle Google authentication
  const handleGoogleAuth = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;
    
    setMode('processing');
    setIsLoading(true);
    
    try {
      await loginWithGoogle(credentialResponse.credential);
      setMode('success');
      setTimeout(() => onSuccess?.(user), 1000);
    } catch (err) {
      setMode('google');
      setIsLoading(false);
      onError?.(err);
    }
  };

  // Handle email authentication
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    
    setMode('processing');
    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
      } else {
        await login({
          email: formData.email,
          password: formData.password
        });
      }
      
      setMode('success');
      setTimeout(() => onSuccess?.(user), 1000);
    } catch (err) {
      setMode('email');
      setIsLoading(false);
      onError?.(err);
    }
  };

  // Mode transitions with animations
  const transitionToMode = (newMode) => {
    setAnimationPhase(prev => prev + 1);
    setTimeout(() => setMode(newMode), 300);
  };

  // Render different authentication modes
  const renderAuthContent = () => {
    switch (mode) {
      case 'welcome':
        return (
          <motion.div 
            css={styles.welcomeContent}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div css={styles.logoContainer}>
              <motion.div 
                css={styles.mechanicalLogo}
                style={{ rotate: gearRotation }}
              >
                🧠
              </motion.div>
            </div>
            
            <h2 css={styles.welcomeTitle}>Access Intelligence Platform</h2>
            <p css={styles.welcomeSubtitle}>Choose your authentication method</p>
            
            <div css={styles.authMethods}>
              <motion.button
                css={[styles.methodButton, styles.googleMethod]}
                onClick={() => transitionToMode('google')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span css={styles.methodIcon}>🔧</span>
                <span>Google Authentication</span>
              </motion.button>
              
              <motion.button
                css={[styles.methodButton, styles.emailMethod]}
                onClick={() => transitionToMode('email')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span css={styles.methodIcon}>⚙️</span>
                <span>Email Authentication</span>
              </motion.button>
            </div>
          </motion.div>
        );

      case 'google':
        return (
          <motion.div 
            css={styles.authContent}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <div css={styles.authHeader}>
              <motion.button
                css={styles.backButton}
                onClick={() => transitionToMode('welcome')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ← Back
              </motion.button>
              <h3 css={styles.authTitle}>Google Authentication</h3>
            </div>

            {error && (
              <motion.div 
                css={styles.errorMessage}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={clearError}
              >
                <span css={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <div css={styles.googleAuthContainer}>
              <GoogleLogin
                onSuccess={handleGoogleAuth}
                onError={() => onError?.('Google authentication failed')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>

            <div css={styles.divider}>
              <span>or</span>
            </div>

            <motion.button
              css={styles.switchButton}
              onClick={() => transitionToMode('email')}
              whileHover={{ scale: 1.02 }}
            >
              Use Email Instead
            </motion.button>
          </motion.div>
        );

      case 'email':
      case 'register':
        return (
          <motion.div 
            css={styles.authContent}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <div css={styles.authHeader}>
              <motion.button
                css={styles.backButton}
                onClick={() => transitionToMode('welcome')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ← Back
              </motion.button>
              <h3 css={styles.authTitle}>
                {mode === 'register' ? 'Create Account' : 'Email Authentication'}
              </h3>
            </div>

            {error && (
              <motion.div 
                css={styles.errorMessage}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={clearError}
              >
                <span css={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <form css={styles.authForm} onSubmit={handleEmailAuth}>
              {mode === 'register' && (
                <motion.div 
                  css={styles.inputGroup}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    css={styles.authInput}
                    required
                    disabled={isLoading}
                  />
                </motion.div>
              )}

              <div css={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  css={styles.authInput}
                  required
                  disabled={isLoading}
                />
              </div>

              <div css={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  css={styles.authInput}
                  required
                  disabled={isLoading}
                />
              </div>

              {mode === 'register' && (
                <motion.div 
                  css={styles.inputGroup}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    css={styles.authInput}
                    required
                    disabled={isLoading}
                  />
                </motion.div>
              )}

              <motion.button
                type="submit"
                css={styles.submitButton}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {mode === 'register' ? 'Create Account' : 'Sign In'}
              </motion.button>
            </form>

            <div css={styles.modeSwitch}>
              {mode === 'register' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    css={styles.switchButton}
                    onClick={() => setMode('email')}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New to Bartleby?{' '}
                  <button
                    type="button"
                    css={styles.switchButton}
                    onClick={() => setMode('register')}
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div 
            css={styles.processingContent}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div css={styles.clockworkProgress}>
              <motion.div 
                css={styles.mainGear}
                style={{ rotate: gearRotation }}
              >
                <div css={styles.gearTeeth} />
                <div css={styles.gearCenter}>⚙️</div>
              </motion.div>
              
              <motion.div 
                css={styles.pendulum}
                style={{ rotate: pendulumRotation }}
              >
                <div css={styles.pendulumBob} />
              </motion.div>

              <div css={styles.progressBar}>
                <motion.div 
                  css={styles.progressFill}
                  style={{ width: progressWidth }}
                />
              </div>
            </div>

            <h3 css={styles.processingTitle}>Accessing Intelligence Platform</h3>
            <p css={styles.processingMessage}>Initializing secure connection...</p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div 
            css={styles.successContent}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div 
              css={styles.successIcon}
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              ✨
            </motion.div>
            
            <h3 css={styles.successTitle}>Access Granted</h3>
            <p css={styles.successMessage}>Welcome to Bartleby Intelligence Platform</p>
            
            <div css={styles.successGears}>
              <motion.div css={styles.successGear} animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>⚙️</motion.div>
              <motion.div css={styles.successGear} animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>⚙️</motion.div>
              <motion.div css={styles.successGear} animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>⚙️</motion.div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div css={[styles.container, styles[variant]]}>
      <motion.div 
        ref={containerRef}
        css={styles.authCard}
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Decorative gears */}
        <div css={styles.decorativeGears}>
          <motion.div 
            css={[styles.decorativeGear, styles.gear1]}
            style={{ rotate: gearRotation }}
          >
            ⚙️
          </motion.div>
          <motion.div 
            css={[styles.decorativeGear, styles.gear2]}
            style={{ rotate: useTransform(gearRotation, r => -r * 0.7) }}
          >
            🔧
          </motion.div>
          <motion.div 
            css={[styles.decorativeGear, styles.gear3]}
            style={{ rotate: useTransform(gearRotation, r => r * 0.5) }}
          >
            ⚙️
          </motion.div>
        </div>

        {/* Close button */}
        {showCloseButton && (
          <motion.button
            css={styles.closeButton}
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        )}

        {/* Main content */}
        <AnimatePresence mode="wait">
          {renderAuthContent()}
        </AnimatePresence>

        {/* Art Deco border decoration */}
        <div css={styles.borderDecoration}>
          <div css={styles.cornerDecoration} />
          <div css={styles.cornerDecoration} />
          <div css={styles.cornerDecoration} />
          <div css={styles.cornerDecoration} />
        </div>
      </motion.div>
    </div>
  );
};

export default MagicUILogin;
