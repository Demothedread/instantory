import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    max-width: ${layout.containers.md};
    margin: 0 auto;
    padding: ${layout.spacing.lg};
  `,

  title: css`
    ${neoDecorocoBase.heading}
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes['3xl']};
    color: ${colors.neonTeal};
    text-align: center;
    margin-bottom: ${layout.spacing.xl};
    text-shadow: 
      0 0 10px ${colors.neonTeal}4d,
      0 0 20px ${colors.neonGold}33;
  `,

  filterSection: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: ${layout.spacing.lg};
  `,

  searchInputGroup: css`
    display: flex;
    width: 100%;
    max-width: 600px;
    margin-bottom: ${layout.spacing.sm};
  `,

  searchInput: css`
    ${neoDecorocoBase.input}
    flex: 1;
    padding: ${layout.spacing.md};
    background: linear-gradient(
      135deg,
      rgba(26, 148, 133, 0.1) 0%,
      rgba(26, 148, 133, 0.05) 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    color: ${colors.textLight};
    font-family: ${typography.fonts.modern};
  `,

  searchButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: ${colors.neonTeal}1a;
    color: ${colors.textLight};
    border: 1px solid ${colors.neonTeal}33;
    cursor: pointer;
    transition: ${animations.transitions.all};

    &:hover {
      background: ${colors.neonTeal}33;
      transform: translateY(-2px);
      box-shadow: 
        0 4px 12px ${colors.shadow},
        0 0 20px ${colors.neonTeal}33;
    }
  `,

  filterMenu: css`
    position: relative;
    margin-top: ${layout.spacing.sm};
  `,

  filterTrigger: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.md} ${layout.spacing.lg};
    background: ${colors.neonTeal}1a;
    color: ${colors.textLight};
    border: 1px solid ${colors.neonTeal}33;
    cursor: pointer;
    transition: ${animations.transitions.all};

    &:hover {
      background: ${colors.neonTeal}33;
      transform: translateY(-2px);
      box-shadow: 
        0 4px 12px ${colors.shadow},
        0 0 20px ${colors.neonTeal}33;
    }
  `,

  filterDropdown: css`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${colors.darkGradient};
    box-shadow: 0 8px 16px ${colors.shadow};
    z-index: ${layout.zIndex.dropdown};
    min-width: 200px;
    margin-top: ${layout.spacing.xs};
    border: 1px solid ${colors.neonTeal}33;
    border-radius: ${layout.borderRadius.md};
    overflow: hidden;
  `,

  filterOption: css`
    ${neoDecorocoBase.button}
    width: 100%;
    text-align: left;
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    color: ${colors.textLight};
    background: transparent;
    border: none;
    cursor: pointer;
    transition: ${animations.transitions.all};

    &:hover {
      background: ${colors.neonTeal}1a;
    }
  `,

  errorMessage: css`
    ${neoDecorocoBase.panel}
    color: ${colors.error};
    background: rgba(255, 82, 82, 0.1);
    padding: ${layout.spacing.md};
    margin: ${layout.spacing.lg} 0;
    text-align: center;
    border: 1px solid ${colors.error};
    border-radius: ${layout.borderRadius.md};
  `,

  searchResults: css`
    margin-top: ${layout.spacing.xl};
  `,

  resultCard: css`
    ${neoDecorocoBase.panel}
    padding: ${layout.spacing.lg};
    margin-bottom: ${layout.spacing.md};
    background: linear-gradient(
      135deg,
      rgba(26, 148, 133, 0.1) 0%,
      rgba(26, 148, 133, 0.05) 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    animation: ${animations.fadeIn} 0.5s ${animations.easing.elegant};

    h4 {
      font-family: ${typography.fonts.decorative};
      color: ${colors.neonTeal};
      margin-bottom: ${layout.spacing.sm};
      font-size: ${typography.sizes.xl};
      text-shadow: 0 0 10px ${colors.neonTeal}4d;
    }
  `,

  resultCategory: css`
    font-family: ${typography.fonts.modern};
    color: ${colors.neonGold};
    margin-bottom: ${layout.spacing.sm};
  `,

  resultSummary: css`
    font-family: ${typography.fonts.elegant};
    color: ${colors.textLight};
    margin-bottom: ${layout.spacing.sm};
    line-height: 1.6;
  `,

  resultMetadata: css`
    font-family: ${typography.fonts.modern};
    color: ${colors.textLight};
    font-size: ${typography.sizes.sm};
    opacity: 0.8;
  `,
};

export default styles;
