'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ToolbarProps {
  onMenuClick: () => void
  sidebarCollapsed: boolean
}

export default function Toolbar({ onMenuClick }: ToolbarProps) {
  const { user, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    signOut()
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-3 py-2">
      <div className="d-flex align-items-center flex-grow-1">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={onMenuClick}
          type="button"
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list"></i>
        </button>
        
        <div className="navbar-brand mb-0 h1 d-flex align-items-center">
          <i className="bi bi-cpu me-2 text-primary"></i>
          Carel GPT
        </div>
      </div>

      <div className="dropdown" ref={dropdownRef}>
        <button
          className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
          type="button"
          onClick={toggleDropdown}
          aria-expanded={dropdownOpen}
        >
          <i className="bi bi-person-circle me-2"></i>
          <span className="d-none d-sm-inline">{user?.email}</span>
        </button>
        <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`}>
          <li>
            <div className="dropdown-item-text">
              <div className="fw-semibold">{user?.email}</div>
              <small className="text-muted">Logged in</small>
            </div>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}