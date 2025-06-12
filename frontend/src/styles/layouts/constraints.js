export const layout = {
  // Container widths
  widths: {
    xs: '20rem',      // 320px
    sm: '24rem',      // 384px
    md: '28rem',      // 448px
    lg: '32rem',      // 512px
    xl: '36rem',      // 576px
    '2xl': '42rem',   // 672px
    '3xl': '48rem',   // 768px
    '4xl': '56rem',   // 896px
    '5xl': '64rem',   // 1024px
    '6xl': '72rem',   // 1152px
    '7xl': '80rem',   // 1280px
    full: '100%',
    screen: '100vw'
  },

  // Height constraints
  heights: {
    header: '4rem',    // 64px
    footer: '3rem',    // 48px
    nav: '100vh',
    content: 'calc(100vh - 7rem)', // Total minus header/footer
    section: 'auto',
    full: '100%',
    screen: '100vh'
  },

  // Spacing system (based on 0.25rem = 4px)
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
    40: '10rem',      // 160px
    48: '12rem',      // 192px
    56: '14rem',      // 224px
    64: '16rem',      // 256px
    
    // Semantic spacing
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Z-index layers
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    banner: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    skipLink: 1070,
    toast: 1080,
    tooltip: 1090
  },

  // Grid system
  grid: {
    cols1: 'repeat(1, minmax(0, 1fr))',
    cols2: 'repeat(2, minmax(0, 1fr))',
    cols3: 'repeat(3, minmax(0, 1fr))',
    cols4: 'repeat(4, minmax(0, 1fr))',
    cols6: 'repeat(6, minmax(0, 1fr))',
    cols12: 'repeat(12, minmax(0, 1fr))',
    
    // Responsive grids
    responsive: {
      mobile: 'repeat(1, minmax(0, 1fr))',
      tablet: 'repeat(2, minmax(0, 1fr))',
      desktop: 'repeat(3, minmax(0, 1fr))',
      wide: 'repeat(4, minmax(0, 1fr))'
    }
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Media queries (for use with emotion/styled)
  media: {
    xs: '@media (min-width: 475px)',
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
    
    // Special media queries
    mobile: '@media (max-width: 767px)',
    tablet: '@media (min-width: 768px) and (max-width: 1023px)',
    desktop: '@media (min-width: 1024px)',
    
    // Feature-based
    touch: '@media (hover: none) and (pointer: coarse)',
    hover: '@media (hover: hover) and (pointer: fine)',
    reducedMotion: '@media (prefers-reduced-motion: reduce)',
    darkMode: '@media (prefers-color-scheme: dark)',
    lightMode: '@media (prefers-color-scheme: light)'
  },

  // Common layout patterns
  patterns: {
    // Bartleby three-partition layout
    threePartition: {
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateAreas: `
        "top"
        "middle" 
        "bottom"
      `,
      minHeight: '100vh',
      gap: '1rem'
    },
    
    // Sidebar layout
    sidebar: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridTemplateAreas: '"sidebar main"',
      minHeight: '100vh'
    },
    
    // Centered content
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    },
    
    // Card grid
    cardGrid: {
      display: 'grid',
      gap: '1.5rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
    }
  },

  // Shadow system
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    
    // Neon shadows for Bartleby theme
    neon: {
      teal: '0 0 20px rgba(0, 255, 255, 0.3)',
      gold: '0 0 20px rgba(255, 215, 0, 0.3)',
      green: '0 0 20px rgba(57, 255, 20, 0.3)',
      red: '0 0 20px rgba(255, 7, 58, 0.3)',
      blue: '0 0 20px rgba(0, 162, 255, 0.3)'
    }
  }
};

export default layout;
