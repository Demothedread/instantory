import { css } from '@emotion/react';
import { GoogleLogin } from '@react-oauth/google';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';
import { colors } from '../styles/theme/colors';

// Import mascot images
import quarterMascot from '../assets/1216BartMascotNoBkg/1216BartMascotNoBkgQuarter.png';
import neonBartleby from '../assets/1216BartMascotNoBkg/NeonBartlebeby.png';
import bartlebyMascot from '../assets/AABartlebyMascot.png';

const HomePage = () => {
  const { loginWithGoogle, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      setIsLoading(true);
      try {
        await loginWithGoogle(credentialResponse.credential);
        navigate('/workspace');
      } catch (error) {
        console.error('Login failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExploreClick = () => {
    setShowDetails(true);
  };

  // If user is already logged in, redirect to workspace
  if (user) {
    navigate('/workspace');
    return null;
  }

  return (
    <div css={styles.container}>
      {/* Animated background elements */}
      <div css={styles.bgDecor1} />
      <div css={styles.bgDecor2} />
      <div css={styles.bgDecor3} />
      
      {/* Hero Section */}
      <section css={styles.heroSection}>
        <div css={styles.mascotContainer}>
          <img 
            src={neonBartleby} 
            alt="Bartleby Mascot"
            css={styles.mainMascot}
          />
          <div css={styles.mascotGlow} />
        </div>
        
        <div css={styles.heroContent}>
          <h1 css={styles.title}>
            <span css={styles.titleMain}>Bartleby</span>
            <span css={styles.titleSub}>The Scrivener</span>
          </h1>
          
          <p css={styles.tagline}>
            AI-Powered Document Intelligence & Knowledge Management
          </p>
          
          <div css={styles.featureHints}>
            <div css={styles.hint}>
              <span css={styles.hintIcon}>📄</span>
              <span>Smart Document Analysis</span>
            </div>
            <div css={styles.hint}>
              <span css={styles.hintIcon}>🧠</span>
              <span>Knowledge Graphs</span>
            </div>
            <div css={styles.hint}>
              <span css={styles.hintIcon}>🔍</span>
              <span>Semantic Search</span>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section css={styles.loginSection}>
        <div css={styles.loginCard}>
          <div css={styles.loginHeader}>
            <img 
              src={quarterMascot} 
              alt="Welcome" 
              css={styles.welcomeMascot}
            />
            <h2 css={styles.loginTitle}>Enter the Archive</h2>
            <p css={styles.loginSubtitle}>
              Begin your journey into intelligent document management
            </p>
          </div>
          
          <div css={styles.loginContent}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => console.log('Login Failed')}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
            
            {isLoading && (
              <div css={styles.loadingIndicator}>
                <div css={styles.spinner} />
                <span>Authenticating...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Intrigue Section */}
      <section css={styles.intrigueSection}>
        <div css={styles.intrigueContent}>
          <div css={styles.mysteryBox} onClick={handleExploreClick}>
            <img 
              src={bartlebyMascot} 
              alt="Explore" 
              css={styles.exploreMascot}
            />
            <div css={styles.mysteryText}>
              <h3>What lies behind the veil?</h3>
              <p>Click to unveil the mysteries of Bartleby's capabilities...</p>
              <div css={styles.clickPrompt}>
                <span css={styles.clickIcon}>👁️</span>
                <span>Peek behind the curtain</span>
              </div>
            </div>
          </div>
          
          {showDetails && (
            <div css={styles.detailsReveal}>
              <div css={styles.capabilityGrid}>
                <div css={styles.capability}>
                  <div css={styles.capabilityIcon}>🎭</div>
                  <h4>Three-Partition Mastery</h4>
                  <p>Rolodex views, processing zones, and dynamic results tables</p>
                </div>
                <div css={styles.capability}>
                  <div css={styles.capabilityIcon}>⚡</div>
                  <h4>Lightning Intelligence</h4>
                  <p>AI-powered extraction, summarization, and classification</p>
                </div>
                <div css={styles.capability}>
                  <div css={styles.capabilityIcon}>🌐</div>
                  <h4>Infinite Connections</h4>
                  <p>Knowledge graphs that reveal hidden relationships</p>
                </div>
                <div css={styles.capability}>
                  <div css={styles.capabilityIcon}>🎨</div>
                  <h4>Neo-Deco Elegance</h4>
                  <p>Where Art Deco geometry meets Rococo extravagance</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer css={styles.footer}>
        <div css={styles.footerContent}>
          <p css={styles.footerText}>
            "I would prefer not to..." — Bartleby, but this AI prefers to help.
          </p>
          <div css={styles.footerLinks}>
            <Link to="/about" css={styles.footerLink}>About</Link>
            <Link to="/resources" css={styles.footerLink}>Resources</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: css`
    min-height: 100vh;
    background: ${colors.background};
    position: relative;
    overflow-x: hidden;
    color: ${colors.textLight};
  `,

  // Animated background decorations
  bgDecor1: css`
    position: fixed;
    top: -10%;
    right: -10%;
    width: 30vw;
    height: 30vw;
    background: radial-gradient(
      circle,
      ${colors.neonTeal}20 0%,
      ${colors.neonGold}10 50%,
      transparent 70%
    );
    border-radius: 50%;
    animation: float 20s ease-in-out infinite;
    z-index: 0;
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(-20px, -20px) rotate(120deg); }
      66% { transform: translate(20px, -10px) rotate(240deg); }
    }
  `,

  bgDecor2: css`
    position: fixed;
    bottom: -5%;
    left: -5%;
    width: 25vw;
    height: 25vw;
    background: linear-gradient(
      45deg,
      ${colors.neonGold}15 0%,
      ${colors.metalSilver}10 50%,
      transparent 70%
    );
    border-radius: 50%;
    animation: float 25s ease-in-out infinite reverse;
    z-index: 0;
  `,

  bgDecor3: css`
    position: fixed;
    top: 50%;
    left: 50%;
    width: 15vw;
    height: 15vw;
    background: radial-gradient(
      circle,
      ${colors.metalCopper}20 0%,
      transparent 60%
    );
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 15s ease-in-out infinite;
    z-index: 0;
    
    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.1; }
    }
  `,

  // Hero Section
  heroSection: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    padding: ${layout.spacing.xl};
    position: relative;
    z-index: 1;
    text-align: center;
    
    ${layout.media.mobile} {
      min-height: 70vh;
      padding: ${layout.spacing.lg};
    }
  `,

  mascotContainer: css`
    position: relative;
    margin-bottom: ${layout.spacing.xl};
  `,

  mainMascot: css`
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 0 20px ${colors.neonTeal}40);
    animation: mascotFloat 6s ease-in-out infinite;
    position: relative;
    z-index: 2;
    
    @keyframes mascotFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    ${layout.media.mobile} {
      width: 150px;
      height: 150px;
    }
  `,

  mascotGlow: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    background: radial-gradient(
      circle,
      ${colors.neonTeal}30 0%,
      ${colors.neonGold}20 40%,
      transparent 70%
    );
    border-radius: 50%;
    animation: glow 4s ease-in-out infinite alternate;
    z-index: 1;
    
    @keyframes glow {
      0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
    }
  `,

  heroContent: css`
    max-width: 800px;
    z-index: 2;
  `,

  title: css`
    font-family: "Cinzel Decorative", serif;
    margin-bottom: ${layout.spacing.lg};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  titleMain: css`
    font-size: 4rem;
    font-weight: 700;
    background: linear-gradient(
      135deg,
      ${colors.neonTeal} 0%,
      ${colors.neonGold} 50%,
      ${colors.metalSilver} 100%
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px ${colors.neonTeal}40;
    
    ${layout.media.mobile} {
      font-size: 2.5rem;
    }
  `,

  titleSub: css`
    font-size: 1.5rem;
    font-weight: 400;
    color: ${colors.textMuted};
    font-style: italic;
    
    ${layout.media.mobile} {
      font-size: 1.2rem;
    }
  `,

  tagline: css`
    font-size: 1.25rem;
    color: ${colors.textLight};
    margin-bottom: ${layout.spacing.xl};
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
    
    ${layout.media.mobile} {
      font-size: 1rem;
    }
  `,

  featureHints: css`
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.xl};
    
    ${layout.media.mobile} {
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  hint: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    background: ${colors.surface}40;
    border: 1px solid ${colors.border}40;
    border-radius: ${layout.borderRadius.lg};
    backdrop-filter: blur(10px);
    font-size: 0.9rem;
    color: ${colors.textLight};
    
    &:hover {
      background: ${colors.surface}60;
      border-color: ${colors.neonTeal}40;
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }
  `,

  hintIcon: css`
    font-size: 1.2rem;
  `,

  // Login Section
  loginSection: css`
    display: flex;
    justify-content: center;
    padding: ${layout.spacing.xl};
    position: relative;
    z-index: 1;
  `,

  loginCard: css`
    ${neoDecorocoBase.card};
    max-width: 400px;
    width: 100%;
    background: ${colors.surface}90;
    backdrop-filter: blur(20px);
    border: 2px solid ${colors.border};
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 40px ${colors.neonTeal}20,
      inset 0 1px 0 ${colors.metalSilver}30;
    
    &:hover {
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.4),
        0 0 60px ${colors.neonTeal}30,
        inset 0 1px 0 ${colors.metalSilver}40;
      transform: translateY(-5px);
      transition: all 0.4s ease;
    }
  `,

  loginHeader: css`
    text-align: center;
    margin-bottom: ${layout.spacing.lg};
  `,

  welcomeMascot: css`
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-bottom: ${layout.spacing.md};
    filter: drop-shadow(0 0 10px ${colors.neonGold}40);
  `,

  loginTitle: css`
    font-family: "Cinzel Decorative", serif;
    font-size: 1.5rem;
    color: ${colors.neonTeal};
    margin-bottom: ${layout.spacing.sm};
  `,

  loginSubtitle: css`
    color: ${colors.textMuted};
    font-size: 0.9rem;
    line-height: 1.4;
  `,

  loginContent: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.md};
  `,

  loadingIndicator: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    color: ${colors.textMuted};
    font-size: 0.9rem;
  `,

  spinner: css`
    width: 16px;
    height: 16px;
    border: 2px solid ${colors.border};
    border-top: 2px solid ${colors.neonTeal};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,

  // Intrigue Section
  intrigueSection: css`
    padding: ${layout.spacing.xl};
    position: relative;
    z-index: 1;
  `,

  intrigueContent: css`
    max-width: 1200px;
    margin: 0 auto;
  `,

  mysteryBox: css`
    ${neoDecorocoBase.card};
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.lg};
    background: ${colors.surface}60;
    border: 2px solid ${colors.border}60;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: ${colors.surface}80;
      border-color: ${colors.neonGold}60;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transform: translateY(-3px);
    }
    
    ${layout.media.mobile} {
      flex-direction: column;
      text-align: center;
    }
  `,

  exploreMascot: css`
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(0 0 15px ${colors.neonGold}40);
    
    ${layout.media.mobile} {
      width: 100px;
      height: 100px;
    }
  `,

  mysteryText: css`
    flex: 1;
    
    h3 {
      font-family: "Cinzel Decorative", serif;
      font-size: 1.5rem;
      color: ${colors.neonGold};
      margin-bottom: ${layout.spacing.sm};
    }
    
    p {
      color: ${colors.textMuted};
      margin-bottom: ${layout.spacing.md};
      line-height: 1.5;
    }
  `,

  clickPrompt: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    color: ${colors.textLight};
    font-size: 0.9rem;
    
    ${layout.media.mobile} {
      justify-content: center;
    }
  `,

  clickIcon: css`
    animation: blink 2s ease-in-out infinite;
    
    @keyframes blink {
      0%, 50%, 100% { opacity: 1; }
      25%, 75% { opacity: 0.3; }
    }
  `,

  detailsReveal: css`
    margin-top: ${layout.spacing.xl};
    animation: slideIn 0.5s ease-out;
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  capabilityGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${layout.spacing.lg};
  `,

  capability: css`
    ${neoDecorocoBase.card};
    padding: ${layout.spacing.lg};
    text-align: center;
    background: ${colors.surface}40;
    border: 1px solid ${colors.border}40;
    
    &:hover {
      background: ${colors.surface}60;
      border-color: ${colors.neonTeal}40;
      transform: translateY(-2px);
      transition: all 0.3s ease;
    }
  `,

  capabilityIcon: css`
    font-size: 2rem;
    margin-bottom: ${layout.spacing.md};
  `,

  // Footer
  footer: css`
    padding: ${layout.spacing.xl};
    border-top: 1px solid ${colors.border}40;
    position: relative;
    z-index: 1;
  `,

  footerContent: css`
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  `,

  footerText: css`
    color: ${colors.textMuted};
    font-style: italic;
    margin-bottom: ${layout.spacing.md};
    font-size: 0.9rem;
  `,

  footerLinks: css`
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.lg};
  `,

  footerLink: css`
    color: ${colors.textLight};
    text-decoration: none;
    font-size: 0.9rem;
    
    &:hover {
      color: ${colors.neonTeal};
      transition: color 0.2s ease;
    }
  `,
};

export default HomePage;
