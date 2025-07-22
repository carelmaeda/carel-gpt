# Email Generator

A modern, responsive email template generator built with Next.js that allows users to create branded HTML emails for different clients with customizable content, CTA buttons, and footers.

## Description

Email Generator is a web application that streamlines the process of creating branded HTML email templates. Users can select from pre-configured client templates (Royal Canin, Hills Canada etc), customize content including titles, headers, body text, call-to-action buttons, and footers, then preview and export the final HTML code. The application features a live preview system and supports clipboard copying or file downloading of generated emails.

## Features

- **Multi-Client Support**: Pre-configured templates for Royal Canin and Hills Canada
- **Live Preview**: Real-time preview of email templates as you edit
- **Customizable Content**: 
  - Email title and header customization
  - Rich text body content
  - Optional CTA buttons with custom text and links
  - Optional branded footers
- **Template Rendering**: Dynamic template system with placeholder replacement
- **Export Options**: 
  - Copy HTML to clipboard
  - Download as HTML file
- **Responsive Design**: Built with Bootstrap for mobile-friendly interface
- **Toast Notifications**: User feedback for copy/download actions
- **TypeScript Support**: Fully typed for better development experience

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/email-generator.git
   cd email-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Basic Usage

1. **Select a Client**: Choose from available clients (Royal Canin, Hills Canada)
2. **Choose a Template**: Select from available templates for the chosen client
3. **Customize Content**:
   - Enter an email title
   - Add a header message
   - Write your email body content
   - Optionally add a CTA button with text and link
   - Optionally include a branded footer
4. **Preview**: View the live preview in the right panel
5. **Export**: 
   - Click "Copy HTML" to copy to clipboard
   - Click "Download HTML" to download as a file

### Example Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Technologies Used

- **Frontend Framework**: Next.js 15.3.5
- **UI Framework**: React 19.0.0
- **Styling**: Bootstrap 5.3.7, SCSS
- **Language**: TypeScript 5
- **Development Tools**: ESLint
- **Additional Libraries**: @popperjs/core for Bootstrap components

## Configuration

### Environment Variables

Currently, this project does not require environment variables. All configuration is handled through the template data structure.

### Adding New Client Templates

To add new client templates, modify `src/data/templates.ts`:

```typescript
export const templates: Templates = {
  "Your Client Name": {
    "Template Name": `<!-- Your HTML template with {{placeholders}} -->`,
    ctaTemplate: `<!-- CTA button template -->`,
    footerTemplate: `<!-- Footer template -->`
  }
};
```

### Template Placeholders

Available placeholders in templates:
- `{{title}}` - Email title
- `{{header}}` - Email header
- `{{body}}` - Main email content
- `{{cta_button}}` - CTA button (if enabled)
- `{{footer}}` - Footer content (if enabled)

## Contributing

We welcome contributions to the Email Generator project! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards**: Use TypeScript, follow ESLint rules
3. **Write descriptive commit messages** following conventional commits
4. **Test your changes** thoroughly before submitting
5. **Update documentation** if you add new features
6. **Submit a pull request** with a clear description of changes

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/email-generator.git
cd email-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint
```

## Testing

### Running Tests

Currently, this project uses Next.js built-in linting. To run code quality checks:

```bash
# Run ESLint
npm run lint

# Build the project (tests compilation)
npm run build
```

### Testing Guidelines

- Ensure all TypeScript types are properly defined
- Test template rendering with various content combinations
- Verify responsive design across different screen sizes
- Test clipboard and download functionality
- Validate HTML output in email clients

### Manual Testing Checklist

- [ ] Client selection updates available templates
- [ ] Template selection shows live preview
- [ ] All form inputs update preview in real-time
- [ ] CTA button toggle shows/hides CTA fields
- [ ] Footer toggle includes/excludes footer
- [ ] Copy to clipboard works
- [ ] Download HTML generates proper files
- [ ] Toast notifications appear for user actions
- [ ] Responsive design works on mobile devices

## License

This project is private and not currently licensed for public use. All rights reserved.

## Support

For issues, questions, or contributions, please:
1. Check existing [GitHub Issues](https://github.com/yourusername/email-generator/issues)
2. Create a new issue with detailed description
3. Include screenshots for UI-related issues
4. Provide steps to reproduce any bugs

---

**Note**: Replace `yourusername` with your actual GitHub username in the repository URLs above.
