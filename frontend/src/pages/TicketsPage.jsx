import { useState, useEffect } from 'react'
import { Plus, Ticket, ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

const STATUS_LABELS = { OPEN: 'Ouvert', CLOSED: 'Ferme' }

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
      status === 'OPEN' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-700'
    }`}>
      {status === 'OPEN' ? <Clock size={11} /> : <CheckCircle size={11} />}
      {STATUS_LABELS[status]}
    </span>
  )
}

function TicketCard({ ticket }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card p-0 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Ticket size={15} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">{ticket.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <StatusBadge status={ticket.status} />
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>
          </div>
          {ticket.adminReply && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Reponse de l'administration</span>
                {ticket.adminRepliedAt && (
                  <span className="text-xs text-blue-400 ml-auto">
                    {new Date(ticket.adminRepliedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{ticket.adminReply}</p>
            </div>
          )}
          {!ticket.adminReply && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={12} />
              En attente de reponse
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.getUserTickets()
      .then(data => setTickets(data.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setError('Titre et description sont requis.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const data = await api.createTicket(form)
      setTickets(t => [data.ticket, ...t])
      setForm({ title: '', description: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.message || 'Erreur lors de la creation du ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)
  const openCount = tickets.filter(t => t.status === 'OPEN').length
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mes tickets</h2>
          <p className="text-sm text-gray-500 mt-0.5">Creez et suivez vos demandes de support.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
          <Plus size={15} /> Nouveau ticket
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Creer un ticket</h3>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Titre du ticket</label>
              <input
                type="text"
                className="input"
                placeholder="Decrivez brievement votre probleme"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Expliquez votre probleme en detail..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi...</span>
                  : 'Envoyer le ticket'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: tickets.length, color: 'text-gray-900' },
          { label: 'Ouverts', value: openCount, color: 'text-orange-600' },
          { label: 'Fermes', value: closedCount, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
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

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Ticket size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Aucun ticket</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Nouveau ticket" pour en creer un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => <TicketCard key={ticket._id} ticket={ticket} />)}
        </div>
      )}
    </div>
  )
}
