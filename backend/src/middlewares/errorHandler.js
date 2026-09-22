// Les détails de l'erreur restent dans les logs serveur, jamais dans la réponse
export function errorHandler(err, req, res, next) {
  // Réponse déjà commencée : on laisse Express fermer la connexion
  if (res.headersSent) {
    return next(err);
  }

  // Erreurs client (ex. JSON mal formé, body trop gros) : le code 4xx est conservé.
  // Tout le reste est une erreur serveur : 500 générique.
  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 500
      ? err.status
      : 500;

  if (status === 500) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }

  let message = 'Requête invalide';
  if (err.type === 'entity.parse.failed') message = 'JSON invalide';
  else if (status === 413) message = 'Corps de la requête trop volumineux';

  res.status(status).json({ error: message });
}