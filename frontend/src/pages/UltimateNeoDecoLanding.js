 /** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { GoogleLogin } from '@react-oauth/google';
import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/auth/index';
import { colors } from '../styles/theme/colors';

/**
 * 🏛️ ULTIMATE NEO-DECO-ROCOCO LANDING EXPERIENCE 🏛️
 * 
 * Component Genealogy: Classical Pantheon → Art Deco Skyscraper → Digital Metaverse Portal
 * 
 * Design Philosophy:
 * "What if the Library of Alexandria had been designed by Frank Lloyd Wright,
 * decorated by the court of Versailles, and powered by quantum AI in a cyberpunk reality?"
 * 
 * This component embodies true Neo-Deco-Rococo aesthetics:
 * - Art Deco: Geometric precision, metallic hues, width-varying lines
 * - Rococo: Ornamental excess, gaiety, eccentric decorative elements  
 * - Modern: Depth, transparency, lighting, neon accents
 * - Foucauldian: Function-first design that subverts web expectations
 * 
 * Key Innovations:
 * - Mechanical gear loading system with Art Deco styling
 * - Circle transition animation revealing the main experience
 * - Clickout overlays for immersive content exploration
 * - Hidden easter eggs and whimsical interactions
 * - Cutting-edge web technologies for smooth 60fps performance
 */

// 🎭 ANIMATION KEYFRAMES - The mechanical heartbeat of our digital palace

// Art Deco Mechanical Gears Animation
const mechanicalGears = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(360deg) scale(1); }
`;

const mechanicalGearsReverse = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(-360deg) scale(1); }
`;

// Circle Transition (mimicking circlematteline.mp4)

// Enhanced Neo-Deco Pulse with metallic sheen
const neodecopulse = keyframes`
  0%, 100% { 
    filter: 
      drop-shadow(0 0 20px var(--neon-copper)) 
      brightness(1)
      hue-rotate(0deg);
    transform: scale(1);
  }
  50% { 
    filter: 
      drop-shadow(0 0 40px var(--neon-copper)) 
      brightness(1.3)
      hue-rotate(15deg);
    transform: scale(1.02);
  }
`;

// Rococo Ornamental Float

// Art Deco Geometric Dance

// Metallic Flow Animation

// 🎨 NEO-DECO-ROCOCO COLOR PALETTE
const neoDecoColors = {
  // Art Deco Metallics
  oxidizedCopper: '#588B8B',
  darkCopper: '#4A7C7C',
  coolTitanium: '#B0C4DE', 
  deepTitanium: '#8FA8CD',
  platinum: '#E5E4E2',
  darkPlatinum: '#D3D3D3',
  
  // Rococo Base
  dullBrown: '#8B7355',
  richBrown: '#A0896B',
  warmBrown: '#B8956A',
  
  // Neon Accents for Contrast
  neonCopper: '#7FCDCD',
  neonTitanium: '#C7D9F1',
  neonGold: '#FFD700',
  
  // Modern Enhancement
  deepCharcoal: '#1a1a1a',
  softBlack: '#0a0a0a',
  glassWhite: 'rgba(255, 255, 255, 0.1)',
  
  // Transparency Layers
  copperGlass: 'rgba(88, 139, 139, 0.2)',
  titaniumGlass: 'rgba(176, 196, 222, 0.2)',
  brownGlass: 'rgba(139, 115, 85, 0.3)',
};

// Enhanced animations using new color palette
const pulseGlow = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 20px ${neoDecoColors.neonCopper}) brightness(1);
    transform: scale(1);
  }
  50% { 
    filter: drop-shadow(0 0 40px ${neoDecoColors.neonCopper}) brightness(1.2);
    transform: scale(1.05);
  }
`;

const geometricDance = keyframes`
  0% { 
    transform: rotate(0deg) scale(1);
    opacity: 0.6;
  }
  25% { 
    transform: rotate(90deg) scale(1.1);
    opacity: 0.8;
  }
  50% { 
    transform: rotate(180deg) scale(0.9);
    opacity: 1;
  }
  75% { 
    transform: rotate(270deg) scale(1.1);
    opacity: 0.8;
  }
  100% { 
    transform: rotate(360deg) scale(1);
    opacity: 0.6;
  }
`;

const ornateFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
    filter: hue-rotate(0deg);
  }
  33% { 
    transform: translateY(-15px) rotate(5deg);
    filter: hue-rotate(60deg);
  }
  66% { 
    transform: translateY(8px) rotate(-3deg);
    filter: hue-rotate(120deg);
  }
`;

