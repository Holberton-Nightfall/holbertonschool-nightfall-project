import { Navigate, useLocation, useParams } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { formatDateTime } from '../lib/slots.js';

// N'est accessible qu'en sortie du flux de réservation (state du router) :
// un accès direct par URL n'a rien à confirmer, on renvoie vers le formulaire.
export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const { booking, experience } = location.state || {};

  if (!booking || !experience) {
    return <Navigate to={`/reservation/${id}`} replace />;
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 text-center">
      <h1 className="text-glow-crimson text-2xl text-accent">Réservation confirmée</h1>
      <p className="text-text-muted">
        Réservation n°{booking.id} pour <span className="text-text">{experience.name}</span>
      </p>
      <ul className="flex flex-col gap-2 text-left text-text">
        <li>Créneau : {formatDateTime(new Date(booking.scheduled_at))}</li>
        <li>Participants : {booking.participants}</li>
        <li>Statut : {booking.status}</li>
      </ul>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button to="/compte" variant="ghost">Mes réservations</Button>
        <Button to="/catalogue">Retour au catalogue</Button>
      </div>
    </section>
  );
}
