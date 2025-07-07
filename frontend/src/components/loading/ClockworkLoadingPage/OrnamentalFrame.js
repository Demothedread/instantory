/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { colors } from '../../../styles/theme/colors';

/**
 * OrnamentalFrame - Elaborate Neo-Deco-Rococo decorative frame
 * Combines Art Deco geometric precision with Rococo ornamental excess
 * Creates an immersive border around the entire clockwork mechanism
 */

// Frame animation keyframes
const frameGlow = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 15px ${colors.neonGold}40);
    opacity: 0.8;
  }
  50% { 
    filter: drop-shadow(0 0 30px ${colors.neonGold}80) drop-shadow(0 0 45px ${colors.neonTeal}40);
    opacity: 1;
  }
`;

const ornamentFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  33% { 
    transform: translateY(-2px) rotate(2deg) scale(1.02);
  }
  66% { 
    transform: translateY(2px) rotate(-1deg) scale(0.98);
  }
`;

const cornerSpiral = keyframes`
  0% { 
    transform: rotate(0deg) scale(1);
    opacity: 0.7;
  }
  50% { 
    transform: rotate(180deg) scale(1.1);
    opacity: 1;
  }
  100% { 
    transform: rotate(360deg) scale(1);
    opacity: 0.7;
  }
`;

const geometricPulse = keyframes`
  0%, 100% { 
    stroke-dashoffset: 0;
    opacity: 0.6;
  }
  50% { 
    stroke-dashoffset: -20;
    opacity: 1;
  }
`;

const artDecoFlow = keyframes`
  0% { 
    background-position: 0% 0%;
    filter: hue-rotate(0deg);
  }
  50% { 
    background-position: 100% 100%;
    filter: hue-rotate(30deg);
  }
  100% { 
    background-position: 0% 0%;
    filter: hue-rotate(0deg);
  }
`;

