/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { colors } from '../../../styles/theme/colors';

/**
 * BartlebyMechanism - The charming mascot that emerges instead of a cuckoo bird
 * Features Bartleby with monocle, top hat, and Art Deco styling
 */

const bartlebyEmerge = keyframes`
  0% {
    transform: translateY(100%) scale(0.8);
    opacity: 0;
  }
  20% {
    transform: translateY(50%) scale(0.9);
    opacity: 0.7;
  }
  40% {
    transform: translateY(0%) scale(1.1);
    opacity: 1;
  }
  60% {
    transform: translateY(-10%) scale(1);
    opacity: 1;
  }
  80% {
    transform: translateY(-5%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(0%) scale(1);
    opacity: 1;
  }
`;

const monocleGlint = keyframes`
  0%, 90%, 100% { 
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
  95% { 
    box-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 255, 255, 0.8);
  }
`;

const hatTip = keyframes`
  0%, 80%, 100% { 
    transform: rotate(0deg);
  }
  85%, 95% { 
    transform: rotate(-10deg);
  }
  90% { 
    transform: rotate(-15deg);
  }
`;

const doorSwing = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  30% {
    transform: rotateY(-90deg);
  }
  70% {
    transform: rotateY(-90deg);
  }
  100% {
    transform: rotateY(0deg);
  }
