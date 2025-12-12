/**
 * Template List Component
 * Displays all appraisal templates in a table
 */

'use client';

import { useState } from 'react';
import { Button, Card } from '@/shared/components';
import type { AppraisalTemplate } from '../types';
import { performanceApi } from '../api/performanceApi';
import TemplateFormModal from './TemplateFormModal';
import styles from './TemplateList.module.css';

interface TemplateListProps {
  templates: AppraisalTemplate[];
  onRefresh: () => void;
}

export default function TemplateList({ templates, onRefresh }: TemplateListProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AppraisalTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: AppraisalTemplate) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(id);
      await performanceApi.deleteTemplate(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete template');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTemplate(null);
  };

  const handleFormSuccess = () => {
    onRefresh();
    handleFormClose();
  };

  const formatRatingScale = (ratingScale: AppraisalTemplate['ratingScale']): string => {
    const scaleTypeMap: Record<string, string> = {
      THREE_POINT: '3-Point',
      FIVE_POINT: '5-Point',
      TEN_POINT: '10-Point',
    };
    return `${scaleTypeMap[ratingScale.type] || ratingScale.type} (${ratingScale.min}-${ratingScale.max})`;
  };

  const formatTemplateType = (type: string): string => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      <div className={styles.header}>
        <div>
          <h2>Appraisal Templates</h2>
          <p>Configure standardized appraisal templates and rating scales</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card padding="lg">
          <div className={styles.emptyState}>
            <p>No templates found. Create your first template to get started.</p>
            <Button variant="primary" onClick={handleCreate}>
              Create Template
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Type</th>
                  <th>Rating Scale</th>
                  <th>Criteria Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template._id}>
                    <td>
                      <div className={styles.templateName}>
                        <strong>{template.name}</strong>
                        {template.description && (
                          <span className={styles.description}>{template.description}</span>
                        )}
                      </div>
                    </td>
                    <td>{formatTemplateType(template.templateType)}</td>
                    <td>{formatRatingScale(template.ratingScale)}</td>
                    <td>{template.criteria?.length || 0}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${template.isActive ? styles.active : styles.inactive}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template._id!)}
                          disabled={isDeleting === template._id}
                        >
                          {isDeleting === template._id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isFormOpen && (
        <TemplateFormModal
          template={selectedTemplate}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}

