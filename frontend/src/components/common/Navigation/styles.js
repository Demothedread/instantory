import { animations } from '../../../styles/theme/animations';
import { colors } from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 100vh;
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(26, 26, 26, 0.98) 100%
    );
    transform: translateX(-100%);
    transition: transform 0.3s ${animations.easing.elegant};
    z-index: ${layout.zIndex.modal};
    box-shadow: 
      5px 0 30px ${colors.shadow},
      inset 0 0 100px ${colors.neonGold}1a;
    border-right: 1px solid ${colors.border};
    overflow-y: auto;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);

    &.open {
      transform: translateX(0);
    }
  `,

  header: css`
    padding: ${layout.spacing.xl} ${layout.spacing.lg};
    text-align: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonGold},
        transparent
      );
    }
  `,

  logo: css`
    font-family: ${typography.fonts.decorative};
    color: ${colors.neonGold};
    font-size: ${typography.sizes['3xl']};
    margin: 0;
    text-shadow: 
      0 0 10px ${colors.neonGold}4d,
      0 0 20px ${colors.neonTeal}33;
  `,

  menu: css`
    padding: ${layout.spacing.xl} ${layout.spacing.lg};
  `,

  menuItem: css`
    margin-bottom: ${layout.spacing.md};
  `,

  link: css`
    ${neoDecorocoBase.panel}
    display: flex;
    align-items: center;
    padding: ${layout.spacing.md};
    color: ${colors.textLight};
    text-decoration: none;
    font-family: ${typography.fonts.modern};
    font-size: ${typography.sizes.lg};
    transition: ${animations.transitions.all};
    border-radius: 10px;
    background: linear-gradient(
      135deg,
      rgba(26, 148, 133, 0.05) 0%,
      rgba(26, 148, 133, 0.02) 100%
    );
    border: 1px solid ${colors.border};
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonGold}1a,
        transparent
      );
      transform: translateX(-100%);
      transition: transform 0.5s ease;
    }

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(26, 148, 133, 0.08) 0%,
        rgba(26, 148, 133, 0.04) 100%
      );
      transform: translateY(-2px);
      box-shadow: 
        0 4px 12px ${colors.shadow},
        0 0 15px ${colors.neonGold}1a;

      &::before {
        transform: translateX(100%);
      }
    }

    &.active {
      background: ${colors.neonGold}1a;
      color: ${colors.neonGold};
      font-weight: ${typography.weights.semibold};
      box-shadow: 
        0 4px 12px ${colors.neonGold}33,
        inset 0 0 8px ${colors.textLight}4d;
    }
  `,

  icon: css`
    width: 24px;
    height: 24px;
    margin-right: ${layout.spacing.md};
    opacity: 0.8;
    transition: opacity 0.3s ease;
  `,

  toggle: css`
    ${neoDecorocoBase.button}
    position: fixed;
    top: ${layout.spacing.md};
    left: ${layout.spacing.md};
    width: 50px;
    height: 50px;
    border-radius: 50%;
    z-index: ${layout.zIndex.modal + 1};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: ${animations.transitions.all};

    &:hover {
      transform: scale(1.1);
      box-shadow: 
        0 6px 15px ${colors.neonGold}4d,
        inset 0 0 10px ${colors.textLight}66;
    }

    &.open {
      .toggle-icon {
        background: transparent;

        &::before {
          transform: rotate(45deg);
        }

        &::after {
          transform: rotate(-45deg);
        }
      }
    }
  `,

  toggleIcon: css`
    position: relative;
    width: 24px;
    height: 2px;
    background: ${colors.textLight};
    transition: ${animations.transitions.all};

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 24px;
      height: 2px;
      background: ${colors.textLight};
      transition: ${animations.transitions.all};
    }

    &::before {
      transform: translateY(-8px);
    }

    &::after {
      transform: translateY(8px);
    }
  `,

  '@media (max-width: 768px)': css`
    .container {
      width: 100%;
    }

    .toggle {
      top: ${layout.spacing.sm};
      left: ${layout.spacing.sm};
      width: 40px;
      height: 40px;
    }

    .toggle-icon,
    .toggle-icon::before,
    .toggle-icon::after {
      width: 20px;
    }
  `,
};

export default styles;
