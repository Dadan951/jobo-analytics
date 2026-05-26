/**
 * Logo JA — Jobo Analytics
 * Composant SVG inline reproduisant le logo officiel (J bleu + A rouge + bande blanche + ligne analytics)
 */
export function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
      aria-label="Jobo Analytics"
    >
      {/* ── J (bleu marine) ──────────────────────────────────── */}
      {/* Barre du haut + corps vertical + crochet bas-droite   */}
      <path
        d="M6 8 L46 8 L46 20 L22 20
           L22 72 Q22 87 34 87
           Q47 87 49 76
           L49 70 L43 70
           Q43 81 34 81
           Q28 81 28 73
           L28 20 L6 20 Z"
        fill="#1e3a8a"
      />

      {/* ── A (rouge) ────────────────────────────────────────── */}
      {/* Jambe gauche */}
      <path d="M52 8 L32 90 L42 90 L52 20 Z" fill="#dc2626" />
      {/* Jambe droite */}
      <path d="M52 8 L52 20 L66 90 L76 90 Z" fill="#dc2626" />
      {/* Barre transversale du A */}
      <rect x="38" y="57" width="28" height="10" rx="1" fill="#dc2626" />

      {/* ── Bande blanche centrale (tricolore / chevauchement) ─ */}
      <rect x="33" y="8" width="19" height="82" fill="white" />

      {/* ── Barres graphique dans la zone blanche (subtiles) ─── */}
      <rect x="35" y="56" width="4" height="24" rx="1" fill="#dde6f0" />
      <rect x="42" y="44" width="4" height="36" rx="1" fill="#dde6f0" />

      {/* ── Ligne tendance analytics ─────────────────────────── */}
      <line
        x1="17" y1="78"
        x2="76" y2="23"
        stroke="#3b82f6"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Nœud bas : anneau + centre */}
      <circle cx="17" cy="78" r="5.5" fill="white" stroke="#3b82f6" strokeWidth="2.6" />
      <circle cx="17" cy="78" r="1.8" fill="#3b82f6" />

      {/* Nœud haut : disque plein */}
      <circle cx="76" cy="23" r="6" fill="#3b82f6" />
    </svg>
  )
}
