import { css } from '@emotion/react';
import { animations } from '../../../styles/theme/animations';
import { colors } from '../../../styles/theme/colors';
import layout from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    ${neoDecorocoBase.panel}
    position: relative;
    height: calc(100vh - ${layout.heights.header} - ${layout.spacing['2xl']});
    max-height: calc(${layout.viewport.maxHeight} - ${layout.heights.header} - ${layout.spacing['2xl']});
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.xl};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.95) 0%, 
      rgba(20, 20, 40, 0.98) 50%,
      rgba(15, 15, 35, 1) 100%);
    border: 2px solid ${colors.border};
    border-radius: ${layout.borderRadius['2xl']};
    overflow: hidden;
    backdrop-filter: blur(20px);
    
    /* Neo-decoroco metallic frame */
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3),
      0 10px 30px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 215, 0, 0.1);

    ${layout.media.mobile} {
      padding: ${layout.spacing.lg};
      height: auto;
      min-height: 70vh;
    }
  `,

  backgroundPattern: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  `,

  geometricElement1: css`
    position: absolute;
    top: 10%;
    right: 5%;
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, 
      ${colors.neonTeal}08 0%, 
      ${colors.neonGold}06 50%,
      transparent 100%);
    clip-path: polygon(
      30% 0%, 70% 0%, 100% 30%, 100% 70%, 
      70% 100%, 30% 100%, 0% 70%, 0% 30%
    );
    filter: blur(1px);

    ${layout.media.mobile} {
      width: 120px;
      height: 120px;
      top: 5%;
      right: 2%;
    }
  `,

  geometricElement2: css`
    position: absolute;
    bottom: 15%;
    left: 8%;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, 
      ${colors.neonPurple}06 0%, 
      ${colors.neonPink}04 50%,
      transparent 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: blur(1px);

    ${layout.media.mobile} {
      width: 80px;
      height: 80px;
      bottom: 10%;
      left: 5%;
    }
  `,

  controlHeader: css`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 20%,
      rgba(255, 215, 0, 0.05) 50%,
      rgba(255, 255, 255, 0.03) 80%,
      transparent 100%
    );
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.xl};
    backdrop-filter: blur(10px);

    /* Art Deco corner decorations */
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      width: 40px;
      height: 100%;
      background: linear-gradient(
        135deg,
        ${colors.neonGold}20 0%,
        transparent 50%
      );
      clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%);
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
      transform: scaleX(-1);
    }

    ${layout.media.mobile} {
      padding: ${layout.spacing.md};
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  navigationButton: css`
    ${neoDecorocoBase.button}
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, 
      rgba(255, 215, 0, 0.1) 0%, 
      rgba(0, 212, 255, 0.1) 100%);
    border: 2px solid ${colors.border};
    border-radius: ${layout.borderRadius.xl};
    color: ${colors.neonGold};
    font-size: ${typography.sizes.xl};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    /* Metallic bezel effect */
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.2);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, 
        transparent 0%, 
        rgba(255, 215, 0, 0.1) 50%, 
        transparent 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      border-color: ${colors.neonGold};
      color: ${colors.neonGold};
      box-shadow: 
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2),
        0 6px 12px rgba(0, 0, 0, 0.3),
        0 0 20px ${colors.neonGold}30;

      &::before {
        opacity: 1;
      }
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      color: ${colors.textMuted};
      border-color: ${colors.border};

      &:hover {
        border-color: ${colors.border};
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3),
          0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }

    ${layout.media.mobile} {
      width: 40px;
      height: 40px;
      font-size: ${typography.sizes.lg};
    }
  `,

  buttonIcon: css`
    position: relative;
    z-index: 2;
  `,

  titleSection: css`
    flex: 1;
    text-align: center;
    position: relative;

    ${layout.media.mobile} {
      order: -1;
    }
  `,

  viewTitle: css`
    ${neoDecorocoBase.heading}
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.md};
    margin: 0;
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['2xl']};
    font-weight: ${typography.weights.black};
    color: ${colors.neonGold};
    text-shadow: 
      0 0 10px ${colors.neonGold}60,
      0 0 20px ${colors.neonGold}30;
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
  `,

  titleIcon: css`
    font-size: ${typography.sizes['3xl']};
    filter: drop-shadow(0 0 10px currentColor);

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  viewSubtitle: css`
    margin: ${layout.spacing.sm} 0 0 0;
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.neonTeal};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.8;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  viewIndicators: css`
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.md};

    ${layout.media.mobile} {
      gap: ${layout.spacing.md};
    }
  `,

  indicator: css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.8) 0%, 
      rgba(20, 20, 40, 0.9) 100%);
    border: 2px solid ${colors.border};
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    /* Default metallic finish */
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.2);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, 
        var(--indicator-color, ${colors.neonTeal})20 0%, 
        transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      border-color: var(--indicator-color, ${colors.neonTeal});
      
      &::before {
        opacity: 1;
      }
    }

    ${layout.media.mobile} {
      width: 40px;
      height: 40px;
    }
  `,

  indicatorActive: css`
    border-color: var(--indicator-color, ${colors.neonTeal});
    background: linear-gradient(135deg, 
      var(--indicator-color, ${colors.neonTeal})15 0%, 
      rgba(26, 26, 46, 0.9) 100%);
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2),
      0 6px 12px rgba(0, 0, 0, 0.3),
      0 0 20px var(--indicator-color, ${colors.neonTeal})40;

    &::before {
      opacity: 0.6;
    }
  `,

  indicatorIcon: css`
    position: relative;
    z-index: 2;
    font-size: ${typography.sizes.lg};
    filter: drop-shadow(0 0 8px currentColor);

    ${layout.media.mobile} {
      font-size: ${typography.sizes.base};
    }
  `,

  rolodexViewport: css`
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1200px;
    transform-style: preserve-3d;
    z-index: 1;
    min-height: 400px;

    ${layout.media.mobile} {
      min-height: 300px;
    }
  `,

  viewCard: css`
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 900px;
    max-height: 600px;
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.95) 0%, 
      rgba(20, 20, 40, 0.98) 50%,
      rgba(15, 15, 35, 1) 100%);
    border: 2px solid var(--view-color, ${colors.neonTeal});
    border-radius: ${layout.borderRadius['2xl']};
    overflow: hidden;
    backdrop-filter: blur(15px);
    transform-style: preserve-3d;

    /* Neo-decoroco card styling */
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.4),
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px var(--view-color, ${colors.neonTeal})20;

    /* Art Deco corner elements */
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      width: 60px;
      height: 100%;
      background: linear-gradient(
        135deg,
        var(--view-color, ${colors.neonTeal})15 0%,
        transparent 60%
      );
      clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%);
      pointer-events: none;
      z-index: 1;
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
      transform: scaleX(-1);
    }

    ${layout.media.mobile} {
      max-width: 100%;
      max-height: 500px;
    }
  `,

  cardHeader: css`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: ${layout.spacing.xl};
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.02) 50%,
      transparent 100%
    );
    border-bottom: 1px solid var(--view-color, ${colors.neonTeal})30;

    ${layout.media.mobile} {
      padding: ${layout.spacing.lg};
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  cardTitleSection: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.lg};
  `,

  cardIcon: css`
    font-size: ${typography.sizes['3xl']};
    filter: drop-shadow(0 0 15px var(--view-color, ${colors.neonTeal}));

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  cardTitle: css`
    margin: 0 0 ${layout.spacing.xs} 0;
    font-family: ${typography.fonts.heading};
    font-size: ${typography.sizes['2xl']};
    font-weight: ${typography.weights.bold};
    color: var(--view-color, ${colors.neonTeal});
    text-shadow: 0 0 10px var(--view-color, ${colors.neonTeal})50;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
  `,

  cardDescription: css`
    margin: 0;
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.sm};
    color: ${colors.textLight};
    opacity: 0.8;
    line-height: ${typography.lineHeights.relaxed};

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  statsSection: css`
    display: flex;
    gap: ${layout.spacing.lg};

    ${layout.media.mobile} {
      justify-content: space-around;
      width: 100%;
    }
  `,

  statItem: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${layout.spacing.md};
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--view-color, ${colors.neonTeal})30;
    border-radius: ${layout.borderRadius.lg};
    min-width: 80px;

    ${layout.media.mobile} {
      min-width: 60px;
      padding: ${layout.spacing.sm};
    }
  `,

  statValue: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xl};
    font-weight: ${typography.weights.bold};
    color: var(--view-color, ${colors.neonTeal});
    text-shadow: 0 0 8px var(--view-color, ${colors.neonTeal})40;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.lg};
    }
  `,

  statLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: ${layout.spacing.xs};

    ${layout.media.mobile} {
      font-size: 10px;
    }
  `,

  cardContent: css`
    position: relative;
    z-index: 2;
    flex: 1;
    padding: ${layout.spacing.xl};
    overflow-y: auto;

    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--view-color, ${colors.neonTeal}) transparent;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(
        180deg,
        var(--view-color, ${colors.neonTeal})60 0%,
        var(--view-color, ${colors.neonTeal})40 100%
      );
      border-radius: 4px;
      border: 1px solid var(--view-color, ${colors.neonTeal})20;
    }

    ${layout.media.mobile} {
      padding: ${layout.spacing.lg};
    }
  `,

  cardDecorations: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  `,

  cornerDecoration: css`
    position: absolute;
    top: ${layout.spacing.md};
    right: ${layout.spacing.md};
    width: 30px;
    height: 30px;
    background: linear-gradient(45deg, 
      var(--view-color, ${colors.neonTeal})40 0%, 
      transparent 70%);
    clip-path: polygon(0 0, 100% 0, 100% 100%);

    ${layout.media.mobile} {
      width: 20px;
      height: 20px;
    }
  `,

  borderGlow: css`
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: transparent;
    pointer-events: none;
  `,

  statusBar: css`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${layout.spacing.md} ${layout.spacing.xl};
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(0, 0, 0, 0.2) 100%
    );
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    backdrop-filter: blur(10px);

    ${layout.media.mobile} {
      padding: ${layout.spacing.sm} ${layout.spacing.md};
      flex-wrap: wrap;
      gap: ${layout.spacing.sm};
    }
  `,

  statusInfo: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  statusLabel: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  statusValue: css`
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    color: ${colors.neonTeal};
    font-weight: ${typography.weights.semibold};

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  statusIndicator: css`
    font-size: ${typography.sizes.sm};
    filter: drop-shadow(0 0 5px currentColor);

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xs};
    }
  `,

  /* Welcome State Styles */
  welcomeState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    gap: ${layout.spacing.xl};
    padding: ${layout.spacing['2xl']};

    ${layout.media.mobile} {
      gap: ${layout.spacing.lg};
      padding: ${layout.spacing.xl};
    }
  `,

  welcomeIcon: css`
    font-size: ${typography.sizes['6xl']};
    filter: drop-shadow(0 0 20px currentColor);

    ${layout.media.mobile} {
      font-size: ${typography.sizes['4xl']};
    }
  `,

  welcomeContent: css`
    max-width: 500px;
  `,

  welcomeTitle: css`
    margin: 0 0 ${layout.spacing.lg} 0;
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    font-weight: ${typography.weights.black};
    color: ${colors.neonGold};
    text-shadow: 0 0 15px ${colors.neonGold}50;

    ${layout.media.mobile} {
      font-size: ${typography.sizes['2xl']};
    }
  `,

  welcomeMessage: css`
    margin: 0 0 ${layout.spacing.xl} 0;
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.lg};
    color: ${colors.textLight};
    line-height: ${typography.lineHeights.relaxed};
    opacity: 0.9;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.base};
    }
  `,

  welcomeFeatures: css`
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.xl};
    flex-wrap: wrap;

    ${layout.media.mobile} {
      gap: ${layout.spacing.lg};
    }
  `,

  featureItem: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.lg};
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.xl};
    min-width: 120px;

    ${layout.media.mobile} {
      min-width: 100px;
      padding: ${layout.spacing.md};
    }
  `,

  featureIcon: css`
    font-size: ${typography.sizes['2xl']};
    filter: drop-shadow(0 0 10px currentColor);

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
  `,
};

export default styles;
