/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { colors } from '../../../styles/theme/colors';

/**
 * GearSystem - Intricate mechanical gear system for Neo-Deco-Rococo clockwork
 * Features multiple interconnected gears with realistic physics and Art Deco styling
 */

// Gear rotation animations with varying speeds for realistic mechanical movement
const gearRotateClockwise = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const gearRotateCounterClockwise = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
`;

const gearTeethGlow = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 5px ${colors.neonTeal}40);
  }
  50% { 
    filter: drop-shadow(0 0 15px ${colors.neonTeal}80) drop-shadow(0 0 25px ${colors.neonGold}40);
  }
`;

const mechanicalPulse = keyframes`
  0%, 100% { 
    opacity: 0.7;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.02);
  }
`;

const GearSystem = ({ isInitialized, animationPhase }) => {
  return (
    <div css={styles.gearSystemContainer}>
      {/* Primary gear - large central gear */}
      <div css={[styles.gear, styles.primaryGear]}>
        <div css={styles.gearBody}>
          {/* Gear teeth */}
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              css={styles.gearTooth}
              style={{ transform: `rotate(${i * 15}deg)` }}
            />
          ))}
          
          {/* Central hub */}
          <div css={styles.gearHub}>
            <div css={styles.hubCenter} />
          </div>
          
          {/* Spokes */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              css={styles.gearSpoke}
              style={{ transform: `rotate(${i * 60}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Secondary gear - top right */}
      <div css={[styles.gear, styles.secondaryGear1]}>
        <div css={styles.gearBody}>
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              css={styles.gearTooth}
              style={{ transform: `rotate(${i * 22.5}deg)` }}
            />
          ))}
          <div css={styles.gearHub}>
            <div css={styles.hubCenter} />
          </div>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              css={styles.gearSpoke}
              style={{ transform: `rotate(${i * 90}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Tertiary gear - bottom left */}
      <div css={[styles.gear, styles.tertiaryGear1]}>
        <div css={styles.gearBody}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              css={styles.gearTooth}
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
          <div css={styles.gearHub}>
            <div css={styles.hubCenter} />
          </div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              css={styles.gearSpoke}
              style={{ transform: `rotate(${i * 120}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Quaternary gear - top left */}
      <div css={[styles.gear, styles.quaternaryGear1]}>
        <div css={styles.gearBody}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              css={styles.gearTooth}
              style={{ transform: `rotate(${i * 18}deg)` }}
            />
          ))}
          <div css={styles.gearHub}>
            <div css={styles.hubCenter} />
          </div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              css={styles.gearSpoke}
              style={{ transform: `rotate(${i * 72}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Mechanical connectors */}
      <div css={styles.mechanicalConnectors}>
        <div css={[styles.connector, styles.connector1]} />
        <div css={[styles.connector, styles.connector2]} />
        <div css={[styles.connector, styles.connector3]} />
      </div>

      {/* Steam/energy effects */}
      <div css={styles.energyEffects}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            css={styles.energyParticle}
            style={{
              animationDelay: `${i * 0.8}s`,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  gearSystemContainer: css`
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
  `,

  gear: css`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  gearBody: css`
    position: relative;
    border-radius: 50%;
    background: 
      radial-gradient(circle at 30% 30%, ${colors.surface}90 0%, transparent 70%),
      radial-gradient(circle at center, ${colors.card}85 0%, ${colors.background}70 100%);
    border: 2px solid ${colors.borderLight};
    backdrop-filter: blur(5px);
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.4),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
  `,

  primaryGear: css`
    width: 150px;
    height: 150px;
    top: 25%;
    right: 15%;
    animation: ${gearRotateClockwise} 8s linear infinite;
    z-index: 3;
    
    ${styles.gearBody} {
      width: 150px;
      height: 150px;
    }
    
    @media (max-width: 768px) {
      width: 120px;
      height: 120px;
      ${styles.gearBody} {
        width: 120px;
        height: 120px;
      }
    }
    
    @media (max-width: 480px) {
      width: 100px;
      height: 100px;
      ${styles.gearBody} {
        width: 100px;
        height: 100px;
      }
    }
  `,

  secondaryGear1: css`
    width: 100px;
    height: 100px;
    top: 10%;
    right: 35%;
    animation: ${gearRotateCounterClockwise} 6s linear infinite;
    z-index: 2;
    
    ${styles.gearBody} {
      width: 100px;
      height: 100px;
    }
    
    @media (max-width: 768px) {
      width: 80px;
      height: 80px;
      ${styles.gearBody} {
        width: 80px;
        height: 80px;
      }
    }
    
    @media (max-width: 480px) {
      width: 65px;
      height: 65px;
      ${styles.gearBody} {
        width: 65px;
        height: 65px;
      }
    }
  `,

  tertiaryGear1: css`
    width: 80px;
    height: 80px;
    bottom: 20%;
    left: 20%;
    animation: ${gearRotateClockwise} 4s linear infinite;
    z-index: 2;
    
    ${styles.gearBody} {
      width: 80px;
      height: 80px;
    }
    
    @media (max-width: 768px) {
      width: 65px;
      height: 65px;
      ${styles.gearBody} {
        width: 65px;
        height: 65px;
      }
    }
    
    @media (max-width: 480px) {
      width: 50px;
      height: 50px;
      ${styles.gearBody} {
        width: 50px;
        height: 50px;
      }
    }
  `,

  quaternaryGear1: css`
    width: 120px;
    height: 120px;
    top: 15%;
    left: 10%;
    animation: ${gearRotateCounterClockwise} 10s linear infinite;
    z-index: 1;
    
    ${styles.gearBody} {
      width: 120px;
      height: 120px;
    }
    
    @media (max-width: 768px) {
      width: 95px;
      height: 95px;
      ${styles.gearBody} {
        width: 95px;
        height: 95px;
      }
    }
    
    @media (max-width: 480px) {
      width: 75px;
      height: 75px;
      ${styles.gearBody} {
        width: 75px;
        height: 75px;
      }
    }
  `,

  gearTooth: css`
    position: absolute;
    width: 6px;
    height: 12px;
    background: linear-gradient(180deg, ${colors.neonTeal}80, ${colors.neonGold}60);
    border-radius: 2px;
    top: -6px;
    left: 50%;
    margin-left: -3px;
    transform-origin: 50% 81px;
    box-shadow: 0 0 8px ${colors.neonTeal}40;
    animation: ${gearTeethGlow} 3s ease-in-out infinite;
    
    @media (max-width: 768px) {
      width: 5px;
      height: 10px;
      margin-left: -2.5px;
      transform-origin: 50% 65px;
    }
    
    @media (max-width: 480px) {
      width: 4px;
      height: 8px;
      margin-left: -2px;
      transform-origin: 50% 52px;
    }
  `,

  gearHub: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30%;
    height: 30%;
    background: 
      radial-gradient(circle at center, ${colors.neonGold}90 0%, ${colors.surface}60 100%);
    border: 2px solid ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 
      0 0 15px ${colors.neonGold}50,
      inset 0 0 10px rgba(0, 0, 0, 0.3);
    z-index: 10;
  `,

  hubCenter: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40%;
    height: 40%;
    background: ${colors.background};
    border: 1px solid ${colors.borderLight};
    border-radius: 50%;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
  `,

  gearSpoke: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 35%;
    background: linear-gradient(180deg, ${colors.neonTeal}, transparent);
    border-radius: 1px;
    transform-origin: 50% 0%;
    margin-left: -1px;
    margin-top: 15%;
    opacity: 0.8;
    animation: ${mechanicalPulse} 4s ease-in-out infinite;
  `,

  mechanicalConnectors: css`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  `,

  connector: css`
    position: absolute;
    background: linear-gradient(90deg, ${colors.borderLight}, ${colors.neonTeal}40, ${colors.borderLight});
    border-radius: 2px;
    opacity: 0.6;
    animation: ${mechanicalPulse} 5s ease-in-out infinite;
  `,

  connector1: css`
    width: 100px;
    height: 3px;
    top: 25%;
    right: 25%;
    transform: rotate(45deg);
  `,

  connector2: css`
    width: 80px;
    height: 2px;
    top: 30%;
    left: 25%;
    transform: rotate(-30deg);
  `,

  connector3: css`
    width: 60px;
    height: 2px;
    bottom: 35%;
    left: 35%;
    transform: rotate(15deg);
  `,

  energyEffects: css`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  `,

  energyParticle: css`
    position: absolute;
    width: 4px;
    height: 4px;
    background: ${colors.neonTeal};
    border-radius: 50%;
    box-shadow: 0 0 10px ${colors.neonTeal};
    animation: ${mechanicalPulse} 2s ease-in-out infinite;
    
    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      width: 8px;
      height: 8px;
      background: ${colors.neonGold}30;
      border-radius: 50%;
      animation: ${gearTeethGlow} 1.5s ease-in-out infinite;
    }
  `
};

export default GearSystem;
