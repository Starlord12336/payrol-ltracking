# Frontend Guide: CV Upload & Download with GridFS

## 📤 **Uploading CV**

### **Endpoint**
```
POST /recruitment/candidates/:id/upload-cv
```

### **Request Format**
- **Method**: `POST`
- **Content-Type**: `multipart/form-data` (automatically set by browser)
- **Headers**: 
  - `Authorization: Bearer <token>` (if authentication required)
- **Body**: FormData with field name `file`

---

## 📋 **React/Next.js Upload Example**

### **Complete Component Example**

```typescript
'use client';

import { useState } from 'react';

interface CVUploadProps {
  candidateId: string;
  onUploadSuccess?: (documentId: string) => void;
}

export default function CVUpload({ candidateId, onUploadSuccess }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Frontend validation (optional but recommended for better UX)
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
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      e.target.value = '';
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
      const token = localStorage.getItem('token'); // or your auth method
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recruitment/candidates/${candidateId}/upload-cv`,
        {
          method: 'POST',
          headers: {
            // DON'T set Content-Type - browser sets it automatically with boundary
            'Authorization': `Bearer ${token}`,
          },
          body: formData, // FormData automatically sets multipart/form-data
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      // Result contains:
      // {
      //   _id: "507f1f77bcf86cd799439011",  // Document ID (use this for downloads)
      //   filePath: "507f1f77bcf86cd799439012",  // GridFS file ID
      //   filename: "candidateId-1234567890-my-cv.pdf",
      //   ownerId: "candidateId",
      //   type: "cv",
      //   uploadedAt: "2024-01-15T10:30:00.000Z",
      //   ...
      // }
      
      setDocumentId(result._id);
      setSuccess(true);
      setFile(null);
      
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

  return (
    <div className="cv-upload-container">
      <h3>Upload CV</h3>
      
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        disabled={uploading}
        id="cv-upload-input"
      />
      
      {file && (
        <div className="file-info">
          <p>
            <strong>Selected:</strong> {file.name} 
            ({(file.size / 1024).toFixed(2)} KB)
          </p>
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="upload-btn"
          >
            {uploading ? 'Uploading...' : 'Upload CV'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" style={{ color: 'green' }}>
          ✅ CV uploaded successfully! 
          {documentId && <span> Document ID: {documentId}</span>}
        </div>
      )}
    </div>
  );
}
```

---

## 📥 **Downloading CV**

### **Endpoint**
```
GET /recruitment/candidates/:id/cv/:documentId
```

### **Request Format**
- **Method**: `GET`
- **Headers**: 
  - `Authorization: Bearer <token>` (if authentication required)
- **Response**: File stream (binary)

---

## 📋 **React/Next.js Download Example**

```typescript
'use client';

import { useState } from 'react';

interface CVDownloadProps {
  candidateId: string;
  documentId: string;
  fileName?: string;
}

export default function CVDownload({ 
  candidateId, 
  documentId, 
  fileName = 'cv.pdf' 
}: CVDownloadProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recruitment/candidates/${candidateId}/cv/${documentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(errorData.message || 'Download failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFileName = fileName;
      
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
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleDownload} 
        disabled={downloading}
        className="download-btn"
      >
        {downloading ? 'Downloading...' : 'Download CV'}
      </button>
      
      {error && (
        <div style={{ color: 'red' }}>{error}</div>
      )}
    </div>
  );
}
```

---

## 🔄 **Using Axios (Alternative)**

### **Upload with Axios**

```typescript
import axios from 'axios';

const uploadCV = async (candidateId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/recruitment/candidates/${candidateId}/upload-cv`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('CV upload error:', error);
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
};
```

### **Download with Axios**

```typescript
import axios from 'axios';

const downloadCV = async (candidateId: string, documentId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/recruitment/candidates/${candidateId}/cv/${documentId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'blob', // Important: set responseType to 'blob'
      }
    );

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'cv.pdf';

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error: any) {
    console.error('Download error:', error);
    throw new Error(error.response?.data?.message || 'Download failed');
  }
};
```

---

## 🎯 **Complete Usage Example**

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function CandidateCVManager({ candidateId }: { candidateId: string }) {
  const [cvDocument, setCvDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Upload CV
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recruitment/candidates/${candidateId}/upload-cv`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      setCvDocument(result);
      alert('CV uploaded successfully!');
    } catch (error) {
      alert('Upload failed');
    }
  };

  // Download CV
  const handleDownload = async () => {
    if (!cvDocument?._id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recruitment/candidates/${candidateId}/cv/${cvDocument._id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cvDocument.filename || 'cv.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed');
    }
  };

  return (
    <div>
      <h2>CV Management</h2>
      
      {/* Upload Section */}
      <div>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>

      {/* Download Section */}
      {cvDocument && (
        <div>
          <p>CV uploaded: {cvDocument.filename}</p>
          <button onClick={handleDownload}>Download CV</button>
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ **Important Notes**

1. **Field Name**: FormData field name must be `"file"` (matches backend `FileInterceptor("file")`)

2. **Content-Type Header**: 
   - ❌ **DON'T** manually set `Content-Type: multipart/form-data`
   - ✅ Let the browser set it automatically (includes boundary)

3. **File Validation**: 
   - Backend validates: PDF, DOC, DOCX, TXT only
   - Max size: 5MB
   - Frontend validation is optional but recommended for better UX

4. **Authentication**: 
   - Include JWT token in `Authorization` header if endpoints are protected

5. **Error Handling**:
   - Backend returns 400 for invalid file type/size
   - Backend returns 404 if candidate/document not found
   - Always check `response.ok` before processing

---

## 📝 **Response Format**

### **Upload Response**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "ownerId": "507f191e810c19729de860ea",
  "type": "cv",
  "filePath": "507f1f77bcf86cd799439012",
  "filename": "507f191e810c19729de860ea-1234567890-my-cv.pdf",
  "uploadedAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### **Download Response**
- **Content-Type**: File MIME type (e.g., `application/pdf`)
- **Content-Disposition**: `attachment; filename="original-filename.pdf"`
- **Body**: Binary file stream

---

## ✅ **Quick Reference**

```typescript
// Upload
POST /recruitment/candidates/:candidateId/upload-cv
Body: FormData with 'file' field

// Download
GET /recruitment/candidates/:candidateId/cv/:documentId
Response: File blob
```

That's it! The frontend code is straightforward - just use FormData for upload and handle the blob response for download.

