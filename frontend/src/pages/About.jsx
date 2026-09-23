import Badge from '../components/ui/Badge.jsx';

// Carte d'accès factice : ville la plus proche -> poste de contrôle -> le parc.
// Fiabilité non garantie au-delà du poste de contrôle (voir légende).
function AccessMap() {
  return (
    <div className="clip-corner border border-border bg-bg-elevated/60 p-4">
      <p className="mb-3 font-heading text-xs uppercase tracking-[.08em] text-text-muted">
        Plan d’accès <span className="text-accent-2">(fiable à ~60&nbsp;%)</span>
      </p>
      <svg viewBox="0 0 640 200" className="h-auto w-full" role="img" aria-label="Carte d'accès au parc Nightfall : de la dernière ville connue au parc, via le poste de contrôle de la zone interdite">
        <g className="stroke-border" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 80} y1="0" x2={i * 80} y2="200" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="640" y2={i * 40} />
          ))}
        </g>

        <rect x="380" y="0" width="260" height="200" className="fill-accent/10" />
        <text x="510" y="20" textAnchor="middle" className="fill-accent font-heading text-[10px] uppercase tracking-[.1em]">Zone interdite</text>

        <line x1="60" y1="120" x2="580" y2="120" className="stroke-accent-2/60" strokeWidth="3" strokeDasharray="10 8" />

        <circle cx="60" cy="120" r="7" className="fill-text-muted" />
        <text x="60" y="150" textAnchor="middle" className="fill-text font-heading text-[11px] uppercase">Dernière ville</text>

        <circle cx="320" cy="120" r="7" className="fill-accent" />
        <text x="320" y="150" textAnchor="middle" className="fill-text font-heading text-[11px] uppercase">Poste de contrôle</text>
        <text x="320" y="98" textAnchor="middle" className="fill-accent-2 font-heading text-[10px] uppercase">Sortie 13</text>

        <circle cx="580" cy="120" r="9" className="fill-accent" style={{ filter: 'drop-shadow(0 0 6px var(--color-accent))' }} />
        <text x="580" y="150" textAnchor="middle" className="fill-accent font-heading text-[12px] font-bold uppercase">Nightfall</text>
        <text x="580" y="98" textAnchor="middle" className="fill-text-muted font-heading text-[10px] uppercase">Vous voilà</text>

        <text x="450" y="182" textAnchor="middle" className="fill-text-muted text-[10px]">≈13 km depuis le poste — point de non-retour</text>
      </svg>
      <p className="mt-3 text-xs text-text-muted">
        GPS non garanti passé le poste de contrôle. Boussole, bidon d’essence et sang-froid recommandés.
      </p>
    </div>
  );
}

// Plan du parc factice : entrée/sortie unique, six zones reliées par un chemin
// en pointillés, un poste de secours et une zone volontairement non cartographiée.
const ZONES = [
  { name: 'Le Convoi', x: 140, y: 110, variant: 'secure' },
  { name: "L'Abattoir", x: 340, y: 90, variant: 'critical' },
  { name: 'La Ruche', x: 500, y: 150, variant: 'critical' },
  { name: 'Le Bunker 7', x: 430, y: 280, variant: 'critical' },
  { name: 'La Zone Morte', x: 230, y: 250, variant: 'secure' },
  { name: 'Ground Zero', x: 110, y: 330, variant: 'secure' },
];

