import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sans écouteur, une erreur sur un client inactif (ex. Postgres redémarre)
// est une exception non gérée qui fait tomber tout le process
pool.on('error', (err) => {
  console.error('Erreur inattendue sur un client PostgreSQL inactif :', err);
});