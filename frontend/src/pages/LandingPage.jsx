import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X, Eye, Heart, Users, BarChart2, Layout, FileText, Mail, Copy, Check, Clock, Shield, ChevronLeft, ChevronRight, Zap, Building2, Star } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
// DD
/* ─── Palette bleu blanc rouge ────────────────────────────── */
const C = {
  bg:      '#ffffff',
  surface: '#f8fafc',
  card:    '#ffffff',
  border:  '#e2e8f0',
  blue:    '#1d4ed8',
  red:     '#dc2626',
  blueLo:  'rgba(29,78,216,0.08)',
  blueMd:  'rgba(29,78,216,0.15)',
  text:    '#0f172a',
  muted:   '#475569',
  faint:   '#cbd5e1',
}

/* ─── Nav links ───────────────────────────────────────────── */
const NAV = [
  { label: 'Accueil',        href: '#accueil'  },
  { label: 'Fonctionnalités',href: '#suivi'    },
  { label: 'Tarifs',         href: '/pricing'  },
  { label: 'Contact',        href: '#contact'  },
]

/* ─── 3 étapes simples ─────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Les utilisateurs découvrent les métiers',
    desc:  'Les utilisateurs s\'inscrivent aux formations et postulent aux offres d\'emploi.',
    img:   '/step2.jpg',
  },
  {
    num: '02',
    title: 'Chaque interaction est enregistrée',
    desc:  'Dès qu\'ils regardent une vidéo, consultent une fiche métier ou une offre d\'emploi, l\'interaction est enregistrée automatiquement.',
    img:   '/step1.png',
  },
  {
    num: '03',
    title: 'Vous visualisez tout en un coup d\'œil',
    desc:  'Un tableau de bord clair vous montrant quelles informations les intéressent le plus.',
    img:   '/step3.png',
  },
]

/* ─── Fonctionnalités (labels statiques, valeurs injectées dans le composant) ── */
const FEATURES_CFG = [
  { icon: Eye,      label: 'Vues',        desc: 'Nombre total de consultations des fiches métier.',  statKey: 'views'      },
  { icon: Heart,    label: 'Likes',        desc: 'Nombre total de likes sur les fiches métier.',      statKey: 'likes'      },
  { icon: Users,    label: 'Candidatures', desc: 'Nombre total de utilisateurs ayant postulé.',          statKey: 'applicants' },
  { icon: BarChart2,label: 'Tendances',    desc: 'Évolution de l\'intérêt pour chaque métier.',       statKey: null         },
  { icon: Layout,   label: 'Dashboard',    desc: 'Dashboard personnalisable selon vos besoins de recrutement.',statKey: null         },
  { icon: FileText, label: 'Export PDF',   desc: 'Téléchargez un rapport complet en un clic.',        statKey: null         },
]

/* ─── Photos métiers (photos statiques, données réelles via API) ── */
const METIERS_PHOTOS = [
  'https://images.unsplash.com/photo-1773125465958-4b83adc60498?w=800&q=85&fit=crop',
  'https://www.usinenouvelle.com/resizer/v2/PQHQSZAZOBLDDNQ3VKBVGGMDFQ.jpg?smart=true&auth=e21656e7e8644c43f41776e7c23b78a9f1fdc8747fb80c597d7b6690fe5b38a5&width=732&height=488',
  'https://image.jimcdn.com/app/cms/image/transf/dimension=455x10000:format=jpg/path/s2719bf5004ecf450/image/iacddf1086c1aade4/version/1603929815/image.jpg',
]

const METIERS_NOMS = ['Souffleur de verre', 'Flaconneur', 'Fileur']

/* ─── Helpers ─────────────────────────────────────────────── */
const Badge = ({ children }) => (
  <span style={{
    display: 'inline-block', padding: '5px 16px', borderRadius: 999,
    backgroundColor: C.blueLo, border: `1px solid rgba(59,130,246,0.28)`,
    color: C.blue, fontSize: 11, fontWeight: 700,
    letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 20,
  }}>{children}</span>
)

