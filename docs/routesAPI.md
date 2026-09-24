# API NIGHTFALL — Documentation des routes

API REST (Node.js / Express / PostgreSQL) du parc immersif NIGHTFALL.

- **Base URL** : `http://localhost:3000/api`
- **Format** : JSON en entrée et en sortie (`Content-Type: application/json`)
- **Authentification** : JWT dans le header `Authorization: Bearer <token>`
- **Rôles** : `member` (défaut) et `admin`

> **Convention de nommage** : les champs JSON suivent les noms des colonnes PostgreSQL de `db/01_schema.sql` (`snake_case`), par exemple `image_url`, `duration_min`, `max_participants`. Les expériences sont renvoyées à plat, avec `category_id` et `category_name`.
>
> **Source de vérité** : `db/01_schema.sql` pour les données, `backend/src/routes/` pour les URL. Toute modification se fait en même temps dans le code et dans ce document.

---

## Codes de réponse et format d'erreur

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Données ou paramètres invalides |
| 401 | Non authentifié ou token invalide |
| 403 | Droits insuffisants (non propriétaire, non admin, règle des 48 h) |
| 404 | Ressource ou route introuvable |
| 409 | Conflit (email déjà utilisé, réservation déjà annulée) |
| 500 | Erreur interne (message générique, détails dans les logs serveur) |

Format d'erreur unique :

```json
{ "error": "Message lisible" }
```

Pour une erreur de validation, un tableau `details` est ajouté :

```json
{
  "error": "Données invalides",
  "details": ["participants doit être un entier strictement positif"]
}
```

Une URL inconnue renvoie `404 { "error": "Route introuvable" }`.

---

## Récapitulatif

Les 20 routes ci-dessous sont implémentées et couvertes par `scripts/test-api.sh`.

| Méthode | URL | Accès | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Vérifier que l'API répond |
| POST | `/api/auth/register` | Public | Créer un compte |
| POST | `/api/auth/login` | Public | Se connecter |
| GET | `/api/auth/me` | Connecté | Profil de l'utilisateur courant |
| PUT | `/api/auth/me` | Connecté | Modifier prénom et nom |
| PUT | `/api/auth/email` | Connecté | Modifier l'email |
| PUT | `/api/auth/password` | Connecté | Modifier le mot de passe |
| DELETE | `/api/auth/me` | Connecté | Supprimer le compte (soft delete) |
| GET | `/api/categories` | Public | Liste des catégories |
| GET | `/api/experiences` | Public | Catalogue, recherche et filtres |
| GET | `/api/experiences/:id` | Public | Fiche détaillée |
| POST | `/api/bookings` | Connecté | Réserver une expérience |
| GET | `/api/bookings` | Connecté | Mes réservations |
| GET | `/api/bookings/:id` | Propriétaire | Détail d'une réservation |
| DELETE | `/api/bookings/:id` | Propriétaire | Annuler (règle des 48 h) |
| GET | `/api/admin/experiences` | Admin | Toutes les expériences, archivées incluses |
| POST | `/api/admin/experiences` | Admin | Créer une expérience |
| PUT | `/api/admin/experiences/:id` | Admin | Modifier une expérience |
| PATCH | `/api/admin/experiences/:id/archive` | Admin | Archiver ou restaurer |
| GET | `/api/admin/bookings` | Admin | Toutes les réservations |

---

## Santé

### `GET /api/health`

**Accès** : public

**Réponse 200**

```json
{ "status": "ok" }
```

---

## Authentification

### `POST /api/auth/register`

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

- `first_name` et `last_name` sont obligatoires, 100 caractères maximum.
- L'email doit être valide et unique. L'unicité est insensible à la casse, via un index sur `lower(email)`.
- Le mot de passe fait au moins 8 caractères et au plus 72 octets (limite de bcrypt). Il est haché avec bcrypt et n'est jamais stocké ni renvoyé en clair.
- Le champ `role` n'est **jamais** lu depuis le body : tout nouveau compte est `member`.

**Réponse 201**

```json
{
  "user": { "id": 4, "first_name": "Alice", "last_name": "Martin", "email": "alice@example.com", "role": "member" },
  "token": "<jwt>"
}
```

**Erreurs** : 400 (validation), 409 (email déjà utilisé)

### `POST /api/auth/login`

**Accès** : public

