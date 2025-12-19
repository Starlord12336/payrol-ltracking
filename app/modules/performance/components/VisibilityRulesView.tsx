'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Input } from '@/shared/components';
import { useNotification } from '@/shared/hooks/useNotification';
import { performanceApi } from '../api/performanceApi';
import type {
  VisibilityRule,
  CreateVisibilityRuleDto,
  UpdateVisibilityRuleDto,
} from '../types';
import { FeedbackFieldType } from '../types';
import { SystemRole } from '@/shared/types/auth';
import styles from './VisibilityRulesView.module.css';

export default function VisibilityRulesView() {
  const { showSuccess, showError } = useNotification();
  const [rules, setRules] = useState<VisibilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<VisibilityRule | null>(null);
  const [formData, setFormData] = useState<CreateVisibilityRuleDto>({
    name: '',
    description: '',
    fieldType: FeedbackFieldType.MANAGER_SUMMARY,
    allowedRoles: [],
    isActive: true,
  });

  const fieldTypeOptions = [
    { value: FeedbackFieldType.MANAGER_SUMMARY, label: 'Manager Summary' },
    { value: FeedbackFieldType.STRENGTHS, label: 'Strengths' },
    { value: FeedbackFieldType.IMPROVEMENT_AREAS, label: 'Improvement Areas' },
    { value: FeedbackFieldType.RATINGS, label: 'Ratings' },
    { value: FeedbackFieldType.COMMENTS, label: 'Comments' },
    { value: FeedbackFieldType.SELF_ASSESSMENT, label: 'Self Assessment' },
    { value: FeedbackFieldType.OVERALL_SCORE, label: 'Overall Score' },
    { value: FeedbackFieldType.FINAL_RATING, label: 'Final Rating' },
  ];

  const roleOptions = [
    { value: SystemRole.DEPARTMENT_EMPLOYEE, label: 'Department Employee' },
    { value: SystemRole.DEPARTMENT_HEAD, label: 'Department Head' },
    { value: SystemRole.HR_EMPLOYEE, label: 'HR Employee' },
    { value: SystemRole.HR_MANAGER, label: 'HR Manager' },
    { value: SystemRole.HR_ADMIN, label: 'HR Admin' },
    { value: SystemRole.SYSTEM_ADMIN, label: 'System Admin' },
  ];

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await performanceApi.getAllVisibilityRules();
      setRules(data);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to fetch visibility rules');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleOpenModal = (rule?: VisibilityRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        fieldType: rule.fieldType,
        allowedRoles: rule.allowedRoles,
        isActive: rule.isActive,
        effectiveFrom: rule.effectiveFrom,
        effectiveTo: rule.effectiveTo,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        fieldType: FeedbackFieldType.MANAGER_SUMMARY,
        allowedRoles: [],
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      fieldType: FeedbackFieldType.MANAGER_SUMMARY,
      allowedRoles: [],
      isActive: true,
    });
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter((r) => r !== role)
        : [...prev.allowedRoles, role],
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingRule) {
        await performanceApi.updateVisibilityRule(editingRule.id!, formData as UpdateVisibilityRuleDto);
        showSuccess('Visibility rule updated successfully');
      } else {
        await performanceApi.createVisibilityRule(formData);
        showSuccess('Visibility rule created successfully');
      }
      handleCloseModal();
      fetchRules();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to save visibility rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visibility rule?')) {
      return;
    }
    try {
      await performanceApi.deleteVisibilityRule(id);
      showSuccess('Visibility rule deleted successfully');
      fetchRules();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to delete visibility rule');
    }
  };

  if (loading) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading visibility rules...</div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Visibility Rules Configuration</h1>
          <p>Configure who can view specific feedback fields in performance appraisals</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          Create Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No visibility rules configured yet.</p>
            <Button onClick={() => handleOpenModal()} variant="primary">
              Create First Rule
            </Button>
          </div>
        </Card>
      ) : (
        <div className={styles.rulesList}>
          {rules.map((rule) => (
            <Card key={rule.id} padding="md" shadow="warm">
              <div className={styles.ruleCard}>
                <div className={styles.ruleHeader}>
                  <div>
                    <h3>{rule.name}</h3>
                    <p className={styles.fieldType}>{fieldTypeOptions.find(opt => opt.value === rule.fieldType)?.label}</p>
                  </div>
                  <div className={styles.ruleActions}>
                    <span className={`${styles.status} ${rule.isActive ? styles.active : styles.inactive}`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Button onClick={() => handleOpenModal(rule)} variant="secondary" size="sm">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(rule.id!)} variant="error" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
                {rule.description && (
                  <p className={styles.description}>{rule.description}</p>
                )}
                <div className={styles.allowedRoles}>
                  <strong>Allowed Roles:</strong>
                  <div className={styles.rolesList}>
                    {rule.allowedRoles.map((role) => (
                      <span key={role} className={styles.roleBadge}>
                        {roleOptions.find(opt => opt.value === role)?.label || role}
                      </span>
                    ))}
                  </div>
                </div>
                {(rule.effectiveFrom || rule.effectiveTo) && (
                  <div className={styles.effectiveDates}>
                    {rule.effectiveFrom && (
                      <span>From: {new Date(rule.effectiveFrom).toLocaleDateString()}</span>
                    )}
                    {rule.effectiveTo && (
                      <span>To: {new Date(rule.effectiveTo).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRule ? 'Edit Visibility Rule' : 'Create Visibility Rule'}
        size="lg"
      >
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Rule Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Manager Summary - Default"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this rule controls"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Field Type *</label>
            <select
              value={formData.fieldType}
              onChange={(e) => setFormData({ ...formData, fieldType: e.target.value as FeedbackFieldType })}
              className={styles.select}
            >
              {fieldTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Allowed Roles *</label>
            <div className={styles.rolesCheckboxes}>
              {roleOptions.map((role) => (
                <label key={role.value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.allowedRoles.includes(role.value)}
                    onChange={() => handleRoleToggle(role.value)}
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Active</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Effective From (Optional)</label>
            <Input
              type="date"
              value={formData.effectiveFrom || ''}
              onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Effective To (Optional)</label>
            <Input
              type="date"
              value={formData.effectiveTo || ''}
              onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
            />
          </div>

          <div className={styles.formActions}>
            <Button onClick={handleCloseModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="primary" disabled={!formData.name || formData.allowedRoles.length === 0}>
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

