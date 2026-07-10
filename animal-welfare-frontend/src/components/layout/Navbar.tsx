import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, X, ChevronDown, LogOut,
  PlusCircle, LayoutDashboard, PawPrint,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'
import { toast } from 'sonner'

const NAV_LINKS = [
  { to: '/animals', label: 'Find a Pet'    },
  { to: '/news',    label: 'Welfare News'  },
  { to: '/about',   label: 'About Us'      },
]

export function Navbar() {
  const [isMenuOpen,    setIsMenuOpen]    = useState(false)
  const [isScrolled,    setIsScrolled]    = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const profileRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location.pathname])

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close profile dropdown on Escape
  useEffect(() => {
    if (!isProfileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isProfileOpen])

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!isProfileOpen) return
    const onMousedown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onMousedown)
    return () => document.removeEventListener('mousedown', onMousedown)
  }, [isProfileOpen])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Silently ignore API errors — clear local state regardless
    }
    logout()
    setIsProfileOpen(false)
    navigate('/')
    toast.success('You have been signed out.')
  }

  const isHome = location.pathname === '/'

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled || !isHome
          ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-sage-100'
          : 'bg-transparent'
        }
      `}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-forest-500 focus-visible:outline-offset-2 rounded-lg"
            aria-label="Animal Welfare & Wellness — Home"
          >
            <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center shadow-sm group-hover:bg-forest-500 transition-colors">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`font-serif font-semibold text-[15px] leading-tight transition-colors ${isScrolled || !isHome ? 'text-forest-700' : 'text-white'}`}>
                Animal Welfare
              </span>
              <span className={`text-[11px] font-medium tracking-wide transition-colors ${isScrolled || !isHome ? 'text-sage-500' : 'text-sage-300'}`}>
                & Wellness
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-0.5" role="list">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                role="listitem"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-forest-600 bg-forest-50'
                      : isScrolled || !isHome
                        ? 'text-brown-600 hover:text-forest-600 hover:bg-forest-50'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/animals/post"
                  className={`
                    flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl
                    border transition-all hover:-translate-y-0.5
                    ${isScrolled || !isHome
                      ? 'text-forest-700 border-forest-300 hover:bg-forest-50'
                      : 'text-white border-white/30 hover:bg-white/10'
                    }
                  `}
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Animal
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen((v) => !v)}
                    aria-expanded={isProfileOpen}
                    aria-haspopup="menu"
                    aria-label={`Account menu for ${user?.username}`}
                    data-testid="navbar-profile-btn"
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all
                      ${isScrolled || !isHome ? 'hover:bg-forest-50' : 'hover:bg-white/10'}
                    `}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white shadow-sm">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className={`text-sm font-semibold transition-colors ${isScrolled || !isHome ? 'text-brown-700' : 'text-white'}`}>
                      {user?.username}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-all duration-200 ${isProfileOpen ? 'rotate-180' : ''} ${isScrolled || !isHome ? 'text-brown-400' : 'text-white/70'}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {isProfileOpen && (
                    <div
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sage-100 py-2 z-50 animate-fadeIn"
                    >
                      {/* User info header */}
                      <div className="px-4 py-2.5 border-b border-sage-100 mb-1">
                        <p className="text-xs font-bold text-brown-700">{user?.username}</p>
                        <p className="text-[11px] text-brown-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        role="menuitem"
                        data-testid="navbar-dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-100 transition-colors rounded-lg mx-1"
                      >
                        <LayoutDashboard className="w-4 h-4 text-forest-500" />
                        My Dashboard
                      </Link>

                      <Link
                        to="/animals/post"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-100 transition-colors rounded-lg mx-1"
                      >
                        <PlusCircle className="w-4 h-4 text-forest-500" />
                        Post an Animal
                      </Link>

                      <div className="my-1.5 border-t border-sage-100" />

                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        data-testid="navbar-logout"
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1"
                        style={{ width: 'calc(100% - 8px)' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="navbar-login"
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${isScrolled || !isHome ? 'text-brown-700 hover:text-forest-600 hover:bg-forest-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold text-white bg-forest-600 rounded-xl hover:bg-forest-500 transition-all shadow-sm hover:-translate-y-0.5"
                >
                  Join Community
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            className="md:hidden p-2 rounded-xl text-brown-600 hover:bg-forest-50 transition-colors"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-sage-100 bg-white animate-fadeIn">
            <nav className="pt-3 space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-forest-600 bg-forest-50'
                        : 'text-brown-600 hover:bg-forest-50 hover:text-forest-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-3 pt-3 border-t border-sage-100 space-y-2 px-1">
              {isAuthenticated ? (
                <>
                  {/* User info row */}
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cream-50">
                    <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brown-800 truncate">{user?.username}</p>
                      <p className="text-[11px] text-brown-400 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    data-testid="mobile-dashboard"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-brown-700 hover:bg-cream-100 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-forest-500" />
                    My Dashboard
                  </Link>
                  <Link
                    to="/animals/post"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 rounded-xl transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post an Animal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2.5 text-sm font-semibold text-brown-700 hover:bg-cream-100 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2.5 text-sm font-bold text-white bg-forest-600 hover:bg-forest-500 rounded-xl text-center transition-colors"
                  >
                    Join Community
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
