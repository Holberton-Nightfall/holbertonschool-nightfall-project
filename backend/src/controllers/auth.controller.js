import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const TOKEN_DURATION = '2h';
const BCRYPT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hash factice : permet de toujours comparer un mot de passe dans login,
// même si l'email n'existe pas (voir plus bas)
const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', BCRYPT_ROUNDS);

// L'identifiant de l'utilisateur est stocké dans le champ standard "sub"
function signToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: TOKEN_DURATION,
    algorithm: 'HS256',
  });
}

// Espaces retirés, minuscules : l'unicité en base ignore la casse
const normalizeEmail = (email) => email.trim().toLowerCase();

// Jamais de password_hash dans une réponse
const publicUser = ({ id, first_name, last_name, email, role }) => ({
  id,
  first_name,
  last_name,
  email,
  role,
});

export async function register(req, res, next) {
  try {
    // Express 5 : req.body vaut undefined si aucun JSON n'est envoyé
    const { first_name, last_name, email, password } = req.body ?? {};
    const errors = [];

    const cleanFirstName = typeof first_name === 'string' ? first_name.trim() : '';
    if (cleanFirstName.length === 0 || cleanFirstName.length > 100) {
      errors.push('first_name est obligatoire (100 caractères maximum)');
    }

    const cleanLastName = typeof last_name === 'string' ? last_name.trim() : '';
    if (cleanLastName.length === 0 || cleanLastName.length > 100) {
      errors.push('last_name est obligatoire (100 caractères maximum)');
    }

    // La longueur est testée avant la regex pour ne pas la lancer sur un texte énorme
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    if (cleanEmail.length === 0 || cleanEmail.length > 255 || !EMAIL_REGEX.test(cleanEmail)) {
      errors.push('email invalide');
    }

    if (typeof password !== 'string' || password.length < 8) {
      errors.push('password doit contenir au moins 8 caractères');
    } else if (Buffer.byteLength(password) > 72) {
      // bcrypt ignore tout ce qui dépasse 72 octets
      errors.push('password ne doit pas dépasser 72 octets');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Données invalides', details: errors });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Le rôle n'est pas dans la requête : la base applique 'member' par défaut
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, email, role`,
      [cleanFirstName, cleanLastName, normalizeEmail(cleanEmail), passwordHash]
    );

    const user = rows[0];
    res.status(201).json({ user: publicUser(user), token: signToken(user.id) });
  } catch (err) {
    // 23505 = violation d'unicité. Il n'y a pas d'index lower(email) en base :
    // c'est la normalisation ci-dessus qui garantit que deux emails identiques
    // à la casse près finissent stockés sous la même forme.
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res
        .status(400)
        .json({ error: 'Données invalides', details: ['email et password sont obligatoires'] });
    }

    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, role, password_hash FROM users WHERE lower(email) = $1',
      [normalizeEmail(email)]
    );
    const user = rows[0];

    // On compare toujours, même si l'email est inconnu : le temps de réponse
    // ne révèle pas si le compte existe
    const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

    // Même message dans les deux cas : on ne dit pas ce qui est faux
    if (!user || !passwordOk) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    res.json({ user: publicUser(user), token: signToken(user.id) });
  } catch (err) {
    next(err);
  }
}

// requireAuth a déjà chargé l'utilisateur dans req.user
export function me(req, res) {
  res.json(req.user);
}