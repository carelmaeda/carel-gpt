import { AuthProvider } from '@/contexts/AuthContext'
import './globals.scss'

export const metadata = {
  title: 'Business Dashboard',
  description: 'Dashboard with business tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
