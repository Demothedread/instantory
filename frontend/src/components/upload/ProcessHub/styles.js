import { css } from '@emotion/react';
import { neoDecorocoBase } from '../../../styles/components/neo-decoroco/base';
import { colors } from '../../../styles/theme/colors';
import { typography } from '../../../styles/theme/typography';
import { layout } from '../../../styles/layouts/constraints';
import { animations } from '../../../styles/theme/animations';

const styles = {
  container: css`
    ${neoDecorocoBase.pageContainer}
    max-width: ${layout.containers.xl};
    margin: 0 auto;
  `,
  
  header: css`
    text-align: center;
    margin-bottom: ${layout.spacing.xl};
  `,
  
  title: css`
    ${neoDecorocoBase.heading}
    font-size: ${typography.sizes['4xl']};
    margin-bottom: ${layout.spacing.sm};
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -${layout.spacing.xs};
      left: 50%;
      transform: translateX(-50%);
      width: 180px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${colors.neonTeal}, ${colors.neonGold}, transparent);
    }
  `,
  
  subtitle: css`
    color: ${colors.textLight};
    font-family: ${typography.fonts.elegant};
    font-size: ${typography.sizes.lg};
    opacity: 0.8;
  `,
  
  tabContainer: css`
    display: flex;
    justify-content: center;
    margin-bottom: ${layout.spacing.lg};
    gap: ${layout.spacing.sm};
  `,
  
  tabButton: css`
    ${neoDecorocoBase.button}
    padding: ${layout.spacing.sm} ${layout.spacing.lg};
    background: rgba(26, 148, 133, 0.1);
    border: 1px solid ${colors.neonTeal}30;
    transition: all 0.3s ${animations.easing.elegant};
    
    &:hover {
      background: rgba(26, 148, 133, 0.2);
      transform: translateY(-2px);
    }
  `,
  
  activeTab: css`
    background: rgba(26, 148, 133, 0.3);
    border: 1px solid ${colors.neonTeal};
    box-shadow: 0 0 15px ${colors.neonTeal}50;
  `,
  
  contentContainer: css`
    ${neoDecorocoBase.panel}
    background: rgba(20, 20, 25, 0.5);
    border: 1px solid ${colors.borderLight};
    border-radius: ${layout.radius.lg};
    padding: ${layout.spacing.xl};
    margin-bottom: ${layout.spacing.xl};
  `,
  
  uploadContainer: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${layout.spacing.xl};
    
    @media (max-width: ${layout.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `,
  
  uploadSection: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  
  sectionTitle: css`
    ${neoDecorocoBase.subheading}
    margin-bottom: ${layout.spacing.lg};
    font-size: ${typography.sizes['2xl']};
    color: ${colors.neonTeal};
    text-align: center;
  `,
  
  instructionsPanel: css`
    ${neoDecorocoBase.panel}
    background: rgba(26, 148, 133, 0.05);
    border: 1px solid ${colors.neonTeal}30;
    padding: ${layout.spacing.lg};
  `,
  
  instructionsTitle: css`
    font-family: ${typography.fonts.decorative};
    color: ${colors.neonGold};
    font-size: ${typography.sizes.xl};
    margin-bottom: ${layout.spacing.md};
    text-shadow: 0 0 8px ${colors.neonGold}40;
  `,
  
  instructionsList: css`
    display: flex;
    flex-direction: column;
    gap: ${layout.spacing.md};
  `,
  
  instructionItem: css`
    display: flex;
    gap: ${layout.spacing.md};
    align-items: flex-start;
  `,
  
  instructionIcon: css`
    font-size: 24px;
  `,
  
  instructionText: css`
    h4 {
      font-family: ${typography.fonts.decorative};
      color: ${colors.textLight};
      margin-bottom: ${layout.spacing.xs};
    }
    
    p {
      color: ${colors.textLight}cc;
      font-size: ${typography.sizes.sm};
    }
  `,
  
  batchContainer: css`
    text-align: center;
    padding: ${layout.spacing.xl} 0;
  `,
  
  historyContainer: css`
    text-align: center;
    padding: ${layout.spacing.xl} 0;
  `,
  
  comingSoon: css`
    font-style: italic;
    color: ${colors.textLight}aa;
  `,
  
  successMessage: css`
    ${neoDecorocoBase.alert}
    background: rgba(39, 174, 96, 0.2);
    border: 1px solid #27ae60;
    color: #2ecc71;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${layout.spacing.md};
    margin-top: ${layout.spacing.lg};
    animation: ${animations.fadeIn} 0.3s ${animations.easing.elegant};
  `,
  
  successIcon: css`
    font-size: ${typography.sizes.xl};
    margin-right: ${layout.spacing.sm};
  `
};

export default styles;