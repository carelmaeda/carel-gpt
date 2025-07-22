import "./globals.css"
import "bootstrap/dist/css/bootstrap.css"

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
        {children}
      </body>
    </html>
  );
}
