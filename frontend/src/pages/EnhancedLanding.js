import { css } from '@emotion/react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/auth/index';
import { colors } from '../styles/theme/colors';

// Import new landing components
import AuthSection from '../components/landing/AuthSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HeroSection from '../components/landing/HeroSection';

/**
 * Enhanced Landing Page Component
 * Implements Neo-Deco-Rococo design system with modular component architecture
 * Framework: Emotion React (CSS-in-JS) for component-based styling
 * Design Philosophy: Art-Deco geometry + Rococo exuberance + Modern functionality
 */
const EnhancedLandingPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div css={styles.container}>
      {/* Background decorative elements */}
      <div css={styles.backgroundElements}>
        <div css={styles.bgGradient1} />
        <div css={styles.bgGradient2} />
        <div css={styles.bgGradient3} />
        <div css={styles.bgPattern} />
      </div>

      {/* Main content with layered sections */}
      <main css={styles.mainContent}>
        {/* Hero Section - Entry portal to Bartleby */}
        <HeroSection user={user} />

        {/* Features Section - Core capabilities showcase */}
        <FeaturesSection />

        {/* Authentication Section - Access control portal */}
        <AuthSection user={user} />
      </main>

      {/* Parallax background accents for depth */}
      <div css={styles.parallaxLayer1} />
      <div css={styles.parallaxLayer2} />
      <div css={styles.parallaxLayer3} />
    </div>
  );
};

const styles = {
  container: css`
    position: relative;
    min-height: 100vh;
    background: ${colors.darkGradient};
    color: ${colors.textLight};
    overflow-x: hidden;
    
    /* Enable hardware acceleration for smooth scrolling */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    
    /* Establish 3D context for depth effects */
    perspective: 1000px;
    transform-style: preserve-3d;
  `,

  /* Background decorative elements */
  backgroundElements: css`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  `,

  bgGradient1: css`
    position: absolute;
    top: -20%;
    right: -10%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, 
      ${colors.neonTeal}08 0%, 
      ${colors.neonTeal}03 40%, 
      transparent 70%);
    border-radius: 50%;
    animation: floatSlow 30s ease-in-out infinite;
  `,

  bgGradient2: css`
    position: absolute;
    bottom: -15%;
    left: -5%;
    width: 50%;
    height: 50%;
    background: radial-gradient(circle, 
      ${colors.neonGold}06 0%, 
      ${colors.neonGold}02 40%, 
      transparent 70%);
    border-radius: 50%;
    animation: floatSlow 25s ease-in-out infinite reverse;
  `,

  bgGradient3: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background: radial-gradient(ellipse, 
      ${colors.neonPurple}04 0%, 
      transparent 60%);
    animation: rotateGlow 60s linear infinite;
  `,

  /* Subtle pattern overlay for texture */
  bgPattern: css`
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(45deg, transparent 48%, ${colors.neonTeal}02 49%, ${colors.neonTeal}02 51%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, ${colors.neonGold}02 49%, ${colors.neonGold}02 51%, transparent 52%);
    background-size: 100px 100px;
    opacity: 0.3;
    animation: patternShift 120s linear infinite;
  `,

  /* Main content container */
  mainContent: css`
    position: relative;
    z-index: 1;
    
    /* Apply consistent max-width and centering */
    width: 100%;
    
    /* Enable smooth scrolling experience */
    scroll-behavior: smooth;
  `,

  /* Parallax layers for enhanced depth */
  parallaxLayer1: css`
    position: fixed;
    top: 10%;
    left: 10%;
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, 
      ${colors.neonTeal}10 0%, 
      ${colors.neonBlue}08 50%, 
      transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    animation: parallaxFloat1 20s ease-in-out infinite;
    transform: translateZ(-100px);
  `,

  parallaxLayer2: css`
    position: fixed;
    bottom: 15%;
    right: 15%;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, 
      ${colors.neonGold}12 0%, 
      ${colors.neonPink}08 50%, 
      transparent 100%);
    border-radius: 30%;
    pointer-events: none;
    z-index: 0;
    animation: parallaxFloat2 25s ease-in-out infinite reverse;
    transform: translateZ(-80px);
  `,

  parallaxLayer3: css`
    position: fixed;
    top: 60%;
    left: 5%;
    width: 100px;
    height: 300px;
    background: linear-gradient(to bottom, 
      ${colors.neonPurple}08 0%, 
      transparent 60%);
    border-radius: 50px;
    pointer-events: none;
    z-index: 0;
    animation: parallaxFloat3 18s ease-in-out infinite;
    transform: translateZ(-60px);
  `,

  /* Media queries for responsive design */
  '@media (max-width: 768px)': css`
    .container {
      /* Reduce effects on mobile for performance */
      perspective: none;
      transform-style: flat;
    }
    
    .parallax-layer-1,
    .parallax-layer-2,
    .parallax-layer-3 {
      display: none;
    }
    
    .bg-gradient-1,
    .bg-gradient-2 {
      width: 80%;
      height: 80%;
    }
  `,

  /* Animation keyframes */
  '@keyframes floatSlow': css`
    0%, 100% {
      transform: translate(0, 0) rotate(0deg);
    }
    33% {
      transform: translate(20px, -30px) rotate(120deg);
    }
    66% {
      transform: translate(-15px, 20px) rotate(240deg);
    }
  `,

  '@keyframes rotateGlow': css`
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  `,

  '@keyframes patternShift': css`
    0% {
      background-position: 0 0, 0 0;
    }
    100% {
      background-position: 100px 100px, -100px 100px;
    }
  `,

  '@keyframes parallaxFloat1': css`
    0%, 100% {
      transform: translateZ(-100px) translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateZ(-100px) translateY(-30px) rotate(180deg);
    }
  `,

  '@keyframes parallaxFloat2': css`
    0%, 100% {
      transform: translateZ(-80px) translateX(0px) rotate(0deg);
    }
    50% {
      transform: translateZ(-80px) translateX(20px) rotate(-180deg);
    }
  `,

  '@keyframes parallaxFloat3': css`
    0%, 100% {
      transform: translateZ(-60px) translateY(0px) scale(1);
    }
    50% {
      transform: translateZ(-60px) translateY(-20px) scale(1.1);
    }
  `,

  /* Accessibility support */
  '@media (prefers-reduced-motion: reduce)': css`
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `,

  /* High contrast mode support */
  '@media (prefers-contrast: high)': css`
    .container {
      background: #000000;
      color: #ffffff;
    }
    
    .bg-gradient-1,
    .bg-gradient-2,
    .bg-gradient-3,
    .bg-pattern,
    .parallax-layer-1,
    .parallax-layer-2,
    .parallax-layer-3 {
      display: none;
    }
  `,
};

export default EnhancedLandingPage;
