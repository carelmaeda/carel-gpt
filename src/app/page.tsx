import EmailBuilder from '@/components/EmailBuilder';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <EmailBuilder />
    </ProtectedRoute>
  );
}
