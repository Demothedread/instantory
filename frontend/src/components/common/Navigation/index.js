import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import styles from './styles';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close navigation when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/about', label: 'About', icon: 'i️' },
    { path: '/kaboodles', label: 'Kaboodles', icon: '📦' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/terms', label: 'Terms', icon: '📜' },
  ];

  return (
    <>
      <button 
        css={[styles.toggle, isOpen && 'open']}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span css={styles.toggleIcon} />
      </button>

      <nav css={[styles.container, isOpen && 'open']}>
        <div css={styles.header}>
          <h1 css={styles.logo}>Bartleby</h1>
        </div>

        <div css={styles.menu}>
          {navItems.map((item) => (
            <div key={item.path} css={styles.menuItem}>
              <Link
                to={item.path}
                css={[styles.link, location.pathname === item.path && 'active']}
              >
                <span css={styles.icon}>{item.icon}</span>
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
