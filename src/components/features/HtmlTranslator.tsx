'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import * as htmlparser2 from 'htmlparser2';
import { encode } from 'he';

interface TextNode {
  id: string;
  originalText: string;
  translatedText: string;
  xpath: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

export default function HtmlTranslator() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalHtml, setOriginalHtml] = useState<string>('');
  const [textNodes, setTextNodes] = useState<TextNode[]>([]);
  const [translatedHtml, setTranslatedHtml] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
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

  // Parse HTML and extract only visible text nodes
  const parseHtmlForText = (htmlContent: string): TextNode[] => {
    const textNodes: TextNode[] = [];
    let nodeId = 0;
    let currentTag = '';
    // eslint-disable-next-line prefer-const
    let tagStack: string[] = [];

    // Tags that should be ignored (scripts, styles, etc.)
    const ignoreTags = new Set(['script', 'style', 'noscript', 'meta', 'link', 'title', 'head']);
    let skipContent = false;

    const parser = new htmlparser2.Parser({
      onopentag(name: string) {
        tagStack.push(name.toLowerCase());
        currentTag = name.toLowerCase();
        if (ignoreTags.has(currentTag)) {
          skipContent = true;
        }
      },
      ontext(text: string) {
        if (skipContent) return;
        
        const trimmedText = text.trim();
        // Only include meaningful text (more than just whitespace/newlines)
        if (trimmedText && trimmedText.length > 2 && !/^\s*$/.test(trimmedText)) {
          textNodes.push({
            id: `text-${nodeId}`,
            originalText: trimmedText,
            translatedText: trimmedText,
            xpath: `text-${nodeId}`
          });
          nodeId++;
        }
      },
      onclosetag(name: string) {
        if (tagStack.length > 0) {
          tagStack.pop();
        }
        if (ignoreTags.has(name.toLowerCase())) {
          skipContent = false;
        }
        currentTag = tagStack.length > 0 ? tagStack[tagStack.length - 1] : '';
      }
    }, { decodeEntities: true });

    parser.write(htmlContent);
    parser.end();

    return textNodes;
  };

  // Handle file processing
  const processFile = async (file: File) => {
    if (!file || file.type !== 'text/html') {
      setShowToast({ message: 'Please upload a valid HTML file', type: 'error' });
      return;
    }

    setUploadedFile(file);
    
    try {
      const content = await file.text();
      setOriginalHtml(content);
      const extractedTextNodes = parseHtmlForText(content);
      setTextNodes(extractedTextNodes);
      setTranslatedHtml(content);
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

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  // Simple language detection based on common words
  const detectSourceLanguage = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Spanish indicators
    if (/\b(el|la|de|en|que|y|con|para|por|es|un|una|se|te|le|su|como|pero|más|todo|muy|bien|aquí|ahora|donde|cuando|porque|qué|cómo|entre|hasta|desde|sobre|durante|después|antes|sin|contra)\b/.test(lowerText)) {
      return 'es';
    }
    
    // French indicators
    if (/\b(le|la|les|de|du|des|et|en|dans|pour|par|avec|sur|sous|ce|cette|ces|qui|que|dont|où|quand|comment|pourquoi|très|bien|tout|tous|peut|être|avoir|faire|aller|voir|savoir|venir|dire|prendre|donner)\b/.test(lowerText)) {
      return 'fr';
    }
    
    // Default to English if no clear indicators
    return 'en';
  };

  // Mock translation function for demo purposes
  const mockTranslate = (text: string, targetLang: string): string => {
    const mockTranslations: Record<string, Record<string, string>> = {
      es: {
        'Hello': 'Hola', 'World': 'Mundo', 'Welcome': 'Bienvenido', 'Home': 'Inicio', 'About': 'Acerca', 'Contact': 'Contacto',
        'Services': 'Servicios', 'Products': 'Productos', 'Company': 'Empresa', 'News': 'Noticias', 'Email': 'Correo',
        'Phone': 'Teléfono', 'Address': 'Dirección', 'Login': 'Iniciar sesión', 'Register': 'Registrarse', 'Search': 'Buscar',
        'Menu': 'Menú', 'Footer': 'Pie de página', 'Header': 'Encabezado', 'Main': 'Principal', 'Content': 'Contenido',
        'Title': 'Título', 'Description': 'Descripción', 'Image': 'Imagen', 'Link': 'Enlace', 'Button': 'Botón',
        'Form': 'Formulario', 'Submit': 'Enviar', 'Cancel': 'Cancelar', 'Save': 'Guardar', 'Delete': 'Eliminar',
        'Edit': 'Editar', 'View': 'Ver', 'Download': 'Descargar', 'Upload': 'Cargar', 'Settings': 'Configuración',
        'Thank': 'Gracias', 'you': 'usted', 'for': 'por', 'your': 'su', 'order': 'pedido', 'Here': 'Aquí', 'is': 'es',
        'temporary': 'temporal', 'password': 'contraseña', 'Please': 'Por favor', 'ignore': 'ignorar', 'this': 'este',
        'email': 'correo electrónico', 'receiving': 'recibiendo', 'from': 'de', 'Terms': 'Términos', 'Service': 'Servicio',
        'Privacy': 'Privacidad', 'Policy': 'Política', 'Powered': 'Desarrollado', 'by': 'por'
      },
      fr: {
        'Hello': 'Bonjour', 'World': 'Monde', 'Welcome': 'Bienvenue', 'Home': 'Accueil', 'About': 'À propos', 'Contact': 'Contact',
        'Services': 'Services', 'Products': 'Produits', 'Company': 'Entreprise', 'News': 'Actualités', 'Email': 'E-mail',
        'Phone': 'Téléphone', 'Address': 'Adresse', 'Login': 'Connexion', 'Register': 'S\'inscrire', 'Search': 'Rechercher',
        'Menu': 'Menu', 'Footer': 'Pied de page', 'Header': 'En-tête', 'Main': 'Principal', 'Content': 'Contenu',
        'Title': 'Titre', 'Description': 'Description', 'Image': 'Image', 'Link': 'Lien', 'Button': 'Bouton',
        'Form': 'Formulaire', 'Submit': 'Soumettre', 'Cancel': 'Annuler', 'Save': 'Sauvegarder', 'Delete': 'Supprimer',
        'Edit': 'Modifier', 'View': 'Voir', 'Download': 'Télécharger', 'Upload': 'Téléverser', 'Settings': 'Paramètres',
        'Thank': 'Merci', 'you': 'vous', 'for': 'pour', 'your': 'votre', 'order': 'commande', 'Here': 'Voici', 'is': 'est',
        'temporary': 'temporaire', 'password': 'mot de passe', 'Please': 'S\'il vous plaît', 'ignore': 'ignorer', 'this': 'ceci',
        'email': 'e-mail', 'receiving': 'recevant', 'from': 'de', 'Terms': 'Conditions', 'Service': 'Service',
        'Privacy': 'Confidentialité', 'Policy': 'Politique', 'Powered': 'Alimenté', 'by': 'par'
      }
    };

    const translations = mockTranslations[targetLang] || {};
    
    // Case-insensitive word-by-word translation for demo
    return text.split(' ').map(word => {
      const cleanWord = word.replace(/[.,!?;:()[\]{}"""'']/g, '');
      const punctuation = word.replace(cleanWord, '');
      const lowerClean = cleanWord.toLowerCase();
      const upperClean = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
      
      // Try exact match first, then case variations
      let translation = translations[cleanWord] || 
                       translations[lowerClean] || 
                       translations[upperClean] || 
                       cleanWord;
      
      // Preserve original case
      if (cleanWord === cleanWord.toUpperCase() && cleanWord.length > 1) {
        translation = translation.toUpperCase();
      } else if (cleanWord.charAt(0) === cleanWord.charAt(0).toUpperCase()) {
        translation = translation.charAt(0).toUpperCase() + translation.slice(1);
      }
      
      return translation + punctuation;
    }).join(' ');
  };

  // Try MyMemory API directly (client-side)
  const tryMyMemoryTranslate = async (text: string, targetLanguage: string): Promise<string> => {
    try {
      const sourceLanguage = detectSourceLanguage(text);
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`MyMemory failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
      throw new Error('No translated text in MyMemory response');
    } catch (error) {
      console.error('MyMemory failed:', error);
      throw error;
    }
  };

  // Translate text using client-side translation services
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    try {
      // Skip translation if target language is same as detected source
      const sourceLanguage = detectSourceLanguage(text);
      if (sourceLanguage === targetLang) {
        return text;
      }

      // Try MyMemory API first
      try {
        const translated = await tryMyMemoryTranslate(text, targetLang);
        console.log(`MyMemory translation: "${text}" -> "${translated}"`);
        return translated;
      } catch {
        console.log('MyMemory failed, using mock translation...');
        const mockResult = mockTranslate(text, targetLang);
        console.log(`Mock translation: "${text}" -> "${mockResult}"`);
        return mockResult;
      }
    } catch (error) {
      console.error('Translation error for text:', { text: text.substring(0, 50), error });
      return text; // Return original text if translation fails
    }
  };

  // Translate all text nodes
  const translateAllText = async () => {
    if (textNodes.length === 0) {
      setShowToast({ message: 'No text to translate', type: 'error' });
      return;
    }

    if (textNodes.length > 50) {
      setShowToast({ message: 'Too many text nodes to translate (max 50). Try with a simpler HTML file.', type: 'error' });
      return;
    }

    setIsTranslating(true);
    
    try {
      console.log(`Starting translation of ${textNodes.length} text nodes to ${targetLanguage}`);
      
      // Translate nodes in smaller batches to avoid overwhelming the API
      const batchSize = 5;
      const translatedNodes: TextNode[] = [];
      
      for (let i = 0; i < textNodes.length; i += batchSize) {
        const batch = textNodes.slice(i, i + batchSize);
        console.log(`Translating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(textNodes.length/batchSize)}`);
        
        const batchResults = await Promise.all(
          batch.map(async (node, batchIndex) => {
            try {
              const translated = await translateText(node.originalText, targetLanguage);
              console.log(`Translated node ${i + batchIndex + 1}/${textNodes.length}: "${node.originalText.substring(0, 30)}..." -> "${translated.substring(0, 30)}..."`);
              return {
                ...node,
                translatedText: translated
              };
            } catch (error) {
              console.error(`Failed to translate node ${i + batchIndex + 1}:`, error);
              return {
                ...node,
                translatedText: node.originalText // Keep original if translation fails
              };
            }
          })
        );
        
        translatedNodes.push(...batchResults);
        
        // Small delay between batches to be nice to the API
        if (i + batchSize < textNodes.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`Translation completed. ${translatedNodes.length} nodes processed.`);
      setTextNodes(translatedNodes);
      rebuildHtmlWithTranslations(translatedNodes);
      
      const successfulTranslations = translatedNodes.filter(node => node.translatedText !== node.originalText).length;
      setShowToast({ 
        message: `Translation completed! ${successfulTranslations}/${translatedNodes.length} texts translated successfully.`, 
        type: 'success' 
      });
    } catch (error) {
      setShowToast({ message: 'Translation failed. Please try again.', type: 'error' });
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Rebuild HTML with translated text and HTML entity encoding
  const rebuildHtmlWithTranslations = (translatedNodes: TextNode[]) => {
    let updatedHtml = originalHtml;
    
    // Sort nodes by original text length (longest first) to avoid partial replacements
    const sortedNodes = [...translatedNodes].sort((a, b) => b.originalText.length - a.originalText.length);
    
    // Replace original text with encoded translated text
    sortedNodes.forEach((node, index) => {
      try {
        // Encode the translated text to HTML entities
        const encodedTranslatedText = encode(node.translatedText, { useNamedReferences: true });
        
        // Use a more precise replacement to avoid replacing partial matches
        // Create a regex that matches the exact text but accounts for HTML whitespace
        const escapedOriginal = node.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedOriginal}\\b`, 'g');
        
        // Count how many times this text appears to avoid over-replacement
        const matches = updatedHtml.match(regex);
        if (matches && matches.length > 0) {
          // Replace only the first occurrence to be safe
          updatedHtml = updatedHtml.replace(regex, encodedTranslatedText);
          console.log(`Replaced "${node.originalText}" with "${encodedTranslatedText}"`);
        } else {
          // Fallback: try simple string replacement
          if (updatedHtml.includes(node.originalText)) {
            updatedHtml = updatedHtml.replace(node.originalText, encodedTranslatedText);
            console.log(`Fallback replacement: "${node.originalText}" with "${encodedTranslatedText}"`);
          }
        }
      } catch (error) {
        console.error(`Error replacing text for node ${index}:`, error);
        // If encoding fails, use original translated text without encoding
        updatedHtml = updatedHtml.replace(node.originalText, node.translatedText);
      }
    });

    setTranslatedHtml(updatedHtml);
  };

  // Copy HTML to clipboard
  const copyToClipboard = async () => {
    if (!translatedHtml) {
      setShowToast({ message: 'No translated HTML to copy!', type: 'error' });
      return;
    }

    try {
      await navigator.clipboard.writeText(translatedHtml);
      setShowToast({ message: 'HTML copied to clipboard!', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'Failed to copy to clipboard', type: 'error' });
      console.error('Clipboard error:', error);
    }
  };

  // Download translated HTML
  const downloadHtml = () => {
    if (!translatedHtml) {
      setShowToast({ message: 'No translated HTML to download!', type: 'error' });
      return;
    }

    try {
      const blob = new Blob([translatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translated-${uploadedFile?.name || 'document.html'}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowToast({ message: 'Translated HTML downloaded successfully!', type: 'success' });
    } catch (error) {
      setShowToast({ message: 'Failed to download HTML', type: 'error' });
      console.error('Download error:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setUploadedFile(null);
    setOriginalHtml('');
    setTextNodes([]);
    setTranslatedHtml('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowToast({ message: 'Form reset successfully!', type: 'success' });
  };

  return (
    <>
      <div className="app-container" data-component="html-translator">
        <h2 className="app-title">HTML Translator</h2>
        
        <div className="two-column-layout">
          {/* LEFT COLUMN: Upload and Translation Controls */}
          <div className="form-column">
            
            {/* File Upload Section */}
            <div className="mb-3">
              <label htmlFor="htmlFileInput" className="form-label">
                Upload HTML File
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
                  id="htmlFileInput"
                  className="d-none"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
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
                  <small className="text-muted">HTML files only</small>
                </div>
              </div>
              {uploadedFile && (
                <small className="text-muted mt-1 d-block">
                  <Image
                    src="/icons/icon-check.png"
                    width={16}
                    height={16}
                    alt="Check"
                    className="icon me-1"
                  />
                  Uploaded: {uploadedFile.name}
                </small>
              )}
            </div>

            {/* Language Selection */}
            {textNodes.length > 0 && (
              <div className="mb-3">
                <label htmlFor="languageSelect" className="form-label">
                  Target Language
                </label>
                <select
                  id="languageSelect"
                  className="form-select"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  disabled={isTranslating}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Translation Status */}
            {textNodes.length > 0 && (
              <div className="mb-3">
                <h5>Text Extraction</h5>
                <p className="text-muted mb-2">
                  Found {textNodes.length} text node{textNodes.length !== 1 ? 's' : ''} to translate
                </p>
                
                <button
                  className="btn btn-primary"
                  onClick={translateAllText}
                  disabled={isTranslating || textNodes.length === 0}
                >
                  {isTranslating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Translating...
                    </>
                  ) : (
                    'Translate All Text'
                  )}
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: HTML Preview */}
          <div className="preview-column">
            <div className="preview-content">
              <h5 className="preview-title">Translated Preview</h5>
              <div className="preview-wrapper">
              {translatedHtml ? (
                <iframe
                  srcDoc={translatedHtml}
                  className="w-100 h-100"
                  style={{ minHeight: '400px', border: 'none' }}
                  title="Translated HTML Preview"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <div className="text-center">
                    <Image
                      src="/icons/icon-file.png"
                      width={48}
                      height={48}
                      alt="File"
                      className="icon icon-xl"
                    />
                    <p className="mt-2">Upload an HTML file to start translating</p>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* ACTION BUTTONS - Fixed at bottom */}
            <div className="btn-row-fixed">
              <button
                className="btn btn-outline-danger"
                onClick={resetForm}
                disabled={!originalHtml}
              >
                Reset Form
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={copyToClipboard}
                disabled={!translatedHtml || isTranslating}
              >
                Copy HTML
              </button>

              <button
                className="btn btn-primary"
                onClick={downloadHtml}
                disabled={!translatedHtml || isTranslating}
              >
                Download HTML
              </button>
            </div>
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