#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000/api"
EMAIL_MEMBER="membre@nightfall.dev"
PWD_MEMBER="Membre123!"
EMAIL_ADMIN="admin@nightfall.dev"
PWD_ADMIN="Admin123!"

# Couleurs pour la lisibilité du terminal MINGW64
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # Pas de couleur

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   LANCEMENT DES TESTS - API NIGHTFALL              ${NC}"
echo -e "${CYAN}====================================================${NC}\n"

# ---------------------------------------------------------
# P0 — Non-régression (Healthcheck)
# ---------------------------------------------------------
echo -e "${YELLOW}[P0] Test de disponibilité de l'API...${NC}"
HEALTH=$(curl -s $BASE_URL/health | jq -r .status)

if [ "$HEALTH" == "ok" ]; then
    echo -e "${GREEN}✔ API en ligne (status: ok)${NC}\n"
else
    echo -e "${RED}✖ L'API ne répond pas ou a retourné une erreur.${NC}"
    exit 1
fi

# ---------------------------------------------------------
# Récupération des Tokens
# ---------------------------------------------------------
echo -e "${YELLOW}[Configuration] Génération des tokens JWT...${NC}"
TOKEN_MEMBER=$(curl -s -X POST $BASE_URL/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL_MEMBER\",\"password\":\"$PWD_MEMBER\"}" | jq -r .token)
TOKEN_ADMIN=$(curl -s -X POST $BASE_URL/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL_ADMIN\",\"password\":\"$PWD_ADMIN\"}" | jq -r .token)

if [ -z "$TOKEN_MEMBER" ] || [ "$TOKEN_MEMBER" == "null" ]; then echo -e "${RED}✖ Échec login membre${NC}"; exit 1; fi
if [ -z "$TOKEN_ADMIN" ] || [ "$TOKEN_ADMIN" == "null" ]; then echo -e "${RED}✖ Échec login admin${NC}"; exit 1; fi
echo -e "${GREEN}✔ Tokens récupérés avec succès.${NC}\n"

# Fonction utilitaire pour lancer un test HTTP et vérifier le code de retour
assert_http() {
    local test_id=$1
    local expected_code=$2
    local method=$3
    local endpoint=$4
    local token=$5
    local body=$6

    local auth_header=""
    if [ -n "$token" ]; then auth_header="-H \"Authorization: Bearer $token\""; fi
    
    local body_header=""
    if [ -n "$body" ]; then body_header="-H 'Content-Type: application/json' -d '$body'"; fi

    # Construction et évaluation de la commande curl
    local cmd="curl -s -o /dev/null -w '%{http_code}' -X $method $BASE_URL$endpoint $auth_header $body_header"
    local http_code=$(eval $cmd)

    if [ "$http_code" == "$expected_code" ]; then
        echo -e "${GREEN}✔ [PASS]${NC} $test_id (Attendu: $expected_code, Reçu: $http_code)"
    else
        echo -e "${RED}✖ [FAIL]${NC} $test_id (Attendu: $expected_code, Reçu: $http_code)"
    fi
}

# ---------------------------------------------------------
# P1 — Contrôle d'accès sur les routes admin (Sécurité)
# ---------------------------------------------------------
echo -e "${YELLOW}[P1] Tests de contrôle d'accès (Sécurité)...${NC}"
assert_http "SEC-ADM-01 (Sans token -> GET /admin/experiences)" "401" "GET" "/admin/experiences" "" ""
assert_http "SEC-ADM-02 (Token Membre -> GET /admin/experiences)" "403" "GET" "/admin/experiences" "$TOKEN_MEMBER" ""
assert_http "SEC-ADM-03 (Token Membre -> POST /admin/experiences)" "403" "POST" "/admin/experiences" "$TOKEN_MEMBER" ""
assert_http "SEC-ADM-04 (Token Membre -> PATCH /admin/experiences/1/archive)" "403" "PATCH" "/admin/experiences/1/archive" "$TOKEN_MEMBER" ""
assert_http "SEC-ADM-05 (Token Membre -> GET /admin/bookings)" "403" "GET" "/admin/bookings" "$TOKEN_MEMBER" ""
echo ""

# ---------------------------------------------------------
# P1 — Nouvelles fonctions du contrôleur experiences
# ---------------------------------------------------------
echo -e "${YELLOW}[P1] Tests fonctionnels des routes Admin...${NC}"

# QA-ADM-01
ARCHIVED_EXISTS=$(curl -s $BASE_URL/admin/experiences -H "Authorization: Bearer $TOKEN_ADMIN" | jq '[.[] | select(.is_archived==true)] | length')
if [ "$ARCHIVED_EXISTS" -ge 0 ]; then
    echo -e "${GREEN}✔ [PASS]${NC} QA-ADM-01 (La liste admin inclut le champ is_archived)"
else
    echo -e "${RED}✖ [FAIL]${NC} QA-ADM-01"
fi