// Metallic Flow Animation for Neo-Deco patterns
const metallicFlow = keyframes`
  0% { 
    background-position: 0% 50%;
    filter: brightness(1) contrast(1) hue-rotate(0deg);
  }
  33% { 
    background-position: 50% 25%;
    filter: brightness(1.1) contrast(1.05) hue-rotate(30deg);
  }
  66% { 
    background-position: 100% 75%;
    filter: brightness(1.2) contrast(1.1) hue-rotate(60deg);
  }
  100% { 
    background-position: 0% 50%;
    filter: brightness(1) contrast(1) hue-rotate(0deg);
  }
`;

const dataStreamFlow = keyframes`
  0% { 
    transform: translateX(-100%) scaleY(1);
    opacity: 0;
  }
  50% { 
    opacity: 1;
    transform: translateX(0%) scaleY(1.2);
  }
  100% { 
    transform: translateX(100%) scaleY(1);
    opacity: 0;
  }
`;

const morphicShift = keyframes`
  0%, 100% { 
    border-radius: 50% 20% 30% 40%;
    transform: rotate(0deg);
  }
  25% { 
    border-radius: 30% 50% 40% 20%;
    transform: rotate(90deg);
  }
  50% { 
    border-radius: 40% 30% 50% 20%;
    transform: rotate(180deg);
  }
  75% { 
    border-radius: 20% 40% 30% 50%;
    transform: rotate(270deg);
  }
`;

// 🎨 ADVANCED STYLES - Neo-Deco-Rococo Digital Palace

// 🔧 LOADING GEAR SYSTEM COMPONENT
const LoadingGearsSystem = () => {
  return (
    <div css={loadingStyles.loadingOverlay}>
      <div css={loadingStyles.gearContainer}>
        <div css={loadingStyles.mainGear}>
          <div css={loadingStyles.gearTeeth}></div>
          <div css={loadingStyles.gearCenter}>
            <span css={loadingStyles.gearText}>BARTLEBY</span>
          </div>
        </div>
        <div css={loadingStyles.secondaryGear1}>
          <div css={loadingStyles.gearTeeth}></div>
        </div>
        <div css={loadingStyles.secondaryGear2}>
          <div css={loadingStyles.gearTeeth}></div>
        </div>
        <div css={loadingStyles.secondaryGear3}>
          <div css={loadingStyles.gearTeeth}></div>
        </div>
      </div>
      <div css={loadingStyles.loadingText}>
        Initializing Intelligence Systems...
      </div>
    </div>
  );
};

// 🌀 CIRCLE TRANSITION COMPONENT
const CircleTransition = ({ isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <div 
      css={[
        transitionStyles.circleOverlay,
        isVisible && transitionStyles.circleAnimating
      ]}
    />
  );
};

