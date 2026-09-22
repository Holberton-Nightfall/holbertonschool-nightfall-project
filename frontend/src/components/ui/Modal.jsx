import { useEffect } from 'react';
import Button from './Button.jsx';

// Fenêtre modale générique : ferme sur Échap, clic sur le fond, ou le bouton Fermer.
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="clip-corner max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-accent/40 bg-bg-elevated p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-glow-crimson mb-4 text-xl text-accent">{title}</h2>
        <div className="mb-6">{children}</div>
        <Button variant="ghost" onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
}
