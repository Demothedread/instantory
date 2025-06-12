import React from 'react';
import { css } from '@emotion/react';
import { colors } from '../styles/theme/colors';
import { neoDecorocoBase } from '../styles/components/neo-decoroco/base';
import layout from '../styles/layouts/constraints';

const Resources = () => {
  return (
    <div css={styles.container}>
      <h1 css={styles.title}>Resources</h1>
      <div css={[neoDecorocoBase.card, styles.card]}>
        <p css={styles.text}>Resources page coming soon...</p>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    max-width: 800px;
    margin: 0 auto;
    padding: ${layout.spacing.lg};
  `,
  title: css`
    ${neoDecorocoBase.heading};
    font-size: 2.5rem;
    margin: 0 0 ${layout.spacing.lg} 0;
    text-align: center;
  `,
  card: css`
    padding: ${layout.spacing.xl};
    text-align: center;
  `,
  text: css`
    color: ${colors.textLight};
    margin: 0;
  `
};

export default Resources;