`;

const BartlebyMechanism = ({ 
  isInitialized, 
  showMascot, 
  isMobile 
}) => {
  if (!isInitialized) return null;

  return (
    <div css={styles.container}>
      {/* Art Deco housing for Bartleby */}
      <div css={styles.housing}>
        {/* Decorative elements around the housing */}
        <div css={styles.housingDecoration}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              css={styles.decorativeElement}
              style={{ transform: `rotate(${i * 60}deg)` }}
            />
          ))}
        </div>

        {/* The door that swings open */}
        <div css={styles.door(showMascot)}>
          <div css={styles.doorPanel}>
            <div css={styles.doorHandle} />
            <div css={styles.doorDecoration} />
          </div>
        </div>

        {/* Bartleby mascot */}
        {showMascot && (
          <div css={styles.bartleby}>
            {/* Bartleby's body */}
            <div css={styles.body}>
              {/* Head */}
              <div css={styles.head}>
                {/* Top hat */}
                <div css={styles.topHat}>
                  <div css={styles.hatBand} />
                  <div css={styles.hatDecoration} />
                </div>

                {/* Face */}
                <div css={styles.face}>
                  {/* Eyes */}
                  <div css={styles.eyes}>
                    <div css={styles.eye} />
                    <div css={styles.eye} />
                  </div>

                  {/* Monocle */}
                  <div css={styles.monocle}>
                    <div css={styles.monocleGlass} />
                    <div css={styles.monocleChain} />
                  </div>

                  {/* Mustache */}
                  <div css={styles.mustache} />

                  {/* Mouth */}
                  <div css={styles.mouth} />
                </div>
              </div>

              {/* Bow tie */}
              <div css={styles.bowTie}>
                <div css={styles.bowTieKnot} />
              </div>

              {/* Vest */}
              <div css={styles.vest}>
                <div css={styles.vestButtons}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} css={styles.vestButton} />
                  ))}
                </div>
              </div>

              {/* Arms */}
              <div css={styles.arms}>
                <div css={styles.arm}>
                  <div css={styles.hand} />
                </div>
                <div css={styles.arm}>
                  <div css={styles.hand} />
                </div>
              </div>
            </div>

            {/* Speech bubble */}
            <div css={styles.speechBubble}>
              <div css={styles.speechText}>
                {isMobile ? "Ready!" : "At your service!"}
              </div>
              <div css={styles.speechTail} />
            </div>
          </div>
        )}

        {/* Mechanical elements */}
        <div css={styles.mechanicalElements}>
          <div css={styles.spring} />
          <div css={styles.lever} />
          <div css={styles.cogwheel} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    
    @media (max-width: 768px) {
      top: -60px;
      transform: translateX(-50%) scale(0.8);
    }
  `,

  housing: css`
    position: relative;
    width: 120px;
    height: 80px;
    background: linear-gradient(
      145deg,
      #2c1810 0%,
      #3d2416 30%,
      #4a2c1a 60%,
      #5c3520 100%
    );
    border-radius: 12px 12px 8px 8px;
    border: 2px solid ${colors.neonGold};
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.7),
      inset 0 2px 8px rgba(255, 215, 0, 0.1),
      0 0 20px rgba(255, 215, 0, 0.3);
    perspective: 300px;
    overflow: visible;
  `,

  housingDecoration: css`
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 140px;
    pointer-events: none;
  `,

  decorativeElement: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 25px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      ${colors.neonGold} 40%,
      ${colors.neonTeal} 60%,
      transparent 100%
    );
    transform-origin: bottom center;
    opacity: 0.6;
    border-radius: 2px;
  `,

  door: (isOpen) => css`
    position: absolute;
    top: 8px;
    left: 8px;
    width: 104px;
    height: 64px;
    transform-style: preserve-3d;
    transform-origin: left center;
    transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
    
    ${isOpen && css`
      animation: ${doorSwing} 2s ease-in-out;
      transform: rotateY(-90deg);
    `}
  `,

  doorPanel: css`
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #1a1a1a 0%,
      #2d2d2d 50%,
      #1a1a1a 100%
    );
    border-radius: 8px;
    border: 1px solid rgba(255, 215, 0, 0.4);
    position: relative;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5);
  `,

  doorHandle: css`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
  `,

  doorDecoration: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 40px;
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 20px;
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 4px;
    }
  `,

  bartleby: css`
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    animation: ${bartlebyEmerge} 1.5s ease-out;
    z-index: 2;
  `,

  body: css`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  head: css`
    position: relative;
    width: 40px;
    height: 35px;
    background: linear-gradient(145deg, #f4e4bc, #e6d3a7);
    border-radius: 50% 50% 45% 45%;
    border: 1px solid rgba(0, 0, 0, 0.2);
    margin-bottom: 2px;
  `,

  topHat: css`
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 28px;
    background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
    border-radius: 4px 4px 50% 50%;
    border: 1px solid ${colors.neonGold};
    animation: ${hatTip} 4s ease-in-out infinite;
    
    &::before {
      content: '';
      position: absolute;
      bottom: -3px;
      left: -4px;
      width: 40px;
      height: 6px;
      background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
      border-radius: 50%;
      border: 1px solid ${colors.neonGold};
    }
  `,

  hatBand: css`
    position: absolute;
    bottom: 8px;
    left: 2px;
    right: 2px;
    height: 4px;
    background: ${colors.neonTeal};
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0, 255, 255, 0.5);
  `,

  hatDecoration: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  `,

  face: css`
    position: relative;
    width: 100%;
    height: 100%;
  `,

  eyes: css`
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  `,

  eye: css`
    width: 4px;
    height: 4px;
    background: #1a1a1a;
    border-radius: 50%;
    
    &::after {
      content: '';
      position: absolute;
      top: 1px;
      left: 1px;
      width: 1px;
      height: 1px;
      background: white;
      border-radius: 50%;
    }
  `,

  monocle: css`
    position: absolute;
    top: 10px;
    right: 8px;
    width: 12px;
    height: 12px;
  `,

  monocleGlass: css`
    width: 100%;
    height: 100%;
    border: 2px solid ${colors.neonGold};
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: ${monocleGlint} 3s ease-in-out infinite;
    
    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 3px;
      height: 3px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }
  `,

  monocleChain: css`
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 1px;
    height: 15px;
    background: ${colors.neonGold};
    transform: rotate(45deg);
    border-radius: 1px;
  `,

  mustache: css`
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 3px;
    background: #3d2416;
    border-radius: 0 0 8px 8px;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      width: 6px;
      height: 3px;
      background: #3d2416;
      border-radius: 4px;
    }
    
    &::before {
      left: -4px;
      transform: rotate(-20deg);
    }
    
    &::after {
      right: -4px;
      transform: rotate(20deg);
    }
  `,

  mouth: css`
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 2px;
    background: #d4756b;
    border-radius: 0 0 4px 4px;
  `,

  bowTie: css`
    position: relative;
    width: 20px;
    height: 8px;
    background: ${colors.neonTeal};
    border-radius: 2px;
    margin-bottom: 2px;
    box-shadow: 0 0 6px rgba(0, 255, 255, 0.4);
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      width: 8px;
      height: 8px;
      background: ${colors.neonTeal};
      border-radius: 50% 0;
    }
    
    &::before {
      left: 0;
      transform: rotate(-45deg);
    }
    
    &::after {
      right: 0;
      transform: rotate(135deg);
    }
  `,

  bowTieKnot: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 10px;
    background: #1a1a1a;
    border-radius: 2px;
  `,

  vest: css`
    position: relative;
    width: 30px;
    height: 18px;
    background: linear-gradient(145deg, #2d2d2d, #1a1a1a);
    border-radius: 0 0 8px 8px;
    border: 1px solid rgba(255, 215, 0, 0.3);
  `,

  vestButtons: css`
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 2px;
  `,

  vestButton: css`
    width: 3px;
    height: 3px;
    background: ${colors.neonGold};
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
  `,

  arms: css`
    position: absolute;
    top: 20px;
    display: flex;
    gap: 40px;
  `,

  arm: css`
    width: 8px;
    height: 15px;
    background: linear-gradient(145deg, #f4e4bc, #e6d3a7);
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  `,

  hand: css`
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background: linear-gradient(145deg, #f4e4bc, #e6d3a7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
  `,

  speechBubble: css`
    position: absolute;
    top: -35px;
    left: -20px;
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid ${colors.neonGold};
    border-radius: 12px;
    padding: 4px 8px;
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.3),
      0 0 15px rgba(255, 215, 0, 0.3);
    animation: ${bartlebyEmerge} 1.5s ease-out 0.5s both;
  `,

  speechText: css`
    font-size: 8px;
    color: #1a1a1a;
    font-weight: 600;
    white-space: nowrap;
    text-shadow: none;
  `,

  speechTail: css`
    position: absolute;
    bottom: -8px;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid rgba(255, 255, 255, 0.95);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: -4px;
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 6px solid ${colors.neonGold};
    }
  `,

  mechanicalElements: css`
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    opacity: 0.7;
  `,

  spring: css`
    width: 4px;
    height: 12px;
    background: repeating-linear-gradient(
      to bottom,
      ${colors.neonTeal} 0px,
      ${colors.neonTeal} 1px,
      transparent 1px,
      transparent 2px
    );
    border-radius: 2px;
    animation: ${keyframes`
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.7); }
    `} 2s ease-in-out infinite;
  `,

  lever: css`
    width: 2px;
    height: 10px;
    background: ${colors.neonGold};
    border-radius: 1px;
    transform-origin: bottom center;
    animation: ${keyframes`
      0%, 100% { transform: rotate(-10deg); }
      50% { transform: rotate(10deg); }
    `} 1.5s ease-in-out infinite;
  `,

  cogwheel: css`
    width: 8px;
    height: 8px;
    background: ${colors.neonTeal};
    border-radius: 50%;
    position: relative;
    animation: ${keyframes`
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `} 3s linear infinite;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: repeating-conic-gradient(
        ${colors.neonTeal} 0deg 30deg,
        transparent 30deg 60deg
      );
      border-radius: 50%;
    }
  `
};

export default BartlebyMechanism;
