/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { colors } from '../../../styles/theme/colors';

/**
 * ClockFace - Central ornate timepiece with Roman numerals and Art Deco styling
 * Features animated hands, glowing numbers, and intricate decorative elements
 */
const ClockFace = ({ isInitialized, animationPhase, progress }) => {
  const [time, setTime] = useState(new Date());
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    // Update time every second for realistic clock movement
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Periodic glow effect
    const glowInterval = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, 4000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(glowInterval);
    };
  }, []);

  // Calculate hand positions
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondAngle = (seconds * 6) - 90; // 6 degrees per second
  const minuteAngle = (minutes * 6) + (seconds * 0.1) - 90; // 6 degrees per minute
  const hourAngle = (hours * 30) + (minutes * 0.5) - 90; // 30 degrees per hour

  // Roman numerals for clock face
  const romanNumerals = [
    { num: 'XII', angle: 0 },
    { num: 'I', angle: 30 },
    { num: 'II', angle: 60 },
    { num: 'III', angle: 90 },
    { num: 'IV', angle: 120 },
    { num: 'V', angle: 150 },
    { num: 'VI', angle: 180 },
    { num: 'VII', angle: 210 },
    { num: 'VIII', angle: 240 },
    { num: 'IX', angle: 270 },
    { num: 'X', angle: 300 },
    { num: 'XI', angle: 330 }
  ];

  return (
    <div css={[styles.container, isInitialized && styles.initialized]}>
      {/* Outer decorative ring */}
      <div css={styles.outerRing}>
        {/* Art Deco sunburst pattern */}
        <div css={styles.sunburstPattern}>
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              css={styles.sunburstRay}
              style={{
                transform: `rotate(${i * 15}deg)`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main clock face */}
      <div css={[styles.clockFace, isGlowing && styles.glowing]}>
        {/* Inner decorative border */}
        <div css={styles.innerBorder}>
          {/* Minute markers */}
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              css={[
                styles.minuteMarker,
                i % 5 === 0 && styles.hourMarker
              ]}
              style={{
                transform: `rotate(${i * 6}deg)`,
                animationDelay: `${i * 0.02}s`
              }}
            />
          ))}

          {/* Roman numerals */}
          {romanNumerals.map((item, index) => (
            <div
              key={index}
              css={styles.romanNumeral}
              style={{
                transform: `rotate(${item.angle}deg)`,
                animationDelay: `${index * 0.2}s`
              }}
            >
              <span css={styles.romanText}>{item.num}</span>
            </div>
          ))}

          {/* Center ornament */}
          <div css={styles.centerOrnament}>
            <div css={styles.centerJewel} />
          </div>

          {/* Clock hands */}
          <div css={styles.handsContainer}>
            {/* Hour hand */}
            <div
              css={[styles.hand, styles.hourHand]}
              style={{
                transform: `rotate(${hourAngle}deg)`
              }}
            />
            
            {/* Minute hand */}
            <div
              css={[styles.hand, styles.minuteHand]}
              style={{
                transform: `rotate(${minuteAngle}deg)`
              }}
            />
            
            {/* Second hand */}
            <div
              css={[styles.hand, styles.secondHand]}
              style={{
                transform: `rotate(${secondAngle}deg)`
              }}
            />
          </div>

          {/* Progress indicator ring */}
          <div css={styles.progressRing}>
            <svg css={styles.progressSvg} viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                css={styles.progressTrack}
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                css={styles.progressBar}
                style={{
                  strokeDasharray: `${2 * Math.PI * 90}`,
                  strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`
                }}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 300px;
    height: 300px;
    opacity: 0;
    transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 5;
    
    @media (max-width: 768px) {
      width: 250px;
      height: 250px;
    }
    
    @media (max-width: 480px) {
      width: 200px;
      height: 200px;
    }
  `,

  initialized: css`
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  `,

  outerRing: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      ${colors.neonGold} 0%,
      #b8860b 25%,
      ${colors.neonGold} 50%,
      #daa520 75%,
      ${colors.neonGold} 100%
    );
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.6),
      inset 0 0 30px rgba(0, 0, 0, 0.5);
    padding: 8px;
  `,

  sunburstPattern: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  `,

  sunburstRay: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 50%;
    background: linear-gradient(
      to top,
      transparent 0%,
      rgba(255, 215, 0, 0.8) 30%,
      transparent 100%
    );
    transform-origin: bottom center;
    animation: sunburstPulse 6s ease-in-out infinite;
    
    @keyframes sunburstPulse {
      0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
      50% { opacity: 1; transform: scaleY(1.2); }
    }
  `,

  clockFace: css`
    position: absolute;
    top: 8px;
    left: 8px;
    width: calc(100% - 16px);
    height: calc(100% - 16px);
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      #1a1a2e 0%,
      #16213e 50%,
      #0f3460 100%
    );
    box-shadow: 
      inset 0 0 40px rgba(0, 0, 0, 0.8),
      inset 0 0 20px rgba(0, 255, 255, 0.1);
    transition: all 0.5s ease;
  `,

  glowing: css`
    box-shadow: 
      inset 0 0 40px rgba(0, 0, 0, 0.8),
      inset 0 0 20px rgba(0, 255, 255, 0.3),
      0 0 50px rgba(0, 255, 255, 0.2);
  `,

  innerBorder: css`
    position: absolute;
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    border-radius: 50%;
    border: 2px solid rgba(0, 255, 255, 0.3);
    box-shadow: 
      inset 0 0 20px rgba(0, 255, 255, 0.1),
      0 0 10px rgba(0, 255, 255, 0.2);
  `,

  minuteMarker: css`
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 8px;
    background: rgba(255, 255, 255, 0.5);
    transform-origin: bottom center;
    animation: markerFade 3s ease-in-out infinite;
    
    @keyframes markerFade {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `,

  hourMarker: css`
    width: 2px;
    height: 15px;
    background: ${colors.neonGold};
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  `,

  romanNumeral: css`
    position: absolute;
    top: 20px;
    left: 50%;
    transform-origin: bottom center;
    height: 40px;
    animation: numeralGlow 4s ease-in-out infinite;
    
    @keyframes numeralGlow {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
  `,

  romanText: css`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: ${colors.neonGold};
    text-shadow: 
      0 0 5px rgba(255, 215, 0, 0.8),
      0 0 10px rgba(255, 215, 0, 0.4);
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.7rem;
    }
  `,

  centerOrnament: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      ${colors.neonGold} 0%,
      #b8860b 50%,
      ${colors.neonGold} 100%
    );
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.8),
      inset 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 10;
  `,

  centerJewel: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.neonTeal};
    box-shadow: 
      0 0 10px rgba(0, 255, 255, 1),
      inset 0 0 5px rgba(255, 255, 255, 0.8);
    animation: jewelPulse 2s ease-in-out infinite;
    
    @keyframes jewelPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
    }
  `,

  handsContainer: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  `,

  hand: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: bottom center;
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  `,

  hourHand: css`
    width: 4px;
    height: 60px;
    background: linear-gradient(
      to top,
      ${colors.neonGold} 0%,
      #daa520 100%
    );
    margin-top: -60px;
    margin-left: -2px;
    box-shadow: 
      0 0 15px rgba(255, 215, 0, 0.6),
      inset 0 0 5px rgba(255, 255, 255, 0.3);
  `,

  minuteHand: css`
    width: 3px;
    height: 80px;
    background: linear-gradient(
      to top,
      ${colors.neonTeal} 0%,
      #40e0d0 100%
    );
    margin-top: -80px;
    margin-left: -1.5px;
    box-shadow: 
      0 0 15px rgba(0, 255, 255, 0.6),
      inset 0 0 5px rgba(255, 255, 255, 0.3);
  `,

  secondHand: css`
    width: 1px;
    height: 90px;
    background: ${colors.neonRed};
    margin-top: -90px;
    margin-left: -0.5px;
    box-shadow: 
      0 0 10px rgba(255, 7, 58, 0.8),
      0 0 20px rgba(255, 7, 58, 0.4);
    animation: secondHandGlow 1s ease-in-out infinite alternate;
    
    @keyframes secondHandGlow {
      from { opacity: 0.8; }
      to { opacity: 1; }
    }
  `,

  progressRing: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    opacity: 0.7;
  `,

  progressSvg: css`
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  `,

  progressTrack: css`
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 2;
  `,

  progressBar: css`
    fill: none;
    stroke: ${colors.neonTeal};
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.6));
  `
};

export default ClockFace;
