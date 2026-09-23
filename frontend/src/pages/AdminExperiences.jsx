import { useEffect, useState } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminExperiences() {
  const { getAdminExperiences } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminExperiences()
      .then((data) => { setExperiences(data); setStatus('ready'); })
      .catch((err) => { setError(err.message || 'Chargement impossible'); setStatus('error'); });
  }, []);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-glow-crimson text-2xl text-accent">Expériences</h1>
        <Button disabled>Nouvelle expérience</Button>
      </div>

      {status === 'loading' && <p className="text-text-muted">Chargement…</p>}
      {status === 'error' && <p role="alert" className="text-accent">{error}</p>}

      {status === 'ready' && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="p-3 font-heading font-normal">Nom</th>
                <th className="p-3 font-heading font-normal">Catégorie</th>
                <th className="p-3 font-heading font-normal">Durée</th>
                <th className="p-3 font-heading font-normal">Max</th>
                <th className="p-3 font-heading font-normal">Prix</th>
                <th className="p-3 font-heading font-normal">Statut</th>
                <th className="p-3 font-heading font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((e) => (
                <tr key={e.id} className="border-b border-border/50">
                  <td className="p-3 text-text">{e.name}</td>
                  <td className="p-3 text-text-muted">{e.category_name}</td>
                  <td className="p-3 text-text-muted">{e.duration_min} min</td>
                  <td className="p-3 text-text-muted">{e.max_participants}</td>
                  <td className="p-3 text-text-muted">{Number(e.price).toFixed(2)} €</td>
                  <td className="p-3">
                    <Badge variant={e.is_archived ? 'muted' : 'secure'}>
                      {e.is_archived ? 'Archivée' : 'Active'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" disabled>Modifier</Button>
                      <Button variant="ghost" disabled>
                        {e.is_archived ? 'Restaurer' : 'Archiver'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}