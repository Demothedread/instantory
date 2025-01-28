import React, { useEffect, useRef } from 'react';
import '../components/LoginOverlay.css';

const LoginAnimation = ({ isVisible, children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const container = containerRef.current;
    const loginModal = container.querySelector('.login-modal');

    if (loginModal) {
      // Reset styles before applying new ones
      loginModal.style.opacity = '1';
      loginModal.style.transform = 'translateY(0)';
      
      // Start the floating animation
      const animation = loginModal.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' }
      ], {
        duration: 3000,
        iterations: Infinity,
        easing: 'ease-in-out'
      });

      // Cleanup function to stop animation when component unmounts
      return () => {
        animation.cancel();
      };
    }
  }, [isVisible]); // Add isVisible as a dependency

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="login-overlay">
      <div className="background-overlay"></div>
      <div className="login-modal">{children}</div>
    </div>
  );
};

export default LoginAnimation;
