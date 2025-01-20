import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const Home = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Welcome to Bartleby</h1>
        
        <div className="content-section">
          <h2>Intelligent Document Management</h2>
          <p>
            Transform your document and inventory management with our AI-powered platform. 
            Bartleby combines cutting-edge technology with elegant design to create a 
            seamless experience for organizing and analyzing your documents and images.
          </p>
        </div>

        <div className="feature-grid">
          <Link to="/kaboodles" className="feature-card">
            <h3>Kaboodles</h3>
            <p>Organize and manage your collections with our intelligent categorization system</p>
          </Link>

          <Link to="/documents" className="feature-card">
            <h3>Document Library</h3>
            <p>Access and analyze your documents with our powerful search and processing tools</p>
          </Link>

          <Link to="/images" className="feature-card">
            <h3>Image Gallery</h3>
            <p>View and manage your processed images in our beautifully designed gallery</p>
          </Link>

          <Link to="/resources" className="feature-card">
            <h3>Resources</h3>
            <p>Discover helpful guides and tutorials to make the most of Bartleby</p>
          </Link>
        </div>

        <div className="content-section">
          <h2>Getting Started</h2>
          <p>
            Begin by uploading your documents or images to Bartleby. Our AI will analyze 
            your content and organize it intelligently. Use our powerful search features 
            to find exactly what you need, when you need it.
          </p>
          <div className="action-buttons">
            <Link to="/about" className="neo-decoroco-button">Learn More</Link>
            <button className="neo-decoroco-button primary">Start Processing</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
