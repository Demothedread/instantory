import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import './ProcessImagesButton.css';

function ProcessImagesButton({ onProcess }) {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [instruction, setInstruction] = useState('You are an assistant that helps catalog and analyze both products and documents for inventory.');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 20) {
      setErrorMessage('Maximum 20 files allowed at once');
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
      setErrorMessage('Please select files to process.');
      return;
    }
    setIsUploading(true);
    setErrorMessage('');
    const formData = new FormData();

    const maxFileSize = 25 * 1024 * 1024; // 25MB limit for documents
    let validFiles = true;

    selectedFiles.forEach((file) => {
      if (file.size <= maxFileSize) {
        formData.append('files', file);
      } else {
        validFiles = false;
        setErrorMessage(`File ${file.name} exceeds 25MB size limit`);
      }
    });

    if (!validFiles) {
      setIsUploading(false);
      return;
    }

    formData.append('instruction', instruction);

    try {
      const response = await axios.post(`${config.apiUrl}/process-files`, formData, {
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      if (response.data.status === 'success') {
        alert('Files processed successfully!');
        if (onProcess) {
          await onProcess();
        }
        setSelectedFiles(null);
        document.getElementById('file-upload').value = '';
      } else {
        throw new Error(response.data.message || 'An error occurred during file processing.');
      }
    } catch (error) {
      console.error('Error processing files:', error);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while processing the files. Please try again.'
      );
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
          placeholder="Enter custom instruction for file interpretation"
          aria-label="Custom instruction for file interpretation"
          disabled={isUploading}
        />
      </div>
      <div className="file-upload-section">
        <label htmlFor="file-upload">Choose files to process (max 20 files, 25MB each):</label>
        <input 
          id="file-upload"
          type="file" 
          multiple 
          onChange={handleFileChange} 
          accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
          aria-label="Choose files to process"
          disabled={isUploading}
        />
        <div className="file-types-info">
          Supported file types:
          <ul>
            <li>Images (JPG, PNG, GIF, WebP)</li>
            <li>Documents (PDF, DOC, DOCX, TXT, RTF)</li>
          </ul>
        </div>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <button 
        onClick={handleProcess} 
        disabled={isUploading || !selectedFiles || !instruction.trim()}
        className="process-button"
      >
        {isUploading ? 'Processing...' : 'Process Files'}
      </button>
    </div>
  );
}

export default ProcessImagesButton;