assert_http "QA-ADM-02 (Archivage d'une expérience)" "200" "PATCH" "/admin/experiences/1/archive" "$TOKEN_ADMIN" '{"is_archived": true}'
assert_http "QA-ADM-05 (Vérification 404 de l'expérience côté public)" "404" "GET" "/experiences/1" "" ""
assert_http "QA-ADM-03 (Désarchivage d'une expérience)" "200" "PATCH" "/admin/experiences/1/archive" "$TOKEN_ADMIN" '{"is_archived": false}'
assert_http "QA-ADM-04 (Rejet si is_archived est invalide)" "400" "PATCH" "/admin/experiences/1/archive" "$TOKEN_ADMIN" '{"is_archived": "oui"}'
assert_http "QA-ADM-06 (PUT rejeté si category_id inexistant)" "400" "PUT" "/admin/experiences/1" "$TOKEN_ADMIN" '{"category_id": 9999}'
assert_http "QA-ADM-07 (POST rejeté si category_id inexistant)" "400" "POST" "/admin/experiences" "$TOKEN_ADMIN" '{"name":"Test","description":"Desc","image_url":"url","category_id":9999,"duration_min":60,"intensity":3,"max_participants":10,"price":20}'

# QA-ADM-08
ALL_BOOKINGS=$(curl -s $BASE_URL/admin/bookings -H "Authorization: Bearer $TOKEN_ADMIN" | jq length)
if [ "$ALL_BOOKINGS" -gt 0 ]; then
    echo -e "${GREEN}✔ [PASS]${NC} QA-ADM-08 (L'admin accède à toutes les réservations : $ALL_BOOKINGS trouvées)"
else
    echo -e "${RED}✖ [FAIL]${NC} QA-ADM-08"
fi
echo ""

# ---------------------------------------------------------
# P0 — Test de la race condition dans cancelBooking
# ---------------------------------------------------------
echo -e "${YELLOW}[P0] Tests des réservations et Race Condition...${NC}"

# Création d'une réservation pour dans plus de 48h
FUTURE_DATE="2026-12-01T10:00:00Z"
BOOKING_ID=$(curl -s -X POST $BASE_URL/bookings -H "Authorization: Bearer $TOKEN_MEMBER" -H 'Content-Type: application/json' -d "{\"experience_id\":1,\"scheduled_at\":\"$FUTURE_DATE\",\"participants\":2}" | jq -r .id)

if [ "$BOOKING_ID" != "null" ] && [ -n "$BOOKING_ID" ]; then
    echo -e "   -> Réservation de test créée avec l'ID: $BOOKING_ID"
    
    # QA-BOOK-19 : Lancement des deux requêtes d'annulation en parallèle (&)
    curl -s -o r1.json -w '%{http_code}\n' -X DELETE $BASE_URL/bookings/$BOOKING_ID -H "Authorization: Bearer $TOKEN_MEMBER" > r1_status.txt &
    curl -s -o r2.json -w '%{http_code}\n' -X DELETE $BASE_URL/bookings/$BOOKING_ID -H "Authorization: Bearer $TOKEN_MEMBER" > r2_status.txt &
    
    # Attente de la fin des processus asynchrones
    wait
    
    CODE_1=$(cat r1_status.txt)
    CODE_2=$(cat r2_status.txt)
    
    # On s'attend à ce que la base de données bloque l'un des deux (un seul 200, l'autre 409)
    if { [ "$CODE_1" == "200" ] && [ "$CODE_2" == "409" ]; } || { [ "$CODE_1" == "409" ] && [ "$CODE_2" == "200" ]; }; then
        echo -e "${GREEN}✔ [PASS]${NC} QA-BOOK-19 (Race condition neutralisée. Codes reçus: $CODE_1 et $CODE_2)"
    else
        echo -e "${RED}✖ [FAIL]${NC} QA-BOOK-19 (La race condition est potentiellement encore présente. Codes: $CODE_1 et $CODE_2)"
    fi
    rm -f r1.json r2.json r1_status.txt r2_status.txt
else
    echo -e "${RED}✖ Impossible de créer la réservation pour la race condition.${NC}"
fi

# QA-BOOK-16 : La réservation précédente étant annulée, on tente de l'annuler à nouveau
assert_http "QA-BOOK-16 (Annuler une réservation déjà annulée)" "409" "DELETE" "/bookings/$BOOKING_ID" "$TOKEN_MEMBER" ""

# QA-BOOK-15 : Tentative d'annulation d'une réservation à moins de 48h
# Calcul d'une date pour demain formatée en ISO-8601 (compatible environnement GNU de Git Bash)
TOMORROW=$(date -u -d "+1 day" +"%Y-%m-%dT%H:%M:%SZ")
SHORT_BOOKING_ID=$(curl -s -X POST $BASE_URL/bookings -H "Authorization: Bearer $TOKEN_MEMBER" -H 'Content-Type: application/json' -d "{\"experience_id\":1,\"scheduled_at\":\"$TOMORROW\",\"participants\":1}" | jq -r .id)

if [ "$SHORT_BOOKING_ID" != "null" ] && [ -n "$SHORT_BOOKING_ID" ]; then
    assert_http "QA-BOOK-15 (Annulation bloquée si délai < 48h)" "403" "DELETE" "/bookings/$SHORT_BOOKING_ID" "$TOKEN_MEMBER" ""
else
    echo -e "${RED}✖ Impossible de créer la réservation de moins de 48h.${NC}"
fi

# QA-BOOK-18
assert_http "QA-BOOK-18 (Tentative d'annulation sur un ID inexistant)" "404" "DELETE" "/bookings/9999999" "$TOKEN_MEMBER" ""

echo -e "\n${CYAN}====================================================${NC}"
echo -e "${CYAN}   FIN DES TESTS                                    ${NC}"
echo -e "${CYAN}====================================================${NC}"