'use client';

import { useState, useEffect, useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { templates, Templates, TemplateSet } from '@/data/templates';
import { renderTemplate } from '@/lib/renderTemplate';

export default function EmailBuilder() {
  // Typed templates for TypeScript safety
  const typedTemplates: Templates = templates;

  const [client, setClient] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [emailTitle, setEmailTitle] = useState<string>(''); 
  const [emailHeader, setEmailHeader] = useState<string>('');
  const [includeCTA, setIncludeCTA] = useState<boolean>(false);
  const [ctaText, setCtaText] = useState<string>('');
  const [ctaLink, setCtaLink] = useState<string>('');
  const [includeFooter, setIncludeFooter] = useState<boolean>(false);
  const [finalHtml, setFinalHtml] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Get templates for selected client or empty
  const clientTemplates: TemplateSet = useMemo(() => 
    client && typedTemplates[client] ? typedTemplates[client] : {} as TemplateSet,
    [client, typedTemplates]
  );

  // Filter template keys (exclude CTA/footer templates)
  const templateOptions = Object.keys(clientTemplates).filter(
    (key) => key !== 'ctaTemplate' && key !== 'footerTemplate'
  );

  useEffect(() => {
    if (!client || !templateName) {
      setFinalHtml('');
      return;
    }

    const baseTemplate = clientTemplates[templateName] ?? '';
    const ctaTemplate = clientTemplates.ctaTemplate ?? '';
    const footerTemplate = clientTemplates.footerTemplate ?? '';

    // Normalize CTA link so href is absolute
    const normalizedCtaLink =
      ctaLink.startsWith('http://') || ctaLink.startsWith('https://')
        ? ctaLink
        : `https://${ctaLink}`;

    const ctaButton =
      includeCTA && ctaText && ctaLink
        ? ctaTemplate
            .replace('{{cta_text}}', ctaText)
            .replace('{{cta_link}}', normalizedCtaLink)
        : '';

    const footer = includeFooter ? footerTemplate : '';

    const html = renderTemplate(baseTemplate, {
      title: emailTitle,
      header: emailHeader,
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
    emailHeader,
    includeCTA,
    ctaText,
    ctaLink,
    includeFooter,
    clientTemplates,
  ]);

  // Hide the toast after a few seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const copyToClipboard = () => {
    if (!finalHtml) {
      setShowToast({ message: 'No HTML to copy!', type: 'error' });
      return;
    }
    navigator.clipboard.writeText(finalHtml)
      .then(() => setShowToast({ message: 'HTML copied to clipboard!', type: 'success' }))
      .catch(() => setShowToast({ message: 'Failed to copy HTML.', type: 'error' }));
  };

  const resetForm = () => {
    setClient('');
    setTemplateName('');
    setEmailBody('');
    setEmailTitle('');
    setEmailHeader('');
    setIncludeCTA(false);
    setCtaText('');
    setCtaLink('');
    setIncludeFooter(false);
    setFinalHtml('');
    setShowToast({ message: 'Form reset successfully!', type: 'success' });
  };

  const downloadHtml = () => {
    if (!finalHtml) {
      setShowToast({ message: 'No HTML to download!', type: 'error' });
      return;
    }
    try {
      const blob = new Blob([finalHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client || 'unknown'}-${templateName || 'email'}.html`; // More robust filename
      document.body.appendChild(a); // Append to body to ensure visibility and clickability in all browsers
      a.click();
      document.body.removeChild(a); // Clean up
      URL.revokeObjectURL(url);
      setShowToast({ message: 'HTML downloaded successfully!', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'Failed to download HTML.', type: 'error' });
      console.error('Download error:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-0">Email Generator</h2>
      <div className="row">
        {/* Form Section */}
        <div className="col-md-6 mb-4">
          {/* Client Selector */}
          <div className="mb-3">
            <label htmlFor="clientSelect" className="form-label">
              Select Client
            </label>
            <select
              id="clientSelect"
              className="form-select"
              value={client}
              onChange={(e) => {
                setClient(e.target.value);
                setTemplateName('');
                setEmailBody(''); // Clear email body on client change
                setEmailHeader(''); // Clear email header on client change
                setIncludeCTA(false); // Reset CTA on client change
                setCtaText(''); // Reset CTA text on client change
                setCtaLink(''); // Reset CTA link on client change
                setIncludeFooter(false); // Reset footer on client change
                setFinalHtml('');
              }}
            >
              <option value="">-- Select Client --</option>
              {Object.keys(typedTemplates).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Template Selector */}
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
                  setEmailBody(''); // Clear email body on template change
                  setEmailHeader(''); // Clear email header on template change
                  setIncludeCTA(false); // Reset CTA on template change
                  setCtaText(''); // Reset CTA text on template change
                  setCtaLink(''); // Reset CTA link on template change
                  setIncludeFooter(false); // Reset footer on template change
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

          {/* Email Body & Options */}
          {templateName && (
            <>
                {/*Title Input */}
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
              
              {/*Header Input */}
              <div className="mb-3">
                <label htmlFor="emailHeader" className="form-label">
                  Email Header
                </label>
                <input
                  type="text"
                  id="emailHeader"
                  className="form-control"
                  value={emailHeader}
                  onChange={(e) => setEmailHeader(e.target.value)}
                  placeholder="Enter Header (e.g: 'Dear Sales Rep,')"
                />
              </div>

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
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'charmap',
                      'anchor', 'searchreplace', 'visualblocks', 'fullscreen',
                      'insertdatetime', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link | removeformat | help',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size:14px }',
                    skin: 'oxide'
                  }}
                />
              </div>

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

        {/* Live Preview */}
        <div className="col-md-6">
          <h5>Live Preview</h5>
          <div
            className="border p-3 bg-white mb-3 rounded preview-wrapper"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />

          {/*Buttons */}
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

      {/* Toast Notification */}
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
  );
}