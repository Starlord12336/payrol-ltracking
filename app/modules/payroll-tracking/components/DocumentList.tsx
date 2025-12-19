import React from 'react';
import { TaxDocument, Document } from '../utils/document';
import styles from './DocumentList.module.css';

interface DocumentListProps {
  documents: (TaxDocument | Document)[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  if (documents.length === 0) {
    return <div className={styles.noDocuments}>No documents available</div>;
  }

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {documents.map((doc) => {
          // Type guard: Document extends TaxDocument, so check for Document-specific properties
          const isDocument = 'name' in doc && 'uploadedAt' in doc;
          const docId = isDocument ? (doc as Document).id : doc._id;
          const docName = isDocument ? (doc as Document).name : doc.documentType;
          const docUrl = doc.url;
          const docYear = 'year' in doc ? doc.year : undefined;

          return (
            <li key={docId} className={styles.item}>
              <div className={styles.documentInfo}>
                <span className={styles.documentType}>{docName}</span>
                {docYear && <span className={styles.year}>Year: {docYear}</span>}
              </div>
              {docUrl && (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadLink}
                >
                  Download
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
