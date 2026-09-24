#!/usr/bin/env bash
# Tests de l'API NIGHTFALL — à lancer depuis la racine du projet, stack démarrée :
#   bash scripts/test-api.sh
# Conçu pour une base fraîche (docker compose down -v && docker compose up --build),
# mais relançable : les données créées sont archivées ou annulées en fin de section.

API="${API:-http://localhost:3000/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@nightfall.dev}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"
PASS=0; FAIL=0
EMAIL="test_$(date +%s)@example.com"   # email unique : le script peut être relancé

# check <nom> <code attendu> <curl args...>
check() {
  local name="$1" expected="$2"; shift 2
  local code
  code=$(curl -s -o /tmp/nf_body -w '%{http_code}' "$@")
  if [ "$code" = "$expected" ]; then
    echo "✅ $name ($code)"; PASS=$((PASS+1))
  else
    echo "❌ $name : attendu $expected, reçu $code"
    echo "   → $(head -c 200 /tmp/nf_body)"; FAIL=$((FAIL+1))
  fi
}

# count_ids : nombre d'objets renvoyés (compte les "id": en tête d'objet)
count_ids() { grep -o '{"id":' /tmp/nf_body | wc -l | tr -d ' '; }
# first_id : premier "id" du dernier corps de réponse
first_id() { grep -o '"id":[0-9]*' /tmp/nf_body | head -1 | cut -d: -f2; }
# token : extrait le JWT du dernier corps de réponse
token() { grep -o '"token":"[^"]*"' /tmp/nf_body | cut -d'"' -f4; }

# Date dans 30 jours à 20:00 UTC (GNU date sous Linux, BSD date sous macOS)
FUTURE=$(date -u -d '+30 days' +%Y-%m-%dT20:00:00Z 2>/dev/null || date -u -v+30d +%Y-%m-%dT20:00:00Z)


echo "=== Santé ==="
check "GET /health" 200 "$API/health"
check "Route inconnue" 404 "$API/nexiste-pas"

echo; echo "=== Catégories ==="
check "GET /categories" 200 "$API/categories"
echo "   → $(count_ids) catégories (attendu : 5)"

echo; echo "=== Expériences ==="
check "GET /experiences" 200 "$API/experiences"
echo "   → $(count_ids) expériences (attendu : 7, l'archivée est exclue)"
check "Recherche ?search=bunker" 200 "$API/experiences?search=bunker"
echo "   → $(count_ids) résultat(s) (attendu : 1)"
check "Recherche insensible à la casse ?search=BUNKER" 200 "$API/experiences?search=BUNKER"
echo "   → $(count_ids) résultat(s) (attendu : 1)"
check "Filtre ?category=1 (Survie)" 200 "$API/experiences?category=1"
echo "   → $(count_ids) résultat(s) (attendu : 2)"
check "Filtre invalide ?category=abc" 400 "$API/experiences?category=abc"
check "Filtre ?max_price=30" 200 "$API/experiences?max_price=30"
check "Filtre invalide ?min_price=-5" 400 "$API/experiences?min_price=-5"
check "Filtre incohérent min_price > max_price" 400 "$API/experiences?min_price=40&max_price=20"
check "Filtre invalide ?intensity=9" 400 "$API/experiences?intensity=9"
check "Fiche /experiences/1" 200 "$API/experiences/1"
grep -q '"duration_min"' /tmp/nf_body && grep -q '"category_name"' /tmp/nf_body \
  && echo "   → champs duration_min et category_name présents" \
  || echo "   ⚠️ duration_min ou category_name absent"
check "Fiche archivée /experiences/8" 404 "$API/experiences/8"
check "Fiche inexistante /experiences/999" 404 "$API/experiences/999"
check "Id invalide /experiences/abc" 400 "$API/experiences/abc"

