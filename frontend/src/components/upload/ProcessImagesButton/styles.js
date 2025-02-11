import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: (isMinimized) => css`
    ${neoDecorocoBase.panel}
    width: 100%;
    height: ${isMinimized ? layout.heights.minimizedUpload : 'auto'};
    padding: ${isMinimized ? layout.spacing.md : layout.spacing.xl};
    transition: ${animations.transitions.all};
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        ${colors.neonTeal},
        ${colors.neonGold},
        ${colors.neonTeal}
      );
      opacity: ${isMinimized ? 1 : 0.5};
      transition: opacity 0.3s ease;
    }
  `,

  instructionSection: (isMinimized) => css`
    margin-bottom: ${isMinimized ? '0' : layout.spacing.lg};
    transition: ${animations.transitions.all};
    
    label {
      display: ${isMinimized ? 'none' : 'block'};
      margin-bottom: ${layout.spacing.sm};
      color: ${colors.textLight};
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.sm};
      letter-spacing: ${typography.letterSpacing.wide};
    }
  `,

  instructionInput: css`
    ${neoDecorocoBase.input}
    background: rgba(255, 255, 255, 0.05);
    transition: ${animations.transitions.all};
    
    &:focus {
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 15px ${colors.neonTeal}33;
    }
  `,

  fileUploadSection: (isMinimized) => css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    transition: ${animations.transitions.all};
    transform-origin: left center;
    transform: scale(${isMinimized ? 0.8 : 1});
  `,

  fileInput: css`
    display: none;
  `,

  uploadLabel: css`
    ${neoDecorocoBase.button}
    display: inline-flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    font-size: ${typography.sizes.sm};
    
    &::before {
      content: '📁';
      font-size: ${typography.sizes.lg};
    }
  `,

  fileInfo: css`
    color: ${colors.textLight};
    font-family: ${typography.fonts.modern};
    font-size: ${typography.sizes.sm};
    opacity: 0.8;
  `,

  errorMessage: css`
    color: ${colors.error};
    font-size: ${typography.sizes.sm};
    margin-top: ${layout.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    
    &::before {
      content: '⚠️';
    }
  `,

  uploadProgress: css`
    margin-top: ${layout.spacing.md};
    
    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      margin-bottom: ${layout.spacing.sm};
      overflow: hidden;
      
      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(
          90deg,
          ${colors.neonTeal},
          ${colors.neonGold}
        );
        transition: width 0.3s ease;
      }
    }
    
    .processing-status {
      color: ${colors.textLight};
      font-size: ${typography.sizes.sm};
      text-align: center;
      opacity: 0.8;
    }
  `,

  processButton: css`
    ${neoDecorocoBase.button}
    width: 100%;
    margin-top: ${layout.spacing.md};
    padding: ${layout.spacing.md};
    font-size: ${typography.sizes.base};
    letter-spacing: ${typography.letterSpacing.wide};
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.processing {
      position: relative;
      color: transparent;
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        border: 2px solid ${colors.textLight};
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
      }
    }
  `,

  authMessage: css`
    ${neoDecorocoBase.panel}
    padding: ${layout.spacing.lg};
    text-align: center;
    color: ${colors.textLight};
    font-family: ${typography.fonts.modern};
    font-size: ${typography.sizes.base};
    opacity: 0.8;
  `,
};

export default styles;
