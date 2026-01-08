# Carel-GPT Project Documentation

> **Last Updated**: 2026-01-07
> **Auto-updated on every git commit**

## Project Overview

**Name**: carel-gpt
**Version**: 0.1.0
**Type**: Next.js Application
**Description**: A comprehensive web application for email template generation and HTML processing tools, designed for multi-client marketing campaigns.

## Technology Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Runtime**: React 19.0.0
- **Language**: TypeScript 5.x
- **Styling**: Bootstrap 5.3.7 + Sass 1.89.2
- **Database**: Supabase (v2.52.0)
- **Rich Text Editor**: TinyMCE (v6.2.1)
- **HTML Processing**: htmlparser2, he (HTML entity parser)
- **File Processing**: JSZip for archive handling

## Project Structure

```
carel-gpt/
├── src/
│   ├── app/                          # Next.js app router pages
│   │   ├── dashboard/                # Main dashboard page
│   │   ├── email-generator/          # Email template builder page
│   │   ├── smart-html/               # Smart HTML processor page
│   │   ├── html-translator/          # HTML translation tool page
│   │   └── image-resize/             # Image resizing utility page
│   │
│   ├── components/
│   │   ├── features/                 # Main feature components
│   │   │   ├── EmailBuilder.tsx      # Email template generator
│   │   │   ├── TemplateManager.tsx   # Template CRUD management
│   │   │   ├── SmartHtml.tsx         # HTML smart processor
│   │   │   ├── HtmlTranslator.tsx    # HTML translation tool
│   │   │   └── ImageResize.tsx       # Image resize utility
│   │   │
│   │   └── ui/                       # Reusable UI components
│   │       ├── Layout.tsx            # Main layout wrapper
│   │       ├── Navbar.tsx            # Navigation component
│   │       └── Footer.tsx            # Footer component
│   │
│   ├── data/
│   │   └── templates.ts              # Email templates & client branding
│   │
│   ├── lib/
│   │   └── renderTemplate.ts         # Template rendering utilities
│   │
│   └── contexts/                     # React context providers
│
├── .claude/                          # Claude Code configuration
│   ├── settings.local.json           # Claude settings
│   ├── PROJECT.md                    # This file
│   └── hooks/                        # Git hooks
│
└── package.json                      # Project dependencies
```

## Key Features

### 1. Email Template Generator (`/email-generator`)
- **Multi-client branding support**: Royal Canin, Hills Canada, MARS, Nestle
- **Rich text editing**: TinyMCE integration with image embedding
- **Template management**: Create, edit, and delete custom email templates
- **Dynamic components**:
  - Client-specific logos and colors
  - Customizable CTA buttons
  - Optional footer sections
  - Image upload with width control (100-600px)
- **Export options**: Copy to clipboard or download as HTML file
- **Persistence**: Custom templates saved to localStorage

### 2. Template Manager
- Modal-based template editor
- CRUD operations for email templates
- HTML template with placeholder system: `{{logo}}`, `{{title}}`, `{{body}}`, `{{cta_button}}`, `{{footer}}`
- Protection for default templates
- Real-time preview

### 3. Smart HTML Processor (`/smart-html`)
- Advanced HTML processing and optimization
- HTML validation and cleanup

### 4. HTML Translator (`/html-translator`)
- HTML content translation tool
- Multi-language support

### 5. Image Resize Tool (`/image-resize`)
- Batch image resizing
- Width constraints (100-600px)
- Multiple format support (JPG, PNG, GIF, WebP)
- File size validation (max 5MB)

## Application Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main landing page with feature overview |
| `/email-generator` | EmailBuilder | Email template creation tool |
| `/smart-html` | SmartHtml | HTML processing utility |
| `/html-translator` | HtmlTranslator | HTML translation tool |
| `/image-resize` | ImageResize | Image resizing utility |

## Client Configuration

The application supports four branded clients with custom styling:

### Royal Canin
- **Logo**: Royal Canin brand logo
- **CTA Color**: #E2001A (Red)
- **Footer**: Mars, Inc. copyright notice with Paygos branding

### Hills Canada
- **Logo**: Hill's Pet Nutrition logo
- **CTA Color**: #0054A4 (Blue)
- **Footer**: Hill's Pet Nutrition Canada contact info

### MARS
- **Logo**: Mars corporate logo
- **CTA Color**: #0000A0 (Dark Blue)
- **Footer**: Mars corporate copyright

### Nestle
- **Logo**: Nestlé logo
- **CTA Color**: #007CBA (Cyan Blue)
- **Footer**: Nestlé copyright with privacy links

## Data Storage

### localStorage Keys
- `customEmailTemplates`: Array of user-created email templates

### Template Structure
```typescript
type Template = {
  id: string;        // Unique identifier (e.g., "template1", "template2")
  name: string;      // Display name
  html: string;      // HTML template with placeholders
};

type ClientData = {
  logo: string;              // CDN URL to client logo
  ctaColor: string;          // Hex color for CTA button
  ctaTemplate: string;       // HTML template for CTA button
  footerTemplate: string;    // HTML template for footer
};
```

## Development Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # Type check without compilation
```

## Recent Changes

### 2025-11-06
- ✅ Added Template Manager component for creating/editing email templates
- ✅ Implemented localStorage persistence for custom templates
- ✅ Enhanced EmailBuilder with dynamic template selection
- ✅ Added "Manage Templates" button to UI
- ✅ Created PROJECT.md documentation file
- ✅ Set up git hooks for automatic documentation updates

## Authentication

The application uses Supabase for authentication and data persistence. Configuration details are managed through environment variables.

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_TINYMCE_API_KEY`: TinyMCE editor API key
- Supabase configuration (handled by @supabase/supabase-js)

## Notes for Claude Code

- TypeScript compilation can be checked with: `npx tsc --noEmit`
- All feature components are exported from `src/components/features/index.ts`
- Bootstrap styling classes are available globally
- Email templates use table-based layout for email client compatibility
- Images in email templates should use base64 data URLs for embedding
