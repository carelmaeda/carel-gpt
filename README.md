# Carel GPT

A modern, responsive email template generator built with Next.js and Supabase that allows users to create branded HTML emails for different clients with customizable content, CTA buttons, and footers. Features user authentication and a protected dashboard interface.

## Description

Carel GPT is a secure web application that streamlines the process of creating branded HTML email templates. The application includes user authentication (login/signup) powered by Supabase, a protected dashboard area, and an email builder tool. Users can select from pre-configured client templates (Royal Canin, Hills Canada, Vital Essentials), customize content including titles, headers, body text, call-to-action buttons, and footers, then preview and export the final HTML code. The application features a live preview system and supports clipboard copying or file downloading of generated emails.

## Features

### Authentication & Security
- **User Authentication**: Secure login/signup system with Supabase
- **Protected Routes**: Dashboard and email generator require authentication
- **User Profile Management**: User profile display and logout functionality
- **Session Management**: Persistent authentication across browser sessions

### Email Generation
- **Multi-Client Support**: Pre-configured templates for Royal Canin, Hills Canada, and Vital Essentials
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
- Supabase account and project (for authentication)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/carel-gpt.git
   cd carel-gpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Basic Usage

#### Authentication
1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Access Dashboard**: Navigate to the main dashboard after authentication

#### Email Generation
1. **Navigate to Email Generator**: Click "Open Email Generator" from the dashboard
2. **Select a Client**: Choose from available clients (Royal Canin, Hills Canada, Vital Essentials)
3. **Choose a Template**: Select from available templates for the chosen client
4. **Customize Content**:
   - Enter an email title
   - Add a header message
   - Write your email body content
   - Optionally add a CTA button with text and link
   - Optionally include a branded footer
5. **Preview**: View the live preview in the right panel
6. **Export**: 
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
- **Authentication & Database**: Supabase (@supabase/supabase-js 2.52.0)
- **Styling**: Bootstrap 5.3.7, SCSS
- **Language**: TypeScript 5
- **Development Tools**: ESLint
- **Additional Libraries**: @popperjs/core for Bootstrap components

## Configuration

### Environment Variables

This project requires the following environment variables in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to Settings > API to find your project URL and anon key
3. Enable authentication providers as needed (email/password is enabled by default)
4. No additional database tables are required for the current functionality

### Adding New Client Templates

To add new client templates, modify `src/data/templates.ts`:

```typescript
export const templates: Templates = {
  "Your Client Name": {
    Template1: `<!-- Your HTML template with {{placeholders}} -->`,
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

We welcome contributions to the Carel GPT project! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards**: Use TypeScript, follow ESLint rules
3. **Write descriptive commit messages** following conventional commits
4. **Test your changes** thoroughly before submitting
5. **Update documentation** if you add new features
6. **Submit a pull request** with a clear description of changes

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/carel-gpt.git
cd carel-gpt

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

#### Authentication
- [ ] User can sign up with email/password
- [ ] User can log in with existing credentials
- [ ] Protected routes redirect to login when not authenticated
- [ ] User profile displays correctly
- [ ] Logout functionality works

#### Carel GPT
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
1. Check existing [GitHub Issues](https://github.com/yourusername/carel-gpt/issues)
2. Create a new issue with detailed description
3. Include screenshots for UI-related issues
4. Provide steps to reproduce any bugs

## Project Structure

```
carel-gpt/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/           # Protected dashboard area
│   │   │   ├── email-generator/ # Email generator page
│   │   │   └── page.tsx         # Dashboard home
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── layout.tsx           # Root layout with Bootstrap
│   │   └── page.tsx             # Home/landing page
│   ├── components/              # Reusable React components
│   │   ├── EmailBuilder.tsx     # Main email builder component
│   │   ├── LoginForm.tsx        # Login form component
│   │   ├── SignupForm.tsx       # Signup form component
│   │   ├── ProtectedRoute.tsx   # Route protection wrapper
│   │   ├── UserProfile.tsx      # User profile display
│   │   └── LogoutButton.tsx     # Logout functionality
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication state management
│   ├── data/                    # Static data and configurations
│   │   └── templates.ts         # Email template definitions
│   └── lib/                     # Utility functions and configurations
│       ├── supabase.ts          # Supabase client setup
│       └── renderTemplate.ts    # Template rendering logic
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
└── README.md                   # Project documentation
```

### Key Architecture Components

#### Authentication System
- **AuthContext** (`src/contexts/AuthContext.tsx`): Manages global authentication state
- **ProtectedRoute** (`src/components/ProtectedRoute.tsx`): Wraps pages requiring authentication
- **Supabase Integration** (`src/lib/supabase.ts`): Database and authentication client

#### Email Generation System
- **EmailBuilder** (`src/components/EmailBuilder.tsx`): Main email building interface
- **Template System** (`src/data/templates.ts`): Client-specific template storage
- **Template Renderer** (`src/lib/renderTemplate.ts`): Dynamic content substitution

#### User Interface
- **Bootstrap Integration**: Responsive design with Bootstrap 5.3.7
- **Dashboard Layout**: Protected area with navigation and user profile
- **Form Components**: Reusable login/signup forms with validation

---

**Note**: Replace `yourusername` with your actual GitHub username in the repository URLs above.
