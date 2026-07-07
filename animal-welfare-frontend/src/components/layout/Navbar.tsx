import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Heart, ChevronDown, LogOut, User, PlusCircle, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'
import { toast } from 'sonner'

const navLinks = [
  { to: '/animals', label: 'Find a Pet' },
  { to: '/news', label: 'Welfare News' },
  { to: '/about', label: 'About Us' },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Silently ignore logout API errors — clear local state regardless
    }
    logout()
    navigate('/')
    toast.success('You have been logged out.')
    setIsProfileOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-sage-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-full bg-forest-500 flex items-center justify-center shadow-sm group-hover:bg-forest-600 transition-colors">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif font-semibold text-forest-700 text-base leading-tight">
                Animal Welfare
              </span>
              <span className="text-xs text-sage-500 font-medium tracking-wide">
                & Wellness
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-forest-600 bg-forest-50'
                      : 'text-brown-600 hover:text-forest-600 hover:bg-forest-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/animals/post"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-forest-600 border border-forest-300 rounded-lg hover:bg-forest-50 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Animal
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    data-testid="navbar-profile-btn"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-forest-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-brown-700">{user?.username}</span>
                    <ChevronDown className={`w-4 h-4 text-brown-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-sage-100 py-1.5 z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        data-testid="navbar-dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-forest-500" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brown-700 hover:bg-cream-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-forest-500" />
                        My Profile
                      </Link>
                      <div className="my-1 border-t border-sage-100" />
                      <button
                        onClick={handleLogout}
                        data-testid="navbar-logout"
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                  className="px-4 py-2 text-sm font-medium text-brown-700 hover:text-forest-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-forest-500 rounded-lg hover:bg-forest-600 transition-colors shadow-sm"
                >
                  Join Community
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-brown-600 hover:bg-forest-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-sage-100 mt-1 bg-white/98 backdrop-blur-sm">
            <div className="pt-3 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-forest-600 bg-forest-50'
                        : 'text-brown-600 hover:bg-forest-50 hover:text-forest-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="pt-3 border-t border-sage-100 mt-2 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brown-700 hover:bg-cream-100 rounded-lg"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    <Link
                      to="/animals/post"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-forest-600 bg-forest-50 rounded-lg"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Post Animal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-brown-700 hover:bg-cream-100 rounded-lg"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-white bg-forest-500 rounded-lg text-center"
                    >
                      Join Community
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Click-outside overlay for profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  )
}
