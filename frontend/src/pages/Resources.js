import React, { useState } from 'react';
import './Pages.css';

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('guides');

  const resources = {
    guides: [
      {
        title: "Getting Started with Bartleby",
        description: "Learn the basics of document and inventory management",
        timeToRead: "5 min",
        difficulty: "Beginner"
      },
      {
        title: "Advanced AI Processing",
        description: "Master the AI-powered features for better organization",
        timeToRead: "10 min",
        difficulty: "Advanced"
      },
      {
        title: "Organizing Collections",
        description: "Best practices for managing your Kaboodles",
        timeToRead: "7 min",
        difficulty: "Intermediate"
      }
    ],
    tutorials: [
      {
        title: "Batch Processing Tutorial",
        description: "Process multiple documents efficiently",
        format: "Video",
        duration: "8 min"
      },
      {
        title: "Custom Tags Workshop",
        description: "Create and manage custom tags for better organization",
        format: "Interactive",
        duration: "15 min"
      }
    ],
    faq: [
      {
        question: "What file types are supported?",
        answer: "Bartleby supports a wide range of document and image formats including PDF, DOCX, JPG, PNG, and more."
      },
      {
        question: "How does AI categorization work?",
        answer: "Our AI analyzes content, metadata, and patterns to automatically categorize items into appropriate collections."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, we use enterprise-grade encryption and security measures to protect your data."
      }
    ]
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Resources</h1>

        <div className="content-section">
          <h2>Learning Center</h2>
          <p>
            Explore our comprehensive resources to make the most of Bartleby's features. 
            From beginner guides to advanced tutorials, we've got you covered.
          </p>
        </div>

        <div className="resources-navigation">
          <button 
            className={`resource-tab ${activeCategory === 'guides' ? 'active' : ''}`}
            onClick={() => setActiveCategory('guides')}
          >
            Guides
          </button>
          <button 
            className={`resource-tab ${activeCategory === 'tutorials' ? 'active' : ''}`}
            onClick={() => setActiveCategory('tutorials')}
          >
            Tutorials
          </button>
          <button 
            className={`resource-tab ${activeCategory === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveCategory('faq')}
          >
            FAQ
          </button>
        </div>

        <div className="resources-content">
          {activeCategory === 'guides' && (
            <div className="guides-grid">
              {resources.guides.map((guide, index) => (
                <div key={index} className="resource-card">
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <div className="resource-meta">
                    <span className="time">{guide.timeToRead}</span>
                    <span className="difficulty">{guide.difficulty}</span>
                  </div>
                  <button className="neo-decoroco-button small">Read Guide</button>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'tutorials' && (
            <div className="tutorials-grid">
              {resources.tutorials.map((tutorial, index) => (
                <div key={index} className="resource-card">
                  <h3>{tutorial.title}</h3>
                  <p>{tutorial.description}</p>
                  <div className="resource-meta">
                    <span className="format">{tutorial.format}</span>
                    <span className="duration">{tutorial.duration}</span>
                  </div>
                  <button className="neo-decoroco-button small">Start Tutorial</button>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'faq' && (
            <div className="faq-accordion">
              {resources.faq.map((item, index) => (
                <div key={index} className="faq-item">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-section">
          <h2>Need More Help?</h2>
          <div className="support-options">
            <div className="support-card">
              <h3>Contact Support</h3>
              <p>Our team is here to help you with any questions or issues.</p>
              <button className="neo-decoroco-button">Get Support</button>
            </div>
            <div className="support-card">
              <h3>Community Forum</h3>
              <p>Connect with other users and share experiences.</p>
              <button className="neo-decoroco-button">Join Discussion</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