function ParkMap() {
  const path = `M300,380 ${ZONES.map((z) => `L${z.x},${z.y}`).join(' ')}`;
  return (
    <div className="clip-corner relative border border-border bg-bg-elevated/60 p-4 md:p-6">
      <p className="mb-3 font-heading text-xs uppercase tracking-[.08em] text-text-muted">
        Plan du parc <span className="text-accent-2">(dépliant officiel, en partie censuré)</span>
      </p>
      <svg viewBox="0 0 640 420" className="h-auto w-full" role="img" aria-label="Plan du parc Nightfall avec ses six zones d'expérience, l'entrée, le poste de secours et une zone non cartographiée">
        <rect x="1" y="1" width="638" height="418" fill="none" className="stroke-border" strokeWidth="1" strokeDasharray="4 6" />

        <path d={path} fill="none" className="stroke-accent-2/50" strokeWidth="2.5" strokeDasharray="8 7" />

        {/* Entrée / sortie */}
        <rect x="265" y="368" width="70" height="26" className="fill-bg stroke-accent" strokeWidth="1.5" />
        <text x="300" y="386" textAnchor="middle" className="fill-text font-heading text-[10px] uppercase">Entrée / Sortie</text>

        {/* Poste de secours */}
        <g transform="translate(555,300)">
          <rect x="-14" y="-14" width="28" height="28" className="fill-bg-elevated stroke-accent-2" strokeWidth="1.5" />
          <path d="M-7,0 H7 M0,-7 V7" className="stroke-accent-2" strokeWidth="2.5" />
        </g>
        <text x="555" y="335" textAnchor="middle" className="fill-text-muted font-heading text-[9px] uppercase">Poste de secours</text>

        {/* Zone non cartographiée */}
        <g>
          <rect x="470" y="20" width="140" height="70" className="fill-accent/10 stroke-accent" strokeWidth="1" strokeDasharray="3 4" />
          <text x="540" y="50" textAnchor="middle" className="fill-accent font-heading text-[10px] uppercase">☠ Non cartographié</text>
          <text x="540" y="66" textAnchor="middle" className="fill-text-muted text-[9px]">Ne pas s’y aventurer.</text>
          <text x="540" y="78" textAnchor="middle" className="fill-text-muted text-[9px]">Vraiment.</text>
        </g>

        {ZONES.map((z) => (
          <g key={z.name}>
            <circle
              cx={z.x}
              cy={z.y}
              r="11"
              className={z.variant === 'critical' ? 'fill-accent' : 'fill-accent-2'}
              style={{ filter: `drop-shadow(0 0 5px var(--color-${z.variant === 'critical' ? 'accent' : 'accent-2'}))` }}
            />
            <text
              x={z.x}
              y={z.y - 18}
              textAnchor="middle"
              className={`font-heading text-[10px] font-bold uppercase ${z.variant === 'critical' ? 'fill-accent' : 'fill-accent-2'}`}
            >
              {z.name}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-3 text-xs text-text-muted">
        Zones rouges : intensité élevée. Zones cyan : intensité modérée. Zone grisée en haut à droite : n’existe pas, officiellement.
      </p>
    </div>
  );
}

const INFOS = [
  { label: 'Adresse', value: '13, Rue de la Dernière Chance', hint: 'Zone Interdite, 66600 — sonnez trois fois, on fera semblant de ne pas entendre.' },
  { label: 'Téléphone', value: '+666 13 13 13 13', hint: 'La ligne est parfois « occupée ». Ce n’est probablement rien.' },
  { label: 'Email', value: 'urgences@nightfall.dev', hint: 'Réponse sous 24h, ou à la prochaine pleine lune, selon.' },
  { label: 'Horaires', value: '22h – 06h, toute l’année', hint: 'Les jours de la semaine ont cessé d’avoir un sens ici.' },
];

export default function About() {
  return (
    <>
      <section className="mb-10">
        <Badge variant="critical" className="animate-blink motion-reduce:animate-none mb-4">⚠ Zone interdite</Badge>
        <h1 className="glitch text-glow-crimson mb-4 text-3xl text-accent sm:text-4xl" data-text="À propos">À propos</h1>
        <p className="max-w-[65ch] text-text-muted">
          Nightfall n’est pas un parc d’attractions. C’est ce qu’il en reste. Bâti sur les
          ruines d’un ancien parc à thème abandonné après l’Effondrement, il a rouvert ses
          portes pour une seule raison&nbsp;: la survie est plus intéressante quand on n’est
          pas certain d’y arriver.
        </p>
        <p className="mt-3 max-w-[65ch] text-text-muted">
          Nos acteurs ne jouent pas la peur, ils l’ont vécue. Nos décors ne sont pas des
          décors. Le reste, on préfère vous laisser le découvrir sur place — de préférence
          avant le lever du jour.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-glow-crimson mb-6 text-2xl text-accent">Nous trouver</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="clip-corner border border-border bg-bg-elevated/60 p-6">
            <ul className="flex flex-col gap-5">
              {INFOS.map((i) => (
                <li key={i.label}>
                  <p className="font-heading text-xs uppercase tracking-[.08em] text-accent-2">{i.label}</p>
                  <p className="text-text">{i.value}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{i.hint}</p>
                </li>
              ))}
            </ul>
          </div>
          <AccessMap />
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-glow-crimson mb-6 text-2xl text-accent">Plan du parc</h2>
        <ParkMap />
      </section>

      <section className="clip-corner relative border border-accent/40 bg-bg-elevated/60 p-6 md:p-8">
        <div className="danger-stripe absolute inset-x-0 -top-px h-1" aria-hidden="true" />
        <h2 className="text-glow-crimson mb-3 text-lg text-accent">Mentions (presque) légales</h2>
        <p className="text-text-muted">
          Nightfall décline toute responsabilité en cas de rencontre avec l’au-delà, de perte
          de repères temporels, ou de nouvelle amitié durable avec une entité non identifiée.
          En franchissant le poste de contrôle, vous acceptez de ne plus vraiment être sûr de
          ce qui est réel — voir nos{' '}
          <a href="/conditions" className="text-accent-2 underline">conditions d’utilisation</a>{' '}
          pour la version sérieuse (il y en a bien une, quelque part).
        </p>
      </section>
    </>
  );
}
