import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

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
      <section className="relative -mx-4 flex min-h-[70vh] items-end overflow-hidden border-b border-border-accent md:-mx-6">
        <img
          className="absolute inset-0 h-full w-full object-cover [filter:grayscale(.5)_contrast(1.15)_brightness(.55)_sepia(.25)]"
          src="/images/nightfall.jpeg"
          alt=""
        />
        <div className="absolute inset-0 [background:linear-gradient(to_top,var(--color-bg)_0%,rgba(8,14,20,.55)_45%,rgba(8,14,20,.2)_100%),radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.8)_100%)]" />
        <div className="relative z-[1] max-w-[720px] px-4 py-10 md:px-6">
          <Badge variant="critical" className="animate-blink motion-reduce:animate-none mb-4">⚠ Zone contaminée</Badge>
          <h1
            className="glitch mb-4 text-[clamp(3rem,14vw,7rem)] font-black text-text [text-shadow:0_0_12px_rgba(255,13,57,.8),0_0_40px_rgba(255,13,57,.35)]"
            data-text="Nightfall"
          >
            Nightfall
          </h1>
          <p className="mb-6 max-w-[46ch] text-[1.1rem] text-text [text-shadow:0_2px_6px_#000]">
            Survivez à la nuit. Le monde d’avant est mort — le parc, lui, vous attend.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button>Entrer dans la zone</Button>
            <Button variant="ghost">Signal radio</Button>
          </div>
        </div>
      </section>

      <div className="danger-stripe -mx-4 mb-10 h-2.5 opacity-70 md:-mx-6" />

      <h2 className="text-glow-crimson mb-6 text-2xl text-accent">Zones d’expérience</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ZONES.map((z) => (
          <Card
            key={z.name}
            title={z.name}
            image={`/images/${z.img}.jpeg`}
            badge={<Badge variant={z.level}>{z.tag}</Badge>}
          >
            <p className="mb-2 text-text-muted">{z.text}</p>
            <Button variant="ghost">Survivre</Button>
          </Card>
        ))}
      </div>
    </>
  );
}
