export const colors = {
  // Primary brand colors
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f3460',
  
  // Neon accent colors for the Bartleby theme
  neonTeal: '#00ffff',
  neonGold: '#ffd700',
  neonGreen: '#39ff14',
  neonPink: '#ff073a',
  neonPurple: '#bf00ff',
  neonRed: '#ff073a',
  neonBlue: '#00a2ff',
  
  // Background gradients
  darkGradient: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
  lightGradient: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
  
  // Text colors
  textLight: '#e8e8e8',
  textDark: '#2c2c54',
  textMuted: '#a0a0a0',
  textAccent: '#00ffff',
  
  // Semantic colors
  success: '#39ff14',
  warning: '#ffd700',
  error: '#ff073a',
  info: '#00a2ff',
  
  // UI colors
  background: '#0c0c0c',
  surface: '#1a1a2e',
  card: '#16213e',
  border: '#333366',
  borderLight: '#4a4a6a',
  
  // Interactive states
  hover: '#0f3460',
  active: '#1a2f5a',
  disabled: '#333333',
  
  // Transparency levels
  overlay: 'rgba(0, 0, 0, 0.8)',
  glass: 'rgba(26, 26, 46, 0.9)',
  subtle: 'rgba(255, 255, 255, 0.1)',
};

// ---------------------------------------------------------------------------
// Some style modules within the code-base import this file using a *default*
// specifier (e.g. `import colors from '.../styles/theme/colors'`) while most
// others use a *named* import (`import { colors } from '...'`).  The original
// implementation only provided the named export which causes the build to
// fail with the error:
//   "does not contain a default export (imported as 'colors')".
//
// To remain backwards-compatible **and** restore the production build we
// simply re-export the existing `colors` object as the module’s default
// export.  This tiny change keeps the public API identical for named imports
// while unblocking modules that expect a default export.
// ---------------------------------------------------------------------------

// eslint-disable-next-line import/no-anonymous-default-export
export default colors;
