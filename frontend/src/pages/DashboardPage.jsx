import { useState, useEffect, useRef } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, ThumbsUp, Users, Briefcase, Plus, RotateCcw, ScanLine, Glasses, Heart, Pencil, Trash2, X, Check, Film, Bookmark, Download, Calendar, GripVertical, ChevronDown } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import StatCard from '../components/dashboard/StatCard'
import DraggableWidget from '../components/dashboard/DraggableWidget'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const STATUS_COLORS = {
  OPEN:        { bg: '#eff6ff', text: '#2563eb', label: 'Ouvert' },
  IN_PROGRESS: { bg: '#fffbeb', text: '#d97706', label: 'En cours' },
  CLOSED:      { bg: '#f0fdf4', text: '#16a34a', label: 'Fermé' },
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const ALL_WIDGETS = [
  { id: 'activity-chart',  title: 'Activite de la semaine'         },
  { id: 'distribution',    title: 'Repartition des interactions'   },
  { id: 'recent-jobs',     title: 'Fiches metier recentes'         },
  { id: 'scan-ranking',    title: 'Classement des objets scannés'  },
  { id: 'scan-kpis',       title: 'Scans en chiffres'              },
  { id: 'scans-chart',     title: 'Scans par objet'                },
  { id: 'jobs-perf',       title: 'Performance par fiche metier'   },
  { id: 'verori-objects',  title: 'Objets Verori'                  },
  { id: 'video-stats',     title: 'Statistiques vidéos'            },
]

const DEFAULT_WIDGET_IDS = ['activity-chart', 'distribution', 'recent-jobs']

const DEFAULT_KPI_ORDER = ['views', 'likes', 'jobs', 'applies']

const PERIODS = [
  { key: 'day',    label: 'Jour'         },
  { key: 'week',   label: 'Semaine'      },
  { key: 'month',  label: 'Mois'         },
  { key: 'custom', label: 'Personnalisé' },
]

const EMPTY_ACTIVITY = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (6 - i))
  return { day: DAYS_FR[d.getDay()], connexions: 0, inscriptions: 0, actions: 0 }
})

// ── Données fictives de démonstration ─────────────────────────────────────
const MOCK_STATS = { views: 40, likes: 40, applies: 16, jobs: 3 }

const MOCK_ACTIVITY = [
  { day: 'Lun', connexions: 7,  inscriptions: 7  },
  { day: 'Mar', connexions: 10, inscriptions: 10 },
  { day: 'Mer', connexions: 4,  inscriptions: 4  },
  { day: 'Jeu', connexions: 8,  inscriptions: 8  },
  { day: 'Ven', connexions: 6,  inscriptions: 6  },
  { day: 'Sam', connexions: 3,  inscriptions: 3  },
  { day: 'Dim', connexions: 2,  inscriptions: 2  },
]

const MOCK_JOBS = [
  { _id: 'mock1', name: 'Technicien verrerie',                      romeCode: 'H2204', views: 20, likes: 12, applicants: 8  },
  { _id: 'mock2', name: 'Tailleur de cristal',                      romeCode: 'H2204', views: 8,  likes: 4,  applicants: 1  },
  { _id: 'mock3', name: 'Conducteur-fondeur en industrie verrerie', romeCode: 'H2204', views: 24, likes: 10, applicants: 7  },
]

