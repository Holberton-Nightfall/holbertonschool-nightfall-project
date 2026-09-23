// critical (rouge) : danger/intensité élevée, annulé, erreur.
// secure (turquoise) : confirmé, validé, intensité faible.
const VARIANTS = {
  critical: 'bg-accent/15 text-accent border-accent',
  secure: 'bg-accent-2/15 text-accent-2 border-accent-2',
  muted: 'bg-text-muted/10 text-text-muted border-border',
};

export default function Badge({ variant = 'critical', className = '', ...props }) {
  return (
    <span
      className={`inline-block border px-2.5 py-0.5 font-heading text-xs uppercase tracking-[.08em] ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
