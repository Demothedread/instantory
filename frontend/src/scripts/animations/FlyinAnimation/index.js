import React, { useEffect, useRef } from 'react';

import brassButton from '../../../assets/buttons/BrassButton.png';
import placeholder from '../../../assets/icons/placeholder.png';
import styles from './styles';

const FlyinAnimation = () => {
  const containerRef = useRef(null);

  const items = [
    { type: 'image', src: brassButton },
    { type: 'text', content: 'Elegant AI-Powered Analysis' },
    { type: 'image', src: placeholder },
    { type: 'text', content: 'One Click. Done.' },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const flyItems = [];
    const viewportWidth = window.innerWidth * 0.8; // Limit to 80% of viewport
    const viewportHeight = window.innerHeight;

    items.forEach((item, index) => {
      // Create fly item element
      const flyItem = document.createElement('div');
      flyItem.css = styles.flyItem;

      // Add content based on item type
      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = 'Decorative element';
        img.css = styles.flyImage;
        flyItem.appendChild(img);
      } else {
        const text = document.createElement('p');
        text.textContent = item.content;
        text.css = styles.flyText;
        flyItem.appendChild(text);
      }

      // Set initial position off-screen
      const startX = Math.random() * viewportWidth;
      flyItem.style.left = `${startX}px`;
      flyItem.style.top = `${viewportHeight + 150}px`; // Start below viewport

      container.appendChild(flyItem);
      flyItems.push(flyItem);

      // Animate with staggered timing
      setTimeout(() => {
        const finalY = Math.random() * (viewportHeight * 0.5); // Top half of screen
        const duration = 5000 + (Math.random() * 2000); // 5-7 seconds
        const delay = index * 800; // Stagger by 800ms

        // Apply animations
        flyItem.animate([
          { transform: 'translateY(0) rotate(0) scale(1)' },
          { transform: `translateY(-${viewportHeight - finalY}px) rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})` }
        ], {
          duration,
          delay,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });

        // Add floating animation
        flyItem.style.animation = `${styles.float} ${3 + Math.random() * 2}s ease-in-out infinite`;
      }, index * 800);
    });

    // Cleanup
    return () => {
      flyItems.forEach(item => {
        if (item.parentNode === container) {
          container.removeChild(item);
        }
      });
    };
  }, [items]);

  return <div ref={containerRef} css={styles.container} />;
};

export default FlyinAnimation;
