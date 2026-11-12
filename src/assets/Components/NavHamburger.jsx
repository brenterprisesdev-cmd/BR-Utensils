import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'

const NavHamburger = () => {

  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Products', path: '/products' },
  ]

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div ref={menuRef} className="sm:hidden relative">

      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        className="
          relative flex items-center justify-center
          rounded-md p-2
          bg-surface
          hover:bg-surface-elevated
          transition-all duration-300
        "
      >
        <Menu
          size={23}
          className={`
            transition-all duration-300
            ${isOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}
          `}
        />

        <X
          size={23}
          className={`
            absolute transition-all duration-300
            ${isOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}
          `}
        />
      </button>

      {/* Navigation Card */}
      <div
        className={`
          absolute top-full right-0 mt-3
          w-64 max-w-[calc(100vw-2rem)]
          rounded-2xl
          bg-surface
          border border-border
          shadow-2xl shadow-black/40
          overflow-hidden
          origin-top-right
          transition-all duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 visible'
            : 'opacity-0 scale-95 -translate-y-3 invisible pointer-events-none'
          }
        `}
      >

        {/* Navigation Links */}
        <div className="p-2">

          {navLinks.map((link, index) => {

            const isActive = location.pathname === link.path

            return (
              <Link
                key={link.path}
                to={link.path}
                tabIndex={isOpen ? 0 : -1}
                className={`
                  group flex items-center justify-between
                  px-4 py-3.5 rounded-xl
                  transition-all duration-300
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-primary'
                  }
                  ${isOpen
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-3 opacity-0'
                  }
                `}
                style={{
                  transitionDelay: isOpen ? `${index * 60}ms` : '0ms'
                }}
              >

                <span className="font-medium text-sm">
                  {link.name}
                </span>

                <ArrowUpRight
                  size={16}
                  className="
                    text-text-muted
                    transition-all duration-300
                    group-hover:text-primary
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />

              </Link>
            )
          })}

        </div>

      </div>

    </div>
  )
}

export default NavHamburger