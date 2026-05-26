import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/* ── Palette identique à la landing page ── */
const C = {
  bg:      '#060e1f',
  surface: '#0b1628',
  card:    '#0f1e35',
  border:  '#172843',
  blue:    '#3b82f6',
  red:     '#ef4444',
  blueLo:  'rgba(59,130,246,0.10)',
  text:    '#eef2ff',
  muted:   '#6b7fa3',
  subtle:  '#1e3054',
}

const CONTENT = {
  'mentions-legales': {
    title: 'Mentions légales',
    intro: "Informations légales relatives à la plateforme Jobo Analytics.",
    sections: [
      {
        heading: 'Éditeur',
        body: "Jobo Analytics est une plateforme analytique développée pour la filière Verrerie. Pour toute question, vous pouvez nous contacter à l'adresse : joboanalytics1@gmail.com",
      },
      {
        heading: 'Hébergement',
        body: "L'application est hébergée sur un serveur Node.js. La base de données est hébergée sur MongoDB Atlas, service cloud de MongoDB Inc., 1633 Broadway, 38th Floor, New York, NY 10019, États-Unis.",
      },
      {
        heading: 'Propriété intellectuelle',
        body: "Le code source, les visuels et le contenu de la plateforme sont la propriété de l'équipe du projet Jobo Analytics. Les photographies utilisées proviennent d'Unsplash et sont soumises à la licence Unsplash.",
      },
      {
        heading: 'Responsabilité',
        body: "Jobo Analytics est une plateforme fournie en l'état. L'équipe s'efforce de maintenir le service opérationnel mais ne peut garantir une disponibilité continue. Les données statistiques sont fournies à titre indicatif.",
      },
    ],
  },

  'rgpd': {
    title: 'Politique de confidentialité',
    intro: "Nous prenons la protection de vos données personnelles très au sérieux. Voici de façon claire et transparente ce que nous collectons, pourquoi, et ce que vous pouvez faire.",
    sections: [
      {
        heading: 'Responsable du traitement',
        body: "Jobo Analytics est une plateforme analytique dédiée à la filière Verrerie. Le responsable du traitement est l'équipe du projet. Contact : joboanalytics1@gmail.com",
      },
      {
        heading: 'Données collectées',
        body: "Nous collectons uniquement ce qui est nécessaire au fonctionnement de la plateforme : votre adresse email (utilisée pour vous connecter et vous envoyer le code de vérification), votre mot de passe (stocké de façon chiffrée et irréversible — personne ne peut le lire, même nous), votre filière d'appartenance, et vos actions sur la plateforme (vues de fiches métier, likes, candidatures) pour produire les statistiques de la filière.",
      },
      {
        heading: 'Pourquoi ces données sont collectées',
        body: "Votre email sert à vous authentifier et à vous envoyer un code de vérification à 6 chiffres à chaque connexion (valable 10 minutes). Vos interactions sur les fiches métier (vues, likes, candidatures) alimentent les tableaux de bord statistiques de la filière Verrerie. Ces données sont comptabilisées de façon agrégée. Aucune donnée n'est utilisée à des fins commerciales ou publicitaires.",
      },
      {
        heading: 'Sécurité',
        body: "Vos mots de passe sont chiffrés avec bcrypt (algorithme de hachage à sens unique). Les sessions sont gérées via des tokens JWT à durée limitée (1 heure). Chaque connexion est protégée par une vérification en deux étapes envoyée sur votre email. Les données sont hébergées sur MongoDB Atlas avec chiffrement au repos.",
      },
      {
        heading: 'Durée de conservation',
        body: "Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression complète de votre compte à tout moment en écrivant à joboanalytics1@gmail.com. La suppression sera effective sous 7 jours.",
      },
      {
        heading: 'Vos droits (RGPD)',
        body: "Conformément au Règlement Général sur la Protection des Données (RGPD, UE 2016/679), vous disposez des droits suivants : accès à vos données, rectification, effacement (« droit à l'oubli »), limitation du traitement, portabilité, opposition. Pour exercer l'un de ces droits, écrivez-nous à : joboanalytics1@gmail.com",
      },
      {
        heading: 'Cookies et stockage local',
        body: "Jobo Analytics n'utilise aucun cookie de suivi ni publicitaire. Le token d'authentification JWT est stocké dans le localStorage de votre navigateur pour maintenir votre session. Il expire automatiquement après 1 heure. Aucune donnée n'est transmise à des tiers.",
      },
    ],
  },
}

export default function LegalPage() {
  const location = useLocation()
  const page = location.pathname.replace(/^\//, '')
  const content = CONTENT[page]

  if (!content) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: C.muted, marginBottom: 16 }}>Page introuvable.</p>
          <Link to="/" style={{ padding: '10px 24px', borderRadius: 10, background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)`, color: '#ffffff', textDecoration: 'none', fontWeight: 700 }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(8,8,14,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="Jobo Analytics" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>
              Jobo <span style={{ color: C.blue }}>Analytics</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: 'none', border: `1px solid ${C.border}`, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.subtle }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}
            >Connexion</Link>
            <Link to="/register" style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#ffffff', textDecoration: 'none', background: `linear-gradient(135deg, ${C.blue}, #1d4ed8)` }}>
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '56px 28px 96px' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 40, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.text}
          onMouseLeave={e => e.currentTarget.style.color = C.muted}
        >
          <ArrowLeft size={14} /> Retour à l'accueil
        </Link>

        {/* Titre */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 999, marginBottom: 16,
            backgroundColor: C.blueLo, border: `1px solid rgba(59,130,246,0.25)`,
            color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase',
          }}>Filière Verrerie</span>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, color: C.text, letterSpacing: '-1px', marginBottom: 12 }}>
            {content.title}
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 560 }}>{content.intro}</p>
          <p style={{ fontSize: 12, color: C.subtle, marginTop: 12 }}>Dernière mise à jour : avril 2026</p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {content.sections.map((section, i) => (
            <div key={i} style={{
              padding: '24px 26px',
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              marginBottom: 8,
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  backgroundColor: C.blueLo, border: `1px solid rgba(59,130,246,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: C.blue,
                }}>{i + 1}</span>
                {section.heading}
              </h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, paddingLeft: 34 }}>{section.body}</p>
            </div>
          ))}
        </div>

      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '28px', backgroundColor: C.surface }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, fontSize: 12, color: C.muted }}>
          <p>© 2026 Jobo Analytics — Filière Verrerie</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['Mentions légales', '/mentions-legales'], ['RGPD', '/rgpd']].map(([l, h]) => (
              <Link key={l} to={h} style={{ color: C.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.text}
                onMouseLeave={e => e.currentTarget.style.color = C.muted}
              >{l}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
