import { css, keyframes } from '@emotion/react';
import { colors } from '../../../styles/theme/colors';
import { typography } from '../../../styles/theme/typography';
import layout from '../../../styles/layouts/constraints';

// Clockwork-inspired animations
const gearRotation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pendulumSwing = keyframes`
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
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

const mechanicalPulse = keyframes`
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.4),
      inset 0 0 15px rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 40px rgba(255, 215, 0, 0.8),
      inset 0 0 25px rgba(255, 255, 255, 0.2);
  }
`;

const clockworkTick = keyframes`
  0% { transform: scale(1); }
  10% { transform: scale(1.05); }
  20% { transform: scale(1); }
`;

const styles = {
  // Container variants
  container: css`
    position: relative;
    z-index: 1000;
  `,

  modal: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(15px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${layout.spacing.lg};
  `,

  page: css`
    min-height: 100vh;
    background: ${colors.darkGradient};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${layout.spacing.lg};
  `,

  inline: css`
    display: flex;
    justify-content: center;
    padding: ${layout.spacing.lg};
  `,

  // Main authentication card
  authCard: css`
    position: relative;
    width: 100%;
    max-width: 480px;
    background: linear-gradient(145deg, 
      rgba(26, 26, 46, 0.95) 0%, 
      rgba(20, 20, 40, 0.98) 50%,
      rgba(15, 15, 35, 1) 100%);
    border: 2px solid ${colors.neonGold};
    border-radius: ${layout.borderRadius['2xl']};
    padding: ${layout.spacing['2xl']};
    backdrop-filter: blur(25px);
    overflow: hidden;
    animation: ${mechanicalPulse} 3s ease-in-out infinite;

    /* Neo-decoroco metallic frame */
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.4),
      0 20px 60px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 215, 0, 0.2);

    ${layout.media.mobile} {
      padding: ${layout.spacing.xl};
      max-width: 90vw;
    }
  `,

  // Decorative elements
  decorativeGears: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  `,

  decorativeGear: css`
    position: absolute;
    font-size: 1.5rem;
    color: ${colors.neonGold}40;
    filter: drop-shadow(0 0 10px ${colors.neonGold}30);
  `,

  gear1: css`
    top: ${layout.spacing.md};
    right: ${layout.spacing.md};
    animation: ${gearRotation} 8s linear infinite;
  `,

  gear2: css`
    bottom: ${layout.spacing.md};
    left: ${layout.spacing.md};
    animation: ${gearRotation} 12s linear infinite reverse;
  `,

  gear3: css`
    top: 50%;
    left: ${layout.spacing.sm};
    transform: translateY(-50%);
    animation: ${gearRotation} 6s linear infinite;
  `,

  borderDecoration: css`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  `,

  cornerDecoration: css`
    position: absolute;
    width: 30px;
    height: 30px;
    border: 2px solid ${colors.neonTeal}30;
    
    &:nth-child(1) {
      top: ${layout.spacing.md};
      left: ${layout.spacing.md};
      border-right: none;
      border-bottom: none;
    }
    
    &:nth-child(2) {
      top: ${layout.spacing.md};
      right: ${layout.spacing.md};
      border-left: none;
      border-bottom: none;
    }
    
    &:nth-child(3) {
      bottom: ${layout.spacing.md};
      left: ${layout.spacing.md};
      border-right: none;
      border-top: none;
    }
    
    &:nth-child(4) {
      bottom: ${layout.spacing.md};
      right: ${layout.spacing.md};
      border-left: none;
      border-top: none;
    }
  `,

  closeButton: css`
    position: absolute;
    top: ${layout.spacing.md};
    right: ${layout.spacing.md};
    z-index: 10;
    background: rgba(255, 7, 58, 0.8);
    border: 2px solid ${colors.neonRed};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: ${typography.sizes.lg};
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &:hover {
      background: ${colors.neonRed};
      transform: scale(1.1);
      box-shadow: 0 0 20px ${colors.neonRed}60;
    }
  `,

  // Welcome content
  welcomeContent: css`
    position: relative;
    z-index: 5;
    text-align: center;
    padding: ${layout.spacing.xl} 0;
  `,

  logoContainer: css`
    margin-bottom: ${layout.spacing.xl};
    display: flex;
    justify-content: center;
  `,

  mechanicalLogo: css`
    width: 80px;
    height: 80px;
    background: linear-gradient(145deg, 
      ${colors.neonGold}20 0%, 
      ${colors.neonTeal}20 100%);
    border: 3px solid ${colors.neonGold};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${typography.sizes['3xl']};
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.6),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
    animation: ${clockworkTick} 2s ease-in-out infinite;
    filter: drop-shadow(0 0 15px ${colors.neonGold});
  `,

  welcomeTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['2xl']};
    font-weight: ${typography.weights.black};
    color: ${colors.neonGold};
    margin: 0 0 ${layout.spacing.md} 0;
    text-shadow: 0 0 15px ${colors.neonGold}50;
    letter-spacing: 0.05em;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.xl};
    }
  `,

  welcomeSubtitle: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    color: ${colors.neonTeal};
    margin: 0 0 ${layout.spacing['2xl']} 0;
    opacity: 0.9;
  `,

  authMethods: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
  `,

  methodButton: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    background: linear-gradient(135deg, 
      rgba(26, 26, 46, 0.8) 0%, 
      rgba(20, 20, 40, 0.9) 100%);
    border: 2px solid ${colors.border};
    border-radius: ${layout.borderRadius.xl};
    color: ${colors.textLight};
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    font-weight: ${typography.weights.semibold};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);

    &:hover {
      border-color: ${colors.neonTeal};
      color: ${colors.neonTeal};
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 255, 255, 0.2);
    }
  `,

  googleMethod: css`
    &:hover {
      border-color: ${colors.neonGold};
      color: ${colors.neonGold};
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
    }
  `,

  emailMethod: css`
    &:hover {
      border-color: ${colors.neonPurple};
      color: ${colors.neonPurple};
      box-shadow: 0 8px 25px rgba(191, 0, 255, 0.2);
    }
  `,

  methodIcon: css`
    font-size: ${typography.sizes.xl};
    filter: drop-shadow(0 0 8px currentColor);
  `,

  // Authentication content
  authContent: css`
    position: relative;
    z-index: 5;
    padding: ${layout.spacing.lg} 0;
  `,

  authHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${layout.spacing.xl};

    ${layout.media.mobile} {
      flex-direction: column;
      gap: ${layout.spacing.md};
    }
  `,

  backButton: css`
    background: none;
    border: 2px solid ${colors.neonTeal};
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.neonTeal};
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    font-family: ${typography.fonts.mono};
    font-size: ${typography.sizes.sm};
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: ${colors.neonTeal}20;
      transform: translateX(-3px);
    }
  `,

  authTitle: css`
    font-family: ${typography.fonts.heading};
    font-size: ${typography.sizes.xl};
    color: ${colors.neonGold};
    margin: 0;
    text-align: center;
    flex: 1;

    ${layout.media.mobile} {
      font-size: ${typography.sizes.lg};
    }
  `,

  errorMessage: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    background: rgba(255, 7, 58, 0.15);
    border: 1px solid ${colors.neonRed};
    border-radius: ${layout.borderRadius.lg};
    padding: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.lg};
    color: ${colors.neonRed};
    font-size: ${typography.sizes.sm};
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 7, 58, 0.25);
    }
  `,

  errorIcon: css`
    font-size: ${typography.sizes.base};
    filter: drop-shadow(0 0 5px currentColor);
  `,

  googleAuthContainer: css`
    margin-bottom: ${layout.spacing.lg};
    
    /* Style the Google button container */
    > div {
      width: 100% !important;
      display: flex !important;
      justify-content: center !important;
    }
  `,

  divider: css`
    display: flex;
    align-items: center;
    margin: ${layout.spacing.lg} 0;
    gap: ${layout.spacing.md};
    
    &::before, &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent, 
        ${colors.neonTeal}40, 
        transparent);
    }
    
    span {
      color: ${colors.textMuted};
      font-family: ${typography.fonts.mono};
      font-size: ${typography.sizes.sm};
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  `,

  authForm: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.lg};
  `,

  inputGroup: css`
    position: relative;
  `,

  authInput: css`
    width: 100%;
    padding: ${layout.spacing.lg};
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.textLight};
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    transition: all 0.3s ease;
    box-sizing: border-box;

    &::placeholder {
      color: ${colors.textMuted};
    }

    &:focus {
      outline: none;
      border-color: ${colors.neonTeal};
      background: rgba(0, 255, 255, 0.05);
      box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.1);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,

  submitButton: css`
    padding: ${layout.spacing.lg} ${layout.spacing.xl};
    background: linear-gradient(135deg, 
      ${colors.neonTeal} 0%, 
      ${colors.neonGold} 100%);
    border: none;
    border-radius: ${layout.borderRadius.lg};
    color: ${colors.background};
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    font-weight: ${typography.weights.bold};
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  `,

  modeSwitch: css`
    text-align: center;
    color: ${colors.textLight};
    font-size: ${typography.sizes.sm};
  `,

  switchButton: css`
    background: none;
    border: none;
    color: ${colors.neonTeal};
    font-weight: ${typography.weights.semibold};
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.3s ease;

    &:hover {
      color: ${colors.neonGold};
    }
  `,

  // Processing content
  processingContent: css`
    position: relative;
    z-index: 5;
    text-align: center;
    padding: ${layout.spacing['2xl']} 0;
  `,

  clockworkProgress: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${layout.spacing.xl};
    margin-bottom: ${layout.spacing.xl};
  `,

  mainGear: css`
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${gearRotation} 2s linear infinite;
  `,

  gearTeeth: css`
    position: absolute;
    inset: 0;
    border: 3px solid ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 
      0 0 20px ${colors.neonGold}60,
      inset 0 0 15px rgba(255, 255, 255, 0.1);
    
    &::before, &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: ${colors.neonGold};
      border-radius: 50%;
    }
    
    &::before {
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    &::after {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
    }
  `,

  gearCenter: css`
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonGold};
    filter: drop-shadow(0 0 10px ${colors.neonGold});
    z-index: 2;
  `,

  pendulum: css`
    width: 4px;
    height: 60px;
    background: linear-gradient(180deg, 
      ${colors.neonTeal} 0%, 
      ${colors.neonGold} 100%);
    transform-origin: top center;
    animation: ${pendulumSwing} 2s ease-in-out infinite;
    border-radius: 2px;
    box-shadow: 0 0 10px ${colors.neonTeal}40;
  `,

  pendulumBob: css`
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 16px;
    background: ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 0 0 15px ${colors.neonGold}60;
  `,

  progressBar: css`
    width: 200px;
    height: 8px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid ${colors.border};
  `,

  progressFill: css`
    height: 100%;
    background: linear-gradient(90deg, 
      ${colors.neonTeal} 0%, 
      ${colors.neonGold} 100%);
    border-radius: inherit;
    box-shadow: 0 0 10px ${colors.neonTeal}40;
    transition: width 0.3s ease;
  `,

  processingTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes.xl};
    color: ${colors.neonGold};
    margin: 0 0 ${layout.spacing.md} 0;
    text-shadow: 0 0 15px ${colors.neonGold}50;
  `,

  processingMessage: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    color: ${colors.neonTeal};
    margin: 0;
    opacity: 0.9;
  `,

  // Success content
  successContent: css`
    position: relative;
    z-index: 5;
    text-align: center;
    padding: ${layout.spacing['2xl']} 0;
  `,

  successIcon: css`
    font-size: ${typography.sizes['4xl']};
    margin-bottom: ${layout.spacing.xl};
    filter: drop-shadow(0 0 20px ${colors.neonGold});
  `,

  successTitle: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonGold};
    margin: 0 0 ${layout.spacing.md} 0;
    text-shadow: 0 0 15px ${colors.neonGold}50;
  `,

  successMessage: css`
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
    color: ${colors.neonTeal};
    margin: 0 0 ${layout.spacing.xl} 0;
    opacity: 0.9;
  `,

  successGears: css`
    display: flex;
    justify-content: center;
    gap: ${layout.spacing.lg};
  `,

  successGear: css`
    font-size: ${typography.sizes.xl};
    color: ${colors.neonTeal};
    filter: drop-shadow(0 0 10px ${colors.neonTeal});
  `,
};

export default styles;
