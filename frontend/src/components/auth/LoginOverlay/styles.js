import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  overlay: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${colors.modalBg};
    display: flex; 
    justify-content: center;
    align-items: center;
    z-index: ${layout.zIndex.modal};
    opacity: 0;
    transition: opacity 0.5s ${animations.easing.elegant};

    &.show {
      opacity: 1;
    }
  `,

  panel: css`
    ${neoDecorocoBase.panel}
    position: relative;
    width: 90%;
    max-width: 480px;
    padding: ${layout.spacing.xl};
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(26, 26, 26, 0.98) 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    border-radius: ${layout.borderRadius.xl};
    box-shadow: 
      0 0 30px ${colors.neonTeal}4d,
      0 0 30px ${colors.neonGold}33,
      0 0 50px ${colors.shadow};
    transform: translateY(20px);
    opacity: 0;
    animation: ${animations.slideUp} 0.5s ${animations.easing.elegant} forwards 0.3s;
  `,

  decoration: css`
    position: absolute;
    width: 60px;
    height: 60px;
    pointer-events: none;

    &.top-left {
      top: -10px;
      left: -10px;
      border-top: 2px solid ${colors.neonTeal}33;
      border-left: 2px solid ${colors.neonTeal}33;
      border-radius: ${layout.borderRadius.lg} 0 0 0;
    }

    &.top-right {
      top: -10px;
      right: -10px;
      border-top: 2px solid ${colors.neonTeal}33;
      border-right: 2px solid ${colors.neonTeal}33;
      border-radius: 0 ${layout.borderRadius.lg} 0 0;
    }

    &.bottom-left {
      bottom: -10px;
      left: -10px;
      border-bottom: 2px solid ${colors.neonTeal}33;
      border-left: 2px solid ${colors.neonTeal}33;
      border-radius: 0 0 0 ${layout.borderRadius.lg};
    }

    &.bottom-right {
      bottom: -10px;
      right: -10px;
      border-bottom: 2px solid ${colors.neonTeal}33;
      border-right: 2px solid ${colors.neonTeal}33;
      border-radius: 0 0 ${layout.borderRadius.lg} 0;
    }
  `,

  title: css`
    text-align: center;
    margin-bottom: ${layout.spacing.xl};
  `,

  titleText: css`
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    color: ${colors.neonTeal};
    text-shadow: 0 0 10px ${colors.neonTeal}4d;
  `,

  titleUnderline: css`
    width: 100px;
    height: 2px;
    background: ${colors.neonTeal}33;
    margin: ${layout.spacing.sm} auto 0;
  `,

  errorMessage: css`
    ${neoDecorocoBase.panel}
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.md};
    margin-bottom: ${layout.spacing.lg};
    background: rgba(255, 82, 82, 0.1);
    border: 1px solid ${colors.error};
    border-radius: ${layout.borderRadius.md};
    color: ${colors.error};
    cursor: pointer;
    transition: ${animations.transitions.all};

    &:hover {
      background: rgba(255, 82, 82, 0.15);
    }
  `,

  errorIcon: css`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${colors.error};
    border-radius: 50%;
    font-weight: ${typography.weights.bold};
  `,

  errorClose: css`
    margin-left: auto;
    font-size: ${typography.sizes.xl};
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  `,

  loginOptions: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
  `,

  googleLoginWrapper: css`
    display: flex;
    justify-content: center;
  `,

  divider: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    margin: ${layout.spacing.sm} 0;
  `,

  dividerLine: css`
    flex: 1;
    height: 1px;
    background: ${colors.neonTeal}33;
  `,

  dividerText: css`
    color: ${colors.textLight};
    font-size: ${typography.sizes.sm};
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 1px;
  `,

  emailForm: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
  `,

  inputWrapper: css`
    position: relative;
  `,

  emailInput: css`
    ${neoDecorocoBase.input}
    width: 100%;
    padding: ${layout.spacing.md};
    background: linear-gradient(
      135deg,
      rgba(26, 148, 133, 0.1) 0%,
      rgba(26, 148, 133, 0.05) 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    border-radius: ${layout.borderRadius.md};
    color: ${colors.textLight};
    font-family: ${typography.fonts.modern};
    transition: ${animations.transitions.all};

    &:focus {
      border-color: ${colors.neonTeal}66;
      box-shadow: 0 0 15px ${colors.neonTeal}33;
    }
  `,

  inputDecoration: css`
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    height: 2px;
    background: ${colors.neonTeal}33;
    transition: width 0.3s ease;

    input:focus + & {
      width: 100%;
    }
  `,

  emailLoginButton: css`
    ${neoDecorocoBase.button}
    position: relative;
    width: 100%;
    padding: ${layout.spacing.md};
    background: linear-gradient(
      135deg,
      ${colors.neonTeal}1a 0%,
      ${colors.neonTeal}0d 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    border-radius: ${layout.borderRadius.md};
    color: ${colors.textLight};
    font-family: ${typography.fonts.modern};
    font-weight: ${typography.weights.medium};
    transition: ${animations.transitions.all};
    overflow: hidden;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 
        0 4px 12px ${colors.shadow},
        0 0 20px ${colors.neonTeal}33;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `,

  buttonText: css`
    position: relative;
    z-index: 1;
  `,

  buttonDecoration: css`
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      ${colors.neonTeal}1a,
      transparent
    );
    transition: transform 0.5s ease;

    button:hover & {
      transform: translateX(50%);
    }
  `,

  loading: css`
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonTeal}1a,
        transparent
      );
      animation: ${animations.shimmer} 1.5s infinite;
    }
  `,

  footer: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    margin-top: ${layout.spacing.xl};
  `,

  footerText: css`
    color: ${colors.textLight};
    font-size: ${typography.sizes.sm};
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 1px;
  `,

  footerDecoration: css`
    flex: 1;
    height: 1px;
    background: ${colors.neonTeal}33;

    &.left {
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonTeal}33
      );
    }

    &.right {
      background: linear-gradient(
        90deg,
        ${colors.neonTeal}33,
        transparent
      );
    }
  `,
};

export default styles;
