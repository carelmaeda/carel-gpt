'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback page loaded')
        
        // Check for error parameters
        const error_code = searchParams.get('error')
        const error_description = searchParams.get('error_description')
        
        if (error_code) {
          setError(`Authentication error: ${error_code} - ${error_description || 'Unknown error'}`)
          setLoading(false)
          return
        }

        // Let Supabase handle the auth automatically (detectSessionInUrl: true)
        // Just wait for the session to be processed
        let attempts = 0
        const maxAttempts = 10
        
        const checkSession = async () => {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (session) {
            console.log('Session found, redirecting to dashboard')
            router.push('/dashboard')
            return
          }
          
          attempts++
          if (attempts < maxAttempts) {
            setTimeout(checkSession, 500)
          } else {
            console.log('No session found after waiting')
            setError('Authentication timed out. Please try again.')
            setLoading(false)
          }
        }
        
        // Start checking for session
        setTimeout(checkSession, 100)
        
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="card-title">Authenticating...</h2>
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Please wait while we sign you in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="card-title text-danger">Authentication Error</h2>
                <p className="card-text">
                  There was an error processing your magic link:
                </p>
                <div className="alert alert-danger">
                  {error}
                </div>
                <p className="text-muted">
                  This could happen if the link has expired, has already been used, or is invalid.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/login')}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}