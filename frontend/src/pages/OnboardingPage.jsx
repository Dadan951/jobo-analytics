import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Zap, Building2, Shield, ArrowRight, Star, X, LogOut } from 'lucide-react'
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

const PLANS = [
  {
    id: 'TPE',
    name: 'TPE & Indépendants',
    price: '19,99 €',
    period: '/ mois',
    description: 'Pour les auto-entrepreneurs et très petites entreprises',
    icon: Shield,
    color: '#0369a1',
    cardBg: '#f0f9ff',
    cardBorder: 'rgba(3,105,161,0.2)',
    highlight: false,
    ctaBg: C.blueLo,
    ctaColor: C.blue,
    ctaBorder: 'rgba(29,78,216,0.25)',
  },
  {
    id: 'PME',
    name: 'PME & Organismes',
    price: '29,99 €',
    period: '/ mois',
    description: 'Pour les PME, PMI et organismes de formation',
    icon: Zap,
    color: '#1d4ed8',
    cardBg: 'rgba(29,78,216,0.04)',
    cardBorder: 'rgba(29,78,216,0.35)',
    highlight: true,
    badge: 'Recommandé',
    ctaBg: 'linear-gradient(135deg, #1d4ed8, #1845b0)',
    ctaColor: '#fff',
  },
  {
    id: 'GRAND_GROUPE',
    name: 'Grand groupe',
    price: '99,99 €',
    period: '/ mois',
    description: 'Pour les grandes entreprises et groupes',
    icon: Building2,
    color: '#dc2626',
    cardBg: '#fff',
    cardBorder: 'rgba(220,38,38,0.2)',
    highlight: false,
    ctaBg: 'linear-gradient(135deg, #dc2626, #991b1b)',
    ctaColor: '#fff',
  },
  {
    id: 'ORGANISATION_PATRONALE',
    name: 'Organisation patronale',
    price: '199,99 €',
    period: '/ mois',
    description: 'Pour les organisations patronales et fédérations',
    icon: Star,
    color: '#7c3aed',
    cardBg: '#fff',
    cardBorder: 'rgba(124,58,237,0.2)',
    highlight: false,
    ctaBg: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    ctaColor: '#fff',
  },
]

export default function OnboardingPage() {
  const { user, logout }        = useAuth()
  const navigate                = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [error, setError]       = useState('')

  const handleChoosePlan = async (planId) => {
    setError('')
    setLoadingPlan(planId)
    try {
      const { url } = await api.createCheckoutSession(planId, 'onboarding')
      window.location.href = url
    } catch (err) {
      setError(err.message || 'Erreur lors de la redirection vers le paiement')
      setLoadingPlan(null)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
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
              Jobo <span style={{ color: C.blue }}>Analytics</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user && (
              <span style={{ fontSize: 13, color: C.muted }}>
                Connecté en tant que <strong style={{ color: C.text }}>{user.email}</strong>
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer' }}
            >
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 28px 96px' }}>

        {/* ── Étapes ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 56 }}>
          {[
            { n: 1, label: 'Création du compte', done: true },
            { n: 2, label: 'Vérification email', done: true },
            { n: 3, label: 'Choix du plan', done: false, active: true },
          ].map((step, i, arr) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  backgroundColor: step.done ? C.blue : step.active ? C.blue : C.surface,
                  border: `2px solid ${step.done || step.active ? C.blue : C.border}`,
                  color: step.done || step.active ? '#fff' : C.muted,
                }}>
                  {step.done ? <Check size={16} /> : step.n}
                </div>
                <span style={{ fontSize: 12, fontWeight: step.active ? 700 : 500, color: step.active ? C.text : C.muted, whiteSpace: 'nowrap' }}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 80, height: 2, backgroundColor: C.blue, margin: '0 8px', marginBottom: 24 }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            display: 'inline-block', padding: '5px 18px', borderRadius: 999, marginBottom: 20,
            backgroundColor: C.blueLo, border: '1px solid rgba(29,78,216,0.25)',
            color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            Dernière étape
          </span>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, color: C.text, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Choisissez votre{' '}
            <span style={{ background: `linear-gradient(120deg, ${C.blue} 0%, #6366f1 50%, ${C.red} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              formule
            </span>
          </h1>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
            Votre compte est prêt. Choisissez un plan pour accéder à votre tableau de bord.
          </p>
        </div>

        {/* ── Erreur ── */}
        {error && (
          <div style={{ maxWidth: 520, margin: '0 auto 32px', padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <X size={14} style={{ flexShrink: 0 }} />{error}
          </div>
        )}

        {/* ── Grille des plans ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 24 }}>
          {PLANS.map(plan => {
            const Icon = plan.icon
            const isLoading = loadingPlan === plan.id

            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  padding: '32px 24px',
                  borderRadius: 20,
                  backgroundColor: plan.cardBg,
                  border: `1px solid ${plan.cardBorder}`,
                  boxShadow: plan.highlight ? '0 8px 32px rgba(29,78,216,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = plan.highlight ? '0 16px 40px rgba(29,78,216,0.15)' : '0 8px 24px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = plan.highlight ? '0 8px 32px rgba(29,78,216,0.10)' : '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                {/* Badge Recommandé */}
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 999, background: `linear-gradient(135deg, ${C.blue}, #1845b0)`, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <Star size={10} fill="#fff" /> {plan.badge}
                  </div>
                )}

                {/* Icône */}
                <div style={{
                  width: 46, height: 46, borderRadius: 13, marginBottom: 18,
                  backgroundColor: `${plan.color}15`,
                  border: `1px solid ${plan.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={plan.color} />
                </div>

                {/* Nom + description */}
                <div style={{ marginBottom: 6 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>{plan.name}</h2>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{plan.description}</p>
                </div>

                {/* Prix */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '20px 0 24px', marginTop: 'auto' }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: plan.color, letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{plan.period}</span>
                </div>

                {/* Bouton */}
                <button
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={!!loadingPlan}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '13px 20px', borderRadius: 12, border: plan.ctaBorder ? `1px solid ${plan.ctaBorder}` : 'none',
                    fontSize: 14, fontWeight: 700,
                    cursor: loadingPlan ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                    background: plan.ctaBg,
                    color: plan.ctaColor,
                    opacity: loadingPlan && !isLoading ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!loadingPlan) e.currentTarget.style.filter = 'brightness(1.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = '' }}
                >
                  {isLoading ? (
                    <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: plan.ctaColor === '#fff' ? '#fff' : C.blue, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Redirection…</>
                  ) : (
                    <>Choisir ce plan <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* ── Réassurance ── */}
        <div style={{ maxWidth: 560, margin: '48px auto 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
            {['Paiement sécurisé Stripe', 'Aucun engagement', 'Résiliable à tout moment'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted }}>
                <Check size={13} style={{ color: '#22c55e' }} /> {t}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            Une question ? <a href="mailto:joboanalytics1@gmail.com" style={{ color: C.blue, textDecoration: 'none' }}>joboanalytics1@gmail.com</a>
          </p>
        </div>

      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