const MOCK_JOBS_WEEKLY = {
  mock1: {
    name: 'Technicien verrerie',
    weekly: [
      { day: 'Lun', vues: 2, likes: 1, candidatures: 1 },
      { day: 'Mar', vues: 4, likes: 2, candidatures: 2 },
      { day: 'Mer', vues: 3, likes: 2, candidatures: 1 },
      { day: 'Jeu', vues: 5, likes: 3, candidatures: 2 },
      { day: 'Ven', vues: 3, likes: 2, candidatures: 1 },
      { day: 'Sam', vues: 2, likes: 1, candidatures: 1 },
      { day: 'Dim', vues: 1, likes: 1, candidatures: 0 },
    ],
  },
  mock2: {
    name: 'Tailleur de cristal',
    weekly: [
      { day: 'Lun', vues: 1, likes: 0, candidatures: 0 },
      { day: 'Mar', vues: 2, likes: 1, candidatures: 0 },
      { day: 'Mer', vues: 1, likes: 1, candidatures: 0 },
      { day: 'Jeu', vues: 2, likes: 1, candidatures: 1 },
      { day: 'Ven', vues: 1, likes: 1, candidatures: 0 },
      { day: 'Sam', vues: 1, likes: 0, candidatures: 0 },
      { day: 'Dim', vues: 0, likes: 0, candidatures: 0 },
    ],
  },
  mock3: {
    name: 'Conducteur-fondeur en industrie verrerie',
    weekly: [
      { day: 'Lun', vues: 3, likes: 1, candidatures: 1 },
      { day: 'Mar', vues: 5, likes: 2, candidatures: 1 },
      { day: 'Mer', vues: 4, likes: 2, candidatures: 1 },
      { day: 'Jeu', vues: 6, likes: 3, candidatures: 2 },
      { day: 'Ven', vues: 4, likes: 1, candidatures: 1 },
      { day: 'Sam', vues: 2, likes: 1, candidatures: 1 },
      { day: 'Dim', vues: 0, likes: 0, candidatures: 0 },
    ],
  },
}

const MOCK_PIE = [
  { name: 'Vues',             value: 52 }, // 20+8+24 (somme des 3 fiches)
  { name: 'Likes',            value: 26 }, // 12+4+10
  { name: "Offres d'emplois", value: 16 }, // 8+1+7
]

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  color: 'var(--text)',
  fontSize: 12,
}

function getSavedWidgetIds() {
  try {
    const saved = localStorage.getItem('dashboard-widget-layout')
    if (saved) {
      const ids = JSON.parse(saved)
      return ids.filter(id => ALL_WIDGETS.some(w => w.id === id))
    }
  } catch {}
  return DEFAULT_WIDGET_IDS
}

