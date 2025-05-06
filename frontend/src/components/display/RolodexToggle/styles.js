import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import layout from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    ${neoDecorocoBase.panel}
    height: calc(100vh - ${layout.heights.minimizedUpload} - ${layout.heights.header});
    max-height: calc(${layout.viewport.maxHeight} - ${layout.heights.minimizedUpload} - ${layout.heights.header});
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
    perspective: ${layout.components.rolodex.perspective};
  `,

  controls: css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.xl};
    padding: ${layout.spacing.md};
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.05),
      transparent
    );
    border-bottom: 1px solid ${colors.border};
  `,

  title: css`
    ${neoDecorocoBase.heading}
    margin: 0;
    font-size: ${typography.sizes['2xl']};
    color: ${colors.textLight};
    text-align: center;
    position: relative;
    padding: 0;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 50px;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent,
        ${colors.neonTeal},
        transparent
      );
    }

    &::before {
      right: 100%;
      margin-right: ${layout.spacing.md};
    }

    &::after {
      left: 100%;
      margin-left: ${layout.spacing.md};
    }
  `,

  navigationButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    font-size: ${typography.sizes.xl};
    min-width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${colors.neonGlow} ${colors.neonTeal};
    }
  `,

  view: css`
    flex: 1;
    position: relative;
    overflow: hidden;
    perspective: ${layout.components.rolodex.perspective};
  `,

  carousel: css`
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s ${animations.easing.elegant};
  `,

  item: css`
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transition: opacity 0.3s ease;
    opacity: 0;
    padding: ${layout.spacing.lg};
    
    &.active {
      opacity: 1;
    }

    /* Custom scrollbar for the content */
    overflow-y: auto;
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
      border: 2px solid transparent;
    }
  `,

  emptyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${colors.textLight};
    opacity: 0.7;
    text-align: center;
    gap: ${layout.spacing.md};

    .icon {
      font-size: ${typography.sizes['4xl']};
      margin-bottom: ${layout.spacing.md};
      animation: ${animations.presets.neonGlow};
    }

    .message {
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.lg};
    }

    .submessage {
      font-family: ${typography.fonts.elegant};
      font-size: ${typography.sizes.base};
      opacity: 0.8;
    }
  `,
};

export default styles;
