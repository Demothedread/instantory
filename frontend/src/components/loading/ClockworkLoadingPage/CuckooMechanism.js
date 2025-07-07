/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { colors } from '../../../styles/theme/colors';

/**
 * CuckooMechanism - Whimsical cuckoo bird that emerges during loading milestones
 * Features Art Deco bird design with Rococo ornamental details
 */

// Cuckoo door animations
const doorOpen = keyframes`
  0% { 
    transform: rotateY(0deg);
    opacity: 0.9;
  }
  100% { 
    transform: rotateY(-90deg);
    opacity: 0.3;
  }
`;

const doorClose = keyframes`
  0% { 
    transform: rotateY(-90deg);
    opacity: 0.3;
  }
  100% { 
    transform: rotateY(0deg);
    opacity: 0.9;
  }
`;

// Cuckoo bird emergence
const birdEmerge = keyframes`
  0% { 
    transform: translateX(-100%) scale(0.8);
    opacity: 0;
  }
  20% { 
    transform: translateX(-50%) scale(0.9);
    opacity: 0.7;
  }
  80% { 
    transform: translateX(0%) scale(1);
    opacity: 1;
  }
  100% { 
    transform: translateX(0%) scale(1);
    opacity: 1;
  }
`;

const birdRetreat = keyframes`
  0% { 
    transform: translateX(0%) scale(1);
    opacity: 1;
  }
  100% { 
    transform: translateX(-100%) scale(0.8);
    opacity: 0;
  }
`;

// Bird bobbing animation
const birdBob = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
  }
  25% { 
    transform: translateY(-3px) rotate(2deg);
  }
  75% { 
    transform: translateY(3px) rotate(-2deg);
  }
`;

// Wing flap animation
const wingFlap = keyframes`
  0%, 100% { 
    transform: rotateZ(0deg);
  }
  50% { 
    transform: rotateZ(-15deg);
  }
`;

// Door hinge glow
const hingeGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 8px ${colors.neonTeal}40;
  }
  50% { 
    box-shadow: 0 0 15px ${colors.neonTeal}80, 0 0 25px ${colors.neonGold}40;
  }
`;

