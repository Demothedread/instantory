import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../../contexts/auth';
import { GoogleLogin } from '@react-oauth/google';
import { css } from '@emotion/react';
// Removed unused 'colors' import

const LandingPage = () => {
  const { loginWithGoogle, login, error, clearError, user } = useContext(AuthContext);
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

  return (
  <div css={styles.container}>
    <section css={styles.heroSection}>
      <div css={styles.mascotContainer}>
        <img 
          src="/assets/1216BartMascotNoBkg/1216BartMascotNoBkg.png" 
          alt="Bartleby Mascot"
          css={styles.heroMascot}
        />
      </div>
      
      <h1 css={styles.heroTitle}>Welcome to Bartleby</h1>
      <p css={styles.heroSubtitle}>Your AI-Powered Document & Inventory Assistant</p>
      
      <div css={styles.heroActions}>
        {/* If not logged in, show login button, otherwise show dashboard */}
        {!user ? (
          <Link to="/login" css={styles.primaryButton}>Get Started</Link>
        ) : (
          <Link to="/dashboard" css={styles.primaryButton}>Go to Dashboard</Link>
        )}
        <Link to="/about" css={styles.secondaryButton}>Learn More</Link>
      </div>
    </section>

    <section css={styles.featuresSection}>
      <h2 css={styles.sectionTitle}>Intelligent Processing</h2>
      
      <div css={styles.featureCards}>
        <div css={styles.featureCard}>
          <div css={css`${styles.featureIcon}; background-image: url('/assets/icons/document.svg');`}></div>
          <h3>Smart Document Analysis</h3>
          <p>Upload documents and let our AI extract key information, summaries, and insights automatically.</p>
        </div>

        <div css={styles.featureCard}>
          <div css={css`${styles.featureIcon}; background-image: url('/assets/icons/inventory.svg');`}></div>
          <h3>Inventory Management</h3>
          <p>Organize and track your inventory with AI-powered categorization and detailed analytics.</p>
        </div>

        <div css={styles.featureCard}>
          <div css={css`${styles.featureIcon}; background-image: url('/assets/icons/export.svg');`}></div>
          <h3>Easy Export</h3>
          <p>Export your organized data in multiple formats for seamless integration with other tools.</p>
        </div>
    </div>
    </section>
    <section css={styles.workflowSection}>
      <h2 css={styles.sectionTitle}>How It Works</h2>
      <div css={styles.workflowSteps}>
        <div css={styles.workflowStep}>
          <div css={styles.stepNumber}>1</div>
          <h3>Upload</h3>
          <p>Upload your documents or inventory images</p>
        </div>
        <div css={styles.workflowStep}>
          <div css={styles.stepNumber}>2</div>
          <h3>Process</h3>
          <p>Our AI analyzes and organizes your content</p>
        </div>
        <div css={styles.workflowStep}>
          <div css={styles.stepNumber}>3</div>
          <h3>Organize</h3>
          <p>View and manage your organized data</p>
        </div>
        <div css={styles.workflowStep}>
          <div css={styles.stepNumber}>4</div>
          <h3>Export</h3>
          <p>Export your data in your preferred format</p>
        </div>
      </div>
    </section>
    <section css={styles.ctaSection}>
      <h2 css={styles.ctaTitle}>Ready to Get Started?</h2>
        <p css={styles.ctaText}>Join thousands of users who are already experiencing the power of AI-assisted organization.</p>
        <Link to={user ? "/process" : "/login"} css={styles.ctaButton}>
          Start Processing Today
        </Link>
    </section>
    <section css={styles.contentWrapper}>
      <div css={styles.rightPanel}>
        <div css={styles.authPanel}>
          <h2 css={styles.authTitle}>Welcome</h2>=
          {error && (
            <div css={styles.errorMessage} onClick={clearError}>
              {error}
            </div>
          )}
          <div css={styles.googleButton}>
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
          
          <div css={styles.divider}>
            <span css={styles.dividerLine}></span>
            <span css={styles.dividerText}>or</span>
            <span css={styles.dividerLine}></span>
          </div>
          
          <form css={styles.loginForm} onSubmit={handleEmailLogin}>
            <div css={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                css={styles.input}
                required
              />
            </div>
            
            <div css={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                css={styles.input}
                required
              />
            </div>
            
            <button 
              type="submit" 
              css={isLoading ? [styles.loginButton, styles.loading] : styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div css={styles.registerLink}>
             <p>
                Don't have an account? <a href="/register">Create Account</a>
            </p>
            </div>
          </div>
       </div>
      </section>
      <section css={styles.ctaSection}>
        <h2 css={styles.ctaTitle}>Ready to Get Started?</h2>
        <p css={styles.ctaText}>Join thousands of users who are already experiencing the power of AI-assisted organization.</p>
        <Link to="/login" css={styles.ctaButton}>Start Processing Today</Link>
      </section>
    </div>
  );
};

const styles = {
  container: css`
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    background: linear-gradient(135deg, #1A1A1A 0%, #2C1F3E 100%);
    overflow: hidden;
  `,

  heroSection: css`
    width: 100%;
    max-width: 900px;
    margin: 0 auto 3rem auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: 2rem;
    padding-bottom: 2rem;
  `,

  mascotContainer: css`
    margin-bottom: 1.5rem;
  `,

  heroMascot: css`
    width: 120px;
    height: auto;
    border-radius: 50%;
    box-shadow: 0 4px 24px rgba(64, 224, 208, 0.15);
    background: #fff;
  `,

  heroTitle: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 3rem;
    font-weight: 700;
    color: #D4AF37;
    margin-bottom: 0.5rem;
  `,

  heroSubtitle: css`
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    color: #F5F2E9;
    margin-bottom: 2rem;
  `,

  heroActions: css`
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  `,

  primaryButton: css`
    background: linear-gradient(135deg, #40E0D0 0%, #1A9485 100%);
    color: #fff;
    font-weight: 600;
    padding: 0.8rem 2rem;
    border-radius: 8px;
    border: none;
    text-decoration: none;
    font-size: 1rem;
    transition: background 0.3s;
    &:hover {
      background: linear-gradient(135deg, #1A9485 0%, #40E0D0 100%);
    }
  `,

  secondaryButton: css`
    background: transparent;
    color: #40E0D0;
    font-weight: 600;
    padding: 0.8rem 2rem;
    border-radius: 8px;
    border: 1px solid #40E0D0;
    text-decoration: none;
    font-size: 1rem;
    transition: background 0.3s, color 0.3s;
    &:hover {
      background: #40E0D0;
      color: #fff;
    }
  `,

  featuresSection: css`
    width: 100%;
    max-width: 1100px;
    margin: 0 auto 3rem auto;
    padding: 2rem 0;
    text-align: center;
  `,

  sectionTitle: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 2rem;
    color: #D4AF37;
    margin-bottom: 2rem;
  `,

  featureCards: css`
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  `,

  featureCard: css`
    background: rgba(26, 26, 26, 0.7);
    border-radius: 15px;
    padding: 2rem 1.5rem;
    min-width: 220px;
    max-width: 320px;
    flex: 1 1 220px;
    box-shadow: 0 4px 24px rgba(64, 224, 208, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
  `,

  workflowSection: css`
    width: 100%;
    max-width: 1100px;
    margin: 0 auto 3rem auto;
    padding: 2rem 0;
    text-align: center;
  `,

  workflowSteps: css`
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 2rem;
  `,

  workflowStep: css`
    background: rgba(26, 26, 26, 0.7);
    border-radius: 15px;
    padding: 1.5rem 1rem;
    min-width: 160px;
    max-width: 200px;
    flex: 1 1 160px;
    box-shadow: 0 4px 24px rgba(64, 224, 208, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
  `,

  stepNumber: css`
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #40E0D0 0%, #1A9485 100%);
    color: #fff;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  `,

  ctaSection: css`
    width: 100%;
    max-width: 900px;
    margin: 0 auto 2rem auto;
    padding: 2rem 0;
    text-align: center;
  `,

  ctaTitle: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 2rem;
    color: #D4AF37;
    margin-bottom: 1rem;
  `,

  ctaText: css`
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    color: #F5F2E9;
    margin-bottom: 2rem;
  `,

  ctaButton: css`
    background: linear-gradient(135deg, #40E0D0 0%, #1A9485 100%);
    color: #fff;
    font-weight: 600;
    padding: 0.8rem 2rem;
    border-radius: 8px;
    border: none;
    text-decoration: none;
    font-size: 1rem;
    transition: background 0.3s;
    &:hover {
      background: linear-gradient(135deg, #1A9485 0%, #40E0D0 100%);
    }
  `,

  // Decorative elements
  decorElement1: css`
    position: absolute
    top: -150px;
    right: -150px;
    width: 450px;
    height: 450px;
    border-radius: 50%;
    background: radial-gradient(circle at 60% 40%, #40E0D0 0%, transparent 70%);
    opacity: 0.3;
    filter: blur(40px);
    animation: float 8s ease-in-out infinite;
  `,
  
  decorElement2: css`
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 60%, #FF00FF 0%, transparent 70%);
    opacity: 0.2;
    filter: blur(50px);
    animation: float 10s ease-in-out infinite alternate;
  `,
  
  decorElement3: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 900px;
    height: 900px;
    border-radius: 50%;
    border: 2px solid rgba(212, 175, 55, 0.05);
    box-shadow: 0 0 80px rgba(0, 255, 255, 0.1);
    z-index: 0;
    animation: rotate 120s linear infinite;
  `,
  
  contentWrapper: css`
    display: flex;
    width: 100%;
    max-width: 1400px;
    height: 85vh;
    max-height: 900px;
    z-index: 1;
    perspective: 1000px;
    
    @media (max-width: 1024px) {
      flex-direction: column;
      height: auto;
    }
  `,
  
  leftPanel: css`
    flex: 1.5;
    padding: 4rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    @media (max-width: 1024px) {
      padding: 2rem;
      text-align: center;
    }
  `,
  
  mainTitle: css`
    position: relative;
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
  `,
  
  titleTop: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 4.5rem;
    font-weight: 700;
    color: transparent;
    background: linear-gradient(45deg, #D4AF37 30%, #FFF5D4 50%, #D4AF37 70%);
    background-clip: text;
    -webkit-background-clip: text;
    filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
    transform: perspective(500px) rotateX(15deg);
    transform-origin: bottom;
  `,
  
  titleBottom: css`
    position: relative;
    font-family: 'Poiret One', cursive;
    font-size: 3.5rem;
    color: #40E0D0;
    text-shadow: 
      0 0 10px rgba(64, 224, 208, 0.7),
      0 0 20px rgba(64, 224, 208, 0.5);
    margin-top: -0.5rem;
    transform: perspective(500px) rotateX(5deg);
    transform-origin: top;
  `,
  
  tagline: css`
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-style: italic;
    color: #F5F2E9;
    margin-bottom: 3rem;
    max-width: 500px;
    
    @media (max-width: 1024px) {
      margin-left: auto;
      margin-right: auto;
    }
  `,
  
  featureList: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `,
  
  feature: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateX(10px);
    }
  `,
  
  featureIcon: css`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #40E0D0 0%, #0A4B40 100%);
    box-shadow: 0 0 15px rgba(64, 224, 208, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  
  featureText: css`
    h3 {
      font-family: 'Josefin Sans', sans-serif;
      font-size: 1.2rem;
      font-weight: 600;
      color: #D4AF37;
      margin: 0 0 0.3rem 0;
    }
    
    p {
      font-family: 'Josefin Sans', sans-serif;
      font-size: 1rem;
      color: #F5F2E9;
      margin: 0;
    }
  `,
  
  rightPanel: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    transform-style: preserve-3d;
    
    @media (max-width: 1024px) {
      margin-top: 2rem;
    }
  `,
  
  authPanel: css`
    width: 100%;
    max-width: 440px;
    background: rgba(26, 26, 26, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 2.5rem;
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(212, 175, 55, 0.3),
      0 0 30px rgba(255, 0, 255, 0.2),
      0 0 30px rgba(0, 255, 255, 0.2);
    animation: elevate 3s ease-in-out infinite alternate;
    transform: perspective(1000px) rotateY(-5deg);
  `,
  
  authTitle: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 2rem;
    text-align: center;
// Keyframes are defined in global CSS; remove unused variable.
    font-family: 'Josefin Sans', sans-serif;
    font-size: 0.9rem;
  `,
  
  loginForm: css`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    width: 100%;
  `,
  
  inputGroup: css`
    position: relative;
    width: 100%;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #40E0D0, #924747);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }
    
    &:focus-within::after {
      transform: scaleX(1);
    }
  `,
  
  input: css`
    width: 100%;
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(64, 224, 208, 0.3);
    border-radius: 8px;
    color: #F5F2E9;
    font-family: 'Josefin Sans', sans-serif;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 10px rgba(64, 224, 208, 0.2);
    }
    
    &::placeholder {
      color: rgba(245, 242, 233, 0.5);
    }
  `,
  
  loginButton: css`
    padding: 0.9rem;
    background: linear-gradient(135deg, #1A9485 0%, #0A4B40 100%);
    border: none;
    border-radius: 8px;
    color: #F5F2E9;
    font-family: 'Josefin Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    margin-top: 0.5rem;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      transform: rotate(45deg);
      animation: shimmer 3s infinite;
    }
    
    &:hover {
      background: linear-gradient(135deg, #40E0D0 0%, #1A9485 100%);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(10, 75, 64, 0.3);
    }
    
    &:active {
      transform: translateY(1px);
      box-shadow: 0 5px 10px rgba(10, 75, 64, 0.3);
    }
  `,
  
  loading: css`
    opacity: 0.7;
    cursor: wait;
    &:hover {
      transform: none;
    }
  `,
  
  registerLink: css`
    margin-top: 1.5rem;
    text-align: center;
    
    p {
      color: #F5F2E9;
      font-family: 'Josefin Sans', sans-serif;
      font-size: 0.9rem;
      margin: 0;
    }
    
    a {
      color: #40E0D0;
      text-decoration: none;
      border-bottom: 1px dashed #40E0D0;
      transition: color 0.3s ease, border-color 0.3s ease;
      
      &:hover {
        color: #D4AF37;
        border-color: #D4AF37;
      }
    }
  `,
  
  testimonial: css`
    background: rgba(26, 26, 26, 0.4);
    backdrop-filter: blur(5px);
    border-radius: 10px;
    padding: 1.5rem;
    border-left: 3px solid #D4AF37;
    max-width: 440px;
    transform: perspective(1000px) rotateY(-5deg) translateZ(-20px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    
    p {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 1.1rem;
      color: #F5F2E9;
      margin: 0 0 0.5rem 0;
    }
    
    cite {
      font-family: 'Josefin Sans', sans-serif;
      font-size: 0.9rem;
      color: #D4AF37;
      font-style: normal;
    }
  `
};

// Add these keyframes to your CSS or global styles
const globalStyles = css`
  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0);
    }
  }
  
  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) rotate(45deg);
    }
  }
  
  @keyframes elevate {
    0% {
      transform: perspective(1000px) rotateY(-5deg) translateZ(0);
    }
    100% {
      transform: perspective(1000px) rotateY(-5deg) translateZ(10px);
    }
  }
`;

export default LandingPage;