import { css } from '@emotion/react';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HowToUseOverlay from '../components/common/HowToUseOverlay';
import { AuthContext } from '../contexts/auth/index';
import layout from '../styles/layouts/constraints';
import { colors } from '../styles/theme/colors';
import { typography } from '../styles/theme/typography';

/**
 * Neo-Deco-Rococo Dashboard
 * Architectural Vision: Command Center -> Digital Throne Room -> Intelligence Hub
 * Presents user statistics and actions through a regal, technological interface
 */

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showHowTo, setShowHowTo] = useState(false);
  
  // Placeholder stats (in a real app, these would come from API calls)
  const stats = {
    documentsProcessed: 0,
    inventoryItems: 0,
    recentActivity: []
  };

  return (
    <div css={styles.container}>
      {/* Neo-Deco Header with Royal Greeting */}
      <div css={styles.welcomeSection}>
        <div css={styles.crownIcon}>👑</div>
        <h1 css={styles.welcomeTitle}>
          Welcome back, <span css={styles.userName}>{user?.name || 'Digital Archivist'}</span>
        </h1>
        <p css={styles.welcomeSubtitle}>
          Your AI-powered intelligence command center awaits your direction
        </p>
        <div css={styles.statusIndicator}>
          <div css={styles.statusDot} />
          <span css={styles.statusText}>System Active & Ready</span>
        </div>
      </div>

      {/* Command Portal Actions */}
      <div css={styles.quickActions}>
        <h2 css={styles.sectionTitle}>
          <span css={styles.sectionIcon}>⚡</span>
          Command Portals
        </h2>
        
        <div css={styles.actionCards}>
          <div 
            css={[styles.actionCard, styles.primaryAction]}
            onClick={() => navigate('/process')}
          >
            <div css={styles.actionIcon}>⚙️</div>
            <h3 css={styles.actionTitle}>Process Intelligence</h3>
            <p css={styles.actionDescription}>
              Upload and transform documents with AI analysis
            </p>
            <button css={[styles.actionButton, styles.primaryButton]}>
              <span>Initiate Processing</span>
              <div css={styles.buttonGlow} />
            </button>
          </div>
          
          <div 
            css={[styles.actionCard, styles.secondaryAction]}
            onClick={() => navigate('/inventory')}
          >
            <div css={styles.actionIcon}>📦</div>
            <h3 css={styles.actionTitle}>Archive Vault</h3>
            <p css={styles.actionDescription}>
              Browse your curated catalog of digital assets
            </p>
            <button css={[styles.actionButton, styles.secondaryButton]}>
              <span>Open Vault</span>
              <div css={styles.buttonGlow} />
            </button>
          </div>
          
          <div 
            css={[styles.actionCard, styles.tertiaryAction]}
            onClick={() => navigate('/documents')}
          >
            <div css={styles.actionIcon}>📄</div>
            <h3 css={styles.actionTitle}>Document Library</h3>
            <p css={styles.actionDescription}>
              Access your intelligent document collection
            </p>
            <button css={[styles.actionButton, styles.tertiaryButton]}>
              <span>Browse Library</span>
              <div css={styles.buttonGlow} />
            </button>
          </div>
          
          <div 
            css={[styles.actionCard, styles.helpAction]}
            onClick={() => setShowHowTo(true)}
          >
            <div css={styles.actionIcon}>❓</div>
            <h3 css={styles.actionTitle}>Guidance Portal</h3>
            <p css={styles.actionDescription}>
              Master the art of digital organization
            </p>
            <button css={[styles.actionButton, styles.helpButton]}>
              <span>Seek Wisdom</span>
              <div css={styles.buttonGlow} />
            </button>
          </div>
        </div>
      </div>

      {/* Imperial Statistics */}
      <div css={styles.statsSection}>
        <h2 css={styles.sectionTitle}>
          <span css={styles.sectionIcon}>📊</span>
          Intelligence Metrics
        </h2>
        
        <div css={styles.statsGrid}>
          <div css={[styles.statCard, styles.documentsCard]}>
            <div css={styles.statIcon}>📄</div>
            <h3 css={styles.statTitle}>Documents Processed</h3>
            <div css={styles.statValue}>{stats.documentsProcessed}</div>
            <div css={styles.statProgress}>
              <div css={styles.progressBar} style={{ width: '65%' }} />
            </div>
          </div>
          
          <div css={[styles.statCard, styles.inventoryCard]}>
            <div css={styles.statIcon}>📦</div>
            <h3 css={styles.statTitle}>Archive Items</h3>
            <div css={styles.statValue}>{stats.inventoryItems}</div>
            <div css={styles.statProgress}>
              <div css={styles.progressBar} style={{ width: '40%' }} />
            </div>
          </div>
          
          <div css={[styles.statCard, styles.efficiencyCard]}>
            <div css={styles.statIcon}>⚡</div>
            <h3 css={styles.statTitle}>Processing Efficiency</h3>
            <div css={styles.statValue}>98%</div>
            <div css={styles.statProgress}>
              <div css={styles.progressBar} style={{ width: '98%' }} />
            </div>
          </div>
          
          <div css={[styles.statCard, styles.storageCard]}>
            <div css={styles.statIcon}>💾</div>
            <h3 css={styles.statTitle}>Storage Utilized</h3>
            <div css={styles.statValue}>2.4GB</div>
            <div css={styles.statProgress}>
              <div css={styles.progressBar} style={{ width: '24%' }} />
            </div>
          </div>
        </div>
      </div>

      <div css={styles.recentSection}>
        <h2 css={styles.sectionTitle}>Recent Activity</h2>
        
        {stats.recentActivity.length === 0 ? (
          <div css={styles.emptyState}>
            <p css={styles.emptyMessage}>
              No recent activity. Start by processing some files!
            </p>
            <Link to="/process" css={styles.emptyActionButton}>
              Process Files Now
            </Link>
          </div>
        ) : (
          <div css={styles.activityList}>
            {stats.recentActivity.map((_activity, index) => (
              <div key={index} css={styles.activityItem}>
                {/* Activity content */}
              </div>
            ))}
          </div>
        )}
      </div>

      <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
    </div>
  );
};

