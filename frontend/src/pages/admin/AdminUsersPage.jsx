import { useState, useEffect } from 'react'
import { Search, Shield, ShieldOff, Trash2, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    api.adminGetUsers()
      .then(data => setUsers(data.users || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    setActionLoading(user._id + '-role')
    try {
      const data = await api.adminUpdateUserRole(user._id, newRole)
      setUsers(u => u.map(x => x._id === user._id ? data.user : x))
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId) => {
    setActionLoading(userId + '-del')
    try {
      await api.adminDeleteUser(userId)
      setUsers(u => u.filter(x => x._id !== userId))
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
      setConfirm(null)
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="card animate-pulse h-64" />

  if (error) return (
    <div className="card flex items-center gap-3 text-red-600 text-sm">
      <AlertCircle size={16} /> {error}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-5">Supprimer l'utilisateur <strong>{confirm.email}</strong> ? Cette action est irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteUser(confirm._id)} className="btn-primary bg-red-600 hover:bg-red-700 text-sm flex-1">
                {actionLoading === confirm._id + '-del'
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Supprimer'}
              </button>
              <button onClick={() => setConfirm(null)} className="btn-secondary text-sm flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input pl-9"
          placeholder="Rechercher par email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Inscription</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Abonnement</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">Aucun utilisateur trouve</td></tr>
              ) : filtered.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.subscriptionStatus === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.subscriptionStatus === 'ACTIVE' ? 'Pro' : 'Gratuit'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {user._id !== me?._id && (
                        <>
                          <button
                            onClick={() => toggleRole(user)}
                            disabled={actionLoading === user._id + '-role'}
                            title={user.role === 'ADMIN' ? 'Retirer admin' : 'Promouvoir admin'}
                            className={`p-2 rounded-lg transition-colors ${
                              user.role === 'ADMIN'
                                ? 'hover:bg-orange-50 text-orange-500'
                                : 'hover:bg-purple-50 text-gray-400 hover:text-purple-600'
                            }`}
                          >
                            {actionLoading === user._id + '-role'
                              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
                              : user.role === 'ADMIN' ? <ShieldOff size={15} /> : <Shield size={15} />}
                          </button>
                          <button
                            onClick={() => setConfirm(user)}
                            title="Supprimer l'utilisateur"
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                      {user._id === me?._id && (
                        <span className="text-xs text-gray-400 pr-1">Vous</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} affiche{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
