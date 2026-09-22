import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-10 text-center">
      <Badge variant="critical" className="animate-blink motion-reduce:animate-none">⚠ Zone hors limites</Badge>
      <h1 className="text-glow-crimson m-0 text-[clamp(4rem,18vw,8rem)]">404</h1>
      <p className="max-w-[40ch] text-text-muted">Signal perdu. Cette zone n'existe pas ou a été purgée.</p>
      <Link to="/"><Button>Retour à l'accueil</Button></Link>
    </section>
  );
}
