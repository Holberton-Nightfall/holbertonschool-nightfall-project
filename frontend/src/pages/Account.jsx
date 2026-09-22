import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import PasswordRequirements from '../components/ui/PasswordRequirements.jsx';
import Modal from '../components/ui/Modal.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inputField } from '../lib/classNames.js';
import { PASSWORD_RULES } from '../lib/passwordRules.js';
import { formatDateTime } from '../lib/slots.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sectionClass = 'clip-corner border border-border bg-bg-elevated/60 p-6';

function ProfileSection({ user }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name });
  const [status, setStatus] = useState('idle'); // idle | saving | done
  const [error, setError] = useState(null);

  const unchanged = form.first_name === user.first_name && form.last_name === user.last_name;
  const canSubmit = form.first_name.trim() !== '' && form.last_name.trim() !== '' && !unchanged;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('saving');
    try {
      await updateProfile(form);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Impossible de mettre à jour le profil');
      setStatus('idle');
    }
  };

  return (
    <section className={sectionClass}>
      <h2 className="text-glow-crimson mb-4 text-lg text-accent">Informations personnelles</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Prénom
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => { setForm((f) => ({ ...f, first_name: e.target.value })); setStatus('idle'); }}
            required
            className={inputField}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nom
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => { setForm((f) => ({ ...f, last_name: e.target.value })); setStatus('idle'); }}
            required
            className={inputField}
          />
        </label>
        {error && <p role="alert" className="text-accent">{error}</p>}
        {status === 'done' && <p className="text-accent-2">Profil mis à jour.</p>}
        <Button type="submit" variant="ghost" disabled={!canSubmit || status === 'saving'} className="w-full sm:w-auto">
          {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </section>
  );
}

function EmailSection({ user }) {
  const { updateEmail } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const emailValid = EMAIL_RE.test(newEmail);
  const emailsMatch = confirmEmail.length === 0 || newEmail === confirmEmail;
  const canSubmit = emailValid && newEmail === confirmEmail && newEmail !== user.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('saving');
    try {
      await updateEmail({ email: newEmail });
      setNewEmail('');
      setConfirmEmail('');
      setStatus('done');
    } catch (err) {
      setError(err.message || "Impossible de modifier l'email");
      setStatus('idle');
    }
  };

  return (
    <section className={sectionClass}>
      <h2 className="text-glow-crimson mb-4 text-lg text-accent">Adresse email</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">Email actuel : <span className="text-text">{user.email}</span></p>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nouvel email
          <input
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setStatus('idle'); }}
            required
            className={inputField}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Confirmer le nouvel email
          <input
            type="email"
            autoComplete="email"
            value={confirmEmail}
            onChange={(e) => { setConfirmEmail(e.target.value); setStatus('idle'); }}
            required
            className={inputField}
          />
          {!emailsMatch && <span role="alert" className="text-accent">Les emails ne sont pas identiques.</span>}
        </label>
        {error && <p role="alert" className="text-accent">{error}</p>}
        {status === 'done' && <p className="text-accent-2">Email mis à jour.</p>}
        <Button type="submit" variant="ghost" disabled={!canSubmit || status === 'saving'} className="w-full sm:w-auto">
          {status === 'saving' ? 'Enregistrement…' : 'Modifier l’email'}
        </Button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(newPassword));
  const passwordsMatch = confirmPassword.length === 0 || newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && passwordValid && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('saving');
    try {
      await updatePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Impossible de modifier le mot de passe');
      setStatus('idle');
    }
  };

  return (
    <section className={sectionClass}>
      <h2 className="text-glow-crimson mb-4 text-lg text-accent">Mot de passe</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Ancien mot de passe
          <PasswordInput
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setStatus('idle'); }}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nouveau mot de passe
          <PasswordInput
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setStatus('idle'); }}
            required
            minLength={8}
          />
          <PasswordRequirements password={newPassword} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Confirmer le nouveau mot de passe
          <PasswordInput
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setStatus('idle'); }}
            required
            minLength={8}
          />
          {!passwordsMatch && <span role="alert" className="text-accent">Les mots de passe ne sont pas identiques.</span>}
        </label>
        {error && <p role="alert" className="text-accent">{error}</p>}
        {status === 'done' && <p className="text-accent-2">Mot de passe mis à jour.</p>}
        <Button type="submit" variant="ghost" disabled={!canSubmit || status === 'saving'} className="w-full sm:w-auto">
          {status === 'saving' ? 'Enregistrement…' : 'Modifier le mot de passe'}
        </Button>
      </form>
    </section>
  );
}

