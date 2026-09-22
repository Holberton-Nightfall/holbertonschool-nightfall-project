const SECTIONS = [
  {
    title: '1. Objet',
    text: "Les présentes conditions régissent l'accès et la participation aux expériences immersives proposées par le parc Nightfall.",
  },
  {
    title: '2. Accès et horaires',
    text: "Le parc est ouvert uniquement de 22h à 6h. L'accès est réservé aux personnes de 16 ans et plus ; un accompagnement adulte est obligatoire en dessous.",
  },
  {
    title: '3. Sécurité',
    text: 'Chaque zone est encadrée par une équipe formée. Les mises en scène (effets, obscurité, acteurs) ne présentent pas de danger réel lorsque les consignes de sécurité sont respectées.',
  },
  {
    title: '4. Compte et réservations',
    text: "La création d'un compte est nécessaire pour réserver une expérience. Les informations fournies doivent être exactes. Chaque réservation peut être annulée jusqu'à 48h avant la date prévue.",
  },
  {
    title: '5. Responsabilité',
    text: "Nightfall décline toute responsabilité en cas de non-respect des consignes de sécurité communiquées sur place ou de participation par une personne ne remplissant pas les conditions d'accès.",
  },
  {
    title: '6. Données personnelles',
    text: 'Les données associées à votre compte (nom, email) sont utilisées uniquement pour la gestion de vos réservations et ne sont jamais transmises à des tiers.',
  },
  {
    title: '7. Modification',
    text: 'Ces conditions peuvent être mises à jour à tout moment. La version en vigueur est celle publiée sur cette page.',
  },
];

// Contenu partagé entre la page /conditions et la modal ouverte depuis l'inscription.
export default function TermsContent() {
  return (
    <div className="flex flex-col gap-4">
      {SECTIONS.map((s) => (
        <section key={s.title}>
          <h3 className="mb-1 font-heading text-sm uppercase tracking-[.05em] text-accent-2">{s.title}</h3>
          <p className="text-text-muted">{s.text}</p>
        </section>
      ))}
    </div>
  );
}
