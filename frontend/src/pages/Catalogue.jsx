import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getExperiences } from '../services/api.js';

const FALLBACK_IMAGE = '/images/nightfall.jpeg';

export default function Catalogue() {
  const [experiences, setExperiences] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getExperiences()
      .then((data) => { setExperiences(data); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <>
      <h1 className="text-glow-crimson mb-6 text-2xl text-accent">Catalogue</h1>
      {status === 'loading' && <p>Chargement des expériences…</p>}
      {status === 'error' && <p>Signal perdu : impossible de charger le catalogue.</p>}
      {status === 'ready' && experiences.length === 0 && <p>Aucune expérience disponible.</p>}
      {status === 'ready' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((e) => (
            <Link key={e.id} to={`/experiences/${e.id}`} className="flex h-full text-inherit no-underline">
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
      )}
    </>
  );
}
