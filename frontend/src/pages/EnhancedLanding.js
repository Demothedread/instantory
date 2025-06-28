import { css } from '@emotion/react';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/index';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';
import { colors } from '../styles/theme/colors';
import { typography } from '../styles/theme/typography';

/**
 * Enhanced Landing Page - Neo-Deco-Rococo Single Screen Experience
 * Design Philosophy: Art Deco precision meets Rococo exuberance with modern sensibilities
 * No scrolling required - all information accessible via elegant navigation states
 */
const EnhancedLandingPage = () => {
  const { user } = useContext(AuthContext);
  const [activePanel, setActivePanel] = useState('home');
  
  const panels = {
    home: 'Welcome to Bartleby',
    features: 'Capabilities',
    about: 'Our Story', 
    contact: 'Connect'
  };

  return (
    <div css={styles.viewport}>
      {/* Animated Background Layers */}
      <div css={styles.backgroundLayers}>
        <div css={styles.geometricLayer} />
        <div css={styles.ornateLayer} />
        <div css={styles.neonLayer} />
      </div>

      {/* Navigation Constellation */}
      <nav css={styles.navigationConstellation}>
        <div css={styles.navBrand}>
          <div css={styles.brandIcon}>🏛️</div>
          <span css={styles.brandText}>Bartleby</span>
        </div>
        
        <div css={styles.navPanels}>
          {Object.entries(panels).map(([key, label]) => (
            <button
              key={key}
              css={[styles.navPanel, activePanel === key && styles.navPanelActive]}
              onClick={() => setActivePanel(key)}
            >
              <span css={styles.navPanelText}>{label}</span>
              <div css={styles.navPanelGlow} />
            </button>
          ))}
        </div>

        <div css={styles.navActions}>
          {user ? (
            <Link to="/dashboard" css={styles.dashboardButton}>
              <span css={styles.buttonIcon}>⚡</span>
              Dashboard
            </Link>
          ) : (
            <button css={styles.loginButton}>
              <span css={styles.buttonIcon}>🔮</span>
              Enter
            </button>
          )}
        </div>
      </nav>

      {/* Central Content Stage */}
      <main css={styles.contentStage}>
        {/* Home Panel */}
        {activePanel === 'home' && (
          <div css={styles.panel}>
            <div css={styles.heroContent}>
              <div css={styles.titleConstellation}>
                <div css={styles.ornamentalFrame}>
                  <h1 css={styles.mainTitle}>
                    <span css={styles.titlePrimary}>Bartleby</span>
                    <span css={styles.titleAccent}>AI Document Intelligence</span>
                  </h1>
                </div>
                
                <div css={styles.subtitleFrame}>
                  <p css={styles.subtitle}>
                    Transform documents into actionable intelligence through sophisticated AI analysis
                  </p>
                </div>
              </div>

              <div css={styles.actionPedestal}>
                <Link to="/upload" css={styles.primaryAction}>
                  <span css={styles.actionIcon}>🚀</span>
                  <span css={styles.actionText}>Begin Analysis</span>
                  <div css={styles.actionRipple} />
                </Link>
                
                <div css={styles.statusIndicators}>
                  <div css={styles.statusItem}>
                    <div css={[styles.statusOrb, styles.statusActive]} />
                    <span>AI Systems Online</span>
                  </div>
                  <div css={styles.statusItem}>
                    <div css={[styles.statusOrb, styles.statusActive]} />
                    <span>Ready for Upload</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Interactive Elements */}
            <div css={styles.floatingElements}>
              <div css={[styles.floatingOrb, styles.orb1]}>📊</div>
              <div css={[styles.floatingOrb, styles.orb2]}>🧠</div>
              <div css={[styles.floatingOrb, styles.orb3]}>⚡</div>
            </div>
          </div>
        )}

        {/* Features Panel */}
        {activePanel === 'features' && (
          <div css={styles.panel}>
            <div css={styles.featuresGrid}>
              <div css={styles.featureCard}>
                <div css={styles.featureIcon}>🎭</div>
                <h3 css={styles.featureTitle}>Semantic Analysis</h3>
                <p css={styles.featureDescription}>
                  Deep understanding of document meaning and context
                </p>
              </div>
              
              <div css={styles.featureCard}>
                <div css={styles.featureIcon}>🔮</div>
                <h3 css={styles.featureTitle}>AI-Powered Search</h3>
                <p css={styles.featureDescription}>
                  Find information using natural language queries
                </p>
              </div>
              
              <div css={styles.featureCard}>
                <div css={styles.featureIcon}>⚡</div>
                <h3 css={styles.featureTitle}>Real-time Processing</h3>
                <p css={styles.featureDescription}>
                  Instant analysis and metadata extraction
                </p>
              </div>
              
              <div css={styles.featureCard}>
                <div css={styles.featureIcon}>🏛️</div>
                <h3 css={styles.featureTitle}>Knowledge Architecture</h3>
                <p css={styles.featureDescription}>
                  Structured organization of your document universe
                </p>
              </div>
            </div>
          </div>
        )}

        {/* About Panel */}
        {activePanel === 'about' && (
          <div css={styles.panel}>
            <div css={styles.aboutContent}>
              <div css={styles.aboutText}>
                <h2 css={styles.aboutTitle}>The Bartleby Vision</h2>
                <p css={styles.aboutDescription}>
                  Named after Herman Melville's enigmatic scrivener, Bartleby represents the evolution 
                  from manual document handling to intelligent AI-powered analysis. Where the original 
                  Bartleby preferred not to, our AI system prefers to excel at understanding, organizing, 
                  and extracting insights from your documents.
                </p>
                
                <div css={styles.philosophyFrame}>
                  <h3 css={styles.philosophyTitle}>Our Philosophy</h3>
                  <p css={styles.philosophyText}>
                    Documents are more than files—they're repositories of knowledge waiting to be unlocked. 
                    Through the marriage of classical elegance and cutting-edge AI, we transform chaos into clarity.
                  </p>
                </div>
              </div>
              
              <div css={styles.aboutVisual}>
                <div css={styles.visualElement}>
                  <div css={styles.documentStack}>📚</div>
                  <div css={styles.transformArrow}>→</div>
                  <div css={styles.knowledgeGem}>💎</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Panel */}
        {activePanel === 'contact' && (
          <div css={styles.panel}>
            <div css={styles.contactContent}>
              <h2 css={styles.contactTitle}>Connect with Bartleby</h2>
              
              <div css={styles.contactGrid}>
                <div css={styles.contactCard}>
                  <div css={styles.contactIcon}>📧</div>
                  <h3>Support</h3>
                  <p>help@bartleby.ai</p>
                </div>
                
                <div css={styles.contactCard}>
                  <div css={styles.contactIcon}>🏛️</div>
                  <h3>Enterprise</h3>
                  <p>enterprise@bartleby.ai</p>
                </div>
                
                <div css={styles.contactCard}>
                  <div css={styles.contactIcon}>📖</div>
                  <h3>Documentation</h3>
                  <p>docs.bartleby.ai</p>
                </div>
              </div>
              
              <div css={styles.socialLinks}>
                <a href="#" css={styles.socialLink}>🐦</a>
                <a href="#" css={styles.socialLink}>💼</a>
                <a href="#" css={styles.socialLink}>🐱</a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Decorative Corner Elements */}
      <div css={styles.cornerOrnaments}>
        <div css={[styles.cornerOrnament, styles.topLeft]}>◆</div>
        <div css={[styles.cornerOrnament, styles.topRight]}>◆</div>
        <div css={[styles.cornerOrnament, styles.bottomLeft]}>◆</div>
        <div css={[styles.cornerOrnament, styles.bottomRight]}>◆</div>
      </div>
    </div>
  );
};

const styles = {
  viewport: css`
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      ${colors.richPurple} 0%,
      ${colors.deepNavy} 25%,
      ${colors.charcoal} 50%,
      ${colors.deepNavy} 75%,
      ${colors.richPurple} 100%
    );
    font-family: ${typography.fonts.primary};
    color: ${colors.textLight};
  `,

  backgroundLayers: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
  `,

  geometricLayer: css`
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(45deg, transparent 48%, ${colors.neonTeal}08 49%, ${colors.neonTeal}08 51%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, ${colors.neonGold}08 49%, ${colors.neonGold}08 51%, transparent 52%);
    background-size: 80px 80px;
    animation: geometricShift 60s linear infinite;
  `,

  ornateLayer: css`
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, ${colors.neonTeal}15 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, ${colors.neonGold}15 0%, transparent 40%),
      radial-gradient(circle at 40% 80%, ${colors.neonPurple}10 0%, transparent 30%);
    animation: ornateFloat 45s ease-in-out infinite;
  `,

  neonLayer: css`
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(90deg, transparent 0%, ${colors.neonTeal}03 50%, transparent 100%),
      linear-gradient(0deg, transparent 0%, ${colors.neonGold}03 50%, transparent 100%);
    animation: neonPulse 8s ease-in-out infinite;
  `,

  navigationConstellation: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${layout.spacing.xl} ${layout.spacing['2xl']};
    z-index: 100;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${colors.neonTeal}20;
  `,

  navBrand: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
  `,

  brandIcon: css`
    font-size: 2rem;
    filter: drop-shadow(0 0 10px ${colors.neonGold}60);
    animation: brandGlow 4s ease-in-out infinite;
  `,

  brandText: css`
    font-size: 1.5rem;
    font-weight: 900;
    font-family: ${typography.fonts.decorative};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,

  navPanels: css`
    display: flex;
    gap: ${layout.spacing.lg};
  `,

  navPanel: css`
    position: relative;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: none;
    border: 1px solid ${colors.neonTeal}30;
    border-radius: 25px;
    color: ${colors.lightGray};
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      color: ${colors.neonTeal};
      border-color: ${colors.neonTeal}60;
      transform: translateY(-2px);
    }
  `,

  navPanelActive: css`
    color: ${colors.neonGold};
    border-color: ${colors.neonGold}80;
    background: ${colors.neonGold}10;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, ${colors.neonGold}20 0%, transparent 50%);
      border-radius: inherit;
    }
  `,

  navPanelText: css`
    position: relative;
    z-index: 1;
    font-weight: 600;
  `,

  navPanelGlow: css`
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: ${colors.neonTeal}20;
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  navActions: css`
    display: flex;
    gap: ${layout.spacing.md};
  `,

  dashboardButton: css`
    ${neoDecorocoBase.button}
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: linear-gradient(135deg, ${colors.neonTeal} 0%, ${colors.neonBlue} 100%);
    color: ${colors.charcoal};
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px ${colors.neonTeal}30;
    }
  `,

  loginButton: css`
    ${neoDecorocoBase.button}
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonPink} 100%);
    color: ${colors.charcoal};
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px ${colors.neonGold}30;
    }
  `,

  buttonIcon: css`
    font-size: 1.2rem;
  `,

  contentStage: css`
    position: absolute;
    top: 100px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${layout.spacing['2xl']};
  `,

  panel: css`
    width: 100%;
    height: 100%;
    max-width: 1400px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: panelFadeIn 0.5s ease-out;
  `,

  heroContent: css`
    text-align: center;
    max-width: 800px;
  `,

  titleConstellation: css`
    margin-bottom: ${layout.spacing['3xl']};
  `,

  ornamentalFrame: css`
    position: relative;
    padding: ${layout.spacing.xl};
    border: 2px solid ${colors.neonGold}40;
    border-radius: 20px;
    background: linear-gradient(145deg, ${colors.richPurple}20 0%, ${colors.deepNavy}10 100%);
    backdrop-filter: blur(15px);
    margin-bottom: ${layout.spacing.lg};

    &::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
      border-radius: inherit;
      z-index: -1;
      opacity: 0.5;
    }
  `,

  mainTitle: css`
    margin: 0;
  `,

  titlePrimary: css`
    display: block;
    font-size: 4rem;
    font-weight: 900;
    font-family: ${typography.fonts.decorative};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.white} 50%, ${colors.neonTeal} 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 40px ${colors.neonGold}40;
    animation: titleShimmer 4s ease-in-out infinite;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  `,

  titleAccent: css`
    display: block;
    font-size: 1.5rem;
    font-weight: 400;
    color: ${colors.lightGray};
    margin-top: ${layout.spacing.sm};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  `,

  subtitleFrame: css`
    padding: ${layout.spacing.lg};
    border: 1px solid ${colors.neonTeal}30;
    border-radius: 15px;
    background: ${colors.charcoal}20;
    backdrop-filter: blur(10px);
  `,

  subtitle: css`
    font-size: 1.2rem;
    line-height: 1.6;
    color: ${colors.lightGray};
    margin: 0;
  `,

  actionPedestal: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.xl};
  `,

  primaryAction: css`
    ${neoDecorocoBase.button}
    position: relative;
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.lg} ${layout.spacing['2xl']};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
    color: ${colors.charcoal};
    text-decoration: none;
    border-radius: 50px;
    font-size: 1.3rem;
    font-weight: 700;
    box-shadow: 0 15px 35px ${colors.neonGold}25;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px ${colors.neonGold}35;
    }
  `,

  actionIcon: css`
    font-size: 1.5rem;
  `,

  actionText: css`
    letter-spacing: 0.05em;
  `,

  actionRipple: css`
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${colors.white}30 0%, transparent 50%);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  statusIndicators: css`
    display: flex;
    gap: ${layout.spacing.xl};
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  statusItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    font-size: 0.9rem;
    color: ${colors.lightGray};
  `,

  statusOrb: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.lightGray};
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      background: inherit;
      opacity: 0.3;
      animation: statusPulse 2s ease-in-out infinite;
    }
  `,

  statusActive: css`
    background: ${colors.neonGreen};
  `,

  floatingElements: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
  `,

  floatingOrb: css`
    position: absolute;
    font-size: 2.5rem;
    opacity: 0.7;
    animation: orbFloat 8s ease-in-out infinite;
    filter: drop-shadow(0 0 15px ${colors.neonTeal}40);
  `,

  orb1: css`
    top: 15%;
    left: 10%;
    animation-delay: -2s;
  `,

  orb2: css`
    top: 25%;
    right: 15%;
    animation-delay: -4s;
  `,

  orb3: css`
    bottom: 20%;
    left: 20%;
    animation-delay: -1s;
  `,

  featuresGrid: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${layout.spacing['2xl']};
    max-width: 1000px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: ${layout.spacing.xl};
    }
  `,

  featureCard: css`
    ${neoDecorocoBase.panel}
    padding: ${layout.spacing['2xl']};
    text-align: center;
    background: linear-gradient(145deg, ${colors.richPurple}30 0%, ${colors.deepNavy}20 100%);
    border: 1px solid ${colors.neonTeal}40;
    border-radius: 20px;
    backdrop-filter: blur(15px);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      border-color: ${colors.neonGold}60;
      box-shadow: 0 15px 30px ${colors.charcoal}40;
    }
  `,

  featureIcon: css`
    font-size: 3rem;
    margin-bottom: ${layout.spacing.lg};
    filter: drop-shadow(0 0 15px ${colors.neonGold}50);
  `,

  featureTitle: css`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.neonGold};
    margin-bottom: ${layout.spacing.md};
  `,

  featureDescription: css`
    color: ${colors.lightGray};
    line-height: 1.6;
  `,

  aboutContent: css`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: ${layout.spacing['3xl']};
    max-width: 1200px;
    align-items: center;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: ${layout.spacing.xl};
    }
  `,

  aboutText: css`
    max-width: 600px;
  `,

  aboutTitle: css`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${colors.neonGold};
    margin-bottom: ${layout.spacing.lg};
    font-family: ${typography.fonts.decorative};
  `,

  aboutDescription: css`
    font-size: 1.1rem;
    line-height: 1.7;
    color: ${colors.lightGray};
    margin-bottom: ${layout.spacing.xl};
  `,

  philosophyFrame: css`
    padding: ${layout.spacing.xl};
    border: 1px solid ${colors.neonTeal}30;
    border-radius: 15px;
    background: ${colors.charcoal}20;
    backdrop-filter: blur(10px);
  `,

  philosophyTitle: css`
    font-size: 1.3rem;
    font-weight: 700;
    color: ${colors.neonTeal};
    margin-bottom: ${layout.spacing.md};
  `,

  philosophyText: css`
    color: ${colors.lightGray};
    line-height: 1.6;
    font-style: italic;
  `,

  aboutVisual: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,

  visualElement: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.xl};
    font-size: 3rem;
    filter: drop-shadow(0 0 20px ${colors.neonGold}40);
  `,

  documentStack: css`
    animation: documentFloat 4s ease-in-out infinite;
  `,

  transformArrow: css`
    color: ${colors.neonTeal};
    animation: arrowPulse 2s ease-in-out infinite;
  `,

  knowledgeGem: css`
    animation: gemRotate 6s linear infinite;
  `,

  contactContent: css`
    text-align: center;
    max-width: 800px;
  `,

  contactTitle: css`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${colors.neonGold};
    margin-bottom: ${layout.spacing['2xl']};
    font-family: ${typography.fonts.decorative};
  `,

  contactGrid: css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${layout.spacing.xl};
    margin-bottom: ${layout.spacing['2xl']};
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  `,

  contactCard: css`
    ${neoDecorocoBase.panel}
    padding: ${layout.spacing.xl};
    text-align: center;
    background: linear-gradient(145deg, ${colors.richPurple}30 0%, ${colors.deepNavy}20 100%);
    border: 1px solid ${colors.neonTeal}40;
    border-radius: 15px;
    backdrop-filter: blur(15px);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      border-color: ${colors.neonGold}60;
    }
  `,

  contactIcon: css`
    font-size: 2.5rem;
    margin-bottom: ${layout.spacing.md};
    filter: drop-shadow(0 0 15px ${colors.neonTeal}50);
  `,

  socialLinks: css`
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.lg};
  `,

  socialLink: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, ${colors.neonTeal}20 0%, ${colors.neonGold}20 100%);
    border: 1px solid ${colors.neonTeal}40;
    border-radius: 50%;
    color: ${colors.neonTeal};
    text-decoration: none;
    font-size: 1.5rem;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      background: linear-gradient(135deg, ${colors.neonGold}30 0%, ${colors.neonTeal}30 100%);
      color: ${colors.neonGold};
      box-shadow: 0 10px 20px ${colors.neonTeal}30;
    }
  `,

  cornerOrnaments: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  `,

  cornerOrnament: css`
    position: absolute;
    font-size: 1.5rem;
    color: ${colors.neonGold}60;
    animation: ornamentGlow 3s ease-in-out infinite;
  `,

  topLeft: css`
    top: ${layout.spacing.xl};
    left: ${layout.spacing.xl};
  `,

  topRight: css`
    top: ${layout.spacing.xl};
    right: ${layout.spacing.xl};
  `,

  bottomLeft: css`
    bottom: ${layout.spacing.xl};
    left: ${layout.spacing.xl};
  `,

  bottomRight: css`
    bottom: ${layout.spacing.xl};
    right: ${layout.spacing.xl};
  `,

  // Animations
  '@keyframes panelFadeIn': css`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  `,

  '@keyframes geometricShift': css`
    0% { background-position: 0 0, 0 0; }
    100% { background-position: 80px 80px, -80px 80px; }
  `,

  '@keyframes ornateFloat': css`
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(10px, -15px) rotate(120deg); }
    66% { transform: translate(-10px, 10px) rotate(240deg); }
  `,

  '@keyframes neonPulse': css`
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  `,

  '@keyframes brandGlow': css`
    0%, 100% { filter: drop-shadow(0 0 10px ${colors.neonGold}40); }
    50% { filter: drop-shadow(0 0 20px ${colors.neonGold}80); }
  `,

  '@keyframes titleShimmer': css`
    0%, 100% { 
      background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.white} 50%, ${colors.neonTeal} 100%);
    }
    50% { 
      background: linear-gradient(135deg, ${colors.neonTeal} 0%, ${colors.neonGold} 50%, ${colors.white} 100%);
    }
  `,

  '@keyframes statusPulse': css`
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.3); }
  `,

  '@keyframes orbFloat': css`
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-15px) rotate(120deg); }
    66% { transform: translateY(8px) rotate(240deg); }
  `,

  '@keyframes documentFloat': css`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  `,

  '@keyframes arrowPulse': css`
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  `,

  '@keyframes gemRotate': css`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `,

  '@keyframes ornamentGlow': css`
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  `,
};

export default EnhancedLandingPage;
