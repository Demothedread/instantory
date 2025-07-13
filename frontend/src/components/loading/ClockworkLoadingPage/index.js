/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { colors } from '../../../styles/theme/colors';
import ClockFace from './ClockFace';
import CuckooMechanism from './CuckooMechanism';
import GearSystem from './GearSystem';
import OrnamentalFrame from './OrnamentalFrame';
import PendulumAssembly from './PendulumAssembly';

/**
 * ClockworkLoadingPage - A beautifully intricate Neo-Deco-Rococo loading experience
 * Embodies the precision and artistry of a cuckoo clock meets Art Deco aesthetics
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {number} props.progress - Loading progress (0-100)
 * @param {boolean} props.isVisible - Whether the loading screen is visible
 */
const ClockworkLoadingPage = ({ 
  message = "Preparing your digital sanctuary...", 
  progress = 0, 
  isVisible = true 
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    // Initialize the clockwork animation sequence
    const initTimeout = setTimeout(() => {
      setIsInitialized(true);
    }, 500);

    // Phase progression for the clockwork sequence
    const phaseInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 5);
    }, 3000);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(phaseInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div css={styles.container}>
      {/* Ornamental frame and background */}
      <OrnamentalFrame />
      
      {/* Main clockwork mechanism */}
      <div css={styles.clockworkContainer}>
        {/* Central clock face */}
        <ClockFace 
          isInitialized={isInitialized}
          animationPhase={animationPhase}
          progress={progress}
        />
        
        {/* Gear system */}
        <GearSystem 
          isInitialized={isInitialized}
          animationPhase={animationPhase}
        />
        
        {/* Pendulum assembly */}
        <PendulumAssembly 
          isInitialized={isInitialized}
          animationPhase={animationPhase}
        />
        
        {/* Cuckoo mechanism */}
        <CuckooMechanism 
          isInitialized={isInitialized}
          animationPhase={animationPhase}
        />
      </div>
      
      {/* Loading message */}
      <div css={styles.messageContainer}>
        <div css={styles.message}>
          {message}
        </div>
        <div css={styles.progressBar}>
          <div 
            css={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: ${colors.darkGradient};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(
        ellipse at center,
        rgba(0, 255, 255, 0.05) 0%,
        rgba(255, 215, 0, 0.03) 50%,
        transparent 100%
      );
      pointer-events: none;
    }
  `,

  clockworkContainer: css`
    position: relative;
    width: 600px;
    height: 600px;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;
    perspective: 1000px;
    
    @media (max-width: 768px) {
      width: 400px;
      height: 400px;
    }
    
    @media (max-width: 480px) {
      width: 300px;
      height: 300px;
    }
  `,

  messageContainer: css`
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 100%;
    max-width: 600px;
    padding: 0 2rem;
    
    @media (max-width: 768px) {
      bottom: 60px;
      max-width: 400px;
    }
  `,

  message: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 1.2rem;
    color: ${colors.neonGold};
    text-shadow: 
      0 0 10px rgba(255, 215, 0, 0.5),
      0 0 20px rgba(255, 215, 0, 0.3),
      0 0 30px rgba(255, 215, 0, 0.1);
    margin-bottom: 1rem;
    letter-spacing: 0.1em;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  `,

  progressBar: css`
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    border: 1px solid rgba(255, 215, 0, 0.3);
    box-shadow: 
      0 0 10px rgba(255, 215, 0, 0.2),
      inset 0 0 10px rgba(0, 0, 0, 0.5);
  `,

  progressFill: css`
    height: 100%;
    background: linear-gradient(
      90deg,
      ${colors.neonTeal} 0%,
      ${colors.neonGold} 50%,
      ${colors.neonTeal} 100%
    );
    border-radius: 1px;
    transition: width 0.3s ease;
    box-shadow: 
      0 0 15px rgba(0, 255, 255, 0.6),
      0 0 30px rgba(255, 215, 0, 0.4);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 20px;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100px); }
      100% { transform: translateX(100px); }
    }
  `
};

export default ClockworkLoadingPage;
