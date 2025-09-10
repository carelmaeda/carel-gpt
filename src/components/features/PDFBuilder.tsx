'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Image from 'next/image';
import { templates, Templates } from '@/data/templates';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function PDFBuilder() {
  const templatesData: Templates = templates;

  // =============================================================================
  // CONSTANTS & STATIC DATA
  // =============================================================================
  
  // Note: availableTemplates is available for future use when multiple templates are added
  // const availableTemplates = templatesData.templates;
  const availableClients = Object.keys(templatesData.clients);

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  // Form Data States
  const [client, setClient] = useState('');
  const [templateName, setTemplateName] = useState('template1');
  const [documentBody, setDocumentBody] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  
  // Optional Features States
  const [includeCTA, setIncludeCTA] = useState(false);
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [includeFooter, setIncludeFooter] = useState(false);
  const [includeImage, setIncludeImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(400);
  
  // UI & Output States
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // COMPUTED VALUES & MEMOIZED DATA
  // =============================================================================

  // Note: selectedTemplate is available for future use when multiple templates are added
  // const selectedTemplate = useMemo(() => 
  //   availableTemplates.find(t => t.id === templateName),
  //   [templateName, availableTemplates]
  // );

  const selectedClientData = useMemo(() => 
    client ? templatesData.clients[client] : null,
    [client, templatesData.clients]
  );

  // =============================================================================
  // EFFECTS & SIDE-EFFECTS
  // =============================================================================

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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

  const clearContentFields = () => {
    setDocumentBody('');
    setIncludeCTA(false);
    setCtaText('');
    setCtaLink('');
    setIncludeFooter(false);
    setIncludeImage(false);
    setUploadedImage(null);
    setImageWidth(400);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setShowToast({ message: 'Image size must be less than 5MB', type: 'error' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setShowToast({ message: 'Please select a valid image file', type: 'error' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIncludeImage(true);
        setShowToast({ message: 'Image uploaded successfully!', type: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setIncludeImage(false);
    setImageWidth(400);
  };

  const resetForm = () => {
    setTemplateName('template1');
    setClient('');
    clearContentFields();
    setShowToast({ message: 'Form reset successfully!', type: 'success' });
  };

  // Helper function to strip HTML tags from rich text content
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Helper function to convert image to PDF-lib format
  const loadImageForPDF = async (imageDataUrl: string): Promise<Uint8Array> => {
    const response = await fetch(imageDataUrl);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  const generatePDF = async () => {
    if (!selectedClientData || !documentTitle || !documentBody) {
      setShowToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Standard letter size
      const { width, height } = page.getSize();
      
      // Load fonts
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let yPosition = height - 50; // Start from top with margin
      const margin = 50;
      const contentWidth = width - (margin * 2);
      
      // Add client logo (if available)
      try {
        if (selectedClientData.logo) {
          const logoResponse = await fetch(selectedClientData.logo);
          const logoArrayBuffer = await logoResponse.arrayBuffer();
          const logoImageBytes = new Uint8Array(logoArrayBuffer);
          
          let logoImage;
          if (selectedClientData.logo.includes('.png')) {
            logoImage = await pdfDoc.embedPng(logoImageBytes);
          } else {
            logoImage = await pdfDoc.embedJpg(logoImageBytes);
          }
          
          const logoWidth = 120;
          const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
          
          page.drawImage(logoImage, {
            x: (width - logoWidth) / 2,
            y: yPosition - logoHeight,
            width: logoWidth,
            height: logoHeight,
          });
          
          yPosition -= logoHeight + 30;
        }
      } catch (error) {
        console.warn('Could not load logo:', error);
      }
      
      // Add title
      page.drawText(documentTitle, {
        x: margin,
        y: yPosition,
        size: 24,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
        maxWidth: contentWidth,
      });
      yPosition -= 50;
      
      // Add body content (strip HTML tags)
      const bodyText = stripHtml(documentBody);
      const lines = bodyText.split('\n');
      
      for (const line of lines) {
        if (yPosition < 100) {
          // Add new page if needed
          const newPage = pdfDoc.addPage([612, 792]);
          yPosition = newPage.getSize().height - 50;
        }
        
        // Handle long lines by wrapping
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = helveticaFont.widthOfTextAtSize(testLine, 12);
          
          if (textWidth > contentWidth && currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 12,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= 20;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= 20;
        }
        
        if (!line.trim()) {
          yPosition -= 10; // Extra space for empty lines
        }
      }
      
      // Add uploaded image if included
      if (includeImage && uploadedImage) {
        try {
          const imageBytes = await loadImageForPDF(uploadedImage);
          let pdfImage;
          
          if (uploadedImage.startsWith('data:image/png')) {
            pdfImage = await pdfDoc.embedPng(imageBytes);
          } else {
            pdfImage = await pdfDoc.embedJpg(imageBytes);
          }
          
          const effectiveImageWidth = Math.min(imageWidth, contentWidth);
          const imageHeight = (pdfImage.height / pdfImage.width) * effectiveImageWidth;
          
          yPosition -= 20; // Space before image
          
          if (yPosition - imageHeight < 50) {
            // Add new page if needed
            const newPage = pdfDoc.addPage([612, 792]);
            yPosition = newPage.getSize().height - 50;
          }
          
          page.drawImage(pdfImage, {
            x: (width - effectiveImageWidth) / 2, // Center the image
            y: yPosition - imageHeight,
            width: effectiveImageWidth,
            height: imageHeight,
          });
          
          yPosition -= imageHeight + 20;
        } catch (error) {
          console.warn('Could not add image to PDF:', error);
        }
      }
      
      // Add CTA if included
      if (includeCTA && ctaText && ctaLink) {
        yPosition -= 20;
        
        const ctaColor = selectedClientData.ctaColor;
        const [r, g, b] = hexToRgb(ctaColor);
        
        // Draw CTA button background
        const ctaWidth = 200;
        const ctaHeight = 40;
        const ctaX = (width - ctaWidth) / 2;
        
        page.drawRectangle({
          x: ctaX,
          y: yPosition - ctaHeight,
          width: ctaWidth,
          height: ctaHeight,
          color: rgb(r / 255, g / 255, b / 255),
        });
        
        // Draw CTA text
        const ctaTextWidth = helveticaBoldFont.widthOfTextAtSize(ctaText, 14);
        page.drawText(ctaText, {
          x: ctaX + (ctaWidth - ctaTextWidth) / 2,
          y: yPosition - ctaHeight / 2 - 5,
          size: 14,
          font: helveticaBoldFont,
          color: rgb(1, 1, 1), // White text
        });
        
        yPosition -= ctaHeight + 20;
      }
      
      // Add footer if included
      if (includeFooter) {
        const footerText = stripHtml(selectedClientData.footerTemplate);
        const footerLines = footerText.split('\n').filter(line => line.trim());
        
        let footerY = 50; // Bottom margin
        
        for (let i = footerLines.length - 1; i >= 0; i--) {
          const line = footerLines[i].trim();
          if (line) {
            page.drawText(line, {
              x: margin,
              y: footerY,
              size: 10,
              font: helveticaFont,
              color: rgb(0.4, 0.4, 0.4),
              maxWidth: contentWidth,
            });
            footerY += 15;
          }
        }
      }
      
      // Save and download the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client || 'document'}-${templateName || 'pdf'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowToast({ message: 'PDF generated and downloaded successfully!', type: 'success' });
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setShowToast({ message: 'Failed to generate PDF. Please try again.', type: 'error' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      <div className="app-container">
        <h2 className="app-title">PDF Generator</h2>
        
        <div className="two-column-layout">
          {/* ===== LEFT COLUMN: FORM CONTROLS ===== */}
          <div className="form-column">

            {/* TEMPLATE SELECTION */}
            <div>
              <label className="form-label">
                Select Template
              </label>
              <div className="form-radio">
                <input
                  type="radio"
                  id="template1"
                  name="templateSelect"
                  disabled
                  value="template1"
                  checked={templateName === 'template1'}
                  onChange={(e) => {
                    setTemplateName(e.target.value);
                    clearContentFields();
                  }}
                />
                <label htmlFor="template1" className='d-grid'>
                  <small className='text-primary'>Template 1</small>
                  <hr className='m-1 p-0'/>
                  <small>Logo</small>
                  <small>Title</small>
                  <small>Body</small>
                </label>
              </div>
            </div>

            {/* CLIENT SELECTION DROPDOWN */}
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

          {/* DOCUMENT CONTENT FIELDS */}
          {templateName && client && (
            <>
              {/* Document Title */}
              <div>
                <label htmlFor="documentTitle" className="form-label">
                  Document Title 
                </label>
                <input
                  type="text"
                  id="documentTitle"
                  className="form-control"
                  value={documentTitle} 
                  onChange={(e) => setDocumentTitle(e.target.value)} 
                  placeholder="Enter document title (e.g: 'Important Update')"
                />
              </div>

              {/* Rich Text Document Body */}
              <div>
                <label htmlFor="documentBody" className="form-label">
                  Document Body
                </label>
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  id="documentBody"
                  value={documentBody}
                  onEditorChange={(content) => setDocumentBody(content)}
                  init={{
                    height: 300,
                    menubar: false,
                    statusbar: true,
                    placeholder: 'Enter your document content here. You can add text, links, and format your message...',
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'charmap',
                      'anchor', 'searchreplace', 'visualblocks', 'fullscreen',
                      'insertdatetime', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | fullscreen | removeformat | help',
                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size:14px }',
                    skin: 'oxide',
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
              <h5 className="preview-title">PDF Preview</h5>
              <div className="preview-wrapper">
                {templateName && client && documentTitle && documentBody ? (
                  <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <Image 
                        src={templatesData.clients[client]?.logo} 
                        alt={client}
                        width={60}
                        height={60}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <h4 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
                      {documentTitle}
                    </h4>
                    <div 
                      style={{ lineHeight: '1.6', marginBottom: '20px', fontSize: '14px' }}
                      dangerouslySetInnerHTML={{ __html: documentBody }}
                    />
                    {includeImage && uploadedImage && (
                      <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <Image
                          src={uploadedImage}
                          alt="Document Image"
                          width={Math.min(imageWidth / 2, 300)}
                          height={150}
                          style={{ objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                    {includeCTA && ctaText && ctaLink && (
                      <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <div 
                          style={{ 
                            display: 'inline-block', 
                            backgroundColor: templatesData.clients[client]?.ctaColor || '#007cba', 
                            color: 'white', 
                            padding: '12px 24px', 
                            borderRadius: '5px', 
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {ctaText}
                        </div>
                      </div>
                    )}
                    {includeFooter && (
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                        <div dangerouslySetInnerHTML={{ __html: templatesData.clients[client]?.footerTemplate || '' }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    Select template, client, and fill in content to see preview
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="btn-row-fixed">
              <button
                className="btn btn-outline-danger"
                onClick={resetForm}
                disabled={!templateName && !client}
              >
                Reset Form
              </button>
              <button
                className="btn btn-primary"
                onClick={generatePDF}
                disabled={!templateName || !client || !documentTitle || !documentBody || isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATIONS */}
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
    </>
  );
}