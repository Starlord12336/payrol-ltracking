'use client';

import React, { useState, useMemo } from 'react';
import { assignReportingPosition, assignDepartmentHead } from '../api/orgStructureApi';
import type { Position } from '../types';
import styles from './PositionTree.module.css';

interface PositionTreeProps {
  positions: Position[];
  headPositionId: string | null;
  departmentId: string;
  onUpdate: () => void;
  onEdit?: (position: Position) => void;
  onDelete?: (position: Position) => void;
  onHeadChanged?: (newHeadId: string | null) => void;
  isReadOnly?: boolean; // If true, hide edit/delete buttons and disable drag-and-drop
}

interface HierarchyNode extends Position {
  reportingPositions?: HierarchyNode[];
}

interface TreeNode extends Position {
  children: TreeNode[];
}

export function PositionTree({ positions, headPositionId, departmentId, onUpdate, onEdit, onDelete, onHeadChanged, isReadOnly = false }: PositionTreeProps) {
  const [draggedPosition, setDraggedPosition] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  // Normalize department ID helper
  const normalizeDeptId = (deptId: any): string => {
    if (!deptId) return '';
    if (typeof deptId === 'string') return deptId;
    if (typeof deptId === 'object' && deptId._id) return String(deptId._id);
    if (typeof deptId === 'object' && deptId.toString) return String(deptId);
    return String(deptId);
  };

  // Normalize position ID helper
  const normalizePosId = (posId: any): string => {
    if (!posId) return '';
    if (typeof posId === 'string') return posId;
    if (typeof posId === 'object' && posId._id) return String(posId._id);
    if (typeof posId === 'object' && posId.toString) return String(posId);
    return String(posId);
  };

  // Build tree structure from positions array
  // This ensures ALL positions are shown, even orphaned ones
  const tree = useMemo(() => {
    if (!positions || positions.length === 0) {
      return [];
    }

    // Filter positions by department
    const deptIdStr = normalizeDeptId(departmentId);
    const deptPositions = positions.filter(p => {
      const posDeptId = normalizeDeptId(p.departmentId);
      return posDeptId === deptIdStr;
    });

    if (deptPositions.length === 0) {
      return [];
    }

    // Normalize head position ID
    const headIdStr = headPositionId ? normalizePosId(headPositionId) : null;

    // Build children recursively
    const buildChildren = (parentId: string): TreeNode[] => {
      const children = deptPositions.filter(p => {
        if (!p.reportsToPositionId) return false;
        const reportsToId = normalizePosId(p.reportsToPositionId);
        return reportsToId === parentId;
      });

      return children.map(child => ({
        ...child,
        children: buildChildren(normalizePosId(child._id)),
      }));
    };

    // If we have a head position, use it as root
    if (headIdStr) {
      const headPos = deptPositions.find(p => normalizePosId(p._id) === headIdStr);
      if (headPos) {
        // Build tree with head as root, but also include any orphaned positions
        const headTree: TreeNode = {
          ...headPos,
          children: buildChildren(headIdStr),
        };
        
        // Find positions that are not in the tree (orphaned)
        const allPositionIds = new Set<string>();
        const collectIds = (node: TreeNode) => {
          allPositionIds.add(normalizePosId(node._id));
          node.children.forEach(collectIds);
        };
        collectIds(headTree);
        
        const orphaned = deptPositions.filter(p => {
          const posId = normalizePosId(p._id);
          return !allPositionIds.has(posId);
        });
        
        // Return head tree plus orphaned positions as separate roots
        if (orphaned.length > 0) {
          return [
            headTree,
            ...orphaned.map(p => ({
              ...p,
              children: buildChildren(normalizePosId(p._id)),
            }))
          ];
        }
        
        return [headTree];
      }
    }

    // No head or head not found - show all root positions (positions with no reporting relationship)
    const rootPositions = deptPositions.filter(p => !p.reportsToPositionId);
    
    // If no roots, show all positions as roots (they might all be orphaned)
    if (rootPositions.length === 0) {
      return deptPositions.map(p => ({
        ...p,
        children: buildChildren(normalizePosId(p._id)),
      }));
    }

    return rootPositions.map(root => ({
      ...root,
      children: buildChildren(normalizePosId(root._id)),
    }));
  }, [positions, headPositionId, departmentId]);

  const handleDragStart = (e: React.DragEvent, positionId: string) => {
    if (isReadOnly) {
      e.preventDefault();
      return;
    }
    setDraggedPosition(positionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', positionId);
  };

  const handleDragOver = (e: React.DragEvent, positionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition(positionId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the element (not just moving to a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverPosition(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetPositionId: string) => {
    if (isReadOnly) {
      e.preventDefault();
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    setDragOverPosition(null);

    if (!draggedPosition) return;

    const draggedId = normalizePosId(draggedPosition);
    const targetId = normalizePosId(targetPositionId);

    // Prevent dropping on itself
    if (draggedId === targetId) {
      setDraggedPosition(null);
      return;
    }

    const headIdStr = headPositionId ? normalizePosId(headPositionId) : null;

    // Prevent multiple simultaneous updates
    if (updating[draggedId] || updating[targetId]) {
      setDraggedPosition(null);
      return;
    }

    setUpdating(prev => ({ ...prev, [draggedId]: true, [targetId]: true }));

    try {
      // If dragging the head position onto another position, make the target the new head
      if (draggedId === headIdStr) {
        // Step 1: Change department head first (this removes head status from old head)
        await assignDepartmentHead(departmentId, targetId);
        // Step 2: Now set old head to report to new head (old head is no longer head, so this should work)
        try {
          await assignReportingPosition(draggedId, targetId);
        } catch (reportErr: any) {
          // If setting reporting fails, it's okay - the head change succeeded
          console.warn('Could not set old head to report to new head:', reportErr.response?.data?.message || reportErr.message);
        }
        // Step 3: Notify parent
        if (onHeadChanged) {
          onHeadChanged(targetId);
        }
      } 
      // If dragging a position onto the head, make the dragged position the new head
      else if (targetId === headIdStr) {
        // Step 1: Clear dragged position's reporting first (it's becoming the head)
        try {
          await assignReportingPosition(draggedId, null);
        } catch (clearErr: any) {
          // If clearing fails, continue anyway
          console.warn('Could not clear reporting for new head:', clearErr.response?.data?.message || clearErr.message);
        }
        // Step 2: Change department head (this removes head status from old head)
        await assignDepartmentHead(departmentId, draggedId);
        // Step 3: Set old head to report to new head (old head is no longer head, so this should work)
        if (headIdStr) {
          try {
            await assignReportingPosition(headIdStr, draggedId);
          } catch (reportErr: any) {
            // If setting reporting fails, it's okay - the head change succeeded
            console.warn('Could not set old head to report to new head:', reportErr.response?.data?.message || reportErr.message);
          }
        }
        // Step 4: Notify parent
        if (onHeadChanged) {
          onHeadChanged(draggedId);
        }
      }
      // Normal case: make dragged position report to target
      else {
        await assignReportingPosition(draggedId, targetId);
      }
      
      // Single update call after all operations complete
      onUpdate();
    } catch (err: any) {
      console.error('Error updating position relationship:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update position relationship. Please try again.';
      alert(errorMessage);
    } finally {
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[draggedId];
        delete newState[targetId];
        return newState;
      });
      setDraggedPosition(null);
    }
  };

  const handleDropOnEmpty = async (e: React.DragEvent) => {
    if (isReadOnly) {
      e.preventDefault();
      return;
    }
    
    e.preventDefault();
    setDragOverPosition(null);

    if (!draggedPosition) return;

    const draggedId = normalizePosId(draggedPosition);
    const headIdStr = headPositionId ? normalizePosId(headPositionId) : null;

    setUpdating(prev => ({ ...prev, [draggedId]: true }));

    try {
      // If dropping head position on empty, remove head (set to null)
      if (draggedId === headIdStr) {
        await assignDepartmentHead(departmentId, null);
        await assignReportingPosition(draggedId, null);
        if (onHeadChanged) {
          onHeadChanged(null);
        }
      } else {
        // Remove reporting relationship (make it top-level)
        await assignReportingPosition(draggedId, null);
      }
      
      onUpdate();
    } catch (err: any) {
      console.error('Error removing reporting position:', err);
      alert(err.response?.data?.message || 'Failed to remove reporting relationship. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [draggedId]: false }));
      setDraggedPosition(null);
    }
  };

  const renderNode = (node: TreeNode, level: number = 0, isHead: boolean = false): React.ReactNode => {
    const nodeId = normalizePosId(node._id);
    const isDragged = draggedPosition === nodeId;
    const isDragOver = dragOverPosition === nodeId;
    const isUpdating = updating[nodeId];

    return (
      <div key={nodeId} className={styles.treeNode}>
        <div
          className={`${styles.treeNodeContent} ${isHead ? styles.headNode : ''} ${isDragged ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
          draggable={!isReadOnly && !isUpdating}
          onDragStart={(e) => {
            if (!isReadOnly) {
              e.stopPropagation();
              handleDragStart(e, nodeId);
            }
          }}
          onDragOver={(e) => {
            // Always prevent default when dragging (required for drop to work)
            if (!isReadOnly && draggedPosition) {
              e.preventDefault();
              e.stopPropagation();
              
              // Highlight if it's a valid drop target (not itself)
              if (draggedPosition !== nodeId) {
                handleDragOver(e, nodeId);
              }
            }
          }}
          onDragLeave={!isReadOnly ? handleDragLeave : undefined}
          onDrop={(e) => {
            if (!isReadOnly) {
              e.stopPropagation();
              handleDrop(e, nodeId);
            }
          }}
        >
          <div className={styles.nodeInfo}>
            <div className={styles.nodeContent}>
              {isHead && <span className={styles.headBadge}>👑</span>}
              <span className={styles.positionCode}>{node.code}</span>
              <span className={styles.positionTitle}>{node.title}</span>
              {isUpdating && <span className={styles.updating}>Updating...</span>}
            </div>
          </div>
          <div className={styles.nodeActions}>
            {onEdit && (
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                }}
                title="Edit position"
              >
                ✏️
              </button>
            )}
            {onDelete && !isHead && (
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                }}
                title="Delete position"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        {node.children.length > 0 && (
          <div className={styles.treeChildren}>
            {node.children.map(child => renderNode(child, level + 1, false))}
          </div>
        )}
      </div>
    );
  };

  // If tree is empty but positions exist, show them in a flat list
  if (tree.length === 0) {
    if (positions.length === 0) {
      return (
        <div className={styles.emptyTree}>
          <p>No positions yet. Click &quot;Add Position&quot; to create one.</p>
        </div>
      );
    }
    
    // Fallback: show positions in a flat list if tree building failed
    console.log('Tree is empty but positions exist, showing flat list. Positions:', positions.length);
    return (
      <div className={styles.treeContainer}>
        {positions.map((pos) => {
          const posId = String(pos._id);
          const headIdStr = headPositionId 
            ? (typeof headPositionId === 'string' 
              ? headPositionId 
              : String((headPositionId as any)?._id || headPositionId))
            : null;
          const isHead = headIdStr === posId;
          
          return (
            <div key={posId} className={styles.treeNode}>
              <div className={`${styles.treeNodeContent} ${isHead ? styles.headNode : ''}`}>
                <div className={styles.nodeInfo}>
                  <div className={styles.nodeContent}>
                    {isHead && <span className={styles.headBadge}>👑</span>}
                    <span className={styles.positionCode}>{pos.code}</span>
                    <span className={styles.positionTitle}>{pos.title}</span>
                  </div>
                </div>
                {!isReadOnly && (
                  <div className={styles.nodeActions}>
                    {onEdit && (
                      <button
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(pos);
                        }}
                        title="Edit position"
                      >
                        ✏️
                      </button>
                    )}
                    {onDelete && !isHead && (
                      <button
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(pos);
                        }}
                        title="Delete position"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      className={styles.treeContainer}
      onDragOver={!isReadOnly ? (e) => {
        // Allow dragging over the container
        if (draggedPosition) {
          e.preventDefault();
          e.stopPropagation();
        }
      } : undefined}
      onDrop={!isReadOnly ? (e) => {
        // Prevent dropping on container (only allow dropping on positions)
        e.preventDefault();
        e.stopPropagation();
      } : undefined}
    >
      {tree.map((node, index) => {
        const headIdStr = headPositionId ? normalizePosId(headPositionId) : null;
        const isHead = normalizePosId(node._id) === headIdStr;
        return (
          <div key={normalizePosId(node._id)}>
            {renderNode(node, 0, isHead)}
          </div>
        );
      })}
      {draggedPosition && (
        <div className={styles.dragHint}>
          Drag and drop a position onto another position to set reporting relationship
        </div>
      )}
    </div>
  );
}

