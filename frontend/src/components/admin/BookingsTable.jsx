import { useEffect, useState } from 'react';
import Badge from '../ui/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDateTime } from '../../lib/slots.js';

// Le statut "Terminée" n'existe pas en base (contrainte confirmed/cancelled) :
// il est calculé à l'affichage quand scheduled_at est passé, comme dans Mon compte.
function bookingStatus(booking) {
  if (booking.status === 'cancelled') return { label: 'Annulée', variant: 'critical' };
  if (new Date(booking.scheduled_at) < new Date()) return { label: 'Terminée', variant: 'muted' };
  return { label: 'Confirmée', variant: 'secure' };
}

export default function BookingsTable() {
  const { getAllBookings } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllBookings()
      .then((data) => { setBookings(data); setStatus('ready'); })
      .catch((err) => { setError(err.message || 'Chargement impossible'); setStatus('error'); });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {status === 'loading' && <p className="text-text-muted">Chargement…</p>}
      {status === 'error' && <p role="alert" className="text-accent">{error}</p>}

      {status === 'ready' && (
        bookings.length === 0 ? (
          <p className="text-text-muted">Aucune réservation.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="p-3 font-heading font-normal">Membre</th>
                  <th className="p-3 font-heading font-normal">Expérience</th>
                  <th className="p-3 font-heading font-normal">Créneau</th>
                  <th className="p-3 font-heading font-normal">Pers.</th>
                  <th className="p-3 font-heading font-normal">Statut</th>
                  <th className="p-3 font-heading font-normal">Réservée le</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const { label, variant } = bookingStatus(b);
                  return (
                    <tr key={b.id} className="border-b border-border/50">
                      <td className="p-3 text-text">{b.first_name} {b.last_name}</td>
                      <td className="p-3 text-text-muted">{b.experience_name}</td>
                      <td className="p-3 text-text-muted">{formatDateTime(new Date(b.scheduled_at))}</td>
                      <td className="p-3 text-text-muted">{b.participants}</td>
                      <td className="p-3"><Badge variant={variant}>{label}</Badge></td>
                      <td className="p-3 text-xs text-text-muted">
                        {b.created_at ? formatDateTime(new Date(b.created_at)) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}