// 🎭 ENHANCED LOADING PALACE
const LoadingPalace = () => (
  <div css={css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, ${neoDecoColors.dullBrown}, ${neoDecoColors.richBrown});
    color: ${neoDecoColors.platinum};
  `}>
    <LoadingGearsSystem />
  </div>
);

const loadingStyles = {
  loadingOverlay: css`
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, 
      ${neoDecoColors.dullBrown} 0%, 
      ${neoDecoColors.richBrown} 50%, 
      ${neoDecoColors.warmBrown} 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `,

  gearContainer: css`
    position: relative;
    width: 300px;
    height: 300px;
    margin-bottom: 2rem;
  `,

  mainGear: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    height: 120px;
    transform: translate(-50%, -50%);
    animation: ${mechanicalGears} 3s linear infinite;
    z-index: 4;
  `,

  secondaryGear1: css`
    position: absolute;
    top: 20%;
    left: 20%;
    width: 80px;
    height: 80px;
    animation: ${mechanicalGearsReverse} 2s linear infinite;
    z-index: 3;
  `,

  secondaryGear2: css`
    position: absolute;
    top: 20%;
    right: 20%;
    width: 60px;
    height: 60px;
    animation: ${mechanicalGears} 4s linear infinite;
    z-index: 2;
  `,

  secondaryGear3: css`
    position: absolute;
    bottom: 20%;
    left: 30%;
    width: 70px;
    height: 70px;
    animation: ${mechanicalGearsReverse} 2.5s linear infinite;
    z-index: 2;
  `,

  gearTeeth: css`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid ${neoDecoColors.oxidizedCopper};
    background: linear-gradient(135deg, 
      ${neoDecoColors.platinum} 0%,
      ${neoDecoColors.darkPlatinum} 50%,
      ${neoDecoColors.oxidizedCopper} 100%);
    position: relative;
    box-shadow: 
      inset 0 0 20px rgba(0,0,0,0.3),
      0 0 30px ${neoDecoColors.neonCopper}40;

    &::before {
      content: '';
      position: absolute;
      inset: 15%;
      border-radius: 50%;
      border: 2px solid ${neoDecoColors.darkCopper};
      background: ${neoDecoColors.dullBrown};
    }

    &::after {
      content: '';
      position: absolute;
      inset: 35%;
      border-radius: 50%;
      background: ${neoDecoColors.oxidizedCopper};
      box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
    }
  `,

  gearCenter: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
  `,

  gearText: css`
    font-family: 'Farray', 'Georgia', serif;
    font-size: 0.8rem;
    font-weight: bold;
    color: ${neoDecoColors.dullBrown};
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    letter-spacing: 0.1em;
  `,

  loadingText: css`
    font-family: 'Farray', 'Georgia', serif;
    font-size: 1.2rem;
    color: ${neoDecoColors.platinum};
    text-align: center;
    letter-spacing: 0.05em;
    opacity: 0.9;
    animation: ${neodecopulse} 2s ease-in-out infinite;
  `
};

const transitionStyles = {
  circleOverlay: css`
    position: fixed;
    inset: 0;
    background: ${neoDecoColors.dullBrown};
    z-index: 9999;
    clip-path: circle(150% at 50% 50%);
    transition: clip-path 1s cubic-bezier(0.4, 0, 0.2, 1);
  `,

  circleAnimating: css`
    clip-path: circle(0% at 50% 50%);
  `
};
const styles = {
  // 🏛️ ARCHITECTURAL FOUNDATION
  palazzo: css`
    position: relative;
    min-height: 100vh;
    background: 
      /* Art Deco Metallic Gradients */
      radial-gradient(ellipse at top, ${neoDecoColors.neonCopper}15 0%, transparent 40%),
      radial-gradient(ellipse at bottom left, ${neoDecoColors.oxidizedCopper}20 0%, transparent 50%),
      radial-gradient(ellipse at bottom right, ${neoDecoColors.neonTitanium}10 0%, transparent 50%),
      /* Rococo Flowing Foundation */
      linear-gradient(135deg, 
        ${neoDecoColors.dullBrown} 0%, 
        ${neoDecoColors.richBrown} 15%, 
        ${neoDecoColors.deepCharcoal} 35%, 
        ${neoDecoColors.softBlack} 50%, 
        ${neoDecoColors.deepCharcoal} 65%,
        ${neoDecoColors.richBrown} 85%,
        ${neoDecoColors.warmBrown} 100%);
    overflow-x: hidden;
    font-family: 'Farray', 'Georgia', serif;
    color: ${neoDecoColors.platinum};
    
    /* Advanced scroll behavior */
    scroll-behavior: smooth;
    scroll-snap-type: y proximity;
    
    /* CSS Container Queries Support */
    container-type: inline-size;
    
    /* Neo-Deco Pattern Overlay inspired by dallesidemotif1.png and side-diamondpattern-blgr.png */
    &::before {
      content: '';
      position: fixed;
      inset: 0;
      background: 
        /* Art Deco Diamond Patterns */
        linear-gradient(45deg, transparent 48%, ${neoDecoColors.oxidizedCopper}08 48.5%, ${neoDecoColors.oxidizedCopper}08 51.5%, transparent 52%),
        linear-gradient(-45deg, transparent 48%, ${neoDecoColors.coolTitanium}06 48.5%, ${neoDecoColors.coolTitanium}06 51.5%, transparent 52%),
        /* Rococo Ornamental Lines */
        repeating-linear-gradient(90deg, transparent, transparent 60px, ${neoDecoColors.neonGold}02 60px, ${neoDecoColors.neoGold}02 62px);
      background-size: 120px 120px, 80px 80px, 200px 4px;
      animation: ${metallicFlow} 120s linear infinite;
      pointer-events: none;
      z-index: 1;
    }
    
    /* Depth and Layering Effect */
    &::after {
      content: '';
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(circle at 25% 25%, ${neoDecoColors.copperGlass} 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, ${neoDecoColors.titaniumGlass} 0%, transparent 50%);
      backdrop-filter: blur(0.5px);
      pointer-events: none;
      z-index: 2;
    }
  `,

  // 🌟 FLOATING GEOMETRIC ELEMENTS
  cosmicGeometry: css`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  `,

  geometricOrb: css`
    position: absolute;
    border: 2px solid ${colors.neonTeal}60;
    background: linear-gradient(135deg, ${colors.neonTeal}10, ${colors.neonGold}10);
    backdrop-filter: blur(10px);
    animation: ${ornateFloat} 20s ease-in-out infinite;
    
    &:nth-child(1) {
      width: 150px;
      height: 150px;
      top: 10%;
      left: 5%;
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      animation-delay: -5s;
      animation-duration: 25s;
    }
    
    &:nth-child(2) {
      width: 100px;
      height: 100px;
      top: 60%;
      right: 10%;
      border-radius: 50%;
      animation-delay: -10s;
      animation-duration: 18s;
    }
    
    &:nth-child(3) {
      width: 80px;
      height: 200px;
      bottom: 20%;
      left: 15%;
      border-radius: 50px;
      animation-delay: -15s;
      animation-duration: 22s;
    }
    
    &:nth-child(4) {
      width: 120px;
      height: 120px;
      top: 40%;
      right: 25%;
      animation: ${morphicShift} 30s ease-in-out infinite;
      animation-delay: -8s;
    }
  `,

  // 🎭 MAIN CONTENT STAGE
  contentStage: css`
    position: relative;
    z-index: 10;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 2rem;
    
    @container (max-width: 768px) {
      padding: 0 1rem;
    }
  `,

  // 👑 HERO SANCTUM - The crown jewel
  heroSanctum: css`
    position: relative;
    min-height: 100vh;
    display: grid;
    place-items: center;
    text-align: center;
    scroll-snap-align: start;
    padding: 4rem 0;
    
    /* Advanced background architecture */
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 800px;
      height: 800px;
      transform: translate(-50%, -50%);
      background: 
        radial-gradient(circle at center, ${colors.neonGold}08 0%, transparent 40%),
        conic-gradient(from 0deg, ${colors.neonTeal}15, transparent, ${colors.neonPurple}15, transparent, ${colors.neonGold}15);
      border-radius: 50%;
      animation: ${geometricDance} 60s linear infinite;
      z-index: -1;
    }
  `,

  // 🖼️ MASCOT RELIQUARY - Sacred digital artifact
  mascotReliquary: css`
    position: relative;
    display: inline-block;
    margin-bottom: 3rem;
    
    /* Ornate frame with multiple borders */
    &::before {
      content: '';
      position: absolute;
      inset: -20px;
      background: 
        linear-gradient(45deg, ${colors.neonGold}, ${colors.neonTeal}, ${colors.neonPurple}, ${colors.neonGold});
      border-radius: 50%;
      padding: 4px;
      z-index: -1;
      animation: ${geometricDance} 10s linear infinite;
    }
    
    &::after {
      content: '';
      position: absolute;
      inset: -30px;
      border: 2px solid ${colors.neonTeal}40;
      border-radius: 50%;
      z-index: -2;
    }
  `,

  mascotAvatar: css`
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: 
      radial-gradient(circle at 30% 30%, ${colors.neonGold}20, transparent 50%),
      linear-gradient(135deg, ${colors.surface}, ${colors.card});
    border: 4px solid ${colors.neonGold}80;
    padding: 12px;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    
    /* 3D hover effect */
    &:hover {
      transform: perspective(1000px) rotateY(15deg) rotateX(5deg) scale(1.1);
      filter: drop-shadow(0 20px 40px ${colors.neonGold}40);
    }
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  `,

  // ✨ TITLE CONSTELLATION - Majestic typography
  titleConstellation: css`
    margin-bottom: 4rem;
    position: relative;
  `,

  mainTitle: css`
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    margin: 0 0 1rem 0;
    background: 
      linear-gradient(135deg, 
        ${colors.neonGold} 0%, 
        ${colors.textLight} 25%, 
        ${colors.neonTeal} 50%, 
        ${colors.neonPurple} 75%, 
        ${colors.neonGold} 100%);
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${dataStreamFlow} 20s ease-in-out infinite;
    text-shadow: 0 0 60px ${colors.neonGold}40;
    position: relative;
    
    /* Ornate underline */
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 3px;
      background: linear-gradient(90deg, transparent, ${colors.neonTeal}, ${colors.neonGold}, ${colors.neonTeal}, transparent);
      border-radius: 2px;
    }
  `,

  subtitle: css`
    font-size: clamp(1.2rem, 3vw, 2rem);
    color: ${colors.neonTeal};
    font-weight: 300;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 2rem;
    animation: ${pulseGlow} 4s ease-in-out infinite;
  `,

  description: css`
    font-size: clamp(1rem, 2.5vw, 1.4rem);
    line-height: 1.7;
    max-width: 800px;
    margin: 0 auto 3rem auto;
    color: ${colors.textLight};
    opacity: 0.9;
    
    /* Elegant text reveal effect */
    background: linear-gradient(90deg, ${colors.textLight} 0%, ${colors.neonTeal} 50%, ${colors.textLight} 100%);
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    animation: ${dataStreamFlow} 6s ease-in-out infinite;
  `,

  // 🚀 ACTION PORTALS - Interactive gateways
  actionPortals: css`
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 4rem;
  `,

  portalButton: css`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1.2rem 2.5rem;
    background: transparent;
    border: 2px solid ${colors.neonTeal};
    border-radius: 15px;
    color: ${colors.neonTeal};
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    
    /* 3D perspective effect */
    transform: perspective(1000px) rotateX(0deg);
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, ${colors.neonTeal}20, ${colors.neonGold}20);
      opacity: 0;
      transition: opacity 0.4s ease;
      border-radius: inherit;
    }
    
    &:hover {
      transform: perspective(1000px) rotateX(-5deg) translateY(-5px);
      border-color: ${colors.neonGold};
      color: ${colors.neonGold};
      box-shadow: 
        0 15px 35px rgba(0, 0, 0, 0.4),
        0 0 40px ${colors.neonGold}30;
      
      &::before {
        opacity: 1;
      }
    }
    
    span {
      position: relative;
      z-index: 1;
    }
  `,

  primaryPortal: css`
    border-color: ${colors.neonGold};
    color: ${colors.neonGold};
    background: linear-gradient(135deg, ${colors.neonGold}10, transparent);
    
    &:hover {
      background: linear-gradient(135deg, ${colors.neonGold}30, ${colors.neonTeal}20);
    }
  `,

  // 🎪 CAPABILITY AMPHITHEATER - Feature showcase
  capabilityAmphitheater: css`
    position: relative;
    padding: 6rem 0;
    scroll-snap-align: start;
    
    /* Background architecture */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(45deg, ${colors.neonTeal}05 25%, transparent 25%),
        linear-gradient(-45deg, ${colors.neonGold}05 25%, transparent 25%);
      background-size: 100px 100px;
      animation: ${geometricDance} 80s linear infinite reverse;
    }
  `,

  amphitheaterTitle: css`
    text-align: center;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    color: ${colors.neonGold};
    margin-bottom: 3rem;
    text-shadow: 0 0 30px ${colors.neonGold}50;
    
    /* Ornate title decoration */
    &::before, &::after {
      content: '◆';
      font-size: 2rem;
      color: ${colors.neonTeal};
      margin: 0 2rem;
      animation: ${pulseGlow} 3s ease-in-out infinite;
    }
  `,

  capabilityGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2.5rem;
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  `,

  capabilityCard: css`
    position: relative;
    background: 
      linear-gradient(135deg, ${colors.glass}90, ${colors.surface}50);
    border: 1px solid ${colors.border};
    border-radius: 20px;
    padding: 2.5rem;
    backdrop-filter: blur(20px);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    
    /* Morphic border animation */
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, ${colors.neonTeal}, ${colors.neonGold}, ${colors.neonPurple}, ${colors.neonTeal});
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.5s ease;
      z-index: -1;
      animation: ${geometricDance} 6s linear infinite;
    }
    
    &:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: ${colors.neonTeal}80;
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.4),
        0 0 40px ${colors.neonTeal}20;
      
      &::before {
        opacity: 1;
      }
    }
  `,

  capabilityIcon: css`
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    display: block;
    animation: ${pulseGlow} 4s ease-in-out infinite;
    filter: drop-shadow(0 0 20px currentColor);
  `,

  capabilityTitle: css`
    font-size: 1.8rem;
    font-weight: 700;
    color: ${colors.neonTeal};
    margin-bottom: 1rem;
    text-shadow: 0 0 15px ${colors.neonTeal}40;
  `,

  capabilityDescription: css`
    font-size: 1rem;
    line-height: 1.6;
    color: ${colors.textLight};
    opacity: 0.9;
    margin-bottom: 1.5rem;
  `,

  capabilityBadges: css`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  `,

  capabilityBadge: css`
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${colors.neonTeal}20, ${colors.neonGold}20);
    border: 1px solid ${colors.neonTeal}40;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 500;
    color: ${colors.neonTeal};
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, ${colors.neonTeal}30, ${colors.neonGold}30);
      transform: translateY(-2px);
    }
  `,

  // 🔄 WORKFLOW PAVILION - Process visualization
  workflowPavilion: css`
    position: relative;
    padding: 6rem 0;
    text-align: center;
    scroll-snap-align: start;
    
    /* Flowing background pattern */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 20%, ${colors.neonPurple}10 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, ${colors.neonTeal}10 0%, transparent 50%);
      animation: ${ornateFloat} 30s ease-in-out infinite;
    }
  `,

  workflowTitle: css`
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    color: ${colors.neonGold};
    margin-bottom: 4rem;
    text-shadow: 0 0 30px ${colors.neonGold}50;
  `,

  workflowChain: css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    
    @container (max-width: 768px) {
      flex-direction: column;
      gap: 3rem;
    }
  `,

  workflowStep: css`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 180px;
    padding: 2rem;
    background: linear-gradient(135deg, ${colors.glass}80, ${colors.surface}40);
    border: 1px solid ${colors.border};
    border-radius: 20px;
    backdrop-filter: blur(15px);
    transition: all 0.4s ease;
    
    &:hover {
      transform: translateY(-5px) scale(1.05);
      border-color: ${colors.neonGold};
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }
  `,

  stepNumber: css`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: bold;
    color: ${colors.background};
    margin-bottom: 1rem;
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
    animation: ${pulseGlow} 3s ease-in-out infinite;
  `,

  stepIcon: css`
    font-size: 2.5rem;
    margin-bottom: 1rem;
    animation: ${ornateFloat} 6s ease-in-out infinite;
  `,

  stepTitle: css`
    font-size: 1.3rem;
    font-weight: 600;
    color: ${colors.neonGold};
    margin-bottom: 0.5rem;
  `,

  stepDescription: css`
    font-size: 0.95rem;
    color: ${colors.textLight};
    opacity: 0.8;
    text-align: center;
  `,

  // 🔐 AUTH SANCTUM - Authentication portal
  authSanctum: css`
    position: relative;
    padding: 6rem 0;
    display: flex;
    justify-content: center;
    scroll-snap-align: start;
  `,

  authPortal: css`
    width: 100%;
    max-width: 500px;
    background: linear-gradient(135deg, ${colors.glass}95, ${colors.surface}70);
    border: 2px solid ${colors.border};
    border-radius: 25px;
    padding: 3rem;
    backdrop-filter: blur(25px);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 40px ${colors.neonTeal}15;
    position: relative;
    overflow: hidden;
    
    /* Ornate top border */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${colors.neonTeal}, ${colors.neonGold}, ${colors.neonPurple}, ${colors.neonTeal});
      border-radius: 25px 25px 0 0;
      animation: ${dataStreamFlow} 4s ease-in-out infinite;
    }
  `,

  authTitle: css`
    text-align: center;
    font-size: 2.2rem;
    font-weight: 700;
    color: ${colors.neonGold};
    margin-bottom: 2rem;
    text-shadow: 0 0 20px ${colors.neonGold}50;
    
    &::before {
      content: '🔮';
      display: block;
      font-size: 3rem;
      margin-bottom: 1rem;
      animation: ${pulseGlow} 3s ease-in-out infinite;
    }
  `,

  authForm: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `,

  inputGroup: css`
    position: relative;
  `,

  authInput: css`
    width: 100%;
    padding: 1rem 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid ${colors.border};
    border-radius: 12px;
    color: ${colors.textLight};
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &::placeholder {
      color: ${colors.textMuted};
    }
    
    &:focus {
      outline: none;
      border-color: ${colors.neonTeal};
      box-shadow: 0 0 0 3px ${colors.neonTeal}20;
      background: rgba(0, 255, 255, 0.05);
    }
  `,

  submitButton: css`
    padding: 1.2rem 2rem;
    background: linear-gradient(135deg, ${colors.neonTeal}, ${colors.neonGold});
    border: none;
    border-radius: 12px;
    color: ${colors.background};
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(0, 255, 255, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      transform: none;
      cursor: not-allowed;
    }
  `,
};

