import { useState, useEffect } from 'react'
import { Users, Ticket, AlertCircle, Activity } from 'lucide-react'
import { api } from '../../services/api'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}

const ACTION_LABELS = {
  REGISTER: 'Inscription',
  LOGIN: 'Connexion',
  LOGOUT: 'Deconnexion',
  CHANGE_PASSWORD: 'Changement de mot de passe',
  UPDATE_EMAIL: 'Mise a jour email',
  UPDATE_JOB_DETAILS: 'Mise a jour fiche metier',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.adminGetStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-24" />)}
    </div>
  )

  if (error) return (
    <div className="card flex items-center gap-3 text-red-600 text-sm">
      <AlertCircle size={16} /> {error}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Ticket} label="Tickets total" value={stats.totalTickets} color="bg-purple-50 text-purple-600" />
        <StatCard icon={AlertCircle} label="Tickets ouverts" value={stats.openTickets} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={16} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Activite recente</h3>
        </div>
        {stats.recentLogs?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucune activite recente</p>
        ) : (
          <div className="space-y-2">
            {stats.recentLogs?.map(log => (
              <div key={log._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {ACTION_LABELS[log.actionType] || log.actionType}
                    </div>
                    {log.userId?.email && (
                      <div className="text-xs text-gray-400">{log.userId.email}</div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-4">
                  {new Date(log.createdAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
