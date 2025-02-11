import React, { useEffect, useRef } from 'react';

import styles from './styles';

const LoginAnimation = ({ isVisible, children }) => {
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !modalRef.current || !isVisible) return;

    const container = containerRef.current;
    const modal = modalRef.current;

    // Reset styles before applying new ones
    modal.style.opacity = '1';
    modal.style.transform = 'translateY(0)';

    // Start the floating animation
    const floatingAnimation = modal.animate(
      [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' }
      ],
      {
        duration: 3000,
        iterations: Infinity,
        easing: 'ease-in-out'
      }
    );

    // Add shimmer effect
    const shimmerAnimation = modal.animate(
      [
        { 
          backgroundPosition: '-200% 0',
          opacity: 0.5
        },
        {
          backgroundPosition: '200% 0',
          opacity: 1
        }
      ],
      {
        duration: 3000,
        iterations: Infinity,
        easing: 'ease-in-out'
      }
    );

    // Cleanup function to stop animations when component unmounts
    return () => {
      floatingAnimation.cancel();
      shimmerAnimation.cancel();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div css={styles.overlay} ref={containerRef} className="show">
      <div css={styles.backgroundOverlay} />
      <div css={[styles.modal, styles.floatingAnimation]} ref={modalRef}>
        {children}
      </div>
    </div>
  );
};

export default LoginAnimation;
