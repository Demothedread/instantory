import React, { useState } from 'react';
import { css } from '@emotion/react';
import { colors } from '../../styles/theme/colors';
import { neoDecorocoBase } from '../../styles/components/neo-decoroco/base';
import layout from '../../styles/layouts/constraints';

const RolodexToggle = ({ onLayoutChange, currentLayout = 'table' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const layouts = [
    { id: 'table', name: 'Table View', icon: '📊', description: 'Structured data in rows and columns' },
    { id: 'grid', name: 'Grid View', icon: '🔲', description: 'Visual cards in a masonry layout' },
    { id: 'graph', name: 'Node Graph', icon: '🕸️', description: 'Interactive relationship visualization' },
    { id: 'browser', name: 'Document Browser', icon: '📄', description: 'Full document reading interface' }
  ];

  const finishes = [
    { id: 'default', name: 'Default', icon: '🎨', description: 'Standard Bartleby theme' },
    { id: 'research', name: 'Research', icon: '🔬', description: 'Academic paper analysis' },
    { id: 'legal', name: 'Legal', icon: '⚖️', description: 'Legal document review' },
    { id: 'business', name: 'Business', icon: '💼', description: 'Corporate document management' }
  ];

  const handleLayoutSelect = (layoutId) => {
    onLayoutChange?.(layoutId);
    setIsExpanded(false);
  };

  const currentLayoutData = layouts.find(l => l.id === currentLayout) || layouts[0];

  return (
    <div css={styles.container}>
      <div css={styles.rolodex}>
        <button 
          css={[neoDecorocoBase.button, styles.toggleButton]}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span css={styles.currentLayout}>
            <span css={styles.layoutIcon}>{currentLayoutData.icon}</span>
            <span css={styles.layoutName}>{currentLayoutData.name}</span>
          </span>
          <span css={styles.expandIcon}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {isExpanded && (
          <div css={styles.dropdown}>
            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>📋 View Layouts</h3>
              <div css={styles.optionGrid}>
                {layouts.map((layout) => (
                  <button
                    key={layout.id}
                    css={[
                      styles.option,
                      currentLayout === layout.id && styles.activeOption
                    ]}
                    onClick={() => handleLayoutSelect(layout.id)}
                  >
                    <span css={styles.optionIcon}>{layout.icon}</span>
                    <div css={styles.optionContent}>
                      <span css={styles.optionName}>{layout.name}</span>
                      <span css={styles.optionDesc}>{layout.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div css={styles.divider} />

            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>🎨 Finishes</h3>
              <div css={styles.optionGrid}>
                {finishes.map((finish) => (
                  <button
                    key={finish.id}
                    css={styles.option}
                    onClick={() => console.log('Finish selected:', finish.id)}
                  >
                    <span css={styles.optionIcon}>{finish.icon}</span>
                    <div css={styles.optionContent}>
                      <span css={styles.optionName}>{finish.name}</span>
                      <span css={styles.optionDesc}>{finish.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div css={styles.divider} />

            <div css={styles.section}>
              <h3 css={styles.sectionTitle}>⬇️ Export Options</h3>
              <div css={styles.exportButtons}>
                <button css={[neoDecorocoBase.button, styles.exportButton]}>
                  📊 Export CSV
                </button>
                <button css={[neoDecorocoBase.button, styles.exportButton]}>
                  📄 Export JSON
                </button>
                <button css={[neoDecorocoBase.button, styles.exportButton]}>
                  🖼️ Export Grid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div css={styles.backdrop} onClick={() => setIsExpanded(false)} />
      )}
    </div>
  );
};

const styles = {
  container: css`
    position: relative;
    z-index: ${layout.zIndex.dropdown};
  `,

  rolodex: css`
    position: relative;
  `,

  toggleButton: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 200px;
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    
    &:hover {
      border-color: ${colors.neonTeal};
      background: ${colors.hover};
    }
  `,

  currentLayout: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  layoutIcon: css`
    font-size: 1.25rem;
  `,

  layoutName: css`
    font-weight: 500;
  `,

  expandIcon: css`
    font-size: 0.875rem;
    opacity: 0.7;
    transition: transform 0.2s ease;
  `,

  dropdown: css`
    position: absolute;
    top: calc(100% + ${layout.spacing.sm});
    left: 0;
    right: 0;
    min-width: 400px;
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    box-shadow: ${layout.shadows.xl};
    backdrop-filter: blur(10px);
    padding: ${layout.spacing.lg};
    z-index: ${layout.zIndex.dropdown + 1};
  `,

  backdrop: css`
    position: fixed;
    inset: 0;
    z-index: ${layout.zIndex.dropdown - 1};
  `,

  section: css`
    margin-bottom: ${layout.spacing.lg};
    
    &:last-child {
      margin-bottom: 0;
    }
  `,

  sectionTitle: css`
    color: ${colors.neonTeal};
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 ${layout.spacing.md} 0;
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
  `,

  optionGrid: css`
    display: grid;
    gap: ${layout.spacing.sm};
  `,

  option: css`
    display: flex;
    align-items: center;
    gap: ${layout.spacing.md};
    padding: ${layout.spacing.md};
    background: none;
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.base};
    color: ${colors.textLight};
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    
    &:hover {
      background: ${colors.hover};
      border-color: ${colors.neonTeal};
    }
  `,

  activeOption: css`
    background: ${colors.active};
    border-color: ${colors.neonTeal};
    color: ${colors.neonTeal};
  `,

  optionIcon: css`
    font-size: 1.5rem;
    flex-shrink: 0;
  `,

  optionContent: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
    flex: 1;
  `,

  optionName: css`
    font-weight: 500;
    font-size: 0.9rem;
  `,

  optionDesc: css`
    font-size: 0.75rem;
    opacity: 0.7;
    line-height: 1.3;
  `,

  divider: css`
    height: 1px;
    background: ${colors.border};
    margin: ${layout.spacing.lg} 0;
  `,

  exportButtons: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${layout.spacing.sm};
  `,

  exportButton: css`
    font-size: 0.875rem;
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    background: linear-gradient(135deg, ${colors.neonGold}, #DAA520);
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px ${colors.neonGold}30;
    }
  `
};

export default RolodexToggle;
