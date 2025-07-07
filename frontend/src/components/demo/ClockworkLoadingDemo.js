/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import { colors } from '../../styles/theme/colors';
import ClockworkLoadingPage from '../loading/ClockworkLoadingPage';

/**
 * ClockworkLoadingDemo - Interactive demonstration of the clockwork loading page
 * Features controls to adjust progress, messages, and visibility
 */
const ClockworkLoadingDemo = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Preparing your digital sanctuary...");
  const [autoProgress, setAutoProgress] = useState(false);

  // Auto-increment progress when enabled
  useEffect(() => {
    if (!autoProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setAutoProgress(false);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoProgress]);

  const demoMessages = [
    "Preparing your digital sanctuary...",
    "Calibrating clockwork mechanisms...",
    "Synchronizing gear assemblies...",
    "Initializing cuckoo protocols...",
    "Harmonizing pendulum frequencies...",
    "Polishing ornamental frameworks...",
    "Activating Neo-Deco-Rococo systems...",
    "Establishing temporal connections...",
    "Awakening mechanical artistry...",
    "Loading complete!"
  ];

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleProgressChange = (event) => {
    setProgress(parseInt(event.target.value));
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * demoMessages.length);
    setMessage(demoMessages[randomIndex]);
  };

  const handleAutoProgress = () => {
    setProgress(0);
    setAutoProgress(true);
  };

  const handleReset = () => {
    setProgress(0);
    setAutoProgress(false);
    setMessage("Preparing your digital sanctuary...");
    setIsVisible(true);
  };

  return (
    <div css={styles.container}>
      {/* Demo Controls Panel */}
      <div css={styles.controlsPanel}>
        <div css={styles.panelHeader}>
          <h2 css={styles.panelTitle}>Clockwork Loading Demo</h2>
          <p css={styles.panelSubtitle}>
            An intricate Neo-Deco-Rococo loading experience
          </p>
        </div>

        <div css={styles.controlsGrid}>
          {/* Visibility Control */}
          <div css={styles.controlGroup}>
            <label css={styles.controlLabel}>Visibility</label>
            <button 
              css={[styles.button, styles.toggleButton]}
              onClick={handleToggleVisibility}
            >
              {isVisible ? 'Hide Loading' : 'Show Loading'}
            </button>
          </div>

          {/* Progress Control */}
          <div css={styles.controlGroup}>
            <label css={styles.controlLabel}>
              Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              css={styles.slider}
            />
          </div>

          {/* Message Control */}
          <div css={styles.controlGroup}>
            <label css={styles.controlLabel}>Loading Message</label>
            <div css={styles.messageControls}>
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                css={styles.textInput}
                placeholder="Enter loading message..."
              />
              <button
                css={[styles.button, styles.secondaryButton]}
                onClick={handleRandomMessage}
              >
                Random
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div css={styles.controlGroup}>
            <label css={styles.controlLabel}>Actions</label>
            <div css={styles.buttonGroup}>
              <button
                css={[styles.button, styles.primaryButton]}
                onClick={handleAutoProgress}
                disabled={autoProgress}
              >
                {autoProgress ? 'Auto Loading...' : 'Auto Progress'}
              </button>
              <button
                css={[styles.button, styles.resetButton]}
                onClick={handleReset}
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div css={styles.infoPanel}>
          <h3 css={styles.infoTitle}>Features Demonstrated</h3>
          <ul css={styles.featureList}>
            <li>🎨 Neo-Deco-Rococo artistic styling</li>
            <li>⚙️ Intricate gear system animations</li>
            <li>🕰️ Realistic clock face with moving hands</li>
            <li>🪃 Hypnotic pendulum motion</li>
            <li>🐦 Periodic cuckoo bird emergence</li>
            <li>✨ Ornamental frame with atmospheric effects</li>
            <li>📱 Responsive design for all devices</li>
            <li>🎵 Sound wave visualizations</li>
            <li>💎 Jeweled mechanical details</li>
            <li>🌟 Particle effects and light rays</li>
          </ul>
        </div>

        {/* Technical Details */}
        <div css={styles.techPanel}>
          <h3 css={styles.infoTitle}>Technical Implementation</h3>
          <div css={styles.techDetails}>
            <div css={styles.techItem}>
              <span css={styles.techLabel}>Framework:</span>
              <span css={styles.techValue}>React + Emotion CSS</span>
            </div>
            <div css={styles.techItem}>
              <span css={styles.techLabel}>Animations:</span>
              <span css={styles.techValue}>CSS Keyframes + Transforms</span>
            </div>
            <div css={styles.techItem}>
              <span css={styles.techLabel}>Components:</span>
              <span css={styles.techValue}>5 Specialized Components</span>
            </div>
            <div css={styles.techItem}>
              <span css={styles.techLabel}>Performance:</span>
              <span css={styles.techValue}>GPU Accelerated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Page Display */}
      <ClockworkLoadingPage 
        message={message}
        progress={progress}
        isVisible={isVisible}
      />
    </div>
  );
};

