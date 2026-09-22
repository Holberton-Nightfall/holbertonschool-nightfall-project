import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inputField } from '../lib/classNames.js';
import { PASSWORD_RULES } from '../lib/passwordRules.js';

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
          <span className={newPassword.length > 0 && !passwordValid ? 'text-accent' : 'text-xs text-text-muted'}>
            8 caractères minimum, une majuscule et un caractère spécial.
          </span>
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
      <Button variant="ghost" onClick={handleLogout} className="w-full sm:w-auto">Se déconnecter</Button>
      <DangerZoneSection />
    </div>
  );
}
