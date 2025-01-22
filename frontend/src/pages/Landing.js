import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const Landing = () => {
  return (
    <div className="page-container landing-page">
      <div className="landing-hero">
        <div className="mascot-container">
          <img 
            src="/assets/1216BartMascotNoBkg/1216BartMascotNoBkg.png" 
            alt="Bartleby Mascot"
            className="hero-mascot"
          />
        </div>
        <h1 className="hero-title">Welcome to Bartleby</h1>
        <p className="hero-subtitle">Your AI-Powered Document & Inventory Assistant</p>
        <div className="hero-actions">
          <Link to="/login" className="neo-decoroco-button primary">Get Started</Link>
          <Link to="/about" className="neo-decoroco-button">Learn More</Link>
        </div>
      </div>

      <div className="feature-highlights">
        <div className="feature-card">
          <div className="feature-icon document-icon"></div>
          <h3>Smart Document Analysis</h3>
          <p>Upload documents and let our AI extract key information, summaries, and insights automatically.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon inventory-icon"></div>
          <h3>Inventory Management</h3>
          <p>Organize and track your inventory with AI-powered categorization and detailed analytics.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon export-icon"></div>
          <h3>Easy Export</h3>
          <p>Export your organized data in multiple formats for seamless integration with other tools.</p>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload</h3>
            <p>Upload your documents or inventory images</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Process</h3>
            <p>Our AI analyzes and organizes your content</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Organize</h3>
            <p>View and manage your organized data</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Export</h3>
            <p>Export your data in your preferred format</p>
          </div>
        </div>
      </div>

      <div className="testimonials">
        <h2>What Users Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"Bartleby has revolutionized how we manage our research documents. The AI-powered analysis is incredibly accurate."</p>
            <div className="testimonial-author">- Research Director</div>
          </div>
          <div className="testimonial-card">
            <p>"The inventory management system is intuitive and powerful. It's saved us countless hours of manual work."</p>
            <div className="testimonial-author">- Small Business Owner</div>
          </div>
          <div className="testimonial-card">
            <p>"The ability to quickly organize and search through documents has made our workflow so much more efficient."</p>
            <div className="testimonial-author">- Project Manager</div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who are already experiencing the power of AI-assisted organization.</p>
        <Link to="/login" className="neo-decoroco-button primary large">Start Organizing Today</Link>
      </div>

      <footer className="landing-footer">
        <div className="footer-links">
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-mascot">
          <img 
            src="/assets/1216BartMascotNoBkg/1216BartMascotNoBkgQuarter.png" 
            alt="Bartleby"
            className="footer-mascot-image"
          />
        </div>
      </footer>
    </div>
  );
};

export default Landing;
