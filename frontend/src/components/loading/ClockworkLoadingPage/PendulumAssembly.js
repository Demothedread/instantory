/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { colors } from '../../../styles/theme/colors';

/**
 * PendulumAssembly - Swinging pendulum with Art Deco geometric patterns
 * Features hypnotic motion, ornate bob, and synchronized timing with gear system
 */
const PendulumAssembly = ({ isInitialized, animationPhase }) => {
  const [isSwinging, setIsSwinging] = useState(false);
  const [intensity, setIntensity] = useState(1);

  useEffect(() => {
    if (isInitialized && animationPhase >= 2) {
      setIsSwinging(true);
      
      // Increase pendulum intensity based on animation phase
      const newIntensity = Math.min(animationPhase * 0.5, 2);
      setIntensity(newIntensity);
    }
  }, [isInitialized, animationPhase]);

  return (
    <div css={[styles.container, isSwinging && styles.active]}>
      {/* Pendulum suspension system */}
      <div css={styles.suspension}>
        {/* Ornate mounting bracket */}
        <div css={styles.bracket}>
          <div css={styles.bracketOrnament}>
            {/* Art Deco geometric pattern */}
            <div css={styles.bracketPattern}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  css={styles.bracketLine}
                  style={{
                    width: `${20 - i * 3}px`,
                    height: '2px',
                    marginBottom: '2px',
                    opacity: 1 - (i * 0.15)
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pivot point with jeweled bearing */}
        <div css={styles.pivotPoint}>
          <div css={styles.pivotJewel} />
          <div css={styles.pivotRing} />
        </div>

        {/* Pendulum rod */}
        <div 
          css={[styles.pendulumRod, isSwinging && styles.swinging]}
          style={{
            animationDuration: `${2 / intensity}s`
          }}
        >
          {/* Rod segments for visual appeal */}
          <div css={styles.rodSegment} style={{ top: '20%' }} />
          <div css={styles.rodSegment} style={{ top: '40%' }} />
          <div css={styles.rodSegment} style={{ top: '60%' }} />
          <div css={styles.rodSegment} style={{ top: '80%' }} />

          {/* Pendulum bob */}
          <div css={styles.pendulumBob}>
            {/* Outer ornamental shell */}
            <div css={styles.bobShell}>
              {/* Art Deco sunburst pattern */}
              <div css={styles.bobSunburst}>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    css={styles.sunburstLine}
                    style={{
                      transform: `rotate(${i * 30}deg)`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>

              {/* Central medallion */}
              <div css={styles.bobMedallion}>
                <div css={styles.medallionRing} />
                <div css={styles.medallionCenter}>
                  <div css={styles.medallionJewel} />
                </div>
              </div>

              {/* Decorative chevrons */}
              <div css={styles.bobChevrons}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    css={styles.chevron}
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Inner weight core */}
            <div css={styles.bobCore}>
              <div css={styles.coreRings}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    css={styles.coreRing}
                    style={{
                      width: `${80 - i * 20}%`,
                      height: `${80 - i * 20}%`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Motion trail effect */}
            <div css={styles.motionTrail}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  css={styles.trailDot}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    left: `${-10 - i * 15}px`,
                    opacity: 0.8 - (i * 0.15)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pendulum shadow */}
      <div css={[styles.pendulumShadow, isSwinging && styles.shadowSwinging]}>
        <div css={styles.shadowBlur} />
      </div>

      {/* Energy emission effects */}
      {isSwinging && (
        <div css={styles.energyEffects}>
          {/* Kinetic energy waves */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              css={styles.energyWave}
              style={{
                animationDelay: `${i * 0.5}s`,
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`
              }}
            />
          ))}

          {/* Momentum particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              css={styles.momentumParticle}
              style={{
                animationDelay: `${i * 0.2}s`,
                left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 80}px`,
                top: `${200 + Math.sin(i * 45 * Math.PI / 180) * 80}px`
              }}
            />
          ))}
        </div>
      )}

      {/* Timing mechanism */}
      <div css={styles.timingMechanism}>
        <div css={styles.escapement}>
          <div css={styles.escapementWheel}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                css={styles.escapementTooth}
                style={{
                  transform: `rotate(${i * 45}deg)`
                }}
              />
            ))}
          </div>
          <div css={styles.escapementPallets}>
            <div css={styles.pallet} />
            <div css={styles.pallet} style={{ transform: 'rotate(180deg)' }} />
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
    width: 400px;
    height: 500px;
    opacity: 0;
    transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
    
    @media (max-width: 768px) {
      width: 320px;
      height: 400px;
    }
    
    @media (max-width: 480px) {
      width: 250px;
      height: 320px;
    }
  `,

  active: css`
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  `,

  suspension: css`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  bracket: css`
    position: relative;
    width: 60px;
    height: 40px;
    background: linear-gradient(
      135deg,
      ${colors.neonGold} 0%,
      #b8860b 50%,
      ${colors.neonGold} 100%
    );
    border-radius: 8px 8px 0 0;
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.6),
      inset 0 0 10px rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
  `,

  bracketOrnament: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 60%;
  `,

  bracketPattern: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  `,

  bracketLine: css`
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.8) 50%,
      transparent 100%
    );
    border-radius: 1px;
    box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
  `,

  pivotPoint: css`
    position: relative;
    width: 16px;
    height: 16px;
    margin-top: -8px;
    z-index: 5;
  `,

  pivotJewel: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.neonTeal};
    box-shadow: 
      0 0 15px rgba(0, 255, 255, 1),
      inset 0 0 5px rgba(255, 255, 255, 0.8);
    animation: pivotPulse 1.5s ease-in-out infinite;
    
    @keyframes pivotPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.3); }
    }
  `,

  pivotRing: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid ${colors.neonGold};
    box-shadow: 
      0 0 10px rgba(255, 215, 0, 0.6),
      inset 0 0 5px rgba(0, 0, 0, 0.3);
  `,

  pendulumRod: css`
    position: relative;
    width: 4px;
    height: 300px;
    background: linear-gradient(
      to bottom,
      ${colors.neonGold} 0%,
      #b8860b 50%,
      ${colors.neonGold} 100%
    );
    border-radius: 2px;
    box-shadow: 
      0 0 10px rgba(255, 215, 0, 0.4),
      inset 0 0 3px rgba(0, 0, 0, 0.5);
    transform-origin: top center;
    margin-top: 8px;
    
    @media (max-width: 768px) {
      height: 240px;
    }
    
    @media (max-width: 480px) {
      height: 180px;
    }
  `,

  swinging: css`
    animation: pendulumSwing ease-in-out infinite;
    
    @keyframes pendulumSwing {
      0% { transform: rotate(-15deg); }
      50% { transform: rotate(15deg); }
      100% { transform: rotate(-15deg); }
    }
  `,

  rodSegment: css`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1px;
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
  `,

  pendulumBob: css`
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    
    @media (max-width: 768px) {
      width: 64px;
      height: 64px;
    }
    
    @media (max-width: 480px) {
      width: 50px;
      height: 50px;
    }
  `,

  bobShell: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      ${colors.neonGold} 0%,
      #b8860b 30%,
      ${colors.neonGold} 60%,
      #8b6914 100%
    );
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.8),
      inset 0 0 20px rgba(0, 0, 0, 0.3),
      0 8px 16px rgba(0, 0, 0, 0.4);
    border: 3px solid rgba(255, 255, 255, 0.2);
  `,

  bobSunburst: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  `,

  sunburstLine: css`
    position: absolute;
    top: 10%;
    left: 50%;
    width: 1px;
    height: 30%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255, 255, 255, 0.8) 50%,
      transparent 100%
    );
    transform-origin: bottom center;
    animation: sunburstShimmer 3s ease-in-out infinite;
    
    @keyframes sunburstShimmer {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `,

  bobMedallion: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
    height: 50%;
    border-radius: 50%;
  `,

  medallionRing: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid ${colors.neonTeal};
    box-shadow: 
      0 0 15px rgba(0, 255, 255, 0.6),
      inset 0 0 10px rgba(0, 255, 255, 0.2);
    animation: medallionGlow 2s ease-in-out infinite alternate;
    
    @keyframes medallionGlow {
      from { box-shadow: 0 0 15px rgba(0, 255, 255, 0.6), inset 0 0 10px rgba(0, 255, 255, 0.2); }
      to { box-shadow: 0 0 25px rgba(0, 255, 255, 0.8), inset 0 0 15px rgba(0, 255, 255, 0.4); }
    }
  `,

  medallionCenter: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      ${colors.neonTeal} 0%,
      #40e0d0 50%,
      ${colors.neonTeal} 100%
    );
  `,

  medallionJewel: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30%;
    height: 30%;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 
      0 0 8px #ffffff,
      inset 0 0 4px rgba(0, 0, 0, 0.3);
    animation: jewelSparkle 1s ease-in-out infinite alternate;
    
    @keyframes jewelSparkle {
      from { opacity: 0.8; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    }
  `,

  bobChevrons: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  `,

  chevron: css`
    position: absolute;
    top: 15%;
    left: 50%;
    width: 2px;
    height: 20%;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    transform-origin: bottom center;
    animation: chevronPulse 4s ease-in-out infinite;
    
    @keyframes chevronPulse {
      0%, 100% { opacity: 0.2; }
      25%, 75% { opacity: 0.8; }
      50% { opacity: 0.4; }
    }
  `,

  bobCore: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    height: 70%;
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
  `,

  coreRings: css`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  `,

  coreRing: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: coreRingPulse 3s ease-in-out infinite;
    
    @keyframes coreRingPulse {
      0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); }
      50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
    }
  `,

  motionTrail: css`
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    width: 100px;
    height: 10px;
    pointer-events: none;
  `,

  trailDot: css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${colors.neonGold};
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    animation: trailFade 2s ease-out infinite;
    
    @keyframes trailFade {
      0% { opacity: 0.8; transform: translateY(-50%) scale(1); }
      100% { opacity: 0; transform: translateY(-50%) scale(0.5); }
    }
  `,

  pendulumShadow: css`
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 20px;
    opacity: 0;
    transition: opacity 1s ease;
  `,

  shadowSwinging: css`
    opacity: 0.3;
    animation: shadowMove ease-in-out infinite;
    animation-duration: inherit;
    
    @keyframes shadowMove {
      0% { transform: translateX(-50%) skewX(-15deg); }
      50% { transform: translateX(-50%) skewX(15deg); }
      100% { transform: translateX(-50%) skewX(-15deg); }
    }
  `,

  shadowBlur: css`
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0.4) 0%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(8px);
  `,

  energyEffects: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    pointer-events: none;
  `,

  energyWave: css`
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid rgba(0, 255, 255, 0.3);
    animation: energyWaveExpand 3s ease-out infinite;
    
    @keyframes energyWaveExpand {
      0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.5); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
    }
  `,

  momentumParticle: css`
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: ${colors.neonTeal};
    box-shadow: 0 0 6px rgba(0, 255, 255, 0.8);
    animation: particleFloat 4s ease-in-out infinite;
    
    @keyframes particleFloat {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      25%, 75% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.2); }
    }
  `,

  timingMechanism: css`
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    opacity: 0.7;
    
    @media (max-width: 768px) {
      width: 32px;
      height: 32px;
    }
  `,

  escapement: css`
    position: relative;
    width: 100%;
    height: 100%;
  `,

  escapementWheel: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid rgba(255, 215, 0, 0.4);
    animation: escapementTick 0.5s steps(8) infinite;
    
    @keyframes escapementTick {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(45deg); }
    }
  `,

  escapementTooth: css`
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 6px;
    background: ${colors.neonGold};
    transform-origin: bottom center;
    margin-left: -0.5px;
  `,

  escapementPallets: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
  `,

  pallet: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 30%;
    background: ${colors.neonTeal};
    transform-origin: bottom center;
    margin-left: -1px;
    margin-top: -15%;
    animation: palletRock 1s ease-in-out infinite alternate;
    
    @keyframes palletRock {
      from { transform: rotate(-10deg); }
      to { transform: rotate(10deg); }
    }
  `
};

export default PendulumAssembly;
