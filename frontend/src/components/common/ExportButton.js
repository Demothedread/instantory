import { css } from '@emotion/react';
import { useState } from 'react';
import layout from '../../styles/layouts/constraints';
import { colors } from '../../styles/theme/colors';
import { typography } from '../../styles/theme/typography';

const ExportButton = ({ data, filename, includeTypes = ['csv', 'json'] }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportStyles = css`
    position: relative;
    display: inline-block;
    
    .export-trigger {
      background: ${colors.darkGradient};
      border: 1px solid ${colors.border};
      border-radius: 6px;
      color: ${colors.textLight};
      font-family: ${typography.fonts.modern};
      font-size: ${typography.sizes.sm};
      padding: ${layout.spacing.sm} ${layout.spacing.md};
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: ${layout.spacing.sm};
      
      &:hover:not(:disabled) {
        background: ${colors.neonTeal};
        color: ${colors.dark};
        border-color: ${colors.neonTeal};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      
      .export-icon {
        font-size: ${typography.sizes.md};
      }
      
      .dropdown-arrow {
        font-size: ${typography.sizes.xs};
        margin-left: ${layout.spacing.xs};
      }
    }
    
    .export-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: ${layout.spacing.xs};
      background: ${colors.darkGradient};
      border: 1px solid ${colors.border};
      border-radius: 6px;
      min-width: 150px;
      z-index: ${layout.zIndex.dropdown};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      
      .export-option {
        width: 100%;
        background: transparent;
        border: none;
        color: ${colors.textLight};
        font-family: ${typography.fonts.modern};
        font-size: ${typography.sizes.sm};
        padding: ${layout.spacing.sm} ${layout.spacing.md};
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: ${layout.spacing.sm};
        
        &:hover {
          background: ${colors.neonTeal};
          color: ${colors.dark};
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          
          &:hover {
            background: transparent;
            color: ${colors.textLight};
          }
        }
        
        .option-icon {
          font-size: ${typography.sizes.md};
        }
        
        .option-label {
          flex: 1;
        }
        
        .option-description {
          font-size: ${typography.sizes.xs};
          opacity: 0.7;
        }
      }
    }
  `;

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    if (!data || data.length === 0) return;
    
    setIsExporting(true);
    try {
      // Get all unique keys from all objects
      const allKeys = Array.from(new Set(
        data.flatMap(item => Object.keys(item))
      ));
      
      // Create CSV header
      const csvHeader = allKeys.join(',');
      
      // Create CSV rows
      const csvRows = data.map(item => 
        allKeys.map(key => {
          const value = item[key];
          // Handle special characters and quotes in CSV
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      );
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const exportAsJSON = () => {
    if (!data) return;
    
    setIsExporting(true);
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      downloadFile(jsonContent, `${filename}.json`, 'application/json');
    } catch (error) {
      console.error('Error exporting JSON:', error);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const exportAsXLSX = () => {
    // This would require a library like xlsx or exceljs
    // For now, we'll export as CSV with .xlsx extension
    setIsExporting(true);
    try {
      exportAsCSV();
      // TODO: Implement actual XLSX export with proper library
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (type) => {
    switch (type) {
      case 'csv':
        exportAsCSV();
        break;
      case 'json':
        exportAsJSON();
        break;
      case 'xlsx':
        exportAsXLSX();
        break;
      default:
        console.warn('Unknown export type:', type);
    }
  };

  const exportOptions = [
    {
      type: 'csv',
      icon: '📊',
      label: 'CSV',
      description: 'Comma-separated values',
      available: includeTypes.includes('csv')
    },
    {
      type: 'json',
      icon: '📄',
      label: 'JSON',
      description: 'JavaScript Object Notation',
      available: includeTypes.includes('json')
    },
    {
      type: 'xlsx',
      icon: '📗',
      label: 'Excel',
      description: 'Excel spreadsheet',
      available: includeTypes.includes('xlsx')
    }
  ].filter(option => option.available);

  const hasData = data && data.length > 0;

  return (
    <div css={exportStyles}>
      <button
        className="export-trigger"
        onClick={() => setShowDropdown(!showDropdown)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        disabled={!hasData || isExporting}
      >
        <span className="export-icon">💾</span>
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {showDropdown && hasData && (
        <div className="export-dropdown">
          {exportOptions.map(option => (
            <button
              key={option.type}
              className="export-option"
              onClick={() => handleExport(option.type)}
              disabled={isExporting}
            >
              <span className="option-icon">{option.icon}</span>
              <div className="option-content">
                <div className="option-label">{option.label}</div>
                <div className="option-description">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
