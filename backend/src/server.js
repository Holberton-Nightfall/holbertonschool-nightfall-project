// Doit rester le premier import : charge le .env avant que db.js lise process.env
import 'dotenv/config';
import app from './app.js';

// Aucun secret de secours dans le code : sans JWT_SECRET les tokens ne seraient pas sûrs
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET est manquant : définissez-le dans le fichier .env');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API NIGHTFALL démarrée sur le port ${PORT}`);
});