const OrnamentalFrame = () => {
  return (
    <div css={styles.frameContainer}>
      {/* Main outer frame */}
      <div css={styles.outerFrame}>
        {/* Corner ornaments */}
        <div css={[styles.cornerOrnament, styles.topLeft]}>
          <div css={styles.cornerSpiral}>
            <div css={styles.spiralCore} />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                css={styles.spiralArm}
                style={{ transform: `rotate(${i * 45}deg)` }}
              />
            ))}
          </div>
          <div css={styles.cornerGem} />
        </div>

        <div css={[styles.cornerOrnament, styles.topRight]}>
          <div css={styles.cornerSpiral}>
            <div css={styles.spiralCore} />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                css={styles.spiralArm}
                style={{ transform: `rotate(${i * 45}deg)` }}
              />
            ))}
          </div>
          <div css={styles.cornerGem} />
        </div>

        <div css={[styles.cornerOrnament, styles.bottomLeft]}>
          <div css={styles.cornerSpiral}>
            <div css={styles.spiralCore} />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                css={styles.spiralArm}
                style={{ transform: `rotate(${i * 45}deg)` }}
              />
            ))}
          </div>
          <div css={styles.cornerGem} />
        </div>

        <div css={[styles.cornerOrnament, styles.bottomRight]}>
          <div css={styles.cornerSpiral}>
            <div css={styles.spiralCore} />
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                css={styles.spiralArm}
                style={{ transform: `rotate(${i * 45}deg)` }}
              />
            ))}
          </div>
          <div css={styles.cornerGem} />
        </div>

        {/* Border decorations */}
        <div css={styles.borderDecorations}>
          {/* Top border */}
          <div css={[styles.borderLine, styles.topBorder]}>
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                css={styles.borderOrnament}
                style={{ 
                  left: `${(i + 1) * 8}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Right border */}
          <div css={[styles.borderLine, styles.rightBorder]}>
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                css={styles.borderOrnament}
                style={{ 
                  top: `${(i + 1) * 8}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Bottom border */}
          <div css={[styles.borderLine, styles.bottomBorder]}>
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                css={styles.borderOrnament}
                style={{ 
                  left: `${(i + 1) * 8}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Left border */}
          <div css={[styles.borderLine, styles.leftBorder]}>
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                css={styles.borderOrnament}
                style={{ 
                  top: `${(i + 1) * 8}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Art Deco geometric patterns */}
        <svg css={styles.geometricOverlay} viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Diamond patterns */}
          <defs>
            <pattern id="diamond-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <polygon 
                points="5,2 8,5 5,8 2,5" 
                fill="none" 
                stroke={colors.neonTeal}
                strokeWidth="0.5"
                opacity="0.6"
              />
            </pattern>
            
            <linearGradient id="frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.neonGold} stopOpacity="0.8" />
              <stop offset="50%" stopColor={colors.neonTeal} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors.neonGold} stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Main frame outline */}
          <rect 
            x="2" y="2" width="96" height="96" 
            fill="url(#diamond-pattern)" 
            stroke="url(#frame-gradient)" 
            strokeWidth="1"
            strokeDasharray="5,3"
            css={styles.animatedStroke}
          />

          {/* Art Deco chevron patterns */}
          <g css={styles.chevronGroup}>
            <polyline 
              points="20,10 25,5 30,10" 
              fill="none" 
              stroke={colors.neonGold} 
              strokeWidth="1"
              css={styles.animatedStroke}
            />
            <polyline 
              points="70,10 75,5 80,10" 
              fill="none" 
              stroke={colors.neonGold} 
              strokeWidth="1"
              css={styles.animatedStroke}
            />
            <polyline 
              points="20,90 25,95 30,90" 
              fill="none" 
              stroke={colors.neonGold} 
              strokeWidth="1"
              css={styles.animatedStroke}
            />
            <polyline 
              points="70,90 75,95 80,90" 
              fill="none" 
              stroke={colors.neonGold} 
              strokeWidth="1"
              css={styles.animatedStroke}
            />
          </g>

          {/* Central cross accent */}
          <g css={styles.centralCross}>
            <line 
              x1="50" y1="20" x2="50" y2="80" 
              stroke={colors.neonTeal} 
              strokeWidth="0.5" 
              opacity="0.4"
              css={styles.animatedStroke}
            />
            <line 
              x1="20" y1="50" x2="80" y2="50" 
              stroke={colors.neonTeal} 
              strokeWidth="0.5" 
              opacity="0.4"
              css={styles.animatedStroke}
            />
          </g>
        </svg>
      </div>

      {/* Inner decorative elements */}
      <div css={styles.innerDecorations}>
        {/* Floating ornamental particles */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            css={styles.floatingParticle}
            style={{
              left: `${10 + (i % 4) * 20}%`,
              top: `${10 + Math.floor(i / 4) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + (i % 3)}s`
            }}
          />
        ))}

        {/* Art Deco sunburst patterns */}
        <div css={styles.sunburstPatterns}>
          <div css={[styles.sunburst, styles.topLeftSunburst]}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                css={styles.sunburstRay}
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </div>

          <div css={[styles.sunburst, styles.topRightSunburst]}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                css={styles.sunburstRay}
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </div>

          <div css={[styles.sunburst, styles.bottomLeftSunburst]}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                css={styles.sunburstRay}
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </div>

          <div css={[styles.sunburst, styles.bottomRightSunburst]}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                css={styles.sunburstRay}
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rococo flourishes */}
      <div css={styles.rococoFlourishes}>
        <div css={[styles.flourish, styles.flourishTopLeft]} />
        <div css={[styles.flourish, styles.flourishTopRight]} />
        <div css={[styles.flourish, styles.flourishBottomLeft]} />
        <div css={[styles.flourish, styles.flourishBottomRight]} />
      </div>
    </div>
  );
};

