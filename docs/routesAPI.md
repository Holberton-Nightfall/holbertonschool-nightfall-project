# API NIGHTFALL Documentation des routes

API REST (Node.js / Express / PostgreSQL) du parc immersif NIGHTFALL.

- **Base URL** : `http://localhost:3000/api`
- **Format** : JSON en entrée et en sortie (`Content-Type: application/json`)
- **Authentification** : JWT dans le header `Authorization: Bearer <token>`
- **Rôles** : `member` (défaut) et `admin`

> **Convention de nommage** : les champs JSON suivent les noms des colonnes PostgreSQL de `db/01_schema.sql` (`snake_case`), par exemple `image_url`, `duration_min`, `max_participants`. Les expériences sont renvoyées à plat, avec `category_id` et `category_name`.
>
> **Source de vérité** : `db/01_schema.sql`. Toute modification d'un nom de colonne se fait en même temps dans le schéma, le seed, le code et ce document.

## Statut d'implémentation

| Symbole | Signification |
|---|---|
| ✅ | Implémentée et mergée sur `main` |
| ⏳ | Conçue, à implémenter |

---

## Codes de réponse et format d'erreur

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Données invalides |
| 401 | Non authentifié ou token invalide |
| 403 | Droits insuffisants (non propriétaire, non admin, règle des 48 h) |
| 404 | Ressource introuvable |
| 409 | Conflit (email déjà utilisé, réservation déjà annulée…) |
| 500 | Erreur interne (message générique, détails dans les logs serveur) |

Format d'erreur unique :

```json
{ "error": "Message lisible" }
```

Pour une erreur de validation, un tableau `details` peut être ajouté :

```json
{
  "error": "Données invalides",
  "details": ["participants doit être un entier strictement positif"]
}
```

---

## Récapitulatif

| Statut | Méthode | URL | Accès | Description |
|---|---|---|---|---|
| ✅ | GET | `/api/health` | Public | Vérifier que l'API répond |
| ✅ | POST | `/api/auth/register` | Public | Créer un compte |
| ✅ | POST | `/api/auth/login` | Public | Se connecter |
| ✅ | GET | `/api/auth/me` | Connecté | Profil de l'utilisateur courant |
| ✅ | PUT | `/api/auth/me` | Connecté | Modifier prénom/nom |
| ✅ | PUT | `/api/auth/email` | Connecté | Modifier l'email |
| ✅ | PUT | `/api/auth/password` | Connecté | Modifier le mot de passe |
| ✅ | DELETE | `/api/auth/me` | Connecté | Supprimer le compte (soft delete) |
| ✅ | GET | `/api/categories` | Public | Liste des catégories |
| ✅ | GET | `/api/experiences` | Public | Catalogue, recherche et filtres |
| ✅ | GET | `/api/experiences/:id` | Public | Fiche détaillée |
| ✅ | POST | `/api/bookings` | Connecté | Réserver une expérience |
| ✅ | GET | `/api/bookings` | Connecté | Mes réservations |
| ⏳ | GET | `/api/bookings/:id` | Propriétaire | Détail d'une réservation |
| ⏳ | DELETE | `/api/bookings/:id` | Propriétaire | Annuler (règle des 48 h) |
| ⏳ | GET | `/api/admin/experiences` | Admin | Toutes les expériences (archivées incluses) |
| ⏳ | POST | `/api/experiences` | Admin | Créer une expérience |
| ⏳ | PUT | `/api/experiences/:id` | Admin | Modifier une expérience |
| ⏳ | DELETE | `/api/experiences/:id` | Admin | Supprimer ou archiver |
| ⏳ | GET | `/api/admin/bookings` | Admin | Toutes les réservations |

---

## Santé

### `GET /api/health` ✅

**Accès** : public

**Réponse 200**

```json
{ "status": "ok" }
```

---

## Authentification

### `POST /api/auth/register` ⏳

**Accès** : public

**Body**

```json
{
  "first_name": "Alice",
  "last_name": "Martin",
  "email": "alice@example.com",
  "password": "motdepasse123"
}
```

**Règles**

- Tous les champs sont obligatoires.
- L'email doit être valide et unique.
- Le mot de passe fait au moins 8 caractères. Il est hashé avec bcrypt et n'est jamais stocké ni renvoyé en clair.
- Le champ `role` n'est **jamais** lu depuis le body : tout nouveau compte est `member`.

**Réponse 201**

```json
{
  "user": { "id": 4, "first_name": "Alice", "last_name": "Martin", "email": "alice@example.com", "role": "member" },
  "token": "<jwt>"
}
```

**Erreurs** : 400 (validation), 409 (email déjà utilisé)

### `POST /api/auth/login` ⏳

**Accès** : public

**Body**

```json
{ "email": "alice@example.com", "password": "motdepasse123" }
```

**Réponse 200** : même structure que `register`.

**Erreurs** : 400, 401 (message générique « Identifiants invalides », sans préciser si c'est l'email ou le mot de passe qui est faux)

