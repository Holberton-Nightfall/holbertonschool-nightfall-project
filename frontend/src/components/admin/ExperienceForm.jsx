import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import { getCategories } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const EMPTY = {
  name: '',
  description: '',
  image_url: '',
  category_id: '',
  duration_min: '',
  intensity: '3',
  max_participants: '',
  price: '',
};

// Un input contrôlé manipule des chaînes : conversion à l'entrée…
function toForm(experience) {
  if (!experience) return EMPTY;
  return {
    name: experience.name ?? '',
    description: experience.description ?? '',
    image_url: experience.image_url ?? '',
    category_id: String(experience.category_id),
    duration_min: String(experience.duration_min),
    intensity: String(experience.intensity),
    max_participants: String(experience.max_participants),
    price: String(Number(experience.price)), // NUMERIC arrive en chaîne ("35.00")
  };
}

// … et à la sortie, pour envoyer des nombres à l'API.
function toPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    image_url: form.image_url.trim(),
    category_id: Number(form.category_id),
    duration_min: Number(form.duration_min),
    intensity: Number(form.intensity),
    max_participants: Number(form.max_participants),
    price: Number(form.price),
  };
}

// Mêmes règles que routesAPI.md. Le back reste la vraie barrière.
function validate(form) {
  const errors = [];
  const isPositiveInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

  if (!form.name.trim()) errors.push('Le nom est obligatoire.');
  if (!form.description.trim()) errors.push('La description est obligatoire.');
  if (!form.image_url.trim()) errors.push("Le chemin de l'image est obligatoire.");
  if (!form.category_id) errors.push('Choisissez une catégorie.');
  if (!isPositiveInt(form.duration_min)) errors.push('La durée doit être un entier positif.');
  if (!isPositiveInt(form.max_participants)) errors.push('Le nombre de participants doit être un entier positif.');
  // Piège : Number("") vaut 0, donc on teste la chaîne vide à part.
  if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    errors.push('Le prix doit être un nombre positif ou nul.');
  }
  const intensity = Number(form.intensity);
  if (!Number.isInteger(intensity) || intensity < 1 || intensity > 5) {
    errors.push("L'intensité doit être comprise entre 1 et 5.");
  }
  return errors;
}

const LABEL = 'flex flex-col gap-1 font-heading text-[.75rem] uppercase tracking-[.08em] text-text-muted';
const FIELD =
  'w-full border border-border bg-bg-elevated px-3 py-2 font-body text-base normal-case tracking-normal text-text outline-none transition-colors focus:border-accent-2';

/**
 * Formulaire unique pour créer et modifier.
 * - experience absent  → création (POST /experiences)
 * - experience présent → modification (PUT /experiences/:id)
 * Le parent passe une `key` (experience?.id ?? 'new') pour réinitialiser l'état.
 */
export default function ExperienceForm({ experience, onSaved, onCancel }) {
  // Même convention que ExperiencesTable : le contexte injecte le token.
  const { createExperience, updateExperience } = useAuth();
  const isEdit = Boolean(experience);
  const [form, setForm] = useState(() => toForm(experience));
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setErrors(['Impossible de charger les catégories.']));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validate(form);
    if (clientErrors.length) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    setErrors([]);
    try {
      const payload = toPayload(form);
      const saved = isEdit
        ? await updateExperience(experience.id, payload)
        : await createExperience(payload);
      onSaved(saved);
    } catch (err) {
      // Format d'erreur du contrat : { error, details? }
      setErrors(err.details?.length ? err.details : [err.message || 'Enregistrement impossible.']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 border border-border bg-bg-elevated/40 p-6">
      <h2 className="text-xl text-accent">
        {isEdit ? `Modifier « ${experience.name} »` : 'Nouvelle expérience'}
      </h2>

      {errors.length > 0 && (
        <ul role="alert" className="border border-accent p-3 text-sm text-accent">
          {errors.map((msg) => <li key={msg}>{msg}</li>)}
        </ul>
      )}

      <label className={LABEL}>
        Nom
        <input name="name" value={form.name} onChange={handleChange} className={FIELD} />
      </label>

      <label className={LABEL}>
        Description
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} className={FIELD} />
      </label>

      <label className={LABEL}>
        Image (chemin dans /images/experiences)
        <input name="image_url" placeholder="/images/experiences/bunker-7.jpeg" value={form.image_url} onChange={handleChange} className={FIELD} />
      </label>

      <label className={LABEL}>
        Catégorie
        <select name="category_id" value={form.category_id} onChange={handleChange} className={FIELD}>
          <option value="">Choisir une catégorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={LABEL}>
          Durée (min)
          <input type="number" min="1" name="duration_min" value={form.duration_min} onChange={handleChange} className={FIELD} />
        </label>
        <label className={LABEL}>
          Intensité (1 à 5)
          <input type="number" min="1" max="5" name="intensity" value={form.intensity} onChange={handleChange} className={FIELD} />
        </label>
        <label className={LABEL}>
          Participants max
          <input type="number" min="1" name="max_participants" value={form.max_participants} onChange={handleChange} className={FIELD} />
        </label>
        <label className={LABEL}>
          Prix (€)
          <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} className={FIELD} />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : "Créer l'expérience"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
