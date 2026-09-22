const BASE = 'clip-corner-sm min-h-11 px-6 border border-transparent font-heading font-bold text-[.85rem] uppercase tracking-[.1em] cursor-pointer transition-all duration-300';

const VARIANTS = {
  primary: 'bg-accent text-white [filter:drop-shadow(0_0_8px_rgba(255,13,57,.6))] hover:bg-accent-hover hover:-translate-y-0.5 hover:[filter:drop-shadow(0_0_14px_rgba(255,13,57,.9))]',
  ghost: 'bg-bg-elevated border-text-muted text-text hover:border-accent-2 hover:text-accent-2 hover:[filter:drop-shadow(0_0_6px_rgba(0,229,255,.5))]',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}
