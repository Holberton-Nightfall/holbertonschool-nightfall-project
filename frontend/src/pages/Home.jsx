import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getExperiences } from '../services/api.js';

const FALLBACK_IMAGE = '/images/nightfall.jpeg';

function pickRandom(list, count) {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const ARGUMENTS = [
  { title: 'Immersion totale', text: 'Décors grandeur nature, acteurs sur le terrain : aucune barrière entre vous et la Zone.' },
  { title: 'Effets réels', text: 'Brouillard, éclairages dynamiques, son 3D — chaque zone a sa propre ambiance, jusqu’au dernier détail.' },
  { title: 'Sécurité encadrée', text: 'Une équipe formée veille en permanence. L’horreur est mise en scène, votre sécurité ne l’est pas.' },
  { title: 'Jamais la même nuit', text: 'Scénarios évolutifs et événements aléatoires : deux visites ne se ressemblent jamais.' },
];

const FAQ = [
  { q: 'Est-ce vraiment dangereux ?', a: 'Non. Chaque zone est mise en scène par une équipe formée, avec des protocoles de sécurité stricts. L’horreur est simulée, pas le contrôle.' },
  { q: 'Puis-je venir seul ?', a: 'Oui. Les groupes incomplets sont complétés sur place avant chaque départ.' },
  { q: 'Que dois-je apporter ?', a: 'Des chaussures fermées et une tenue confortable. Le reste — lampes, équipement — est fourni sur place.' },
  { q: 'Le parc est-il accessible ?', a: 'Certaines zones sont accessibles en fauteuil. Contactez-nous avant votre venue pour organiser votre parcours.' },
];

export default function Home() {
  const [zones, setZones] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    getExperiences()
      .then((data) => { setZones(pickRandom(data, 3)); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <>
      <div className="clip-corner relative -mx-4 mb-10 bg-accent p-[3px] md:-mx-6">
        <section className="clip-corner relative flex min-h-[70vh] items-end overflow-hidden">
          <img
            className="absolute inset-0 h-full w-full object-cover [filter:grayscale(.5)_contrast(1.15)_brightness(.55)_sepia(.25)]"
            src="/images/nightfall.jpeg"
            alt=""
          />
          <div className="absolute inset-0 [background:linear-gradient(to_top,var(--color-bg)_0%,rgba(8,14,20,.55)_45%,rgba(8,14,20,.2)_100%),radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.8)_100%)]" />
          <div className="relative z-[1] max-w-[1100px] px-4 py-10 md:px-6">
            <Badge variant="critical" className="animate-blink motion-reduce:animate-none mb-4">⚠ Zone contaminée</Badge>
            <h1
              className="glitch mb-4 text-[clamp(2.5rem,14vw,7rem)] font-black text-text [text-shadow:0_0_12px_rgba(255,13,57,.8),0_0_40px_rgba(255,13,57,.35)]"
              data-text="Nightfall"
            >
              Nightfall
            </h1>
            <p className="mb-4 max-w-[65ch] font-heading text-sm font-black uppercase tracking-[.03em] text-text [text-shadow:0_0_10px_rgba(255,13,57,.8),0_0_28px_rgba(255,13,57,.4)] sm:text-base md:max-w-none md:whitespace-nowrap md:text-2xl">
              Pas de spectateurs : vous êtes acteur de votre propre survie.
            </p>
            <p className="mb-4 max-w-[46ch] text-base text-text [text-shadow:0_2px_6px_#000] sm:max-w-[65ch] sm:text-[1.1rem]">
              Survivez à la nuit. Le monde d’avant est mort — le parc, lui, vous attend.
            </p>
            <p className="mb-6 inline-block border border-accent-2 bg-bg/70 px-3 py-1.5 font-heading text-sm uppercase tracking-[.08em] text-accent-2">
              Ouvert de 22h à 06h uniquement
            </p>
            <div className="flex flex-wrap gap-4">
              <Button to="/catalogue" className="w-full sm:w-auto">Réserver ma nuit</Button>
            </div>
          </div>
        </section>
      </div>

      {/* Pourquoi venir */}
      <section className="mb-16">
        <h2 className="text-glow-crimson mb-6 text-2xl text-accent">Pourquoi venir</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ARGUMENTS.map((a) => (
            <div key={a.title} className="clip-corner border border-border bg-bg-elevated/60 p-4">
              <h3 className="mb-2 font-heading text-sm uppercase tracking-[.05em] text-accent-2">{a.title}</h3>
              <p className="text-text-muted">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zones teaser */}
      <section className="mb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-glow-crimson text-2xl text-accent">Zones d’expérience</h2>
          <Button to="/catalogue" variant="ghost">Voir tout le catalogue</Button>
        </div>
        {status === 'loading' && <p>Chargement des zones…</p>}
        {status === 'error' && <p>Signal perdu : impossible de charger les zones.</p>}
        {status === 'ready' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((z) => (
              <Link key={z.id} to={`/experiences/${z.id}`} className="flex h-full text-inherit no-underline">
                <Card
                  title={z.name}
                  image={z.image_url || FALLBACK_IMAGE}
                  fallback={FALLBACK_IMAGE}
                  badge={<Badge variant={z.intensity >= 4 ? 'critical' : 'secure'}>Niveau {z.intensity}</Badge>}
                >
                  <p className="mb-2 line-clamp-3 text-text-muted">{z.description}</p>
                  <Button variant="ghost" className="mt-auto" to={`/experiences/${z.id}`}>Survivre</Button>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Horaires & infos pratiques */}
      <section className="clip-corner relative mb-16 border border-accent/40 bg-bg-elevated/60 p-6 md:p-8">
        <div className="danger-stripe absolute inset-x-0 -top-px h-1" aria-hidden="true" />
        <h2 className="text-glow-crimson mb-2 text-2xl text-accent">Horaires &amp; infos pratiques</h2>
        <p className="mb-6 font-heading text-3xl uppercase tracking-[.05em] text-text sm:text-4xl">
          22h <span className="text-accent">—</span> 06h
        </p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <li className="border-l-2 border-accent-2 pl-3 text-text-muted">Ouvert uniquement la nuit, toute l’année</li>
          <li className="border-l-2 border-accent-2 pl-3 text-text-muted">Âge minimum : 16 ans (accompagnement obligatoire en dessous)</li>
          <li className="border-l-2 border-accent-2 pl-3 text-text-muted">Chaussures fermées et tenue confortable recommandées</li>
          <li className="border-l-2 border-accent-2 pl-3 text-text-muted">Parking gratuit sur place</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-glow-crimson mb-6 text-2xl text-accent">Questions fréquentes</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <details key={f.q} className="clip-corner border border-border bg-bg-elevated/60 p-4">
              <summary className="cursor-pointer font-heading text-sm uppercase tracking-[.05em] text-text">
                {f.q}
              </summary>
              <p className="mt-3 text-text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="clip-corner relative mb-4 border border-accent/40 bg-bg-elevated/80 p-6 text-center md:p-10">
        <div className="danger-stripe absolute inset-x-0 top-0 h-1" aria-hidden="true" />
        <p className="mb-2 font-heading text-sm uppercase tracking-[.08em] text-accent-2">
          22h – 06h · Réservation obligatoire
        </p>
        <h2 className="text-glow-crimson mb-6 text-2xl text-accent sm:text-3xl">Prêt à survivre à la nuit ?</h2>
        <Button to="/catalogue" className="w-full sm:w-auto">Réserver ma nuit</Button>
      </section>
    </>
  );
}
