import { useEffect, useState } from 'react';
import Card from '../components/ui/Card.jsx';
import { getExperiences } from '../services/api.js';
import './Home.css';

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
      <h1 className="home__heading text-glow-crimson">Catalogue</h1>
      {status === 'loading' && <p>Chargement des expériences…</p>}
      {status === 'error' && <p>Signal perdu : impossible de charger le catalogue.</p>}
      {status === 'ready' && experiences.length === 0 && <p>Aucune expérience disponible.</p>}
      {status === 'ready' && (
        <div className="grid">
          {experiences.map((e) => (
            <Card
              key={e.id}
              title={e.name}
              image={e.image_url || FALLBACK_IMAGE}
              fallback={FALLBACK_IMAGE}
              badge={<span className={`badge badge--${e.intensity >= 4 ? 'critical' : 'secure'}`}>Niveau {e.intensity}</span>}
            >
              <p>{e.description}</p>
              <p>{e.category_name} · {e.duration_min} min · {e.max_participants} pers. max · {Number(e.price).toFixed(2)} €</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
