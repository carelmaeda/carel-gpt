'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

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
          className="btn btn-outline-primary me-3"
          onClick={onMenuClick}
          type="button"
          aria-label="Toggle sidebar"
        >
          <Image
            src="/icons/icon-menu.png"
            width={20}
            height={20}
            alt="Menu"
            className="icon icon-lg"
          />
        </button>
        
        <div className="fw-bold d-flex align-items-center">
          <Image
            src="/icons/icon-logo.png"
            width={24}
            height={24}
            alt="Logo"
            className="icon icon-lg"
          />
          Carel GPT
        </div>
      </div>

      <div className="dropdown" ref={dropdownRef}>
        <button
          className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
          type="button"
          onClick={toggleDropdown}
          aria-expanded={dropdownOpen}
        >
          <Image
            src="/icons/icon-profile.png"
            width={20}
            height={20}
            alt="Profile"
            className="icon icon-lg"
          />
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
              <Image
                src="/icons/icon-door.png"
                width={16}
                height={16}
                alt="Logout"
                className="icon icon-lg"
              />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}