echo; echo "=== Authentification ==="
check "Inscription" 201 -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d "{\"first_name\":\"Alice\",\"last_name\":\"Dupont\",\"email\":\"$EMAIL\",\"password\":\"motdepasse123\"}"
grep -q '"role":"member"' /tmp/nf_body && echo "   → rôle member" || echo "   ⚠️ rôle attendu : member"
grep -q 'password' /tmp/nf_body && echo "   ⚠️ un champ password est renvoyé !" || echo "   → aucun mot de passe renvoyé"
TOKEN_NEW=$(token)

check "Inscription email déjà utilisé" 409 -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d "{\"first_name\":\"Alice\",\"last_name\":\"Dupont\",\"email\":\"$EMAIL\",\"password\":\"motdepasse123\"}"

UPPER=$(echo "$EMAIL" | tr '[:lower:]' '[:upper:]')
check "Inscription même email en MAJUSCULES" 409 -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d "{\"first_name\":\"Alice\",\"last_name\":\"Dupont\",\"email\":\"$UPPER\",\"password\":\"motdepasse123\"}"

check "Inscription champ manquant (last_name)" 400 -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d '{"first_name":"Bob","email":"bob_missing@example.com","password":"motdepasse123"}'

check "Inscription tentative de rôle admin → reste member" 201 -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d "{\"first_name\":\"Eve\",\"last_name\":\"Hack\",\"email\":\"eve_$EMAIL\",\"password\":\"motdepasse123\",\"role\":\"admin\"}"
grep -q '"role":"member"' /tmp/nf_body && echo "   → rôle forcé à member ✅" || echo "   ⚠️ FAILLE : le rôle admin a été accepté !"

check "Connexion compte de démo" 200 -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"membre@nightfall.dev","password":"Membre123!"}'
TOKEN=$(token)

check "Connexion mauvais mot de passe" 401 -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"membre@nightfall.dev","password":"mauvais"}'
check "Connexion email inconnu" 401 -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"inconnu@nightfall.dev","password":"Membre123!"}'

check "Profil /me avec token" 200 "$API/auth/me" -H "Authorization: Bearer $TOKEN"
check "Profil /me sans token" 401 "$API/auth/me"
check "Profil /me token invalide" 401 "$API/auth/me" -H "Authorization: Bearer xxx"

