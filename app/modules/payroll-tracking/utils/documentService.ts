/**
 * Document Service
 * All API calls for document-related endpoints
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type { TaxDocument, Document } from './document';

/**
 * Get tax documents for employee
 * GET /payroll-tracking/employee/:employeeId/tax-documents
 */
export const getTaxDocuments = async (
  employeeId: string,
  year?: number
): Promise<TaxDocument[]> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());

  const queryString = params.toString();
  const url = `${API_ENDPOINTS.PAYROLL_TRACKING}/employee/${employeeId}/tax-documents${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get<{ data: TaxDocument[] }>(url);
  return response.data.data || [];
};

/**
 * Get all documents (alias for getTaxDocuments for backward compatibility)
 */
export const getDocuments = async (
  employeeId: string,
  year?: number
): Promise<Document[]> => {
  const taxDocs = await getTaxDocuments(employeeId, year);
  // Convert TaxDocument to Document format for backward compatibility
  return taxDocs.map(doc => ({
    ...doc,
    id: doc._id,
    name: doc.documentType || doc.fileName || 'Document',
    uploadedAt: doc.createdAt || new Date().toISOString(),
  }));
};
