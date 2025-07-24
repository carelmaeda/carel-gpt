import "./globals.css"
import "bootstrap/dist/css/bootstrap.css"
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'Business Dashboard',
  description: 'Dashboard with email generator and business tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
