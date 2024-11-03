import React, { useState } from 'react';
import axios from 'axios';
import './ProcessImagesButton.css';

function ProcessImagesButton({ onProcess }) {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [instruction, setInstruction] = useState('You are an assistant that helps catalog and describe products for inventory.');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 20) {
      setErrorMessage('Maximum 20 images allowed at once');
      return;
    }
    setSelectedFiles(files);
    setErrorMessage('');
  };

  const handleInstructionChange = (event) => {
    setInstruction(event.target.value);
    setErrorMessage('');
  };

  const handleProcess = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setErrorMessage('Please select image files to process.');
      return;
    }
    setIsUploading(true);
    setErrorMessage('');
    const formData = new FormData();

    const maxFileSize = 10 * 1024 * 1024; // 10MB limit
    let validFiles = true;

    selectedFiles.forEach((file) => {
      if (file.size <= maxFileSize) {
        formData.append('images', file);
      } else {
        validFiles = false;
        setErrorMessage(`File ${file.name} exceeds 10MB size limit`);
      }
    });

    if (!validFiles) {
      setIsUploading(false);
      return;
    }

    formData.append('instruction', instruction);

    try {
      const response = await axios.post('${process.env.PUBLIC_BACKEND_URL}/process-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      if (response.data.status === 'success') {
        alert('Images processed successfully!');
        onProcess();
        setSelectedFiles(null);
        document.getElementById('file-upload').value = '';
      } else {
        setErrorMessage(`Error processing images: ${response.data.message || 'An error occurred during image processing.'}`);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred while processing the images.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="process-images-container">
      <div className="instruction-section">
        <label htmlFor="instruction-input">Custom Instruction:</label>
        <input
          id="instruction-input"
          type="text"
          value={instruction}
          onChange={handleInstructionChange}
          placeholder="Enter custom instruction for image interpretation"
          aria-label="Custom instruction for image interpretation"
          disabled={isUploading}
        />
      </div>
      <div className="file-upload-section">
        <label htmlFor="file-upload">Choose files to process (max 20 images, 10MB each):</label>
        <input 
          id="file-upload"
          type="file" 
          multiple 
          onChange={handleFileChange} 
          accept="image/*"
          aria-label="Choose files to process"
          disabled={isUploading}
        />
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button 
        onClick={handleProcess} 
        disabled={isUploading || !selectedFiles || !instruction.trim()}
        className="process-button"
      >
        {isUploading ? 'Processing...' : 'Process Images'}
      </button>
    </div>
  );
}

export default ProcessImagesButton;