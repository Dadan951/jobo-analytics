import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { User, Mail, Lock, Bell, LayoutDashboard, Save, Check, Eye, EyeOff, Shield, Sun, Moon, Ticket, CreditCard, Zap, Building2, Star, ArrowRight, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'

const PLAN_LABELS = {
  'TPE':                    'TPE & Indépendants',
  'PME':                    'PME & Organismes de formation',
  'GRAND_GROUPE':           'Grand groupe',
  'ORGANISATION_PATRONALE': 'Organisation patronale',
}

const PLAN_COLORS = {
  'TPE':                    { bg: '#f0f9ff', text: '#0369a1' },
  'PME':                    { bg: '#eff6ff', text: '#1d4ed8' },
  'GRAND_GROUPE':           { bg: '#fef2f2', text: '#dc2626' },
  'ORGANISATION_PATRONALE': { bg: '#faf5ff', text: '#9333ea' },
}

const TABS = [
  { id: 'info',         label: 'Informations', icon: User          },
  { id: 'security',     label: 'Securite',     icon: Lock          },
  { id: 'abonnement',   label: 'Abonnement',   icon: CreditCard    },
  { id: 'notifications',label: 'Notifications',icon: Bell          },
  { id: 'widgets',      label: 'Widgets',      icon: LayoutDashboard},
  { id: 'appearance',   label: 'Apparence',    icon: Sun           },
  { id: 'tickets',      label: 'Tickets',      icon: Ticket        },
]

const PLAN_ICONS = {
  'TPE':                    Shield,
  'PME':                    Zap,
  'GRAND_GROUPE':           Building2,
  'ORGANISATION_PATRONALE': Star,
}

const PLAN_FEATURES = {
  'TPE':                    ['Accès au tableau de bord', 'Suivi des fiches métier', 'Export PDF', 'Support email'],
  'PME':                    ['Tout ce qui est inclus dans TPE', 'Fiches métier illimitées', 'Rapports avancés', 'Support prioritaire'],
  'GRAND_GROUPE':           ['Tout ce qui est inclus dans PME', 'Accès multi-utilisateurs', 'API dédiée', 'Support téléphonique'],
  'ORGANISATION_PATRONALE': ['Tout ce qui est inclus dans Grand groupe', 'Tableau de bord personnalisé', 'Onboarding dédié', 'SLA garanti'],
}

const PLAN_PRICES = {
  'TPE': '19,99 €', 'PME': '29,99 €', 'GRAND_GROUPE': '99,99 €', 'ORGANISATION_PATRONALE': '199,99 €',
}

function Alert({ type, message }) {
  if (!message) return null
  return (
    <div className={`px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2 ${
      type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
    }`}>
      {type === 'success' && <Check size={15} />}
      {message}
    </div>
  )
}

function InfoTab({ user }) {
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const { refreshUser } = useAuth()

  useEffect(() => {
    api.getMySubscription()
      .then(data => setSubscription(data))
      .catch(() => setSubscription({ plan: 'FREE', status: 'NONE' }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAlert(null)
    try {
      if (email !== user?.email) {
        await api.updateEmail({ newEmail: email })
      }
      await refreshUser()
      setAlert({ type: 'success', message: 'Informations mises à jour.' })
    } catch (err) {
      setAlert({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const orgInitials = (user?.orgName || user?.email || 'JA').slice(0, 2).toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <Alert {...(alert || {})} message={alert?.message} />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
          {orgInitials}
        </div>
        <div>
          <div className="font-semibold" style={{ color: 'var(--text)' }}>{user?.orgName || user?.email}</div>
          <div className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role?.toLowerCase() || 'Utilisateur'}</div>
          {(() => {
            const plan = subscription?.plan
            const isActive = subscription?.status === 'ACTIVE'
            if (!plan || !PLAN_LABELS[plan]) return null
            const col = PLAN_COLORS[plan]
            return (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 inline-flex items-center gap-1.5" style={{ backgroundColor: col.bg, color: col.text }}>
                {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />}
                {PLAN_LABELS[plan]}
              </span>
            )
          })()}
        </div>
      </div>
      <div>
        <label className="label">Nom de l'organisme</label>
        <input type="text" className="input" value={user?.orgName || '-'} disabled />
      </div>
      <div>
        <label className="label">Adresse email</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
          <input type="email" className="input pl-9" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label">Role</label>
        <input type="text" className="input" value={user?.role || '-'} disabled />
      </div>
      <div>
        <label className="label">Membre depuis</label>
        <input
          type="text" className="input"
          value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
          disabled
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sauvegarde...</span> : <><Save size={15} />Enregistrer</>}
      </button>
    </form>
  )
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleShow = k => setShow(s => ({ ...s, [k]: !s[k] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert(null)
    if (form.newPassword !== form.confirmPassword) { setAlert({ type: 'error', message: 'Les mots de passe ne correspondent pas.' }); return }
    if (form.newPassword.length < 6) { setAlert({ type: 'error', message: 'Minimum 6 caracteres requis.' }); return }
    setLoading(true)
    try {
      await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword, confirmPassword: form.confirmPassword })
      setAlert({ type: 'success', message: 'Mot de passe modifie avec succes.' })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setAlert({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const PwField = ({ label, field, placeholder }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
        <input type={show[field] ? 'text' : 'password'} className="input pl-9 pr-10" placeholder={placeholder} value={form[field]} onChange={set(field)} required />
        <button type="button" onClick={() => toggleShow(field)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }}>
          {show[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <Alert {...(alert || {})} message={alert?.message} />
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
        <Shield size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">Choisissez un mot de passe fort d'au moins 8 caracteres.</p>
      </div>
      <PwField label="Mot de passe actuel" field="currentPassword" placeholder="Votre mot de passe actuel" />
      <PwField label="Nouveau mot de passe" field="newPassword" placeholder="Minimum 6 caracteres" />
      <PwField label="Confirmer" field="confirmPassword" placeholder="Retapez le nouveau mot de passe" />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Modification...</span> : <><Save size={15} />Changer le mot de passe</>}
      </button>
    </form>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        flexShrink: 0, width: 40, height: 22, borderRadius: 11, position: 'relative',
        border: 'none', cursor: 'pointer', transition: 'background 0.2s',
        background: value ? '#2563eb' : 'var(--border-2)'
      }}
    >
      <span style={{
        position: 'absolute', top: 2, borderRadius: '50%', width: 18, height: 18,
        background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
        left: value ? 20 : 2
      }} />
    </button>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({ emailNewLike: true, emailNewApply: true, emailWeeklyReport: false, pushNewApply: true })
  const [saved, setSaved] = useState(false)
  const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }))
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const Row = ({ label, desc, field }) => (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>{desc}</div>}
      </div>
      <Toggle value={prefs[field]} onChange={() => toggle(field)} />
    </div>
  )

  return (
    <div className="max-w-md space-y-5">
      {saved && <Alert type="success" message="Preferences enregistrees." />}
      <div className="card p-0">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Email</h4>
        </div>
        <div className="px-5">
          <Row label="Nouveau like" desc="Recevoir un email a chaque like" field="emailNewLike" />
          <Row label="Nouvelle candidature" desc="Recevoir un email a chaque candidature" field="emailNewApply" />
          <Row label="Rapport hebdomadaire" desc="Resume chaque lundi" field="emailWeeklyReport" />
        </div>
      </div>
      <div className="card p-0">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Push</h4>
        </div>
        <div className="px-5">
          <Row label="Nouvelle candidature" field="pushNewApply" />
        </div>
      </div>
      <button onClick={save} className="btn-primary"><Save size={15} />Enregistrer</button>
    </div>
  )
}

const ALL_WIDGETS = [
  { id: 'activity-chart', title: 'Activite de la semaine', desc: 'Graphique des vues et likes sur 7 jours' },
  { id: 'distribution', title: 'Repartition des interactions', desc: 'Camembert vues / likes / candidatures' },
  { id: 'recent-jobs', title: 'Fiches metier recentes', desc: 'Top 5 des fiches les plus actives' },
  { id: 'quick-stats', title: 'Statistiques rapides', desc: "Indicateurs cles en un coup d'oeil" },
]

function WidgetsTab() {
  const [enabled, setEnabled] = useState(new Set(ALL_WIDGETS.map(w => w.id)))
  const [saved, setSaved] = useState(false)
  const toggle = id => setEnabled(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="max-w-md space-y-4">
      {saved && <Alert type="success" message="Configuration enregistree." />}
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Activez ou desactivez les widgets du dashboard.</p>
      {ALL_WIDGETS.map(w => (
        <div key={w.id} className="card flex items-center justify-between gap-4 py-4">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{w.title}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>{w.desc}</div>
          </div>
          <Toggle value={enabled.has(w.id)} onChange={() => toggle(w.id)} />
        </div>
      ))}
      <button onClick={save} className="btn-primary"><Save size={15} />Enregistrer</button>
    </div>
  )
}

function AppearanceTab() {
  const { dark, toggleTheme } = useTheme()

  return (
    <div className="max-w-md space-y-5">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choisissez l'apparence de l'interface.</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Light mode card */}
        <button
          onClick={() => dark && toggleTheme()}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${!dark ? 'border-blue-600' : ''}`}
          style={{ borderColor: !dark ? '#2563eb' : 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="w-full h-20 bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <Sun size={18} className="text-yellow-500" />
            </div>
          </div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Clair</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Interface lumineuse</div>
          {!dark && <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium"><Check size={12} /> Actif</div>}
        </button>

        {/* Dark mode card */}
        <button
          onClick={() => !dark && toggleTheme()}
          className={`p-4 rounded-2xl border-2 text-left transition-all`}
          style={{ borderColor: dark ? '#2563eb' : 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="w-full h-20 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: '#1e293b' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
              <Moon size={18} className="text-blue-400" />
            </div>
          </div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Sombre</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Interface sombre</div>
          {dark && <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium"><Check size={12} /> Actif</div>}
        </button>
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>Mode {dark ? 'sombre' : 'clair'} actif</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>La preference est sauvegardee automatiquement</div>
        </div>
        <Toggle value={dark} onChange={toggleTheme} />
      </div>
    </div>
  )
}

function SubscriptionTab() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getMySubscription()
      .then(data => setSubscription(data))
      .catch(() => setSubscription({ plan: 'FREE', status: 'NONE' }))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    if (!window.confirm('Voulez-vous vraiment résilier votre abonnement ?')) return
    setCancelLoading(true)
    setError('')
    try {
      await api.cancelMySubscription()
      setSubscription({ plan: 'FREE', status: 'CANCELLED' })
      setSuccess('Abonnement résilié. Votre accès reste actif jusqu\'à la fin de la période.')
    } catch (err) {
      setError(err.message || 'Erreur lors de la résiliation')
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const plan     = subscription?.plan
  const status   = subscription?.status || 'NONE'
  const isActive = status === 'ACTIVE'
  const hasПлан  = plan && PLAN_LABELS[plan]
  const col      = hasПлан ? PLAN_COLORS[plan] : { bg: '#f1f5f9', text: '#64748b' }
  const Icon     = hasПлан ? (PLAN_ICONS[plan] || CreditCard) : CreditCard
  const features = hasПлан ? (PLAN_FEATURES[plan] || []) : []
  const price    = hasПлан ? PLAN_PRICES[plan] : null

  // Aucun abonnement actif
  if (!hasПлан || !isActive) {
    return (
      <div className="space-y-6 max-w-lg">
        {error   && <Alert type="error"   message={error}   />}
        {success && <Alert type="success" message={success} />}

        <div style={{
          padding: '40px 32px', borderRadius: 16, textAlign: 'center',
          border: '1px dashed var(--border)', backgroundColor: 'var(--surface-2)',
        }}>
          <CreditCard size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Aucun abonnement actif
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
            Choisissez un plan pour accéder à toutes les fonctionnalités de Jobo Analytics.
          </p>
          <Link
            to="/pricing"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #1d4ed8, #1845b0)',
              color: '#fff', textDecoration: 'none',
            }}
          >
            Voir les plans <ArrowRight size={14} />
          </Link>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, textAlign: 'center' }}>
          Paiement sécurisé via <strong>Stripe</strong>. Résiliable à tout moment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      {/* Carte plan actuel */}
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${col.text}33`,
        boxShadow: `0 4px 24px ${col.text}18`,
      }}>
        {/* Header coloré */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: col.bg,
          borderBottom: `1px solid ${col.text}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: '#fff',
              border: `1px solid ${col.text}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} style={{ color: col.text }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: col.text }}>
                {PLAN_LABELS[plan]}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {price} / mois
              </div>
            </div>
          </div>

          {/* Badge statut actif */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            backgroundColor: 'rgba(34,197,94,0.12)',
            color: '#16a34a',
            border: '1px solid rgba(34,197,94,0.3)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            Actif
          </span>
        </div>

        {/* Features */}
        <div style={{ padding: '20px 24px', backgroundColor: 'var(--surface)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 14 }}>
            Inclus dans votre formule
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text)' }}>
                <Check size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          to="/pricing"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: 'linear-gradient(135deg, #1d4ed8, #1845b0)',
            color: '#fff', textDecoration: 'none',
          }}
        >
          Changer de plan <ArrowRight size={14} />
        </Link>

        <button
          onClick={handleCancel}
          disabled={cancelLoading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: 'rgba(239,68,68,0.08)', color: '#dc2626',
            border: '1px solid rgba(239,68,68,0.25)', cursor: cancelLoading ? 'wait' : 'pointer',
          }}
        >
          <X size={14} />
          {cancelLoading ? 'Résiliation…' : "Résilier l'abonnement"}
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        Paiement sécurisé via <strong>Stripe</strong>. Résiliable à tout moment.
        Pour toute question : <a href="mailto:joboanalytics1@gmail.com" style={{ color: '#1d4ed8' }}>joboanalytics1@gmail.com</a>
      </p>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Lire ?tab= dans l'URL (ex: /profile?tab=abonnement après retour Stripe)
  const initialTab = searchParams.get('tab') || 'info'
  const [tab, setTab] = useState(
    TABS.some(t => t.id === initialTab) ? initialTab : 'info'
  )

  const handleTabClick = (id) => {
    if (id === 'tickets') { navigate('/tickets'); return }
    setTab(id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Mon profil</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Gerez vos informations personnelles et parametres.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl w-fit flex-wrap" style={{ backgroundColor: 'var(--surface-2)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150`}
            style={tab === id
              ? { backgroundColor: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)', background: 'transparent' }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'info'          && <InfoTab user={user} />}
        {tab === 'security'      && <SecurityTab />}
        {tab === 'abonnement'    && <SubscriptionTab />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'widgets'       && <WidgetsTab />}
        {tab === 'appearance'    && <AppearanceTab />}
      </div>
    </div>
  )
}
