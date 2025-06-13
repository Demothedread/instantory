import { css } from '@emotion/react';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { layout } from '../../../styles/layouts/constraints';
import { animations } from '../../../styles/theme/animations';
import { colors } from '../../../styles/theme/colors';
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
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${layout.spacing.lg};
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: ${layout.spacing.md};
        align-items: stretch;
      }
    }
  `,

  loadingContainer: css`
    ${neoDecorocoBase.panel}
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${layout.spacing.lg};
    padding: ${layout.spacing.xl};
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid ${colors.border};
      border-top-color: ${colors.neonTeal};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-text {
      color: ${colors.textLight};
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.lg};
    }
  `,

  title: css`
    ${neoDecorocoBase.heading}
    margin-bottom: ${layout.spacing.xl};
    
    .title-text {
      position: relative;
      display: inline-block;
      
      &::before, &::after {
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
    }
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
    
    .search-input-wrapper {
      position: relative;
      
      input {
        ${neoDecorocoBase.input}
        padding-right: ${layout.spacing.xl};
      }
      
      .search-icon {
        position: absolute;
        right: ${layout.spacing.md};
        top: 50%;
        transform: translateY(-50%);
        color: ${colors.textLight};
        opacity: 0.7;
      }
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
      
      .filter-icon {
        font-size: ${typography.sizes.lg};
      }
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

  tableContainer: css`
    ${neoDecorocoBase.panel}
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
    
    /* Hide scrollbar for cleaner look but maintain functionality */
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${colors.neonTeal};
      border-radius: 2px;
    }
    
    table {
      ${neoDecorocoBase.table}
      min-width: 100%;
    }
    
    th {
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      padding: ${layout.spacing.md} ${layout.spacing.lg};
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    
    td {
      padding: ${layout.spacing.md} ${layout.spacing.lg};
      
      &.name-cell {
        font-weight: ${typography.weights.medium};
        color: ${colors.neonTeal};
      }
      
      &.description-cell {
        max-width: ${layout.components.table.cellMaxWidth.lg};
        
        .description-line {
          margin-bottom: ${layout.spacing.xs};
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
      
      &.image-cell {
        width: 100px;
        
        .image-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
            
            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }
      
      &.category-cell {
        .category-badge {
          display: inline-block;
          padding: ${layout.spacing.xs} ${layout.spacing.sm};
          background: rgba(26, 148, 133, 0.2);
          border: 1px solid ${colors.neonTeal};
          border-radius: 12px;
          font-size: ${typography.sizes.sm};
          color: ${colors.neonTeal};
        }
      }
      
      &.color-cell {
        .color-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: ${layout.spacing.sm};
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      }
      
      &.price-cell {
        font-family: ${typography.fonts.modern};
        color: ${colors.neonGold};
      }
    }
  `,

  emptyState: css`
    ${neoDecorocoBase.panel}
    padding: ${layout.spacing.xl};
    text-align: center;
    
    .empty-state-icon {
      font-size: ${typography.sizes['5xl']};
      margin-bottom: ${layout.spacing.lg};
      animation: ${animations.presets.neonGlow};
    }
    
    .empty-state-text {
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.xl};
      color: ${colors.textLight};
      margin-bottom: ${layout.spacing.md};
    }
    
    .empty-state-subtext {
      font-family: ${typography.fonts.elegant};
      font-size: ${typography.sizes.lg};
      color: ${colors.textLight};
      opacity: 0.7;
    }
  `,
};

export default styles;
