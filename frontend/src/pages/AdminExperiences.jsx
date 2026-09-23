import { useState } from 'react';
import ExperiencesTable from '../components/admin/ExperiencesTable.jsx';
import BookingsTable from '../components/admin/BookingsTable.jsx';

const TABS = [
  { id: 'experiences', label: 'Expériences' },
  { id: 'bookings', label: 'Réservations' },
];

export default function AdminExperiences() {
  const [tab, setTab] = useState('experiences');

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-glow-crimson text-2xl text-accent">Administration</h1>

      <div role="tablist" className="flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 pb-2 font-heading text-[.85rem] uppercase tracking-[.08em] transition-colors ${
              tab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-accent-2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'experiences' ? <ExperiencesTable /> : <BookingsTable />}
    </section>
  );
}