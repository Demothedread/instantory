/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { colors } from '../../../styles/theme/colors';

/**
 * CuckooMechanism - Emerging bird element with neon burst effects
 * Features periodic appearances, sound wave visualizations, and ornate housing
 */
const CuckooMechanism = ({ isInitialized, animationPhase }) => {
  const [isActive, setIsActive] = useState(false);
  const [isCuckooOut, setIsCuckooOut] = useState(false);
  const [chimeCount, setChimeCount] = useState(0);

  useEffect(() => {
    if (isInitialized && animationPhase >= 3) {
      setIsActive(true);
      
      // Cuckoo emergence cycle
      const cuckooInterval = setInterval(() => {
        setIsCuckooOut(true);
        setChimeCount(prev => prev + 1);
        
        // Retract after 2 seconds
        setTimeout(() => {
          setIsCuckooOut(false);
        }, 2000);
      }, 6000);

      return () => clearInterval(cuckooInterval);
    }
  }, [isInitialized, animationPhase]);

  return (
    <div css={[styles.container, isActive && styles.active]}>
      {/* Cuckoo house structure */}
      <div css={styles.cuckooHouse}>
        {/* Ornate roof */}
        <div css={styles.roof}>
          <div css={styles.roofTiles}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                css={styles.roofTile}
                style={{
                  left: `${i * 12}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
          <div css={styles.roofPeak}>
            <div css={styles.peakOrnament} />
          </div>
        </div>

        {/* House facade */}
        <div css={styles.houseFacade}>
          {/* Decorative columns */}
          <div css={styles.columns}>
            <div css={styles.column} style={{ left: '10%' }} />
            <div css={styles.column} style={{ right: '10%' }} />
          </div>

          {/* Central door mechanism */}
          <div css={styles.doorFrame}>
            <div css={styles.doorOrnament}>
              {/* Art Deco door pattern */}
              <div css={styles.doorPattern}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    css={styles.doorLine}
                    style={{
                      width: `${60 + i * 8}%`,
                      opacity: 1 - (i * 0.15),
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Door panels */}
            <div css={styles.doorPanels}>
              <div 
                css={[styles.doorPanel, styles.leftPanel, isCuckooOut && styles.panelOpen]}
              />
              <div 
                css={[styles.doorPanel, styles.rightPanel, isCuckooOut && styles.panelOpen]}
              />
            </div>

            {/* Door threshold */}
            <div css={styles.doorThreshold} />
          </div>
        </div>

        {/* Cuckoo bird */}
        <div css={[styles.cuckooContainer, isCuckooOut && styles.cuckooEmerged]}>
          <div css={styles.cuckooBird}>
            {/* Bird body */}
            <div css={styles.birdBody}>
              <div css={styles.bodyGradient} />
              <div css={styles.bodyHighlight} />
            </div>

            {/* Bird head */}
            <div css={styles.birdHead}>
              <div css={styles.headCrest}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    css={styles.crestFeather}
                    style={{
                      transform: `rotate(${(i - 1) * 15}deg)`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <div css={styles.birdEye} />
              <div css={styles.birdBeak} />
            </div>

            {/* Bird wings */}
            <div css={styles.birdWings}>
              <div css={[styles.wing, styles.leftWing]} />
              <div css={[styles.wing, styles.rightWing]} />
            </div>

            {/* Bird tail */}
            <div css={styles.birdTail}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  css={styles.tailFeather}
                  style={{
                    transform: `rotate(${(i - 2) * 8}deg)`,
                    zIndex: 5 - i,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Sound wave effects */}
          {isCuckooOut && (
            <div css={styles.soundWaves}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  css={styles.soundWave}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    width: `${40 + i * 20}px`,
                    height: `${40 + i * 20}px`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mechanism gears visible through windows */}
        <div css={styles.mechanismWindows}>
          <div css={styles.window} style={{ left: '15%', top: '60%' }}>
            <div css={styles.windowGear}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  css={styles.windowGearTooth}
                  style={{ transform: `rotate(${i * 45}deg)` }}
                />
              ))}
            </div>
          </div>
          <div css={styles.window} style={{ right: '15%', top: '60%' }}>
            <div css={styles.windowGear}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  css={styles.windowGearTooth}
                  style={{ transform: `rotate(${i * 60}deg)` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chime visualization */}
      {isCuckooOut && (
        <div css={styles.chimeEffects}>
          {/* Musical notes */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`note-${chimeCount}-${i}`}
              css={styles.musicalNote}
              style={{
                left: `${50 + (i - 1) * 30}%`,
                animationDelay: `${i * 0.3}s`
              }}
            >
              ♪
            </div>
          ))}

          {/* Energy burst */}
          <div css={styles.energyBurst}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                css={styles.burstRay}
                style={{
                  transform: `rotate(${i * 30}deg)`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>

          {/* Ripple effects */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              css={styles.rippleEffect}
              style={{
                animationDelay: `${i * 0.5}s`,
                width: `${150 + i * 100}px`,
                height: `${150 + i * 100}px`
              }}
            />
          ))}
        </div>
      )}

      {/* Clockwork springs and mechanisms */}
      <div css={styles.clockworkDetails}>
        <div css={styles.springMechanism}>
          <div css={styles.spring}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                css={styles.springCoil}
                style={{
                  top: `${i * 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        <div css={styles.leverMechanism}>
          <div css={styles.lever} />
          <div css={styles.leverPivot} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) scale(0);
    width: 180px;
    height: 140px;
    opacity: 0;
    transition: all 2.5s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 4;
    
    @media (max-width: 768px) {
      width: 144px;
      height: 112px;
    }
    
    @media (max-width: 480px) {
      width: 120px;
      height: 96px;
    }
  `,

  active: css`
    transform: translateX(-50%) scale(1);
    opacity: 1;
  `,

  cuckooHouse: css`
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #2c1810 0%,
      #4a2c18 50%,
      #2c1810 100%
    );
    border-radius: 8px 8px 4px 4px;
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.3),
      inset 0 0 15px rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 215, 0, 0.4);
  `,

  roof: css`
    position: absolute;
    top: -20px;
    left: -10px;
    width: calc(100% + 20px);
    height: 30px;
    background: linear-gradient(
      135deg,
      #8b4513 0%,
      #a0522d 50%,
      #8b4513 100%
    );
    border-radius: 15px 15px 0 0;
    box-shadow: 
      0 0 15px rgba(139, 69, 19, 0.6),
      inset 0 0 10px rgba(0, 0, 0, 0.3);
  `,

  roofTiles: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 15px 15px 0 0;
  `,

  roofTile: css`
    position: absolute;
    top: 2px;
    width: 12%;
    height: 4px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    border-radius: 2px;
    animation: tileShimmer 4s ease-in-out infinite;
    
    @keyframes tileShimmer {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
  `,

  roofPeak: css`
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 12px;
    background: ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 
      0 0 15px rgba(255, 215, 0, 0.8),
      inset 0 0 5px rgba(0, 0, 0, 0.3);
  `,

  peakOrnament: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${colors.neonTeal};
    box-shadow: 
      0 0 10px rgba(0, 255, 255, 1),
      inset 0 0 3px rgba(255, 255, 255, 0.8);
    animation: ornamentPulse 2s ease-in-out infinite;
    
    @keyframes ornamentPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.3); }
    }
  `,

  houseFacade: css`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px 8px 4px 4px;
  `,

  columns: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,

  column: css`
    position: absolute;
    top: 20%;
    width: 8px;
    height: 60%;
    background: linear-gradient(
      to bottom,
      ${colors.neonGold} 0%,
      #b8860b 50%,
      ${colors.neonGold} 100%
    );
    border-radius: 4px;
    box-shadow: 
      0 0 10px rgba(255, 215, 0, 0.4),
      inset 0 0 5px rgba(0, 0, 0, 0.3);
    
    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -2px;
      width: 12px;
      height: 8px;
      background: ${colors.neonGold};
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: -2px;
      width: 12px;
      height: 8px;
      background: ${colors.neonGold};
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    }
  `,

  doorFrame: css`
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    background: linear-gradient(
      135deg,
      #1a1a2e 0%,
      #16213e 50%,
      #0f3460 100%
    );
    border-radius: 50% 50% 0 0;
    border: 2px solid ${colors.neonTeal};
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.4),
      inset 0 0 15px rgba(0, 0, 0, 0.6);
  `,

  doorOrnament: css`
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 40%;
  `,

  doorPattern: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    height: 100%;
  `,

  doorLine: css`
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${colors.neonTeal} 50%,
      transparent 100%
    );
    border-radius: 1px;
    box-shadow: 0 0 3px rgba(0, 255, 255, 0.6);
    animation: doorLineGlow 3s ease-in-out infinite;
    
    @keyframes doorLineGlow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
  `,

  doorPanels: css`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
    overflow: hidden;
    border-radius: 0 0 30px 30px;
  `,

  doorPanel: css`
    position: absolute;
    bottom: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #2c1810 0%,
      #4a2c18 50%,
      #2c1810 100%
    );
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  `,

  leftPanel: css`
    left: 0;
    border-radius: 0 0 0 30px;
    transform-origin: left center;
  `,

  rightPanel: css`
    right: 0;
    border-radius: 0 0 30px 0;
    transform-origin: right center;
  `,

  panelOpen: css`
    &:first-of-type {
      transform: rotateY(-120deg);
    }
    &:last-of-type {
      transform: rotateY(120deg);
    }
  `,

  doorThreshold: css`
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    height: 4px;
    background: ${colors.neonGold};
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  `,

  cuckooContainer: css`
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%) translateZ(-50px);
    width: 40px;
    height: 30px;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  `,

  cuckooEmerged: css`
    transform: translate(-50%, -50%) translateZ(20px);
  `,

  cuckooBird: css`
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  `,

  birdBody: css`
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translateX(-50%);
    width: 25px;
    height: 18px;
    border-radius: 50% 50% 40% 40%;
    background: linear-gradient(
      135deg,
      ${colors.neonPurple} 0%,
      #8a2be2 50%,
      ${colors.neonPurple} 100%
    );
    box-shadow: 
      0 0 15px rgba(191, 0, 255, 0.6),
      inset 0 0 8px rgba(255, 255, 255, 0.2);
  `,

  bodyGradient: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 30%,
      transparent 60%
    );
  `,

  bodyHighlight: css`
    position: absolute;
    top: 20%;
    left: 20%;
    width: 30%;
    height: 30%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    filter: blur(2px);
    animation: bodyShimmer 2s ease-in-out infinite;
    
    @keyframes bodyShimmer {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
  `,

  birdHead: css`
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 15px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      ${colors.neonGreen} 0%,
      #32cd32 50%,
      ${colors.neonGreen} 100%
    );
    box-shadow: 
      0 0 12px rgba(57, 255, 20, 0.6),
      inset 0 0 6px rgba(255, 255, 255, 0.2);
  `,

  headCrest: css`
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 12px;
  `,

  crestFeather: css`
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 8px;
    background: ${colors.neonRed};
    border-radius: 1px;
    transform-origin: bottom center;
    margin-left: -1px;
    box-shadow: 0 0 4px rgba(255, 7, 58, 0.8);
    animation: featherSway 1.5s ease-in-out infinite;
    
    @keyframes featherSway {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      75% { transform: rotate(-5deg); }
    }
  `,

  birdEye: css`
    position: absolute;
    top: 30%;
    left: 60%;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #000000;
    border: 1px solid #ffffff;
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
    animation: eyeBlink 3s ease-in-out infinite;
    
    @keyframes eyeBlink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
  `,

  birdBeak: css`
    position: absolute;
    top: 50%;
    left: 80%;
    width: 8px;
    height: 3px;
    background: ${colors.neonGold};
    border-radius: 0 50% 50% 0;
    box-shadow: 0 0 6px rgba(255, 215, 0, 0.8);
    transform-origin: left center;
    animation: beakOpen 6s ease-in-out infinite;
    
    @keyframes beakOpen {
      0%, 80%, 100% { transform: rotateZ(0deg); }
      85%, 95% { transform: rotateZ(15deg); }
    }
  `,

  birdWings: css`
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 60%;
  `,

  wing: css`
    position: absolute;
    top: 0;
    width: 15px;
    height: 12px;
    background: linear-gradient(
      45deg,
      ${colors.neonBlue} 0%,
      #1e90ff 50%,
      ${colors.neonBlue} 100%
    );
    border-radius: 50% 0 80% 20%;
    box-shadow: 0 0 8px rgba(0, 162, 255, 0.6);
    animation: wingFlap 0.5s ease-in-out infinite alternate;
    
    @keyframes wingFlap {
      from { transform: rotateZ(0deg); }
      to { transform: rotateZ(-15deg); }
    }
  `,

  leftWing: css`
    left: 5px;
    transform-origin: right center;
  `,

  rightWing: css`
    right: 5px;
    transform: scaleX(-1);
    transform-origin: left center;
  `,

  birdTail: css`
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 40%;
  `,

  tailFeather: css`
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 3px;
    height: 12px;
    background: linear-gradient(
      to top,
      ${colors.neonPink} 0%,
      #ff1493 50%,
      ${colors.neonPink} 100%
    );
    border-radius: 1px;
    transform-origin: bottom center;
    margin-left: -1.5px;
    box-shadow: 0 0 5px rgba(255, 20, 147, 0.6);
    animation: tailSway 2s ease-in-out infinite;
    
    @keyframes tailSway {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(10deg); }
      75% { transform: rotate(-10deg); }
    }
  `,

  soundWaves: css`
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    width: 100px;
    height: 100px;
    pointer-events: none;
  `,

  soundWave: css`
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    border-radius: 50%;
    border: 2px solid ${colors.neonTeal};
    animation: soundWaveExpand 2s ease-out infinite;
    
    @keyframes soundWaveExpand {
      0% { opacity: 0.8; transform: translateY(-50%) scale(0.2); }
      100% { opacity: 0; transform: translateY(-50%) scale(2); }
    }
  `,

  mechanismWindows: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,

  window: css`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 215, 0, 0.4);
    box-shadow: 
      inset 0 0 8px rgba(0, 0, 0, 0.8),
      0 0 5px rgba(255, 215, 0, 0.3);
    overflow: hidden;
  `,

  windowGear: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: 1px solid rgba(255, 215, 0, 0.6);
    animation: windowGearRotate 3s linear infinite;
    
    @keyframes windowGearRotate {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `,

  windowGearTooth: css`
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 4px;
    background: rgba(255, 215, 0, 0.8);
    transform-origin: bottom center;
    margin-left: -0.5px;
  `,

  chimeEffects: css`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    pointer-events: none;
    z-index: 15;
  `,

  musicalNote: css`
    position: absolute;
    top: 80%;
    font-size: 20px;
    color: ${colors.neonGold};
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
    animation: noteFloat 3s ease-out forwards;
    
    @keyframes noteFloat {
      0% { 
        opacity: 0; 
        transform: translateY(0) scale(0.5); 
      }
      20% { 
        opacity: 1; 
        transform: translateY(-20px) scale(1); 
      }
      100% { 
        opacity: 0; 
        transform: translateY(-80px) scale(1.2); 
      }
    }
  `,

  energyBurst: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    animation: burstPulse 2s ease-out;
    
    @keyframes burstPulse {
      0% { transform: translate(-50%, -50%) scale(0); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
      100% { transform: translate(-50%, -50%) scale(0); }
    }
  `,

  burstRay: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 40px;
    background: linear-gradient(
      to top,
      transparent 0%,
      ${colors.neonTeal} 50%,
      transparent 100%
    );
    transform-origin: bottom center;
    margin-left: -1.5px;
    margin-top: -40px;
    animation: rayFlash 0.5s ease-out;
    
    @keyframes rayFlash {
      0% { opacity: 0; transform: scaleY(0); }
      50% { opacity: 1; transform: scaleY(1.5); }
      100% { opacity: 0; transform: scaleY(0); }
    }
  `,

  rippleEffect: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid rgba(0, 255, 255, 0.4);
    animation: rippleExpand 3s ease-out;
    
    @keyframes rippleExpand {
      0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
    }
  `,

  clockworkDetails: css`
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: 30px;
    height: 30px;
    opacity: 0.6;
  `,

  springMechanism: css`
    position: relative;
    width: 100%;
    height: 100%;
  `,

  spring: css`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 100%;
  `,

  springCoil: css`
    position: absolute;
    left: 0;
    width: 100%;
    height: 3px;
    border: 1px solid rgba(255, 215, 0, 0.4);
    border-radius: 50%;
    animation: springCompress 2s ease-in-out infinite;
    
    @keyframes springCompress {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.7); }
    }
  `,

  leverMechanism: css`
    position: absolute;
    bottom: 5px;
    right: 10px;
    width: 20px;
    height: 10px;
  `,

  lever: css`
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(255, 215, 0, 0.6);
    transform-origin: left center;
    animation: leverRock 1.5s ease-in-out infinite;
    
    @keyframes leverRock {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(15deg); }
    }
  `,

  leverPivot: css`
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${colors.neonTeal};
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
  `
};

export default CuckooMechanism;
