import React from 'react';
import './Pages.css';

const About = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">About Bartleby</h1>
        <div className="content-section">
          <h2>Your Digital Inventory Assistant</h2>
          <p>
            Bartleby is an advanced document and inventory management system that combines 
            the power of AI with elegant design. Our platform helps you organize, analyze, 
            and extract valuable information from your documents and images with ease.
          </p>
        </div>

        <div className="content-section">
          <h2>Our Mission</h2>
          <p>
            We strive to simplify document management while maintaining the highest 
            standards of security and efficiency. Our unique blend of art deco elegance 
            and modern functionality creates an experience that's both beautiful and 
            practical.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>AI-Powered Analysis</h3>
            <p>Advanced machine learning algorithms process your documents with precision</p>
          </div>
          <div className="feature-card">
            <h3>Secure Storage</h3>
            <p>Enterprise-grade security keeps your data safe and accessible</p>
          </div>
          <div className="feature-card">
            <h3>Smart Organization</h3>
            <p>Intelligent categorization and tagging for easy retrieval</p>
          </div>
          <div className="feature-card">
            <h3>Beautiful Interface</h3>
            <p>Art deco inspired design meets modern functionality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