const H2 = ({ children, style }) => (
  <h2 style={{
    fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900,
    color: C.text, letterSpacing: '-1.5px', lineHeight: 1.1,
    marginBottom: 16, ...style,
  }}>{children}</h2>
)

const Lead = ({ children }) => (
  <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.8, maxWidth: 500, margin: '0 auto' }}>{children}</p>
)

const BtnPrimary = ({ to, children }) => (
  <Link to={to} style={{
    display: 'inline-flex', alignItems: 'center', gap: 9,
    padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800,
    color: '#ffffff', textDecoration: 'none',
    background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`,
    boxShadow: '0 4px 24px rgba(59,130,246,0.35)',
    transition: 'all 0.2s',
  }}
  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(59,130,246,0.5)' }}
  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(59,130,246,0.35)' }}
  >{children}</Link>
)

const BtnGhost = ({ to, href, children }) => {
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '13px 26px', borderRadius: 12, fontSize: 15, fontWeight: 600,
    color: C.muted, textDecoration: 'none',
    border: `1px solid ${C.border}`, transition: 'all 0.2s',
  }
  const hover = e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.faint }
  const leave = e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }
  return to
    ? <Link to={to} style={style} onMouseEnter={hover} onMouseLeave={leave}>{children}</Link>
    : <a href={href} style={style} onMouseEnter={hover} onMouseLeave={leave}>{children}</a>
}

/* ══ Plans tarifs (4 vrais plans avec Stripe) ══════════════ */
const LANDING_PLANS = [
  { id: 'TPE',                   name: 'TPE & Indépendants',            price: '19,99 €', period: '/ mois', description: "Pour les auto-entrepreneurs et très petites entreprises", icon: Shield,    color: '#475569', highlight: false, ctaVariant: 'outline' },
  { id: 'PME',                   name: 'PME & Organismes de formation', price: '29,99 €', period: '/ mois', description: "Pour les PME, PMI et organismes de formation",            icon: Zap,       color: '#1d4ed8', highlight: true,  badge: 'Recommandé', ctaVariant: 'primary' },
  { id: 'GRAND_GROUPE',          name: 'Grand groupe',                  price: '99,99 €', period: '/ mois', description: "Pour les grandes entreprises et groupes",                 icon: Building2, color: '#dc2626', highlight: false, ctaVariant: 'red' },
  { id: 'ORGANISATION_PATRONALE',name: 'Organisation patronale',        price: '199,99 €',period: '/ mois', description: "Pour les organisations patronales et fédérations",        icon: Star,      color: '#9333ea', highlight: false, ctaVariant: 'purple' },
]

function LandingPricingSection() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      api.getMySubscription()
        .then(d => setSubscription(d))
        .catch(() => setSubscription({ plan: 'FREE', status: 'NONE' }))
    }
  }, [user])

  const currentPlan = subscription?.plan || 'FREE'

  const handleChoose = async (planId) => {
    if (!user) { navigate('/register'); return }
    if (planId === currentPlan) return
    setError('')
    setLoadingPlan(planId)
    try {
      const { url } = await api.createCheckoutSession(planId)
      window.location.href = url
    } catch (err) {
      setError(err.message || 'Erreur lors de la redirection')
      setLoadingPlan(null)
    }
  }

  return (
    <section id="tarifs" style={{ padding: '96px 28px', backgroundColor: C.surface }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 999, marginBottom: 16, backgroundColor: C.blueLo, border: '1px solid rgba(29,78,216,0.2)', color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>Tarifs</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: C.text, letterSpacing: '-1px', marginBottom: 12 }}>Une formule pour chaque besoin</h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: '0 auto' }}>Un tarif adapté à la taille de votre entreprise. Aucun engagement.</p>
        </div>

        {error && (
          <div style={{ maxWidth: 480, margin: '0 auto 28px', padding: '12px 16px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', fontSize: 13 }}>{error}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 24, marginBottom: 40 }}>
          {LANDING_PLANS.map(plan => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.id
            const isLoading = loadingPlan === plan.id
            return (
              <div key={plan.id} style={{ position: 'relative', padding: '32px 28px', borderRadius: 20, backgroundColor: plan.highlight ? 'rgba(29,78,216,0.04)' : C.card, border: `1px solid ${plan.highlight ? 'rgba(29,78,216,0.35)' : isCurrent ? 'rgba(34,197,94,0.4)' : C.border}`, boxShadow: plan.highlight ? '0 0 40px rgba(29,78,216,0.08)' : '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 999, background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <Star size={10} fill="#fff" /> {plan.badge}
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -14, right: 16, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#16a34a', fontSize: 11, fontWeight: 700 }}>Votre plan</div>
                )}
                <div style={{ width: 46, height: 46, borderRadius: 13, marginBottom: 18, backgroundColor: plan.ctaVariant === 'purple' ? 'rgba(147,51,234,0.08)' : plan.ctaVariant === 'red' ? 'rgba(220,38,38,0.08)' : 'rgba(29,78,216,0.08)', border: `1px solid ${plan.ctaVariant === 'purple' ? 'rgba(147,51,234,0.2)' : plan.ctaVariant === 'red' ? 'rgba(220,38,38,0.2)' : 'rgba(29,78,216,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={21} color={plan.color} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 0, lineHeight: 1.5 }}>{plan.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '18px 0 22px', marginTop: 'auto' }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: plan.color, letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{plan.period}</span>
                </div>
                <button onClick={() => handleChoose(plan.id)} disabled={isCurrent || isLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 18px', borderRadius: 11, border: 'none', fontSize: 14, fontWeight: 700, cursor: isCurrent ? 'default' : isLoading ? 'wait' : 'pointer', transition: 'opacity 0.2s', ...(isCurrent ? { background: 'rgba(34,197,94,0.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' } : plan.ctaVariant === 'primary' ? { background: 'linear-gradient(135deg,#1d4ed8,#1e40af)', color: '#fff' } : plan.ctaVariant === 'red' ? { background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff' } : plan.ctaVariant === 'purple' ? { background: 'linear-gradient(135deg,#9333ea,#7c3aed)', color: '#fff' } : { background: 'rgba(29,78,216,0.08)', color: '#1d4ed8', border: '1px solid rgba(29,78,216,0.25)' }) }}
                  onMouseEnter={e => { if (!isCurrent && !isLoading) e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  {isLoading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Redirection…</> : isCurrent ? <><Check size={14} /> Plan actuel</> : <>Choisir ce plan <ArrowRight size={14} /></>}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: C.muted }}>
          Paiement sécurisé via <strong style={{ color: C.text }}>Stripe</strong>. Résiliable à tout moment.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [open,       setOpen]      = useState(false)
  const [scrolled,   setScrolled]  = useState(false)
  const [isMobile,   setIsMobile]  = useState(window.innerWidth < 768)
  const [stats,      setStats]     = useState({ count: 0, views: 0, likes: 0, applicants: 0, interactions: 0 })
  const [metiers,    setMetiers]   = useState([])
  const [copied,     setCopied]    = useState(false)
  const [featureIdx, setFeatureIdx] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)

  const prevFeature = () => setFeatureIdx(i => (i - 1 + FEATURES_CFG.length) % FEATURES_CFG.length)
  const nextFeature = () => setFeatureIdx(i => (i + 1) % FEATURES_CFG.length)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('joboanalytics1@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  useEffect(() => {
    api.getJobsSummary().then(data => {
      const totals = data.totals || {}
      setStats({
        count:        data.count ?? 0,
        views:        totals.views ?? 0,
        likes:        totals.likes ?? 0,
        applicants:   totals.applicants ?? 0,
        interactions: (totals.views ?? 0) + (totals.likes ?? 0) + (totals.applicants ?? 0),
      })
      // Top 4 métiers par vues pour la galerie
      const sorted = [...(data.jobs || [])].sort((a, b) => (b.views || 0) - (a.views || 0))
      setMetiers(sorted.slice(0, 4))
    }).catch(() => {})

    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })

    const rz = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', rz, { passive: true })

    return () => {
      window.removeEventListener('scroll', fn)
      window.removeEventListener('resize', rz)
    }
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target) } }),
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ backgroundColor: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ══════════ NAVBAR ══════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        transition: 'all 0.35s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="Jobo Analytics" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
            <span style={{ fontWeight: 800, fontSize: 16, color: C.text, letterSpacing: '-0.3px' }}>
              Jobo <span style={{ color: C.blue }}>Analytics</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: isMobile ? 'none' : 'flex', gap: 2 }}>
            {NAV.map(({ label, href }) => {
              const navStyle = {
                padding: '7px 15px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: C.muted, textDecoration: 'none', transition: 'all 0.15s',
              }
              const onEnter = e => { e.currentTarget.style.color = C.blue; e.currentTarget.style.background = C.blueLo }
              const onLeave = e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent' }
              return href.startsWith('/')
                ? <Link key={label} to={href} style={navStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{label}</Link>
                : <a key={label} href={href} style={navStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>{label}</a>
            })}
          </nav>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isMobile && <BtnGhost to="/login">Connexion</BtnGhost>}
            {!isMobile && <BtnPrimary to="/register">S'inscrire</BtnPrimary>}
            {isMobile && <button onClick={() => setOpen(o => !o)} style={{
              width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent',
              color: C.muted, cursor: 'pointer',
            }}>
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>}
          </div>
        </div>

        {open && (
          <div style={{ background: '#ffffff', borderTop: `1px solid ${C.border}`, padding: '14px 28px 22px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
            {NAV.map(({ label, href }) => {
              const s = { display: 'block', padding: '13px 0', fontSize: 15, fontWeight: 500, color: C.text, textDecoration: 'none', borderBottom: `1px solid ${C.border}` }
              return href.startsWith('/')
                ? <Link key={label} to={href} onClick={() => setOpen(false)} style={s}>{label}</Link>
                : <a key={label} href={href} onClick={() => setOpen(false)} style={s}>{label}</a>
            })}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Link to="/login"    style={{ flex: 1, textAlign: 'center', padding: 11, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.text, textDecoration: 'none', border: `1px solid ${C.border}` }}>Connexion</Link>
              <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: 11, borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#ffffff', textDecoration: 'none', background: `linear-gradient(135deg,#3b82f6,#1d4ed8)` }}>S'inscrire</Link>
            </div>
          </div>
        )}
      </header>

      {/* ══════════ HERO ══════════ */}
      <section id="accueil" style={{ padding: '110px 28px 90px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Glow */}
        <div style={{ position:'absolute', top:'0', left:'50%', transform:'translateX(-50%)', width:900, height:500, background:'radial-gradient(ellipse at center top, rgba(29,78,216,0.05) 0%, transparent 65%)', pointerEvents:'none' }} />

        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
          <div>
            {/* Logo au-dessus de l'intro */}
            <img
              src="/logo.png"
              alt="Jobo Analytics"
              style={{ width: 260, height: 260, objectFit: 'contain', display: 'block', margin: '0 auto 28px' }}
            />

            <h1 style={{
              fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: 900,
              lineHeight: 1.0, letterSpacing: '-3.5px',
              color: C.text, marginBottom: 28,
            }}>
              Savoir quels métiers<br />
              <span style={{
                background: 'linear-gradient(120deg, #1d4ed8 0%, #dc2626 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>passionnent vos utilisateurs</span>
            </h1>

            <p style={{ fontSize: 19, color: C.muted, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 44px' }}>
              Jobo Analytics vous montre, en un coup d'œil, quelles fiches métier sont les plus consultées, les plus appréciées et les plus demandées.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ COMMENT ÇA MARCHE ══════════ */}
      <section style={{ padding: '96px 28px', backgroundColor: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 72 }}>
            <Badge>Comment ça marche</Badge>
            <H2>En 3 étapes, tout est clair</H2>
            <Lead>En 3 étapes, vous comprenez tout ce que font vos utilisateurs sur la plateforme.</Lead>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
            {STEPS.map(({ num, title, desc, img }, i) => (
              <div key={num} data-reveal="up" style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
                direction: i % 2 === 1 ? 'rtl' : 'ltr',
              }}>
                {/* Texte */}
                <div style={{ direction: 'ltr' }}>
                  <div style={{
                    fontSize: 72, fontWeight: 900, letterSpacing: '-4px',
                    color: C.border, lineHeight: 1, marginBottom: 16,
                  }}>{num}</div>
                  <h3 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-0.8px', marginBottom: 16, lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8 }}>{desc}</p>
                </div>
                {/* Image */}
                <div style={{ direction: 'ltr', borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}`, aspectRatio: '16/10' }}>
                  <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ GALERIE MÉTIERS ══════════ */}

      {/* ══════════ FONCTIONNALITÉS ══════════ */}
      <section id="suivi" style={{ padding: '96px 28px', backgroundColor: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 60 }}>
            <Badge>Fonctionnalités</Badge>
            <H2>Visualisez les fréquentations utiles à vos recrutements en temps réel</H2>
          </div>

          {/* ── Carousel ── */}
          <div style={{ position: 'relative', userSelect: 'none' }}>

            {/* Flèche gauche */}
            <button onClick={prevFeature} style={{
              position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: 44, height: 44, borderRadius: '50%',
              backgroundColor: C.card, border: `1px solid ${C.border}`,
              color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.blueLo; e.currentTarget.style.borderColor = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.card; e.currentTarget.style.borderColor = C.border }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Flèche droite */}
            <button onClick={nextFeature} style={{
              position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: 44, height: 44, borderRadius: '50%',
              backgroundColor: C.card, border: `1px solid ${C.border}`,
              color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.blueLo; e.currentTarget.style.borderColor = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.card; e.currentTarget.style.borderColor = C.border }}
            >
              <ChevronRight size={20} />
            </button>

            {/* Carte active */}
            {(() => {
              const { icon: Icon, label, desc, statKey } = FEATURES_CFG[featureIdx]
              const val = statKey ? stats[statKey] : null
              return (
                <div
                  key={featureIdx}
                  onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
                  onTouchEnd={e => {
                    if (touchStartX === null) return
                    const diff = touchStartX - e.changedTouches[0].clientX
                    if (Math.abs(diff) > 40) diff > 0 ? nextFeature() : prevFeature()
                    setTouchStartX(null)
                  }}
                  style={{
                    maxWidth: 560, margin: '0 auto',
                    padding: '52px 48px', borderRadius: 24,
                    backgroundColor: C.card,
                    border: `1px solid rgba(59,130,246,0.25)`,
                    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                    textAlign: 'center',
                    animation: 'fadeSlide 0.3s ease',
                  }}
                >
                  <div style={{
                    width: 80, height: 80, borderRadius: 20, margin: '0 auto 28px',
                    background: `linear-gradient(135deg, ${C.blueLo}, rgba(59,130,246,0.18))`,
                    border: `1px solid rgba(59,130,246,0.35)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(59,130,246,0.18)',
                  }}>
                    <Icon size={36} color={C.blue} strokeWidth={1.6} />
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 12, letterSpacing: '-0.5px' }}>{label}</h3>
                  {val > 0 && (
                    <p style={{ fontSize: 42, fontWeight: 900, color: C.blue, letterSpacing: '-1.5px', margin: '0 0 10px' }}>
                      {val.toLocaleString('fr-FR')}
                    </p>
                  )}
                  <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, maxWidth: 380, margin: '0 auto' }}>{desc}</p>
                </div>
              )
            })()}

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {FEATURES_CFG.map((_, i) => (
                <button key={i} onClick={() => setFeatureIdx(i)} style={{
                  width: i === featureIdx ? 28 : 8, height: 8,
                  borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
                  backgroundColor: i === featureIdx ? C.blue : C.border,
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>

          <style>{`@keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      </section>


      {/* ══════════ TARIFS ══════════ */}
      <LandingPricingSection />

      {/* ══════════ CONTACT ══════════ */}
      <section id="contact" style={{ padding: '96px 28px', backgroundColor: C.bg, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse at center bottom, rgba(59,130,246,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative' }}>
          <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 52 }}>
            <Badge>Contact</Badge>
            <H2>Une question ? On vous répond.</H2>
            <Lead>L'équipe Jobo Analytics est disponible pour toute question sur la plateforme ou les fiches métier.</Lead>
          </div>

          {/* Email card principal */}
          <div data-reveal="up" style={{
            marginBottom: 20,
            padding: '28px 24px',
            borderRadius: 20,
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mail size={22} color="#08080e" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Adresse email</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: '-0.3px', wordBreak: 'break-all' }}>joboanalytics1@gmail.com</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={handleCopyEmail}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : C.border}`,
                  backgroundColor: copied ? 'rgba(34,197,94,0.08)' : C.card,
                  color: copied ? '#22c55e' : C.muted,
                  fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!copied) { e.currentTarget.style.borderColor = C.subtle; e.currentTarget.style.color = C.text } }}
                onMouseLeave={e => { if (!copied) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted } }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copié !' : 'Copier'}
              </button>

              <a
                href="mailto:joboanalytics1@gmail.com"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 10, textDecoration: 'none',
                  background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`,
                  color: '#08080e', fontSize: 14, fontWeight: 700,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <Mail size={15} /> Envoyer un email
              </a>
            </div>
          </div>

          {/* 3 info cards */}
          <div data-reveal="up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {[
              { icon: Clock,  title: 'Réponse rapide',       desc: 'Nous répondons à vos emails sous 48h ouvrées.' },
              { icon: Shield, title: 'Données sécurisées',    desc: 'Toutes vos données sont protégées et confidentielles.' },
              { icon: Users,  title: 'Support dédié', desc: 'Une équipe dédiée à votre filière et à vos besoins.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                padding: '24px 22px', borderRadius: 14,
                backgroundColor: C.card, border: `1px solid ${C.border}`,
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = '' }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, marginBottom: 14,
                  backgroundColor: C.blueLo, border: `1px solid rgba(59,130,246,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color={C.blue} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '56px 28px 32px', backgroundColor: C.surface }} id="footer">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                <img src="/logo.png" alt="Jobo Analytics" style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }} />
                <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>Jobo <span style={{ color: C.blue }}>Analytics</span></span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
                Tableau de bord analytique.
              </p>
            </div>

            <FooterCol title="Navigation" items={[
              { label: 'Tarifs',      href: '/pricing' },
              { label: 'S\'inscrire', href: '/register' },
              { label: 'Se connecter', href: '/login' },
            ]} />

            <FooterCol title="Légal" items={[
              { label: 'Mentions légales', href: '/mentions-legales' },
              { label: 'Politique RGPD', href: '/rgpd' },
            ]} />

            <div>
              <h4 style={{ color: C.text, fontWeight: 700, fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 18 }}>Contact</h4>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.9 }}>
                joboanalytics1@gmail.com
              </p>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14, fontSize: 12, color: C.muted }}>
            <p>© 2026 Jobo Analytics</p>
            <div style={{ display: 'flex', gap: 22 }}>
              {[['Mentions légales', '/mentions-legales'], ['RGPD', '/rgpd']].map(([l, h]) => (
                <Link key={l} to={h} style={{ color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = C.text}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}
                >{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

/* ── Overlay carte métier ─────────────────────────────────── */
function MetierOverlay({ label, vues, likes, big }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: big ? '28px 20px 20px' : '20px 16px 14px',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.78))',
      borderRadius: '0 0 18px 18px',
    }}>
      <div style={{ fontSize: big ? 15 : 13, fontWeight: 700, color: '#fff', marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Eye size={11} /> {vues} vues
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Heart size={11} /> {likes} likes
        </span>
      </div>
    </div>
  )
}

/* ── Footer column ────────────────────────────────────────── */
function FooterCol({ title, items }) {
  return (
    <div>
      <h4 style={{ color: C.text, fontWeight: 700, fontSize: 11, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 18 }}>{title}</h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map(({ label, href, anchor }) => (
          <li key={label}>
            {anchor
              ? <a href={href} style={{ color: C.muted, textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color = C.text} onMouseLeave={e => e.target.style.color = C.muted}>{label}</a>
              : <Link to={href} style={{ color: C.muted, textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = C.text} onMouseLeave={e => e.currentTarget.style.color = C.muted}>{label}</Link>
            }
          </li>
        ))}
      </ul>
    </div>
  )
}
