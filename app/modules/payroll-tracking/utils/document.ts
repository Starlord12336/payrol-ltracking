/**
 * Document Types
 * For tax documents and other payroll-related documents
 */

export interface TaxDocument {
  _id: string;
  documentType: string;
  year: number;
  employeeId: string;
  url?: string;
  fileName?: string;
  createdAt?: string;
}

// Backward compatibility
export interface Document extends TaxDocument {
  id: string;
  name: string;
  uploadedAt: string;
}
