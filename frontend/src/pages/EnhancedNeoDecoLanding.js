/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { GoogleLogin } from '@react-oauth/google';
import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/index';
import { colors } from '../styles/theme/colors';
import ClockworkLoadingPage from '../components/loading/ClockworkLoadingPage';

/**
 * 🚀 ENHANCED NEO-DECO-ROCOCO LANDING EXPERIENCE 🚀
 * 
 * A modern, interactive, single-screen experience that eliminates excessive scrolling
 * while maintaining the sophisticated Neo-Deco-Rococo aesthetic with whimsical animations
 * and 21st-century web development practices.
 * 
 * Key Innovations:
 * - Interactive floating panels that expand/collapse on demand
 * - Animated Bartleby mascot with click interactions
 * - Contextual modal overlays for deeper exploration
 * - Smooth transitions and micro-interactions
 * - Minimal scrolling with intelligent layout
 * - Advanced CSS-in-JS with modern React patterns
 */

// 🎭 ADVANCED ANIMATION KEYFRAMES

const logoHover = keyframes`
  0% { 
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 20px rgba(127, 205, 205, 0.6));
  }
  50% { 
    transform: scale(1.1) rotate(5deg);
    filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.8)) hue-rotate(30deg);
  }
  100% { 
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 20px rgba(127, 205, 205, 0.6));
  }
`;

const logoClick = keyframes`
  0% { 
    transform: scale(1) rotate(0deg);
  }
  25% { 
    transform: scale(0.9) rotate(-10deg);
  }
  50% { 
    transform: scale(1.2) rotate(10deg);
  }
  75% { 
    transform: scale(0.95) rotate(-5deg);
  }
  100% { 
    transform: scale(1) rotate(0deg);
  }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.4),
      0 0 40px rgba(255, 215, 0, 0.2),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 40px rgba(0, 255, 255, 0.8),
      0 0 80px rgba(255, 215, 0, 0.6),
      inset 0 0 30px rgba(255, 255, 255, 0.2);
  }
`;

const floatAndSpin = keyframes`
  0%, 100% { 
    transform: translateY(0) rotate(0deg);
  }
  50% { 
    transform: translateY(-20px) rotate(180deg);
  }
`;

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const panelExpand = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    max-height: 500px;
  }
