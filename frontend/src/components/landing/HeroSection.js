import { css } from '@emotion/react';
import { Link } from 'react-router-dom';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

/**
 * Hero Section Component
 * Component Genealogy: Towering Spire -> Gateway Monument -> Digital Portal
 * Subverts traditional hero sections by presenting the interface as a ceremonial entrance
 */
const HeroSection = () => {
  return (
    <section css={styles.container}>
      {/* Background Ornamental Grid */}
      <div css={styles.backgroundGrid} />
      
      {/* Main Portal Frame */}
      <div css={styles.portalFrame}>
        
        {/* Crown/Crest Header */}
        <div css={styles.crestHeader}>
          <div css={styles.ornamentalCrown}>
            <div css={styles.centerGem}>💎</div>
            <div css={styles.leftSpire}>🏛️</div>
            <div css={styles.rightSpire}>🏛️</div>
          </div>
        </div>

        {/* Main Title Portal */}
        <div css={styles.titlePortal}>
          <h1 css={styles.mainTitle}>
            <span css={styles.titlePrimary}>Bartleby</span>
            <span css={styles.titleSecondary}>AI Document Intelligence</span>
          </h1>
          <div css={styles.subtitleFrame}>
            <p css={styles.subtitle}>
              Transform documents into actionable intelligence with sophisticated AI analysis, 
              semantic understanding, and contextual synthesis
            </p>
          </div>
        </div>

        {/* Call-to-Action Pedestal */}
        <div css={styles.ctaPedestal}>
          <div css={styles.primaryAction}>
            <Link to="/upload" css={styles.primaryButton}>
              <span css={styles.buttonIcon}>🚀</span>
              <span css={styles.buttonText}>Begin Analysis</span>
              <div css={styles.buttonGlow} />
            </Link>
          </div>
          
          <div css={styles.secondaryActions}>
            <Link to="/docs" css={styles.secondaryButton}>
              <span css={styles.buttonIcon}>📖</span>
              Documentation
            </Link>
            <Link to="/demo" css={styles.secondaryButton}>
              <span css={styles.buttonIcon}>🎭</span>
              Live Demo
            </Link>
          </div>
        </div>

        {/* Status Indicators */}
        <div css={styles.statusBar}>
          <div css={styles.statusItem}>
            <div css={[styles.statusDot, styles.statusActive]} />
            <span css={styles.statusText}>AI Systems Online</span>
          </div>
          <div css={styles.statusItem}>
            <div css={[styles.statusDot, styles.statusActive]} />
            <span css={styles.statusText}>Document Processing Ready</span>
          </div>
          <div css={styles.statusItem}>
            <div css={[styles.statusDot, styles.statusActive]} />
            <span css={styles.statusText}>Knowledge Graph Active</span>
          </div>
        </div>

      </div>

      {/* Floating Decorative Elements */}
      <div css={styles.floatingElements}>
        <div css={[styles.floatingOrb, styles.orbLeft]}>🔮</div>
        <div css={[styles.floatingOrb, styles.orbRight]}>⚡</div>
        <div css={[styles.floatingOrb, styles.orbCenter]}>🧠</div>
      </div>

    </section>
  );
};

