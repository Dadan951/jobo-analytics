import { useEffect, useState } from 'react'
import { Eye, Heart, Bookmark, Video, RefreshCw, Download, X } from 'lucide-react'
import { api } from '../services/api'

export default function ContenuPage() {
  const [contents, setContents]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [syncing, setSyncing]     = useState(false)
  const [importing, setImporting] = useState(false)
  const [banner, setBanner]       = useState(null) // { text, ok }

  const fetchContents = async () => {
    try {
      const data = await api.getContentsStats()
      setContents(data.contents || [])
    } catch {
      try {
        const data = await api.getContents()
        setContents(data.contents || [])
      } catch {
        setContents([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContents() }, [])

  const handleSync = async () => {
    setSyncing(true)
    setBanner(null)
    try {
      const data = await api.cleanAndReimportJobs()
      setBanner({ text: data.message, ok: true })
      fetchContents()
    } catch (err) {
      setBanner({ text: err.message || 'Erreur lors de la synchro', ok: false })
    } finally {
      setSyncing(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setBanner(null)
    try {
      const data = await api.importContentsFromJobo()
      setBanner({ text: data.message, ok: true })
      fetchContents()
    } catch (err) {
      setBanner({ text: err.message || "Erreur lors de l'import", ok: false })
    } finally {
      setImporting(false)
    }
  }

  const videos   = contents.filter(c => c.type === 'VIDEO')
  const totalViews = videos.reduce((s, c) => s + (c.views || 0), 0)
  const totalLikes = contents.reduce((s, c) => s + (c.likes || 0), 0)
  const totalSaves = videos.reduce((s, c) => s + (c.saves || 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Contenus vidéo</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {contents.length} contenu{contents.length !== 1 ? 's' : ''} — Filiale Verrerie
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Synchro...' : 'Synchro Verrerie'}
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <Download size={15} />
            {importing ? 'Import...' : 'Importer vidéos'}
          </button>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
          style={{
            background: banner.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${banner.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: banner.ok ? '#10b981' : '#ef4444',
          }}
        >
          {banner.text}
          <button onClick={() => setBanner(null)}><X size={14} /></button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total contenus', value: contents.length, icon: Video,    bg: '#eff6ff', color: '#2563eb' },
          { label: 'Vues vidéos',    value: totalViews,      icon: Eye,      bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Likes totaux',   value: totalLikes,      icon: Heart,    bg: '#fdf4ff', color: '#9333ea' },
          { label: 'Favoris totaux', value: totalSaves,      icon: Bookmark, bg: '#fff7ed', color: '#ea580c' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value.toLocaleString('fr-FR')}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <Video size={24} style={{ color: '#3b82f6' }} />
            </div>
            <p className="font-medium" style={{ color: 'var(--text)' }}>Aucun contenu</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Cliquez sur "Synchro Verrerie" puis "Importer vidéos"
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Aperçu', 'Titre', 'Métier associé', 'Vues', 'Likes', 'Favoris'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-left"
                      style={{ color: 'var(--text-subtle)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contents.map((c, i) => {
                  const jobName = typeof c.jobId === 'object' ? c.jobId?.name : null

                  // Métier associé par défaut si non renseigné en base
                  const JOB_NAME_MAP = {
                    'conducteur': 'Souffleur de verre',
                    'verrerie':   'Souffleur de verre',
                    'verrière':   'Souffleur de verre',
                  }
                  const tl = (c.title || '').toLowerCase()
                  const fallbackJob = Object.entries(JOB_NAME_MAP).find(([k]) => tl.includes(k))?.[1] || null
                  const displayJob = jobName || fallbackJob

                  const THUMB_MAP = {
                    'conducteur': '/thumb-conducteur.png',
                    'verrerie':   '/thumb-conducteur.png',
                    'verrière':   '/thumb-conducteur.png',
                  }
                  const titleLower = (c.title || '').toLowerCase()
                  const staticThumb = Object.entries(THUMB_MAP).find(([k]) => titleLower.includes(k))?.[1] || null
                  const thumbSrc = c.thumbnailUrl || staticThumb

                  return (
                    <tr
                      key={c._id}
                      style={{ borderBottom: i < contents.length - 1 ? '1px solid var(--border)' : 'none' }}
                    >
                      <td className="px-4 py-3">
                        {thumbSrc ? (
                          <div className="overflow-hidden rounded-xl shrink-0" style={{ width: 180, height: 110 }}>
                            <img
                              src={thumbSrc}
                              alt={c.title}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: 'scale(0.75)', transformOrigin: 'center' }}
                              onError={e => {
                                e.currentTarget.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(168,85,247,0.1)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10,8 16,12 10,16"/></svg></div>'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 180, height: 110, background: 'rgba(168,85,247,0.1)' }}>
                            <Video size={16} style={{ color: '#9333ea' }} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate" style={{ color: 'var(--text)' }}>
                        {c.title}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {displayJob || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#3b82f6' }}>
                        {(c.views || 0).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#9333ea' }}>
                        {(c.likes || 0).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#ea580c' }}>
                        {c.type === 'VIDEO' ? (c.saves || 0).toLocaleString('fr-FR') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
