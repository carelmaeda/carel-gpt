'use client'
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

  if (!user) return null

  return (
    <button 
      onClick={signOut}
      className={`btn btn-${variant} ${className}`}
    >
      Sign Out
    </button>
  )
}