import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close navigation when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/about', label: 'About', icon: 'ℹ️' },
    { path: '/kaboodles', label: 'Kaboodles', icon: '📦' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/privacy', label: 'Privacy', icon: '🔒' },
  ];

  return (
    <>
      <button 
        className={`nav-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span className="nav-toggle-icon"></span>
      </button>

      <nav className={`nav-container ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <h1 className="nav-logo">Bartleby</h1>
        </div>

        <div className="nav-menu">
          {navItems.map((item) => (
            <div key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
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
