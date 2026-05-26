import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import {
  Eye, EyeOff, Mail, Lock, BarChart2, Shield,
  Users, ArrowRight, X, Timer, CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const C = {
  bg:      '#ffffff',
  surface: '#f8fafc',
  card:    '#ffffff',
  border:  '#e2e8f0',
  blue:    '#1d4ed8',
  red:     '#dc2626',
  blueLo:  'rgba(29,78,216,0.08)',
  text:    '#0f172a',
  muted:   '#475569',
  subtle:  '#94a3b8',
}

const FEATURES = [
  { icon: BarChart2, label: 'Analytics en temps réel',     sub: 'Suivez chaque interaction instantanément' },
  { icon: Users,     label: 'Multi-organisations',          sub: 'Plateforme dédiée à vos métiers'          },
  { icon: Shield,    label: 'Sécurisé & conforme RGPD',    sub: 'Vos données protégées à tout moment'      },
]

function AuthLeft() {
  return (
    <div
      className="hidden lg:flex"
      style={{
        position: 'relative',
        flex: '0 0 52%',
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 55%, #dc2626 100%)',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '52px 48px',
      }}
    >
      {/* Orbs */}
      <div style={{
        position: 'absolute', width: 560, height: 560, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)',
        top: -160, left: -140, pointerEvents: 'none',
        animation: 'orb-float 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,78,216,0.10) 0%, transparent 65%)',
        bottom: -100, right: -80, pointerEvents: 'none',
        animation: 'orb-float 25s ease-in-out infinite reverse',
      }} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 400 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 52 }}>
          <img src="/logo.png" alt="Jobo Analytics" style={{ width: 96, height: 96, objectFit: 'contain', flexShrink: 0 }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#ffffff', letterSpacing: '-0.4px' }}>
            Jobo <span style={{ color: '#fca5a5' }}>Analytics</span>
          </span>
        </Link>

        {/* Headline */}
        <div style={{ marginBottom: 40, animation: 'auth-fadein 0.9s 0.1s ease both' }}>
          <h1 style={{ fontSize: 46, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-1px' }}>
            Prenez le contrôle<br />
            <span style={{ color: '#fca5a5' }}>de vos analytics</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, lineHeight: 1.7, maxWidth: 360 }}>
            La plateforme analytique pour visualiser
            chaque interaction en temps réel.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 44 }}>
          {FEATURES.map(({ icon: Icon, label, sub }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              animation: `auth-fadein 0.8s ${0.25 + i * 0.15}s ease both`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 700 }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          animation: 'auth-fadein 0.8s 0.8s ease both',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffffff', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Jobo Analytics</span>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ marginTop: 5, fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
          <X size={12} />{error}
        </p>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  borderRadius: 10, border: `1px solid ${C.border}`,
  backgroundColor: C.surface, color: C.text,
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

export default function LoginPage() {
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [error,           setError]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [step,            setStep]            = useState('credentials') // credentials | twofa | forgot-email | forgot-code | forgot-newpwd | forgot-done
  const [userId,          setUserId]          = useState(null)
  const [twoFACode,       setTwoFACode]       = useState('')
  const [countdown,       setCountdown]       = useState(600)
  const [expired,         setExpired]         = useState(false)
  const [resetEmail,      setResetEmail]      = useState('')
  const [resetCode,       setResetCode]       = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { login, verifyTwoFA } = useAuth()
  const navigate = useNavigate()

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailError = email.length > 3 && !emailValid ? 'Adresse email invalide' : ''

  useEffect(() => {
    if (step !== 'twofa') return
    setCountdown(600)
    setExpired(false)
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(id)
          setExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [step])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!emailValid) return
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      setUserId(data.userId)
      setStep('twofa')
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFA = async (e) => {
    e.preventDefault()
    if (twoFACode.length !== 6 || expired) return
    setError('')
    setLoading(true)
    try {
      const data = await verifyTwoFA(userId, twoFACode)
      if (data.user?.role === 'ADMIN') {
        navigate('/admin')
        return
      }
      // Vérifier si l'utilisateur a un abonnement actif
      // Si non → onboarding obligatoire (choix du plan)
      try {
        const sub = await api.getMySubscription()
        if (sub?.status === 'ACTIVE' && sub?.plan && sub.plan !== 'FREE') {
          navigate('/dashboard')
        } else {
          navigate('/onboarding')
        }
      } catch {
        navigate('/onboarding')
      }
    } catch (err) {
      setError(err.message || 'Code incorrect ou expiré')
      setTwoFACode('')
    } finally {
      setLoading(false)
    }
  }

  const countdownColor = countdown <= 30 ? '#ef4444' : countdown <= 60 ? '#f97316' : C.blue
  const countdownDisplay = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`

  // ── Mot de passe oublié — étape 1 : envoi du code ──
  const handleForgotEmail = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword({ email: resetEmail })
      setStep('forgot-code')
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi du code.")
    } finally {
      setLoading(false)
    }
  }

  // ── Mot de passe oublié — étape 2 : vérification du code ──
  const handleForgotCode = async (e) => {
    e.preventDefault()
    if (resetCode.length !== 6) return
    setStep('forgot-newpwd')
  }

  // ── Mot de passe oublié — étape 3 : nouveau mot de passe ──
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) { setError('Minimum 6 caractères.'); return }
    setError('')
    setLoading(true)
    try {
      await api.resetPassword({ email: resetEmail, code: resetCode, newPassword })
      setStep('forgot-done')
    } catch (err) {
      setError(err.message || 'Erreur lors de la réinitialisation.')
    } finally {
      setLoading(false)
    }
  }

  const resetForgot = () => {
    setStep('credentials')
    setResetEmail('')
    setResetCode('')
    setNewPassword('')
    setError('')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <AuthLeft />

      {/* Right panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', overflowY: 'auto', minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'auth-slideup 0.7s 0.05s ease both' }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <img src="/logo.png" alt="Jobo Analytics" style={{ width: 36, height: 36, objectFit: 'contain' }} />
              <span style={{ fontWeight: 800, fontSize: 18, color: C.text }}>
                Jobo <span style={{ color: C.blue }}>Analytics</span>
              </span>
            </Link>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.text, letterSpacing: '-0.5px', marginBottom: 8 }}>
              {step === 'twofa'        ? 'Code de vérification'
              : step === 'forgot-email' ? 'Mot de passe oublié'
              : step === 'forgot-code'  ? 'Code de vérification'
              : step === 'forgot-newpwd'? 'Nouveau mot de passe'
              : step === 'forgot-done'  ? 'Mot de passe réinitialisé'
              : 'Connexion'}
            </h2>
            <p style={{ fontSize: 16, color: C.muted }}>
              {step === 'twofa'         ? `Code envoyé à ${email}`
              : step === 'forgot-email' ? 'Entrez votre adresse email pour recevoir un code.'
              : step === 'forgot-code'  ? `Code envoyé à ${resetEmail}`
              : step === 'forgot-newpwd'? 'Choisissez votre nouveau mot de passe.'
              : step === 'forgot-done'  ? 'Vous pouvez vous reconnecter.'
              : 'Bienvenue sur Jobo Analytics.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '11px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <X size={14} style={{ flexShrink: 0 }} />{error}
            </div>
          )}

          {/* ── Étape : connexion (identifiants) ── */}
          {step === 'credentials' && (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Adresse email" error={emailError}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
                    <input
                      type="email"
                      style={{ ...inputStyle, paddingLeft: 38 }}
                      placeholder="vous@exemple.fr"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      autoComplete="email"
                      onFocus={e => { e.target.style.borderColor = C.blue }}
                      onBlur={e => { e.target.style.borderColor = C.border }}
                    />
                  </div>
                </Field>

                <Field label="Mot de passe">
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      style={{ ...inputStyle, paddingLeft: 38, paddingRight: 42 }}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      autoComplete="current-password"
                      onFocus={e => { e.target.style.borderColor = C.blue }}
                      onBlur={e => { e.target.style.borderColor = C.border }}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.subtle, padding: 2, display: 'flex' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Lien mot de passe oublié */}
                  <div style={{ textAlign: 'right', marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => { setResetEmail(email); setStep('forgot-email'); setError('') }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.blue, fontSize: 12, textDecoration: 'underline', padding: 0 }}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                    background: loading ? C.subtle : `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                    color: loading ? C.muted : '#ffffff',
                    fontSize: 15, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', marginTop: 4,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(59,130,246,0.4)` } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                >
                  {loading ? (
                    <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Connexion…</>
                  ) : (
                    <>Se connecter <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, marginTop: 24 }}>
                Pas encore de compte ?{' '}
                <Link to="/register" style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => { e.target.style.textDecoration = 'underline' }}
                  onMouseLeave={e => { e.target.style.textDecoration = 'none' }}
                >
                  Créer un compte
                </Link>
              </p>
            </>
          )}

          {/* ── Étape : vérification 2FA ── */}
          {step === 'twofa' && (
            <form onSubmit={handleTwoFA} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Countdown */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '20px', borderRadius: 14,
                backgroundColor: expired ? 'rgba(239,68,68,0.06)' : C.blueLo,
                border: `1px solid ${expired ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Timer size={16} color={expired ? '#ef4444' : countdownColor} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: expired ? '#ef4444' : C.muted, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {expired ? 'Code expiré' : 'Expire dans'}
                  </span>
                </div>
                <span style={{ fontSize: 40, fontWeight: 900, color: expired ? '#ef4444' : countdownColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {countdownDisplay}
                </span>
                {expired && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>
                    Le code a expiré. Revenez en arrière et reconnectez-vous.
                  </p>
                )}
              </div>

              <Field label="Code à 6 chiffres">
                <input
                  type="text"
                  placeholder="123456"
                  value={twoFACode}
                  onChange={e => { setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  autoFocus
                  disabled={expired}
                  style={{
                    ...inputStyle,
                    letterSpacing: '0.4em', textAlign: 'center', fontSize: 22, fontWeight: 700,
                    opacity: expired ? 0.5 : 1,
                  }}
                  onFocus={e => { if (!expired) e.target.style.borderColor = C.blue }}
                  onBlur={e => { e.target.style.borderColor = C.border }}
                />
              </Field>

              <button
                type="submit"
                disabled={loading || twoFACode.length !== 6 || expired}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                  background: (loading || twoFACode.length !== 6 || expired)
                    ? C.subtle
                    : `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                  color: (loading || twoFACode.length !== 6 || expired) ? C.muted : '#ffffff',
                  fontSize: 15, fontWeight: 700,
                  cursor: (loading || twoFACode.length !== 6 || expired) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!loading && twoFACode.length === 6 && !expired) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(59,130,246,0.4)` } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {loading ? (
                  <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Vérification…</>
                ) : (
                  <>Valider <ArrowRight size={16} /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(''); setTwoFACode('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, textAlign: 'center', textDecoration: 'underline', padding: 0 }}
              >
                Retour à la connexion
              </button>
            </form>
          )}

          {/* ── Étape : saisir l'email (mot de passe oublié) ── */}
          {step === 'forgot-email' && (
            <form onSubmit={handleForgotEmail} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Adresse email">
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
                  <input
                    type="email"
                    style={{ ...inputStyle, paddingLeft: 38 }}
                    placeholder="vous@exemple.fr"
                    value={resetEmail}
                    onChange={e => { setResetEmail(e.target.value); setError('') }}
                    autoComplete="email"
                    autoFocus
                    onFocus={e => { e.target.style.borderColor = C.blue }}
                    onBlur={e => { e.target.style.borderColor = C.border }}
                  />
                </div>
              </Field>

              <button
                type="submit"
                disabled={loading || resetEmail.length < 5}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                  background: (loading || resetEmail.length < 5) ? C.subtle : `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                  color: (loading || resetEmail.length < 5) ? C.muted : '#ffffff',
                  fontSize: 15, fontWeight: 700,
                  cursor: (loading || resetEmail.length < 5) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!loading && resetEmail.length >= 5) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(59,130,246,0.4)` } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {loading ? (
                  <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Envoi…</>
                ) : (
                  <>Envoyer le code <ArrowRight size={16} /></>
                )}
              </button>

              <button
                type="button"
                onClick={resetForgot}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, textAlign: 'center', textDecoration: 'underline', padding: 0 }}
              >
                Retour à la connexion
              </button>
            </form>
          )}

          {/* ── Étape : saisir le code reçu par email ── */}
          {step === 'forgot-code' && (
            <form onSubmit={handleForgotCode} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 16px', borderRadius: 12,
                backgroundColor: C.blueLo, border: `1px solid rgba(59,130,246,0.25)`,
              }}>
                <Mail size={15} color={C.blue} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.muted }}>
                  Code envoyé à <strong style={{ color: C.text }}>{resetEmail}</strong>
                </span>
              </div>

              <Field label="Code à 6 chiffres">
                <input
                  type="text"
                  placeholder="123456"
                  value={resetCode}
                  onChange={e => { setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  autoFocus
                  style={{
                    ...inputStyle,
                    letterSpacing: '0.4em', textAlign: 'center', fontSize: 22, fontWeight: 700,
                  }}
                  onFocus={e => { e.target.style.borderColor = C.blue }}
                  onBlur={e => { e.target.style.borderColor = C.border }}
                />
              </Field>

              <button
                type="submit"
                disabled={resetCode.length !== 6}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                  background: resetCode.length !== 6 ? C.subtle : `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                  color: resetCode.length !== 6 ? C.muted : '#ffffff',
                  fontSize: 15, fontWeight: 700,
                  cursor: resetCode.length !== 6 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (resetCode.length === 6) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(59,130,246,0.4)` } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                Vérifier le code <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => { setStep('forgot-email'); setResetCode(''); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, textAlign: 'center', textDecoration: 'underline', padding: 0 }}
              >
                Renvoyer un code
              </button>
            </form>
          )}

          {/* ── Étape : choisir le nouveau mot de passe ── */}
          {step === 'forgot-newpwd' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Nouveau mot de passe">
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingLeft: 38, paddingRight: 42 }}
                    placeholder="Minimum 6 caractères"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError('') }}
                    autoFocus
                    autoComplete="new-password"
                    onFocus={e => { e.target.style.borderColor = C.blue }}
                    onBlur={e => { e.target.style.borderColor = C.border }}
                  />
                  <button type="button" onClick={() => setShowNewPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.subtle, padding: 2, display: 'flex' }}>
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={loading || newPassword.length < 6}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                  background: (loading || newPassword.length < 6) ? C.subtle : `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                  color: (loading || newPassword.length < 6) ? C.muted : '#ffffff',
                  fontSize: 15, fontWeight: 700,
                  cursor: (loading || newPassword.length < 6) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!loading && newPassword.length >= 6) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(59,130,246,0.4)` } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {loading ? (
                  <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: C.bg, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Enregistrement…</>
                ) : (
                  <>Réinitialiser le mot de passe <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* ── Étape : succès ── */}
          {step === 'forgot-done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                backgroundColor: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={36} color="#22c55e" />
              </div>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
                Votre mot de passe a bien été réinitialisé. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button
                type="button"
                onClick={resetForgot}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                  background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                  color: '#ffffff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(59,130,246,0.4)` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                Retour à la connexion <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
