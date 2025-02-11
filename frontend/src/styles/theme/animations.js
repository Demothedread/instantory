import { keyframes } from '@emotion/react';

// Keyframe Animations
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

export const slideDown = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`;

export const neonPulse = keyframes`
  0% { filter: brightness(1) drop-shadow(0 0 5px rgba(26, 148, 133, 0.8)); }
  50% { filter: brightness(1.2) drop-shadow(0 0 10px rgba(26, 148, 133, 0.9)); }
  100% { filter: brightness(1) drop-shadow(0 0 5px rgba(26, 148, 133, 0.8)); }
`;

export const rotateY = keyframes`
  from { transform: rotateY(0deg); }
  to { transform: rotateY(360deg); }
`;

export const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Animation Configurations
export const animations = {
  // Timing functions
  timing: {
    quick: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
    verySlow: '0.8s',
  },

  // Easing curves
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    elegant: 'cubic-bezier(0.7, 0, 0.3, 1)',
    precise: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },

  // Presets
  presets: {
    fadeIn: {
      animation: `${fadeIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
    },
    slideUp: {
      animation: `${slideUp} 0.5s cubic-bezier(0.7, 0, 0.3, 1)`,
    },
    slideDown: {
      animation: `${slideDown} 0.5s cubic-bezier(0.7, 0, 0.3, 1)`,
    },
    neonGlow: {
      animation: `${neonPulse} 2s infinite`,
    },
    rolodex: {
      animation: `${rotateY} 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
    },
    shimmer: {
      animation: `${shimmer} 2s linear infinite`,
      background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
      backgroundSize: '2000px 100%',
    },
  },

  // Transitions
  transitions: {
    all: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    height: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default animations;
