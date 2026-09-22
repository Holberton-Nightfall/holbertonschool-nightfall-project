import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Modal from '../components/ui/Modal.jsx';
import TermsContent from '../content/TermsContent.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inputField } from '../lib/classNames.js';
import { PASSWORD_RULES } from '../lib/passwordRules.js';

export default function Register() {
  const { register, isAuthenticated, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/compte';

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(form.password));
  const passwordsMatch = confirmPassword.length === 0 || form.password === confirmPassword;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canSubmit = form.first_name.trim() !== '' && form.last_name.trim() !== '' && emailValid
    && passwordValid && confirmPassword.length > 0 && form.password === confirmPassword && acceptedTerms;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === 'email') setEmailError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    if (!passwordValid || form.password !== confirmPassword) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate(from, { replace: true });
    } catch (err) {
      // 409 = email déjà utilisé (docs/API.md) : affiché sous le champ concerné.
      // Impossible à vérifier en direct pendant la saisie, faute d'endpoint dédié
      // côté backend (seul POST /api/auth/register renvoie cette erreur).
      if (err.status === 409) setEmailError(err.message || 'Cet email est déjà utilisé.');
      else setError(err.message || 'Impossible de créer le compte');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <p>Vérification de la session…</p>;
  if (isAuthenticated) return <Navigate to="/compte" replace />;

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-glow-crimson mb-6 text-2xl text-accent">Inscription</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Prénom
          <input type="text" name="first_name" autoComplete="given-name" required value={form.first_name} onChange={handleChange} className={inputField} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nom
          <input type="text" name="last_name" autoComplete="family-name" required value={form.last_name} onChange={handleChange} className={inputField} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Email
          <input type="email" name="email" autoComplete="email" required value={form.email} onChange={handleChange} className={inputField} />
          {emailError && <span role="alert" className="text-accent">{emailError}</span>}
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Mot de passe
          <PasswordInput
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
          />
          <span className={form.password.length > 0 && !passwordValid ? 'text-accent' : 'text-xs text-text-muted'}>
            8 caractères minimum, une majuscule et un caractère spécial.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Confirmer le mot de passe
          <PasswordInput
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {!passwordsMatch && <span role="alert" className="text-accent">Les mots de passe ne sont pas identiques.</span>}
        </label>
        <label className="flex items-start gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
            className="mt-1 h-4 w-4 accent-accent"
          />
          <span>
            J'accepte les{' '}
            <button type="button" onClick={() => setShowTerms(true)} className="text-accent-2 underline">
              conditions d'utilisation
            </button>.
          </span>
        </label>
        {error && <p role="alert" className="text-accent">{error}</p>}
        <Button type="submit" disabled={submitting || !canSubmit} className="w-full sm:w-auto">
          {submitting ? 'Création…' : 'Créer mon compte'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-text-muted">
        Déjà un compte ? <Link to="/connexion" className="text-accent-2">Se connecter</Link>
      </p>

      <Modal open={showTerms} onClose={() => setShowTerms(false)} title="Conditions d'utilisation">
        <TermsContent />
      </Modal>
    </section>
  );
}
