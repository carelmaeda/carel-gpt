'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithMagicLink } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    const { error } = await signInWithMagicLink(email)
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      setSuccess('Check your email for a magic link to sign in!')
      setLoading(false)
      setEmail('')
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Sign in with Magic Link</h2>
        <p className="card-text text-muted">
          Enter your email and we&apos;ll send you a secure link to sign in
        </p>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="magic-email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="magic-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  )
}