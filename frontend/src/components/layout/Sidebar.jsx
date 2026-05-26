import { NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, User, LogOut, ShieldCheck, X, Users, TicketCheck, CreditCard, Video } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/contenus',  icon: Video,           label: 'Contenus'    },
  { to: '/pricing',   icon: CreditCard,      label: 'Abonnements' },
  { to: '/profile',   icon: User,            label: 'Profil'      },
]

const adminNav = [
  { to: '/admin', icon: ShieldCheck, label: 'Vue globale', end: true },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/tickets', icon: TicketCheck, label: 'Tickets' },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = isAdmin ? adminNav : userNav

  return (
    <aside
      className="fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col h-full shrink-0 border-r transition-transform duration-200"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}
      data-mobile-open={mobileOpen}
    >
      <style>{`
        @media (max-width: 1023px) {
          aside[data-mobile-open="false"] { transform: translateX(-100%); }
          aside[data-mobile-open="true"]  { transform: translateX(0); }
        }
        @media (min-width: 1024px) {
          aside { transform: none !important; }
        }
      `}</style>

      {/* Logo — clickable → home */}
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <Link to="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <img src="/logo.png" alt="Jobo Analytics" style={{ width: 96, height: 96, objectFit: 'contain', flexShrink: 0 }} />
          <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>Jobo Analytics</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>
          {isAdmin ? 'Administration' : 'Menu'}
        </p>
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? isAdmin
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-blue-50 text-blue-700'
                  : ''
              }`
            }
            style={({ isActive }) => isActive ? {} : { color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('text-blue-700') && !e.currentTarget.classList.contains('text-purple-700')) {
                e.currentTarget.style.backgroundColor = 'var(--nav-hover)'
                e.currentTarget.style.color = 'var(--text)'
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('text-blue-700') && !e.currentTarget.classList.contains('text-purple-700')) {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-150 hover:bg-red-50 hover:text-red-600"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={18} />
          Deconnexion
        </button>
      </div>
    </aside>
  )
}