function DangerZoneSection() {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setError(null);
    setStatus('saving');
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Impossible de supprimer le compte');
      setStatus('idle');
    }
  };

  return (
    <section className="clip-corner border border-accent/40 bg-bg-elevated/60 p-6">
      <h2 className="text-glow-crimson mb-2 text-lg text-accent">Zone dangereuse</h2>
      <p className="mb-4 text-sm text-text-muted">
        La suppression désactive votre compte et vous déconnecte. Vos réservations passées restent conservées.
      </p>
      <Button variant="ghost" onClick={() => setConfirmOpen(true)} className="w-full sm:w-auto">
        Supprimer mon compte
      </Button>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Supprimer votre compte ?">
        <p className="mb-4 text-text-muted">
          Cette action désactive votre compte et vous déconnecte immédiatement. Elle ne peut pas être annulée depuis le site.
        </p>
        {error && <p role="alert" className="mb-4 text-accent">{error}</p>}
        <Button onClick={handleDelete} disabled={status === 'saving'} className="mb-4 w-full sm:w-auto">
          {status === 'saving' ? 'Suppression…' : 'Oui, supprimer mon compte'}
        </Button>
      </Modal>
    </section>
  );
}

function bookingStatus(booking) {
  if (booking.status === 'cancelled') return { label: 'Annulée', variant: 'critical' };
  if (new Date(booking.scheduled_at) < new Date()) return { label: 'Terminée', variant: 'muted' };
  return { label: 'Confirmée', variant: 'secure' };
}

function BookingRow({ booking, onEdit, onCancel }) {
  const past = new Date(booking.scheduled_at) < new Date();
  const cancelled = booking.status === 'cancelled';
  const { label, variant } = bookingStatus(booking);
  const canCancel = !cancelled && !past && (booking.can_cancel ?? true);

  return (
    <li className="flex flex-col gap-2 border border-border bg-bg/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-text">{booking.experience_name}</span>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <p className="text-sm text-text-muted">
        {formatDateTime(new Date(booking.scheduled_at))} · {booking.participants} participant{booking.participants > 1 ? 's' : ''}
      </p>
      <p className="text-xs text-text-muted">Réservée le {formatDateTime(new Date(booking.created_at))}</p>
      {cancelled && booking.cancelled_at && (
        <p className="text-xs text-text-muted">Annulée le {formatDateTime(new Date(booking.cancelled_at))}</p>
      )}
      {!cancelled && !past && (
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => onEdit(booking)}>Modifier</Button>
          <Button variant="ghost" onClick={() => onCancel(booking)} disabled={!canCancel}>Annuler</Button>
        </div>
      )}
    </li>
  );
}

