import { Link } from 'react-router-dom';
import { container } from '../../lib/classNames.js';

export default function Footer() {
  return (
    <footer className="relative border-t border-border-accent py-6 text-center text-sm text-text-muted">
      <div className="danger-stripe absolute -top-px inset-x-0 h-1 opacity-60" aria-hidden="true" />
      <div className={`${container} flex flex-col items-center gap-1`}>
        <p>© {new Date().getFullYear()} Nightfall Project</p>
        <Link to="/conditions" className="hover:text-accent-2">Conditions d'utilisation</Link>
      </div>
    </footer>
  );
}
