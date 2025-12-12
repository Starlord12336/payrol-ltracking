/**
 * Assignment Modal Component
 * Create or update appraisal assignments
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { hrApi, type EmployeeProfile } from '@/app/modules/hr/api/hrApi';
import { getDepartments, getPositions } from '@/app/modules/organization-structure/api/orgStructureApi';
import type { AppraisalAssignment, AppraisalTemplate, CreateAppraisalAssignmentDto, BulkAssignTemplateDto, UpdateAppraisalAssignmentDto } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import styles from './AssignmentModal.module.css';

interface AssignmentModalProps {
  assignment: AppraisalAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignmentModal({
  assignment,
  isOpen,
  onClose,
  onSuccess,
}: AssignmentModalProps) {
  const isEdit = !!assignment;
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');

  // Templates and options
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  // Individual assignment form
  const [individualForm, setIndividualForm] = useState<CreateAppraisalAssignmentDto>({
    templateId: '',
    cycleId: '',
    employeeProfileIds: [],
    managerProfileId: '',
    dueDate: '',
  });

  // Bulk assignment form
  const [bulkForm, setBulkForm] = useState<BulkAssignTemplateDto>({
    templateId: '',
    cycleId: '',
    departmentIds: [],
    positionIds: [],
    employeeProfileIds: [],
    dueDate: '',
    managerProfileId: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (isEdit && assignment) {
        // Populate edit form
        // Handle populated fields - extract IDs from objects if populated
        const templateId = typeof (assignment as any).templateId === 'object' 
          ? (assignment as any).templateId?._id || (assignment as any).templateId?.id
          : assignment.templateId;
        const employeeProfileId = typeof (assignment as any).employeeProfileId === 'object'
          ? (assignment as any).employeeProfileId?._id || (assignment as any).employeeProfileId?.id
          : assignment.employeeProfileId;
        const managerProfileId = typeof (assignment as any).managerProfileId === 'object'
          ? (assignment as any).managerProfileId?._id || (assignment as any).managerProfileId?.id
          : assignment.managerProfileId;
        const cycleId = typeof (assignment as any).cycleId === 'object'
          ? (assignment as any).cycleId?._id || (assignment as any).cycleId?.id
          : assignment.cycleId;
        
        setIndividualForm({
          templateId: templateId || '',
          cycleId: cycleId || '',
          employeeProfileIds: employeeProfileId ? [employeeProfileId] : [],
          managerProfileId: managerProfileId || '',
          dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
        });
        setMode('individual');
      } else {
        // Reset forms
        setIndividualForm({
          templateId: '',
          cycleId: '',
          employeeProfileIds: [],
          managerProfileId: '',
          dueDate: '',
        });
        setBulkForm({
          templateId: '',
          cycleId: '',
          departmentIds: [],
          positionIds: [],
          employeeProfileIds: [],
          dueDate: '',
          managerProfileId: '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, assignment]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [templatesData, cyclesData, employeesData, departmentsData, positionsData] = await Promise.all([
        performanceApi.getTemplates(true), // Only active templates
        performanceApi.getCycles(), // Get all cycles
        hrApi.getAllEmployees(),
        getDepartments({ limit: 100, isActive: true }),
        getPositions({ limit: 100, isActive: true }),
      ]);
      setTemplates(templatesData);
      setCycles(cyclesData);
      setEmployees(employeesData);
      setDepartments(departmentsData.data || []);
      setPositions(positionsData.data || []);
    } catch (err: any) {
      console.error('Error fetching options:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);

      if (isEdit && assignment?._id) {
        // Update existing assignment
        // Ensure templateId is a valid string (required)
        if (!individualForm.templateId || individualForm.templateId.trim() === '') {
          setError('Template is required');
          return;
        }
        const updateDto: UpdateAppraisalAssignmentDto = {
          templateId: individualForm.templateId.trim(),
          managerProfileId: individualForm.managerProfileId && individualForm.managerProfileId.trim() !== '' 
            ? individualForm.managerProfileId.trim() 
            : undefined,
          dueDate: individualForm.dueDate && individualForm.dueDate.trim() !== '' 
            ? individualForm.dueDate.trim() 
            : undefined,
        };
        await performanceApi.updateAssignment(assignment._id, updateDto);
      } else if (mode === 'individual') {
        // Create individual assignment
        if (!individualForm.templateId || !individualForm.cycleId || individualForm.employeeProfileIds.length === 0) {
          setError('Template, cycle, and at least one employee are required');
          return;
        }
        // Clean the data: convert empty strings to undefined for optional fields
        const cleanedData: CreateAppraisalAssignmentDto = {
          ...individualForm,
          managerProfileId: individualForm.managerProfileId || undefined,
          dueDate: individualForm.dueDate || undefined,
        };
        await performanceApi.assignTemplateToEmployees(cleanedData);
      } else {
        // Bulk assignment
        if (!bulkForm.templateId || !bulkForm.cycleId) {
          setError('Template and cycle are required');
          return;
        }
        if (
          (!bulkForm.departmentIds || bulkForm.departmentIds.length === 0) &&
          (!bulkForm.positionIds || bulkForm.positionIds.length === 0) &&
          (!bulkForm.employeeProfileIds || bulkForm.employeeProfileIds.length === 0)
        ) {
          setError('Select at least one department, position, or employee');
          return;
        }
        // Clean the data: convert empty strings to undefined for optional fields
        const cleanedData: BulkAssignTemplateDto = {
          ...bulkForm,
          managerProfileId: bulkForm.managerProfileId || undefined,
          dueDate: bulkForm.dueDate || undefined,
          departmentIds: bulkForm.departmentIds && bulkForm.departmentIds.length > 0 ? bulkForm.departmentIds : undefined,
          positionIds: bulkForm.positionIds && bulkForm.positionIds.length > 0 ? bulkForm.positionIds : undefined,
          employeeProfileIds: bulkForm.employeeProfileIds && bulkForm.employeeProfileIds.length > 0 ? bulkForm.employeeProfileIds : undefined,
        };
        await performanceApi.bulkAssignTemplate(cleanedData);
      }

      onSuccess();
    } catch (err: any) {
      let errorMessage = 'Failed to save assignment';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    if (mode === 'individual') {
      setIndividualForm({
        ...individualForm,
        employeeProfileIds: individualForm.employeeProfileIds.includes(employeeId)
          ? individualForm.employeeProfileIds.filter((id) => id !== employeeId)
          : [...individualForm.employeeProfileIds, employeeId],
      });
    } else {
      const current = bulkForm.employeeProfileIds || [];
      setBulkForm({
        ...bulkForm,
        employeeProfileIds: current.includes(employeeId)
          ? current.filter((id) => id !== employeeId)
          : [...current, employeeId],
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Assignment' : 'Assign Appraisal Template'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loadingOptions ? (
          <div className={styles.loading}>Loading options...</div>
        ) : (
          <>
            {!isEdit && (
              <div className={styles.modeSelector}>
                <label>
                  <input
                    type="radio"
                    value="individual"
                    checked={mode === 'individual'}
                    onChange={(e) => setMode(e.target.value as 'individual' | 'bulk')}
                  />
                  Individual Assignment
                </label>
                <label>
                  <input
                    type="radio"
                    value="bulk"
                    checked={mode === 'bulk'}
                    onChange={(e) => setMode(e.target.value as 'individual' | 'bulk')}
                  />
                  Bulk Assignment
                </label>
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.selectWrapper}>
                <label htmlFor="templateId" className={styles.label}>
                  Template <span className={styles.required}>*</span>
                </label>
                <select
                  id="templateId"
                  name="templateId"
                  value={mode === 'individual' ? individualForm.templateId : bulkForm.templateId}
                  onChange={(e) => {
                    if (mode === 'individual') {
                      setIndividualForm({ ...individualForm, templateId: e.target.value });
                    } else {
                      setBulkForm({ ...bulkForm, templateId: e.target.value });
                    }
                  }}
                  required
                  disabled={isLoading || isEdit}
                  className={styles.select}
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <label htmlFor="cycleId" className={styles.label}>
                  Cycle <span className={styles.required}>*</span>
                </label>
                <select
                  id="cycleId"
                  name="cycleId"
                  value={mode === 'individual' ? individualForm.cycleId : bulkForm.cycleId}
                  onChange={(e) => {
                    if (mode === 'individual') {
                      setIndividualForm({ ...individualForm, cycleId: e.target.value });
                    } else {
                      setBulkForm({ ...bulkForm, cycleId: e.target.value });
                    }
                  }}
                  required
                  disabled={isLoading || isEdit}
                  className={styles.select}
                >
                  <option value="">Select a cycle</option>
                  {cycles.map((cycle) => (
                    <option key={cycle._id} value={cycle._id}>
                      {cycle.name} {cycle.status ? `(${cycle.status})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputWrapper}>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  label="Due Date"
                  value={mode === 'individual' ? individualForm.dueDate : bulkForm.dueDate || ''}
                  onChange={(e) => {
                    if (mode === 'individual') {
                      setIndividualForm({ ...individualForm, dueDate: e.target.value });
                    } else {
                      setBulkForm({ ...bulkForm, dueDate: e.target.value });
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {mode === 'individual' ? (
              <>
                <div className={styles.section}>
                  <label className={styles.label}>
                    Select Employees <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.employeeList}>
                    {employees
                      .filter((emp) => emp.status === 'ACTIVE' || emp.status === 'PROBATION')
                      .map((employee) => (
                        <label key={employee._id} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={individualForm.employeeProfileIds.includes(employee._id || '')}
                            onChange={() => toggleEmployeeSelection(employee._id || '')}
                            disabled={isLoading}
                          />
                          <span>
                            {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className={styles.selectWrapper}>
                  <label htmlFor="managerProfileId" className={styles.label}>
                    Manager (Optional - auto-detected if not specified)
                  </label>
                  <select
                    id="managerProfileId"
                    name="managerProfileId"
                    value={individualForm.managerProfileId}
                    onChange={(e) =>
                      setIndividualForm({ ...individualForm, managerProfileId: e.target.value })
                    }
                    disabled={isLoading}
                    className={styles.select}
                  >
                    <option value="">Auto-detect from org structure</option>
                    {employees
                      .filter((emp) => emp.status === 'ACTIVE')
                      .map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.firstName} {employee.lastName}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className={styles.section}>
                  <label className={styles.label}>Select Departments</label>
                  <div className={styles.checkboxList}>
                    {departments.map((dept) => (
                      <label key={dept._id} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={(bulkForm.departmentIds || []).includes(dept._id)}
                          onChange={(e) => {
                            const current = bulkForm.departmentIds || [];
                            setBulkForm({
                              ...bulkForm,
                              departmentIds: e.target.checked
                                ? [...current, dept._id]
                                : current.filter((id) => id !== dept._id),
                            });
                          }}
                          disabled={isLoading}
                        />
                        <span>{dept.name} ({dept.code})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.section}>
                  <label className={styles.label}>Select Positions</label>
                  <div className={styles.checkboxList}>
                    {positions.map((pos) => (
                      <label key={pos._id} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={(bulkForm.positionIds || []).includes(pos._id)}
                          onChange={(e) => {
                            const current = bulkForm.positionIds || [];
                            setBulkForm({
                              ...bulkForm,
                              positionIds: e.target.checked
                                ? [...current, pos._id]
                                : current.filter((id) => id !== pos._id),
                            });
                          }}
                          disabled={isLoading}
                        />
                        <span>{pos.title} ({pos.code})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.section}>
                  <label className={styles.label}>Select Employees (Optional)</label>
                  <div className={styles.employeeList}>
                    {employees
                      .filter((emp) => emp.status === 'ACTIVE' || emp.status === 'PROBATION')
                      .slice(0, 50)
                      .map((employee) => (
                        <label key={employee._id} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={(bulkForm.employeeProfileIds || []).includes(employee._id || '')}
                            onChange={() => toggleEmployeeSelection(employee._id || '')}
                            disabled={isLoading}
                          />
                          <span>
                            {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Update Assignment' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

