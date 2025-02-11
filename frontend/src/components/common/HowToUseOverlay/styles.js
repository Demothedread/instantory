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
    right: 0;
    bottom: 0;
    background: ${colors.modalBg};
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: ${layout.zIndex.modal};
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    animation: ${animations.fadeIn} 0.3s ${animations.easing.elegant};
  `,

  modal: css`
    ${neoDecorocoBase.panel}
    position: relative;
    width: 90%;
    max-width: ${layout.containers.lg};
    max-height: 90vh;
    padding: ${layout.spacing.xl};
    overflow: hidden;
    animation: ${animations.presets.slideUp};
  `,

  content: css`
    max-height: calc(90vh - ${layout.spacing.xl} * 2);
    overflow-y: auto;
    padding-right: ${layout.spacing.md};
    
    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: ${colors.neonTeal} transparent;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: ${colors.neonTeal};
      border-radius: 3px;
    }
  `,

  header: css`
    text-align: center;
    margin-bottom: ${layout.spacing.xl};
    position: relative;

    h2 {
      ${neoDecorocoBase.heading}
      font-size: ${typography.sizes['4xl']};
      margin: 0;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -${layout.spacing.md};
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 2px;
        background: linear-gradient(
          90deg,
          transparent,
          ${colors.neonTeal},
          ${colors.neonGold},
          transparent
        );
      }
    }
  `,

  section: css`
    ${neoDecorocoBase.panel}
    margin-bottom: ${layout.spacing.xl};
    padding: ${layout.spacing.lg};
    background: rgba(26, 148, 133, 0.05);
    position: relative;
    overflow: hidden;

    h3 {
      font-family: ${typography.fonts.decorative};
      color: ${colors.neonTeal};
      font-size: ${typography.sizes['2xl']};
      margin-bottom: ${layout.spacing.lg};
      text-shadow: 0 0 10px ${colors.neonTeal}66;
    }

    p {
      font-family: ${typography.fonts.elegant};
      color: ${colors.textLight};
      font-size: ${typography.sizes.lg};
      line-height: 1.6;
      margin-bottom: ${layout.spacing.md};
    }
  `,

  featureList: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${layout.spacing.lg};
    margin-top: ${layout.spacing.lg};
  `,

  featureItem: css`
    ${neoDecorocoBase.panel}
    padding: ${layout.spacing.lg};
    background: rgba(26, 148, 133, 0.08);
    transition: ${animations.transitions.all};

    &:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 20px ${colors.shadow},
        0 0 15px ${colors.neonTeal}66;
    }

    h4 {
      font-family: ${typography.fonts.decorative};
      color: ${colors.neonGold};
      font-size: ${typography.sizes.xl};
      margin-bottom: ${layout.spacing.sm};
      text-shadow: 0 0 8px ${colors.neonGold}66;
    }

    p {
      font-size: ${typography.sizes.base};
      margin-bottom: 0;
    }
  `,

  closeButton: css`
    ${neoDecorocoBase.button}
    position: absolute;
    top: ${layout.spacing.md};
    right: ${layout.spacing.md};
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${typography.sizes['2xl']};
    padding: 0;
    transition: ${animations.transitions.all};

    &:hover {
      transform: rotate(90deg);
      box-shadow: 
        0 0 15px ${colors.neonTeal},
        0 0 15px ${colors.neonGold};
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 2px;
      background: ${colors.textLight};
      transform-origin: center;
    }

    &::before {
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }
  `,

  // Media queries
  '@media (max-width: 768px)': css`
    .modal {
      padding: ${layout.spacing.lg};
      width: 95%;
    }

    .header h2 {
      font-size: ${typography.sizes['3xl']};
    }

    .section {
      padding: ${layout.spacing.md};
    }

    .featureList {
      grid-template-columns: 1fr;
    }
  `,
};

export default styles;
