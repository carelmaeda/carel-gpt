'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import JSZip from 'jszip';

interface ProcessedImage {
  originalFile: File;
  originalUrl: string;
  resizedUrl: string;
  fileName: string;
}

export default function ImageResize() {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Prevent default browser file drop behavior outside drop zone
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const dropZone = target.closest('.file-upload-zone');
      
      if (!dropZone) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'drop') {
          e.dataTransfer!.effectAllowed = 'none';
          e.dataTransfer!.dropEffect = 'none';
        }
      }
    };

    document.addEventListener('dragover', preventDefaults);
    document.addEventListener('drop', preventDefaults);

    return () => {
      document.removeEventListener('dragover', preventDefaults);
      document.removeEventListener('drop', preventDefaults);
    };
  }, []);

  // Handle file processing (common for upload and drop)
  const processFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length > 0) {
      const validImages: File[] = [];
      const invalidFiles: string[] = [];
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      
      for (const file of files) {
        if (supportedTypes.includes(file.type.toLowerCase())) {
          validImages.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      }
      
      if (validImages.length === 0) {
        setShowToast({ 
          message: 'No supported image files found. Supported formats: JPEG, PNG, GIF, WebP, BMP', 
          type: 'error' 
        });
        return;
      }
      
      setSelectedImages(validImages);
      setProcessedImages([]);
      
      if (invalidFiles.length > 0) {
        setShowToast({ 
          message: `${validImages.length} valid images selected. ${invalidFiles.length} unsupported files skipped (${invalidFiles.slice(0, 3).join(', ')}${invalidFiles.length > 3 ? '...' : ''})`, 
          type: 'warning' 
        });
      } else {
        setShowToast({ message: `${validImages.length} image(s) selected`, type: 'info' });
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const resizeImages = () => {
    if (selectedImages.length === 0 || !canvasRef.current) {
      setShowToast({ message: 'Please select images first!', type: 'error' });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setShowToast({ message: 'Canvas context not available!', type: 'error' });
      return;
    }

    setShowToast({ message: 'Processing images...', type: 'info' });
    const processed: ProcessedImage[] = [];
    let completedCount = 0;

    selectedImages.forEach((file) => {
      const img = new window.Image();
      
      img.onerror = () => {
        setShowToast({ message: `Error loading image: ${file.name}`, type: 'error' });
        completedCount++;
        if (completedCount === selectedImages.length) {
          setProcessedImages([...processed]);
          if (processed.length > 0) {
            setShowToast({ message: `${processed.length} of ${selectedImages.length} images processed successfully!`, type: 'success' });
          }
        }
      };

      img.onload = () => {
        try {
          // Fixed dimensions: 500x500px
          canvas.width = 500;
          canvas.height = 500;
          
          // Clear canvas
          ctx.clearRect(0, 0, 500, 500);
          
          ctx.drawImage(img, 0, 0, 500, 500);
          
          // Fixed format: WebP with 90% quality
          const resizedDataUrl = canvas.toDataURL('image/webp', 0.9);
          
          processed.push({
            originalFile: file,
            originalUrl: URL.createObjectURL(file),
            resizedUrl: resizedDataUrl,
            fileName: file.name.replace(/\.[^/.]+$/, '') + '.webp'
          });
          
        } catch (error) {
          console.error('Error processing image:', error);
          setShowToast({ message: `Error processing image: ${file.name}`, type: 'error' });
        }
        
        completedCount++;
        if (completedCount === selectedImages.length) {
          setProcessedImages([...processed]);
          if (processed.length > 0) {
            setShowToast({ message: `${processed.length} images resized successfully!`, type: 'success' });
          }
        }
      };

      const url = URL.createObjectURL(file);
      img.src = url;
    });
  };

  const downloadImage = (processedImage: ProcessedImage) => {
    const link = document.createElement('a');
    link.href = processedImage.resizedUrl;
    link.download = processedImage.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = async () => {
    if (processedImages.length === 0) {
      setShowToast({ message: 'No resized images to download!', type: 'error' });
      return;
    }

    try {
      setShowToast({ message: 'Creating zip file...', type: 'info' });
      
      const zip = new JSZip();

      // Convert data URLs to blobs and add to zip
      for (const img of processedImages) {
        // Convert data URL to blob
        const response = await fetch(img.resizedUrl);
        const blob = await response.blob();
        zip.file(img.fileName, blob);
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `resized-images-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(link.href);
      
      setShowToast({ message: `${processedImages.length} images downloaded as zip file!`, type: 'success' });
    } catch (error) {
      console.error('Error creating zip file:', error);
      setShowToast({ message: 'Error creating zip file. Downloading individual files instead...', type: 'warning' });
      
      // Fallback to individual downloads
      processedImages.forEach(img => {
        setTimeout(() => downloadImage(img), 100 * processedImages.indexOf(img));
      });
    }
  };

  const resetForm = () => {
    setSelectedImages([]);
    setProcessedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowToast({ message: 'Form reset successfully!', type: 'success' });
  };

  return (
    <>
      <div className="app-container">
        <h2 className="app-title">Image Batch Resize</h2>
        
        <div className="two-column-layout">
          {/* LEFT COLUMN: FORM CONTROLS */}
          <div className="form-column">
            
            {/* FILE UPLOAD */}
            <div className="mb-3">
              <label htmlFor="imageFileInput" className="form-label">
                Select Images
              </label>
              <div
                className={`file-upload-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="imageFileInput"
                  className="d-none"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                  multiple
                  onChange={handleImageUpload}
                />
                <div className="text-center p-3">
                  <Image
                    src="/icons/icon-plus.png"
                    width={48}
                    height={48}
                    alt="Plus"
                    className="icon icon-xl text-muted mb-2"
                  />
                  <p className="mb-1">
                    <strong>Click to browse</strong> or drop it like it&apos;s hot.
                  </p>
                  <small className="text-muted">JPEG, PNG, GIF, WebP, BMP files</small>
                </div>
              </div>
              {selectedImages.length > 0 && (
                <small className="text-muted mt-1 d-block">
                  <Image
                    src="/icons/icon-check.png"
                    width={16}
                    height={16}
                    alt="Check"
                    className="icon me-1"
                  />
                  Selected: {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}
                </small>
              )}
            </div>

            {/* OUTPUT INFO - Show format info */}
            <div className="mb-3">
              <div className="alert alert-info">
                <strong>Output Format:</strong> WebP (500×500px)<br />
                <small>Supported: JPEG, PNG, GIF, WebP, BMP</small>
              </div>
            </div>

            {/* RESIZE BUTTON - Only show when images are selected */}
            {selectedImages.length > 0 && (
              <button
                className="btn btn-primary w-100 mb-3"
                onClick={resizeImages}
              >
                Resize {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* RIGHT COLUMN: PROCESSED FILES */}
          <div className="preview-column">
            <div className="preview-content">
              <h5 className="preview-title">
                Processed Files {processedImages.length > 0 ? `(${processedImages.length})` : ''}
              </h5>
              
              {/* Show processed images list */}
              {processedImages.length > 0 ? (
                <div className="mb-3">
                  <div className="list-group">
                    {processedImages.map((img, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{img.fileName}</strong>
                          <br />
                          <small className="text-muted">500×500px WebP</small>
                        </div>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => downloadImage(img)}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedImages.length > 0 ? (
                <div className="text-center text-muted">
                  <p>{selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected</p>
                  <p>Click &quot;Resize Images&quot; to process</p>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>No images selected</p>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="btn-row-fixed">
              <button
                className="btn btn-outline-danger"
                onClick={resetForm}
                disabled={selectedImages.length === 0}
              >
                Reset
              </button>
              <button
                className="btn btn-success"
                onClick={downloadAllImages}
                disabled={processedImages.length === 0}
              >
                Download as ZIP
              </button>
            </div>
          </div>
        </div>

        {/* HIDDEN CANVAS FOR PROCESSING */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
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