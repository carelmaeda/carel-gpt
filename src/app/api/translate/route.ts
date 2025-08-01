import { NextRequest, NextResponse } from 'next/server';

// Mock translation function for development/demo purposes
const mockTranslate = (text: string, targetLang: string): string => {
  const mockTranslations: Record<string, Record<string, string>> = {
    es: {
      'Hello': 'Hola', 'World': 'Mundo', 'Welcome': 'Bienvenido', 'Home': 'Inicio', 'About': 'Acerca', 'Contact': 'Contacto',
      'Services': 'Servicios', 'Products': 'Productos', 'Company': 'Empresa', 'News': 'Noticias', 'Email': 'Correo',
      'Phone': 'Teléfono', 'Address': 'Dirección', 'Login': 'Iniciar sesión', 'Register': 'Registrarse', 'Search': 'Buscar',
      'Menu': 'Menú', 'Footer': 'Pie de página', 'Header': 'Encabezado', 'Main': 'Principal', 'Content': 'Contenido',
      'Title': 'Título', 'Description': 'Descripción', 'Image': 'Imagen', 'Link': 'Enlace', 'Button': 'Botón',
      'Form': 'Formulario', 'Submit': 'Enviar', 'Cancel': 'Cancelar', 'Save': 'Guardar', 'Delete': 'Eliminar',
      'Edit': 'Editar', 'View': 'Ver', 'Download': 'Descargar', 'Upload': 'Cargar', 'Settings': 'Configuración'
    },
    fr: {
      'Hello': 'Bonjour', 'World': 'Monde', 'Welcome': 'Bienvenue', 'Home': 'Accueil', 'About': 'À propos', 'Contact': 'Contact',
      'Services': 'Services', 'Products': 'Produits', 'Company': 'Entreprise', 'News': 'Actualités', 'Email': 'E-mail',
      'Phone': 'Téléphone', 'Address': 'Adresse', 'Login': 'Connexion', 'Register': 'S\'inscrire', 'Search': 'Rechercher',
      'Menu': 'Menu', 'Footer': 'Pied de page', 'Header': 'En-tête', 'Main': 'Principal', 'Content': 'Contenu',
      'Title': 'Titre', 'Description': 'Description', 'Image': 'Image', 'Link': 'Lien', 'Button': 'Bouton',
      'Form': 'Formulaire', 'Submit': 'Soumettre', 'Cancel': 'Annuler', 'Save': 'Sauvegarder', 'Delete': 'Supprimer',
      'Edit': 'Modifier', 'View': 'Voir', 'Download': 'Télécharger', 'Upload': 'Téléverser', 'Settings': 'Paramètres'
    },
    de: {
      'Hello': 'Hallo', 'World': 'Welt', 'Welcome': 'Willkommen', 'Home': 'Startseite', 'About': 'Über uns', 'Contact': 'Kontakt',
      'Services': 'Dienstleistungen', 'Products': 'Produkte', 'Company': 'Unternehmen', 'News': 'Nachrichten', 'Email': 'E-Mail',
      'Phone': 'Telefon', 'Address': 'Adresse', 'Login': 'Anmelden', 'Register': 'Registrieren', 'Search': 'Suchen',
      'Menu': 'Menü', 'Footer': 'Fußzeile', 'Header': 'Kopfzeile', 'Main': 'Haupt', 'Content': 'Inhalt',
      'Title': 'Titel', 'Description': 'Beschreibung', 'Image': 'Bild', 'Link': 'Link', 'Button': 'Schaltfläche',
      'Form': 'Formular', 'Submit': 'Senden', 'Cancel': 'Abbrechen', 'Save': 'Speichern', 'Delete': 'Löschen',
      'Edit': 'Bearbeiten', 'View': 'Ansehen', 'Download': 'Herunterladen', 'Upload': 'Hochladen', 'Settings': 'Einstellungen'
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

async function tryLibreTranslate(text: string, targetLanguage: string) {
  try {
    console.log('Trying LibreTranslate API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Try with auto detection first
    let response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLanguage
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // If auto detection fails, try with detected source language
    if (!response.ok) {
      console.log('LibreTranslate auto-detect failed, trying with detected language...');
      const sourceLanguage = detectSourceLanguage(text);
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
      
      response = await fetch('https://libretranslate.de/translate', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage
        }),
        signal: controller2.signal
      });
      
      clearTimeout(timeoutId2);
    }

    if (!response.ok) {
      throw new Error(`LibreTranslate failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.translatedText) {
      console.log('LibreTranslate successful');
      return data.translatedText;
    }
    throw new Error('No translated text in response');
  } catch (error) {
    console.error('LibreTranslate failed:', error);
    throw error;
  }
}

// Simple language detection based on common words
function detectSourceLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Spanish indicators
  if (/\b(el|la|de|en|que|y|con|para|por|es|un|una|se|te|le|su|como|pero|más|todo|muy|bien|aquí|ahora|donde|cuando|porque|qué|cómo|entre|hasta|desde|sobre|durante|después|antes|sin|contra)\b/.test(lowerText)) {
    return 'es';
  }
  
  // French indicators
  if (/\b(le|la|les|de|du|des|et|en|dans|pour|par|avec|sur|sous|ce|cette|ces|qui|que|dont|où|quand|comment|pourquoi|très|bien|tout|tous|peut|être|avoir|faire|aller|voir|savoir|venir|dire|prendre|donner)\b/.test(lowerText)) {
    return 'fr';
  }
  
  // German indicators  
  if (/\b(der|die|das|den|dem|des|und|oder|aber|ist|sind|war|waren|haben|hat|hatte|hatten|werden|wird|wurde|wurden|sein|seine|ihr|ihre|mein|meine|dein|deine|mit|von|zu|bei|nach|über|unter|durch|für|gegen|ohne|um|an|auf|aus|in)\b/.test(lowerText)) {
    return 'de';
  }
  
  // Italian indicators
  if (/\b(il|la|lo|gli|le|di|da|in|con|su|per|tra|fra|che|chi|cui|dove|quando|come|perché|molto|tutto|tutti|tutte|essere|avere|fare|dire|andare|vedere|sapere|dare|stare|venire|dovere|potere|volere|bene|male|grande|piccolo)\b/.test(lowerText)) {
    return 'it';
  }
  
  // Portuguese indicators
  if (/\b(o|a|os|as|de|da|do|das|dos|em|na|no|nas|nos|para|por|com|sem|sobre|entre|até|desde|durante|depois|antes|que|quem|qual|onde|quando|como|porque|muito|todo|toda|todos|todas|ser|estar|ter|haver|fazer|ir|vir|ver)\b/.test(lowerText)) {
    return 'pt';
  }
  
  // Default to English if no clear indicators
  return 'en';
}

async function tryMyMemoryTranslate(text: string, targetLanguage: string) {
  try {
    console.log('Trying MyMemory API...');
    
    // Detect source language or default to English
    const sourceLanguage = detectSourceLanguage(text);
    console.log(`Detected source language: ${sourceLanguage}`);
    
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`MyMemory failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      console.log('MyMemory successful');
      return data.responseData.translatedText;
    }
    throw new Error('No translated text in MyMemory response');
  } catch (error) {
    console.error('MyMemory failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      console.error('Missing required fields:', { text: !!text, targetLanguage: !!targetLanguage });
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    // Trim text and check if it's too long
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return NextResponse.json({
        translatedText: text
      });
    }

    if (trimmedText.length > 1000) {
      console.error('Text too long:', trimmedText.length);
      return NextResponse.json(
        { error: 'Text is too long (max 1000 characters for free APIs)' },
        { status: 400 }
      );
    }

    console.log('Translating text:', { 
      textLength: trimmedText.length, 
      targetLanguage,
      textPreview: trimmedText.substring(0, 50) + (trimmedText.length > 50 ? '...' : '')
    });

    let translatedText = '';
    let method = '';

    // Try different translation services in order
    try {
      translatedText = await tryLibreTranslate(trimmedText, targetLanguage);
      method = 'LibreTranslate';
    } catch (error) {
      console.log('LibreTranslate failed, trying MyMemory...');
      try {
        translatedText = await tryMyMemoryTranslate(trimmedText, targetLanguage);
        method = 'MyMemory';
      } catch (error) {
        console.log('MyMemory failed, using mock translation...');
        translatedText = mockTranslate(trimmedText, targetLanguage);
        method = 'Mock (Demo)';
      }
    }

    console.log(`Translation successful using ${method}:`, { 
      originalLength: trimmedText.length,
      translatedLength: translatedText.length
    });
    
    return NextResponse.json({
      translatedText: translatedText || trimmedText,
      method: method
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { 
        error: 'Translation failed', 
        translatedText: '', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}