'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface LogoutButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'outline-primary' | 'outline-secondary' | 'outline-danger'
}

export default function LogoutButton({ 
  className = '', 
  variant = 'outline-danger' 
}: LogoutButtonProps) {
  const { signOut, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={isLoading}
      className={`btn btn-${variant} ${className}`}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Signing Out...
        </>
      ) : (
        'Sign Out'
      )}
    </button>
  )
}