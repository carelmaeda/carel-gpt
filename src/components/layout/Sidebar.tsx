'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Toolbar from './Toolbar'
import Image from 'next/image'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const desktop = window.innerWidth >= 768
    setIsDesktop(desktop)
    
    // Set initial state based on screen size
    setIsSidebarOpen(desktop) // Expanded on desktop, collapsed on mobile
    
    // Listen for window resize but don't auto-reset state
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty dependency array to run only on mount

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="d-flex flex-column vh-100">
      <Toolbar onMenuClick={toggleSidebar} sidebarCollapsed={!isSidebarOpen} />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          isDesktop={isDesktop}
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className={`flex-grow-1 p-4 overflow-auto transition-margin ${
          isDesktop && isSidebarOpen ? 'main-with-sidebar' : 'main-full-width'
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
}

interface SidebarProps {
  isOpen: boolean
  isDesktop: boolean
  onClose: () => void
}

function Sidebar({ isOpen, isDesktop, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    {
      href: '/dashboard',
      icon: '/icons/icon-home.png',
      label: 'Home',
      exact: true
    },
    {
      href: '/email-generator',
      icon: '/icons/icon-envelope.png',
      label: 'Email Generator',
      exact: true
    },
    {
      href: '/smart-html',
      icon: '/icons/icon-magic.png',
      label: 'Smart HTML',
      exact: true
    },
    {
      href: '/html-translator',
      icon: '/icons/icon-translate.png',
      label: 'HTML Translator',
      exact: true
    }
  ]

  const isActive = (href: string, exact: boolean) => {
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
    const normalizedHref = href.endsWith('/') ? href.slice(0, -1) : href
    
    if (exact) {
      return normalizedPathname === normalizedHref
    }
    
    return normalizedPathname.startsWith(normalizedHref)
  }

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (!isDesktop) {
      onClose()
    }
  }

  return (
    <>
      <div className={`sidebar bg-white h-100 d-flex flex-column ${
        isOpen ? '' : ''
      } ${isDesktop ? 'sidebar-desktop' : ''}`}>
        <div className="p-3 flex-grow-1">
          <div className="mb-2">Menu</div>
          <nav className="nav flex-column">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link d-flex align-items-center py-2 ${
                  isActive(item.href, item.exact) 
                    ? 'active bg-primary text-white rounded' 
                    : 'text-dark'
                }`}
                title={!isOpen ? item.label : undefined}
                onClick={handleNavClick}
              >
                <Image
                  src={item.icon}
                  width={20}
                  height={20}
                  alt={item.label}
                  className={`icon icon-lg ${isOpen ? 'me-2' : ''}`}
                />
                {isOpen && item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {isOpen && (
          <div className="p-3 border-top">
            <div className="d-flex align-items-center mb-3">
              <Image
                src="/icons/icon-profile.png"
                width={24}
                height={24}
                alt="Profile"
                className="icon icon-lg me-2"
              />
              <div>
                <div className="fw-semibold text-truncate" style={{maxWidth: '150px'}}>
                  {user?.email}
                </div>
                <small className="text-muted d-none">Logged in</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar