'use client';

import { useState, useEffect } from 'react';
import { Template } from '@/data/templates';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templates: Template[]) => void;
  existingTemplates: Template[];
}

// Generate a unique template ID
const generateTemplateId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `template_${timestamp}_${random}`;
};

export default function TemplateManager({
  isOpen,
  onClose,
  onSave,
  existingTemplates
}: TemplateManagerProps) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form fields for creating/editing
  const [formName, setFormName] = useState('');
  const [formHtml, setFormHtml] = useState('');

  // Sync with parent when existingTemplates changes
  useEffect(() => {
    // If we're editing and the template list changed, check if our template still exists
    if (editingTemplate) {
      const stillExists = existingTemplates.find(t => t.id === editingTemplate.id);
      if (!stillExists) {
        resetForm();
      }
    }
  }, [existingTemplates, editingTemplate]);

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormHtml('');
    setEditingTemplate(null);
    setIsCreating(false);
  };

  // Handle create new template
  const handleCreate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormName('');
    setFormHtml(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Template</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; font-family:Arial, sans-serif; color:#333333;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:16px;">
              {{logo}}
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding:8px 24px; font-size:24px; font-weight:bold;">
              {{title}}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 24px 16px 24px; line-height:1.5; font-size:14px;">
              {{body}}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:16px;">
              {{cta_button}}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              {{footer}}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`);
  };

  // Handle edit template
  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsCreating(false);
    setFormName(template.name);
    setFormHtml(template.html);
  };

  // Handle save (create or update)
  const handleSave = () => {
    if (!formName || !formHtml) {
      alert('Please fill in all fields');
      return;
    }

    let updatedTemplates: Template[];

    if (editingTemplate) {
      // Update existing template - keep the same ID
      updatedTemplates = existingTemplates.map(t =>
        t.id === editingTemplate.id
          ? { id: editingTemplate.id, name: formName, html: formHtml }
          : t
      );
    } else {
      // Create new template with auto-generated ID
      const newTemplate: Template = {
        id: generateTemplateId(),
        name: formName,
        html: formHtml
      };
      updatedTemplates = [...existingTemplates, newTemplate];
    }

    onSave(updatedTemplates);
    resetForm();
  };

  // Handle delete
  const handleDelete = (templateId: string) => {
    if (templateId === 'template1') {
      alert('Cannot delete the default template');
      return;
    }

    if (confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = existingTemplates.filter(t => t.id !== templateId);
      onSave(updatedTemplates);
      // Reset form if we're deleting the template we're currently editing
      if (editingTemplate?.id === templateId) {
        resetForm();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Template Manager</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                resetForm();
                onClose();
              }}
            ></button>
          </div>

          <div className="modal-body">
            <div className="row">
              {/* Left Column: Template List */}
              <div className="col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Templates</h6>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleCreate}
                  >
                    + New Template
                  </button>
                </div>

                <div className="list-group">
                  {existingTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`list-group-item ${editingTemplate?.id === template.id ? 'active' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{template.name}</strong>
                        </div>
                        <div>
                          <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => handleEdit(template)}
                          >
                            Edit
                          </button>
                          {template.id !== 'template1' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(template.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Template Editor */}
              <div className="col-md-8">
                {(isCreating || editingTemplate) ? (
                  <div>
                    <h6>{isCreating ? 'Create New Template' : `Edit Template: ${editingTemplate?.name}`}</h6>

                    <div className="mb-3">
                      <label className="form-label">Template Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g., Template 2"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">HTML Template</label>
                      <textarea
                        className="form-control font-monospace"
                        value={formHtml}
                        onChange={(e) => setFormHtml(e.target.value)}
                        rows={15}
                        style={{ fontSize: '12px' }}
                        placeholder="Enter your HTML template here. Use {{logo}}, {{title}}, {{body}}, {{cta_button}}, {{footer}} as placeholders"
                      />
                      <small className="form-text text-muted">
                        Available placeholders: {'{'}{'{'} logo {'}'}{'}'}, {'{'}{'{'} title {'}'}{'}'}, {'{'}{'{'} body {'}'}{'}'}, {'{'}{'{'} cta_button {'}'}{'}'}, {'{'}{'{'} footer {'}'}{'}'}
                      </small>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={handleSave}
                      >
                        {isCreating ? 'Create Template' : 'Save Changes'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted mt-5">
                    <p>Select a template to edit or create a new one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
