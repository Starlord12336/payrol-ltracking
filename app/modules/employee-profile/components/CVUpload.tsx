/**
 * CV Upload Component
 * Allows candidates to upload their CV
 */

'use client';

import { useState } from 'react';
import { Button } from '@/shared/components';
import { ENV } from '@/shared/constants';
import styles from './CVUpload.module.css';

interface CVUploadProps {
  candidateId: string;
  onUploadSuccess?: (documentId: string) => void;
  showHeading?: boolean;
}

export default function CVUpload({ candidateId, onUploadSuccess, showHeading = true }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Frontend validation
    const allowedTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain', // .txt
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, DOC, DOCX, or TXT files are allowed.');
      e.target.value = ''; // Clear the input
      setFile(null);
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      e.target.value = '';
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    // Create FormData
    const formData = new FormData();
    formData.append('file', file); // Field name MUST be 'file'

    try {
      const response = await fetch(
        `${ENV.API_URL}/recruitment/candidates/${candidateId}/upload-cv`,
        {
          method: 'POST',
          // DON'T set Content-Type - browser sets it automatically with boundary
          credentials: 'include', // Include cookies for authentication
          body: formData, // FormData automatically sets multipart/form-data
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      setDocumentId(result._id);
      setSuccess(true);
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById('cv-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result._id);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentId) return;

    try {
      const response = await fetch(
        `${ENV.API_URL}/recruitment/candidates/${candidateId}/cv/${documentId}`,
        {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(errorData.message || 'Download failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFileName = 'cv.pdf';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFileName = filenameMatch[1];
        }
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Download failed');
    }
  };

  return (
    <div className={styles.cvUploadContainer}>
      {showHeading && <h3>CV Management</h3>}

      <div className={styles.uploadSection}>
        <div className={styles.fileInputWrapper}>
          <label htmlFor="cv-upload-input" className={styles.fileLabel}>
            Select CV File
          </label>
          <input
            id="cv-upload-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={uploading}
            className={styles.fileInput}
          />
        </div>

        {file && (
          <div className={styles.fileInfo}>
            <p>
              <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
            <Button onClick={handleUpload} disabled={uploading} variant="primary">
              {uploading ? 'Uploading...' : 'Upload CV'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage} role="alert">
          ✅ CV uploaded successfully!
        </div>
      )}

      {documentId && (
        <div className={styles.downloadSection}>
          <Button onClick={handleDownload} variant="outline">
            Download CV
          </Button>
        </div>
      )}
    </div>
  );
}

