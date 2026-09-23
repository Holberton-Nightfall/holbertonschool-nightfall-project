import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { MOCK_EXPERIENCES } from '../mocks/experiences.js';

const FALLBACK_IMAGE = '/images/nightfall.jpeg';

// Pendant de ExperienceDetail.jsx sur seed statique. À supprimer une fois l'API branchée.
export default function ExperienceDetailTest() {
  const { id } = useParams();
  const e = MOCK_EXPERIENCES.find((exp) => String(exp.id) === id);

  if (!e) {
    return (
      <section>
        <p className="text-text-muted">Expérience introuvable (id absent du seed de test).</p>
        <Link to="/test" className="text-accent-2">← Retour au catalogue test</Link>
      </section>
    );
  }

  return (
    <article>
      <p className="mb-4 inline-block border border-accent-2 bg-accent-2/10 px-3 py-1 text-sm text-accent-2">
        Mode test — données de seed statiques, pas d'appel API
      </p>

      <Link to="/test" className="mb-4 inline-block text-text-muted hover:text-accent-2">
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
