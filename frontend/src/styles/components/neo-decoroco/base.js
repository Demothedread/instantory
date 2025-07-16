import { css } from '@emotion/react';
import { colors } from '../../theme/colors';

export const neoDecorocoBase = {
  // Panel styling - main container elements
  panel: css`
    background: ${colors.glass};
    border: 1px solid ${colors.border};
    border-radius: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 
      0 4px 20px rgba(0, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      border-color: ${colors.neonTeal};
      box-shadow: 
        0 8px 30px rgba(0, 255, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
  `,

  // Card styling - smaller content containers
  card: css`
    background: ${colors.surface};
    border: 1px solid ${colors.borderLight};
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      border-color: ${colors.neonTeal};
      box-shadow: 
        0 8px 25px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(0, 255, 255, 0.1);
    }
  `,

  // Button styling
  button: css`
    padding: 0.75rem 1.5rem;
    border: 1px solid ${colors.neonTeal};
    border-radius: 6px;
    background: transparent;
    color: ${colors.neonTeal};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    font-size: 1rem;
    
    &:hover {
      background: ${colors.neonTeal};
      color: ${colors.background};
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      &:hover {
        background: transparent;
        color: ${colors.neonTeal};
        transform: none;
        box-shadow: none;
      }
    }
  `,

  // Input styling
  input: css`
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid ${colors.border};
    border-radius: 6px;
    background: ${colors.surface};
    color: ${colors.textLight};
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &::placeholder {
      color: ${colors.textMuted};
    }
    
    &:focus {
      outline: none;
      border-color: ${colors.neonTeal};
      box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
    }
    
    &:hover {
      border-color: ${colors.borderLight};
    }
  `,

  // Heading styling
  heading: css`
    font-family: "Cinzel Decorative", serif;
    color: ${colors.neonGold};
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    margin: 0 0 1rem 0;
  `,

  // Alert/notification styling
  alert: css`
    padding: 1rem 1.5rem;
    border-radius: 6px;
    border: 1px solid ${colors.neonRed};
    background: rgba(255, 7, 58, 0.1);
    color: ${colors.neonRed};
    font-size: 0.9rem;
    
    &.success {
      border-color: ${colors.neonGreen};
      background: rgba(57, 255, 20, 0.1);
      color: ${colors.neonGreen};
    }
    
    &.warning {
      border-color: ${colors.neonGold};
      background: rgba(255, 215, 0, 0.1);
      color: ${colors.neonGold};
    }
    
    &.info {
      border-color: ${colors.neonBlue};
      background: rgba(0, 162, 255, 0.1);
      color: ${colors.neonBlue};
    }
  `,

  // Loading spinner
  spinner: css`
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid ${colors.border};
    border-radius: 50%;
    border-top-color: ${colors.neonTeal};
    animation: spin 1s ease-in-out infinite;
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,

  // Badge/tag styling
  badge: css`
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid ${colors.neonTeal};
    background: rgba(0, 255, 255, 0.1);
    color: ${colors.neonTeal};
    
    &.gold {
      border-color: ${colors.neonGold};
      background: rgba(255, 215, 0, 0.1);
      color: ${colors.neonGold};
    }
    
    &.green {
      border-color: ${colors.neonGreen};
      background: rgba(57, 255, 20, 0.1);
      color: ${colors.neonGreen};
    }
  `,

  // Navigation link styling
  navLink: css`
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: ${colors.textLight};
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.3s ease;
    
    &:hover {
      background: ${colors.hover};
      color: ${colors.neonTeal};
    }
    
    &.active {
      background: ${colors.active};
      color: ${colors.neonTeal};
      border-left: 3px solid ${colors.neonTeal};
    }
  `,

  // Modal/overlay backdrop
  backdrop: css`
    position: fixed;
    inset: 0;
    background: ${colors.overlay};
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  // Divider/separator
  divider: css`
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      ${colors.border},
      transparent
    );
    margin: 1rem 0;
  `
};

// ---------------------------------------------------------------------------
// Provide a compatible default export.
// A handful of legacy style modules import this file using the default import
// syntax (e.g. `import neoDecorocoBase from '.../neo-decoroco/base'`).  The
// original implementation only exposed a *named* export which breaks the
// production build. We therefore alias the existing named export as the
// default one so both import styles work.
// ---------------------------------------------------------------------------

export default neoDecorocoBase;
