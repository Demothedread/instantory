import React, { useEffect, useRef } from 'react';
import '../components/LoginOverlay.css';

const LoginAnimation = ({ isVisible, children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const container = containerRef.current;
    const loginModal = container.querySelector('.login-modal');

    if (loginModal) {
      // Set initial position
      loginModal.style.opacity = '0';
      loginModal.style.transform = 'translateY(100vh)';

      // Animate the fly-in effect
      loginModal.animate([
        { 
          opacity: 0,
          transform: 'translateY(100vh)'
        },
        { 
          opacity: 1,
          transform: 'translateY(0)'
        }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Custom easing for a bouncy effect
        fill: 'forwards'
      });

      // Add floating animation after fly-in
      setTimeout(() => {
        loginModal.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-10px)' },
          { transform: 'translateY(0)' }
        ], {
          duration: 3000,
          iterations: Infinity,
          easing: 'ease-in-out'
        });
      }, 1000);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="login-overlay">
      <div className="background-overlay"></div>
      <div className="login-modal">
        {children}
      </div>
    </div>
  );
};

export default LoginAnimation;
