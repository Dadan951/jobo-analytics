import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
// Note: après inscription réussie, l'utilisateur est redirigé vers /login?registered=true
import {
  Eye, EyeOff, Mail, Lock, BarChart2, Shield,
  Users, ArrowRight, X, CheckCircle2, Building2, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const C = {
  bg:     '#ffffff',
  surface:'#f8fafc',
  card:   '#ffffff',
  border: '#e2e8f0',
  blue:   '#1d4ed8',
  red:    '#dc2626',
  blueLo: 'rgba(29,78,216,0.08)',
  text:   '#0f172a',
  muted:  '#475569',
  subtle: '#94a3b8',
}

// ── Static data ───────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BarChart2, label: 'Analytics en temps réel',  sub: 'Suivez chaque interaction instantanément' },
  { icon: Users,     label: 'Multi-organisations',       sub: 'Plateforme dédiée à vos métiers'          },
  { icon: Shield,    label: 'Sécurisé & conforme RGPD', sub: 'Vos données protégées à tout moment'      },
]

const inputStyle = {
  width: '100%', padding: '11px 14px',
  borderRadius: 10, border: `1px solid ${C.border}`,
  backgroundColor: C.surface, color: C.text,
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

// ── Password strength ─────────────────────────────────────────────────────
function getStrength(pwd) {
  if (!pwd) return { level: 0, label: '', color: '' }
  if (pwd.length < 6)  return { level: 1, label: 'Trop court',  color: '#ef4444' }
  if (pwd.length < 8)  return { level: 2, label: 'Faible',      color: '#f97316' }
  if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
                       return { level: 3, label: 'Moyen',       color: '#eab308' }
  return               { level: 4, label: 'Fort',         color: '#22c55e' }
}

// ── Animated left panel ───────────────────────────────────────────────────
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
            Créez votre compte<br />
            <span style={{ color: '#fca5a5' }}>dès maintenant</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, lineHeight: 1.7, maxWidth: 360 }}>
            Commencez à visualiser chaque interaction
            de vos candidats en temps réel.
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

// ── Validated field wrapper ───────────────────────────────────────────────
function Field({ label, error, success, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: C.muted, marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{
          marginTop: 5, fontSize: 12, color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: 4,
          animation: 'auth-fadein 0.25s ease both',
        }}>
          <X size={12} />{error}
        </p>
      )}
      {!error && success && (
        <p style={{
          marginTop: 5, fontSize: 12, color: '#22c55e',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <CheckCircle2 size={12} />{success}
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [organizationName, setOrganizationName] = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [isVerrerie,   setIsVerrerie]   = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Détection filière via API (debounce 400ms)
  useEffect(() => {
    const name = organizationName.trim()
    if (name.length < 2) { setIsVerrerie(false); return }
    const timer = setTimeout(async () => {
      try {
        const data = await api.detectFiliere(name)
        setIsVerrerie(data.filiere === 'VERRERIE')
      } catch {
        setIsVerrerie(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [organizationName])

  const emailValid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailError   = email.length > 3 && !emailValid ? 'Adresse email invalide' : ''
  const strength     = getStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!organizationName.trim()) {
      setError("Le nom de l'organisme est requis")
      return
    }
    if (!emailValid) return
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(email, password, null, '', '', organizationName.trim())
      // Pas de token après inscription → l'utilisateur doit se connecter (2FA par email)
      navigate('/login?registered=true')
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
      <AuthLeft />

      {/* ── Right panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          animation: 'auth-slideup 0.7s 0.05s ease both',
        }}>

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
              Créer un compte
            </h2>
            <p style={{ fontSize: 16, color: C.muted }}>
              Rejoignez Jobo Analytics gratuitement. Aucune carte requise.
            </p>
          </div>

          {/* Global error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '11px 14px',
              borderRadius: 10, background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'auth-fadein 0.3s ease both',
            }}>
              <X size={14} style={{ flexShrink: 0 }} />{error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Nom de l'organisme */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
                Nom de l'organisme
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={15} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: C.subtle, pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                  placeholder="Ex : Verrerie du Nord, Saint-Gobain..."
                  value={organizationName}
                  onChange={e => { setOrganizationName(e.target.value); setError('') }}
                  autoComplete="organization"
                  onFocus={e => { e.target.style.borderColor = C.blue }}
                  onBlur={e => { e.target.style.borderColor = C.border }}
                  required
                />
              </div>
              {/* Badge détection automatique verrerie */}
              {isVerrerie && (
                <div style={{
                  marginTop: 8, padding: '6px 12px',
                  borderRadius: 8, fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#10b981',
                  animation: 'auth-fadein 0.3s ease both',
                }}>
                  <Sparkles size={13} />
                  Filière Verrerie détectée automatiquement ✓
                </div>
              )}
            </div>

            <Field
              label="Adresse email"
              error={emailError}
              success={email.length > 3 && emailValid ? 'Email valide' : ''}
            >
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: C.subtle, pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  onFocus={e => { e.target.style.borderColor = C.blue }}
                  onBlur={e => { e.target.style.borderColor = C.border }}
                  required
                />
              </div>
            </Field>

            {/* Password + strength */}
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: C.muted, marginBottom: 6,
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: C.subtle, pointerEvents: 'none',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingLeft: 38, paddingRight: 42 }}
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  autoComplete="new-password"
                  onFocus={e => { e.target.style.borderColor = C.blue }}
                  onBlur={e => { e.target.style.borderColor = C.border }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: C.subtle, padding: 2, display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        transition: 'background-color 0.3s',
                        backgroundColor: i <= strength.level ? strength.color : C.border,
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strength.color, fontWeight: 500 }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform  = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow  = '0 8px 24px rgba(79,70,229,0.55)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.4)'
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '13px 20px',
                borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                color: 'white', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
                opacity: loading ? 0.75 : 1,
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Création en cours…
                </>
              ) : (
                <>Créer mon compte <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, marginTop: 20 }}>
            Déjà un compte ?{' '}
            <Link
              to="/login"
              style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => { e.target.style.textDecoration = 'underline' }}
              onMouseLeave={e => { e.target.style.textDecoration = 'none' }}
            >
              Se connecter
            </Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: 12, color: C.subtle, marginTop: 12 }}>
            En créant un compte, vous acceptez notre{' '}
            <Link to="/rgpd" style={{ color: C.subtle, textDecoration: 'underline' }}>
              politique de confidentialité
            </Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
