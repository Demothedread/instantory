/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { colors } from '../../../styles/theme/colors';

/**
 * GearSystem - Interconnected gear assembly creating chain reaction animations
 * Features multiple gears of varying sizes with synchronized rotation and sparks
 */
const GearSystem = ({ isInitialized, animationPhase }) => {
  const [isActive, setIsActive] = useState(false);
  const [sparkPositions, setSparkPositions] = useState([]);

  useEffect(() => {
    if (isInitialized && animationPhase >= 1) {
      setIsActive(true);
      
      // Generate spark positions where gears interact
      const sparks = [
        { x: 120, y: 80, delay: 0 },
        { x: 200, y: 120, delay: 0.5 },
        { x: 80, y: 200, delay: 1 },
        { x: 250, y: 200, delay: 1.5 },
        { x: 150, y: 280, delay: 2 }
      ];
      setSparkPositions(sparks);
    }
  }, [isInitialized, animationPhase]);

  // Gear configuration with sizes, positions, and rotation speeds
  const gears = [
    {
      id: 'master',
      size: 80,
      x: 150,
      y: 150,
      teeth: 16,
      speed: 1,
      color: colors.neonGold,
      metallic: 'gold',
      zIndex: 10
    },
    {
      id: 'secondary-1',
      size: 60,
      x: 100,
      y: 100,
      teeth: 12,
      speed: -1.33,
      color: colors.neonTeal,
      metallic: 'bronze',
      zIndex: 8
    },
    {
      id: 'secondary-2',
      size: 50,
      x: 220,
      y: 120,
      teeth: 10,
      speed: 1.6,
      color: colors.neonPurple,
      metallic: 'copper',
      zIndex: 9
    },
    {
      id: 'tertiary-1',
      size: 40,
      x: 80,
      y: 200,
      teeth: 8,
      speed: -2,
      color: colors.neonBlue,
      metallic: 'silver',
      zIndex: 7
    },
    {
      id: 'tertiary-2',
      size: 45,
      x: 250,
      y: 190,
      teeth: 9,
      speed: 1.78,
      color: colors.neonGreen,
      metallic: 'brass',
      zIndex: 6
    },
    {
      id: 'micro-1',
      size: 25,
      x: 120,
      y: 80,
      teeth: 5,
      speed: -3.2,
      color: colors.neonRed,
      metallic: 'platinum',
      zIndex: 11
    },
    {
      id: 'micro-2',
      size: 30,
      x: 170,
      y: 270,
      teeth: 6,
      speed: 2.67,
      color: colors.neonPink,
      metallic: 'titanium',
      zIndex: 5
    }
  ];

  const createGearPath = (size, teeth) => {
    const radius = size / 2;
    const innerRadius = radius * 0.7;
    const toothHeight = radius * 0.15;
    const toothWidth = (2 * Math.PI * radius) / (teeth * 2);
    
    let path = '';
    
    for (let i = 0; i < teeth; i++) {
      const angle = (i * 2 * Math.PI) / teeth;
      const nextAngle = ((i + 1) * 2 * Math.PI) / teeth;
      
      // Outer edge of tooth
      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      
      // Top of tooth
      const x2 = Math.cos(angle + Math.PI / teeth / 2) * (radius + toothHeight);
      const y2 = Math.sin(angle + Math.PI / teeth / 2) * (radius + toothHeight);
      
      // Other side of tooth
      const x3 = Math.cos(nextAngle) * radius;
      const y3 = Math.sin(nextAngle) * radius;
      
      if (i === 0) {
        path += `M ${x1} ${y1}`;
      } else {
        path += ` L ${x1} ${y1}`;
      }
      
      path += ` L ${x2} ${y2} L ${x3} ${y3}`;
    }
    
    path += ' Z';
    return path;
  };

  const getMetallicGradient = (metallic, color) => {
    const gradients = {
      gold: `linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #ffd700 50%, #b8860b 75%, #ffd700 100%)`,
      bronze: `linear-gradient(135deg, #cd7f32 0%, #d4a574 25%, #cd7f32 50%, #8b4513 75%, #cd7f32 100%)`,
      copper: `linear-gradient(135deg, #b87333 0%, #d4a574 25%, #b87333 50%, #8b4513 75%, #b87333 100%)`,
      silver: `linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 25%, #c0c0c0 50%, #808080 75%, #c0c0c0 100%)`,
      brass: `linear-gradient(135deg, #b5a642 0%, #d4c649 25%, #b5a642 50%, #8b7355 75%, #b5a642 100%)`,
      platinum: `linear-gradient(135deg, #e5e4e2 0%, #f5f5f5 25%, #e5e4e2 50%, #a8a8a8 75%, #e5e4e2 100%)`,
      titanium: `linear-gradient(135deg, #878681 0%, #b8b8b8 25%, #878681 50%, #5a5a5a 75%, #878681 100%)`
    };
    
    return gradients[metallic] || color;
  };

  return (
    <div css={[styles.container, isActive && styles.active]}>
      {/* Main gear assembly */}
      <div css={styles.gearsContainer}>
        {gears.map((gear) => (
          <div
            key={gear.id}
            css={styles.gearWrapper}
            style={{
              left: gear.x - gear.size / 2,
              top: gear.y - gear.size / 2,
              zIndex: gear.zIndex
            }}
          >
            <div
              css={[
                styles.gear,
                isActive && styles.rotating
              ]}
              style={{
                width: gear.size,
                height: gear.size,
                background: getMetallicGradient(gear.metallic, gear.color),
                boxShadow: `
                  0 0 20px ${gear.color}40,
                  inset 0 0 20px rgba(0, 0, 0, 0.3),
                  0 4px 8px rgba(0, 0, 0, 0.4)
                `,
                animationDuration: `${Math.abs(4 / gear.speed)}s`,
                animationDirection: gear.speed > 0 ? 'normal' : 'reverse'
              }}
            >
              {/* Gear teeth using CSS */}
              <div css={styles.gearTeeth}>
                {[...Array(gear.teeth)].map((_, i) => (
                  <div
                    key={i}
                    css={styles.tooth}
                    style={{
                      transform: `rotate(${i * (360 / gear.teeth)}deg)`,
                      background: gear.color
                    }}
                  />
                ))}
              </div>
              
              {/* Central hub */}
              <div 
                css={styles.gearHub}
                style={{
                  background: getMetallicGradient(gear.metallic, gear.color),
                  boxShadow: `
                    0 0 10px ${gear.color}60,
                    inset 0 0 10px rgba(0, 0, 0, 0.5)
                  `
                }}
              >
                <div css={styles.hubJewel} style={{ background: gear.color }} />
              </div>
              
              {/* Gear spokes */}
              <div css={styles.gearSpokes}>
                {[...Array(Math.floor(gear.teeth / 2))].map((_, i) => (
                  <div
                    key={i}
                    css={styles.spoke}
                    style={{
                      transform: `rotate(${i * (360 / Math.floor(gear.teeth / 2))}deg)`,
                      background: `linear-gradient(90deg, transparent 0%, ${gear.color}40 50%, transparent 100%)`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spark effects at gear interaction points */}
      {isActive && sparkPositions.map((spark, index) => (
        <div
          key={index}
          css={styles.sparkContainer}
          style={{
            left: spark.x,
            top: spark.y,
            animationDelay: `${spark.delay}s`
          }}
        >
          <div css={styles.sparkCore} />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              css={styles.sparkRay}
              style={{
                transform: `rotate(${i * 60}deg)`,
                animationDelay: `${spark.delay + (i * 0.1)}s`
              }}
            />
          ))}
        </div>
      ))}

      {/* Connecting rods and linkages */}
      <div css={styles.linkageContainer}>
        <div css={styles.linkage} style={{ 
          left: 125, 
          top: 125, 
          width: 50, 
          transform: 'rotate(45deg)' 
        }} />
        <div css={styles.linkage} style={{ 
          left: 185, 
          top: 135, 
          width: 65, 
          transform: 'rotate(-30deg)' 
        }} />
        <div css={styles.linkage} style={{ 
          left: 90, 
          top: 175, 
          width: 40, 
          transform: 'rotate(90deg)' 
        }} />
        <div css={styles.linkage} style={{ 
          left: 210, 
          top: 155, 
          width: 55, 
          transform: 'rotate(60deg)' 
        }} />
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
    width: 350px;
    height: 350px;
    opacity: 0;
    transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 3;
    
    @media (max-width: 768px) {
      width: 280px;
      height: 280px;
    }
    
    @media (max-width: 480px) {
      width: 220px;
      height: 220px;
    }
  `,

  active: css`
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  `,

  gearsContainer: css`
    position: relative;
    width: 100%;
    height: 100%;
  `,

  gearWrapper: css`
    position: absolute;
    transform-style: preserve-3d;
  `,

  gear: css`
    position: relative;
    border-radius: 50%;
    transform-style: preserve-3d;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  `,

  rotating: css`
    animation: gearRotate linear infinite;
    
    @keyframes gearRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

  gearTeeth: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  `,

  tooth: css`
    position: absolute;
    top: -2px;
    left: 50%;
    width: 3px;
    height: 8px;
    transform-origin: bottom center;
    border-radius: 1px;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    margin-left: -1.5px;
  `,

  gearHub: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30%;
    height: 30%;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    z-index: 2;
  `,

  hubJewel: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40%;
    height: 40%;
    border-radius: 50%;
    box-shadow: 
      0 0 8px rgba(255, 255, 255, 0.8),
      inset 0 0 4px rgba(0, 0, 0, 0.5);
    animation: hubPulse 2s ease-in-out infinite;
    
    @keyframes hubPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
    }
  `,

  gearSpokes: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    z-index: 1;
  `,

  spoke: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 40%;
    transform-origin: bottom center;
    margin-left: -1px;
    margin-top: -20%;
    opacity: 0.6;
  `,

  sparkContainer: css`
    position: absolute;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    animation: sparkBurst 3s ease-in-out infinite;
    
    @keyframes sparkBurst {
      0%, 80% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
      90% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
    }
  `,

  sparkCore: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 
      0 0 10px #ffffff,
      0 0 20px ${colors.neonTeal},
      0 0 30px ${colors.neonGold};
    animation: sparkCore 0.5s ease-in-out infinite alternate;
    
    @keyframes sparkCore {
      from { transform: translate(-50%, -50%) scale(0.8); }
      to { transform: translate(-50%, -50%) scale(1.2); }
    }
  `,

  sparkRay: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 8px;
    background: linear-gradient(
      to top,
      transparent 0%,
      #ffffff 50%,
      transparent 100%
    );
    transform-origin: bottom center;
    margin-left: -1px;
    animation: sparkRay 0.3s ease-in-out infinite alternate;
    
    @keyframes sparkRay {
      from { transform: scaleY(0.5); opacity: 0.5; }
      to { transform: scaleY(1.5); opacity: 1; }
    }
  `,

  linkageContainer: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  `,

  linkage: css`
    position: absolute;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 20%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0.3) 80%,
      transparent 100%
    );
    border-radius: 2px;
    box-shadow: 
      0 0 5px rgba(255, 255, 255, 0.3),
      inset 0 0 2px rgba(0, 0, 0, 0.5);
    animation: linkagePulse 2s ease-in-out infinite;
    
    @keyframes linkagePulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
  `
};

export default GearSystem;
