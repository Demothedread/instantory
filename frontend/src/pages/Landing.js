import { css } from '@emotion/react';
import { GoogleLogin } from '@react-oauth/google';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/index';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import { colors } from '../styles/theme/colors';

/**
 * Enhanced Landing Page Component
 * Component Genealogy: Portal -> Business Card -> Digital Storefront -> Data Gateway
 * Subverts traditional marketing hierarchy by presenting the landing as a portal to organized intelligence
 * Neo-Deco-Rococo: Art-Deco geometry meets Rococo exuberance with metallic neon accents
 */
const OptimizedLandingPage = () => {
  const { loginWithGoogle, login, error, clearError, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Rotate featured capabilities every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Neo-Deco-Rococo Background Architecture */}
      <div css={styles.backgroundCanvas}>
        {/* Art-Deco geometric patterns */}
        <div css={styles.geometricLayer}>
          <div css={styles.artDecoShape1} />
          <div css={styles.artDecoShape2} />
          <div css={styles.artDecoShape3} />
        </div>
        
        {/* Rococo ornamental elements */}
        <div css={styles.ornamentalLayer}>
          <div css={styles.flourish1} />
          <div css={styles.flourish2} />
          <div css={styles.rocailleCurve} />
        </div>
        
        {/* Metallic neon grid overlay */}
        <div css={styles.neonGrid} />
      </div>

      <main css={styles.mainContent}>
        {/* Hero Portal Section */}
        <section css={styles.heroPortal}>
          {/* Ornate mascot presentation */}
          <div css={styles.mascotShrine}>
            <div css={styles.ornateFrame}>
              <img 
                src="/assets/1216BartMascotNoBkg/1216BartMascotNoBkg.png" 
                alt="Bartleby - Your AI Document Intelligence Assistant"
                css={styles.mascot}
              />
              {/* Rococo decorative corners */}
              <div css={[styles.frameCorner, styles.cornerTopLeft]} />
              <div css={[styles.frameCorner, styles.cornerTopRight]} />
              <div css={[styles.frameCorner, styles.cornerBottomLeft]} />
              <div css={[styles.frameCorner, styles.cornerBottomRight]} />
            </div>
            
            {/* Pulsing aura effect */}
            <div css={styles.mascotAura} />
          </div>
          
          {/* Typography with metallic depth */}
          <div css={styles.titleConstellation}>
            <h1 css={styles.title}>
              <span css={styles.titlePrimary}>BARTLEBY</span>
              <span css={styles.titleSecondary}>AI Document Intelligence</span>
            </h1>
            
            <p css={styles.heroSubtitle}>
              Transform documents and inventory into organized, searchable intelligence
              <br />
              <span css={styles.subtitleAccent}>
                One Click. Infinite Possibilities.
              </span>
            </p>
          </div>
          
          {/* Action Portal Buttons */}
          <div css={styles.actionPortals}>
            <Link 
              to={user ? "/home" : "#auth"} 
              css={[styles.portalButton, styles.primaryPortal]}
            >
              <span css={styles.buttonIcon}>⚡</span>
              <span css={styles.buttonText}>
                {user ? "Enter Intelligence Center" : "Begin Journey"}
              </span>
              <div css={styles.buttonGlow} />
            </Link>
            
            <Link 
              to="/about" 
              css={[styles.portalButton, styles.secondaryPortal]}
            >
              <span css={styles.buttonIcon}>🧠</span>
              <span css={styles.buttonText}>Explore Capabilities</span>
              <div css={styles.buttonGlow} />
            </Link>
          </div>
        </section>

        {/* Capability Matrix Section */}
        <section css={styles.capabilityMatrix}>
          <h2 css={styles.sectionTitle}>
            <span css={styles.titleGlyph}>⚙️</span>
            Intelligence Capabilities
          </h2>
          
          <div css={styles.matrixGrid}>
            <div css={[styles.capabilityCard, activeFeature === 0 && styles.cardActive]}>
              <div css={styles.cardHeader}>
                <div css={[styles.capabilityIcon, styles.iconDocument]}>📄</div>
                <h3 css={styles.cardTitle}>Document Analysis</h3>
              </div>
              <p css={styles.cardDescription}>
                AI-powered text extraction, summarization, and semantic analysis
                transforms unstructured documents into organized intelligence
              </p>
              <div css={styles.cardFooter}>
                <span css={styles.capability}>Text Extraction</span>
                <span css={styles.capability}>Summarization</span>
                <span css={styles.capability}>Classification</span>
              </div>
            </div>
            
            <div css={[styles.capabilityCard, activeFeature === 1 && styles.cardActive]}>
              <div css={styles.cardHeader}>
                <div css={[styles.capabilityIcon, styles.iconInventory]}>📦</div>
                <h3 css={styles.cardTitle}>Inventory Intelligence</h3>
              </div>
              <p css={styles.cardDescription}>
                Visual recognition and automated categorization creates 
                searchable catalogs from physical collections
              </p>
              <div css={styles.cardFooter}>
                <span css={styles.capability}>Visual Recognition</span>
                <span css={styles.capability}>Auto-Cataloging</span>
                <span css={styles.capability}>Smart Tagging</span>
              </div>
            </div>
            
            <div css={[styles.capabilityCard, activeFeature === 2 && styles.cardActive]}>
              <div css={styles.cardHeader}>
                <div css={[styles.capabilityIcon, styles.iconSearch]}>🔍</div>
                <h3 css={styles.cardTitle}>Vector Search</h3>
              </div>
              <p css={styles.cardDescription}>
                Semantic search technology finds relevant content through 
                meaning and context, not just keywords
              </p>
              <div css={styles.cardFooter}>
                <span css={styles.capability}>Semantic Search</span>
                <span css={styles.capability}>Relevance Scoring</span>
                <span css={styles.capability}>Context Matching</span>
              </div>
            </div>
          </div>
        </section>

        {/* Process Workflow Visualization */}
        <section css={styles.workflowSection}>
          <h2 css={styles.sectionTitle}>
            <span css={styles.titleGlyph}>🔄</span>
            Intelligence Workflow
          </h2>
          
          <div css={styles.workflowChain}>
            {[
              { step: "1", title: "Upload", desc: "Documents & Images", icon: "📤" },
              { step: "2", title: "Process", desc: "AI Analysis", icon: "⚙️" },
              { step: "3", title: "Organize", desc: "Smart Categories", icon: "🗂️" },
              { step: "4", title: "Search", desc: "Find Anything", icon: "🔍" },
              { step: "5", title: "Export", desc: "Structured Data", icon: "💾" }
            ].map((phase, index) => (
              <div key={index} css={styles.workflowPhase}>
                <div css={styles.phaseNumber}>{phase.step}</div>
                <div css={styles.phaseIcon}>{phase.icon}</div>
                <h3 css={styles.phaseTitle}>{phase.title}</h3>
                <p css={styles.phaseDescription}>{phase.desc}</p>
                {index < 4 && <div css={styles.phaseConnector} />}
              </div>
            ))}
          </div>
        </section>
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
        {/* Authentication Portal Section */}
        {!user && (
          <section id="auth" css={styles.authPortal}>
            <div css={styles.authContainer}>
              <div css={styles.authShrine}>
                <h2 css={styles.authTitle}>
                  <span css={styles.titleGlyph}>🔐</span>
                  Access Intelligence Portal
                </h2>
                
                {error && (
                  <div css={styles.errorAlert} onClick={clearError}>
                    <span css={styles.errorIcon}>⚠️</span>
                    {error}
                  </div>
                )}
                
                {/* Google OAuth Portal */}
                <div css={styles.oauthPortal}>
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.error('Google Authentication Failed')}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="continue_with"
                    width="100%"
                  />
                </div>
                
                {/* Ornamental Divider */}
                <div css={styles.authDivider}>
                  <div css={styles.dividerLine} />
                  <span css={styles.dividerText}>or access with credentials</span>
                  <div css={styles.dividerLine} />
                </div>
                
                {/* Email Authentication Form */}
                <form css={styles.authForm} onSubmit={handleEmailLogin}>
                  <div css={styles.inputGroup}>
                    <input
                      type="email"
                      placeholder="Intelligence Access Code (Email)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      css={styles.authInput}
                      required
                    />
                    <div css={styles.inputGlow} />
                  </div>
                  
                  <div css={styles.inputGroup}>
                    <input
                      type="password"
                      placeholder="Security Passphrase"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      css={styles.authInput}
                      required
                    />
                    <div css={styles.inputGlow} />
                  </div>
                  
                  <button 
                    type="submit" 
                    css={[styles.portalButton, styles.authSubmit]}
                    disabled={isLoading}
                  >
                    <span css={styles.buttonIcon}>
                      {isLoading ? '⏳' : '🚀'}
                    </span>
                    <span css={styles.buttonText}>
                      {isLoading ? 'Accessing Portal...' : 'Enter Intelligence Center'}
                    </span>
                    <div css={styles.buttonGlow} />
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

// Neo-Deco-Rococo Styling System
// Component Genealogy: Landing Page → Business Card → Digital Storefront → Data Gateway
const styles = {
  // Foundation - Container and Background Architecture
  container: css`
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    position: relative;
    overflow-x: hidden;
  `,

  // Background Canvas - Layered visual depth system
  backgroundCanvas: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  `,

  // Art-Deco Geometric Layer
  geometricLayer: css`
    position: absolute;
    inset: 0;
    opacity: 0.15;
  `,

  artDecoShape1: css`
    position: absolute;
    top: 10%;
    right: 15%;
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, ${colors.neonGold}20, ${colors.neonTeal}20);
    transform: rotate(45deg);
    border: 2px solid ${colors.neonGold}30;
  `,

  artDecoShape2: css`
    position: absolute;
    bottom: 20%;
    left: 10%;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, ${colors.neonTeal}20, ${colors.neonPurple}20);
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    border: 2px solid ${colors.neonTeal}30;
  `,

  artDecoShape3: css`
    position: absolute;
    top: 50%;
    left: 5%;
    width: 300px;
    height: 80px;
    background: linear-gradient(90deg, ${colors.neonPink}15, transparent);
    transform: skew(-15deg);
  `,

  // Rococo Ornamental Layer
  ornamentalLayer: css`
    position: absolute;
    inset: 0;
    opacity: 0.1;
  `,

  flourish1: css`
    position: absolute;
    top: 25%;
    right: 20%;
    width: 100px;
    height: 100px;
    border: 3px solid ${colors.neonGold}40;
    border-radius: 50% 10% 50% 10%;
    transform: rotate(30deg);
  `,

  flourish2: css`
    position: absolute;
    bottom: 30%;
    right: 8%;
    width: 80px;
    height: 80px;
    border: 2px solid ${colors.neonTeal}40;
    border-radius: 20% 80% 20% 80%;
    transform: rotate(-45deg);
  `,

  rocailleCurve: css`
    position: absolute;
    top: 60%;
    left: 20%;
    width: 150px;
    height: 150px;
    border: 2px solid ${colors.neonPurple}30;
    border-radius: 100% 0% 100% 0%;
    transform: rotate(15deg);
  `,

  // Neon Grid Overlay
  neonGrid: css`
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(${colors.neonTeal}08 1px, transparent 1px),
      linear-gradient(90deg, ${colors.neonTeal}08 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: 0.3;
  `,

  // Main Content Architecture
  mainContent: css`
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;

    @media (max-width: 768px) {
      padding: 2rem 1rem;
    }
  `,

  // Hero Portal Section - Central identity shrine
  heroPortal: css`
    text-align: center;
    padding: 4rem 0;
    margin-bottom: 6rem;
    position: relative;

    @media (max-width: 768px) {
      padding: 2rem 0;
      margin-bottom: 4rem;
    }
  `,

  // Mascot Shrine - Ornate presentation of identity
  mascotShrine: css`
    position: relative;
    margin-bottom: 3rem;
    display: inline-block;
  `,

  ornateFrame: css`
    position: relative;
    padding: 20px;
    background: radial-gradient(circle, ${colors.neonGold}20 0%, transparent 70%);
    border-radius: 50%;
    border: 3px solid ${colors.neonGold}60;
    box-shadow: 
      0 0 30px ${colors.neonGold}40,
      inset 0 0 20px ${colors.neonGold}20;
  `,

  mascot: css`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: white;
    padding: 8px;
    transition: all 0.5s ease;
    filter: drop-shadow(0 0 15px ${colors.neonTeal}60);

    &:hover {
      transform: scale(1.1) rotate(5deg);
      filter: drop-shadow(0 0 25px ${colors.neonGold}80);
    }
  `,

  // Frame Corner Ornaments - Rococo decorative elements
  frameCorner: css`
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid ${colors.neonTeal};
  `,

  cornerTopLeft: css`
    top: -10px;
    left: -10px;
    border-right: none;
    border-bottom: none;
    border-radius: 20px 0 0 0;
  `,

  cornerTopRight: css`
    top: -10px;
    right: -10px;
    border-left: none;
    border-bottom: none;
    border-radius: 0 20px 0 0;
  `,

  cornerBottomLeft: css`
    bottom: -10px;
    left: -10px;
    border-right: none;
    border-top: none;
    border-radius: 0 0 0 20px;
  `,

  cornerBottomRight: css`
    bottom: -10px;
    right: -10px;
    border-left: none;
    border-top: none;
    border-radius: 0 0 20px 0;
  `,

  // Mascot Aura - Pulsing energy effect
  mascotAura: css`
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: radial-gradient(circle, transparent 60%, ${colors.neonTeal}20 80%, transparent 100%);
    animation: pulse 3s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
  `,

  // Title Constellation - Typography with depth
  titleConstellation: css`
    margin-bottom: 3rem;
  `,

  title: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  `,

  titlePrimary: css`
    font-family: 'Playfair Display', serif;
    font-size: 4.5rem;
    font-weight: 900;
    color: ${colors.neonGold};
    text-shadow: 
      0 0 20px ${colors.neonGold}80,
      0 0 40px ${colors.neonGold}40,
      2px 2px 0 ${colors.background};
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;

    @media (max-width: 768px) {
      font-size: 3rem;
    }
  `,

  titleSecondary: css`
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 1.8rem;
    font-weight: 300;
    color: ${colors.neonTeal};
    letter-spacing: 0.2em;
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 1.4rem;
    }
  `,

  heroSubtitle: css`
    font-size: 1.4rem;
    color: ${colors.textLight};
    max-width: 700px;
    margin: 0 auto 3rem auto;
    line-height: 1.7;
    opacity: 0.9;

    @media (max-width: 768px) {
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
  `,

  subtitleAccent: css`
    color: ${colors.neonGold};
    font-weight: 600;
    text-shadow: 0 0 10px ${colors.neonGold}60;
  `,

  // Action Portal Buttons - Interactive gateways
  actionPortals: css`
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  `,

  portalButton: css`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: transparent;
    border: 2px solid ${colors.neonTeal};
    border-radius: 8px;
    color: ${colors.neonTeal};
    text-decoration: none;
    font-weight: 600;
    transition: all 0.4s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-3px);
      border-color: ${colors.neonGold};
      color: ${colors.background};
      background: ${colors.neonGold};
      box-shadow: 0 10px 30px ${colors.neonGold}40;
    }

    &:hover .buttonGlow {
      opacity: 1;
    }
  `,

  primaryPortal: css`
    border-color: ${colors.neonGold};
    color: ${colors.neonGold};

    &:hover {
      background: ${colors.neonGold};
      box-shadow: 0 10px 30px ${colors.neonGold}60;
    }
  `,

  secondaryPortal: css`
    border-color: ${colors.neonTeal};
    color: ${colors.neonTeal};

    &:hover {
      background: ${colors.neonTeal};
    }
  `,

  buttonIcon: css`
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  `,

  buttonText: css`
    position: relative;
    z-index: 2;
  `,

  buttonGlow: css`
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, ${colors.neonTeal}20 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  // Capability Matrix Section
  capabilityMatrix: css`
    margin-bottom: 6rem;
    text-align: center;
  `,

  sectionTitle: css`
    font-size: 2.5rem;
    font-weight: 700;
    color: ${colors.neonGold};
    margin-bottom: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
      font-size: 2rem;
      flex-direction: column;
      gap: 0.5rem;
    }
  `,

  titleGlyph: css`
    font-size: 3rem;
    filter: drop-shadow(0 0 10px currentColor);

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  `,

  matrixGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  `,

  capabilityCard: css`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: 12px;
    padding: 2rem;
    position: relative;
    transition: all 0.4s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-8px);
      border-color: ${colors.neonTeal};
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 30px ${colors.neonTeal}20;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${colors.neonTeal}, ${colors.neonGold});
    }
  `,

  cardActive: css`
    border-color: ${colors.neonGold};
    transform: translateY(-5px);
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.3),
      0 0 25px ${colors.neonGold}30;

    &::before {
      background: ${colors.neonGold};
    }
  `,

  cardHeader: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  `,

  capabilityIcon: css`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    background: linear-gradient(135deg, ${colors.neonTeal}20, ${colors.neonGold}20);
    border: 1px solid ${colors.neonTeal}40;
    filter: drop-shadow(0 0 10px ${colors.neonTeal}40);
  `,

  iconDocument: css`
    &::after {
      content: '📄';
    }
  `,

  iconInventory: css`
    &::after {
      content: '📦';
    }
  `,

  iconSearch: css`
    &::after {
      content: '🔍';
    }
  `,

  cardTitle: css`
    color: ${colors.neonTeal};
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
  `,

  cardDescription: css`
    color: ${colors.textLight};
    line-height: 1.6;
    margin-bottom: 1.5rem;
    opacity: 0.9;
  `,

  cardFooter: css`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  `,

  capability: css`
    background: ${colors.neonTeal}20;
    color: ${colors.neonTeal};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid ${colors.neonTeal}40;
  `,

  // Workflow Section
  workflowSection: css`
    margin-bottom: 6rem;
    text-align: center;
  `,

  workflowChain: css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-top: 3rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 3rem;
    }
  `,

  workflowPhase: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 140px;
    position: relative;
  `,

  phaseNumber: css`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: bold;
    color: ${colors.background};
    margin-bottom: 1rem;
    box-shadow: 
      0 4px 15px ${colors.neonTeal}40,
      0 0 20px ${colors.neonTeal}30;
    border: 2px solid ${colors.neonGold};
  `,

  phaseIcon: css`
    font-size: 2rem;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 0 8px currentColor);
  `,

  phaseTitle: css`
    color: ${colors.neonGold};
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 600;
  `,

  phaseDescription: css`
    color: ${colors.textLight};
    opacity: 0.8;
    font-size: 0.9rem;
    margin: 0;
  `,

  phaseConnector: css`
    position: absolute;
    top: 30px;
    left: 100%;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, ${colors.neonTeal}, ${colors.neonGold});
    z-index: -1;

    &::after {
      content: '';
      position: absolute;
      right: -5px;
      top: -3px;
      width: 8px;
      height: 8px;
      border-right: 2px solid ${colors.neonGold};
      border-top: 2px solid ${colors.neonGold};
      transform: rotate(45deg);
    }

    @media (max-width: 768px) {
      display: none;
    }
  `,

  // Authentication Portal Section
  authPortal: css`
    display: flex;
    justify-content: center;
    margin-bottom: 4rem;
  `,

  authContainer: css`
    width: 100%;
    max-width: 450px;
  `,

  authShrine: css`
    background: ${colors.surface};
    border: 2px solid ${colors.border};
    border-radius: 16px;
    padding: 3rem 2.5rem;
    position: relative;
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 30px ${colors.neonTeal}15;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${colors.neonTeal}, ${colors.neonGold}, ${colors.neonTeal});
      border-radius: 16px 16px 0 0;
    }
  `,

  authTitle: css`
    color: ${colors.neonGold};
    margin-bottom: 2rem;
    font-size: 1.8rem;
    font-weight: 600;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  `,

  errorAlert: css`
    background: rgba(255, 82, 82, 0.15);
    border: 1px solid rgba(255, 82, 82, 0.4);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background: rgba(255, 82, 82, 0.2);
    }
  `,

  errorIcon: css`
    font-size: 1.2rem;
  `,

  oauthPortal: css`
    margin-bottom: 2rem;
  `,

  authDivider: css`
    display: flex;
    align-items: center;
    margin: 2rem 0;
    gap: 1rem;
  `,

  dividerLine: css`
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${colors.border}, transparent);
  `,

  dividerText: css`
    color: ${colors.textMuted};
    font-size: 0.9rem;
    white-space: nowrap;
  `,

  authForm: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  `,

  inputGroup: css`
    position: relative;
  `,

  authInput: css`
    width: 100%;
    padding: 1rem 1.25rem;
    background: ${colors.background};
    border: 2px solid ${colors.border};
    border-radius: 8px;
    color: ${colors.textLight};
    font-size: 1rem;
    transition: all 0.3s ease;

    &::placeholder {
      color: ${colors.textMuted};
    }

    &:focus {
      outline: none;
      border-color: ${colors.neonTeal};
      box-shadow: 0 0 0 3px ${colors.neonTeal}20;
    }

    &:focus + .inputGlow {
      opacity: 1;
    }
  `,

  inputGlow: css`
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, ${colors.neonTeal}, ${colors.neonGold});
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  `,

  authSubmit: css`
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    border: none;
    color: ${colors.background};
    font-weight: 600;
    font-size: 1.1rem;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px ${colors.neonTeal}40;
    }

    &:disabled {
      opacity: 0.6;
      transform: none;
      cursor: not-allowed;
    }
  `,
};

export default OptimizedLandingPage;

