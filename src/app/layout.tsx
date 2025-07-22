import "./globals.css"
import "bootstrap/dist/css/bootstrap.css"
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'Email Generator',
  description: 'Generate HTML email content for clients',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
