/**
 * CV Upload Component
 * Allows candidates to upload their CV
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/shared/components';
import { ENV } from '@/shared/constants';
import type { ProfileData } from '../api/profileApi';
import styles from './CVUpload.module.css';

interface CVDocument {
  _id: string;
  filename?: string;
  uploadedAt?: string;
  createdAt?: string;
  filePath?: string;
  type?: string;
}

interface CVUploadProps {
  candidateId: string;
  profile?: ProfileData | null; // Profile data to get existing CV document ID
  onUploadSuccess?: (documentId: string) => void;
  showHeading?: boolean;
}

export default function CVUpload({ candidateId, profile, onUploadSuccess, showHeading = true }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [cvHistory, setCvHistory] = useState<CVDocument[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const documentIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    documentIdRef.current = documentId;
  }, [documentId]);

  // Fetch CV history on mount
  const fetchCVHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      // Try to fetch all CVs for this candidate
      // Common endpoint patterns: /recruitment/candidates/:id/cvs or /recruitment/candidates/:id/documents
      const response = await fetch(
        `${ENV.API_URL}/recruitment/candidates/${candidateId}/cvs`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        const cvs = result.data || result || [];
        setCvHistory(Array.isArray(cvs) ? cvs : []);
        console.log('CV History loaded:', cvs);
      } else if (response.status === 404) {
        // Endpoint might not exist, try alternative
        console.log('CV list endpoint not found, trying alternative...');
        setCvHistory([]);
      } else {
        console.log('Failed to fetch CV history:', response.status);
        setCvHistory([]);
      }
    } catch (err) {
      console.log('Error fetching CV history (endpoint might not exist):', err);
      setCvHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCVHistory();
  }, [fetchCVHistory]);

  // Load existing CV document ID from profile on mount or when profile changes
  // Only update if we don't already have a documentId (to preserve state after upload)
  useEffect(() => {
    if (!profile) {
      // Only clear if we don't have a documentId (preserve after upload)
      if (!documentId) {
        return;
      }
      return;
    }

    // Check various possible field names for CV document ID
    // Backend might return it as cvDocumentId, cv, cvId, or cvFileId
    const cvId = profile.cvDocumentId || 
                 (profile as any)?.cv || 
                 (profile as any)?.cvId || 
                 (profile as any)?.cvFileId ||
                 (profile as any)?.cvDocument?._id ||
                 (profile as any)?.cvDocumentId;

    console.log('CVUpload: Profile loaded, checking for CV ID:', {
      profile,
      cvId,
      currentDocumentId: documentId,
      profileKeys: Object.keys(profile)
    });

    // Only set from profile if:
    // 1. Profile has a CV ID, AND
    // 2. We don't already have a documentId (preserve upload state)
    const currentDocumentId = documentIdRef.current;
    if (cvId && !currentDocumentId) {
      console.log('CVUpload: Setting documentId from profile:', cvId);
      setDocumentId(cvId);
      setSuccess(false); // Don't show success message on load
    } else if (cvId && currentDocumentId && cvId !== currentDocumentId) {
      // Profile has a different CV ID - update it (might be a new upload from another session)
      console.log('CVUpload: Updating documentId from profile (different ID):', cvId);
      setDocumentId(cvId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]); // documentId is intentionally excluded - we use documentIdRef to avoid dependency loops

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
      console.log('Upload successful - Full response:', result);

      // Handle both _id and documentId from response
      // Backend might return: { _id: "...", documentId: "...", id: "..." }
      const uploadedDocumentId = result._id || result.documentId || result.id || result.data?._id || result.data?.documentId;
      
      console.log('Extracted document ID:', uploadedDocumentId);
      
      if (!uploadedDocumentId) {
        console.error('Upload response missing document ID. Full response:', result);
        throw new Error('Upload response missing document ID');
      }

      setDocumentId(uploadedDocumentId);
      setSuccess(true);
      setFile(null);
      
      console.log('CV uploaded successfully. Document ID set to:', uploadedDocumentId);

      // Add the new CV to history
      const newCV: CVDocument = {
        _id: uploadedDocumentId,
        filename: result.filename || file.name,
        uploadedAt: result.uploadedAt || result.createdAt || new Date().toISOString(),
        createdAt: result.createdAt || new Date().toISOString(),
        filePath: result.filePath,
        type: result.type || 'cv',
      };
      setCvHistory(prev => [newCV, ...prev]);

      // Reset file input
      const fileInput = document.getElementById('cv-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result._id);
      }

      // Refresh CV history
      fetchCVHistory();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (cvDocId?: string) => {
    const idToDownload = cvDocId || documentId;
    if (!idToDownload) return;

    try {
      const response = await fetch(
        `${ENV.API_URL}/recruitment/candidates/${candidateId}/cv/${idToDownload}`,
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

  const handleViewCV = async (cvDocId?: string) => {
    const idToView = cvDocId || documentId;
    if (!idToView) return;

    try {
      // Fetch the CV as a blob
      const response = await fetch(
        `${ENV.API_URL}/recruitment/candidates/${candidateId}/cv/${idToView}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to load CV' }));
        throw new Error(errorData.message || 'Failed to load CV');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Determine the file type from the blob or response headers
      const contentType = response.headers.get('Content-Type') || blob.type || 'application/pdf';
      
      // Create object URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Open in new window/tab
      const newWindow = window.open(blobUrl, '_blank');
      
      // If popup was blocked, fall back to downloading
      if (!newWindow) {
        // Create download link as fallback
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Cleanup: revoke the blob URL after a delay to allow the window to load it
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to view CV');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleDeleteCV = async (cvDocId: string) => {
    if (!cvDocId) return;

    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to delete this CV? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${ENV.API_URL}/recruitment/candidates/${candidateId}/cvs/${cvDocId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(errorData.message || 'Failed to delete CV');
      }

      // Remove from history
      setCvHistory(prev => prev.filter(cv => cv._id !== cvDocId));

      // If this was the current documentId, clear it
      if (documentId === cvDocId) {
        setDocumentId(null);
      }

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete CV');
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

      {/* CV Upload History */}
      <div className={styles.cvHistorySection}>
        <h4 className={styles.historyTitle}>CV Upload History</h4>
        {loadingHistory ? (
          <p className={styles.loadingText}>Loading CV history...</p>
        ) : cvHistory.length === 0 ? (
          <p className={styles.noCvText}>No CVs uploaded yet. Upload your first CV above.</p>
        ) : (
          <div className={styles.cvList}>
            {cvHistory.map((cv) => (
              <div key={cv._id} className={styles.cvItem}>
                <div className={styles.cvItemInfo}>
                  <p className={styles.cvFileName}>
                    <strong>📄 {cv.filename || 'CV Document'}</strong>
                  </p>
                  <p className={styles.cvDate}>
                    Uploaded: {formatDate(cv.uploadedAt || cv.createdAt)}
                  </p>
                </div>
                <div className={styles.cvItemActions}>
                  <Button 
                    onClick={() => handleViewCV(cv._id)} 
                    variant="outline"
                    size="sm"
                  >
                    👁️ View
                  </Button>
                  <Button 
                    onClick={() => handleDownload(cv._id)} 
                    variant="outline"
                    size="sm"
                  >
                    📥 Download
                  </Button>
                  <Button 
                    onClick={() => handleDeleteCV(cv._id)} 
                    variant="outline"
                    size="sm"
                    className={styles.deleteButton}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

