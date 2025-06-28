import { css } from '@emotion/react';
import { GoogleLogin } from '@react-oauth/google';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth/index';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

/**
 * Authentication Section Component
 * Component Genealogy: Vault Door -> Security Portal -> Access Control
 * Subverts traditional login forms by presenting authentication as a ceremonial entrance
 */
const AuthSection = ({ user }) => {
  const { loginWithGoogle, login, error, clearError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      await loginWithGoogle(credentialResponse.credential);
    }
  };

  if (user) {
    return (
      <section css={styles.container}>
        <div css={[styles.portalFrame, styles.welcomePortal]}>
          {/* Welcome back portal */}
          <div css={styles.welcomeHeader}>
            <div css={styles.crownIcon}>👑</div>
            <h2 css={styles.welcomeTitle}>Welcome Back, Digital Archivist</h2>
            <p css={styles.welcomeMessage}>
              Your document intelligence awaits. Ready to process new knowledge?
            </p>
          </div>

          <div css={styles.userActions}>
            <Link to="/home" css={[styles.portalButton, styles.primaryPortal]}>
              <span css={styles.buttonIcon}>📊</span>
              <span>Enter Command Center</span>
              <div css={styles.buttonGlow} />
            </Link>
            
            <Link to="/process" css={[styles.portalButton, styles.secondaryPortal]}>
              <span css={styles.buttonIcon}>⚡</span>
              <span>Start Processing</span>
              <div css={styles.buttonGlow} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="auth" css={styles.container}>
      {/* Ceremonial entrance portal */}
      <div css={[styles.portalFrame, styles.authPortal]}>
        {/* Art-Deco entrance archway */}
        <div css={styles.archway}>
          <div css={styles.archLeft} />
          <div css={styles.archCenter}>
            <div css={styles.keystoneIcon}>◆</div>
          </div>
          <div css={styles.archRight} />
        </div>

        {/* Portal title */}
        <div css={styles.authHeader}>
          <h2 css={styles.authTitle}>Enter the Archive</h2>
          <p css={styles.authSubtitle}>
            Begin your journey into intelligent document organization
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div css={styles.errorAlert} onClick={clearError}>
            <span css={styles.errorIcon}>⚠️</span>
            <span css={styles.errorText}>{error}</span>
            <button css={styles.errorClose}>×</button>
          </div>
        )}

        {/* Authentication methods */}
        <div css={styles.authMethods}>
          {/* Google OAuth - Primary method */}
          <div css={styles.googleAuthContainer}>
            <div css={styles.methodLabel}>
              <span css={styles.methodIcon}>🚀</span>
              <span>Quick Access Portal</span>
            </div>
            
            <div css={styles.googleWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.error('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>
          </div>

          {/* Art-Deco divider */}
          <div css={styles.authDivider}>
            <div css={styles.dividerLine} />
            <div css={styles.dividerCenter}>
              <span css={styles.dividerText}>or use legacy credentials</span>
            </div>
            <div css={styles.dividerLine} />
          </div>

          {/* Email/Password form - Secondary method */}
          <div css={styles.credentialsContainer}>
            <div css={styles.methodLabel}>
              <span css={styles.methodIcon}>🔐</span>
              <span>Secure Vault Access</span>
            </div>

            <form css={styles.credentialsForm} onSubmit={handleEmailLogin}>
              <div css={styles.inputGroup}>
                <label css={styles.inputLabel}>Archive Access ID</label>
                <input
                  type="email"
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  css={[styles.formInput, styles.emailInput]}
                  required
                />
                <div css={styles.inputUnderline} />
              </div>

              <div css={styles.inputGroup}>
                <label css={styles.inputLabel}>Security Cipher</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  css={[styles.formInput, styles.passwordInput]}
                  required
                />
                <div css={styles.inputUnderline} />
              </div>

              <button 
                type="submit" 
                css={[styles.submitButton, isLoading && styles.loadingButton]}
                disabled={isLoading}
              >
                <span css={styles.buttonIcon}>
                  {isLoading ? '⏳' : '🗝️'}
                </span>
                <span css={styles.buttonText}>
                  {isLoading ? 'Authenticating...' : 'Unlock Archive'}
                </span>
                <div css={styles.buttonGlow} />
              </button>
            </form>
          </div>
        </div>

        {/* Registration prompt */}
        <div css={styles.registrationPrompt}>
          <p css={styles.promptText}>
            New to the archive? 
            <Link to="/register" css={styles.promptLink}>
              Request Access Credentials
            </Link>
          </p>
        </div>

        {/* Decorative elements */}
        <div css={styles.portalDecorations}>
          <div css={styles.decoration1} />
          <div css={styles.decoration2} />
          <div css={styles.decoration3} />
          <div css={styles.decoration4} />
        </div>
      </div>
    </section>
  );
};

