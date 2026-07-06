import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-dark-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand + Mission */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-sage-400 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="font-serif font-semibold text-white text-base leading-tight">Animal Welfare</p>
                <p className="text-xs text-sage-300 font-medium">& Wellness Platform</p>
              </div>
            </div>
            <p className="text-sage-200 text-sm leading-relaxed max-w-sm">
              Connecting stray animals with loving families. We believe every animal
              deserves a safe home and a caring community standing behind them.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-sage-500 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-sage-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-sage-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/animals', label: 'Find a Pet' },
                { to: '/animals/post', label: 'Post a Rescue' },
                { to: '/news', label: 'Welfare News' },
                { to: '/about', label: 'About Us' },
                { to: '/register', label: 'Join Community' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sage-200 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sage-200 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-sage-400 shrink-0" />
                Pune, Maharashtra, India
              </li>
              <li className="flex items-center gap-2.5 text-sage-200 text-sm">
                <Mail className="w-4 h-4 text-sage-400 shrink-0" />
                <a href="mailto:help@animalwelfare.in" className="hover:text-white transition-colors">
                  help@animalwelfare.in
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sage-200 text-sm">
                <Phone className="w-4 h-4 text-sage-400 shrink-0" />
                +91 98765 43210
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sage-300 text-xs">
            © {new Date().getFullYear()} Animal Welfare & Wellness. All rights reserved.
          </p>
          <p className="text-sage-400 text-xs">
            Made with <Heart className="w-3 h-3 inline text-orange-400 fill-orange-400" /> for animals everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
