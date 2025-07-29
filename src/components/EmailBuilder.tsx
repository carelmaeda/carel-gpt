'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { templates, Templates, TemplateSet } from '@/data/templates';
import { renderTemplate } from '@/lib/renderTemplate';


export default function EmailBuilder() {
  const typedTemplates: Templates = templates;

  // =============================================================================
  // CONSTANTS & STATIC DATA
  // =============================================================================
  
  /*Client logos*/
  const clientData = {
    "Royal Canin": {
      logo: "https://cdn.brandfetch.io/ide1aIn1hE/theme/dark/logo.svg"
    },
    "Hills Canada": {
      logo: "https://cdn.brandfetch.io/idVKGfG_3n/w/200/h/200/theme/dark/logo.png"
    },
    "MARS": {
      logo: "https://cdn.brandfetch.io/idFvQZLcOg/theme/dark/logo.svg"
    },
    "Nestle": {
      logo: "https://cdn.brandfetch.io/id1xOwiSj_/theme/dark/logo.svg"
    }
  };

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
  
  // UI & Output States
  const [finalHtml, setFinalHtml] = useState('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // COMPUTED VALUES & MEMOIZED DATA
  // =============================================================================

  /** Get templates for selected client or return empty object */
  const clientTemplates: TemplateSet = useMemo(() => 
    client && typedTemplates[client] ? typedTemplates[client] : {} as TemplateSet,
    [client, typedTemplates]
  );

  /** Filter out system templates to show only user-selectable options */
  const templateOptions = useMemo(() => 
    Object.keys(clientTemplates).filter(
      (key) => key !== 'ctaTemplate' && key !== 'footerTemplate'
    ), [clientTemplates]
  );

  // =============================================================================
  // EFFECTS & SIDE-EFFECTS
  // =============================================================================

  /** Main effect: Generate HTML when form data changes */
  useEffect(() => {
    if (!client || !templateName) {
      setFinalHtml('');
      return;
    }

    // Get template components
    const baseTemplate = clientTemplates[templateName] ?? '';
    const ctaTemplate = clientTemplates.ctaTemplate ?? '';
    const footerTemplate = clientTemplates.footerTemplate ?? '';

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

    // Render final email HTML
    const html = renderTemplate(baseTemplate, {
      title: emailTitle,
      body: emailBody,
      cta_button: ctaButton,
      footer,
    });

    setFinalHtml(html);
  }, [
    client,
    templateName,
    emailTitle,
    emailBody,
    includeCTA,
    ctaText,
    ctaLink,
    includeFooter,
    clientTemplates,
  ]); // Dependencies: re-render when any form field changes

  /** Auto-hide toast notifications after 3 seconds */
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
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

  /** Clear all form fields except client selection */
  const clearFormFields = () => {
    setTemplateName('');
    setEmailBody('');
    setIncludeCTA(false);
    setCtaText('');
    setCtaLink('');
    setIncludeFooter(false);
    setFinalHtml('');
  };

  /** Reset entire form to initial state */
  const resetForm = () => {
    setClient('');
    clearFormFields();
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

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      <div className="container-fluid">
        <h2 className="mb-3">Email Generator</h2>
        <div className="row">
          {/* ===== LEFT COLUMN: FORM CONTROLS ===== */}
          <div className="col-md-6 mb-4">

            {/* CLIENT SELECTION DROPDOWN */}
            <div className="mb-3">
            <label className="form-label">
              Select Client
            </label>
            <div className="dropdown" ref={dropdownRef}>
              <button
                className="btn btn-outline-secondary dropdown-toggle w-100 d-flex align-items-center justify-content-between"
                type="button"
                onClick={() => setShowClientDropdown(!showClientDropdown)}
                style={{ textAlign: 'left' }}
              >
                {client ? (
                  <div className="d-flex align-items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={clientData[client as keyof typeof clientData]?.logo} 
                      alt={client}
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
                  {Object.keys(typedTemplates).map((c) => (
                    <li key={c}>
                      <button
                        className="dropdown-item d-flex align-items-center"
                        type="button"
                        onClick={() => {
                          setClient(c);
                          clearFormFields(); // Reset form when client changes
                          setShowClientDropdown(false);
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={clientData[c as keyof typeof clientData]?.logo} 
                          alt={c}
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

            {/* TEMPLATE SELECTION */}
            {client && (
              <div className="mb-3">
              <label htmlFor="templateSelect" className="form-label">
                Select Template
              </label>
              <select
                id="templateSelect"
                className="form-select"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  // Clear all email fields when template changes
                  setEmailBody('');
                  setIncludeCTA(false);
                  setCtaText('');
                  setCtaLink('');
                  setIncludeFooter(false);
                  setFinalHtml('');
                }}
              >
                <option value="">-- Select Template --</option>
                {templateOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* EMAIL CONTENT FIELDS */}
          {templateName && (
            <>
              {/* Email Title */}
              <div className="mb-3">
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
              <div className="mb-3">
                <label htmlFor="emailBody" className="form-label">
                  Email Body
                </label>
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  id="emailBody"
                  value={emailBody}
                  onEditorChange={(content) => setEmailBody(content)}
                  init={{
                    height: 200,
                    menubar: false,
                    statusbar: true,
                    placeholder: 'Enter your email content here. You can add text, links, images, and format your message...',
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
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

              {/* CTA BUTTON CONFIGURATION */}
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
        <div className="col-md-6">
          
          {/* LIVE EMAIL PREVIEW */}
          <h5>Live Preview</h5>
          <div
            className="border mb-3 rounded preview-wrapper"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />

          {/* ACTION BUTTONS */}
          {templateName && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-danger"
                onClick={resetForm}
              >
                Reset Form
              </button>
              <button
                className="btn btn-primary"
                onClick={copyToClipboard}
                disabled={!finalHtml}
              >
                Copy HTML
              </button>
              <button
                className="btn btn-secondary"
                onClick={downloadHtml}
                disabled={!finalHtml}
              >
                Download HTML
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== TOAST NOTIFICATIONS ===== */}
      {showToast && (
        <div
          className={`toast align-items-center text-white bg-${showToast.type} border-0 show position-fixed bottom-0 end-0 m-3`}
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
      </div>
    </>
  );
}