const styles = {
  container: css`
    padding: ${layout.spacing['4xl']} ${layout.spacing.lg};
    display: flex;
    justify-content: center;
    min-height: 80vh;
    align-items: center;

    ${layout.media.mobile} {
      padding: ${layout.spacing['2xl']} ${layout.spacing.md};
      min-height: 70vh;
    }
  `,

  /* Portal frame base styling */
  portalFrame: css`
    position: relative;
    max-width: 500px;
    width: 100%;
    padding: ${layout.spacing['3xl']};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.95) 0%, 
      rgba(16, 21, 62, 0.98) 100%);
    border: 2px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 40px ${colors.neonTeal}20,
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    overflow: hidden;

    ${layout.media.mobile} {
      padding: ${layout.spacing.xl};
    }
  `,

  /* Welcome portal for authenticated users */
  welcomePortal: css`
    text-align: center;
    border-color: ${colors.neonGold};
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 40px ${colors.neonGold}30,
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `,

  /* Auth portal for login */
  authPortal: css`
    border-color: ${colors.neonTeal};
  `,

  /* Art-Deco archway */
  archway: css`
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    height: 60px;
    display: flex;
    align-items: flex-end;
  `,

  archLeft: css`
    flex: 1;
    height: 30px;
    background: linear-gradient(135deg, ${colors.neonTeal} 0%, transparent 100%);
    clip-path: polygon(0% 100%, 100% 100%, 80% 0%);
  `,

  archCenter: css`
    width: 80px;
    height: 50px;
    background: linear-gradient(135deg, 
      ${colors.neonTeal} 0%, 
      ${colors.neonGold} 50%, 
      ${colors.neonTeal} 100%);
    border-radius: 40px 40px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  `,

  archRight: css`
    flex: 1;
    height: 30px;
    background: linear-gradient(45deg, ${colors.neonTeal} 0%, transparent 100%);
    clip-path: polygon(20% 0%, 100% 100%, 0% 100%);
  `,

  keystoneIcon: css`
    color: ${colors.background};
    font-size: ${typography.sizes.xl};
    font-weight: ${typography.weights.bold};
    text-shadow: 0 0 10px ${colors.neonGold};
  `,

  /* Welcome section styling */
  welcomeHeader: css`
    text-align: center;
    margin-bottom: ${layout.spacing['2xl']};
    padding-top: ${layout.spacing.xl};
  `,

  crownIcon: css`
    font-size: ${typography.sizes['4xl']};
    margin-bottom: ${layout.spacing.lg};
    filter: drop-shadow(0 0 20px ${colors.neonGold});
  `,

  welcomeTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonGold};
    margin-bottom: ${layout.spacing.md};
    text-shadow: 0 0 20px ${colors.neonGold}60;
  `,

  welcomeMessage: css`
    font-family: ${typography.fonts.primary};
    color: ${colors.textLight};
    opacity: 0.9;
    line-height: ${typography.lineHeights.relaxed};
  `,

  userActions: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
  `,

  /* Auth header */
  authHeader: css`
    text-align: center;
    margin-bottom: ${layout.spacing['2xl']};
    padding-top: ${layout.spacing['2xl']};
  `,

  authTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    color: ${colors.neonTeal};
    margin-bottom: ${layout.spacing.md};
    text-shadow: 0 0 20px ${colors.neonTeal}60;

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  authSubtitle: css`
    font-family: ${typography.fonts.primary};
    color: ${colors.textLight};
    opacity: 0.8;
    line-height: ${typography.lineHeights.relaxed};
  `,

  /* Error alert */
  errorAlert: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: linear-gradient(135deg, 
      rgba(255, 7, 58, 0.2) 0%, 
      rgba(255, 7, 58, 0.1) 100%);
    border: 1px solid ${colors.neonRed};
    border-radius: ${layout.borderRadius.md};
    color: ${colors.neonRed};
    margin-bottom: ${layout.spacing.lg};
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, 
        rgba(255, 7, 58, 0.3) 0%, 
        rgba(255, 7, 58, 0.15) 100%);
    }
  `,

  errorIcon: css`
    font-size: ${typography.sizes.lg};
  `,

  errorText: css`
    flex: 1;
    font-size: ${typography.sizes.sm};
  `,

  errorClose: css`
    background: none;
    border: none;
    color: ${colors.neonRed};
    font-size: ${typography.sizes.lg};
    cursor: pointer;
    padding: ${layout.spacing.xs};
    border-radius: 50%;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(255, 7, 58, 0.2);
    }
  `,

  /* Authentication methods */
  authMethods: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xl};
  `,

  methodLabel: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    margin-bottom: ${layout.spacing.md};
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `,

  methodIcon: css`
    font-size: ${typography.sizes.base};
  `,

  /* Google authentication */
  googleAuthContainer: css`
    /* Google button styling is handled by the component */
  `,

  googleWrapper: css`
    /* Wrapper for additional styling if needed */
    .google-login-button {
      width: 100% !important;
    }
  `,

  /* Auth divider */
  authDivider: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
    margin: ${layout.spacing.lg} 0;
  `,

  dividerLine: css`
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${colors.border} 50%, 
      transparent 100%);
  `,

  dividerCenter: css`
    padding: 0 ${layout.spacing.md};
  `,

  dividerText: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `,

  /* Credentials form */
  credentialsContainer: css`
    /* Container for email/password form */
  `,

  credentialsForm: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
  `,

  inputGroup: css`
    position: relative;
  `,

  inputLabel: css`
    display: block;
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.neonTeal};
    margin-bottom: ${layout.spacing.sm};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  formInput: css`
    width: 100%;
    padding: ${layout.spacing.md} 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid ${colors.border};
    color: ${colors.textLight};
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    transition: all 0.3s ease;
    outline: none;

    &::placeholder {
      color: ${colors.textMuted};
      opacity: 0.7;
    }

    &:focus {
      border-bottom-color: ${colors.neonTeal};
      
      + .input-underline {
        transform: scaleX(1);
      }
    }
  `,

  inputUnderline: css`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${colors.neonTeal}, ${colors.neonGold});
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.3s ease;
  `,

  /* Portal buttons */
  portalButton: css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    border: 2px solid currentColor;
    border-radius: ${layout.borderRadius.md};
    text-decoration: none;
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    font-weight: ${typography.weights.semibold};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
  `,

  primaryPortal: css`
    background: linear-gradient(135deg, ${colors.neonTeal} 0%, ${colors.neonBlue} 100%);
    color: ${colors.background};
    border-color: ${colors.neonTeal};

    &:hover {
      box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.3),
        0 0 40px ${colors.neonTeal}40;
    }
  `,

  secondaryPortal: css`
    background: transparent;
    color: ${colors.neonGold};
    border-color: ${colors.neonGold};

    &:hover {
      background: linear-gradient(135deg, ${colors.neonGold}20, ${colors.neonGold}10);
      box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.3),
        0 0 40px ${colors.neonGold}30;
    }
  `,

  submitButton: css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.md};
    width: 100%;
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    background: linear-gradient(135deg, ${colors.neonTeal} 0%, ${colors.neonBlue} 100%);
    border: 2px solid ${colors.neonTeal};
    border-radius: ${layout.borderRadius.md};
    color: ${colors.background};
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    font-weight: ${typography.weights.semibold};
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.3),
        0 0 40px ${colors.neonTeal}40;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `,

  loadingButton: css`
    animation: loadingPulse 2s ease-in-out infinite;
  `,

  buttonIcon: css`
    font-size: ${typography.sizes.lg};
  `,

  buttonText: css`
    position: relative;
    z-index: 2;
  `,

  buttonGlow: css`
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.2) 0%, 
      transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  `,

  /* Registration prompt */
  registrationPrompt: css`
    text-align: center;
    margin-top: ${layout.spacing.xl};
    padding-top: ${layout.spacing.lg};
    border-top: 1px solid ${colors.border};
  `,

  promptText: css`
    font-family: ${typography.fonts.primary};
    color: ${colors.textMuted};
    font-size: ${typography.sizes.sm};
  `,

  promptLink: css`
    color: ${colors.neonTeal};
    text-decoration: none;
    margin-left: ${layout.spacing.sm};
    font-weight: ${typography.weights.semibold};
    transition: color 0.3s ease;

    &:hover {
      color: ${colors.neonGold};
      text-shadow: 0 0 10px ${colors.neonGold}60;
    }
  `,

  /* Portal decorations */
  portalDecorations: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  `,

  decoration1: css`
    position: absolute;
    top: 20%;
    right: -20px;
    width: 40px;
    height: 40px;
    background: ${colors.neonTeal};
    border-radius: 50%;
    opacity: 0.1;
    animation: float 20s ease-in-out infinite;
  `,

  decoration2: css`
    position: absolute;
    bottom: 30%;
    left: -15px;
    width: 30px;
    height: 30px;
    background: ${colors.neonGold};
    border-radius: 50%;
    opacity: 0.1;
    animation: float 25s ease-in-out infinite reverse;
  `,

  decoration3: css`
    position: absolute;
    top: 50%;
    right: -10px;
    width: 20px;
    height: 60px;
    background: linear-gradient(to bottom, ${colors.neonPurple}, transparent);
    opacity: 0.1;
    animation: float 15s ease-in-out infinite;
  `,

  decoration4: css`
    position: absolute;
    bottom: 20%;
    left: -10px;
    width: 20px;
    height: 60px;
    background: linear-gradient(to top, ${colors.neonPink}, transparent);
    opacity: 0.1;
    animation: float 18s ease-in-out infinite reverse;
  `,

  /* Animations */
  '@keyframes float': css`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  `,

  '@keyframes loadingPulse': css`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  `,
};

export default AuthSection;
