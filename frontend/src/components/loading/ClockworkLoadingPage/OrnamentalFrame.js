/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { colors } from '../../../styles/theme/colors';

/**
 * OrnamentalFrame - Decorative border elements and background enhancements
 * Features Rococo flourishes, Art Deco patterns, and atmospheric effects
 */
const OrnamentalFrame = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);

  useEffect(() => {
    // Fade in the ornamental frame
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    // Activate floating particles
    const particlesTimeout = setTimeout(() => {
      setParticlesActive(true);
    }, 1000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(particlesTimeout);
    };
  }, []);

  return (
    <div css={[styles.container, isVisible && styles.visible]}>
      {/* Corner ornaments */}
      <div css={styles.cornerOrnaments}>
        {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner, index) => (
          <div
            key={corner}
            css={[styles.cornerOrnament, styles[corner]]}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {/* Art Deco corner design */}
            <div css={styles.cornerPattern}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  css={styles.cornerLine}
                  style={{
                    width: `${20 + i * 8}px`,
                    height: `${20 + i * 8}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            
            {/* Rococo flourish */}
            <div css={styles.flourish}>
              <div css={styles.flourishCurve} />
              <div css={styles.flourishSpiral} />
            </div>
          </div>
        ))}
      </div>

      {/* Side panels with geometric patterns */}
      <div css={styles.sidePanels}>
        {['left', 'right', 'top', 'bottom'].map((side, index) => (
          <div
            key={side}
            css={[styles.sidePanel, styles[`${side}Panel`]]}
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            <div css={styles.panelPattern}>
              {/* Repeating Art Deco motifs */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  css={styles.patternElement}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.8 - (i * 0.08)
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Central decorative frame */}
      <div css={styles.centralFrame}>
        <div css={styles.frameRing}>
          {/* Ornate bezel with jewels */}
          <div css={styles.frameBezel}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                css={styles.bezelJewel}
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-80px)`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>

          {/* Inner decorative ring */}
          <div css={styles.innerDecoRing}>
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                css={styles.decoTick}
                style={{
                  transform: `rotate(${i * 15}deg)`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating atmospheric particles */}
      {particlesActive && (
        <div css={styles.atmosphericEffects}>
          {/* Golden dust particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`dust-${i}`}
              css={styles.dustParticle}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}

          {/* Light rays */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`ray-${i}`}
              css={styles.lightRay}
              style={{
                transform: `rotate(${i * 60}deg)`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}

          {/* Ambient glow orbs */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`orb-${i}`}
              css={styles.glowOrb}
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${6 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Decorative scrollwork */}
      <div css={styles.scrollwork}>
        {/* Left scrollwork */}
        <div css={[styles.scroll, styles.leftScroll]}>
          <svg css={styles.scrollSvg} viewBox="0 0 100 200">
            <path
              d="M20,20 Q40,10 60,30 Q80,50 60,70 Q40,90 20,80 Q10,60 20,40 Q30,20 20,20"
              css={styles.scrollPath}
            />
            <path
              d="M20,120 Q40,110 60,130 Q80,150 60,170 Q40,190 20,180 Q10,160 20,140 Q30,120 20,120"
              css={styles.scrollPath}
            />
          </svg>
        </div>

        {/* Right scrollwork */}
        <div css={[styles.scroll, styles.rightScroll]}>
          <svg css={styles.scrollSvg} viewBox="0 0 100 200">
            <path
              d="M80,20 Q60,10 40,30 Q20,50 40,70 Q60,90 80,80 Q90,60 80,40 Q70,20 80,20"
              css={styles.scrollPath}
            />
            <path
              d="M80,120 Q60,110 40,130 Q20,150 40,170 Q60,190 80,180 Q90,160 80,140 Q70,120 80,120"
              css={styles.scrollPath}
            />
          </svg>
        </div>
      </div>

      {/* Background texture overlay */}
      <div css={styles.textureOverlay}>
        <div css={styles.texturePattern}>
          {/* Subtle geometric background pattern */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              css={styles.textureElement}
              style={{
                left: `${(i % 10) * 10}%`,
                top: `${Math.floor(i / 10) * 20}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 2s ease-in-out;
    pointer-events: none;
    z-index: 1;
  `,

  visible: css`
    opacity: 1;
  `,

  cornerOrnaments: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,

  cornerOrnament: css`
    position: absolute;
    width: 120px;
    height: 120px;
    transform: scale(0);
    animation: ornamentAppear 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    
    @keyframes ornamentAppear {
      from { transform: scale(0) rotate(-180deg); opacity: 0; }
      to { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    @media (max-width: 768px) {
      width: 80px;
      height: 80px;
    }
  `,

  topLeft: css`
    top: 20px;
    left: 20px;
  `,

  topRight: css`
    top: 20px;
    right: 20px;
    transform-origin: bottom left;
  `,

  bottomLeft: css`
    bottom: 20px;
    left: 20px;
    transform-origin: top right;
  `,

  bottomRight: css`
    bottom: 20px;
    right: 20px;
    transform-origin: top left;
  `,

  cornerPattern: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
  `,

  cornerLine: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 2px;
    animation: cornerLineGlow 4s ease-in-out infinite;
    
    @keyframes cornerLineGlow {
      0%, 100% { 
        border-color: rgba(255, 215, 0, 0.3);
        box-shadow: 0 0 5px rgba(255, 215, 0, 0.2);
      }
      50% { 
        border-color: rgba(255, 215, 0, 0.8);
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
      }
    }
  `,

  flourish: css`
    position: absolute;
    top: 20%;
    left: 20%;
    width: 60%;
    height: 60%;
  `,

  flourishCurve: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-radius: 50%;
    background: linear-gradient(45deg, transparent, ${colors.neonTeal}, transparent);
    background-clip: border-box;
    animation: flourishRotate 8s linear infinite;
    
    @keyframes flourishRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

  flourishSpiral: css`
    position: absolute;
    top: 25%;
    left: 25%;
    width: 50%;
    height: 50%;
    border: 1px solid ${colors.neonGold};
    border-radius: 50%;
    animation: spiralPulse 3s ease-in-out infinite;
    
    @keyframes spiralPulse {
      0%, 100% { transform: scale(0.8); opacity: 0.6; }
      50% { transform: scale(1.2); opacity: 1; }
    }
  `,

  sidePanels: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,

  sidePanel: css`
    position: absolute;
    opacity: 0;
    animation: panelSlideIn 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    
    @keyframes panelSlideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 0.4; transform: translateY(0); }
    }
  `,

  leftPanel: css`
    top: 150px;
    left: 0;
    width: 40px;
    height: calc(100% - 300px);
    background: linear-gradient(
      to right,
      rgba(255, 215, 0, 0.1) 0%,
      transparent 100%
    );
  `,

  rightPanel: css`
    top: 150px;
    right: 0;
    width: 40px;
    height: calc(100% - 300px);
    background: linear-gradient(
      to left,
      rgba(255, 215, 0, 0.1) 0%,
      transparent 100%
    );
  `,

  topPanel: css`
    top: 0;
    left: 150px;
    width: calc(100% - 300px);
    height: 40px;
    background: linear-gradient(
      to bottom,
      rgba(255, 215, 0, 0.1) 0%,
      transparent 100%
    );
  `,

  bottomPanel: css`
    bottom: 0;
    left: 150px;
    width: calc(100% - 300px);
    height: 40px;
    background: linear-gradient(
      to top,
      rgba(255, 215, 0, 0.1) 0%,
      transparent 100%
    );
  `,

  panelPattern: css`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  `,

  patternElement: css`
    width: 8px;
    height: 8px;
    background: radial-gradient(
      circle at center,
      ${colors.neonTeal} 0%,
      transparent 70%
    );
    border-radius: 50%;
    animation: patternPulse 6s ease-in-out infinite;
    
    @keyframes patternPulse {
      0%, 100% { transform: scale(0.8); opacity: 0.3; }
      50% { transform: scale(1.5); opacity: 0.8; }
    }
  `,

  centralFrame: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 700px;
    opacity: 0;
    animation: frameExpand 3s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards;
    
    @keyframes frameExpand {
      from { 
        opacity: 0; 
        transform: translate(-50%, -50%) scale(0.5); 
      }
      to { 
        opacity: 0.6; 
        transform: translate(-50%, -50%) scale(1); 
      }
    }
    
    @media (max-width: 768px) {
      width: 500px;
      height: 500px;
    }
    
    @media (max-width: 480px) {
      width: 350px;
      height: 350px;
    }
  `,

  frameRing: css`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid rgba(255, 215, 0, 0.2);
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.1),
      inset 0 0 30px rgba(255, 215, 0, 0.05);
  `,

  frameBezel: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  `,

  bezelJewel: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.neonTeal};
    box-shadow: 
      0 0 15px rgba(0, 255, 255, 0.8),
      inset 0 0 5px rgba(255, 255, 255, 0.6);
    animation: jewelTwinkle 4s ease-in-out infinite;
    
    @keyframes jewelTwinkle {
      0%, 100% { 
        opacity: 0.6; 
        transform: translate(-50%, -50%) scale(0.8); 
      }
      50% { 
        opacity: 1; 
        transform: translate(-50%, -50%) scale(1.2); 
      }
    }
  `,

  innerDecoRing: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 90%;
  `,

  decoTick: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 20px;
    background: linear-gradient(
      to top,
      transparent 0%,
      rgba(255, 215, 0, 0.4) 50%,
      transparent 100%
    );
    transform-origin: bottom center;
    margin-left: -1px;
    margin-top: -200px;
    animation: tickGlow 8s ease-in-out infinite;
    
    @keyframes tickGlow {
      0%, 100% { opacity: 0.3; }
      25%, 75% { opacity: 0.8; }
      50% { opacity: 0.5; }
    }
  `,

  atmosphericEffects: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  `,

  dustParticle: css`
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: ${colors.neonGold};
    box-shadow: 0 0 4px rgba(255, 215, 0, 0.6);
    animation: dustFloat linear infinite;
    
    @keyframes dustFloat {
      0% {
        opacity: 0;
        transform: translateY(100vh) translateX(0);
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateY(-20px) translateX(50px);
      }
    }
  `,

  lightRay: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 300px;
    background: linear-gradient(
      to top,
      transparent 0%,
      rgba(0, 255, 255, 0.2) 30%,
      rgba(255, 215, 0, 0.3) 50%,
      rgba(0, 255, 255, 0.2) 70%,
      transparent 100%
    );
    transform-origin: bottom center;
    margin-left: -1px;
    margin-top: -300px;
    animation: rayPulse 6s ease-in-out infinite;
    
    @keyframes rayPulse {
      0%, 100% { opacity: 0.1; transform: scaleY(0.5); }
      50% { opacity: 0.6; transform: scaleY(1.2); }
    }
  `,

  glowOrb: css`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      rgba(0, 255, 255, 0.3) 0%,
      rgba(255, 215, 0, 0.2) 50%,
      transparent 100%
    );
    animation: orbFloat ease-in-out infinite;
    
    @keyframes orbFloat {
      0%, 100% { 
        transform: translateY(0) scale(1); 
        opacity: 0.3; 
      }
      50% { 
        transform: translateY(-20px) scale(1.2); 
        opacity: 0.7; 
      }
    }
  `,

  scrollwork: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,

  scroll: css`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 200px;
    opacity: 0;
    animation: scrollAppear 2.5s ease-in-out 2s forwards;
    
    @keyframes scrollAppear {
      from { opacity: 0; transform: translateY(-50%) scale(0.8); }
      to { opacity: 0.6; transform: translateY(-50%) scale(1); }
    }
    
    @media (max-width: 768px) {
      width: 40px;
      height: 150px;
    }
  `,

  leftScroll: css`
    left: -10px;
  `,

  rightScroll: css`
    right: -10px;
  `,

  scrollSvg: css`
    width: 100%;
    height: 100%;
  `,

  scrollPath: css`
    fill: none;
    stroke: ${colors.neonTeal};
    stroke-width: 1;
    stroke-opacity: 0.4;
    animation: pathGlow 5s ease-in-out infinite;
    
    @keyframes pathGlow {
      0%, 100% { 
        stroke-opacity: 0.2; 
        filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.3)); 
      }
      50% { 
        stroke-opacity: 0.8; 
        filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6)); 
      }
    }
  `,

  textureOverlay: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    z-index: -1;
  `,

  texturePattern: css`
    position: relative;
    width: 100%;
    height: 100%;
  `,

  textureElement: css`
    position: absolute;
    width: 4px;
    height: 4px;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    transform: rotate(45deg);
    animation: textureShimmer 8s ease-in-out infinite;
    
    @keyframes textureShimmer {
      0%, 100% { opacity: 0.1; }
      25%, 75% { opacity: 0.3; }
      50% { opacity: 0.05; }
    }
  `
};

export default OrnamentalFrame;
