import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { api } from '../../services/api'

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
      status === 'OPEN' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-700'
    }`}>
      {status === 'OPEN' ? <Clock size={11} /> : <CheckCircle size={11} />}
      {status === 'OPEN' ? 'Ouvert' : 'Ferme'}
    </span>
  )
}

function TicketRow({ ticket: initial }) {
  const [ticket, setTicket] = useState(initial)
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState(ticket.adminReply || '')
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  const handleReply = async (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    setLoading(true)
    try {
      const data = await api.adminReplyToTicket(ticket._id, reply)
      setTicket(data.ticket)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async () => {
    const newStatus = ticket.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    setStatusLoading(true)
    try {
      const data = await api.adminUpdateTicketStatus(ticket._id, newStatus)
      setTicket(data.ticket)
    } catch (err) {
      alert(err.message)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="card p-0 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">{ticket.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {ticket.userId?.email || 'Utilisateur supprime'} —{' '}
              {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <StatusBadge status={ticket.status} />
          {ticket.adminReply && <MessageSquare size={14} className="text-blue-500" />}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
          </div>

          {/* Status toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Statut :</span>
            <StatusBadge status={ticket.status} />
            <button
              onClick={toggleStatus}
              disabled={statusLoading}
              className="text-xs text-blue-600 hover:underline font-medium disabled:opacity-50"
            >
              {statusLoading
                ? 'Mise a jour...'
                : ticket.status === 'OPEN' ? 'Marquer comme ferme' : 'Rouvrir'}
            </button>
          </div>

          {/* Reply form */}
          <form onSubmit={handleReply} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                {ticket.adminReply ? 'Modifier la reponse' : 'Repondre'}
              </label>
              <textarea
                className="input resize-none text-sm"
                rows={3}
                placeholder="Votre reponse a l'utilisateur..."
                value={reply}
                onChange={e => setReply(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading || !reply.trim()} className="btn-primary text-sm">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi...</span>
                : <><Send size={13} /> {ticket.adminReply ? 'Mettre a jour la reponse' : 'Envoyer la reponse'}</>}
            </button>
          </form>

          {ticket.adminReply && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={13} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Reponse envoyee</span>
                {ticket.adminRepliedAt && (
                  <span className="text-xs text-blue-400 ml-auto">
                    {new Date(ticket.adminRepliedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-800">{ticket.adminReply}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.adminGetTickets()
      .then(data => setTickets(data.tickets || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-16" />)}
    </div>
  )

  if (error) return (
    <div className="card flex items-center gap-3 text-red-600 text-sm">
      <AlertCircle size={16} /> {error}
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Filter + count */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {[['ALL', 'Tous'], ['OPEN', 'Ouverts'], ['CLOSED', 'Fermes']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                filter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-400">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-gray-400">Aucun ticket</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => <TicketRow key={t._id} ticket={t} />)}
        </div>
      )}
    </div>
  )
}
