'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, error: authError, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    clearError() // Clear any previous auth errors
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      await signIn(email, password)
      // On success, the auth state change in AuthContext will handle the redirect
    } catch (err) {
      // The error is already set in the AuthContext's signIn function
      // We can use the authError from context or the caught error
      setError(authError || (err instanceof Error ? err.message : 'Sign in failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Login</h2>
        
        {(error || authError) && (
          <div className="alert alert-danger" role="alert">
            {error || authError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Paygos Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}