echo; echo "=== Compte (utilisateur créé par le test) ==="
NEW_AUTH=(-H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN_NEW")
check "Modifier prénom/nom" 200 -X PUT "$API/auth/me" "${NEW_AUTH[@]}" \
  -d '{"first_name":"Alicia","last_name":"Durand"}'
grep -q '"first_name":"Alicia"' /tmp/nf_body && echo "   → prénom mis à jour" || echo "   ⚠️ prénom non mis à jour"
check "Modifier prénom vide" 400 -X PUT "$API/auth/me" "${NEW_AUTH[@]}" \
  -d '{"first_name":"","last_name":"Durand"}'
check "Mot de passe actuel incorrect" 401 -X PUT "$API/auth/password" "${NEW_AUTH[@]}" \
  -d '{"current_password":"mauvais","new_password":"nouveaumdp456","new_password_confirmation":"nouveaumdp456"}'
check "Confirmation de mot de passe différente" 400 -X PUT "$API/auth/password" "${NEW_AUTH[@]}" \
  -d '{"current_password":"motdepasse123","new_password":"nouveaumdp456","new_password_confirmation":"autre"}'
check "Confirmation d'email différente" 400 -X PUT "$API/auth/email" "${NEW_AUTH[@]}" \
  -d "{\"new_email\":\"autre_$EMAIL\",\"new_email_confirmation\":\"x_$EMAIL\"}"

# Cas nominaux : nouvel email puis nouveau mot de passe, vérifiés par une reconnexion
NEW_EMAIL="new_$EMAIL"
check "Modifier l'email" 200 -X PUT "$API/auth/email" "${NEW_AUTH[@]}" \
  -d "{\"new_email\":\"$NEW_EMAIL\",\"new_email_confirmation\":\"$NEW_EMAIL\"}"
grep -q "\"email\":\"$NEW_EMAIL\"" /tmp/nf_body && echo "   → email mis à jour" || echo "   ⚠️ email non mis à jour"
check "Modifier le mot de passe" 200 -X PUT "$API/auth/password" "${NEW_AUTH[@]}" \
  -d '{"current_password":"motdepasse123","new_password":"nouveaumdp456","new_password_confirmation":"nouveaumdp456"}'
check "Connexion avec le nouvel email et le nouveau mot de passe" 200 -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$NEW_EMAIL\",\"password\":\"nouveaumdp456\"}"
check "Connexion avec l'ancien email refusée" 401 -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"nouveaumdp456\"}"

check "Suppression du compte" 200 -X DELETE "$API/auth/me" "${NEW_AUTH[@]}"
check "Token d'un compte supprimé" 401 "$API/auth/me" -H "Authorization: Bearer $TOKEN_NEW"
check "Connexion d'un compte supprimé" 401 -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$NEW_EMAIL\",\"password\":\"nouveaumdp456\"}"

echo; echo "=== Réservations (membre@nightfall.dev) ==="
AUTH=(-H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN")

check "Réservation nominale" 201 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"experience_id\":1,\"scheduled_at\":\"$FUTURE\",\"participants\":4}"
grep -q '"status":"confirmed"' /tmp/nf_body && echo "   → statut confirmed" || echo "   ⚠️ statut attendu : confirmed"
NEW_BOOKING=$(first_id)

check "Date passée" 400 -X POST "$API/bookings" "${AUTH[@]}" \
  -d '{"experience_id":1,"scheduled_at":"2020-01-01T20:00:00Z","participants":4}'
check "Date invalide" 400 -X POST "$API/bookings" "${AUTH[@]}" \
  -d '{"experience_id":1,"scheduled_at":"pas-une-date","participants":4}'
check "Capacité dépassée (Bunker 7 : max 6)" 400 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"experience_id\":1,\"scheduled_at\":\"$FUTURE\",\"participants\":99}"
check "Participants à 0" 400 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"experience_id\":1,\"scheduled_at\":\"$FUTURE\",\"participants\":0}"
check "Participants décimal" 400 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"experience_id\":1,\"scheduled_at\":\"$FUTURE\",\"participants\":2.5}"
check "experience_id manquant" 400 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"scheduled_at\":\"$FUTURE\",\"participants\":2}"
check "Expérience archivée (Kepler)" 404 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"experience_id\":8,\"scheduled_at\":\"$FUTURE\",\"participants\":2}"
check "Expérience inexistante" 404 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"experience_id\":999,\"scheduled_at\":\"$FUTURE\",\"participants\":2}"
check "user_id du body ignoré (Zone Morte)" 201 -X POST "$API/bookings" "${AUTH[@]}" \
  -d "{\"experience_id\":2,\"scheduled_at\":\"$FUTURE\",\"participants\":1,\"user_id\":3}"
ZONE_BOOKING=$(first_id)
check "Réservation sans token" 401 -X POST "$API/bookings" -H "Content-Type: application/json" \
  -d "{\"experience_id\":1,\"scheduled_at\":\"$FUTURE\",\"participants\":1}"
check "Liste sans token" 401 "$API/bookings"

check "Mes réservations" 200 "$API/bookings" -H "Authorization: Bearer $TOKEN"
grep -q '"can_cancel"' /tmp/nf_body && echo "   → can_cancel présent" || echo "   ⚠️ can_cancel absent"
grep -q 'Ground Zero' /tmp/nf_body \
  && echo "   ⚠️ FAILLE : la réservation du membre 2 est visible !" \
  || echo "   → la réservation du membre 2 n'est pas visible ✅"
grep -q 'La Ruche[^}]*"can_cancel":false' /tmp/nf_body \
  && echo "   → La Ruche (dans 24 h) : can_cancel false ✅" \
  || echo "   ⚠️ La Ruche devrait avoir can_cancel false"
grep -q 'Le Bunker 7[^}]*"can_cancel":true' /tmp/nf_body \
  && echo "   → Bunker 7 (dans 10 jours) : can_cancel true ✅" \
  || echo "   ⚠️ Bunker 7 devrait avoir can_cancel true"
# Id de la réservation du seed à moins de 48 h (La Ruche)
RUCHE_BOOKING=$(grep -o '"id":[0-9]*,"experience_id":[0-9]*,"experience_name":"La Ruche' /tmp/nf_body \
  | head -1 | cut -d, -f1 | cut -d: -f2)

check "Détail de sa réservation" 200 "$API/bookings/$NEW_BOOKING" -H "Authorization: Bearer $TOKEN"
check "Détail réservation inexistante" 404 "$API/bookings/99999" -H "Authorization: Bearer $TOKEN"
check "Détail id invalide" 400 "$API/bookings/abc" -H "Authorization: Bearer $TOKEN"

echo; echo "=== Isolation (membre2@nightfall.dev) ==="
curl -s -o /tmp/nf_body -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"membre2@nightfall.dev","password":"Membre123!"}'
TOKEN2=$(token)
check "Réservations du membre 2" 200 "$API/bookings" -H "Authorization: Bearer $TOKEN2"
grep -q 'Ground Zero' /tmp/nf_body && echo "   → sa réservation Ground Zero est visible" || echo "   ⚠️ Ground Zero devrait être visible"
grep -q 'Zone Morte' /tmp/nf_body \
  && echo "   ⚠️ FAILLE : le user_id du body a été pris en compte !" \
  || echo "   → la réservation créée avec user_id=3 n'est pas chez lui ✅"
grep -q 'Le Bunker 7' /tmp/nf_body \
  && echo "   ⚠️ FAILLE : il voit les réservations d'Alex !" \
  || echo "   → il ne voit pas les réservations d'Alex ✅"
check "Détail de la réservation d'un autre membre" 403 "$API/bookings/$NEW_BOOKING" -H "Authorization: Bearer $TOKEN2"
check "Annulation de la réservation d'un autre membre" 403 -X DELETE "$API/bookings/$NEW_BOOKING" -H "Authorization: Bearer $TOKEN2"

echo; echo "=== Annulation (règle des 48 h) ==="
check "Annulation à plus de 48 h" 200 -X DELETE "$API/bookings/$NEW_BOOKING" -H "Authorization: Bearer $TOKEN"
grep -q '"status":"cancelled"' /tmp/nf_body && echo "   → statut cancelled" || echo "   ⚠️ statut attendu : cancelled"
check "Annulation déjà annulée" 409 -X DELETE "$API/bookings/$NEW_BOOKING" -H "Authorization: Bearer $TOKEN"
if [ -n "$RUCHE_BOOKING" ]; then
  check "Annulation à moins de 48 h (La Ruche)" 403 -X DELETE "$API/bookings/$RUCHE_BOOKING" -H "Authorization: Bearer $TOKEN"
else
  echo "⚠️ Réservation La Ruche introuvable : test des 48 h ignoré"
fi
check "Annulation sans token" 401 -X DELETE "$API/bookings/$ZONE_BOOKING"
# Nettoyage : la réservation Zone Morte n'est pas utile aux relances
curl -s -o /dev/null -X DELETE "$API/bookings/$ZONE_BOOKING" -H "Authorization: Bearer $TOKEN"

echo; echo "=== Administration ==="
check "Admin sans token" 401 "$API/admin/experiences"
check "Admin avec un token membre" 403 "$API/admin/experiences" -H "Authorization: Bearer $TOKEN"
check "Réservations admin avec un token membre" 403 "$API/admin/bookings" -H "Authorization: Bearer $TOKEN"

check "Connexion admin" 200 -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"
ADMIN_TOKEN=$(token)
ADMIN=(-H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN")

check "Liste admin des expériences" 200 "$API/admin/experiences" "${ADMIN[@]}"
echo "   → $(count_ids) expériences (attendu : 8 sur une base fraîche, archivées incluses)"
grep -q '"is_archived":true' /tmp/nf_body && echo "   → l'archivée est incluse ✅" || echo "   ⚠️ aucune expérience archivée renvoyée"

check "Création d'expérience" 201 -X POST "$API/admin/experiences" "${ADMIN[@]}" \
  -d '{"name":"Test API","description":"Créée par test-api.sh","image_url":"/images/experiences/test.jpeg","category_id":1,"duration_min":30,"intensity":2,"max_participants":4,"price":19.9}'
NEW_EXP=$(first_id)
check "Création champ manquant (name)" 400 -X POST "$API/admin/experiences" "${ADMIN[@]}" \
  -d '{"description":"x","image_url":"/images/experiences/x.jpeg","category_id":1,"duration_min":30,"intensity":2,"max_participants":4,"price":10}'
check "Création catégorie inexistante" 400 -X POST "$API/admin/experiences" "${ADMIN[@]}" \
  -d '{"name":"x","description":"x","image_url":"/images/experiences/x.jpeg","category_id":999,"duration_min":30,"intensity":2,"max_participants":4,"price":10}'
check "Création intensité hors bornes" 400 -X POST "$API/admin/experiences" "${ADMIN[@]}" \
  -d '{"name":"x","description":"x","image_url":"/images/experiences/x.jpeg","category_id":1,"duration_min":30,"intensity":6,"max_participants":4,"price":10}'
check "Création avec un token membre" 403 -X POST "$API/admin/experiences" "${AUTH[@]}" \
  -d '{"name":"x","description":"x","image_url":"/images/experiences/x.jpeg","category_id":1,"duration_min":30,"intensity":2,"max_participants":4,"price":10}'

check "Modification partielle (prix)" 200 -X PUT "$API/admin/experiences/$NEW_EXP" "${ADMIN[@]}" -d '{"price":24.5}'
grep -q '"price":"24.50"' /tmp/nf_body && echo "   → prix mis à jour" || echo "   ⚠️ prix non mis à jour"
check "Modification body vide" 400 -X PUT "$API/admin/experiences/$NEW_EXP" "${ADMIN[@]}" -d '{}'
check "Modification expérience inexistante" 404 -X PUT "$API/admin/experiences/99999" "${ADMIN[@]}" -d '{"price":10}'

check "Archivage" 200 -X PATCH "$API/admin/experiences/$NEW_EXP/archive" "${ADMIN[@]}" -d '{"is_archived":true}'
check "Archivée absente du catalogue public" 404 "$API/experiences/$NEW_EXP"
check "Restauration" 200 -X PATCH "$API/admin/experiences/$NEW_EXP/archive" "${ADMIN[@]}" -d '{"is_archived":false}'
check "Restaurée visible au catalogue public" 200 "$API/experiences/$NEW_EXP"
check "Archivage valeur non booléenne" 400 -X PATCH "$API/admin/experiences/$NEW_EXP/archive" "${ADMIN[@]}" -d '{"is_archived":"oui"}'
# Nettoyage : on archive l'expérience de test pour que le catalogue reste à 7
curl -s -o /dev/null -X PATCH "$API/admin/experiences/$NEW_EXP/archive" "${ADMIN[@]}" -d '{"is_archived":true}'

check "Liste admin des réservations" 200 "$API/admin/bookings" "${ADMIN[@]}"
grep -q '"first_name":"Alex"' /tmp/nf_body && grep -q 'Ground Zero' /tmp/nf_body \
  && echo "   → réservations de tous les membres présentes ✅" \
  || echo "   ⚠️ réservations d'un des membres absentes"
grep -q '"cancelled_at"' /tmp/nf_body && echo "   → cancelled_at présent" || echo "   ⚠️ cancelled_at absent"

echo; echo "=== Bilan : $PASS réussis, $FAIL échoués ==="
[ "$FAIL" -eq 0 ]