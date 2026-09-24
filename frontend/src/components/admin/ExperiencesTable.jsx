import { useEffect, useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import ExperienceForm from './ExperienceForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ExperiencesTable() {
  const { getAdminExperiences, setExperienceArchived } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);
  // id de la ligne en cours de modification : désactive son bouton le temps de l'appel
  const [pendingId, setPendingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  // Formulaire ouvert : null (fermé) | 'new' (création) | objet expérience (modification)
  const [editing, setEditing] = useState(null);

  // Réutilisé au montage et après chaque enregistrement : le POST/PUT ne renvoie
  // pas category_name, on relit donc la liste depuis le serveur.
  const load = () =>
    getAdminExperiences()
      .then((data) => { setExperiences(data); setStatus('ready'); })
      .catch((err) => { setError(err.message || 'Chargement impossible'); setStatus('error'); });

  useEffect(() => { load(); }, []);

  const openForm = (target) => {
    setActionError(null);
    setEditing(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaved = () => {
    setEditing(null);
    load();
  };

  const handleArchive = async (exp) => {
    setActionError(null);
    setPendingId(exp.id);
    try {
      // On relit is_archived depuis la réponse plutôt que d'inverser à l'aveugle :
      // l'état affiché vient du serveur.
      const { experience } = await setExperienceArchived(exp.id, !exp.is_archived);
      setExperiences((prev) => prev.map((e) => (
        e.id === exp.id ? { ...e, is_archived: experience.is_archived } : e
      )));
    } catch (err) {
      setActionError(err.message || 'Action impossible');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {editing ? (
        <ExperienceForm
          key={editing === 'new' ? 'new' : editing.id}
          experience={editing === 'new' ? undefined : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => openForm('new')}>Nouvelle expérience</Button>
        </div>
      )}

      {status === 'loading' && <p className="text-text-muted">Chargement…</p>}
      {status === 'error' && <p role="alert" className="text-accent">{error}</p>}
      {actionError && <p role="alert" className="text-accent">{actionError}</p>}

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
                      <Button
                        variant="ghost"
                        onClick={() => openForm(e)}
                        disabled={editing !== null || pendingId === e.id}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleArchive(e)}
                        disabled={pendingId === e.id}
                      >
                        {pendingId === e.id ? '…' : (e.is_archived ? 'Restaurer' : 'Archiver')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
