import React, { useState } from 'react';
import axios from 'axios';
import { put } from '@vercel/blob';
import config from '../config';
import './ProcessImagesButton.css';

function ProcessImagesButton({ onProcess, isAuthenticated }) {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [isInstructionFocused, setIsInstructionFocused] = useState(false);
  const defaultInstruction = 'I am an AI assistant that helps catalog and analyze products and documents. For products, I will extract details, write SEO-optimized descriptions and suggest pricing. For documents, I will analyze content, identify key themes, extract metadata, and provide summaries.';
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [taskId, setTaskId] = useState(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 20) {
      setErrorMessage('Maximum 20 files allowed at once');
      return;
    }

    // Validate file types
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/heic',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/rtf'
    ];

    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setErrorMessage(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Validate file sizes
    const maxSize = 25 * 1024 * 1024; // 25MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setErrorMessage(`Files exceeding 25MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setSelectedFiles(files);
    setErrorMessage('');
    setUploadProgress(0);
    setProcessingProgress(0);
    setProcessingStatus('');

    // Show file type counts
    const imageCount = files.filter(f => f.type.startsWith('image/')).length;
    const docCount = files.filter(f => !f.type.startsWith('image/')).length;
    setProcessingStatus(`Selected ${imageCount} image${imageCount !== 1 ? 's' : ''} and ${docCount} document${docCount !== 1 ? 's' : ''}`);
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

    try {
      // Upload files to Vercel Blob
      const uploadPromises = selectedFiles.map(async (file) => {
        const blob = await put(file.name, file, {
          access: 'public',
          token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN,
          handleUploadUrl: (url) => {
            console.log('Upload URL:', url);
            return url;
          },
        });
        return { 
          originalName: file.name, 
          blobUrl: blob.url,
          fileType: file.type.startsWith('image/') ? 'image' : 'document'
        };
      });

      setUploadProgress(50);
      const uploadedFiles = await Promise.all(uploadPromises);
      setUploadProgress(100);

      // Send blob URLs to backend
      const response = await axios.post(`${config.apiUrl}/process-files`, {
        files: uploadedFiles,
        instruction: instruction,
        fileTypes: {
          images: uploadedFiles.filter(f => f.fileType === 'image').map(f => ({ originalName: f.originalName, blobUrl: f.blobUrl })),
          documents: uploadedFiles.filter(f => f.fileType === 'document').map(f => ({ originalName: f.originalName, blobUrl: f.blobUrl }))
        }
      }, {
        headers: {
          ...config.headers,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.status === 'success') {
        setTaskId(response.data.task_id);
        setUploadProgress(100);
        setProcessingStatus('Processing files...');
        pollProcessingStatus(response.data.task_id);
      } else {
        throw new Error(response.data.message || 'An error occurred during file processing.');
      }
    } catch (error) {
      console.error('Error processing files:', error);
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'An error occurred while processing the files. Please try again.'
      );
      setIsUploading(false);
    }
  };

  const pollProcessingStatus = (taskID) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await axios.get(`${config.apiUrl}/processing-status/${taskID}`, {
          headers: {
            ...config.headers
          },
          withCredentials: true
        });

        if (statusResponse.data.status === 'completed') {
          setProcessingProgress(100);
          setProcessingStatus('Processing complete!');
          clearInterval(interval);
          alert('Files processed successfully!');
          if (onProcess) {
            await onProcess();
          }
          setSelectedFiles(null);
          document.getElementById('file-upload').value = '';
          setUploadProgress(0);
          setProcessingProgress(0);
          setProcessingStatus('');
          setIsUploading(false);
          // Auto-reload the page
          window.location.reload();
        } else if (statusResponse.data.status === 'failed') {
          setErrorMessage('An error occurred during processing.');
          clearInterval(interval);
          setIsUploading(false);
        } else {
          // Update processing progress and status
          setProcessingProgress(statusResponse.data.progress);
          setProcessingStatus(statusResponse.data.message);
        }
      } catch (error) {
        console.error('Error getting processing status:', error);
        setErrorMessage('An error occurred while getting processing status.');
        setIsUploading(false);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
  };

  return (
    <div className="process-images-container">
      {!isAuthenticated ? (
        <div className="auth-message neo-decoroco-panel">
          <div className="auth-icon">🔒</div>
          <p>Please sign in to process files</p>
        </div>
      ) : (
        <>
          <div className="instruction-section">
            <label htmlFor="instruction-input">Instructions:</label>
            <input
              type="text"
              id="instruction-input"
              value={isInstructionFocused || instruction ? instruction : defaultInstruction}
              onChange={handleInstructionChange}
              onFocus={() => {
                setIsInstructionFocused(true);
                if (!instruction) setInstruction('');
              }}
              onBlur={() => {
                setIsInstructionFocused(false);
                if (!instruction.trim()) setInstruction('');
              }}
              placeholder="Enter custom instruction for file interpretation"
              disabled={isUploading}
              className="instruction-input"
            />
          </div>
          <div className="file-upload-section">
            <div className="file-types-info">
              <h3>Supported File Types</h3>
              <ul>
                <li>Images: JPEG, PNG, WebP, HEIC</li>
                <li>Documents: PDF, DOC, DOCX, TXT, RTF</li>
              </ul>
            </div>
            <div className="upload-controls">
              <input 
                id="file-upload"
                type="file" 
                multiple 
                onChange={handleFileChange} 
                accept="image/jpeg,image/png,image/webp,image/heic,.pdf,.doc,.docx,.txt,.rtf"
                disabled={isUploading}
                className="file-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="file-upload-label">
                Choose Files
              </label>
              {selectedFiles && (
                <div className="file-info">
                  <span className="file-count">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="file-breakdown">
                    {processingStatus}
                  </div>
                </div>
              )}
            </div>
          </div>
          {errorMessage && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              {errorMessage}
            </div>
          )}
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-label">
                {uploadProgress < 100 ? 'Uploading Files...' : 'Processing Files...'}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div 
                    className="progress-bar-mascot"
                    style={{ left: `calc(${uploadProgress}% - 40px)` }}
                  ></div>
                  {uploadProgress}%
                </div>
              </div>
              {uploadProgress === 100 && (
                <>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${processingProgress}%` }}
                    >
                      <div 
                        className="progress-bar-mascot"
                        style={{ left: `calc(${processingProgress}% - 40px)` }}
                      ></div>
                      {processingProgress}%
                    </div>
                  </div>
                  <div className="processing-status">
                    {processingStatus}
                  </div>
                </>
              )}
            </div>
          )}
          <button 
            onClick={handleProcess} 
            disabled={!isAuthenticated || isUploading || !selectedFiles || !instruction.trim()}
            className="process-button"
          >
            {isUploading ? 'Processing...' : 'Process Files'}
          </button>
        </>
      )}
    </div>
  );
}

export default ProcessImagesButton;
