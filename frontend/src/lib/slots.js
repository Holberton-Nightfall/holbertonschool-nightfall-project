const MS_PER_MIN = 60000;
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;
const DAYS_AHEAD = 30;

// Les expériences se déroulent de nuit (22h-6h), aucun créneau n'est stocké en
// base : ils sont générés ici, espacés de la durée de l'expérience, sur les
// 30 prochains jours.
export function generateNightSlots(durationMin, now = new Date()) {
  const nights = [];
  for (let d = 0; d < DAYS_AHEAD; d += 1) {
    const nightStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, NIGHT_START_HOUR, 0, 0, 0);
    const nightEnd = new Date(nightStart.getFullYear(), nightStart.getMonth(), nightStart.getDate() + 1, NIGHT_END_HOUR, 0, 0, 0);

    const times = [];
    for (let t = nightStart.getTime(); t < nightEnd.getTime(); t += durationMin * MS_PER_MIN) {
      const slot = new Date(t);
      if (slot > now) times.push(slot);
    }

    if (times.length > 0) {
      nights.push({ key: nightStart.toISOString().slice(0, 10), date: nightStart, times });
    }
  }
  return nights;
}

export const formatNightLabel = (date) =>
  date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatTime = (date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (date) =>
  date.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
