'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Redirecting...</span>
        </div>
        <p className="mt-3">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
