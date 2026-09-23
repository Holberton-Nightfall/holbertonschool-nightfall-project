import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { getExperiences, getCategories } from '../services/api.js';
import { inputField } from '../lib/classNames.js';
import { FALLBACK_IMAGE } from '../lib/constants.js';

const SEARCH_DEBOUNCE_MS = 300;

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [categories, setCategories] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  // Catégories chargées une seule fois pour peupler le select.
  useEffect(() => {
    getCategories().catch(() => []).then((data) => setCategories(data || []));
  }, []);

  // Champ de recherche : debounce avant de répercuter la valeur dans l'URL,
  // qui reste la source de vérité pour l'appel API (partageable, résiste au refresh).
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput === urlSearch) return;
      const next = new URLSearchParams(searchParams);
      if (searchInput) next.set('search', searchInput); else next.delete('search');
      setSearchParams(next, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleCategoryChange = (e) => {
    const next = new URLSearchParams(searchParams);
    if (e.target.value) next.set('category', e.target.value); else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setStatus('loading');
    getExperiences({ search: urlSearch, category: urlCategory })
      .then((data) => { setExperiences(data); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [urlSearch, urlCategory]);

  const hasActiveFilters = Boolean(urlSearch || urlCategory);

  return (
    <>
      <h1 className="text-glow-crimson mb-6 text-2xl text-accent">Catalogue</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher une expérience…"
          aria-label="Rechercher une expérience par nom"
          className={`${inputField} flex-1`}
        />
        <select
          value={urlCategory}
          onChange={handleCategoryChange}
          aria-label="Filtrer par catégorie"
          className={`${inputField} sm:w-56`}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p>Chargement des expériences…</p>}
      {status === 'error' && <p>Signal perdu : impossible de charger le catalogue.</p>}
      {status === 'ready' && experiences.length === 0 && (
        <p>{hasActiveFilters ? 'Aucune expérience ne correspond à ces critères.' : 'Aucune expérience disponible.'}</p>
      )}
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
