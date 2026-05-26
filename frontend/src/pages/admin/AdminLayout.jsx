import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Ticket } from 'lucide-react'

const adminNav = [
  { to: '/admin', label: 'Vue globale', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
]

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      {/* Admin sub-nav */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
        {adminNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