const toLocalInputValue = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function EditBookingForm({ booking, onSubmit }) {
  const [scheduledAt, setScheduledAt] = useState(toLocalInputValue(new Date(booking.scheduled_at)));
  const [participants, setParticipants] = useState(booking.participants);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('saving');
    try {
      await onSubmit({ scheduled_at: new Date(scheduledAt).toISOString(), participants: Number(participants) });
    } catch (err) {
      setError(err.message || 'Impossible de modifier cette réservation');
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Créneau
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
          className={inputField}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Participants
        <input
          type="number"
          min={1}
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          required
          className={inputField}
        />
      </label>
      {error && <p role="alert" className="text-accent">{error}</p>}
      <Button type="submit" disabled={status === 'saving'} className="w-full sm:w-auto">
        {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  );
}

// ⚠️ Consomme GET/PATCH/DELETE /api/bookings : documentés (PATCH proposé,
// à valider) dans docs/routesAPI.md mais pas implémentés côté backend
// (bookings.routes.js vide). Échouera tant que le backend n'est pas fait.
//
// Le statut "Terminée" n'existe pas en base (contrainte confirmed/cancelled
// uniquement) : il est calculé ici à l'affichage quand scheduled_at est passé.
function BookingsSection() {
  const { getBookings, updateBooking, cancelBooking } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  // Volet historique (réservations terminées/annulées) : toujours fermé à
  // l'arrivée sur la page, pas de mémorisation (localStorage ou autre).
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    getBookings()
      .then((data) => { setBookings(data); setLoadStatus('ready'); })
      .catch((err) => { setLoadError(err.message || 'Impossible de charger les réservations'); setLoadStatus('error'); });
  }, []);

  const sorted = [...bookings].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const now = new Date();
  const upcoming = sorted.filter((b) => b.status === 'confirmed' && new Date(b.scheduled_at) >= now);
  const history = sorted.filter((b) => b.status === 'cancelled' || new Date(b.scheduled_at) < now);

  const openCancel = (booking) => { setCancelError(null); setCancelling(booking); };

  const handleCancel = async (booking) => {
    setCancelError(null);
    try {
      await cancelBooking(booking.id);
      setBookings((prev) => prev.map((b) => (
        b.id === booking.id ? { ...b, status: 'cancelled', cancelled_at: new Date().toISOString() } : b
      )));
      setCancelling(null);
    } catch (err) {
      setCancelError(err.message || "Impossible d'annuler cette réservation");
    }
  };

  const handleSaveEdit = async (data) => {
    const updated = await updateBooking(editing.id, data);
    setBookings((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...updated } : b)));
    setEditing(null);
  };

  return (
    <section className={sectionClass}>
      <h2 className="text-glow-crimson mb-4 text-lg text-accent">Mes réservations</h2>

      {loadStatus === 'loading' && <p className="text-text-muted">Chargement…</p>}
      {loadStatus === 'error' && <p role="alert" className="text-accent">{loadError}</p>}

      {loadStatus === 'ready' && (
        <>
          {upcoming.length === 0 ? (
            <p className="text-text-muted">Aucune réservation à venir.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((b) => (
                <BookingRow key={b.id} booking={b} onEdit={setEditing} onCancel={openCancel} />
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-expanded={historyOpen}
            className="mt-4 flex w-full items-center justify-between text-sm text-text-muted hover:text-accent-2"
          >
            Historique ({history.length})
            <span aria-hidden="true">{historyOpen ? '▲' : '▼'}</span>
          </button>
          {historyOpen && (
            history.length === 0 ? (
              <p className="mt-2 text-text-muted">Aucun événement passé.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-3">
                {history.map((b) => <BookingRow key={b.id} booking={b} />)}
              </ul>
            )
          )}
        </>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Modifier la réservation">
        {editing && <EditBookingForm booking={editing} onSubmit={handleSaveEdit} />}
      </Modal>

      <Modal open={Boolean(cancelling)} onClose={() => setCancelling(null)} title="Annuler la réservation ?">
        {cancelling && (
          <>
            <p className="mb-4 text-text-muted">
              Cette action annule votre réservation pour <span className="text-text">{cancelling.experience_name}</span>.
            </p>
            {cancelError && <p role="alert" className="mb-4 text-accent">{cancelError}</p>}
            <Button onClick={() => handleCancel(cancelling)}>Oui, annuler</Button>
          </>
        )}
      </Modal>
    </section>
  );
}

// Première route protégée par RequireAuth, sert aussi de vérification bout en
// bout au contexte d'auth. Le bouton de déconnexion est dans le header.
//
// ⚠️ Les sections appellent PUT /api/auth/me, /auth/email, /auth/password et
// DELETE /api/auth/me, qui n'existent ni dans docs/routesAPI.md ni côté
// backend : à ajouter au contrat d'API avant que ces formulaires fonctionnent
// réellement. DELETE doit faire un soft delete (le compte est désactivé, pas
// supprimé en base, pour garder l'historique des réservations valide).
export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-glow-crimson text-2xl text-accent">Mon compte</h1>
      <ProfileSection user={user} />
      <EmailSection user={user} />
      <PasswordSection />
      <BookingsSection />
      <Button variant="ghost" onClick={handleLogout} className="w-full sm:w-auto">Se déconnecter</Button>
      <DangerZoneSection />
    </div>
  );
}
