import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

const titles = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/tickets': 'Tickets',
  '/profile': 'Profil',
  '/admin': 'Vue globale',
  '/admin/users': 'Gestion des utilisateurs',
  '/admin/tickets': 'Gestion des tickets',
}

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const title = titles[location.pathname] || 'Jobo Analytics'
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'

  return (
    <header
      className="h-16 px-4 md:px-6 flex items-center justify-between shrink-0 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--nav-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search — desktop */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border w-52 outline-none transition-all"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px #3b82f6'; e.currentTarget.style.borderColor = 'transparent' }}
            onBlur={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)' }}
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--nav-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {/* Avatar — clickable → profile */}
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-105 active:scale-95"
          title="Mon profil"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
