/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { colors } from '../../../styles/theme/colors';

/**
 * ClockFace - The heart of our Neo-Deco-Rococo clockwork mechanism
 * Combines Art Deco geometric precision with Rococo ornamental excess
 * Features a functioning clock with progress indicator and time display
 */

// Animations for the clockwork mechanism
const clockHandRotation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const numeralGlow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 10px ${colors.neonGold}40;
    transform: scale(1);
  }
  50% { 
    text-shadow: 0 0 20px ${colors.neonGold}80, 0 0 30px ${colors.neonTeal}40;
    transform: scale(1.05);
  }
`;

const progressPulse = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 10px ${colors.neonTeal});
    opacity: 0.8;
  }
  50% { 
    filter: drop-shadow(0 0 25px ${colors.neonTeal}) drop-shadow(0 0 35px ${colors.neonGold});
    opacity: 1;
  }
`;

const ClockFace = ({ isInitialized, animationPhase, progress = 0 }) => {
  const currentTime = new Date();
  const hours = currentTime.getHours() % 12;
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  // Calculate hand angles
  const secondAngle = (seconds * 6) - 90; // 6 degrees per second
  const minuteAngle = (minutes * 6 + seconds * 0.1) - 90; // 6 degrees per minute
  const hourAngle = (hours * 30 + minutes * 0.5) - 90; // 30 degrees per hour
  
  // Progress circle angle (360 degrees = 100%)
  const progressAngle = (progress / 100) * 360;

  return (
    <div css={styles.clockContainer}>
      {/* Outer ornamental ring */}
      <div css={styles.outerRing}>
        {/* Art Deco decorative elements */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            css={styles.decorativeElement}
            style={{ transform: `rotate(${i * 30}deg)` }}
          />
        ))}
      </div>

      {/* Main clock face */}
      <div css={styles.clockFace}>
        {/* Progress ring */}
        <svg css={styles.progressRing} viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="85"
            css={styles.progressBackground}
          />
          <circle
            cx="100"
            cy="100"
            r="85"
            css={styles.progressForeground}
            strokeDasharray={`${progressAngle * (534.07 / 360)} 534.07`}
            transform="rotate(-90 100 100)"
          />
        </svg>

        {/* Clock numerals */}
        <div css={styles.numeralsContainer}>
          {[...Array(12)].map((_, i) => {
            const number = i === 0 ? 12 : i;
            const angle = i * 30;
            return (
              <div
                key={i}
                css={styles.numeral}
                style={{
                  transform: `rotate(${angle}deg) translateY(-65px) rotate(-${angle}deg)`,
                  animationDelay: `${i * 0.1}s`
                }}
              >
                {number}
              </div>
            );
          })}
        </div>

        {/* Clock hands */}
        <div css={styles.handsContainer}>
          {/* Hour hand */}
          <div
            css={[styles.hand, styles.hourHand]}
            style={{ transform: `rotate(${hourAngle}deg)` }}
          />
          
          {/* Minute hand */}
          <div
            css={[styles.hand, styles.minuteHand]}
            style={{ transform: `rotate(${minuteAngle}deg)` }}
          />
          
          {/* Second hand */}
          <div
            css={[styles.hand, styles.secondHand]}
            style={{ transform: `rotate(${secondAngle}deg)` }}
          />
          
          {/* Center hub */}
          <div css={styles.centerHub} />
        </div>

        {/* Progress indicator text */}
        <div css={styles.progressText}>
          <div css={styles.progressPercent}>{Math.round(progress)}%</div>
          <div css={styles.progressLabel}>Loading</div>
        </div>
      </div>

      {/* Inner mechanical details */}
      <div css={styles.mechanicalDetails}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            css={styles.mechanicalTick}
            style={{ 
              transform: `rotate(${i * 45}deg)`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  clockContainer: css`
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    
    @media (max-width: 768px) {
      width: 250px;
      height: 250px;
    }
    
    @media (max-width: 480px) {
      width: 200px;
      height: 200px;
    }
  `,

  outerRing: css`
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid ${colors.neonGold}60;
    border-radius: 50%;
    background: linear-gradient(135deg, 
      ${colors.surface}80 0%,
      ${colors.card}60 50%,
      ${colors.surface}80 100%);
    backdrop-filter: blur(10px);
    box-shadow: 
      0 0 30px ${colors.neonGold}30,
      inset 0 0 30px rgba(0, 0, 0, 0.3);
  `,

  decorativeElement: css`
    position: absolute;
    top: 5px;
    left: 50%;
    width: 4px;
    height: 20px;
    background: linear-gradient(180deg, ${colors.neonTeal}, ${colors.neonGold});
    border-radius: 2px;
    transform-origin: 50% 145px;
    animation: ${numeralGlow} 4s ease-in-out infinite;
  `,

  clockFace: css`
    position: relative;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: 
      radial-gradient(circle at 30% 30%, ${colors.surface}90 0%, transparent 50%),
      radial-gradient(circle at center, ${colors.background}95 0%, ${colors.card}80 100%);
    border: 2px solid ${colors.borderLight};
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(15px);
    box-shadow: 
      0 0 40px rgba(0, 0, 0, 0.5),
      inset 0 0 40px rgba(255, 255, 255, 0.05);
    
    @media (max-width: 768px) {
      width: 200px;
      height: 200px;
    }
    
    @media (max-width: 480px) {
      width: 160px;
      height: 160px;
    }
  `,

  progressRing: css`
    position: absolute;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    z-index: 1;
  `,

  progressBackground: css`
    fill: none;
    stroke: ${colors.border};
    stroke-width: 3;
    opacity: 0.3;
  `,

  progressForeground: css`
    fill: none;
    stroke: ${colors.neonTeal};
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
    animation: ${progressPulse} 2s ease-in-out infinite;
    filter: drop-shadow(0 0 8px ${colors.neonTeal});
  `,

  numeralsContainer: css`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 3;
  `,

  numeral: css`
    position: absolute;
    top: 50%;
    left: 50%;
    font-family: 'Cinzel Decorative', serif;
    font-size: 1.2rem;
    font-weight: bold;
    color: ${colors.neonGold};
    text-align: center;
    animation: ${numeralGlow} 6s ease-in-out infinite;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  `,

  handsContainer: css`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 4;
  `,

  hand: css`
    position: absolute;
    background: linear-gradient(180deg, ${colors.neonTeal}, ${colors.neonGold});
    border-radius: 2px;
    transform-origin: 50% 100%;
    top: 50%;
    left: 50%;
    box-shadow: 0 0 10px ${colors.neonTeal}50;
    transition: transform 0.1s ease-out;
  `,

  hourHand: css`
    width: 4px;
    height: 50px;
    margin-left: -2px;
    margin-top: -50px;
  `,

  minuteHand: css`
    width: 3px;
    height: 70px;
    margin-left: -1.5px;
    margin-top: -70px;
  `,

  secondHand: css`
    width: 2px;
    height: 80px;
    margin-left: -1px;
    margin-top: -80px;
    background: ${colors.neonRed};
    box-shadow: 0 0 8px ${colors.neonRed}50;
  `,

  centerHub: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, ${colors.neonGold}, ${colors.neonTeal});
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 
      0 0 15px ${colors.neonGold}60,
      inset 0 0 8px rgba(0, 0, 0, 0.3);
    z-index: 5;
  `,

  progressText: css`
    position: absolute;
    bottom: 30%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 6;
  `,

  progressPercent: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 1.5rem;
    font-weight: bold;
    color: ${colors.neonTeal};
    text-shadow: 0 0 15px ${colors.neonTeal}60;
    margin-bottom: 0.2rem;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1rem;
    }
  `,

  progressLabel: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.7rem;
    color: ${colors.neonGold};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-shadow: 0 0 10px ${colors.neonGold}50;
    
    @media (max-width: 480px) {
      font-size: 0.6rem;
    }
  `,

  mechanicalDetails: css`
    position: absolute;
    width: 60%;
    height: 60%;
    z-index: 2;
  `,

  mechanicalTick: css`
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 8px;
    background: ${colors.neonGold}80;
    border-radius: 1px;
    transform-origin: 50% 60px;
    animation: ${numeralGlow} 3s ease-in-out infinite;
    
    @media (max-width: 768px) {
      transform-origin: 50% 50px;
    }
    
    @media (max-width: 480px) {
      transform-origin: 50% 40px;
    }
  `
};

export default ClockFace;