function SortableKpiCard({ id, title, value, icon, color, changeLabel, loading }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes} {...listeners}
        className="absolute top-3 right-3 p-1 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ color: 'var(--text-subtle)', backgroundColor: 'var(--surface-2)' }}
      >
        <GripVertical size={14} />
      </div>
      <StatCard title={title} value={value} icon={icon} color={color} changeLabel={changeLabel} loading={loading} />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const location = useLocation()

  const [kpiOrder, setKpiOrder] = useState(() => {
    try {
      const s = localStorage.getItem('kpi-order')
      if (s) { const p = JSON.parse(s); if (p.length === 4) return p }
    } catch {}
    return DEFAULT_KPI_ORDER
  })

  const handleKpiDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setKpiOrder(order => {
        const next = arrayMove(order, order.indexOf(active.id), order.indexOf(over.id))
        localStorage.setItem('kpi-order', JSON.stringify(next))
        return next
      })
    }
  }

  const [period, setPeriod]     = useState('week')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [exporting, setExporting] = useState(false)
  const contentRef = useRef(null)

  const handleExportPDF = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const { toPng }  = await import('html-to-image')
      const { jsPDF }  = await import('jspdf')

      const element = contentRef.current
      if (!element) return

      // html-to-image gère nativement oklch et le CSS moderne
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          // Exclure les éléments qui pourraient causer des problèmes (ex: iframes)
          return node.tagName !== 'IFRAME'
        },
      })

      const img    = new Image()
      img.src      = dataUrl
      await new Promise(res => { img.onload = res })

      const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = (img.height * pdfW) / img.width
      const pageH = pdf.internal.pageSize.getHeight()

      let y = 0
      while (y < pdfH) {
        if (y > 0) pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', 0, -y, pdfW, pdfH)
        y += pageH
      }

      pdf.save('jobo-dashboard.pdf')
    } catch (err) {
      console.error('PDF error:', err)
      alert('Erreur lors de la génération du PDF : ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const [stats, setStats]               = useState({ views: 0, likes: 0, applies: 0, jobs: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [recentJobsData, setRecentJobsData] = useState([])
  const [allJobs, setAllJobs]           = useState([])
  const [pieData, setPieData]           = useState([
    { name: 'Vues', value: 0 }, { name: 'Likes', value: 0 }, { name: "Offres d'emplois", value: 0 },
  ])
  const [scanData, setScanData]         = useState({ objects: [], totals: { scans: 0, likes: 0 }, count: 0 })
  const [ticketsData, setTicketsData]   = useState([])
  const [loadingScans, setLoadingScans] = useState(true)
  // veroriData supprimé — remplacé par scanData (données réelles)
  const [activityData, setActivityData] = useState(EMPTY_ACTIVITY)
  const [videoData, setVideoData] = useState({ videos: [], totals: { views: 0, likes: 0, saves: 0 }, count: 0 })

  // Sélecteur de métier pour le graphique performance
  const [perfJobId, setPerfJobId]       = useState('mock1')
  const [perfDropdownOpen, setPerfDropdownOpen] = useState(false)

  // Job management modal state
  const [jobModal, setJobModal]         = useState(null) // null | 'add' | { edit: job }
  const [jobForm, setJobForm]           = useState({ name: '', romeCode: '', description: '', studyLevel: '' })
  const [jobSaving, setJobSaving]       = useState(false)
  const [jobError, setJobError]         = useState('')

  // Persisted widget layout
  const [widgetIds, setWidgetIds] = useState(getSavedWidgetIds)
  const [showAddMenu, setShowAddMenu] = useState(false)

  // Persist layout to localStorage on every change
  useEffect(() => {
    localStorage.setItem('dashboard-widget-layout', JSON.stringify(widgetIds))
  }, [widgetIds])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Helper to refresh jobs data from server
  const refreshJobs = () => {
    return api.getJobsSummary()
      .then(data => {
        const t = data.totals || {}
        setStats({ views: t.views || 0, likes: t.likes || 0, applies: t.applicants || 0, jobs: data.count || 0 })
        const sorted = [...(data.jobs || [])].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
        setRecentJobsData(sorted.map(j => ({ name: j.name, views: j.views || 0, likes: j.likes || 0, applies: j.applicants || 0 })))
        setPieData([
          { name: 'Vues',         value: t.views      || 0 },
          { name: 'Likes',        value: t.likes       || 0 },
          { name: "Offres d'emplois", value: t.applicants  || 0 },
        ])
        setAllJobs(data.jobs || [])
      })
  }

  // Fetch jobs — re-fetch à chaque navigation vers le dashboard
  useEffect(() => {
    setLoadingStats(true)
    refreshJobs()
      .catch(() => {})
      .finally(() => setLoadingStats(false))
  }, [location.key])

  // Fetch activity logs — graphique activité réelle par jour (7 derniers jours)
  useEffect(() => {
    api.getActivityLogs()
      .then(data => {
        const list = data.logs || data || []
        const now = new Date()
        const activity = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now); d.setDate(d.getDate() - (6 - i))
          const dateStr = d.toDateString()
          const dayLogs = list.filter(l => new Date(l.createdAt).toDateString() === dateStr)
          return {
            day: DAYS_FR[d.getDay()],
            connexions:   dayLogs.filter(l => l.actionType === 'LOGIN').length,
            inscriptions: dayLogs.filter(l => l.actionType === 'REGISTER').length,
            actions:      dayLogs.length,
          }
        })
        setActivityData(activity)
      })
      .catch(() => {})
  }, [])

  // Fetch scans — vraies valeurs
  useEffect(() => {
    api.getPhysicalObjectsSummary()
      .then(data => { setScanData(data) })
      .catch(() => {})
      .finally(() => setLoadingScans(false))
  }, [])

  // Fetch video stats — re-fetch à chaque navigation
  useEffect(() => {
    api.getVideoStats()
      .then(data => setVideoData(data))
      .catch(() => {})
  }, [location.key])

  // Fetch tickets — vraies valeurs
  useEffect(() => {
    api.getUserTickets()
      .then(data => {
        const list = data.tickets || data || []
        setTicketsData(list.slice(0, 5))
      })
      .catch(() => {})
  }, [])

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) {
      setWidgetIds(ids => {
        const oldIndex = ids.indexOf(active.id)
        const newIndex = ids.indexOf(over.id)
        return arrayMove(ids, oldIndex, newIndex)
      })
    }
  }

  const removeWidget  = (id) => setWidgetIds(ids => ids.filter(i => i !== id))
  const addWidget     = (id) => { setWidgetIds(ids => [...ids, id]); setShowAddMenu(false) }
  const resetWidgets  = () => { setWidgetIds(DEFAULT_WIDGET_IDS); localStorage.removeItem('dashboard-widget-layout') }

  const activeWidgets = widgetIds.map(id => ALL_WIDGETS.find(w => w.id === id)).filter(Boolean)
  const hiddenWidgets = ALL_WIDGETS.filter(w => !widgetIds.includes(w.id))

  const orgName = user?.orgName || user?.email?.split('@')[0] || 'vous'

  // ── Mock ADDITIF : base fictive + jobs + vidéos en temps réel ─────────────
  const displayStats = {
    views:   MOCK_STATS.views   + stats.views   + (videoData.totals.views || 0),
    likes:   MOCK_STATS.likes   + stats.likes   + (videoData.totals.likes || 0),
    applies: MOCK_STATS.applies + stats.applies,
    jobs:    stats.jobs > 0 ? stats.jobs : MOCK_STATS.jobs,
  }
  const displayActivity = activityData.every(d => d.connexions === 0 && d.inscriptions === 0)
    ? MOCK_ACTIVITY
    : activityData
  // Toujours afficher les fiches fictives de démo (avec leurs stats)
  // Les vraies fiches DB (sans stats) sont ajoutées à la suite si elles existent
  const realJobsFiltered = allJobs.filter(j => !MOCK_JOBS.some(m => m._id === j._id))
  const displayJobs = [...MOCK_JOBS, ...realJobsFiltered]
  const displayPie  = [
    { name: 'Vues',             value: MOCK_PIE[0].value + (pieData[0]?.value || 0) + (videoData.totals.views || 0) },
    { name: 'Likes',            value: MOCK_PIE[1].value + (pieData[1]?.value || 0) + (videoData.totals.likes || 0) },
    { name: "Offres d'emplois", value: MOCK_PIE[2].value + (pieData[2]?.value || 0) },
  ]
  // Le graphique "Performance" affiche toujours les données fictives de démonstration
  const displayJobsPerf = MOCK_JOBS.map(j => ({
    name:         j.name.split(' ').slice(0, 2).join(' '),
    vues:         j.views      || 0,
    likes:        j.likes      || 0,
    candidatures: j.applicants || 0,
  }))

  // Derived engagement metrics
  const engagementRate = displayStats.views > 0 ? ((displayStats.likes   / displayStats.views) * 100).toFixed(1) : '0.0'
  const conversionRate = displayStats.views > 0 ? ((displayStats.applies / displayStats.views) * 100).toFixed(1) : '0.0'
  const scanLikeRate   = scanData.totals.scans > 0 ? ((scanData.totals.likes / scanData.totals.scans) * 100).toFixed(1) : '0.0'

  const topScanned    = [...(scanData.objects || [])].sort((a, b) => (b.scanCount || 0) - (a.scanCount || 0)).slice(0, 6)
  const jobsPerfData  = displayJobsPerf

  const openAddJob = () => {
    setJobForm({ name: '', romeCode: '', description: '', studyLevel: '' })
    setJobError('')
    setJobModal('add')
  }

  const openEditJob = (job) => {
    setJobForm({ name: job.name || '', romeCode: job.romeCode || '', description: job.description || '', studyLevel: job.studyLevel || '' })
    setJobError('')
    setJobModal({ edit: job })
  }

  const closeJobModal = () => { setJobModal(null); setJobError('') }

  const saveJob = async () => {
    if (!jobForm.name.trim() || !jobForm.romeCode.trim()) {
      setJobError('Le nom et le code ROME sont obligatoires.')
      return
    }
    setJobSaving(true)
    setJobError('')
    try {
      if (jobModal === 'add') {
        await api.createJob(jobForm)
      } else {
        await api.updateJob(jobModal.edit._id, jobForm)
      }
      await refreshJobs()
      closeJobModal()
    } catch (e) {
      setJobError(e.message || 'Erreur lors de la sauvegarde')
    } finally {
      setJobSaving(false)
    }
  }

  const deleteJob = async (jobId) => {
    if (!window.confirm('Supprimer cette fiche métier ?')) return
    try {
      await api.deleteJob(jobId)
      await refreshJobs()
    } catch (e) {
      alert(e.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome + contrôles */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Bonjour, {orgName}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Voici un apercu de votre activite aujourd'hui.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sélecteur de période */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
            <Calendar size={14} className="ml-2 shrink-0" style={{ color: 'var(--text-subtle)' }} />
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={period === p.key
                  ? { backgroundColor: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: 'var(--text-muted)' }
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export PDF */}
          <button onClick={handleExportPDF} disabled={exporting} className="btn-secondary text-sm">
            {exporting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Export...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Download size={15} />Exporter PDF</span>
            )}
          </button>

          {/* Réinitialiser widgets */}
          <button onClick={resetWidgets} className="btn-ghost text-xs">
            <RotateCcw size={14} /> Réinitialiser
          </button>

          {/* Ajouter widget */}
          <div className="relative">
            <button onClick={() => setShowAddMenu(!showAddMenu)} className="btn-secondary text-sm">
              <Plus size={15} /> Ajouter un widget
            </button>
            {showAddMenu && (
              <div
                className="absolute right-0 top-full mt-2 rounded-xl shadow-lg border py-1 z-30 min-w-56"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                {hiddenWidgets.length > 0 ? hiddenWidgets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => addWidget(w.id)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--nav-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
                  >
                    {w.title}
                  </button>
                )) : (
                  <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>Tous les widgets sont affiches</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plage personnalisée */}
      {period === 'custom' && (
        <div className="card flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Du</label>
            <input type="date" className="input w-auto" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Au</label>
            <input type="date" className="input w-auto" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <button className="btn-primary text-sm">Appliquer</button>
        </div>
      )}

      {/* Zone capturée pour le PDF */}
      <div ref={contentRef} className="space-y-6">

      {/* KPI Cards — draggables entre elles */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleKpiDragEnd}>
        <SortableContext items={kpiOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiOrder.map(key => {
              const defs = {
                views:   { title: 'Total vues',        value: displayStats.views.toLocaleString(),   icon: Eye,       color: 'blue',   changeLabel: 'total cumulé' },
                likes:   { title: 'Total likes',       value: displayStats.likes.toLocaleString(),   icon: ThumbsUp,  color: 'green',  changeLabel: 'total cumulé' },
                jobs:    { title: 'Fiches metier',     value: displayStats.jobs.toLocaleString(),    icon: Briefcase, color: 'purple', changeLabel: 'actives'      },
                applies: { title: "Offres d'emplois",  value: displayStats.applies.toLocaleString(), icon: Users,     color: 'orange', changeLabel: 'total cumulé' },
              }
              const kpi = defs[key]
              return <SortableKpiCard key={key} id={key} {...kpi} loading={loadingStats} />
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Draggable Widgets */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div className="grid lg:grid-cols-2 gap-5">
            {activeWidgets.map(widget => (
              <DraggableWidget key={widget.id} id={widget.id} title={widget.title} onRemove={removeWidget} fullWidth={widget.fullWidth}>

                {/* ── ACTIVITE DE LA SEMAINE ── */}
                {widget.id === 'activity-chart' && (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={displayActivity} barSize={14} barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                      <Bar dataKey="connexions"   name="Connexions"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inscriptions" name="Inscriptions" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* ── REPARTITION DES INTERACTIONS ── */}
                {widget.id === 'distribution' && (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={displayPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {displayPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* ── FICHES METIER — GESTION COMPLETE ── */}
                {widget.id === 'recent-jobs' && (
                  <div className="space-y-2">
                    {/* Bouton Ajouter */}
                    <div className="flex justify-end">
                      <button
                        onClick={openAddJob}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dbeafe' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#eff6ff' }}
                      >
                        <Plus size={13} /> Nouvelle fiche
                      </button>
                    </div>

                    {/* Liste des fiches */}
                    {displayJobs.length === 0 ? (
                      <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
                        <Briefcase size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Aucune fiche métier pour l'instant.</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5 max-h-64 overflow-y-auto pr-0.5">
                        {displayJobs.map((job, i) => (
                          <div
                            key={job._id || i}
                            className="flex items-center gap-3 px-2 py-2 rounded-lg group transition-colors"
                            style={{ borderBottom: i < allJobs.length - 1 ? '1px solid var(--border)' : 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)' }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
                          >
                            {/* Numéro */}
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>{i + 1}</div>

                            {/* Nom + code ROME */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{job.name}</div>
                              <div className="text-xs" style={{ color: 'var(--text-subtle)' }}>{job.romeCode}{job.studyLevel ? ` · ${job.studyLevel}` : ''}</div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-xs shrink-0" style={{ color: 'var(--text-subtle)' }}>
                              <span className="flex items-center gap-0.5"><Eye size={10} />{job.views || 0}</span>
                              <span className="flex items-center gap-0.5"><ThumbsUp size={10} />{job.likes || 0}</span>
                              <span className="flex items-center gap-0.5"><Users size={10} />{job.applicants || 0}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => openEditJob(job)}
                                className="p-1 rounded-md transition-colors"
                                style={{ color: '#2563eb' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#eff6ff' }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
                                title="Modifier"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => deleteJob(job._id)}
                                className="p-1 rounded-md transition-colors"
                                style={{ color: '#dc2626' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
                                title="Supprimer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STATISTIQUES RAPIDES ── */}
                {widget.id === 'quick-stats' && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Taux de conversion', value: `${conversionRate}%`,                                            color: '#16a34a' },
                      { label: 'Vues / fiche',        value: stats.jobs > 0 ? Math.round(stats.views / stats.jobs) : '—',    color: '#2563eb' },
                      { label: 'Score engagement',    value: `${engagementRate}%`,                                           color: '#7c3aed' },
                      { label: 'Total scans',         value: scanData.totals.scans.toLocaleString(),                         color: '#ea580c' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-2)' }}>
                        <div className="text-xl font-bold" style={{ color }}>{value}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── CLASSEMENT DES SCANS ── */}
                {widget.id === 'scan-ranking' && (
                  topScanned.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2" style={{ color: 'var(--text-muted)' }}>
                      <ScanLine size={28} className="opacity-30" />
                      <p className="text-sm">Aucun objet scanné pour l'instant.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topScanned.map((obj, i) => (
                        <div key={obj._id || i} className="flex items-center gap-3 py-1.5" style={{ borderBottom: i < topScanned.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{obj.name}</div>
                            <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${topScanned[0]?.scanCount > 0 ? ((obj.scanCount / topScanned[0].scanCount) * 100) : 0}%`,
                                  backgroundColor: COLORS[i % COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{(obj.scanCount || 0).toLocaleString()}</div>
                            <div className="text-xs" style={{ color: 'var(--text-subtle)' }}>scans</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* ── SCANS EN CHIFFRES ── */}
                {widget.id === 'scan-kpis' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total scans',  value: scanData.totals.scans.toLocaleString(), color: '#2563eb', bg: '#eff6ff', icon: ScanLine },
                        { label: 'Likes scans',  value: scanData.totals.likes.toLocaleString(), color: '#16a34a', bg: '#f0fdf4', icon: ThumbsUp },
                        { label: 'Nb. objets',   value: scanData.count.toLocaleString(),         color: '#7c3aed', bg: '#f5f3ff', icon: Briefcase },
                      ].map(({ label, value, color, bg, icon: Icon }) => (
                        <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-2)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: bg }}>
                            <Icon size={15} style={{ color }} />
                          </div>
                          <div className="text-lg font-bold" style={{ color: 'var(--text)' }}>{value}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-2)' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Taux de likes / scans</span>
                        <span className="text-xs font-bold" style={{ color: '#2563eb' }}>{scanLikeRate}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(parseFloat(scanLikeRate), 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SCANS PAR OBJET (CHART) ── */}
                {widget.id === 'scans-chart' && (
                  topScanned.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2" style={{ color: 'var(--text-muted)' }}>
                      <ScanLine size={28} className="opacity-30" />
                      <p className="text-sm">Aucun scan enregistré pour l'instant.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={topScanned.map(o => ({ name: o.name.split(' ')[0], scans: o.scanCount || 0, likes: o.likes || 0 }))}
                        layout="vertical" barSize={9} margin={{ left: 8, right: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number"   tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} width={55} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                        <Bar dataKey="scans" name="Scans" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="likes" name="Likes" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                )}

                {/* ── TICKETS RECENTS ── */}
                {widget.id === 'tickets-recent' && (
                  ticketsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Briefcase size={28} className="opacity-30" />
                      <p className="text-sm">Aucun ticket pour l'instant.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {ticketsData.map((ticket, i) => {
                        const s = STATUS_COLORS[ticket.status] || STATUS_COLORS.OPEN
                        return (
                          <div key={ticket._id || i} className="flex items-center justify-between py-2" style={{ borderBottom: i < ticketsData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div className="flex-1 min-w-0 mr-3">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{ticket.subject || ticket.title || 'Ticket sans titre'}</div>
                              <div className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fr-FR') : '—'}
                              </div>
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>
                              {s.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                )}

                {/* ── TAUX D'ENGAGEMENT ── */}
                {widget.id === 'engagement' && (
                  <div className="space-y-3">
                    {[
                      { label: 'Engagement likes / vues',        value: engagementRate, suffix: '%', color: '#2563eb', max: 30 },
                      { label: 'Conversion candidatures / vues', value: conversionRate, suffix: '%', color: '#16a34a', max: 15 },
                      { label: 'Likes scans / total scans',      value: scanLikeRate,   suffix: '%', color: '#7c3aed', max: 40 },
                    ].map(({ label, value, suffix, color, max }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                          <span className="text-xs font-bold" style={{ color }}>{value}{suffix}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min((parseFloat(value) / max) * 100, 100)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-2)' }}>
                        <div className="text-lg font-bold" style={{ color: '#2563eb' }}>{engagementRate}%</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Score global</div>
                      </div>
                      <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface-2)' }}>
                        <div className="text-lg font-bold" style={{ color: '#16a34a' }}>{conversionRate}%</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Taux conversion</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PERFORMANCE PAR FICHE METIER ── */}
                {widget.id === 'jobs-perf' && (() => {
                  const selectedJob = MOCK_JOBS_WEEKLY[perfJobId]
                  return (
                    <div className="space-y-3">
                      {/* Sélecteur de métier */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>Évolution sur la semaine</p>
                        <div className="relative">
                          <button
                            onClick={() => setPerfDropdownOpen(o => !o)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                          >
                            <span className="max-w-[140px] truncate">{selectedJob.name}</span>
                            <ChevronDown size={13} style={{ transform: perfDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                          </button>
                          {perfDropdownOpen && (
                            <div
                              className="absolute right-0 top-full mt-1 rounded-xl shadow-lg border py-1 z-30 min-w-[220px]"
                              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                            >
                              {Object.entries(MOCK_JOBS_WEEKLY).map(([id, job]) => (
                                <button
                                  key={id}
                                  onClick={() => { setPerfJobId(id); setPerfDropdownOpen(false) }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2"
                                  style={{ color: perfJobId === id ? '#2563eb' : 'var(--text)' }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--nav-hover)' }}
                                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
                                >
                                  {perfJobId === id && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                  {perfJobId !== id && <span className="w-1.5 h-1.5 shrink-0" />}
                                  {job.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Graphique courbes semaine */}
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={selectedJob.weekly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gwVues"  x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gwLikes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gwOffres" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
                          <Area type="monotone" dataKey="vues"         name="Vues"             stroke="#3b82f6" strokeWidth={2} fill="url(#gwVues)"   dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                          <Area type="monotone" dataKey="likes"        name="Likes"            stroke="#10b981" strokeWidth={2} fill="url(#gwLikes)"  dot={{ r: 3.5, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                          <Area type="monotone" dataKey="candidatures" name="Offres d'emplois" stroke="#f59e0b" strokeWidth={2} fill="url(#gwOffres)" dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )
                })()}

                {/* ── OBJETS VERORI ── */}
                {widget.id === 'verori-objects' && (
                  <div className="space-y-4">
                    {/* Bandeau Verori */}
                    <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                        <Glasses size={18} color="white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Filiale Verori</div>
                        <div className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                          {scanData.count} objet{scanData.count > 1 ? 's' : ''} · Optique &amp; Accessoires
                        </div>
                      </div>
                    </div>

                    {/* KPI totaux */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: ScanLine, label: 'Total scans', value: scanData.totals.scans.toLocaleString(), color: '#4f46e5', bg: '#ede9fe' },
                        { icon: Heart,    label: 'Likes',       value: scanData.totals.likes.toLocaleString(), color: '#db2777', bg: '#fce7f3' },
                      ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-2)' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ backgroundColor: bg }}>
                            <Icon size={14} style={{ color }} />
                          </div>
                          <div className="text-base font-bold" style={{ color: 'var(--text)' }}>{value}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Liste des objets */}
                    {scanData.objects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Glasses size={28} className="opacity-30" />
                        <p className="text-sm">Aucun objet Verori pour l'instant.</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {scanData.objects.map((obj, i) => {
                          const maxScans = scanData.objects[0]?.scanCount || 1
                          const pct = Math.round(((obj.scanCount || 0) / maxScans) * 100)
                          return (
                            <div
                              key={obj._id || i}
                              className="flex items-center gap-3 py-2 px-2 rounded-lg transition-colors"
                              style={{ borderBottom: i < scanData.objects.length - 1 ? '1px solid var(--border)' : 'none' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)' }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
                            >
                              {/* Nom + barre */}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{obj.name}</div>
                                <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', transition: 'width 0.5s ease' }}
                                  />
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-3 shrink-0 text-xs" style={{ color: 'var(--text-subtle)' }}>
                                <span title="Scans" className="flex items-center gap-1"><ScanLine size={10} />{obj.scanCount || 0}</span>
                                <span title="Likes" className="flex items-center gap-1"><Heart    size={10} />{obj.likes || 0}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── STATISTIQUES VIDEOS ── */}
                {widget.id === 'video-stats' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Eye,      label: 'Vues',     value: videoData.totals.views, color: '#2563eb', bg: '#eff6ff' },
                        { icon: ThumbsUp, label: 'Likes',    value: videoData.totals.likes, color: '#16a34a', bg: '#f0fdf4' },
                        { icon: Bookmark, label: 'Favoris',  value: videoData.totals.saves, color: '#7c3aed', bg: '#f5f3ff' },
                      ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-2)' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ backgroundColor: bg }}>
                            <Icon size={14} style={{ color }} />
                          </div>
                          <div className="text-base font-bold" style={{ color: 'var(--text)' }}>{value}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-0.5 max-h-52 overflow-y-auto">
                      {videoData.videos.length === 0 ? (
                        <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
                          <Film size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Aucune vidéo pour l'instant.</p>
                        </div>
                      ) : videoData.videos.map((v, i) => (
                        <div key={v._id} className="flex items-center gap-3 px-2 py-2 rounded-lg"
                          style={{ borderBottom: i < videoData.videos.length - 1 ? '1px solid var(--border)' : 'none' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#eff6ff' }}>
                            <Film size={13} style={{ color: '#2563eb' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{v.title}</div>
                          </div>
                          <div className="flex items-center gap-3 text-xs shrink-0" style={{ color: 'var(--text-subtle)' }}>
                            <span className="flex items-center gap-0.5"><Eye size={10} />{v.views}</span>
                            <span className="flex items-center gap-0.5"><ThumbsUp size={10} />{v.likes}</span>
                            <span className="flex items-center gap-0.5"><Bookmark size={10} />{v.saves}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </DraggableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      </div>{/* fin contentRef */}

      {/* ── MODAL FICHE METIER (Ajout / Modification) ── */}
      {jobModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) closeJobModal() }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl p-6"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>
                {jobModal === 'add' ? 'Nouvelle fiche métier' : 'Modifier la fiche métier'}
              </h3>
              <button onClick={closeJobModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Formulaire */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Nom du métier *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Ex: Développeur Web"
                  value={jobForm.name}
                  onChange={e => setJobForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Code ROME *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Ex: M1805"
                  value={jobForm.romeCode}
                  onChange={e => setJobForm(f => ({ ...f, romeCode: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Niveau d'études</label>
                <input
                  className="w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Ex: Bac+3, Master..."
                  value={jobForm.studyLevel}
                  onChange={e => setJobForm(f => ({ ...f, studyLevel: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors resize-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  rows={3}
                  placeholder="Description du métier..."
                  value={jobForm.description}
                  onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {jobError && (
                <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>{jobError}</p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={closeJobModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '' }}
              >
                Annuler
              </button>
              <button
                onClick={saveJob}
                disabled={jobSaving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: '#2563eb', opacity: jobSaving ? 0.7 : 1 }}
              >
                {jobSaving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Check size={14} /> {jobModal === 'add' ? 'Créer' : 'Enregistrer'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
