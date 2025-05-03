export const typography = {
  // Font families
  fonts: {
    primary: "'Josefin Sans', sans-serif",
    secondary: "'Playfair Display', serif",
    decorative: "'Cinzel Decorative', cursive",
    modern: "'Poiret One', sans-serif",
    elegant: "'Cormorant Garamond', serif",
    handwritten: "'La Belle Aurore', cursive",
  },

  // Font weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Font sizes
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    artDeco: '0.15em', // Special spacing for art deco headings
  },

  // Text transforms
  transforms: {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  },

  // Decorative styles
  decorative: {
    artDecoHeading: {
      fontFamily: "'Cinzel Decorative', cursive",
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      fontWeight: 700,
    },
    modernLabel: {
      fontFamily: "'Poiret One', sans-serif",
      letterSpacing: '0.05em',
      fontWeight: 400,
    },
    elegantText: {
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 300,
      lineHeight: 1.75,
    },
  },
};

export const responsiveTypography = {
  title: css`
    font-size: ${typography.sizes['4xl']};
    
    @media (max-width: ${layout.breakpoints.md}) {
      font-size: ${typography.sizes['2xl']};
    }
    
    @media (max-width: ${layout.breakpoints.sm}) {
      font-size: ${typography.sizes.xl};
    }
  `,
  
  subtitle: css`
    font-size: ${typography.sizes.xl};
    
    @media (max-width: ${layout.breakpoints.md}) {
      font-size: ${typography.sizes.lg};
    }
    
    @media (max-width: ${layout.breakpoints.sm}) {
      font-size: ${typography.sizes.base};
    }
  `,
  
  body: css`
    font-size: ${typography.sizes.base};
    
    @media (max-width: ${layout.breakpoints.sm}) {
      font-size: ${typography.sizes.sm};
    }
  `
};

export default typography;
