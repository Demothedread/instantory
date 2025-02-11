export const colors = {
  // Base colors
  primary:'rgb(39, 163, 148)',  // Teal - main brand color
  secondary: '#FFD700', // Gold - accent color
  
  // Neon accents
  neonTeal: 'rgba(26, 148, 133, 0.8)',
  neonGold: 'rgba(255, 215, 0, 0.8)',
  
  // Background gradients
  darkGradient: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
  lightGradient: 'linear-gradient(45deg, #f5f5f5, #e5e5e5)',
  
  // Art Deco metallics
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  
  // Rococo pastels
  blushPink: '#FFB6C1',
  mintGreen: '#98FF98',
  lavender: '#E6E6FA',
  
  // UI colors
  text: '#333333',
  textLight: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.2)',
  
  // Status colors
  success: '#4CAF50',
  error: '#FF5252',
  warning: '#FFC107',
  info: '#2196F3',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  modalBg: 'rgba(26, 26, 26, 0.95)',
  
  // Glow effects
  neonGlow: '0 0 10px',
  softGlow: '0 0 20px',
};

export const generateNeonShadow = (color, intensity = 1) => {
  return `
    0 0 ${5 * intensity}px ${color},
    0 0 ${10 * intensity}px ${color},
    0 0 ${15 * intensity}px ${color}
  `;
};

export default colors;
