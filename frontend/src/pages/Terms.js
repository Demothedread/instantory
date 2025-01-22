import React from 'react';
import './Pages.css';

const Terms = () => {
  return (
    <div className="page-container terms-page">
      <div className="page-content">
        <h1 className="page-title">Terms and Conditions</h1>
        
        <div className="terms-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Bartleby ("we," "our," or "us"). By accessing or using our service, 
            you agree to be bound by these Terms and Conditions. Please read them carefully.
          </p>
        </div>

        <div className="terms-section">
          <h2>2. Service Description</h2>
          <p>
            Bartleby provides an AI-powered document and inventory management system that helps 
            users organize, analyze, and extract information from documents and images.
          </p>
        </div>

        <div className="terms-section">
          <h2>3. User Data & Privacy</h2>
          <p>
            We take your privacy seriously. All uploaded documents and images are processed 
            securely and stored with enterprise-grade encryption. We do not share your data 
            with third parties without your explicit consent.
          </p>
          <ul className="terms-list">
            <li>Your data is stored securely on our servers</li>
            <li>Data is encrypted both in transit and at rest</li>
            <li>You maintain ownership of all uploaded content</li>
            <li>You can request data deletion at any time</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>4. Acceptable Use</h2>
          <p>
            You agree not to use Bartleby for any unlawful purposes or in any way that could 
            damage, disable, or impair our service.
          </p>
        </div>

        <div className="terms-section">
          <h2>5. AI Processing</h2>
          <p>
            Our service utilizes artificial intelligence to process and analyze your content. 
            While we strive for accuracy, you acknowledge that:
          </p>
          <ul className="terms-list">
            <li>AI analysis may not be 100% accurate</li>
            <li>Results should be reviewed for critical applications</li>
            <li>We continuously improve our AI models</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>6. Intellectual Property</h2>
          <p>
            The Bartleby service, including its original content, features, and functionality, 
            is owned by us and protected by international copyright, trademark, and other 
            intellectual property laws.
          </p>
        </div>

        <div className="terms-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages resulting from your use 
            of our service.
          </p>
        </div>

        <div className="terms-section">
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of 
            any material changes via email or through our service.
          </p>
        </div>

        <div className="terms-section">
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about these Terms and Conditions, please contact us at:
            <br />
            <a href="mailto:support@bartleby.ai" className="contact-link">support@bartleby.ai</a>
          </p>
        </div>

        <div className="terms-footer">
          <p>Last updated: January 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