const styles = {
  // Main container with Neo-Deco background
  container: css`
    position: relative;
    min-height: calc(100vh - 80px);
    padding: ${layout.spacing['2xl']};
    background: ${colors.darkGradient};
    overflow: hidden;

    ${layout.media.mobile} {
      padding: ${layout.spacing.lg};
    }

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 20%, ${colors.neonTeal}15 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, ${colors.neonGold}10 0%, transparent 50%),
        radial-gradient(circle at 40% 70%, ${colors.neonPurple}08 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }
  `,

  // Welcome section with royal treatment
  welcomeSection: css`
    position: relative;
    z-index: 1;
    text-align: center;
    margin-bottom: ${layout.spacing['3xl']};
    padding: ${layout.spacing['2xl']} 0;
  `,

  crownIcon: css`
    font-size: ${typography.sizes['4xl']};
    margin-bottom: ${layout.spacing.lg};
    filter: drop-shadow(0 0 20px ${colors.neonGold});
    animation: crownFloat 6s ease-in-out infinite;

    @keyframes crownFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(2deg); }
    }
  `,

  welcomeTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    color: ${colors.textLight};
    margin-bottom: ${layout.spacing.md};
    line-height: ${typography.lineHeights.tight};

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  userName: css`
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    font-weight: ${typography.weights.bold};
    text-shadow: 0 0 30px ${colors.neonGold}40;
  `,

  welcomeSubtitle: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.lg};
    color: ${colors.textMuted};
    margin-bottom: ${layout.spacing.lg};
    font-style: italic;
  `,

  statusIndicator: css`
    display: inline-flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    background: rgba(64, 224, 208, 0.1);
    border: 1px solid ${colors.neonTeal};
    border-radius: ${layout.borderRadius.full};
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.neonTeal};
  `,

  statusDot: css`
    width: 8px;
    height: 8px;
    background: ${colors.neonTeal};
    border-radius: 50%;
    animation: statusPulse 2s ease-in-out infinite;

    @keyframes statusPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }
  `,

  statusText: css`
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  // Section styling
  quickActions: css`
    position: relative;
    z-index: 1;
    margin-bottom: ${layout.spacing['3xl']};
  `,

  sectionTitle: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonTeal};
    margin-bottom: ${layout.spacing['2xl']};
    text-align: center;
    justify-content: center;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
  `,

  sectionIcon: css`
    font-size: ${typography.sizes['2xl']};
    filter: drop-shadow(0 0 10px currentColor);
  `,

  // Action cards grid
  actionCards: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${layout.spacing.xl};
    margin-bottom: ${layout.spacing['2xl']};
  `,

  actionCard: css`
    position: relative;
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid transparent;
    border-radius: ${layout.borderRadius.lg};
    padding: ${layout.spacing['2xl']};
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        transparent 50%, 
        rgba(255, 255, 255, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::before {
      opacity: 1;
    }
  `,

  primaryAction: css`
    border-color: ${colors.neonTeal};
    &:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${colors.neonTeal}30;
    }
  `,

  secondaryAction: css`
    border-color: ${colors.neonGold};
    &:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${colors.neonGold}30;
    }
  `,

  tertiaryAction: css`
    border-color: ${colors.neonPurple};
    &:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${colors.neonPurple}30;
    }
  `,

  helpAction: css`
    border-color: ${colors.neonPink};
    &:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${colors.neonPink}30;
    }
  `,

  actionIcon: css`
    font-size: ${typography.sizes['3xl']};
    margin-bottom: ${layout.spacing.lg};
    filter: drop-shadow(0 0 15px currentColor);
  `,

  actionTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes.xl};
    color: ${colors.textLight};
    margin-bottom: ${layout.spacing.md};
  `,

  actionDescription: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    color: ${colors.textMuted};
    margin-bottom: ${layout.spacing.xl};
    line-height: ${typography.lineHeights.relaxed};
  `,

  actionButton: css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: ${layout.spacing.md} ${layout.spacing.xl};
    border: 2px solid currentColor;
    border-radius: ${layout.borderRadius.md};
    background: transparent;
    color: inherit;
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    font-weight: ${typography.weights.semibold};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      background: currentColor;
      color: ${colors.background};
      transform: translateY(-2px);
    }
  `,

  primaryButton: css`
    color: ${colors.neonTeal};
  `,

  secondaryButton: css`
    color: ${colors.neonGold};
  `,

  tertiaryButton: css`
    color: ${colors.neonPurple};
  `,

  helpButton: css`
    color: ${colors.neonPink};
  `,

  buttonGlow: css`
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.2) 0%, 
      transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;

    .actionButton:hover & {
      opacity: 1;
    }
  `,

  // Statistics section
  statsSection: css`
    position: relative;
    z-index: 1;
    margin-bottom: ${layout.spacing['3xl']};
  `,

  statsGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${layout.spacing.xl};
  `,

  statCard: css`
    position: relative;
    background: rgba(26, 26, 26, 0.9);
    backdrop-filter: blur(15px);
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    padding: ${layout.spacing.xl};
    text-align: center;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-5px);
      border-color: currentColor;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }
  `,

  documentsCard: css`
    color: ${colors.neonTeal};
  `,

  inventoryCard: css`
    color: ${colors.neonGold};
  `,

  efficiencyCard: css`
    color: ${colors.neonPurple};
  `,

  storageCard: css`
    color: ${colors.neonPink};
  `,

  statIcon: css`
    font-size: ${typography.sizes['2xl']};
    margin-bottom: ${layout.spacing.md};
    filter: drop-shadow(0 0 10px currentColor);
  `,

  statTitle: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textMuted};
    margin-bottom: ${layout.spacing.sm};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  statValue: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    color: currentColor;
    margin-bottom: ${layout.spacing.md};
    text-shadow: 0 0 20px currentColor;
  `,

  statProgress: css`
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${layout.borderRadius.full};
    overflow: hidden;
  `,

  progressBar: css`
    height: 100%;
    background: linear-gradient(90deg, currentColor, rgba(255, 255, 255, 0.8));
    border-radius: ${layout.borderRadius.full};
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  `,

  // Recent activity section
  recentSection: css`
    position: relative;
    z-index: 1;
  `,

  emptyState: css`
    text-align: center;
    padding: ${layout.spacing['3xl']};
    background: rgba(26, 26, 26, 0.6);
    backdrop-filter: blur(10px);
    border: 2px dashed ${colors.border};
    border-radius: ${layout.borderRadius.lg};
  `,

  emptyMessage: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.lg};
    color: ${colors.textMuted};
    margin-bottom: ${layout.spacing.xl};
    font-style: italic;
  `,

  emptyActionButton: css`
    display: inline-flex;
    align-items: center;
    padding: ${layout.spacing.md} ${layout.spacing.xl};
    background: linear-gradient(135deg, ${colors.neonTeal} 0%, ${colors.neonBlue} 100%);
    border: 2px solid ${colors.neonTeal};
    border-radius: ${layout.borderRadius.md};
    color: ${colors.background};
    text-decoration: none;
    font-family: ${typography.fonts.primary};
    font-weight: ${typography.weights.semibold};
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 30px ${colors.neonTeal}40;
    }
  `,

  activityList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
  `,

  activityItem: css`
    padding: ${layout.spacing.lg};
    background: rgba(26, 26, 26, 0.8);
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.md};
    transition: all 0.3s ease;

    &:hover {
      border-color: ${colors.neonTeal};
      transform: translateX(5px);
    }
  `,
  
  contentArea: css`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: relative;
    z-index: 1;
  `,
  
  actionsPanel: css`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
      justify-content: center;
    }
  `,

  rolodexContainer: css`
    background: rgba(26, 26, 26, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 2rem;
    border: 1px solid rgba(64, 224, 208, 0.2);
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(64, 224, 208, 0.1);
    min-height: 500px;
  `
};

export default Dashboard;