'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Dashboard</h1>
            <button 
              onClick={handleSignOut}
              className="btn btn-outline-secondary"
            >
              Sign Out
            </button>
          </div>
          
          <div className="alert alert-success" role="alert">
            <h4 className="alert-heading">Welcome!</h4>
            <p>You are successfully logged in as: <strong>{user.email}</strong></p>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-envelope-fill me-2"></i>
                    Email Generator
                  </h5>
                  <p className="card-text">
                    Generate professional emails with AI assistance.
                  </p>
                  <Link href="/dashboard/email-generator" className="btn btn-primary">
                    Open Email Generator
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-gear-fill me-2"></i>
                    Settings
                  </h5>
                  <p className="card-text">
                    Manage your account settings and preferences.
                  </p>
                  <button className="btn btn-secondary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}