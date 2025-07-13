import { css } from '@emotion/react';
import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/index';
import BartlebyMain from '../components/main/BartlebyMain';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';
import { colors } from '../styles/theme/colors';
import { typography } from '../styles/theme/typography';

/**
 * Enhanced Home Page Component
 * Component Genealogy: Control Center -> Command Bridge -> Data Observatory
 * Now features the tripartitioned BartlebyMain with enhanced rolodex
 */
const EnhancedHomePage = () => {
  const { user } = useContext(AuthContext);
  const [inventory, setInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sample data for demonstration
  useEffect(() => {
    // Simulate loading delay for realistic experience
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample inventory data
      const sampleInventory = [
        {
          id: 1,
          name: 'Research Document Analysis',
          description: 'AI-powered analysis of research papers and academic documents',
          status: 'processed',
          file_type: 'pdf',
          image_url: '/placeholder.png',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Financial Reports Q3',
          description: 'Quarterly financial data and market analysis',
          status: 'processed',
          file_type: 'xlsx',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Product Design Mockups',
          description: 'UI/UX design concepts and wireframes',
          status: 'pending',
          file_type: 'png',
          image_url: '/placeholder.png',
          created_at: new Date().toISOString()
        }
      ];

      // Sample documents data
      const sampleDocuments = [
        {
          id: 1,
          title: 'Machine Learning Research',
          content: 'Advanced neural network architectures for document processing',
          indexed: true,
          category: 'Research',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Business Strategy 2024',
          content: 'Strategic planning and market positioning for next year',
          indexed: true,
          category: 'Business',
          created_at: new Date().toISOString()
        }
      ];

      setInventory(sampleInventory);
      setDocuments(sampleDocuments);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleDataRefresh = () => {
    // Simulate data refresh
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div css={styles.loadingContainer}>
        <div css={styles.loadingSpinner}>
          <span css={styles.spinnerIcon}>🧠</span>
          <p css={styles.loadingText}>Initializing Data Observatory...</p>
        </div>
      </div>
    );
  }

  return (
    <BartlebyMain
      inventory={inventory}
      documents={documents}
      onDataRefresh={handleDataRefresh}
      autoRotateRolodex={true}
    />
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

  /* Loading states */
  loadingContainer: css`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
  `,

  loadingSpinner: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.xl};
    text-align: center;
  `,

  spinnerIcon: css`
    font-size: ${typography.sizes['6xl']};
    animation: spinnerRotate 2s linear infinite;
    filter: drop-shadow(0 0 20px ${colors.neonTeal});

    @keyframes spinnerRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    ${layout.media.mobile} {
      font-size: ${typography.sizes['4xl']};
    }
  `,

  loadingText: css`
    margin: 0;
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonTeal};
    text-shadow: 0 0 15px ${colors.neonTeal}50;
    animation: textPulse 1.5s ease-in-out infinite alternate;

    @keyframes textPulse {
      from { opacity: 0.6; }
      to { opacity: 1; }
    }

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
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
