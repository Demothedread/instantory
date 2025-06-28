import { css } from '@emotion/react';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/index';
import { colors } from '../styles/theme/colors';

/**
 * Enhanced Home Page Component - Intelligence Command Center
 * Component Genealogy: Control Panel → Command Bridge → Data Observatory → Intelligence Hub
 * Subverts traditional dashboard hierarchy by presenting tools as portals to knowledge domains
 * Neo-Deco-Rococo: Combines Art-Deco structural elements with Rococo ornamental flourishes
 */
const HomePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activePortal, setActivePortal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Rotate portal highlights every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePortal(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Intelligence Portal Definitions - Each represents a domain of organized knowledge
  const intelligencePortals = [
    {
      id: 'documents',
      path: '/documents',
      title: 'Document Observatory',
      subtitle: 'Textual Intelligence Archive',
      description: 'Explore your document universe with AI-powered analysis, semantic search, and intelligent categorization systems',
      icon: '📚',
      iconAlt: '📄',
      gradient: `linear-gradient(135deg, ${colors.neonTeal}30, ${colors.neonGold}20)`,
      borderColor: colors.neonTeal,
      capabilities: ['Semantic Search', 'Auto-Classification', 'Content Extraction'],
      origin: 'Filing Cabinet',
      evolution: 'Vector Database',
      pattern: 'radial'
    },
    {
      id: 'inventory',
      path: '/inventory',
      title: 'Inventory Intelligence',
      subtitle: 'Physical Asset Catalog',
      description: 'Transform physical collections into searchable digital catalogs with visual recognition and automated metadata generation',
      icon: '📦',
      iconAlt: '🏷️',
      gradient: `linear-gradient(135deg, ${colors.neonGold}30, ${colors.neonPurple}20)`,
      borderColor: colors.neonGold,
      capabilities: ['Visual Recognition', 'Auto-Tagging', 'Smart Cataloging'],
      origin: 'Ledger Book',
      evolution: 'AI Catalog',
      pattern: 'grid'
    },
    {
      id: 'process',
      path: '/process',
      title: 'Processing Engine',
      subtitle: 'Transformation Pipeline',
      description: 'Convert raw files and documents into structured, searchable intelligence using advanced AI processing workflows',
      icon: '⚡',
      iconAlt: '⚙️',
      gradient: `linear-gradient(135deg, ${colors.neonPurple}30, ${colors.neonPink}20)`,
      borderColor: colors.neonPurple,
      capabilities: ['AI Processing', 'Batch Operations', 'Smart Workflows'],
      origin: 'Manual Processing',
      evolution: 'Neural Pipeline',
      pattern: 'circuit'
    },
    {
      id: 'search',
      path: '/search',
      title: 'Search Matrix',
      subtitle: 'Semantic Discovery Engine',
      description: 'Find relevant information through meaning and context using vector search and advanced relevance algorithms',
      icon: '🔍',
      iconAlt: '🧠',
      gradient: `linear-gradient(135deg, ${colors.neonPink}30, ${colors.neonTeal}20)`,
      borderColor: colors.neonPink,
      capabilities: ['Vector Search', 'Relevance Scoring', 'Context Analysis'],
      origin: 'Card Catalog',
      evolution: 'Semantic Engine',
      pattern: 'web'
    }
  ];

  const quickActions = [
    { 
      id: 'upload', 
      path: '/process', 
      label: 'Upload & Process', 
      icon: '📤', 
      description: 'Add new documents',
      color: colors.neonTeal 
    },
    { 
      id: 'recent', 
      path: '/dashboard', 
      label: 'Recent Activity', 
      icon: '🕒', 
      description: 'View latest updates',
      color: colors.neonGold 
    },
    { 
      id: 'search', 
      path: '/search', 
      label: 'Search All', 
      icon: '🔎', 
      description: 'Find anything',
      color: colors.neonPurple 
    },
    { 
      id: 'export', 
      path: '/dashboard', 
      label: 'Export Data', 
      icon: '💾', 
      description: 'Download results',
      color: colors.neonPink 
    }
  ];

  const handlePortalClick = async (portal) => {
    setIsLoading(true);
    // Simulate loading time for enhanced UX
    setTimeout(() => {
      navigate(portal.path);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div css={styles.container}>
      {/* Neo-Deco-Rococo Background Canvas */}
      <div css={styles.backgroundCanvas}>
        {/* Art-Deco Grid System */}
        <div css={styles.geometricFoundation}>
          <div css={styles.artDecoGrid} />
          <div css={styles.symmetricPattern} />
        </div>
        
        {/* Rococo Ornamental Overlay */}
        <div css={styles.ornamentalLayer}>
          <div css={styles.rocaillePattern1} />
          <div css={styles.rocaillePattern2} />
          <div css={styles.floralMotif} />
        </div>
      </div>

      <main css={styles.mainContent}>
        {/* Command Center Header */}
        <header css={styles.commandHeader}>
          <div css={styles.titleConstellation}>
            <h1 css={styles.pageTitle}>
              <span css={styles.titleIcon}>🧠</span>
              <span css={styles.titleText}>Intelligence Command Center</span>
            </h1>
            
            {user && (
              <p css={styles.welcomeMessage}>
                Welcome back, <span css={styles.userName}>{user.displayName || user.email}</span>
                <span css={styles.statusIndicator}>🟢 System Active</span>
              </p>
            )}
          </div>
          
          <div css={styles.systemStatus}>
            <div css={styles.statusPanel}>
              <span css={styles.statusLabel}>AI Engine:</span>
              <span css={[styles.statusValue, styles.statusActive]}>Online</span>
            </div>
            <div css={styles.statusPanel}>
              <span css={styles.statusLabel}>Vector DB:</span>
              <span css={[styles.statusValue, styles.statusReady]}>Ready</span>
            </div>
          </div>
        </header>

        {/* Intelligence Portals Grid */}
        <section css={styles.portalsSection}>
          <h2 css={styles.sectionTitle}>
            <span css={styles.sectionIcon}>🌐</span>
            Intelligence Domains
          </h2>
          
          <div css={styles.portalsGrid}>
            {intelligencePortals.map((portal, index) => (
              <div
                key={portal.id}
                css={[
                  styles.portalCard,
                  activePortal === index && styles.portalActive,
                  { '--portal-border': portal.borderColor }
                ]}
                onClick={() => handlePortalClick(portal)}
              >
                {/* Portal Background Pattern */}
                <div css={[styles.portalBackground, { background: portal.gradient }]} />
                
                {/* Portal Header */}
                <div css={styles.portalHeader}>
                  <div css={styles.portalIconCluster}>
                    <span css={styles.primaryIcon}>{portal.icon}</span>
                    <span css={styles.secondaryIcon}>{portal.iconAlt}</span>
                  </div>
                  
                  <div css={styles.portalTitleGroup}>
                    <h3 css={styles.portalTitle}>{portal.title}</h3>
                    <p css={styles.portalSubtitle}>{portal.subtitle}</p>
                  </div>
                </div>

                {/* Portal Content */}
                <div css={styles.portalContent}>
                  <p css={styles.portalDescription}>
                    {portal.description}
                  </p>

                  {/* Capability Tags */}
                  <div css={styles.capabilityTags}>
                    {portal.capabilities.map((capability, idx) => (
                      <span key={idx} css={styles.capabilityTag}>
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evolution Indicator */}
                <div css={styles.evolutionPath}>
                  <div css={styles.evolutionLabel}>Evolution:</div>
                  <div css={styles.evolutionFlow}>
                    <span css={styles.originState}>{portal.origin}</span>
                    <span css={styles.evolutionArrow}>→</span>
                    <span css={styles.modernState}>{portal.evolution}</span>
                  </div>
                </div>

                {/* Portal Access Button */}
                <div css={styles.portalAccess}>
                  <button css={[styles.accessButton, { '--button-color': portal.borderColor }]}>
                    <span css={styles.buttonIcon}>🚀</span>
                    <span css={styles.buttonText}>Enter Domain</span>
                  </button>
                </div>
                
                {/* Hover Glow Effect */}
                <div css={styles.portalGlow} />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions Dashboard */}
        <section css={styles.quickActionsSection}>
          <h2 css={styles.sectionTitle}>
            <span css={styles.sectionIcon}>⚡</span>
            Quick Actions
          </h2>
          
          <div css={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.path}
                css={[styles.actionCard, { '--action-color': action.color }]}
              >
                <div css={styles.actionIcon}>{action.icon}</div>
                <div css={styles.actionContent}>
                  <h3 css={styles.actionTitle}>{action.label}</h3>
                  <p css={styles.actionDescription}>{action.description}</p>
                </div>
                <div css={styles.actionArrow}>→</div>
              </Link>
            ))}
          </div>
        </section>

        {/* System Insights Panel */}
        <section css={styles.insightsSection}>
          <h2 css={styles.sectionTitle}>
            <span css={styles.sectionIcon}>📊</span>
            System Insights
          </h2>
          
          <div css={styles.insightsGrid}>
            <div css={styles.insightCard}>
              <div css={styles.insightHeader}>
                <span css={styles.insightIcon}>📄</span>
                <h3 css={styles.insightTitle}>Documents</h3>
              </div>
              <div css={styles.insightValue}>0</div>
              <div css={styles.insightLabel}>Processed Files</div>
            </div>
            
            <div css={styles.insightCard}>
              <div css={styles.insightHeader}>
                <span css={styles.insightIcon}>📦</span>
                <h3 css={styles.insightTitle}>Inventory</h3>
              </div>
              <div css={styles.insightValue}>0</div>
              <div css={styles.insightLabel}>Cataloged Items</div>
            </div>
            
            <div css={styles.insightCard}>
              <div css={styles.insightHeader}>
                <span css={styles.insightIcon}>🔍</span>
                <h3 css={styles.insightTitle}>Searches</h3>
              </div>
              <div css={styles.insightValue}>0</div>
              <div css={styles.insightLabel}>Queries Executed</div>
            </div>
            
            <div css={styles.insightCard}>
              <div css={styles.insightHeader}>
                <span css={styles.insightIcon}>💾</span>
                <h3 css={styles.insightTitle}>Exports</h3>
              </div>
              <div css={styles.insightValue}>0</div>
              <div css={styles.insightLabel}>Data Downloads</div>
            </div>
          </div>
        </section>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div css={styles.loadingOverlay}>
          <div css={styles.loadingSpinner}>
            <div css={styles.spinnerRing} />
            <div css={styles.loadingText}>Accessing Intelligence Portal...</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Neo-Deco-Rococo Styling System for Home Page
const styles = {
  // Foundation Architecture
  container: css`
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    position: relative;
    overflow-x: hidden;
  `,

  backgroundCanvas: css`
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  `,

  // Art-Deco Geometric Foundation
  geometricFoundation: css`
    position: absolute;
    inset: 0;
    opacity: 0.1;
  `,

  artDecoGrid: css`
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(${colors.neonGold}20 1px, transparent 1px),
      linear-gradient(90deg, ${colors.neonGold}20 1px, transparent 1px);
    background-size: 80px 80px;
  `,

  symmetricPattern: css`
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 200px;
    background: linear-gradient(45deg, ${colors.neonTeal}15, transparent, ${colors.neonGold}15);
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  `,

  // Rococo Ornamental Layer
  ornamentalLayer: css`
    position: absolute;
    inset: 0;
    opacity: 0.08;
  `,

  rocaillePattern1: css`
    position: absolute;
    top: 15%;
    right: 10%;
    width: 120px;
    height: 120px;
    border: 3px solid ${colors.neonPurple};
    border-radius: 60% 40% 60% 40%;
    transform: rotate(45deg);
  `,

  rocaillePattern2: css`
    position: absolute;
    bottom: 25%;
    left: 8%;
    width: 100px;
    height: 100px;
    border: 2px solid ${colors.neonPink};
    border-radius: 30% 70% 30% 70%;
    transform: rotate(-30deg);
  `,

  floralMotif: css`
    position: absolute;
    top: 60%;
    right: 15%;
    width: 80px;
    height: 80px;
    border: 2px solid ${colors.neonTeal};
    border-radius: 50% 20% 50% 20%;
    transform: rotate(20deg);
  `,

  // Main Content Structure
  mainContent: css`
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 3rem 2rem;

    @media (max-width: 768px) {
      padding: 2rem 1rem;
    }
  `,

  // Command Header
  commandHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid ${colors.border};

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 2rem;
    }
  `,

  titleConstellation: css`
    flex: 1;
  `,

  pageTitle: css`
    font-size: 3rem;
    font-weight: 800;
    color: ${colors.neonGold};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
      font-size: 2.2rem;
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }
  `,

  titleIcon: css`
    font-size: 3.5rem;
    filter: drop-shadow(0 0 15px ${colors.neonGold}60);
    animation: pulse 3s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `,

  titleText: css`
    background: linear-gradient(135deg, ${colors.neonGold}, ${colors.neonTeal});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
  `,

  welcomeMessage: css`
    color: ${colors.textLight};
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    opacity: 0.9;

    @media (max-width: 768px) {
      justify-content: center;
      flex-wrap: wrap;
    }
  `,

  userName: css`
    color: ${colors.neonTeal};
    font-weight: 600;
  `,

  statusIndicator: css`
    color: ${colors.success};
    font-size: 0.9rem;
    background: ${colors.success}20;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    border: 1px solid ${colors.success}40;
  `,

  systemStatus: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 200px;

    @media (max-width: 768px) {
      flex-direction: row;
      justify-content: center;
      min-width: auto;
    }
  `,

  statusPanel: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${colors.surface};
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid ${colors.border};
  `,

  statusLabel: css`
    color: ${colors.textMuted};
    font-size: 0.9rem;
  `,

  statusValue: css`
    font-weight: 600;
    font-size: 0.9rem;
  `,

  statusActive: css`
    color: ${colors.success};
  `,

  statusReady: css`
    color: ${colors.neonTeal};
  `,

  // Sections
  sectionTitle: css`
    font-size: 2rem;
    font-weight: 700;
    color: ${colors.neonGold};
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
      font-size: 1.7rem;
      justify-content: center;
    }
  `,

  sectionIcon: css`
    font-size: 2.5rem;
    filter: drop-shadow(0 0 10px currentColor);
  `,

  // Portal Section
  portalsSection: css`
    margin-bottom: 4rem;
  `,

  portalsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  `,

  portalCard: css`
    position: relative;
    background: ${colors.surface};
    border: 2px solid ${colors.border};
    border-radius: 16px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.4s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-8px);
      border-color: var(--portal-border);
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 30px var(--portal-border)30;
    }

    &:hover .portalGlow {
      opacity: 1;
    }
  `,

  portalActive: css`
    border-color: var(--portal-border);
    transform: translateY(-4px);
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.3),
      0 0 25px var(--portal-border)20;
  `,

  portalBackground: css`
    position: absolute;
    inset: 0;
    opacity: 0.1;
    border-radius: 16px;
  `,

  portalHeader: css`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 2;
  `,

  portalIconCluster: css`
    position: relative;
    width: 60px;
    height: 60px;
  `,

  primaryIcon: css`
    position: absolute;
    top: 0;
    left: 0;
    font-size: 2.5rem;
    filter: drop-shadow(0 0 10px currentColor);
    transition: transform 0.3s ease;
  `,

  secondaryIcon: css`
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 1.5rem;
    opacity: 0.6;
    transition: all 0.3s ease;
  `,

  portalTitleGroup: css`
    flex: 1;
  `,

  portalTitle: css`
    color: ${colors.neonTeal};
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
  `,

  portalSubtitle: css`
    color: ${colors.textMuted};
    font-size: 0.9rem;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  portalContent: css`
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 2;
  `,

  portalDescription: css`
    color: ${colors.textLight};
    line-height: 1.6;
    margin-bottom: 1rem;
    opacity: 0.9;
  `,

  capabilityTags: css`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  `,

  capabilityTag: css`
    background: ${colors.neonTeal}20;
    color: ${colors.neonTeal};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid ${colors.neonTeal}40;
  `,

  evolutionPath: css`
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: ${colors.background}60;
    border-radius: 8px;
    border: 1px solid ${colors.border};
    position: relative;
    z-index: 2;
  `,

  evolutionLabel: css`
    color: ${colors.textMuted};
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  evolutionFlow: css`
    display: flex;
    align-items: center;
    gap: 1rem;
  `,

  originState: css`
    color: ${colors.textMuted};
    font-size: 0.9rem;
    opacity: 0.7;
  `,

  evolutionArrow: css`
    color: ${colors.neonGold};
    font-weight: bold;
  `,

  modernState: css`
    color: ${colors.neonGold};
    font-weight: 600;
    font-size: 0.9rem;
  `,

  portalAccess: css`
    position: relative;
    z-index: 2;
  `,

  accessButton: css`
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: 2px solid var(--button-color);
    border-radius: 8px;
    color: var(--button-color);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
      background: var(--button-color);
      color: ${colors.background};
      transform: translateY(-2px);
    }
  `,

  buttonIcon: css`
    font-size: 1.2rem;
  `,

  buttonText: css`
    font-size: 1rem;
  `,

  portalGlow: css`
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, var(--portal-border), transparent, var(--portal-border));
    border-radius: 16px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  `,

  // Quick Actions Section
  quickActionsSection: css`
    margin-bottom: 4rem;
  `,

  actionsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  `,

  actionCard: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      border-color: var(--action-color);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
  `,

  actionIcon: css`
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    background: var(--action-color)20;
    border-radius: 50%;
    border: 2px solid var(--action-color)40;
    color: var(--action-color);
  `,

  actionContent: css`
    flex: 1;
  `,

  actionTitle: css`
    color: ${colors.textLight};
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  `,

  actionDescription: css`
    color: ${colors.textMuted};
    margin: 0;
    font-size: 0.9rem;
  `,

  actionArrow: css`
    color: var(--action-color);
    font-size: 1.5rem;
    font-weight: bold;
    transition: transform 0.3s ease;
  `,

  // Insights Section
  insightsSection: css`
    margin-bottom: 4rem;
  `,

  insightsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  `,

  insightCard: css`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: 12px;
    padding: 2rem 1.5rem;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      border-color: ${colors.neonTeal};
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
  `,

  insightHeader: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  `,

  insightIcon: css`
    font-size: 1.5rem;
  `,

  insightTitle: css`
    color: ${colors.textLight};
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  `,

  insightValue: css`
    font-size: 2.5rem;
    font-weight: 800;
    color: ${colors.neonGold};
    margin-bottom: 0.5rem;
    line-height: 1;
  `,

  insightLabel: css`
    color: ${colors.textMuted};
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  // Loading Overlay
  loadingOverlay: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `,

  loadingSpinner: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  `,

  spinnerRing: css`
    width: 60px;
    height: 60px;
    border: 4px solid ${colors.border};
    border-top: 4px solid ${colors.neonTeal};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,

  loadingText: css`
    color: ${colors.neonTeal};
    font-size: 1.1rem;
    font-weight: 500;
  `,
};

export default HomePage;
