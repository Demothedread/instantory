import React from 'react';
import './HowToUseOverlay.css';

function HowToUseOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="overlay-section">
          <h2 className="section-header">About</h2>
          <p>
            Bartleby is a simple, intuitive tool that utilizes chatGPT to automatically categorize 
            and describe up to 20 text or image files at a time. It's designed to streamline your 
            inventory management process with powerful AI assistance.
          </p>
        </div>

        <div className="overlay-section">
          <h2 className="section-header">Instructions</h2>
          <ol>
            <li>
              <strong>Upload Files:</strong> Select up to 20 files (images or documents) to process. 
              Each file must be under 25MB.
            </li>
            <li>
              <strong>Image Processing:</strong> For images, Bartleby will create an elegant 
              <strong>IMAGE GALLERY</strong> with SEO-optimized descriptions, dimensions, materials, 
              and suggested MSRP for each image.
            </li>
            <li>
              <strong>Document Processing:</strong> For documents, Bartleby will provide summaries, 
              extract metadata, and organize both category and key tags into a searchable 
              <strong>DOCUMENT LIBRARY</strong>.
            </li>
            <li>
              <strong>Custom Tables:</strong> Create your own tables with unique headers - Bartleby 
              will adapt its analysis accordingly.
            </li>
            <li>
              <strong>Export Options:</strong> Download your processed data as CSV or Excel files 
              for easy integration with your existing systems.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default HowToUseOverlay;