// 📱 RESPONSIVE STYLES - Separate to avoid circular references
const responsiveStyles = {
  capabilityGridLarge: css`
    @container (max-width: 1200px) {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  `,
  
  mobileAdaptations: css`
    @container (max-width: 768px) {
      &.hero-sanctum {
        padding: 2rem 0;
      }
      
      &.action-portals {
        flex-direction: column;
        align-items: center;
      }
      
      &.capability-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }
  `,
};



// 🎯 INTERSECTION OBSERVER HOOK - Scroll-driven animations
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return [targetRef, isIntersecting];
};

// 🎪 CAPABILITY CARD COMPONENT - Modular feature showcase
const CapabilityCard = ({ icon, title, description, badges, delay = 0 }) => {
  const [cardRef, isVisible] = useIntersectionObserver();
  
  return (
    <div 
      ref={cardRef}
      css={[
        styles.capabilityCard,
        css`
          opacity: ${isVisible ? 1 : 0};
          transform: translateY(${isVisible ? 0 : 50}px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms;
        `
      ]}
    >
      <div css={styles.capabilityIcon}>{icon}</div>
      <h3 css={styles.capabilityTitle}>{title}</h3>
      <p css={styles.capabilityDescription}>{description}</p>
      <div css={styles.capabilityBadges}>
        {badges.map((badge, index) => (
          <span key={index} css={styles.capabilityBadge}>
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
};

// 🔄 WORKFLOW STEP COMPONENT - Process visualization
const WorkflowStep = ({ number, icon, title, description, delay = 0 }) => {
  const [stepRef, isVisible] = useIntersectionObserver();
  
  return (
    <div 
      ref={stepRef}
      css={[
        styles.workflowStep,
        css`
          opacity: ${isVisible ? 1 : 0};
          transform: translateY(${isVisible ? 0 : 30}px) scale(${isVisible ? 1 : 0.9});
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms;
        `
      ]}
    >
      <div css={styles.stepNumber}>{number}</div>
      <div css={styles.stepIcon}>{icon}</div>
      <h3 css={styles.stepTitle}>{title}</h3>
      <p css={styles.stepDescription}>{description}</p>
    </div>
  );
};

// 🏛️ MAIN COMPONENT - The Ultimate Neo-Deco-Rococo Landing Experience
const UltimateNeoDecoLanding = () => {
  const { loginWithGoogle, login, error, clearError, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 🎭 Loading and Transition State Management
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);

  // 🚀 Initialize the app with Neo-Deco loading sequence
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate resource loading and gear animation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsInitialLoading(false);
      setShowTransition(true);
    };
    
    initializeApp();
  }, []);

  // 🌀 Handle transition completion
  const handleTransitionComplete = () => {
    setShowTransition(false);
    setShowMainContent(true);
  };

  // 🎭 Authentication handlers
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      console.error('Authentication failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      await loginWithGoogle(credentialResponse.credential);
    }
  };

  // 🌟 Capability data
  const capabilities = [
    {
      icon: '🧠',
      title: 'Neural Document Analysis',
      description: 'Advanced AI-powered text extraction, semantic understanding, and contextual analysis transforms unstructured documents into organized intelligence.',
      badges: ['NLP Processing', 'Semantic Search', 'Auto-Classification']
    },
    {
      icon: '📦',
      title: 'Intelligent Inventory Management',
      description: 'Computer vision and machine learning algorithms automatically catalog, categorize, and organize physical and digital assets.',
      badges: ['Visual Recognition', 'Smart Cataloging', 'Auto-Tagging']
    },
    {
      icon: '🔍',
      title: 'Vector-Powered Search',
      description: 'Revolutionary semantic search technology that understands meaning and context, not just keywords, for instant relevant results.',
      badges: ['Vector Embeddings', 'Similarity Matching', 'Context-Aware']
    },
    {
      icon: '⚡',
      title: 'Real-Time Data Synthesis',
      description: 'Combine insights across multiple documents and data sources to reveal patterns, trends, and hidden connections.',
      badges: ['Pattern Recognition', 'Data Fusion', 'Insight Generation']
    }
  ];

  // 🔄 Workflow steps
  const workflowSteps = [
    { number: '1', icon: '📤', title: 'Upload', description: 'Seamlessly upload documents and images' },
    { number: '2', icon: '🤖', title: 'Analyze', description: 'AI processes and extracts intelligence' },
    { number: '3', icon: '🗂️', title: 'Organize', description: 'Smart categorization and structuring' },
    { number: '4', icon: '🔍', title: 'Search', description: 'Find anything instantly with semantic search' },
    { number: '5', icon: '📊', title: 'Export', description: 'Download structured, actionable data' }
  ];

  return (
    <>
      {/* 🎭 INITIAL LOADING SEQUENCE - Art Deco Gear System */}
      {isInitialLoading && <LoadingPalace />}
      
      {/* 🌀 CIRCLE TRANSITION - Circlematteline.mp4 style reveal */}
      {showTransition && (
        <CircleTransition 
          isVisible={showTransition} 
          onComplete={handleTransitionComplete}
        />
      )}
      
      {/* 🏛️ MAIN NEO-DECO-ROCOCO EXPERIENCE */}
      {(showMainContent || !isInitialLoading) && (
        <Suspense fallback={<LoadingPalace />}>
          <div css={styles.palazzo}>
            {/* 🌟 Floating Geometric Elements */}
            <div css={styles.cosmicGeometry}>
              <div css={styles.geometricOrb} />
              <div css={styles.geometricOrb} />
              <div css={styles.geometricOrb} />
              <div css={styles.geometricOrb} />
            </div>

        {/* 🎭 Main Content Stage */}
        <div css={styles.contentStage}>
          
          {/* 👑 Hero Sanctum */}
          <section css={[styles.heroSanctum, responsiveStyles.mobileAdaptations]} className="hero-sanctum">
            <div>
              {/* 🖼️ Mascot Reliquary */}
              <div css={styles.mascotReliquary}>
                <div css={styles.mascotAvatar}>
                  <img 
                    src="/assets/NeonBartlebebyGreen.png"
                    alt="Bartleby - AI Document Intelligence - Neo-Deco Mascot"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;font-size:3rem;color:#7FCDCD;">🏛️</div>';
                    }}
                  />
                </div>
              </div>

              {/* ✨ Title Constellation */}
              <div css={styles.titleConstellation}>
                <h1 css={styles.mainTitle}>BARTLEBY</h1>
                <p css={styles.subtitle}>AI Document Intelligence</p>
                <p css={styles.description}>
                  Transform documents and inventory into organized, searchable intelligence through 
                  sophisticated AI analysis, semantic understanding, and contextual synthesis. 
                  Experience the future of document management where chaos becomes clarity.
                </p>
              </div>

              {/* 🚀 Action Portals */}
              <div css={[styles.actionPortals, responsiveStyles.mobileAdaptations]} className="action-portals">
                <Link 
                  to={user ? "/home" : "#auth"} 
                  css={[styles.portalButton, styles.primaryPortal]}
                >
                  <span>⚡</span>
                  <span>{user ? "Enter Intelligence Center" : "Begin Your Journey"}</span>
                </Link>
                
                <Link to="/about" css={styles.portalButton}>
                  <span>🧠</span>
                  <span>Explore Capabilities</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 🎪 Capability Amphitheater */}
          <section css={styles.capabilityAmphitheater}>
            <h2 css={styles.amphitheaterTitle}>
              Intelligence Capabilities
            </h2>
            
            <div css={[styles.capabilityGrid, responsiveStyles.capabilityGridLarge, responsiveStyles.mobileAdaptations]} className="capability-grid">
              {capabilities.map((capability, index) => (
                <CapabilityCard 
                  key={index}
                  {...capability}
                  delay={index * 200}
                />
              ))}
            </div>
          </section>

          {/* 🔄 Workflow Pavilion */}
          <section css={styles.workflowPavilion}>
            <h2 css={styles.workflowTitle}>
              Intelligence Workflow
            </h2>
            
            <div css={styles.workflowChain}>
              {workflowSteps.map((step, index) => (
                <WorkflowStep 
                  key={index}
                  {...step}
                  delay={index * 150}
                />
              ))}
            </div>
          </section>

          {/* 🔐 Authentication Sanctum */}
          {!user && (
            <section css={styles.authSanctum}>
              <div css={styles.authPortal}>
                <h2 css={styles.authTitle}>
                  Access Intelligence Portal
                </h2>

                {error && (
                  <div css={css`
                    background: rgba(255, 7, 58, 0.15);
                    border: 1px solid ${colors.neonRed};
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                    color: ${colors.neonRed};
                    cursor: pointer;
                  `} onClick={clearError}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Google OAuth */}
                <div css={css`margin-bottom: 2rem;`}>
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.error('Google Authentication Failed')}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="continue_with"
                    width="100%"
                  />
                </div>

                {/* Divider */}
                <div css={css`
                  display: flex;
                  align-items: center;
                  margin: 2rem 0;
                  gap: 1rem;
                  
                  &::before, &::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, ${colors.border}, transparent);
                  }
                `}>
                  <span css={css`
                    color: ${colors.textMuted};
                    font-size: 0.9rem;
                    white-space: nowrap;
                  `}>
                    or use credentials
                  </span>
                </div>

                {/* Email/Password Form */}
                <form css={styles.authForm} onSubmit={handleEmailLogin}>
                  <div css={styles.inputGroup}>
                    <input
                      type="email"
                      placeholder="Intelligence Access ID (Email)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      css={styles.authInput}
                      required
                    />
                  </div>
                  
                  <div css={styles.inputGroup}>
                    <input
                      type="password"
                      placeholder="Security Cipher (Password)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      css={styles.authInput}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    css={styles.submitButton}
                    disabled={isLoading}
                  >
                    {isLoading ? '⏳ Accessing Portal...' : '🚀 Enter Intelligence Center'}
                  </button>
                </form>
              </div>
            </section>
          )}
        </div>
      </div>
    </Suspense>
      )}
    </>
  );
};

export default UltimateNeoDecoLanding;