const styles = {
  container: css`
    position: relative;
    width: 100vw;
    height: 100vh;
    background: ${colors.darkGradient};
    overflow: hidden;
  `,

  controlsPanel: css`
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: calc(100vh - 40px);
    background: rgba(26, 26, 46, 0.95);
    border: 1px solid ${colors.neonTeal};
    border-radius: 12px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.6),
      0 0 20px rgba(0, 255, 255, 0.2);
    z-index: 10000;
    overflow-y: auto;
    
    @media (max-width: 768px) {
      position: relative;
      top: 0;
      right: 0;
      width: 100%;
      max-height: none;
      border-radius: 0;
      margin-bottom: 2rem;
    }
  `,

  panelHeader: css`
    margin-bottom: 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(0, 255, 255, 0.3);
    padding-bottom: 1rem;
  `,

  panelTitle: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 1.4rem;
    color: ${colors.neonGold};
    margin: 0 0 0.5rem 0;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  `,

  panelSubtitle: css`
    font-size: 0.9rem;
    color: ${colors.textMuted};
    margin: 0;
    font-style: italic;
  `,

  controlsGrid: css`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  `,

  controlGroup: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,

  controlLabel: css`
    font-size: 0.9rem;
    font-weight: 600;
    color: ${colors.neonTeal};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,

  button: css`
    padding: 0.75rem 1rem;
    border: 1px solid ${colors.neonTeal};
    border-radius: 6px;
    background: transparent;
    color: ${colors.neonTeal};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    
    &:hover:not(:disabled) {
      background: ${colors.neonTeal};
      color: ${colors.background};
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
      transform: translateY(-1px);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  toggleButton: css`
    background: ${colors.neonTeal};
    color: ${colors.background};
    
    &:hover {
      background: ${colors.neonGold};
      border-color: ${colors.neonGold};
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
    }
  `,

  primaryButton: css`
    border-color: ${colors.neonGold};
    color: ${colors.neonGold};
    
    &:hover:not(:disabled) {
      background: ${colors.neonGold};
      color: ${colors.background};
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
    }
  `,

  secondaryButton: css`
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    min-width: 80px;
  `,

  resetButton: css`
    border-color: ${colors.neonRed};
    color: ${colors.neonRed};
    
    &:hover {
      background: ${colors.neonRed};
      color: ${colors.background};
      box-shadow: 0 0 15px rgba(255, 7, 58, 0.4);
    }
  `,

  slider: css`
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${colors.neonTeal};
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.2);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
      }
    }
    
    &::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${colors.neonTeal};
      cursor: pointer;
      border: none;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
    }
  `,

  textInput: css`
    flex: 1;
    padding: 0.75rem;
    border: 1px solid ${colors.border};
    border-radius: 6px;
    background: ${colors.surface};
    color: ${colors.textLight};
    font-size: 0.9rem;
    
    &::placeholder {
      color: ${colors.textMuted};
    }
    
    &:focus {
      outline: none;
      border-color: ${colors.neonTeal};
      box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2);
    }
  `,

  messageControls: css`
    display: flex;
    gap: 0.5rem;
    align-items: center;
  `,

  buttonGroup: css`
    display: flex;
    gap: 0.5rem;
  `,

  infoPanel: css`
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 215, 0, 0.3);
  `,

  infoTitle: css`
    font-family: 'Cinzel Decorative', serif;
    font-size: 1.1rem;
    color: ${colors.neonGold};
    margin: 0 0 1rem 0;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  `,

  featureList: css`
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 0.4rem 0;
      font-size: 0.85rem;
      color: ${colors.textLight};
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      
      &:last-child {
        border-bottom: none;
      }
    }
  `,

  techPanel: css`
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 255, 255, 0.3);
  `,

  techDetails: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,

  techItem: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.85rem;
  `,

  techLabel: css`
    color: ${colors.textMuted};
    font-weight: 500;
  `,

  techValue: css`
    color: ${colors.neonTeal};
    font-weight: 600;
  `
};

export default ClockworkLoadingDemo;
