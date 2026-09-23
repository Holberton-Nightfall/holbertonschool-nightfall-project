import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getExperienceById } from '../services/api.js';
import { FALLBACK_IMAGE } from '../lib/constants.js';

// Fiche publique branchée sur GET /api/experiences/:id.
export default function ExperienceDetail() {
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not-found | error

  useEffect(() => {
    setStatus('loading');
    getExperienceById(id)
      .then((data) => { setExperience(data); setStatus('ready'); })
      .catch((err) => setStatus(err.status === 404 ? 'not-found' : 'error'));
  }, [id]);

  if (status === 'loading') return <p>Chargement de la fiche…</p>;
  if (status === 'not-found') {
    return (
      <section>
        <p className="text-text-muted">Expérience introuvable.</p>
        <Link to="/catalogue" className="text-accent-2">← Retour au catalogue</Link>
      </section>
    );
  }
  if (status === 'error') return <p>Signal perdu : impossible de charger cette expérience.</p>;

  const e = experience;

  return (
    <article>
      <Link to="/catalogue" className="mb-4 inline-block text-text-muted hover:text-accent-2">
        ← Retour au catalogue
      </Link>

      <div className="clip-corner relative mb-6 aspect-[8/3] overflow-hidden border-b-2 border-accent lg:aspect-[3/1]">
        <img
          src={e.image_url || FALLBACK_IMAGE}
          alt=""
          className="h-full w-full object-cover [filter:grayscale(.4)_contrast(1.1)_brightness(.75)_sepia(.2)]"
          onError={(ev) => { if (!ev.currentTarget.src.endsWith(FALLBACK_IMAGE)) ev.currentTarget.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute top-2 left-2">
          <Badge variant={e.intensity >= 4 ? 'critical' : 'secure'}>Niveau {e.intensity}</Badge>
        </div>
      </div>

      <h1 className="text-glow-crimson mb-2 text-2xl text-text">{e.name}</h1>
      <p className="mb-4 font-heading text-sm uppercase tracking-[.05em] text-accent-2">{e.category_name}</p>

      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-start">
        <div className="flex flex-col gap-4">
          <p className="max-w-[65ch] text-text-muted">{e.description}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-text">
            <li>Durée : {e.duration_min} min</li>
            <li>Participants max : {e.max_participants}</li>
            <li>Prix : {Number(e.price).toFixed(2)} €</li>
          </ul>
        </div>
        <Button to={`/reservation/${e.id}`} className="w-full sm:w-auto lg:shrink-0 lg:translate-x-1/2">Réserver</Button>
      </div>
    </article>
  );
}
