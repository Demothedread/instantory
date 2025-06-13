import { css } from '@emotion/react';
import { GoogleLogin } from '@react-oauth/google';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import { colors } from '../styles/theme/colors';

const OptimizedLandingPage = () => {
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
      {/* Subtle decorative background elements */}
      <div css={styles.bgDecor1} />
      <div css={styles.bgDecor2} />
      
      <main css={styles.mainContent}>
        {/* Hero Section */}
        <section css={styles.heroSection}>
          <div css={styles.mascotContainer}>
            <img 
              src="/assets/1216BartMascotNoBkg/1216BartMascotNoBkg.png" 
              alt="Bartleby Mascot"
              css={styles.mascot}
            />
          </div>
          
          <h1 css={styles.title}>
            <span css={styles.titleMain}>Bartleby</span>
            <span css={styles.titleSub}>AI Document Assistant</span>
          </h1>
          
          <p css={styles.subtitle}>
            Transform documents and inventory into organized, searchable intelligence
          </p>
          
          <div css={styles.heroActions}>
            <Link 
              to={user ? "/dashboard" : "#auth"} 
              css={[neoDecorocoBase.button, styles.primaryButton]}
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
            <Link to="/about" css={[neoDecorocoBase.button, styles.secondaryButton]}>
              Learn More
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section css={styles.featuresSection}>
          <h2 css={[neoDecorocoBase.heading, styles.sectionHeading]}>
            Core Capabilities
          </h2>
          
          <div css={styles.featureGrid}>
            <div css={[neoDecorocoBase.card, styles.featureCard]}>
              <div css={[styles.featureIcon, styles.iconDocument]} />
              <h3>Smart Analysis</h3>
              <p>AI-powered document processing with text extraction and summarization</p>
            </div>
            
            <div css={[neoDecorocoBase.card, styles.featureCard]}>
              <div css={[styles.featureIcon, styles.iconInventory]} />
              <h3>Inventory Control</h3>
              <p>Automated categorization and tracking with visual recognition</p>
            </div>
            
            <div css={[neoDecorocoBase.card, styles.featureCard]}>
              <div css={[styles.featureIcon, styles.iconSearch]} />
              <h3>Vector Search</h3>
              <p>Find relevant content instantly with semantic search technology</p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section css={styles.processSection}>
          <h2 css={[neoDecorocoBase.heading, styles.sectionHeading]}>
            Simple Workflow
          </h2>
          
          <div css={styles.processFlow}>
            {[
              { num: "1", title: "Upload", desc: "Add your documents or images" },
              { num: "2", title: "Process", desc: "AI analyzes and extracts data" },
              { num: "3", title: "Organize", desc: "Review structured results" },
              { num: "4", title: "Export", desc: "Download in preferred format" }
            ].map((step, index) => (
              <div key={index} css={styles.processStep}>
                <div css={styles.stepNumber}>{step.num}</div>
                <h3 css={styles.stepTitle}>{step.title}</h3>
                <p css={styles.stepDesc}>{step.desc}</p>
                {index < 3 && <div css={styles.stepArrow} />}
              </div>
            ))}
          </div>
        </section>

        {/* Auth Section */}
        <section id="auth" css={styles.authSection}>
          <div css={[neoDecorocoBase.panel, styles.authPanel]}>
            <h2 css={styles.authTitle}>
              {user ? "Welcome back!" : "Join Bartleby"}
            </h2>
            
            {user ? (
              <div css={styles.userSection}>
                <p css={styles.welcomeMessage}>Ready to process some documents?</p>
                <Link to="/process" css={[neoDecorocoBase.button, styles.dashboardButton]}>
                  Start Processing
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div css={styles.errorMessage} onClick={clearError}>
                    {error}
                  </div>
                )}
                
                <div css={styles.googleAuth}>
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
                  <span css={styles.dividerText}>or sign in with email</span>
                </div>
                
                <form css={styles.authForm} onSubmit={handleEmailLogin}>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    css={[neoDecorocoBase.input, styles.authInput]}
                    required
                  />
                  
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    css={[neoDecorocoBase.input, styles.authInput]}
                    required
                  />
                  
                  <button 
                    type="submit" 
                    css={[neoDecorocoBase.button, styles.authButton]}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
                
                <p css={styles.registerText}>
                  Don't have an account? <Link to="/register" css={styles.registerLink}>Create one</Link>
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: css`
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    position: relative;
    overflow-x: hidden;
  `,

  // Subtle background decorations - minimal performance impact
  bgDecor1: css`
    position: fixed;
    top: -20%;
    right: -10%;
    width: 40%;
    height: 40%;
    background: radial-gradient(circle, ${colors.neonTeal}15 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  `,

  bgDecor2: css`
    position: fixed;
    bottom: -15%;
    left: -5%;
    width: 30%;
    height: 30%;
    background: radial-gradient(circle, ${colors.neonGold}10 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  `,

  mainContent: css`
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;

    @media (max-width: 768px) {
      padding: 1rem 0.5rem;
    }
  `,

  // Hero Section
  heroSection: css`
    text-align: center;
    padding: 3rem 0;
    margin-bottom: 4rem;

    @media (max-width: 768px) {
      padding: 2rem 0;
      margin-bottom: 2rem;
    }
  `,

  mascotContainer: css`
    margin-bottom: 2rem;
  `,

  mascot: css`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: white;
    padding: 0.5rem;
    box-shadow: 0 4px 20px ${colors.neonTeal}40;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  `,

  title: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
  `,

  titleMain: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 3.5rem;
    font-weight: 700;
    color: ${colors.neonGold};
    text-shadow: 0 0 20px ${colors.neonGold}60;
    margin-bottom: 0.5rem;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  `,

  titleSub: css`
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 400;
    color: ${colors.neonTeal};
    letter-spacing: 0.1em;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  `,

  subtitle: css`
    font-size: 1.25rem;
    color: ${colors.textLight};
    max-width: 600px;
    margin: 0 auto 2rem auto;
    line-height: 1.6;
    opacity: 0.9;

    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
  `,

  heroActions: css`
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  `,

  primaryButton: css`
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.primary});
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonTeal}40;
    }
  `,

  secondaryButton: css`
    background: transparent;
    border: 1px solid ${colors.neonTeal};
    color: ${colors.neonTeal};

    &:hover {
      background: ${colors.neonTeal};
      color: white;
      transform: translateY(-2px);
    }
  `,

  // Features Section
  featuresSection: css`
    margin-bottom: 4rem;
    text-align: center;
  `,

  sectionHeading: css`
    text-align: center;
    margin-bottom: 3rem;
    color: ${colors.neonGold};
  `,

  featureGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  `,

  featureCard: css`
    text-align: center;
    padding: 2rem 1.5rem;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    h3 {
      color: ${colors.neonTeal};
      margin: 1rem 0 0.5rem 0;
      font-size: 1.25rem;
    }

    p {
      color: ${colors.textLight};
      opacity: 0.8;
      line-height: 1.5;
    }
  `,

  featureIcon: css`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem auto;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 12px;
      background: linear-gradient(135deg, ${colors.neonTeal}20, ${colors.neonGold}20);
      border: 1px solid ${colors.neonTeal}40;
    }
  `,

  iconDocument: css`
    &::after {
      content: '📄';
      font-size: 2rem;
      position: relative;
      z-index: 1;
    }
  `,

  iconInventory: css`
    &::after {
      content: '📦';
      font-size: 2rem;
      position: relative;
      z-index: 1;
    }
  `,

  iconSearch: css`
    &::after {
      content: '🔍';
      font-size: 2rem;
      position: relative;
      z-index: 1;
    }
  `,

  // Process Section
  processSection: css`
    margin-bottom: 4rem;
    text-align: center;
  `,

  processFlow: css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 2rem;
    }
  `,

  processStep: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 150px;
    position: relative;
  `,

  stepNumber: css`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.primary});
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1rem;
    box-shadow: 0 4px 15px ${colors.neonTeal}40;
  `,

  stepTitle: css`
    color: ${colors.neonGold};
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  `,

  stepDesc: css`
    color: ${colors.textLight};
    opacity: 0.8;
    font-size: 0.9rem;
    margin: 0;
  `,

  stepArrow: css`
    position: absolute;
    top: 25px;
    left: 100%;
    width: 30px;
    height: 2px;
    background: ${colors.neonTeal};

    &::after {
      content: '';
      position: absolute;
      right: -5px;>\
      
      top: -3px;
      width: 8px;
      height: 8px;
      border-right: 2px solid ${colors.neonTeal};
      border-top: 2px solid ${colors.neonTeal};
      transform: rotate(45deg);
    }

    @media (max-width: 768px) {
      display: none;
    }
  `,

  // Auth Section
  authSection: css`
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  `,

  authPanel: css`
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    text-align: center;
  `,

  authTitle: css`
    color: ${colors.neonGold};
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  `,

  userSection: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,

  welcomeMessage: css`
    color: ${colors.textLight};
    margin-bottom: 1rem;
  `,

  dashboardButton: css`
    background: linear-gradient(135deg, ${colors.neonGold}, #DAA520);
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonGold}40;
    }
  `,

  errorMessage: css`
    background: rgba(255, 82, 82, 0.1);
    border: 1px solid rgba(255, 82, 82, 0.3);
    color: #ff5252;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    cursor: pointer;
    font-size: 0.9rem;
  `,

  googleAuth: css`
    margin-bottom: 1rem;
  `,

  divider: css`
    margin: 1.5rem 0;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: ${colors.border};
    }
  `,

  dividerText: css`
    background: ${colors.darkGradient};
    padding: 0 1rem;
    color: ${colors.textLight};
    opacity: 0.7;
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
  `,

  authForm: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  `,

  authInput: css`
    margin-bottom: 0;
  `,

  authButton: css`
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.primary});
    border: none;
    margin-top: 0.5rem;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${colors.neonTeal}40;
    }

    &:disabled {
      opacity: 0.6;
      transform: none;
      cursor: not-allowed;
    }
  `,

  registerText: css`
    color: ${colors.textLight};
    font-size: 0.9rem;
    margin: 0;
  `,

  registerLink: css`
    color: ${colors.neonTeal};
    text-decoration: none;

    &:hover {
      color: ${colors.neonGold};
      text-decoration: underline;
    }
  `
};

export default OptimizedLandingPage;