### `GET /api/auth/me` ⏳

**Accès** : connecté

**Réponse 200**

```json
{ "id": 4, "first_name": "Alice", "last_name": "Martin", "email": "alice@example.com", "role": "member" }
```

**Erreurs** : 401

> La déconnexion se fait côté front en supprimant le token. Aucune route n'est nécessaire.

### `PUT /api/auth/me` ⏳

**Accès** : connecté

**Body**

\`\`\`json
{ "first_name": "Alice", "last_name": "Dupont" }
\`\`\`

**Règles** : mêmes contraintes que `register` sur `first_name`/`last_name`.

**Réponse 200** : même structure que `GET /api/auth/me`.

**Erreurs** : 400, 401

### `PUT /api/auth/email` ⏳

**Accès** : connecté

**Body**

\`\`\`json
{ "new_email": "alice2@example.com", "new_email_confirmation": "alice2@example.com" }
\`\`\`

**Règles**

- `new_email` doit être valide et différent de l'email actuel.
- `new_email_confirmation` doit être identique à `new_email`.

**Réponse 200** : même structure que `GET /api/auth/me`.

**Erreurs** : 400, 401, 409 (email déjà utilisé)

### `PUT /api/auth/password` ⏳

**Accès** : connecté

**Body**

\`\`\`json
{
  "current_password": "motdepasse123",
  "new_password": "nouveaumdp456",
  "new_password_confirmation": "nouveaumdp456"
}
\`\`\`

**Règles**

- `current_password` doit correspondre au mot de passe actuel.
- `new_password` suit les mêmes règles que `register` (8 caractères minimum, 72 octets maximum).
- `new_password_confirmation` doit être identique à `new_password`.

**Réponse 200**

\`\`\`json
{ "message": "Mot de passe modifié" }
\`\`\`

**Erreurs** : 400, 401 (mot de passe actuel incorrect ou non connecté)

### `DELETE /api/auth/me` ⏳

**Accès** : connecté

Suppression en **soft delete** : la ligne `users` est conservée (`deleted_at` renseigné), afin de ne pas casser l'historique des réservations liées.

**Réponse 200**

\`\`\`json
{ "message": "Compte supprimé" }
\`\`\`

**Erreurs** : 401

> Après suppression, le token devient invalide au prochain appel (`requireAuth` vérifie `deleted_at IS NULL`).


---

## Catégories

### `GET /api/categories` ⏳

**Accès** : public

**Réponse 200**

```json
[
  { "id": 3, "name": "Escape Game" },
  { "id": 2, "name": "Horreur" }
]
```

Les résultats sont triés par nom.

---

## Expériences (catalogue public)

### `GET /api/experiences` ⏳

**Accès** : public

**Paramètres de requête** (tous optionnels)

| Paramètre | Description | Exemple |
|---|---|---|
| `search` | Recherche partielle, insensible à la casse, sur le nom | `?search=bunker` |
| `category` | Filtre par **id** de catégorie (entier, sinon 400) | `?category=2` |

Les paramètres se combinent : `?search=bunker&category=1`.

**Réponse 200**

```json
[
  {
    "id": 1,
    "name": "Le Bunker 7 — Protocole Lazare",
    "description": "Équipe d'extraction envoyée dans un bunker souterrain…",
    "image_url": "/images/bunker-7.jpeg",
    "duration_min": 45,
    "intensity": 4,
    "max_participants": 6,
    "price": "35.00",
    "category_id": 1,
    "category_name": "Survie"
  }
]
```

**Règles**

- Seules les expériences non archivées (`is_archived = false`) sont renvoyées.
- Les requêtes SQL sont paramétrées (`$1`, `$2`) pour éviter toute injection.
- `price` est renvoyé sous forme de chaîne, car le type `NUMERIC` de PostgreSQL est sérialisé ainsi par le driver `pg`. Le front doit le convertir avec `Number()` ou `parseFloat()` avant tout calcul.
- Les images sont servies par le front depuis `frontend/public/images/`.

**Erreurs** : 400 (`category` n'est pas un entier)

### `GET /api/experiences/:id` ⏳

**Accès** : public

**Réponse 200** : l'expérience complète (toutes les colonnes de la table `experiences`, plus `category_name`).

**Erreurs**

| Code | Cas |
|---|---|
| 400 | `id` n'est pas un entier |
| 404 | Expérience inexistante ou archivée |

---

## Réservations (membre connecté)

Toutes les routes de cette section exigent un token valide (401 sinon). L'utilisateur est toujours identifié par le token, jamais par le body.

### `POST /api/bookings` ⏳

**Body**

```json
{
  "experience_id": 1,
  "scheduled_at": "2026-10-15T14:30:00Z",
  "participants": 4
}
```

**Vérifications côté back-end**

1. L'expérience existe et n'est pas archivée.
2. `scheduled_at` est une date valide, située dans le futur.
3. `participants` est un entier strictement positif.
4. `participants` ne dépasse pas `max_participants` de l'expérience.

**Réponse 201**

```json
{
  "id": 12,
  "experience_id": 1,
  "scheduled_at": "2026-10-15T14:30:00.000Z",
  "participants": 4,
  "status": "confirmed"
}
```

**Erreurs** : 400, 401, 404

> Le paiement est simulé : la réservation est directement confirmée. La capacité cumulée par créneau n'est pas gérée dans le MVP.

### `GET /api/bookings` ⏳

Renvoie uniquement les réservations de l'utilisateur connecté, triées par date.

**Réponse 200**

```json
[
  {
    "id": 12,
    "experience_id": 1,
    "experience_name": "Le Bunker 7 — Protocole Lazare",
    "scheduled_at": "2026-10-15T14:30:00.000Z",
    "participants": 4,
    "status": "confirmed",
    "can_cancel": true
  }
]
```

`can_cancel` est calculé par le serveur (réservation confirmée et plus de 48 h avant l'expérience). Il sert uniquement à l'affichage : le vrai contrôle est fait par `DELETE /api/bookings/:id`.

### `GET /api/bookings/:id` ⏳

**Réponse 200** : le détail d'une réservation, même structure qu'un élément de la liste.

**Erreurs**

| Code | Cas |
|---|---|
| 401 | Non connecté |
| 403 | La réservation appartient à un autre utilisateur |
| 404 | Réservation inexistante |

### `DELETE /api/bookings/:id` ⏳

Annule une réservation. La ligne n'est pas supprimée : son statut passe à `cancelled` et `cancelled_at` est renseigné.

**Vérifications côté back-end (dans cet ordre)**

1. La réservation existe (404).
2. Elle appartient à l'utilisateur connecté (403).
3. Elle n'est pas déjà annulée (409).
4. Il reste **plus de 48 h** avant `scheduled_at`, sinon refus (403, « Annulation impossible moins de 48h avant l'expérience »).

**Réponse 200**

```json
{ "message": "Réservation annulée", "booking": { "id": 12, "status": "cancelled" } }
```

---

## Administration

Toutes les routes de cette section passent par deux middlewares : `authenticate` (401 si non connecté) puis `requireAdmin` (403 si le rôle n'est pas `admin`).

### `GET /api/admin/experiences` ⏳

Renvoie toutes les expériences, y compris archivées, avec le champ `is_archived`.

### `POST /api/experiences` ⏳

**Body**

```json
{
  "name": "Bunker abandonné",
  "description": "Survivez 90 minutes dans un bunker sans issue apparente.",
  "image_url": "/images/bunker.jpeg",
  "category_id": 1,
  "duration_min": 90,
  "intensity": 5,
  "max_participants": 8,
  "price": 34.5
}
```

**Validation** : champs obligatoires, catégorie existante, `duration_min` et `max_participants` strictement positifs, `price` positif ou nul, `intensity` entre 1 et 5.

**Réponse 201** : l'expérience créée.

**Erreurs** : 400, 401, 403

### `PUT /api/experiences/:id` ⏳

**Body** : mêmes champs que pour la création.

**Réponse 200** : l'expérience modifiée.

**Erreurs** : 400, 401, 403, 404

### `DELETE /api/experiences/:id` ⏳

Comportement retenu :

| Situation | Effet | Réponse |
|---|---|---|
| Aucune réservation liée | Suppression réelle | `200 { "message": "Expérience supprimée" }` |
| Au moins une réservation liée | Archivage (`is_archived = true`) | `200 { "message": "Expérience archivée", "archived": true }` |

**Justification** : l'historique des réservations est conservé sans clé étrangère orpheline (la base bloque de toute façon la suppression grâce à `ON DELETE RESTRICT`), et l'expérience disparaît du catalogue public.

**Erreurs** : 401, 403, 404

### `GET /api/admin/bookings` ⏳

**Réponse 200**

```json
[
  {
    "id": 12,
    "user_id": 2,
    "user_name": "Alex Martin",
    "user_email": "membre@nightfall.dev",
    "experience_id": 1,
    "experience_name": "Le Bunker 7 — Protocole Lazare",
    "scheduled_at": "2026-10-15T14:30:00.000Z",
    "participants": 4,
    "status": "confirmed",
    "created_at": "2026-09-21T10:00:00.000Z"
  }
]
```

> **Bonus (P3, après le MVP)** : filtres optionnels `experience_id`, `status`, `from`, `to`.

---

## Règles de sécurité appliquées

- Mots de passe hashés avec bcrypt, `password_hash` jamais renvoyé.
- Le rôle, l'identifiant utilisateur et le statut sont déterminés par le serveur, jamais lus dans le body.
- Requêtes SQL paramétrées.
- Règle des 48 h et propriété d'une réservation vérifiées côté back-end.
- Routes admin protégées par `authenticate` + `requireAdmin`.
- Aucun secret dans le dépôt : `.env` est ignoré par Git, `.env.example` contient uniquement des valeurs de développement.