const styles = {
  container: css`
    ${neoDecorocoBase.container}
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      ${colors.richPurple} 0%,
      ${colors.deepNavy} 30%,
      ${colors.charcoal} 70%,
      ${colors.richPurple} 100%
    );
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, ${colors.neonTeal}20 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${colors.neonGold}20 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, ${colors.neonPurple}15 0%, transparent 50%);
      pointer-events: none;
    }
  `,

  backgroundGrid: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(${colors.neonTeal}20 1px, transparent 1px),
      linear-gradient(90deg, ${colors.neonTeal}20 1px, transparent 1px);
    background-size: 100px 100px;
    opacity: 0.3;
    animation: gridPulse 4s ease-in-out infinite;
  `,

  portalFrame: css`
    ${layout.container}
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: ${layout.spacing.xl};
    text-align: center;
    background: linear-gradient(
      145deg,
      ${colors.richPurple}40 0%,
      ${colors.deepNavy}30 50%,
      ${colors.charcoal}20 100%
    );
    border: 2px solid ${colors.neonGold}60;
    border-radius: 24px;
    backdrop-filter: blur(10px);
    box-shadow: 
      0 25px 50px ${colors.charcoal}60,
      inset 0 1px 0 ${colors.neonGold}30,
      0 0 100px ${colors.neonTeal}20;
  `,

  crestHeader: css`
    margin-bottom: ${layout.spacing.xl};
    position: relative;
  `,

  ornamentalCrown: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.md};
    font-size: 3rem;
    filter: drop-shadow(0 0 20px ${colors.neonGold}60);
    animation: crownGlow 3s ease-in-out infinite alternate;
  `,

  centerGem: css`
    font-size: 4rem;
    animation: gemPulse 2s ease-in-out infinite;
  `,

  leftSpire: css`
    transform: rotate(-15deg);
    animation: spireFloat 4s ease-in-out infinite;
  `,

  rightSpire: css`
    transform: rotate(15deg);
    animation: spireFloat 4s ease-in-out infinite reverse;
  `,

  titlePortal: css`
    margin-bottom: ${layout.spacing.xl};
    position: relative;
  `,

  mainTitle: css`
    ${typography.heading.h1}
    margin-bottom: ${layout.spacing.lg};
    line-height: 1.1;
  `,

  titlePrimary: css`
    display: block;
    font-size: 5rem;
    font-weight: 900;
    background: linear-gradient(
      135deg,
      ${colors.neonGold} 0%,
      ${colors.white} 50%,
      ${colors.neonTeal} 100%
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 50px ${colors.neonGold}40;
    animation: titleShimmer 3s ease-in-out infinite;

    @media (max-width: 768px) {
      font-size: 3.5rem;
    }
  `,

  titleSecondary: css`
    display: block;
    font-size: 1.8rem;
    font-weight: 400;
    color: ${colors.lightGray};
    margin-top: ${layout.spacing.sm};
    letter-spacing: 0.1em;
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 1.4rem;
    }
  `,

  subtitleFrame: css`
    position: relative;
    padding: ${layout.spacing.lg};
    border: 1px solid ${colors.neonTeal}40;
    border-radius: 16px;
    background: ${colors.charcoal}20;
    backdrop-filter: blur(5px);
  `,

  subtitle: css`
    ${typography.body.large}
    color: ${colors.lightGray};
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
  `,

  ctaPedestal: css`
    margin: ${layout.spacing.xl} 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.lg};
  `,

  primaryAction: css`
    position: relative;
    z-index: 1;
  `,

  primaryButton: css`
    ${neoDecorocoBase.button}
    display: inline-flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    font-size: 1.25rem;
    font-weight: 700;
    text-decoration: none;
    color: ${colors.charcoal};
    background: linear-gradient(135deg, ${colors.neonGold} 0%, ${colors.neonTeal} 100%);
    border: none;
    border-radius: 50px;
    box-shadow: 
      0 15px 35px ${colors.neonGold}30,
      inset 0 1px 0 ${colors.white}40;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 
        0 20px 40px ${colors.neonGold}40,
        inset 0 1px 0 ${colors.white}60;
        
      & > div:last-child {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(-1px);
    }
  `,

  buttonIcon: css`
    font-size: 1.5rem;
  `,

  buttonText: css`
    letter-spacing: 0.05em;
  `,

  buttonGlow: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, ${colors.white}20 0%, transparent 50%);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
  `,

  secondaryActions: css`
    display: flex;
    gap: ${layout.spacing.lg};
    flex-wrap: wrap;
    justify-content: center;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  secondaryButton: css`
    display: inline-flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    text-decoration: none;
    color: ${colors.lightGray};
    border: 1px solid ${colors.neonTeal}40;
    border-radius: 25px;
    background: ${colors.charcoal}30;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      color: ${colors.neonTeal};
      border-color: ${colors.neonTeal}80;
      background: ${colors.charcoal}50;
      transform: translateY(-2px);
    }
  `,

  statusBar: css`
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.xl};
    margin-top: ${layout.spacing.xl};
    padding-top: ${layout.spacing.lg};
    border-top: 1px solid ${colors.neonTeal}30;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  statusItem: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  statusDot: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.lightGray};
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 50%;
      background: inherit;
      opacity: 0.3;
      animation: statusPulse 2s ease-in-out infinite;
    }
  `,

  statusActive: css`
    background: ${colors.neonGreen};
  `,

  statusText: css`
    ${typography.body.small}
    color: ${colors.lightGray};
    font-weight: 500;
  `,

  floatingElements: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
  `,

  floatingOrb: css`
    position: absolute;
    font-size: 2rem;
    opacity: 0.6;
    animation: orbFloat 6s ease-in-out infinite;
  `,

  orbLeft: css`
    top: 20%;
    left: 10%;
    animation-delay: -2s;
  `,

  orbRight: css`
    top: 30%;
    right: 15%;
    animation-delay: -4s;
  `,

  orbCenter: css`
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    animation-delay: -1s;
  `,

  // Animations
  '@keyframes gridPulse': css`
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
  `,

  '@keyframes crownGlow': css`
    0% { filter: drop-shadow(0 0 20px ${colors.neonGold}40); }
    100% { filter: drop-shadow(0 0 30px ${colors.neonGold}80); }
  `,

  '@keyframes gemPulse': css`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  `,

  '@keyframes spireFloat': css`
    0%, 100% { transform: rotate(-15deg) translateY(0); }
    50% { transform: rotate(-15deg) translateY(-5px); }
  `,

  '@keyframes titleShimmer': css`
    0%, 100% { 
      background: linear-gradient(
        135deg,
        ${colors.neonGold} 0%,
        ${colors.white} 50%,
        ${colors.neonTeal} 100%
      );
    }
    50% { 
      background: linear-gradient(
        135deg,
        ${colors.neonTeal} 0%,
        ${colors.neonGold} 50%,
        ${colors.white} 100%
      );
    }
  `,

  '@keyframes statusPulse': css`
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  `,

  '@keyframes orbFloat': css`
    0%, 100% { transform: translateY(0) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(120deg); }
    66% { transform: translateY(5px) rotate(240deg); }
  `,
};

export default HeroSection;
