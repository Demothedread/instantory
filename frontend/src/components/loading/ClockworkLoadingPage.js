/** @jsxImportSource @emotion/react */                          
import { css, keyframes } from '@emotion/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../contexts/auth';
import { colors } from '../../styles/theme/colors';
import BartlebyMechanism from './ClockworkLoadingPage/BartlebyMechanism';
import ClockFace from './ClockworkLoadingPage/ClockFace';
import GearSystem from './ClockworkLoadingPage/GearSystem';
import OrnamentalFrame from './ClockworkLoadingPage/OrnamentalFrame';
import PendulumAssembly from './ClockworkLoadingPage/PendulumAssembly';

/**
 * 🎭 CLOCKWORK LOADING PAGE - Art Deco Mechanical Marvel
 * 
 * A sophisticated loading experience featuring:
 * - Intricate Art Deco clockwork mechanisms
 * - Bartleby mascot emergence instead of cuckoo bird
 * - Progressive gear assembly and pendulum animations
 * - Seamless transition to landing page
 * - Mobile-optimized 4-second experience
 * - Subtle audio-visual effects
 */

// 🎵 Sound effect simulation keyframes
const clockChime = keyframes`
  0% { transform: scale(1); opacity: 0; }
  15% { transform: scale(1.2); opacity: 0.8; }
  30% { transform: scale(1.4); opacity: 0.6; }
  45% { transform: scale(1.6); opacity: 0.4; }
  60% { transform: scale(1.8); opacity: 0.2; }
  100% { transform: scale(2); opacity: 0; }
`;

const mascotSigh = keyframes`
  0%, 100% { transform: scale(1); filter: hue-rotate(0deg); }
  50% { transform: scale(1.05); filter: hue-rotate(10deg); }
`;

// 🎨 Main clockwork animations
const gearRotation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pendulumSwing = keyframes`
  0%, 100% { transform: rotate(-15deg); transform-origin: top center; }
  50% { transform: rotate(15deg); transform-origin: top center; }
`;

const leverPump = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(2deg); }
  75% { transform: translateY(8px) rotate(-2deg); }
`;

const springCompress = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.7); }
`;

const progressFill = keyframes`
  from { width: 0%; background-position: 0% 50%; }
  to { width: 100%; background-position: 100% 50%; }
`;

const gearFadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.3) rotate(-180deg); }
  60% { opacity: 0.8; transform: scale(1.1) rotate(10deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
`;

const mechanismAssembly = keyframes`
  0% { opacity: 0; transform: translateY(50px) scale(0.8); }
  70% { opacity: 0.9; transform: translateY(-5px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const ClockworkLoadingPage = ({
  message = "Initializing Bartleby Intelligence...",
  progress = 0,
  isVisible = true,
  onComplete,
  phase = 'loading' // 'loading', 'auth', 'transition'
}) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [currentStage, setCurrentStage] = useState(0);
  const [showMascot, setShowMascot] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [soundEffect, setSoundEffect] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [stageMessage, setStageMessage] = useState(message);
  const loadingRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Progressive loading stages
  const loadingStages = [
    { progress: 0, message: "Initializing clockwork mechanisms...", duration: 1000 },
    { progress: 20, message: "Assembling Art Deco gears...", duration: 1500 },
    { progress: 40, message: "Calibrating pendulum oscillations...", duration: 1200 },
    { progress: 60, message: "Activating neural networks...", duration: 1800 },
    { progress: 80, message: "Synchronizing intelligence matrix...", duration: 1000 },
    { progress: 100, message: "Bartleby is ready!", duration: 800 }
  ];

  const mobileStages = [
    { progress: 0, message: "Waking up Bartleby...", duration: 1000 },
    { progress: 50, message: "Intelligence activated!", duration: 2000 },
    { progress: 100, message: "Ready to assist!", duration: 1000 }
  ];

  const stages = isMobile ? mobileStages : loadingStages;

  // Stage progression logic
  useEffect(() => {
    if (!isVisible) return;

    const progressStages = () => {
      if (currentStage < stages.length - 1) {
        const stage = stages[currentStage];
        
        setStageMessage(stage.message);
        setAssemblyProgress(stage.progress);

        // Special effects for certain stages
        if (stage.progress === 60 && !isMobile) {
          setSoundEffect('chime');
          setShowMascot(true);
          setTimeout(() => setSoundEffect(null), 1000);
        }

        if (stage.progress === 100) {
          setSoundEffect('sigh');
          setTimeout(() => {
            setSoundEffect(null);
            onComplete?.();
          }, stage.duration);
        }

        setTimeout(() => {
          setCurrentStage(prev => prev + 1);
        }, stage.duration);
      }
    };

    const timer = setTimeout(progressStages, 300);
    return () => clearTimeout(timer);
  }, [currentStage, isVisible, stages, isMobile, onComplete]);

  // Auto-complete for mobile
  useEffect(() => {
    if (isMobile && isVisible) {
      const mobileTimer = setTimeout(() => {
        setShowMascot(true);
        setSoundEffect('sigh');
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }, 4000);

      return () => clearTimeout(mobileTimer);
    }
  }, [isMobile, isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div css={styles.container} ref={loadingRef}>
      {/* Sound effect visualization */}
      {soundEffect && (
        <div css={styles.soundEffect(soundEffect)}>
          <div css={styles.soundWave} />
        </div>
      )}

      {/* Ornamental Art Deco frame */}
      <OrnamentalFrame isInitialized={currentStage > 0} />

      {/* Main clockwork mechanism container */}
      <div css={styles.clockworkContainer}>
        {/* Central clock face with progress */}
        <ClockFace
          isInitialized={currentStage > 0}
          animationPhase={currentStage}
          progress={assemblyProgress}
          isMobile={isMobile}
        />

        {/* Intricate gear system */}
        <GearSystem
          isInitialized={currentStage > 1}
          animationPhase={currentStage}
          assemblyProgress={assemblyProgress}
          isMobile={isMobile}
        />

        {/* Pendulum assembly */}
        <PendulumAssembly
          isInitialized={currentStage > 2}
          animationPhase={currentStage}
          isMobile={isMobile}
        />

        {/* Bartleby mascot mechanism (instead of cuckoo) */}
        <BartlebyMechanism
          isInitialized={currentStage > 3}
          showMascot={showMascot}
          animationPhase={currentStage}
          isMobile={isMobile}
        />

        {/* Art Deco decorative elements */}
        <div css={styles.decorativeElements}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              css={styles.decorativeBeam}
              style={{
                transform: `rotate(${i * 45}deg)`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading message and progress */}
      <div css={styles.messageContainer}>
        <div css={styles.message}>
          {stageMessage}
        </div>
        
        <div css={styles.progressContainer}>
          <div css={styles.progressBar}>
            <div
              css={styles.progressFill}
              style={{ width: `${assemblyProgress}%` }}
            />
            <div css={styles.progressShimmer} />
          </div>
          
          <div css={styles.progressText}>
            {assemblyProgress}%
          </div>
        </div>

        {/* Stage indicators */}
        <div css={styles.stageIndicators}>
          {stages.map((_, index) => (
            <div
              key={index}
              css={styles.stageIndicator(index <= currentStage)}
            />
          ))}
        </div>
      </div>

      {/* Background ambient effects */}
      <div css={styles.ambientEffects}>
        <div css={styles.particleField}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              css={styles.particle}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
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
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(
      135deg,
      #0a0a0a 0%,
      #1a1a2e 25%,
      #16213e 50%,
      #0f3460 75%,
      #533483 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;
    font-family: 'Cinzel Decorative', serif;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(ellipse at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 40% 80%, rgba(255, 105, 180, 0.05) 0%, transparent 50%);
      pointer-events: none;
    }
  `,

  soundEffect: (effect) => css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 10;
    
    ${effect === 'chime' && css`
      animation: ${clockChime} 1s ease-out;
    `}
    
    ${effect === 'sigh' && css`
      animation: ${mascotSigh} 2s ease-in-out;
    `}
  `,

  soundWave: css`
    width: 100px;
    height: 100px;
    border: 2px solid ${colors.neonTeal};
    border-radius: 50%;
    opacity: 0.6;
  `,

  clockworkContainer: css`
    position: relative;
    width: 600px;
    height: 600px;
    max-width: 90vw;
    max-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;
    perspective: 1200px;
    animation: ${mechanismAssembly} 2s ease-out;
    
    @media (max-width: 768px) {
      width: 350px;
      height: 350px;
      max-height: 50vh;
    }
    
    @media (max-width: 480px) {
      width: 280px;
      height: 280px;
    }
  `,

  decorativeElements: css`
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `,

  decorativeBeam: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 120px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      ${colors.neonGold}40 20%,
      ${colors.neonTeal}60 50%,
      ${colors.neonGold}40 80%,
      transparent 100%
    );
    transform-origin: bottom center;
    animation: ${gearFadeIn} 3s ease-out;
    opacity: 0.3;
  `,

  messageContainer: css`
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 100%;
    max-width: 600px;
    padding: 0 2rem;
    
    @media (max-width: 768px) {
      bottom: 60px;
      max-width: 350px;
      padding: 0 1rem;
    }
  `,

  message: css`
    font-size: 1.3rem;
    color: ${colors.neonGold};
    text-shadow: 
      0 0 10px rgba(255, 215, 0, 0.6),
      0 0 20px rgba(255, 215, 0, 0.3),
      0 0 30px rgba(0, 255, 255, 0.2);
    margin-bottom: 1.5rem;
    letter-spacing: 0.15em;
    animation: ${mascotSigh} 3s ease-in-out infinite;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  `,

  progressContainer: css`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    
    @media (max-width: 480px) {
      flex-direction: column;
      gap: 0.5rem;
    }
  `,

  progressBar: css`
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    border: 1px solid rgba(255, 215, 0, 0.3);
    box-shadow: 
      0 0 15px rgba(255, 215, 0, 0.2),
      inset 0 0 10px rgba(0, 0, 0, 0.6);
    position: relative;
  `,

  progressFill: css`
    height: 100%;
    background: linear-gradient(
      90deg,
      ${colors.neonTeal} 0%,
      ${colors.neonGold} 50%,
      ${colors.neonTeal} 100%
    );
    border-radius: 1px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 40px rgba(255, 215, 0, 0.4);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: -20px;
      width: 20px;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.6) 50%,
        transparent 100%
      );
      animation: ${progressFill} 2s infinite;
    }
  `,

  progressShimmer: css`
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    animation: ${progressFill} 3s infinite;
  `,

  progressText: css`
    font-size: 1rem;
    color: ${colors.neonTeal};
    font-weight: 600;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    min-width: 40px;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  `,

  stageIndicators: css`
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  `,

  stageIndicator: (isActive) => css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${isActive ? colors.neonGold : 'rgba(255, 255, 255, 0.2)'};
    box-shadow: ${isActive ? `0 0 10px ${colors.neonGold}` : 'none'};
    transition: all 0.3s ease;
    
    ${isActive && css`
      transform: scale(1.2);
      animation: ${mascotSigh} 2s ease-in-out infinite;
    `}
  `,

  ambientEffects: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
  `,

  particleField: css`
    position: absolute;
    width: 100%;
    height: 100%;
  `,

  particle: css`
    position: absolute;
    width: 2px;
    height: 2px;
    background: ${colors.neonTeal};
    border-radius: 50%;
    opacity: 0.6;
    animation: ${keyframes`
      0% { 
        transform: translateY(100vh) scale(0);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
        transform: translateY(90vh) scale(1);
      }
      90% {
        opacity: 0.6;
        transform: translateY(-10vh) scale(1);
      }
      100% { 
        transform: translateY(-20vh) scale(0);
        opacity: 0;
      }
    `} linear infinite;
    box-shadow: 0 0 6px ${colors.neonTeal};
  `
};

export default ClockworkLoadingPage;
