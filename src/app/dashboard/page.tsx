import { Layout } from '@/components/Sidebar'

export default function DashboardPage() {
  return (
    <Layout>
      <div className="container-fluid">
          <h2 className="card-title">Welcome</h2>
          <p className="card-text">
            How can I help you today?
          </p>
          
          <div className="row g-3 mt-3">
            <div className="col-md-6">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <i className="bi bi-envelope-fill text-primary mb-3" style={{fontSize: '2rem'}}></i>
                  <h5 className="card-title">Email Generator</h5>
                  <p className="card-text">Create branded HTML emails with customizable templates</p>
                  <a href="/email-generator" className="btn btn-primary">
                    Open Email Generator
                  </a>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card border-secondary">
                <div className="card-body text-center">
                  <i className="bi bi-plus-circle text-secondary mb-3" style={{fontSize: '2rem'}}></i>
                  <h5 className="card-title">More Features Coming Soon</h5>
                  <p className="card-text">Additional tools and features will be added here</p>
                  <button className="btn btn-secondary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
      </div>

      </Layout>
  )
}