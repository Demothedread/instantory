import { css } from '@emotion/react';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

/**
 * Features Section Component
 * Component Genealogy: Filing Cabinet -> Data Organizer -> Intelligence Hub
 * Subverts traditional feature lists by presenting capabilities as interconnected systems
 */
const FeaturesSection = () => {
  const features = [
    {
      id: 'analysis',
      icon: '🧠',
      title: 'Neural Analysis',
      description: 'AI-powered document processing with deep text extraction, summarization, and contextual understanding',
      capability: 'Text Recognition',
      origin: 'Analog: Librarian\'s Index Cards',
      modern: 'Digital: Vector Embeddings',
      color: colors.neonTeal,
      pattern: 'circuit'
    },
    {
      id: 'inventory',
      icon: '📦',
      title: 'Smart Cataloging',
      description: 'Automated inventory management with visual recognition, categorization, and relationship mapping',
      capability: 'Object Detection',
      origin: 'Analog: Warehouse Ledger',
      modern: 'Digital: Computer Vision',
      color: colors.neonGold,
      pattern: 'grid'
    },
    {
      id: 'search',
      icon: '🔍',
      title: 'Vector Search',
      description: 'Find relevant content instantly using semantic search technology that understands meaning and context',
      capability: 'Semantic Understanding',
      origin: 'Analog: Card Catalog',
      modern: 'Digital: Neural Networks',
      color: colors.neonPurple,
      pattern: 'web'
    },
    {
      id: 'synthesis',
      icon: '⚡',
      title: 'Data Synthesis',
      description: 'Combine insights across documents to reveal patterns, trends, and hidden connections in your data',
      capability: 'Pattern Recognition',
      origin: 'Analog: Research Notes',
      modern: 'Digital: Graph Analysis',
      color: colors.neonPink,
      pattern: 'organic'
    }
  ];

  return (
    <section css={styles.container}>
      {/* Section header with Art-Deco styling */}
      <div css={styles.header}>
        <h2 css={styles.title}>Core Intelligence Systems</h2>
        <p css={styles.subtitle}>
          Transforming traditional document workflows into intelligent data ecosystems
        </p>
        
        {/* Art-Deco divider */}
        <div css={styles.divider}>
          <div css={styles.dividerLine} />
          <div css={styles.dividerCenter}>
            <span css={styles.dividerIcon}>◆</span>
          </div>
          <div css={styles.dividerLine} />
        </div>
      </div>

      {/* Features grid with masonry-style layout */}
      <div css={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={feature.id} css={[styles.featureCard, styles[`card${index + 1}`]]}>
            {/* Background pattern based on feature type */}
            <div css={[styles.cardPattern, styles[`pattern${feature.pattern}`]]} />
            
            {/* Feature icon with ornate frame */}
            <div css={[styles.iconContainer, { '--accent-color': feature.color }]}>
              <div css={styles.iconFrame}>
                <span css={styles.icon}>{feature.icon}</span>
              </div>
              
              {/* Rococo decorative elements */}
              <div css={styles.iconFlourish1} />
              <div css={styles.iconFlourish2} />
            </div>

            {/* Feature content */}
            <div css={styles.cardContent}>
              <h3 css={[styles.featureTitle, { color: feature.color }]}>
                {feature.title}
              </h3>
              
              <p css={styles.featureDescription}>
                {feature.description}
              </p>

              {/* Component genealogy display */}
              <div css={styles.genealogy}>
                <div css={styles.genealogyItem}>
                  <span css={styles.genealogyLabel}>Origin:</span>
                  <span css={styles.genealogyValue}>{feature.origin}</span>
                </div>
                <div css={styles.genealogyArrow}>→</div>
                <div css={styles.genealogyItem}>
                  <span css={styles.genealogyLabel}>Modern:</span>
                  <span css={styles.genealogyValue}>{feature.modern}</span>
                </div>
              </div>

              {/* Capability badge */}
              <div css={[styles.capabilityBadge, { '--badge-color': feature.color }]}>
                {feature.capability}
              </div>
            </div>

            {/* Hover glow effect */}
            <div css={[styles.cardGlow, { '--glow-color': feature.color }]} />
          </div>
        ))}
      </div>

      {/* Integration showcase */}
      <div css={styles.integrationShowcase}>
        <h3 css={styles.integrationTitle}>Syncretic Integration</h3>
        <p css={styles.integrationDesc}>
          These systems work together to create a unified intelligence layer that learns from your data patterns
        </p>
        
        {/* Interconnection visualization */}
        <div css={styles.connectionMap}>
          <svg css={styles.connectionSvg} viewBox="0 0 400 200">
            {/* Connection lines between features */}
            <defs>
              <linearGradient id="connection1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.neonTeal} stopOpacity="0.6" />
                <stop offset="100%" stopColor={colors.neonGold} stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="connection2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.neonGold} stopOpacity="0.6" />
                <stop offset="100%" stopColor={colors.neonPurple} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            
            <path
              d="M50,50 Q200,25 350,50"
              stroke="url(#connection1)"
              strokeWidth="2"
              fill="none"
              css={styles.connectionPath}
            />
            <path
              d="M50,150 Q200,175 350,150"
              stroke="url(#connection2)"
              strokeWidth="2"
              fill="none"
              css={styles.connectionPath}
            />
            <path
              d="M50,50 Q125,100 50,150"
              stroke={colors.neonTeal}
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
              css={styles.connectionPath}
            />
            <path
              d="M350,50 Q275,100 350,150"
              stroke={colors.neonPurple}
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
              css={styles.connectionPath}
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

