import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: ${layout.zIndex.overlay};
    overflow: hidden;
  `,

  flyItem: css`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${layout.spacing.md};
    background: linear-gradient(
      135deg,
      rgba(26, 148, 133, 0.1) 0%,
      rgba(26, 148, 133, 0.05) 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    border-radius: ${layout.borderRadius.lg};
    box-shadow: 
      0 4px 12px ${colors.shadow},
      0 0 20px ${colors.neonTeal}33;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    transition: transform 0.5s ${animations.easing.elegant};

    &:hover {
      transform: translateY(-10px) scale(1.05) !important;
      box-shadow: 
        0 8px 24px ${colors.shadow},
        0 0 30px ${colors.neonTeal}66;
    }
  `,

  flyImage: css`
    width: 100px;
    height: 100px;
    object-fit: contain;
    border-radius: ${layout.borderRadius.md};
    opacity: 0.8;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  `,

  flyText: css`
    font-family: ${typography.fonts.decorative};
    color: ${colors.textLight};
    font-size: ${typography.sizes.lg};
    text-shadow: 
      0 0 10px ${colors.neonTeal}4d,
      0 0 20px ${colors.neonGold}33;
    white-space: nowrap;
    opacity: 0.8;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  `,

  '@keyframes float': css`
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  `,

  '@keyframes spin': css`
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(360deg);
    }
  `,

  '@keyframes pulse': css`
    0%, 100% {
      opacity: 0.8;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  `,
};

export default styles;