`;

const sparkleEffect = keyframes`
  0%, 100% { 
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% { 
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
`;

// 🎨 ENHANCED COLOR PALETTE
const enhancedColors = {
  ...colors,
  glassMorphism: 'rgba(26, 26, 46, 0.8)',
  neonCyan: '#00FFFF',
  neonMagenta: '#FF00FF',
  neonLime: '#32FF32',
  deepSpace: '#0a0a1a',
  crystalBlue: '#4ECDC4',
  cosmicPurple: '#9B59B6',
};

// 🧩 INTERACTIVE PANELS COMPONENT
const InteractivePanel = ({ icon, title, description, details, isExpanded, onToggle, delay = 0 }) => {
  return (
    <div 
      css={[
        styles.interactivePanel,
        isExpanded && styles.panelExpanded
      ]}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div css={styles.panelHeader} onClick={onToggle}>
        <div css={styles.panelIcon}>{icon}</div>
        <div css={styles.panelTitleSection}>
          <h3 css={styles.panelTitle}>{title}</h3>
          <p css={styles.panelDescription}>{description}</p>
        </div>
        <div css={[styles.expandIcon, isExpanded && styles.expandIconRotated]}>
          ⚡
        </div>
      </div>
      
      {isExpanded && (
        <div css={styles.panelContent}>
          <div css={styles.panelDetails}>
            {details.map((detail, index) => (
              <div key={index} css={styles.detailItem}>
                <div css={styles.detailIcon}>{detail.icon}</div>
                <div>
                  <strong>{detail.title}</strong>
                  <p>{detail.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 🎭 ANIMATED BARTLEBY MASCOT COMPONENT
const AnimatedBartleby = ({ onClick }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const handleClick = () => {
    setIsClicked(true);
    
    // Generate sparkle effects
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 100
    }));
    
    setSparkles(newSparkles);
    
    setTimeout(() => {
      setIsClicked(false);
      setSparkles([]);
    }, 1000);
    
    onClick?.();
  };

  return (
    <div css={styles.mascotContainer} onClick={handleClick}>
      <div css={[styles.mascotWrapper, isClicked && styles.mascotClicked]}>
        <img 
          src="/assets/1216BartMascotNoBkg/NeonBartlebeby.png"
          alt="Bartleby - AI Intelligence Mascot"
          css={styles.mascotImage}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = '<div style="font-size: 4rem;">🤖</div>';
          }}
        />
        
        {/* Sparkle effects */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            css={styles.sparkle}
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animationDelay: `${sparkle.delay}ms`
            }}
          >
            ✨
          </div>
        ))}
        
        {/* Pulsing ring effect */}
        <div css={styles.pulseRing} />
        <div css={styles.pulseRing} style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
};

// 🎪 FLOATING ACTION BUTTONS COMPONENT
const FloatingActions = ({ onAuthClick, onDemoClick, onAboutClick }) => {
  return (
    <div css={styles.floatingActions}>
      <button css={[styles.fab, styles.fabPrimary]} onClick={onAuthClick}>
        <span css={styles.fabIcon}>🚀</span>
        <span css={styles.fabLabel}>Launch</span>
      </button>
      
      <button css={[styles.fab, styles.fabSecondary]} onClick={onDemoClick}>
        <span css={styles.fabIcon}>⚡</span>
        <span css={styles.fabLabel}>Demo</span>
      </button>
      
      <button css={[styles.fab, styles.fabTertiary]} onClick={onAboutClick}>
        <span css={styles.fabIcon}>🧠</span>
        <span css={styles.fabLabel}>Explore</span>
      </button>
    </div>
  );
};

// 🎭 MODAL COMPONENT
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div css={styles.modalOverlay} onClick={onClose}>
      <div css={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button css={styles.modalClose} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

// 🏛️ MAIN COMPONENT
const EnhancedNeoDecoLanding = () => {
  const { loginWithGoogle, login, error, clearError, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [showLoadingDemo, setShowLoadingDemo] = useState(false);

  // Panel data
  const panelData = [
    {
      id: 'neural',
      icon: '🧠',
      title: 'Neural Document Analysis',
      description: 'AI-powered text extraction and semantic understanding',
      details: [
        { icon: '📄', title: 'Smart OCR', description: 'Extract text from any document format' },
        { icon: '🔍', title: 'Semantic Search', description: 'Find content by meaning, not just keywords' },
        { icon: '🏷️', title: 'Auto-Classification', description: 'Automatically categorize and tag documents' }
      ]
    },
    {
      id: 'inventory',
      icon: '📦',
      title: 'Intelligent Inventory',
      description: 'Computer vision for automatic asset cataloging',
      details: [
        { icon: '👁️', title: 'Visual Recognition', description: 'Identify objects from images automatically' },
        { icon: '🗂️', title: 'Smart Cataloging', description: 'Organize items with AI-generated metadata' },
        { icon: '🎯', title: 'Barcode Scanning', description: 'Instant product identification and lookup' }
      ]
    },
    {
      id: 'search',
      icon: '🔍',
      title: 'Vector-Powered Search',
      description: 'Revolutionary semantic search technology',
      details: [
        { icon: '🧮', title: 'Vector Embeddings', description: 'Mathematical representation of content meaning' },
        { icon: '🎯', title: 'Similarity Matching', description: 'Find related content across your entire database' },
        { icon: '⚡', title: 'Instant Results', description: 'Lightning-fast search with relevance ranking' }
      ]
    },
    {
      id: 'synthesis',
      icon: '⚡',
      title: 'Real-Time Synthesis',
      description: 'Combine insights across multiple data sources',
      details: [
        { icon: '🔗', title: 'Data Fusion', description: 'Connect information from different sources' },
        { icon: '📊', title: 'Pattern Recognition', description: 'Discover hidden trends and relationships' },
        { icon: '💡', title: 'Insight Generation', description: 'AI-powered recommendations and insights' }
      ]
    }
  ];

  // Authentication handlers
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      console.error('Authentication failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      await loginWithGoogle(credentialResponse.credential);
    }
  };

  const handlePanelToggle = (panelId) => {
    setExpandedPanel(expandedPanel === panelId ? null : panelId);
  };

  const handleMascotClick = () => {
    // Create a delightful interaction
    setActiveModal('mascot');
  };

  if (showLoadingDemo) {
    return <ClockworkLoadingPage message="Demonstrating our magnificent loading experience..." progress={75} isVisible={true} />;
  }

  return (
    <Suspense fallback={<ClockworkLoadingPage message="Initializing Enhanced Experience..." progress={50} isVisible={true} />}>
      <div css={styles.container}>
        {/* Background effects */}
        <div css={styles.backgroundEffects}>
          <div css={styles.geometricFloat} />
          <div css={styles.geometricFloat} />
          <div css={styles.geometricFloat} />
        </div>

        {/* Main content grid */}
        <div css={styles.mainGrid}>
          {/* Left panel - Hero content */}
          <div css={styles.heroPanel}>
            <AnimatedBartleby onClick={handleMascotClick} />
            
            <div css={styles.titleSection}>
              <h1 css={styles.mainTitle}>BARTLEBY</h1>
              <p css={styles.subtitle}>AI Intelligence Platform</p>
              <p css={styles.description}>
                Transform chaos into clarity with sophisticated document analysis, 
                intelligent inventory management, and semantic search technology.
              </p>
            </div>

            <FloatingActions 
              onAuthClick={() => setActiveModal('auth')}
              onDemoClick={() => setShowLoadingDemo(true)}
              onAboutClick={() => setActiveModal('about')}
            />
          </div>

          {/* Right panel - Interactive capabilities */}
          <div css={styles.capabilitiesPanel}>
            <h2 css={styles.panelSectionTitle}>Intelligence Capabilities</h2>
            <div css={styles.panelsContainer}>
              {panelData.map((panel, index) => (
                <InteractivePanel
                  key={panel.id}
                  {...panel}
                  isExpanded={expandedPanel === panel.id}
                  onToggle={() => handlePanelToggle(panel.id)}
                  delay={index * 150}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Authentication Modal */}
        <Modal isOpen={activeModal === 'auth'} onClose={() => setActiveModal(null)}>
          <div css={styles.authModal}>
            <h2 css={styles.modalTitle}>🚀 Access Intelligence Platform</h2>
            
            {error && (
              <div css={styles.errorMessage} onClick={clearError}>
                ⚠️ {error}
              </div>
            )}

            <div css={styles.authOptions}>
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

            <div css={styles.divider}>
              <span>or use credentials</span>
            </div>

            <form css={styles.authForm} onSubmit={handleEmailLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                css={styles.authInput}
                required
              />
              
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                css={styles.authInput}
                required
              />
              
              <button type="submit" css={styles.authButton} disabled={isLoading}>
                {isLoading ? '⏳ Accessing...' : '🚀 Enter Platform'}
              </button>
            </form>
          </div>
        </Modal>

        {/* About Modal */}
        <Modal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)}>
          <div css={styles.aboutModal}>
            <h2 css={styles.modalTitle}>🧠 About Bartleby Intelligence</h2>
            <div css={styles.aboutContent}>
              <div css={styles.aboutSection}>
                <h3>🎯 Mission</h3>
                <p>Transforming unstructured information into organized, actionable intelligence through advanced AI and machine learning technologies.</p>
              </div>
              
              <div css={styles.aboutSection}>
                <h3>⚡ Technology</h3>
                <p>Built with cutting-edge vector databases, neural language models, and computer vision algorithms for unparalleled document and inventory analysis.</p>
              </div>
              
              <div css={styles.aboutSection}>
                <h3>🚀 Vision</h3>
                <p>Empowering organizations to unlock the hidden value in their documents and assets through intelligent automation and semantic understanding.</p>
              </div>
            </div>
          </div>
        </Modal>

        {/* Mascot Modal */}
        <Modal isOpen={activeModal === 'mascot'} onClose={() => setActiveModal(null)}>
          <div css={styles.mascotModal}>
            <h2 css={styles.modalTitle}>🤖 Meet Bartleby</h2>
            <div css={styles.mascotModalContent}>
              <div css={styles.mascotFeature}>
                <h3>🧠 AI-Powered Intelligence</h3>
                <p>Bartleby represents the fusion of classical knowledge organization with modern artificial intelligence, bringing order to digital chaos.</p>
              </div>
              
              <div css={styles.mascotFeature}>
                <h3>🎨 Neo-Deco-Rococo Design</h3>
                <p>Embodying our design philosophy where Art Deco precision meets Rococo ornamental beauty, enhanced by modern digital aesthetics.</p>
              </div>
              
              <div css={styles.mascotFeature}>
                <h3>⚡ Interactive Experience</h3>
                <p>Click Bartleby anywhere in the app to discover hidden features, easter eggs, and delightful animations that make work more enjoyable.</p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Suspense>
  );
};

// 🎨 ENHANCED STYLES
const styles = {
  container: css`
    min-height: 100vh;
    background: linear-gradient(135deg, 
      ${enhancedColors.deepSpace} 0%,
      ${colors.background} 30%,
      ${colors.surface} 60%,
      ${enhancedColors.deepSpace} 100%);
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', system-ui, sans-serif;
  `,

  backgroundEffects: css`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  `,

  geometricFloat: css`
    position: absolute;
    width: 200px;
    height: 200px;
    border: 2px solid ${colors.neonTeal}30;
    border-radius: 50%;
    animation: ${floatAndSpin} 20s ease-in-out infinite;
    
    &:nth-child(1) {
      top: 10%;
      left: 5%;
      animation-delay: 0s;
      animation-duration: 25s;
    }
    
    &:nth-child(2) {
      top: 60%;
      right: 10%;
      animation-delay: -8s;
      animation-duration: 18s;
    }
    
    &:nth-child(3) {
      bottom: 20%;
      left: 15%;
      animation-delay: -15s;
      animation-duration: 22s;
    }
  `,

  mainGrid: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    position: relative;
    z-index: 10;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
  `,

  heroPanel: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    text-align: center;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at center,
        rgba(0, 255, 255, 0.05) 0%,
        transparent 60%
      );
    }
  `,

  mascotContainer: css`
    position: relative;
    margin-bottom: 2rem;
    cursor: pointer;
    z-index: 5;
  `,

  mascotWrapper: css`
    position: relative;
    display: inline-block;
    animation: ${logoHover} 3s ease-in-out infinite;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      animation-play-state: paused;
      transform: scale(1.1);
    }
  `,

  mascotClicked: css`
    animation: ${logoClick} 0.6s ease-out;
  `,

  mascotImage: css`
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 3px solid ${colors.neonGold};
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.6),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    
    @media (max-width: 768px) {
      width: 140px;
      height: 140px;
    }
  `,

  sparkle: css`
    position: absolute;
    font-size: 1.2rem;
    animation: ${sparkleEffect} 1s ease-out;
    pointer-events: none;
  `,

  pulseRing: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    border: 2px solid ${colors.neonTeal};
    border-radius: 50%;
    animation: ${pulseGlow} 2s ease-in-out infinite;
    opacity: 0.6;
  `,

  titleSection: css`
    margin-bottom: 3rem;
  `,

  mainTitle: css`
    font-size: clamp(3rem, 8vw, 5rem);
    font-weight: 900;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, 
      ${colors.neonGold} 0%, 
      ${colors.neonTeal} 50%, 
      ${colors.neonPurple} 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
  `,

  subtitle: css`
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: ${colors.neonTeal};
    font-weight: 300;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
  `,

  description: css`
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.6;
    max-width: 500px;
    color: ${colors.textLight};
    opacity: 0.9;
  `,

  floatingActions: css`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  `,

  fab: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
  `,

  fabPrimary: css`
    background: linear-gradient(135deg, ${colors.neonGold}, ${colors.neonTeal});
    color: ${colors.background};
    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
  `,

  fabSecondary: css`
    background: ${enhancedColors.glassMorphism};
    color: ${colors.neonTeal};
    border: 1px solid ${colors.neonTeal};
    box-shadow: 0 5px 20px rgba(0, 255, 255, 0.2);
  `,

  fabTertiary: css`
    background: ${enhancedColors.glassMorphism};
    color: ${colors.neonPurple};
    border: 1px solid ${colors.neonPurple};
    box-shadow: 0 5px 20px rgba(191, 0, 255, 0.2);
  `,

  fabIcon: css`
    font-size: 1.2rem;
  `,

  fabLabel: css`
    font-size: 1rem;
  `,

  capabilitiesPanel: css`
    padding: 2rem;
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.8) 0%,
      rgba(16, 33, 62, 0.8) 100%);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(0, 255, 255, 0.2);
    overflow-y: auto;
    
    @media (max-width: 1024px) {
      border-left: none;
      border-top: 1px solid rgba(0, 255, 255, 0.2);
    }
  `,

  panelSectionTitle: css`
    font-size: 1.8rem;
    color: ${colors.neonGold};
    margin-bottom: 1.5rem;
    text-align: center;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  `,

  panelsContainer: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,

  interactivePanel: css`
    background: ${enhancedColors.glassMorphism};
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 15px;
    backdrop-filter: blur(15px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    
    &:hover {
      border-color: ${colors.neonTeal};
      box-shadow: 0 5px 25px rgba(0, 255, 255, 0.2);
    }
  `,

  panelExpanded: css`
    border-color: ${colors.neonGold};
    box-shadow: 0 8px 30px rgba(255, 215, 0, 0.3);
  `,

  panelHeader: css`
    display: flex;
    align-items: center;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 255, 255, 0.05);
    }
  `,

  panelIcon: css`
    font-size: 2rem;
    margin-right: 1rem;
    filter: drop-shadow(0 0 10px currentColor);
  `,

  panelTitleSection: css`
    flex: 1;
  `,

  panelTitle: css`
    font-size: 1.2rem;
    color: ${colors.neonTeal};
    margin: 0 0 0.5rem 0;
    font-weight: 600;
  `,

  panelDescription: css`
    font-size: 0.9rem;
    color: ${colors.textLight};
    margin: 0;
    opacity: 0.8;
  `,

  expandIcon: css`
    font-size: 1.5rem;
    color: ${colors.neonGold};
    transition: transform 0.3s ease;
  `,

  expandIconRotated: css`
    transform: rotate(180deg);
  `,

  panelContent: css`
    animation: ${panelExpand} 0.3s ease-out;
    border-top: 1px solid rgba(0, 255, 255, 0.2);
  `,

  panelDetails: css`
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,

  detailItem: css`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(0, 255, 255, 0.1);
  `,

  detailIcon: css`
    font-size: 1.5rem;
    margin-top: 0.2rem;
  `,

  modalOverlay: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  `,

  modalContent: css`
    background: linear-gradient(135deg, 
      ${enhancedColors.glassMorphism} 0%,
      rgba(16, 33, 62, 0.95) 100%);
    border: 2px solid ${colors.neonTeal};
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    backdrop-filter: blur(25px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: ${modalSlideIn} 0.3s ease-out;
    position: relative;
  `,

  modalClose: css`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: ${colors.neonRed};
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 7, 58, 0.2);
      transform: scale(1.1);
    }
  `,

  modalTitle: css`
    font-size: 1.8rem;
    color: ${colors.neonGold};
    margin-bottom: 1.5rem;
    text-align: center;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  `,

  authModal: css`
    text-align: center;
  `,

  errorMessage: css`
    background: rgba(255, 7, 58, 0.15);
    border: 1px solid ${colors.neonRed};
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    color: ${colors.neonRed};
    cursor: pointer;
  `,

  authOptions: css`
    margin-bottom: 1.5rem;
  `,

  divider: css`
    display: flex;
    align-items: center;
    margin: 1.5rem 0;
    gap: 1rem;
    
    &::before, &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${colors.border}, transparent);
    }
    
    span {
      color: ${colors.textMuted};
      font-size: 0.9rem;
    }
  `,

  authForm: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `,

  authInput: css`
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid ${colors.border};
    border-radius: 10px;
    color: ${colors.textLight};
    font-size: 1rem;
    
    &::placeholder {
      color: ${colors.textMuted};
    }
    
    &:focus {
      outline: none;
      border-color: ${colors.neonTeal};
      box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
    }
  `,

  authButton: css`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    border: none;
    border-radius: 10px;
    color: ${colors.background};
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 255, 255, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,

  aboutModal: css`
    max-width: 600px;
  `,

  aboutContent: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `,

  aboutSection: css`
    h3 {
      color: ${colors.neonTeal};
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }
    
    p {
      color: ${colors.textLight};
      line-height: 1.6;
      opacity: 0.9;
    }
  `,

  mascotModal: css`
    max-width: 600px;
  `,

  mascotModalContent: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `,

  mascotFeature: css`
    padding: 1.5rem;
    background: rgba(0, 255, 255, 0.05);
    border-radius: 15px;
    border: 1px solid rgba(0, 255, 255, 0.2);
    
    h3 {
      color: ${colors.neonGold};
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }
    
    p {
      color: ${colors.textLight};
      line-height: 1.6;
      opacity: 0.9;
    }
  `
};

export default EnhancedNeoDecoLanding;