const styles = {
  container: css`
    position: relative;
    padding: ${layout.spacing['4xl']} ${layout.spacing.lg};
    max-width: 1400px;
    margin: 0 auto;

    ${layout.media.mobile} {
      padding: ${layout.spacing['2xl']} ${layout.spacing.md};
    }
  `,

  header: css`
    text-align: center;
    margin-bottom: ${layout.spacing['4xl']};
  `,

  title: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['4xl']};
    font-weight: ${typography.weights.bold};
    color: ${colors.neonGold};
    text-shadow: 
      0 0 20px ${colors.neonGold}60,
      0 0 40px ${colors.neonGold}30;
    margin-bottom: ${layout.spacing.lg};
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes['3xl']};
    }
  `,

  subtitle: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.xl};
    color: ${colors.textLight};
    max-width: 600px;
    margin: 0 auto ${layout.spacing.xl} auto;
    opacity: 0.9;
    line-height: ${typography.lineHeights.relaxed};

    ${layout.media.mobile} {
      font-size: ${typography.sizes.lg};
    }
  `,

  /* Art-Deco style divider */
  divider: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
    margin: ${layout.spacing.xl} auto;
    max-width: 400px;
  `,

  dividerLine: css`
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${colors.neonTeal} 50%, 
      transparent 100%);
  `,

  dividerCenter: css`
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, ${colors.neonGold}20 0%, transparent 70%);
    border: 2px solid ${colors.neonGold};
    border-radius: 50%;
  `,

  dividerIcon: css`
    color: ${colors.neonGold};
    font-size: ${typography.sizes.lg};
    text-shadow: 0 0 10px ${colors.neonGold};
  `,

  /* Features grid with masonry layout */
  featuresGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: ${layout.spacing['2xl']};
    margin-bottom: ${layout.spacing['4xl']};

    ${layout.media.mobile} {
      grid-template-columns: 1fr;
      gap: ${layout.spacing.xl};
    }
  `,

  featureCard: css`
    ${neoDecorocoBase.panel};
    position: relative;
    padding: ${layout.spacing['2xl']};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.9) 0%, 
      rgba(26, 26, 46, 0.95) 100%);
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

    &:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: var(--accent-color, ${colors.neonTeal});
      
      .card-glow {
        opacity: 1;
      }
    }
  `,

  /* Staggered positioning for visual interest */
  card1: css`
    transform: translateY(0);
  `,

  card2: css`
    transform: translateY(20px);
  `,

  card3: css`
    transform: translateY(10px);
  `,

  card4: css`
    transform: translateY(30px);
  `,

  /* Background patterns for each feature type */
  cardPattern: css`
    position: absolute;
    inset: 0;
    opacity: 0.05;
    z-index: 1;
  `,

  patterncircuit: css`
    background-image: 
      linear-gradient(45deg, transparent 45%, ${colors.neonTeal} 45%, ${colors.neonTeal} 55%, transparent 55%),
      linear-gradient(-45deg, transparent 45%, ${colors.neonTeal} 45%, ${colors.neonTeal} 55%, transparent 55%);
    background-size: 20px 20px;
  `,

  patterngrid: css`
    background-image: 
      linear-gradient(${colors.neonGold} 1px, transparent 1px),
      linear-gradient(90deg, ${colors.neonGold} 1px, transparent 1px);
    background-size: 25px 25px;
  `,

  patternweb: css`
    background-image: 
      radial-gradient(circle at center, ${colors.neonPurple} 1px, transparent 1px);
    background-size: 30px 30px;
  `,

  patternorganic: css`
    background-image: 
      radial-gradient(ellipse at center, transparent 30%, ${colors.neonPink} 31%, ${colors.neonPink} 33%, transparent 34%);
    background-size: 40px 20px;
  `,

  /* Feature icon with ornate styling */
  iconContainer: css`
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: ${layout.spacing.xl};
    z-index: 2;
  `,

  iconFrame: css`
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, 
      var(--accent-color, ${colors.neonTeal})20 0%, 
      transparent 50%, 
      var(--accent-color, ${colors.neonTeal})20 100%);
    border: 2px solid var(--accent-color, ${colors.neonTeal});
    border-radius: 50%;
    box-shadow: 
      0 0 30px var(--accent-color, ${colors.neonTeal})30,
      inset 0 0 20px rgba(255, 255, 255, 0.1);
  `,

  icon: css`
    font-size: ${typography.sizes['3xl']};
    filter: drop-shadow(0 0 10px currentColor);
  `,

  iconFlourish1: css`
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: var(--accent-color, ${colors.neonTeal});
    border-radius: 50% 0 50% 50%;
    transform: rotate(45deg);
    box-shadow: 0 0 10px var(--accent-color, ${colors.neonTeal});
  `,

  iconFlourish2: css`
    position: absolute;
    bottom: -10px;
    left: -10px;
    width: 20px;
    height: 20px;
    background: var(--accent-color, ${colors.neonTeal});
    border-radius: 50% 50% 0 50%;
    transform: rotate(-45deg);
    box-shadow: 0 0 10px var(--accent-color, ${colors.neonTeal});
  `,

  /* Card content */
  cardContent: css`
    position: relative;
    z-index: 2;
  `,

  featureTitle: css`
    font-family: ${typography.fonts.heading};
    font-size: ${typography.sizes['2xl']};
    font-weight: ${typography.weights.bold};
    margin-bottom: ${layout.spacing.md};
    text-shadow: 0 0 15px currentColor;
  `,

  featureDescription: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    color: ${colors.textLight};
    line-height: ${typography.lineHeights.relaxed};
    margin-bottom: ${layout.spacing.lg};
    opacity: 0.9;
  `,

  /* Component genealogy display */
  genealogy: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    margin-bottom: ${layout.spacing.lg};
    padding: ${layout.spacing.md};
    background: rgba(0, 0, 0, 0.3);
    border-radius: ${layout.borderRadius.md};
    border-left: 3px solid var(--accent-color, ${colors.neonTeal});

    ${layout.media.mobile} {
      flex-direction: column;
      gap: ${layout.spacing.xs};
    }
  `,

  genealogyItem: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
    flex: 1;
  `,

  genealogyLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `,

  genealogyValue: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    color: ${colors.textLight};
    font-style: italic;
  `,

  genealogyArrow: css`
    color: var(--accent-color, ${colors.neonTeal});
    font-size: ${typography.sizes.lg};
    font-weight: ${typography.weights.bold};

    ${layout.media.mobile} {
      transform: rotate(90deg);
    }
  `,

  /* Capability badge */
  capabilityBadge: css`
    display: inline-block;
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    background: linear-gradient(135deg, 
      var(--badge-color, ${colors.neonTeal})20 0%, 
      var(--badge-color, ${colors.neonTeal})10 100%);
    border: 1px solid var(--badge-color, ${colors.neonTeal});
    border-radius: ${layout.borderRadius.full};
    color: var(--badge-color, ${colors.neonTeal});
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    font-weight: ${typography.weights.semibold};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  /* Card glow effect */
  cardGlow: css`
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, 
      var(--glow-color, ${colors.neonTeal})30 0%, 
      transparent 50%, 
      var(--glow-color, ${colors.neonTeal})30 100%);
    border-radius: ${layout.borderRadius.lg};
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
    pointer-events: none;
  `,

  /* Integration showcase */
  integrationShowcase: css`
    text-align: center;
    padding: ${layout.spacing['3xl']} ${layout.spacing.xl};
    background: linear-gradient(135deg, 
      rgba(0, 0, 0, 0.4) 0%, 
      rgba(26, 26, 46, 0.6) 100%);
    border-radius: ${layout.borderRadius.lg};
    border: 1px solid ${colors.border};
  `,

  integrationTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    color: ${colors.neonTeal};
    margin-bottom: ${layout.spacing.lg};
    text-shadow: 0 0 20px ${colors.neonTeal}60;
  `,

  integrationDesc: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.lg};
    color: ${colors.textLight};
    max-width: 500px;
    margin: 0 auto ${layout.spacing.xl} auto;
    opacity: 0.9;
  `,

  /* Connection visualization */
  connectionMap: css`
    position: relative;
    max-width: 400px;
    margin: 0 auto;
  `,

  connectionSvg: css`
    width: 100%;
    height: 200px;
    filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
  `,

  connectionPath: css`
    stroke-dasharray: 5 5;
    animation: connectionFlow 3s linear infinite;
  `,

  /* Animations */
  '@keyframes connectionFlow': css`
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 20; }
  `,
};

export default FeaturesSection;
