import { css } from '@emotion/react';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

/**
 * Public Layout Component
 * Beautiful layout for unauthenticated users
 * Provides the same visual experience as authenticated users
 */
const PublicLayout = ({ children }) => {
  return (
    <div css={styles.layout}>
      {children}
    </div>
  );
};

const styles = {
  layout: css`
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    font-family: ${typography.fonts.primary};
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  `,
};

export default PublicLayout;