**Body**

```json
{ "email": "alice@example.com", "password": "motdepasse123" }
```

**Réponse 200** : même structure que `register`.

Le token contient uniquement l'identifiant (`sub`), la date d'émission et l'expiration. Le rôle n'y figure pas : il est relu en base à chaque requête par `requireAuth`. Durée de validité : 2 h (`TOKEN_DURATION`).

Un compte supprimé (`deleted_at` renseigné) ne peut plus se connecter.

**Erreurs** : 400, 401 (message générique « Identifiants invalides », sans préciser si c'est l'email ou le mot de passe qui est faux)

### `GET /api/auth/me`

**Accès** : connecté

**Réponse 200**

```json
{ "id": 4, "first_name": "Alice", "last_name": "Martin", "email": "alice@example.com", "role": "member" }
```

**Erreurs** : 401

> La déconnexion se fait côté front en supprimant le token. Aucune route n'est nécessaire.

### `PUT /api/auth/me`

**Accès** : connecté

**Body**

```json
{ "first_name": "Alice", "last_name": "Dupont" }
```

**Règles** : `first_name` et `last_name` obligatoires, 100 caractères maximum.

**Réponse 200** : l'utilisateur mis à jour, même structure que `GET /api/auth/me`.

**Erreurs** : 400, 401

### `PUT /api/auth/email`

**Accès** : connecté

**Body**

```json
{ "new_email": "alice2@example.com", "new_email_confirmation": "alice2@example.com" }
```

**Règles**

- `new_email` doit être valide.
- `new_email_confirmation` doit être identique à `new_email`.

**Réponse 200** : l'utilisateur mis à jour, même structure que `GET /api/auth/me`.

**Erreurs** : 400, 401, 409 (email déjà utilisé)

### `PUT /api/auth/password`

**Accès** : connecté

**Body**

```json
{
  "current_password": "motdepasse123",
  "new_password": "nouveaumdp456",
  "new_password_confirmation": "nouveaumdp456"
}
```

**Règles**

- `current_password` est obligatoire et doit correspondre au mot de passe actuel.
- `new_password` : 8 caractères minimum, 72 octets maximum.
- `new_password_confirmation` doit être identique à `new_password`.

**Réponse 200**

```json
{ "message": "Mot de passe modifié" }
```

**Erreurs** : 400, 401 (non connecté, ou « Mot de passe actuel incorrect »)

### `DELETE /api/auth/me`

**Accès** : connecté

Suppression en **soft delete** : la ligne `users` est conservée et `deleted_at` est renseigné. Une suppression réelle effacerait aussi les réservations du membre, car `bookings.user_id` est en `ON DELETE CASCADE` : le soft delete préserve cet historique.

**Réponse 200**

```json
{ "message": "Compte supprimé" }
```

**Erreurs** : 401

> Après suppression, le token devient invalide au prochain appel (`requireAuth` vérifie `deleted_at IS NULL`).

---

## Catégories

### `GET /api/categories`

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

### `GET /api/experiences`

**Accès** : public

**Paramètres de requête** (tous optionnels, combinables)

| Paramètre | Description | Exemple |
|---|---|---|
| `search` | Recherche partielle, insensible à la casse, sur le nom ou la description | `?search=bunker` |
| `category` | Filtre par **id** de catégorie (entier) | `?category=2` |
| `min_price` | Prix minimum (nombre positif ou nul) | `?min_price=20` |
| `max_price` | Prix maximum (nombre positif ou nul, supérieur ou égal à `min_price`) | `?max_price=35` |
| `intensity` | Niveau d'intensité (entier de 1 à 5) | `?intensity=4` |

Exemple combiné : `?search=bunker&category=1&max_price=40`.

**Réponse 200**

