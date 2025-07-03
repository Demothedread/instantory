export const typography = {
  fonts: {
    primary: '"Metropolis","Inter", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    heading: '"Farray", "Cinzel Decorative", "Playfair Display", serif',
    mono: '"Fira Code", "Monaco", "Consolas", "Liberation Mono", monospace',
    decorative: '"Cinzel Decorative", serif'
  },
  
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem'      // 128px
  },
  
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },
  
  // Pre-defined text styles for consistency
  styles: {
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      fontFamily: '"Cinzel Decorative", serif'
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      fontFamily: '"Cinzel Decorative", serif'
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.375,
      fontFamily: '"Playfair Display", serif'
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.375
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.375
    },
    small: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.25
    }
  }
};
