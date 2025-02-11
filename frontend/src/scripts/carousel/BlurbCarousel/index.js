import React, { useEffect, useState } from 'react';

import adequate from '../../../assets/adequate.png';
import clickandone from '../../../assets/clickandone.png';
import styles from './styles';
import yippeekiAI from '../../../assets/yippeekiAI.png';

const blurbs = [
  { id: 1, type: 'text', text: 'Flawless filing filed in a flash' },
  { id: 2, type: 'quote', text: 'Carefully crafted colorful content catalogued cleanly.' },
  { id: 3, type: 'image', img: adequate },
  { id: 4, type: 'text', text: 'Elegant AI-powered analysis at your fingertips.' },
  { id: 5, type: 'tip', text: 'Compress compendiums into concisely condensed customized columns' },
  { id: 6, type: 'quote', text: 'Transform your inventory management with AI precision' },
  { id: 7, type: 'image', img: yippeekiAI },
  { id: 8, type: 'text', text: 'Click and done!' },
  { id: 9, type: 'image', img: clickandone },
];

const BlurbCarousel = () => {
  const [currentBlurbIndex, setCurrentBlurbIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('active');

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextBlurb();
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [currentBlurbIndex]);

  const handleNextBlurb = () => {
    setAnimationClass('');
    setTimeout(() => {
      setCurrentBlurbIndex((prevIndex) => (prevIndex + 1) % blurbs.length);
      setAnimationClass('active');
    }, 500); // Match the CSS transition duration
  };

  const renderBlurb = (blurb) => {
    switch (blurb.type) {
      case 'text':
        return (
          <div css={styles.blurb} className={`text ${animationClass}`}>
            <p>{blurb.text}</p>
          </div>
        );
      case 'quote':
        return (
          <div css={styles.blurb} className={`quote ${animationClass}`}>
            <blockquote>{blurb.text}</blockquote>
          </div>
        );
      case 'tip':
        return (
          <div css={styles.blurb} className={`tip ${animationClass}`}>
            <p>
              <span className="tip-label">TIP:</span>
              {blurb.text}
            </p>
          </div>
        );
      case 'image':
        return (
          <div css={styles.blurb} className={`image ${animationClass}`}>
            <img src={blurb.img} alt="Blurb visual" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div css={styles.container}>
      {blurbs.map((blurb, index) => (
        <React.Fragment key={blurb.id}>
          {index === currentBlurbIndex && renderBlurb(blurb)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BlurbCarousel;
