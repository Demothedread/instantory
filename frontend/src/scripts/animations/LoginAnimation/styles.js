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

  backgroundOverlay: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(26, 26, 26, 0.98) 100%
    );
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  `,

  modal: css`
    ${neoDecorocoBase.panel}
    position: relative;
    max-width: 90%;
    margin: ${layout.spacing.xl};
    transform: translateY(20px);
    opacity: 0;
    animation: ${animations.slideUp} 0.5s ${animations.easing.elegant} forwards 0.3s;
    box-shadow: 
      0 0 30px ${colors.neonTeal}4d,
      0 0 30px ${colors.neonGold}33,
      0 0 50px ${colors.shadow};

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        45deg,
        transparent,
        ${colors.neonTeal}0a,
        ${colors.neonGold}0a,
        transparent
      );
      animation: ${animations.shimmer} 3s infinite;
    }

    &::before {
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }
  `,

  floatingAnimation: css`
    animation: ${animations.float} 3s ${animations.easing.elegant} infinite;
  `,

  '@keyframes float': css`
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  `,

  '@keyframes shimmer': css`
    0% {
      opacity: 0;
      transform: translateX(-100%) rotate(45deg);
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
      transform: translateX(100%) rotate(45deg);
    }
  `,
};

export default styles;
