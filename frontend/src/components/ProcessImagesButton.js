import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';
import './ProcessImagesButton.css';

function ProcessImagesButton({ onProcess }) {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [instruction, setInstruction] = useState('You are an assistant that helps catalog and analyze both products and documents for inventory.');
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
    setSelectedFiles(files);
    setErrorMessage('');
    setUploadProgress(0);
    setProcessingProgress(0);
    setProcessingStatus('');
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
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
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

  const pollProcessingStatus = (taskId) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await axios.get(`${config.apiUrl}/processing-status/${taskId}`, {
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
          className="instruction-input"
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
          className="file-input"
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
      {isUploading && (
        <>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${uploadProgress}%` }}
            >
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
                  {processingProgress}%
                </div>
              </div>
              <div className="processing-status">
                {processingStatus}
              </div>
            </>
          )}
        </>
      )}
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