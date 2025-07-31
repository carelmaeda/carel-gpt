'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MagicLinkForm from './MagicLinkForm'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      setError('Redirecting to dashboard...')
    }
  }

  if (showMagicLink) {
    return (
      <div>
        <MagicLinkForm />
        <div className="text-center mt-3">
          <button 
            className="btn btn-link" 
            onClick={() => setShowMagicLink(false)}
          >
            Back to password login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-white border">
      <div className="card-body">
        <h2 className="card-title">Login</h2>
        
        {error && (
          <div className={`alert ${error.includes('Redirecting') ? 'alert-info' : 'alert-danger'}`} role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">
              Email
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
          
          <div className="form-group mb-3">
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
          
          <div className="d-grid gap-2 text-center py-3">
              <button 
                type="submit" 
                className="btn btn-lg btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <small className="text-muted">or</small>
              <button 
                className="btn btn-lg btn-outline-secondary w-100" 
                onClick={() => setShowMagicLink(true)}
                disabled={loading}
              >
                Use Magic Link
              </button>
          </div>

        </form>
        

      </div>
    </div>
  )
}