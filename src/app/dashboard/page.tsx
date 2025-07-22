import ProtectedRoute from '@/components/ProtectedRoute'
import UserProfile from '@/components/UserProfile'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>Dashboard</h1>
              <UserProfile />
            </div>
            
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title">Welcome to your Dashboard</h3>
                    <p className="card-text">
                      This is a protected page that requires authentication. 
                      You can only see this content when you&apos;re logged in.
                    </p>
                    
                    <div className="alert alert-success">
                      <h5 className="alert-heading">Success!</h5>
                      <p>Your Supabase authentication is working correctly. You are now signed in and can access protected content.</p>
                    </div>
                    
                    <h4>What&apos;s next?</h4>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">Build your application features</li>
                      <li className="list-group-item">Add user profile management</li>
                      <li className="list-group-item">Implement role-based access control</li>
                      <li className="list-group-item">Set up database tables and relationships</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5>Quick Actions</h5>
                  </div>
                  <div className="card-body">
                    <p className="card-text">Add your application-specific actions here.</p>
                    <button className="btn btn-primary w-100 mb-2">
                      Create New Project
                    </button>
                    <button className="btn btn-outline-primary w-100">
                      View Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}