```json
[
  {
    "id": 1,
    "name": "Le Bunker 7 — Protocole Lazare",
    "description": "Équipe d'extraction envoyée dans un bunker souterrain…",
    "image_url": "/images/experiences/bunker-7.jpeg",
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

- Seules les expériences non archivées (`is_archived = false`) sont renvoyées. Pour les inclure, voir `GET /api/admin/experiences`.
- Les requêtes SQL sont paramétrées (`$1`, `$2`) pour éviter toute injection.
- `price` est renvoyé sous forme de chaîne, car le type `NUMERIC` de PostgreSQL est sérialisé ainsi par le driver `pg`. Le front le convertit avec `Number()` avant tout calcul.
- Les images sont servies par le front depuis `frontend/public/images/experiences/`. Un chemin invalide affiche l'image de secours.

**Erreurs** : 400 (« Paramètres invalides », avec `details`)

### `GET /api/experiences/:id`

**Accès** : public

**Réponse 200** : l'expérience complète (toutes les colonnes de la table `experiences`, plus `category_name`).

**Erreurs**

| Code | Cas |
|---|---|
| 400 | `id` n'est pas un entier (« Identifiant invalide ») |
| 404 | Expérience inexistante ou archivée |

---

## Réservations (membre connecté)

Toutes les routes de cette section passent par `requireAuth` (401 sinon). L'utilisateur est toujours identifié par le token, jamais par le body.

### `POST /api/bookings`

**Body**

```json
{
  "experience_id": 1,
  "scheduled_at": "2026-10-15T21:00:00Z",
  "participants": 4
}
```

**Vérifications côté back-end**

1. `experience_id` est un entier.
2. `scheduled_at` est une date ISO 8601 valide, située dans le futur.
3. `participants` est un entier strictement positif.
4. L'expérience existe et n'est pas archivée (404 sinon).
5. `participants` ne dépasse pas `max_participants` de l'expérience (400 sinon).

**Réponse 201**

```json
{
  "id": 12,
  "experience_id": 1,
  "scheduled_at": "2026-10-15T21:00:00.000Z",
  "participants": 4,
  "status": "confirmed"
}
```

**Erreurs** : 400, 401, 404

> Le paiement est simulé : la réservation est directement confirmée. La capacité cumulée par créneau n'est pas gérée dans le MVP.

### `GET /api/bookings`

Renvoie uniquement les réservations de l'utilisateur connecté, triées par `scheduled_at` croissant.

**Réponse 200**

```json
[
  {
    "id": 12,
    "experience_id": 1,
    "experience_name": "Le Bunker 7 — Protocole Lazare",
    "scheduled_at": "2026-10-15T21:00:00.000Z",
    "participants": 4,
    "status": "confirmed",
    "can_cancel": true
  }
]
```

`can_cancel` est calculé en SQL par le serveur (réservation confirmée et plus de 48 h avant l'expérience). Il sert uniquement à l'affichage : le vrai contrôle est fait par `DELETE /api/bookings/:id`.

`created_at` et `cancelled_at` ne sont pas renvoyés par cette route. Ils le sont par `GET /api/admin/bookings`.

### `GET /api/bookings/:id`

**Réponse 200** : le détail d'une réservation, même structure qu'un élément de la liste.

**Erreurs**

| Code | Cas |
|---|---|
| 400 | `id` n'est pas un entier strictement positif |
| 401 | Non connecté |
| 403 | La réservation appartient à un autre utilisateur |
| 404 | Réservation inexistante |

### `DELETE /api/bookings/:id`

Annule une réservation. La ligne n'est pas supprimée : son statut passe à `cancelled` et `cancelled_at` est renseigné dans la même requête (la contrainte `chk_bookings_cancelled` impose que les deux soient cohérents).

L'annulation est un `UPDATE` conditionnel unique : la fenêtre des 48 h est vérifiée par la base au moment de l'écriture, ce qui évite toute situation de concurrence. Si aucune ligne n'est touchée, une requête de diagnostic détermine le code d'erreur.

**Cas d'erreur**

| Code | Cas |
|---|---|
| 400 | `id` n'est pas un entier strictement positif |
| 401 | Non connecté |
| 403 | Non propriétaire, ou moins de 48 h avant `scheduled_at` |
| 404 | Réservation inexistante |
| 409 | Réservation déjà annulée |

**Réponse 200**

```json
{ "message": "Réservation annulée", "booking": { "id": 12, "status": "cancelled" } }
```

---

## Administration

Toutes les routes de cette section sont montées sous `/api/admin` et passent par deux middlewares : `requireAuth` (401 si non connecté) puis `requireAdmin` (403 si le rôle n'est pas `admin`).

### `GET /api/admin/experiences`

Renvoie toutes les expériences, archivées incluses, triées par `is_archived` puis par nom : les actives d'abord.

**Réponse 200** : même structure que `GET /api/experiences`, plus `is_archived`.

```json
[
  {
    "id": 1,
    "name": "Le Bunker 7 — Protocole Lazare",
    "description": "…",
    "image_url": "/images/experiences/bunker-7.jpeg",
    "duration_min": 45,
    "intensity": 4,
    "max_participants": 6,
    "price": "35.00",
    "is_archived": false,
    "category_id": 1,
    "category_name": "Survie"
  }
]
```

**Erreurs** : 401, 403

### `POST /api/admin/experiences`

**Body**

```json
{
  "name": "Bunker abandonné",
  "description": "Survivez 90 minutes dans un bunker sans issue apparente.",
  "image_url": "/images/experiences/bunker.jpeg",
  "category_id": 1,
  "duration_min": 90,
  "intensity": 5,
  "max_participants": 8,
  "price": 34.5
}
```

**Validation** : tous les champs sont obligatoires, `category_id` doit exister, `duration_min` et `max_participants` sont des entiers strictement positifs, `price` est positif ou nul, `intensity` est un entier entre 1 et 5.

**Réponse 201** : l'expérience créée, avec son `id` et `is_archived: false`. `category_name` n'est pas renvoyé.

**Erreurs** : 400 (validation ou catégorie inexistante), 401, 403

### `PUT /api/admin/experiences/:id`

**Body** : mêmes champs que pour la création. Mise à jour partielle : seuls les champs fournis sont validés et modifiés.

```json
{ "price": 39.9 }
```

**Réponse 200** : l'expérience modifiée, même structure que la création.

**Erreurs** : 400 (identifiant invalide, validation, catégorie inexistante ou « Aucun champ à mettre à jour »), 401, 403, 404

> La sémantique HTTP stricte voudrait `PATCH` pour une mise à jour partielle. `PUT` est conservé pour le MVP.

### `PATCH /api/admin/experiences/:id/archive`

Archive ou restaure une expérience. Il n'y a aucune suppression physique d'expérience dans l'API : l'historique des réservations reste valide (`ON DELETE RESTRICT`), et une expérience archivée disparaît du catalogue public.

**Body** (optionnel)

```json
{ "is_archived": false }
```

- `true` archive, `false` restaure.
- Sans body, la route archive.
- Toute autre valeur qu'un booléen renvoie 400.

**Réponse 200**

```json
{
  "message": "Expérience archivée",
  "experience": { "id": 8, "name": "Station Kepler — Dernier Signal", "is_archived": true }
}
```

Le message devient « Expérience désarchivée » lorsque `is_archived` vaut `false`.

**Erreurs** : 400, 401, 403, 404

### `GET /api/admin/bookings`

Renvoie toutes les réservations, tous membres confondus, triées par `scheduled_at` décroissant.

**Réponse 200**

```json
[
  {
    "id": 12,
    "user_id": 2,
    "first_name": "Alex",
    "last_name": "Martin",
    "user_email": "membre@nightfall.dev",
    "experience_id": 1,
    "experience_name": "Le Bunker 7 — Protocole Lazare",
    "scheduled_at": "2026-10-15T21:00:00.000Z",
    "participants": 4,
    "status": "confirmed",
    "created_at": "2026-09-23T10:59:15.516Z",
    "cancelled_at": null
  }
]
```

`can_cancel` n'est pas renvoyé : la vue admin est en lecture seule.

**Erreurs** : 401, 403

> **Bonus (après le MVP)** : filtres optionnels `experience_id`, `status`, `from`, `to`.

---

## Règles de sécurité appliquées

- Mots de passe hachés avec bcrypt, `password_hash` jamais renvoyé.
- Le rôle, l'identifiant utilisateur et le statut sont déterminés par le serveur, jamais lus dans le body.
- Le JWT ne contient que l'identifiant : le rôle est relu en base à chaque requête, donc toujours à jour.
- Requêtes SQL paramétrées.
- Règle des 48 h et propriété d'une réservation vérifiées côté back-end, par un `UPDATE` conditionnel atomique.
- Routes admin regroupées sous `/api/admin` et protégées par `requireAuth` + `requireAdmin`.
- En-têtes de sécurité via `helmet`, CORS limité à l'origine du front.
- Aucun secret dans le dépôt : `.env` est ignoré par Git, `.env.example` contient uniquement des valeurs de développement.