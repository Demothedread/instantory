import React, { useEffect, useRef } from 'react';
import '../components/LoginOverlay.css';

const LoginAnimation = ({ isVisible, children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const loginModal = container.querySelector('.login-modal');

    if (loginModal) {
      loginModal.style.opacity = '1';
      loginModal.style.transform = 'translateY(0)';
      
      // Add floating animation
      loginModal.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
        { transform: 'translateY(0)' }
      ], {
        duration: 3000,
        iterations: Infinity,
        easing: 'ease-in-out'
      });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="login-overlay">
      <div className="background-overlay"></div>
      {children}
    </div>
  );
};

export default LoginAnimation;
