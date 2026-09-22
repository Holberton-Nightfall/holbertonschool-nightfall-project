import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { MOCK_EXPERIENCES } from '../mocks/experiences.js';

const FALLBACK_IMAGE = '/images/nightfall.jpeg';

// Page de vérification visuelle, sur seed statique (src/mocks/experiences.js),
// tant que GET /api/experiences n'est pas branché côté backend. À supprimer ensuite.
export default function CatalogueTest() {
  return (
    <>
      <p className="mb-4 inline-block border border-accent-2 bg-accent-2/10 px-3 py-1 text-sm text-accent-2">
        Mode test — données de seed statiques, pas d'appel API
      </p>
      <h1 className="text-glow-crimson mb-6 text-2xl text-accent">Catalogue (test)</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_EXPERIENCES.map((e) => (
          <Link key={e.id} to={`/test/${e.id}`} className="flex h-full text-inherit no-underline">
            <Card
              title={e.name}
              image={e.image_url || FALLBACK_IMAGE}
              fallback={FALLBACK_IMAGE}
              badge={<Badge variant={e.intensity >= 4 ? 'critical' : 'secure'}>Niveau {e.intensity}</Badge>}
            >
              <p className="mb-2 line-clamp-3 text-text-muted">{e.description}</p>
              <p className="mb-2 mt-auto text-text-muted">
                {e.category_name} · {e.duration_min} min · {e.max_participants} pers. max · {Number(e.price).toFixed(2)} €
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
