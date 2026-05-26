import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const C = {
  bg:      '#f8fafc',
  surface: '#ffffff',
  border:  '#e2e8f0',
  blue:    '#1d4ed8',
  text:    '#0f172a',
  muted:   '#475569',
}

const PLAN_LABELS = {
  TPE:                    'TPE & Indépendants',
  PME:                    'PME & Organismes de formation',
  GRAND_GROUPE:           'Grand groupe',
  ORGANISATION_PATRONALE: 'Organisation patronale',
}

export default function PricingSuccessPage() {
  const navigate         = useNavigate()
  const { user, loading } = useAuth()
  const [searchParams]   = useSearchParams()
  const sessionId        = searchParams.get('session_id')
  const from             = searchParams.get('from')           // 'onboarding' | 'profile'
  const redirectTo       = from === 'onboarding' ? '/dashboard' : '/profile?tab=abonnement'

  const [status,   setStatus]   = useState('verifying')  // verifying | confirmed | error
  const [planName, setPlanName] = useState('')
  const [attempt,  setAttempt]  = useState(0)

  const done = useRef(false)

  useEffect(() => {
    if (loading) return            // Attendre que l'auth soit chargée
    if (!user) { navigate('/login'); return }

    const run = async () => {
      // ── Étape 1 : vérification directe via session_id ──────────────────────
      if (sessionId) {
        for (let i = 0; i < 5; i++) {
          if (done.current) return
          try {
            setAttempt(i + 1)
            const data = await api.verifyCheckoutSession(sessionId)

            if (data?.status === 'ACTIVE' && data?.plan && data.plan !== 'FREE') {
              done.current = true
              setPlanName(PLAN_LABELS[data.plan] || data.plan)
              setStatus('confirmed')
              setTimeout(() => navigate(redirectTo), 2000)
              return
            }
          } catch (err) {
            console.warn('[PricingSuccess] verifyCheckoutSession échoué:', err?.message)
          }
          // Attendre avant de réessayer (Stripe a besoin d'un instant)
          await new Promise(r => setTimeout(r, 2000))
        }
      }

      // ── Étape 2 : fallback — interroger directement getMySubscription ──────
      for (let i = 0; i < 6; i++) {
        if (done.current) return
        try {
          const data = await api.getMySubscription()
          if (data?.status === 'ACTIVE' && data?.plan && data.plan !== 'FREE') {
            done.current = true
            setPlanName(PLAN_LABELS[data.plan] || data.plan)
            setStatus('confirmed')
            setTimeout(() => navigate(redirectTo), 2000)
            return
          }
        } catch {}
        await new Promise(r => setTimeout(r, 2000))
      }

      // ── Échec après ~22s : montrer un message d'erreur mais permettre de continuer
      setStatus('error')
    }

    run()
  }, [user, loading, sessionId])

  // Pendant le chargement de l'auth → spinner neutre (évite le flash de redirection)
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color={C.blue} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 440, textAlign: 'center',
        padding: '52px 40px', borderRadius: 24,
        backgroundColor: C.surface, border: `1px solid ${C.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 40 }}>
          <img src="/logo.png" alt="Jobo Analytics" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: 17, color: C.text }}>
            Jobo <span style={{ color: C.blue }}>Analytics</span>
          </span>
        </Link>

        {/* Icône */}
        {status === 'confirmed' ? (
          <CheckCircle2 size={64} color="#22c55e" style={{ margin: '0 auto 24px' }} />
        ) : status === 'error' ? (
          <AlertCircle size={64} color="#f59e0b" style={{ margin: '0 auto 24px' }} />
        ) : (
          <div style={{ margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={56} color={C.blue} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Titre */}
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 12 }}>
          {status === 'confirmed'
            ? 'Abonnement activé !'
            : status === 'error'
            ? 'Paiement reçu'
            : 'Activation en cours…'}
        </h1>

        {/* Message */}
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 32 }}>
          {status === 'confirmed' ? (
            <>
              Bienvenue dans la formule <strong style={{ color: C.text }}>{planName}</strong>.<br />
              Redirection dans quelques secondes…
            </>
          ) : status === 'error' ? (
            <>
              Votre paiement a bien été enregistré par Stripe.<br />
              La synchronisation peut prendre un moment.{' '}
              <strong>Cliquez sur le bouton ci-dessous</strong> pour accéder à votre espace.
            </>
          ) : (
            <>
              Nous confirmons votre paiement avec Stripe…<br />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Tentative {attempt} / 11</span>
            </>
          )}
        </p>

        {/* Barre de progression */}
        {status === 'verifying' && (
          <div style={{ width: '100%', height: 4, borderRadius: 4, backgroundColor: '#e2e8f0', overflow: 'hidden', marginBottom: 32 }}>
            <div style={{
              height: '100%', borderRadius: 4,
              background: `linear-gradient(90deg, ${C.blue}, #6366f1)`,
              animation: 'progress 22s linear forwards',
            }} />
          </div>
        )}

        {/* Bouton */}
        <Link
          to={redirectTo}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 12,
            background: `linear-gradient(135deg, ${C.blue}, #1845b0)`,
            color: '#ffffff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
          }}
        >
          {from === 'onboarding' ? 'Accéder à mon tableau de bord' : 'Voir mon abonnement'}
        </Link>
      </div>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  )
}
