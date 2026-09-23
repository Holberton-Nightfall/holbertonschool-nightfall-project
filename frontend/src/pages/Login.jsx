import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { inputField } from '../lib/classNames.js';
import { EMAIL_RE } from '../lib/constants.js';

export default function Login() {
  const { login, isAuthenticated, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // `from` vient de RequireAuth (redirection avec la page d'origine en state) :
  // permet de revenir sur la page demandée après connexion, /compte par défaut.
  const from = location.state?.from?.pathname || '/compte';
  const emailValid = EMAIL_RE.test(form.email);
  const canSubmit = emailValid && form.password.length > 0;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <p>Vérification de la session…</p>;
  if (isAuthenticated) return <Navigate to="/compte" replace />;

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-glow-crimson mb-6 text-2xl text-accent">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className={inputField}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Mot de passe
          <PasswordInput
            name="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </label>
        {error && <p role="alert" className="text-accent">{error}</p>}
        <Button type="submit" disabled={submitting || !canSubmit} className="w-full sm:w-auto">
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-text-muted">
        Pas de compte ? <Link to="/inscription" className="text-accent-2">S'inscrire</Link>
      </p>
    </section>
  );
}
