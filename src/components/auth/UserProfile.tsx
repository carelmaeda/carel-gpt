'use client'
import { useAuth } from '@/contexts/AuthContext'
import LogoutButton from './LogoutButton'

export default function UserProfile() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex align-items-center">
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Loading...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="d-flex align-items-center gap-3">
      <div className="d-flex flex-column">
        <small className="text-muted">Signed in as</small>
        <span className="fw-semibold">{user.email}</span>
      </div>
      <LogoutButton />
    </div>
  )
}