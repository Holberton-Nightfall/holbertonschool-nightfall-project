# NIGHTFALL - Recette du jour 4

Recette réalisée depuis un clone propre de `main`, sans `.env` :

```bash
git clone https://github.com/Holberton-Nightfall/holbertonschool-nightfall-project.git nightfall-recette
cd nightfall-recette
docker compose up --build -d
bash scripts/test-api.sh
```

- Date : 24 septembre 2026
- Commit testé : `cee3401` (après le merge de #41, retest des anomalies 1 et 2)
- Navigateur : Chrome

## Résultat technique

- [x] Démarrage sans `.env` : 3 services lancés, base `healthy`
- [x] `scripts/test-api.sh` : 76/76 sur base fraîche

## Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| Membre | `membre@nightfall.dev` | `Membre123!` |
| Membre 2 | `membre2@nightfall.dev` | `Membre123!` |
| Admin | `admin@nightfall.dev` | `Admin123!` |

> Le script de tests a déjà tourné : une expérience « Test API » archivée et des réservations annulées d'Alex sont présentes. C'est attendu.

---

## 1. Visiteur (non connecté)

- [x] L'accueil s'affiche, sans erreur dans la console du navigateur
- [x] Catalogue : 7 expériences, chacune avec son image (Station Kepler absente, car archivée)
- [x] Recherche par nom (« bunker ») : 1 résultat
- [x] Recherche sur la description (« souterrain ») : le Bunker 7 ressort
- [x] Filtre par catégorie : les résultats correspondent
- [x] Aucun résultat : un message clair s'affiche
- [x] Fiche détaillée : nom, description, image, durée, intensité, participants max, prix
- [x] Bouton « Réserver » : redirige vers la connexion
- [x] `/admin` saisi directement dans l'URL : accès refusé ou redirection
- [x] Page « À propos » et conditions d'utilisation accessibles
- [x] URL inexistante (`/nimportequoi`) : page 404

## 2. Inscription et connexion

- [x] Inscription d'un nouveau compte : connecté automatiquement
- [x] Inscription avec un email déjà utilisé : message d'erreur
- [x] Mot de passe trop court : message d'erreur
- [x] Déconnexion : retour à l'état visiteur
- [x] Connexion avec `membre@nightfall.dev`
- [x] Mauvais mot de passe : message générique « Identifiants invalides »
- [x] Rechargement de la page (F5) : on reste connecté

## 3. Réservation (membre)

- [x] Depuis une fiche, ouverture du formulaire de réservation
- [x] Créneaux proposés uniquement la nuit (à partir de 22 h)
- [x] Nombre de participants limité au maximum de l'expérience
- [x] Validation : page de confirmation avec le récapitulatif
- [x] Le prix total affiché est cohérent (prix × participants, si affiché)

## 4. Espace membre

- [x] La nouvelle réservation apparaît dans la liste
- [x] Bunker 7 (dans 10 jours) : bouton d'annulation actif
- [x] La Ruche (dans 24 h) : bouton d'annulation désactivé, avec une explication
- [x] Annulation d'une réservation à plus de 48 h : son statut passe à « annulée »
- [x] Modification du prénom et du nom
- [x] Modification de l'email, puis reconnexion avec le nouvel email (après correction #41)
- [x] Modification du mot de passe, puis reconnexion avec le nouveau (après correction #41)
- [x] Connexion avec `membre2@nightfall.dev` : seules ses réservations sont visibles (Ground Zero)

## 5. Administration

- [x] Un membre ne voit pas le lien « Admin » dans le menu
- [x] Connexion avec `admin@nightfall.dev` : le lien « Admin » apparaît
- [x] Onglet Expériences : toutes les expériences, archivées incluses, avec leur statut
- [x] Création d'une expérience : elle apparaît dans le tableau avec sa catégorie
- [x] La nouvelle expérience est visible au catalogue public
- [x] Création avec un champ vide : message d'erreur, aucun envoi
- [x] Modification d'une expérience active : le tableau et le catalogue sont à jour
- [x] Modification de Station Kepler (archivée) : le formulaire est pré-rempli, l'enregistrement fonctionne
- [x] Archivage : l'expérience disparaît du catalogue public
- [x] Restauration : elle réapparaît au catalogue
- [x] Onglet Réservations : les réservations de tous les membres, dont celle faite en section 3
- [x] Les réservations annulées sont identifiables

## 6. Transverse

- [x] Affichage mobile (mode responsive, 375 px) : menu, catalogue, fiche, formulaire de réservation, admin
- [x] Aucune page ne déborde horizontalement
- [x] Console du navigateur : aucune erreur rouge sur le parcours complet
- [x] Déconnexion depuis une page protégée : redirection correcte

---

## Anomalies

| # | Page | Étapes pour reproduire | Attendu | Obtenu | Responsable | Correction |
|---|---|---|---|---|---|---|
| 1 | Mon compte | Modifier l'email | Email modifié | 400 « new_email invalide » : le front envoyait `email` au lieu de `new_email` et `new_email_confirmation`. **Corrigé et retesté.** | Tom | `fix/account-email-payload` (#41) |
| 2 | Mon compte | Modifier le mot de passe | Mot de passe modifié | 400 « new_password_confirmation ne correspond pas » : le champ n'était pas envoyé. **Corrigé et retesté.** | Tom | `fix/account-email-payload` (#41) |

Ces deux routes n'étaient testées par `scripts/test-api.sh` que sur leurs cas d'erreur. Le cas nominal a été ajouté au script.

## Limites connues (non traitées dans le MVP)

- Le dernier créneau de la nuit peut se terminer après 6 h.
- Les créneaux ne sont contrôlés que côté front : l'API accepte toute date future.
- Les créneaux sont générés dans le fuseau horaire du navigateur.
- La capacité cumulée par créneau n'est pas gérée.
- L'admin ne peut pas annuler une réservation (pas de système de notification).
- Les filtres par prix et par intensité sont gérés par l'API, mais pas encore proposés dans l'interface.