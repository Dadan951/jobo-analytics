import { useState, useRef, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts'
import { Eye, ThumbsUp, Users, Calendar, Download, Briefcase, BookOpen, ScanLine } from 'lucide-react'
import { api } from '../services/api'

// ── Données de démo cohérentes avec le Dashboard ─────────────────────────────
const DEMO_TOP_JOBS = [
  { name: 'Souffleur de Verre Artisan',      vues: 1180, likes: 312, candidatures: 78 },
  { name: 'Technicien Fabrication Verriere', vues:  940, likes: 248, candidatures: 61 },
  { name: 'Controleur Qualite Verrerie',     vues:  820, likes: 214, candidatures: 54 },
  { name: 'Designer Verrerie Artistique',    vues:  710, likes: 186, candidatures: 42 },
  { name: 'Operateur Four Verrier',          vues:  635, likes: 157, candidatures: 36 },
]

const DEMO_TOTALS = DEMO_TOP_JOBS.reduce(
  (a, j) => ({ vues: a.vues + j.vues, likes: a.likes + j.likes, candidatures: a.candidatures + j.candidatures }),
  { vues: 0, likes: 0, candidatures: 0 }
)
// → vues: 4285 | likes: 1117 | candidatures: 271

const PERIODS = [
  { key: 'day', label: 'Jour' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'custom', label: 'Personnalise' },
]

const MOCK_DATA = {
  day: [
    { label: '8h', vues: 40, likes: 12, candidatures: 5 },
    { label: '10h', vues: 78, likes: 22, candidatures: 9 },
    { label: '12h', vues: 120, likes: 38, candidatures: 15 },
    { label: '14h', vues: 95, likes: 28, candidatures: 12 },
    { label: '16h', vues: 145, likes: 44, candidatures: 19 },
    { label: '18h', vues: 110, likes: 35, candidatures: 14 },
    { label: '20h', vues: 60, likes: 18, candidatures: 7 },
  ],
  week: [
    { label: 'Lun', vues: 120, likes: 34, candidatures: 18 },
    { label: 'Mar', vues: 190, likes: 51, candidatures: 22 },
    { label: 'Mer', vues: 160, likes: 43, candidatures: 15 },
    { label: 'Jeu', vues: 240, likes: 68, candidatures: 31 },
    { label: 'Ven', vues: 300, likes: 92, candidatures: 45 },
    { label: 'Sam', vues: 210, likes: 55, candidatures: 28 },
    { label: 'Dim', vues: 180, likes: 47, candidatures: 20 },
  ],
  month: [
    { label: 'S1', vues: 980,  likes: 258, candidatures: 62 },
    { label: 'S2', vues: 1120, likes: 294, candidatures: 72 },
    { label: 'S3', vues: 1035, likes: 271, candidatures: 67 },
    { label: 'S4', vues: 1150, likes: 294, candidatures: 70 },
  ],
  custom: [
    { label: 'J1', vues: 95, likes: 24, candidatures: 11 },
    { label: 'J2', vues: 130, likes: 38, candidatures: 16 },
    { label: 'J3', vues: 88, likes: 21, candidatures: 9 },
    { label: 'J4', vues: 175, likes: 52, candidatures: 24 },
    { label: 'J5', vues: 210, likes: 63, candidatures: 30 },
  ],
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('week')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exporting, setExporting] = useState(false)
  const [topJobs, setTopJobs] = useState([])
  const [realTotals, setRealTotals] = useState(null)
  const contentRef = useRef(null)

  const [joboCounts,     setJoboCounts]     = useState(null)
  const [joboJobs,       setJoboJobs]       = useState([])
  const [joboObjects,    setJoboObjects]    = useState([])
  const [joboFormations, setJoboFormations] = useState([])
  const [joboOffers,     setJoboOffers]     = useState([])

  useEffect(() => {
    api.getJoboStats().then(data => {
      setJoboCounts(data.counts || null)
      setJoboJobs(data.jobs       || [])
      setJoboObjects(data.objects    || [])
      setJoboFormations(data.formations || [])
      setJoboOffers(data.jobOffers  || [])
    }).catch(() => {})
  }, [])

  const data = MOCK_DATA[period] || MOCK_DATA.week

  const chartTotals = data.reduce((acc, d) => ({
    vues: acc.vues + d.vues,
    likes: acc.likes + d.likes,
    candidatures: acc.candidatures + d.candidatures,
  }), { vues: 0, likes: 0, candidatures: 0 })

  // Utilise les données réelles si disponibles, sinon les totaux démo verrerie
  const totals = realTotals
    ? { vues: realTotals.views, likes: realTotals.likes, candidatures: realTotals.applicants }
    : DEMO_TOTALS

  const handleExportPDF = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF }   = await import('jspdf')
      const element = contentRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yOffset = 0
      while (yOffset < pdfHeight) {
        if (yOffset > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, pdfHeight)
        yOffset += pageHeight
      }
      pdf.save('jobo-analytics-rapport.pdf')
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    fontSize: 12,
  }

  // Fallback sur les fiches verrerie si la DB est vide
  const displayJobs = topJobs.length > 0 ? topJobs : DEMO_TOP_JOBS

  return (
    <div className="space-y-6">
      {/* Header — outside capture area */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Vue d'ensemble</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Analysez les performances de vos fiches metier.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
            <Calendar size={14} className="ml-2" style={{ color: 'var(--text-subtle)' }} />
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
              <span className="flex items-center gap-2">
                <Download size={15} />
                Exporter PDF
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Custom date range */}
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

      {/* Content captured for PDF */}
      <div ref={contentRef} className="space-y-5 p-1">
        {/* KPI row — compteurs JOBO */}
        {joboCounts && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Fiches métier', value: joboCounts.jobs, icon: Briefcase, bg: '#eff6ff', color: '#2563eb' },
              { label: 'Offres d\'emploi', value: joboCounts.jobOffers, icon: Users, bg: '#f0fdf4', color: '#16a34a' },
              { label: 'Formations', value: joboCounts.formations, icon: BookOpen, bg: '#fdf4ff', color: '#9333ea' },
              { label: 'Objets scannés', value: joboCounts.objects, icon: ScanLine, bg: '#fff7ed', color: '#ea580c' },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>{value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Vues totales', value: totals.vues.toLocaleString(), icon: Eye, bg: '#eff6ff', color: '#2563eb' },
            { label: 'Likes totaux', value: totals.likes.toLocaleString(), icon: ThumbsUp, bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Candidatures', value: totals.candidatures.toLocaleString(), icon: Users, bg: '#fff7ed', color: '#ea580c' },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>Evolution des vues</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="vues" stroke="#3b82f6" fill="url(#gV)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>Likes et Candidatures</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} barSize={12} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                <Bar dataKey="likes" name="Likes" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="candidatures" name="Candidatures" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card lg:col-span-2">
            <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>Toutes les metriques</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                <Line type="monotone" dataKey="vues" name="Vues" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="likes" name="Likes" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="candidatures" name="Candidatures" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fiches métier */}
        {joboJobs.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Fiches métier — Verrerie</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">🟢 BDD JOBO</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Métier', 'Code ROME', 'Formation requise'].map((h, i) => (
                      <th key={h} className="pb-3 text-xs font-semibold uppercase tracking-wider text-left" style={{ color: 'var(--text-subtle)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {joboJobs.map((job, i) => (
                    <tr key={String(job._id)} style={{ borderBottom: i < joboJobs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-subtle)' }}>{i + 1}</td>
                      <td className="py-3 font-medium" style={{ color: 'var(--text)' }}>{job.name}</td>
                      <td className="py-3" style={{ color: 'var(--text-muted)' }}>{job.codeROME || '—'}</td>
                      <td className="py-3" style={{ color: 'var(--text-muted)' }}>{job.formation || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formations */}
        {joboFormations.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>Formations — Verrerie</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {joboFormations.map(f => (
                <div key={String(f._id)} className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{f.intitule}</div>
                  <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{f.etablissement}</div>
                  <div className="flex gap-3 flex-wrap">
                    {f.diplome && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{f.diplome}</span>}
                    {f.duree   && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{f.duree}</span>}
                    {f.ville   && <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>📍 {f.ville}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objets */}
        {joboObjects.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>Objets — Verrerie</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {joboObjects.map(o => (
                <div key={String(o._id)} className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{o.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offres d'emploi */}
        {joboOffers.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-muted)' }}>Offres d'emploi — Verrerie</h3>
            <div className="flex flex-col gap-3">
              {joboOffers.map(o => (
                <div key={String(o._id)} className="flex items-start justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{o.name}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{o.description}</div>
                  </div>
                  {o.formation && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 shrink-0 ml-3">{o.formation}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
