import { animations } from '../../../styles/theme/animations';
import colors from '../../../styles/theme/colors';
import { css } from '@emotion/react';
import { layout } from '../../../styles/layouts/constraints';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { typography } from '../../../styles/theme/typography';

export const styles = {
  container: css`
    position: relative;
  `,

  menu: css`
    position: fixed;
    top: ${layout.spacing.md};
    right: ${layout.spacing.md};
    z-index: ${layout.zIndex.dropdown};
  `,

  button: css`
    ${neoDecorocoBase.button}
    display: flex;
    align-items: center;
    gap: ${layout.spacing.sm};
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    background: linear-gradient(
      135deg,
      rgba(26, 148, 133, 0.1) 0%,
      rgba(26, 148, 133, 0.05) 100%
    );
    border: 1px solid ${colors.neonTeal}33;
    border-radius: ${layout.borderRadius.full};
    cursor: pointer;
    transition: ${animations.transitions.all};

    &:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 4px 8px ${colors.shadow},
        inset 0 0 20px ${colors.neonGold}1a;
    }
  `,

  avatar: css`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${colors.neonTeal}33;
  `,

  avatarPlaceholder: css`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${colors.neonTeal}1a;
    color: ${colors.textLight};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: ${typography.weights.bold};
    border: 2px solid ${colors.neonTeal}33;
  `,

  name: css`
    color: ${colors.textLight};
    font-family: ${typography.fonts.decorative};
    font-size: ${typography.sizes.base};
    text-shadow: 0 0 10px ${colors.neonGold}4d;
  `,

  dropdown: css`
    position: absolute;
    top: calc(100% + ${layout.spacing.sm});
    right: 0;
    min-width: 200px;
    padding: ${layout.spacing.sm};
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(26, 26, 26, 0.98) 100%
    );
    border: 1px solid ${colors.border};
    border-radius: ${layout.borderRadius.lg};
    box-shadow: 
      0 4px 12px ${colors.shadow},
      inset 0 0 30px ${colors.neonGold}0a;
    animation: ${animations.fadeIn} 0.2s ${animations.easing.elegant};
  `,

  dropdownItem: css`
    ${neoDecorocoBase.button}
    width: 100%;
    text-align: left;
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    margin: 2px 0;
    font-size: ${typography.sizes.sm};
    background: transparent;
    border-radius: ${layout.borderRadius.md};
    transition: ${animations.transitions.all};

    &:hover {
      background: ${colors.neonTeal}1a;
      transform: translateX(${layout.spacing.xs});
    }
  `,

  exportsOverlay: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${colors.modalBg};
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: ${layout.zIndex.modal};
    animation: ${animations.fadeIn} 0.3s ${animations.easing.elegant};
  `,

  exportsModal: css`
    ${neoDecorocoBase.panel}
    width: 90%;
    max-width: ${layout.containers.md};
    max-height: 80vh;
    animation: ${animations.slideUp} 0.3s ${animations.easing.elegant};
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,

  exportsHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.lg};
    border-bottom: 1px solid ${colors.border};

    h2 {
      color: ${colors.neonTeal};
      font-family: ${typography.fonts.decorative};
      margin: 0;
      text-shadow: 0 0 10px ${colors.neonTeal}4d;
    }
  `,

  closeButton: css`
    ${neoDecorocoBase.button}
    font-size: ${typography.sizes.xl};
    padding: ${layout.spacing.sm};
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: ${colors.textLight};
    cursor: pointer;
    transition: ${animations.transitions.all};

    &:hover {
      background: ${colors.neonTeal}1a;
      transform: rotate(90deg);
    }
  `,

  exportsContent: css`
    padding: ${layout.spacing.lg};
    overflow-y: auto;
    max-height: calc(80vh - 80px);
  `,

  exportsList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
  `,

  exportItem: css`
    ${neoDecorocoBase.panel}
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${layout.spacing.md};
    border-radius: ${layout.borderRadius.lg};
    background: ${colors.neonTeal}0a;
    transition: ${animations.transitions.all};

    &:hover {
      transform: translateX(${layout.spacing.xs});
      background: ${colors.neonTeal}1a;
    }
  `,

  exportInfo: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.xs};
  `,

  exportName: css`
    color: ${colors.textLight};
    font-weight: ${typography.weights.bold};
  `,

  exportType: css`
    color: ${colors.textLight};
    opacity: 0.8;
    font-size: ${typography.sizes.sm};
  `,

  exportDate: css`
    color: ${colors.textLight};
    opacity: 0.7;
    font-size: ${typography.sizes.xs};
  `,

  downloadButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.md};
    border-radius: ${layout.borderRadius.full};
    background: ${colors.neonTeal}1a;
    color: ${colors.textLight};
    text-decoration: none;
    font-weight: ${typography.weights.semibold};
    transition: ${animations.transitions.all};

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px ${colors.shadow};
    }
  `,

  noExports: css`
    text-align: center;
    color: ${colors.textLight};
    opacity: 0.8;
    padding: ${layout.spacing.xl};
  `,

  loading: css`
    text-align: center;
    color: ${colors.textLight};
    padding: ${layout.spacing.xl};
  `,
};

export default styles;