const styles = {
  frameContainer: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  `,

  outerFrame: css`
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    border: 3px solid transparent;
    background: 
      linear-gradient(45deg, ${colors.neonGold}30, ${colors.neonTeal}20, ${colors.neonGold}30),
      linear-gradient(135deg, transparent 40%, ${colors.surface}10 50%, transparent 60%);
    background-clip: border-box;
    border-radius: 20px;
    animation: ${frameGlow} 8s ease-in-out infinite;
    
    &::before {
      content: '';
      position: absolute;
      inset: -3px;
      background: 
        linear-gradient(45deg, 
          ${colors.neonGold}80 0%, 
          ${colors.neonTeal}60 25%, 
          transparent 50%, 
          ${colors.neonTeal}60 75%, 
          ${colors.neonGold}80 100%);
      border-radius: 23px;
      z-index: -1;
      animation: ${artDecoFlow} 12s linear infinite;
    }
    
    @media (max-width: 768px) {
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border-radius: 15px;
      
      &::before {
        border-radius: 18px;
      }
    }
    
    @media (max-width: 480px) {
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border-radius: 10px;
      
      &::before {
        border-radius: 13px;
      }
    }
  `,

  cornerOrnament: css`
    position: absolute;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    @media (max-width: 768px) {
      width: 60px;
      height: 60px;
    }
    
    @media (max-width: 480px) {
      width: 40px;
      height: 40px;
    }
  `,

  topLeft: css`
    top: -40px;
    left: -40px;
    
    @media (max-width: 768px) {
      top: -30px;
      left: -30px;
    }
    
    @media (max-width: 480px) {
      top: -20px;
      left: -20px;
    }
  `,

  topRight: css`
    top: -40px;
    right: -40px;
    
    @media (max-width: 768px) {
      top: -30px;
      right: -30px;
    }
    
    @media (max-width: 480px) {
      top: -20px;
      right: -20px;
    }
  `,

  bottomLeft: css`
    bottom: -40px;
    left: -40px;
    
    @media (max-width: 768px) {
      bottom: -30px;
      left: -30px;
    }
    
    @media (max-width: 480px) {
      bottom: -20px;
      left: -20px;
    }
  `,

  bottomRight: css`
    bottom: -40px;
    right: -40px;
    
    @media (max-width: 768px) {
      bottom: -30px;
      right: -30px;
    }
    
    @media (max-width: 480px) {
      bottom: -20px;
      right: -20px;
    }
  `,

  cornerSpiral: css`
    position: relative;
    width: 60px;
    height: 60px;
    animation: ${cornerSpiral} 20s linear infinite;
    
    @media (max-width: 768px) {
      width: 45px;
      height: 45px;
    }
    
    @media (max-width: 480px) {
      width: 30px;
      height: 30px;
    }
  `,

  spiralCore: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: 
      radial-gradient(circle at center, ${colors.neonGold}90 0%, transparent 100%);
    border: 2px solid ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 
      0 0 20px ${colors.neonGold}60,
      inset 0 0 10px rgba(0, 0, 0, 0.3);
    
    @media (max-width: 768px) {
      width: 15px;
      height: 15px;
    }
    
    @media (max-width: 480px) {
      width: 10px;
      height: 10px;
    }
  `,

  spiralArm: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 25px;
    background: linear-gradient(180deg, ${colors.neonTeal}, transparent);
    border-radius: 2px;
    transform-origin: 50% 0%;
    margin-left: -1.5px;
    margin-top: -25px;
    box-shadow: 0 0 8px ${colors.neonTeal}40;
    
    @media (max-width: 768px) {
      height: 20px;
      margin-top: -20px;
    }
    
    @media (max-width: 480px) {
      width: 2px;
      height: 15px;
      margin-left: -1px;
      margin-top: -15px;
    }
  `,

  cornerGem: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: ${colors.neonTeal};
    border-radius: 50%;
    box-shadow: 
      0 0 15px ${colors.neonTeal}80,
      inset 0 0 5px rgba(255, 255, 255, 0.5);
    animation: ${ornamentFloat} 3s ease-in-out infinite;
    
    @media (max-width: 768px) {
      width: 6px;
      height: 6px;
    }
    
    @media (max-width: 480px) {
      width: 4px;
      height: 4px;
    }
  `,

  borderDecorations: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  borderLine: css`
    position: absolute;
  `,

  topBorder: css`
    top: -5px;
    left: 0;
    right: 0;
    height: 10px;
  `,

  rightBorder: css`
    top: 0;
    right: -5px;
    bottom: 0;
    width: 10px;
  `,

  bottomBorder: css`
    bottom: -5px;
    left: 0;
    right: 0;
    height: 10px;
  `,

  leftBorder: css`
    top: 0;
    left: -5px;
    bottom: 0;
    width: 10px;
  `,

  borderOrnament: css`
    position: absolute;
    width: 4px;
    height: 4px;
    background: ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 0 0 8px ${colors.neonGold}60;
    animation: ${ornamentFloat} 2s ease-in-out infinite;
    
    @media (max-width: 768px) {
      width: 3px;
      height: 3px;
    }
    
    @media (max-width: 480px) {
      width: 2px;
      height: 2px;
    }
  `,

  geometricOverlay: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.6;
  `,

  animatedStroke: css`
    stroke-dasharray: 10, 5;
    animation: ${geometricPulse} 4s ease-in-out infinite;
  `,

  chevronGroup: css`
    animation: ${ornamentFloat} 6s ease-in-out infinite;
  `,

  centralCross: css`
    animation: ${frameGlow} 10s ease-in-out infinite;
  `,

  innerDecorations: css`
    position: absolute;
    top: 40px;
    left: 40px;
    right: 40px;
    bottom: 40px;
    
    @media (max-width: 768px) {
      top: 30px;
      left: 30px;
      right: 30px;
      bottom: 30px;
    }
    
    @media (max-width: 480px) {
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
    }
  `,

  floatingParticle: css`
    position: absolute;
    width: 3px;
    height: 3px;
    background: ${colors.neonTeal}60;
    border-radius: 50%;
    box-shadow: 0 0 6px ${colors.neonTeal}80;
    animation: ${ornamentFloat} 4s ease-in-out infinite;
    
    @media (max-width: 480px) {
      width: 2px;
      height: 2px;
    }
  `,

  sunburstPatterns: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  sunburst: css`
    position: absolute;
    width: 60px;
    height: 60px;
    animation: ${cornerSpiral} 30s linear infinite;
    
    @media (max-width: 768px) {
      width: 45px;
      height: 45px;
    }
    
    @media (max-width: 480px) {
      width: 30px;
      height: 30px;
    }
  `,

  topLeftSunburst: css`
    top: 20px;
    left: 20px;
  `,

  topRightSunburst: css`
    top: 20px;
    right: 20px;
  `,

  bottomLeftSunburst: css`
    bottom: 20px;
    left: 20px;
  `,

  bottomRightSunburst: css`
    bottom: 20px;
    right: 20px;
  `,

  sunburstRay: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 15px;
    background: linear-gradient(180deg, ${colors.neonGold}60, transparent);
    border-radius: 1px;
    transform-origin: 50% 0%;
    margin-left: -0.5px;
    margin-top: -15px;
    
    @media (max-width: 768px) {
      height: 12px;
      margin-top: -12px;
    }
    
    @media (max-width: 480px) {
      height: 8px;
      margin-top: -8px;
    }
  `,

  rococoFlourishes: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  flourish: css`
    position: absolute;
    width: 40px;
    height: 40px;
    background: 
      radial-gradient(ellipse at center, ${colors.neonTeal}20 0%, transparent 70%);
    border: 1px solid ${colors.neonTeal}40;
    border-radius: 50% 30% 60% 40%;
    animation: ${ornamentFloat} 8s ease-in-out infinite;
    
    @media (max-width: 768px) {
      width: 30px;
      height: 30px;
    }
    
    @media (max-width: 480px) {
      width: 20px;
      height: 20px;
    }
  `,

  flourishTopLeft: css`
    top: 60px;
    left: 60px;
    animation-delay: 0s;
  `,

  flourishTopRight: css`
    top: 60px;
    right: 60px;
    animation-delay: 2s;
  `,

  flourishBottomLeft: css`
    bottom: 60px;
    left: 60px;
    animation-delay: 4s;
  `,

  flourishBottomRight: css`
    bottom: 60px;
    right: 60px;
    animation-delay: 6s;
  `
};

export default OrnamentalFrame;
