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

  semanticSearch: css`
    ${neoDecorocoBase.panel}
    margin: ${layout.spacing.lg} 0;
    padding: ${layout.spacing.lg};
    display: flex;
    gap: ${layout.spacing.md};
    align-items: center;
    
    input {
      ${neoDecorocoBase.input}
      flex: 1;
    }
    
    button {
      ${neoDecorocoBase.button}
      white-space: nowrap;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `,

  searchResults: css`
    margin-top: ${layout.spacing.xl};
    
    .subtitle {
      ${neoDecorocoBase.heading}
      font-size: ${typography.sizes.xl};
      margin-bottom: ${layout.spacing.lg};
    }
    
    .clear-results {
      ${neoDecorocoBase.button}
      margin-bottom: ${layout.spacing.lg};
    }
  `,

  resultItem: css`
    ${neoDecorocoBase.panel}
    margin-bottom: ${layout.spacing.lg};
    padding: ${layout.spacing.lg};
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${layout.spacing.md};
      
      h4 {
        font-family: ${typography.fonts.modern};
        font-size: ${typography.sizes.lg};
        color: ${colors.textLight};
        margin: 0;
      }
    }
    
    .result-summary {
      font-family: ${typography.fonts.elegant};
      color: ${colors.textLight};
      opacity: 0.8;
      margin-bottom: ${layout.spacing.lg};
      line-height: 1.6;
    }
    
    .relevant-chunks {
      h5 {
        font-family: ${typography.fonts.modern};
        font-size: ${typography.sizes.base};
        color: ${colors.neonTeal};
        margin-bottom: ${layout.spacing.sm};
      }
      
      .chunk {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: ${layout.spacing.md};
        
        .chunk-content {
          font-family: ${typography.fonts.primary};
          font-size: ${typography.sizes.sm};
          color: ${colors.textLight};
          line-height: 1.6;
        }
      }
    }
  `,

  tableContainer: css`
    ${neoDecorocoBase.panel}
    margin-top: ${layout.spacing.lg};
    overflow-x: auto;
    
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
      
      &.expandable-cell {
        max-width: ${layout.components.table.cellMaxWidth.md};
        
        .cell-content {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          line-height: 1.5;
        }
      }
    }
  `,

  downloadButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    font-size: ${typography.sizes.sm};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${colors.neonGlow} ${colors.neonTeal};
    }
  `,

  footer: css`
    margin-top: ${layout.spacing.lg};
    padding: ${layout.spacing.md};
    border-top: 1px solid ${colors.border};
    color: ${colors.textLight};
    font-family: ${typography.fonts.modern};
    font-size: ${typography.sizes.sm};
    opacity: 0.7;
    text-align: right;
  `,
};

export default styles;
