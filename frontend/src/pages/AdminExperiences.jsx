import { useAuth } from '../context/AuthContext.jsx';

// Page provisoire : elle sert uniquement à vérifier RequireAdmin.
// Le CRUD des expériences arrivera quand les routes admin seront mergées.
export default function AdminExperiences() {
  const { user } = useAuth();

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-glow-crimson text-2xl text-accent">Administration</h1>
      <p className="text-text-muted">
        Connecté en tant que {user.first_name} {user.last_name} ({user.role}).
      </p>
      <p className="text-text-muted">
        Gestion des expériences et liste des réservations à venir.
      </p>
    </section>
  );
}
