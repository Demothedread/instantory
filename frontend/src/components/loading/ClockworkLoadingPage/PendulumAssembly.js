/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { colors } from '../../../styles/theme/colors';

/**
 * PendulumAssembly - Elegant swinging pendulum with Neo-Deco-Rococo styling
 * Features realistic physics-based swinging motion and ornamental details
 */

// Pendulum swinging animation with realistic physics
const pendulumSwing = keyframes`
  0%, 100% { 
    transform: rotate(-15deg);
  }
  50% { 
    transform: rotate(15deg);
  }
`;

const pendulumBobGlow = keyframes`
  0%, 100% { 
    box-shadow: 
      0 0 20px ${colors.neonGold}60,
      0 0 40px ${colors.neonGold}30,
      inset 0 0 15px rgba(255, 215, 0, 0.2);
  }
  50% { 
    box-shadow: 
      0 0 30px ${colors.neonGold}80,
      0 0 60px ${colors.neonTeal}40,
      inset 0 0 25px rgba(0, 255, 255, 0.3);
  }
`;

const anchorPulse = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 10px ${colors.neonTeal}40);
    transform: scale(1);
  }
  50% { 
    filter: drop-shadow(0 0 20px ${colors.neonTeal}80) drop-shadow(0 0 30px ${colors.neonGold}40);
    transform: scale(1.05);
  }
`;

const ornamentFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-3px) rotate(2deg);
    opacity: 1;
  }
`;

