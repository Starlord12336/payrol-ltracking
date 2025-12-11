'use client';

import React, { useMemo } from 'react';
import type { PositionNode, DepartmentChart, Position } from '../../types';
import styles from './OrgChartVisualization.module.css';

interface OrgChartVisualizationProps {
  departments: DepartmentChart[];
  allPositions?: Position[]; // Optional: all positions to rebuild complete tree
}

interface PositionNodeProps {
  position: PositionNode;
  isHead?: boolean;
  level?: number;
}

function PositionNodeComponent({ position, isHead = false, level = 0 }: PositionNodeProps) {
  const hasChildren = position.children && position.children.length > 0;

  // Debug log for all levels
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Level ${level}] Rendering: ${position.title} (${position.code}), hasChildren: ${hasChildren}, children: ${position.children?.map(c => c.title).join(', ') || 'none'}`);
  }

  return (
    <div className={styles.positionNode}>
      <div className={`${styles.positionBox} ${isHead ? styles.headPosition : ''}`}>
        <div className={styles.positionCode}>{position.code}</div>
        <div className={styles.positionTitle}>{position.title}</div>
        {isHead && <div className={styles.headBadge}>Head</div>}
      </div>
      {hasChildren ? (
        <div className={styles.childrenContainer}>
          <div className={styles.connectorLine}></div>
          <div className={styles.childrenWrapper}>
            {position.children!.map((child) => (
              <PositionNodeComponent
                key={child.id}
                position={child}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OrgChartVisualization({ departments, allPositions }: OrgChartVisualizationProps) {
  if (!departments || departments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No organization chart data available</p>
      </div>
    );
  }

  // Normalize ID helper (same as PositionTree)
  const normalizeId = (id: any): string => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id._id) return String(id._id);
    if (typeof id === 'object' && id.toString) return String(id);
    return String(id);
  };

  // Rebuild tree using the SAME logic as PositionTree
  const enhancedDepartments = useMemo(() => {
    // If no allPositions, use backend structure (even if incomplete)
    if (!allPositions || allPositions.length === 0) {
      return departments;
    }

    return departments.map((deptChart) => {
      // Get all positions for this department (same filtering as PositionTree)
      const deptIdStr = normalizeId(deptChart.department.id);
      const deptPositions = allPositions.filter(p => {
        const posDeptId = normalizeId(p.departmentId);
        return posDeptId === deptIdStr && p.isActive;
      });

      if (deptPositions.length === 0) {
        return deptChart;
      }

      // Build children recursively (SAME logic as PositionTree)
      const buildChildren = (parentId: string): PositionNode[] => {
        const normalizedParentId = normalizeId(parentId);
        const children = deptPositions.filter(p => {
          if (!p.reportsToPositionId) return false;
          const reportsToId = normalizeId(p.reportsToPositionId);
          const matches = reportsToId === normalizedParentId;
          
          // Debug log
          if (process.env.NODE_ENV === 'development') {
            console.log(`  Checking if ${p.title} (${p.code}) reports to ${normalizedParentId}:`, {
              positionId: normalizeId(p._id),
              reportsToId,
              normalizedParentId,
              matches
            });
          }
          
          return matches;
        });

        if (process.env.NODE_ENV === 'development' && children.length > 0) {
          console.log(`  Found ${children.length} children for ${normalizedParentId}:`, children.map(c => `${c.title} (${c.code})`));
        }

        return children.map(child => ({
          id: normalizeId(child._id),
          code: child.code,
          title: child.title,
          description: child.description,
          departmentId: normalizeId(child.departmentId),
          reportsToPositionId: child.reportsToPositionId ? normalizeId(child.reportsToPositionId) : undefined,
          isActive: child.isActive,
          children: buildChildren(normalizeId(child._id)),
        }));
      };

      // Normalize head position ID
      const headIdStr = deptChart.department.headPositionId ? normalizeId(deptChart.department.headPositionId) : null;

      // If we have a head position, use it as root (SAME logic as PositionTree)
      if (headIdStr) {
        const headPos = deptPositions.find(p => normalizeId(p._id) === headIdStr);
        if (headPos) {
          console.log(`Building tree for department ${deptChart.department.name} with head: ${headPos.title} (${headPos.code})`);
          
          // Build tree with head as root
          const headTree: PositionNode = {
            id: normalizeId(headPos._id),
            code: headPos.code,
            title: headPos.title,
            description: headPos.description,
            departmentId: normalizeId(headPos.departmentId),
            reportsToPositionId: headPos.reportsToPositionId ? normalizeId(headPos.reportsToPositionId) : undefined,
            isActive: headPos.isActive,
            children: buildChildren(headIdStr),
          };
          
          console.log(`Head tree built. Head has ${headTree.children.length} direct children`);
          if (headTree.children.length > 0) {
            headTree.children.forEach((child, idx) => {
              console.log(`  Child ${idx}: ${child.title} (${child.code}) has ${child.children.length} children`);
            });
          }
          
          // Find positions that are not in the tree (orphaned)
          const allPositionIds = new Set<string>();
          const collectIds = (node: PositionNode) => {
            const nodeId = normalizeId(node.id);
            allPositionIds.add(nodeId);
            if (node.children && node.children.length > 0) {
              node.children.forEach(collectIds);
            }
          };
          collectIds(headTree);
          
          // Debug: Log all IDs in tree
          if (process.env.NODE_ENV === 'development') {
            console.log(`Department ${deptChart.department.name} - IDs in tree:`, Array.from(allPositionIds));
            console.log(`All position IDs:`, deptPositions.map(p => normalizeId(p._id)));
          }
          
          const orphaned = deptPositions.filter(p => {
            const posId = normalizeId(p._id);
            const isOrphaned = !allPositionIds.has(posId);
            if (process.env.NODE_ENV === 'development' && isOrphaned) {
              console.log(`⚠️ Orphaned position: ${p.title} (${p.code}) - ID: ${posId}, reportsTo: ${p.reportsToPositionId ? normalizeId(p.reportsToPositionId) : 'none'}`);
              // Check why it's orphaned
              const reportsToId = p.reportsToPositionId ? normalizeId(p.reportsToPositionId) : null;
              if (reportsToId) {
                const reportsToPos = deptPositions.find(pos => normalizeId(pos._id) === reportsToId);
                if (reportsToPos) {
                  console.log(`    Reports to: ${reportsToPos.title} (${reportsToPos.code}) - ID: ${reportsToId}`);
                  console.log(`    Is reportsTo in tree?`, allPositionIds.has(reportsToId));
                } else {
                  console.log(`    Reports to ID ${reportsToId} not found in department positions`);
                }
              }
            }
            return isOrphaned;
          });
          
          // Return head tree plus orphaned positions as separate roots
          if (orphaned.length > 0) {
            console.log(`⚠️ Found ${orphaned.length} orphaned positions, adding as separate roots`);
            return {
              ...deptChart,
              positions: [
                headTree,
                ...orphaned.map(p => ({
                  id: normalizeId(p._id),
                  code: p.code,
                  title: p.title,
                  description: p.description,
                  departmentId: normalizeId(p.departmentId),
                  reportsToPositionId: p.reportsToPositionId ? normalizeId(p.reportsToPositionId) : undefined,
                  isActive: p.isActive,
                  children: buildChildren(normalizeId(p._id)),
                }))
              ],
            };
          }
          
          return {
            ...deptChart,
            positions: [headTree],
          };
        }
      }

      // No head or head not found - show all root positions (SAME logic as PositionTree)
      const rootPositions = deptPositions.filter(p => !p.reportsToPositionId);
      
      // If no roots, show all positions as roots (they might all be orphaned)
      if (rootPositions.length === 0) {
        return {
          ...deptChart,
          positions: deptPositions.map(p => ({
            id: normalizeId(p._id),
            code: p.code,
            title: p.title,
            description: p.description,
            departmentId: normalizeId(p.departmentId),
            reportsToPositionId: p.reportsToPositionId ? normalizeId(p.reportsToPositionId) : undefined,
            isActive: p.isActive,
            children: buildChildren(normalizeId(p._id)),
          })),
        };
      }

      return {
        ...deptChart,
        positions: rootPositions.map(root => ({
          id: normalizeId(root._id),
          code: root.code,
          title: root.title,
          description: root.description,
          departmentId: normalizeId(root.departmentId),
          reportsToPositionId: root.reportsToPositionId ? normalizeId(root.reportsToPositionId) : undefined,
          isActive: root.isActive,
          children: buildChildren(normalizeId(root._id)),
        })),
      };
    });
  }, [departments, allPositions]);

  // Debug: Log the REBUILT tree structure (enhancedDepartments)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== REBUILT TREE DEBUG ===');
    enhancedDepartments.forEach((dept, idx) => {
      console.log(`\nDepartment ${idx}: ${dept.department.name}`);
      console.log(`  Total positions (stats): ${dept.statistics.totalPositions}`);
      console.log(`  Root positions in tree: ${dept.positions.length}`);
      console.log(`  Head position ID:`, dept.department.headPositionId);
      console.log(`  Head position ID type:`, typeof dept.department.headPositionId);
      console.log(`  Head position ID string:`, String(dept.department.headPositionId));
      
      // Count all positions recursively
      const countAllPositions = (pos: PositionNode): number => {
        let count = 1;
        if (pos.children && pos.children.length > 0) {
          count += pos.children.reduce((sum, child) => sum + countAllPositions(child), 0);
        }
        return count;
      };
      
      const totalInTree = dept.positions.reduce((sum, pos) => sum + countAllPositions(pos), 0);
      console.log(`  Total positions in tree: ${totalInTree}`);
      console.log(`  Missing: ${dept.statistics.totalPositions - totalInTree}`);
      
      // Detailed tree structure
      const logTree = (pos: PositionNode, indent = '') => {
        console.log(`${indent}- ${pos.title} (${pos.code}) [ID: ${pos.id}]`);
        console.log(`${indent}  reportsToPositionId: ${pos.reportsToPositionId || 'none'}`);
        console.log(`${indent}  children:`, pos.children);
        console.log(`${indent}  children length:`, pos.children?.length || 0);
        if (pos.children && pos.children.length > 0) {
          pos.children.forEach(child => logTree(child, indent + '  '));
        } else {
          console.log(`${indent}  [NO CHILDREN]`);
        }
      };
      
      dept.positions.forEach((pos, posIdx) => {
        console.log(`\n  Root ${posIdx}:`);
        console.log(`  Position object:`, pos);
        logTree(pos, '    ');
      });
    });
    console.log('=== END REBUILT TREE DEBUG ===\n');
  }

  // Debug: Log the BACKEND structure (departments) - separate
  if (process.env.NODE_ENV === 'development') {
    console.log('=== BACKEND TREE DEBUG (for comparison) ===');
    console.log('Backend departments:', departments);
    departments.forEach((dept, idx) => {
      console.log(`\nBackend Department ${idx}: ${dept.department.name}`);
      console.log(`  Root positions: ${dept.positions.length}`);
      dept.positions.forEach((pos, posIdx) => {
        console.log(`    Root ${posIdx}: ${pos.title} - children: ${pos.children?.length || 0}`);
      });
    });
    console.log('=== END BACKEND DEBUG ===\n');
  }

  return (
    <div className={styles.orgChartContainer}>
      {enhancedDepartments.map((deptChart) => {
        // Find the head position in the tree (recursively search)
        const findHeadInTree = (positions: PositionNode[], headId?: string): PositionNode | null => {
          if (!headId) return null;
          for (const pos of positions) {
            if (String(pos.id) === String(headId)) {
              return pos;
            }
            if (pos.children && pos.children.length > 0) {
              const found = findHeadInTree(pos.children, headId);
              if (found) return found;
            }
          }
          return null;
        };

        const headPosition = deptChart.department.headPositionId
          ? findHeadInTree(deptChart.positions, deptChart.department.headPositionId)
          : null;

        // If head position is found in tree, prioritize it; otherwise show all root positions
        const rootPositions = headPosition && deptChart.positions.some(p => p.id === headPosition.id)
          ? [headPosition, ...deptChart.positions.filter(p => p.id !== headPosition.id)]
          : deptChart.positions;

        return (
          <div key={deptChart.department.id} className={styles.departmentSection}>
            <div className={styles.departmentHeader}>
              <h3 className={styles.departmentName}>{deptChart.department.name}</h3>
              <div className={styles.departmentCode}>{deptChart.department.code}</div>
              <div className={styles.departmentStats}>
                {deptChart.statistics.totalPositions} positions
                {' • '}
                {deptChart.statistics.filledPositions} filled
                {' • '}
                {deptChart.statistics.vacantPositions} vacant
                {(() => {
                  const countAllInTree = (pos: PositionNode): number => {
                    let count = 1;
                    if (pos.children && pos.children.length > 0) {
                      count += pos.children.reduce((sum, child) => sum + countAllInTree(child), 0);
                    }
                    return count;
                  };
                  const totalInTree = deptChart.positions.reduce((sum, pos) => sum + countAllInTree(pos), 0);
                  const missing = deptChart.statistics.totalPositions - totalInTree;
                  if (missing > 0) {
                    return ` • ⚠️ ${missing} positions not in tree (orphaned)`;
                  }
                  return '';
                })()}
              </div>
            </div>

            {deptChart.positions.length === 0 ? (
              <div className={styles.emptyPositions}>
                <p>No positions in this department</p>
              </div>
            ) : (
              <div className={styles.positionsTree}>
                {rootPositions.map((position) => {
                  const isHead = headPosition?.id === position.id;
                  
                  return (
                    <PositionNodeComponent
                      key={position.id}
                      position={position}
                      isHead={isHead}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

