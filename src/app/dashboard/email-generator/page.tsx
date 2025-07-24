import EmailBuilder from '@/components/EmailBuilder'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

export default function EmailGeneratorPage() {
  return (
    <ProtectedRoute>
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <Link href="/dashboard" className="btn btn-outline-secondary btn-sm me-3">
                  ← Back to Dashboard
                </Link>
                <h1 className="d-inline">Email Generator</h1>
              </div>
            </div>
          </div>
        </div>
        <EmailBuilder />
      </div>
    </ProtectedRoute>
  )
}