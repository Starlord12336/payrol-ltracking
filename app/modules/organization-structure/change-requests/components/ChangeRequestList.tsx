'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import {
  getChangeRequests,
  cancelChangeRequest,
  submitChangeRequest,
} from '../../api/orgStructureApi';
import type { ChangeRequest, ChangeRequestStatus, ChangeRequestType } from '../../types';
import { CreateChangeRequestForm } from './CreateChangeRequestForm';
import { ChangeRequestDetails } from './ChangeRequestDetails';
import styles from './ChangeRequestList.module.css';

interface ChangeRequestListProps {
  onRefresh?: () => void;
}

export function ChangeRequestList({ onRefresh }: ChangeRequestListProps) {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<ChangeRequestStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ChangeRequestType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc', // Newest first
      };
      
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      if (typeFilter !== 'ALL') {
        params.requestType = typeFilter;
      }
      
      if (searchQuery.trim()) {
        params.requestNumber = searchQuery.trim().toUpperCase();
      }
      
      const response = await getChangeRequests(params);
      console.log('Change requests API response:', response);
      console.log('Change requests data:', response.data);
      console.log('Change requests data length:', response.data?.length);
      console.log('Total pages:', response.totalPages);
      console.log('Total requests:', response.total);
      console.log('Current page:', response.page);
      console.log('Status filter:', statusFilter);
      console.log('Type filter:', typeFilter);
      // Log all request IDs and numbers to see what we got
      if (response.data && response.data.length > 0) {
        console.log('All request IDs:', response.data.map((r: any) => r._id));
        console.log('All request numbers:', response.data.map((r: any) => r.requestNumber));
        console.log('All request statuses:', response.data.map((r: any) => r.status));
        console.log('First request in list:', response.data[0]);
        console.log('First request ID:', response.data[0]._id);
        console.log('First request number:', response.data[0].requestNumber);
        console.log('First request status:', response.data[0].status);
        console.log('First request createdAt:', response.data[0].createdAt);
      }
      setRequests(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching change requests:', err);
      setError(err.response?.data?.message || 'Failed to load change requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    // Reset to page 1 to see the newly created request
    setPage(1);
    // Small delay to ensure backend has processed the request
    await new Promise(resolve => setTimeout(resolve, 500));
    // Force refresh with page 1
    const params: any = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc', // Newest first
    };
    
    if (statusFilter !== 'ALL') {
      params.status = statusFilter;
    }
    
    if (typeFilter !== 'ALL') {
      params.requestType = typeFilter;
    }
    
    if (searchQuery.trim()) {
      params.requestNumber = searchQuery.trim().toUpperCase();
    }
    
    try {
      const response = await getChangeRequests(params);
      console.log('Refresh after create - Change requests API response:', response);
      console.log('Refresh after create - Change requests data:', response.data);
      setRequests(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      console.error('Error refreshing change requests:', err);
    }
    
    if (onRefresh) onRefresh();
  };

  const handleViewDetails = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleDetailsClose = () => {
    setSelectedRequest(null);
    setShowDetailsModal(false);
    fetchRequests();
    if (onRefresh) onRefresh();
  };

  const handleSubmit = async (id: string) => {
    if (!confirm('Are you sure you want to submit this request for review? You won\'t be able to edit it after submission.')) {
      return;
    }

    try {
      await submitChangeRequest(id);
      fetchRequests();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await cancelChangeRequest(id);
      fetchRequests();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const getStatusBadgeClass = (status: ChangeRequestStatus) => {
    switch (status) {
      case 'DRAFT':
        return styles.statusDraft;
      case 'SUBMITTED':
        return styles.statusSubmitted;
      case 'APPROVED':
        return styles.statusApproved;
      case 'REJECTED':
        return styles.statusRejected;
      case 'CANCELED':
        return styles.statusCanceled;
      case 'IMPLEMENTED':
        return styles.statusImplemented;
      default:
        return styles.statusDefault;
    }
  };

  const getTypeLabel = (type: ChangeRequestType) => {
    switch (type) {
      case 'NEW_DEPARTMENT':
        return 'New Department';
      case 'UPDATE_DEPARTMENT':
        return 'Update Department';
      case 'NEW_POSITION':
        return 'New Position';
      case 'UPDATE_POSITION':
        return 'Update Position';
      case 'CLOSE_POSITION':
        return 'Close Position';
      default:
        return type;
    }
  };

  if (loading && requests.length === 0) {
    return (
      <Card padding="lg">
        <div className={styles.loading}>Loading change requests...</div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Change Requests</h2>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Request
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ChangeRequestStatus | 'ALL');
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELED">Canceled</option>
            <option value="IMPLEMENTED">Implemented</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as ChangeRequestType | 'ALL');
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">All</option>
            <option value="NEW_DEPARTMENT">New Department</option>
            <option value="UPDATE_DEPARTMENT">Update Department</option>
            <option value="NEW_POSITION">New Position</option>
            <option value="UPDATE_POSITION">Update Position</option>
            <option value="CLOSE_POSITION">Close Position</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Request number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {requests.length === 0 ? (
        <Card padding="lg" className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h3>No change requests found</h3>
            <p>Create your first change request to get started</p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Request
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td className={styles.requestNumber}>{request.requestNumber}</td>
                    <td>{getTypeLabel(request.requestType)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.requestedByEmployee
                        ? `${request.requestedByEmployee.firstName || ''} ${request.requestedByEmployee.lastName || ''}`.trim() || 'Unknown'
                        : 'Unknown'}
                    </td>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          View
                        </Button>
                        {request.status === 'DRAFT' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSubmit(request._id)}
                            >
                              Submit
                            </Button>
                            <Button
                              variant="error"
                              size="sm"
                              onClick={() => handleCancel(request._id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateChangeRequestForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <ChangeRequestDetails
          request={selectedRequest}
          onClose={handleDetailsClose}
          onUpdate={fetchRequests}
        />
      )}
    </div>
  );
}

