'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      // Check for auth tokens in URL first
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        setLoading(false)
        return
      }
      
      // If no session and we're on callback page, wait a bit for redirect processing
      if (window.location.pathname === '/auth/callback/') {
        setTimeout(async () => {
          const { data: laterSession } = await supabase.auth.getSession()
          setSession(laterSession.session)
          setUser(laterSession.session?.user ?? null)
          setLoading(false)
        }, 1000)
      } else {
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Only redirect to dashboard on initial sign in, not on token refresh
        // Check if we're already on a protected page to avoid unwanted redirects
        const currentPath = window.location.pathname
        const isOnProtectedPage = currentPath.startsWith('/dashboard') || 
                                currentPath.startsWith('/email-generator') || 
                                currentPath.startsWith('/smart-html') ||
                                currentPath.startsWith('/html-translator')
        
        if (event === 'SIGNED_IN' && session && !isOnProtectedPage) {
          console.log('Redirecting to dashboard from:', currentPath)
          router.push('/dashboard')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { error: error.message }
    }
    
    router.push('/dashboard')
    return {}
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      return { error: error.message }
    }
    
    return {}
  }

  const signInWithMagicLink = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback/`
      console.log('Magic link redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          // Force PKCE flow for better compatibility with static sites
          shouldCreateUser: true,
          data: {}
        }
      })
      
      console.log('Magic link response:', { data, error })
      
      if (error) {
        return { error: error.message }
      }
      
      return {}
    } catch (err) {
      console.error('Magic link error:', err)
      return { error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setUser(null)
      setSession(null)
      router.push('/login')
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
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