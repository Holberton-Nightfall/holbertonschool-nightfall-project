import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <Link to="/">Retour à l'accueil</Link>
    </section>
  );
}
