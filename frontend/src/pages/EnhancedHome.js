import { css } from '@emotion/react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/index';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';
import { colors } from '../styles/theme/colors';
import { typography } from '../styles/theme/typography';

/**
 * Enhanced Home Page Component
 * Component Genealogy: Control Center -> Command Bridge -> Data Observatory
 * Subverts traditional dashboard hierarchy by presenting tools as portals to knowledge
 */
const EnhancedHomePage = () => {
  const { user } = useContext(AuthContext);

  // Navigation portals - each represents a different aspect of document intelligence
  const navigationPortals = [
    {
      id: 'kaboodles',
      path: '/kaboodles',
      title: 'Kaboodle Archives',
      description: 'Organize and curate document collections with intelligent categorization systems',
      icon: '🗂️',
      color: colors.neonTeal,
      origin: 'Filing Cabinet',
      modern: 'Smart Collections',
      pattern: 'grid'
    },
    {
      id: 'documents',
      path: '/documents',
      title: 'Document Observatory',
      description: 'Explore your document universe with powerful analysis and search capabilities',
      icon: '📚',
      color: colors.neonGold,
      origin: 'Library Index',
      modern: 'Vector Database',
      pattern: 'radial'
    },
    {
      id: 'images',
      path: '/media-hub',
      title: 'Visual Intelligence',
      description: 'Process and analyze images with computer vision and pattern recognition',
      icon: '🖼️',
      color: colors.neonPurple,
      origin: 'Photo Album',
      modern: 'Neural Networks',
      pattern: 'hexagon'
    },
    {
      id: 'process',
      path: '/process',
      title: 'Processing Engine',
      description: 'Transform raw files into structured, searchable knowledge',
      icon: '⚡',
      color: colors.neonPink,
      origin: 'Manual Sorting',
      modern: 'AI Pipeline',
      pattern: 'circuit'
    }
  ];

  const quickActions = [
    { path: '/upload', label: 'Upload Documents', icon: '📤', color: colors.neonTeal },
    { path: '/search', label: 'Search Archive', icon: '🔍', color: colors.neonGold },
    { path: '/inventory', label: 'Inventory Control', icon: '📦', color: colors.neonPurple },
    { path: '/about', label: 'Learn More', icon: '💡', color: colors.neonPink }
  ];

  return (
    <div css={styles.container}>
      {/* Background geometric patterns */}
      <div css={styles.backgroundPattern}>
        <div css={styles.artDecoElement1} />
        <div css={styles.artDecoElement2} />
        <div css={styles.artDecoElement3} />
      </div>

      {/* Page header with user context */}
      <header css={styles.pageHeader}>
        <div css={styles.welcomeSection}>
          <h1 css={styles.pageTitle}>
            <span css={styles.titleMain}>Data Intelligence Center</span>
            {user && (
              <span css={styles.titleSub}>
                Welcome back, {user.displayName || user.email}
              </span>
            )}
          </h1>
          
          <p css={styles.pageDescription}>
            Your unified command center for document organization, analysis, and intelligence extraction. 
            Navigate through the portals below to access different facets of your data ecosystem.
          </p>
        </div>

        {/* Status indicators */}
        <div css={styles.statusIndicators}>
          <div css={[styles.statusItem, styles.statusActive]}>
            <span css={styles.statusIcon}>🟢</span>
            <span css={styles.statusLabel}>System Active</span>
          </div>
          <div css={[styles.statusItem, styles.statusReady]}>
            <span css={styles.statusIcon}>⚡</span>
            <span css={styles.statusLabel}>AI Ready</span>
          </div>
        </div>
      </header>

      {/* Main navigation portals */}
      <section css={styles.portalsSection}>
        <h2 css={styles.sectionTitle}>Intelligence Portals</h2>
        
        <div css={styles.portalsGrid}>
          {navigationPortals.map((portal) => (
            <Link
              key={portal.id}
              to={portal.path}
              css={[styles.portalCard, { '--portal-color': portal.color }]}
            >
              {/* Background pattern */}
              <div css={[styles.portalPattern, styles[`pattern${portal.pattern}`]]} />
              
              {/* Portal header */}
              <div css={styles.portalHeader}>
                <div css={styles.portalIcon}>
                  <span css={styles.iconGlyph}>{portal.icon}</span>
                  <div css={styles.iconGlow} />
                </div>
                
                <h3 css={styles.portalTitle}>{portal.title}</h3>
              </div>

              {/* Portal content */}
              <div css={styles.portalContent}>
                <p css={styles.portalDescription}>
                  {portal.description}
                </p>

                {/* Evolution indicator */}
                <div css={styles.evolutionIndicator}>
                  <span css={styles.evolutionLabel}>Evolution:</span>
                  <div css={styles.evolutionPath}>
                    <span css={styles.evolutionOrigin}>{portal.origin}</span>
                    <span css={styles.evolutionArrow}>→</span>
                    <span css={styles.evolutionModern}>{portal.modern}</span>
                  </div>
                </div>
              </div>

              {/* Portal activation indicator */}
              <div css={styles.portalActivator}>
                <span css={styles.activatorText}>Enter Portal</span>
                <div css={styles.activatorGlow} />
              </div>

              {/* Hover effects */}
              <div css={styles.portalHoverEffect} />
            </Link>
          ))}
        </div>
      </section>

      {/* Quick actions bar */}
      <section css={styles.quickActionsSection}>
        <h2 css={styles.sectionTitle}>Quick Access</h2>
        
        <div css={styles.quickActionsBar}>
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              css={[styles.quickActionButton, { '--action-color': action.color }]}
            >
              <span css={styles.actionIcon}>{action.icon}</span>
              <span css={styles.actionLabel}>{action.label}</span>
              <div css={styles.actionRipple} />
            </Link>
          ))}
        </div>
      </section>

      {/* System insights */}
      <section css={styles.insightsSection}>
        <div css={[neoDecorocoBase.panel, styles.insightsPanel]}>
          <h3 css={styles.insightsTitle}>System Insights</h3>
          
          <div css={styles.insightsGrid}>
            <div css={styles.insightItem}>
              <span css={styles.insightIcon}>🧠</span>
              <div css={styles.insightContent}>
                <h4 css={styles.insightLabel}>AI Analysis</h4>
                <p css={styles.insightValue}>Ready for Processing</p>
              </div>
            </div>
            
            <div css={styles.insightItem}>
              <span css={styles.insightIcon}>🔍</span>
              <div css={styles.insightContent}>
                <h4 css={styles.insightLabel}>Search Engine</h4>
                <p css={styles.insightValue}>Vector Database Online</p>
              </div>
            </div>
            
            <div css={styles.insightItem}>
              <span css={styles.insightIcon}>📊</span>
              <div css={styles.insightContent}>
                <h4 css={styles.insightLabel}>Data Pipeline</h4>
                <p css={styles.insightValue}>All Systems Operational</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: css`
    position: relative;
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    padding: ${layout.spacing.xl} ${layout.spacing.lg};
    overflow-x: hidden;

    ${layout.media.mobile} {
      padding: ${layout.spacing.lg} ${layout.spacing.md};
    }
  `,

  /* Background decorative elements */
  backgroundPattern: css`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  `,

  artDecoElement1: css`
    position: absolute;
    top: 10%;
    right: 5%;
    width: 300px;
    height: 300px;
    background: linear-gradient(45deg, 
      ${colors.neonTeal}08 0%, 
      transparent 50%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    animation: rotateElement 30s linear infinite;
  `,

  artDecoElement2: css`
    position: absolute;
    bottom: 20%;
    left: 10%;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, 
      ${colors.neonGold}06 0%, 
      transparent 60%);
    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
    animation: floatElement 20s ease-in-out infinite;
  `,

  artDecoElement3: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 100px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${colors.neonPurple}04 50%, 
      transparent 100%);
    animation: pulseElement 15s ease-in-out infinite alternate;
  `,

  /* Page header */
  pageHeader: css`
    position: relative;
    z-index: 1;
    text-align: center;
    margin-bottom: ${layout.spacing['4xl']};
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  `,

  welcomeSection: css`
    margin-bottom: ${layout.spacing['2xl']};
  `,

  pageTitle: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: ${layout.spacing.xl};
  `,

  titleMain: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['5xl']};
    font-weight: ${typography.weights.black};
    color: ${colors.neonGold};
    text-shadow: 
      0 0 30px ${colors.neonGold}60,
      0 0 60px ${colors.neonGold}30;
    letter-spacing: 0.05em;
    margin-bottom: ${layout.spacing.md};

    ${layout.media.mobile} {
      font-size: ${typography.sizes['3xl']};
    }
  `,

  titleSub: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.xl};
    color: ${colors.neonTeal};
    font-weight: ${typography.weights.medium};
    text-shadow: 0 0 15px ${colors.neonTeal}40;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.lg};
    }
  `,

  pageDescription: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.lg};
    color: ${colors.textLight};
    line-height: ${typography.lineHeights.relaxed};
    max-width: 700px;
    margin: 0 auto;
    opacity: 0.9;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.base};
    }
  `,

  /* Status indicators */
  statusIndicators: css`
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.xl};
    flex-wrap: wrap;
  `,

  statusItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    border-radius: ${layout.borderRadius.full};
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid ${colors.border};
  `,

  statusActive: css`
    border-color: ${colors.neonGreen};
    background: rgba(57, 255, 20, 0.1);
  `,

  statusReady: css`
    border-color: ${colors.neonBlue};
    background: rgba(0, 162, 255, 0.1);
  `,

  statusIcon: css`
    font-size: ${typography.sizes.base};
  `,

  statusLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textLight};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  /* Portals section */
  portalsSection: css`
    position: relative;
    z-index: 1;
    margin-bottom: ${layout.spacing['4xl']};
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  `,

  sectionTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    color: ${colors.neonTeal};
    text-align: center;
    margin-bottom: ${layout.spacing['2xl']};
    text-shadow: 0 0 20px ${colors.neonTeal}50;

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  portalsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: ${layout.spacing['2xl']};

    ${layout.media.mobile} {
      grid-template-columns: 1fr;
      gap: ${layout.spacing.xl};
    }
  `,

  portalCard: css`
    ${neoDecorocoBase.panel};
    position: relative;
    display: block;
    padding: ${layout.spacing['2xl']};
    text-decoration: none;
    color: inherit;
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.9) 0%, 
      rgba(26, 26, 46, 0.95) 100%);
    border: 2px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

    &:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: var(--portal-color);
      
      .portal-hover-effect {
        opacity: 1;
      }
      
      .portal-activator {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  /* Portal patterns */
  portalPattern: css`
    position: absolute;
    inset: 0;
    opacity: 0.05;
    z-index: 1;
  `,

  patterngrid: css`
    background-image: 
      linear-gradient(var(--portal-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--portal-color) 1px, transparent 1px);
    background-size: 20px 20px;
  `,

  patternradial: css`
    background-image: 
      radial-gradient(circle at center, var(--portal-color) 1px, transparent 2px);
    background-size: 25px 25px;
  `,

  patternhexagon: css`
    background-image: 
      radial-gradient(circle at 25% 25%, var(--portal-color) 2px, transparent 3px),
      radial-gradient(circle at 75% 75%, var(--portal-color) 2px, transparent 3px);
    background-size: 30px 30px;
  `,

  patterncircuit: css`
    background-image: 
      linear-gradient(45deg, transparent 45%, var(--portal-color) 45%, var(--portal-color) 55%, transparent 55%),
      linear-gradient(-45deg, transparent 45%, var(--portal-color) 45%, var(--portal-color) 55%, transparent 55%);
    background-size: 15px 15px;
  `,

  /* Portal content */
  portalHeader: css`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.xl};
  `,

  portalIcon: css`
    position: relative;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, var(--portal-color)20 0%, transparent 70%);
    border: 2px solid var(--portal-color);
    border-radius: 50%;
    overflow: hidden;
  `,

  iconGlyph: css`
    font-size: ${typography.sizes['2xl']};
    z-index: 2;
  `,

  iconGlow: css`
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, var(--portal-color)30 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  portalTitle: css`
    font-family: ${typography.fonts.heading};
    font-size: ${typography.sizes['2xl']};
    color: var(--portal-color);
    margin: 0;
    text-shadow: 0 0 15px var(--portal-color);

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
  `,

  portalContent: css`
    position: relative;
    z-index: 2;
  `,

  portalDescription: css`
    font-family: ${typography.fonts.primary};
    color: ${colors.textLight};
    line-height: ${typography.lineHeights.relaxed};
    margin-bottom: ${layout.spacing.lg};
    opacity: 0.9;
  `,

  evolutionIndicator: css`
    padding: ${layout.spacing.md};
    background: rgba(0, 0, 0, 0.3);
    border-radius: ${layout.borderRadius.md};
    border-left: 3px solid var(--portal-color);
  `,

  evolutionLabel: css`
    display: block;
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: ${layout.spacing.sm};
  `,

  evolutionPath: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    flex-wrap: wrap;
  `,

  evolutionOrigin: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    color: ${colors.textLight};
    opacity: 0.7;
    font-style: italic;
  `,

  evolutionArrow: css`
    color: var(--portal-color);
    font-weight: ${typography.weights.bold};
  `,

  evolutionModern: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    color: var(--portal-color);
    font-weight: ${typography.weights.semibold};
  `,

  portalActivator: css`
    position: absolute;
    bottom: ${layout.spacing.lg};
    right: ${layout.spacing.lg};
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    background: linear-gradient(135deg, var(--portal-color)20, var(--portal-color)10);
    border: 1px solid var(--portal-color);
    border-radius: ${layout.borderRadius.full};
    color: var(--portal-color);
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 3;
  `,

  activatorText: css`
    position: relative;
    z-index: 2;
  `,

  activatorGlow: css`
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, var(--portal-color)30 0%, transparent 70%);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  portalHoverEffect: css`
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, 
      var(--portal-color)20 0%, 
      transparent 50%, 
      var(--portal-color)20 100%);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  `,

  /* Quick actions */
  quickActionsSection: css`
    position: relative;
    z-index: 1;
    margin-bottom: ${layout.spacing['4xl']};
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  `,

  quickActionsBar: css`
    display: flex;
    gap: ${layout.spacing.lg};
    justify-content: center;
    flex-wrap: wrap;
  `,

  quickActionButton: css`
    position: relative;
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.md} ${layout.spacing.xl};
    background: transparent;
    border: 2px solid var(--action-color);
    border-radius: ${layout.borderRadius.full};
    color: var(--action-color);
    text-decoration: none;
    font-family: ${typography.fonts.primary};
    font-weight: ${typography.weights.semibold};
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      background: linear-gradient(135deg, var(--action-color)20, var(--action-color)10);
      transform: translateY(-3px);
      box-shadow: 0 10px 20px var(--action-color)30;
    }
  `,

  actionIcon: css`
    font-size: ${typography.sizes.lg};
  `,

  actionLabel: css`
    position: relative;
    z-index: 2;
  `,

  actionRipple: css`
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, var(--action-color)30 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  /* Insights section */
  insightsSection: css`
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
  `,

  insightsPanel: css`
    padding: ${layout.spacing['2xl']};
    text-align: center;
  `,

  insightsTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonTeal};
    margin-bottom: ${layout.spacing.xl};
    text-shadow: 0 0 15px ${colors.neonTeal}40;
  `,

  insightsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${layout.spacing.lg};
  `,

  insightItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.lg};
    background: rgba(0, 0, 0, 0.2);
    border-radius: ${layout.borderRadius.md};
    border: 1px solid ${colors.border};
  `,

  insightIcon: css`
    font-size: ${typography.sizes['2xl']};
    filter: drop-shadow(0 0 10px currentColor);
  `,

  insightContent: css`
    text-align: left;
  `,

  insightLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 ${layout.spacing.xs} 0;
  `,

  insightValue: css`
    font-family: ${typography.fonts.primary};
    color: ${colors.textLight};
    margin: 0;
    opacity: 0.9;
  `,

  /* Animations */
  '@keyframes rotateElement': css`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `,

  '@keyframes floatElement': css`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  `,

  '@keyframes pulseElement': css`
    0% { opacity: 0.3; transform: scaleX(1); }
    100% { opacity: 0.8; transform: scaleX(1.2); }
  `,
};

export default EnhancedHomePage;
