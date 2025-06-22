import { css } from '@emotion/react';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';

const HowToUseOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      css={css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      `}
      onClick={onClose}
    >
      <div
        css={css`
          ${neoDecorocoBase.panel};
          max-width: 600px;
          max-height: 80vh;
          padding: ${layout.spacing.xl};
          margin: ${layout.spacing.lg};
          overflow-y: auto;
          position: relative;
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          css={css`
            ${neoDecorocoBase.button};
            position: absolute;
            top: ${layout.spacing.md};
            right: ${layout.spacing.md};
            background: none;
            border: none;
            color: ${colors.neonTeal};
            font-size: 1.5rem;
            &:hover {
              color: ${colors.neonGold};
            }
          `}
          onClick={onClose}
        >
          ×
        </button>
        
        <h2 css={css`
          color: ${colors.neonTeal};
          margin-bottom: ${layout.spacing.lg};
        `}>
          How to Use Bartleby
        </h2>
        
        <div css={css`
          line-height: 1.6;
          color: ${colors.textLight};
        `}>
          <p>Welcome to Bartleby! Here's how to get started:</p>
          <ul css={css`
            margin: ${layout.spacing.md} 0;
            padding-left: ${layout.spacing.lg};
          `}>
            <li>Upload documents and media files</li>
            <li>Process and organize your inventory</li>
            <li>Search through your documents</li>
            <li>Create and manage kaboodles</li>
            <li>Use the media hub for file management</li>
          </ul>
          <p>Navigate using the sidebar menu to access different features.</p>
        </div>
      </div>
    </div>
  );
};

export default HowToUseOverlay;
