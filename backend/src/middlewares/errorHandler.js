// Les détails de l'erreur restent dans les logs serveur, jamais dans la réponse
export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
}
 