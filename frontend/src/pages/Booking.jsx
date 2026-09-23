import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { getExperienceById } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { generateNightSlots, formatNightLabel, formatTime, formatDateTime } from '../lib/slots.js';
import { inputField } from '../lib/classNames.js';

// Formulaire de réservation en 2 étapes (choix du créneau puis récapitulatif),
// pour la fiche d'expérience `id`. Les créneaux sont générés côté client
// (voir lib/slots.js), aucune table sessions en base pour le MVP.
export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createBooking } = useAuth();

  const [experience, setExperience] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not-found | error

  useEffect(() => {
    setStatus('loading');
    getExperienceById(id)
      .then((data) => { setExperience(data); setStatus('ready'); })
      .catch((err) => setStatus(err.status === 404 ? 'not-found' : 'error'));
  }, [id]);

  const nights = useMemo(() => (experience ? generateNightSlots(experience.duration_min) : []), [experience]);

  const [nightKey, setNightKey] = useState('');
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState(1);
  const [step, setStep] = useState('form'); // form | recap
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | saving | error
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (nights.length > 0 && !nightKey) setNightKey(nights[0].key);
  }, [nights, nightKey]);

  const selectedNight = nights.find((n) => n.key === nightKey);

  useEffect(() => {
    if (selectedNight && !selectedNight.times.some((t) => t.toISOString() === time)) {
      setTime(selectedNight.times[0]?.toISOString() || '');
    }
  }, [selectedNight, time]);

  if (status === 'loading') return <p>Chargement…</p>;
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
  const maxParticipants = e.max_participants;
  const canGoRecap = Boolean(nightKey) && Boolean(time) && participants >= 1 && participants <= maxParticipants;
  const totalPrice = (Number(e.price) * Number(participants || 0)).toFixed(2);

  const handleContinue = (ev) => {
    ev.preventDefault();
    setStep('recap');
  };

  const handleConfirm = async () => {
    setSubmitStatus('saving');
    setSubmitError(null);
    try {
      const booking = await createBooking({
        experience_id: e.id,
        scheduled_at: time,
        participants: Number(participants),
      });
      navigate(`/reservation/${e.id}/confirmation`, { state: { booking, experience: e } });
    } catch (err) {
      setSubmitError(err.message || 'Impossible de confirmer la réservation');
      setSubmitStatus('idle');
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <Link to={`/experiences/${e.id}`} className="text-text-muted hover:text-accent-2">← Retour à la fiche</Link>
      <h1 className="text-glow-crimson text-2xl text-accent">Réserver : {e.name}</h1>

      {step === 'form' && (
        <form onSubmit={handleContinue} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Nuit
            <select value={nightKey} onChange={(ev) => setNightKey(ev.target.value)} className={inputField} required>
              {nights.map((n) => (
                <option key={n.key} value={n.key}>{formatNightLabel(n.date)}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Heure
            <select value={time} onChange={(ev) => setTime(ev.target.value)} className={inputField} required>
              {selectedNight?.times.map((t) => (
                <option key={t.toISOString()} value={t.toISOString()}>{formatTime(t)}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Participants
            <input
              type="number"
              min={1}
              max={maxParticipants}
              value={participants}
              onChange={(ev) => setParticipants(ev.target.value)}
              required
              className={inputField}
            />
            <span className="text-xs text-text-muted">Maximum {maxParticipants} participants.</span>
          </label>

          <Button type="submit" disabled={!canGoRecap} className="w-full sm:w-auto">
            Continuer
          </Button>
        </form>
      )}

      {step === 'recap' && (
        <div className="clip-corner flex flex-col gap-4 border border-border bg-bg-elevated/60 p-6">
          <h2 className="text-glow-crimson text-lg text-accent">Récapitulatif</h2>
          <ul className="flex flex-col gap-2 text-text">
            <li>Expérience : {e.name}</li>
            <li>Créneau : {formatDateTime(new Date(time))}</li>
            <li>Participants : {participants}</li>
            <li>Total : {totalPrice} €</li>
          </ul>
          {submitError && <p role="alert" className="text-accent">{submitError}</p>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep('form')} disabled={submitStatus === 'saving'}>
              Modifier
            </Button>
            <Button onClick={handleConfirm} disabled={submitStatus === 'saving'}>
              {submitStatus === 'saving' ? 'Confirmation…' : 'Confirmer la réservation'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
