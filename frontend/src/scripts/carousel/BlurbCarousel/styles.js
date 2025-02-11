import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    position: relative;
    width: 100%;
    max-width: ${layout.containers.md};
    margin: 0 auto;
    padding: ${layout.spacing.lg};
    overflow: hidden;
  `,

  blurb: css`
    ${neoDecorocoBase.panel}
    position: absolute;
    width: 100%;
    padding: ${layout.spacing.lg};
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.5s ${animations.easing.elegant};
    background: linear-gradient(
      135deg,
      rgba(26, 148, 133, 0.1) 0%,
      rgba(26, 148, 133, 0.05) 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    box-shadow: 
      0 4px 12px ${colors.shadow},
      0 0 20px ${colors.neonTeal}33;

    &.active {
      opacity: 1;
      transform: translateX(0);
    }

    &.text {
      p {
        font-family: ${typography.fonts.decorative};
        color: ${colors.textLight};
        font-size: ${typography.sizes.xl};
        text-align: center;
        margin: 0;
        text-shadow: 
          0 0 10px ${colors.neonTeal}4d,
          0 0 20px ${colors.neonGold}33;
      }
    }

    &.quote {
      blockquote {
        font-family: ${typography.fonts.elegant};
        color: ${colors.neonGold};
        font-size: ${typography.sizes.xl};
        text-align: center;
        margin: 0;
        font-style: italic;
        text-shadow: 0 0 10px ${colors.neonGold}4d;

        &::before,
        &::after {
          content: '"';
          color: ${colors.neonTeal};
        }
      }
    }

    &.tip {
      .tip-label {
        font-family: ${typography.fonts.modern};
        color: ${colors.neonTeal};
        font-size: ${typography.sizes.sm};
        font-weight: ${typography.weights.bold};
        margin-right: ${layout.spacing.sm};
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    }

    &.image {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: ${layout.spacing.xl};

      img {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
        border-radius: ${layout.borderRadius.md};
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  `,

  '@keyframes flyInRight': css`
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,

  '@keyframes flyOutLeft': css`
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100%);
    }
  `,

  '@keyframes fadeIn': css`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `,

  '@keyframes fadeOut': css`
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  `,
};

export default styles;
