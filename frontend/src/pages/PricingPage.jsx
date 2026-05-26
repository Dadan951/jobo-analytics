import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Zap, Building2, Shield, ArrowRight, Star, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const C = {
  bg:      '#ffffff',
  surface: '#f8fafc',
  card:    '#ffffff',
  border:  '#e2e8f0',
  blue:    '#1d4ed8',
  red:     '#dc2626',
  purple:  '#7c3aed',
  blueLo:  'rgba(29,78,216,0.08)',
  text:    '#0f172a',
  muted:   '#475569',
}

const PLAN_LABELS = {
  'TPE':                    'TPE & Indépendants',
  'PME':                    'PME & Organismes de formation',
  'GRAND_GROUPE':           'Grand groupe',
  'ORGANISATION_PATRONALE': 'Organisation patronale',
  'FREE':                   'Plan gratuit',
}

const PLANS = [
  {
    id: 'TPE',
    name: 'TPE & Indépendants',
    price: '19,99 €',
    period: '/ mois',
    description: 'Pour les auto-entrepreneurs et très petites entreprises',
    icon: Shield,
    color: '#475569',
    highlight: false,
    ctaVariant: 'outline',
  },
  {
    id: 'PME',
    name: 'PME & Organismes de formation',
    price: '29,99 €',
    period: '/ mois',
    description: 'Pour les PME, PMI et organismes de formation',
    icon: Zap,
    color: '#1d4ed8',
    highlight: true,
    badge: 'Recommandé',
    ctaVariant: 'primary',
  },
  {
    id: 'GRAND_GROUPE',
    name: 'Grand groupe',
    price: '99,99 €',
    period: '/ mois',
    description: 'Pour les grandes entreprises et groupes',
    icon: Building2,
    color: '#dc2626',
    highlight: false,
    ctaVariant: 'red',
  },
  {
    id: 'ORGANISATION_PATRONALE',
    name: 'Organisation patronale',
    price: '199,99 €',
    period: '/ mois',
    description: 'Pour les organisations patronales et fédérations',
    icon: Star,
    color: '#7c3aed',
    highlight: false,
    ctaVariant: 'purple',
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subscription, setSubscription]   = useState(null)
  const [loadingPlan, setLoadingPlan]     = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError]                 = useState('')

  useEffect(() => {
    if (user) {
      api.getMySubscription()
        .then(data => setSubscription(data))
        .catch(() => setSubscription({ plan: 'FREE', status: 'NONE' }))
    }
  }, [user])

  const currentPlan = subscription?.plan || 'FREE'

  const handleChoosePlan = async (planId) => {
    if (!user) { navigate('/register'); return }
    if (planId === currentPlan) return
    setError('')
    setLoadingPlan(planId)
    try {
      const { url } = await api.createCheckoutSession(planId)
      window.location.href = url
    } catch (err) {
      setError(err.message || 'Erreur lors de la redirection vers le paiement')
      setLoadingPlan(null)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Voulez-vous vraiment annuler votre abonnement ?')) return
    setCancelLoading(true)
    try {
      await api.cancelMySubscription()
      setSubscription({ plan: 'FREE', status: 'CANCELLED' })
    } catch (err) {
      setError(err.message || "Erreur lors de l'annulation")
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="Jobo Analytics" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
              Jobo <span style={{ color: C.blue, fontWeight: 800 }}>Analytics</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            {user ? (
              <Link to="/dashboard" style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', background: `linear-gradient(135deg, ${C.blue}, #1845b0)` }}>
                Mon tableau de bord
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: 'none', border: `1px solid ${C.border}`, background: C.surface }}>
                  Connexion
                </Link>
                <Link to="/register" style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', background: `linear-gradient(135deg, ${C.blue}, #1845b0)` }}>
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 28px 96px' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            display: 'inline-block', padding: '5px 18px', borderRadius: 999, marginBottom: 24,
            backgroundColor: C.blueLo, border: `1px solid rgba(59,130,246,0.25)`,
            color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>Tarifs</span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.text, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20 }}>
            Choisissez votre{' '}
            <span style={{ background: `linear-gradient(120deg, ${C.blue} 0%, #6366f1 50%, ${C.red} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              formule
            </span>
          </h1>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Un tarif adapté à la taille de votre organisation. Aucun engagement.
          </p>
        </div>

        {/* ── Erreur ── */}
        {error && (
          <div style={{ maxWidth: 520, margin: '0 auto 32px', padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <X size={14} style={{ flexShrink: 0 }} />{error}
          </div>
        )}

        {/* ── Bandeau plan actif ── */}
        {user && subscription && currentPlan !== 'FREE' && (
          <div style={{ maxWidth: 640, margin: '0 auto 48px', padding: '16px 24px', borderRadius: 14, backgroundColor: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: subscription.status === 'ACTIVE' ? '#22c55e' : C.red }} />
              <span style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>
                {PLAN_LABELS[currentPlan] || currentPlan} · {subscription.status === 'ACTIVE' ? 'Actif' : 'Annulé'}
              </span>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelLoading || subscription.status !== 'ACTIVE'}
              style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: cancelLoading ? C.muted : '#ef4444', fontSize: 13, fontWeight: 600, cursor: cancelLoading ? 'not-allowed' : 'pointer' }}
            >
              {cancelLoading ? 'Annulation…' : 'Résilier'}
            </button>
          </div>
        )}

        {/* ── Grille des plans ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {PLANS.map(plan => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.id
            const isLoading = loadingPlan === plan.id

            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  padding: '32px 28px',
                  borderRadius: 20,
                  backgroundColor: plan.highlight ? 'rgba(29,78,216,0.04)' : C.card,
                  border: `1px solid ${plan.highlight ? 'rgba(29,78,216,0.35)' : isCurrent ? 'rgba(34,197,94,0.4)' : C.border}`,
                  boxShadow: plan.highlight ? '0 8px 32px rgba(29,78,216,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Badge Recommandé */}
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 999, background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <Star size={10} fill="#fff" /> {plan.badge}
                  </div>
                )}

                {/* Badge Votre plan */}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -14, right: 20, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', fontSize: 11, fontWeight: 700 }}>
                    Votre plan
                  </div>
                )}

                {/* Icône */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 20,
                  backgroundColor: plan.id === 'ORGANISATION_PATRONALE' ? 'rgba(124,58,237,0.08)' : plan.id === 'GRAND_GROUPE' ? 'rgba(220,38,38,0.08)' : C.blueLo,
                  border: `1px solid ${plan.id === 'ORGANISATION_PATRONALE' ? 'rgba(124,58,237,0.2)' : plan.id === 'GRAND_GROUPE' ? 'rgba(220,38,38,0.2)' : 'rgba(29,78,216,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={plan.color} />
                </div>

                {/* Nom + description */}
                <div style={{ marginBottom: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>{plan.name}</h2>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{plan.description}</p>
                </div>

                {/* Prix */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '24px 0 28px', marginTop: 'auto' }}>
                  <span style={{ fontSize: 34, fontWeight: 900, color: plan.color, letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{plan.period}</span>
                </div>

                {/* Bouton */}
                <button
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={isCurrent || isLoading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                    fontSize: 14, fontWeight: 700,
                    cursor: isCurrent ? 'default' : isLoading ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                    ...(isCurrent
                      ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                      : plan.ctaVariant === 'primary' ? { background: `linear-gradient(135deg, ${C.blue}, #1845b0)`, color: '#fff' }
                      : plan.ctaVariant === 'red'     ? { background: `linear-gradient(135deg, ${C.red}, #991b1b)`,  color: '#fff' }
                      : plan.ctaVariant === 'purple'  ? { background: `linear-gradient(135deg, ${C.purple}, #5b21b6)`, color: '#fff' }
                      : { background: C.blueLo, color: C.blue, border: `1px solid rgba(29,78,216,0.25)` }
                    ),
                  }}
                  onMouseEnter={e => { if (!isCurrent && !isLoading) e.currentTarget.style.filter = 'brightness(1.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = '' }}
                >
                  {isLoading ? (
                    <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Redirection…</>
                  ) : isCurrent ? (
                    <><Check size={15} /> Plan actuel</>
                  ) : (
                    <>Choisir ce plan <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* ── Réassurance ── */}
        <div style={{ maxWidth: 640, margin: '64px auto 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
            Paiement sécurisé via <strong style={{ color: C.text }}>Stripe</strong>. Aucun engagement contractuel.
            Résiliable à tout moment depuis votre compte. Pour toute question :{' '}
            <a href="mailto:joboanalytics1@gmail.com" style={{ color: C.blue, textDecoration: 'none' }}>joboanalytics1@gmail.com</a>
          </p>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '28px', backgroundColor: C.surface, marginTop: 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, fontSize: 12, color: C.muted }}>
          <p>© 2026 Jobo Analytics — Filière Verrerie</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['Mentions légales', '/mentions-legales'], ['RGPD', '/rgpd']].map(([l, h]) => (
              <Link key={l} to={h} style={{ color: C.muted, textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
