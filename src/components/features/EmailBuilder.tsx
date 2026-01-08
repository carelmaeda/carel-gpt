'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Image from 'next/image';
import { templates, Templates, Template } from '@/data/templates';
import { renderTemplate } from '@/lib/renderTemplate';
import TemplateManager from './TemplateManager';


export default function EmailBuilder() {
  // Load custom templates from localStorage on mount
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

  // Combine default templates with custom templates
  const allTemplates = useMemo(() => {
    return [...templates.templates, ...customTemplates];
  }, [customTemplates]);

  const templatesData: Templates = {
    ...templates,
    templates: allTemplates
  };

  // =============================================================================
  // CONSTANTS & STATIC DATA
  // =============================================================================
  
  /** Available templates and clients from data */
  const availableTemplates = templatesData.templates;
  const availableClients = Object.keys(templatesData.clients);

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  // Form Data States
  const [client, setClient] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTitle, setEmailTitle] = useState('');
  
  // Optional Features States
  const [includeCTA, setIncludeCTA] = useState(false);
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [includeFooter, setIncludeFooter] = useState(false);
  const [includeImage, setIncludeImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(400); // Default 400px width
  
  // UI & Output States
  const [finalHtml, setFinalHtml] = useState('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // COMPUTED VALUES & MEMOIZED DATA
  // =============================================================================

  /** Get selected template object */
  const selectedTemplate = useMemo(() => 
    availableTemplates.find(t => t.id === templateName),
    [templateName, availableTemplates]
  );

  /** Get selected client data */
  const selectedClientData = useMemo(() => 
    client ? templatesData.clients[client] : null,
    [client, templatesData.clients]
  );

  // =============================================================================
  // EFFECTS & SIDE-EFFECTS
  // =============================================================================

  /** Load custom templates from localStorage on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('customEmailTemplates');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomTemplates(parsed);
      }
    } catch (error) {
      console.error('Failed to load custom templates:', error);
    }
  }, []);

  /** Main effect: Generate HTML when form data changes */
  useEffect(() => {
    if (!selectedTemplate || !selectedClientData) {
      setFinalHtml('');
      return;
    }

    // Get template and client-specific components
    const baseTemplate = selectedTemplate.html;
    const ctaTemplate = selectedClientData.ctaTemplate;
    const footerTemplate = selectedClientData.footerTemplate;

    // Ensure CTA link has proper protocol
    const normalizedCtaLink = ctaLink && !ctaLink.startsWith('http') 
      ? `https://${ctaLink}` 
      : ctaLink;

    // Generate CTA button HTML if enabled and configured
    const ctaButton = includeCTA && ctaText && ctaLink
      ? ctaTemplate
          .replace('{{cta_text}}', ctaText)
          .replace('{{cta_link}}', normalizedCtaLink)
      : '';

    // Include footer if enabled
    const footer = includeFooter ? footerTemplate : '';

    // Generate optional image HTML (appears between body and CTA)
    // Ensure image width doesn't exceed 600px container and respects user selection
    const effectiveImageWidth = Math.min(imageWidth, 600);
    const imageHtml = includeImage && uploadedImage 
      ? `<div style="text-align: center; margin: 20px 0;"><img src="${uploadedImage}" alt="Email Image" style="width: ${effectiveImageWidth}px; max-width: 100%; height: auto; border-radius: 8px;" /></div>`
      : '';

    // Generate client logo HTML - Note: This creates HTML string for email template
    // For email templates, we still need to use img tags as Next.js Image components don't work in email HTML
    const logoHtml = `<img src="${selectedClientData.logo}" alt="${client} Logo" width="120" height="120" style="display:block; border:0;">`;

    // Render final email HTML
    const html = renderTemplate(baseTemplate, {
      title: emailTitle,
      body: emailBody + imageHtml,
      cta_button: ctaButton,
      footer,
      logo: logoHtml,
    });

    setFinalHtml(html);
  }, [
    selectedTemplate,
    selectedClientData,
    client,
    emailTitle,
    emailBody,
    includeCTA,
    ctaText,
    ctaLink,
    includeFooter,
    includeImage,
    uploadedImage,
    imageWidth,
  ]); // Dependencies: re-render when any form field changes

  /** Auto-hide toast notifications after 5 seconds */
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  /** Close dropdown when clicking outside - only active when dropdown is open */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
    };

    if (showClientDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showClientDropdown]);

  // =============================================================================
  // EVENT HANDLERS & UTILITY FUNCTIONS
  // =============================================================================

  /** Copy generated HTML to clipboard */
  const copyToClipboard = () => {
    if (!finalHtml) {
      setShowToast({ message: 'No HTML to copy!', type: 'error' });
      return;
    }
    navigator.clipboard.writeText(finalHtml)
      .then(() => setShowToast({ message: 'HTML copied to clipboard!', type: 'success' }))
      .catch(() => setShowToast({ message: 'Failed to copy HTML.', type: 'error' }));
  };

  /** Clear content fields only (keep template and client) */
  const clearContentFields = () => {
    setEmailBody('');
    setIncludeCTA(false);
    setCtaText('');
    setCtaLink('');
    setIncludeFooter(false);
    setIncludeImage(false);
    setUploadedImage(null);
    setImageWidth(400);
    setFinalHtml('');
  };

  /** Handle image upload */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setShowToast({ message: 'Image size must be less than 5MB', type: 'error' });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setShowToast({ message: 'Please select a valid image file', type: 'error' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIncludeImage(true); // Automatically enable image inclusion
        setShowToast({ message: 'Image uploaded successfully!', type: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  /** Remove uploaded image */
  const removeImage = () => {
    setUploadedImage(null);
    setIncludeImage(false);
    setImageWidth(400); // Reset to default
  };

  /** Reset entire form to initial state */
  const resetForm = () => {
    setTemplateName('');
    setClient('');
    clearContentFields();
    setShowToast({ message: 'Form reset successfully!', type: 'success' });
  };

  /** Download generated HTML as a file */
  const downloadHtml = () => {
    if (!finalHtml) {
      setShowToast({ message: 'No HTML to download!', type: 'error' });
      return;
    }
    try {
      // Create blob and download link
      const blob = new Blob([finalHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client || 'unknown'}-${templateName || 'email'}.html`;

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowToast({ message: 'HTML downloaded successfully!', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'Failed to download HTML.', type: 'error' });
      console.error('Download error:', error);
    }
  };

  /** Handle template manager save */
  const handleTemplatesSave = (updatedTemplates: Template[]) => {
    // Filter out default templates (only save custom ones)
    const customOnly = updatedTemplates.filter(t => t.id !== 'template1');

    try {
      localStorage.setItem('customEmailTemplates', JSON.stringify(customOnly));
      setCustomTemplates(customOnly);
      setShowToast({ message: 'Templates saved successfully!', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'Failed to save templates.', type: 'error' });
      console.error('Save error:', error);
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      <div className="app-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="app-title mb-0">Email Generator</h2>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowTemplateManager(true)}
          >
            Manage Templates
          </button>
        </div>

        <div className="two-column-layout">
          {/* ===== LEFT COLUMN: FORM CONTROLS ===== */}
          <div className="form-column">

            {/* TEMPLATE SELECTION */}
            <div>
              <label className="form-label">
                Select Template
              </label>
              {availableTemplates.map((template) => (
                <div key={template.id} className="form-radio">
                  <input
                    type="radio"
                    id={template.id}
                    name="templateSelect"
                    value={template.id}
                    checked={templateName === template.id}
                    onChange={(e) => {
                      setTemplateName(e.target.value);
                      // Clear content fields when template changes
                      clearContentFields();
                    }}
                  />
                  <label htmlFor={template.id} className='d-grid'>
                    <small className='text-primary'>{template.name}</small>
                    <hr className='m-1 p-0'/>
                    <small>Logo</small>
                    <small>Title</small>
                    <small>Body</small>
                  </label>
                </div>
              ))}
            </div>

            {/* CLIENT SELECTION DROPDOWN - Only show if template is selected */}
            {templateName && (
              <div>
                <label className="form-label">
                  Select Client
                </label>
            <div className="dropdown active" ref={dropdownRef}>
              <button
                className="btn dropdown-toggle"
                type="button"
                onClick={() => setShowClientDropdown(!showClientDropdown)}
                style={{ textAlign: 'left' }}
              >
                {client ? (
                  <div className="d-flex align-items-center">
                    <Image 
                      src={templatesData.clients[client]?.logo} 
                      alt={client}
                      width={24}
                      height={24}
                      className="dropdown-logo"
                    />
                    {client}
                  </div>
                ) : (
                  '-- Select Client --'
                )}
              </button>
              {showClientDropdown && (
                <ul className="dropdown-menu show w-100" style={{ position: 'absolute', zIndex: 1000 }}>
                  {availableClients.map((c) => (
                    <li key={c}>
                      <button
                        className="dropdown-item d-flex align-items-center"
                        type="button"
                        onClick={() => {
                          setClient(c);
                          setShowClientDropdown(false);
                        }}
                      >
                        <Image 
                          src={templatesData.clients[c]?.logo} 
                          alt={c}
                          width={24}
                          height={24}
                          className="dropdown-logo"
                        />
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

          {/* EMAIL CONTENT FIELDS - Only show when both template and client are selected */}
          {templateName && client && (
            <>
              {/* Email Title */}
              <div>
                <label htmlFor="emailTitle" className="form-label">
                  Email Title 
                </label>
                <input
                  type="text"
                  id="emailTitle"
                  className="form-control"
                  value={emailTitle} 
                  onChange={(e) => setEmailTitle(e.target.value)} 
                  placeholder="Enter Header (e.g: 'Big News!')"
                />
              </div>

              {/* Rich Text Email Body */}
              <div>
                <label htmlFor="emailBody" className="form-label">
                  Email Body
                </label>
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  id="emailBody"
                  value={emailBody}
                  onEditorChange={(content) => setEmailBody(content)}
                  init={{
                    height: 300,
                    menubar: false,
                    statusbar: true,
                    placeholder: 'Enter your email content here. You can add text, links, images, and format your message...',
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'charmap',
                      'anchor', 'searchreplace', 'visualblocks', 'fullscreen',
                      'insertdatetime', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link image | fullscreen | removeformat | help',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size:14px }',
                    skin: 'oxide',
                    // Image handling configuration
                    images_upload_handler: (blobInfo: { blob: () => Blob }) => {
                      return new Promise((resolve, reject) => {
                        // Convert image to base64 data URL for embedding
                        const reader = new FileReader();
                        reader.onload = () => {
                          resolve(reader.result as string);
                        };
                        reader.onerror = () => {
                          reject('Failed to convert image');
                        };
                        reader.readAsDataURL(blobInfo.blob());
                      });
                    },
                    images_upload_base_path: '',
                    automatic_uploads: true,
                    paste_data_images: true,
                    image_advtab: true,
                    image_caption: true,
                    image_title: true
                  }}
                />
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div>
                {!uploadedImage ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      onClick={() => document.getElementById('imageUpload')?.click()}
                    >
                      Include Image
                    </button>
                    <input
                      type="file"
                      id="imageUpload"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <small className="form-text text-muted d-block mt-1">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                    </small>
                  </>
                ) : (
                    <div className="uploaded-image-preview">
                      <label className="form-label">Uploaded Image</label>
                      <div className="image-preview-container mb-2">
                        <Image
                          src={uploadedImage}
                          alt="Uploaded preview"
                          width={200}
                          height={100}
                          style={{ objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      
                      {/* Image Size Controls */}
                      <div>
                        <label htmlFor="imageWidth" className="form-label">
                          Image Width: {Math.min(imageWidth, 600)}px
                        </label>
                        <input
                          type="range"
                          id="imageWidth"
                          className="form-range"
                          min="100"
                          max="600"
                          step="10"
                          value={imageWidth}
                          onChange={(e) => setImageWidth(parseInt(e.target.value))}
                        />
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">100px</small>
                          <small className="text-muted">600px (max)</small>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeImage}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

              {/* CTA BUTTON CONFIGURATION */}
              <div>
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  id="includeCta"
                  className="form-check-input"
                  checked={includeCTA}
                  onChange={(e) => setIncludeCTA(e.target.checked)}
                />
                <label htmlFor="includeCta" className="form-check-label">
                  Include CTA Button?
                </label>
              </div>

              {/* CTA Input Fields - only shown when enabled */}
              {includeCTA && (
                <>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="CTA Button Text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                  <input
                    type="url"
                    className="form-control mb-2"
                    placeholder="CTA Link (URL)"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                  />
                </>
              )}
              </div>




              {/* FOOTER CONFIGURATION */}
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  id="includeFooter"
                  className="form-check-input"
                  checked={includeFooter}
                  onChange={(e) => setIncludeFooter(e.target.checked)}
                />
                <label htmlFor="includeFooter" className="form-check-label">
                  Include Footer?
                </label>
              </div>


            </>
          )}
          </div>

          {/* ===== RIGHT COLUMN: PREVIEW & ACTIONS ===== */}
          <div className="preview-column">
            <div className="preview-content">
              <h5 className="preview-title">Live Preview</h5>
              <div
                className="preview-wrapper"
                dangerouslySetInnerHTML={{ __html: finalHtml }}
              />
            </div>

            {/* ACTION BUTTONS - Fixed at bottom */}
            <div className="btn-row-fixed">
              <button
                className="btn btn-outline-danger"
                onClick={resetForm}
                disabled={!templateName && !client}
              >
                Reset Form
              </button>
              <button
                className="btn btn-secondary"
                onClick={downloadHtml}
                disabled={!finalHtml}
              >
                Download HTML
              </button>
              <button
                className="btn btn-primary"
                onClick={copyToClipboard}
                disabled={!finalHtml}
              >
                Copy HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOAST NOTIFICATIONS ===== */}
      {showToast && (
        <div
          className={`toast align-items-center text-white bg-${showToast.type} border-0 show position-fixed top-0 end-0 m-3`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              {showToast.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
              onClick={() => setShowToast(null)}
            ></button>
          </div>
        </div>
      )}

      {/* ===== TEMPLATE MANAGER MODAL ===== */}
      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onSave={handleTemplatesSave}
        existingTemplates={allTemplates}
      />
    </>
  );
}