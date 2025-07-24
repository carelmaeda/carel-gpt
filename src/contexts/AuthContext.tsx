'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Clear error state
  const clearError = useCallback(() => setError(null), [])

  // Handle session state changes
  useEffect(() => {
    let mounted = true
    
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (sessionError) {
          throw sessionError
        }
        
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setError('Failed to initialize session')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('Auth state changed:', event)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Redirect on sign in or sign out
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()
      
      console.log('Attempting to sign in with email:', email)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (authError) {
        console.error('Supabase auth error:', authError)
        throw authError
      }
      
      console.log('Sign in successful:', data)
      
    } catch (error) {
      console.error('Sign in error:', error)
      let errorMessage = 'Sign in failed'
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [clearError])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      clearError()
      
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (authError) {
        throw authError
      }
      
      // Show success message or redirect to confirmation page
      router.push('/signup/confirm')
    } catch (error) {
      console.error('Sign up error:', error)
      setError(error instanceof Error ? error.message : 'Sign up failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [clearError, router])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      clearError()
      
      // First attempt with global scope
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' })
      
      if (signOutError) {
        console.warn('Global signout failed, attempting local:', signOutError)
        // Fallback to local scope if global fails
        await supabase.auth.signOut()
      }
      
      // Clear local state regardless
      setUser(null)
      setSession(null)
      
    } catch (error) {
      console.error('Sign out error:', error)
      setError('Failed to sign out')
      
      // Even if error occurs, clear local state
      setUser(null)
      setSession(null)
      
      throw error
    } finally {
      setLoading(false)
    }
  }, [clearError])

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}