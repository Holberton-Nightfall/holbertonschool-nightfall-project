import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import './Home.css';

export default function Home() {
  return (
    <section>
      <h1>Nightfall</h1>
      <p>Bienvenue.</p>
      <div className="grid">
        <Card title="Carte 1"><p>Contenu.</p><Button>Action</Button></Card>
        <Card title="Carte 2"><p>Contenu.</p><Button variant="ghost">Action</Button></Card>
        <Card title="Carte 3"><p>Contenu.</p><Button>Action</Button></Card>
      </div>
    </section>
  );
}
