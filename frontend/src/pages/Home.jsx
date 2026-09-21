import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import './Home.css';

const ZONES = [
  { img: 'bunker-7', name: 'Bunker 7', text: 'Ultime refuge sous terre. Les lumières ne restent jamais allumées longtemps.', level: 'secure', tag: 'Niveau 2' },
  { img: 'slaughterhouse', name: 'Slaughterhouse', text: 'Chaînes rouillées, sol poisseux. Ce qui y travaillait n’est pas parti.', level: 'critical', tag: 'Niveau 5' },
  { img: 'wasteland-convoy', name: 'Wasteland Convoy', text: 'Un convoi figé au milieu du désert. Le pillage a déjà commencé.', level: 'critical', tag: 'Niveau 4' },
  { img: 'dead-zone', name: 'Dead Zone', text: 'Aucune radio. Aucune carte. Aucun retour garanti.', level: 'critical', tag: 'Niveau 5' },
  { img: 'ground-zero', name: 'Ground Zero', text: 'Le cratère d’origine. La radiation chante dans le noir.', level: 'critical', tag: 'Niveau 5' },
  { img: 'cyber-hive', name: 'Cyber Hive', text: 'Machines survivantes, réseau corrompu, ruche en veille.', level: 'secure', tag: 'Niveau 3' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <img className="hero__img" src="/images/nightfall.jpeg" alt="" />
        <div className="hero__content">
          <span className="badge badge--critical hero__alert">⚠ Zone contaminée</span>
          <h1 className="hero__title glitch" data-text="Nightfall">Nightfall</h1>
          <p className="hero__sub">Survivez à la nuit. Le monde d’avant est mort — le parc, lui, vous attend.</p>
          <div className="hero__cta">
            <Button>Entrer dans la zone</Button>
            <Button variant="ghost">Signal radio</Button>
          </div>
        </div>
      </section>

      <div className="danger-stripe home__stripe" />

      <h2 className="home__heading text-glow-crimson">Zones d’expérience</h2>
      <div className="grid">
        {ZONES.map((z) => (
          <Card key={z.name} title={z.name} image={`/images/${z.img}.jpeg`} badge={<span className={`badge badge--${z.level}`}>{z.tag}</span>}>
            <p>{z.text}</p>
            <Button variant="ghost">Survivre</Button>
          </Card>
        ))}
      </div>
    </>
  );
}