const PendulumAssembly = ({ isInitialized, animationPhase }) => {
  return (
    <div css={styles.pendulumContainer}>
      {/* Anchor point and mechanism */}
      <div css={styles.anchorAssembly}>
        <div css={styles.anchorMount}>
          <div css={styles.anchorBearing} />
          <div css={styles.anchorOrnament} />
        </div>
        
        {/* Decorative anchor elements */}
        <div css={styles.anchorDecorations}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              css={styles.anchorSpike}
              style={{ transform: `rotate(${i * 60}deg)` }}
            />
          ))}
        </div>
      </div>

      {/* Pendulum rod and bob */}
      <div css={styles.pendulumRod}>
        {/* Main pendulum rod */}
        <div css={styles.rodBody} />
        
        {/* Decorative segments along the rod */}
        <div css={styles.rodSegments}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              css={styles.rodSegment}
              style={{ top: `${30 + i * 20}%` }}
            />
          ))}
        </div>

        {/* Pendulum bob (weight) */}
        <div css={styles.pendulumBob}>
          <div css={styles.bobCore}>
            <div css={styles.bobCenter} />
            
            {/* Ornamental details on the bob */}
            <div css={styles.bobOrnaments}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  css={styles.bobOrnament}
                  style={{ transform: `rotate(${i * 45}deg)` }}
                />
              ))}
            </div>
          </div>
          
          {/* Weight indicator gems */}
          <div css={styles.bobGems}>
            <div css={[styles.bobGem, styles.topGem]} />
            <div css={[styles.bobGem, styles.bottomGem]} />
          </div>
        </div>

        {/* Motion trail effect */}
        <div css={styles.motionTrail}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              css={styles.trailPoint}
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: 1 - i * 0.2
              }}
            />
          ))}
        </div>
      </div>

      {/* Suspension cables */}
      <div css={styles.suspensionCables}>
        <div css={[styles.cable, styles.mainCable]} />
        <div css={[styles.cable, styles.supportCable1]} />
        <div css={[styles.cable, styles.supportCable2]} />
      </div>

      {/* Energy emanations */}
      <div css={styles.energyField}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            css={styles.energyRing}
            style={{
              animationDelay: `${i * 0.5}s`,
              width: `${80 + i * 20}px`,
              height: `${80 + i * 20}px`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  pendulumContainer: css`
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 400px;
    pointer-events: none;
    z-index: 4;
    
    @media (max-width: 768px) {
      width: 160px;
      height: 320px;
    }
    
    @media (max-width: 480px) {
      width: 120px;
      height: 240px;
    }
  `,

  anchorAssembly: css`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    z-index: 10;
  `,

  anchorMount: css`
    position: relative;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at center, ${colors.neonGold}90 0%, ${colors.surface}60 100%);
    border: 3px solid ${colors.neonTeal};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 0 25px ${colors.neonTeal}50,
      inset 0 0 20px rgba(0, 0, 0, 0.3);
    animation: ${anchorPulse} 4s ease-in-out infinite;
  `,

  anchorBearing: css`
    width: 20px;
    height: 20px;
    background: ${colors.background};
    border: 2px solid ${colors.borderLight};
    border-radius: 50%;
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.5);
  `,

  anchorOrnament: css`
    position: absolute;
    width: 40px;
    height: 40px;
    border: 2px solid ${colors.neonGold}60;
    border-radius: 50%;
    animation: ${ornamentFloat} 3s ease-in-out infinite;
  `,

  anchorDecorations: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  anchorSpike: css`
    position: absolute;
    top: -5px;
    left: 50%;
    width: 3px;
    height: 15px;
    background: linear-gradient(180deg, ${colors.neonTeal}, ${colors.neonGold});
    border-radius: 2px;
    transform-origin: 50% 35px;
    animation: ${anchorPulse} 3s ease-in-out infinite;
  `,

  pendulumRod: css`
    position: absolute;
    top: 30px;
    left: 50%;
    width: 6px;
    height: 300px;
    transform-origin: 50% 0%;
    animation: ${pendulumSwing} 3s ease-in-out infinite;
    z-index: 5;
    
    @media (max-width: 768px) {
      height: 240px;
    }
    
    @media (max-width: 480px) {
      height: 180px;
      width: 4px;
    }
  `,

  rodBody: css`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 80%;
    background: linear-gradient(180deg, 
      ${colors.neonTeal}90 0%,
      ${colors.surface}80 50%,
      ${colors.neonGold}90 100%);
    border-radius: 3px;
    box-shadow: 
      0 0 15px ${colors.neonTeal}40,
      inset 0 0 5px rgba(255, 255, 255, 0.2);
  `,

  rodSegments: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  rodSegment: css`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 3px;
    background: ${colors.neonGold};
    border-radius: 2px;
    box-shadow: 0 0 8px ${colors.neonGold}60;
    animation: ${ornamentFloat} 2s ease-in-out infinite;
  `,

  pendulumBob: css`
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 50px;
    z-index: 8;
    
    @media (max-width: 768px) {
      width: 40px;
      height: 40px;
    }
    
    @media (max-width: 480px) {
      width: 30px;
      height: 30px;
    }
  `,

  bobCore: css`
    position: relative;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 30% 30%, ${colors.neonGold}95 0%, transparent 70%),
      radial-gradient(circle at center, ${colors.surface}90 0%, ${colors.background}70 100%);
    border: 2px solid ${colors.neonGold};
    border-radius: 50%;
    animation: ${pendulumBobGlow} 2s ease-in-out infinite;
  `,

  bobCenter: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    background: 
      radial-gradient(circle at center, ${colors.neonTeal}80 0%, transparent 100%);
    border: 1px solid ${colors.neonTeal};
    border-radius: 50%;
    box-shadow: 
      0 0 15px ${colors.neonTeal}60,
      inset 0 0 10px rgba(0, 0, 0, 0.3);
  `,

  bobOrnaments: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  bobOrnament: css`
    position: absolute;
    top: 5px;
    left: 50%;
    width: 2px;
    height: 8px;
    background: ${colors.neonTeal};
    border-radius: 1px;
    transform-origin: 50% 20px;
    box-shadow: 0 0 5px ${colors.neonTeal}60;
    animation: ${ornamentFloat} 1.5s ease-in-out infinite;
  `,

  bobGems: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  bobGem: css`
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: ${pendulumBobGlow} 1.8s ease-in-out infinite;
  `,

  topGem: css`
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors.neonTeal};
    box-shadow: 0 0 10px ${colors.neonTeal};
  `,

  bottomGem: css`
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors.neonGold};
    box-shadow: 0 0 10px ${colors.neonGold};
  `,

  motionTrail: css`
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 20px;
    pointer-events: none;
  `,

  trailPoint: css`
    position: absolute;
    width: 3px;
    height: 3px;
    background: ${colors.neonGold}80;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    animation: ${pendulumSwing} 3s ease-in-out infinite;
    box-shadow: 0 0 8px ${colors.neonGold};
  `,

  suspensionCables: css`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
  `,

  cable: css`
    position: absolute;
    background: linear-gradient(180deg, ${colors.borderLight}, ${colors.neonTeal}40);
    border-radius: 1px;
    opacity: 0.7;
  `,

  mainCable: css`
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 80%;
  `,

  supportCable1: css`
    top: 30px;
    left: 45%;
    width: 1px;
    height: 60%;
    transform: rotate(5deg);
  `,

  supportCable2: css`
    top: 30px;
    right: 45%;
    width: 1px;
    height: 60%;
    transform: rotate(-5deg);
  `,

  energyField: css`
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 50px;
    z-index: 1;
  `,

  energyRing: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid ${colors.neonTeal}30;
    border-radius: 50%;
    animation: ${anchorPulse} 4s ease-in-out infinite;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      height: 90%;
      border: 1px solid ${colors.neonGold}20;
      border-radius: 50%;
      animation: ${ornamentFloat} 3s ease-in-out infinite reverse;
    }
  `
};

export default PendulumAssembly;
