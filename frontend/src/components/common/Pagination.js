import { css } from '@emotion/react';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const paginationStyles = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: ${layout.spacing.xl};
    padding: ${layout.spacing.lg};
    border-top: 1px solid ${colors.border};
    
    .pagination-info {
      color: ${colors.textLight};
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.sm};
      opacity: 0.8;
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: ${layout.spacing.sm};
    }
    
    .pagination-button {
      background: ${colors.darkGradient};
      border: 1px solid ${colors.border};
      border-radius: 6px;
      color: ${colors.textLight};
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.sm};
      padding: ${layout.spacing.sm} ${layout.spacing.md};
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 40px;
      text-align: center;
      
      &:hover:not(:disabled) {
        background: ${colors.neonTeal};
        color: ${colors.dark};
        border-color: ${colors.neonTeal};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
      }
      
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      
      &.current-page {
        background: ${colors.neonTeal};
        color: ${colors.dark};
        border-color: ${colors.neonTeal};
        font-weight: ${typography.weights.medium};
      }
      
      &.ellipsis {
        background: transparent;
        border: none;
        cursor: default;
        
        &:hover {
          background: transparent;
          color: ${colors.textLight};
          transform: none;
          box-shadow: none;
        }
      }
    }
    
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: ${layout.spacing.sm};
      margin-left: ${layout.spacing.lg};
      
      label {
        color: ${colors.textLight};
        font-family: ${typography.fonts.modern};
        font-size: ${typography.sizes.sm};
        opacity: 0.8;
      }
      
      select {
        background: ${colors.darkGradient};
        border: 1px solid ${colors.border};
        border-radius: 6px;
        color: ${colors.textLight};
        font-family: ${typography.fonts.modern};
        font-size: ${typography.sizes.sm};
        padding: ${layout.spacing.xs} ${layout.spacing.sm};
        cursor: pointer;
        
        &:focus {
          outline: none;
          border-color: ${colors.neonTeal};
        }
      }
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: ${layout.spacing.md};
      
      .pagination-controls {
        order: 1;
      }
      
      .pagination-info {
        order: 2;
      }
      
      .page-size-selector {
        order: 3;
        margin-left: 0;
      }
    }
  `;

  if (totalPages <= 1) return null;

  return (
    <div css={paginationStyles}>
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {totalItems} items
      </div>
      
      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First page"
        >
          ⏮
        </button>
        
        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
        >
          ←
        </button>
        
        {pageNumbers.map((pageNum, index) => (
          <button
            key={index}
            className={`pagination-button ${
              pageNum === currentPage ? 'current-page' : ''
            } ${pageNum === '...' ? 'ellipsis' : ''}`}
            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            disabled={pageNum === '...'}
          >
            {pageNum}
          </button>
        ))}
        
        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          →
        </button>
        
        <button
          className="pagination-button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last page"
        >
          ⏭
        </button>
      </div>
    </div>
  );
};

export default Pagination;
