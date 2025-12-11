'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/shared/components';
import { getPositionsByDepartment, deletePosition, deleteDepartment, assignDepartmentHead, getPositionById } from '../api/orgStructureApi';
import { CreatePositionForm } from './CreatePositionForm';
import { EditPositionForm } from './EditPositionForm';
import { EditDepartmentForm } from './EditDepartmentForm';
import { PositionTree } from './PositionTree';
import type { Department, Position } from '../types';
import styles from './DepartmentList.module.css';

interface DepartmentListProps {
  departments: Department[];
  onRefresh: () => void;
}

export function DepartmentList({ departments, onRefresh }: DepartmentListProps) {
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [selectedDepartmentForPosition, setSelectedDepartmentForPosition] = useState<{ id: string; name: string } | null>(null);
  const [selectedDepartmentForEdit, setSelectedDepartmentForEdit] = useState<Department | null>(null);
  const [selectedPositionForEdit, setSelectedPositionForEdit] = useState<{ position: Position; departmentName: string } | null>(null);
  const [positionToDelete, setPositionToDelete] = useState<{ position: Position; departmentId: string } | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [positionsByDepartment, setPositionsByDepartment] = useState<Record<string, Position[]>>({});
  const [loadingPositions, setLoadingPositions] = useState<Record<string, boolean>>({});
  const [assigningHead, setAssigningHead] = useState<Record<string, boolean>>({});
  const [headPositionsCache, setHeadPositionsCache] = useState<Record<string, Position>>({});

  // Fetch positions for departments with head positions
  useEffect(() => {
    const fetchHeadPositions = async () => {
      const departmentsWithHeads = departments.filter(dept => {
        // Check if headPositionId exists (handle both string and object)
        const headId = dept.headPositionId;
        if (!headId) return false;
        if (typeof headId === 'string') return true;
        if (typeof headId === 'object' && (headId as any)?._id) return true;
        return false;
      });
      
      const departmentsToFetch: string[] = [];
      departmentsWithHeads.forEach(dept => {
        // Only fetch if positions are not already loaded
        const currentPositions = positionsByDepartment[dept._id];
        if (!currentPositions || currentPositions.length === 0) {
          departmentsToFetch.push(dept._id);
        }
      });
      
      if (departmentsToFetch.length === 0) return;
      
      const fetchPromises = departmentsToFetch.map(async (deptId) => {
        try {
          const response = await getPositionsByDepartment(deptId);
          setPositionsByDepartment(prev => {
            // Always update to ensure we have the latest positions
            return {
              ...prev,
              [deptId]: response.data,
            };
          });
        } catch (err) {
          console.error(`Error fetching positions for department ${deptId}:`, err);
        }
      });
      
      await Promise.all(fetchPromises);
    };

    if (departments.length > 0) {
      fetchHeadPositions();
    }
    // Run when departments change or when headPositionId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments.map(d => `${d._id}-${d.headPositionId || 'none'}`).join(',')]);

  const toggleDepartment = async (departmentId: string) => {
    const isCurrentlyExpanded = expandedDepartments.has(departmentId);
    
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId);
      } else {
        newSet.add(departmentId);
      }
      return newSet;
    });

    // Fetch positions when expanding if not already loaded
    if (!isCurrentlyExpanded && !positionsByDepartment[departmentId]) {
      try {
        setLoadingPositions(prev => ({ ...prev, [departmentId]: true }));
        const response = await getPositionsByDepartment(departmentId);
        setPositionsByDepartment(prev => ({
          ...prev,
          [departmentId]: response.data,
        }));
      } catch (err) {
        console.error('Error fetching positions:', err);
      } finally {
        setLoadingPositions(prev => ({ ...prev, [departmentId]: false }));
      }
    }
  };

  const handleAddPosition = (departmentId: string, departmentName: string) => {
    setSelectedDepartmentForPosition({ id: departmentId, name: departmentName });
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartmentForEdit(department);
  };

  const handlePositionCreated = async () => {
    const deptId = selectedDepartmentForPosition?.id;
    setSelectedDepartmentForPosition(null);
    
    // Refresh positions for the department
    if (deptId) {
      setPositionsByDepartment(prev => {
        const newState = { ...prev };
        delete newState[deptId]; // Clear cached positions
        return newState;
      });
      
      // Re-fetch positions if department is expanded
      if (expandedDepartments.has(deptId)) {
        try {
          setLoadingPositions(prev => ({ ...prev, [deptId]: true }));
          const response = await getPositionsByDepartment(deptId);
          setPositionsByDepartment(prev => ({
            ...prev,
            [deptId]: response.data,
          }));
        } catch (err) {
          console.error('Error fetching positions:', err);
        } finally {
          setLoadingPositions(prev => ({ ...prev, [deptId]: false }));
        }
      }
    }
    onRefresh();
  };

  const handleDepartmentUpdated = () => {
    setSelectedDepartmentForEdit(null);
    onRefresh();
  };

  const handleEditPosition = (position: Position, departmentName: string) => {
    setSelectedPositionForEdit({ position, departmentName });
  };

  const handlePositionUpdated = async () => {
    const deptId = selectedPositionForEdit?.position.departmentId;
    setSelectedPositionForEdit(null);
    
    // Refresh positions for the department
    if (deptId) {
      setPositionsByDepartment(prev => {
        const newState = { ...prev };
        delete newState[deptId];
        return newState;
      });
      
      if (expandedDepartments.has(deptId)) {
        try {
          setLoadingPositions(prev => ({ ...prev, [deptId]: true }));
          const response = await getPositionsByDepartment(deptId);
          setPositionsByDepartment(prev => ({
            ...prev,
            [deptId]: response.data,
          }));
        } catch (err) {
          console.error('Error fetching positions:', err);
        } finally {
          setLoadingPositions(prev => ({ ...prev, [deptId]: false }));
        }
      }
    }
    onRefresh();
  };

  const handleSetAsHead = async (departmentId: string, positionId: string) => {
    setAssigningHead(prev => ({ ...prev, [positionId]: true }));
    try {
      await assignDepartmentHead(departmentId, positionId);
      
      // Fetch the head position directly to cache it
      try {
        const headPositionResponse = await getPositionById(positionId);
        setHeadPositionsCache(prev => ({
          ...prev,
          [positionId]: headPositionResponse.data,
        }));
      } catch (err) {
        console.error('Error fetching head position:', err);
      }
      
      // Refresh positions for this department to ensure we have the latest data
      const response = await getPositionsByDepartment(departmentId);
      setPositionsByDepartment(prev => ({
        ...prev,
        [departmentId]: response.data,
      }));
      
      // Refresh departments (this will update the headPositionId in the department object)
      // Positions are already loaded, so the display should work immediately
      onRefresh();
    } catch (err: any) {
      console.error('Error assigning head position:', err);
      alert(err.response?.data?.message || 'Failed to assign head position. Please try again.');
    } finally {
      setAssigningHead(prev => ({ ...prev, [positionId]: false }));
    }
  };

  const handleDeletePosition = async () => {
    if (!positionToDelete) return;

    setDeleting(true);
    try {
      await deletePosition(positionToDelete.position._id);
      const deptId = positionToDelete.departmentId;
      setPositionToDelete(null);
      
      // Refresh positions
      if (deptId) {
        setPositionsByDepartment(prev => {
          const newState = { ...prev };
          delete newState[deptId];
          return newState;
        });
        
        if (expandedDepartments.has(deptId)) {
          try {
            setLoadingPositions(prev => ({ ...prev, [deptId]: true }));
            const response = await getPositionsByDepartment(deptId);
            setPositionsByDepartment(prev => ({
              ...prev,
              [deptId]: response.data,
            }));
          } catch (err) {
            console.error('Error fetching positions:', err);
          } finally {
            setLoadingPositions(prev => ({ ...prev, [deptId]: false }));
          }
        }
      }
      onRefresh();
    } catch (err: any) {
      console.error('Error deleting position:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete position';
      alert(errorMessage);
      setPositionToDelete(null); // Close modal even on error
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    setDeleting(true);
    try {
      await deleteDepartment(departmentToDelete._id);
      setDepartmentToDelete(null);
      onRefresh();
    } catch (err: any) {
      console.error('Error deleting department:', err);
      alert(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.departmentList}>
      {departments.map((department) => {
        const isExpanded = expandedDepartments.has(department._id);
        
        return (
          <Card key={department._id} padding="lg" className={styles.departmentCard}>
            <div className={styles.departmentHeader}>
              <div className={styles.departmentInfo}>
                <div className={styles.departmentTitle}>
                  <h3>{department.name}</h3>
                  <span className={styles.departmentCode}>{department.code}</span>
                </div>
                {department.description && (
                  <p className={styles.departmentDescription}>{department.description}</p>
                )}
                {department.costCenter && (
                  <span className={styles.costCenter}>Cost Center: {department.costCenter}</span>
                )}
                <div className={styles.headPosition}>
                  <span className={styles.headPositionLabel}>Head Position:</span>
                  <span className={styles.headPositionValue}>
                    {department.headPositionId ? (
                      (() => {
                        // Normalize headPositionId to string
                        const headPositionIdStr = typeof department.headPositionId === 'string' 
                          ? department.headPositionId 
                          : (department.headPositionId as any)?._id 
                            ? String((department.headPositionId as any)._id)
                            : String(department.headPositionId);
                        
                        // First check cache
                        const cachedHead = headPositionsCache[headPositionIdStr];
                        if (cachedHead) {
                          return `${cachedHead.code} - ${cachedHead.title}`;
                        }
                        
                        // Then check positions in department
                        const positions = positionsByDepartment[department._id];
                        if (positions && positions.length > 0) {
                          // Try to find the head position - normalize IDs for comparison
                          const headPosition = positions.find(
                            p => {
                              const positionId = String(p._id).trim();
                              const headId = headPositionIdStr.trim();
                              return positionId === headId;
                            }
                          );
                          if (headPosition) {
                            // Cache it for future use
                            setHeadPositionsCache(prev => ({
                              ...prev,
                              [headPositionIdStr]: headPosition,
                            }));
                            return `${headPosition.code} - ${headPosition.title}`;
                          }
                        }
                        
                        // If not found, try to fetch it directly
                        if (!loadingPositions[department._id]) {
                          getPositionById(headPositionIdStr)
                            .then(response => {
                              setHeadPositionsCache(prev => ({
                                ...prev,
                                [headPositionIdStr]: response.data,
                              }));
                            })
                            .catch(err => {
                              console.error('Error fetching head position by ID:', err);
                            });
                        }
                        
                        // Show loading while fetching
                        return 'Loading position details...';
                      })()
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#666' }}>Not assigned</span>
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.departmentActions}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddPosition(department._id, department.name)}
                >
                  + Add Position
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDepartment(department)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepartmentToDelete(department)}
                  className={styles.deleteButton}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDepartment(department._id)}
                >
                  {isExpanded ? '▼ Hide' : '▶ Show'} Positions
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className={styles.positionsSection}>
                <div className={styles.positionsHeader}>
                  <h4>Positions</h4>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddPosition(department._id, department.name)}
                  >
                    + Add Position
                  </Button>
                </div>
                <div className={styles.positionsList}>
                  {loadingPositions[department._id] ? (
                    <p className={styles.emptyPositions}>Loading positions...</p>
                  ) : positionsByDepartment[department._id]?.length > 0 ? (
                    <PositionTree
                      positions={positionsByDepartment[department._id]}
                      headPositionId={department.headPositionId || null}
                      departmentId={department._id}
                      onUpdate={async () => {
                        // Refresh positions after tree update
                        try {
                          const response = await getPositionsByDepartment(department._id);
                          setPositionsByDepartment(prev => ({
                            ...prev,
                            [department._id]: response.data,
                          }));
                        } catch (err) {
                          console.error('Error refreshing positions:', err);
                        }
                        // Refresh departments to get updated head position (only once)
                        onRefresh();
                      }}
                      onHeadChanged={async (newHeadId) => {
                        // Head position changed - refresh positions and departments
                        try {
                          const response = await getPositionsByDepartment(department._id);
                          setPositionsByDepartment(prev => ({
                            ...prev,
                            [department._id]: response.data,
                          }));
                        } catch (err) {
                          console.error('Error refreshing positions after head change:', err);
                        }
                        // Refresh departments to get updated head position
                        onRefresh();
                      }}
                      onEdit={(position) => handleEditPosition(position, department.name)}
                      onDelete={(position) => setPositionToDelete({ position, departmentId: department._id })}
                    />
                  ) : (
                    <p className={styles.emptyPositions}>
                      No positions yet. Click "Add Position" to create one.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Add Position Modal */}
      {selectedDepartmentForPosition && (
        <Modal
          isOpen={!!selectedDepartmentForPosition}
          onClose={() => setSelectedDepartmentForPosition(null)}
          title="Create New Position"
        >
          <CreatePositionForm
            departmentId={selectedDepartmentForPosition.id}
            departmentName={selectedDepartmentForPosition.name}
            onSuccess={handlePositionCreated}
            onCancel={() => setSelectedDepartmentForPosition(null)}
          />
        </Modal>
      )}

      {/* Edit Department Modal */}
      {selectedDepartmentForEdit && (
        <Modal
          isOpen={!!selectedDepartmentForEdit}
          onClose={() => setSelectedDepartmentForEdit(null)}
          title="Edit Department"
        >
          <EditDepartmentForm
            department={selectedDepartmentForEdit}
            onSuccess={handleDepartmentUpdated}
            onCancel={() => setSelectedDepartmentForEdit(null)}
          />
        </Modal>
      )}

      {/* Edit Position Modal */}
      {selectedPositionForEdit && (
        <Modal
          isOpen={!!selectedPositionForEdit}
          onClose={() => setSelectedPositionForEdit(null)}
          title="Edit Position"
        >
          <EditPositionForm
            position={selectedPositionForEdit.position}
            departmentName={selectedPositionForEdit.departmentName}
            onSuccess={handlePositionUpdated}
            onCancel={() => setSelectedPositionForEdit(null)}
          />
        </Modal>
      )}

      {/* Delete Position Confirmation Modal */}
      {positionToDelete && (
        <Modal
          isOpen={!!positionToDelete}
          onClose={() => setPositionToDelete(null)}
          title="Delete Position"
        >
          <div className={styles.deleteConfirmation}>
            <p>
              Are you sure you want to delete the position <strong>{positionToDelete.position.code} - {positionToDelete.position.title}</strong>?
            </p>
            <p className={styles.warningText}>
              ⚠️ This will deactivate the position. If other positions report to this position, you must reassign them first.
            </p>
            <div className={styles.deleteActions}>
              <Button
                variant="outline"
                onClick={() => setPositionToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeletePosition}
                isLoading={deleting}
                disabled={deleting}
                className={styles.deleteButton}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Department Confirmation Modal */}
      {departmentToDelete && (
        <Modal
          isOpen={!!departmentToDelete}
          onClose={() => setDepartmentToDelete(null)}
          title="Delete Department"
        >
          <div className={styles.deleteConfirmation}>
            <p>
              Are you sure you want to delete the department <strong>{departmentToDelete.name} ({departmentToDelete.code})</strong>?
            </p>
            <p className={styles.warningText}>
              ⚠️ This will deactivate the department and ALL positions within it. This action cannot be undone easily.
            </p>
            <div className={styles.deleteActions}>
              <Button
                variant="outline"
                onClick={() => setDepartmentToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteDepartment}
                isLoading={deleting}
                disabled={deleting}
                className={styles.deleteButton}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

