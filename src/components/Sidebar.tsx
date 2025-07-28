'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Toolbar from './Toolbar'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    // On desktop, toggle collapse. On mobile, toggle open/close
    const isDesktop = window.innerWidth >= 768
    if (isDesktop) {
      setSidebarCollapsed(!sidebarCollapsed)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  return (
    <div className="d-flex flex-column vh-100">
      <Toolbar onMenuClick={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} mobileOpen={sidebarOpen} />
        <main className="flex-grow-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
}

function Sidebar({ collapsed, mobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    {
      href: '/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      exact: true
    },
    {
      href: '/email-generator',
      icon: 'bi-envelope-at',
      label: 'Email Generator',
      exact: true
    }
  ]

  const isActive = (href: string, exact: boolean) => {
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
    const normalizedHref = href.endsWith('/') ? href.slice(0, -1) : href
    return normalizedPathname === normalizedHref
  }

  return (
    <div className={`bg-light border-end h-100 d-flex flex-column transition-all ${
      collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
    } d-md-flex ${mobileOpen ? 'show' : ''}`}>
      <div className="p-3 flex-grow-1">
        {!collapsed && <h5 className="mb-3">Carel GPT</h5>}
        
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
              title={collapsed ? item.label : undefined}
            >
              <i className={`${item.icon} ${collapsed ? '' : 'me-2'}`}></i>
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      {!collapsed && (
        <div className="p-3 border-top">
          <div className="d-flex align-items-center mb-3">
            <i className="bi-person-circle me-2 fs-5"></i>
            <div>
              <div className="fw-semibold text-truncate" style={{maxWidth: '150px'}}>
                {user?.email}
              </div>
              <small className="text-muted">Logged in</small>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar