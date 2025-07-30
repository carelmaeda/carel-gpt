'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableTextNode {
  id: string;
  originalText: string;
  currentText: string;
  xpath: string;
}

export default function SmartHtml() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalHtml, setOriginalHtml] = useState<string>('');
  const [editableTexts, setEditableTexts] = useState<EditableTextNode[]>([]);
  const [modifiedHtml, setModifiedHtml] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide toast notifications after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Handle file processing (common for upload and drop)
  const processFile = async (file: File) => {
    if (!file || file.type !== 'text/html') {
      setShowToast({ message: 'Please upload a valid HTML file', type: 'error' });
      return;
    }

    setUploadedFile(file);
    
    try {
      const content = await file.text();
      setOriginalHtml(content);
      parseHtmlForEditableText(content);
      setShowToast({ message: 'HTML file uploaded successfully!', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'Failed to read HTML file', type: 'error' });
      console.error('File reading error:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  // Handle drag and drop events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  // Parse HTML and extract editable text nodes
  const parseHtmlForEditableText = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const editableNodes: EditableTextNode[] = [];

    // Recursive function to traverse DOM and find text nodes
    const traverseNode = (node: Node, xpath: string = '') => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text && text.length > 0) {
          editableNodes.push({
            id: `text-${editableNodes.length}`,
            originalText: text,
            currentText: text,
            xpath: xpath
          });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const newXpath = xpath + `/${tagName}`;
        
        Array.from(node.childNodes).forEach((child, index) => {
          traverseNode(child, `${newXpath}[${index + 1}]`);
        });
      }
    };

    traverseNode(doc.body || doc.documentElement);
    setEditableTexts(editableNodes);
    setModifiedHtml(htmlContent);
  };

  // Update text content
  const updateTextContent = (id: string, newText: string) => {
    setEditableTexts(prev => 
      prev.map(item => 
        item.id === id ? { ...item, currentText: newText } : item
      )
    );
    
    // Rebuild HTML with updated text
    rebuildHtml(id, newText);
  };

  // Rebuild HTML with updated text content
  const rebuildHtml = (updatedId: string, newText: string) => {
    let updatedHtml = originalHtml;
    
    editableTexts.forEach(textNode => {
      const textToReplace = textNode.id === updatedId ? newText : textNode.currentText;
      updatedHtml = updatedHtml.replace(textNode.originalText, textToReplace);
    });
    
    setModifiedHtml(updatedHtml);
  };

  // Download modified HTML
  const downloadHtml = () => {
    if (!modifiedHtml) {
      setShowToast({ message: 'No HTML to download!', type: 'error' });
      return;
    }

    try {
      const blob = new Blob([modifiedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `modified-${uploadedFile?.name || 'document.html'}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowToast({ message: 'HTML downloaded successfully!', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'Failed to download HTML', type: 'error' });
      console.error('Download error:', error);
    }
  };

  // Reset to original values
  const resetToOriginal = () => {
    if (editableTexts.length === 0) return;
    
    const resetTexts = editableTexts.map(textNode => ({
      ...textNode,
      currentText: textNode.originalText
    }));
    
    setEditableTexts(resetTexts);
    setModifiedHtml(originalHtml);
    setShowToast({ message: 'Text reset to original values!', type: 'success' });
  };

  // Reset form
  const resetForm = () => {
    setUploadedFile(null);
    setOriginalHtml('');
    setEditableTexts([]);
    setModifiedHtml('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowToast({ message: 'Form reset successfully!', type: 'success' });
  };

  return (
    <>
      <div className="container-fluid">
        <h2 className="mb-3">Smart HTML Editor</h2>
        <div className="row">
          
          {/* LEFT COLUMN: Upload and Edit Controls */}
          <div className="col-md-4">
            
            {/* File Upload Section */}
            <div className="mb-3">
              <label htmlFor="htmlFileInput" className="form-label">
                Upload HTML File
              </label>
              <div
                className={`file-upload-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="htmlFileInput"
                  className="d-none"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                />
                <div className="text-center p-3">
                  <i className="bi bi-plus fs-1 text-muted mb-2"></i>
                  <p className="mb-1">
                    <strong>Click to browse</strong> or drop it like it&apos;s hot.
                  </p>
                  <small className="text-muted">HTML files only</small>
                </div>
              </div>
              {uploadedFile && (
                <small className="text-muted mt-1 d-block">
                  <i className="bi bi-check-circle-fill text-success me-1"></i>
                  Uploaded: {uploadedFile.name}
                </small>
              )}
            </div>

            {/* Editable Text Fields */}
            {editableTexts.length > 0 && (
              <div className="my-3">
                <h5>Editable Text</h5>
                <div className="editable-texts-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {editableTexts.map((textNode, index) => (
                    <div key={textNode.id} className="mb-2">
                      <label className="form-label">
                        Text {index + 1}
                      </label>
                      <textarea
                        className="form-control"
                        value={textNode.currentText}
                        onChange={(e) => updateTextContent(textNode.id, e.target.value)}
                        rows={2}
                        placeholder="Enter text content..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: HTML Preview */}
          <div className="col-md-8 preview-container">
            <h5>Live Preview</h5>
            <div
              className="border mb-3 rounded preview-wrapper"
            >
              {modifiedHtml ? (
                <iframe
                  srcDoc={modifiedHtml}
                  className="w-100 h-100"
                  style={{ minHeight: '400px', border: 'none' }}
                  title="HTML Preview"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <div className="text-center">
                    <i className="bi bi-file-earmark-code" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-2">Upload an HTML file to start editing</p>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            {originalHtml && (
              <div className="btn-row">
                <button
                  className="btn btn-outline-secondary"
                  onClick={resetToOriginal}
                  disabled={editableTexts.length === 0}
                >
                  Reset to Original
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={resetForm}
                >
                  Reset Form
                </button>
                <button
                  className="btn btn-primary"
                  onClick={downloadHtml}
                  disabled={!modifiedHtml}
                >
                  Download HTML
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
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
              aria-label="Close"
              onClick={() => setShowToast(null)}
            ></button>
          </div>
        </div>
      )}
    </>
  );
}