const CuckooMechanism = ({ isInitialized, animationPhase }) => {
  // Determine if cuckoo should be active based on animation phase
  const isActive = animationPhase >= 2;
  const shouldEmerge = animationPhase === 2 || animationPhase === 4;

  return (
    <div css={styles.cuckooContainer}>
      {/* Cuckoo house structure */}
      <div css={styles.cuckooHouse}>
        {/* House body */}
        <div css={styles.houseBody}>
          {/* Roof */}
          <div css={styles.houseRoof}>
            <div css={styles.roofOrnament} />
            <div css={styles.roofLines}>
              {[...Array(5)].map((_, i) => (
                <div key={i} css={styles.roofLine} />
              ))}
            </div>
          </div>

          {/* Door frame */}
          <div css={styles.doorFrame}>
            {/* Door hinges */}
            <div css={styles.doorHinges}>
              <div css={styles.doorHinge} />
              <div css={styles.doorHinge} />
            </div>

            {/* Cuckoo door */}
            <div 
              css={[
                styles.cuckooDooor,
                shouldEmerge ? styles.doorOpenState : styles.doorClosedState
              ]}
            >
              <div css={styles.doorPanel}>
                <div css={styles.doorOrnament} />
                <div css={styles.doorHandle} />
              </div>
            </div>

            {/* Door opening */}
            <div css={styles.doorOpening}>
              {/* Interior shadow */}
              <div css={styles.interiorShadow} />
              
              {/* Cuckoo bird */}
              <div 
                css={[
                  styles.cuckooBird,
                  shouldEmerge ? styles.birdEmergedState : styles.birdHiddenState
                ]}
              >
                {/* Bird body */}
                <div css={styles.birdBody}>
                  {/* Bird head */}
                  <div css={styles.birdHead}>
                    <div css={styles.birdBeak} />
                    <div css={styles.birdEye} />
                    <div css={styles.birdCrest}>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} css={styles.crestFeather} />
                      ))}
                    </div>
                  </div>

                  {/* Bird wings */}
                  <div css={styles.birdWings}>
                    <div css={[styles.birdWing, styles.leftWing]} />
                    <div css={[styles.birdWing, styles.rightWing]} />
                  </div>

                  {/* Bird tail */}
                  <div css={styles.birdTail}>
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i} 
                        css={styles.tailFeather}
                        style={{ transform: `rotate(${(i - 1) * 10}deg)` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Sound effect visualization */}
                {shouldEmerge && (
                  <div css={styles.soundEffect}>
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        css={styles.soundWave}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* House decorations */}
          <div css={styles.houseDecorations}>
            <div css={styles.windowLeft}>
              <div css={styles.windowPane} />
              <div css={styles.windowCross} />
            </div>
            <div css={styles.windowRight}>
              <div css={styles.windowPane} />
              <div css={styles.windowCross} />
            </div>
          </div>
        </div>

        {/* Base platform */}
        <div css={styles.housePlatform}>
          <div css={styles.platformOrnaments}>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                css={styles.platformOrnament}
                style={{ left: `${10 + i * 15}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mechanical springs and gears */}
      <div css={styles.mechanicalBase}>
        <div css={styles.springAssembly}>
          {[...Array(4)].map((_, i) => (
            <div key={i} css={styles.spring} />
          ))}
        </div>
        <div css={styles.baseGear}>
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              css={styles.gearTooth}
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  cuckooContainer: css`
    position: absolute;
    top: 5%;
    left: 5%;
    width: 120px;
    height: 160px;
    pointer-events: none;
    z-index: 8;
    
    @media (max-width: 768px) {
      width: 100px;
      height: 130px;
    }
    
    @media (max-width: 480px) {
      width: 80px;
      height: 110px;
    }
  `,

  cuckooHouse: css`
    position: relative;
    width: 100%;
    height: 80%;
  `,

  houseBody: css`
    position: relative;
    width: 100%;
    height: 100%;
    background: 
      linear-gradient(135deg, 
        ${colors.surface}90 0%,
        ${colors.card}70 50%,
        ${colors.background}80 100%);
    border: 2px solid ${colors.borderLight};
    border-radius: 15px 15px 5px 5px;
    backdrop-filter: blur(10px);
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.4),
      inset 0 0 15px rgba(255, 255, 255, 0.1);
  `,

  houseRoof: css`
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 110%;
    height: 30px;
    background: linear-gradient(135deg, ${colors.neonGold}80, ${colors.surface}60);
    border: 2px solid ${colors.neonGold};
    border-radius: 15px 15px 0 0;
    clip-path: polygon(10% 100%, 50% 0%, 90% 100%);
    box-shadow: 0 0 15px ${colors.neonGold}40;
  `,

  roofOrnament: css`
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 16px;
    background: ${colors.neonTeal};
    border-radius: 4px;
    box-shadow: 0 0 10px ${colors.neonTeal}60;
  `,

  roofLines: css`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20%;
  `,

  roofLine: css`
    width: 2px;
    height: 60%;
    background: ${colors.neonTeal}60;
    border-radius: 1px;
  `,

  doorFrame: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 50px;
    background: ${colors.background}80;
    border: 2px solid ${colors.borderLight};
    border-radius: 8px;
    overflow: hidden;
    perspective: 200px;
  `,

  doorHinges: css`
    position: absolute;
    left: -2px;
    top: 10%;
    width: 4px;
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 10;
  `,

  doorHinge: css`
    width: 100%;
    height: 8px;
    background: ${colors.neonTeal};
    border-radius: 2px;
    animation: ${hingeGlow} 3s ease-in-out infinite;
  `,

  cuckooDooor: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: left center;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 5;
  `,

  doorOpenState: css`
    animation: ${doorOpen} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `,

  doorClosedState: css`
    animation: ${doorClose} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `,

  doorPanel: css`
    position: relative;
    width: 100%;
    height: 100%;
    background: 
      linear-gradient(135deg, ${colors.neonGold}60, ${colors.surface}80);
    border: 1px solid ${colors.neonGold};
    border-radius: 6px;
    box-shadow: 
      0 0 10px ${colors.neonGold}30,
      inset 0 0 10px rgba(0, 0, 0, 0.2);
  `,

  doorOrnament: css`
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 3px;
    background: ${colors.neonTeal};
    border-radius: 2px;
    box-shadow: 0 0 5px ${colors.neonTeal}60;
  `,

  doorHandle: css`
    position: absolute;
    top: 50%;
    right: 4px;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background: ${colors.neonTeal};
    border-radius: 50%;
    box-shadow: 0 0 5px ${colors.neonTeal}60;
  `,

  doorOpening: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${colors.background}95;
    border-radius: 6px;
    overflow: hidden;
  `,

  interiorShadow: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.6) 100%);
  `,

  cuckooBird: css`
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translateY(-50%);
    width: 30px;
    height: 25px;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  `,

  birdEmergedState: css`
    animation: ${birdEmerge} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `,

  birdHiddenState: css`
    animation: ${birdRetreat} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `,

  birdBody: css`
    position: relative;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(ellipse at center, ${colors.neonGold}80 0%, ${colors.surface}60 100%);
    border: 1px solid ${colors.neonGold};
    border-radius: 50% 40% 60% 30%;
    animation: ${birdBob} 2s ease-in-out infinite;
    box-shadow: 
      0 0 10px ${colors.neonGold}40,
      inset 0 0 8px rgba(255, 255, 255, 0.2);
  `,

  birdHead: css`
    position: absolute;
    top: -5px;
    right: -5px;
    width: 15px;
    height: 15px;
    background: 
      radial-gradient(circle at center, ${colors.neonTeal}80 0%, ${colors.surface}60 100%);
    border: 1px solid ${colors.neonTeal};
    border-radius: 60% 40% 50% 50%;
    box-shadow: 0 0 8px ${colors.neonTeal}40;
  `,

  birdBeak: css`
    position: absolute;
    top: 40%;
    right: -3px;
    width: 6px;
    height: 2px;
    background: ${colors.neonGold};
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 3px ${colors.neonGold}60;
  `,

  birdEye: css`
    position: absolute;
    top: 30%;
    right: 2px;
    width: 3px;
    height: 3px;
    background: ${colors.background};
    border: 1px solid ${colors.neonTeal};
    border-radius: 50%;
    box-shadow: inset 0 0 2px ${colors.neonTeal}80;
  `,

  birdCrest: css`
    position: absolute;
    top: -3px;
    left: 20%;
    width: 60%;
    height: 8px;
    display: flex;
    justify-content: space-between;
  `,

  crestFeather: css`
    width: 2px;
    height: 100%;
    background: ${colors.neonTeal};
    border-radius: 1px;
    transform-origin: bottom center;
    animation: ${wingFlap} 1s ease-in-out infinite;
  `,

  birdWings: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  birdWing: css`
    position: absolute;
    width: 8px;
    height: 12px;
    background: ${colors.neonGold}70;
    border: 1px solid ${colors.neonGold};
    border-radius: 50% 20% 80% 30%;
    transform-origin: top center;
    animation: ${wingFlap} 0.5s ease-in-out infinite;
  `,

  leftWing: css`
    top: 20%;
    left: -2px;
    animation-delay: 0s;
  `,

  rightWing: css`
    top: 20%;
    right: 8px;
    transform: scaleX(-1);
    animation-delay: 0.25s;
  `,

  birdTail: css`
    position: absolute;
    top: 50%;
    left: -8px;
    width: 10px;
    height: 15px;
    transform: translateY(-50%);
  `,

  tailFeather: css`
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 2px;
    height: 8px;
    background: ${colors.neonTeal}80;
    border-radius: 1px;
    transform-origin: bottom center;
    animation: ${wingFlap} 1.2s ease-in-out infinite;
  `,

  soundEffect: css`
    position: absolute;
    top: -10px;
    right: -15px;
    width: 20px;
    height: 20px;
  `,

  soundWave: css`
    position: absolute;
    top: 50%;
    left: 0;
    width: 15px;
    height: 2px;
    background: ${colors.neonTeal}60;
    border-radius: 1px;
    transform: translateY(-50%);
    animation: ${birdBob} 0.3s ease-in-out infinite;
    
    &:nth-child(2) {
      top: 40%;
      width: 12px;
    }
    
    &:nth-child(3) {
      top: 60%;
      width: 18px;
    }
  `,

  houseDecorations: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  windowLeft: css`
    position: absolute;
    top: 20%;
    left: 10%;
    width: 15px;
    height: 15px;
    background: ${colors.background}80;
    border: 1px solid ${colors.borderLight};
    border-radius: 3px;
  `,

  windowRight: css`
    position: absolute;
    top: 20%;
    right: 10%;
    width: 15px;
    height: 15px;
    background: ${colors.background}80;
    border: 1px solid ${colors.borderLight};
    border-radius: 3px;
  `,

  windowPane: css`
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    background: ${colors.neonTeal}20;
    border-radius: 2px;
  `,

  windowCross: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 1px;
    background: ${colors.borderLight};
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(90deg);
      width: 100%;
      height: 1px;
      background: ${colors.borderLight};
    }
  `,

  housePlatform: css`
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 110%;
    height: 12px;
    background: linear-gradient(135deg, ${colors.surface}80, ${colors.card}60);
    border: 1px solid ${colors.borderLight};
    border-radius: 6px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  `,

  platformOrnaments: css`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  `,

  platformOrnament: css`
    position: absolute;
    width: 3px;
    height: 8px;
    background: ${colors.neonGold}60;
    border-radius: 2px;
    animation: ${hingeGlow} 2s ease-in-out infinite;
  `,

  mechanicalBase: css`
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
  `,

  springAssembly: css`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

  spring: css`
    width: 3px;
    height: 100%;
    background: 
      repeating-linear-gradient(
        0deg,
        ${colors.borderLight} 0px,
        ${colors.borderLight} 2px,
        transparent 2px,
        transparent 4px
      );
    border-radius: 2px;
    animation: ${birdBob} 1.5s ease-in-out infinite;
  `,

  baseGear: css`
    position: relative;
    width: 30px;
    height: 30px;
    background: 
      radial-gradient(circle at center, ${colors.surface}80 0%, ${colors.background}60 100%);
    border: 2px solid ${colors.borderLight};
    border-radius: 50%;
    animation: ${wingFlap} 4s linear infinite;
  `,

  gearTooth: css`
    position: absolute;
    top: -2px;
    left: 50%;
    width: 2px;
    height: 4px;
    background: ${colors.neonTeal}60;
    border-radius: 1px;
    transform-origin: 50% 17px;
  `
};

export default CuckooMechanism;
