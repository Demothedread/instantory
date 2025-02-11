import { animations } from '../../theme/animations';
import colors from '../../theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../layouts/constraints';
import { typography } from '../../theme/typography';

export const neoDecorocoBase = {
  // Panel styling with Art Deco geometry and Rococo flourishes
  panel: css`
    background: ${colors.darkGradient};
    border: 1px solid ${colors.border};
    border-radius: 12px;
    box-shadow: ${colors.neonGlow} ${colors.neonTeal},
                0 4px 20px ${colors.shadow};
    position: relative;
    overflow: hidden;
    transition: ${animations.transitions.all};

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonTeal},
        transparent
      );
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonGold},
        transparent
      );
    }
  `,

  // Button styling with neon accents
  button: css`
    background: linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd);
    border: none;
    border-radius: 8px;
    color: ${colors.textLight};
    cursor: pointer;
    font-family: ${typography.fonts.modern};
    font-size: ${typography.sizes.base};
    letter-spacing: ${typography.letterSpacing.wide};
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    position: relative;
    transition: ${animations.transitions.all};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${colors.neonGlow} ${colors.neonTeal};
      
      &::before {
        opacity: 1;
      }
    }

    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, ${colors.neonTeal}, ${colors.neonGold});
      border-radius: 10px;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      
      &::before {
        opacity: 0;
      }
    }
  `,

  // Input field styling
  input: css`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid ${colors.border};
    border-radius: 6px;
    color: ${colors.textLight};
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    transition: ${animations.transitions.all};
    width: 100%;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 2px ${colors.primary}33;
      background: rgba(255, 255, 255, 0.1);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  `,

  // Heading styles with Art Deco influence
  heading: css`
    font-family: ${typography.fonts.decorative};
    letter-spacing: ${typography.letterSpacing.artDeco};
    text-transform: uppercase;
    position: relative;
    padding-bottom: ${layout.spacing.sm};
    margin-bottom: ${layout.spacing.md};

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonTeal},
        ${colors.neonGold},
        transparent
      );
    }
  `,

  // Table styling with elegant borders
  table: css`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: ${layout.spacing.md} 0;

    th {
      background: rgba(255, 255, 255, 0.05);
      font-family: ${typography.fonts.modern};
      font-weight: ${typography.weights.medium};
      letter-spacing: ${typography.letterSpacing.wide};
      padding: ${layout.spacing.sm} ${layout.spacing.md};
      text-align: left;
      border-bottom: 2px solid ${colors.primary}66;
    }

    td {
      padding: ${layout.spacing.sm} ${layout.spacing.md};
      border-bottom: 1px solid ${colors.border};
      transition: ${animations.transitions.all};
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.05);
    }
  `,

  // Card styling with decorative elements
  card: css`
    background: ${colors.darkGradient};
    border-radius: 12px;
    padding: ${layout.spacing.lg};
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        transparent 0%,
        rgba(255, 255, 255, 0.05) 50%,
        transparent 100%
      );
      pointer-events: none;
    }
  `,
};

export default neoDecorocoBase;
