// Maximum content height relative to viewport
export const MAX_CONTENT_HEIGHT = 2.2;

// Layout constraints and measurements
export const layout = {
  // Viewport constraints
  viewport: {
    maxHeight: `${MAX_CONTENT_HEIGHT * 100}vh`,
    minHeight: '100vh',
    maxWidth: '100vw',
  },

  // Component height constraints
  heights: {
    minimizedUpload: '10vh',  // ProcessImagesButton when minimized
    header: '60px',
    navigation: '50px',
    footer: '40px',
  },

  // Spacing system
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  // Container widths
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Grid system
  grid: {
    columns: 12,
    gap: '1rem',
    containerPadding: '1rem',
  },

  // Border radius sizes
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // Z-index layers
  zIndex: {
    background: -1,
    default: 0,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    popover: 500,
    toast: 600,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component-specific constraints
  components: {
    rolodex: {
      perspective: '1000px',
      rotationDegree: 120,
      translateZ: '300px',
    },
    table: {
      maxHeight: 'calc(80vh - 200px)', // Accounts for headers and controls
      cellMaxWidth: {
        sm: '150px',
        md: '250px',
        lg: '350px',
      },
    },
    modal: {
      width: {
        sm: '90vw',
        md: '80vw',
        lg: '70vw',
        xl: '60vw',
      },
      maxHeight: '90vh',
    },
  },

  // Media queries
  media: {
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
    dark: '@media (prefers-color-scheme: dark)',
    light: '@media (prefers-color-scheme: light)',
    motion: '@media (prefers-reduced-motion: no-preference)',
    hover: '@media (hover: hover)',
  },
};

// Helper functions
export const getResponsiveValue = (value, breakpoint) => {
  if (typeof value === 'object') {
    return value[breakpoint] || value.default;
  }
  return value;
};

export const clampHeight = (height) => {
  return Math.min(height, MAX_CONTENT_HEIGHT * window.innerHeight);
};

export default layout;
