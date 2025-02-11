import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    height: 100%;
    overflow-y: auto;
    padding: ${layout.spacing.md};
    
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
    ${neoDecorocoBase.heading}
    margin-bottom: ${layout.spacing.xl};
  `,

  filterSection: css`
    display: flex;
    gap: ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.xl};
    flex-wrap: wrap;
  `,

  searchFilter: css`
    flex: 1;
    min-width: 300px;
    
    input {
      ${neoDecorocoBase.input}
      padding-right: ${layout.spacing.xl};
    }
  `,

  filterMenu: css`
    position: relative;
    
    .filter-menu-trigger {
      ${neoDecorocoBase.button}
      display: flex;
      align-items: center;
      gap: ${layout.spacing.sm};
      padding: ${layout.spacing.sm} ${layout.spacing.lg};
    }
    
    .filter-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: ${layout.spacing.sm};
      background: ${colors.darkGradient};
      border: 1px solid ${colors.border};
      border-radius: 8px;
      padding: ${layout.spacing.sm};
      min-width: 200px;
      z-index: ${layout.zIndex.dropdown};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      
      button {
        ${neoDecorocoBase.button}
        width: 100%;
        text-align: left;
        padding: ${layout.spacing.sm} ${layout.spacing.md};
        margin: 2px 0;
        font-size: ${typography.sizes.sm};
        background: transparent;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  `,

  masonryGrid: css`
    display: flex;
    margin-left: -${layout.spacing.md};
    width: auto;
  `,

  masonryColumn: css`
    padding-left: ${layout.spacing.md};
    background-clip: padding-box;
  `,

  imageItem: css`
    ${neoDecorocoBase.panel}
    margin-bottom: ${layout.spacing.md};
    cursor: pointer;
    transition: ${animations.transitions.all};
    overflow: hidden;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${colors.neonGlow} ${colors.neonTeal};
      
      .image-overlay {
        opacity: 1;
      }
    }
    
    img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
  `,

  imageOverlay: css`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: ${layout.spacing.md};
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0)
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    
    h3 {
      color: ${colors.textLight};
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.lg};
      margin: 0 0 ${layout.spacing.sm};
    }
    
    p {
      color: ${colors.textLight};
      font-family: ${typography.fonts.primary};
      font-size: ${typography.sizes.sm};
      margin: 0;
      opacity: 0.8;
    }
  `,

  modal: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${colors.modalBg};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${layout.zIndex.modal};
    padding: ${layout.spacing.lg};
  `,

  modalContent: css`
    ${neoDecorocoBase.panel}
    width: 90%;
    max-width: ${layout.containers.lg};
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.xl};
    position: relative;
    
    .close {
      position: absolute;
      top: ${layout.spacing.md};
      right: ${layout.spacing.md};
      font-size: ${typography.sizes.xl};
      color: ${colors.textLight};
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      
      &:hover {
        opacity: 1;
      }
    }
  `,

  modalImage: css`
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
    border-radius: 8px;
  `,

  modalDetails: css`
    .description {
      color: ${colors.textLight};
      font-family: ${typography.fonts.elegant};
      font-size: ${typography.sizes.base};
      line-height: 1.6;
      margin-bottom: ${layout.spacing.lg};
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: ${layout.spacing.md};
      
      .detail-item {
        color: ${colors.textLight};
        font-family: ${typography.fonts.primary};
        font-size: ${typography.sizes.sm};
        
        strong {
          color: ${colors.neonTeal};
          font-family: ${typography.fonts.modern};
          display: block;
          margin-bottom: 4px;
        }
      }
    }
  `,

  imageError: css`
    background: rgba(255, 82, 82, 0.1);
    color: ${colors.error};
    padding: ${layout.spacing.lg};
    text-align: center;
    border-radius: 8px;
    font-family: ${typography.fonts.primary};
    font-size: ${typography.sizes.base};
  `,
};

export default styles;
